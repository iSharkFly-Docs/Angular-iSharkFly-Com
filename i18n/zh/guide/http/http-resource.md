# 使用 `httpResource` 进行响应式数据获取

`httpResource` 是对 `HttpClient` 的响应式封装，它以信号（Signal）的形式提供请求状态和响应。因此，你可以把这些信号与 `computed`、`effect`、`linkedSignal` 或任何其他响应式 API 一起使用。由于它构建在 `HttpClient` 之上，`httpResource` 支持与之相同的全部功能，例如拦截器（interceptor）。

关于 Angular 的 `resource` 模式的更多信息，请参阅[使用 `resource` 实现异步响应](/guide/signals/resource)。

## `Using httpResource`

::: tip 提示
`httpResource` 使用全局可用的 `HttpClient`。只有当你需要配置 HTTP 功能（例如拦截器或 XSRF 选项）时，才需要使用 `provideHttpClient(...)`。详情请参阅[配置 HttpClient](/guide/http/setup)。

:::

你可以通过返回一个 url 来定义 HTTP 资源（Resource）：

```ts
userId = input.required<string>();

user = httpResource(() => `/api/user/${userId()}`); // 以响应式函数作为参数
```

`httpResource` 是响应式的，也就是说，每当它所依赖的某个信号（比如 `userId`）发生变化时，资源都会发出一个新的 http 请求。
如果已有请求正在进行中，资源会先取消这个未完成的请求，再发出新请求。

::: tip 提示
`httpResource` 与 `HttpClient` 的不同之处在于，它会*立即*发起请求。相比之下，`HttpClient` 只有在订阅返回的 `Observable` 时才会发起请求。

:::

对于更复杂的请求，你可以定义一个请求对象，它与 `HttpClient` 所接受的请求类似。
请求对象中需要具备响应性的每个属性，都应该由信号组成。

```ts
user = httpResource(() => ({
  url: `/api/user/${userId()}`,
  method: 'GET',
  headers: {
    'X-Special': 'true',
  },
  params: {
    'fast': 'yes',
  },
  reportProgress: true,
  transferCache: true,
  keepalive: true,
  mode: 'cors',
  redirect: 'error',
  priority: 'high',
  cache: 'force-cache',
  credentials: 'include',
  referrer: 'no-referrer',
  integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GhEXAMPLEKEY=',
  referrerPolicy: 'no-referrer',
}));
```

::: tip 提示
避免把 `httpResource` 用于 `POST` 或 `PUT` 这类*变更*操作。对于这类操作，最好直接使用底层的 `HttpClient` API。

:::

`httpResource` 的信号可以在模板（Template）中用来控制应该显示哪些元素。

```html
@if (user.hasValue()) {
  <user-details [user]="user.value()" />
} @else if (user.error()) {
  <div>Could not load user information</div>
} @else if (user.isLoading()) {
  <div>Loading user info...</div>
}
```

::: tip 提示
在处于错误状态的 `resource` 上读取 `value` 信号会在运行时抛出错误。建议用 `hasValue()` 来保护对 `value` 的读取。

:::

### 响应类型

默认情况下，`httpResource` 会把响应作为 JSON 返回并解析。不过，你可以通过 `httpResource` 上的其他函数指定不同的返回类型：

```ts
httpResource.text(() => ({ … })); // 在 value() 中返回字符串

httpResource.blob(() => ({ … })); // 在 value() 中返回 Blob 对象

httpResource.arrayBuffer(() => ({ … })); // 在 value() 中返回 ArrayBuffer
```

### 跟踪下载进度

在请求对象中设置 `reportProgress: true`，即可跟踪响应的下载进度。最新的 `HttpProgressEvent` 可以通过资源的 `progress` 信号获取：

```ts
file = httpResource.blob(() => ({
  url: `/api/files/${fileId()}`,
  reportProgress: true,
}));

downloaded = computed(() => this.file.progress()?.loaded ?? 0);
```

::: info 注意
在 `HttpClient` 中，`reportProgress` 已被弃用，取而代之的是 `reportUploadProgress` 和 `reportDownloadProgress`；而 `httpResource` 与之不同，它保留了单一的 `reportProgress` 选项。这个选项只会启用下载进度事件。

:::

## 响应解析与验证

获取数据时，你可能希望根据预先定义的 schema 来验证响应，通常会借助 [Zod](https://zod.dev) 或 [Valibot](https://valibot.dev) 这类流行的开源库。你可以通过指定 `parse` 选项，把这类验证库与 `httpResource` 集成起来。`parse` 函数的返回类型决定了资源 `value` 的类型。

下面的例子使用 Zod 来解析和验证来自 [StarWars API](https://swapi.info/) 的响应。这样，资源的类型就与 Zod 解析的输出类型相同。

```ts
const starWarsPersonSchema = z.object({
  name: z.string(),
  height: z.number({coerce: true}),
  edited: z.string().datetime(),
  films: z.array(z.string()),
});

export class CharacterViewer {
  id = signal(1);

  swPersonResource = httpResource(() => `https://swapi.info/api/people/${this.id()}`, {
    parse: starWarsPersonSchema.parse,
  });
}
```

## 测试 httpResource

由于 `httpResource` 是对 `HttpClient` 的封装，你可以使用与 `HttpClient` 完全相同的 API 来测试 `httpResource`。详情请参阅 [HttpClient 测试](/guide/http/testing)。

下面的例子展示了针对使用 `httpResource` 的代码的单元测试。

```ts
TestBed.configureTestingModule({
  providers: [provideHttpClientTesting()],
});

const id = signal(0);
const mockBackend = TestBed.inject(HttpTestingController);
const response = httpResource(() => `/data/${id()}`, {injector: TestBed.inject(Injector)});
TestBed.tick(); // 触发副作用
const firstRequest = mockBackend.expectOne('/data/0');
firstRequest.flush(0);

// 确保这些值传递到 httpResource
await TestBed.inject(ApplicationRef).whenStable();

expect(response.value()).toEqual(0);
```
