# 使用资源获取数据

::: warning 重要
路由资源目前处于[开发者预览](/reference/releases#developer-preview)阶段。

:::

Angular 路由器（router）通过 `resources` 路由配置与 Angular 信号（signal）集成。这让你可以使用 `Resource` API 以响应式的方式获取数据。

## 为什么要使用路由资源？

与传统的[数据解析器（resolver）](/guide/routing/data-resolvers)相比，路由资源（resource）有以下几个优势：

- **并行执行**：所有匹配路由上的路由资源会并发加载，而不是一次加载一个路由。
- **非阻塞数据加载**：使用 `nonBlocking()` 可以立即激活路由，并在数据于后台加载时渲染加载骨架屏或其他 UI 状态。
- **无需重新导航即可重新加载**：在单个资源上调用 `.reload()`，或更新信号参数，就能刷新数据，而无需重新运行守卫或重新匹配路由。
- **响应式数据获取**：资源直接与 Angular 信号集成，会在信号依赖变化时自动重新求值，并暴露 `isLoading()` 和 `error()` 等响应式状态信号。

## 启用路由资源

要启用路由资源，请在路由器配置中提供 `withRouterResources()`：

```ts
import {provideRouter, withComponentInputBinding, withRouterResources} from '@angular/router';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [provideRouter(routes, withComponentInputBinding(), withRouterResources())],
});
```

::: tip 提示
启用 `withComponentInputBinding()`，这样路由器就能把解析出的资源直接绑定到组件（component）的输入（input）上。

:::

## 定义路由资源

你可以使用 `resources` 函数在路由上定义资源。该函数在注入上下文（injection context）中运行，因此可以直接在路由定义中使用 `inject()` 来访问服务（service）、API 客户端或状态存储。

```ts
import {Component, inject, input, resource} from '@angular/core';
import {Routes} from '@angular/router';
import {UserService} from './user.service';

const routes: Routes = [
  {
    path: 'user/:id',
    component: UserProfile,
    resources: (ctx) => {
      const userService = inject(UserService);
      return {
        user: resource({
          params: () => ctx.params()['id'],
          loader: ({params: id}) => userService.getUser(id),
        }),
      };
    },
  },
];

@Component({
  template: `<p>User: {{ user().name }}</p>`,
})
export class UserProfile {
  // 对于阻塞式资源，路由器只绑定其值。
  user = input.required<User>();
}
```

### `ResourceContext` 对象

`resources` 函数会接收一个 `ResourceContext`，它提供：

- 路由信号：`params`、`queryParams`、`fragment` 和 `data`。
- `resources`：一个包含从祖先路由继承的资源的信号。参见[资源继承](#resource-inheritance)。

### 支持的资源实现

`resources` 函数可以返回任何 Angular `Resource` 实现，例如 `resource()`、`rxResource()` 或自定义资源。

```ts
import {Routes} from '@angular/router';
import {rxResource} from '@angular/core/rxjs-interop';

const routes: Routes = [
  {
    path: 'user/:id',
    component: UserProfile,
    resources: (ctx) => ({
      user: rxResource({
        params: () => ctx.params()['id'],
        stream: ({params: id}) => fetchUserObservable(id),
      }),
    }),
  },
];
```

::: info 注意
`rxResource` 使用 `stream` 属性而不是 `loader` 来接受一个返回 Observable 的函数。

:::

如果你需要在配置资源之前执行异步初始化或动态导入，`resources` 函数也可以是 `async` 的，并返回一个 `Promise`：

```ts
resources: async (ctx) => {
  const injector = inject(Injector);
  const {fetchUserData} = await import('./user-api');
  return {
    user: resource({
      params: () => ctx.params()['id'],
      loader: ({params: id}) => fetchUserData(id),
      injector,
    }),
  };
},
```

## 使用信号进行细粒度的变更跟踪

资源会跟踪其 `params` 函数所读取的信号。只读取你真正需要的值，这样资源只会在该值变化时才重新获取数据：

```ts
resources: (ctx) => ({
  products: resource({
    // 只跟踪 'category' 查询参数
    params: () => ctx.queryParams()['category'],
    loader: ({params: category}) => fetchProducts(category),
  }),
}),
```

如果某次导航（navigation）只改变了无关的查询参数（例如 `?sort=desc` 或 `?page=2`），`category` 保持不变，资源就不会重新获取数据。

::: tip 提示
读取具体的属性（例如 `ctx.params()['id']`），而不是返回整个参数对象（例如 `ctx.params()`）。路由器在每次导航时都会创建一个新对象，因此返回整个对象会导致资源重新获取数据，即使其中各个值都没有变化。

:::

## 并行执行

数据解析器会从父路由到子路由依次执行。如果父路由的解析器耗时 200ms，子路由的解析器耗时 300ms，导航就会被阻塞 500ms。

匹配到的路由层级中的路由资源会并发运行，因此同样的导航只需 300ms，即最慢的那个资源所需的时间。依赖祖先路由数据的资源也会立即完成设置，而不必等待；参见[基于祖先资源链接资源](#chaining-a-resource-off-an-ancestor-resource)。

## 资源继承

每个路由都会继承其祖先路由的资源。Angular 以两种形式暴露这些继承来的资源：

| API                                                               | 包含内容                         | 行为                                                                 | 用途                                                   |
| :---------------------------------------------------------------- | :------------------------------- | :------------------------------------------------------------------- | :----------------------------------------------------- |
| `resources` 函数中的 `ctx.resources()`                            | 仅祖先资源                       | 祖先 `resources` 函数返回的原始资源。其状态始终是实时的。            | 基于祖先资源链接资源                                   |
| `ActivatedRoute.resources` 和 `ActivatedRouteSnapshot.resources`  | 路由自身的资源以及祖先资源       | 由路由器管理的只读资源。在导航挂起期间，其状态会被冻结。             | 在组件、指令或守卫中读取数据或调用 `reload()`          |

如果某个路由定义了与祖先资源同名的资源，路由自身的资源会遮蔽继承来的那个资源。

### 把继承的资源绑定到组件输入

启用 `withComponentInputBinding()` 后，路由器会把继承的资源和路由自身的资源都绑定到同名的组件输入上：

```ts
import {Component, input, resource} from '@angular/core';
import {Routes} from '@angular/router';

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
}

const routes: Routes = [
  {
    path: 'projects/:projectId',
    resources: (ctx) => ({
      project: resource({
        params: () => ctx.params()['projectId'],
        loader: ({params: id}) => fetchProject(id),
      }),
    }),
    children: [
      {
        path: 'tasks/:taskId',
        component: TaskDetail,
        resources: (ctx) => ({
          task: resource({
            params: () => ctx.params()['taskId'],
            loader: ({params: id}) => fetchTask(id),
          }),
        }),
      },
    ],
  },
];

@Component({
  template: `
    <h1>Project: {{ project().name }}</h1>
    <h2>Task: {{ task().title }}</h2>
  `,
})
export class TaskDetail {
  // 继承自父路由 'projects/:projectId'
  project = input.required<Project>();

  // 绑定自路由自身的资源
  task = input.required<Task>();
}
```

::: info 注意
当路由器把路由状态绑定到组件输入时，资源名称的优先级高于路由 `data`（包括解析出的值）、路径参数和查询参数。

:::

### 基于祖先资源链接资源

子路由经常需要先拿到祖先路由的数据，才能加载自己的数据。与其等待祖先路由加载完成，不如使用 [`chain()`](/guide/signals/resource#chaining-resources) 把子路由的 `params` 函数链接到祖先资源上。Angular 会向每个 `params` 函数传入一个包含 `chain` 的上下文对象：

```ts
import {Resource, resource} from '@angular/core';
import {Routes} from '@angular/router';

interface User {
  id: string;
  role: string;
}

const routes: Routes = [
  {
    path: 'user/:id',
    resources: (ctx) => ({
      user: resource({
        params: () => ctx.params()['id'],
        loader: ({params: id}) => fetchUser(id),
      }),
    }),
    children: [
      {
        path: 'details',
        component: UserDetails,
        resources: (ctx) => ({
          details: resource({
            // 保持加载状态，直到继承的 'user' 资源解析完成
            params: ({chain}) => chain(ctx.resources()['user'] as Resource<User>).role,
            loader: ({params: role}) => fetchRoleDetails(role),
          }),
        }),
      },
    ],
  },
];
```

::: warning 重要
切勿在外层 `resources` 函数体中直接解构或调用 `ctx.resources()`（例如 `const {user} = ctx.resources()`）。由于祖先路由是并行初始化的，而且可能是异步的，所以在路由设置期间祖先资源还不可用。在响应式上下文之外同步调用 `ctx.resources()` 会抛出错误，并导致导航失败。请始终在资源的 `params` 函数中以响应式的方式读取 `ctx.resources()`。

:::

::: info 注意
由于 `ctx.resources()` 的类型是一个由 `Resource<unknown>` 组成的记录，读取继承的资源时，请把它强制转换为对应的值类型（例如 `as Resource<User>`）。

:::

`chain()` 还会传播祖先资源的状态。如果祖先资源出错，被链接的资源会以 `ResourceDependencyError` 出错；如果该链接资源是阻塞式的，路由器会取消导航。如果祖先资源处于 `idle` 状态，被链接的资源也会变为 `idle`。

## 阻塞式与非阻塞式资源

默认情况下，`resources` 返回的每个资源都是阻塞式的：路由器会等到数据完全加载后，才激活路由和组件。

对于阻塞式资源，路由器会把解析出的值绑定到组件输入上，因此输入的类型是 `T` 而不是 `Resource<T>`。组件永远不会观察到 `loading` 状态，因为路由器会阻塞导航直到资源加载完成；也永远不会观察到 `error` 状态，因为资源出错时路由器会取消导航。

如果你想在 UI 中处理加载状态，请用 `nonBlocking()` 包装资源。路由器会立即激活组件，并把完整的 `Resource<T>` 对象绑定到组件输入上，这样你就可以访问 `isLoading()`、`error()` 和其他资源信号。

```ts
import {Component, input, Resource, resource} from '@angular/core';
import {Routes, nonBlocking} from '@angular/router';

const routes: Routes = [
  {
    path: 'reports',
    component: Reports,
    resources: () => ({
      reportData: nonBlocking(
        resource({
          loader: () => fetchHeavyReportData(),
        }),
      ),
    }),
  },
];

@Component({
  template: `
    @if (reportData().isLoading()) {
      <p>Loading...</p>
    } @else if (reportData().error()) {
      <p>Error loading report.</p>
    } @else if (reportData().hasValue()) {
      <report-view [data]="reportData().value()" />
    }
  `,
})
export class Reports {
  reportData = input.required<Resource<ReportData>>();
}
```

::: info 注意
如果阻塞式资源出错，路由器会取消导航并发出 `NavigationError` 事件。用 `nonBlocking()` 包装的资源则会完成导航，并通过其 `error()` 信号暴露失败信息。

:::

### 从资源中重定向

如果阻塞式资源需要重定向用户（例如找不到某个条目时），请在资源加载器中抛出 `RedirectCommand`。路由器会取消当前导航，并重定向到指定的 URL：

```ts
import {inject, resource} from '@angular/core';
import {RedirectCommand, Router, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'user/:id',
    component: UserProfile,
    resources: (ctx) => {
      const router = inject(Router);

      return {
        user: resource({
          params: () => ctx.params()['id'],
          loader: async ({params: id}) => {
            const user = await fetchUser(id);
            if (!user) {
              throw new RedirectCommand(router.parseUrl('/not-found'));
            }
            return user;
          },
        }),
      };
    },
  },
];
```

## 无需重新导航即可重新加载资源

使用数据解析器时，重新获取数据需要进行一次路由导航（例如使用 `onSameUrlNavigation: 'reload'` 进行导航），这会重新匹配路由并重新运行守卫和解析器。

路由资源支持两种就地刷新数据的方式：

1. **编程式重新加载**：在 `Resource` 实例上调用 `.reload()`。
2. **响应式重新加载**：更新资源的 `params` 函数所读取的某个信号（例如应用中的筛选条件或状态信号），从而重新运行加载器。

由于对于阻塞式资源，路由器只会把其值绑定到组件输入上，因此当你需要调用 `.reload()` 或查看状态信号时，请从 `ActivatedRoute` 或 `ActivatedRouteSnapshot` 中读取 `Resource` 实例：

```ts
import {Component, inject, input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  template: `
    <p>User: {{ user().name }}</p>
    <button (click)="refreshUser()">Refresh</button>
  `,
})
export class UserProfile {
  user = input.required<User>();
  private userResource = inject(ActivatedRoute).resources?.['user'];

  refreshUser() {
    // 只重新加载这个资源，而不重新导航到该路由
    this.userResource?.reload();
  }
}
```

## 导航挂起期间的过渡状态

在导航挂起期间，路由器会冻结它在 `ActivatedRoute` 上暴露的资源，从而屏蔽中间的 `loading` 和 `reloading` 状态。

如果你从 `/user/1` 导航到 `/user/2`，并且路由器复用了 `UserProfile` 组件，那么在 `/user/2` 解析完成之前，组件会继续渲染 `/user/1` 的数据。随后路由器解除对资源的冻结，UI 会直接过渡到新数据，而不会出现加载状态的闪烁。

即使 `resources` 函数返回的是 `resource()` 这样的可写资源，路由器也会以只读形式暴露这些资源。你可以读取资源信号并调用 `reload()`，但不能调用 `set()` 或 `update()`。在活动导航期间或回滚恢复期间调用 `reload()` 会返回 `false`，以免干扰路由器的过渡跟踪。

::: info 注意
冻结只适用于路由器在 `ActivatedRoute` 上暴露的资源。通过 `ctx.resources()` 获取的原始资源始终报告其实时状态，正因如此，被链接的资源才能在导航期间对祖先资源做出响应。

:::

### 取消时的回滚恢复

如果某次导航被取消（例如被守卫取消），路由器会把状态树恢复到之前的状态。这种恢复可能导致资源的信号依赖（例如路由参数）恢复为之前的值。

由于参数又变了回去，资源可能会自动触发一次新的加载，为旧参数获取数据。为了避免对已经显示过的数据闪现加载状态，路由器会在 UI 中保留之前的资源快照，直到资源在恢复后的状态下稳定下来。

::: tip 提示
把资源加载器提供的 `abortSignal` 转发给你的异步调用（例如 `fetch`）。当路由器回滚参数或有新导航取代当前导航时，挂起的请求会被干净地中止：`loader: ({params: id, abortSignal}) => fetchUser(id, {signal: abortSignal})`。

:::
