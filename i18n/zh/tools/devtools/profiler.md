# 分析应用性能

**Profiler** 标签页可以让你直观地查看 Angular 变更检测（Change Detection）的执行情况。
这有助于判断变更检测在何时、以何种方式影响应用的性能。

<img src="/assets/images/guide/devtools/profiler.png" alt="A screenshot of the 'Profiler' tab which reads 'Click the play button to start a new recording, or upload a json file containing profiler data.' Next to this is a record button to begin recording a new profile as well as a file picker to select an existing profile.">

在 Profiler 标签页中，你可以开始分析当前应用，也可以导入之前运行时保存的性能分析记录。
要开始分析应用，请把鼠标悬停在 **Profiler** 标签页左上角的圆圈上，然后点击 **Start recording**（开始录制）。

在分析期间，Angular DevTools 会捕获执行事件，例如变更检测和生命周期钩子（Lifecycle Hook）的执行。
与应用进行交互，以触发变更检测并生成 Angular DevTools 可以使用的数据。
要结束录制，请再次点击该圆圈以 **Stop recording**（停止录制）。

你也可以导入已有的录制记录。
请在[导入录制记录](/tools/devtools/profiler#import-and-export-recordings)一节中了解有关此功能的更多信息。

## 了解应用的执行情况

录制或导入性能分析记录后，Angular DevTools 会以可视化的方式展示变更检测周期。

<img src="/assets/images/guide/devtools/default-profiler-view.png" alt="A screenshot of the 'Profiler' tab after a profile has been recorded or uploaded. It displays a bar chart illustrating various change detection cycles with some text which reads 'Select a bar to preview a particular change detection cycle'.">

序列中的每个柱条都代表应用中的一次变更检测周期。
柱条越高，说明应用在这个周期中运行变更检测所花的时间越长。
选中某个柱条后，DevTools 会显示与之相关的有用信息，包括：

- 一张柱状图，列出该周期中捕获到的所有组件和指令
- Angular 在该周期中运行变更检测所花费的时间。
- 用户实际体验到的估算帧率（如果低于 60fps）

<img src="/assets/images/guide/devtools/profiler-selected-bar.png" alt="A screenshot of the 'Profiler' tab. A single bar has been selected by the user and a nearby dropdown menu displays 'Bar chart`, showing a second bar chart underneath it. The new chart has two bars which take up the majority of the space, one labeled `TodosComponent` and the other labeled `NgForOf`. The other bars are small enough to be negligible in comparison.">

## 了解组件的执行情况

点击某个变更检测周期后显示的柱状图，会详细展示应用在该周期中对某个特定组件或指令运行变更检测所花费的时间。

这个示例展示了 `NgForOf` 指令所花费的总时间，以及在它上面调用了哪个方法。

<img src="/assets/images/guide/devtools/directive-details.png" alt="A screenshot of the 'Profiler' tab where the `NgForOf` bar is selected. A detailed view of `NgForOf` is visible to the right where it lists 'Total time spent: 1.76 ms'. It includes a with exactly one row, listing `NgForOf` as a directives with an `ngDoCheck` method which took 1.76 ms. It also includes a list labeled 'Parent Hierarchy' containing the parent components of this directive.">

## 层级视图

<img src="/assets/images/guide/devtools/flame-graph-view.png" alt="A screenshot of the 'Profiler' tab. A single bar has been selected by the user and a nearby dropdown menu now displays 'Flame graph', showing a flame graph underneath it. The flame graph starts with a row called 'Entire application' and another row called 'AppComponent'. Beneath those, the rows start to break up into multiple items, starting with `[RouterOutlet]` and `DemoAppComponent` on the third row. A few layers deep, one cell is highlighted red.">

你还可以用类似火焰图的视图来直观地查看变更检测的执行情况。

图中的每个方块代表渲染树中特定位置上的一个屏幕元素。
例如，假设在某个变更检测周期中，`LoggedOutUserComponent` 被移除，Angular 在原位置渲染了 `LoggedInUserComponent`。在这种情况下，这两个组件会显示在同一个方块中。

x 轴表示渲染这个变更检测周期所花费的总时间。
y 轴表示元素层级。为某个元素运行变更检测，需要渲染它的指令和子组件。
结合起来，这张图可以直观地展示哪些组件的渲染时间最长，以及时间都花在了哪里。

每个方块的颜色取决于 Angular 在其中花费的时间。
Angular DevTools 会根据该方块所花费的时间相对于渲染耗时最长的方块的比例，来确定颜色的深浅。

点击某个方块后，你会在右侧面板中看到它的详细信息。
双击方块会将其放大，以便更轻松地查看其中嵌套的子项。

## 调试变更检测与 `OnPush` 组件

通常，对于任意给定的变更检测帧，该图展示的是*渲染*应用所花费的时间。不过，有些组件（例如 `OnPush` 组件）只有在输入属性发生变化时才会重新渲染。对于特定的帧，在不包含这些组件的情况下查看火焰图会很有帮助。

要只查看某个变更检测帧中实际经历了变更检测过程的组件，请勾选火焰图上方顶部的 **Change detection**（变更检测）复选框。

该视图会高亮显示所有经历了变更检测的组件，而没有经历变更检测的组件（例如没有重新渲染的 `OnPush` 组件）则显示为灰色。

<img src="/assets/images/guide/devtools/debugging-onpush.png" alt="A screenshot of the 'Profiler' tab displaying a flame chart visualization of a change detection cycle. A checkbox labeled 'Show only change detection' is now checked. The flame graph looks very similar to before, however the color of components has changed from orange to blue. Several tiles labeled `[RouterOutlet]` are no longer highlighted with any color.">

## 导入和导出录制记录

点击已录制的性能分析会话右上角的 **Save Profile**（保存记录）按钮，即可将其导出为 JSON 文件并保存到磁盘。
之后，可以在 Profiler 的初始视图中点击 **Choose file**（选择文件）输入框来导入该文件。

<img src="/assets/images/guide/devtools/save-profile.png" alt="A screenshot of the 'Profiler' tab displaying change detection cycles. On the right side a 'Save Profile' button is visible.">
