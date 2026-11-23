# 检查路由树

**Router Tree**（路由树）标签页可以让你可视化应用的路由树。你可以浏览路由的嵌套方式，并查看特定路由的详细信息。

<img src="/assets/images/guide/devtools/router-tree.png" alt="A screenshot of the 'Router Tree' tab in Angular DevTools showing a tree of configured routes. The active routes are highlighted in green, while inactive ones are white.">

### 查看路由详情

当你在树中选中某个路由时，Angular DevTools 会在右侧边栏中显示它的属性。这些信息包括：

- **Path**：该路由的 URL 路径。如果路由使用了自定义 URL 匹配器，DevTools 会改为显示 **Matcher**。
- **Component**：该路由所渲染的组件（Component）。如果路由是一个重定向，DevTools 会改为显示 **Redirect to** 目标。
- **Path Match**：路径匹配策略（`prefix` 或 `full`），仅在配置时显示。
- **Data**：与该路由关联的静态数据，以 JSON 树的形式显示。
- **Resolvers**：路由解析器，以键值对的形式显示。
- **Guards**：路由上配置的所有守卫，按类型分组——`canActivate`、`canActivateChild`、`canDeactivate` 和 `canMatch`。
- **Providers**：路由级的提供者（Provider），仅在配置时显示。
- **Title**：路由标题，仅在配置时显示。
- **RunGuardsAndResolvers**：守卫和解析器的重新运行策略，仅在配置时显示。
- **Active**：该路由当前是否处于激活状态。
- **Auxiliary**：表示该路由是否为辅助路由（例如位于具名出口中）。
- **Lazy**：表示该路由是否为延迟加载（Lazy Loading）的。

::: info 注意
Path Match、Data、Resolvers、Guards、Providers、Title 和 RunGuardsAndResolvers 等属性，只有在所选路由上配置了它们时才会出现在侧边栏中。

:::

### 导航到特定路由

你可以直接从 DevTools 中轻松触发导航。在右侧边栏查看路由详情时，点击路径字符串旁边的 **Navigate**（导航）图标，就会让 Angular 路由器（Router）在应用中导航到该 URL。

<img src="/assets/images/guide/devtools/router-tree-navigate.png" alt="A screenshot showing the 'Navigate to' tooltip on the route path in the 'Routes Details' sidebar.">
