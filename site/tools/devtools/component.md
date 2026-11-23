# 检查组件树 {#inspect-the-component-tree}

## 调试应用 {#debug-your-application}

**Components** 标签页可以让你浏览应用的结构。
你可以直观地查看 DOM 中的组件（Component）和指令（Directive）实例，并检查或修改它们的状态。

### 浏览应用结构 {#explore-the-application-structure}

组件树以层级关系展示应用中的*组件和指令*。

<img src="/assets/images/guide/devtools/component-explorer.png" alt="A screenshot of the 'Components' tab showing a tree of Angular components and directives starting the root of the application.">

在组件浏览器中点击某个组件或指令，即可选中它并预览其属性。
Angular DevTools 会在组件树的右侧显示属性和元数据。

要按名称查找组件或指令，请使用组件树上方的搜索框。

<img src="/assets/images/guide/devtools/search.png" alt="A screenshot of the 'Components' tab. The filter bar immediately underneath the tab is searching for 'todo' and all components with 'todo' in the name are highlighted in the tree. `app-todos` is currently selected and a sidebar to the right displays information about the component's properties. This includes a section of `@Output` fields and another section for other properties.">

### 跳转到宿主节点 {#navigate-to-the-host-node}

要跳转到某个组件或指令的宿主元素，请在组件浏览器中双击它。
Angular DevTools 会打开 Chrome 中的 Elements 标签页或 Firefox 中的 Inspector 标签页，并选中对应的 DOM 节点。

### 跳转到源代码 {#navigate-to-source}

对于组件，Angular DevTools 可以让你跳转到 Sources 标签页（Chrome）或 Debugger 标签页（Firefox）中的组件定义。
选中某个组件后，点击属性视图右上角的图标：

<img src="/assets/images/guide/devtools/navigate-source.png" alt="A screenshot of the 'Components' tab. The properties view on the right is visible for a component and the mouse rests in the upper right corner of that view on top of a `<>` icon. An adjacent tooltip reads 'Open component source'.">

### 更新属性值 {#update-property-value}

与浏览器的 DevTools 类似，属性视图允许你编辑输入属性、输出属性或其他属性的值。
右键点击属性值，如果该值的类型支持编辑功能，就会出现一个文本输入框。
输入新值并按 `Enter`，即可把该值应用到属性上。

<img src="/assets/images/guide/devtools/update-property.png" alt="A screenshot of the 'Components' tab with the properties view open for a component. An `@Input` named `todo` contains a `label` property which is currently selected and has been manually updated to the value 'Buy milk'.">

### 在控制台中访问选中的组件或指令 {#access-selected-component-or-directive-in-console}

作为控制台中的快捷方式，Angular DevTools 提供了对最近选中的组件或指令实例的访问。
输入 `$ng0` 可以获取当前选中的组件或指令实例的引用，输入 `$ng1` 获取上一个选中的实例，输入 `$ng2` 获取再之前选中的实例，依此类推。

<img src="/assets/images/guide/devtools/access-console.png" alt="A screenshot of the 'Components' tab with the browser console underneath. In the console, the user has typed three commands, `$ng0`, `$ng1`, and `$ng2` to view the three most recently selected elements. After each statement, the console prints a different component reference.">

### 选择指令或组件 {#select-a-directive-or-component}

与浏览器的 DevTools 类似，你可以通过检查页面来选择特定的组件或指令。
点击 Angular DevTools 左上角的 **_Inspect element_**（检查元素）图标，然后把鼠标悬停在页面的某个 DOM 元素上。
该扩展会识别出关联的指令和/或组件，并让你在组件树中选中对应的元素。

<img src="/assets/images/guide/devtools/inspect-element.png" alt="A screenshot of the 'Components' tab with an Angular todo application visible. In the very top-left corner of Angular DevTools, an icon of a screen with a mouse icon inside it is selected. The mouse rests on a todo element in the Angular application UI. The element is highlighted with a `<TodoComponent>` label displayed in an adjacent tooltip.">

### 检查可延迟视图 {#inspect-deferrable-views}

除了指令之外，指令树中还包含 [`@defer` 块](/guide/templates/defer)。

<img src="/assets/images/guide/devtools/defer-block.png" />

点击某个 defer 块后，属性侧边栏中会显示更多详细信息：各种可选块（例如 `@loading`、`@placeholder` 和 `@error`）、配置的触发器（defer 触发器、预取触发器和水合触发器），以及 `minimum` 和 `after` 等时间选项。

### 水合 {#hydration}

当 SSR/SSG 应用启用了[水合（Hydration）](/guide/hydration)时，指令树会显示每个组件的水合状态。

如果出现错误，受影响的组件上会显示一条错误消息。

<img src="/assets/images/guide/devtools/hydration-status.png" />

启用叠加层后，还可以直接在应用上直观地查看水合状态。

<img src="/assets/images/guide/devtools/hydration-overlay-ecom.png" />

上图展示了一个 Angular 电商示例应用上的水合叠加层。

### 调试信号图 {#debug-the-signal-graph}

要直观地查看组件中的信号（Signal）、计算信号（Computed）和副作用（Effect）之间的依赖关系，请参阅[调试信号图](/tools/devtools/signals)。
