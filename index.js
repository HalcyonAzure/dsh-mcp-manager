// dsh-mcp-manager — Host half.
// Owns a list of MCP servers in its own row config and mounts one
// @deepseek-ai/dsh-mcp-client child per enabled server.
import { spawn } from "node:child_process";

const ROUTE_SERVERS = "/api/mcp-manager.servers";
const ROUTE_TEST = "/api/mcp-manager.test";
const MCP_CLIENT = "@deepseek-ai/dsh-mcp-client";
const NAME = /^[A-Za-z0-9_-]{1,32}$/;
const KEY_NAME = /^[A-Za-z_][A-Za-z0-9_.:-]{0,127}$/;
const HEADER_NAME = /^[A-Za-z0-9!#$%&'*+.^_\x60|~-]{1,128}$/;
const TEST_TIMEOUT_MS = 10_000;
const PROTOCOL = "2025-06-18";

const inject = ["connection"];

/** Raw JSON Schema for the `mcp_servers` agent tool arguments. */
const TOOL_PARAMETERS = {
  type: "object",
  properties: {
    action: { type: "string", enum: ["list", "test"], description: "\"list\": all servers with status; \"test\": probe one server by name" },
    name: { type: "string", description: "Server name, required for test" },
  },
  required: ["action"],
  additionalProperties: false,
};

// ── config normalization & validation ───────────────────────────────────

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringDict(value) {
  const out = {};
  if (!isObject(value)) return out;
  for (const [key, item] of Object.entries(value)) {
    if (typeof key === "string" && key !== "" && typeof item === "string") out[key] = item;
  }
  return out;
}

function clampTimeout(value) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return 60_000;
  return Math.min(600_000, Math.max(1_000, Math.round(number)));
}

/** Lenient read of one stored server (never throws; used for what is already saved). */
function normalizeServer(raw) {
  const s = isObject(raw) ? raw : {};
  const transport = s.transport === "streamable-http" ? "streamable-http" : "stdio";
  return {
    name: typeof s.name === "string" ? s.name.trim() : "",
    enabled: s.enabled !== false,
    transport,
    command: typeof s.command === "string" ? s.command : "",
    args: Array.isArray(s.args) ? s.args.filter((a) => typeof a === "string") : [],
    env: stringDict(s.env),
    secretEnv: stringDict(s.secretEnv),
    cwd: typeof s.cwd === "string" ? s.cwd : "",
    url: typeof s.url === "string" ? s.url : "",
    headers: stringDict(s.headers),
    secretHeaders: stringDict(s.secretHeaders),
    toolCallTimeoutMs: clampTimeout(s.toolCallTimeoutMs ?? 60_000),
  };
}

function serversOf(rawConfig) {
  const list = isObject(rawConfig) && Array.isArray(rawConfig.servers) ? rawConfig.servers : [];
  return list.map(normalizeServer);
}

