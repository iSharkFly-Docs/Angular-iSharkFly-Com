# Angular 信号 {#angular-signals}

Angular 信号（Signal）是一套细粒度追踪状态在应用中被如何使用、在哪里使用的系统，让框架能够优化渲染更新。


::: tip 提示
在深入阅读这份完整指南之前，可以先看看 Angular 的[基础知识](/essentials/signals)。

:::

## 什么是信号？ {#what-are-signals}

**信号**是对一个值的包装，当这个值发生变化时，它会通知关心它的消费者。信号可以包含任何值，从原始类型到复杂的数据结构都可以。

通过调用信号的 getter 函数来读取它的值，这样 Angular 就能追踪信号在哪里被使用。

信号既可以是*可写的*，也可以是*只读的*。

### 可写信号 {#writable-signals}

可写信号（Writable Signal）提供了直接更新其值的 API。调用 `signal` 函数并传入信号的初始值，即可创建可写信号：

```ts
const count = signal(0);

// 信号是 getter 函数——调用它就会读取它的值。
console.log('The count is: ' + count());
```

要修改可写信号的值，可以直接用 `.set()` 设置：

```ts
count.set(3);
```

或者使用 `.update()` 操作，基于之前的值计算出新值：

```ts
// 把 count 加 1。
count.update((value) => value + 1);
```

可写信号的类型是 `WritableSignal`。

#### 把可写信号转换为只读信号 {#converting-writable-signals-to-readonly}

`WritableSignal` 提供了 `asReadonly()` 方法，它会返回该信号的只读版本。如果你想把信号的值暴露给消费者，又不允许他们直接修改它，这个方法就很有用：

```ts
@Service()
export class CounterState {
  // 私有的可写状态
  private readonly _count = signal(0);

  readonly count = this._count.asReadonly(); // 公开的只读信号

  increment() {
    this._count.update((v) => v + 1);
  }
}

@Component({/* ... */})
export class AwesomeCounter {
  state = inject(CounterState);

  count = this.state.count; // 可以读取，但不能修改

  increment() {
    this.state.increment();
  }
}
```

只读信号会反映原始可写信号的所有变化，但不能使用 `set()` 或 `update()` 方法修改它。

::: warning 重要
只读信号**没有**任何内置机制来阻止对其值的深层修改（deep mutation）。

:::

### 计算信号 {#computed-signals}

**计算信号**（Computed）是从其他信号派生出值的只读信号。使用 `computed` 函数并指定一个派生逻辑来定义计算信号：

```ts
const count: WritableSignal<number> = signal(0);
const doubleCount: Signal<number> = computed(() => count() * 2);
```

`doubleCount` 信号依赖于 `count` 信号。每当 `count` 更新时，Angular 就知道 `doubleCount` 也需要更新。

#### 计算信号既是惰性求值的，也是带记忆的 {#computed-signals-are-both-lazily-evaluated-and-memoized}

在你第一次读取 `doubleCount` 之前，它的派生函数不会运行来计算值。计算出的值随后会被缓存；如果你再次读取 `doubleCount`，它会直接返回缓存的值，而不会重新计算。

如果之后你修改了 `count`，Angular 就知道 `doubleCount` 缓存的值已经失效，下次读取 `doubleCount` 时会计算它的新值。

因此，你可以放心地在计算信号中执行计算开销较大的派生，例如过滤数组。

#### 计算信号不是可写信号 {#computed-signals-are-not-writable-signals}

你不能直接给计算信号赋值。也就是说，

```ts
doubleCount.set(3);
```

会产生编译错误，因为 `doubleCount` 不是 `WritableSignal`。

#### 计算信号的依赖是动态的 {#computed-signal-dependencies-are-dynamic}

只有在派生过程中实际读取到的信号才会被追踪。例如，在下面这个 `computed` 中，只有当 `showCount` 信号为 true 时才会读取 `count` 信号：

