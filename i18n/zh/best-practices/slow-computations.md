# 缓慢的计算

在每个变更检测（Change Detection）周期中，Angular 会同步地：

- 根据每个组件的检测策略，计算所有组件中的所有模板表达式（另有指定的除外）
- 执行 `ngDoCheck`、`ngAfterContentChecked`、`ngAfterViewChecked` 和 `ngOnChanges` 生命周期钩子（Lifecycle Hook）。
  由于 Angular 是按顺序执行这些计算的，模板或生命周期钩子中只要有一个缓慢的计算，就会拖慢整个变更检测过程。

## 识别缓慢的计算

你可以用 Angular DevTools 的性能分析器找出繁重的计算。在性能时间线中，点击某个柱条即可预览对应的变更检测周期。这会显示一个柱状图，展示框架在每个组件的变更检测上花了多长时间。点击某个组件后，你可以看到 Angular 计算它的模板和生命周期钩子分别花了多长时间。

<img alt="Angular DevTools profiler preview showing slow computation" src="/assets/images/best-practices/runtime-performance/slow-computations.png">

例如，在上面的截图中，选中的是记录下来的第二个变更检测周期。Angular 在这个周期上花了超过 573 毫秒，其中大部分时间花在 `EmployeeListComponent` 上。在详情面板中可以看到，Angular 计算 `EmployeeListComponent` 的模板花了超过 297 毫秒。

## 优化缓慢的计算

下面几种技巧可以消除缓慢的计算：

- **优化底层算法**。这是推荐的做法。如果你能加快导致问题的算法，就能加快整个变更检测机制。
- **使用纯管道进行缓存**。你可以把繁重的计算移到纯[管道（Pipe）](/guide/templates/pipes)中。只有当 Angular 检测到纯管道的输入与上一次调用时相比发生了变化，才会重新计算它。
- **使用记忆化**。[记忆化（Memoization）](https://en.wikipedia.org/wiki/Memoization)与纯管道类似，区别在于纯管道只保留上一次计算的结果，而记忆化可以存储多个结果。
- **避免在生命周期钩子中触发重绘/回流**。某些[操作](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing/)会让浏览器同步地重新计算页面布局或重新渲染页面。回流和重绘通常都很慢，所以应该避免在每个变更检测周期中执行它们。

纯管道和记忆化各有取舍。纯管道是 Angular 内置的概念，而记忆化是一种缓存函数结果的通用软件工程实践。如果你频繁地用不同参数调用繁重的计算，记忆化带来的内存开销可能会相当大。
