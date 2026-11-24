# 定义路由

路由（route）是 Angular 应用中导航（navigation）的基本构建块。

## 什么是路由？

在 Angular 中，**路由**是一个对象，它定义了针对特定 URL 路径或模式应该渲染哪个组件（component），以及用户导航到该 URL 时会发生什么的其他配置选项。

下面是一个基本的路由示例：

```ts
import {AdminPage} from './app-admin';

const adminPage = {
  path: 'admin',
  component: AdminPage,
};
```

对于这个路由，当用户访问 `/admin` 路径时，应用会显示 `AdminPage` 组件。

### 在应用中管理路由

大多数项目会在一个单独的文件中定义路由，这个文件的文件名中包含 `routes`。

一组路由看起来像这样：

```ts
import {Routes} from '@angular/router';
import {HomePage} from './home-page';
import {AdminPage} from './admin-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'admin',
    component: AdminPage,
  },
];
```

::: tip 提示
如果你是用 Angular CLI 生成的项目，路由定义在 `src/app/app.routes.ts` 中。

:::

### 将路由器添加到应用中

在不使用 Angular CLI 引导 Angular 应用时，你可以传入一个包含 `providers` 数组的配置对象。

在 `providers` 数组中，添加一个以路由为参数的 `provideRouter` 函数调用，即可将 Angular 路由器（router）添加到应用中。

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ...
  ],
};
```

## 路由 URL 路径

### 静态 URL 路径

静态 URL 路径指的是路径预先定义好、不会随动态参数而变化的路由。这类路由与 `path` 字符串完全匹配，结果是固定的。

例如：

- "/admin"
- "/blog"
- "/settings/account"

### 使用路由参数定义 URL 路径

参数化 URL 让你可以定义动态路径，使多个 URL 指向同一个组件，同时根据 URL 中的参数动态显示数据。

你可以在路由的 `path` 字符串中添加参数，并在每个参数前加上冒号（`:`）字符，来定义这种模式。

::: warning 重要
参数与 URL 中[查询字符串](https://en.wikipedia.org/wiki/Query_string)里的信息是不同的。
请在[本指南中进一步了解 Angular 中的查询参数](/guide/routing/read-route-state#query-parameters)。

:::

下面的示例会根据通过 URL 传入的用户 id 显示用户资料组件。

```ts
import {Routes} from '@angular/router';
import {UserProfile} from './user-profile/user-profile';

const routes: Routes = [{path: 'user/:id', component: UserProfile}];
```

在这个示例中，像 `/user/leeroy` 和 `/user/jenkins` 这样的 URL 都会渲染 `UserProfile` 组件。该组件随后可以读取 `id` 参数，并用它执行其他工作，例如获取数据。关于读取路由参数的详细信息，请参阅[读取路由状态指南](/guide/routing/read-route-state)。

有效的路由参数名必须以字母（a-z、A-Z）开头，并且只能包含：

- 字母（a-z、A-Z）
- 数字（0-9）
- 下划线（\_）
- 连字符（-）

你也可以定义带有多个参数的路径：

```ts
import {Routes} from '@angular/router';
import {UserProfile} from './user-profile';
import {SocialMediaFeed} from './social-media-feed';

const routes: Routes = [
  {path: 'user/:id/:social-media', component: SocialMediaFeed},
  {path: 'user/:id', component: UserProfile},
];
```

有了这个新路径，用户可以访问 `/user/leeroy/youtube` 和 `/user/leeroy/bluesky`，并根据参数看到用户 leeroy 对应的社交媒体动态。

关于读取路由参数的详细信息，请参阅[读取路由状态](/guide/routing/read-route-state)。

### 通配符

当你需要捕获某个路径下的所有路由时，解决方案是使用通配符路由，它用双星号（`**`）定义。

一个常见的例子是定义一个“页面未找到”组件。

```ts
import {Routes} from '@angular/router';
import {Home} from './home/home';
import {UserProfile} from './user-profile';
import {NotFound} from './not-found';

