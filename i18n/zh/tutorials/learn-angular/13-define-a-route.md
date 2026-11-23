# 定义路由

现在你已经把应用设置为使用 Angular 路由（Router），接下来需要定义路由。

::: info 注意
在[深入指南中了解更多关于定义基本路由的内容](/guide/routing/define-routes)。

:::

在本活动中，你将学习如何在应用中添加和配置路由。

<hr>



### 1. 在 `app.routes.ts` 中定义路由

应用中有两个要显示的页面：(1) 首页和 (2) 用户页面。

要定义路由，请在 `app.routes.ts` 的 `routes` 数组中添加一个路由对象，其中包含：

- 路由的 `path`（它会自动从根路径开始，即 `/`）
- 你希望该路由显示的 `component`

```ts
import {Routes} from '@angular/router';
import {Home} from './home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
];
```

上面的代码示例演示了如何把 `Home` 添加为一个路由。现在请在演练场（playground）中实现它，并同时为 `User` 添加路由。

使用 `'user'` 作为 `User` 的路径。


### 2. 为路由定义添加标题

除了正确定义路由之外，Angular 路由还允许你为每个路由添加 `title` 属性，从而在用户导航时设置页面标题。

在 `app.routes.ts` 中，为默认路由（`path: ''`）和 `user` 路由添加 `title` 属性。示例如下：

```ts
import {Routes} from '@angular/router';
import {Home} from './home/home';

export const routes: Routes = [
  {
    path: '',
    title: 'App Home Page',
    component: Home,
  },
];
```




在本活动中，你学会了如何在 Angular 应用中定义和配置路由。干得漂亮。🙌

在应用中完整启用路由的旅程即将完成，继续加油。
