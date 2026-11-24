# 调试依赖注入及排查问题

依赖注入（Dependency Injection，DI）问题通常源于配置错误、作用域问题或不正确的使用模式。本指南帮助你识别并解决开发者经常遇到的 DI 问题。

## 常见陷阱与解决方案

### 服务在预期的位置不可用

最常见的 DI 问题之一是：你尝试注入某个服务（Service），但 Angular 在当前注入器（Injector）或任何父注入器中都找不到它。这通常是因为服务在错误的作用域中提供，或者根本没有提供。

#### 提供者作用域不匹配

当你在组件（Component）的 `providers` 数组中提供某个服务时，Angular 会在该组件的注入器中创建一个实例。这个实例只对该组件及其子组件可用。父组件和兄弟组件无法访问它，因为它们使用的是不同的注入器。

```ts [child-view.ts]
import {Component} from '@angular/core';
import {DataStore} from './data-store';

@Component({
  selector: 'app-child',
  template: '<p>Child</p>',
  providers: [DataStore], // 只在本组件及其子组件中可用
})
export class ChildView {}
```

```ts [parent-view.ts]
import {Component, inject} from '@angular/core';
import {DataStore} from './data-store';

@Component({
  selector: 'app-parent',
  template: '<app-child />',
})
export class ParentView {
  private dataService = inject(DataStore); // 错误：父组件无法访问
}
```

Angular 只会沿层级向上查找，绝不会向下查找。父组件无法访问在子组件中提供的服务。

**解决方案：** 在更高的层级（应用或父组件）提供该服务。

```ts
import {Service} from '@angular/core';

@Service()
export class DataStore {
  // 在任何地方都可用
}
```

::: tip 提示
`@Service` 让服务在任何地方都可用，并支持摇树优化（tree-shaking）。如果你不想把它的作用域设为整个应用，请指定 `autoProvided: false`。

:::

#### 服务与延迟加载的路由

当你在延迟加载（lazy loading）路由的 `providers` 数组中提供某个服务时，Angular 会为该路由创建一个子注入器。这个注入器及其服务只有在路由加载之后才可用。应用中立即加载（eagerly loaded）部分的组件无法访问这些服务，因为它们使用的是在延迟加载注入器创建之前就已存在的其他注入器。

```ts [feature.routes.ts]
import {Routes} from '@angular/router';
import {FeatureClient} from './feature-client';

export const featureRoutes: Routes = [
  {
    path: 'feature',
    providers: [FeatureClient],
    loadComponent: () => import('./feature-view'),
  },
];
```

```ts [eager-view.ts]
import {Component, inject} from '@angular/core';
import {FeatureClient} from './feature-client';

@Component({
  selector: 'app-eager',
  template: '<p>Eager Component</p>',
})
export class EagerView {
  private featureService = inject(FeatureClient); // 错误：此时还不可用
}
```

延迟加载的路由会创建子注入器，这些子注入器只有在路由加载之后才可用。