const routes: Routes = [
  {path: 'home', component: Home},
  {path: 'user/:id', component: UserProfile},
  {path: '**', component: NotFound},
];
```

在这个路由数组中，当用户访问 `home` 和 `user/:id` 之外的任何路径时，应用都会显示 `NotFound` 组件。

::: tip 提示
通配符路由通常放在路由数组的末尾。

:::

## Angular 如何匹配 URL

定义路由时，顺序很重要，因为 Angular 采用“首次匹配优先”的策略。也就是说，一旦 Angular 将 URL 与某个路由的 `path` 匹配上，就会停止检查后续的路由。因此，务必把更具体的路由放在不那么具体的路由之前。

下面的示例展示了按从最具体到最不具体的顺序定义的路由：

```ts
const routes: Routes = [
  {path: '', component: Home}, // 空路径
  {path: 'users/new', component: NewUser}, // 静态路径，最具体
  {path: 'users/:id', component: UserDetail}, // 动态路径
  {path: 'users', component: Users}, // 静态路径，不那么具体
  {path: '**', component: NotFound}, // 通配符——始终放在最后
];
```

如果用户访问 `/users/new`，Angular 路由器会依次执行以下步骤：

1. 检查 `''`——不匹配
1. 检查 `users/new`——匹配！在此停止
1. 永远不会检查到 `users/:id`，尽管它也可能匹配
1. 永远不会检查到 `users`
1. 永远不会检查到 `**`

## 重定向

你可以定义一个重定向（redirect）到另一个路由的路由，而不是渲染某个组件：

```ts
import {Routes} from '@angular/router';
import {Blog} from './home/blog';

const routes: Routes = [
  {
    path: 'articles',
    redirectTo: '/blog',
  },
  {
    path: 'blog',
    component: Blog,
  },
];
```

如果你修改或删除了某个路由，有些用户可能仍会点击指向该路由的过时链接或书签。你可以添加一个重定向，把这些用户引导到合适的替代路由，而不是显示“未找到”页面。

## 页面标题

你可以为每个路由关联一个**标题**（title）。路由激活时，Angular 会自动更新[页面标题](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title)。请始终为应用定义合适的页面标题，因为这些标题是打造无障碍体验所必需的。

```ts
import {Routes} from '@angular/router';
import {Home} from './home';
import {About} from './about';
import {Products} from './products';

const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home Page',
  },
  {
    path: 'about',
    component: About,
    title: 'About Us',
  },
];
```

页面的 `title` 属性可以通过 [`ResolveFn`](https://angular.dev/api/router/ResolveFn) 动态设置为一个解析器（resolver）函数。

```ts
const titleResolver: ResolveFn<string> = (route) => route.queryParams['id'];
const routes: Routes = [
  // ...
  {
    path: 'products',
    component: Products,
    title: titleResolver,
  },
];
```

路由标题也可以通过一个继承了 [`TitleStrategy`](https://angular.dev/api/router/TitleStrategy) 抽象类的服务（service）来设置。默认情况下，Angular 使用 [`DefaultTitleStrategy`](https://angular.dev/api/router/DefaultTitleStrategy)。

### 使用 TitleStrategy 设置页面标题

在需要集中控制文档标题组成方式的高级场景中，可以实现一个 `TitleStrategy`。

`TitleStrategy` 是一个令牌，你可以提供它来覆盖 Angular 使用的默认标题策略。你可以提供自定义的 `TitleStrategy` 来实现各种约定，例如添加应用后缀、根据面包屑格式化标题，或者根据路由数据动态生成标题。

```ts
import {inject, Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TitleStrategy, RouterStateSnapshot} from '@angular/router';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  // 只读取一次：首次更新后 getTitle() 会返回带前缀的标题
  private readonly defaultTitle = this.title.getTitle();

  updateTitle(snapshot: RouterStateSnapshot): void {
    // 如果路由设置了 "Title"，PageTitle 就等于它
    // 如果没有设置，则使用 index.html 中给出的 "title"
    const pageTitle = this.buildTitle(snapshot) || this.defaultTitle;
    this.title.setTitle(`MyAwesomeApp - ${pageTitle}`);
  }
}
```

要使用自定义策略，请在应用级别用 `TitleStrategy` 令牌提供它：

```ts
import {provideRouter, TitleStrategy} from '@angular/router';
import {AppTitleStrategy} from './app-title.strategy';

