# 使用出口显示路由 {#show-routes-with-outlets}

`RouterOutlet` 指令（directive）是一个占位符，用于标记路由器（router）应在何处渲染当前 URL 对应的组件（component）。

```html
<app-header />
<!-- Angular 会把路由内容插入到这里 -->
<router-outlet />
<app-footer />
```

```ts
import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
```

在这个例子中，如果应用定义了以下路由（route）：

```ts
import {Routes} from '@angular/router';
import {Home} from './home';
import {Products} from './products';

const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home Page',
  },
  {
    path: 'products',
    component: Products,
    title: 'Our Products',
  },
];
```

当用户访问 `/products` 时，Angular 会渲染以下内容：

```html
<app-header />
<app-products />
<app-footer />
```

如果用户回到首页，Angular 会渲染：

```html
<app-header />
<app-home />
<app-footer />
```

显示某个路由时，`<router-outlet>` 元素会一直保留在 DOM 中，作为后续导航（navigation）的参照点。Angular 会把路由内容作为同级元素插入到出口（outlet）元素的紧后方。

```html
<!-- 组件模板的内容 -->
<app-header />
<router-outlet />
<app-footer />
```

```html
<!-- 用户访问 /admin 时页面上渲染的内容 -->
<app-header />
<router-outlet />
<app-admin-page />
<app-footer />
```

## 使用子路由嵌套路由 {#nesting-routes-with-child-routes}

随着应用变得越来越复杂，你可能想创建相对于根组件之外的其他组件的路由。这样，当 URL 变化时，只有应用的一部分发生变化，而不会让用户感觉整个页面都刷新了。

这类嵌套路由称为子路由。这意味着你要在应用中添加第二个 `<router-outlet>`，因为它是 AppComponent 中那个 `<router-outlet>` 之外的另一个出口。

在这个例子中，`Settings` 组件会根据用户的选择显示相应的面板。你会注意到子路由的一个独特之处：组件通常有自己的 `<nav>` 和 `<router-outlet>`。

```html
<h1>Settings</h1>
<nav>
  <ul>
    <li><a routerLink="profile">Profile</a></li>
    <li><a routerLink="security">Security</a></li>
  </ul>
</nav>
<router-outlet />
```

子路由和其他路由一样，都需要 `path` 和 `component`。唯一的区别是，你要把子路由放在父路由的 children 数组中。

```ts
const routes: Routes = [
  {
    path: 'settings',
    component: Settings, // 这是模板中带有 <router-outlet> 的组件
    children: [
      {
        path: 'profile', // 子路由路径
        component: Profile, // 路由器渲染的子路由组件
      },
      {
        path: 'security',
        component: Security, // 路由器渲染的另一个子路由组件
      },
    ],
  },
];
```

只要 `routes` 和 `<router-outlet>` 都配置正确，你的应用就已经在使用嵌套路由了！

## 使用具名出口的辅助路由 {#secondary-routes-with-named-outlets}

页面可以有多个出口 —— 你可以为每个出口指定一个名字，以说明哪些内容属于哪个出口。

```html
<app-header />
<router-outlet />
<router-outlet name="read-more" />
<router-outlet name="additional-actions" />
<app-footer />
```

每个出口都必须有唯一的名字。你可以把名字绑定到一个值上。当值发生变化时，出口会销毁当前组件，并渲染与新名字匹配的路由（如果有的话）。默认情况下，名字是 `'primary'`。

Angular 会把出口的名字与每个路由上定义的 `outlet` 属性进行匹配：

```ts
{
  path: 'user/:id',
  component: UserDetails,
  outlet: 'additional-actions'
}
```

## 出口的生命周期事件 {#outlet-lifecycle-events}

路由出口可以发出四种生命周期事件：

| 事件         | 说明                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| `activate`   | 当新组件被实例化时                                                       |
| `deactivate` | 当组件被销毁时                                                           |
| `attach`     | 当 `RouteReuseStrategy` 指示出口附加子树时                               |
| `detach`     | 当 `RouteReuseStrategy` 指示出口分离子树时                               |

你可以使用标准的事件绑定（event binding）语法添加事件监听器（event listener）：

```html
<router-outlet
  (activate)="onActivate($event)"
  (deactivate)="onDeactivate($event)"
  (attach)="onAttach($event)"
  (detach)="onDetach($event)"
/>
```

如果想了解更多，请参阅 [RouterOutlet 的 API 文档](https://angular.dev/api/router/RouterOutlet?tab=api)。

## 向路由组件传递上下文数据 {#passing-contextual-data-to-routed-components}

向路由组件传递上下文数据通常需要借助全局状态或复杂的路由配置。为了简化这一点，每个 `RouterOutlet` 都支持 `routerOutletData` 输入（input）。路由组件及其子组件可以通过 `ROUTER_OUTLET_DATA` 注入令牌（injection token）以信号（signal）的形式读取这些数据，从而无需修改路由定义就能实现针对特定出口的配置。

```ts
import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  template: `
    <h2>Dashboard</h2>
    <router-outlet [routerOutletData]="{layout: 'sidebar'}" />
  `,
})
export class Dashboard {}
```

路由组件可以使用 `ROUTER_OUTLET_DATA` 注入所提供的出口数据：

```ts
import {Component, inject, Signal} from '@angular/core';
import {ROUTER_OUTLET_DATA} from '@angular/router';

@Component({
  selector: 'app-stats',
  template: `<p>Stats view (layout: {{ outletData().layout }})</p>`,
})
export class Stats {
  outletData = inject(ROUTER_OUTLET_DATA) as Signal<{layout: string}>;
}
```

当 Angular 在该出口中激活 `Stats` 时，它会收到 `{ layout: 'sidebar' }` 作为注入的数据。

::: info 注意
未设置 `routerOutletData` 输入时，注入的信号的值默认为 `undefined`。

:::

---

## 后续步骤 {#next-steps}

了解如何使用 Angular 路由器[导航到路由](/guide/routing/navigate-to-routes)。
