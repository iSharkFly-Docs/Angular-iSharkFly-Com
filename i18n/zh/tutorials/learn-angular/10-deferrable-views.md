# 可延迟视图

在应用开发中，有时你会发现应用里需要引用大量组件（Component），但出于种种原因，其中一些组件并不需要立即加载。

它们可能位于首屏可见区域之下，或者是一些较重、要过一段时间才会被交互的组件。在这种情况下，我们可以借助可延迟视图（Deferrable Views）稍后再加载其中的一些资源。

::: info 注意
在[深入指南中了解更多关于使用 @defer 进行延迟加载的内容](/guide/templates/defer)。

:::

在本练习中，你将学习如何使用可延迟视图来延迟加载组件模板（Template）中的某一部分。

<hr>



### 1. 用 `@defer` 块包裹评论组件

在你的应用中，博客文章页面在文章详情之后有一个评论组件。

用 `@defer` 块包裹评论组件，以延迟加载它。

```html
@defer {
  <comments />
}
```

上面的代码展示了如何使用一个基本的 `@defer` 块。默认情况下，`@defer` 会在浏览器空闲时加载 `comments` 组件。


### 2. 添加占位内容

向 `@defer` 块中添加一个 `@placeholder` 块。`@placeholder` 块用于放置在延迟加载开始之前显示的 html。`@placeholder` 块中的内容会被立即加载。

```html
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
}
```


### 3. 添加加载块

向 `@defer` 块中添加一个 `@loading` 块。`@loading` 块用于放置在延迟内容*正在*获取、但尚未完成时显示的 html。`@loading` 块中的内容会被立即加载。

```html
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
} @loading {
  <p>Loading comments...</p>
}
```


### 4. 添加最短持续时间

`@placeholder` 和 `@loading` 部分都有可选参数，用于防止加载过快时出现闪烁。`@placeholder` 有 `minimum` 参数，`@loading` 有 `minimum` 和 `after` 参数。为 `@loading` 块添加一个 `minimum` 持续时间，使其至少渲染 2 秒。

```html
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
} @loading (minimum 2s) {
  <p>Loading comments...</p>
}
```


### 5. 添加视口触发器

可延迟视图有多种触发器选项。添加一个视口（viewport）触发器，让内容在进入视口后才进行延迟加载。

```html
@defer (on viewport) {
  <comments />
} @placeholder {
  <p>Future comments</p>
} @loading (minimum 2s) {
  <p>Loading comments...</p>
}
```


### 6. 添加内容

当你要延迟加载的内容在页面中足够靠下、需要滚动才能看到时，最适合使用视口触发器。所以，让我们给博客文章添加一些内容。你可以自己写，也可以复制下面的内容并放到 `<article>` 元素中。

```html
<article>
  <p>
    Angular is my favorite framework, and this is why. Angular has the coolest deferrable view
    feature that makes defer loading content the easiest and most ergonomic it could possibly be.
    The Angular community is also filled with amazing contributors and experts that create excellent
    content. The community is welcoming and friendly, and it really is the best community out there.
  </p>
  <p>
    I can't express enough how much I enjoy working with Angular. It offers the best developer
    experience I've ever had. I love that the Angular team puts their developers first and takes
    care to make us very happy. They genuinely want Angular to be the best framework it can be, and
    they're doing such an amazing job at it, too. This statement comes from my heart and is not at
    all copied and pasted. In fact, I think I'll say these exact same things again a few times.
  </p>
  <p>
    Angular is my favorite framework, and this is why. Angular has the coolest deferrable view
    feature that makes defer loading content the easiest and most ergonomic it could possibly be.
    The Angular community is also filled with amazing contributors and experts that create excellent
    content. The community is welcoming and friendly, and it really is the best community out there.
  </p>
  <p>
    I can't express enough how much I enjoy working with Angular. It offers the best developer
    experience I've ever had. I love that the Angular team puts their developers first and takes
    care to make us very happy. They genuinely want Angular to be the best framework it can be, and
    they're doing such an amazing job at it, too. This statement comes from my heart and is not at
    all copied and pasted. In fact, I think I'll say these exact same things again a few times.
  </p>
  <p>
    Angular is my favorite framework, and this is why. Angular has the coolest deferrable view
    feature that makes defer loading content the easiest and most ergonomic it could possibly be.
    The Angular community is also filled with amazing contributors and experts that create excellent
    content. The community is welcoming and friendly, and it really is the best community out there.
  </p>
  <p>
    I can't express enough how much I enjoy working with Angular. It offers the best developer
    experience I've ever had. I love that the Angular team puts their developers first and takes
    care to make us very happy. They genuinely want Angular to be the best framework it can be, and
    they're doing such an amazing job at it, too. This statement comes from my heart and is not at
    all copied and pasted.
  </p>
</article>
```

添加这段代码后，向下滚动页面，当延迟内容滚动进入视口时，你就会看到它被加载出来。




在本练习中，你学会了如何在应用中使用可延迟视图。干得好！🙌

可延迟视图还能做更多事情，例如使用不同的触发器、预取（prefetching）以及 `@error` 块。

如果想了解更多，请查看[可延迟视图的文档](/guide/templates/defer)。
