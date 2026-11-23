# 什么是可延迟视图？ {#what-are-deferrable-views}

一个完整渲染的 Angular 页面可能包含许多不同的组件（Component）、指令（Directive）和管道（Pipe）。页面的某些部分应当立即展示给用户，而另一些部分则可以稍后再显示。
Angular 的 _可延迟视图（Deferrable Views）_ 使用 `@defer` 语法，可以告诉 Angular 延后下载页面中无需立即显示的部分所对应的 JavaScript，从而帮助你提升应用的速度。

在本活动中，你将学习如何使用可延迟视图来延迟加载组件模板（Template）中的某个部分。

<hr>



### 1. 为模板的某个部分添加 `@defer` 块 {#_1-add-a-defer-block-to-a-section-of-a-template}

在你的 `app.ts` 中，用 `@defer` 块包裹 `article-comments` 组件，以延迟加载它。

```html
@defer {
  <article-comments />
}
```

默认情况下，`@defer` 会在浏览器空闲时加载 `article-comments` 组件。

在浏览器的开发者控制台中，你可以看到 `article-comments-component` 延迟加载的 chunk 文件是单独加载的（具体的文件名每次运行都可能不同）：

```markdown
Initial chunk files | Names | Raw size
chunk-NNSQHFIE.js | - | 769.00 kB |
main.js | main | 229.25 kB |

Lazy chunk files | Names | Raw size
chunk-T5UYXUSI.js | article-comments-component | 1.84 kB |
```



干得好！你已经掌握了可延迟视图的基础知识。