/** Strict validation of a submitted server. Returns { server } or { error, field }. */
function validateServer(raw) {
  if (!isObject(raw)) return { error: "bad-request" };
  const server = normalizeServer(raw);
  if (!NAME.test(server.name)) return { error: "invalid", field: "name" };
  if (raw.transport !== "stdio" && raw.transport !== "streamable-http") return { error: "invalid", field: "transport" };
  for (const key of Object.keys(server.env)) if (!KEY_NAME.test(key)) return { error: "invalid", field: "env" };
  for (const [key, ref] of Object.entries(server.secretEnv)) if (!KEY_NAME.test(key) || !KEY_NAME.test(ref)) return { error: "invalid", field: "secretEnv" };
  for (const key of Object.keys(server.headers)) if (!HEADER_NAME.test(key)) return { error: "invalid", field: "headers" };
  for (const [key, ref] of Object.entries(server.secretHeaders)) if (!HEADER_NAME.test(key) || !KEY_NAME.test(ref)) return { error: "invalid", field: "secretHeaders" };
  if (server.transport === "stdio") {
    if (server.command.trim() === "") return { error: "invalid", field: "command" };
    server.command = server.command.trim();
  } else {
    try {
      const url = new URL(server.url.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") return { error: "invalid", field: "url" };
      server.url = url.href;
    } catch {
      return { error: "invalid", field: "url" };
    }
  }
  return { server };
}

/** Persisted form: only the fields that belong to the transport. */
function storedForm(server) {
  const base = { name: server.name, enabled: server.enabled, transport: server.transport };
  const timeout = server.toolCallTimeoutMs !== 60_000 ? { toolCallTimeoutMs: server.toolCallTimeoutMs } : {};
  if (server.transport === "stdio") {
    return {
      ...base,
      command: server.command,
      args: server.args,
      ...(Object.keys(server.env).length ? { env: server.env } : {}),
      ...(Object.keys(server.secretEnv).length ? { secretEnv: server.secretEnv } : {}),
      ...(server.cwd ? { cwd: server.cwd } : {}),
      ...timeout,
    };
  }
  return {
    ...base,
    url: server.url,
    ...(Object.keys(server.headers).length ? { headers: server.headers } : {}),
    ...(Object.keys(server.secretHeaders).length ? { secretHeaders: server.secretHeaders } : {}),
    ...timeout,
  };
}

function failure(code, detail) {
  return { ok: false, code, ...(detail ? { detail: String(detail).slice(0, 500) } : {}) };
}

function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// ── secrets ───────────────────────────────────────────────────────────

async function resolveSecret(credentials, ref) {
  if (!credentials) return null;
  try {
    const hit = await credentials.resolve(ref);
    return hit && typeof hit.value === "string" && hit.value !== "" ? hit.value : null;
  } catch {
    return null;
  }
}

async function describeSecret(credentials, ref) {
  if (!credentials) return false;
  try {
    const described = await credentials.describe(ref);
    return described?.configured === true;
  } catch {
    return false;
  }
}

/** Merge secret refs into plain env/headers. Missing secrets are reported, not invented. */
async function withSecrets(credentials, server) {
  const env = { ...server.env };
  const headers = { ...server.headers };
  const missing = [];
  const pairs = server.transport === "stdio" ? [[server.secretEnv, env]] : [[server.secretHeaders, headers]];
  for (const [refs, target] of pairs) {
    for (const [key, ref] of Object.entries(refs)) {
      const value = await resolveSecret(credentials, ref);
      if (value === null) missing.push(ref);
      else target[key] = value;
    }
  }
  return { env, headers, missing };
}

function clientConfigOf(server, env, headers) {
  const common = { serverName: server.name, toolCallTimeoutMs: server.toolCallTimeoutMs, failOnStartupError: false };
  if (server.transport === "stdio") {
    return { ...common, transport: "stdio", command: server.command, args: server.args, env, cwd: server.cwd };
  }
  return { ...common, transport: "streamable-http", url: server.url, headers };
}

// ── connection probe (test button / agent tool) ───────────────────────

/** Same rule as the mcp-client stdio transport: drop ambient secrets and DSH_* names. */
function scrubbedEnv() {
  const out = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value !== "string" || /KEY|PASSWORD|SECRET|TOKEN/i.test(key) || key.startsWith("DSH_")) continue;
    out[key] = value;
  }
  return out;
}

function probeStdio(command, args, env, cwd) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(command, args, { cwd: cwd || undefined, env: { ...scrubbedEnv(), ...env }, stdio: ["pipe", "pipe", "pipe"] });
    } catch (error) {
      resolve(failure("spawn-failed", errorText(error)));
      return;
    }
    let buffer = "";
    let stderr = "";
    let serverInfo = null;
    let done = false;
    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { child.kill(); } catch {}
      resolve(result);
    };
    const timer = setTimeout(() => finish(failure("timeout", stderr.trim() || "no response within " + TEST_TIMEOUT_MS / 1000 + "s")), TEST_TIMEOUT_MS);
    const send = (message) => {
      try { child.stdin.write(JSON.stringify(message) + "\n"); } catch {}
    };
    child.on("error", (error) => finish(failure("spawn-failed", errorText(error))));
    child.on("exit", (code) => finish(failure("exited", (stderr.trim() || "exit code " + code))));
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-2000); });
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      let index;
      while ((index = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, index).trim();
        buffer = buffer.slice(index + 1);
        if (line === "") continue;
        let message;
        try { message = JSON.parse(line); } catch { continue; }
        if (message.id === 1) {
          if (message.error) return finish(failure("initialize-failed", message.error.message));
          serverInfo = message.result?.serverInfo ?? null;
          send({ jsonrpc: "2.0", method: "notifications/initialized" });
          send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
        } else if (message.id === 2) {
          if (message.error) return finish(failure("tools-failed", message.error.message));
          const list = Array.isArray(message.result?.tools) ? message.result.tools : [];
          finish({ ok: true, serverInfo, tools: list.map((t) => t?.name).filter((n) => typeof n === "string") });
        }
      }
    });
    send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: PROTOCOL, capabilities: {}, clientInfo: { name: "dsh-mcp-manager", version: "1.0.0" } } });
  });
}

