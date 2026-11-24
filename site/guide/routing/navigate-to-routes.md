# 导航到路由 {#navigate-to-routes}

RouterLink 指令（directive）是 Angular 实现导航（navigation）的声明式方式。它让你可以使用标准的锚点元素（`<a>`），并与 Angular 的路由（routing）系统无缝集成。

## 如何使用 RouterLink {#how-to-use-routerlink}

不要使用带 `href` attribute 的普通锚点元素 `<a>`，而是添加一个带有相应路径的 RouterLink 指令，以便利用 Angular 路由。

```ts
import {RouterLink} from '@angular/router';
import {Component} from '@angular/core';

@Component({
  template: `
    <nav>
      <a routerLink="/user-profile">User profile</a>
      <a routerLink="/settings">Settings</a>
    </nav>
  `,
  imports: [RouterLink],
  ...
})
export class App {}
```

### 使用绝对链接或相对链接 {#using-absolute-or-relative-links}

Angular 路由中的**相对 URL** 让你可以定义相对于当前路由（route）位置的导航路径。与之相对的是**绝对 URL**，它包含带协议（例如 `http://`）和**根域名**（例如 `google.com`）的完整路径。

```html
<!-- 绝对 URL -->
<a href="https://www.angular.dev/essentials">Angular Essentials Guide</a>

<!-- 相对 URL -->
<a href="/essentials">Angular Essentials Guide</a>
```

在这个例子中，第一个示例为 essentials 页面显式定义了包含协议（即 `https://`）和根域名（即 `angular.dev`）的完整路径。而第二个示例则假定用户已经位于 `/essentials` 所在的正确根域名上。

一般来说，更推荐使用相对 URL，因为它们不需要知道自己在路由层级中的绝对位置，在整个应用中更易于维护。

### 相对 URL 的工作原理 {#how-relative-urls-work}

Angular 路由有两种定义相对 URL 的语法：字符串和数组。

```html
<!-- 把用户导航到 /dashboard -->
<a routerLink="dashboard">Dashboard</a>
<a [routerLink]="['dashboard']">Dashboard</a>
```

::: tip 提示
传入字符串是定义相对 URL 最常用的方式。

:::

当需要在相对 URL 中定义动态参数时，请使用数组语法：

```html
<a [routerLink]="['user', currentUserId]">Current User</a>
```

此外，Angular 路由还允许你根据相对路径是否以正斜杠（`/`）开头，来指定路径是相对于当前 URL 还是相对于根域名。

例如，如果用户位于 `example.com/settings`，下面展示了在不同场景下如何定义不同的相对路径：

```html
<!-- 导航到 /settings/notifications -->
<a routerLink="notifications">Notifications</a>
<a routerLink="/settings/notifications">Notifications</a>

<!-- 导航到 /team/:teamId/user/:userId -->
<a routerLink="/team/123/user/456">User 456</a>
<a [routerLink]="['/team', teamId, 'user', userId]">Current User</a>
```

## 以编程方式导航到路由 {#programmatic-navigation-to-routes}

`RouterLink` 负责在模板（template）中进行声明式导航，而对于需要根据逻辑、用户操作或应用状态进行导航的场景，Angular 提供了编程式导航。通过注入 `Router`，你可以在 TypeScript 代码中动态导航到路由、传递参数并控制导航行为。

### `router.navigate()` {#router-navigate}

你可以使用 `router.navigate()` 方法，通过指定 URL 路径数组以编程方式在路由之间导航。

```ts
import {Router} from '@angular/router';
import {Component, inject} from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: ` <button (click)="navigateToProfile()">View Profile</button> `,
})
export class AppDashboard {
  private router = inject(Router);

  navigateToProfile() {
    // 标准导航
    this.router.navigate(['/profile']);

    // 带路由参数
    this.router.navigate(['/users', userId]);

    // 带查询参数
    this.router.navigate(['/search'], {
      queryParams: {category: 'books', sort: 'price'},
    });

    // 带矩阵参数
    this.router.navigate(['/products', {featured: true, onSale: true}]);
  }
}
```

