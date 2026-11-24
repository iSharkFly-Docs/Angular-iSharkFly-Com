# RxJS 与组件和指令输出的互操作 {#rxjs-interop-with-component-and-directive-outputs}

::: tip 提示
本指南假定你已经熟悉 [组件和指令的输出](/guide/components/outputs)。

:::

`@angular/core/rxjs-interop` 包提供了两个与组件和指令输出相关的 API。

## 基于 RxJS 可观察对象创建输出 {#creating-an-output-based-on-an-rxjs-observable}

`outputFromObservable` 让你可以创建一个基于 RxJS 可观察对象（Observable）发出值的组件或指令输出：

```ts
import {Directive} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';
import {Observable} from 'rxjs';

@Directive(/* ... */)
class Draggable {
  pointerMoves$: Observable<PointerMovements> = listenToPointerMoves();

  // 每当 `pointerMoves$` 发出值时，就会触发 `pointerMove` 事件。
  pointerMove = outputFromObservable(this.pointerMoves$);
}
```

`outputFromObservable` 函数对 Angular 编译器有特殊意义。**你只能在组件和指令的属性初始化器中调用 `outputFromObservable`。**

当你 `subscribe` 这个输出时，Angular 会自动将订阅转发给底层的可观察对象。当组件或指令被销毁时，Angular 会停止转发值。

::: tip 提示
如果你可以命令式地发出值，请考虑直接使用 `output()`。

:::

## 从组件或指令输出创建 RxJS 可观察对象 {#creating-an-rxjs-observable-from-a-component-or-directive-output}

`outputToObservable` 函数让你可以从组件输出创建一个 RxJS 可观察对象。

```ts
import {outputToObservable} from '@angular/core/rxjs-interop';
import {Component, output} from '@angular/core';

@Component(/*...*/)
class CustomSlider {
    valueChange = output<number>();
}

// `CustomSlider` 的实例引用。
const slider: CustomSlider = createSlider();

outputToObservable(slider.valueChange) // Observable<number>
    .pipe(...)
    .subscribe(...);
```

::: tip 提示
如果能满足你的需求，请考虑直接使用 `OutputRef` 上的 `subscribe` 方法。

:::
