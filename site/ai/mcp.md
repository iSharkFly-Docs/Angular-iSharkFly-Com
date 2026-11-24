# Angular CLI MCP 服务器 {#angular-cli-mcp-server}

Angular CLI 内置了一个 Model Context Protocol（MCP）服务器，让 AI 助手（例如 Cursor、Antigravity、JetBrains AI 等）能够直接与 Angular CLI 交互。它提供了用于代码生成、工作区（Workspace）分析以及运行构建和测试的工具（Tool）。

::: tip 与 Angular AI 智能体技能集成
如果你的宿主环境支持自定义智能体技能（Agent Skills）（例如 Antigravity），你可以将 Angular CLI MCP 服务器与官方的 [Angular AI 技能](https://angular.dev/ai/agent-skills) 结合使用。技能为智能体（Agent）提供深入的指令级指导和编码规范，MCP 服务器则提供执行这些规范所需的操作工具（例如编译、运行测试和分析工作区），二者结合可以构成一个完整而强大的开发智能体。
:::

## 快速开始 {#get-started}

要使用 MCP 服务器，需要在宿主环境（IDE 或 CLI）中配置运行 `npx @angular/cli mcp`。

<Tabs :tabs="[{label:'Antigravity IDE',value:'t0'},{label:'Cursor',value:'t1'},{label:'VS Code',value:'t2'}]">

<TabItem value="t0">

在项目根目录下创建名为 `.antigravity/mcp.json` 的文件：

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

</TabItem>

<TabItem value="t1">

在项目根目录下创建 `.cursor/mcp.json`（或者在全局位置 `~/.cursor/mcp.json` 创建）：

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

</TabItem>

<TabItem value="t2">

创建 `.vscode/mcp.json`：

```json
{
  "servers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

</TabItem>

</Tabs>

## 可用工具（默认） {#available-tools-default}

启用 MCP 服务器后，AI 智能体可以使用以下工具：

| 名称                        | 说明                                                                                               |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `ai_tutor`                  | 启动交互式的 AI 驱动 Angular 导师。                                                         |
| `devserver_start`           | 异步启动开发服务器（`ng serve`），并立即返回。                                     |
| `devserver_stop`            | 停止开发服务器。                                                                                     |
| `devserver_wait_for_build`  | 返回正在运行的开发服务器中最近一次构建的日志。                                        |
| `get_best_practices`        | 获取 Angular 最佳实践指南（对独立组件、类型化表单等至关重要）。        |
| `list_projects`             | 通过读取 `angular.json`，列出工作区中的所有应用和库。                          |
| `onpush_zoneless_migration` | 分析代码，并给出将其迁移到 `OnPush` 变更检测的计划（这是迁移到 zoneless 的前提）。 |
| `run_target`                | 执行已配置的目标（例如 build、test、lint、e2e、deploy）。                                      |
| `search_documentation`      | 搜索 `https://angular.dev` 上的官方文档。                                             |

## 常见工作流 {#common-workflows}

这些工作流演示了 AI 助手如何协调不同的 MCP 工具，自动完成复杂的开发任务。

### 1. 性能调优：Zoneless 与 OnPush 迁移 {#_1-performance-tuning-zoneless-onpush-migration}

AI 智能体会优化变更检测性能，并将组件迁移到可支持 zoneless 的状态。

1. **探查工作区**：AI 智能体调用 `list_projects`，定位工作区中的组件、项目以及样式和测试配置。
2. **原理图现代化（前提步骤）**：AI 智能体使用标准的 `ng generate` 命令执行前置的信号迁移（例如信号输入、信号查询）。
3. **规划迁移**：AI 智能体以目录或组件文件的绝对路径调用 `onpush_zoneless_migration`。
4. **应用更改**：AI 智能体自动将工具返回的那一项可执行更改应用到代码库中。
5. **验证更改**：AI 智能体调用 `run_target`，并将 target 参数设为 `"test"`，运行单元测试。
6. **重复**：AI 智能体再次调用 `onpush_zoneless_migration` 获取下一步，如此反复，直到工具表明迁移已完成。

### 2. 功能开发与 TDD 循环 {#_2-feature-development-tdd-loop}

在开发新功能时，AI 智能体会自动完成调研、实现和验证。

1. **API 与语法调研**：AI 智能体使用 `search_documentation` 查找 Angular API 或语法规则（例如 `@defer` 块的选项）。
2. **加载编码规范**：AI 智能体以工作区路径调用 `get_best_practices`，加载与当前 Angular 版本相匹配的编码规则。
3. **启动本地开发服务器**：AI 智能体调用 `devserver_start`，在后台启动服务器。
4. **监控构建**：AI 智能体在编辑代码的同时使用 `devserver_wait_for_build` 查看构建日志，确保编译成功。
5. **编写并执行测试**：AI 智能体通过 `list_projects` 识别项目所用的测试框架（例如 Jasmine、Jest、Vitest），编写相应的测试文件，并使用 `run_target` 配合 `"test"` 运行测试。
6. **停止开发服务器**：完成后，AI 智能体调用 `devserver_stop` 停止正在运行的开发服务器。

### 3. 开发者入门与学习 {#_3-developer-onboarding-and-learning}

AI 智能体会在交互式沙盒中引导开发者学习 Angular 概念。

1. **探查项目**：AI 智能体调用 `list_projects` 扫描工作区，识别代码库结构。
2. **启动导师**：AI 智能体运行 `ai_tutor`，加载课程指令、角色设定和辅导指南。
3. **跟随课程**：AI 智能体引导用户学习课程，讲解概念，并指导用户构建或修改哪些组件。
4. **实现与验证**：AI 智能体协助实现沙盒代码，并使用 `run_target` 配合 `"test"` 或 `"build"` 验证更改。

## 命令选项 {#command-options}

你可以在配置的 `args` 数组中向 MCP 服务器传递参数：

- `--read-only`：只注册不会修改项目的工具。
- `--local-only`：只注册不需要互联网连接的工具。

只读模式示例：

```json
"args": ["-y", "@angular/cli", "mcp", "--read-only"]
```
