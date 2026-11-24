# 路由中的错误边界 {#error-boundaries-in-routing}

::: warning 重要
路由器错误边界目前处于[开发者预览](/reference/releases#developer-preview)阶段。

:::

构建 Web 应用时，组件（component）初始化、数据加载或渲染期间都可能发生运行时错误。Angular 路由器（Router）允许你使用**错误边界**（error boundary）把这些故障隔离在单个路由（route）中，防止一个出错的组件导致整个应用外壳崩溃。

::: info 注意
本指南介绍的是路由级别的错误处理。如果要在组件模板（template）的特定部分中捕获错误，请参阅[模板 `@boundary` 块指南](/guide/templates/error-boundaries)。

:::

## 什么是路由器错误边界？ {#what-are-router-error-boundaries}

路由器错误边界在路由出口（outlet）级别提供声明式的错误处理。当路由中的某个组件抛出错误时（例如网络资源加载失败、模板中出现意外的 null 引用，或依赖注入（dependency injection）期间出错），Angular 路由器会捕获该错误，并在出错视图的位置显示一个专门的后备组件（`errorComponent`）。

同级出口、父级布局组件和全局导航标题栏都会保持完整，并且仍可正常交互。

## 配置错误组件 {#configure-an-error-component}

要在路由出错时显示自定义的后备 UI，请在路由定义中添加 `errorComponent` 属性：

```ts [app.routes.ts]
import {Routes} from '@angular/router';
import {ProductDetails} from './product-details';
import {ProductErrorFallback} from './product-error-fallback';

export const routes: Routes = [
  {
    path: 'products/:id',
    component: ProductDetails,
    errorComponent: ProductErrorFallback,
  },
];
```

当你导航到 `/products/123` 时，如果 `ProductDetails` 在创建或渲染期间抛出错误，Angular 路由器就会改为在 `<router-outlet>` 中实例化 `ProductErrorFallback`。

::: info 注意
只有在启用错误边界之后，`errorComponent` 才会生效。请参阅[全局错误边界配置](#global-error-boundary-configuration)。

:::

::: info 注意
路由组件可以使用 `loadComponent` 延迟加载（lazy loading），而 `errorComponent` 则不同，它必须在路由配置中立即加载（eagerly loaded）。

:::

---

## 创建错误后备组件 {#create-an-error-fallback-component}

错误后备组件就是一个标准的 Angular 组件，它可以接收所捕获错误的详细信息。

### 通过输入访问错误详情 {#access-error-details-with-an-input}

你可以声明一个 `error` 输入（input）来接收捕获到的错误对象：

```ts [product-error-fallback.ts]
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-product-error-fallback',
  template: `
    <div class="error-card">
      <h3>Failed to load product</h3>
      <p>{{ error()?.message }}</p>
    </div>
  `,
})
export class ProductErrorFallback {
  readonly error = input<Error>();
}
```

::: info 注意
如果路由配置中包含名为 `error` 的参数、查询参数或路由数据，那么对于错误组件的 `error` 输入，捕获到的运行时 `Error` 始终优先。

:::

::: warning 重要
如果 `errorComponent` 本身在创建或渲染期间抛出错误，`RouterOutlet` 不会再次捕获它。该异常会从出口向外冒泡到根 `ErrorHandler`（或外层的[模板 `@boundary` 块](/guide/templates/error-boundaries)），以防止出现无限的错误循环。

:::

## 路由参数和数据绑定 {#route-parameter-and-data-binding}

使用 `withComponentInputBinding()` 时，Angular 路由器同样会把路由参数和静态数据绑定（binding）到 `errorComponent` 的输入上。这样你就可以在错误 UI 中显示上下文信息：

```ts [product-error-fallback.ts]
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-product-error-fallback',
  template: `
    <div class="error-card">
      <h3>Failed to load product #{{ id() }}</h3>
      <p>{{ error()?.message }}</p>
    </div>
  `,
})
export class ProductErrorFallback {
  readonly id = input<string>();
  readonly error = input<Error>();
}
```

## 全局错误边界配置 {#global-error-boundary-configuration}

在 `provideRouter` 中使用 `withErrorBoundaries` 特性为应用启用路由器错误边界。如果不启用，路由的 `errorComponent` 会被忽略：

```ts [app.config.ts]
import {ApplicationConfig, inject} from '@angular/core';
import {provideRouter, withComponentInputBinding, withErrorBoundaries} from '@angular/router';
import {routes} from './app.routes';
import {GlobalErrorFallback} from './global-error-fallback';
import {AnalyticsService} from './analytics.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withErrorBoundaries({
        // 用于未定义自身 errorComponent 的路由的默认后备组件
        defaultErrorComponent: GlobalErrorFallback,

        // 每当捕获到路由错误时调用的全局遥测钩子
        onError: (error, details) => {
          inject(AnalyticsService).logException(error, details);
        },
      }),
    ),
  ],
};
```

### 选项 {#options}

| 选项                    | 类型                                             | 说明                                                                                                                                 |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `defaultErrorComponent` | `Type<unknown>`                                  | 当未定义自身 `errorComponent` 的路由抛出错误时，要渲染的默认后备组件。                                                               |
| `onError`               | `(error: Error, details?: ErrorDetails) => void` | 每当路由器错误边界捕获到任何错误时调用的全局回调，非常适合向监控服务发送遥测数据。                                                   |

---

## 使用 `RedirectCommand` 进行重定向 {#redirecting-with-redirectcommand}

当身份验证失败或某种数据条件要求导航到另一个页面时，组件和路由资源可以抛出 `RedirectCommand`：

```ts [user-profile.ts]
import {Component, inject, resource} from '@angular/core';
import {Router, RedirectCommand} from '@angular/router';

@Component({
  selector: 'app-user-profile',
  template: `...`,
})
export class UserProfile {
  private router = inject(Router);

  userData = resource({
    loader: async () => {
      const response = await fetch('/api/user');
      if (response.status === 401) {
        // 未授权时自动重定向到 /login
        throw new RedirectCommand(this.router.parseUrl('/login'));
      }
      return response.json();
    },
  });
}
```

当抛出 `RedirectCommand` 时：

1. `RouterOutlet` 会捕获该命令，并发起到指定重定向（redirect）目标的导航。
2. 如果存在嵌套出口或模板错误边界，Angular 会对该命令去重，确保导航只触发一次。
3. 在过渡（transition）期间会渲染错误组件（如果已配置）。

::: info 注意
如果抛出了 `RedirectCommand` 但没有配置 `errorComponent`，路由器会发起导航，并有意吞掉该错误，以免它被全局 `ErrorHandler` 记录为崩溃。

:::

## 错误边界的作用范围与导航错误 {#error-boundary-scope-vs-navigation-errors}

理解**视图层错误**和**导航管道错误**之间的区别会很有帮助：

- **视图层错误**（错误边界）：发生在组件构造函数、依赖注入、生命周期钩子（lifecycle hook，如 `ngOnInit`）、模板表达式以及组件的 `resource()` 加载器中。这些错误会被 `RouterOutlet` 捕获，并显示 `errorComponent`。
- **导航管道错误**（`NavigationError`）：发生在路由激活之前，例如 `canActivate` / `canMatch` 守卫失败，或路由的 `resolve` 数据函数失败。这些错误会在到达出口之前中止导航过渡，可以使用 `withNavigationErrorHandler` 进行自定义处理。

::: info 注意
当错误边界显示 `errorComponent` 时，为该路由配置的 `canDeactivate` 守卫会在离开时运行。守卫的 `component` 参数接收的是当前激活的 `errorComponent` 实例。如果你的守卫会访问组件特有的属性或方法，请先检查组件类型，或者安全地处理错误组件实例。

:::

## 后续步骤 {#next-steps}

- [模板错误边界](/guide/templates/error-boundaries)
- [使用出口显示路由](/guide/routing/show-routes-with-outlets)
- [重定向路由](/guide/routing/redirecting-routes)
- [使用资源获取数据](/guide/routing/data-fetching-with-resources)

