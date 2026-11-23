# Angular 中的组件

组件（Component）是任何 Angular 应用的基础构建块。每个组件都由三部分组成：

- TypeScript 类
- HTML 模板（Template）
- CSS 样式

::: info 注意
在[基础知识指南中了解更多关于组件的内容](/essentials/components)。

:::

在本练习中，你将学习如何更新组件的模板和样式。

<hr />

这是你开始上手 Angular 的绝佳机会。



### 1. 更新组件模板

更新 `template` 属性，使其内容为 `Hello Universe`

```ts
template: `
  Hello Universe
`,
```

修改 HTML 模板后，预览会随之更新并显示你的消息。让我们更进一步：修改文本的颜色。


### 2. 更新组件样式

更新样式的值，把 `color` 属性从 `blue` 改为 `#a144eb`。

```ts
styles: `
  :host {
    color: #a144eb;
  }
`,
```

查看预览时，你会发现文本颜色已经改变。




在 Angular 中，你可以使用浏览器支持的所有 CSS 和 HTML。如果愿意，你也可以把模板和样式存放在单独的文件中。
