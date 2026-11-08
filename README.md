# MCP servers for DSH

Manage [MCP](https://modelcontextprotocol.io/) servers from a panel in the DSH left sidebar instead of hand-editing the profile's YAML.

[中文说明](README.zh.md)

## What it gives you

- A **MCP servers** entry in the left sidebar. It opens a full page in the main column, so server state is one click away instead of buried in Settings.
- The same editor on **Settings → MCP servers** and **Plugins → MCP servers → Configure**.
- **stdio** servers (a local command) and **streamable HTTP** servers (a URL).
- **Test connection** before saving: performs the MCP handshake and lists the tools the server exposes.
- Per-server enable switch, live status (connected / connecting / failed) and per-call timeout (1–600 s, default 60 s).
- **Secrets stay out of configuration**: secret environment variables and headers are stored in the DSH credential store; the row config keeps only the credential key name.
- A read-only agent tool, `mcp_servers` (`list` / `test`), so the model can inspect connection state without being able to add or change servers.

## Install

1. **Plugins → Add plugin** and paste `https://github.com/HalcyonAzure/dsh-mcp-manager`.
2. Click **MCP servers** in the left sidebar (or open **Settings → MCP servers**).
3. **Add server**, fill in the connection, **Test connection**, **Save**.

Saving restarts the plugin row, so every server reconnects and any in-flight MCP call is interrupted.

Requires a DSH build that provides the `sidebar.panellist` and `main` slots plus the `@deepseek-ai/dsh-mcp-client` package — any current DSH release has them.

## Add a server

### stdio (local program)

| Field | Meaning |
| --- | --- |
| Name | Letters, digits, `-`, `_`; up to 32 characters. Becomes the tool-name prefix. |
| Command | Absolute path or command name, for example `npx` or `/usr/local/bin/my-server`. |
| Arguments | One argument per line. |
| Environment variables | Plain, non-secret values. |
| Secret environment variables | Credential key + value; the value goes to the DSH credential store. |
| Working directory | Optional. |

### streamable HTTP (remote service)

| Field | Meaning |
| --- | --- |
| Name | Same rule as above. |
| URL | `http://` or `https://` endpoint of the MCP server. |
| Headers | Plain request headers. |
| Secret headers | Credential key + value, stored in the credential store. |

Leave a secret value empty to keep the value that is already stored.

### Row status

Each row shows a dot and a tool count: **connected** (green), **connecting** (amber), **failed** or **not connected** (red), **disabled** (grey). A failure prints the server's own error text under the row.

## How it works

- **Host half** ([index.js](index.js)) keeps the server list in its own row config, mounts one `@deepseek-ai/dsh-mcp-client` child per enabled server, and serves two local endpoints to the UI: `api/mcp-manager.servers` and `api/mcp-manager.test`.
- **Client half** ([client.js](client.js)) registers the sidebar entry, the main panel, the Settings section and the plugin row page. It is plain JavaScript loaded through the DSH client module loader, so there is no build step.
- Tool names keep the MCP convention: `mcp__<server-name>__<tool-name>`.

## Configuration

The server list belongs to this plugin's row. The UI writes it through the DSH config editor; it can also be written directly in the profile patch:

```yaml
- id: mcp-manager
  name: dsh-mcp-manager
  config:
    servers:
      - name: filesystem
        enabled: true
        transport: stdio
        command: npx
        args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp']
```

## Security notes

- A stdio server runs the command you configure, with **your** user account and your machine's permissions. Only add servers you trust.
- Adding, editing and deleting servers is user-only in the UI; the agent tool cannot change configuration.
- Ambient `*KEY*`, `*PASSWORD*`, `*SECRET*`, `*TOKEN*` and `DSH_*` variables are scrubbed from the environment handed to a stdio server.
- Secret values are resolved when the plugin mounts; a missing secret is reported on the row rather than silently substituted.

## Development

The plugin is plain ESM plus a plain client module — no bundler, no dependencies. Install the checkout as a local bundle (**Plugins → Add plugin** with the directory path), edit files, reload the page.

## License

MIT © [HalcyonAzure](https://github.com/HalcyonAzure)