export const appConfig = {
  providers: [provideRouter(routes), {provide: TitleStrategy, useClass: AppTitleStrategy}],
};
```

## 用于依赖注入的路由级提供者

每个路由都有一个 `providers` 属性，让你可以通过[依赖注入](/guide/di)（dependency injection）为该路由的内容提供依赖。

这在一些常见场景中很有用，例如应用需要根据用户是否为管理员来使用不同的服务。

```ts
export const ROUTES: Route[] = [
  {
    path: 'admin',
    providers: [AdminService, {provide: ADMIN_API_KEY, useValue: '12345'}],
    children: [
      {path: 'users', component: AdminUsers},
      {path: 'teams', component: AdminTeams},
    ],
  },
  // ... 其他应用路由，它们无法
  //     访问 ADMIN_API_KEY 或 AdminService。
];
```

在这段代码示例中，`admin` 路径包含一个受保护的数据属性 `ADMIN_API_KEY`，它只对该部分内的子路由可用。因此，其他路径都无法访问通过 `ADMIN_API_KEY` 提供的数据。

关于 Angular 中提供者（provider）和注入的更多信息，请参阅[依赖注入指南](/guide/di)。

## 将数据与路由关联

路由数据让你可以为路由附加额外的信息，并根据这些数据配置组件的行为。

处理路由数据有两种方式：保持不变的静态数据，以及可以根据运行时条件变化的动态数据。

### 静态数据

你可以通过 `data` 属性将任意静态数据与路由关联起来，以便集中管理路由特有的元数据（例如分析跟踪、权限等）：

```ts
import {Routes} from '@angular/router';
import {Home} from './home';
import {About} from './about';
import {Products} from './products';

const routes: Routes = [
  {
    path: 'about',
    component: About,
    data: {analyticsId: '456'},
  },
  {
    path: '',
    component: Home,
    data: {analyticsId: '123'},
  },
];
```

在这段代码示例中，首页和关于页面都配置了特定的 `analyticsId`，随后会在各自的组件中用于页面跟踪分析。

你可以通过注入 `ActivatedRoute` 来读取这些静态数据。详情请参阅[读取路由状态](/guide/routing/read-route-state)。

### 使用资源和解析器获取动态数据

当你需要为某个路由获取数据时，Angular 路由器既支持响应式的路由资源（resource），也支持数据解析器：

- [使用资源获取数据](/guide/routing/data-fetching-with-resources)：使用 Angular 信号（signal）的 `Resource` API 以响应式方式获取数据。
- [路由数据解析器](/guide/routing/data-resolvers)：使用解析器函数在路由激活之前获取数据。

### 错误回退组件

你可以在路由上指定一个 `errorComponent`，当路由组件在初始化或渲染期间抛出错误时，渲染一个专门的回退组件：

```ts
import {Routes} from '@angular/router';
import {ProductDetails} from './product-details';
import {ProductErrorFallback} from './product-error-fallback';

export const routes: Routes = [
  {
    path: 'product/:id',
    component: ProductDetails,
    errorComponent: ProductErrorFallback,
  },
];
```

要进一步了解如何配置错误回退以及重试失败的路由，请参阅[错误边界指南](/guide/routing/error-boundaries)。

## 嵌套路由

嵌套路由（也称为子路由）是一种管理更复杂导航路由的常用技术，适用于组件包含一个会随 URL 变化的子视图的情况。

<img alt="Diagram to illustrate nested routes" src="/assets/images/guide/router/nested-routing-diagram.svg">

你可以通过 `children` 属性为任何路由定义添加子路由：

```ts
const routes: Routes = [
  {
    path: 'product/:id',
    component: Product,
    children: [
      {
        path: 'info',
        component: ProductInfo,
      },
      {
        path: 'reviews',
        component: ProductReviews,
      },
    ],
  },
];
```

上面的示例为产品页定义了一个路由，让用户可以根据 URL 切换显示产品信息还是评论。

`children` 属性接受一个 `Route` 对象数组。

要显示子路由，父组件（上例中的 `Product`）需要包含自己的 `<router-outlet>`。

```html
<!-- Product -->
<article>
  <h1>Product {{ id }}</h1>
  <router-outlet />
</article>
```

在配置中添加子路由并在组件中添加 `<router-outlet>` 之后，在与子路由匹配的 URL 之间导航时，只会更新嵌套的出口（outlet）。

## 下一步

- [路由加载策略](/guide/routing/loading-strategies)
- [使用出口显示路由内容](/guide/routing/show-routes-with-outlets)

