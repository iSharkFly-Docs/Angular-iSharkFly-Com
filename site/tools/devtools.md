# DevTools 概览 {#devtools-overview}

Angular DevTools 是一个浏览器扩展，为 Angular 应用提供调试和性能分析能力。

<iframe src="https://www.youtube.com/embed/bavWOHZM6zE" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

你可以从 [Chrome 网上应用店](https://chrome.google.com/webstore/detail/angular-developer-tools/ienfalfjdbdpebioblfackkekamfmbnh)或 [Firefox 附加组件](https://addons.mozilla.org/firefox/addon/angular-devtools/)安装 Angular DevTools。

在任意网页上，你都可以按 <kbd>F12</kbd> 或 <kbd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd></kbd>（Windows 或 Linux），以及 <kbd><kbd>Fn</kbd>+<kbd>F12</kbd></kbd> 或 <kbd><kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>I</kbd></kbd>（Mac）打开 Chrome 或 Firefox 的开发者工具。
打开浏览器开发者工具并安装 Angular DevTools 后，就可以在 "Angular" 标签页中找到它。

::: tip 提示
Chrome 的新标签页不会运行已安装的扩展，因此开发者工具中不会出现 Angular 标签页。访问任意其他页面即可看到它。

:::

<img src="/assets/images/guide/devtools/devtools.png" alt="An overview of Angular DevTools showing a tree of components for an application.">

## 打开你的应用 {#open-your-application}

打开该扩展后，你会看到四个额外的标签页：

| 标签页                                     | 详情                                                                                                                   |
| :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [Components](/tools/devtools/component)    | 浏览应用中的组件（Component）和指令（Directive），并预览或编辑它们的状态。                                             |
| [Profiler](/tools/devtools/profiler)       | 对应用进行性能分析，了解变更检测（Change Detection）执行期间的性能瓶颈在哪里。                                         |
| [Injector Tree](/tools/devtools/injectors) | 可视化环境注入器（Environment Injector）和元素注入器（Element Injector）的层级结构                                     |
| [Router Tree](/tools/devtools/router)      | 可视化应用的路由树。                                                                                                   |

当应用使用水合（Hydration）时，还会出现一个 `Transfer State` 标签页。

::: tip 提示
如果你使用的是基于 Chromium 的浏览器，可能会对 [Performance 面板集成](/best-practices/profiling-with-chrome-devtools)感兴趣。

:::

<img src="/assets/images/guide/devtools/devtools-tabs.png" alt="A screenshot of the top of Angular DevTools illustrating two tabs in the upper-left corner, one labeled 'Components' and another labeled 'Profiler'.">

在 Angular DevTools 的右上角，有一个信息按钮，点击后会打开一个弹出框。
该弹出框中包含页面上运行的 Angular 版本以及 DevTools 的版本等信息。

### Angular application not detected（未检测到 Angular 应用） {#angular-application-not-detected}

如果打开 Angular DevTools 时看到错误消息 "Angular application not detected"，说明它无法与页面上的 Angular 应用通信。
最常见的原因是你正在检查的网页并不包含 Angular 应用。
请仔细确认你检查的是正确的网页，并且 Angular 应用正在运行。

### We detected an application built with production configuration（检测到使用生产配置构建的应用） {#we-detected-an-application-built-with-production-configuration}

如果你看到错误消息 "We detected an application built with production configuration. Angular DevTools only supports development builds."，说明页面上找到了 Angular 应用，但它是使用生产优化编译的。
在为生产环境编译时，Angular CLI 会移除各种调试功能，以尽量减少页面上的 JavaScript 体积、提升性能，其中就包括与 DevTools 通信所需的功能。

要运行 DevTools，你需要在禁用优化的情况下编译应用。`ng serve` 默认就是这样做的。
如果需要调试已部署的应用，请通过 [`optimization` 配置项](/reference/configs/workspace-config#optimization-configuration)（`{"optimization": false}`）在构建中禁用优化。