async function readRpc(response, id) {
  const type = response.headers.get("content-type") || "";
  const text = await response.text();
  if (type.includes("text/event-stream")) {
    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith("data:")) continue;
      try {
        const message = JSON.parse(line.slice(5).trim());
        if (message.id === id) return message;
      } catch {}
    }
    return null;
  }
  try { return JSON.parse(text); } catch { return null; }
}

async function probeHttp(url, headers) {
  const base = { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers };
  const post = (body, extra) => fetch(url, { method: "POST", headers: { ...base, ...extra }, body: JSON.stringify(body), signal: AbortSignal.timeout(TEST_TIMEOUT_MS) });
  try {
    const init = await post({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: PROTOCOL, capabilities: {}, clientInfo: { name: "dsh-mcp-manager", version: "1.0.0" } } });
    if (!init.ok) return failure("http", String(init.status));
    const session = init.headers.get("mcp-session-id");
    const extra = session ? { "mcp-session-id": session, "mcp-protocol-version": PROTOCOL } : { "mcp-protocol-version": PROTOCOL };
    const initMessage = await readRpc(init, 1);
    if (!initMessage || initMessage.error) return failure("initialize-failed", initMessage?.error?.message ?? "bad response");
    await post({ jsonrpc: "2.0", method: "notifications/initialized" }, extra).catch(() => {});
    const list = await post({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }, extra);
    if (!list.ok) return failure("http", String(list.status));
    const listMessage = await readRpc(list, 2);
    if (!listMessage || listMessage.error) return failure("tools-failed", listMessage?.error?.message ?? "bad response");
    const tools = Array.isArray(listMessage.result?.tools) ? listMessage.result.tools : [];
    return { ok: true, serverInfo: initMessage.result?.serverInfo ?? null, tools: tools.map((t) => t?.name).filter((n) => typeof n === "string") };
  } catch (error) {
    return failure(error?.name === "TimeoutError" ? "timeout" : "network", errorText(error));
  }
}

async function probe(credentials, server) {
  const { env, headers, missing } = await withSecrets(credentials, server);
  if (missing.length) return failure("missing-secret", missing.join(", "));
  return server.transport === "stdio" ? probeStdio(server.command, server.args, env, server.cwd) : probeHttp(server.url, headers);
}

// ── plugin ────────────────────────────────────────────────────────────

async function loadMcpClient(ctx) {
  const entry = ctx.fiber?.entry;
  const loader = ctx.get("loader");
  let namespace;
  const errors = [];
  if (entry?.parent?.tree?.import) {
    try {
      namespace = await entry.parent.tree.import(MCP_CLIENT, entry.getOuterStack);
    } catch (error) {
      errors.push(errorText(error));
    }
  }
  if (namespace === undefined) {
    try {
      namespace = await import(MCP_CLIENT);
    } catch (error) {
      errors.push(errorText(error));
    }
  }
  if (namespace === undefined) throw new Error("mcp-client unavailable: " + errors.join(" | "));
  return typeof loader?.unwrapExports === "function" ? loader.unwrapExports(namespace) : namespace;
}

function countTools(tools, name) {
  if (!tools || typeof tools.definitions !== "function") return null;
  try {
    const prefix = "mcp__" + name + "__";
    return tools.definitions().filter((d) => typeof d?.name === "string" && d.name.startsWith(prefix)).length;
  } catch {
    return null;
  }
}

