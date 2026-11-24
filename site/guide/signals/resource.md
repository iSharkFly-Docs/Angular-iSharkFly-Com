# 使用资源实现异步响应 {#async-reactivity-with-resources}

所有信号（Signal）API 都是同步的——`signal`、`computed`、`input` 等等。然而，应用常常需要处理异步获得的数据。资源（Resource）为你提供了一种方式，把异步数据整合进应用中基于信号的代码，同时仍然可以同步访问其数据。

你可以使用 `Resource` 执行任何类型的异步操作，但 `Resource` 最常见的用例是从服务器获取数据。下面的例子创建了一个资源来获取一些用户数据。

创建 `Resource` 最简单的方式是使用 `resource` 函数。

```ts
import {computed, resource, Signal} from '@angular/core';

const userId: Signal<string> = getUserId();

const userResource = resource({
  // 定义一个响应式计算。
  // 每当读取的任何信号发生变化时，params 的值都会重新计算。
  params: () => ({id: userId()}),

  // 定义一个用来获取数据的异步加载器。
  // 每当 `params` 的值发生变化时，资源都会调用这个函数。
  loader: ({params}) => fetchUser(params),
});

// 基于资源加载器函数的结果创建一个计算信号。
const firstName = computed(() => {
  if (userResource.hasValue()) {
    // `hasValue` 有两个用途：
    // - 它作为类型守卫，从类型中去掉 `undefined`
    // - 当资源处于错误状态时，它可以防止读取会抛出错误的 `value`
    return userResource.value().firstName;
  }

  // 资源的值为 `undefined` 或资源处于错误状态时的后备值
  return undefined;
});
```

`resource` 函数接受一个 `ResourceOptions` 对象，它有两个主要属性：`params` 和 `loader`。

`params` 属性定义了一个产生参数值的响应式计算。每当这个计算中读取的信号发生变化时，资源都会产生一个新的参数值，这一点与 `computed` 类似。

