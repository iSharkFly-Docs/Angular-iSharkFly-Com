# 路由重定向

路由重定向（redirect）可以自动把用户从一个路由（route）导航（navigation）到另一个路由。可以把它想象成邮件转寄：寄往某个地址的信件会被转送到另一个地址。这对于处理旧版 URL、实现默认路由或管理访问控制都很有用。

## 如何配置重定向

你可以在路由配置中使用 `redirectTo` 属性来定义重定向。这个属性接受一个字符串。

```ts
import {Routes} from '@angular/router';

const routes: Routes = [
  // 简单重定向
  {path: 'marketing', redirectTo: 'newsletter'},

  // 带路径参数的重定向
  {path: 'legacy-user/:id', redirectTo: 'users/:id'},

  // 重定向其他所有未匹配的 URL
  // （也称为“通配符”重定向）
  {path: '**', redirectTo: '/login'},
];
```

这个例子中有三个重定向：

1. 当用户访问 `/marketing` 路径时，会被重定向到 `/newsletter`。
2. 当用户访问任意 `/legacy-user/:id` 路径时，会被导航到对应的 `/users/:id` 路径。
3. 当用户访问路由器（router）中未定义的任何路径时，由于定义了 `**` 通配符路径，用户会被重定向到登录页。

## 理解 `pathMatch`

路由上的 `pathMatch` 属性让开发者可以控制 Angular 如何把 URL 与路由进行匹配。

`pathMatch` 接受两个值：

| 值         | 说明                         |
| ---------- | ---------------------------- |
| `'full'`   | 整个 URL 路径必须完全匹配    |
| `'prefix'` | 只需要 URL 的开头部分匹配    |

默认情况下，所有重定向都使用 `prefix` 策略。

### `pathMatch: 'prefix'`

`pathMatch: 'prefix'` 是默认策略，适用于希望 Angular 路由器在触发重定向时匹配所有后续路由的场景。

```ts
export const routes: Routes = [
  // 这个重定向路由等价于……
  {path: 'news', redirectTo: 'blog'},

  // 这个显式定义了 pathMatch 的路由重定向
  {path: 'news', redirectTo: 'blog', pathMatch: 'prefix'},
];
```

在这个例子中，所有以 `news` 为前缀的路由都会被重定向到对应的 `/blog` 路由。下面是用户访问旧的 `news` 前缀时被重定向的一些例子：

- `/news` 重定向到 `/blog`
- `/news/article` 重定向到 `/blog/article`
- `/news/article/:id` 重定向到 `/blog/article/:id`

### `pathMatch: 'full'`

另一方面，如果你希望 Angular 路由器只重定向某个特定路径，`pathMatch: 'full'` 就很有用。

```ts
export const routes: Routes = [{path: '', redirectTo: '/dashboard', pathMatch: 'full'}];
```

在这个例子中，每当用户访问根 URL（即 `''`）时，路由器都会把该用户重定向到 `'/dashboard'` 页面。

其他后续页面（例如 `/login`、`/about`、`/product/id` 等）都会被忽略，不会触发重定向。

::: tip 提示
在根页面（即 `"/"` 或 `""`）上配置重定向时要小心。如果不设置 `pathMatch: 'full'`，路由器会重定向所有 URL。

:::

为了进一步说明这一点，假设上一节中的 `news` 示例改用 `pathMatch: 'full'`：

```ts
export const routes: Routes = [{path: 'news', redirectTo: '/blog', pathMatch: 'full'}];
```

这意味着：

1. 只有 `/news` 路径会被重定向到 `/blog`。
2. 任何带有后续片段的路径（例如 `/news/articles` 或 `/news/articles/1`）都不会被重定向到新的 `/blog` 前缀。

## 条件重定向

`redirectTo` 属性也可以接受一个函数，以便为用户的重定向方式添加逻辑。

这个[函数](https://angular.dev/api/router/RedirectFunction)只能访问 [`ActivatedRouteSnapshot`](https://angular.dev/api/router/ActivatedRouteSnapshot) 数据的一部分，因为有些数据在路由匹配阶段还无法准确得知，例如解析后的标题、延迟加载（lazy loading）的组件（component）等。

它通常返回一个字符串或 [`URLTree`](https://angular.dev/api/router/UrlTree)，但也可以返回 Observable 或 Promise。

下面的例子会根据一天中的时间，把用户重定向到不同的菜单：

```ts
import {Routes} from '@angular/router';
import {Menu} from './menu';

export const routes: Routes = [
  {
    path: 'restaurant/:location/menu',
    pathMatch: 'full',
    redirectTo: (activatedRouteSnapshot) => {
      const location = activatedRouteSnapshot.params['location'];
      const currentHour = new Date().getHours();

      // 检查用户是否通过查询参数请求了特定的餐点
      if (activatedRouteSnapshot.queryParams['meal']) {
        return `/restaurant/${location}/menu/${activatedRouteSnapshot.queryParams['meal']}`;
      }

      // 根据一天中的时间自动重定向
      if (currentHour >= 5 && currentHour < 11) {
        return `/restaurant/${location}/menu/breakfast`;
      } else if (currentHour >= 11 && currentHour < 17) {
        return `/restaurant/${location}/menu/lunch`;
      } else {
        return `/restaurant/${location}/menu/dinner`;
      }
    },
  },

  // 目标路由
  {path: 'restaurant/:location/menu/breakfast', component: Menu},
  {path: 'restaurant/:location/menu/lunch', component: Menu},
  {path: 'restaurant/:location/menu/dinner', component: Menu},

  // 默认重定向
  {path: '', redirectTo: '/restaurant/downtown/menu', pathMatch: 'full'},
];
```

要了解更多信息，请查看 [RedirectFunction 的 API 文档](https://angular.dev/api/router/RedirectFunction)。

## 使用 `RedirectCommand` 从组件和资源中重定向

除了静态重定向和基于函数的路由重定向之外，组件和路由资源（resource）还可以通过抛出 `RedirectCommand` 以命令式的方式触发重定向。这在重定向未认证用户，或在获取数据期间处理动态授权检查时尤其有用：

```ts
import {Component, inject, resource} from '@angular/core';
import {Router, RedirectCommand} from '@angular/router';

@Component({
  selector: 'app-account',
  template: `<p>Account Details</p>`,
})
export class AccountPage {
  private router = inject(Router);

  accountData = resource({
    loader: async () => {
      const response = await fetch('/api/account');
      if (response.status === 401) {
        // 未授权时自动重定向到 /login
        throw new RedirectCommand(this.router.parseUrl('/login'));
      }
      return response.json();
    },
  });
}
```

当在路由组件的构造函数、生命周期钩子（lifecycle hook）或路由资源加载器中抛出 `RedirectCommand` 时，Angular 路由器会拦截该命令，并自动发起到目标 URL 的导航。

## 后续步骤

要了解有关 `redirectTo` 属性的更多信息，请查看 [API 文档](https://angular.dev/api/router/Route#redirectTo)。
要进一步了解错误边界以及如何捕获组件故障，请参阅[错误边界指南](/guide/routing/error-boundaries)。
