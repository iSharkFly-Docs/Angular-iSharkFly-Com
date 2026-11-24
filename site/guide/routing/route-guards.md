# 使用守卫控制路由访问 {#control-route-access-with-guards}

::: danger 严重
永远不要把客户端守卫当作访问控制的唯一手段。在浏览器中运行的所有 JavaScript 都可能被运行该浏览器的用户修改。除了客户端守卫之外，务必始终在服务端强制执行用户授权。

:::

路由守卫（route guard）是一些函数，用于控制用户能否导航（navigation）到某个路由（route）或离开某个路由。它们就像检查站，决定用户能否访问特定路由。路由守卫的常见用例包括身份验证和访问控制。

## 创建路由守卫 {#creating-a-route-guard}

你可以使用 Angular CLI 生成路由守卫：

```bash
ng generate guard CUSTOM_NAME
```

该命令会提示你选择要使用哪种[路由守卫类型](#types-of-route-guards)，然后创建对应的 `CUSTOM_NAME-guard.ts` 文件。

::: tip 提示
你也可以在 Angular 项目中单独创建一个 TypeScript 文件来手动创建路由守卫。开发者通常会在文件名中添加 `-guard.ts` 后缀，以便与其他文件区分。

:::

## 路由守卫的返回类型 {#route-guard-return-types}

所有路由守卫都共享同样的可能返回类型。这让你可以灵活地控制导航：

| 返回类型                        | 说明                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `boolean`                       | `true` 允许导航，`false` 阻止导航（关于 `CanMatch` 路由守卫请参阅注意） |
| `UrlTree` 或 `RedirectCommand`  | 重定向到另一个路由，而不是阻止导航                                    |
| `Promise<T>` 或 `Observable<T>` | 路由器使用第一个发出的值，然后取消订阅                         |

::: info 注意
路由守卫必须发出一个值。没有发出任何值就完成的 `Observable`（例如 `EMPTY` 或任何 `Observable<never>`）会让路由器（router）得不到结果，导致导航失败并抛出 RxJS `EmptyError`。这种情况通常来自被拦截器（interceptor）取消的请求。如果你的数据源可能不发出值就完成，请使用 `defaultIfEmpty(false)` 为它提供一个值。

:::

::: info 注意
`CanMatch` 有所不同。当它返回 `false` 时，Angular 会尝试其他匹配的路由，而不是阻止导航。

:::

## 路由守卫的类型 {#types-of-route-guards}

Angular 提供了四种路由守卫，各自用于不同的目的：

- [CanActivate](#canactivate)
- [CanActivateChild](#canactivatechild)
- [CanDeactivate](#candeactivate)
- [CanMatch](#canmatch)


所有守卫都可以访问[在路由级别提供的服务](/guide/di/defining-dependency-providers#route-providers)，也可以通过 `route` 参数访问路由相关的信息。

### CanActivate {#canactivate}

`CanActivate` 守卫决定用户能否访问某个路由。它最常用于身份验证和授权。

它可以访问以下默认参数：

- `route`: `ActivatedRouteSnapshot` - 包含正在激活的路由的信息
- `state`: `RouterStateSnapshot` - 包含路由器正在导航前往的状态，而不是当前状态（当前状态请使用 `Router.routerState`）

它可以返回[标准的守卫返回类型](#route-guard-return-types)。

```ts
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
```

::: tip 提示
如果需要重定向（redirect）用户，请返回 [`URLTree`](https://angular.dev/api/router/UrlTree) 或 [`RedirectCommand`](https://angular.dev/api/router/RedirectCommand)。**不要**先返回 `false`，再以编程方式 `navigate` 用户。

:::

更多信息请参阅 [CanActivateFn 的 API 文档](https://angular.dev/api/router/CanActivateFn)。

### CanActivateChild {#canactivatechild}

`CanActivateChild` 守卫决定用户能否访问某个父路由下的子路由。当你想保护整个嵌套路由区域时，这会很有用。换句话说，`canActivateChild` 会对*所有*子路由运行。如果某个子组件下面还有另一个子组件，`canActivateChild` 会对它们各运行一次。

它可以访问以下默认参数：

- `childRoute`: `ActivatedRouteSnapshot` - 包含正在激活的子路由的“未来”快照信息（即路由器正尝试导航前往的状态）
- `state`: `RouterStateSnapshot` - 包含路由器正在导航前往的状态，而不是当前状态（当前状态请使用 `Router.routerState`）

它可以返回[标准的守卫返回类型](#route-guard-return-types)。

```ts
export const adminChildGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  return authService.hasRole('admin');
};
```

更多信息请参阅 [CanActivateChildFn 的 API 文档](https://angular.dev/api/router/CanActivateChildFn)。

### CanDeactivate {#candeactivate}

`CanDeactivate` 守卫决定用户能否离开某个路由。一个常见场景是阻止用户在表单未保存时离开。

它可以访问以下默认参数：

- `component`: `T` - 正在停用的组件（component）实例
- `currentRoute`: `ActivatedRouteSnapshot` - 包含当前路由的信息
- `currentState`: `RouterStateSnapshot` - 包含当前的路由器状态
- `nextState`: `RouterStateSnapshot` - 包含即将导航前往的下一个路由器状态

它可以返回[标准的守卫返回类型](#route-guard-return-types)。

```ts
export const unsavedChangesGuard: CanDeactivateFn<Form> = (
  component: Form,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot,
) => {
  return component.hasUnsavedChanges()
    ? confirm('You have unsaved changes. Are you sure you want to leave?')
    : true;
};
```

更多信息请参阅 [CanDeactivateFn 的 API 文档](https://angular.dev/api/router/CanDeactivateFn)。

### CanMatch {#canmatch}

`CanMatch` 守卫决定在路径匹配过程中某个路由能否被匹配。与其他守卫不同，被拒绝时会继续尝试其他匹配的路由，而不是完全阻止导航。这对于功能开关、A/B 测试或有条件地加载路由很有用。

它可以访问以下默认参数：

- `route`: `Route` - 正在评估的路由配置
- `segments`: `UrlSegment[]` - 尚未被之前的父路由评估消费的 URL 片段
- `currentSnapshot: PartialMatchRouteSnapshot` - 匹配过程进行到此时的当前路由快照

它可以返回[标准的守卫返回类型](#route-guard-return-types)，但当它返回 `false` 时，Angular 会尝试其他匹配的路由，而不是完全阻止导航。

```ts
export const featureToggleGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[],
  currentSnapshot: PartialMatchRouteSnapshot,
) => {
  const featureService = inject(FeatureService);
  return featureService.isFeatureEnabled('newDashboard');
};
```

它还可以让你为同一路径使用不同的组件。

```ts [routes.ts]
const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboard,
    canMatch: [adminGuard],
  },
  {
    path: 'dashboard',
    component: UserDashboard,
    canMatch: [userGuard],
  },
];
```

在这个例子中，当用户访问 `/dashboard` 时，会使用第一个通过对应守卫的路由。

更多信息请参阅 [CanMatchFn 的 API 文档](https://angular.dev/api/router/CanMatchFn)。

## 把守卫应用到路由上 {#applying-guards-to-routes}

创建好路由守卫后，需要在路由定义中配置它们。

守卫在路由配置中以数组的形式指定，这样就可以为单个路由应用多个守卫。路由器会按照守卫在数组中出现的顺序启动它们，但不会等一个守卫完成后再启动下一个。因此，返回 `Promise` 或 `Observable` 的守卫会并发运行。

数组顺序决定了哪个结果优先。只有每个守卫都返回 `true` 时导航才会继续。否则，路由器会采用数组中第一个没有返回 `true` 的守卫的结果，即使后面的守卫更早完成也是如此。

::: info 注意
由于异步守卫会并发运行，守卫不能依赖同一数组中靠前的守卫所做的工作，例如加载当前用户。请把这类工作放到两个守卫都使用的服务（service）中，或者把这些检查合并到一个守卫里。

:::

```ts
import {Routes} from '@angular/router';
import {authGuard} from './guards/auth.guard';
import {adminGuard} from './guards/admin.guard';
import {canDeactivateGuard} from './guards/can-deactivate.guard';
import {featureToggleGuard} from './guards/feature-toggle.guard';

const routes: Routes = [
  // 基本的 CanActivate - 需要身份验证
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },

  // 多个 CanActivate 守卫 - 需要身份验证并且具有管理员角色
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, adminGuard],
  },

  // CanActivate + CanDeactivate - 受保护的路由，并检查未保存的更改
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
    canDeactivate: [canDeactivateGuard],
  },

  // CanActivateChild - 保护所有子路由
  {
    path: 'users', // /user - 不受保护
    canActivateChild: [authGuard],
    children: [
      // /users/list - 受保护
      {path: 'list', component: UserList},
      // /users/detail/:id - 受保护
      {path: 'detail/:id', component: UserDetail},
    ],
  },

  // CanMatch - 根据功能开关有条件地匹配路由
  {
    path: 'beta-feature',
    component: BetaFeature,
    canMatch: [featureToggleGuard],
  },

  // 测试版功能被禁用时的后备路由
  {
    path: 'beta-feature',
    component: ComingSoon,
  },
];
```
