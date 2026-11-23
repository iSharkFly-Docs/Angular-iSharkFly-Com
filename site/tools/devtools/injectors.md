# 检查注入器 {#inspect-your-injectors}

::: info 注意
注入器树适用于使用 17 或更高版本构建的 Angular 应用。

:::

## 查看应用的注入器层级 {#view-the-injector-hierarchy-of-your-application}

**Injector Tree**（注入器树）标签页可以让你浏览应用中所配置的注入器（Injector）的结构。在这里你会看到两棵树，它们表示应用的[注入器层级](/guide/di/hierarchical-dependency-injection)。一棵是环境层级，另一棵是元素层级。

<img src="/assets/images/guide/devtools/di-injector-tree.png" alt="A screenshot of the 'Profiler' tab displaying the injector tree tab in Angular Devtools visualizing the injector graph for an example application.">

## 可视化解析路径 {#visualize-resolution-paths}

选中某个注入器后，Angular 依赖注入（Dependency Injection）算法从该注入器到根注入器所遍历的路径会被高亮显示。对于元素注入器，当某个依赖无法在元素层级中解析时，依赖注入算法会跳转到环境注入器，这些环境注入器也会被高亮显示。

关于 Angular 如何确定解析路径的更多详情，请参阅[解析规则](/guide/di/hierarchical-dependency-injection#resolution-rules)。

<img src="/assets/images/guide/devtools/di-injector-tree-selected.png" alt="A screenshot of the 'Profiler' tab displaying how the injector tree visualize highlights resolution paths when an injector is selected.">

## 查看注入器的提供者 {#view-injector-providers}

点击一个配置了提供者（Provider）的注入器后，这些提供者会以列表形式显示在注入器树视图的右侧。你可以在这里查看所提供的令牌及其类型。每个提供者右侧的按钮可以把该提供者输出到控制台中。

<img src="/assets/images/guide/devtools/di-injector-tree-providers.png" alt="A screenshot of the 'Profiler' tab displaying how providers are made visible when an injector is selected.">
