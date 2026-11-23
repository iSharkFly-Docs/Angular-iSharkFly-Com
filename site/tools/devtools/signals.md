# 调试信号图 {#debug-the-signal-graph}

**Components** 标签页可以为选中的组件（Component）或指令（Directive）显示实时的信号图。
信号图展示了该组件中的信号（Signal）、计算信号（Computed）、副作用（Effect）以及其他响应式节点之间的依赖关系，帮助你更轻松地理解和调试响应式数据流。

<img src="/assets/images/guide/devtools/signal-graph.png" alt="A screenshot of the 'Components' tab in Angular DevTools with the signal graph open for the selected component. The graph shows a signal node connected by edges to three computed nodes which the component's template reads, and the properties of the component are listed in a sidebar to the right.">

## 打开信号图 {#open-the-signal-graph}

在 **Components** 标签页中，选择一个组件或指令。
在属性面板的标题栏中，点击 **Show Signal Graph**。
信号图会在组件树旁边打开。

你也可以直接跳转到某个特定信号：在属性视图中，点击属性旁边的信号图按钮；如果该属性有多个操作，则打开它的操作菜单并选择 **Show in signal graph**。

当被检查的应用支持信号图 API 时，**Show Signal Graph** 按钮会自动出现，无需任何设置来启用。

## 阅读信号图 {#read-the-graph}

图中的节点代表参与所选组件的响应式节点：

- **Signal**：用 `signal()` 创建的可写信号。
- **Computed**：用 `computed()` 创建的派生值。
- **Effect**：用 `effect()` 或 `afterRenderEffect()` 创建的副作用。
- **Linked signal**：用 `linkedSignal()` 创建的可写信号。
- **Template**：组件的模板（Template），它在渲染时会读取信号。
- **Resource**：属于 `resource()` 或 `rxResource()` 的信号会被归为一个可折叠的分组。点击分组节点上的 **Expand** 即可查看其中的各个节点。

节点之间的连线表示响应式依赖：每个节点都会连接到它所读取的生产者（上游）以及读取它的依赖者（下游）。

::: tip 提示
节点以其响应式节点的 `debugName` 作为标签。为你的信号、计算信号，尤其是副作用（它们通常不会被赋值给类成员）设置 `debugName`，可以让信号图更易于阅读：

:::

```ts
effect(
  () => {
    // ...
  },
  {debugName: 'name in graph'},
);
```

## 搜索信号图 {#search-the-graph}

点击信号图工具栏中的搜索图标，即可按名称查找节点。
Angular DevTools 会高亮所有匹配项，并允许你逐个浏览。

## 检查节点 {#inspect-a-node}

点击某个节点即可打开它的详情面板，其中以可展开树的形式显示该节点的当前值，并提供以下操作：

- **View source**：在 Sources 标签页（Chrome）或 Debugger 标签页（Firefox）中跳转到该节点的定义处。当源码位置不可用时，此操作会被禁用。
- **Set breakpoint**：在信号更新时暂停执行。断点仅在基于 Chromium 的浏览器中可用。
- **Watch signal**：将信号的更新和失效记录到浏览器控制台。再次点击此操作即可停止监听。
- **Highlight upstream / downstream**：追踪该节点的依赖项或依赖者的路径。

如果组件没有使用任何信号，Angular DevTools 会显示 "No signals in this component" 消息，而不是信号图。

## 版本支持 {#version-support}

信号图要求应用使用 Angular 19 或更高版本构建，并以开发模式运行。
