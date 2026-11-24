# 模板语法

在 Angular 中，模板（Template）就是一段 HTML。
在模板中使用特殊语法，可以充分利用 Angular 的许多功能。


::: tip 提示
在深入阅读这份全面的指南之前，建议先看看 Angular 的[基础知识](/essentials/templates)。

:::

每个 Angular 组件（Component）都有一个**模板**，它定义了组件渲染到页面上的 [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)。借助模板，Angular 能够在数据变化时自动让页面保持最新。

模板通常位于 `*.ts` 文件的 `template` 属性中，或者位于 `*.html` 文件中。要了解更多，请参阅[组件深入指南](/guide/components)。

## 模板是如何工作的？

模板基于 [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) 语法，并增加了内置模板函数、数据绑定（Binding）、事件监听、变量等功能。

Angular 会把模板编译成 JavaScript，以便在内部理解你的应用。这样做的好处之一是，Angular 会自动为应用施加一些内置的渲染优化。

### 与标准 HTML 的区别

模板和标准 HTML 语法的一些区别包括：

- 模板源码中的注释不会出现在渲染输出中
- 组件和指令元素可以自闭合（例如 `<UserProfile />`）
- 带有特定字符（即 `[]`、`()` 等）的属性对 Angular 有特殊含义。更多信息请参阅[绑定文档](/guide/templates/binding)和[添加事件监听器文档](/guide/templates/event-listeners)。
- `@` 字符对 Angular 有特殊含义，用于为模板添加动态行为，例如[控制流](/guide/templates/control-flow)。你可以把它转义为 HTML 实体编码（`&commat;` 或 `&#64;`），来使用字面量 `@` 字符。
- Angular 会忽略并合并不必要的空白字符。更多细节请参阅[模板中的空白字符](/guide/templates/whitespace)。
- Angular 可能会在页面中添加注释节点，作为动态内容的占位符，开发者可以忽略它们。

此外，虽然大多数 HTML 语法都是有效的模板语法，但 Angular 不支持在模板中使用 `<script>` 元素。更多信息请参阅[安全](/best-practices/security)页面。

## 下一步

你可能还会对以下内容感兴趣：

| 主题                                                                      | 详情                                                                                 |
| :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [绑定动态文本、属性和 attribute](/guide/templates/binding) | 把动态数据绑定到文本、属性和 attribute。                                   |
| [添加事件监听器](/guide/templates/event-listeners)                   | 在模板中响应事件。                                                    |
| [双向绑定](/guide/templates/two-way-binding)                          | 同时绑定一个值并传播变化。                                     |
| [控制流](/guide/templates/control-flow)                                | 有条件地显示、隐藏和重复元素。                                         |
| [管道](/guide/templates/pipes)                                              | 以声明式的方式转换数据。                                                           |
| [使用 ng-content 嵌入子内容](/guide/templates/ng-content)        | 控制组件如何渲染内容。                                                 |
| [使用 ng-template 创建模板片段](/guide/templates/ng-template)   | 声明一个模板片段。                                                            |
| [使用 ng-container 对元素分组](/guide/templates/ng-container)         | 把多个元素组合在一起，或者标记一个渲染位置。                      |
| [模板中的变量](/guide/templates/variables)                         | 了解变量声明。                                                      |
| [使用 @defer 延迟加载](/guide/templates/defer)                       | 使用 `@defer` 创建可延迟视图。                                                  |
| [表达式语法](/guide/templates/expression-syntax)                      | 了解 Angular 表达式与标准 JavaScript 的异同。 |
| [模板中的空白字符](/guide/templates/whitespace)                       | 了解 Angular 如何处理空白字符。                                                   |