```ts
const showCount = signal(false);
const count = signal(0);
const conditionalCount = computed(() => {
  if (showCount()) {
    return `The count is ${count()}.`;
  } else {
    return 'Nothing to see here!';
  }
});
```

读取 `conditionalCount` 时，如果 `showCount` 为 `false`，就会返回 "Nothing to see here!" 消息，而*不会*读取 `count` 信号。这意味着之后即使更新了 `count`，也*不会*导致 `conditionalCount` 重新计算。

如果你把 `showCount` 设为 `true`，然后再次读取 `conditionalCount`，派生逻辑会重新执行，并走 `showCount` 为 `true` 的分支，返回显示 `count` 值的消息。此后修改 `count` 就会使 `conditionalCount` 的缓存值失效。

注意，在派生过程中，依赖既可能被添加，也可能被移除。如果之后你又把 `showCount` 设回 `false`，`count` 就不再被视为 `conditionalCount` 的依赖了。

## 响应式上下文 {#reactive-contexts}

**响应式上下文**（reactive context）是一种运行时状态，在这种状态下 Angular 会监视信号的读取来建立依赖关系。读取信号的代码是*消费者*，被读取的信号是*生产者*。

在以下情况下，Angular 会自动进入响应式上下文：

- 执行 `effect`、`afterRenderEffect` 回调时。
- 对 `computed` 信号求值时。
- 对 `linkedSignal` 求值时。
- 对 `resource` 的 params 函数求值时。
- 渲染组件（Component）模板（Template）时（包括[宿主属性](/guide/components/host-elements#binding-to-the-host-element)中的绑定）。

在这些操作期间，Angular 会创建一个*活跃*连接。如果某个被追踪的信号发生变化，Angular *最终*会重新运行该消费者。

### 断言响应式上下文 {#asserts-the-reactive-context}

Angular 提供了 `assertNotInReactiveContext` 辅助函数，用来断言代码没有在响应式上下文中执行。请传入调用方函数的引用，这样断言失败时，错误消息会指向正确的 API 入口点。这比通用的响应式上下文错误更清晰，也更便于采取行动。

```ts
import {assertNotInReactiveContext} from '@angular/core';

function subscribeToEvents() {
  assertNotInReactiveContext(subscribeToEvents);
  // 可以安全地继续——这里是订阅逻辑
}
```

### 读取但不追踪依赖 {#reading-without-tracking-dependencies}

在少数情况下，你可能希望在 `computed` 或 `effect` 这样的响应式函数中执行可能读取信号的代码，但*不*创建依赖。

例如，假设当 `currentUser` 变化时，需要记录 `counter` 的值。你可以创建一个同时读取这两个信号的 `effect`：

```ts
effect(() => {
  console.log(`User set to ${currentUser()} and the counter is ${counter()}`);
});
```

这个例子在 `currentUser` *或* `counter` 任意一个变化时都会记录一条消息。但是，如果副作用只应该在 `currentUser` 变化时运行，那么对 `counter` 的读取只是顺带的，`counter` 的变化不应该记录新消息。

你可以用 `untracked` 调用信号的 getter，以免这次读取被追踪：

```ts
effect(() => {
  console.log(`User set to ${currentUser()} and the counter is ${untracked(counter)}`);
});
```

当副作用需要调用一些不应被视为依赖的外部代码时，`untracked` 也很有用：

```ts
effect(() => {
  const user = currentUser();
  untracked(() => {
    // 如果 `loggingService` 读取了信号，这些信号不会被算作
    // 此副作用的依赖。
    this.loggingService.log(`User set to ${user}`);
  });
});
```

### 响应式上下文与异步操作 {#reactive-context-and-async-operations}

响应式上下文只对同步代码有效。在异步边界之后发生的信号读取都不会被追踪为依赖。

```ts
effect(async () => {
  const data = await fetchUserData();
  // 响应式上下文在这里已经丢失——theme() 不会被追踪
  console.log(`User: ${data.name}, Theme: ${theme()}`);
});
```

为了确保所有信号读取都能被追踪，请在 `await` 之前读取信号。这也包括把信号作为参数传给被 await 的函数，因为参数是同步求值的：

```ts
effect(async () => {
  const currentTheme = theme(); // 在 await 之前读取
  const data = await fetchUserData();
  console.log(`User: ${data.name}, Theme: ${currentTheme}`);
});
```

```ts
effect(async () => {
  // 这样也可以：信号在 await 之前（作为函数参数）被读取
  await renderContent(docContent());
});
```

## 高级派生 {#advanced-derivations}

`computed` 适合处理简单的只读派生，但有时你可能需要一个依赖于其他信号的可写状态。
更多信息请参阅[使用 linkedSignal 管理依赖状态](/guide/signals/linked-signal)指南。

所有信号 API 都是同步的——`signal`、`computed`、`input` 等等。然而，应用常常需要处理异步获得的数据。资源（Resource）为你提供了一种方式，把异步数据整合进应用中基于信号的代码，同时仍然可以同步访问其数据。更多信息请参阅[使用资源实现异步响应](/guide/signals/resource)指南。

## 在非响应式 API 上执行副作用 {#executing-side-effects-on-non-reactive-apis}

当我们想对状态变化作出响应时，推荐使用同步或异步派生。不过，这并不能涵盖所有可能的用例，有时你会遇到需要在非响应式 API 上响应信号变化的情况。这些特定的用例请使用 `effect` 或 `afterRenderEffect`。更多信息请参阅[非响应式 API 的副作用](/guide/signals/effect)指南。

## 在 `OnPush` 组件中读取信号 {#reading-signals-in-onpush-components}

当你在 `OnPush` 组件的模板中读取信号时，Angular 会把该信号追踪为这个组件的依赖。当信号的值发生变化时，Angular 会自动[标记](https://angular.dev/api/core/ChangeDetectorRef#markForCheck)该组件，确保它在下次运行变更检测（Change Detection）时得到更新。关于 `OnPush` 组件的更多信息，请参阅[跳过组件子树](/best-practices/skipping-subtrees)指南。

## 高级主题 {#advanced-topics}

### 信号相等性函数 {#signal-equality-functions}

创建信号时，可以选择提供一个相等性函数，用来检查新值是否真的与之前的值不同。

```ts
import {signal} from '@angular/core';
import isEqual from 'lodash/isEqual';

const data = signal(['test'], {equal: isEqual});

// 尽管这是一个不同的数组实例，深度相等性函数
// 也会认为两个值相等，因此该信号
// 不会触发任何更新。
data.set(['test']);
```

可写信号和计算信号都可以提供相等性函数。

::: tip 提示
默认情况下，信号使用引用相等性（[`Object.is()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 比较）。

:::

### 对信号进行类型检查 {#type-checking-signals}

可以使用 `isSignal` 检查某个值是否为 `Signal`：

```ts
const count = signal(0);
const doubled = computed(() => count() * 2);

isSignal(count); // true
isSignal(doubled); // true
isSignal(42); // false
```

如果要专门检查某个信号是否可写，请使用 `isWritableSignal`：

```ts
const count = signal(0);
const doubled = computed(() => count() * 2);

isWritableSignal(count); // true
isWritableSignal(doubled); // false
```

## 在 RxJS 中使用信号 {#using-signals-with-rxjs}

关于信号与 RxJS 之间互操作的详细信息，请参阅 [Angular 信号的 RxJS 互操作](/ecosystem/rxjs-interop)。

## 调试信号 {#debugging-signals}

Angular DevTools 可以可视化组件或指令（Directive）的信号图，展示其中的信号、计算信号、副作用（Effect）以及其他响应式节点之间的依赖关系。
参阅[调试信号图](/tools/devtools/signals)，了解如何打开、阅读和检查这张图。
