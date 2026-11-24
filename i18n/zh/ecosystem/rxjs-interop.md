# RxJS 与 Angular 信号的互操作

`@angular/core/rxjs-interop` 包提供了一些 API，帮助你把 RxJS 与 Angular 信号（Signal）集成在一起。

## 使用 `toSignal` 从 RxJS 可观察对象创建信号

使用 `toSignal` 函数创建一个跟踪可观察对象（Observable）值的信号。它的行为与模板中的 `async` 管道类似，但更加灵活，可以在应用中的任何地方使用。

```ts
import {Component} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {interval} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  template: `{{ counter() }}`,
})
export class Ticker {
  counterObservable = interval(1000);

  // 获取一个表示 `counterObservable` 值的 `Signal`。
  counter = toSignal(this.counterObservable, {initialValue: 0});
}
```

与 `async` 管道一样，`toSignal` 会立即订阅可观察对象，这可能会触发副作用。当调用 `toSignal` 的组件或服务被销毁时，`toSignal` 创建的订阅会自动取消对该可观察对象的订阅。

::: warning 重要
`toSignal` 会创建一个订阅。你应该避免对同一个可观察对象重复调用它，而是复用它返回的信号。

:::

### 注入上下文

默认情况下，`toSignal` 需要在 [注入上下文](/guide/di/dependency-injection-context) 中运行，例如在组件或服务的构造期间。如果没有可用的注入上下文，你可以手动指定要使用的 `Injector`。

### 初始值

可观察对象在订阅时不一定会同步产生值，但信号始终需要一个当前值。处理 `toSignal` 信号的这个「初始」值有以下几种方式。

#### `initialValue` 选项

如上面的示例所示，你可以指定 `initialValue` 选项，作为可观察对象首次发出值之前信号要返回的值。

#### `undefined` 初始值

如果你没有提供 `initialValue`，那么在可观察对象发出值之前，生成的信号将返回 `undefined`。这与 `async` 管道返回 `null` 的行为类似。

#### `requireSync` 选项

有些可观察对象保证会同步发出值，例如 `BehaviorSubject`。在这种情况下，你可以指定 `requireSync: true` 选项。

当 `requireSync` 为 `true` 时，`toSignal` 会强制要求可观察对象在订阅时同步发出值。这保证了信号始终有值，因而不需要 `undefined` 类型或初始值。

### `manualCleanup`

默认情况下，当创建 `toSignal` 的组件或服务被销毁时，它会自动取消对可观察对象的订阅。

要覆盖这一行为，你可以传入 `manualCleanup` 选项。对于那些会自然完成的可观察对象，可以使用这个设置。

#### 自定义相等性比较

有些可观察对象发出的值可能是 **相等** 的，即使它们的引用或某些细节不同。`equal` 选项允许你定义一个 **自定义相等函数**，用来判断两个连续的值何时应被视为相同。

当两个发出的值被视为相等时，生成的信号 **不会更新**。这可以避免冗余的计算、DOM 更新或副作用的不必要重新运行。

```ts
import {Component} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {interval, map} from 'rxjs';

@Component(/* ... */)
export class EqualExample {
  temperature$ = interval(1000).pipe(
    map(() => ({temperature: Math.floor(Math.random() * 3) + 20})), // 随机生成 20、21 或 22
  );

  // 仅在温度变化时更新
  temperature = toSignal(this.temperature$, {
    initialValue: {temperature: 20},
    equal: (prev, curr) => prev.temperature === curr.temperature,
  });
}
```

### 错误与完成

如果 `toSignal` 中使用的可观察对象产生了错误，那么读取该信号时会抛出这个错误。

如果 `toSignal` 中使用的可观察对象完成了，信号会继续返回完成之前最近发出的值。

## 使用 `toObservable` 从信号创建 RxJS 可观察对象

使用 `toObservable` 工具函数创建一个跟踪信号值的 `Observable`。信号的值由一个 `effect` 监视，当值发生变化时，它会把该值发送给可观察对象。

```ts
import {Component, signal, Signal, inject} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';

@Component(/* ... */)
export class SearchResults {
  query: Signal<string> = inject(QueryService).query;
  query$ = toObservable(this.query);

  results$ = this.query$.pipe(switchMap((query) => this.http.get('/search?q=' + query)));
}
```

当 `query` 信号发生变化时，`query$` 可观察对象会发出最新的查询，并触发一个新的 HTTP 请求。

### 注入上下文 {#injection-context-to-observable}

默认情况下，`toObservable` 需要在 [注入上下文](/guide/di/dependency-injection-context) 中运行，例如在组件或服务的构造期间。如果没有可用的注入上下文，你可以手动指定要使用的 `Injector`。

### `toObservable` 的时机

`toObservable` 使用一个副作用（Effect）在 `ReplaySubject` 中跟踪信号的值。订阅时，第一个值（如果有）可能会同步发出，之后的所有值都将是异步的。

与可观察对象不同，信号从不提供同步的变更通知。即使你多次更新信号的值，`toObservable` 也只会在信号稳定之后才发出值。

```ts
const obs$ = toObservable(mySignal);
obs$.subscribe((value) => console.log(value));

mySignal.set(1);
mySignal.set(2);
mySignal.set(3);
```

在这里，只有最后一个值（3）会被打印出来。

## 使用 `rxResource` 处理异步数据

Angular 的 [`resource` 函数](/guide/signals/resource) 为你提供了一种将异步数据整合到应用中基于信号的代码里的方式。在这种模式的基础上，`rxResource` 让你可以定义一种资源（Resource），其数据源以 RxJS `Observable` 的形式定义。`rxResource` 不接受 `loader` 函数，而是接受一个返回 RxJS `Observable` 的 `stream` 函数。

```ts
import {Component, inject, input} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';

@Component(/* ... */)
export class UserProfile {
  // 这个组件依赖一个通过 RxJS Observable 暴露数据的服务。
  private userData = inject(MyUserDataClient);

  protected userId = input<string>();

  private userResource = rxResource({
    params: () => ({userId: this.userId()}),

    // `stream` 属性需要一个工厂函数，该函数返回
    // 一个以 RxJS Observable 表示的数据流。
    stream: ({params}) => this.userData.load(params.userId),
  });
}
```

`stream` 属性接受一个用于创建 RxJS `Observable` 的工厂函数。该工厂函数会接收资源的 `params` 值，并返回一个 `Observable`。每当 `params` 计算产生新值时，资源都会调用这个工厂函数。关于传给工厂函数的参数的更多细节，请参阅 [资源加载器](/guide/signals/resource#resource-loaders)。

在其他所有方面，`rxResource` 的行为都与 `resource` 相同，并提供相同的 API，用于指定参数、读取值、检查加载状态和查看错误。

从 `stream` 返回的 `Observable` 在完成之前必须始终发出一个值或一个错误；否则会发生什么以及如何避免，请参阅 [`NG0991`](/errors/NG0991)。
