# 读取路由状态 {#read-route-state}

Angular 路由器（Router）允许你读取并使用与路由（route）关联的信息，从而创建能够响应变化、感知上下文的组件（component）。

## 使用 ActivatedRoute 获取当前路由的信息 {#get-information-about-the-current-route-with-activatedroute}

`ActivatedRoute` 是 `@angular/router` 提供的一个服务（service），它提供与当前路由相关的所有信息。

```ts
import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-product',
})
export class Product {
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    console.log(this.activatedRoute);
  }
}
```

`ActivatedRoute` 可以提供关于路由的多种信息。常用属性包括：

| 属性          | 说明                                                                                                                              |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| `url`         | 路由路径的 `Observable`，表示为由 `UrlSegment` 对象组成的数组，每个对象对应路由路径的一部分。                                     |
| `data`        | 包含为该路由提供的 `data` 对象的 `Observable`，其中也包含解析守卫（resolve guard）解析出的值。                                    |
| `params`      | 包含该路由特有的必需参数和可选参数的 `Observable`。                                                                               |
| `queryParams` | 包含所有路由都可用的查询参数的 `Observable`。                                                                                     |
| `resources`   | 一个可选的只读 `Resource` 实例记录，这些实例定义在该路由上或从上级路由继承而来（需要 `withRouterResources()`）。                  |

