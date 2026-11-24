# 测试请求

和任何外部依赖一样，你必须模拟（mock）HTTP 后端，这样测试才能模拟与远程服务器的交互。`@angular/common/http/testing` 库提供了一些工具，用于捕获应用发出的请求、对这些请求进行断言，并模拟响应以仿真后端的行为。

这个测试库是为这样一种模式设计的：应用先执行代码并发出请求；然后测试预期某些请求已经发出或没有发出，对这些请求执行断言，最后通过「冲刷（flush）」每个预期的请求来提供响应。

最后，测试还可以验证应用没有发出任何意外的请求。

## 测试的准备工作

要开始测试 `HttpClient` 的用法，请配置 `TestBed`，并在测试的准备代码中引入 `provideHttpClientTesting()`。`HttpClient` 由 Angular 的测试环境提供，而 `provideHttpClientTesting()` 会把它配置为使用测试后端，而不是真实网络。它还会提供 `HttpTestingController`，你可以用它与测试后端交互、设置关于哪些请求已发出的预期，并为这些请求冲刷响应。配置完成后，就可以从 `TestBed` 中注入 `HttpTestingController`。

```ts
TestBed.configureTestingModule({
  providers: [
    // ... 其他测试提供者
    provideHttpClientTesting(),
  ],
});

const httpTesting = TestBed.inject(HttpTestingController);
```

现在，当测试发出请求时，这些请求会到达测试后端，而不是正常的后端。你可以使用 `httpTesting` 对这些请求进行断言。

### 在测试中配置 `HttpClient`

如果测试需要配置 `HttpClient` 的功能（例如拦截器（interceptor）），请在 `provideHttpClientTesting()` 之前引入 `provideHttpClient(...)`。
::: warning 重要
记住要在 `provideHttpClientTesting()` **之前**提供 `provideHttpClient()`，因为 `provideHttpClientTesting()` 会覆盖 `provideHttpClient()` 的部分内容。如果顺序反过来，可能会破坏你的测试。

:::

```ts
TestBed.configureTestingModule({
  providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
});
```

## 预期并应答请求

例如，你可以编写一个测试，预期会发生一个 GET 请求，并提供一个模拟响应：

```ts
TestBed.configureTestingModule({
  providers: [ConfigService, provideHttpClientTesting()],
});

const httpTesting = TestBed.inject(HttpTestingController);

// 加载 `ConfigService` 并请求当前配置。
const service = TestBed.inject(ConfigService);
const config$ = service.getConfig<Config>();

// `firstValueFrom` 会订阅这个 `Observable`，从而发出 HTTP 请求，
// 并创建一个代表响应的 `Promise`。
const configPromise = firstValueFrom(config$);

// 此时请求处于待处理状态，我们可以通过 `HttpTestingController`
// 断言它已经发出：
const req = httpTesting.expectOne('/api/config', 'Request to load the configuration');

// 如有需要，我们可以对请求的各个属性进行断言。
expect(req.request.method).toBe('GET');

// 冲刷请求会让它完成，并交付结果。
req.flush(DEFAULT_CONFIG);

// 然后我们可以断言 `ConfigService` 已成功交付响应：
expect(await configPromise).toEqual(DEFAULT_CONFIG);

// 最后，我们可以断言没有发出其他请求。
httpTesting.verify();
```

::: info 注意
如果测试发出了不止一个符合给定条件的请求，`expectOne` 就会失败。

:::

除了对 `req.method` 进行断言之外，你也可以使用 `expectOne` 的展开形式来同时匹配请求方法：

```ts
const req = httpTesting.expectOne(
  {
    method: 'GET',
    url: '/api/config',
  },
  'Request to load the configuration',
);
```

::: tip 提示
这些预期 API 会针对请求的完整 URL 进行匹配，包括所有查询参数。

:::

最后一步，即验证没有遗留未完成的请求，非常常见，因此你可以把它移到 `afterEach()` 步骤中：

```ts
afterEach(() => {
  // 验证所有测试都没有发出任何额外的 HTTP 请求。
  TestBed.inject(HttpTestingController).verify();
});
```

## 同时处理多个请求

如果你需要在测试中响应重复的请求，请使用 `match()` API，而不是 `expectOne()`。它接受相同的参数，但会返回一个由匹配请求组成的数组。一旦返回，这些请求就不会再参与后续的匹配，你需要负责冲刷并验证它们。

```ts
const allGetRequests = httpTesting.match({method: 'GET'});
for (const req of allGetRequests) {
  // 处理对每个请求的响应。
}
```

## 高级匹配

所有匹配函数都接受一个谓词函数，用于实现自定义的匹配逻辑：

```ts
// 查找一个带有请求体的请求。
const requestsWithBody = httpTesting.expectOne((req) => req.body !== null);
```

`expectNone` 函数会断言没有任何请求符合给定条件。

```ts
// 断言没有发出任何变更类请求。
httpTesting.expectNone((req) => req.method !== 'GET');
```

## 测试错误处理

你应该测试应用在 HTTP 请求失败时的响应。

### 后端错误

要测试对后端错误（服务器返回非成功状态码的情况）的处理，可以用一个错误响应来冲刷请求，以仿真请求失败时后端会返回的内容。

```ts
const req = httpTesting.expectOne('/api/config');
req.flush('Failed!', {status: 500, statusText: 'Internal Server Error'});

// 断言应用成功处理了后端错误。
```

### 网络错误

请求也可能因为网络错误而失败，`HttpClient` 会把这类错误报告为 `status` 为 `0` 的 `HttpErrorResponse`。可以使用 `error()` 方法来模拟这种情况，它会把给定的 `ProgressEvent` 包装进这样一个响应中：

```ts
const req = httpTesting.expectOne('/api/config');
req.error(new ProgressEvent('network error!'));

// 断言应用成功处理了网络错误。
```

## 测试拦截器

你应该测试拦截器在预期的情况下能正常工作。

例如，某个应用可能要求为每个发出的请求添加一个由服务（Service）生成的身份验证令牌。
这种行为可以借助拦截器来实现：

```ts
export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  const clonedRequest = request.clone({
    headers: request.headers.append('X-Authentication-Token', authService.getAuthToken()),
  });
  return next(clonedRequest);
}
```

这个拦截器的 `TestBed` 配置应该依赖 `withInterceptors` 功能。

```ts
TestBed.configureTestingModule({
  providers: [
    AuthService,
    // 建议一次只测试一个拦截器。
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClientTesting(),
  ],
});
```

`HttpTestingController` 可以获取请求实例，然后你可以检查这个实例，以确保请求已被修改。

```ts
const service = TestBed.inject(AuthService);
const http = TestBed.inject(HttpClient);

// 发出一个 HTTP 请求。
const response = firstValueFrom(http.get('/api/config'));

const req = httpTesting.expectOne('/api/config');

expect(req.request.headers.get('X-Authentication-Token')).toEqual(service.getAuthToken());
```

类似的拦截器也可以用基于类的拦截器来实现：

```ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const clonedRequest = request.clone({
      headers: request.headers.append('X-Authentication-Token', this.authService.getAuthToken()),
    });
    return next.handle(clonedRequest);
  }
}
```

要测试它，`TestBed` 配置应改为：

```ts
TestBed.configureTestingModule({
  providers: [
    AuthService,
    provideHttpClient(withInterceptorsFromDi()),
    provideHttpClientTesting(),
    // 我们依赖 HTTP_INTERCEPTORS 令牌把 AuthInterceptor 注册为 HttpInterceptor
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
});
```
