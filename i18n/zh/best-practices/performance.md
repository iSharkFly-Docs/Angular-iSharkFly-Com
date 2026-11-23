# 性能

Angular 开箱即用地内置了许多优化，但随着应用规模增长，你可能需要同时调优应用的加载速度和使用过程中的响应速度。这些指南介绍了 Angular 提供的工具和技巧，帮助你构建快速的应用。

## 加载性能

加载性能决定了应用多快能变得可见、可交互。加载缓慢会直接影响 [Core Web Vitals](https://web.dev/vitals/) 指标，例如最大内容绘制（LCP）和首字节时间（TTFB）。

| 技巧 | 作用 | 适用场景 |
| :--- | :--- | :--- |
| [延迟加载路由](/best-practices/performance/lazy-loaded-routes#lazily-loaded-components-and-routes) | 推迟到导航时才加载路由组件，减小初始包的体积 | 有多个路由、且初始加载时并不需要全部路由的应用 |
| [使用 `@defer` 延迟加载](/best-practices/performance/defer) | 把组件拆分到单独的包中，按需加载 | 初始渲染时不可见的组件、重量级第三方库、首屏以下的内容 |
| [使用 `injectAsync` 延迟加载服务](/guide/di/lazy-loading-services) | 把很少使用的服务拆分到单独的代码块中，按需加载 | 依赖大型库的服务，或不常用的功能 |
| [图片优化](/best-practices/performance/image-optimization) | 优先加载 LCP 图片，延迟加载其他图片，生成响应式的 `srcset` 属性 | 任何显示图片的应用 |
| [服务端渲染](/best-practices/performance/ssr) | 在服务器上渲染页面，加快首次绘制并改善 SEO；通过[水合](/guide/hydration)恢复交互能力，通过[增量水合](/guide/incremental-hydration)把部分区域的水合推迟到需要时 | 内容密集型应用、需要被搜索引擎收录的页面 |

## 运行时性能

运行时性能决定了应用加载完成之后的响应速度。Angular 的变更检测（Change Detection）系统负责让 DOM 与数据保持同步，而优化它的运行方式和运行时机，是提升运行时性能的主要手段。

| 技巧 | 作用 | 适用场景 |
| :--- | :--- | :--- |
| [无 Zone 变更检测](/guide/zoneless) | 去掉 ZoneJS 的开销，只在信号或事件表明发生了变化时才触发变更检测 | 新应用（Angular v21+ 的默认设置），或准备迁移的现有应用 |
| [缓慢的计算](/best-practices/slow-computations) | 识别并优化开销大的模板表达式和生命周期钩子 | 性能分析显示某些组件导致变更检测周期变慢 |
| [跳过组件子树](/best-practices/skipping-subtrees) | 使用 `OnPush` 变更检测跳过没有变化的组件树 | 需要更精细地控制变更检测的应用 |
| [Zone 污染](/best-practices/zone-pollution) | 防止第三方库或定时器引起不必要的变更检测 | 性能分析显示变更检测周期过多的基于 Zone 的应用 |

## 衡量性能

找出要优化什么，和知道如何优化同样重要。Angular 集成了浏览器开发者工具，帮助你找到瓶颈。

| 工具 | 作用 |
| :--- | :--- |
| [Chrome DevTools 性能分析](/best-practices/profiling-with-chrome-devtools) | 在浏览器性能分析的同时记录 Angular 专有的性能数据，用颜色区分的火焰图展示组件渲染、变更检测周期和生命周期钩子 |
| [Angular DevTools](/tools/devtools) | 一个浏览器扩展，提供组件树检查器，以及用于可视化变更检测周期的性能分析器 |

## 先优化什么

如果你不确定从哪里入手，可以先使用 [Chrome DevTools 的 Angular 轨道](/best-practices/profiling-with-chrome-devtools)分析应用，找出具体的瓶颈。

一般可以从这里开始：

- **初始加载慢**：使用 [`@defer`](/best-practices/performance/defer) 把大型组件从主包中拆出去，使用 [`NgOptimizedImage`](/best-practices/performance/image-optimization) 优先加载首屏图片，并使用[服务端渲染](/best-practices/performance/ssr)更快地交付内容。
- **加载后交互慢**：检查是否启用了[无 Zone 变更检测](/guide/zoneless)，查找模板或生命周期钩子中[缓慢的计算](/best-practices/slow-computations)，并考虑使用 [`OnPush`](/best-practices/skipping-subtrees) 减少不必要的变更检测。
