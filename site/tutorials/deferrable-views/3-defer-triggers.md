# Defer 触发器 {#defer-triggers}

虽然 `@defer` 的默认选项已经为延迟加载（Lazy Loading）组件的某些部分提供了很好的方案，但你可能仍然希望进一步自定义延迟加载的体验。

默认情况下，延迟内容会在浏览器空闲时加载。不过，你可以通过指定**触发器（trigger）**来自定义何时进行加载。这让你可以选择最适合你的组件（Component）的加载行为。

可延迟视图（Deferrable Views）提供两种类型的加载触发器：

| 触发器  | 说明                                                                                                                                                                                                           |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on`    | 使用内置触发器列表中的某个触发器作为触发条件。<br/>例如：`@defer (on viewport)`                                                                                                |
| `when`  | 以表达式形式给出的条件，会对其进行真值判断。当表达式为真值时，占位内容会被替换为延迟加载的内容。<br/>例如：`@defer (when customizedCondition)` |

如果 `when` 条件求值为 `false`，`defer` 块不会恢复回占位内容。这种替换是一次性的操作。

你可以同时定义多个事件触发器，这些触发器之间按“或”（OR）条件进行判断。

- 例如：`@defer (on viewport; on timer(2s))`
- 例如：`@defer (on viewport; when customizedCondition)`

在本活动中，你将学习如何使用触发器来指定加载可延迟视图的条件。

<hr>



### 1. 添加 `on hover` 触发器 {#_1-add-on-hover-trigger}

在你的 `app.ts` 中，为 `@defer` 块添加一个 `on hover` 触发器。

```html
@defer (on hover) {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
```

现在，只有当你把鼠标悬停在评论区的占位内容上时，页面才会渲染评论区。


### 2. 添加“Show all comments”按钮 {#_2-add-a-show-all-comments-button}

接下来，更新模板（Template），添加一个标签为“Show all comments”的按钮。为该按钮添加一个名为 `#showComments` 的模板变量。

```html
<button type="button" #showComments>Show all comments</button>

@defer (on hover) {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
```

::: info 注意
关于[模板变量的更多信息，请查阅文档](/guide/templates/variables#declaring-a-template-reference-variable)。

:::


### 3. 添加 `on interaction` 触发器 {#_3-add-on-interaction-trigger}

更新模板中的 `@defer` 块，使用 `on interaction` 触发器。将 `showComments` 模板变量作为参数传给 `interaction`。

```html
<button type="button" #showComments>Show all comments</button>

@defer (on hover; on interaction(showComments)) {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
```

完成这些修改后，页面会等待以下任一条件满足后才渲染评论区：

- 用户将鼠标悬停在评论区的占位内容上
- 用户点击“Show all comments”按钮

你可以重新加载页面，尝试用不同的触发器来渲染评论区。



如果你想了解更多，请查阅[可延迟视图](/guide/templates/defer)的文档。
继续学习，解锁 Angular 更多出色的功能。
