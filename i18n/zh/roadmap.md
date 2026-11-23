# Angular 路线图

了解 Angular 团队如何在 Web 领域持续发力。


作为一个开源项目，Angular 每天的提交（commit）、PR 和进展都可以在 GitHub 上追踪。为了让大家更清楚地看到这些日常工作与框架未来的关系，我们的路线图汇总了团队当前及未来规划的愿景。

以下项目不与某个特定的 Angular 版本绑定。我们会在项目完成后发布它们，并根据发布计划、遵循语义化版本（Semantic Versioning）规则纳入某个具体版本。例如，功能完成后我们会在下一个次版本中发布；如果包含破坏性变更，则在下一个主版本中发布。

目前，Angular 框架有三个目标：

1. 改善[开发者的 AI 体验](/ai)
1. 改善 [Angular 开发者体验](#improving-the-angular-developer-experience)
1. 提升框架的性能

请继续阅读，了解我们计划如何通过具体的项目工作来实现这些目标。

## 探索现代 Angular

使用我们路线图中最新的 Angular 特性开始开发。下面列出了路线图中各项新特性的当前状态：

### 可供试用

- [Web MCP](/ai/webmcp)

### 可用于生产环境

- [信号表单（Signal Forms）](/guide/forms/signals/overview)
- [Resource API](/guide/signals/resource)
- [httpResource](https://angular.dev/api/common/http/httpResource)
- [无 Zone 变更检测（Zoneless Change Detection）](/guide/zoneless)
- [Linked Signal API](/guide/signals/linked-signal)
- [增量水合（Incremental Hydration）](/guide/incremental-hydration)
- [Effect API](https://angular.dev/api/core/effect)
- [服务端渲染（SSR）中的事件重放](https://angular.dev/api/platform-browser/withEventReplay)
- [路由级渲染模式](/guide/ssr)

## 改善 Angular 开发者的 AI 体验

### 把 AI 的最佳能力带给 Angular

- **AI 驱动的 Angular**：AI 正在持续重塑开发格局。它改变了我们开发应用的方式，也拓展了可实现的用户体验类型。我们计划在 AI 辅助编码以及在应用中集成 AI 这两方面，为开发者社区提供最好的支持。
- **AI 开发**：团队将继续与 Google AI Studio、Gemini CLI 等工具，以及 Antigravity 这类智能体 IDE（Agentic IDE）等其他智能体工具开展有意义的集成。我们计划推出与快速演进的行业保持同步的解决方案，例如智能体技能（agent skills）、新的 MCP 特性和 AI SDK。
- **代码生成**：[根据我们的研究](https://blog.angular.dev/beyond-the-horizon-how-angular-is-embracing-ai-for-next-gen-apps-7a7ed706e1a3)，借助现代大语言模型（LLM），Angular 的代码生成质量已经很高。我们将继续投入改进 Angular 的代码生成。这意味着我们会定期使用当前的模型评估代码生成质量，并通过系统指令、文档以及有针对性的框架改动来加以提升。
- **AI 驱动的体验**：动态 UI 生成等新概念为 Angular 开发者开辟了新的探索领域。我们已从为 A2UI 构建 Angular 支持着手，并积极寻找更多支持现代应用体验的机会。


## 改善 Angular 开发者体验

### 开发速度

- **编译器**：在过去一年里，Microsoft 一直在把 TypeScript 编译器移植到 Go，有望让常规 TypeScript 编译提速 5 - 10 倍。Angular 可能是与 TypeScript 编译器集成最深的项目之一，因此需要进行较大的架构调整，才能让编译器和语言服务都支持基于 tsgo 的新工作流。我们正在制作原型并探索这种支持的具体形态，并将交付一个与 tsgo 兼容的 Angular 编译器，把 Microsoft 原生移植带来的性能优势引入 Angular 生态。
- **增强生态兼容性**：开发者正在把 AI 生成的代码与手写代码混合使用，并希望利用流行的库、快速集成新的体验。Angular 希望能很好地融入这一生态——开发者应该能够使用自己喜爱的工具，并根据需求自由组合不同的框架。作为该项目的一部分，我们将探索跨框架互操作的需求空间以及我们的构建工具，以提升兼容性。
- **组件**：在 Angular v21 中，我们以开发者预览版的形式推出了 Angular Aria，提供了八种用于构建无障碍、无头（headless）组件的模式。在 Angular v22 中，我们将 Angular Aria 提升为稳定版，并计划在需要时引入新的模式。我们希望为开发者提供坚实的基础，让他们使用 Angular Aria 开发自己的组件——我们提供交互，你来提供契合自己设计系统的样式。开发者可以选择使用 Angular Aria 开发自定义组件，使用 CDK 中的交互模式，或者使用现成的、带样式的 Material 组件。在无障碍方面，我们持续依据 WCAG 等无障碍标准评估这些组件和模式，并着手修复在此过程中发现的问题。


### 改进工具

- **使用 ng test 实现单元测试工具现代化**：随着 Vitest 在 Angular v21 中发布稳定版，它现在已成为我们的主要测试运行器。我们目前专注于把实验性的 Karma 到 Vitest 迁移工具提升为稳定版，同时研究新特性，以进一步完善和改进开发者的测试工作流。


## 已完成的项目

- [**信号表单**](/guide/forms/signals/overview)：信号表单现已稳定。这种新方式让开发者可以使用信号（Signal）来管理表单状态，带来符合人体工学的表单创建体验。我们将信号表单提升为稳定版，并增强了它与响应式表单（Reactive Forms）的互操作性——让团队能够按照自己的节奏逐步迁移大型表单。
- [**响应式**](/guide/signals)：我们引入了新的信号 API `resource()` 和 `httpResource()`，用于灵活地处理异步数据。我们已将这些 API 提升为开发者稳定版。
- [**变更检测**](https://angular.dev/api/core/ChangeDetectionStrategy)：随着无 Zone 模式变为稳定且成为默认设置，我们将默认的变更检测（Change Detection）策略设置为 `OnPush`，以符合当前的最佳实践。我们还将 `ChangeDetectionStrategy.Default` 重命名为 `ChangeDetectionStrategy.Eager`。[详情请参阅 RFC 讨论](https://github.com/angular/angular/discussions/66779)。
- **在 Angular DevTools 中调试信号**：我们为使用 Angular DevTools 调试信号添加了更好的工具支持，其中包括一个用于检查和调试信号的新界面。
- [**改进 HMR（模块热替换）**](https://github.com/angular/angular/issues/39367#issuecomment-1439537306)：我们正致力于通过启用模块热替换来加快编辑/刷新循环。在 Angular v19 中，我们发布了对 CSS 和模板 HMR 的初步支持；在 v20 中，模板 HMR 升级为稳定版。在将此项目标记为完成之前，我们会继续收集反馈，确保满足开发者的需求。
- **无 Zone 的 Angular**：在 v18 中，我们在 Angular 中发布了实验性的无 Zone 支持。它让开发者可以在不把 zone.js 打包进应用的情况下使用框架，从而提升性能、调试体验和互操作性。作为初始版本的一部分，我们还为 Angular CDK 和 Angular Material 引入了无 Zone 支持。在 v19 中，我们在服务端渲染中引入了无 Zone 支持，处理了一些边缘情况，并创建了一个用于搭建无 Zone 项目的原理图（Schematic）。我们将 <a href="https://fonts.google.com/" target="_blank">Google Fonts</a> 迁移到了无 Zone 模式，这提升了性能和开发者体验，也让我们发现了在将该特性推进到开发者预览版之前需要弥补的不足。从 Angular v20.2 起，无 Zone 的 Angular 已经稳定，并在错误处理和服务端渲染方面做了改进。
- **服务端路由配置**：我们正致力于在服务端提供更符合人体工学的路由配置。我们希望让声明哪些路由应进行服务端渲染、预渲染或客户端渲染变得轻而易举。在 Angular v19 中，我们发布了路由级渲染模式的开发者预览版，它允许你细粒度地配置希望 Angular 对哪些路由进行预渲染、服务端渲染或客户端渲染。在 Angular v20 中，我们将其升级为稳定版。
- **启用增量水合**：在 v17 中，水合（Hydration）结束了开发者预览阶段，此后我们持续观察到 LCP 有 40-50% 的提升。随后我们开始制作增量水合的原型，并在 ng-conf 的舞台上分享了演示。在 v19 中，我们以开发者预览模式发布了由 `@defer` 块驱动的增量水合。在 Angular v20 中，我们将其升级为稳定版！
- [**交付 Angular 信号**](https://github.com/angular/angular/discussions/49685)：该项目通过引入信号作为响应式原语，重新思考了 Angular 的响应式模型。最初的规划工作带来了数百次讨论、与开发者的交流、反馈会议、用户体验研究，以及一系列收到了 1,000 多条评论的 RFC。在 Angular v20 中，我们将所有基础响应式原语升级为稳定版，包括 signal、effect、linkedSignal、基于信号的查询以及输入属性。
- [**支持二维拖放**](https://github.com/angular/components/issues/13372)：作为该项目的一部分，我们为 Angular CDK 的拖放功能实现了混合方向支持。这是该仓库中呼声最高的特性之一。
- [**SSR 和预渲染中的事件重放**](https://angular.dev/api/platform-browser/withEventReplay)：在 v18 中，我们为使用服务端渲染或预渲染的场景引入了事件重放功能。该特性依赖于运行在 Google.com 上的事件分发原语（以前称为 jsaction）。在 Angular v19 中，我们将事件重放升级为稳定版，并在所有新项目中默认启用。
- **将 Angular 语言服务与原理图集成**：为了让开发者更方便地使用现代 Angular API，我们实现了 Angular 语言服务与原理图之间的集成，让你只需单击一次即可重构应用。
- **借助语言服务简化独立导入**：作为这项计划的一部分，语言服务会在独立应用和基于 NgModule 的应用中自动导入组件（Component）和管道（Pipe）。此外，我们还添加了一项模板诊断，用于高亮独立组件（Standalone Component）中未使用的导入，这有助于减小应用的打包体积。
- **局部模板变量**：我们已在 Angular 中发布了对局部模板变量的支持，更多信息请参阅 [`@let`](https://angular.dev/api/core/@let)。
- [**扩展 Angular Material 的可定制性**](https://material.angular.dev/guide/theming)：为了更好地定制 Angular Material 组件并启用 Material 3 的能力，我们将与 Google 的 Material Design 团队合作，定义基于令牌（token）的主题 API。在 v17.2 中，我们提供了 Angular Material 3 的实验性支持；在 v18 中，我们将其升级为稳定版。
- [**引入延迟加载**](/guide/templates/defer)：在 v17 中，我们以开发者预览版的形式发布了可延迟视图（Deferrable Views），它为延迟加载代码提供了符合人体工学的 API。在 v18 中，我们为库开发者启用了可延迟视图，并将该 API 升级为稳定版。
- **Angular DevTools 支持 iframe**：我们支持对嵌入在页面 iframe 中的 Angular 应用进行调试和性能分析。
- [**将现有混合渲染项目自动迁移到 esbuild 和 vite**](/tools/cli/build-system-migration)：在 v17 中，我们发布了基于 vite 和 esbuild 的应用构建器，并在新项目中默认启用。对于使用混合渲染的项目，它能将构建时间缩短多达 87%。在 v18 中，我们发布了原理图和指南，用于将使用混合渲染的现有项目迁移到新的构建管道。
- [**让 Angular.dev 成为 Angular 开发者的官方主页**](https://goo.gle/angular-dot-dev)：Angular.dev 是 Angular 开发的新站点、新域名和新家园。新站点包含更新后的文档、教程和指南，帮助开发者使用 Angular 的最新特性进行构建。
- [**引入内置控制流**](/guide/templates/control-flow)：在 v17 中，我们发布了新控制流的开发者预览版。它带来了显著的性能提升，也让模板编写更符合人体工学。我们还提供了针对现有 `*ngIf`、`*ngFor` 和 `*ngSwitch` 的迁移，你可以运行它把项目迁移到新的实现。从 v18 起，内置控制流已经稳定。
- **更新入门教程**：在过去两个季度里，我们基于独立组件开发了新的[视频](https://www.youtube.com/watch?v=xAT0lHYhHMY&list=PL1w1q3fL4pmj9k1FrJ3Pe91EPub2_h4jF)教程和[图文](/tutorials/learn-angular)教程。
- [**调研现代打包工具**](/guide/hydration)：在 Angular v16 中，我们发布了基于 esbuild 的构建器的开发者预览版，支持 `ng build` 和 `ng serve`。`ng serve` 开发服务器使用 Vite，并由 esbuild 和 Angular 编译器进行多文件编译。在 v17 中，该构建工具结束了开发者预览阶段，并在新项目中默认启用。
- [**引入依赖注入调试 API**](/tools/devtools)：为了改进 Angular 和 Angular DevTools 的调试工具，我们将开发能够访问依赖注入（Dependency Injection）运行时的 API。作为该项目的一部分，我们将公开一些调试方法，用于探索注入器（Injector）层次结构以及各个依赖与其关联提供者（Provider）之间的关系。从 v17 起，我们发布了一项可以接入依赖注入生命周期的特性。我们还推出了注入器树的可视化功能，以及对每个节点中声明的提供者的检查功能，
- [**改进独立组件的文档和原理图**](/essentials/components)：我们发布了 `ng new --standalone` 原理图集合的开发者预览版，让你可以创建不依赖 NgModule 的应用。在 v17 中，我们将新应用的编写格式切换为独立 API，并更新了文档以体现这一推荐做法。此外，我们还发布了一些原理图，支持将现有应用更新为独立的组件、指令（Directive）和管道。虽然 NgModule 在可预见的未来仍会保留，但我们建议你探索新 API 的优势，以改善开发者体验，并享受我们为其构建的新特性。
- **探索水合和服务端渲染的改进**：在 v16 中，我们发布了非破坏性完整水合的开发者预览版，更多信息请参阅[水合指南](/guide/hydration)和[博客文章](https://blog.angular.dev/whats-next-for-server-side-rendering-in-angular-2a6f27662b67)。我们已经看到 Core Web Vitals 有了显著改善，包括 [LCP](https://web.dev/lcp) 和 [CLS](https://web.dev/cls)。在实验室测试中，我们持续观察到一个真实应用的 LCP 提升了 45%。在 v17 中，水合结束了开发者预览阶段，我们还对服务端渲染做了一系列改进，包括：在运行时为 SSG 发现路由、混合渲染应用的构建时间最多加快 87%，以及在新项目中提示启用混合渲染。
- [**非破坏性的完整应用水合**](/guide/hydration)：在 v16 中，我们发布了非破坏性完整水合的开发者预览版，它让 Angular 能够复用服务端渲染页面上已有的 DOM 节点，而不必从头重新创建应用。更多信息请参阅水合指南。
- [**改进图片指令**](/guide/image-optimization)：我们在 v15 中发布了稳定版的 Angular 图片指令。我们引入了一种新的填充模式特性，让图片能够适应其父容器，而无需指定明确的尺寸。在过去两个月里，Chrome Aurora 团队已将该指令向后移植到 v12 及更高版本。
- [**文档重构**](https://angular.io)：确保所有现有文档都归入一套一致的内容类型。将过度使用的教程式文档改写为独立的主题。我们希望确保主教程之外的内容能够自成一体，而不与一系列指南紧密耦合。在 2022 年第二季度，我们重构了模板相关内容和依赖注入相关内容。在 2023 年第一季度，我们改进了 HTTP 指南，至此我们暂停了文档重构项目。
- [**提升图片性能**](/guide/image-optimization)：Aurora 团队和 Angular 团队正在合作实现一个旨在改善 Core Web Vitals 的图片指令。我们在 v15 中发布了该图片指令的稳定版。
- [**现代 CSS**](https://blog.angular.dev/modern-css-in-angular-layouts-4a259dca9127)：Web 生态在不断演进，我们希望在 Angular 中体现最新的现代标准。在这个项目中，我们旨在提供在 Angular 中使用现代 CSS 特性的指南，确保开发者在布局、样式等方面遵循最佳实践。我们发布了关于布局的官方指南，并作为这项计划的一部分停止发布 flex layout。
- [**支持向宿主元素添加指令**](/guide/directives/directive-composition-api)：向宿主元素添加指令是一个由来已久的特性请求。该特性让开发者无需使用继承，就能为自己的组件增加额外的行为。在 v15 中，我们发布了指令组合 API，可以用指令来增强宿主元素。
- [**更好的堆栈跟踪**](https://developer.chrome.com/blog/devtools-better-angular-debugging/)：Angular 团队和 Chrome DevTools 团队正在合作，让错误消息的堆栈跟踪更具可读性。在 v15 中，我们发布了改进后的相关堆栈跟踪和关联堆栈跟踪。作为一项优先级较低的计划，我们将探索如何为模板提供更准确的调用帧名称，让堆栈跟踪更加友好。
- [**通过集成 MDC Web 增强 Angular Material 组件**](https://material.angular.dev/guide/mdc-migration)：MDC Web 是由 Google Material Design 团队创建的一个库，为构建 Material Design 组件提供可复用的原语。Angular 团队正在将这些原语整合到 Angular Material 中。使用 MDC Web 能让 Angular Material 更贴近 Material Design 规范、扩展无障碍支持、提升组件质量，并提高我们团队的开发速度。
- [**实现可选 NgModule 的 API**](https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8)：为了让 Angular 更简单，我们正在引入一些 API，让开发者无需 NgModule 就能初始化应用、实例化组件和使用路由（Router）。Angular v14 引入了独立组件、指令和管道 API 的开发者预览版。在接下来的几个季度里，我们将收集开发者的反馈并完成该项目，使这些 API 稳定下来。下一步，我们将改进 TestBed、Angular elements 等使用场景。
- [**允许在模板中绑定受保护字段**](/guide/templates/binding)：为了改进 Angular 组件的封装性，我们支持绑定组件实例的受保护（protected）成员。这样，你就不必再为了在模板（Template）中使用某个字段或方法而将其公开为 public。
- [**发布高级概念指南**](https://angular.io/guide/change-detection)：编写并发布一份深入的变更检测指南。编写有关 Angular 应用性能分析的内容。介绍变更检测如何与 Zone.js 交互，解释它何时被触发、如何分析其耗时，以及常见的性能优化实践。
- [**为 @angular/forms 推出严格类型**](/guide/forms/typed-forms)：在 2021 年第四季度，我们设计了为表单引入严格类型的方案，并在 2022 年第一季度完成了相应的征求意见（RFC）。目前，我们正在实施一项带有自动迁移步骤的推广策略，让现有项目也能享受到这些改进。我们首先在 Google 内部的 2,500 多个项目中测试该方案，以确保为外部社区提供平滑的迁移路径。
- [**移除旧版 View Engine**](https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8)：在我们所有的内部工具都完成向 Ivy 的过渡之后，我们将移除旧版 View Engine，以减少 Angular 的概念负担、缩小包体积、降低维护成本并降低代码库的复杂度。
- [**通过可选 NgModule 简化 Angular 的心智模型**](https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8)：为了简化 Angular 的心智模型和学习路径，我们将致力于让 NgModule 变为可选。这项工作让开发者可以开发独立组件，并实现一种用于声明组件编译作用域的替代 API。我们以高层设计讨论启动了该项目，并将讨论内容整理成了一份 RFC。
- [**为 @angular/forms 设计严格类型**](/guide/forms/typed-forms)：我们将设法为响应式表单实现更严格的类型检查，同时尽量减少向后不兼容的影响。这样，开发者可以在开发阶段发现更多问题，获得更好的文本编辑器和 IDE 支持，并改进响应式表单的类型检查。
- [**改进 Angular DevTools 与框架的集成**](/tools/devtools)：为了改进 Angular DevTools 与框架的集成，我们正在把其代码库迁移到 angular/angular 单体仓库中。这包括将 Angular DevTools 迁移到 Bazel，并将其纳入现有的流程和 CI 管道。
- [**推出高级编译器诊断**](/extended-diagnostics)：将 Angular 编译器的诊断扩展到类型检查之外。引入其他正确性和一致性检查，以进一步保证代码正确并遵循最佳实践。
- [**更新我们的端到端测试策略**](/guide/testing)：为了确保提供面向未来的端到端（e2e）测试策略，我们希望评估 Protractor 的现状、社区创新、端到端测试最佳实践，并探索新的机会。作为这项工作的第一步，我们发布了一份 RFC，并与合作伙伴一起确保 Angular CLI 与最先进的端到端测试工具能够顺畅集成。下一步，我们需要最终确定建议方案，并整理一份迁移相关的资源列表。
- [**Angular 库使用 Ivy**](/tools/libraries)：2020 年早些时候，我们发布了一份关于 Ivy 库分发的 RFC。在收到社区的宝贵反馈后，我们完成了该项目的设计。我们现在正投入开发 Ivy 库分发，包括更新库的包格式以使用 Ivy 编译，为弃用 View Engine 库格式和 ngcc 扫清障碍。
- [**通过自动拆除测试环境改进测试时间和调试**](/guide/testing)：为了缩短测试时间并在测试之间实现更好的隔离，我们希望修改 TestBed，使其在每次测试运行后自动清理并拆除测试环境。
- [**弃用并移除对 IE11 的支持**](https://github.com/angular/angular/issues/41840)：Internet Explorer 11（IE11）一直阻碍着 Angular 利用 Web 平台的一些现代特性。作为该项目的一部分，我们将弃用并移除对 IE11 的支持，为常青浏览器所提供的现代特性铺平道路。我们发起了一份 RFC 来收集社区的反馈，并决定后续的推进步骤。
- [**以 ES2017+ 作为默认输出语言**](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)：支持现代浏览器让我们可以利用 JavaScript 更紧凑、更具表现力、性能更好的新语法。作为该项目的一部分，我们将调查推进这项工作有哪些障碍，并采取措施实现它。
- [**使用 Angular DevTools 加速调试和性能分析**](/tools/devtools)：我们正在为 Angular 开发提供调试和性能分析功能的开发工具。该项目旨在帮助开发者理解 Angular 应用中的组件结构和变更检测。
- [**通过统一 Angular 版本管理和分支策略来简化发布**](/reference/releases)：我们希望统一 Angular 多个 GitHub 仓库（angular/angular、angular/angular-cli 和 angular/components）之间的发布管理工具。这项工作让我们可以复用基础设施、统一和简化流程，并提高发布流程的可靠性。
- [**通过标准化提交消息提升开发一致性**](https://github.com/angular/angular)：我们希望统一 Angular 各仓库（angular/angular、angular/components 和 angular/angular-cli）的提交消息要求与合规检查，让开发流程保持一致，并复用基础设施工具。
- [**将 Angular 语言服务迁移到 Ivy**](/tools/language-service)：该项目的目标是通过将语言服务迁移到 Ivy 来改善体验并移除旧有依赖。目前，即使是 Ivy 应用，语言服务仍在使用 View Engine 编译器和类型检查。我们希望 Angular 语言服务使用 Ivy 模板解析器和改进后的类型检查，以与应用的实际行为保持一致。这次迁移也是为移除 View Engine 扫清障碍的一步，移除 View Engine 将简化 Angular、减小 npm 包体积，并提高框架的可维护性。
- [**通过 Angular 原生支持 Trusted Types 提升安全性**](/best-practices/security)：我们正在与 Google 安全团队合作，添加对新的 Trusted Types API 的支持。这个 Web 平台 API 可以帮助开发者构建更安全的 Web 应用。
- [**通过 Angular CLI 的 webpack 5 优化构建速度和包体积**](/tools/cli/build)：在 v11 版本中，我们在 Angular CLI 中引入了可选启用的 webpack 5 预览版。为了确保稳定性，我们将继续迭代该实现，以提升构建速度并减小包体积。
- [**通过在 Universal 应用中内联关键样式让应用更快**](/guide/ssr)：加载外部样式表是一个阻塞操作，这意味着浏览器在加载完所有引用的 CSS 之前无法开始渲染你的应用。在页面头部放置阻塞渲染的资源会显著影响页面的加载性能，例如首次内容绘制（First Contentful Paint）。为了让应用更快，我们一直在与 Google Chrome 团队合作，内联关键 CSS 并异步加载其余样式。
- [**通过更好的 Angular 错误消息改进调试**](/errors)：错误消息通常只提供有限的、可据以采取行动的信息来帮助开发者解决问题。我们一直在努力让错误消息更容易查找，为其添加相关错误码、编写指南和其他材料，以确保更顺畅的调试体验。
- [**通过更新入门文档改进开发者上手体验**](/tutorials)：我们将重新定义用户的学习路径，并更新入门文档。我们会清楚地说明 Angular 的优势、如何探索它的能力，并提供指导，让开发者能在尽可能短的时间内熟练掌握该框架。
- [**扩展组件测试工具（harness）的最佳实践**](https://material.angular.dev/guide/using-component-harnesses)：Angular CDK 在版本 9 中为 Angular 引入了组件测试工具（component test harness）的概念。测试工具让组件作者可以创建受支持的 API，用于测试组件交互。我们正在继续改进这套测试工具基础设施，并阐明使用测试工具的最佳实践。我们也在推动 Google 内部更多地采用测试工具。
- [**编写内容投影指南**](https://angular.io/docs)：内容投影是 Angular 的一个核心概念，但它在文档中并没有得到应有的重视。作为该项目的一部分，我们希望梳理内容投影的核心用例和概念，并编写相应的文档。
- [**迁移到 ESLint**](/tools/cli)：随着 TSLint 被弃用，我们将转向 ESLint。在此过程中，我们将确保与当前推荐的 TSLint 配置向后兼容，为现有 Angular 应用实施迁移策略，并在 Angular CLI 工具链中引入新的工具。
- [**清理积压行动（Operation Bye Bye Backlog，又称 Operation Byelog）**](https://github.com/angular/angular/issues)：在清楚了解更广泛的社区需求之前，我们会积极投入多达 50% 的工程资源来分类处理 issue 和 PR。之后，我们将投入多达 20% 的工程资源，及时跟进新的提交。

