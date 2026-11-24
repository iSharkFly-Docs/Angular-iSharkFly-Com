# 使用 `takeUntilDestroyed` 取消订阅

::: tip 提示
本指南假定你已经熟悉 [组件和指令的生命周期](/guide/components/lifecycle)。

:::

来自 `@angular/core/rxjs-interop` 的 `takeUntilDestroyed` 操作符提供了一种简洁可靠的方式，在组件或指令被销毁时自动取消对可观察对象（Observable）的订阅。这可以防止 RxJS 订阅中常见的内存泄漏。它的工作方式与 RxJS 的 [`takeUntil`](https://rxjs.dev/api/operators/takeUntil) 操作符类似，但不需要单独的 Subject。

```ts
import {Component, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable} from 'rxjs';
import {NotificationDispatcher, CustomPopupShower} from './some-shared-project-code';

@Component(/* ... */)
export class UserProfile {
  private dispatcher = inject(NotificationDispatcher);
  private popup = inject(CustomPopupShower);

  constructor() {
    // 当 'UserProfile' 组件被销毁时，对 'notifications' 可观察对象的
    // 这个订阅会被自动取消。
    const messages: Observable<string> = this.dispatcher.notifications;
    messages.pipe(takeUntilDestroyed()).subscribe((message) => {
      this.popup.show(message);
    });
  }
}
```

`takeUntilDestroyed` 操作符接受一个可选的 [`DestroyRef`](https://angular.dev/api/core/DestroyRef) 参数。该操作符通过 `DestroyRef` 得知组件或指令何时被销毁。在 [注入上下文](/guide/di/dependency-injection-context)（通常是组件或指令的构造函数）中调用 `takeUntilDestroyed` 时，可以省略这个参数。如果你的代码可能会在注入上下文之外调用 `takeUntilDestroyed`，请始终提供一个 `DestroyRef`。

```ts
@Component(/* ... */)
export class UserProfile {
  private dispatcher = inject(NotificationDispatcher);
  private popup = inject(CustomPopupShower);
  private destroyRef = inject(DestroyRef);

  startListeningToNotifications() {
    // 如果在注入上下文之外调用 `takeUntilDestroyed`，
    // 请始终传入一个 `DestroyRef`。
    const messages: Observable<string> = this.dispatcher.notifications;
    messages.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((message) => {
      this.popup.show(message);
    });
  }
}
```
