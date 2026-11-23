# 路由概览

对大多数应用来说，总会有一天需要不止一个页面。当这一天不可避免地到来时，路由（Routing）就成为影响用户体验性能的重要一环。

::: info 注意
在[深入指南中了解更多关于路由的内容](/guide/routing)。

:::

在本练习中，你将学习如何设置和配置应用以使用 Angular 路由器（Router）。

<hr>



### 1. 创建 app.routes.ts 文件

在 `app.routes.ts` 中做如下修改：

1. 从 `@angular/router` 包中导入 `Routes`。
2. 导出一个名为 `routes`、类型为 `Routes` 的常量，并将其值设为 `[]`。

```ts
import {Routes} from '@angular/router';

export const routes: Routes = [];
```


### 2. 将路由添加到提供者

在 `app.config.ts` 中，按以下步骤为应用配置 Angular 路由器：

1. 从 `@angular/router` 中导入 `provideRouter` 函数。
1. 从 `./app.routes.ts` 中导入 `routes`。
1. 在 `providers` 数组中调用 `provideRouter` 函数，并将 `routes` 作为参数传入。

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
```


### 3. 在组件中导入 `RouterOutlet`

最后，为了确保应用已准备好使用 Angular 路由器，你需要告诉应用希望路由器在哪里显示目标内容。这可以通过 `@angular/router` 中的 `RouterOutlet` 指令（Directive）来实现。

更新 `App` 的模板（Template），添加 `<router-outlet />`

```ts
@Component({
...
template: `
    <nav>
      <a href="/">Home</a>
      |
      <a href="/user">User</a>
    </nav>
    <router-outlet />
  `,
imports: [RouterOutlet],
})
export class App {}
```




你的应用现在已经设置好使用 Angular 路由器了。干得漂亮！🙌

趁热打铁，继续学习下一步：为我们的应用定义路由。
