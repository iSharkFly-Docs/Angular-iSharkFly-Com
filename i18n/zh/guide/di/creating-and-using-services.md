# 创建和使用服务

服务（Service）是可以在整个 Angular 应用中共享的可复用代码片段。你通常用它们来处理数据获取、业务逻辑，或者多个组件（Component）都需要访问的其他功能。

## 创建服务

你可以使用 [Angular CLI](/tools/cli) 通过以下命令创建服务：

```bash
ng generate service CUSTOM_NAME
```

这个命令会在你的 `src` 目录中创建一个专门的 `CUSTOM_NAME.ts` 文件。

你也可以给 TypeScript 类添加 `@Service()` 装饰器来手动创建服务。这会告诉 Angular，这个类可以用作可注入的依赖。

下面的例子定义了一个服务，允许用户添加和获取数据：

```ts [src/app/basic-data-store.ts]
import {Service} from '@angular/core';

@Service()
export class BasicDataStore {
  private data: string[] = [];

  addData(item: string): void {
    this.data.push(item);
  }

  getData(): string[] {
    return [...this.data];
  }
}
```

## 服务如何变得可用

默认情况下，服务在根级别提供。当服务在全局提供时，Angular 会保证三个主要好处：

- **单例实例：** 为整个应用创建一个共享的实例。
- **全局可用：** 无需手动注册提供者（Provider），就能在任何地方自动访问。
- **可摇树优化：** 如果你的代码从未显式使用该服务，就确保把它排除在最终的生产包（bundle）之外。

### 使用 `@Service` 与 `@Injectable` 装饰器

`@Service` 装饰器是传统 `@Injectable({ providedIn: 'root' })` 语法的一种现代、更顺手的简写形式。

可以参考下面的速查表来决定哪个装饰器适合你的场景：

| 特性 / 需求                         | `@Service` | `@Injectable`                           |
| --------------------------------------------- | ---------- | --------------------------------------- |
| **支持 `inject()` 函数**               | Yes        | Yes                                     |
| **基于构造函数的 DI**                      | ❌ No      | Yes                                     |
| **隐式的根级单例提供者**          | Yes        | ❌ No（需要 `{providedIn: 'root'}`） |
| **高级提供者键（`useClass` 等）** | ❌ No      | Yes                                     |
| **自定义初始化工厂**           | Yes        | Yes                                     |
| **非根作用域（`platform` 等）**        | ❌ No      | Yes                                     |

### 用工厂替换实现

如果你需要控制单例的创建方式，例如根据环境换用不同的实现，可以传入一个 `factory` 函数。

该工厂运行在[注入上下文（injection context）](/guide/di/dependency-injection-context)中，因此你可以在其中使用 [`inject()`](https://angular.dev/api/core/inject) 来读取其他依赖。

下面的 `Analytics` 服务在本地是空操作，这样在开发期间事件就不会污染控制台。在生产环境中，工厂会读取 `ANALYTICS_ENABLED` 令牌，并返回一个 `GoogleAnalytics` 子类，把事件转发给真正的跟踪器：

```ts [src/app/analytics.ts]
import {inject, InjectionToken, Service} from '@angular/core';
import {ANALYTICS_ENABLED} from './token';

@Service({
  factory: () => (inject(ANALYTICS_ENABLED) ? new GoogleAnalytics() : new Analytics()),
})
export class Analytics {
  track(event: string, payload?: Record<string, unknown>) {
    // 默认什么也不做。
  }
}

class GoogleAnalytics extends Analytics {
  override track(event: string, payload?: Record<string, unknown>) {
    // 向 Google Analytics 派发一个分析事件
  }
}
```

::: info 注意
`factory` 选项取代了 `@Injectable` 的 `useClass`、`useValue`、`useExisting` 和 `useFactory` 选项。如果你需要其中任何一个，请继续使用 `@Injectable`。

:::

### 退出自动提供

默认情况下，`@Service` 会在根注入器（Injector）中提供该类。如果你想手动提供它，例如把它的作用域限定在某个路由或组件中，请设置 `autoProvided: false`：

```ts [src/app/analytics-logger.ts]
import {Service} from '@angular/core';

@Service({autoProvided: false})
export class AnalyticsLogger {
  trackEvent(name: string) {
    console.log('event:', name);
  }
}
```

之后你需要自己把该服务添加到某个 `providers` 数组中，就像使用普通的 `@Injectable()` 一样：

### 何时使用 `@Service`，何时使用 `@Injectable`

当你要创建一个新的单例类，并且它使用 `inject()` 获取依赖时，就选用 `@Service`。如果你需要以下任何一项，请继续使用 `@Injectable`：

- **基于构造函数的依赖注入（Dependency Injection）。** `@Service` 只支持 [`inject()`](https://angular.dev/api/core/inject) 函数。
- **高级提供者配置**，例如 `useClass`、`useValue`、`useExisting` 或 `useFactory`。`@Service` 只提供了一个 `factory` 选项来代替它们。
- **非根作用域**，例如 `providedIn: 'platform'`。

## 注入服务

使用 `providedIn: 'root'` 创建服务之后，你就可以使用 `@angular/core` 中的 `inject()` 函数在应用的任何地方注入它。

### 注入到组件中

```ts
import {Component, inject} from '@angular/core';
import {BasicDataStore} from './basic-data-store';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <p>{{ dataStore.getData() }}</p>
      <button (click)="dataStore.addData('More data')">Add more data</button>
    </div>
  `,
})
export class Example {
  dataStore = inject(BasicDataStore);
}
```

### 注入到另一个服务中

```ts
import {inject, Service} from '@angular/core';
import {AdvancedDataStore} from './advanced-data-store';

@Service()
export class BasicDataStore {
  private advancedDataStore = inject(AdvancedDataStore);
  private data: string[] = [];

  addData(item: string): void {
    this.data.push(item);
  }

  getData(): string[] {
    return [...this.data, ...this.advancedDataStore.getData()];
  }
}
```

## 下一步

虽然 `providedIn: 'root'` 能覆盖大多数用例，但 Angular 还提供了其他方式，让你可以在更特殊的场景下配置服务：

- **组件专属实例** - 当组件需要各自独立的服务实例时
- **手动配置** - 用于需要运行时配置的服务
- **工厂提供者** - 根据运行时条件动态创建服务
- **值提供者** - 用于提供配置对象或常量

你可以在下一篇指南中进一步了解这些高级模式：[定义依赖提供者](/guide/di/defining-dependency-providers)。
