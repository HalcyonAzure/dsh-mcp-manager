window.__ModuleLoader__.load({
  id: "dsh-mcp-manager",
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const React = require("react");
    const h = React.createElement;

    const PACKAGE = "dsh-mcp-manager";
    const ROW_ID = "mcp-manager";
    const PANEL_ID = "mcp-servers";
    const SERVERS_ROUTE = "api/mcp-manager.servers";
    const TEST_ROUTE = "api/mcp-manager.test";
    const NAME = /^[A-Za-z0-9_-]{1,32}$/;

    const COPY = {
      zh: {
        nav: "MCP 服务器",
        title: "MCP 服务器",
        intro: "每台服务器的工具会以 mcp__<名称>__<工具> 出现在模型的工具列表里。保存会让所有服务器重新连接，进行中的 MCP 调用会中断。",
        summary: (n, m) => n === 0 ? "尚未添加服务器" : n + " 个服务器，" + m + " 个已连接",
        loading: "正在读取…",
        loadFailed: "读取失败：",
        empty: "还没有 MCP 服务器。",
        add: "添加服务器",
        edit: "编辑",
        remove: "删除",
        confirmRemove: (n) => "确定删除 " + n + "？",
        confirm: "确定删除",
        cancel: "取消",
        save: "保存",
        saving: "正在保存…",
        test: "测试连接",
        testing: "正在测试…",
        enabled: "启用",
        readOnly: "当前 profile 不支持保存配置，只能查看。",
        clientError: "无法加载 dsh-mcp-client：",
        states: { connected: "已连接", connecting: "连接中", degraded: "未连接", failed: "失败", disabled: "已停用" },
        tools: (n) => n + " 个工具",
        fields: {
          name: "名称", nameHint: "字母、数字、- 或 _，最多 32 个字符；决定工具名前缀。",
          transport: "传输方式", stdio: "本地程序 (stdio)", http: "远程服务 (HTTP)",
          command: "命令", commandHint: "可执行文件的绝对路径或命令名",
          args: "参数", argsHint: "每行一个参数",
          env: "环境变量", secretEnv: "密钥环境变量", cwd: "工作目录",
          url: "URL", headers: "请求头", secretHeaders: "密钥请求头",
          secretHint: "值存入 DSH 凭据库，不写入配置；留空表示保留已保存的值。",
          key: "名称", value: "值", ref: "凭据键名", addRow: "添加一行", saved: "已保存", notSaved: "未设置",
          timeout: "单次调用超时（秒）",
        },
        testOk: (info, n) => "连接成功" + (info ? "：" + info : "") + "，" + n + " 个工具",
        savedOk: "已保存，服务器正在重新连接。",
        errors: {
          invalid: "字段无效：{detail}", "duplicate-name": "名称 {detail} 已存在", "not-found": "找不到服务器 {detail}",
          "not-editable": "当前 profile 不支持保存配置", "save-rejected": "保存被拒绝：{detail}",
          "no-credential-store": "没有可用的凭据库，无法保存密钥", "secret-rejected": "密钥保存失败：{detail}",
          "missing-secret": "缺少密钥：{detail}", timeout: "超时：{detail}", "spawn-failed": "无法启动：{detail}",
          exited: "进程已退出：{detail}", "initialize-failed": "握手失败：{detail}", "tools-failed": "读取工具失败：{detail}",
          http: "HTTP {detail}", network: "网络错误：{detail}", "bad-request": "请求无效", unknown: "操作失败：{detail}",
        },
      },
      en: {
        nav: "MCP servers",
        title: "MCP servers",
        intro: "Each server's tools appear to the model as mcp__<name>__<tool>. Saving reconnects every server and interrupts MCP calls in progress.",
        summary: (n, m) => n === 0 ? "No servers yet" : n + " servers, " + m + " connected",
        loading: "Loading…",
        loadFailed: "Could not load: ",
        empty: "No MCP servers yet.",
        add: "Add server",
        edit: "Edit",
        remove: "Delete",
        confirmRemove: (n) => "Delete " + n + "?",
        confirm: "Delete",
        cancel: "Cancel",
        save: "Save",
        saving: "Saving…",
        test: "Test connection",
        testing: "Testing…",
        enabled: "Enabled",
        readOnly: "This profile cannot save configuration; view only.",
        clientError: "dsh-mcp-client could not be loaded: ",
        states: { connected: "Connected", connecting: "Connecting", degraded: "Not connected", failed: "Failed", disabled: "Disabled" },
        tools: (n) => n + (n === 1 ? " tool" : " tools"),
        fields: {
          name: "Name", nameHint: "Letters, digits, - or _, up to 32 characters; becomes the tool-name prefix.",
          transport: "Transport", stdio: "Local program (stdio)", http: "Remote service (HTTP)",
          command: "Command", commandHint: "Absolute path or command name",
          args: "Arguments", argsHint: "One argument per line",
          env: "Environment variables", secretEnv: "Secret environment variables", cwd: "Working directory",
          url: "URL", headers: "Headers", secretHeaders: "Secret headers",
          secretHint: "Values go to the DSH credential store, never into configuration; leave empty to keep the saved value.",
          key: "Name", value: "Value", ref: "Credential key", addRow: "Add row", saved: "Saved", notSaved: "Not set",
          timeout: "Per-call timeout (seconds)",
        },
        testOk: (info, n) => "Connected" + (info ? ": " + info : "") + ", " + n + (n === 1 ? " tool" : " tools"),
        savedOk: "Saved; servers are reconnecting.",
        errors: {
          invalid: "Invalid field: {detail}", "duplicate-name": "Name {detail} already exists", "not-found": "Server {detail} not found",
          "not-editable": "This profile cannot save configuration", "save-rejected": "Save rejected: {detail}",
          "no-credential-store": "No credential store is available for secrets", "secret-rejected": "Secret not saved: {detail}",
          "missing-secret": "Missing secret: {detail}", timeout: "Timed out: {detail}", "spawn-failed": "Could not start: {detail}",
          exited: "Process exited: {detail}", "initialize-failed": "Handshake failed: {detail}", "tools-failed": "Tool listing failed: {detail}",
          http: "HTTP {detail}", network: "Network error: {detail}", "bad-request": "Bad request", unknown: "Failed: {detail}",
        },
      },
    };

    function localeName() {
      const value = (typeof document !== "undefined" && document.documentElement.lang) || "zh";
      return String(value).toLowerCase().startsWith("zh") ? "zh" : "en";
    }
    function copyOf() { return COPY[localeName()] || COPY.zh; }
    function useCopy() {
      const [name, setName] = React.useState(localeName);
      React.useEffect(() => {
        if (typeof MutationObserver === "undefined") return undefined;
        const observer = new MutationObserver(() => setName(localeName()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
        return () => observer.disconnect();
      }, []);
      return COPY[name] || COPY.zh;
    }

    function errorOf(c, body) {
      const template = c.errors[body && body.code] || c.errors.unknown;
      return template.replace("{detail}", (body && (body.detail || body.code)) || "?");
    }

    const CSS = "" +
      ".mcpm_page{display:flex;flex-direction:column;gap:16px;max-width:720px;color:var(--dsw-alias-label-primary);font:13px/20px var(--dsw-font-family,sans-serif)}" +
      ".mcpm_page *{box-sizing:border-box}" +
      ".mcpm_pane{display:flex;flex-direction:column;width:100%;min-width:0;height:100%;min-height:0;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:14px/1.6 var(--dsw-font-family,sans-serif)}" +
      ".mcpm_pane *{box-sizing:border-box}" +
      ".mcpm_paneScroll{flex:1;min-height:0;overflow:auto;scrollbar-gutter:stable;--dsh-scrollbar-width:9px;--dsh-scrollbar-thumb-border:2px}" +
      ".mcpm_paneInner{max-width:960px;margin:0 auto;padding:0 clamp(24px,4vw,48px) 48px}" +
      ".mcpm_paneHead{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:24px;padding-top:28px}" +
      "[data-platform=darwin] .mcpm_paneHead{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}" +
      ".mcpm_paneTitle{display:flex;flex-direction:column;gap:4px;min-width:0}" +
      ".mcpm_paneTitle h1{margin:0;font-size:20px;font-weight:500;line-height:28px}" +
      ".mcpm_paneBody{display:flex;flex-direction:column;gap:16px}" +
      ".mcpm_paneIntro{margin:0 0 20px;max-width:640px}" +
      ".mcpm_paneHead .mcpm_btn{height:32px;padding:0 14px;font-size:13px}" +
      "@media (width<=767px){.mcpm_paneInner{padding-inline:20px}}" +
      ".mcpm_head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}" +
      ".mcpm_title{margin:0;font-size:15px;line-height:22px;font-weight:600}" +
      ".mcpm_hint{margin:0;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-size:12px;line-height:18px}" +
      ".mcpm_list{display:flex;flex-direction:column;border-radius:var(--dsw-radius-md,12px);box-shadow:inset 0 0 0 var(--dsh-hairline-width,.5px) var(--dsw-alias-border-l2);overflow:hidden}" +
      ".mcpm_item{display:flex;flex-direction:column;gap:12px;padding:12px 14px}" +
      ".mcpm_item+.mcpm_item{border-top:var(--dsh-hairline-width,.5px) solid var(--dsw-alias-border-l2)}" +
      ".mcpm_row{display:flex;align-items:center;gap:12px;min-width:0}" +
      ".mcpm_main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}" +
      ".mcpm_name{display:flex;align-items:center;gap:8px;font-weight:600}" +
      ".mcpm_target{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-family-mono,ui-monospace,monospace);font-size:12px}" +
      ".mcpm_err{color:var(--dsw-alias-state-error-primary,#d14343);font-size:12px;line-height:18px;word-break:break-word}" +
      ".mcpm_dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--dsw-alias-label-tertiary,#999)}" +
      ".mcpm_dot_connected{background:var(--dsw-alias-state-success-primary,#16835a)}" +
      ".mcpm_dot_connecting{background:var(--dsw-alias-state-warning-primary,#c98a00)}" +
      ".mcpm_dot_failed,.mcpm_dot_degraded{background:var(--dsw-alias-state-error-primary,#d14343)}" +
      ".mcpm_badge{padding:0 6px;border-radius:var(--dsw-radius-xs,4px);background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px;font-weight:400}" +
      ".mcpm_actions{display:inline-flex;align-items:center;gap:6px;flex:none}" +
      ".mcpm_btn{height:28px;padding:0 12px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;box-shadow:inset 0 0 0 var(--dsh-hairline-width,.5px) var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}" +
      ".mcpm_btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}" +
      ".mcpm_btn:disabled{opacity:.4;cursor:default}" +
      ".mcpm_primary{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-state-business-primary));box-shadow:none;color:var(--dsw-alias-label-primary-foreground,#fff)}" +
      ".mcpm_primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-state-business-primary))}" +
      ".mcpm_danger{color:var(--dsw-alias-state-error-primary,#d14343)}" +
      ".mcpm_btn:focus-visible,.mcpm_switch:focus-visible,.mcpm_seg button:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}" +
      ".mcpm_switch{position:relative;width:32px;height:18px;flex:none;padding:0;border:0;border-radius:9px;background:var(--dsw-alias-border-l3,#ccc);cursor:pointer;transition:background .15s}" +
      ".mcpm_switch::after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .15s}" +
      ".mcpm_switch[aria-checked=true]{background:var(--dsw-alias-state-business-primary,#3964fe)}" +
      ".mcpm_switch[aria-checked=true]::after{transform:translateX(14px)}" +
      ".mcpm_switch:disabled{opacity:.4;cursor:default}" +
      "@media (prefers-reduced-motion:reduce){.mcpm_switch,.mcpm_switch::after{transition:none}}" +
      ".mcpm_form{display:flex;flex-direction:column;gap:14px;padding:14px;border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-2,transparent)}" +
      ".mcpm_field{display:flex;flex-direction:column;gap:6px;min-width:0}" +
      ".mcpm_label{font-weight:560}" +
      ".mcpm_input{width:100%;height:32px;padding:0 10px;border:0;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-layer-1);box-shadow:inset 0 0 0 var(--dsh-hairline-width,.5px) var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));color:inherit;font:inherit;outline:none}" +
      "textarea.mcpm_input{height:auto;min-height:64px;padding:8px 10px;resize:vertical}" +
      ".mcpm_input:focus{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}" +
      ".mcpm_mono{font-family:var(--dsw-font-family-mono,ui-monospace,monospace);font-size:12px}" +
      ".mcpm_num{width:100px}" +
      ".mcpm_kv{display:grid;grid-template-columns:1fr 1.4fr auto;gap:6px;align-items:center}" +
      ".mcpm_kv3{grid-template-columns:1fr 1fr 1fr auto}" +
      ".mcpm_x{width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:15px;cursor:pointer}" +
      ".mcpm_x:hover{background:var(--dsw-alias-interactive-bg-hover)}" +
      ".mcpm_link{align-self:flex-start;padding:0;border:0;background:none;color:var(--dsw-alias-link,var(--dsw-alias-state-business-primary));font:inherit;font-size:12px;cursor:pointer}" +
      ".mcpm_seg{display:inline-flex;align-self:flex-start;padding:2px;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}" +
      ".mcpm_seg button{height:26px;padding:0 12px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}" +
      ".mcpm_seg button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 0 0 .5px var(--dsw-alias-border-l2),0 1px 2px rgba(0,0,0,.06)}" +
      ".mcpm_footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}" +
      ".mcpm_buttons{display:inline-flex;gap:8px;margin-left:auto}" +
      ".mcpm_notice{margin:0;font-size:12px;line-height:18px;word-break:break-word}" +
      ".mcpm_good{color:var(--dsw-alias-state-success-primary,#16835a)}" +
      ".mcpm_bad{color:var(--dsw-alias-state-error-primary,#d14343)}" +
      ".mcpm_toolList{margin:0;color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-family-mono,ui-monospace,monospace);font-size:11px;line-height:16px;word-break:break-word}" +
      "@media (hover:none){.mcpm_btn:hover:not(:disabled),.mcpm_x:hover{background:transparent}.mcpm_btn:active:not(:disabled){background:var(--dsw-alias-interactive-bg-pressed,var(--dsw-alias-interactive-bg-hover))}}" +
      "@media (pointer:coarse){.mcpm_input{font-size:16px}}";

    async function readServers() {
      const response = await fetch(SERVERS_ROUTE, { headers: { accept: "application/json" } });
      const body = await response.json();
      if (!response.ok || body.ok !== true) throw new Error(body.code || String(response.status));
      return body;
    }
    async function postJson(route, payload) {
      const response = await fetch(route, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(payload) });
      try { return await response.json(); } catch { return { ok: false, code: "http", detail: String(response.status) }; }
    }

    // ── form model ──
    const rowsOf = (dict) => Object.entries(dict || {}).map(([k, v]) => ({ k, v }));
    const secretRowsOf = (dict) => Object.entries(dict || {}).map(([k, ref]) => ({ k, ref, value: "" }));
    function emptyForm() {
      return { name: "", transport: "stdio", command: "", argsText: "", env: [], secretEnv: [], cwd: "", url: "", headers: [], secretHeaders: [], timeout: "60" };
    }
    function formOf(server) {
      return {
        name: server.name, transport: server.transport, command: server.command || "", argsText: (server.args || []).join("\n"),
        env: rowsOf(server.env), secretEnv: secretRowsOf(server.secretEnv), cwd: server.cwd || "", url: server.url || "",
        headers: rowsOf(server.headers), secretHeaders: secretRowsOf(server.secretHeaders), timeout: String(Math.round((server.toolCallTimeoutMs || 60000) / 1000)),
      };
    }
    function payloadOf(form, enabled) {
      const dict = (rows) => Object.fromEntries(rows.filter((r) => r.k.trim() !== "").map((r) => [r.k.trim(), r.v]));
      const refs = (rows) => Object.fromEntries(rows.filter((r) => r.k.trim() !== "").map((r) => [r.k.trim(), (r.ref.trim() || defaultRef(form.name, r.k))]));
      const secrets = {};
      for (const r of [...form.secretEnv, ...form.secretHeaders]) {
        if (r.k.trim() !== "" && r.value !== "") secrets[r.ref.trim() || defaultRef(form.name, r.k)] = r.value;
      }
      const seconds = Number(form.timeout);
      const server = {
        name: form.name.trim(), enabled, transport: form.transport,
        toolCallTimeoutMs: Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds * 1000) : 60000,
      };
      if (form.transport === "stdio") {
        Object.assign(server, { command: form.command.trim(), args: form.argsText.split("\n").map((a) => a.trim()).filter((a) => a !== ""), env: dict(form.env), secretEnv: refs(form.secretEnv), cwd: form.cwd.trim() });
      } else {
        Object.assign(server, { url: form.url.trim(), headers: dict(form.headers), secretHeaders: refs(form.secretHeaders) });
      }
      return { server, secrets };
    }
    function defaultRef(name, key) {
      return ("MCP_" + (name || "server") + "_" + key).toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    }

    // ── small controls ──
    function Field({ label, hint, children }) {
      return h("label", { className: "mcpm_field" }, h("span", { className: "mcpm_label" }, label), children, hint ? h("span", { className: "mcpm_hint" }, hint) : null);
    }
    function Switch({ checked, disabled, label, onChange }) {
      return h("button", { type: "button", role: "switch", "aria-checked": checked ? "true" : "false", "aria-label": label, className: "mcpm_switch", disabled, onClick: () => onChange(!checked) });
    }
    function KeyValueRows({ c, rows, onChange, secret, saved }) {
      const update = (index, key) => (event) => onChange(rows.map((r, i) => (i === index ? { ...r, [key]: event.target.value } : r)));
      return h("div", { className: "mcpm_field" },
        rows.map((row, index) => h("div", { key: index, className: "mcpm_kv" + (secret ? " mcpm_kv3" : "") },
          h("input", { className: "mcpm_input mcpm_mono", placeholder: c.fields.key, value: row.k, onChange: update(index, "k"), "aria-label": c.fields.key }),
          secret ? h("input", { className: "mcpm_input mcpm_mono", placeholder: c.fields.ref, value: row.ref, onChange: update(index, "ref"), "aria-label": c.fields.ref }) : null,
          secret
            ? h("input", { className: "mcpm_input", type: "password", autoComplete: "new-password", placeholder: (saved && saved[row.ref] ? c.fields.saved : c.fields.notSaved), value: row.value, onChange: update(index, "value"), "aria-label": c.fields.value })
            : h("input", { className: "mcpm_input mcpm_mono", placeholder: c.fields.value, value: row.v, onChange: update(index, "v"), "aria-label": c.fields.value }),
          h("button", { type: "button", className: "mcpm_x", "aria-label": c.remove, onClick: () => onChange(rows.filter((_, i) => i !== index)) }, "×"))),
        h("button", { type: "button", className: "mcpm_link", onClick: () => onChange([...rows, secret ? { k: "", ref: "", value: "" } : { k: "", v: "" }]) }, "+ " + c.fields.addRow));
    }

    function ServerForm({ c, initial, previousName, enabled, saved, canSave, onDone, onCancel }) {
      const [form, setForm] = React.useState(initial);
      const [busy, setBusy] = React.useState(null);
      const [notice, setNotice] = React.useState(null);
      const set = (key) => (value) => { setForm((f) => ({ ...f, [key]: value })); setNotice(null); };
      const input = (key) => (event) => set(key)(event.target.value);
      const nameOk = NAME.test(form.name.trim());

      async function test() {
        setBusy("test"); setNotice(null);
        const { server, secrets } = payloadOf(form, true);
        const body = await postJson(TEST_ROUTE, { server, secrets }).catch((e) => ({ ok: false, code: "network", detail: String(e) }));
        setBusy(null);
        if (body.ok) {
          const info = body.serverInfo ? [body.serverInfo.title || body.serverInfo.name, body.serverInfo.version].filter(Boolean).join(" ") : "";
          setNotice({ ok: true, text: c.testOk(info, body.tools.length), tools: body.tools });
        } else setNotice({ ok: false, text: errorOf(c, body) });
      }
      async function save() {
        setBusy("save"); setNotice(null);
        const { server, secrets } = payloadOf(form, enabled);
        const body = await postJson(SERVERS_ROUTE, { action: "upsert", previousName: previousName || undefined, server, secrets }).catch((e) => ({ ok: false, code: "network", detail: String(e) }));
        setBusy(null);
        if (body.ok) onDone(c.savedOk);
        else setNotice({ ok: false, text: errorOf(c, body) });
      }

      const stdio = form.transport === "stdio";
      return h("div", { className: "mcpm_form" },
        h(Field, { label: c.fields.name, hint: c.fields.nameHint }, h("input", { className: "mcpm_input mcpm_mono", value: form.name, onChange: input("name"), autoFocus: !previousName, "aria-invalid": form.name !== "" && !nameOk })),
        h(Field, { label: c.fields.transport },
          h("span", { className: "mcpm_seg", role: "group" },
            h("button", { type: "button", "aria-pressed": stdio ? "true" : "false", onClick: () => set("transport")("stdio") }, c.fields.stdio),
            h("button", { type: "button", "aria-pressed": stdio ? "false" : "true", onClick: () => set("transport")("streamable-http") }, c.fields.http))),
        stdio ? [
          h(Field, { key: "cmd", label: c.fields.command, hint: c.fields.commandHint }, h("input", { className: "mcpm_input mcpm_mono", value: form.command, onChange: input("command") })),
          h(Field, { key: "args", label: c.fields.args, hint: c.fields.argsHint }, h("textarea", { className: "mcpm_input mcpm_mono", rows: 2, value: form.argsText, onChange: input("argsText") })),
          h("div", { key: "env", className: "mcpm_field" }, h("span", { className: "mcpm_label" }, c.fields.env), h(KeyValueRows, { c, rows: form.env, onChange: set("env") })),
          h("div", { key: "senv", className: "mcpm_field" }, h("span", { className: "mcpm_label" }, c.fields.secretEnv), h(KeyValueRows, { c, rows: form.secretEnv, onChange: set("secretEnv"), secret: true, saved }), h("span", { className: "mcpm_hint" }, c.fields.secretHint)),
          h(Field, { key: "cwd", label: c.fields.cwd }, h("input", { className: "mcpm_input mcpm_mono", value: form.cwd, onChange: input("cwd") })),
        ] : [
          h(Field, { key: "url", label: c.fields.url }, h("input", { className: "mcpm_input mcpm_mono", value: form.url, onChange: input("url"), placeholder: "https://example.com/mcp" })),
          h("div", { key: "hdr", className: "mcpm_field" }, h("span", { className: "mcpm_label" }, c.fields.headers), h(KeyValueRows, { c, rows: form.headers, onChange: set("headers") })),
          h("div", { key: "shdr", className: "mcpm_field" }, h("span", { className: "mcpm_label" }, c.fields.secretHeaders), h(KeyValueRows, { c, rows: form.secretHeaders, onChange: set("secretHeaders"), secret: true, saved }), h("span", { className: "mcpm_hint" }, c.fields.secretHint)),
        ],
        h(Field, { label: c.fields.timeout }, h("input", { className: "mcpm_input mcpm_num", type: "number", min: 1, max: 600, value: form.timeout, onChange: input("timeout") })),
        notice ? h("div", { className: "mcpm_field", role: "status" },
          h("p", { className: "mcpm_notice " + (notice.ok ? "mcpm_good" : "mcpm_bad") }, notice.text),
          notice.tools && notice.tools.length ? h("p", { className: "mcpm_toolList" }, notice.tools.join(", ")) : null) : null,
        h("div", { className: "mcpm_footer" },
          h("span", null),
          h("span", { className: "mcpm_buttons" },
            h("button", { type: "button", className: "mcpm_btn", onClick: onCancel, disabled: busy !== null }, c.cancel),
            h("button", { type: "button", className: "mcpm_btn", onClick: () => void test(), disabled: busy !== null || !nameOk }, busy === "test" ? c.testing : c.test),
            h("button", { type: "button", className: "mcpm_btn mcpm_primary", onClick: () => void save(), disabled: busy !== null || !nameOk || !canSave }, busy === "save" ? c.saving : c.save))));
    }

    function targetOf(server) {
      return server.transport === "stdio" ? [server.command, ...(server.args || [])].join(" ") : server.url;
    }

    function ServerRow({ c, server, canSave, busy, onEdit, onToggle, onRemove }) {
      const [confirming, setConfirming] = React.useState(false);
      const status = server.status || { state: "disabled" };
      const meta = [c.states[status.state] || status.state];
      if (typeof status.tools === "number" && status.state !== "disabled") meta.push(c.tools(status.tools));
      return h("div", { className: "mcpm_item" },
        h("div", { className: "mcpm_row" },
          h("span", { className: "mcpm_dot mcpm_dot_" + status.state, "aria-hidden": "true" }),
          h("div", { className: "mcpm_main" },
            h("span", { className: "mcpm_name" }, server.name, h("span", { className: "mcpm_badge" }, server.transport === "stdio" ? "stdio" : "http"), h("span", { className: "mcpm_hint" }, meta.join(" · "))),
            h("span", { className: "mcpm_target", title: targetOf(server) }, targetOf(server)),
            status.error ? h("span", { className: "mcpm_err" }, status.error) : null),
          h("span", { className: "mcpm_actions" },
            confirming
              ? [
                h("span", { key: "q", className: "mcpm_hint" }, c.confirmRemove(server.name)),
                h("button", { key: "n", type: "button", className: "mcpm_btn", onClick: () => setConfirming(false) }, c.cancel),
                h("button", { key: "y", type: "button", className: "mcpm_btn mcpm_danger", disabled: busy, onClick: () => { setConfirming(false); onRemove(); } }, c.confirm),
              ]
              : [
                h("button", { key: "e", type: "button", className: "mcpm_btn", disabled: busy, onClick: onEdit }, c.edit),
                canSave ? h("button", { key: "d", type: "button", className: "mcpm_btn mcpm_danger", disabled: busy, onClick: () => setConfirming(true) }, c.remove) : null,
                h(Switch, { key: "s", checked: server.enabled, disabled: busy || !canSave, label: c.enabled + " " + server.name, onChange: onToggle }),
              ])));
    }

    function McpServersPage({ view }) {
      const c = useCopy();
      const [remote, setRemote] = React.useState({ status: "loading" });
      const [editing, setEditing] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      const [notice, setNotice] = React.useState(null);
      const polls = React.useRef(0);

      const reload = React.useCallback(async () => {
        try {
          const body = await readServers();
          setRemote({ status: "ready", view: body });
          return body;
        } catch (error) {
          setRemote((r) => (r.status === "ready" ? r : { status: "error", message: error instanceof Error ? error.message : String(error) }));
          return null;
        }
      }, []);
      React.useEffect(() => { void reload(); }, [reload]);

      // After a save the plugin restarts; poll until no server is still connecting (max ~30s).
      const pending = remote.status === "ready" && remote.view.servers.some((s) => s.status && s.status.state === "connecting");
      React.useEffect(() => {
        if (!pending && polls.current === 0) return undefined;
        if (polls.current >= 15 || (!pending && polls.current > 1)) { polls.current = 0; return undefined; }
        const timer = setTimeout(() => { polls.current += 1; void reload(); }, 2000);
        return () => clearTimeout(timer);
      }, [pending, remote, reload]);

      const afterChange = React.useCallback(async (text) => {
        polls.current = 1;
        setNotice(text ? { ok: true, text } : null);
        await new Promise((r) => setTimeout(r, 600));
        await reload();
      }, [reload]);

      if (view === "summary") {
        if (remote.status !== "ready") return null;
        const list = remote.view.servers;
        return c.summary(list.length, list.filter((s) => s.status && s.status.state === "connected").length);
      }

      const style = h("style", null, CSS);
      if (remote.status !== "ready") {
        const hint = h("p", { className: remote.status === "error" ? "mcpm_notice mcpm_bad" : "mcpm_hint" }, remote.status === "error" ? c.loadFailed + remote.message : c.loading);
        if (view === "panel") {
          return h("section", { className: "mcpm_pane", "aria-label": c.title }, style,
            h("div", { className: "mcpm_paneScroll" }, h("div", { className: "mcpm_paneInner" }, hint)));
        }
        return h("div", { className: "mcpm_page" }, style, hint);
      }
      const data = remote.view;
      const canSave = data.canSave === true;
      const connected = data.servers.filter((s) => s.status && s.status.state === "connected").length;

      async function mutate(payload) {
        setBusy(true); setNotice(null);
        const body = await postJson(SERVERS_ROUTE, payload).catch((e) => ({ ok: false, code: "network", detail: String(e) }));
        setBusy(false);
        if (body.ok) await afterChange(null);
        else setNotice({ ok: false, text: errorOf(c, body) });
      }

      const addButton = canSave && editing === null
        ? h("button", { type: "button", className: "mcpm_btn mcpm_primary", onClick: () => { setNotice(null); setEditing({ key: "new", form: emptyForm(), previousName: null, enabled: true, saved: {} }); } }, c.add)
        : null;
      const body = [
        !canSave ? h("p", { className: "mcpm_notice mcpm_bad" }, c.readOnly) : null,
        data.clientError ? h("p", { className: "mcpm_notice mcpm_bad" }, c.clientError + data.clientError) : null,
        notice ? h("p", { className: "mcpm_notice " + (notice.ok ? "mcpm_good" : "mcpm_bad"), role: "status" }, notice.text) : null,
        editing && editing.key === "new" ? h(ServerForm, { c, initial: editing.form, previousName: null, enabled: true, saved: {}, canSave, onCancel: () => setEditing(null), onDone: (text) => { setEditing(null); void afterChange(text); } }) : null,
        data.servers.length === 0 && !(editing && editing.key === "new")
          ? h("p", { className: "mcpm_hint" }, c.empty)
          : data.servers.length ? h("div", { className: "mcpm_list" }, data.servers.map((server) =>
            editing && editing.key === server.name
              ? h("div", { key: server.name, className: "mcpm_item" }, h(ServerForm, { c, initial: editing.form, previousName: server.name, enabled: server.enabled, saved: server.secrets, canSave, onCancel: () => setEditing(null), onDone: (text) => { setEditing(null); void afterChange(text); } }))
              : h(ServerRow, {
                key: server.name, c, server, canSave, busy: busy || editing !== null,
                onEdit: () => { setNotice(null); setEditing({ key: server.name, form: formOf(server) }); },
                onToggle: (enabled) => void mutate({ action: "toggle", name: server.name, enabled }),
                onRemove: () => void mutate({ action: "remove", name: server.name }),
              }))) : null,
      ];

      // The left sidebar's own panel: a full-height page matching a host page's heading and scroll area.
      if (view === "panel") {
        return h("section", { className: "mcpm_pane", "aria-label": c.title }, style,
          h("div", { className: "mcpm_paneScroll" },
            h("div", { className: "mcpm_paneInner" },
              h("div", { className: "mcpm_paneHead" },
                h("div", { className: "mcpm_paneTitle" },
                  h("h1", null, c.title),
                  h("p", { className: "mcpm_hint" }, c.summary(data.servers.length, connected))),
                addButton),
              h("p", { className: "mcpm_hint mcpm_paneIntro" }, c.intro),
              h("div", { className: "mcpm_paneBody" }, ...body))));
      }

      return h("div", { className: "mcpm_page" }, style,
        h("div", { className: "mcpm_head" },
          h("div", { className: "mcpm_main" },
            view === "settings" ? h("h2", { className: "mcpm_title" }, c.title) : null,
            h("p", { className: "mcpm_hint" }, c.intro)),
          addButton),
        ...body);
    }

    function SettingsSection() {
      return h(McpServersPage, { view: "settings" });
    }

    function PanelPage() {
      return h(McpServersPage, { view: "panel" });
    }

    /** The sidebar row glyph: a plug, drawn in the host's outline icon idiom. */
    function PanelIcon({ size = 18 }) {
      return h("svg", {
        width: size, height: size, viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round",
        "aria-hidden": "true", focusable: "false", style: { display: "block" },
      },
        h("path", { d: "M9.2 3.4v3.4M14.8 3.4v3.4" }),
        h("path", { d: "M6.4 6.8h11.2v3.2a5.6 5.6 0 0 1-11.2 0z" }),
        h("path", { d: "M12 15.6v4" }),
      );
    }

    const inject = ["slots"];

    function apply(ctx) {
      ctx.slots.inject("plugins.row.config", () => ctx.slots.register({
        name: "plugins.row.config",
        key: PACKAGE + "#" + ROW_ID,
      }, McpServersPage));
      ctx.slots.inject("settings.section", () => ctx.slots.register({
        name: "settings.section",
        id: PANEL_ID,
        order: 60,
        label: () => copyOf().nav,
      }, SettingsSection));
      ctx.slots.inject("settings.section.icon", () => ctx.slots.register({
        name: "settings.section.icon",
        id: PANEL_ID,
      }, PanelIcon));
      ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
        name: "sidebar.panellist",
        id: PANEL_ID,
        order: 20,
        label: () => copyOf().nav,
      }, PanelIcon));
      ctx.slots.inject("main", () => ctx.slots.register({
        name: "main",
        key: PANEL_ID,
      }, PanelPage));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
