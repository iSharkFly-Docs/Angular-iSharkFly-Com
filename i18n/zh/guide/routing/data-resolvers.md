# 数据解析器

数据解析器（data resolver）让你可以在导航（navigation）到某个路由（route）之前获取数据，确保组件（component）在渲染之前就拿到所需的数据。通过预先加载关键数据，可以避免使用加载状态，并改善用户体验。

::: tip 提示
如果你的应用使用了 Angular 信号（signal），可以考虑使用[路由资源](/guide/routing/data-fetching-with-resources)，借助 `Resource` API 以响应式方式获取数据，并内置支持非阻塞的数据加载。

:::

## 什么是数据解析器？

数据解析器是一个实现了 `ResolveFn` 函数的服务（service）。它在路由激活之前运行，可以从 API、数据库或其他来源获取数据。解析出的数据会通过 `ActivatedRoute` 提供给组件。

数据解析器可以访问[在路由级别提供的服务](/guide/di/defining-dependency-providers#route-providers)，还可以通过 `route` 参数访问路由特有的信息。

## 为什么要使用数据解析器？

数据解析器能解决常见的路由难题：

- **避免空状态**：组件在加载时立即拿到数据
- **更好的用户体验**：关键数据无需显示加载转圈
- **错误处理**：在导航之前处理数据获取错误
- **数据一致性**：确保渲染前所需数据已经可用，这对 SSR 很重要

## 创建解析器

你可以编写一个 `ResolveFn` 类型的函数来创建解析器。

它接收 `ActivatedRouteSnapshot` 和 `RouterStateSnapshot` 作为参数。

下面是一个使用 [`inject`](https://angular.dev/api/core/inject) 函数、在渲染路由之前获取用户信息的解析器：

```ts
import {inject} from '@angular/core';
import {UserStore, SettingsStore} from './user-store';
import type {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import type {User, Settings} from './types';

export const userResolver: ResolveFn<User> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userStore = inject(UserStore);
  const userId = route.paramMap.get('id')!;
  return userStore.getUser(userId);
};

export const settingsResolver: ResolveFn<Settings> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const settingsStore = inject(SettingsStore);
  const userId = route.paramMap.get('id')!;
  return settingsStore.getUserSettings(userId);
};
```

## 为路由配置解析器

如果想为某个路由添加一个或多个数据解析器，可以把它们添加到路由配置的 `resolve` 键下。`Routes` 类型定义了路由配置的结构：

```ts
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'user/:id',
    component: UserDetail,
    resolve: {
      user: userResolver,
      settings: settingsResolver,
    },
  },
];
```

你可以在 [API 文档中进一步了解 `resolve` 配置](https://angular.dev/api/router/Route#resolve)。

## 在组件中访问解析出的数据

### 使用 ActivatedRoute

你可以使用 `toSignal` 函数把 `ActivatedRoute` 中的 `data` 可观察对象转换为信号，从而在组件中访问解析出的数据：

```ts
import {Component, inject, computed} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import type {User, Settings} from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `,
})
export class UserDetail {
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data, {requireSync: true});
  user = computed(() => this.data().user as User);
  settings = computed(() => this.data().settings as Settings);
}
```

### 使用 withComponentInputBinding

访问解析出的数据的另一种方式，是在用 `provideRouter` 配置路由器（router）时使用 `withComponentInputBinding()`。这样，解析出的数据就可以直接作为组件输入（input）传入：

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(App, {
  providers: [provideRouter(routes, withComponentInputBinding())],
});
```

有了这个配置，你就可以在组件中使用 `input` 函数（必需输入使用 `input.required`）定义与解析器键名匹配的输入：

```ts
import {Component, input} from '@angular/core';
import type {User, Settings} from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `,
})
export class UserDetail {
  user = input.required<User>();
  settings = input.required<Settings>();
}
```

这种方式提供了更好的类型安全，而且不必为了访问解析出的数据而注入 `ActivatedRoute`。

## 解析器中的错误处理

当导航失败时，在数据解析器中妥善处理错误非常重要。否则会产生 `NavigationError`，导致导航到当前路由失败，给用户带来糟糕的体验。

在数据解析器中处理错误主要有三种方式：

1. 在 `withNavigationErrorHandler` 中集中处理错误
2. 通过订阅路由器事件来管理错误
3. 直接在解析器中处理错误

### 在 `withNavigationErrorHandler` 中集中处理错误

[`withNavigationErrorHandler`](https://angular.dev/api/router/withNavigationErrorHandler) 特性提供了一种集中处理所有导航错误的方式，包括数据解析器失败所引发的错误。这种方式把错误处理逻辑集中在一处，避免在各个解析器中重复编写错误处理代码。

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, Router, withNavigationErrorHandler} from '@angular/router';
import {inject} from '@angular/core';
import {routes} from './app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(
      routes,
      withNavigationErrorHandler((error) => {
        const router = inject(Router);

        if (error.error?.message) {
          console.error('Navigation error occurred:', error.error.message);
        }

        router.navigate(['/error']);
      }),
    ),
  ],
});
```

