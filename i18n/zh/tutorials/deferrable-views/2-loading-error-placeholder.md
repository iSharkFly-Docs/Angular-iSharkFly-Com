# @loading、@error 和 @placeholder 块

可延迟视图（Deferrable Views）允许你定义在不同加载状态下显示的内容。

| 块             | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@placeholder` | 默认情况下，defer 块在被触发之前不会渲染任何内容。`@placeholder` 是一个可选块，用于声明在延迟内容加载完成之前显示的内容。加载完成后，Angular 会用延迟内容替换占位内容。虽然该块是可选的，但 Angular 团队建议始终包含一个占位块。[在完整的可延迟视图文档中了解更多](/guide/templates/defer) |
| `@loading`     | 这个可选块允许你声明在加载任何延迟依赖期间显示的内容。                                                                                                                                                                                                                                                                                                                                      |
| `@error`       | 这个块允许你声明在延迟加载失败时显示的内容。                                                                                                                                                                                                                                                                                                                                                                  |

上述所有子块的内容都是立即（eager）加载的。此外，某些功能需要 `@placeholder` 块。

在本活动中，你将学习如何使用 `@loading`、`@error` 和 `@placeholder` 块来管理可延迟视图的各种状态。

<hr>



### 1. 添加 `@placeholder` 块

在你的 `app.ts` 中，为 `@defer` 块添加一个 `@placeholder` 块。

```html
@defer {
  <article-comments />
} @placeholder {
  <p>Placeholder for comments</p>
}
```


### 2. 配置 `@placeholder` 块

`@placeholder` 块接受一个可选参数，用于指定该占位内容至少（`minimum`）应显示多长时间。这个 `minimum` 参数以毫秒（ms）或秒（s）为时间单位指定。该参数的作用是：在延迟依赖很快就获取完成的情况下，防止占位内容快速闪烁。

```html
@defer {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
}
```


### 3. 添加 `@loading` 块

接下来，在组件（Component）模板中添加一个 `@loading` 块。

`@loading` 块接受两个可选参数：

- `minimum`：该块至少应显示的时长
- `after`：开始加载后，等待多长时间再显示加载模板

两个参数都以毫秒（ms）或秒（s）为时间单位指定。

更新 `app.ts`，添加一个 `@loading` 块，为其设置值为 `1s` 的 minimum 参数，以及值为 500ms 的 after 参数。

```html
@defer {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
}
```

::: info 注意
本示例使用了两个参数，它们之间用 ; 字符分隔。

:::


### 4. 添加 `@error` 块

最后，为 `@defer` 块添加一个 `@error` 块。

```html
@defer {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
```



恭喜！到这里，你已经对可延迟视图有了很好的理解。继续加油，接下来我们来学习触发器。
