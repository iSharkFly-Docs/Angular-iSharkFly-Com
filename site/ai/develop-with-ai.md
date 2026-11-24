# 大语言模型提示词与 AI IDE 设置 {#llm-prompts-and-ai-ide-setup}

使用大语言模型（LLM）生成代码，是开发者日益关注的领域。虽然大语言模型通常能够生成可运行的代码，但要为 Angular 这样持续演进的框架生成代码，仍然颇具挑战。

高级指令和提示词（Prompt）编写正在成为一种新兴标准，用于在现代代码生成中补充领域特定的细节。本节收集整理了相关内容和资源，帮助大语言模型更准确地生成 Angular 代码。

## 自定义提示词和系统指令 {#custom-prompts-and-system-instructions}

使用下列任一自定义的领域特定文件，可以改善用大语言模型生成代码的体验。

::: info 注意
这些文件会定期更新，与 Angular 的约定保持同步。

:::

下面是一组帮助大语言模型生成正确、并遵循 Angular 最佳实践的代码的指令。你可以把这个文件作为 AI 工具的系统指令，也可以把它作为上下文随提示词一起提供。

```md [best-practices.md]
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
```

<a download href="https://angular.dev/assets/context/best-practices.md" target="_blank">点击这里下载 best-practices.md 文件。</a>

## 规则文件 {#rules-files}

一些工具（例如 <a href="https://antigravity.google?utm_source=adev&utm_medium=website&utm_campaign=BUILD_WITH_AI_ANGULAR&utm_term=angular_devrel&utm_content=build_with_ai_angular_antigravity" target="_blank">Antigravity</a>）提供规则文件，可用于向大语言模型提供关键上下文。

| 环境/IDE      | 规则文件                                                                                                             | 安装说明                                                                                                                                       |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Antigravity          | <a download href="https://angular.dev/assets/context/GEMINI.md" target="_blank">GEMINI.md</a>                                             | <a href="https://antigravity.google/docs/rules-workflows" target="_blank">配置 `GEMINI.md`</a>                                                             |
| 基于 Copilot 的 IDE | <a download="copilot-instructions.md" href="https://angular.dev/assets/context/guidelines.md" target="_blank">copilot-instructions.md</a> | <a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions" target="_blank">配置 `.github/copilot-instructions.md`</a> |
| Cursor               | <a download href="https://angular.dev/assets/context/angular-20.mdc" target="_blank">cursor.md</a>                                        | <a href="https://docs.cursor.com/context/rules" target="_blank">配置 `cursorrules.md`</a>                                                                  |
| JetBrains IDE       | <a download href="https://angular.dev/assets/context/AGENTS.md" target="_blank">AGENTS.md</a>                                             | <a href="https://junie.jetbrains.com/docs/guidelines-and-memory.html#how-junie-cli-discovers-guidelines" target="_blank">配置 `AGENTS.md`</a>              |
| VS Code              | <a download=".instructions.md" href="https://angular.dev/assets/context/guidelines.md" target="_blank">.instructions.md</a>               | <a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions" target="_blank">配置 `.instructions.md`</a>                |
| Windsurf             | <a download href="https://angular.dev/assets/context/guidelines.md" target="_blank">guidelines.md</a>                                     | <a href="https://docs.windsurf.com/windsurf/cascade/memories#rules" target="_blank">配置 `guidelines.md`</a>                                               |

## 设置 Angular CLI MCP 服务器 {#angular-cli-mcp-server-setup}

Angular CLI 内置了一个实验性的 [Model Context Protocol（MCP）服务器](https://modelcontextprotocol.io/)，让开发环境中的 AI 助手能够与 Angular CLI 交互。

[**了解如何设置 Angular CLI MCP 服务器**](/ai/mcp)

## 使用 `llms.txt` 提供上下文 {#providing-context-with-llms-txt}

`llms.txt` 是一项面向网站的提议标准，旨在帮助大语言模型更好地理解和处理网站内容。Angular 团队开发了这个文件的两个版本，帮助大语言模型以及基于大语言模型的代码生成工具生成更好的现代 Angular 代码。

- <a href="https://angular.dev/llms.txt" target="_blank">llms.txt</a> - 索引文件，提供指向关键文件和资源的链接。
- <a href="https://angular.dev/assets/context/llms-full.txt" target="_blank">llms-full.txt</a> - 内容更完整的资源合集，介绍 Angular 的工作原理以及如何构建 Angular 应用。

另外，请务必查看 [概览页面](/ai)，了解如何将 AI 集成到你的 Angular 应用中的更多信息。