如需查看可访问内容的完整列表，请参阅 [`ActivatedRoute` API 文档](https://angular.dev/api/router/ActivatedRoute)。

## 理解路由快照 {#understanding-route-snapshots}

页面导航（navigation）是随时间发生的一系列事件，你可以通过获取路由快照来访问某一时刻的路由器状态。

路由快照包含路由的关键信息，包括其参数、数据和子路由。此外，快照是静态的，不会反映之后发生的变化。

下面是访问路由快照的示例：

```ts
import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component(/* ... */)
export class UserProfile {
  readonly userId: string | null;
  private route = inject(ActivatedRoute);

  constructor() {
    // 示例 URL：https://www.angular.dev/users/123?role=admin&status=active#contact

    // 从快照中访问路由参数
    this.userId = this.route.snapshot.paramMap.get('id');

    // 访问多个路由元素
    const snapshot = this.route.snapshot;
    console.log({
      url: snapshot.url, // 此路由匹配到的 UrlSegment 数组
      // 路由参数对象：{id: '123'}
      params: snapshot.params,
      // 查询参数对象：{role: 'admin', status: 'active'}
      queryParams: snapshot.queryParams, // 查询参数
    });
  }
}
```

如需查看可访问的全部属性，请参阅 [`ActivatedRoute` API 文档](https://angular.dev/api/router/ActivatedRoute)和 [`ActivatedRouteSnapshot` API 文档](https://angular.dev/api/router/ActivatedRouteSnapshot)。

## 读取路由上的参数 {#reading-parameters-on-a-route}

开发者可以从路由中使用两类参数：路由参数和查询参数。

### 路由参数 {#route-parameters}

路由参数允许你通过 URL 向组件传递数据。当你想根据 URL 中的标识符（例如用户 ID 或商品 ID）显示特定内容时，这非常有用。

你可以在参数名前加冒号（`:`）来[定义路由参数](/guide/routing/define-routes#define-url-paths-with-route-parameters)。

```ts
import {Routes} from '@angular/router';
import {Product} from './product';

const routes: Routes = [{path: 'product/:id', component: Product}];
```

你可以通过订阅 `route.params` 来访问参数。

```ts
import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-product-detail',
  template: `<h1>Product Details: {{ productId() }}</h1>`,
})
export class ProductDetail {
  productId = signal('');
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    // 访问路由参数
    this.activatedRoute.params.subscribe((params) => {
      this.productId.set(params['id']);
    });
  }
}
```

### 查询参数 {#query-parameters}

[查询参数](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)提供了一种灵活的方式，可以通过 URL 传递可选数据，而不影响路由结构。与路由参数不同，查询参数可以在多次导航之间保留，非常适合处理筛选、排序、分页以及其他有状态的 UI 元素。

```ts
// 单个参数的结构
// /products?category=electronics
router.navigate(['/products'], {
  queryParams: {category: 'electronics'},
});

// 多个参数
// /products?category=electronics&sort=price&page=1
router.navigate(['/products'], {
  queryParams: {
    category: 'electronics',
    sort: 'price',
    page: 1,
  },
});
```

你可以通过 `route.queryParams` 访问查询参数。

下面是一个 `ProductList` 的示例，它会更新查询参数，从而影响商品列表的显示方式：

```ts
import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-product-list',
  template: `
    <div>
      <select (change)="updateSort($event)">
        <option value="price">Price</option>
        <option value="name">Name</option>
      </select>
      <!-- 商品列表 -->
    </div>
  `,
})
export class ProductList {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    // 以响应式方式访问查询参数
    this.route.queryParams.subscribe((params) => {
      const sort = params['sort'] || 'price';
      const page = Number(params['page']) || 1;
      this.loadProducts(sort, page);
    });
  }

  updateSort(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    // 用新的查询参数更新 URL
    this.router.navigate([], {
      queryParams: {sort},
      queryParamsHandling: 'merge', // 保留其他查询参数
    });
  }
}
```

在这个示例中，用户可以通过下拉选择框按名称或价格对商品列表排序。相应的 change 处理函数会更新 URL 的查询参数，进而触发变更事件，读取更新后的查询参数并刷新商品列表。

更多信息请参阅[关于 QueryParamsHandling 的官方文档](https://angular.dev/api/router/QueryParamsHandling)。

### 矩阵参数 {#matrix-parameters}

矩阵参数是属于某个特定 URL 段的可选参数，而不是作用于整个路由。查询参数出现在 `?` 之后并全局生效；与之不同，矩阵参数使用分号（`;`），作用范围仅限于单个路径段。

当你需要向特定路由段传递辅助数据，又不想影响路由定义或匹配行为时，矩阵参数非常有用。与查询参数一样，它们不需要在路由配置中定义。

```ts
// URL 格式：/path;key=value
// 多个参数：/path;key1=value1;key2=value2

// 带矩阵参数进行导航
this.router.navigate(['/awesome-products', {view: 'grid', filter: 'new'}]);
// 生成的 URL：/awesome-products;view=grid;filter=new
```

**使用 ActivatedRoute**

```ts
import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component(/* ... */)
export class AwesomeProducts {
  private route = inject(ActivatedRoute);

  constructor() {
    // 通过 params 访问矩阵参数
    this.route.params.subscribe((params) => {
      const view = params['view']; // 例如 'grid'
      const filter = params['filter']; // 例如 'new'
    });
  }
}
```

::: info 注意
除了使用 `ActivatedRoute`，在使用 `withComponentInputBinding` 时，矩阵参数也会被绑定到组件输入（input）上。

:::

## 使用 RouterLinkActive 检测当前激活的路由 {#detect-active-current-route-with-routerlinkactive}

你可以使用 `RouterLinkActive` 指令（directive），根据当前激活的路由动态设置导航元素的样式。这在导航元素中很常见，用于告诉用户当前激活的是哪个路由。

```html
<nav>
  <a
    class="button"
    routerLink="/about"
    routerLinkActive="active-button"
    ariaCurrentWhenActive="page"
  >
    About
  </a>
  |
  <a
    class="button"
    routerLink="/settings"
    routerLinkActive="active-button"
    ariaCurrentWhenActive="page"
  >
    Settings
  </a>
</nav>
```

在这个示例中，当 URL 与相应的 `routerLink` 匹配时，Angular 路由器会为对应的链接添加 `active-button` 类，并将 `ariaCurrentWhenActive` 设置为 `page`。

如果需要给元素添加多个类，可以使用空格分隔的字符串或数组：

```html
<!-- 空格分隔的字符串语法 -->
<a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>

<!-- 数组语法 -->
<a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
```

仅设置 `routerLinkActive` 并不会设置 `aria-current`。请像上面的示例那样设置 `ariaCurrentWhenActive` 输入，这样视障用户（他们可能无法感知到所应用的不同样式）也能识别出当前激活的链接。

### 路由匹配策略 {#route-matching-strategy}

默认情况下，`RouterLinkActive` 会把路由中的任何祖先都视为匹配。

```html
<a [routerLink]="['/user/jane']" routerLinkActive="active-link"> User </a>
<a [routerLink]="['/user/jane/role/admin']" routerLinkActive="active-link"> Role </a>
```

当用户访问 `/user/jane/role/admin` 时，两个链接都会带有 `active-link` 类。

### 仅在路由精确匹配时应用 RouterLinkActive {#only-apply-routerlinkactive-on-exact-route-matches}

如果只想在精确匹配时应用该类，需要为 `routerLinkActiveOptions` 指令提供一个包含 `exact: true` 的配置对象。

```html
<a
  [routerLink]="['/user/jane']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  User
</a>
<a
  [routerLink]="['/user/jane/role/admin']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  Role
</a>
```

如果你想更精确地控制路由的匹配方式，值得注意的是，`exact: true` 实际上是完整匹配选项集合的语法糖：

```ts
// `exact: true` 等价于
{
  paths: 'exact',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'exact',
}

// `exact: false` 等价于
{
  paths: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'subset',
}
```

更多信息请参阅 [isActiveMatchOptions](https://angular.dev/api/router/IsActiveMatchOptions) 的官方文档。

### 将 RouterLinkActive 应用到祖先元素 {#apply-routerlinkactive-to-an-ancestor}

RouterLinkActive 指令也可以应用到祖先元素上，方便开发者按需为元素设置样式。

```html
<div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
  <a routerLink="/user/jim">Jim</a>
  <a routerLink="/user/bob">Bob</a>
</div>
```

更多信息请参阅 [RouterLinkActive 的 API 文档](https://angular.dev/api/router/RouterLinkActive)。

## 检查 URL 是否处于激活状态 {#check-if-a-url-is-active}

`isActive` 函数会返回一个计算信号（computed signal），用于跟踪给定的 URL 当前是否在路由器中处于激活状态。该信号会随着路由器状态的变化自动更新。

```ts
import {Component, inject} from '@angular/core';
import {isActive, Router} from '@angular/router';

@Component({
  template: `
    <div [class.active]="isSettingsActive()">
      <h2>Settings</h2>
    </div>
  `,
})
export class Panel {
  private router = inject(Router);

  isSettingsActive = isActive('/settings', this.router, {
    paths: 'subset',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });
}
```
