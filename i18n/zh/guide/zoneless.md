# 不使用 ZoneJS 的 Angular（Zoneless）

## 为什么要使用无 Zone？

移除 ZoneJS 依赖的主要优势有：

- **提升性能**：ZoneJS 把 DOM 事件和异步任务当作应用状态*可能*已经更新的信号，随后触发应用同步，对应用的各个视图运行变更检测（Change Detection）。ZoneJS 并不知道应用状态是否真的发生了变化，因此这种同步的触发频率会高于实际需要。
- **改善 Core Web Vitals**：ZoneJS 会带来相当可观的开销，无论是载荷大小还是启动时间。
- **改善调试体验**：ZoneJS 会让代码调试变得更加困难。有 ZoneJS 时，堆栈跟踪更难理解。当代码因为运行在 Angular Zone 之外而出错时，也很难弄清楚原因。
- **更好的生态兼容性**：ZoneJS 通过给浏览器 API 打补丁来工作，但并不会自动为每一个新的浏览器 API 提供补丁。有些 API（例如 `async`/`await`）无法有效地打补丁，必须降级编译才能与 ZoneJS 配合使用。有时生态中的库也与 ZoneJS 给原生 API 打补丁的方式不兼容。移除 ZoneJS 依赖可以去掉一个复杂性、猴子补丁（monkey patching）和持续维护的来源，从而确保更好的长期兼容性。

## 在应用中启用无 Zone

在 Angular v21+ 中，无 Zone（zoneless）是默认设置，因此你无需做任何事情就能启用它。你应该确认没有在任何地方使用 `provideZoneChangeDetection` 来覆盖默认配置。

如果你使用的是 Angular v20，请在启动时添加 `provideZonelessChangeDetection()` 来启用无 Zone 变更检测：

```ts [standalone bootstrap]
bootstrapApplication(MyApp, {providers: [provideZonelessChangeDetection()]});
```

```ts [NgModule bootstrap]
platformBrowser().bootstrapModule(AppModule);

@NgModule({
  providers: [provideZonelessChangeDetection()],
})
export class AppModule {}
```

## 移除 ZoneJS

无 Zone 应用应该从构建中彻底移除 ZoneJS，以减小包（bundle）的体积。ZoneJS 通常
是通过 `angular.json` 中 `build` 和 `test` 目标的 `polyfills` 选项加载的。从这两处移除 `zone.js`
和 `zone.js/testing`，就能把它从构建中移除。使用显式 `polyfills.ts` 文件的项目
应该从该文件中删除 `import 'zone.js';` 和 `import 'zone.js/testing';`。

从构建中移除 ZoneJS 之后，也就不再需要 `zone.js` 依赖了，
可以把这个包彻底删除：

```shell
npm uninstall zone.js
```

## 无 Zone 兼容性的要求

Angular 依靠来自核心 API 的通知来决定何时运行变更检测，以及在哪些视图上运行。
这些通知包括：

- `ChangeDetectorRef.markForCheck`（由 `AsyncPipe` 自动调用）
- `ComponentRef.setInput`
- 更新在模板中读取的信号（Signal）
- 绑定的宿主或模板监听器回调
- 附加一个已被上述任一方式标记为脏的视图

### 兼容 `OnPush` 的组件