async function apply(ctx, rawConfig) {
  const servers = serversOf(rawConfig);
  const connection = Reflect.get(ctx, "connection");
  const credentials = () => ctx.get("credentials");
  /** name -> { fiber?, error?, missing? } */
  const mounts = new Map();
  let disposed = false;
  ctx.effect(() => () => { disposed = true; }, "mcp-manager.lifecycle");

  let clientPlugin = null;
  let clientError = null;
  try {
    clientPlugin = await loadMcpClient(ctx);
  } catch (error) {
    clientError = errorText(error);
    ctx.logger?.warn?.("mcp-manager: " + clientError);
  }

  const seen = new Set();
  for (const server of servers) {
    if (!server.enabled || disposed) continue;
    if (!NAME.test(server.name) || seen.has(server.name)) {
      mounts.set(server.name, { error: "invalid or duplicate name" });
      continue;
    }
    seen.add(server.name);
    if (clientPlugin === null) {
      mounts.set(server.name, { error: clientError });
      continue;
    }
    const { env, headers, missing } = await withSecrets(credentials(), server);
    if (missing.length) {
      mounts.set(server.name, { error: "missing secret: " + missing.join(", ") });
      continue;
    }
    try {
      // Not awaited: each server connects independently; failures stay on its own fiber.
      const fiber = ctx.plugin(clientPlugin, clientConfigOf(server, env, headers));
      mounts.set(server.name, { fiber });
    } catch (error) {
      mounts.set(server.name, { error: errorText(error) });
    }
  }

  function statusOf(server) {
    if (!server.enabled) return { state: "disabled" };
    const mount = mounts.get(server.name);
    if (!mount) return { state: "disabled" };
    if (mount.error) return { state: "failed", error: mount.error };
    const fiber = mount.fiber;
    const tools = countTools(ctx.get("tools"), server.name);
    const fiberError = fiber?._error ?? fiber?.error;
    if (fiber?.state === 3 || fiberError) return { state: "failed", error: errorText(fiberError ?? "failed"), tools };
    if (fiber?.state === 2) {
      // mcp-client never fails activation (failOnStartupError: false); zero tools after
      // activation means the connection or discovery did not succeed.
      return tools === 0 ? { state: "degraded", tools } : { state: "connected", tools };
    }
    return { state: "connecting", tools };
  }

  async function view() {
    const creds = credentials();
    const list = [];
    for (const server of servers) {
      const refs = { ...server.secretEnv, ...server.secretHeaders };
      const secrets = {};
      for (const ref of Object.values(refs)) secrets[ref] = await describeSecret(creds, ref);
      list.push({ ...storedForm(server), args: server.args, env: server.env, secretEnv: server.secretEnv, cwd: server.cwd, url: server.url, headers: server.headers, secretHeaders: server.secretHeaders, toolCallTimeoutMs: server.toolCallTimeoutMs, secrets, status: statusOf(server) });
    }
    return {
      ok: true,
      servers: list,
      clientError,
      canSave: ctx.get("configEditor") !== undefined && ctx.fiber?.entry !== undefined,
      canStoreSecret: creds !== undefined,
    };
  }

  async function save(nextServers) {
    const editor = ctx.get("configEditor");
    const entry = ctx.fiber?.entry;
    if (editor === undefined || entry === undefined) return failure("not-editable");
    try {
      await editor.edit(entry, (current) => ({ ...(isObject(current) ? current : {}), servers: nextServers.map(storedForm) }));
    } catch (error) {
      return failure("save-rejected", errorText(error));
    }
    return { ok: true };
  }

  async function storeSecrets(secrets) {
    if (!isObject(secrets)) return null;
    const pairs = Object.entries(secrets).filter(([, value]) => typeof value === "string" && value !== "");
    if (pairs.length === 0) return null;
    const creds = credentials();
    if (!creds) return failure("no-credential-store");
    for (const [ref, value] of pairs) {
      if (!KEY_NAME.test(ref)) return failure("invalid", "secret key");
      try {
        await creds.set(ref, value);
      } catch (error) {
        return failure("secret-rejected", errorText(error));
      }
    }
    return null;
  }

  async function mutate(body) {
    const action = body.action;
    if (action === "upsert") {
      const checked = validateServer(body.server);
      if (checked.error) return { status: 400, body: failure(checked.error, checked.field) };
      const server = checked.server;
      const previous = typeof body.previousName === "string" && body.previousName !== "" ? body.previousName : null;
      const index = previous === null ? -1 : servers.findIndex((s) => s.name === previous);
      if (previous !== null && index < 0) return { status: 404, body: failure("not-found", previous) };
      if (servers.some((s, i) => s.name === server.name && i !== index)) return { status: 409, body: failure("duplicate-name", server.name) };
      const secretFailure = await storeSecrets(body.secrets);
      if (secretFailure) return { status: 409, body: secretFailure };
      const next = servers.slice();
      if (index >= 0) next[index] = server; else next.push(server);
      const result = await save(next);
      return { status: result.ok ? 200 : 409, body: result };
    }
    if (action === "remove" || action === "toggle") {
      const index = servers.findIndex((s) => s.name === body.name);
      if (index < 0) return { status: 404, body: failure("not-found", body.name) };
      const next = servers.slice();
      if (action === "remove") next.splice(index, 1);
      else next[index] = { ...next[index], enabled: body.enabled === true };
      const result = await save(next);
      return { status: result.ok ? 200 : 409, body: result };
    }
    return { status: 400, body: failure("bad-request", "action") };
  }

  const noStore = { "cache-control": "no-store" };

  connection.fetch.register({
    path: ROUTE_SERVERS,
    methods: ["GET", "POST"],
    requestBody: "buffered",
    fetch: async (request) => {
      if (request.method === "GET") return Response.json(await view(), { headers: noStore });
      const body = await readJson(request);
      if (!isObject(body)) return Response.json(failure("bad-request"), { status: 400, headers: noStore });
      const result = await mutate(body);
      return Response.json(result.body, { status: result.status, headers: noStore });
    },
  });

  connection.fetch.register({
    path: ROUTE_TEST,
    methods: ["POST"],
    requestBody: "buffered",
    fetch: async (request) => {
      const body = await readJson(request);
      if (!isObject(body)) return Response.json(failure("bad-request"), { status: 400, headers: noStore });
      let server;
      if (typeof body.name === "string" && !isObject(body.server)) {
        server = servers.find((s) => s.name === body.name);
        if (!server) return Response.json(failure("not-found", body.name), { status: 404, headers: noStore });
      } else {
        const checked = validateServer(body.server);
        if (checked.error) return Response.json(failure(checked.error, checked.field), { status: 400, headers: noStore });
        server = checked.server;
      }
      // Unsaved secrets typed into the form are used for this probe only.
      const typed = isObject(body.secrets) ? stringDict(body.secrets) : {};
      const creds = credentials();
      const overlay = Object.keys(typed).length === 0 ? creds : {
        resolve: async (ref) => (typed[ref] ? { value: typed[ref] } : creds ? creds.resolve(ref) : null),
      };
      return Response.json(await probe(overlay, server), { headers: noStore });
    },
  });

  // Read-only agent tool: listing and probing. Adding/changing servers stays user-only,
  // because a stdio server runs an arbitrary local command.
  const toolService = ctx.get("tools");
  if (toolService && typeof toolService.register === "function") {
    try {
      toolService.register({
        name: "mcp_servers",
        description: "List the MCP servers managed in Settings › MCP servers with their connection status, or probe one server's connection. Adding, editing, or removing servers is done by the user in that page.",
        // `tools.register()` takes a raw JSON Schema object (ToolSchema.parameters), not the
        // `defineTool` property-map DSL. A root without `type: "object"` is rejected by
        // OpenAI/Anthropic-style providers, which fails the whole request and with it every
        // harness tool; DeepSeek happens to tolerate it.
        parameters: TOOL_PARAMETERS,
        output: {
          schema: { type: "object" },
          render: (_args, value) => [{ type: "text", text: JSON.stringify(value, null, 2) }],
        },
        async execute(rawArgs) {
          const args = isObject(rawArgs) ? rawArgs : {};
          if (args.action !== "list" && args.action !== "test") return failure("bad-request", "action must be list or test");
          if (args.action === "test") {
            if (typeof args.name !== "string" || args.name === "") return failure("bad-request", "name is required for test");
            const server = servers.find((s) => s.name === args.name);
            if (!server) return failure("not-found", args.name);
            return probe(credentials(), server);
          }
          const current = await view();
          return {
            servers: current.servers.map((s) => ({ name: s.name, enabled: s.enabled, transport: s.transport, target: s.transport === "stdio" ? [s.command, ...s.args].join(" ") : s.url, status: s.status })),
            clientError: current.clientError,
          };
        },
      });
    } catch (error) {
      ctx.logger?.warn?.("mcp-manager: agent tool not registered: " + errorText(error));
    }
  }
}

export { apply, inject, normalizeServer, validateServer, storedForm, probe };
