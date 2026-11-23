# 使用 RouterLink 进行导航

在应用当前的状态下，当我们点击应用内部的链接时，整个页面都会刷新。对于小型应用来说这似乎无关紧要，但对于内容更多的大型页面，这可能会带来性能问题，因为用户需要重新下载资源并再次执行计算。

::: info 注意
在[深入指南中了解更多关于为应用添加路由的内容](/guide/routing/define-routes#adding-the-router-to-your-application)。

:::

在本活动中，你将学习如何利用 `RouterLink` 指令（Directive）来充分发挥 Angular 路由（Router）的作用。

<hr>



### 1. 导入 `RouterLink` 指令

在 `app.ts` 中，把 `RouterLink` 指令添加到现有的 `@angular/router` 导入语句中，并将其添加到组件（Component）装饰器的 `imports` 数组里。

```ts
...
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterOutlet],
  ...
})
```


### 2. 在模板中添加 `routerLink`

要使用 `RouterLink` 指令，请把 `href` 属性替换为 `routerLink`。按此修改更新模板（Template）。

```ts
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  ...
  template: `
    ...
    <a routerLink="/">Home</a>
    <a routerLink="/user">User</a>
    ...
  `,
  imports: [RouterLink, RouterOutlet],
})
```




现在点击导航中的链接时，你应该不会再看到页面闪烁，只有页面本身的内容（即 `router-outlet`）会发生变化 🎉

学习 Angular 路由，干得好。这只是 `Router` API 的冰山一角，想了解更多，请查看 [Angular 路由文档](/guide/routing)。
