# 路由加载策略

了解 Angular 路由中的路由和组件在何时、以何种方式加载，对构建响应迅速的 Web 应用至关重要。Angular 提供了两种主要策略来控制加载行为：

1. **立即加载**：立即加载的路由和组件
2. **延迟加载**：只在需要时才加载的路由和组件

每种方式在不同场景下各有优势。

## 立即加载的组件

当你用 [`component`](https://angular.dev/api/router/Route#component) 属性定义路由时，被引用的组件会被立即加载，与路由配置位于同一个 JavaScript 包中。

```ts
import {Routes} from '@angular/router';
import {HomePage} from './components/home/home-page';
import {LoginPage} from './components/auth/login-page';

export const routes: Routes = [
  // HomePage 和 LoginPage 都在这个配置中被直接引用，
  // 因此它们的代码会被立即打包进与本文件相同的 JavaScript 包中。
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'login',
    component: LoginPage,
  },
];
```

像这样立即加载路由组件，意味着浏览器必须在初始页面加载时下载并解析这些组件的全部 JavaScript，但 Angular 可以立即使用这些组件。

虽然在初始页面加载中包含更多 JavaScript 会让初始加载变慢，但用户在应用中导航时，页面切换会更加流畅。

## 延迟加载的组件和路由

你可以使用 [`loadComponent`](https://angular.dev/api/router/Route#loadComponent) 属性，在某个路由即将激活时才延迟加载组件的 JavaScript。[`loadChildren`](https://angular.dev/api/router/Route#loadChildren) 属性则会在路由匹配期间延迟加载子路由。

```ts
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login-page'),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component'),
    loadChildren: () => import('./admin/admin.routes'),
  },
];
```

[`loadComponent`](https://angular.dev/api/router/Route#loadComponent) 和 [`loadChildren`](https://angular.dev/api/router/Route#loadChildren) 属性接受一个加载函数，该函数返回一个 Promise，分别解析为一个 Angular 组件或一组路由。大多数情况下，这个函数会使用标准的 [JavaScript 动态导入 API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)。不过，你也可以使用任意的异步加载函数。

如果被延迟加载的文件使用的是 `default` 导出，你可以直接返回 `import()` 的 Promise，而不需要额外调用 `.then` 来选取导出的类。

延迟加载路由可以把大量 JavaScript 从初始包中移除，从而显著提升 Angular 应用的加载速度。这部分代码会被编译成单独的 JavaScript「代码块（chunk）」，只有当用户访问对应路由时，路由器才会请求它们。

## 注入上下文中的延迟加载

路由器（Router）会在**当前路由的注入上下文**中执行 [`loadComponent`](https://angular.dev/api/router/Route#loadComponent) 和 [`loadChildren`](https://angular.dev/api/router/Route#loadChildren)，因此你可以在这些加载函数中调用 [`inject`](https://angular.dev/api/core/inject)，访问在该路由上声明的提供者（Provider）、通过分层依赖注入从父路由继承的提供者，或全局可用的提供者。这样就能实现感知上下文的延迟加载。

```ts
import {Routes} from '@angular/router';
import {inject} from '@angular/core';
import {FeatureFlags} from './feature-flags';

export const routes: Routes = [
  {
    path: 'dashboard',
    // 在路由的注入上下文中运行
    loadComponent: () => {
      const flags = inject(FeatureFlags);
      return flags.isPremium
        ? import('./dashboard/premium-dashboard')
        : import('./dashboard/basic-dashboard');
    },
  },
];
```

## 应该使用立即加载还是延迟加载的路由？

决定一个路由应该立即加载还是延迟加载时，需要考虑很多因素。

一般来说，建议对主要的落地页使用立即加载，而其他页面则使用延迟加载。

::: info 注意
虽然延迟加载的路由能减少用户初始请求的数据量，带来前期的性能优势，但它也会增加之后的数据请求，而这些请求可能并不理想。在处理多层嵌套的延迟加载时尤其如此，这可能会显著影响性能。

:::

## 后续步骤

了解如何[使用出口（Outlet）显示路由的内容](/guide/routing/show-routes-with-outlets)。
