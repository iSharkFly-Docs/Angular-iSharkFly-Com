# 发起 HTTP 请求

`HttpClient` 提供了与各种 HTTP 动词相对应的方法，用于发起请求，既可以加载数据，也可以在服务器上执行变更。每个方法都会返回一个 [RxJS `Observable`](https://rxjs.dev/guide/observable)，订阅它时会发送请求，并在服务器响应时发出结果。

::: info 注意
`HttpClient` 创建的 `Observable` 可以被订阅任意多次，每次订阅都会发起一个新的后端请求。

:::

通过传给请求方法的选项对象，可以调整请求的各种属性以及返回的响应类型。

## 获取 JSON 数据

从后端获取数据通常需要使用 [`HttpClient.get()`](https://angular.dev/api/common/http/HttpClient#get) 方法发起 GET 请求。这个方法接受两个参数：要从中获取数据的端点 URL 字符串，以及一个用于配置请求的*可选的选项*对象。

例如，使用 `HttpClient.get()` 方法从一个假想的 API 获取配置数据：

```ts
http.get<Config>('/api/config').subscribe((config) => {
  // 处理配置。
});
```

注意这里的泛型类型参数，它指定服务器返回的数据是 `Config` 类型。这个参数是可选的，如果省略它，返回的数据将是 `Object` 类型。

::: tip 提示
在处理结构不确定、可能包含 `undefined` 或 `null` 值的数据时，可以考虑使用 `unknown` 类型而不是 `Object` 作为响应类型。

:::

::: danger 严重
请求方法的泛型类型是对服务器返回数据的一种类型**断言**。`HttpClient` 不会验证实际返回的数据是否与这个类型匹配。

:::

## 获取其他类型的数据

默认情况下，`HttpClient` 假定服务器会返回 JSON 数据。与非 JSON 的 API 交互时，你可以在发起请求时告诉 `HttpClient` 预期的响应类型。这是通过 `responseType` 选项实现的。

| **`responseType` 值** | **返回的响应类型**                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `'json'`（默认）       | 给定泛型类型的 JSON 数据                                                                                                       |
| `'text'`                 | 字符串数据                                                                                                                               |
| `'arraybuffer'`          | 包含原始响应字节的 [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) |
| `'blob'`                 | [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob) 实例                                                                        |

例如，你可以让 `HttpClient` 把一张 `.jpeg` 图片的原始字节下载到一个 `ArrayBuffer` 中：

```ts
http.get('/images/dog.jpg', {responseType: 'arraybuffer'}).subscribe((buffer) => {
  console.log('The image is ' + buffer.byteLength + ' bytes large');
});
```

::: warning `responseType` 必须是字面量值
由于 `responseType` 的值会影响 `HttpClient` 返回的类型，它必须是字面量类型，而不能是 `string` 类型。

如果传给请求方法的选项对象是一个对象字面量，这一点会自动满足；但如果你把请求选项提取到某个变量或辅助方法中，可能就需要显式地把它指定为字面量，例如 `responseType: 'text' as const`。
:::

## 变更服务器状态

执行变更的服务器 API 通常需要发起 POST 请求，并在请求体中指定新的状态或要进行的更改。

[`HttpClient.post()`](https://angular.dev/api/common/http/HttpClient#post) 方法的行为与 `get()` 类似，只是在选项之前还接受一个额外的 `body` 参数：

```ts
http.post<Config>('/api/config', newConfig).subscribe((config) => {
  console.log('Updated config:', config);
});
```

可以把许多不同类型的值作为请求的 `body` 提供，`HttpClient` 会相应地对它们进行序列化：

| **`body` 类型**                                                                                                               | **序列化为**                                    |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 字符串                                                                                                                        | 纯文本                                           |
| 数字、布尔值、数组或普通对象                                                                                       | JSON                                                 |
| [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)                       | 缓冲区中的原始数据                             |
| [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob)                                                                     | 带有 `Blob` 内容类型的原始数据              |
| [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData)                                                             | `multipart/form-data` 编码的数据                   |
| [`HttpParams`](https://angular.dev/api/common/http/HttpParams) 或 [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) | `application/x-www-form-urlencoded` 格式的字符串 |

::: warning 重要
记得对变更请求的 `Observable` 调用 `.subscribe()`，这样才会真正发出请求。

:::

## 设置 URL 参数

使用 `params` 选项指定应包含在请求 URL 中的请求参数。

传入一个对象字面量是配置 URL 参数最简单的方式：

```ts
http
  .get('/api/config', {
    params: {filter: 'all'},
  })
  .subscribe((config) => {
    // ...
  });
```

另外，如果你需要对参数的构造或序列化进行更多控制，可以传入一个 `HttpParams` 实例。

::: warning 重要
`HttpParams` 的实例是*不可变的*，不能直接修改。相反，`append()` 等修改方法会返回一个应用了修改的新 `HttpParams` 实例。

:::

```ts
const baseParams = new HttpParams().set('filter', 'all');

http
  .get('/api/config', {
    params: baseParams.set('details', 'enabled'),
  })
  .subscribe((config) => {
    // ...
  });
```

你可以使用自定义的 `HttpParameterCodec` 来实例化 `HttpParams`，由它决定 `HttpClient` 如何把参数编码到 URL 中。

### 自定义参数编码

默认情况下，`HttpParams` 使用内置的 [`HttpUrlEncodingCodec`](https://angular.dev/api/common/http/HttpUrlEncodingCodec) 来编码和解码参数的键和值。

你可以提供自己的 [`HttpParameterCodec`](https://angular.dev/api/common/http/HttpParameterCodec) 实现，以自定义编码和解码的方式。

```ts
import {HttpClient, HttpParams, HttpParameterCodec} from '@angular/common/http';
import {inject} from '@angular/core';

export class CustomHttpParamEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

export class ApiService {
  private http = inject(HttpClient);

  search() {
    const params = new HttpParams({
      encoder: new CustomHttpParamEncoder(),
    })
      .set('email', 'dev+alerts@example.com')
      .set('q', 'a & b? c/d = e');

    return this.http.get('/api/items', {params});
  }
}
```

## 设置请求头

使用 `headers` 选项指定应包含在请求中的请求头。

传入一个对象字面量是配置请求头最简单的方式：

```ts
http
  .get('/api/config', {
    headers: {
      'X-Debug-Level': 'verbose',
    },
  })
  .subscribe((config) => {
    // ...
  });
```

另外，如果你需要对请求头的构造进行更多控制，可以传入一个 `HttpHeaders` 实例。

::: warning 重要
`HttpHeaders` 的实例是*不可变的*，不能直接修改。相反，`append()` 等修改方法会返回一个应用了修改的新 `HttpHeaders` 实例。

:::

```ts
const baseHeaders = new HttpHeaders().set('X-Debug-Level', 'minimal');

http
  .get<Config>('/api/config', {
    headers: baseHeaders.set('X-Debug-Level', 'verbose'),
  })
  .subscribe((config) => {
    // ...
  });
```

## 与服务器响应事件交互

为方便起见，`HttpClient` 默认返回一个由服务器所返回数据（即响应体）组成的 `Observable`。有时你需要检查实际的响应，例如获取特定的响应头。

要访问完整的响应，请把 `observe` 选项设置为 `'response'`：

```ts
http.get<Config>('/api/config', {observe: 'response'}).subscribe((res) => {
  console.log('Response status:', res.status);
  console.log('Body:', res.body);
});
```

::: warning `observe` 必须是字面量值
由于 `observe` 的值会影响 `HttpClient` 返回的类型，它必须是字面量类型，而不能是 `string` 类型。

如果传给请求方法的选项对象是一个对象字面量，这一点会自动满足；但如果你把请求选项提取到某个变量或辅助方法中，可能就需要显式地把它指定为字面量，例如 `observe: 'response' as const`。
:::

## 接收原始进度事件

除了响应体或响应对象之外，`HttpClient` 还可以返回一个原始*事件*流，这些事件对应于请求生命周期中的特定时刻。这些事件包括请求发送时、响应头返回时，以及响应体完成时。这些事件还可以包括*进度事件*，用于报告大型请求体或响应体的上传和下载状态。

进度事件默认是禁用的（因为它们会带来性能开销），但可以通过 `reportUploadProgress` 和 `reportDownloadProgress` 选项启用。

::: info 注意
`HttpClient` 默认的 fetch 后端不支持*上传*进度事件，如果你设置了 `reportUploadProgress`，就会抛出错误。如果你的应用需要上传进度事件，请在 `provideHttpClient(...)` 中使用 `withXhr()` 来配置 `HttpClient`。

:::

要观察事件流，请把 `observe` 选项设置为 `'events'`：

```ts
http
  .get('/api/download', {
    reportDownloadProgress: true,
    observe: 'events',
  })
  .subscribe((event) => {
    switch (event.type) {
      case HttpEventType.DownloadProgress:
        console.log('Downloaded ' + event.loaded + ' out of ' + event.total + ' bytes');
        break;
      case HttpEventType.Response:
        console.log('Finished downloading!');
        break;
    }
  });
```

::: warning `observe` 必须是字面量值
由于 `observe` 的值会影响 `HttpClient` 返回的类型，它必须是字面量类型，而不能是 `string` 类型。

如果传给请求方法的选项对象是一个对象字面量，这一点会自动满足；但如果你把请求选项提取到某个变量或辅助方法中，可能就需要显式地把它指定为字面量，例如 `observe: 'events' as const`。
:::

事件流中报告的每个 `HttpEvent` 都有一个 `type`，用于区分该事件所代表的含义：

| **`type` 值**                 | **事件含义**                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `HttpEventType.Sent`             | 请求已发送到服务器                                      |
| `HttpEventType.UploadProgress`   | 一个 `HttpUploadProgressEvent`，报告上传请求体的进度      |
| `HttpEventType.ResponseHeader`   | 已收到响应头部，包括状态和响应头           |
| `HttpEventType.DownloadProgress` | 一个 `HttpDownloadProgressEvent`，报告下载响应体的进度 |
| `HttpEventType.Response`         | 已收到完整的响应，包括响应体                 |
| `HttpEventType.User`             | 来自 HTTP 拦截器的自定义事件。                                           |

## 处理请求失败

HTTP 请求可能以三种方式失败：

- 网络或连接错误可能导致请求无法到达后端服务器。
- 设置了超时选项时，请求没有及时响应。
- 后端收到了请求，但处理失败，并返回了一个错误响应。

`HttpClient` 会把上述所有类型的错误都捕获到一个 `HttpErrorResponse` 中，并通过 `Observable` 的错误通道返回。网络错误和超时错误的 `status` 码为 `0`。对于超时，`error` 是一个名为 `TimeoutError` 的 `DOMException`；对于网络错误，它是 `fetch` 抛出的错误（使用 `withXhr()` 时则是一个 [`ProgressEvent`](https://developer.mozilla.org/docs/Web/API/ProgressEvent)）。后端错误的 `status` 码是后端返回的失败状态码，`error` 则是错误响应。检查响应，以确定错误的原因以及处理该错误的适当方式。

[RxJS 库](https://rxjs.dev/)提供了一些对错误处理很有用的操作符。

你可以使用 `catchError` 操作符把错误响应转换为供 UI 使用的值。这个值可以告诉 UI 显示错误页面或错误值，并在必要时记录错误的原因。

有时，网络中断之类的瞬时错误可能会导致请求意外失败，而只需重试请求就能成功。RxJS 提供了几个*重试*操作符，它们会在特定条件下自动重新订阅失败的 `Observable`。例如，`retry()` 操作符会自动尝试重新订阅指定的次数。

### 超时

要为请求设置超时，可以在其他请求选项之外，把 `timeout` 选项设置为一个毫秒数。如果后端请求没有在指定时间内完成，请求就会被中止，并发出一个错误。

::: info 注意
超时只作用于后端 HTTP 请求本身，而不是整个请求处理链的超时。因此，这个选项不受拦截器所引入的任何延迟影响。

:::

```ts
http
  .get('/api/config', {
    timeout: 3000,
  })
  .subscribe({
    next: (config) => {
      console.log('Config fetched successfully:', config);
    },
    error: (err) => {
      // 如果请求超时，就会发出一个错误。
    },
  });
```

## 高级 fetch 选项

Angular 的 `HttpClient` 支持一些高级的 fetch API 选项，它们可以提升性能和用户体验。这些选项在使用 fetch 后端（即默认后端）时可用。

### Fetch 选项

以下选项可以在使用 fetch 后端时对请求行为进行细粒度控制。

#### Keep-alive 连接

`keepalive` 选项允许请求在发起它的页面关闭后继续存在。这对于分析或日志请求特别有用，即使用户离开了页面，这些请求也需要完成。

```ts
http
  .post('/api/analytics', analyticsData, {
    keepalive: true,
  })
  .subscribe();
```

#### HTTP 缓存控制

`cache` 选项控制请求如何与浏览器的 HTTP 缓存交互，这可以显著提升重复请求的性能。

```ts
//  无论是否新鲜，都使用缓存的响应
http
  .get('/api/config', {
    cache: 'force-cache',
  })
  .subscribe((config) => {
    // ...
  });

// 总是从网络获取，绕过缓存
http
  .get('/api/live-data', {
    cache: 'no-cache',
  })
  .subscribe((data) => {
    // ...
  });

// 只使用缓存的响应，如果不在缓存中则失败
http
  .get('/api/static-data', {
    cache: 'only-if-cached',
  })
  .subscribe((data) => {
    // ...
  });
```

#### 针对 Core Web Vitals 的请求优先级

`priority` 选项允许你指明请求的相对重要性，帮助浏览器优化资源加载，以获得更好的 Core Web Vitals 分数。

```ts
// 关键资源使用高优先级
http
  .get('/api/user-profile', {
    priority: 'high',
  })
  .subscribe((profile) => {
    // ...
  });

// 非关键资源使用低优先级
http
  .get('/api/recommendations', {
    priority: 'low',
  })
  .subscribe((recommendations) => {
    // ...
  });

// 自动优先级（默认）由浏览器决定
http
  .get('/api/settings', {
    priority: 'auto',
  })
  .subscribe((settings) => {
    // ...
  });
```

可用的 `priority` 值：

- `'high'`：高优先级，尽早加载（例如关键的用户数据、首屏内容）
- `'low'`：低优先级，在资源空闲时加载（例如分析数据、预取数据）
- `'auto'`：由浏览器根据请求上下文决定优先级（默认）

::: tip 提示
对影响最大内容绘制（LCP）的请求使用 `priority: 'high'`，对不影响初始用户体验的请求使用 `priority: 'low'`。

:::

#### 请求模式

`mode` 选项控制请求如何处理跨源请求，并决定响应类型。

```ts
// 仅限同源请求
http
  .get('/api/local-data', {
    mode: 'same-origin',
  })
  .subscribe((data) => {
    // ...
  });

// 启用 CORS 的跨源请求
http
  .get('https://api.external.com/data', {
    mode: 'cors',
  })
  .subscribe((data) => {
    // ...
  });

// 用于简单跨源请求的 No-CORS 模式
http
  .get('https://external-api.com/public-data', {
    mode: 'no-cors',
  })
  .subscribe((data) => {
    // ...
  });
```

可用的 `mode` 值：

- `'same-origin'`：只允许同源请求，跨源请求会失败
- `'cors'`：允许使用 CORS 的跨源请求（默认）
- `'no-cors'`：允许不使用 CORS 的简单跨源请求，响应是不透明的

::: tip 提示
在浏览器中，对于绝不应跨源的敏感请求，请使用 `mode: 'same-origin'`。

:::

::: warning 重要
在 Node.js 上进行 SSR 时，`HttpClient` 使用 Node.js [基于 Undici 的 Fetch 实现](https://nodejs.org/api/globals.html#fetch)。[Undici 不会执行浏览器的 CORS 检查](https://undici.nodejs.org/#cors)，因此 `mode: 'same-origin'` 不会限制服务端请求。请根据允许列表来验证受用户影响的 URL。

:::

#### 重定向处理

`redirect` 选项指定如何处理来自服务器的重定向响应。

```ts
// 自动跟随重定向（默认行为）
http
  .get('/api/resource', {
    redirect: 'follow',
  })
  .subscribe((data) => {
    // ...
  });

// 阻止自动重定向
http
  .get('/api/resource', {
    redirect: 'manual',
  })
  .subscribe((response) => {
    // 手动处理重定向
  });

// 把重定向视为错误
http
  .get('/api/resource', {
    redirect: 'error',
  })
  .subscribe({
    next: (data) => {
      // 成功的响应
    },
    error: (err) => {
      // 重定向响应会触发这个错误处理器
    },
  });
```

可用的 `redirect` 值：

- `'follow'`：自动跟随重定向（默认）
- `'error'`：把重定向视为错误
- `'manual'`：不自动跟随重定向，而是返回重定向响应

::: tip 提示
当你需要用自定义逻辑处理重定向时，请使用 `redirect: 'manual'`。

:::

#### 凭据处理

`credentials` 选项控制是否随跨源请求发送 cookie、授权请求头以及其他凭据。这对于身份验证场景尤其重要。

```ts
// 为跨源请求包含凭据
http
  .get('https://api.example.com/protected-data', {
    credentials: 'include',
  })
  .subscribe((data) => {
    // ...
  });

// 从不发送凭据（跨源请求的默认行为）
http
  .get('https://api.example.com/public-data', {
    credentials: 'omit',
  })
  .subscribe((data) => {
    // ...
  });

// 仅为同源请求发送凭据
http
  .get('/api/user-data', {
    credentials: 'same-origin',
  })
  .subscribe((data) => {
    // ...
  });

// withCredentials 会覆盖 credentials 设置
http
  .get('https://api.example.com/data', {
    credentials: 'omit', // 这一项会被忽略
    withCredentials: true, // 这一项会强制使用 credentials: 'include'
  })
  .subscribe((data) => {
    // 尽管设置了 credentials: 'omit'，请求仍会包含凭据
  });

// 旧式写法（仍受支持）
http
  .get('https://api.example.com/data', {
    withCredentials: true,
  })
  .subscribe((data) => {
    // 等同于 credentials: 'include'
  });
```

::: warning 重要
`withCredentials` 选项的优先级高于 `credentials` 选项。如果两者都指定了，无论显式设置的 `credentials` 值是什么，`withCredentials: true` 总会导致 `credentials: 'include'`。

:::

可用的 `credentials` 值：

- `'omit'`：从不发送凭据
- `'same-origin'`：仅为同源请求发送凭据（默认）
- `'include'`：总是发送凭据，即使是跨源请求

::: tip 提示
当你需要向另一个支持 CORS 的域发送身份验证 cookie 或请求头时，请使用 `credentials: 'include'`。避免混用 `credentials` 和 `withCredentials` 选项，以免造成混淆。

:::

::: warning 重要
在 Node.js 上进行 SSR 时，`credentials: 'include'` 不会自动转发来自浏览器传入请求的 cookie。`credentials` 选项也不会移除你显式添加的 `Cookie` 或 `Authorization` 请求头。[Undici 允许一些浏览器所禁止的请求头](https://undici.nodejs.org/#forbidden-and-safelisted-header-names)，因此只应把凭据相关的请求头转发给受信任的源。

:::

#### Referrer

`referrer` 选项允许你控制随请求发送的来源（referrer）信息。这对隐私和安全方面的考量很重要。

```ts
// 发送一个特定的 referrer URL
http
  .get('/api/data', {
    referrer: 'https://example.com/page',
  })
  .subscribe((data) => {
    // ...
  });

// 使用当前页面作为 referrer（默认行为）
http
  .get('/api/analytics', {
    referrer: 'about:client',
  })
  .subscribe((data) => {
    // ...
  });
```

`referrer` 选项接受：

- 一个有效的 URL 字符串：设置要发送的具体 referrer URL
- 空字符串 `''`：不发送任何 referrer 信息
- `'about:client'`：使用默认的 referrer（当前页面的 URL）

::: tip 提示
对于不希望泄露来源页面 URL 的敏感请求，请使用 `referrer: ''`。

:::

#### Referrer 策略

`referrerPolicy` 选项控制随 HTTP 请求一起发送多少 referrer 信息（即发起请求的页面的 URL）。这个设置同时影响隐私和分析，让你可以在数据可见性与安全考量之间取得平衡。

```ts
// 无论当前页面是什么，都不发送 referrer 信息
http
  .get('/api/data', {
    referrerPolicy: 'no-referrer',
  })
  .subscribe();

// 只发送源（例如 https://example.com）
http
  .get('/api/analytics', {
    referrerPolicy: 'origin',
  })
  .subscribe();
```

`referrerPolicy` 选项接受：

- `'no-referrer'` 从不发送 `Referer` 请求头。
- `'no-referrer-when-downgrade'` 对同源请求和安全的（HTTPS→HTTPS）请求发送 referrer，但从安全的源跳转到安全性较低的源（HTTPS→HTTP）时省略它。
- `'origin'` 只发送 referrer 的源（协议、主机、端口），省略路径和查询信息。
- `'origin-when-cross-origin'` 对同源请求发送完整 URL，对跨源请求只发送源。
- `'same-origin'` 对同源请求发送完整 URL，对跨源请求不发送 referrer。
- `'strict-origin'` 只发送源，并且仅在协议安全级别没有降级（例如 HTTPS→HTTPS）时才发送。降级时省略 referrer。
- `'strict-origin-when-cross-origin'` 浏览器的默认行为。对同源请求发送完整 URL；对跨源请求，在没有降级时发送源；降级时省略 referrer。
- `'unsafe-url'` 总是发送完整 URL（包括路径和查询）。这可能会暴露敏感数据，应谨慎使用。

::: tip 提示
对于涉及隐私的敏感请求，优先使用 `'no-referrer'`、`'origin'` 或 `'strict-origin-when-cross-origin'` 这类保守的值。

:::

#### 完整性

`integrity` 选项允许你通过提供预期内容的加密哈希，来验证响应没有被篡改。这在从 CDN 加载脚本或其他资源时特别有用。

```ts
// 使用 SHA-256 哈希验证响应的完整性
http
  .get('/api/script.js', {
    integrity: 'sha256-ABC123...',
    responseType: 'text',
  })
  .subscribe((script) => {
    // 脚本内容已根据哈希进行了验证
  });
```

::: warning 重要
`integrity` 选项要求响应内容与所提供的哈希完全匹配。如果内容不匹配，请求将以网络错误失败。

:::

::: danger 严重
在 SSR 期间，按照 [Fetch 标准](https://fetch.spec.whatwg.org/#concept-main-fetch)的要求，Fetch 实现会在返回响应之前读取整个响应体以验证 `integrity`。Angular 只会在 Fetch 返回响应之后才执行 [`maxResponseBodySize`](/guide/ssr#configuring-the-response-body-size-limit) 限制，因此这个限制无法约束完整性验证期间缓冲的数据。

:::

::: tip 提示
从外部来源加载关键资源时，请使用子资源完整性来确保它们没有被修改。可以使用 `openssl` 等工具生成哈希。

:::

## HTTP `Observable`

`HttpClient` 上的每个请求方法都会构造并返回一个所请求响应类型的 `Observable`。在使用 `HttpClient` 时，理解这些 `Observable` 的工作方式非常重要。

`HttpClient` 产生的是 RxJS 所说的「冷」`Observable`，也就是说，在订阅 `Observable` 之前不会发生任何实际请求。只有到那时，请求才会真正发送到服务器。多次订阅同一个 `Observable` 会触发多个后端请求。每次订阅都是相互独立的。

::: tip 提示
你可以把 `HttpClient` 的 `Observable` 看作实际服务器请求的*蓝图*。

:::

订阅之后，取消订阅会中止正在进行的请求。如果 `Observable` 是通过 `async` 管道（Pipe）订阅的，这一点非常有用，因为当用户离开当前页面时，它会自动取消请求。此外，如果你把 `Observable` 与 `switchMap` 之类的 RxJS 组合操作符一起使用，这种取消机制会清理掉任何过时的请求。

一旦响应返回，来自 `HttpClient` 的 `Observable` 通常就会完成（尽管拦截器可能会影响这一点）。

由于会自动完成，即使没有清理 `HttpClient` 的订阅，通常也不存在内存泄漏的风险。不过，与任何异步操作一样，我们强烈建议你在使用这些订阅的组件（Component）销毁时清理它们，否则订阅回调仍可能运行，并在尝试与已销毁的组件交互时遇到错误。

::: tip 提示
使用 `async` 管道或 `toSignal` 操作来订阅 `Observable`，可以确保订阅被正确地释放。

:::

## 最佳实践

虽然可以在组件中直接注入并使用 `HttpClient`，但我们通常建议你创建可复用、可注入的服务（Service），用来隔离和封装数据访问逻辑。例如，下面这个 `UserService` 封装了按 id 请求用户数据的逻辑：

```ts
@Service()
export class UserService {
  private http = inject(HttpClient);

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/user/${id}`);
  }
}
```

在组件中，你可以把 `@if` 与 `async` 管道结合起来，只在数据加载完成后才渲染相应的 UI：

```ts
import {AsyncPipe} from '@angular/common';
import {Component, input, inject, effect} from '@angular/core';
import {Observable} from 'rxjs';

@Component({
  imports: [AsyncPipe],
  template: `
    @if (user$ | async; as user) {
      <p>Name: {{ user.name }}</p>
      <p>Biography: {{ user.biography }}</p>
    }
  `,
})
export class UserProfile {
  userId = input.required<string>();
  user$!: Observable<User>;

  private userService = inject(UserService);

  constructor() {
    effect(() => {
      this.user$ = this.userService.getUser(this.userId());
    });
  }
}
```
