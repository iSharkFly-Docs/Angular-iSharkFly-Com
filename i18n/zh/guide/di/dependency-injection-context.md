# 注入上下文

依赖注入（Dependency Injection，DI）系统依赖于一个运行时上下文，在这个上下文中可以拿到当前的注入器（Injector）。

这意味着只有当代码在这个上下文中执行时，注入器才能工作。

在以下情况下，你可以使用注入上下文（injection context）：

- 在由 DI 系统实例化的类（例如 `@Injectable` 或 `@Component`）的构造期间（通过 `constructor`）。
- 在这些类的字段初始化器中。
- 在为 `Provider` 或 `@Injectable` 的 `useFactory` 指定的工厂函数中。
- 在为 `InjectionToken` 指定的 `factory` 函数中。
- 在运行于注入上下文中的栈帧内。

知道自己何时处于注入上下文中，你就可以使用 [`inject`](https://angular.dev/api/core/inject) 函数来获取依赖。

::: info 注意
关于在类构造函数和字段初始化器中使用 `inject()` 的基础示例，请参阅[概览指南](/guide/di#where-can-inject-be-used)。

:::

## 上下文中的栈帧

有些 API 被设计为在注入上下文中运行，例如路由守卫。这让你可以在守卫函数中使用 [`inject`](https://angular.dev/api/core/inject) 来访问服务（Service）。

下面是 `CanActivateFn` 的一个例子

```ts
const canActivateTeam: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(PermissionsService).canActivate(inject(UserToken), route.params.id);
};
```

## 在注入上下文中运行

如果你需要在注入上下文中运行某个函数，但当前并不处于注入上下文中，可以使用 `runInInjectionContext`。
这需要能访问某个注入器，例如 `EnvironmentInjector`：

```ts [hero.service.ts]
@Service()
export class HeroService {
  private environmentInjector = inject(EnvironmentInjector);

  someMethod() {
    runInInjectionContext(this.environmentInjector, () => {
      inject(SomeService); // 用注入的服务做你需要的事
    });
  }
}
```

注意，只有当注入器能够解析所请求的令牌时，[`inject`](https://angular.dev/api/core/inject) 才会返回实例。

## 断言上下文

Angular 提供了 `assertInInjectionContext` 辅助函数，用于验证当前上下文是否为注入上下文，如果不是，就抛出一个清晰的错误。传入调用方函数的引用，这样错误消息就会指向正确的 API 入口点。与默认的通用注入错误相比，这样产生的消息更清晰，也更便于采取行动。

```ts
import {ElementRef, assertInInjectionContext, inject} from '@angular/core';

export function injectNativeElement<T extends Element>(): T {
  assertInInjectionContext(injectNativeElement);
  return inject(ElementRef).nativeElement;
}
```

之后你就可以 **在注入上下文中**（构造函数、字段初始化器、提供者工厂，或通过 `runInInjectionContext` 执行的代码）调用这个辅助函数：

```ts
import {Component, inject} from '@angular/core';
import {injectNativeElement} from './dom-helpers';

@Component({/* … */})
export class PreviewCard {
  readonly hostEl = injectNativeElement<HTMLElement>(); // 字段初始化器在注入上下文中运行。

  onAction() {
    const anotherRef = injectNativeElement<HTMLElement>(); // 失败：在注入上下文之外运行。
  }
}
```

## 在上下文之外使用 DI

如果你在注入上下文之外调用 [`inject`](https://angular.dev/api/core/inject) 或 `assertInInjectionContext`，Angular 会抛出 [NG0203 错误](/errors/NG0203)。
