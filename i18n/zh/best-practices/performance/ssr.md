# 服务端渲染与混合渲染

Angular 默认以客户端渲染（CSR）的方式交付所有应用。虽然这种方式的初始负载很轻量，但也带来了一些代价，包括加载时间更长、性能指标变差，以及由于大部分计算都在用户设备上完成而对资源要求更高。因此，许多应用通过把服务端渲染（SSR）整合进混合渲染策略，获得了显著的性能提升。

## 什么是混合渲染？

混合渲染让开发者可以同时利用服务端渲染（SSR）、预渲染（也称为「静态站点生成」或 SSG）和客户端渲染（CSR）的优势来优化 Angular 应用。它让你可以精细地控制应用中不同部分的渲染方式，为用户提供尽可能好的体验。

## 设置混合渲染

你可以在 Angular CLI 的 `ng new` 命令中使用服务端渲染标志（即 `--ssr`），创建一个使用混合渲染的**新**项目：

```shell
ng new --ssr
```

你也可以通过 `ng add` 命令为现有项目添加服务端渲染，从而启用混合渲染：

```shell
ng add @angular/ssr
```

::: info 注意
默认情况下，Angular 会预渲染整个应用并生成一个服务器文件。要禁用这一行为并创建一个完全静态的应用，请把 `outputMode` 设为 `static`。要启用 SSR，请把服务器路由更新为使用 `RenderMode.Server`。更多细节请参阅[`服务器路由`](#server-routing)和[`生成完全静态的应用`](#generate-a-fully-static-application)。

:::

## 服务器路由

### 配置服务器路由

你可以通过声明一个 [`ServerRoute`](https://angular.dev/api/ssr/ServerRoute 'API reference') 对象数组来创建服务器路由配置。这个配置通常放在名为 `app.routes.server.ts` 的文件中。

```ts [app.routes.server.ts]
import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '', // 在客户端渲染 "/" 路由（CSR）
    renderMode: RenderMode.Client,
  },
  {
    path: 'about', // 这个页面是静态的，所以预渲染它（SSG）
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'profile', // 这个页面需要用户专属的数据，所以使用 SSR
    renderMode: RenderMode.Server,
  },
  {
    path: '**', // 其他所有路由都在服务器上渲染（SSR）
    renderMode: RenderMode.Server,
  },
];
```

你可以使用 [`provideServerRendering`](https://angular.dev/api/ssr/provideServerRendering 'API reference') 配合 [`withRoutes`](https://angular.dev/api/ssr/withRoutes 'API reference') 函数，把这个配置添加到应用中：

```ts [app.config.server.ts]
import {provideServerRendering, withRoutes} from '@angular/ssr';
import {ApplicationConfig} from '@angular/core';
import {serverRoutes} from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // ... 其他提供者 ...
  ],
};
```

使用[应用外壳模式](/ecosystem/service-workers/app-shell)时，你必须指定一个组件，作为客户端渲染路由的应用外壳。为此，请使用 [`withAppShell`](https://angular.dev/api/ssr/withAppShell 'API reference') 特性：

```ts
import {provideServerRendering, withRoutes, withAppShell} from '@angular/ssr';
import {ApplicationConfig} from '@angular/core';
import {AppShell} from './app-shell';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes), withAppShell(AppShell)),
    // ... 其他提供者 ...
  ],
};
```

### 渲染模式

服务器路由配置让你可以通过设置 [`RenderMode`](https://angular.dev/api/ssr/RenderMode 'API reference') 来指定应用中每个路由的渲染方式：

| 渲染模式 | 说明 |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Server (SSR)** | 针对每个请求在服务器上渲染应用，把内容完整的 HTML 页面发送给浏览器。 |
| **Client (CSR)** | 在浏览器中渲染应用。这是 Angular 的默认行为。 |
| **Prerender (SSG)** | 在构建时预渲染应用，为每个路由生成静态 HTML 文件。 |

#### 选择渲染模式

每种渲染模式都有各自的优缺点。你可以根据应用的具体需求选择渲染模式。

##### 客户端渲染（CSR）

客户端渲染的开发模型最简单，因为你编写的代码可以假定始终运行在 Web 浏览器中。这让你可以使用大量同样假定自己运行在浏览器中的客户端库。

客户端渲染的性能通常比其他渲染模式差，因为它必须先下载、解析并执行页面的 JavaScript，用户才能看到任何渲染出来的内容。如果页面在渲染过程中还要从服务器获取更多数据，用户还得等这些额外的请求完成，才能看到完整的内容。

如果你的页面会被搜索引擎爬虫收录，客户端渲染可能会对搜索引擎优化（SEO）产生负面影响，因为搜索引擎爬虫在收录页面时能执行的 JavaScript 是有限的。

使用客户端渲染时，服务器除了提供静态的 JavaScript 资源之外，不需要做任何渲染页面的工作。如果你在意服务器成本，可以考虑这一点。

借助 [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) 支持可安装、可离线使用的应用，可以依靠客户端渲染，而无需与服务器通信。

##### 服务端渲染（SSR）

服务端渲染的页面加载速度比客户端渲染更快。服务器在收到浏览器的请求后会直接渲染出 HTML 文档，而不必等待 JavaScript 下载和运行。用户只需承受服务器获取数据和渲染所请求页面所需的延迟。这种模式还免去了浏览器发起额外网络请求的需要，因为你的代码可以在服务器渲染期间获取数据。

服务端渲染的搜索引擎优化（SEO）效果通常非常好，因为搜索引擎爬虫收到的是完整渲染好的 HTML 文档。

服务端渲染要求你编写不严格依赖浏览器 API 的代码，也会限制你对那些假定运行在浏览器中的 JavaScript 库的选择。

使用服务端渲染时，你的服务器会针对每个请求运行 Angular 来生成 HTML 响应，这可能会增加服务器托管成本。

##### 构建时预渲染

预渲染的页面加载速度比客户端渲染和服务端渲染都快。由于预渲染是在*构建时*生成 HTML 文档的，服务器可以直接用静态 HTML 文档响应请求，无需任何额外工作。

预渲染要求渲染页面所需的所有信息在*构建时*都已就绪。这意味着预渲染的页面不能包含任何特定于正在加载页面的用户的数据。预渲染主要适用于对应用所有用户都相同的页面。

由于预渲染发生在构建时，它可能会显著增加生产构建的时间。使用 [`getPrerenderParams`](https://angular.dev/api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') 生成大量 HTML 文档，可能会影响部署产物的总文件大小，进而导致部署变慢。

预渲染的搜索引擎优化（SEO）效果通常非常好，因为搜索引擎爬虫收到的是完整渲染好的 HTML 文档。

预渲染要求你编写不严格依赖浏览器 API 的代码，也会限制你对那些假定运行在浏览器中的 JavaScript 库的选择。

预渲染在每个服务器请求上的开销极小，因为服务器响应的是静态 HTML 文档。静态文件也很容易被内容分发网络（CDN）、浏览器和中间缓存层缓存，让后续的页面加载更快。完全静态的网站还可以只通过 CDN 或静态文件服务器部署，无需为应用维护自定义的服务器运行时。这把工作从应用 Web 服务器上卸载下来，增强了可伸缩性，对高流量的应用尤其有利。

::: info 注意
使用 Angular Service Worker 时，第一个请求由服务器渲染，但之后的所有请求都由 Service Worker 处理，并在客户端渲染。

:::

### 设置响应头和状态码

你可以在 `ServerRoute` 配置中使用 `headers` 和 `status` 属性，为单个服务器路由设置自定义的响应头和状态码。

```ts [app.routes.server.ts]
import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'profile',
    renderMode: RenderMode.Server,
    headers: {
      'X-My-Custom-Header': 'some-value',
    },
    status: 201,
  },
  // ... 其他路由
];
```

### 重定向

对于路由配置中由 [`redirectTo`](https://angular.dev/api/router/Route#redirectTo 'API reference') 属性指定的重定向，Angular 在服务端的处理方式有所不同。

**服务端渲染（SSR）**
在服务端渲染过程中，使用标准的 HTTP 重定向（例如 301、302）执行重定向。

**预渲染（SSG）**
在预渲染的 HTML 中，使用 [`<meta http-equiv="refresh">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#refresh) 标签以「软重定向」的方式实现重定向。

### 自定义构建时预渲染（SSG）

使用 [`RenderMode.Prerender`](https://angular.dev/api/ssr/RenderMode#Prerender 'API reference') 时，你可以指定若干配置选项，来自定义预渲染和提供服务的过程。

#### 带参数的路由

对于每个使用 [`RenderMode.Prerender`](https://angular.dev/api/ssr/RenderMode#Prerender 'API reference') 的路由，你可以指定一个 [`getPrerenderParams`](https://angular.dev/api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') 函数。这个函数让你可以控制哪些具体的参数会生成单独的预渲染文档。

[`getPrerenderParams`](https://angular.dev/api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') 函数返回一个 `Promise`，它解析为一个对象数组。每个对象都是一个从路由参数名到参数值的键值映射。例如，如果你定义了 `post/:id` 这样的路由，`getPrerenderParams ` 可以返回数组 `[{id: '123'}, {id: '456'}]`，从而为 `post/123` 和 `post/456` 分别渲染文档。

[`getPrerenderParams`](https://angular.dev/api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') 的函数体可以使用 Angular 的 [`inject`](https://angular.dev/api/core/inject 'API reference') 函数注入依赖，并执行任何工作来决定要预渲染哪些路由。这通常包括发起请求获取数据，以构造参数值数组。

你也可以把这个函数用于通配路由（例如 `/**`），此时参数名是 `"**"`，返回值是路径的各个片段，例如 `foo/bar`。它们可以与其他参数组合使用（例如 `/post/:id/**`），以处理更复杂的路由配置。

```ts [app.routes.server.ts]
import {RenderMode, ServerRoute} from '@angular/ssr';
import {inject} from '@angular/core';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'post/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const dataService = inject(PostService);
      const ids = await dataService.getIds(); // 假设返回 ['1', '2', '3']

      return ids.map((id) => ({id})); // 生成的路径类似：/post/1、/post/2、/post/3
    },
  },
  {
    path: 'post/:id/**',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [
        {id: '1', '**': 'foo/3'},
        {id: '2', '**': 'bar/4'},
      ]; // 生成的路径类似：/post/1/foo/3、/post/2/bar/4
    },
  },
];
```

由于 [`getPrerenderParams`](https://angular.dev/api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') 只适用于 [`RenderMode.Prerender`](https://angular.dev/api/ssr/RenderMode#Prerender 'API reference')，这个函数总是在*构建时*运行。`getPrerenderParams` 不能依赖任何浏览器专有或服务器专有的 API 来获取数据。

::: warning 重要
在 `getPrerenderParams` 中使用 [`inject`](https://angular.dev/api/core/inject 'API reference') 时，请记住 `inject` 必须同步调用。它不能在异步回调中调用，也不能在任何 `await` 语句之后调用。更多信息请参阅 `runInInjectionContext`。

:::

#### 回退策略

使用 [`RenderMode.Prerender`](https://angular.dev/api/ssr/RenderMode#Prerender 'API reference') 模式时，你可以指定一个回退策略，用来处理对未被预渲染的路径的请求。

可用的回退策略有：

- **Server：** 回退到服务端渲染。如果没有指定 `fallback` 属性，这是**默认**行为。
- **Client：** 回退到客户端渲染。
- **None：** 不回退。Angular 不会处理对未被预渲染路径的请求。

```ts [app.routes.server.ts]
import {RenderMode, PrerenderFallback, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'post/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client, // 如果没有预渲染，就回退到 CSR
    async getPrerenderParams() {
      // 这个函数返回一个对象数组，表示预渲染了以下路径的文章：
      // `/post/1`、`/post/2` 和 `/post/3`。
      // 如果请求 `/post/4`，就会使用回退行为。
      return [{id: '1'}, {id: '2'}, {id: '3'}];
    },
  },
];
```

## 编写与服务器兼容的组件

一些常见的浏览器 API 和功能在服务器上可能不可用。应用不能使用 `window`、`document`、`navigator` 或 `location` 这类浏览器专有的全局对象，也不能使用 `HTMLElement` 的某些属性。

一般来说，依赖浏览器专有符号的代码应该只在浏览器中执行，而不在服务器上执行。这可以通过 `afterEveryRender` 和 `afterNextRender` 生命周期钩子（Lifecycle Hook）来保证。它们只在浏览器中执行，在服务器上会被跳过。

```ts
import {Component, ElementRef, viewChild, afterNextRender} from '@angular/core';

@Component({
  selector: 'my-cmp',
  template: `<span #content>{{ ... }}</span>`,
})
export class MyComponent {
  contentRef = viewChild.required<ElementRef>('content');

  constructor() {
    afterNextRender(() => {
      // 可以安全地检查 `scrollHeight`，因为这段代码只会在浏览器中运行，不会在服务器上运行。
      console.log('content height: ' + this.contentRef().nativeElement.scrollHeight);
    });
  }
}
```

::: info 注意
优先使用[特定于平台的提供者](/guide/ssr#providing-platform-specific-implementations)，而不是在运行时用 `isPlatformBrowser` 或 `isPlatformServer` 进行检查。

:::

::: warning 重要
避免在模板中把 `isPlatformBrowser` 与 `@if` 或其他条件语句一起使用，以便在服务器和客户端渲染不同的内容。这会导致水合（Hydration）不匹配和布局偏移，对用户体验和 [Core Web Vitals](https://web.dev/learn-core-web-vitals/) 产生负面影响。正确的做法是使用 `afterNextRender` 进行浏览器专有的初始化，并让渲染内容在各个平台上保持一致。

:::

## 在服务器上设置提供者

在服务端，顶层提供者的值会在应用代码首次被解析和求值时设置一次。
这意味着用 `useValue` 配置的提供者会在多个请求之间保持它的值，直到服务器应用重启。

如果你想为每个请求生成一个新值，请使用带 `useFactory` 的工厂提供者。工厂函数会针对每个传入的请求运行，确保每次都会创建新值并赋给该令牌。

## 提供特定于平台的实现

当应用在浏览器和服务器上需要不同的行为时，请为每个平台分别提供服务实现。这种方式把平台相关的逻辑集中在专门的服务中。

```ts
export abstract class AnalyticsService {
  abstract trackEvent(name: string): void;
}
```

创建浏览器实现：

```ts
@Injectable()
export class BrowserAnalyticsService implements AnalyticsService {
  trackEvent(name: string): void {
    // 把事件发送给基于浏览器的第三方分析服务
  }
}
```

创建服务器实现：

```ts
@Injectable()
export class ServerAnalyticsService implements AnalyticsService {
  trackEvent(name: string): void {
    // 在服务器上记录事件
  }
}
```

在应用的主配置中注册浏览器实现：

```ts [app.config.ts]
export const appConfig: ApplicationConfig = {
  providers: [{provide: AnalyticsService, useClass: BrowserAnalyticsService}],
};
```

在服务器配置中用服务器实现覆盖它：

```ts [app.config.server.ts]
const serverConfig: ApplicationConfig = {
  providers: [{provide: AnalyticsService, useClass: ServerAnalyticsService}],
};
```

在组件中注入并使用该服务：

```ts
@Component(/* ... */)
export class Checkout {
  private analytics = inject(AnalyticsService);

  onAction() {
    this.analytics.trackEvent('action');
  }
}
```

## 通过依赖注入访问 Document

在使用服务端渲染时，应该避免直接引用 `document` 这类浏览器专有的全局对象。请改用 [`DOCUMENT`](https://angular.dev/api/core/DOCUMENT) 令牌，以与平台无关的方式访问 document 对象。

```ts
import {inject, DOCUMENT, Service} from '@angular/core';

@Service()
export class CanonicalLinkService {
  private readonly document = inject(DOCUMENT);

  // 在服务器渲染期间注入一个 <link rel="canonical"> 标签，
  // 让生成的 HTML 包含正确的规范 URL
  setCanonical(href: string): void {
    const link = this.document.createElement('link');
    link.rel = 'canonical';
    link.href = href;
    this.document.head.appendChild(link);
  }
}
```

::: tip 提示
要管理 meta 标签，Angular 提供了 `Meta` 服务。

:::

## 通过依赖注入访问请求和响应

`@angular/core` 包提供了几个用于与服务端渲染环境交互的令牌。在 SSR 期间，这些令牌让你可以在 Angular 应用中访问关键的信息和对象。

- **[`REQUEST`](https://angular.dev/api/core/REQUEST 'API reference')：** 提供对当前请求对象的访问，其类型是 Web API 中的 [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)。你可以借此访问请求头、Cookie 和其他请求信息。
- **[`RESPONSE_INIT`](https://angular.dev/api/core/RESPONSE_INIT 'API reference')：** 提供对响应初始化选项的访问，其类型是 Web API 中的 [`ResponseInit`](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters)。你可以借此动态设置响应的响应头和状态码。需要在运行时确定的响应头或状态码，请使用这个令牌来设置。
- **[`REQUEST_CONTEXT`](https://angular.dev/api/core/REQUEST_CONTEXT 'API reference')：** 提供对当前请求相关的额外上下文的访问。这个上下文可以作为 [`handle`](https://angular.dev/api/ssr/AngularAppEngine#handle 'API reference') 函数的第二个参数传入。它通常用于提供不属于标准 Web API 的额外请求相关信息。

```ts
import {inject, REQUEST, Component} from '@angular/core';

@Component({
  selector: 'app-my-component',
  template: `<h1>My Component</h1>`,
})
export class MyComponent {
  constructor() {
    const request = inject(REQUEST);
    console.log(request?.url);
  }
}
```

<!-- UL is used below as otherwise the list will not be include as part of the note. -->
<!-- prettier-ignore-start -->

::: warning 重要
在以下场景中，上述令牌的值为 `null`：

<ul class="docs-list">
  <li>在构建过程中。</li>
  <li>在浏览器中渲染应用时（CSR）。</li>
  <li>执行静态站点生成时（SSG）。</li>
  <li>在开发环境中提取路由期间（发生请求时）。</li>
</ul>

:::

<!-- prettier-ignore-end -->

## 生成完全静态的应用

默认情况下，Angular 会预渲染整个应用，并生成一个用于处理请求的服务器文件。这让你的应用可以向用户提供预渲染的内容。但是，如果你更想要一个不需要服务器的完全静态的网站，可以在 `angular.json` 配置文件中把 `outputMode` 设为 `static`，从而关闭这一行为。

当 `outputMode` 设为 `static` 时，Angular 会在构建时为每个路由生成预渲染的 HTML 文件，但不会生成服务器文件，也不需要 Node.js 服务器来提供应用服务。这对部署到不需要后端服务器的静态托管服务很有用。

要进行这项配置，请按如下方式更新 `angular.json` 文件：

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "outputMode": "static"
          }
        }
      }
    }
  }
}
```

### 预渲染文件的输出格式

`prerender` 选项的 `format` 属性控制 Angular 为每个预渲染路由写出的文件结构。对于路径为 `about` 的路由：

| `format` | 预渲染文件 |
| --------------------- | ------------------ |
| `directory`（默认） | `about/index.html` |
| `file` | `about.html` |

根据你使用的静态托管服务，如果托管服务需要 `<route>.html` 文件才能在不重定向到带尾部斜杠的地址的情况下提供路由，你可以把 `format` 设为 `"file"`。

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "outputMode": "static",
            "prerender": {
              "format": "file"
            }
          }
        }
      }
    }
  }
}
```

::: info 注意
只有当构建不生成服务器时，才会考虑 `format` 选项。

:::

## 使用 HttpClient 时缓存数据

在服务器上运行时，`HttpClient` 会缓存发出的网络请求。这些信息会被序列化，作为服务器发送的初始 HTML 的一部分传给浏览器。在浏览器中，`HttpClient` 会检查缓存中是否有数据，如果有，就在应用初始渲染期间复用这些数据，而不是发起新的 HTTP 请求。在浏览器中运行的应用一旦变得[稳定](https://angular.dev/api/core/ApplicationRef#isStable)，`HttpClient` 就会停止使用缓存。

### 配置响应体大小限制

在服务端渲染期间，当 `HttpClient` 使用默认的 fetch 后端时，Angular 会把每个响应体限制在 1 MB 以内。这个限制可以防止服务器在渲染期间缓冲意外过大的响应。如果响应超出了配置的限制，请求会失败，并报 [NG02825](/errors/NG02825) 错误。

如果你的应用在服务器渲染期间需要获取更大的响应，请在 `provideServerRendering` 的选项中设置 `maxResponseBodySize`：

```ts
import {provideServerRendering, withRoutes} from '@angular/ssr';
import {ApplicationConfig} from '@angular/core';
import {serverRoutes} from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(
      {
        maxResponseBodySize: 5 * 1024 * 1024, // 5MB
      },
      withRoutes(serverRoutes),
    ),
  ],
};
```

`maxResponseBodySize` 以字节为单位配置，并全局应用于使用 fetch 后端的服务端 `HttpClient` 请求。

::: warning 重要
在应用允许的范围内，让这个限制尽可能小。提高这个限制会让服务端请求缓冲更大的响应体，这可能增加内存占用和拒绝服务攻击的风险。最好把大型下载移到服务器渲染之外。

:::

::: danger 严重
在 SSR 期间，按照 [Fetch 标准](https://fetch.spec.whatwg.org/#concept-main-fetch)的要求，Fetch 实现会在返回响应之前读取整个响应体以验证 `integrity`。Angular 只在 Fetch 返回响应之后才强制执行 [`maxResponseBodySize`](/guide/ssr#configuring-the-response-body-size-limit)，因此这个限制无法约束完整性验证期间缓冲的数据。

:::

### 配置缓存选项

你可以通过配置 `HttpTransferCacheOptions`，自定义 Angular 在服务端渲染（SSR）期间如何缓存 HTTP 响应，以及在水合期间如何复用它们。  
这项配置通过在 `provideClientHydration()` 中使用 `withHttpTransferCacheOptions` 全局提供。

默认情况下，`HttpClient` 会缓存所有不包含 `Authorization`、`Proxy-Authorization` 或 `Cookie` 请求头、并且没有使用 `withCredentials` 或可能发送凭据的 Fetch API `credentials` 模式发送的 `HEAD`、`QUERY` 和 `GET` 请求。当请求或响应包含禁止缓存的 `Cache-Control` 指令（`no-store`、`no-cache` 或 `private`），或者 Fetch API 的 `cache` 选项设为 `no-store` 或 `no-cache` 时，Angular 也会跳过传输缓存。带有 `Set-Cookie` 响应头的响应同样会被跳过。你可以在水合配置中使用 `withHttpTransferCacheOptions` 覆盖请求过滤设置。

```ts
import {
  bootstrapApplication,
  provideClientHydration,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeHeaders: ['ETag', 'Cache-Control'],
        filter: (req) => !req.url.includes('/api/profile'),
        includePostRequests: true,
        includeRequestsWithAuthHeaders: false,
      }),
    ),
  ],
});
```

### `includeHeaders`

指定服务器响应中的哪些响应头应该包含在缓存条目中。  
默认不包含任何响应头。

```ts
withHttpTransferCacheOptions({
  includeHeaders: ['ETag', 'Cache-Control'],
});
```

::: warning 重要
避免包含身份验证令牌之类的敏感响应头。它们可能会在请求之间泄露用户专属的数据。

:::

在 `includeHeaders` 中包含 `Cache-Control`，只是让这个响应头在水合后的响应中可用。在判断请求或响应是否适用于传输缓存时，Angular 已经会自动评估 `Cache-Control` 响应头。

### `includePostRequests`

默认情况下，只缓存 `GET`、`QUERY` 和 `HEAD` 请求。  
当 `POST` 请求被用作读操作（例如 GraphQL 查询）时，你可以为它们启用缓存。

```ts
withHttpTransferCacheOptions({
  includePostRequests: true,
});
```

只有当 `POST` 请求是**幂等的**、并且可以安全地在服务器渲染和客户端渲染之间复用时，才使用这个选项。

### `includeRequestsWithAuthHeaders`

决定包含 `Authorization`、`Proxy‑Authorization` 或 `Cookie` 请求头的请求是否可以被缓存。  
默认情况下，这些请求会被排除，以免缓存用户专属的响应。

```ts
withHttpTransferCacheOptions({
  includeRequestsWithAuthHeaders: true,
});
```

只有当身份验证请求头**不会**影响响应内容时（例如用于分析 API 的公共令牌），才启用这个选项。

### `includeRequestsWithCredentials`

决定使用 `withCredentials` 或 Fetch API `credentials` 模式（`include` 或 `same-origin`）发送的请求是否可以被缓存。  
默认情况下，这些请求会被排除，以免缓存用户专属的响应。

```ts
withHttpTransferCacheOptions({
  includeRequestsWithCredentials: true,
});
```

只有当带凭据的请求返回的响应可以安全缓存时，才启用这个选项。

### `includeNonCacheableRequests`

决定以下请求和响应是否可以被缓存：包含禁止缓存的 `Cache-Control` 指令（`no-store`、`no-cache` 或 `private`）的请求和响应、带有 `Set-Cookie` 响应头的响应，以及使用 Fetch API `cache` 选项（`no-store` 或 `no-cache`）的请求。  
默认情况下，这些都会被排除，以遵守 HTTP 缓存控制。

```ts
withHttpTransferCacheOptions({
  includeNonCacheableRequests: true,
});
```

只有当你需要为传输缓存绕过缓存控制限制时，才启用这个选项。

### 按请求覆盖

你可以使用 `transferCache` 请求选项，为某个特定请求覆盖缓存行为。

```ts
// 为这个请求包含特定的响应头
http.get('/api/profile', {transferCache: {includeHeaders: ['CustomHeader']}});
```

### 禁用缓存

你可以全局地或逐个地禁用对服务器发出请求的 HTTP 缓存。

#### 全局禁用

要为应用中的所有请求禁用缓存，请使用 `withNoHttpTransferCache` 特性：

```ts
import {
  bootstrapApplication,
  provideClientHydration,
  withNoHttpTransferCache,
} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [provideClientHydration(withNoHttpTransferCache())],
});
```

#### 过滤

你也可以使用 `withHttpTransferCacheOptions` 中的 [`filter`](https://angular.dev/api/common/http/HttpTransferCacheOptions) 选项，有选择地为某些请求禁用缓存。例如，你可以为某个特定的 API 端点禁用缓存：

```ts
import {
  bootstrapApplication,
  provideClientHydration,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideClientHydration(
      withHttpTransferCacheOptions({
        filter: (req) => !req.url.includes('/api/sensitive-data'),
      }),
    ),
  ],
});
```

使用这个选项可以排除那些包含用户专属数据或动态数据的端点（例如 `/api/profile`）。

#### 按请求禁用

要为单个请求禁用缓存，可以在 `HttpRequest` 中指定 [`transferCache`](https://angular.dev/api/common/http/HttpRequest#transferCache) 选项。

```ts
httpClient.get('/api/sensitive-data', {transferCache: false});
```

`HttpTransferCache` 不会缓存明确选择不缓存的请求或响应。当请求包含带有 `no-store`、`no-cache` 或 `private` 的 `Cache-Control` 请求头，或者请求使用的 Fetch API `cache` 选项设为 `no-store` 或 `no-cache` 时，Angular 会跳过传输缓存条目。带有 `Cache-Control: no-store`、`Cache-Control: no-cache` 或 `Cache-Control: private` 的响应同样不会存入传输缓存。包含 `Set-Cookie` 响应头的响应也不会被存储，因为它们通常携带用户专属的状态。

::: info 注意
如果你的应用在服务器和客户端上使用不同的 HTTP 源来调用 API，可以使用 `HTTP_TRANSFER_CACHE_ORIGIN_MAP` 令牌在这些源之间建立映射，这样 `HttpTransferCache` 功能就能把这些请求识别为相同的请求，并在客户端水合期间复用服务器上缓存的数据。

:::

## 配置服务器

### Node.js

`@angular/ssr/node` 专门针对 Node.js 环境扩展了 `@angular/ssr`。它提供的 API 让你可以更轻松地在 Node.js 应用中实现服务端渲染。完整的函数列表和用法示例，请参阅 [`@angular/ssr/node` API 参考](https://angular.dev/api/ssr/node/AngularNodeAppEngine)。

```ts [server.ts]
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
      } else {
        next(); // 把控制权交给下一个中间件
      }
    })
    .catch(next);
});

/**
 * Angular CLI 使用的请求处理器（开发服务器和构建期间）。
 */
export const reqHandler = createNodeRequestHandler(app);
```

### 非 Node.js

`@angular/ssr` 提供了在 Node.js 以外的平台上对 Angular 应用进行服务端渲染所需的基本 API。它基于 Web API 中标准的 [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) 和 [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) 对象，让你可以把 Angular SSR 集成到各种服务器环境中。详细信息和示例请参阅 [`@angular/ssr` API 参考](https://angular.dev/api/ssr/AngularAppEngine)。

```ts [server.ts]
import {AngularAppEngine, createRequestHandler} from '@angular/ssr';

const angularApp = new AngularAppEngine();

/**
 * Angular CLI 使用的请求处理器（开发服务器和构建期间）。
 */
export const reqHandler = createRequestHandler(async (req: Request) => {
  const res: Response | null = await angularApp.handle(req);

  // ...
});
```

## 安全

关于防范服务端请求伪造（SSRF）和配置允许的主机的详细信息，请参阅[服务端安全](/best-practices/security#preventing-server-side-request-forgery-ssrf)指南。
