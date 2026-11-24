# 定义依赖提供者 {#defining-dependency-providers}

Angular 提供了两种方式让服务（Service）可以被注入：

1. **自动提供** - 在 `@Injectable` 装饰器中使用 `providedIn`、使用 [`@Service`](/guide/di/creating-and-using-services#using-the-service-vs-injectable-decorator) 装饰器，或者在 `InjectionToken` 的配置中提供一个工厂函数
2. **手动提供** - 在组件（Component）、指令（Directive）、路由或应用配置中使用 `providers` 数组

在[上一篇指南](/guide/di/creating-and-using-services)中，你学习了如何使用 `providedIn: 'root'` 创建服务，它能满足大多数常见场景。本指南将进一步介绍自动和手动配置提供者（Provider）的更多模式。

## 为非类依赖提供自动供给 {#automatic-provision-for-non-class-dependencies}

带有 `providedIn: 'root'` 的 `@Injectable` 装饰器非常适合服务（类），但你可能还需要在全局范围内提供其他类型的值，比如配置对象、函数或原始值。为此，Angular 提供了 `InjectionToken`。

### 什么是 InjectionToken？ {#what-is-an-injectiontoken}

`InjectionToken` 是 Angular 依赖注入（Dependency Injection）系统用来唯一标识可注入值的对象。可以把它看作一把特殊的键，让你在 Angular 的依赖注入系统中存取任意类型的值：

```ts
import {InjectionToken} from '@angular/core';

// 为字符串值创建令牌
export const API_URL = new InjectionToken<string>('api.url');

// 为函数创建令牌
export const LOGGER = new InjectionToken<(msg: string) => void>('logger.function');

// 为复杂类型创建令牌
export interface Config {
  apiUrl: string;
  timeout: number;
}
export const CONFIG_TOKEN = new InjectionToken<Config>('app.config');
```

::: info 注意
字符串参数（例如 `'api.url'`）只是用于调试的描述 —— Angular 通过对象引用来识别令牌，而不是这个字符串。

:::

### 带 `providedIn: 'root'` 的 InjectionToken {#injectiontoken-with-providedin-root}

带有 `factory` 的 `InjectionToken` 默认就是 `providedIn: 'root'`（但可以通过 `providedIn` 属性覆盖）。

```ts [/app/config.token.ts]
import {InjectionToken, Component, inject} from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  version: string;
  features: Record<string, boolean>;
}

// 使用 providedIn 实现全局可用的配置
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => ({
    apiUrl: 'https://api.example.com',
    version: '1.0.0',
    features: {
      darkMode: true,
      analytics: false,
    },
  }),
});

// 无需添加到 providers 数组 —— 随处可用！
@Component({
  selector: 'app-header',
  template: `<h1>Version: {{ config.version }}</h1>`,
})
export class Header {
  config = inject(APP_CONFIG); // 自动可用
}
```

### 何时使用带工厂函数的 InjectionToken {#when-to-use-injectiontoken-with-factory-functions}

当你无法使用类、但又需要在全局范围内提供依赖时，带工厂函数的 InjectionToken 是理想之选：

```ts [/app/logger.token.ts]
import {InjectionToken, inject} from '@angular/core';
import {APP_CONFIG} from './config.token';

// 日志函数类型
export type LoggerFn = (level: 'log' | 'warn' | 'error', message: string) => void;

// 带有依赖的全局日志函数
export const LOGGER_FN = new InjectionToken<LoggerFn>('logger.function', {
  providedIn: 'root',
  factory: () => {
    const config = inject(APP_CONFIG);

    return (level: 'log' | 'warn' | 'error', message: string) => {
      if (config.features.logging !== false) {
        console[level](`[${new Date().toISOString()}] ${message}`);
      }
    };
  },
});
```

```ts [/app/storage.token.ts]
// 以令牌的形式提供浏览器 API
export const LOCAL_STORAGE = new InjectionToken<Storage>('localStorage', {
  // providedIn: 'root' 是默认配置
  factory: () => window.localStorage,
});

export const SESSION_STORAGE = new InjectionToken<Storage>('sessionStorage', {
  providedIn: 'root',
  factory: () => window.sessionStorage,
});
```

```ts [/app/feature-flags.token.ts]
// 带有运行时逻辑的复杂配置
export const FEATURE_FLAGS = new InjectionToken<Map<string, boolean>>('feature.flags', {
  providedIn: 'root',
  factory: () => {
    const flags = new Map<string, boolean>();

    // 从环境或 URL 参数中解析
    const urlParams = new URLSearchParams(window.location.search);
    const enableBeta = urlParams.get('beta') === 'true';

    flags.set('betaFeatures', enableBeta);
    flags.set('darkMode', true);
    flags.set('newDashboard', false);

    return flags;
  },
});
```

这种方式有以下几个优点：

- **无需手动配置提供者** - 与服务的 `providedIn: 'root'` 用法一样
- **可摇树优化（Tree-shaking）** - 只有真正用到时才会被包含进来
- **类型安全** - 对非类值提供完整的 TypeScript 支持
- **可以注入其他依赖** - 工厂函数可以使用 `inject()` 访问其他服务

## 理解手动配置提供者 {#understanding-manual-provider-configuration}

当你需要比 `providedIn: 'root'` 更多的控制时，可以手动配置提供者。在以下情况下，通过 `providers` 数组进行手动配置会很有用：

1. **服务没有 `providedIn`** - 没有自动提供的服务必须手动提供
2. **你想要一个新实例** - 在组件 / 指令级别创建一个单独的实例，而不是使用共享实例
3. **你需要运行时配置** - 服务的行为取决于运行时的值
4. **你要提供非类值** - 配置对象、函数或原始值

### 示例：没有 `providedIn` 的服务 {#example-service-without-providedin}

```ts
import {Injectable, Component, inject} from '@angular/core';

// 没有 providedIn 的服务
@Injectable()
export class LocalDataStore {
  private data: string[] = [];

  addData(item: string) {
    this.data.push(item);
  }
}

// 组件必须提供它
@Component({
  selector: 'app-example',
  // 这里需要提供者，因为 `LocalDataStore` 服务没有 providedIn。
  providers: [LocalDataStore],
  template: `...`,
})
export class Example {
  dataStore = inject(LocalDataStore);
}
```

### 示例：创建组件专属的实例 {#example-creating-component-specific-instances}

带有 `providedIn: 'root'` 的服务可以在组件级别被覆盖。这样服务实例就与组件的生命周期绑定在一起。因此，当组件被销毁时，它所提供的服务也会随之销毁。

```ts
import {Injectable, Component, inject} from '@angular/core';

@Injectable({providedIn: 'root'})
export class DataStore {
  private data: string[] = [];
}

// 这个组件拥有自己的实例
@Component({
  selector: 'app-isolated',
  // 创建 `DataStore` 的新实例，而不是使用根级提供的实例。
  providers: [DataStore],
  template: `...`,
})
export class Isolated {
  dataStore = inject(DataStore); // 组件专属的实例
}
```

## Angular 中的注入器层次结构 {#injector-hierarchy-in-angular}

Angular 的依赖注入系统是分层的。当组件请求一个依赖时，Angular 会从该组件的注入器（Injector）开始，沿着树向上查找，直到找到该依赖的提供者。应用树中的每个组件都可以有自己的注入器，这些注入器构成了一个与组件树相对应的层次结构。

这种层次结构带来了：

- **限定作用域的实例**：应用的不同部分可以拥有同一个服务的不同实例
- **覆盖行为**：子组件可以覆盖来自父组件的提供者
- **内存效率**：服务只会在需要的地方实例化

在 Angular 中，任何带有组件或指令的元素都可以为其所有后代提供值。

```txt
graph TD
    subgraph platform
        subgraph root
            direction TB
            A[SocialApp] --> B[UserProfile]
            A --> C[FriendList]
            C --> D[FriendEntry]
        end
    end
```

在上面的示例中：

1. `SocialApp` 可以为 `UserProfile` 和 `FriendList` 提供值
2. `FriendList` 可以为 `FriendEntry` 提供可注入的值，但无法为 `UserProfile` 提供可注入的值，因为 `UserProfile` 不在它的子树中

## 声明提供者 {#declaring-a-provider}

可以把 Angular 的依赖注入系统想象成一个哈希表或字典。每个提供者配置对象都定义了一个键值对：

- **键（提供者标识符）**：你用来请求依赖的唯一标识符
- **值**：当请求该令牌时，Angular 应当返回的内容

手动提供依赖时，你通常会看到这种简写语法：

```ts
import {Component} from '@angular/core';
import {LocalService} from './local-service';

@Component({
  selector: 'app-example',
  providers: [LocalService], // 没有 providedIn 的服务
})
export class Example {}
```

这实际上是一种更详细的提供者配置的简写：

```ts
{
  // 这是简写形式
  providers: [LocalService],

  // 这是完整形式
  providers: [
    { provide: LocalService, useClass: LocalService }
  ]
}
```

### 提供者配置对象 {#provider-configuration-object}

每个提供者配置对象都由两个主要部分组成：

1. **提供者标识符**：Angular 用来获取依赖的唯一键（通过 `provide` 属性设置）
2. **值**：你希望 Angular 获取的实际依赖，根据所需类型使用不同的键来配置：
   - `useClass` - 提供一个 JavaScript 类
   - `useValue` - 提供一个静态值
   - `useFactory` - 提供一个返回该值的工厂函数
   - `useExisting` - 为已有的提供者提供一个别名

### 提供者标识符 {#provider-identifiers}

提供者标识符让 Angular 的依赖注入（DI）系统能够通过唯一 ID 获取依赖。你可以用两种方式生成提供者标识符：

1. [类名](#class-names)
2. [注入令牌（Injection Token）](#injection-tokens)

#### 类名 {#class-names}

类名方式直接使用导入的类作为标识符：

```ts
import {Component} from '@angular/core';
import {LocalService} from './local-service';

@Component({
  selector: 'app-example',
  providers: [{provide: LocalService, useClass: LocalService}],
})
export class Example {
  /* ... */
}
```

这个类既是标识符，也是实现，所以 Angular 提供了 `providers: [LocalService]` 这种简写。

#### 注入令牌 {#injection-tokens}

Angular 提供了一个内置的 [`InjectionToken`](https://angular.dev/api/core/InjectionToken) 类，它会为可注入的值创建一个唯一的对象引用，也适用于你想为同一个接口提供多个实现的情况。

```ts [/app/tokens.ts]
import {InjectionToken} from '@angular/core';
import {DataService} from './data-service.interface';

export const DATA_SERVICE_TOKEN = new InjectionToken<DataService>('DataService');
```

::: info 注意
字符串 `'DataService'` 只是用于调试的描述。Angular 通过对象引用来识别令牌，而不是这个字符串。

:::

在提供者配置中使用该令牌：

```ts
import {Component, inject} from '@angular/core';
import {LocalDataService} from './local-data-service';
import {DATA_SERVICE_TOKEN} from './tokens';

@Component({
  selector: 'app-example',
  providers: [{provide: DATA_SERVICE_TOKEN, useClass: LocalDataService}],
})
export class Example {
  private dataService = inject(DATA_SERVICE_TOKEN);
}
```

#### TypeScript 接口可以作为注入标识符吗？ {#can-typescript-interfaces-be-identifiers-for-injection}

TypeScript 接口不能用于注入，因为它们在运行时并不存在：

```ts
// ❌ 这样行不通！
interface DataService {
  getData(): string[];
}

// 接口在 TypeScript 编译之后就消失了
@Component({
  providers: [
    {provide: DataService, useClass: LocalDataService}, // 错误！
  ],
})
export class Example {
  private dataService = inject(DataService); // 错误！
}

// ✅ 改用 InjectionToken
export const DATA_SERVICE_TOKEN = new InjectionToken<DataService>('DataService');

@Component({
  providers: [{provide: DATA_SERVICE_TOKEN, useClass: LocalDataService}],
})
export class Example {
  private dataService = inject(DATA_SERVICE_TOKEN); // 可以正常工作！
}
```

InjectionToken 提供了一个 Angular 依赖注入系统可以使用的运行时值，同时仍然借助 TypeScript 的泛型类型参数保持类型安全。

### 提供者值的类型 {#provider-value-types}

#### useClass {#useclass}

`useClass` 把一个 JavaScript 类作为依赖提供。这是使用简写语法时的默认方式：

```ts
// 简写形式
providers: [DataService];

// 完整语法
providers: [{provide: DataService, useClass: DataService}];

// 不同的实现
providers: [{provide: DataService, useClass: MockDataService}];

// 按条件选择实现
providers: [
  {
    provide: StorageService,
    useClass: environment.production ? CloudStorageService : LocalStorageService,
  },
];
```

#### 实践示例：替换日志记录器 {#practical-example-logger-substitution}

你可以替换实现来扩展功能：

```ts
import {Injectable, Component, inject} from '@angular/core';

// 基础日志记录器
@Injectable()
export class Logger {
  log(message: string) {
    console.log(message);
  }
}

// 带时间戳的增强版日志记录器
@Injectable()
export class BetterLogger extends Logger {
  override log(message: string) {
    super.log(`[${new Date().toISOString()}] ${message}`);
  }
}

// 包含用户上下文的日志记录器
@Injectable()
export class EvenBetterLogger extends Logger {
  private userService = inject(UserService);

  override log(message: string) {
    const name = this.userService.user.name;
    super.log(`Message to ${name}: ${message}`);
  }
}

// 在你的组件中
@Component({
  selector: 'app-example',
  providers: [
    UserService, // EvenBetterLogger 需要它
    {provide: Logger, useClass: EvenBetterLogger},
  ],
})
export class Example {
  private logger = inject(Logger); // 得到的是 EvenBetterLogger 实例
}
```

#### useValue {#usevalue}

`useValue` 把任意 JavaScript 数据类型作为静态值提供：

```ts
providers: [
  {provide: API_URL_TOKEN, useValue: 'https://api.example.com'},
  {provide: MAX_RETRIES_TOKEN, useValue: 3},
  {provide: FEATURE_FLAGS_TOKEN, useValue: {darkMode: true, beta: false}},
];
```

::: warning 重要
TypeScript 类型和接口不能作为依赖值，它们只存在于编译期。

:::

#### 实践示例：应用配置 {#practical-example-application-configuration}

`useValue` 的一个常见用法是提供应用配置：

```ts
// 定义配置接口
export interface AppConfig {
  apiUrl: string;
  appTitle: string;
  features: {
    darkMode: boolean;
    analytics: boolean;
  };
}

// 创建注入令牌
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

// 定义配置
const appConfig: AppConfig = {
  apiUrl: 'https://api.example.com',
  appTitle: 'My Application',
  features: {
    darkMode: true,
    analytics: false,
  },
};

// 在启动时提供
bootstrapApplication(AppComponent, {
  providers: [{provide: APP_CONFIG, useValue: appConfig}],
});

// 在组件中使用
@Component({
  selector: 'app-header',
  template: `<h1>{{ title }}</h1>`,
})
export class Header {
  private config = inject(APP_CONFIG);
  title = this.config.appTitle;
}
```

#### useFactory {#usefactory}

`useFactory` 提供一个函数，用来生成要注入的新值：

```ts
export const loggerFactory = (config: AppConfig) => {
  return new LoggerService(config.logLevel, config.endpoint);
};

providers: [
  {
    provide: LoggerService,
    useFactory: loggerFactory,
    deps: [APP_CONFIG], // 工厂函数的依赖
  },
];
```

你可以把工厂函数的依赖标记为可选的：

```ts
import {Optional} from '@angular/core';

providers: [
  {
    provide: MyService,
    useFactory: (required: RequiredService, optional?: OptionalService) => {
      return new MyService(required, optional || new DefaultService());
    },
    deps: [RequiredService, [new Optional(), OptionalService]],
  },
];
```

#### 实践示例：基于配置的 API 客户端 {#practical-example-configuration-based-api-client}

下面是一个完整的示例，展示如何使用工厂函数创建一个带有运行时配置的服务：

```ts
// 需要运行时配置的服务
class ApiClient {
  constructor(
    private http: HttpClient,
    private baseUrl: string,
    private rateLimitMs: number,
  ) {}

  async fetchData(endpoint: string) {
    // 根据用户等级进行限流
    await this.applyRateLimit();
    return this.http.get(`${this.baseUrl}/${endpoint}`);
  }

  private async applyRateLimit() {
    // 简化示例 —— 真实的实现会记录请求时间
    return new Promise((resolve) => setTimeout(resolve, this.rateLimitMs));
  }
}

// 根据用户等级进行配置的工厂函数
import {inject, Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
const apiClientFactory = () => {
  const http = inject(HttpClient);
  const userService = inject(UserService);

  // 假设 userService 提供了这些值
  const baseUrl = userService.getApiBaseUrl();
  const rateLimitMs = userService.getRateLimit();

  return new ApiClient(http, baseUrl, rateLimitMs);
};

// 提供者配置
export const apiClientProvider = {
  provide: ApiClient,
  useFactory: apiClientFactory,
};

// 在组件中使用
@Component({
  selector: 'app-dashboard',
  providers: [apiClientProvider],
})
export class Dashboard {
  private apiClient = inject(ApiClient);
}
```

#### useExisting {#useexisting}

`useExisting` 为一个已经定义的提供者创建别名。两个令牌返回的是同一个实例：

```ts
providers: [
  NewLogger, // 实际的服务
  {provide: OldLogger, useExisting: NewLogger}, // 别名
];
```

::: warning 重要
不要混淆 `useExisting` 和 `useClass`。`useClass` 会创建各自独立的实例，而 `useExisting` 能确保你拿到的是同一个单例实例。

:::

### 多个提供者 {#multiple-providers}

当多个提供者要为同一个令牌提供值时，使用 `multi: true` 标志：

```ts
export const INTERCEPTOR_TOKEN = new InjectionToken<Interceptor[]>('interceptors');

providers: [
  {provide: INTERCEPTOR_TOKEN, useClass: AuthInterceptor, multi: true},
  {provide: INTERCEPTOR_TOKEN, useClass: LoggingInterceptor, multi: true},
  {provide: INTERCEPTOR_TOKEN, useClass: RetryInterceptor, multi: true},
];
```

当你注入 `INTERCEPTOR_TOKEN` 时，会得到一个包含这三个拦截器实例的数组。

## 可以在哪里指定提供者？ {#where-can-you-specify-providers}

Angular 提供了几个可以注册提供者的层级，每个层级对作用域、生命周期和性能都有不同的影响：

- [**应用启动**](#application-bootstrap) - 随处可用的全局单例
- [**在元素上（组件或指令）**](#component-or-directive-providers) - 用于特定组件树的隔离实例
- [**路由**](#route-providers) - 用于延迟加载模块的特性专属服务

### 应用启动 {#application-bootstrap}

在以下情况下，在 `bootstrapApplication` 中使用应用级提供者：

- **服务在多个特性区域中使用** - 比如 HTTP 客户端、日志或身份验证这类应用中很多部分都需要的服务
- **你需要一个真正的单例** - 整个应用共享同一个实例
- **服务没有组件专属的配置** - 在任何地方行为都一样的通用工具
- **你要提供全局配置** - API 端点、特性开关或环境设置

```ts [main.ts]
bootstrapApplication(App, {
  providers: [
    {provide: API_BASE_URL, useValue: 'https://api.example.com'},
    {provide: INTERCEPTOR_TOKEN, useClass: AuthInterceptor, multi: true},
    LoggingService, // 在整个应用中使用
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
  ],
});
```

**优点：**

- 单一实例可减少内存占用
- 无需额外设置即可随处使用
- 更容易管理全局状态

**缺点：**

- 总是会被包含在 JavaScript 包（Bundle）中，即使这个值从未被注入
- 难以针对各个特性进行定制
- 更难单独测试各个组件

#### 为什么要在启动时提供，而不是使用 `providedIn: 'root'`？ {#why-provide-during-bootstrap-instead-of-using-providedin-root}

在以下情况下，你可能需要在启动时提供：

- 提供者有副作用（例如安装客户端路由器）
- 提供者需要配置（例如路由）
- 你在使用 Angular 的 `provideSomething` 模式（例如 `provideRouter`、`provideHttpClient`）

### 组件或指令提供者 {#component-or-directive-providers}

在以下情况下，使用组件或指令提供者：

- **服务带有组件专属的状态** - 表单验证器、组件专属的缓存或 UI 状态管理器
- **你需要隔离的实例** - 每个组件都需要自己的一份服务
- **服务只被一棵组件树使用** - 不需要全局访问的专用服务
- **你在创建可复用的组件** - 应当借助各自的服务独立工作的组件

```ts
// 拥有自己验证服务的专用表单组件
@Component({
  selector: 'app-advanced-form',
  providers: [
    FormValidationService, // 每个表单都有自己的验证器
    {provide: FORM_CONFIG, useValue: {strictMode: true}},
  ],
})
export class AdvancedForm {}

// 自行隔离管理状态的模态框组件
@Component({
  selector: 'app-modal',
  providers: [
    ModalStateService, // 每个模态框管理自己的状态
  ],
})
export class Modal {}
```

**优点：**

- 更好的封装与隔离
- 更容易单独测试组件
- 多个实例可以使用不同配置并存

**缺点：**

- 每个组件都会创建新实例（内存占用更高）
- 组件之间没有共享状态
- 必须在每个需要的地方提供
- 总是和组件或指令包含在同一个 JavaScript 包中，即使这个值从未被注入

::: info 注意
如果同一个元素上的多个指令提供了同一个令牌，其中一个会胜出，但具体是哪一个是未定义的。

:::

### 路由提供者 {#route-providers}

在以下场景使用路由级提供者：

- **特性专属的服务** - 只有特定路由或特性模块才需要的服务
- **延迟加载（Lazy Loading）模块的依赖** - 只应随特定特性一起加载的服务
- **路由专属的配置** - 随应用区域而变化的设置

```ts [routes.ts]
export const routes: Routes = [
  {
    path: 'admin',
    providers: [
      AdminService, // 只随 admin 路由一起加载
      {provide: FEATURE_FLAGS, useValue: {adminMode: true}},
    ],
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: 'shop',
    providers: [
      ShoppingCartService, // 隔离的购物状态
      PaymentService,
    ],
    loadChildren: () => import('./shop/shop.routes'),
  },
];
```

在路由级别提供的服务，可供该路由内的所有组件和指令使用，也可供它的守卫和解析器使用。

由于这些服务的实例化独立于路由的组件，它们无法直接访问路由专属的信息。

## 库作者模式 {#library-author-patterns}

在创建 Angular 库时，你常常需要在保持 API 简洁的同时，为使用者提供灵活的配置选项。Angular 自己的库展示了实现这一点的强大模式。

### `provide` 模式 {#the-provide-pattern}

库作者可以导出返回提供者配置的函数，而不必要求用户手动配置复杂的提供者：

```ts [/libs/analytics/src/providers.ts]
import {InjectionToken, Provider, inject} from '@angular/core';

// 配置接口
export interface AnalyticsConfig {
  trackingId: string;
  enableDebugMode?: boolean;
  anonymizeIp?: boolean;
}

// 用于配置的内部令牌
const ANALYTICS_CONFIG = new InjectionToken<AnalyticsConfig>('analytics.config');

// 使用该配置的主服务
export class AnalyticsService {
  private config = inject(ANALYTICS_CONFIG);

  track(event: string, properties?: any) {
    // 使用配置的具体实现
  }
}

// 供使用者调用的提供者函数
export function provideAnalytics(config: AnalyticsConfig): Provider[] {
  return [{provide: ANALYTICS_CONFIG, useValue: config}, AnalyticsService];
}
```

```ts [main.ts]
// 在使用者的应用中使用
bootstrapApplication(App, {
  providers: [
    provideAnalytics({
      trackingId: 'GA-12345',
      enableDebugMode: !environment.production,
    }),
  ],
});
```

### 带选项的高级提供者模式 {#advanced-provider-patterns-with-options}

对于更复杂的场景，你可以组合多种配置方式：

```ts [/libs/http-client/src/provider.ts]
import {Provider, InjectionToken, inject} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

// 可选功能的特性标志
export enum HttpFeatures {
  Interceptors = 'interceptors',
  Caching = 'caching',
  Retry = 'retry',
}

// 配置接口
export interface HttpConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
}

// 内部令牌
const HTTP_CONFIG = new InjectionToken<HttpConfig>('http.config');
const RETRY_CONFIG = new InjectionToken<RetryConfig>('retry.config');
const HTTP_FEATURES = new InjectionToken<Set<HttpFeatures>>('http.features');

// 核心服务
class HttpClientService {
  private config = inject(HTTP_CONFIG, {optional: true});
  private features = inject(HTTP_FEATURES);

  get(url: string) {
    // 使用配置并检查特性
  }
}

// 特性服务
class RetryInterceptor {
  private config = inject(RETRY_CONFIG);
  // 重试逻辑
}

class CacheInterceptor {
  // 缓存逻辑
}

// 主提供者函数
export function provideHttpClient(config?: HttpConfig, ...features: HttpFeature[]): Provider[] {
  const providers: Provider[] = [
    {provide: HTTP_CONFIG, useValue: config || {}},
    {provide: HTTP_FEATURES, useValue: new Set(features.map((f) => f.kind))},
    HttpClientService,
  ];

  // 添加特性专属的提供者
  features.forEach((feature) => {
    providers.push(...feature.providers);
  });

  return providers;
}

// 特性配置函数
export interface HttpFeature {
  kind: HttpFeatures;
  providers: Provider[];
}

export function withInterceptors(...interceptors: any[]): HttpFeature {
  return {
    kind: HttpFeatures.Interceptors,
    providers: interceptors.map((interceptor) => ({
      provide: INTERCEPTOR_TOKEN,
      useClass: interceptor,
      multi: true,
    })),
  };
}

export function withCaching(): HttpFeature {
  return {
    kind: HttpFeatures.Caching,
    providers: [CacheInterceptor],
  };
}

export function withRetry(config: RetryConfig): HttpFeature {
  return {
    kind: HttpFeatures.Retry,
    providers: [{provide: RETRY_CONFIG, useValue: config}, RetryInterceptor],
  };
}

// 使用者组合多个特性的用法
bootstrapApplication(App, {
  providers: [
    provideHttpClient(
      {baseUrl: 'https://api.example.com'},
      withInterceptors(AuthInterceptor, LoggingInterceptor),
      withCaching(),
      withRetry({maxAttempts: 3, delayMs: 1000}),
    ),
  ],
});
```

### 为什么使用提供者函数，而不是直接配置？ {#why-use-provider-functions-instead-of-direct-configuration}

提供者函数为库作者带来了以下几个优势：

1. **封装** - 内部令牌和实现细节保持私有
2. **类型安全** - TypeScript 在编译期确保配置正确
3. **灵活性** - 借助 `with*` 模式轻松组合特性
4. **面向未来** - 内部实现可以改变，而不会破坏使用者的代码
5. **一致性** - 与 Angular 自身的模式（`provideRouter`、`provideHttpClient` 等）保持一致

这种模式在 Angular 自己的库中被广泛使用，对于需要提供可配置服务的库作者来说，被视为最佳实践。