`router.navigate()` 同时支持简单和复杂的路由场景，允许你传递路由参数、[查询参数](/guide/routing/read-route-state#query-parameters)，并控制导航行为。

你还可以使用 `relativeTo` 选项，构建相对于组件（component）在路由树中所处位置的动态导航路径。

```ts
import {Router, ActivatedRoute} from '@angular/router';
import {Component, inject} from '@angular/core';

@Component({
  selector: 'app-user-detail',
  template: `
    <button (click)="navigateToEdit()">Edit User</button>
    <button (click)="navigateToParent()">Back to List</button>
  `,
})
export class UserDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // 导航到同级路由
  navigateToEdit() {
    // 从：/users/123
    // 到：/users/123/edit
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  // 导航到父路由
  navigateToParent() {
    // 从：/users/123
    // 到：/users
    this.router.navigate(['..'], {relativeTo: this.route});
  }

  navigateToList() {
    // Angular 会把命令数组解析为相对于当前路由的单个导航路径。
    // 从：/users/123
    // 结果：/users/list
    this.router.navigate(['..', 'list'], {relativeTo: this.route});
  }
}
```

向上导航多个层级时，所有 `..` 片段都必须放在命令数组的**第一个元素**中。路由器（router）只会从第一个命令字符串中解析 `..`，后续的数组元素都会被当作字面路径片段。

```ts
// 从：/team/123/users/456
// 结果：/team/123/settings
this.router.navigate(['../../settings'], {relativeTo: this.route});
```

使用 `relativeTo` 时，绝不要给第一个命令加上 `/` 前缀。开头的 `/` 会让导航变成绝对导航，并完全忽略 `relativeTo`。

```ts
// 从：/team/123/users/456
// 结果：/team/123/users/456/edit
this.router.navigate(['edit'], {relativeTo: this.route});
```

```ts
// 从：/team/123/users/456
// 开头的 '/' 会导致绝对导航 —— relativeTo 被忽略
// 结果：/edit
this.router.navigate(['/edit'], {relativeTo: this.route});
```

### `router.navigateByUrl()` {#router-navigatebyurl}

`router.navigateByUrl()` 方法提供了一种直接的编程式导航方式，它使用 URL 路径字符串而不是数组片段。当你拥有完整的 URL 路径并需要执行绝对导航时，这个方法是理想之选，尤其是在处理外部提供的 URL 或深层链接场景时。

```ts
// 标准路由导航
router.navigateByUrl('/products');

// 导航到嵌套路由
router.navigateByUrl('/products/featured');

// 带参数和片段的完整 URL
router.navigateByUrl('/products/123?view=details#reviews');

// 带查询参数导航
router.navigateByUrl('/search?category=books&sortBy=price');

// 带矩阵参数
router.navigateByUrl('/sales-awesome;isOffer=true;showModal=false');
```

如果你需要替换历史记录中的当前 URL，`navigateByUrl` 还接受一个带有 `replaceUrl` 选项的配置对象。

```ts
// 替换历史记录中的当前 URL
router.navigateByUrl('/checkout', {
  replaceUrl: true,
});
```

### 在地址栏中显示不同的 URL {#display-a-different-url-in-the-address-bar}

你可以向 navigateByUrl 传入 browserUrl 选项，让浏览器地址栏显示一个与路由匹配所用 URL 不同的 URL。

当你想把用户重定向（redirect）到另一个路由（例如错误页面），同时又不改变用户最初尝试访问的 URL 时，这会很有用。

```ts
router.navigateByUrl('/not-found', {browserUrl: '/products/missing-item'});
```

Angular 会导航到并渲染 `/not-found` 路由，但浏览器地址栏显示的是 `/products/missing-item`。

::: info 注意
`browserUrl` 只影响浏览器地址栏中显示的内容。

:::

## 使用 RouterLink 自定义浏览器 URL {#customizing-the-browser-url-with-routerlink}

`RouterLink` 指令也支持 `browserUrl` 输入（input），它让你可以控制点击链接时浏览器地址栏中显示的 URL，而与 Angular 实际导航到的路由无关。

```html
<!-- 导航到 /dashboard，但地址栏显示 /home -->
<a [routerLink]="['/dashboard']" [browserUrl]="'/home'">Go to Dashboard</a>
```

对于更动态的用例，你也可以绑定一个 `UrlTree`：

```ts
import {Component, inject} from '@angular/core';
import {Router, RouterLink, UrlTree} from '@angular/router';

@Component({
  template: `
    <a [routerLink]="['/products', product.id]" [browserUrl]="displayUrl">
      {{ product.name }}
    </a>
  `,
  imports: [RouterLink],
})
export class ProductList {
  private router = inject(Router);

  product = {id: 42, name: 'Widget'};

  // 创建一个要在地址栏中显示的 UrlTree
  displayUrl: UrlTree = this.router.createUrlTree(['/products', 'widget']);
}
```

## 使用 RouterLink 控制滚动 {#controlling-scrolling-with-routerlink}

当使用 `withInMemoryScrolling({scrollPositionRestoration: 'enabled'})`（或 `'top'`）启用内存滚动时，点击链接后路由器会滚动到页面顶部，即使该链接只改变了一个查询参数也是如此。`RouterLink` 指令支持 `scroll` 输入，让单个链接可以选择不这样做：

```html
<!-- 切换标签页，而不滚动回页面顶部 -->
<a routerLink="/products/42" [queryParams]="{tab: 'reviews'}" scroll="manual">Reviews</a>
```

使用 `scroll="manual"` 时，路由器不会为该次导航执行滚动。默认值 `'after-transition'` 会按照路由器的滚动配置进行滚动。

编程式导航也提供了同样的选项：

```ts
router.navigateByUrl('/products/42?tab=reviews', {scroll: 'manual'});
```

## 后续步骤 {#next-steps}

了解如何[读取路由状态](/guide/routing/read-route-state)，以创建响应灵敏且能感知上下文的组件。
