# 运行时性能优化 {#runtime-performance-optimization}

快速渲染对 Angular 至关重要，我们在构建这个框架时考虑了大量优化，帮助你开发高性能的应用。为了帮你更好地了解应用的性能，我们提供了 [Angular DevTools](/tools/devtools)，以及一个讲解如何使用 Chrome DevTools 进行性能分析的[视频指南](https://www.youtube.com/watch?v=FjyX_hkscII)。本节介绍最常用的性能优化技巧。

**变更检测（Change Detection）** 是 Angular 检查应用状态是否发生变化、以及是否需要更新 DOM 的过程。从整体上看，Angular 会自上而下遍历你的组件，查找变化。Angular 会周期性地运行变更检测机制，让数据模型的变化反映到应用的视图上。变更检测既可以手动触发，也可以由异步事件触发（例如用户交互或 XMLHttpRequest 完成）。

变更检测经过高度优化，性能很好，但如果应用运行得过于频繁，仍然可能导致变慢。

在本指南中，你将学习如何控制和优化变更检测机制：跳过应用的部分内容，并且只在必要时运行变更检测。

如果你更喜欢通过视频了解性能优化，可以观看这个视频：

<iframe src="https://www.youtube.com/embed/f8sA-i6gkGQ" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>