有了这个配置，解析器可以专注于获取数据，错误场景则交给集中的处理器来管理：

```ts
export const userResolver: ResolveFn<User> = (route) => {
  const userStore = inject(UserStore);
  const userId = route.paramMap.get('id')!;
  // 无需显式处理错误——让它向上冒泡即可
  return userStore.getUser(userId);
};
```

### 通过订阅路由器事件来管理错误

你也可以订阅路由器事件并监听 `NavigationError` 事件来处理解析器错误。这种方式让你能更细粒度地控制错误处理，并实现自定义的错误恢复逻辑。

```ts
import {Component, inject, signal} from '@angular/core';
import {Router, NavigationError, RouterOutlet} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    @if (errorMessage()) {
      <div class="error-banner">
        {{ errorMessage() }}
        <button (click)="retryNavigation()">Retry</button>
      </div>
    }
    <router-outlet />
  `,
})
export class App {
  private router = inject(Router);
  private lastFailedUrl = signal('');

  private navigationErrors = toSignal(
    this.router.events.pipe(
      map((event) => {
        if (event instanceof NavigationError) {
          this.lastFailedUrl.set(event.url);

          if (event.error) {
            console.error('Navigation error', event.error);
          }

          return 'Navigation failed. Please try again.';
        }
        return '';
      }),
    ),
    {initialValue: ''},
  );

  errorMessage = this.navigationErrors;

  retryNavigation() {
    if (this.lastFailedUrl()) {
      this.router.navigateByUrl(this.lastFailedUrl());
    }
  }
}
```

这种方式在以下情况下特别有用：

- 为失败的导航实现自定义重试逻辑
- 根据失败类型显示特定的错误消息
- 出于分析目的跟踪导航失败

### 直接在解析器中处理错误

下面是 `userResolver` 的更新版示例，它会记录错误，并使用 `Router` 服务导航回通用的 `/users` 页面：

```ts
import {inject} from '@angular/core';
import {ResolveFn, RedirectCommand, Router} from '@angular/router';
import {catchError, of, EMPTY} from 'rxjs';
import {UserStore} from './user-store';
import type {User} from './types';

export const userResolver: ResolveFn<User | RedirectCommand> = (route) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const userId = route.paramMap.get('id')!;

  return userStore.getUser(userId).pipe(
    catchError((error) => {
      console.error('Failed to load user:', error);
      return of(new RedirectCommand(router.parseUrl('/users')));
    }),
  );
};
```

## 导航加载方面的考量

虽然数据解析器避免了组件内部的加载状态，但它也带来了另一种用户体验方面的考量：解析器执行期间导航会被阻塞。用户从点击链接到看到新路由之间可能会感到延迟，在网络请求较慢时尤其如此。

::: tip 提示
如果想避免阻塞导航，并立即渲染带有骨架屏或加载指示器的组件，请使用[非阻塞的路由资源](/guide/routing/data-fetching-with-resources#blocking-and-non-blocking-resources)。

:::

### 提供导航反馈

为了在解析器执行期间改善用户体验，你可以监听路由器事件并显示加载指示器：

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

这种方式可以确保在解析器获取数据时，用户能看到导航正在进行的视觉反馈。

## 最佳实践

- **保持解析器轻量**：解析器应该只获取关键数据，而不是页面可能需要的所有数据
- **处理错误**：始终记得妥善处理错误，为用户提供尽可能好的体验
- **使用缓存**：考虑缓存解析出的数据以提升性能
- **考虑导航体验**：由于获取数据期间导航会被阻塞，请为解析器的执行实现加载指示器
- **设置合理的超时**：避免解析器无限期挂起并阻塞导航
- **类型安全**：为解析出的数据使用 TypeScript 接口

## 在子解析器中读取父级解析出的数据

解析器按从父到子的顺序依次执行。当父路由定义了解析器时，它解析出的数据可供随后运行的子解析器使用。

::: info 注意
由于解析器按从父到子的顺序依次执行，每多一层嵌套都会增加总的导航等待时间（形成网络瀑布）。如果子路由不依赖父级数据，可以考虑使用[路由资源](/guide/routing/data-fetching-with-resources)，它会在所有路由之间并发执行。

:::

```ts
import {inject} from '@angular/core';
import {provideRouter, ActivatedRouteSnapshot} from '@angular/router';
import {userResolver} from './resolvers';
import {UserPosts} from './pages';
import {PostService} from './services';
import type {User} from './types';

provideRouter([
  {
    path: 'users/:id',
    resolve: {user: userResolver}, // 父路由中的 user 解析器
    children: [
      {
        path: 'posts',
        component: UserPosts,
        // 运行此解析器时，route.data.user 已经可用
        resolve: {
          posts: (route: ActivatedRouteSnapshot) => {
            const postService = inject(PostService);
            const user = route.parent?.data['user'] as User; // 父级数据
            const userId = user.id;
            return postService.getPostByUser(userId);
          },
        },
      },
    ],
  },
]);
```

## 下一步

- [使用资源获取数据](/guide/routing/data-fetching-with-resources)
- [使用守卫控制路由访问](/guide/routing/route-guards)

