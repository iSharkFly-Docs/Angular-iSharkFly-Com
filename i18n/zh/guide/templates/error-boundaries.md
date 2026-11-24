# 使用 `@boundary` 实现错误边界

::: warning 重要
`@boundary` 目前处于[开发者预览](/reference/releases#developer-preview)阶段。

:::

Angular 模板（Template）支持错误边界（error boundary），用于优雅地处理在渲染和变更检测（Change Detection）期间发生的运行时错误。

错误边界可以防止单个组件（Component）的故障导致整个应用崩溃，并提供一种向用户显示后备 UI 的方式。

## 使用 `@boundary` 和 `@error` 捕获错误

`@boundary` 块用于包裹模板中的一部分。如果此边界内的任何组件或指令（Directive）在初始化或变更检测期间抛出错误，框架会捕获该错误，并改为渲染 `@error` 块。

```html
@boundary {
  <app-risky-component />
} @error {
  <p>Something went wrong!</p>
}
```

## 访问错误对象

可以通过隐式变量 `$error` 访问捕获到的错误：

```html
@boundary {
  <app-risky-component />
} @error {
  <p>Error occurred: {{ $error.message }}</p>
}
```

## 重置边界

可以在 `@error` 块中调用隐式函数 `$reset`，尝试重新渲染 `@boundary` 的内容。调用它时，会重置边界的状态，并再次尝试渲染原来的内容。

```html
@boundary {
  <app-flaky-component />
} @error {
  <p>Loading failed.</p>
  <button (click)="$reset()">Try again</button>
}
```

## 使用 `when` 有条件地处理错误

可以使用 `when` 子句有条件地处理特定类型的错误，从而提供不同的后备 UI。Angular 会在捕获到错误时对该条件求值。

```html
@boundary {
  <app-chart-dashboard />
} @error (let err; reset = $reset; when isRenderError(err)) {
  <p>Network issue. Check your connection.</p>
  <button (click)="reset()">Retry</button>
} @error {
  <p>An unexpected error occurred: {{ $error.message }}</p>
}
```

请按照从最具体到最通用的顺序排列 `@error` 块，因为 Angular 会按顺序对 `when` 子句求值，并使用第一个结果为 true 的块。最后一个不带 `when` 子句的 `@error` 块充当兜底的后备。

## 与全局错误处理器集成

当边界捕获到错误时，Angular 仍然可以通知全局的 `ErrorHandler`。你可以在自定义的 `ErrorHandler` 中实现可选的 `onViewError` 钩子，把这些被捕获的错误记录到你的错误追踪服务（Service）中。

```ts
@Injectable()
export class MyErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // 处理未捕获的错误
  }

  onViewError(error: Error, details: ErrorDetails): void {
    // 处理被 @boundary 捕获的错误
    console.warn('Caught by boundary:', details.boundary);
    myErrorTrackingService.log(error);
  }
}
```

::: warning 重要
如果 `@error` 块本身抛出错误，该错误会传播到外层的下一个 `@boundary`，否则 Angular 会把它当作未处理的应用错误。

:::

## 内容投影

如果你的组件使用了[内容投影（Content Projection）](/guide/components/content-projection)，那么用 `@boundary` 包裹 `<ng-content>` 并不能捕获来自投影内容的错误。这些内容属于声明它们的视图，而不属于接收它们的组件的视图。

例如，一个模板如下的包装组件，无法捕获投影到其中的组件所抛出的错误：

```html
@boundary {
  <ng-content />
} @error {
  <p>Something went wrong!</p>
}
```

要捕获这些错误，请在父模板中用 `@boundary` 包裹该包装组件及其投影内容：

```html
@boundary {
  <app-wrapper>
    <app-risky-component />
  </app-wrapper>
} @error {
  <p>Something went wrong!</p>
}
```

## 动态视图与以编程方式处理错误

错误处理并不局限于模板语法。如果你在动态创建组件或嵌入式视图，可以使用 `onError` 选项来处理错误。更多信息请参阅编程式渲染指南中的[处理渲染错误](/guide/components/programmatic-rendering#handling-rendering-errors)一节。
