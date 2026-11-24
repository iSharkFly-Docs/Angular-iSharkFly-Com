# 自定义路由行为 {#customizing-route-behavior}

Angular 路由器（router）提供了强大的扩展点，让你可以自定义应用中路由（route）的行为方式。虽然默认的路由行为对大多数应用来说已经足够好用，但出于性能优化、特殊的 URL 处理或复杂路由逻辑等特定需求，往往需要自定义实现。

当你的应用有以下需求时，自定义路由就会很有价值：

- 在多次导航（navigation）之间**保留组件状态**，以避免重新获取数据
- 根据用户行为或网络状况**有策略地延迟加载模块**
- **集成外部 URL**，或让 Angular 路由与旧系统并存
- 根据运行时条件进行**动态路由匹配**，
  而不局限于简单的路径模式

::: info 注意
在实现自定义策略之前，请先确认默认的路由器行为确实无法满足你的需求。Angular 的默认路由已针对常见用例做了优化，能在性能和简洁性之间取得最佳平衡。自定义路由策略可能会增加代码复杂度，如果管理不当，还可能对内存占用造成性能影响。

:::

## 路由器配置选项 {#router-configuration-options}

`withRouterConfig` 或 `RouterModule.forRoot` 允许你提供额外的 `RouterConfigOptions` 来调整路由器的行为。

### 处理被取消的导航 {#handle-canceled-navigations}

`canceledNavigationResolution` 控制导航被取消时路由器如何恢复浏览器历史记录。默认值是 `'replace'`，它会使用 `location.replaceState` 恢复到导航之前的 URL。实际上，这意味着只要地址栏已经因为导航而更新（例如使用浏览器的后退或前进按钮时），如果导航失败或被守卫拒绝，该历史记录条目就会被“回滚”后的内容覆盖。
改为 `'computed'` 后，进行中的历史记录索引会与 Angular 导航保持同步，因此取消一次后退按钮导航会触发一次前进导航（反之亦然），从而回到原来的页面。

当你的应用使用 `urlUpdateStrategy: 'eager'`，或守卫经常取消由浏览器发起的 popstate 导航时，这个设置最为有用。

```ts
provideRouter(routes, withRouterConfig({canceledNavigationResolution: 'computed'}));
```

### 响应相同 URL 的导航 {#react-to-same-url-navigations}