`loader` 属性定义了一个 `ResourceLoader`——一个用来获取某些状态的异步函数。每当 `params` 计算产生新值时，资源都会调用加载器，并把这个值传给它。详情请参阅下文的[资源加载器](#resource-loaders)。

`Resource` 有一个 `value` 信号，其中包含加载器的结果。

## 资源加载器 {#resource-loaders}

创建资源时，你需要指定一个 `ResourceLoader`。这个加载器是一个异步函数，它接受单个参数——一个 `ResourceLoaderParams` 对象——并返回一个值。

`ResourceLoaderParams` 对象包含三个属性：`params`、`previous` 和 `abortSignal`。

| 属性          | 说明                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `params`      | 资源的 `params` 计算的值。                                                                                                |
| `previous`    | 一个带有 `status` 属性的对象，包含之前的 `ResourceStatus`。                                                                    |
| `abortSignal` | 一个 [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)。详情请参阅下文的[中止请求](#aborting-requests)。 |

如果 `params` 计算返回 `undefined`，加载器函数就不会运行，资源状态变为 `'idle'`。

### 流式资源 {#streaming-resources}

有些异步数据源会随着时间推移产生多个值，而不是只返回单个结果。例如 WebSocket、服务器发送事件（SSE）以及 Firestore 的 `onSnapshot` 监听器。

对于这类持续更新的数据源，请使用 `stream`。`loader` 每次请求只解析一次，而 `stream` 不同，它返回一个信号，其值可以随着新数据的到来不断更新。

对于一次性的异步操作，例如从 HTTP 端点获取数据，请使用 `loader`。

在这个例子中，`userUpdates` 模拟了一个外部数据源，例如 WebSocket 或 SSE 连接。

```ts
const userUpdates = signal({value: 'Alice'});

const userResource = resource({
  stream: () => userUpdates,
});

// 模拟从外部数据源到达了一个新值：
userUpdates.set({value: 'Bob'});
```

### 中止请求 {#aborting-requests}

如果在资源加载期间 `params` 计算发生了变化，资源会中止尚未完成的加载操作。

你可以使用 `ResourceLoaderParams` 中的 `abortSignal` 来响应被中止的请求。例如，原生的 `fetch` 函数就接受 `AbortSignal`：

```ts
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params, abortSignal}): Promise<User> => {
    // 当给定的 `AbortSignal` 表明请求已被中止时，
    // fetch 会取消所有尚未完成的 HTTP 请求。
    return fetch(`users/${params.id}`, {signal: abortSignal}).then((res) => res.json());
  },
});
```

关于使用 `AbortSignal` 取消请求的更多细节，请参阅 [MDN 上的 `AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)。

### 重新加载 {#reloading}

你可以调用 `reload` 方法，以编程方式触发资源的 `loader`。

```ts
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

// ...

userResource.reload();
```

## 资源状态 {#resource-status}

资源对象有几个信号属性，用于读取异步加载器的状态。

| 属性        | 说明                                                                                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`     | 资源最近的值；如果还没有收到任何值，则为默认值（除非设置了 `defaultValue`，否则为 `undefined`）。当状态为 `'error'` 时，读取 `value()` 会抛出错误。 |
| `hasValue`  | 资源是否有值。                                                                                                                                                            |
| `error`     | 运行资源加载器时遇到的最近一次错误；如果没有发生错误，则为 `undefined`。                                                                              |
| `isLoading` | 资源加载器当前是否正在运行。                                                                                                                                            |
| `status`    | 资源具体的 `ResourceStatus`，如下所述。                                                                                                                                |

`status` 信号提供一个具体的 `ResourceStatus`，它用字符串常量来描述资源的状态。

| 状态          | `value()`         | 说明                                                                         |
| ------------- | :---------------- | ---------------------------------------------------------------------------- |
| `'idle'`      | `undefined`       | 资源没有有效的请求，加载器尚未运行。                |
| `'error'`     | 抛出错误          | 加载器遇到了错误。                                         |
| `'loading'`   | `undefined`       | 由于 `params` 的值发生变化，加载器正在运行。            |
| `'reloading'` | 之前的值          | 由于调用了资源的 `reload` 方法，加载器正在运行。 |
| `'resolved'`  | 解析出的值        | 加载器已完成。                                                    |
| `'local'`     | 本地设置的值      | 资源的值已通过 `.set()` 或 `.update()` 在本地设置        |

你可以利用这些状态信息有条件地显示用户界面元素，例如加载指示器和错误消息。

## 在 SSR 中缓存 `resource` 数据 {#caching-resource-data-with-ssr}

当应用在服务器上渲染时，资源加载器会运行一次以生成初始 HTML。在水合（Hydration）期间，浏览器通常会再次运行同一个加载器。

要复用服务器端的结果，请为资源提供一个 `id`。Angular 会在服务器上把解析出的值存入 `TransferState`，并在客户端用它把资源初始化为 `'resolved'` 状态。

```ts
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
  id: 'user-unique-id',
});
```

`id` 值在应用中必须唯一，并且在服务器和客户端上必须一致，这样 Angular 才能把缓存条目与请求它的资源匹配起来。

::: warning 重要
由于缓存的值会被序列化到页面的 HTML 中，对于加载了特定于触发服务端渲染的那个用户的数据的资源，请避免设置 `id`，尤其是当渲染出的 HTML 可能被缓存或在用户之间共享时。

:::

## 串联资源 {#chaining-resources}

有时一个资源依赖于另一个资源的结果。你可以使用 `params` 上下文对象中提供的 `chain` 函数来表达这种依赖。

```ts
import {resource} from '@angular/core';

const userResource = resource({
  params: () => ({id: getUserId()}),
  loader: ({params}) => fetchUser(params),
});

const companyResource = resource({
  params: ({chain}) => chain(userResource)?.companyId,
  loader: ({params: companyId}) => fetchCompany(companyId),
});
```

这里的 `companyResource` 依赖于用户的 `companyId`，而它只有在 `userResource` 加载完成后才能知道。`chain(userResource)` 会读取 `userResource` 的值，并自动把它的状态传播给 `companyResource`：

- 如果 `userResource` 处于 **idle** 状态，`companyResource` 也会变为 `idle`。
- 如果 `userResource` 处于 **loading** 或 **reloading** 状态，`companyResource` 会进入 `loading` 状态，并且其加载器不会运行。注意，在 `reloading` 期间，`chain` 不会返回之前解析出的值。
- 如果 `userResource` 处于 **error** 状态，`companyResource` 也会进入 `error` 状态。
- 如果 `userResource` 处于 **resolved** 或 **local** 状态，`chain` 会返回它的当前值，`companyResource` 随后会把这个值用作自己的 params。

当 `chain` 从 `userResource` 传播状态（`idle`、`loading`、`reloading` 或 `error`）时，params 函数不会继续执行。当 `userResource` 为 `resolved` 或 `local` 时，`chain` 会返回它的值，而这个值本身也可能是 `undefined`。示例中用 `chain(userResource)?.companyId` 处理了这种情况，因此 `undefined` 值会导致 params 为 `undefined`，`companyResource` 变为 `idle`。

::: info 注意
请直接把链接得到的值作为 params 值传递，而不要把它包装在对象中。像 `{companyId: undefined}` 这样的 params 值仍然是一个已定义的值，因此加载器会带着值为 `undefined` 的 `companyId` 运行，而不是让资源变为 `idle`。

:::

### 链接与直接读取资源值的对比 {#chaining-vs-reading-resource-values-directly}

你可能会想在 `params` 中直接读取资源的值：

```ts [reads value() directly without status propagation]
const companyResource = resource({
  params: () => {
    const user = userResource.value(); // 可能为 undefined
    return user ? {companyId: user.companyId} : undefined;
  },
  loader: ({params}) => fetchCompany(params.companyId),
});
```

这样虽然可行，但从 `params` 返回 `undefined` 会让资源变为 `idle`，而无法反映上游资源的实际状态。推荐使用 `chain`，因为它能正确地映射 `loading` 和 `error` 状态。

只有当下游资源需要执行依赖于上游值的异步工作时，才使用 `chain`。如果你只需要从资源同步地派生出一个值，请改用 `computed`。

## 使用 `httpResource` 实现响应式数据获取 {#reactive-data-fetching-with-httpresource}

[`httpResource`](/guide/http/http-resource) 是对 `HttpClient` 的包装，它以信号的形式提供请求状态和响应。它通过 Angular HTTP 栈（包括拦截器）发出 HTTP 请求。

## 使用快照组合资源 {#resource-composition-with-snapshots}

`ResourceSnapshot` 是资源当前状态的结构化表示。每个资源都有一个 `snapshot` 属性，它提供一个表示资源当前状态的信号。

```ts
const userId: Signal<string> = getUserId();

const userResource = resource({
  params: () => ({id: userId()}),
  loader: ({params}) => fetchUser(params),
});

const userSnapshot = userResource.snapshot;
```

每个快照都包含一个 `status`，以及一个 `value` 或一个 `error`。

### 用快照组合资源 {#composing-resources-with-snapshots}

::: warning 重要
`resourceFromSnapshots` 是[实验性](/reference/releases#experimental)功能。你可以试用它，但在稳定之前它可能会发生变化。

:::

你可以使用 `resourceFromSnapshots` 从快照创建新的资源。这样就能与 `computed` 和 `linkedSignal` 等信号 API 组合使用，以转换资源的行为。

```ts
import {
  Component,
  input,
  linkedSignal,
  resourceFromSnapshots,
  Resource,
  ResourceSnapshot,
} from '@angular/core';
import {httpResource} from '@angular/common/http';

function withPreviousValue<T>(input: Resource<T>): Resource<T> {
  const derived = linkedSignal<ResourceSnapshot<T>, ResourceSnapshot<T>>({
    source: input.snapshot,
    computation: (snap, previous) => {
      if (snap.status === 'loading' && previous && previous.value.status !== 'error') {
        // 当输入资源进入加载状态时，如果之前的状态有值，
        // 就保留该值。
        return {status: 'loading' as const, value: previous.value.value};
      }

      // 否则直接转发输入资源的状态。
      return snap;
    },
  });

  return resourceFromSnapshots(derived);
}

@Component({/*... */})
export class AwesomeProfile {
  userId = input.required<number>();
  user = withPreviousValue(httpResource(() => `/user/${this.userId()}`));
  // 当 userId 变化时，user.value() 会保留旧的用户数据，直到新数据加载完成
}
```
