# Angular 中的依赖注入

依赖注入（Dependency Injection，DI）是一种设计模式：不在类的内部创建依赖，而是把依赖提供给类，借此在整个应用中组织和共享代码。


::: tip 提示
在深入阅读这份全面的指南之前，建议先看看 Angular 的[基础知识](/essentials/dependency-injection)。

:::

随着应用规模的增长，开发者经常需要在代码库的不同部分之间复用和共享功能。[依赖注入（DI）](https://en.wikipedia.org/wiki/Dependency_injection)允许你把依赖提供给类，而不是在类内部直接创建它们，从而帮你做到这一点。这让应用的各个部分更易于复用，也更易于管理。

依赖注入之所以流行，是因为它能帮助开发者应对以下常见挑战：

- **提高代码可维护性**：依赖注入促进了清晰的关注点分离，让代码更容易重构，也减少了重复。
- **可扩展性**：你可以在应用的不同部分复用模块化的功能，让应用更容易扩展。
- **更好的测试**：DI 让单元测试可以在需要时用[测试替身](https://en.wikipedia.org/wiki/Test_double)代替真实实现。

## Angular 中的依赖注入是如何工作的？

依赖是指类在工作时需要、但不由自己创建的任何对象、值、函数或服务（Service）。依赖由外部提供，从而在应用的不同部分之间建立起清晰的关系。

你主要通过两种方式与依赖注入系统交互：

- 你可以 _提供_ 值，也就是让这些值变得可用。
- 你可以 _注入_ 这些值，也就是把它们作为依赖来请求。

这里的“值”可以是任何 JavaScript 值，包括对象、函数或类实例。常见的被注入依赖类型包括：

- **配置值**：与环境相关的常量、API URL、特性开关等。
- **工厂**：根据运行时条件创建对象或值的函数
- **服务**：提供通用功能、业务逻辑或状态的类

Angular 组件（Component）和指令（Directive）会自动参与 DI，也就是说，你既可以把依赖注入到它们中，也可以让它们作为可注入的依赖。

## 什么是服务？

Angular _服务_ 是一个带有 `@Service` 装饰器的 TypeScript 类，你可以把这个类的实例作为依赖注入。服务是在应用中共享数据和功能最常用的方式。

常见的服务类型包括：

- **数据客户端：** 封装向服务器发起请求以获取和修改数据的细节
- **状态管理：** 定义在多个组件或页面之间共享的状态
- **认证与授权：** 管理用户认证、令牌存储和访问控制
- **日志与错误处理：** 建立统一的 API，用于记录日志或向用户传达错误状态
- **事件处理与分发：** 处理与特定组件无关的事件或通知，或者按照[观察者模式](https://en.wikipedia.org/wiki/Observer_pattern)向组件分发事件和通知
- **工具函数：** 提供可复用的工具函数，例如数据格式化、验证或计算

下面的例子声明了一个名为 `AnalyticsLogger` 的服务：

```ts
import {Service} from '@angular/core';

@Service()
export class AnalyticsLogger {
  trackEvent(category: string, value: string) {
    console.log('Analytics event logged:', {
      category,
      value,
      timestamp: new Date().toISOString(),
    });
  }
}
```

::: info 注意
`@Service` 会让这个服务以单例形式在整个应用中可用。这是大多数服务的推荐做法。

:::

::: tip 提示
[`@Service`](/guide/di/creating-and-using-services#using-the-service-vs-injectable-decorator) 装饰器是 `@Injectable({providedIn: 'root'})` 的一种更顺手的简写形式。

:::

## 使用 `inject()` 注入依赖

你可以使用 Angular 的 `inject()` 函数来注入依赖。

下面是一个导航栏的例子，它注入了 `AnalyticsLogger` 和 Angular 的 `Router` 服务，让用户可以导航到其他页面，同时记录该事件。

```ts
import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {AnalyticsLogger} from './analytics-logger';

@Component({
  selector: 'app-navbar',
  template: `<a href="#" (click)="navigateToDetail($event)">Detail Page</a>`,
})
export class Navbar {
  private router = inject(Router);
  private analytics = inject(AnalyticsLogger);

  navigateToDetail(event: Event) {
    event.preventDefault();
    this.analytics.trackEvent('navigation', '/details');
    this.router.navigate(['/details']);
  }
}
```

### 在哪里可以使用 `inject()`？

你可以在组件、指令或服务的构造期间注入依赖。对 [`inject`](https://angular.dev/api/core/inject) 的调用可以出现在 `constructor` 中，也可以出现在字段初始化器中。下面是一些常见的例子：

```ts
@Component(/* ... */)
export class MyComponent {
  // ✅ 在类字段初始化器中
  private service = inject(MyService);

  // ✅ 在构造函数体中
  private anotherService: MyService;

  constructor() {
    this.anotherService = inject(MyService);
  }
}
```

```ts
@Directive({...})
export class MyDirective {
  // ✅ 在类字段初始化器中
  private element = inject(ElementRef);
}
```

```ts
import {Service, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Service()
export class MyService {
  // ✅ 在服务中
  private http = inject(HttpClient);
}
```

```ts
export const authGuard = () => {
  // ✅ 在路由守卫中
  const auth = inject(AuthService);
  return auth.isAuthenticated();
};
```

Angular 用“注入上下文（injection context）”一词来描述代码中任何可以调用 [`inject`](https://angular.dev/api/core/inject) 的地方。组件、指令和服务的构造过程是最常见的注入上下文，更多细节请参阅[注入上下文](/guide/di/dependency-injection-context)。

更多信息请参阅 [inject API 文档](https://angular.dev/api/core/inject#usage-notes)。

## 下一步

现在你已经了解了 Angular 依赖注入的基础知识，可以开始学习如何创建自己的服务了。

下一篇指南[创建和使用服务](/guide/di/creating-and-using-services)将向你展示：

- 如何使用 Angular CLI 或手动创建服务
- `providedIn: 'root'` 模式是如何工作的
- 如何把服务注入到组件和其他服务中

这涵盖了 Angular 应用中服务最常见的用法。
