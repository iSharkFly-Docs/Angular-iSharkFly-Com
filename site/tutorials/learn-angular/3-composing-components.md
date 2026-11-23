# 组合组件 {#composing-components}

你已经学会了如何更新组件模板、组件逻辑和组件样式，但如何在应用中使用一个组件（Component）呢？

组件配置中的 `selector` 属性为你提供了一个名称，用于在其他模板（Template）中引用该组件。你可以像使用 HTML 标签一样使用 `selector`，例如 `app-user` 在模板中写作 `<app-user />`。

::: info 注意
在[基础知识指南中了解更多关于使用组件的内容](/essentials/components#using-components)。

:::

在本练习中，你将学习如何组合组件。

<hr/>

在这个例子中，有两个组件：`User` 和 `App`。



### 1. 添加对 `User` 的引用 {#_1-add-a-reference-to-user}

更新 `App` 的模板，加入对 `User` 的引用，它使用的选择器是 `app-user`。一定要把 `User` 添加到 `App` 的 imports 数组中，这样它才能在 `App` 的模板中使用。

```html
template: `<app-user />`, imports: [User]
```

组件现在会显示消息 `Username: youngTech`。你可以更新模板代码，加入更多标记。


### 2. 添加更多标记 {#_2-add-more-markup}

由于你可以在模板中使用任意 HTML 标记，试着更新 `App` 的模板，加入更多 HTML 元素。这个例子会添加一个 `<section>` 元素，作为 `<app-user>` 元素的父元素。

```html
template: `
<section><app-user /></section>
`,
```



你可以根据需要使用任意多的 HTML 标记和组件，把你的应用构想变为现实。你甚至可以在同一个页面上放置同一组件的多个副本。

这正好引出下一个话题：如何根据数据有条件地显示组件？前往下一节一探究竟吧。
