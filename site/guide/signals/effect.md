# 副作用 {#effects}

信号（Signal）之所以有用，是因为它们会在变化时通知关心它们的消费者。**副作用（effect）**是一种每当一个或多个信号值发生变化时就会运行的操作。你可以使用 `effect` 函数创建副作用：

```ts
import {effect} from '@angular/core';

effect(() => {
  console.log(`The current count is: ${count()}`);
});
```

副作用**至少会运行一次**。副作用运行时，会追踪其中读取的所有信号值。只要这些信号值中有任何一个发生变化，副作用就会再次运行。与计算信号（Computed）类似，副作用会动态追踪它们的依赖，并且只追踪最近一次执行中读取的信号。

副作用总是在变更检测（Change Detection）过程中**异步**执行。

## 副作用的用例 {#use-cases-for-effects}

副作用应该是你最后才考虑的 API。对于派生值，始终优先使用 `computed()`；对于既可以派生又可以手动设置的值，优先使用 `linkedSignal()`。如果你发现自己在用副作用把数据从一个信号复制到另一个信号，这就说明你应该把数据源（source of truth）往上提，改用 `computed()` 或 `linkedSignal()`。副作用最适合把信号状态同步到命令式的、非信号的 API。

::: tip 提示
没有哪种场景下副作用是「好」的，只有它「合适」的场景。

:::

- 记录信号值，用于分析或作为调试工具。
- 让数据与不同种类的存储保持同步：`window.localStorage`、session storage、cookie 等。
- 添加无法用模板语法表达的自定义 DOM 行为。
- 对 `<canvas>` 元素、图表库或其他第三方 UI 库执行自定义渲染。

::: danger 何时不应使用副作用
避免用副作用来传播状态变化。这可能导致 `ExpressionChangedAfterItHasBeenChecked` 错误、无限循环更新，或不必要的变更检测周期。

请改用 `computed` 信号来为依赖于其他状态的状态建模。
:::

## 注入上下文 {#injection-context}

默认情况下，你只能在[注入上下文（Injection Context）](/guide/di/dependency-injection-context)中（也就是可以使用 `inject` 函数的地方）创建 `effect()`。满足这一要求最简单的方式，是在组件（Component）、指令（Directive）或服务（Service）的 `constructor` 中调用 `effect`：

```ts
@Component(/* ... */)
export class EffectiveCounter {
  readonly count = signal(0);

  constructor() {
    // 注册一个新的副作用。
    effect(() => {
      console.log(`The count is: ${this.count()}`);
    });
  }
}
```

要在构造函数之外创建副作用，可以通过 `effect` 的选项传入一个 `Injector`：

```ts
@Component(/* ... */)
export class EffectiveCounter {
  readonly count = signal(0);
  private injector = inject(Injector);

  initializeLogging(): void {
    effect(
      () => {
        console.log(`The count is: ${this.count()}`);
      },
      {injector: this.injector},
    );
  }
}
```

## 副作用的执行 {#execution-of-effects}

Angular 会根据副作用被创建时所处的上下文，为其隐式定义两种行为。

「视图副作用」（View Effect）是在组件实例化的上下文中创建的 `effect`。这也包括由绑定到组件注入器（Injector）的服务所创建的副作用。<br>
「根副作用」（Root Effect）是在根级提供的服务实例化的上下文中创建的。

这两种 `effect` 的执行都与变更检测过程绑定在一起。

- 「视图副作用」会在变更检测过程检查其对应的组件*之前*执行。
- 「根副作用」会在变更检测过程检查所有组件之前执行。

在这两种情况下，如果在副作用执行期间至少有一个依赖发生了变化，副作用都会先重新运行，然后才继续变更检测过程。

## 销毁副作用 {#destroying-effects}

当组件或指令被销毁时，Angular 会自动清理所有与之关联的副作用。

`effect` 可以在两种不同的上下文中创建，这会影响它何时被销毁：

- 「视图副作用」会在组件被销毁时销毁。
- 「根副作用」会在应用被销毁时销毁。

副作用会返回一个 `EffectRef`。你可以使用这个引用的 `destroy` 方法手动销毁副作用。创建副作用时，可以把它与 `manualCleanup` 选项结合使用来禁用自动清理。请注意，务必在不再需要这类副作用时真正销毁它们。

## 副作用的清理函数 {#effect-cleanup-functions}

当组件或指令被销毁时，Angular 会自动清理所有与之关联的副作用。
副作用可能会启动长时间运行的操作，如果副作用被销毁，或者在第一个操作完成前再次运行，你就应该取消这些操作。创建副作用时，你的函数可以选择接受一个 `onCleanup` 函数作为第一个参数。这个 `onCleanup` 函数允许你注册一个回调，它会在副作用下一次运行开始前，或在副作用被销毁时被调用。

