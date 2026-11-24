# 拦截器

`HttpClient` 支持一种被称为*拦截器*（interceptor）的中间件。

::: info 简而言之
拦截器是一种中间件，它可以把围绕重试、缓存、日志记录和身份验证的常见模式从单个请求中抽象出来。

:::

`HttpClient` 支持两种拦截器：函数式拦截器和基于 DI 的拦截器。我们建议使用函数式拦截器，因为它们的行为更可预测，在复杂配置中尤其如此。本指南中的示例都使用函数式拦截器，[基于 DI 的拦截器](#di-based-interceptors)则在最后单独一节中介绍。

## 拦截器

拦截器通常是可以针对每个请求运行的函数，它们拥有广泛的能力，可以影响请求和响应的内容及整体流程。你可以安装多个拦截器，它们会形成一条拦截器链，链中的每个拦截器都会先处理请求或响应，再把它转发给链中的下一个拦截器。

你可以使用拦截器实现各种常见模式，例如：

- 为发往特定 API 的请求添加身份验证请求头。
- 以指数退避的方式重试失败的请求。
- 在一段时间内缓存响应，或者缓存到被变更操作作废为止。
- 自定义响应的解析方式。
- 测量服务器响应时间并记录下来。
- 在网络操作进行期间驱动加载指示器之类的 UI 元素。
- 收集并批量处理在某个时间段内发出的请求。
- 在超过可配置的截止时间或超时后自动让请求失败。
- 定期轮询服务器并刷新结果。

## 定义拦截器

拦截器的基本形式是一个函数，它接收即将发出的 `HttpRequest`，以及一个代表拦截器链中下一个处理步骤的 `next` 函数。

例如，下面这个 `loggingInterceptor` 会在转发请求之前，把即将发出的请求 URL 记录到 `console.log`：

```ts
export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  console.log(req.url);
  return next(req);
}
```

为了让这个拦截器真正拦截请求，你必须配置 `HttpClient` 来使用它。

## 配置拦截器

通过依赖注入（Dependency Injection）配置 `HttpClient` 时，可以使用 `withInterceptors` 功能来声明要使用的一组拦截器：

```ts
bootstrapApplication(App, {
  providers: [provideHttpClient(withInterceptors([loggingInterceptor, cachingInterceptor]))],
});
```

你配置的拦截器会按照你在 providers 中列出的顺序串联起来。在上面的例子中，`loggingInterceptor` 会先处理请求，然后把它转发给 `cachingInterceptor`。

### 拦截响应事件

拦截器可以转换 `next` 返回的由 `HttpEvent` 组成的 `Observable` 流，以便访问或操作响应。由于这个流包含所有响应事件，可能需要检查每个事件的 `.type` 才能识别出最终的响应对象。

```ts
export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response) {
        console.log(req.url, 'returned a response with status', event.status);
      }
    }),
  );
}
```

::: tip 提示
拦截器天然地把响应与其对应的请求关联起来，因为它们是在一个捕获了请求对象的闭包中转换响应流的。

:::

## 修改请求

`HttpRequest` 和 `HttpResponse` 实例的大部分内容都是*不可变的*，拦截器无法直接修改它们。拦截器会改为使用 `.clone()` 操作克隆这些对象，并指定新实例中哪些属性需要改变，以此来应用修改。这可能涉及对值本身（如 `HttpHeaders` 或 `HttpParams`）执行不可变更新。

例如，要为请求添加一个请求头：

```ts
const reqWithHeader = req.clone({
  headers: req.headers.set('X-New-Header', 'new header value'),
});
```

借助这种不可变性，当同一个 `HttpRequest` 被多次提交到拦截器链时，大多数拦截器都能保持幂等。出现这种情况的原因有好几种，包括请求在失败后被重试。

::: danger 严重
请求或响应的请求体（body）**不受**深层修改的保护。如果拦截器必须修改请求体，请注意处理它在同一个请求上多次运行的情况。

:::

## 拦截器中的依赖注入

拦截器运行在注册它们的那个注入器（Injector）的*注入上下文*（injection context）中，并且可以使用 Angular 的 [`inject`](https://angular.dev/api/core/inject) API 来获取依赖。

例如，假设某个应用有一个名为 `AuthService` 的服务（Service），它为即将发出的请求创建身份验证令牌。拦截器可以注入并使用这个服务：

```ts
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // 注入当前的 `AuthService`，并用它获取身份验证令牌：
  const authToken = inject(AuthService).getAuthToken();

  // 克隆请求，以添加身份验证请求头。
  const newReq = req.clone({
    headers: req.headers.append('X-Authentication-Token', authToken),
  });
  return next(newReq);
}
```

## 请求和响应的元数据

通常，在请求中包含一些不会发送给后端、而是专门供拦截器使用的信息会很有用。`HttpRequest` 有一个 `.context` 对象，它以 `HttpContext` 实例的形式存储这类元数据。这个对象的作用类似于一个带类型的映射，其键的类型为 `HttpContextToken`。

为了说明这个机制是如何工作的，我们用元数据来控制某个请求是否启用缓存拦截器。

### 定义上下文令牌

要在请求的 `.context` 映射中存储缓存拦截器是否应缓存该请求，请定义一个新的 `HttpContextToken` 作为键：

```ts
export const CACHING_ENABLED = new HttpContextToken<boolean>(() => true);
```

所提供的函数会为那些没有显式设置该令牌值的请求创建默认值。使用函数可以确保：如果令牌的值是对象或数组，每个请求都会得到自己的实例。

### 在拦截器中读取令牌

然后，拦截器就可以读取这个令牌，并根据它的值决定是否应用缓存逻辑：

```ts
export function cachingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (req.context.get(CACHING_ENABLED)) {
    // 应用缓存逻辑
    return ...;
  } else {
    // 此请求已禁用缓存
    return next(req);
  }
}
```

### 在发出请求时设置上下文令牌

通过 `HttpClient` API 发出请求时，你可以为 `HttpContextToken` 提供值：

```ts
const data$ = http.get('/sensitive/data', {
  context: new HttpContext().set(CACHING_ENABLED, false),
});
```

拦截器可以从请求的 `HttpContext` 中读取这些值。

### 请求上下文是可变的

与 `HttpRequest` 的其他属性不同，与之关联的 `HttpContext` 是*可变的*。如果某个拦截器修改了一个稍后会被重试的请求的上下文，那么同一个拦截器再次运行时会观察到这个上下文的变化。如有需要，这可以用来在多次重试之间传递状态。

## 合成响应

大多数拦截器只是在转换请求或响应的同时调用 `next` 处理器，但这并不是严格的要求。本节将讨论拦截器实现更高级行为的几种方式。

拦截器并不一定要调用 `next`。它们可以选择通过其他机制来构造响应，例如从缓存中获取，或者通过另一种机制发送请求。

可以使用 `HttpResponse` 构造函数来构造响应：

```ts
const resp = new HttpResponse({
  body: 'response body',
});
```

## 处理重定向信息

当 `HttpClient` 使用 fetch 后端时，响应会包含一个 `redirected` 属性，用于表明该响应是否是重定向的结果。这个属性与原生 Fetch API 规范一致，在拦截器中处理重定向场景时会很有用。

拦截器可以访问重定向信息并据此采取行动：

```ts
export function redirectTrackingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response && event.redirected) {
        console.log('Request to', req.url, 'was redirected to', event.url);
        // 处理重定向逻辑，例如更新分析数据、执行安全检查等。
      }
    }),
  );
}
```

你也可以利用重定向信息在拦截器中实现条件逻辑：

```ts
export function authRedirectInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response && event.redirected) {
        // 检查是否被重定向到了登录页
        if (event.url?.includes('/login')) {
          // 处理身份验证重定向
          handleAuthRedirect();
        }
      }
    }),
  );
}
```

## 处理响应类型

当 `HttpClient` 使用 fetch 后端时，响应会包含一个 `responseType` 属性，用于表明浏览器是如何根据 CORS 策略和请求模式处理该响应的。这个属性与原生 Fetch API 规范一致，可以为调试 CORS 问题和理解响应的可访问性提供有价值的信息。

响应的 `responseType` 属性可以取以下值：

- `'basic'` - 同源响应，所有响应头均可访问
- `'cors'` - 跨源响应，且已正确配置 CORS 响应头
- `'opaque'` - 未使用 CORS 的跨源响应，响应头和响应体可能受到限制
- `'opaqueredirect'` - no-cors 模式下被重定向的请求所返回的响应
- `'error'` - 发生了网络错误

拦截器可以利用响应类型信息进行 CORS 调试和错误处理：

```ts
export function responseTypeInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response) {
        // 适当地处理不同的响应类型
        switch (event.responseType) {
          case 'opaque':
            // 对响应数据的访问受限
            console.warn('Limited response data due to CORS policy');
            break;
          case 'cors':
          case 'basic':
            // 可以完全访问响应数据
            break;
          case 'error':
            // 处理网络错误
            console.error('Network error in response');
            break;
        }
      }
    }),
  );
}
```

## 基于 DI 的拦截器

`HttpClient` 也支持以可注入类的形式定义、并通过 DI 系统配置的拦截器。基于 DI 的拦截器与函数式拦截器的能力完全相同，只是配置机制不同。

基于 DI 的拦截器是一个实现了 `HttpInterceptor` 接口的可注入类：

```ts
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Request URL: ' + req.url);
    return handler.handle(req);
  }
}
```

基于 DI 的拦截器通过依赖注入的多重提供者（multi-provider）来配置：

```ts
bootstrapApplication(App, {
  providers: [
    provideHttpClient(
      // 必须显式启用基于 DI 的拦截器。
      withInterceptorsFromDi(),
    ),

    {provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true},
  ],
});
```

基于 DI 的拦截器会按照其提供者的注册顺序运行。在 DI 配置庞大且层级复杂的应用中，这个顺序可能非常难以预测。
