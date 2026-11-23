# 优化图片

图片是许多应用的重要组成部分，也可能是导致应用性能问题的主要因素之一，包括 [Core Web Vitals](https://web.dev/explore/learn-core-web-vitals) 得分偏低。

图片优化可能是一个复杂的话题，但借助 `NgOptimizedImage` 指令（Directive），Angular 会为你处理其中的大部分工作。

::: info 注意
在[深入指南中了解更多关于使用 NgOptimizedImage 优化图片的内容](/guide/image-optimization)。

:::

在本练习中，你将学习如何使用 `NgOptimizedImage` 来确保图片被高效加载。

<hr>



### 1. 导入 NgOptimizedImage 指令

要使用 `NgOptimizedImage` 指令，首先从 `@angular/common` 库中导入它，并将其添加到组件（Component）的 `imports` 数组中。

```ts
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  ...
})
```


### 2. 把 src 属性改为 ngSrc

要启用 `NgOptimizedImage` 指令，请把 `src` 属性替换为 `ngSrc`。这同时适用于静态图片源（即 `src`）和动态图片源（即 `[src]`）。

```ts
import { NgOptimizedImage } from '@angular/common';

@Component({
template: `     ...
    <li>
      Static Image:
      <img ngSrc="/logo.svg" alt="Angular logo" width="32" height="32" />
    </li>
    <li>
      Dynamic Image:
      <img [ngSrc]="logoUrl" [alt]="logoAlt" width="32" height="32" />
    </li>
    ...
  `,
imports: [NgOptimizedImage],
})
```


### 3. 添加 width 和 height 属性

注意，在上面的代码示例中，每张图片都同时具有 `width` 和 `height` 属性。为了防止[布局偏移](https://web.dev/articles/cls)，`NgOptimizedImage` 指令要求每张图片都设置这两个尺寸属性。

如果你无法或不想为图片指定固定的 `height` 和 `width`，可以使用 [`fill` 属性](/guide/image-optimization#using-fill-mode)让图片像「背景图片」一样，填满它的容器元素：

```html
// 容器 div 设置了 'position: "relative"'
<div class="image-container">
  <img ngSrc="www.example.com/image.png" fill />
</div>
```

::: info 注意
要让 `fill` 图片正确渲染，其父元素必须设置 `position: "relative"`、`position: "fixed"` 或 `position: "absolute"` 样式。

:::


### 4. 优先加载重要图片

对加载性能而言，最重要的优化之一是优先加载可能成为 [「LCP 元素」](https://web.dev/articles/optimize-lcp)的图片，即页面加载时屏幕上最大的图形元素。为了优化加载时间，一定要为你的「主图（hero image）」或其他你认为可能成为 LCP 元素的图片添加 `priority` 属性。

```ts
<img ngSrc="www.example.com/image.png" height="600" width="800" priority />
```


### 5. 可选：使用图片加载器

`NgOptimizedImage` 允许你指定一个[图片加载器](/guide/image-optimization#configuring-an-image-loader-for-ngoptimizedimage)，它告诉该指令如何为你的图片格式化 URL。使用加载器后，你可以用简短的相对 URL 来定义图片：

```ts
providers: [provideImgixLoader('https://my.base.url/')],
```

最终的 URL 将是 'https://my.base.url/image.png'

```html
<img ngSrc="image.png" height="600" width="800" />
```

图片加载器不只是为了方便，它还能让你充分发挥 `NgOptimizedImage` 的全部能力。在[这里](/guide/image-optimization#configuring-an-image-loader-for-ngoptimizedimage)了解更多关于这些优化以及适用于主流 CDN 的内置加载器的信息。




把这个指令加入你的工作流后，在 Angular 的帮助下，你的图片现在已经按照最佳实践进行加载了 🎉

如果想了解更多，请查看 [`NgOptimizedImage` 的文档](/guide/image-optimization)。继续保持，接下来让我们学习路由（Router）。
