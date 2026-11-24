# 配置 `HttpClient` {#setting-up-httpclient}

从 Angular v21 起，`HttpClient` 默认即可注入使用。

## 通过依赖注入提供 `HttpClient` {#providing-httpclient-through-dependency-injection}

你可以在 `app.config.ts` 的应用 `providers` 中使用 `provideHttpClient` 辅助函数，来配置默认的 HTTP 功能集或添加功能。

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(/* 在这里添加功能，例如 withInterceptors(...) */)],
};
```

如果你的应用使用的是基于 NgModule 的启动方式，可以把 `provideHttpClient` 加入应用 NgModule 的 providers 中，以配置默认的 HTTP 功能集或添加功能：

```ts
@NgModule({
  providers: [provideHttpClient(/* 在这里添加功能，例如 withInterceptors(...) */)],
  // ... 其他应用配置
})
export class AppModule {}
```

然后，你就可以把 `HttpClient` 服务（Service）作为依赖注入到组件（Component）、服务或其他类中：

```ts
@Service()
export class ConfigService {
  private http = inject(HttpClient);
  // 现在这个服务可以通过 `this.http` 发起 HTTP 请求了。
}
```

## 配置 `HttpClient` 的功能 {#configuring-features-of-httpclient}

`provideHttpClient` 接受一组可选的功能配置，用于启用或配置客户端的不同方面。本节详细介绍这些可选功能及其用法。

### `withXhr` {#withxhr}

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withXhr())],
};
```

默认情况下，`HttpClient` 使用 [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) API 发起请求。`withXhr` 功能会让客户端改用 [`XMLHttpRequest`](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest) API。

`fetch` 是更现代的 API，在少数不支持 `XMLHttpRequest` 的环境中也可用。不过它也有一些限制，比如不会产生上传进度事件。

::: danger 不要在服务端渲染（SSR）环境中使用 `withXhr`
服务端的 XHR 支持已被**弃用**，计划在 Angular 23 中移除。底层的 `xhr2` 库无法安全地处理重定向：它可能会在跨源重定向时转发 `Authorization` 请求头，并且容易因重定向循环而遭受拒绝服务（DoS）攻击。对于 SSR 应用，请改用默认的 `fetch` 后端。
:::

### `withInterceptors(...)` {#withinterceptors}

`withInterceptors` 用于配置一组拦截器（interceptor）函数，它们会处理通过 `HttpClient` 发出的请求。更多信息请参阅[拦截器指南](/guide/http/interceptors)。

### `withInterceptorsFromDi()` {#withinterceptorsfromdi}

`withInterceptorsFromDi` 会把旧式的基于类的拦截器纳入 `HttpClient` 配置中。更多信息请参阅[拦截器指南](/guide/http/interceptors)。

::: tip 提示
函数式拦截器（通过 `withInterceptors`）的执行顺序更可预测，我们推荐使用它们，而不是基于 DI 的拦截器。

:::

### `withRequestsMadeViaParent()` {#withrequestsmadeviaparent}

默认情况下，当你在某个注入器（Injector）中使用 `provideHttpClient` 配置 `HttpClient` 时，这个配置会覆盖父注入器中可能存在的任何 `HttpClient` 配置。

添加 `withRequestsMadeViaParent()` 后，`HttpClient` 会改为在请求经过当前层级配置的拦截器之后，把请求向上传递给父注入器中的 `HttpClient` 实例。如果你想在子注入器中*添加*拦截器，同时仍让请求经过父注入器的拦截器，这个功能就很有用。

::: danger 严重
你必须在当前注入器之上配置一个 `HttpClient` 实例，否则这个选项无效，并且在你尝试使用它时会得到运行时错误。

:::

### `withJsonpSupport()` {#withjsonpsupport}

::: danger JSONP 已弃用
`withJsonpSupport`、`HttpClientJsonpModule` 以及 `HttpClient` 上的 `.jsonp()` 方法都已弃用，因为 JSONP 可能导致跨站脚本（XSS）漏洞。请改用配合 [CORS](https://developer.mozilla.org/docs/Web/HTTP/CORS) 的标准 HTTP 请求。
:::

引入 `withJsonpSupport` 会启用 `HttpClient` 上的 `.jsonp()` 方法，它会通过 [JSONP 约定](https://en.wikipedia.org/wiki/JSONP)发起 GET 请求，以跨域加载数据。

::: tip 提示
如果可能，优先使用 [CORS](https://developer.mozilla.org/docs/Web/HTTP/CORS) 而不是 JSONP 来发起跨域请求。

:::

### `withXsrfConfiguration(...)` {#withxsrfconfiguration}

引入这个选项可以自定义 `HttpClient` 内置的 XSRF 安全功能。更多信息请参阅[安全指南](/best-practices/security)。

### `withNoXsrfProtection()` {#withnoxsrfprotection}

引入这个选项会禁用 `HttpClient` 内置的 XSRF 安全功能。更多信息请参阅[安全指南](/best-practices/security)。

## 基于 `HttpClientModule` 的配置 {#httpclientmodule-based-configuration}

有些应用可能会使用基于 NgModule 的旧 API 来配置 `HttpClient`。

下表列出了 `@angular/common/http` 中提供的 NgModule，以及它们与上述提供者（Provider）配置函数之间的对应关系。

| **NgModule**                            | 对应的 `provideHttpClient()` 写法                         |
| --------------------------------------- | -------------------------------------------------------- |
| `HttpClientModule`                      | `provideHttpClient(withInterceptorsFromDi(), withXhr())` |
| `HttpClientJsonpModule`（已弃用）    | `withJsonpSupport()`（已弃用）                        |
| `HttpClientXsrfModule.withOptions(...)` | `withXsrfConfiguration(...)`                             |
| `HttpClientXsrfModule.disable()`        | `withNoXsrfProtection()`                                 |

::: info 注意
`HttpClientModule` 和 `HttpClientXsrfModule` 也已弃用。请改用 `provideHttpClient` 及相应的功能。

:::

::: warning 在多个注入器中使用 HttpClientModule 时要小心
当 `HttpClientModule` 出现在多个注入器中时，拦截器的行为没有明确定义，并且取决于具体的选项以及提供者/导入的顺序。

对于多注入器的配置，优先使用 `provideHttpClient`，因为它的行为更稳定。请参阅上文的 `withRequestsMadeViaParent` 功能。
:::