::: info 注意
默认情况下，即使导航离开了某个路由，路由注入器及其服务也会继续存在，直到应用关闭才会被销毁。要自动清理未使用的路由注入器，请参阅[自定义路由行为](/guide/routing/customizing-route-behavior#automatic-cleanup-of-unused-route-injectors)。

:::

**解决方案：** 对需要跨延迟加载边界共享的服务使用 `@Service`。

```ts [Provide at root for shared services]
import {Service} from '@angular/core';

@Service()
export class FeatureClient {
  // 在任何地方都可用，包括延迟加载之前
}
```

如果服务应该延迟加载，但又要让立即加载的组件可以使用，那就只在需要的地方注入它，并使用可选注入来处理可用性问题。

### 得到多个实例而不是单例

你期望得到一个共享实例（单例），却在不同组件中得到了各自独立的实例。

#### 在组件中而不是在根级别提供

当你把服务添加到组件的 `providers` 数组中时，Angular 会为该组件的每个实例都创建一个新的服务实例。每个组件都有自己独立的服务实例，这意味着一个组件中的修改不会影响其他组件中的服务实例。当你希望在整个应用中共享状态时，这往往出乎意料。

```ts [Component-level provider creates multiple instances]
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
  providers: [UserClient], // 每个组件都会创建新实例！
})
export class UserProfile {
  private userService = inject(UserClient);
}

@Component({
  selector: 'app-settings',
  template: '<p>Settings</p>',
  providers: [UserClient], // 不同的实例！
})
export class UserSettings {
  private userService = inject(UserClient);
}
```

每个组件都有自己的 `UserClient` 实例。一个组件中的修改不会影响另一个组件。

**解决方案：** 对单例使用 `@Service`。

```ts [Root-level singleton]
import {Service} from '@angular/core';

@Service()
export class UserClient {
  // 在所有组件之间共享的单个实例
}
```

#### 有意使用多个实例的情况

有时你确实希望每个组件拥有独立的实例，用来保存组件专属的状态。

```ts [Intentional: Component-scoped state]
import {Injectable, signal, Component, inject} from '@angular/core';

@Injectable() // 没有 providedIn —— 必须显式提供
export class FormStateStore {
  private formData = signal({});

  setData(data: any) {
    this.formData.set(data);
  }

  getData() {
    return this.formData();
  }
}

@Component({
  selector: 'app-user-form',
  template: '<form>...</form>',
  providers: [FormStateStore], // 每个表单都有自己的状态
})
export class UserForm {
  private formState = inject(FormStateStore);
}
```

这种模式适用于：

- 表单状态管理（每个表单的状态相互隔离）
- 组件专属的缓存
- 不应共享的临时数据

### 不正确的 inject() 用法

`inject()` 函数只在类构造和工厂执行期间的特定上下文中才能工作。

#### 在生命周期钩子中使用 inject()

当你在 `ngOnInit()`、`ngAfterViewInit()` 或 `ngOnDestroy()` 等生命周期钩子（Lifecycle Hook）中调用 `inject()` 函数时，Angular 会抛出错误，因为这些方法运行在注入上下文（injection context）之外。注入上下文只在类构造的同步执行期间可用，而类构造发生在生命周期钩子被调用之前。

```ts [inject() in ngOnInit]
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class UserProfile {
  userName = '';

  ngOnInit() {
    const userService = inject(UserClient); // 错误：不是注入上下文
    this.userName = userService.getUser().name;
  }
}
```

**解决方案：** 在字段初始化器中获取依赖并派生值。

```ts [Derive values in field initializers]
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient);
  userName = this.userService.getUser().name;
}
```

#### 使用 Injector 进行延后注入

当你需要在注入上下文之外获取服务时，可以直接对事先获取到的 `Injector` 调用 `injector.get()`：

```ts
import {Component, inject, Injector} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<button (click)="delayedLoad()">Load Later</button>',
})
export class UserProfile {
  private injector = inject(Injector);

  delayedLoad() {
    setTimeout(() => {
      const userService = this.injector.get(UserClient);
      console.log(userService.getUser());
    }, 1000);
  }
}
```

#### 为回调使用 runInInjectionContext

当你需要让 **其他代码** 能够调用 `inject()` 时，请使用 `runInInjectionContext()`。这在接收可能会使用依赖注入的回调时很有用：

```ts
import {Component, inject, Injector, input, runInInjectionContext} from '@angular/core';

@Component({
  selector: 'app-data-loader',
  template: '<button (click)="load()">Load</button>',
})
export class DataLoader {
  private injector = inject(Injector);
  onLoad = input<() => void>();

  load() {
    const callback = this.onLoad();
    if (callback) {
      // 让回调可以使用 inject()
      runInInjectionContext(this.injector, callback);
    }
  }
}
```

`runInInjectionContext()` 函数会创建一个临时的注入上下文，让回调中的代码可以调用 `inject()`。

::: warning 重要
尽可能在类级别获取依赖。简单的延后获取请使用 `injector.get()`，只有当外部代码需要调用 `inject()` 时才使用 `runInInjectionContext()`。

:::

::: tip 提示
使用 `assertInInjectionContext()` 来验证你的代码是否运行在有效的注入上下文中。这在编写会调用 `inject()` 的可复用函数时很有用。详情请参阅[断言上下文](/guide/di/dependency-injection-context#asserts-the-context)。

:::

### 混淆 providers 与 viewProviders

`providers` 与 `viewProviders` 之间的区别会影响内容投影（content projection）的场景。

#### 理解两者的区别

**providers：** 对组件的模板（Template）以及投影到组件中的任何内容（ng-content）都可用。

**viewProviders：** 只对组件的模板可用，对投影的内容 **不可用**。

```ts [parent-view.ts]
import {Component, inject} from '@angular/core';
import {ThemeStore} from './theme-store';

@Component({
  selector: 'app-parent',
  template: `
    <div>
      <p>Theme: {{ themeService.theme() }}</p>
      <ng-content />
    </div>
  `,
  providers: [ThemeStore], // 对内容子组件可用
})
export class ParentView {
  protected themeService = inject(ThemeStore);
}

@Component({
  selector: 'app-parent-view',
  template: `
    <div>
      <p>Theme: {{ themeService.theme() }}</p>
      <ng-content />
    </div>
  `,
  viewProviders: [ThemeStore], // 对内容子组件不可用
})
export class ParentViewOnly {
  protected themeService = inject(ThemeStore);
}
```

```ts [child-view.ts]
import {Component, inject} from '@angular/core';
import {ThemeStore} from './theme-store';

@Component({
  selector: 'app-child',
  template: '<p>Child theme: {{theme()}}</p>',
})
export class ChildView {
  private themeService = inject(ThemeStore, {optional: true});
  theme = () => this.themeService?.theme() ?? 'none';
}
```

```ts [app.ts]
@Component({
  selector: 'app-root',
  template: `
    <app-parent>
      <app-child />
      <!-- 可以访问 ThemeStore -->
    </app-parent>

    <app-parent-view>
      <app-child />
      <!-- 无法访问 ThemeStore -->
    </app-parent-view>
  `,
})
export class App {}
```

**投影到 `app-parent` 中时：** 子组件可以注入 `ThemeStore`，因为 `providers` 让它对投影的内容可用。

**投影到 `app-parent-view` 中时：** 子组件无法注入 `ThemeStore`，因为 `viewProviders` 把它限制在父组件的模板之内。

#### 在 providers 与 viewProviders 之间选择

以下情况使用 `providers`：

- 服务应该对投影的内容可用
- 你希望内容子组件能够访问该服务
- 你提供的是通用服务

以下情况使用 `viewProviders`：

- 服务只应该对你组件的模板可用
- 你希望对投影的内容隐藏实现细节
- 你提供的是不应外泄的内部服务

**默认建议：** 除非有特别的理由要用 `viewProviders` 限制访问，否则请使用 `providers`。

### InjectionToken 相关问题

在为非类依赖使用 `InjectionToken` 时，开发者经常会遇到与令牌身份、类型安全和提供者（Provider）配置相关的问题。这些问题通常源于 JavaScript 处理对象身份的方式以及 TypeScript 推断类型的方式。

#### 混淆令牌身份

当你创建一个新的 `InjectionToken` 实例时，JavaScript 会在内存中创建一个唯一的对象。即使你用完全相同的描述字符串再创建一个 `InjectionToken`，它也是一个完全不同的对象。Angular 使用令牌对象的身份（而不是它的描述）来把提供者与注入点匹配起来，因此描述相同、但对象身份不同的令牌无法访问彼此的值。

```ts [config.token.ts]
import {InjectionToken} from '@angular/core';

export interface AppConfig {
  apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app config');
```

```ts [app.config.ts]
import {bootstrapApplication} from '@angular/platform-browser';
import {APP_CONFIG} from './config.token';

export const appConfig: AppConfig = {
  apiUrl: 'https://api.example.com',
};

bootstrapApplication(App, {
  providers: [{provide: APP_CONFIG, useValue: appConfig}],
});
```

```ts [feature-view.ts]
// 用相同的描述创建了新的令牌
import {InjectionToken, inject, Component} from '@angular/core';
import {AppConfig} from './config.token';

const APP_CONFIG = new InjectionToken<AppConfig>('app config');

@Component({
  selector: 'app-feature',
  template: '<p>Feature</p>',
})
export class FeatureView {
  private config = inject(APP_CONFIG); // 错误：不同的令牌实例！
}
```

尽管两个令牌的描述都是 `'app config'`，它们却是不同的对象。Angular 按引用而不是按描述来比较令牌。

**解决方案：** 导入同一个令牌实例。

```ts [feature-view.ts]
import {inject, Component} from '@angular/core';
import {APP_CONFIG, AppConfig} from './config.token';

@Component({
  selector: 'app-feature',
  template: '<p>API: {{config.apiUrl}}</p>',
})
export class FeatureView {
  protected config = inject(APP_CONFIG); // 正常工作：同一个令牌实例
}
```

::: tip 提示
始终从一个共享文件中导出令牌，并在每个需要的地方导入它们。永远不要用相同的描述创建多个 `InjectionToken` 实例。

:::

#### 试图注入接口

TypeScript 接口只在编译期间用于类型检查。TypeScript 编译为 JavaScript 时会擦除所有接口定义，因此在运行时并不存在可供 Angular 用作注入令牌（injection token）的对象。如果你试图注入一个接口类型，Angular 就没有任何东西可以和提供者配置进行匹配。

```ts [Can]
interface UserConfig {
  name: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
})
export class UserProfile {
  // 错误：接口在运行时并不存在
  constructor(private config: UserConfig) {}
}
```

**解决方案：** 对接口类型使用 `InjectionToken`。

```ts [Use InjectionToken for interfaces]
import {InjectionToken, inject, Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

interface UserConfig {
  name: string;
  email: string;
}

export const USER_CONFIG = new InjectionToken<UserConfig>('user configuration');

// 提供配置
bootstrapApplication(App, {
  providers: [
    {
      provide: USER_CONFIG,
      useValue: {name: 'Alice', email: 'alice@example.com'},
    },
  ],
});

// 使用令牌进行注入
@Component({
  selector: 'app-profile',
  template: '<p>User: {{config.name}}</p>',
})
export class UserProfile {
  protected config = inject(USER_CONFIG);
}
```

`InjectionToken` 在运行时存在，可以用于注入；而 `UserConfig` 接口则在开发期间提供类型安全。

### 循环依赖

当服务之间相互注入、形成 Angular 无法解析的环时，就会出现循环依赖（circular dependency）。详细的解释和代码示例请参阅 [NG0200: Circular dependency](/errors/NG0200)。

**解决策略**（按优先顺序）：

1. **重构** - 把共享逻辑提取到第三个服务中，打破循环
2. **使用事件** - 用基于事件的通信（例如 `Subject`）代替直接依赖
3. **延迟注入** - 使用 `Injector.get()` 推迟其中一个依赖的获取（最后手段）

::: info 注意
不要用 `forwardRef()` 来解决服务之间的循环依赖——它只能解决独立（standalone）组件配置中的循环导入问题。

:::

## 调试依赖解析

### 理解解析过程

Angular 通过沿注入器层级向上查找来解析依赖。当出现 `NullInjectorError` 时，了解这个查找顺序有助于你确定应该在哪里添加缺失的提供者。

Angular 按以下顺序查找：

1. **元素注入器（Element injector）** - 当前组件或指令（Directive）
2. **父元素注入器** - 沿 DOM 树经由父组件向上
3. **环境注入器（Environment injector）** - 路由或应用注入器
4. **NullInjector** - 如果仍未找到，则抛出 `NullInjectorError`

当你看到 `NullInjectorError` 时，说明在该组件能访问到的任何层级上都没有提供这个服务。请检查：

- 该服务是否带有 `@Service()`，或者
- 该服务是否带有 `@Injectable({providedIn: 'root'})`，或者
- 该服务是否位于组件能够访问到的某个 `providers` 数组中

你可以使用 `self`、`skipSelf`、`host` 和 `optional` 等解析修饰符（resolution modifier）来修改这种查找行为。有关解析规则和修饰符的完整介绍，请参阅[分层注入器指南](/guide/di/hierarchical-dependency-injection)。

### 使用 Angular DevTools

Angular DevTools 包含一个注入器树检查器，它能可视化整个注入器层级，并显示每个层级上有哪些提供者可用。关于安装和一般用法，请参阅 [Angular DevTools 注入器文档](/tools/devtools/injectors)。

调试 DI 问题时，可以用 DevTools 回答以下问题：

- **服务是否已提供？** 选中注入失败的组件，检查该服务是否出现在 Injector 区域中。
- **在哪个层级提供？** 沿组件树向上查找，找到服务实际被提供的位置（组件、路由或应用级别）。
- **是否有多个实例？** 如果某个单例服务出现在多个组件注入器中，那么它很可能是在组件的 `providers` 数组中提供的，而不是使用 `@Service` 或 `providedIn: 'root'`。

如果某个服务从未出现在任何注入器中，请确认它带有 `@Service` 装饰器，或者已列在某个 `providers` 数组中。

### 记录和追踪注入过程

当 DevTools 不够用时，可以借助日志来追踪注入行为。

#### 记录服务的创建

在服务构造函数中添加控制台日志，看看服务是何时创建的。

```ts
import {Service} from '@angular/core';

@Service()
export class UserClient {
  constructor() {
    console.log('UserClient created');
    console.trace(); // 显示调用栈
  }

  getUser() {
    return {name: 'Alice'};
  }
}
```

当服务被创建时，你会看到这条日志消息，以及显示注入发生位置的栈追踪。

**需要关注的内容：**

- 构造函数被调用了多少次？（单例应该只调用一次）
- 它是在代码中的什么位置被注入的？（查看栈追踪）
- 它是否在预期的时间被创建？（应用启动时还是延迟创建）

#### 检查服务的可用性

结合可选注入和日志来判断某个服务是否可用。

```ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Debug Component</p>',
})
export class DebugView {
  private userService = inject(UserClient, {optional: true});

  constructor() {
    if (this.userService) {
      console.log('UserClient available:', this.userService);
    } else {
      console.warn('UserClient NOT available');
      console.trace(); // 显示我们尝试注入的位置
    }
  }
}
```

这种模式可以帮你在不让应用崩溃的情况下确认服务是否可用。

#### 记录解析修饰符的效果

借助日志测试不同的解析策略。

```ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Debug Component</p>',
  providers: [UserClient],
})
export class DebugView {
  // 尝试获取本地实例
  private localService = inject(UserClient, {self: true, optional: true});

  // 尝试获取父级实例
  private parentService = inject(UserClient, {
    skipSelf: true,
    optional: true,
  });

  constructor() {
    console.log('Local instance:', this.localService);
    console.log('Parent instance:', this.parentService);
    console.log('Same instance?', this.localService === this.parentService);
  }
}
```

这会显示在不同注入器层级上有哪些实例可用。

### 调试流程

当 DI 失败时，请按以下系统化的步骤进行：

**第 1 步：阅读错误消息**

- 识别错误码（NG0200、NG0203 等）
- 阅读依赖路径
- 记下是哪个令牌失败了

**第 2 步：检查基础配置**

- 服务是否带有 `@Service` 或 `@Injectable()`？
- 如果使用的是 `@Injectable`，`providedIn` 是否设置正确？
- 导入是否正确？
- 该文件是否被包含在编译中？

**第 3 步：确认注入上下文**

- `inject()` 是否在有效的上下文中调用？
- 检查异步问题（await、setTimeout、promise）
- 确认调用时机（不能在销毁之后）

**第 4 步：使用调试工具**

- 打开 Angular DevTools
- 检查注入器层级
- 在构造函数中添加控制台日志
- 使用可选注入来测试可用性

**第 5 步：简化并隔离问题**

- 逐个移除依赖
- 在一个最小化的组件中测试
- 分别检查每个注入器层级
- 创建一个复现用例

## DI 错误参考

本节详细介绍你可能遇到的 Angular DI 错误码。当你在控制台中看到这些错误时，可以把本节当作参考。

### NullInjectorError: No provider for [Service]

**错误码：** [NG0201](/errors/NG0201)

当 Angular 在注入器层级中找不到某个令牌的提供者时，就会出现这个错误。错误消息中包含一条依赖路径，显示是在哪里尝试注入的。

```
NG0201: No provider found for `UserClient`. Path: AuthClient -> UserClient.
```

这条依赖路径表明，`AuthClient` 尝试注入 `UserClient`，但没有找到提供者。

#### 缺少 `@Service ` 或 `@Injectable` 装饰器

最常见的原因是忘了在服务类上添加 `@Service` 或 `@Injectable()` 装饰器。

```ts [Missing decorator]
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Angular 需要 `@Service()` 装饰器来生成依赖注入所需的元数据。

```ts [Include @Service]
import {Service} from '@angular/core';

@Service()
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

::: info 注意
构造函数没有参数的类即使不加 `@Service()` 也可以工作，但不推荐这样做。请始终加上这个装饰器，以保持一致，并避免日后添加依赖时出现问题。

:::

#### 缺少 providedIn 配置

服务可能带有 `@Injectable()`，却没有指定应该在哪里提供它。

```ts [No providedIn specified]
import {Injectable} from '@angular/core';

@Injectable()
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

使用 `@Service` 装饰器让该服务在整个应用中可用。

```ts [Specify providedIn]
import {Service} from '@angular/core';

@Service()
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

`@Service` 装饰器让服务在整个应用范围内可用，并支持摇树优化（如果从未被注入，该服务就会从包（bundle）中移除）。

#### 独立组件缺少导入

在使用独立组件的 Angular v20+ 中，你必须在每个组件中显式导入或提供依赖。

```ts [Missing service import]
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{user.name}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient); // 错误：没有提供者
  user = this.userService.getUser();
}
```

请确保该服务使用了 `@Service`，或者把它添加到组件的 `providers` 数组中。

```ts [Service uses providedIn: root]
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{user.name}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient); // 正常工作：providedIn: 'root'
  user = this.userService.getUser();
}
```

#### 借助依赖路径进行调试

错误消息中的依赖路径显示了导致失败的注入链。

```
NG0201: No provider found for `LoggerStore`. Path: DataStore -> ApiClient -> LoggerStore.
```

这条路径告诉你：

1. `DataStore` 注入了 `ApiClient`
2. `ApiClient` 尝试注入 `LoggerStore`
3. 没有找到 `LoggerStore` 的提供者

从链条的末端（`LoggerStore`）开始排查，确认它的配置是否正确。

#### 用可选注入检查提供者是否可用

使用可选注入来检查某个提供者是否存在，而不会抛出错误。

```ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Service available: {{serviceAvailable}}</p>',
})
export class DebugView {
  private userService = inject(UserClient, {optional: true});
  serviceAvailable = this.userService !== null;
}
```

如果找不到提供者，可选注入会返回 `null`，让你可以优雅地处理缺失的情况。

### NG0203: inject() must be called from an injection context

**错误码：** NG0203

当你在有效的注入上下文之外调用 `inject()` 时，就会出现这个错误。Angular 要求在类构造或工厂执行期间同步调用 `inject()`。

```
NG0203: The `UserClient` token injection failed. `inject()` function must
be called from an injection context such as a constructor, a factory
function, a field initializer, or a function used with
`runInInjectionContext`.
```

#### 有效的注入上下文

Angular 允许在以下位置使用 `inject()`：

1. **类字段初始化器**

   ```ts
   import {Component, inject} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<p>User: {{user.name}}</p>',
   })
   export class UserProfile {
     private userService = inject(UserClient); // 有效
     user = this.userService.getUser();
   }
   ```

2. **类构造函数**

   ```ts
   import {Component, inject} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<p>User: {{user.name}}</p>',
   })
   export class UserProfile {
     private userService: UserClient;
     user: ReturnType<UserClient['getUser']>;

     constructor() {
       this.userService = inject(UserClient); // 有效
       this.user = this.userService.getUser();
     }
   }
   ```

3. **提供者工厂函数**

   ```ts
   import {inject, InjectionToken} from '@angular/core';
   import {UserClient} from './user-client';

   export const GREETING = new InjectionToken<string>('greeting', {
     factory() {
       const userService = inject(UserClient); // 有效
       const user = userService.getUser();
       return `Hello, ${user.name}`;
     },
   });
   ```

4. **在 runInInjectionContext() 内部**

   ```ts
   import {Component, inject, Injector, runInInjectionContext} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<button (click)="loadUser()">Load User</button>',
   })
   export class UserProfile {
     private injector = inject(Injector);

     loadUser() {
       runInInjectionContext(this.injector, () => {
         const userService = inject(UserClient); // 有效
         console.log(userService.getUser());
       });
     }
   }
   ```

`inject()` 还能在以下注入上下文中使用：

- [provideAppInitializer](https://angular.dev/api/core/provideAppInitializer)
- [provideEnvironmentInitializer](https://angular.dev/api/core/provideEnvironmentInitializer)
- 函数式[路由守卫](/guide/routing/route-guards)
- 函数式[数据解析器](/guide/routing/data-resolvers)
- 路由[资源](/guide/routing/data-fetching-with-resources)

#### 何时会出现这个错误

以下情况会出现这个错误：

- 在生命周期钩子（`ngOnInit`、`ngAfterViewInit` 等）中调用 `inject()`
- 在异步函数中的 `await` 之后调用 `inject()`
- 在回调（`setTimeout`、`Promise.then()` 等）中调用 `inject()`
- 在类构造阶段之外调用 `inject()`

详细的示例和解决方案请参阅“不正确的 inject() 用法”一节。

#### 解决方案与变通办法

**解决方案 1：** 在字段初始化器中获取依赖（最常见）

```ts
private userService = inject(UserClient) // 在类级别获取
```

**解决方案 2：** 为回调使用 `runInInjectionContext()`

```ts
private injector = inject(Injector)

someCallback() {
  runInInjectionContext(this.injector, () => {
    const service = inject(MyClient)
  })
}
```

**解决方案 3：** 把依赖作为参数传入，而不是在内部注入

```ts
// 不要在回调内部注入
setTimeout(() => {
  const service = inject(MyClient) // 错误
}, 1000)

// 先获取，再使用
private service = inject(MyClient)

setTimeout(() => {
  this.service.doSomething() // 使用已获取的引用
}, 1000)
```

### NG0200: Circular dependency detected

**错误码：** NG0200

当两个或多个服务相互依赖、形成 Angular 无法解析的循环依赖时，就会出现这个错误。

```
NG0200: Circular dependency detected for `AuthClient`. Path: AuthClient -> UserClient -> AuthClient.
```

这条依赖路径显示了循环：`AuthClient` 依赖 `UserClient`，而 `UserClient` 又反过来依赖 `AuthClient`。

#### 理解这个错误

Angular 通过调用服务的构造函数并注入依赖来创建服务实例。当服务之间循环依赖时，Angular 无法确定应该先创建哪一个。

#### 常见原因

- 直接循环依赖（Service A → Service B → Service A）
- 间接循环依赖（Service A → Service B → Service C → Service A）
- 同时存在服务依赖的模块文件之间出现导入循环

#### 解决策略

详细的示例和解决方案请参阅“循环依赖”一节：

1. **重构** - 把共享逻辑提取到第三个服务中（推荐）
2. **使用事件** - 用基于事件的通信代替直接依赖
3. **延迟注入** - 使用 `Injector.get()` 推迟其中一个依赖的获取（最后手段）

**不要** 用 `forwardRef()` 来解决服务之间的循环依赖。它只能解决组件配置中的循环导入问题。

### 其他 DI 错误码

关于这些错误的详细解释和解决方案，请参阅 [Angular 错误参考](/errors)：

| 错误码              | 说明                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| [NG0204](/errors/NG0204) | 无法解析所有参数 - 缺少 `@Injectable()` 装饰器                           |
| [NG0205](/errors/NG0205) | 注入器已被销毁 - 在组件销毁之后访问服务                |
| [NG0207](/errors/NG0207) | EnvironmentProviders 用在了错误的上下文中 - 在组件的 providers 中使用 `provideHttpClient()` |

## 下一步

遇到 DI 错误时，请记得：

1. 仔细阅读错误消息和依赖路径
2. 确认基础配置（装饰器、`providedIn`、导入）
3. 检查注入上下文和调用时机
4. 使用 DevTools 和日志进行排查
5. 简化并隔离问题

要更深入地了解依赖注入的特定主题，请查看：

- [理解依赖注入](/guide/di) - DI 的核心概念与模式
- [分层依赖注入](/guide/di/hierarchical-dependency-injection) - 注入器层级是如何工作的
- [使用依赖注入进行测试](/guide/testing) - 使用 TestBed 并模拟依赖
