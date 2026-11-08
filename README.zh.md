# DSH MCP 服务器管理

在 DSH 左侧栏的面板中管理 [MCP](https://modelcontextprotocol.io/) 服务器，不用手改 profile 的 YAML。

[English](README.md)

## 提供什么

- 左侧栏新增 **MCP 服务器** 入口，点击即在主区域打开完整页面，不用先进设置里翻。
- 同一套编辑器也出现在 **设置 → MCP 服务器** 和 **插件 → MCP 服务器 → 配置**。
- 支持 **stdio**（本地程序）与 **streamable HTTP**（远程服务）两种传输方式。
- 保存前可 **测试连接**：执行 MCP 握手并列出该服务器暴露的工具。
- 每台服务器有启用开关、实时状态（已连接 / 连接中 / 失败）和单次调用超时（1–600 秒，默认 60 秒）。
- **密钥不写进配置**：密钥类环境变量与请求头存入 DSH 凭据库，配置里只保留凭据键名。
- 提供只读 Agent 工具 `mcp_servers`（`list` / `test`），模型能查看连接状态，但不能增删改服务器。

## 安装

1. **插件 → 添加插件**，填入 `https://github.com/HalcyonAzure/dsh-mcp-manager`。
2. 点击左侧栏的 **MCP 服务器**（或进入 **设置 → MCP 服务器**）。
3. **添加服务器**，填写连接信息，**测试连接**，**保存**。

保存会重启本插件这一行，所有服务器重新连接，进行中的 MCP 调用会中断。

需要提供 `sidebar.panellist`、`main` 槽位以及 `@deepseek-ai/dsh-mcp-client` 包的 DSH 版本，当前正式版均已具备。

## 添加服务器

### stdio（本地程序）

| 字段 | 说明 |
| --- | --- |
| 名称 | 字母、数字、`-`、`_`，最多 32 个字符；决定工具名前缀。 |
| 命令 | 绝对路径或命令名，例如 `npx` 或 `/usr/local/bin/my-server`。 |
| 参数 | 每行一个参数。 |
| 环境变量 | 非机密的普通值。 |
| 密钥环境变量 | 凭据键名 + 值；值存入 DSH 凭据库。 |
| 工作目录 | 可选。 |

### streamable HTTP（远程服务）

| 字段 | 说明 |
| --- | --- |
| 名称 | 规则同上。 |
| URL | MCP 服务器的 `http://` 或 `https://` 地址。 |
| 请求头 | 普通请求头。 |
| 密钥请求头 | 凭据键名 + 值，存入凭据库。 |

密钥值留空表示沿用已保存的值。

### 状态标记

每行显示状态圆点与工具数量：**已连接**（绿）、**连接中**（黄）、**失败 / 未连接**（红）、**已停用**（灰）。失败时会在该行下方显示服务器自己的错误信息。

## 工作原理

- **Host 半边**（[index.js](index.js)）把服务器列表保存在本插件自己的行配置里，为每台启用的服务器挂载一个 `@deepseek-ai/dsh-mcp-client` 子插件，并向界面提供两个本地端点：`api/mcp-manager.servers` 与 `api/mcp-manager.test`。
- **Client 半边**（[client.js](client.js)）注册左侧栏入口、主区域面板、设置分节和插件配置页。它是纯 JavaScript，由 DSH 客户端模块加载器加载，不需要构建。
- 工具名沿用 MCP 约定：`mcp__<服务器名>__<工具名>`。

## 配置

服务器列表属于本插件这一行。界面通过 DSH 的 config editor 写回，也可以直接写在 profile patch 里：

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

## 安全说明

- stdio 服务器会用**你自己的账户**和本机权限运行你填写的命令，只添加你信任的服务器。
- 增删改服务器只能由用户在界面完成；Agent 工具无法修改配置。
- 传给 stdio 服务器的环境变量会剔除 `*KEY*`、`*PASSWORD*`、`*SECRET*`、`*TOKEN*` 以及 `DSH_*` 开头的变量。
- 密钥在插件挂载时解析；缺失的密钥会在行内提示，而不会被凭空填充。

## 开发

插件是纯 ESM + 纯客户端模块，没有打包器、没有依赖。把本目录作为本地 bundle 安装（**插件 → 添加插件** 填目录路径），改完文件刷新页面即可。

## 许可证

MIT © [HalcyonAzure](https://github.com/HalcyonAzure)