`onSameUrlNavigation` 配置当用户请求导航到当前 URL 时应该发生什么。默认值 `'ignore'` 会跳过处理，而 `'reload'` 会指示路由器在其导航管道中处理该 URL，而不是跳过它。守卫和解析器（resolver）是否重新运行由 [`runGuardsAndResolvers`](https://angular.dev/api/router/RunGuardsAndResolvers) 决定，组件是否复用则由[路由复用策略](#route-reuse-strategy)决定。

当你希望在 URL 不变的情况下，重复点击列表筛选器、左侧导航项或刷新按钮也能触发重新获取数据时，这个选项很有用。

```ts
provideRouter(routes, withRouterConfig({onSameUrlNavigation: 'reload'}));
```

你也可以针对单次导航而不是全局控制这一行为。这样就可以保留默认的 `'ignore'`，同时只在特定用例中有选择地启用重新加载行为：

```ts
router.navigate(['/some-path'], {onSameUrlNavigation: 'reload'});
```

::: tip 提示
如果你使用[路由资源](/guide/routing/data-fetching-with-resources#reloading-resources-without-renavigation)，就可以通过在资源上调用 `.reload()`，或更新 `params` 中读取的信号来按需刷新数据，而无需配置 `onSameUrlNavigation`，也无需触发路由器导航。

:::

### 控制参数继承 {#control-parameter-inheritance}

`paramsInheritanceStrategy` 定义了路由参数和数据如何从父路由向下传递。

默认情况下（`'always'`），子路由会自动继承父路由的参数、路由数据和解析出的值。这确保了矩阵参数、路由数据和解析出的值在路由树的更深层级中依然可用——当你需要在多个特性区域之间共享上下文标识符时非常方便，例如：

```text
/org/:orgId/projects/:projectId/customers/:customerId
```

```ts
export const routes: Routes = [
  {
    path: 'org/:orgId',
    component: Organization,
    children: [
      {
        path: 'projects/:projectId',
        component: Project,
        children: [
          {
            path: 'customers/:customerId',
            component: Customer,
          },
        ],
      },
    ],
  },
];
```

```ts
@Component({/* ... */})
export class Customer {
  private route = inject(ActivatedRoute);

  // 所有父级参数都可以直接获取
  orgId = this.route.snapshot.params['orgId'];
  projectId = this.route.snapshot.params['projectId'];
  customerId = this.route.snapshot.params['customerId'];
}
```

要恢复旧版行为，请把 `paramsInheritanceStrategy` 设置为 `'emptyOnly'`。使用 `'emptyOnly'` 时，只有当子路由的路径为空，或父路由没有声明组件时，子路由才会继承参数：

```ts
provideRouter(routes, withRouterConfig({paramsInheritanceStrategy: 'emptyOnly'}));
```

这种情况下，`Customer` 组件必须从其祖先路由中读取父级参数：

```ts
@Component({/* ... */})
export class Customer {
  private route = inject(ActivatedRoute);

  orgId = this.route.parent?.parent?.snapshot.params['orgId'];
  projectId = this.route.parent?.snapshot.params['projectId'];
  customerId = this.route.snapshot.params['customerId'];
}
```

### 决定 URL 何时更新 {#decide-when-the-url-updates}

`urlUpdateStrategy` 决定 Angular 何时写入浏览器地址栏。默认值 `'deferred'` 会等到导航成功后再更改 URL。使用 `'eager'` 则会在导航开始时立即更新。立即更新使得在导航因守卫或错误而失败时更容易展示所尝试的 URL，但如果你有长时间运行的守卫，地址栏可能会短暂显示一个正在处理中的 URL。

如果你的分析管道需要看到所尝试的路由（即使它被守卫拦截了），可以考虑使用这个选项。

```ts
provideRouter(routes, withRouterConfig({urlUpdateStrategy: 'eager'}));
```

### 选择默认的查询参数处理方式 {#choose-default-query-parameter-handling}

`defaultQueryParamsHandling` 设置了当 `Router.createUrlTree` 调用未指定 `queryParamsHandling` 时的回退行为。`'replace'` 是默认值，会替换掉现有的查询字符串。`'merge'` 会把提供的值与当前值合并，而 `'preserve'` 会保留现有的查询参数，并忽略你传给该调用的任何 `queryParams`。

```ts
provideRouter(routes, withRouterConfig({defaultQueryParamsHandling: 'merge'}));
```

这对于搜索和筛选页面特别有用，可以在提供额外参数时自动保留现有的筛选条件。

### 配置末尾斜杠的处理方式 {#configure-trailing-slash-handling}

默认情况下，`Location` 服务（service）在读取 URL 时会去掉末尾的斜杠。

你可以通过在应用中提供 `TrailingSlashPathLocationStrategy`，让 `Location` 服务在写入浏览器的所有 URL 上强制添加末尾斜杠。

```ts
import {LocationStrategy, TrailingSlashPathLocationStrategy} from '@angular/common';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [{provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy}],
});
```

你也可以通过在应用中提供 `NoTrailingSlashPathLocationStrategy`，强制 `Location` 服务在写入浏览器的所有 URL 上都不带末尾斜杠。

```ts
import {LocationStrategy, NoTrailingSlashPathLocationStrategy} from '@angular/common';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [{provide: LocationStrategy, useClass: NoTrailingSlashPathLocationStrategy}],
});
```

这些策略只影响写入浏览器的 URL。
`Location.path()` 和 `Location.normalize()` 在读取 URL 时仍会去掉末尾斜杠。

Angular 路由器提供了四个主要的自定义领域：

- [路由复用策略](#route-reuse-strategy)
- [预加载策略](#preloading-strategy)
- [URL 处理策略](#url-handling-strategy)
- [自定义路由匹配器](#custom-route-matchers)


## 路由复用策略 {#route-reuse-strategy}

路由复用策略控制 Angular 在导航期间是销毁并重新创建组件（component），还是保留它们以供复用。默认情况下，Angular 会在离开某个路由时销毁组件实例，并在导航回来时创建新的实例。

### 何时实现路由复用 {#when-to-implement-route-reuse}

自定义路由复用策略适用于有以下需求的应用：

- **保留表单状态** - 当用户离开后再返回时，保留填写了一部分的表单
- **保留开销大的数据** - 避免重新获取大型数据集或重新进行复杂计算
- **保持滚动位置** - 在长列表或无限滚动实现中保留滚动位置
- **类似标签页的界面** - 在标签页之间切换时保持组件状态

### 创建自定义路由复用策略 {#creating-a-custom-route-reuse-strategy}

Angular 的 `RouteReuseStrategy` 类让你可以通过“分离的路由句柄（detached route handle）”这一概念来自定义导航行为。

“分离的路由句柄”是 Angular 用来存储组件实例及其整个视图层次结构的方式。当一个路由被分离时，Angular 会在内存中保留该组件实例、它的子组件以及所有相关状态。之后导航回该路由时，可以重新附加这些被保留的状态。

`RouteReuseStrategy` 类提供了以下方法来控制路由组件的生命周期：

| 方法                                                                           | 说明                                                                                                        |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| [`shouldDetach`](https://angular.dev/api/router/RouteReuseStrategy#shouldDetach)                   | 决定在离开某个路由时，是否应该存储它以供以后复用                                                            |
| [`store`](https://angular.dev/api/router/RouteReuseStrategy#store)                                 | 当 `shouldDetach` 返回 true 时，存储分离的路由句柄                                                          |
| [`shouldAttach`](https://angular.dev/api/router/RouteReuseStrategy#shouldAttach)                   | 决定在导航到某个已存储的路由时，是否应该重新附加它                                                          |
| [`retrieve`](https://angular.dev/api/router/RouteReuseStrategy#retrieve)                           | 返回之前存储的路由句柄，以便重新附加                                                                        |
| [`shouldReuseRoute`](https://angular.dev/api/router/RouteReuseStrategy#shouldReuseRoute)           | 决定路由器在导航期间是否应该复用当前路由实例，而不是销毁它                                                  |
| [`shouldDestroyInjector`](https://angular.dev/api/router/RouteReuseStrategy#shouldDestroyInjector) | 决定当某个分离的路由不再被存储时，路由器是否应该销毁它的注入器                                              |

下面的例子演示了一个自定义路由复用策略，它会根据路由元数据有选择地保留组件状态：

```ts
import {
  RouteReuseStrategy,
  Route,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
} from '@angular/router';
import {Injectable} from '@angular/core';

@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers = new Map<Route | null, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // 决定是否应该存储某个路由以供以后复用
    return route.data['reuse'] === true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // 当 shouldDetach 返回 true 时，存储分离的路由句柄
    if (handle && route.data['reuse'] === true) {
      const key = this.getRouteKey(route);
      this.handlers.set(key, handle);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // 检查是否应该重新附加某个已存储的路由
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true && this.handlers.has(key);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // 返回已存储的路由句柄，以便重新附加
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true ? (this.handlers.get(key) ?? null) : null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // 决定路由器是否应该复用当前路由实例
    return future.routeConfig === curr.routeConfig;
  }

  private getRouteKey(route: ActivatedRouteSnapshot): Route | null {
    return route.routeConfig;
  }
}
```

::: warning 重要
如果自定义的 `RouteReuseStrategy` 分离了某个路由，却没有同时分离它所依赖资源的那些祖先路由，那么继承的路由[资源](/guide/routing/data-fetching-with-resources#resource-inheritance)将无法正常工作。

:::

### 手动销毁分离的路由句柄 {#manually-destroying-detached-route-handles}

在实现自定义 `RouteReuseStrategy` 时，如果你决定丢弃某个 `DetachedRouteHandle` 而不重新附加它，可能需要手动销毁它。例如，如果你的策略有缓存大小限制，或者会在一段时间后让句柄过期，就必须确保组件及其状态被正确销毁，以避免内存泄漏。

由于 `DetachedRouteHandle` 是一个不透明类型，你无法直接在它上面调用销毁方法。请改用路由器提供的 `destroyDetachedRouteHandle` 函数。

```ts
import {destroyDetachedRouteHandle} from '@angular/router';

// ……在你的策略内部
if (this.handles.size > MAX_CACHE_SIZE) {
  const handle = this.handles.get(oldestKey);
  if (handle) {
    destroyDetachedRouteHandle(handle);
    this.handles.delete(oldestKey);
  }
}
```

::: info 注意
当涉及 `canMatch` 守卫时，避免使用路由路径作为键，因为这可能导致重复的条目。

:::

### 自动清理未使用的路由注入器 {#automatic-cleanup-of-unused-route-injectors}

默认情况下，即使分离路由已不再被 `RouteReuseStrategy` 存储，Angular 也不会销毁它们的注入器（injector）。这主要是因为大多数应用通常并不需要这种级别的内存管理。

要启用对未使用路由注入器的自动清理，可以在路由器配置中使用 `withAutoCleanupInjectors` 特性。该特性会在导航之后检查策略当前存储了哪些路由，并销毁所有当前未被复用策略存储的分离路由的注入器。

```ts
import {provideRouter, withAutoCleanupInjectors} from '@angular/router';
import {ApplicationConfig} from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withAutoCleanupInjectors())],
};
```

如果你没有提供自定义 `RouteReuseStrategy`，或者你的自定义策略继承自 `BaseRouteReuseStrategy`，那么现在当路由处于非活动状态时，注入器就会被销毁。

#### 使用自定义 `RouteReuseStrategy` 进行清理 {#cleanup-with-a-custom-routereusestrategy}

如果你的应用使用了自定义 `RouteReuseStrategy`，*并且*该策略没有继承 `BaseRouteReuseStrategy`，就必须实现 `shouldDestroyInjector`，告诉路由器哪些路由的注入器应该被销毁：

```ts
@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  // ……其他方法

  shouldDestroyInjector(route: Route): boolean {
    return !route.data['retainInjector'];
  }
}
```

如果你的策略会存储 `DetachedRouteHandle`，还需要把这些句柄告知路由器，以免它销毁该分离句柄所需的任何注入器：

```ts
@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private readonly handles = new Map<Route, DetachedRouteHandle>();

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null) {
    if (handle) {
      this.handles.set(route.routeConfig!, handle);
    }
  }

  retrieveStoredRouteHandles(): DetachedRouteHandle[] {
    return Array.from(this.handles.values());
  }

  // ……其他方法
}
```

### 配置路由以使用自定义路由复用策略 {#configuring-a-route-to-use-a-custom-route-reuse-strategy}

路由可以通过路由配置中的元数据选择启用复用行为。这种方式让复用逻辑与组件代码分离，因此无需修改组件就能轻松调整行为：

```ts
export const routes: Routes = [
  {
    path: 'products',
    component: ProductList,
    data: {reuse: true}, // 组件状态在多次导航之间保持
  },
  {
    path: 'products/:id',
    component: ProductDetail,
    // 没有 reuse 标志——每次导航都会重新创建组件
  },
  {
    path: 'search',
    component: Search,
    data: {reuse: true}, // 保留搜索结果和筛选状态
  },
];
```

你也可以通过 Angular 的依赖注入（dependency injection）系统在应用级别配置自定义路由复用策略。这种情况下，Angular 会创建该策略的单个实例，由它管理整个应用中所有的路由复用决策：

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy},
  ],
};
```

## 预加载策略 {#preloading-strategy}

预加载策略决定 Angular 何时在后台加载延迟加载（lazy loading）的路由模块。虽然延迟加载通过推迟模块下载缩短了初始加载时间，但用户第一次导航到延迟加载的路由时仍然会感受到延迟。预加载策略会在用户请求之前就加载这些模块，从而消除这种延迟。

### 内置的预加载策略 {#built-in-preloading-strategies}

Angular 开箱即用地提供了两种预加载策略：

| 策略                                                | 说明                                                                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`NoPreloading`](https://angular.dev/api/router/NoPreloading)           | 默认策略，禁用所有预加载。换句话说，模块只有在用户导航到它们时才会加载                                           |
| [`PreloadAllModules`](https://angular.dev/api/router/PreloadAllModules) | 在初始导航之后立即加载所有延迟加载的模块                                                                         |

可以像下面这样配置 `PreloadAllModules` 策略：

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter, withPreloading, PreloadAllModules} from '@angular/router';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withPreloading(PreloadAllModules))],
};
```

`PreloadAllModules` 策略适用于中小型应用，在这类应用中下载所有模块不会显著影响性能。不过，拥有许多特性模块的大型应用可能更适合采用更有选择性的预加载方式。

### 创建自定义预加载策略 {#creating-a-custom-preloading-strategy}

自定义预加载策略需要实现 `PreloadingStrategy` 接口，该接口只要求一个 `preload` 方法。这个方法会接收路由配置，以及一个触发实际模块加载的函数。策略会返回一个在预加载完成时发出值的 Observable，或者返回一个空的 Observable 以跳过预加载：

```ts
import {Injectable} from '@angular/core';
import {PreloadingStrategy, Route} from '@angular/router';
import {Observable, of, timer} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

@Injectable()
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // 只预加载标记了 data: { preload: true } 的路由
    if (route.data?.['preload']) {
      return load();
    }
    return of(null);
  }
}
```

这个选择性策略会检查路由元数据来决定预加载行为。路由可以通过各自的配置选择启用预加载：

```ts
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes'),
    data: {preload: true}, // 在初始导航之后立即预加载
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes'),
    data: {preload: false}, // 只在用户导航到 reports 时才加载
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes'),
    // 没有 preload 标志——不会被预加载
  },
];
```

### 预加载的性能考量 {#performance-considerations-for-preloading}

预加载会同时影响网络使用量和内存消耗。每个被预加载的模块都会消耗带宽，并增加应用的内存占用。使用按流量计费连接的移动端用户可能更希望尽量少做预加载，而使用高速网络的桌面端用户则可以承受激进的预加载策略。

预加载的时机也很重要。在初始加载后立即预加载，可能会与图片或 API 调用等其他关键资源争抢资源。策略应当考虑应用在加载完成后的行为，并与其他后台任务相协调，以避免性能下降。

浏览器的资源限制也会影响预加载行为。浏览器会限制并发 HTTP 连接数，因此激进的预加载可能会排在其他请求之后。Service Worker 可以提供对缓存和网络请求的细粒度控制，从而辅助预加载策略。

## URL 处理策略 {#url-handling-strategy}

URL 处理策略决定 Angular 路由器处理哪些 URL、忽略哪些 URL。默认情况下，Angular 会尝试处理应用内的所有导航事件，但现实中的应用经常需要与其他系统共存、处理外部链接，或与自行管理路由的旧应用集成。

`UrlHandlingStrategy` 类让你可以控制由 Angular 管理的路由与外部 URL 之间的边界。当你要把应用逐步迁移到 Angular，或者 Angular 应用需要与其他框架共享 URL 空间时，这一点就变得至关重要。

### 实现自定义 URL 处理策略 {#implementing-a-custom-url-handling-strategy}

自定义 URL 处理策略需要扩展 `UrlHandlingStrategy` 类并实现三个方法。`shouldProcessUrl` 方法决定 Angular 是否应该处理给定的 URL，`extract` 返回 URL 中应由 Angular 处理的部分，`merge` 则把该 URL 片段与 URL 的其余部分合并起来：

```ts
import {Injectable} from '@angular/core';
import {UrlHandlingStrategy, UrlTree} from '@angular/router';

@Injectable()
export class CustomUrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // 只处理以 /app 或 /admin 开头的 URL
    return url.toString().startsWith('/app') || url.toString().startsWith('/admin');
  }

  extract(url: UrlTree): UrlTree {
    // 如果应当处理该 URL，就原样返回
    return url;
  }

  merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree {
    // 把 URL 片段与 URL 的其余部分合并
    return newUrlPart;
  }
}
```

这个策略在 URL 空间中划出了清晰的边界：Angular 处理 `/app` 和 `/admin` 路径，忽略其他一切。这种模式非常适合迁移旧应用的场景——由 Angular 控制特定的部分，而旧系统继续维护其他部分。

### 配置自定义 URL 处理策略 {#configuring-a-custom-url-handling-strategy}

你可以通过 Angular 的依赖注入系统注册自定义策略：

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter, UrlHandlingStrategy} from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {provide: UrlHandlingStrategy, useClass: CustomUrlHandlingStrategy},
  ],
};
```

## 自定义路由匹配器 {#custom-route-matchers}

默认情况下，Angular 路由器会按照路由的定义顺序依次遍历，尝试把 URL 路径与每个路由的路径模式进行匹配。它支持静态片段、参数化片段（`:id`）和通配符（`**`）。第一个匹配的路由胜出，路由器随即停止搜索。

当应用需要基于运行时条件、复杂的 URL 模式或其他自定义规则来实现更复杂的匹配逻辑时，自定义匹配器可以提供这种灵活性，同时又不会损害标准路由的简洁性。

路由器会在路由匹配阶段、路径匹配发生之前对自定义匹配器求值。当匹配器返回成功的匹配时，它还可以从 URL 中提取参数，让这些参数像标准路由参数一样提供给被激活的组件。

### 创建自定义匹配器 {#creating-a-custom-matcher}

自定义匹配器是一个函数，它接收 URL 片段，并返回一个包含已消费片段和参数的匹配结果，或者返回 null 表示不匹配。匹配器函数会在 Angular 对路由的 path 属性求值之前运行：

```ts
import {Route, UrlSegment, UrlSegmentGroup, UrlMatchResult} from '@angular/router';

export function customMatcher(
  segments: UrlSegment[],
  group: UrlSegmentGroup,
  route: Route,
): UrlMatchResult | null {
  // 在这里编写匹配逻辑
  if (matchSuccessful) {
    return {
      consumed: segments,
      posParams: {
        paramName: new UrlSegment('paramValue', {}),
      },
    };
  }
  return null;
}
```

### 实现基于版本的路由 {#implementing-version-based-routing}

设想一个 API 文档网站，它需要根据 URL 中的版本号进行路由。不同版本可能具有不同的组件结构或功能集：

```ts
import {Routes, UrlSegment, UrlMatchResult} from '@angular/router';

export function versionMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  // 匹配 /v1/docs、/v2.1/docs、/v3.0.1/docs 之类的模式
  if (segments.length >= 2 && segments[0].path.match(/^v\d+(\.\d+)*$/)) {
    return {
      consumed: segments.slice(0, 2), // 消费版本号和 'docs'
      posParams: {
        version: segments[0], // 让版本号作为参数可用
        section: segments[1], // 让章节也作为参数可用
      },
    };
  }
  return null;
}

// 路由配置
export const routes: Routes = [
  {
    matcher: versionMatcher,
    component: Documentation,
  },
  {
    path: 'latest/docs',
    redirectTo: 'v3/docs',
  },
];
```

如果你启用了 [`withComponentInputBinding`](https://angular.dev/api/router/withComponentInputBinding)，组件就会通过路由输入（input）接收提取出的参数：

```ts
import {Component, input, inject, resource} from '@angular/core';

@Component({
  selector: 'app-documentation',
  template: `
    @if (documentation.isLoading()) {
      <div>Loading documentation...</div>
    } @else if (documentation.error()) {
      <div>Error loading documentation</div>
    } @else if (documentation.value(); as docs) {
      <article>{{ docs.content }}</article>
    }
  `,
})
export class Documentation {
  // 路由器根据路由参数设置这些输入
  version = input.required<string>(); // 接收 version 参数
  section = input.required<string>(); // 接收 section 参数

  private docsService = inject(DocumentationService);

  // 当 version 或 section 变化时，资源会自动加载文档
  documentation = resource({
    params: () => {
      if (!this.version() || !this.section()) return;

      return {
        version: this.version(),
        section: this.section(),
      };
    },
    loader: ({params}) => {
      return this.docsService.loadDocumentation(params.version, params.section);
    },
  });
}
```

### 感知语言环境的路由 {#locale-aware-routing}

国际化应用经常在 URL 中编码语言环境（locale）信息。自定义匹配器可以提取语言环境代码并路由到合适的组件，同时把语言环境作为参数提供出来：

```ts
// 支持的语言环境
const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh'];

export function localeMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length > 0) {
    const potentialLocale = segments[0].path;

    if (locales.includes(potentialLocale)) {
      // 这是一个语言环境前缀，消费它并继续匹配
      return {
        consumed: [segments[0]],
        posParams: {
          locale: segments[0],
        },
      };
    } else {
      // 没有语言环境前缀，使用默认语言环境
      return {
        consumed: [], // 不消费任何片段
        posParams: {
          locale: new UrlSegment('en', {}),
        },
      };
    }
  }

  return null;
}
```

### 复杂业务逻辑匹配 {#complex-business-logic-matching}

自定义匹配器擅长实现那些难以用路径模式表达的业务规则。设想一个电商网站，其商品 URL 会根据商品类型遵循不同的模式：

```ts
export function productMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length === 0) return null;

  const firstSegment = segments[0].path;

  // 图书：/isbn-1234567890
  if (firstSegment.startsWith('isbn-')) {
    return {
      consumed: [segments[0]],
      posParams: {
        productType: new UrlSegment('book', {}),
        identifier: new UrlSegment(firstSegment.substring(5), {}),
      },
    };
  }

  // 电子产品：/sku/ABC123
  if (firstSegment === 'sku' && segments.length > 1) {
    return {
      consumed: segments.slice(0, 2),
      posParams: {
        productType: new UrlSegment('electronics', {}),
        identifier: segments[1],
      },
    };
  }

  // 服装：/style/BRAND/ITEM
  if (firstSegment === 'style' && segments.length > 2) {
    return {
      consumed: segments.slice(0, 3),
      posParams: {
        productType: new UrlSegment('clothing', {}),
        brand: segments[1],
        identifier: segments[2],
      },
    };
  }

  return null;
}
```

### 自定义匹配器的性能考量 {#performance-considerations-for-custom-matchers}

每次尝试导航时，自定义匹配器都会运行，直到找到匹配为止。因此，复杂的匹配逻辑可能会影响导航性能，在拥有大量路由的应用中尤其如此。请让匹配器保持专注和高效：

- 当不可能匹配时尽早返回
- 避免 API 调用或复杂正则表达式之类的开销大的操作
- 考虑为重复出现的 URL 模式缓存结果

虽然自定义匹配器能够优雅地解决复杂的路由需求，但过度使用会让路由配置更难理解和维护。请只在标准路径匹配确实无法满足需要的场景下使用自定义匹配器。