```ts
effect((onCleanup) => {
  const user = currentUser();

  const timer = setTimeout(() => {
    console.log(`1 second ago, the user became ${user}`);
  }, 1000);

  onCleanup(() => {
    clearTimeout(timer);
  });
});
```

## DOM 元素上的副作用 {#side-effects-on-dom-elements}

`effect` 函数是一个通用工具，用于在信号变化时运行代码。不过，它会在 Angular 更新 DOM *之前*运行。在某些情况下，你可能需要手动检查或修改 DOM，或者集成一个需要直接访问 DOM 的第三方库。

对于这些情况，你可以使用 `afterRenderEffect`。它的作用与 `effect` 类似，但会在 Angular 完成渲染并把变更提交到 DOM 之后运行。

```ts
@Component(/* ... */)
export class MyFancyChart {
  chartData = input.required<ChartData>();
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  chart: ChartInstance;

  constructor() {
    // 只运行一次，用来创建图表实例
    afterNextRender({
      write: () => {
        this.chart = initializeChart(this.canvas().nativeElement, this.chartData());
      },
    });

    // 每当 `chartData` 变化时，在 DOM 更新之后重新运行
    afterRenderEffect(() => {
      this.chart.updateData(this.chartData());
    });
  }
}
```

在这个例子中，`afterRenderEffect` 被用来更新由第三方库创建的图表。

::: tip 提示
检查 DOM 变化时，你通常并不需要 `afterRenderEffect`。在可行的情况下，`ResizeObserver`、`MutationObserver` 和 `IntersectionObserver` 等 API 比 `effect` 或 `afterRenderEffect` 更值得优先考虑。

:::

### 渲染阶段 {#render-phases}

访问和修改 DOM 可能会影响应用的性能，例如触发过多不必要的[重排（reflow）](https://developer.mozilla.org/en-US/docs/Glossary/Reflow)。

为了优化这些操作，`afterRenderEffect` 提供了四个阶段，用来对回调进行分组，并以优化后的顺序执行它们。

这些阶段是：

| 阶段             | 说明                                                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `earlyRead`      | 在随后的写入回调之前，用这个阶段从 DOM 读取，例如执行浏览器原生不支持的自定义布局。如果读取可以等待，请优先使用 read 阶段。 |
| `write`          | 用这个阶段向 DOM 写入。在这个阶段**绝不**要从 DOM 读取。                                                                                                                     |
| `mixedReadWrite` | 用这个阶段同时读取和写入 DOM。只要能把工作拆分到其他阶段，就绝不要使用这个阶段。                                         |
| `read`           | 用这个阶段从 DOM 读取。在这个阶段**绝不**要向 DOM 写入。                                                                                                                     |

使用这些阶段有助于避免布局抖动（layout thrashing），并确保 DOM 操作以安全、高效的方式执行。

你可以向 `afterRenderEffect` 传入一个对象，为每个阶段分别提供回调，以此来指定阶段：

```ts
afterRenderEffect({
  earlyRead: (cleanupFn) => {
    /* ... */
  },
  write: (previousPhaseValue, cleanupFn) => {
    /* ... */
  },
  mixedReadWrite: (previousPhaseValue, cleanupFn) => {
    /* ... */
  },
  read: (previousPhaseValue, cleanupFn) => {
    /* ... */
  },
});
```

::: danger 严重
如果不指定阶段，`afterRenderEffect` 会在 `mixedReadWrite` 阶段运行回调。这可能会引起额外的 DOM 重排，从而降低应用性能。

:::

#### 阶段的执行 {#phase-executions}

`earlyRead` 阶段的回调只接收清理函数。之后的每个阶段都会以信号的形式接收前一个阶段回调的返回值。你可以借此在各个阶段之间协调工作。

副作用按以下阶段顺序运行：

1. `earlyRead`
2. `write`
3. `mixedReadWrite`
4. `read`

如果某个阶段修改了 `afterRenderEffect` 所追踪的信号值，受影响的阶段会再次执行。

#### 清理 {#cleanup}

每个阶段都会以参数形式提供一个清理回调函数。清理回调会在 `afterRenderEffect` 被销毁时，或在重新运行阶段副作用之前执行。

### 服务端渲染注意事项 {#server-side-rendering-caveats}

`afterRenderEffect` 与 `afterNextRender`/`afterEveryRender` 类似，只在客户端运行。

::: info 注意
不能保证组件在回调运行之前已经完成[水合（hydration）](/guide/hydration)。直接读写 DOM 和布局时必须谨慎。

:::