确保组件使用上述正确通知机制的一种方法，是
使用 [ChangeDetectionStrategy.OnPush](/best-practices/skipping-subtrees#using-onpush)。

`OnPush` 变更检测策略并不是必需的，但对于应用组件（Component）来说，它是迈向无 Zone 兼容的推荐步骤。库组件并不总是能够使用 `ChangeDetectionStrategy.OnPush`。
当库组件是用户组件的宿主，而这些用户组件可能使用 `ChangeDetectionStrategy.Eager` 时，库组件就不能使用 `OnPush`，因为如果子组件不兼容 `OnPush` 并依赖 ZoneJS 来触发变更检测，`OnPush` 会导致子组件无法刷新。只要组件在需要运行变更检测时通知 Angular（调用 `markForCheck`、使用信号、`AsyncPipe` 等），就可以使用 `Eager` 策略。
作为用户组件的宿主，是指使用 `ViewContainerRef.createComponent` 之类的 API，而不仅仅是承载用户组件模板的一部分（即内容投影或使用模板引用输入）。

### 移除 `NgZone.onMicrotaskEmpty`、`NgZone.onUnstable`、`NgZone.isStable` 或 `NgZone.onStable`

应用和库需要移除对 `NgZone.onMicrotaskEmpty`、`NgZone.onUnstable` 和 `NgZone.onStable` 的使用。
当应用启用无 Zone 变更检测后，这些 Observable 永远不会发出值。
同样，`NgZone.isStable` 将始终为 `true`，不应把它用作代码执行的条件。

`NgZone.onMicrotaskEmpty` 和 `NgZone.onStable` 这两个 Observable 最常用于在执行某个任务之前等待 Angular
完成变更检测。作为替代，如果只需要等待一次变更检测，可以改用 `afterNextRender`；
如果存在可能跨越多轮变更检测的条件，则可以改用 `afterEveryRender`。在其他情况下，使用这些 Observable 只是因为碰巧
比较熟悉，并且时机与需要的差不多。这时可以改用更简单或更直接的 DOM API，
例如当代码需要等待某种 DOM 状态时使用 `MutationObserver`（而不是通过 Angular 的渲染钩子
间接地等待）。

::: tip NgZone.run 和 NgZone.runOutsideAngular 与无 Zone 兼容
为了让代码与无 Zone 应用兼容，并不需要移除 `NgZone.run` 和 `NgZone.runOutsideAngular`。
实际上，对于仍在依赖 ZoneJS 的应用中所使用的库来说，移除这些调用
可能会导致性能退化。
:::

### 用于服务端渲染（SSR）的 `PendingTasks`

如果你在 Angular 中使用 SSR，你可能知道它依赖 ZoneJS 来帮助判断应用何时
处于「稳定」状态并可以被序列化。如果存在应当阻止序列化的异步任务，那么不使用 ZoneJS 的应用
必须通过 [PendingTasks](https://angular.dev/api/core/PendingTasks) 服务（Service）让 Angular 知道这些任务。序列化
会等到所有待处理任务都被移除的那一刻才进行。

待处理任务最直接的两种用法之一是 `run` 方法：

```ts
const taskService = inject(PendingTasks);
taskService.run(async () => {
  const someResult = await doSomeWorkThatNeedsToBeRendered();
  this.someState.set(someResult);
});
```

对于更复杂的用例，你可以手动添加和移除待处理任务：

```ts
const taskService = inject(PendingTasks);
const taskCleanup = taskService.add();
try {
  await doSomeWorkThatNeedsToBeRendered();
} catch {
  // 处理错误
} finally {
  taskCleanup();
}
```

此外，`rxjs-interop` 中的 [pendingUntilEvent](https://angular.dev/api/core/rxjs-interop/pendingUntilEvent) 辅助函数可以确保
在 Observable 发出值、完成、出错或被取消订阅之前，应用一直保持不稳定状态。

```ts
readonly myObservableState = someObservable.pipe(pendingUntilEvent());
```

框架内部也使用这个服务，在异步任务完成之前阻止序列化。这些任务包括但不限于正在进行的路由器（Router）导航和尚未完成的 `HttpClient` 请求。

### 无 Zone 应用中的响应式表单

响应式表单（Reactive Forms）的模型更新（`setValue`、`patchValue`、`FormArray.push` 以及类似 API）会更新表单状态并让表单的 Observable 发出值，但不会自动为组件调度变更检测。

如果模板依赖响应式表单的状态，请把表单的 Observable 与某种变更检测通知（例如 `ChangeDetectorRef.markForCheck()`）关联起来，或者通过模板所使用的信号来反映这些数据。

## 测试与调试

### 在 `TestBed` 中使用无 Zone

`TestBed` 默认使用无 Zone 变更检测，即使通过 `polyfills` 加载了 `zone.js` 也是如此。

要在测试中使用基于 Zone 的变更检测，请把 `provideZoneChangeDetection()` 添加到 `TestBed` 的提供者（Provider）中。添加 `provideZonelessChangeDetection()` 是可选的：

```ts
TestBed.configureTestingModule({
  // 可选：包含这个提供者，强制测试环境
  // 使用与无 Zone 应用相同的无 Zone 行为。
  providers: [provideZonelessChangeDetection()],
});

const fixture = TestBed.createComponent(MyComponent);
await fixture.whenStable();
```

为了让测试的行为尽可能接近生产代码，
应尽量避免使用 `fixture.detectChanges()`。它会在 Angular
原本可能不会调度变更检测的时候强制运行变更检测。测试应当确保这些通知
确实会发生，并让 Angular 自己决定何时同步
状态，而不是在测试中手动强制同步。

对于现有的测试套件，使用 `fixture.detectChanges()` 是一种常见模式，
把它们全部改成 `await fixture.whenStable()` 很可能并不值得。`TestBed` 仍然会强制要求
fixture 的组件兼容 `OnPush`，如果发现模板中的值在没有
变更通知的情况下被更新（例如 `fixture.componentInstance.someValue = 'newValue';`），就会抛出 `ExpressionChangedAfterItHasBeenCheckedError`。
如果该组件用于生产环境，应该通过更新组件来解决这个问题：
使用信号来保存状态，或者调用 `ChangeDetectorRef.markForCheck()`。
如果该组件只用作测试包装器，从不在应用中使用，
那么可以为它使用 `ChangeDetectionStrategy.Eager`，并调用 `fixture.changeDetectorRef.markForCheck()`。

::: warning 重要
`fixture.changeDetectorRef` 属于 fixture 的宿主视图，因此它的 `markForCheck()`
不会刷新 `OnPush` 组件的模板。你的应用组件在测试中不应需要它。
如果某个测试需要它，通常说明该组件不是完全响应式的，或者不是
[无 Zone 兼容的](#requirements-for-zoneless-compatibility)。

:::

### 用于确保检测到更新的调试模式检查

::: warning 重要
`provideCheckNoChangesConfig` 目前处于[开发者预览](/reference/releases#developer-preview)阶段。

:::

Angular 还提供了一个额外的工具，帮助验证应用是否以兼容无 Zone 的方式
更新状态。`provideCheckNoChangesConfig({exhaustive: true, interval: <milliseconds>})`
可用于定期检查，确保没有任何绑定在没有通知的情况下
被更新。如果存在某个无 Zone 变更检测
不会刷新的已更新绑定，Angular 会抛出 `ExpressionChangedAfterItHasBeenCheckedError`。
