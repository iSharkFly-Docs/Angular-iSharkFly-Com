# Angular 中未处理的错误 {#unhandled-errors-in-angular}

Angular 应用运行时，你的某些代码可能会抛出错误。如果不加处理，这些错误可能导致意外行为和界面失去响应。本指南介绍 Angular 如何处理那些没有被应用代码显式捕获的错误。关于如何在应用中编写自己的错误处理逻辑，请参考 JavaScript 和 Angular 中错误处理的最佳实践。

Angular 错误处理策略的一条基本原则是：只要有可能，就应该在调用处把错误暴露给开发者。这样可以确保发起某项操作的代码拥有必要的上下文，去理解错误、恰当地处理错误，并决定应用应该处于什么状态。让错误在源头可见，开发者就能针对失败的操作实现专门的错误处理，并能获取相关信息，用于恢复或向最终用户提供有用的反馈。这也有助于避免「错误过于笼统」这种坏味道，也就是报告错误时缺少足够的上下文，导致无法理解错误的原因。

例如，假设有一个从 API 获取用户数据的组件。负责发起 API 调用的代码应该包含错误处理（例如使用 `try...catch` 块或 RxJS 中的 `catchError` 操作符），以应对可能出现的网络问题或 API 返回的错误。这样组件就可以显示一条友好的错误消息或重试请求，而不是让错误在无人处理的情况下继续传播。

## 未处理的错误会报告给 `ErrorHandler` {#unhandled-errors-are-reported-to-the-errorhandler}

Angular 会把未处理的错误报告给应用的根 `ErrorHandler`。如果要提供自定义的 `ErrorHandler`，请在调用 `bootstrapApplication` 时，在 `ApplicationConfig` 中提供它。

构建 Angular 应用时，你经常会编写一些由框架自动调用的代码。例如，当某个组件出现在模板中时，由 Angular 负责调用该组件的构造函数和生命周期方法。当框架运行你的代码时，你没有合适的地方添加 `try` 块来优雅地处理错误。在这种情况下，Angular 会捕获错误并把它们发送给 `ErrorHandler`。

对于由你的代码直接调用的 API，Angular *不会*捕获其中的错误。例如，如果某个服务中有一个会抛出错误的方法，而你在组件中调用了这个方法，Angular 不会自动捕获这个错误。你需要自己使用 `try...catch` 之类的机制来处理它。

只有在以下情况下，Angular 才会捕获来自用户 Promise 或 Observable 的*异步*错误：

- 存在明确的约定，要求 Angular 等待并使用该异步操作的结果；并且
- 错误没有体现在返回值或状态中。

例如，`AsyncPipe` 和 `PendingTasks.run` 会把错误转发给 `ErrorHandler`，而 `resource` 则通过 `status` 和 `error` 属性来体现错误。

Angular 报告给 `ErrorHandler` 的错误是*意外的*错误。这些错误可能无法恢复，或者表明应用的状态已经损坏。应用应该尽可能在错误发生的地方，使用 `try` 块或合适的错误处理操作符（例如 RxJS 中的 `catchError`）进行错误处理，而不是依赖 `ErrorHandler`。`ErrorHandler` 最常见、也最合适的用法，只是作为一种机制，把可能致命的错误报告给错误跟踪和日志基础设施。

```ts
export class GlobalErrorHandler implements ErrorHandler {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly router = inject(Router);

  handleError(error: any) {
    const url = this.router.url;
    const errorMessage = error?.message ?? 'unknown';

    this.analyticsService.trackEvent({
      eventName: 'exception',
      description: `Screen: ${url} | ${errorMessage}`,
    });

    console.error(GlobalErrorHandler.name, {error});
  }
}
```

### `TestBed` 默认会重新抛出错误 {#testbed-rethrows-errors-by-default}

很多情况下，`ErrorHandler` 可能只是记录错误，然后让应用继续运行。但在测试中，你几乎总是希望把这些错误暴露出来。Angular 的 `TestBed` 会重新抛出意外的错误，以确保被框架捕获的错误不会被无意中遗漏或忽略。在极少数情况下，测试可能专门要验证错误不会导致应用失去响应或崩溃。这时，你可以通过 `TestBed.configureTestingModule({rethrowApplicationErrors: false})` [配置 `TestBed` *不*重新抛出应用错误](https://angular.dev/api/core/testing/TestModuleMetadata#rethrowApplicationErrors)。

### 应用仍在启动时抛出的错误 {#errors-thrown-while-your-app-is-still-starting-up}

有一小段时间，Angular 还无法把错误发送给你的 `ErrorHandler`：也就是它仍在创建应用的根模块或根组件的时候。Angular 需要先有这个根实例，才能查找你提供的 `ErrorHandler`，因此在这之前抛出的错误无处可去。它会表现为一个普通的未捕获错误，而不会通过 `ErrorHandler` 报告。

你最有可能在使用 [Angular 元素](/guide/elements)时遇到这种情况。如果你定义某个自定义元素时，它的标签已经出现在页面上，浏览器会立即升级它，在这段早期启动工作中运行组件的构造函数和 `ngOnInit`。在那里抛出的任何错误都可能丢失。

如果你遇到这种情况，请调整抛出错误的代码，让它在应用启动完成之后再运行，例如：

- 用 `setTimeout(() => /* your code */)` 包裹它，让它在单独的轮次中运行，而不是在启动期间运行。
- 把它作为 `APP_BOOTSTRAP_LISTENER` 提供，而不是在构造函数中运行。
- 在 `ngDoBootstrap` 中定义自定义元素，而不是在根模块的构造函数中定义。

开启 `provideBrowserGlobalErrorListeners()`（见下文）也有助于捕获这些错误，因为它们仍然会作为未捕获错误到达浏览器。

## 全局错误监听器 {#global-error-listeners}

既没有被应用代码捕获、也没有被框架的应用实例捕获的错误，可能会到达全局作用域。如果不加以考虑，到达全局作用域的错误可能会带来意想不到的后果。在非浏览器环境中，它们可能导致进程崩溃。在浏览器中，这些错误可能不会被上报，网站访问者可能会在浏览器控制台中看到它们。Angular 为这两种环境都提供了全局监听器来应对这些问题。

### 客户端渲染 {#client-side-rendering}

把 [`provideBrowserGlobalErrorListeners()`](https://angular.dev/api/core/provideBrowserGlobalErrorListeners) 添加到 [ApplicationConfig](/guide/di/defining-dependency-providers#application-bootstrap) 中，会在浏览器的 window 上添加 `'error'` 和 `'unhandledrejection'` 监听器，并把这些错误转发给 `ErrorHandler`。Angular CLI 生成的新应用默认就包含这个提供者（Provider）。Angular 团队建议大多数应用都处理这些全局错误，可以使用框架内置的监听器，也可以使用你自己的自定义监听器。如果你提供了自定义监听器，就可以移除 `provideBrowserGlobalErrorListeners`。

### 服务端渲染和混合渲染 {#server-side-and-hybrid-rendering}

在[使用 SSR 的 Angular](/guide/ssr) 中，Angular 会自动给服务器进程添加 `'unhandledRejection'` 和 `'uncaughtException'` 监听器。这些处理器可以防止服务器崩溃，转而把捕获到的错误记录到控制台。

::: warning 重要
如果应用使用了 Zone.js，则只会添加 `'unhandledRejection'` 处理器。存在 Zone.js 时，应用 Zone 内的错误已经被转发给应用的 `ErrorHandler`，不会到达服务器进程。

:::
