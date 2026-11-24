# 路由器生命周期与事件 {#router-lifecycle-and-events}

Angular 路由器（router）提供了一套完整的生命周期钩子（lifecycle hook）和事件，让你可以响应导航（navigation）变化，并在路由过程中执行自定义逻辑。

## 常见的路由器事件 {#common-router-events}

Angular 路由器会发出导航事件，你可以订阅这些事件来跟踪导航的生命周期。这些事件通过 `Router.events` 可观察对象提供。本节按时间顺序介绍用于导航和错误跟踪的常见路由生命周期事件。

| 事件                                              | 说明                                                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [`NavigationStart`](https://angular.dev/api/router/NavigationStart)     | 在导航开始时发生，包含所请求的 URL。                                            |
| [`RoutesRecognized`](https://angular.dev/api/router/RoutesRecognized)   | 在路由器确定哪个路由与 URL 匹配之后发生，包含路由状态信息。 |
| [`GuardsCheckStart`](https://angular.dev/api/router/GuardsCheckStart)   | 开始路由守卫阶段。路由器会评估 `canActivate` 和 `canDeactivate` 等路由守卫。  |
| [`GuardsCheckEnd`](https://angular.dev/api/router/GuardsCheckEnd)       | 表示守卫评估完成，包含评估结果（允许/拒绝）。                            |
| [`ResolveStart`](https://angular.dev/api/router/ResolveStart)           | 开始数据解析阶段。路由解析器和资源开始获取数据。                     |
| [`ResolveEnd`](https://angular.dev/api/router/ResolveEnd)               | 数据解析完成。所有必需的数据和阻塞型资源均已可用。                    |
| [`NavigationEnd`](https://angular.dev/api/router/NavigationEnd)         | 导航成功完成时的最后一个事件。路由器会更新 URL。                          |
| [`NavigationSkipped`](https://angular.dev/api/router/NavigationSkipped) | 在路由器跳过导航时发生（例如导航到相同的 URL）。                                     |

以下是常见的错误事件：

| 事件                                             | 说明                                                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`NavigationCancel`](https://angular.dev/api/router/NavigationCancel) | 在路由器取消导航时发生，通常是因为某个守卫返回了 false。                               |
| [`NavigationError`](https://angular.dev/api/router/NavigationError)   | 在导航失败时发生，原因可能是路由无效、解析器出错或阻塞型资源被拒绝。 |

完整的生命周期事件列表，请参阅[本指南中的完整表格](#all-router-events)。

## 如何订阅路由器事件 {#how-to-subscribe-to-router-events}

如果想在特定的导航生命周期事件期间运行代码，可以订阅 `router.events` 并检查事件的实例类型：

```ts
// 订阅路由器事件的示例
import {Component, inject, signal, effect} from '@angular/core';
import {Event, Router, NavigationStart, NavigationEnd} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component(/* ... */)
export class RouterEvents {
  private readonly router = inject(Router);

  constructor() {
    // 订阅路由器事件并对事件作出响应
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // 导航开始
        console.log('Navigation starting:', event.url);
      }
      if (event instanceof NavigationEnd) {
        // 导航完成
        console.log('Navigation completed:', event.url);
      }
    });
  }
}
```

::: info 注意
`@angular/router` 中的 [`Event`](https://angular.dev/api/router/Event) 类型与常规的全局 [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) 类型同名，但它与 [`RouterEvent`](https://angular.dev/api/router/RouterEvent) 类型不同。

:::

## 如何调试路由事件 {#how-to-debug-routing-events}

如果看不到事件序列，调试路由器导航问题可能会很困难。Angular 提供了一个内置的调试特性，可以把所有路由器事件记录到控制台，帮助你理解导航流程并找出问题所在。

当你需要检查路由器的事件序列时，可以启用内部导航事件的日志记录来进行调试。你可以传入一个配置选项（`withDebugTracing()`）来启用所有路由事件的详细控制台日志。

```ts
import {provideRouter, Routes, withDebugTracing} from '@angular/router';
import {bootstrapApplication} from '@angular/platform-browser';

const appRoutes: Routes = [];
bootstrapApplication(App, {
  providers: [provideRouter(appRoutes, withDebugTracing())],
});
```

更多信息请参阅 [`withDebugTracing`](https://angular.dev/api/router/withDebugTracing) 的官方文档。

## 常见用例 {#common-use-cases}

路由器事件可以在实际应用中实现许多实用的功能。下面是一些与路由器事件一起使用的常见模式。

### 加载指示器 {#loading-indicators}

在导航期间显示加载指示器：

```ts
import {Component, computed, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    @if (isNavigating()) {
      <div class="loading-bar">Loading...</div>
    }
    <router-outlet />
  `,
})
export class App {
  private router = inject(Router);
  isNavigating = computed(() => !!this.router.currentNavigation());
}
```

### 分析跟踪 {#analytics-tracking}

为分析统计跟踪页面浏览量：

```ts
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {inject, DestroyRef, Service} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';

@Service()
export class AnalyticsService {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  startTracking() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      // URL 变化时跟踪页面浏览量
      if (event instanceof NavigationEnd) {
        // 将页面浏览量发送到分析服务
        this.analytics.trackPageView(event.url);
      }
    });
  }

  private analytics = {
    trackPageView: (url: string) => {
      console.log('Page view tracked:', url);
    },
  };
}
```

### 错误处理 {#error-handling}

妥善处理导航错误并向用户提供反馈：

```ts
import {Component, inject, signal} from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationError,
  NavigationCancel,
  NavigationCancellationCode,
} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-error-handler',
  template: `
    @if (errorMessage()) {
      <div class="error-banner">
        {{ errorMessage() }}
        <button (click)="dismissError()">Dismiss</button>
      </div>
    }
  `,
})
export class ErrorHandler {
  private router = inject(Router);
  readonly errorMessage = signal('');

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.errorMessage.set('');
      } else if (event instanceof NavigationError) {
        console.error('Navigation error:', event.error);
        this.errorMessage.set('Failed to load page. Please try again.');
      } else if (event instanceof NavigationCancel) {
        console.warn('Navigation cancelled:', event.reason);
        if (event.code === NavigationCancellationCode.GuardRejected) {
          this.errorMessage.set('Access denied. Please check your permissions.');
        }
      }
    });
  }

  dismissError() {
    this.errorMessage.set('');
  }
}
```

## 所有路由器事件 {#all-router-events}

以下是 Angular 中所有可用路由器事件的完整列表，供参考。这些事件按类别组织，并按照它们在导航期间通常发生的顺序列出。

### 导航事件 {#navigation-events}

这些事件跟踪核心的导航过程：从开始，到路由识别、守卫检查和数据解析。它们让你能够了解导航生命周期每个阶段的情况。

| 事件                                                     | 说明                                                     |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| [`NavigationStart`](https://angular.dev/api/router/NavigationStart)           | 在导航开始时发生                                   |
| [`RouteConfigLoadStart`](https://angular.dev/api/router/RouteConfigLoadStart) | 在延迟加载路由配置之前发生                |
| [`RouteConfigLoadEnd`](https://angular.dev/api/router/RouteConfigLoadEnd)     | 在延迟加载的路由配置加载完成之后发生            |
| [`RoutesRecognized`](https://angular.dev/api/router/RoutesRecognized)         | 在路由器解析 URL 并识别出路由时发生 |
| [`GuardsCheckStart`](https://angular.dev/api/router/GuardsCheckStart)         | 在守卫阶段开始时发生                          |
| [`GuardsCheckEnd`](https://angular.dev/api/router/GuardsCheckEnd)             | 在守卫阶段结束时发生                            |
| [`ResolveStart`](https://angular.dev/api/router/ResolveStart)                 | 在解析阶段开始时发生                        |
| [`ResolveEnd`](https://angular.dev/api/router/ResolveEnd)                     | 在解析阶段结束时发生                          |

### 激活事件 {#activation-events}

这些事件发生在激活阶段，此时路由组件正在被实例化和初始化。路由树中的每个路由（包括父路由和子路由）都会触发激活事件。

| 事件                                                     | 说明                                   |
| --------------------------------------------------------- | --------------------------------------------- |
| [`ActivationStart`](https://angular.dev/api/router/ActivationStart)           | 在路由激活开始时发生       |
| [`ChildActivationStart`](https://angular.dev/api/router/ChildActivationStart) | 在子路由激活开始时发生 |
| [`ActivationEnd`](https://angular.dev/api/router/ActivationEnd)               | 在路由激活结束时发生         |
| [`ChildActivationEnd`](https://angular.dev/api/router/ChildActivationEnd)     | 在子路由激活结束时发生   |

### 导航完成事件 {#navigation-completion-events}

这些事件代表一次导航尝试的最终结果。每次导航都会以其中恰好一个事件结束，表明导航是成功、被取消、失败还是被跳过。

| 事件                                               | 说明                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| [`NavigationEnd`](https://angular.dev/api/router/NavigationEnd)         | 在导航成功结束时发生                            |
| [`NavigationCancel`](https://angular.dev/api/router/NavigationCancel)   | 在路由器取消导航时发生                           |
| [`NavigationError`](https://angular.dev/api/router/NavigationError)     | 在导航因意外错误而失败时发生             |
| [`NavigationSkipped`](https://angular.dev/api/router/NavigationSkipped) | 在路由器跳过导航时发生（例如导航到相同的 URL） |

### 其他事件 {#other-events}

还有一个事件发生在主导航生命周期之外，但它仍然是路由器事件系统的一部分。

| 事件                         | 说明             |
| ----------------------------- | ----------------------- |
| [`Scroll`](https://angular.dev/api/router/Scroll) | 在滚动期间发生 |

## 下一步 {#next-steps}

进一步了解[路由守卫](/guide/routing/route-guards)、[使用资源获取数据](/guide/routing/data-fetching-with-resources)以及[常见路由器任务](/guide/routing/common-router-tasks)。
