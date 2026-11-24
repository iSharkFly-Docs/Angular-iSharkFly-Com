# 使用 `debounced` 对信号进行防抖 {#debouncing-signals-with-debounced}

::: warning 重要
`debounced` 是[实验性](/reference/releases#experimental)功能。你可以试用它，但在稳定之前它可能会发生变化。

:::

使用 `debounced` 可以推迟对信号（Signal）值的响应，直到它不再变化为止。它返回一个资源（Resource），其值反映源信号经过防抖后的值。

```ts
import {Component, debounced, resource, signal} from '@angular/core';

@Component({
  template: `
    <input (input)="query.set($event.target.value)" />

    @if (results.isLoading()) {
      <p>Searching…</p>
    }
    @for (item of results.value(); track item.id) {
      <li>{{ item.name }}</li>
    }
  `,
})
export class Search {
  query = signal('');

  debouncedQuery = debounced(this.query, 300);

  results = resource({
    params: () => this.debouncedQuery.value(),
    loader: ({params}) => fetchResults(params),
  });
}
```

`debounced` 接受源信号和以毫秒为单位的等待时长。返回的资源的 `value()` 包含最后一次稳定下来的值，而 `status()` 会告诉你是否仍有新值处于等待中。

## 防抖期间的状态 {#status-during-debounce}

在已解析出值之后、防抖计时器倒计时期间，`status()` 为 `'loading'`，`value()` 返回之前解析出的值。计时器到期后，资源会稳定为 `'resolved'`。

如果源信号抛出错误，资源会立即进入 `'error'` 状态，`value()` 会抛出错误，并且不会运行计时器。源信号不再抛出错误之后，资源会保持在 `'error'` 状态，直到新的等待结束，然后变为 `'resolved'`。

所有状态及其对应的 `value()` 行为，请参阅[资源状态](/guide/signals/resource#resource-status)。

## 自定义等待函数 {#custom-wait-function}

除了传入毫秒时长，你还可以传入一个返回 `Promise<void>` 的函数。当这个 Promise 解析时，资源也随之解析。如果源信号在 Promise 完成之前发生变化，Angular 会丢弃之前的 Promise 并开始一个新的。

```ts
debouncedQuery = debounced(query, (value, lastSnapshot) => {
  // 出错后立即重试，而不是让用户再等一次。
  if (lastSnapshot.status === 'error') return;
  // 较短的查询使用更长的延迟——用户很可能还在输入。
  const ms = value.length < 3 ? 500 : 200;
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
});
```

详情请参阅 API 参考中的 `DebounceTimer` 类型。

## 相等性 {#equality}

默认情况下，`debounced` 使用 `Object.is` 比较值。

如果默认的同一性检查过于严格，可以通过 `equal` 选项提供自定义的相等性函数：

```ts
debouncedFilter = debounced(filter, 200, {
  equal: (a, b) => a.category === b.category && a.minPrice === b.minPrice,
});
```

## 注入上下文 {#injection-context}

`debounced` 必须在[注入上下文（Injection Context）](/guide/di/dependency-injection-context)中调用。当注入器（Injector）被销毁时，Angular 会自动销毁这个防抖资源，并取消所有等待中的计时器。

要在注入上下文之外使用 `debounced`，请通过选项显式传入一个 `Injector`：

```ts
@Service()
export class SearchService {
  private injector = inject(Injector);

  createDebouncedQuery(query: Signal<string>): Resource<string> {
    return debounced(query, 300, {injector: this.injector});
  }
}
```
