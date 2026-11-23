# 使用 Chrome DevTools 进行性能分析 {#profiling-with-the-chrome-devtools}

Angular 集成了 [Chrome DevTools 扩展 API](https://developer.chrome.com/docs/devtools/performance/extension)，可以直接在 [Chrome DevTools 性能面板](https://developer.chrome.com/docs/devtools/performance/overview)中展示框架专有的数据和洞察。

启用这项集成后，你可以[录制一份性能分析记录](https://developer.chrome.com/docs/devtools/performance#record)，其中包含两组数据：

- 标准的性能条目，基于 Chrome 对浏览器中所执行代码的理解；以及
- 由框架运行时提供的 Angular 专有条目。

这两组数据会在同一个标签页中一起展示，但位于不同的轨道上：

<img alt="Angular custom track in Chrome DevTools profiler" src="/assets/images/best-practices/runtime-performance/angular-perf-in-chrome.png">

Angular 专有的数据是用框架的概念（组件、变更检测、生命周期钩子等）来表达的，与浏览器捕获的更底层的函数和方法调用并列展示。这两组数据相互关联，你可以在不同的视图和详细程度之间切换。

你可以借助 Angular 轨道更好地了解代码在浏览器中的运行方式，包括：

- 判断某段代码是否属于 Angular 应用，还是属于同一页面上运行的其他脚本。
- 找出性能瓶颈，并把它们归因到具体的组件或服务。
- 通过对每个变更检测（Change Detection）周期的可视化拆解，更深入地了解 Angular 的内部工作方式。

## 录制性能分析记录 {#recording-a-profile}

### 启用集成 {#enable-integration}

你可以用以下两种方式之一启用 Angular 性能分析：

1. 在 Chrome 的控制台面板中运行 [`ng.enableProfiling()`](https://angular.dev/api/core/enableProfiling)，或者
1. 在应用的启动代码中调用 [`enableProfiling()`](https://angular.dev/api/core/enableProfiling)（从 `@angular/core` 导入）。

::: info 注意
Angular 性能分析只在开发模式下有效。

:::

下面的示例展示了如何在应用启动时启用这项集成，以捕获所有可能的事件：

```ts
import {enableProfiling} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {MyApp} from './my-app';

// 在启动应用*之前*开启性能分析，
// 以便捕获启动时运行的所有代码。
enableProfiling();
bootstrapApplication(MyApp);
```

### 录制 {#record-a-profile}

使用 Chrome DevTools 性能面板中的 **Record** 按钮：

<img alt="Recording a profile" src="/assets/images/best-practices/runtime-performance/recording-profile-in-chrome.png">

有关录制性能分析记录的更多细节，请参阅 [Chrome DevTools 文档](https://developer.chrome.com/docs/devtools/performance#record)。

## 在 Angular DevTools 中打开组件 {#open-a-component-in-angular-devtools}

录制完成后，在 **Angular** 轨道中选择一个组件事件。
**Summary** 标签页中可能会有一个 **Component** 链接，它使用 `angular-devtools://component/...` URL 协议。

<img alt="Chrome DevTools Performance panel showing an Angular custom track with a selected _MainComponent event. The Summary tab displays a Component link that uses the angular-devtools://component URL scheme." src="/assets/images/best-practices/runtime-performance/chrome-performance-deep-link.png">

点击该链接会打开 Angular DevTools，并在 **Components** 标签页中选中对应的组件。
这样你就能从浏览器层面的性能分析记录，直接跳转到所选事件对应组件的状态和元数据。

::: info 注意
打开组件链接需要安装 Chrome 版的 Angular DevTools，并开启 Chrome 的实验性标志 `chrome://flags/#enable-devtools-deep-link-via-extensibility-api`。

:::

## 解读录制的性能分析记录 {#interpreting-a-recorded-profile}

你可以使用「Angular」自定义轨道快速识别和诊断性能问题。下面几节介绍一些常见的性能分析场景。

### 区分 Angular 应用与同一页面上的其他任务 {#differentiating-between-your-angular-application-and-other-tasks-on-the-same-page}

由于 Angular 和 Chrome 的数据展示在彼此独立但相互关联的轨道上，你可以看出哪些时候在执行 Angular 应用代码，哪些时候在进行其他浏览器处理（通常是布局和绘制），或者在运行同一页面上的其他脚本（此时 Angular 自定义轨道上没有任何数据）：

<img alt="Profile data: Angular vs. 3rd party scripts execution" src="/assets/images/best-practices/runtime-performance/profile-angular-vs-3rd-party.png">

这能帮你判断后续的排查应该聚焦于 Angular 应用代码，还是代码库或依赖中的其他部分。

### 颜色编码 {#color-coding}

Angular 在火焰图中用不同颜色区分任务类型：

- 🟦 蓝色表示应用开发者编写的 TypeScript 代码（例如服务、组件构造函数和生命周期钩子等）。
- 🟪 紫色表示应用开发者编写、并经 Angular 编译器转换后的模板代码。
- 🟩 绿色表示进入应用代码的入口点，标明执行代码的*原因*。

下面的例子通过各种真实的录制记录说明这种颜色编码。

#### 示例：应用启动 {#example-application-bootstrapping}

应用启动过程通常包括：

- 以蓝色标记的触发器，例如对 `bootstrapApplication` 的调用、根组件的实例化以及初始变更检测
- 启动期间实例化的各种依赖注入服务，以绿色标记。

<img alt="Profile data: bootstrap application" src="/assets/images/best-practices/runtime-performance/profile-bootstrap-application.png">

#### 示例：组件执行 {#example-component-execution}

一个组件的处理过程通常表现为一个入口点（蓝色），后面跟着它的模板执行（紫色）。模板又可能触发指令的实例化和生命周期钩子的执行（绿色）：

<img alt="Profile data: component processing" src="/assets/images/best-practices/runtime-performance/profile-component-processing.png">

#### 示例：变更检测 {#example-change-detection}

一个变更检测周期通常由一轮或多轮数据同步（蓝色）组成，每一轮都会遍历一部分组件。

<img alt="Profile data: change detection" src="/assets/images/best-practices/runtime-performance/profile-change-detection.png">

借助这种数据可视化，你可以立即看出哪些组件参与了变更检测、哪些被跳过了（通常是没有被标记为脏的 `OnPush` 组件）。

此外，你还可以查看一次变更检测包含多少轮同步。如果超过一轮，就说明在变更检测期间更新了状态。你应该避免这种情况，因为它会拖慢页面更新，在最坏的情况下甚至会导致无限循环。
