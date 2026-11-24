# WebMCP {#webmcp}

WebMCP 是一项 [提议中的 Web 标准](https://github.com/webmachinelearning/webmcp/)，它允许 Web 应用直接向浏览器中原生运行的 AI 智能体（Agent）公开结构化的工具（Tool）。由应用定义的工具让 AI 助手可以直接与应用交互，既为智能体提供了额外的能力，也减少了对 DOM 交互的依赖。

例如，一个用于注册新用户的应用可以提供一个 WebMCP 工具，让浏览器的 AI 智能体直接创建用户，而不必通过 DOM 交互走完一套复杂的向导式 UI。

Angular 为 WebMCP 提供了实验性支持，让你可以轻松注册与应用依赖注入（Dependency Injection）生命周期绑定的工具，并自动把信号表单（Signal Forms）转换成可供 AI 使用的工具。

::: warning 重要
WebMCP 规范还处于非常早期的阶段，变化频繁。因此，Angular 对 WebMCP 的支持目前处于 [**实验阶段**](/reference/releases#experimental)。即使不是主版本更新，API 也可能发生变化。

:::

## 为应用提供工具 {#provide-tools-for-the-application}

在应用配置中使用 [`provideExperimentalWebMcpTools`](https://angular.dev/api/core/provideExperimentalWebMcpTools)，可以注册在应用整个生命周期内有效的工具。以这种方式提供的工具会在应用初始化时自动注册，并在应用销毁时自动注销。

`execute` 回调会在所关联 `Injector` 的注入上下文中调用，这意味着你可以直接 [`inject`](https://angular.dev/api/core/inject) 服务。

```ts [main.ts]
import {Service, inject, provideExperimentalWebMcpTools} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppRoot} from './app-root';

@Service()
class Greeter {
  sayHello(): string {
    return 'Hello agent!';
  }
}

bootstrapApplication(AppRoot, {
  providers: [
    provideExperimentalWebMcpTools([
      {
        name: 'greet',
        description: 'Greets the agent.',
        execute: () => {
          const greeter = inject(Greeter);

          return {content: [{type: 'text', text: greeter.sayHello()}]};
        },
      },
    ]),
  ],
});
```

### 定义工具参数 {#define-tool-parameters}

当某个工具需要 AI 助手提供输入时，请使用 [JSON Schema](https://json-schema.org/) 语法在 `inputSchema` 中定义预期的参数。Angular 会根据 schema 定义，自动推断传入 `execute` 回调的参数类型。

```ts [main.ts]
import {provideExperimentalWebMcpTools} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppRoot} from './app-root';

const allProducts: string[] = [/* ... */];

bootstrapApplication(AppRoot, {
  providers: [
    provideExperimentalWebMcpTools([
      {
        name: 'searchCatalog',
        description: 'Searches the store catalog for products matching a query.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search keywords.',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return.',
            },
          },
          required: ['query'],
          additionalProperties: false,
        },
        outputSchema: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {type: 'string'},
              description: 'List of matching product names.',
            },
          },
          required: ['results'],
          additionalProperties: false,
        },
        execute: ({query, maxResults}) => {
          // `query` 的类型被推断为 `string`。
          // `maxResults` 的类型被推断为 `number | undefined`。

          // 建议在运行时验证这些值，因为输入不一定会按照 schema 进行验证。
          if (typeof query !== 'string') throw new Error(`Bad query: ${query}`);
          if (typeof maxResults !== 'number' && maxResults !== undefined)
            throw new Error(`Bad maxResults: ${maxResults}`);

          const limit = maxResults ?? 5;
          const matchingProducts = allProducts
            .filter((product) => product.includes(query))
            .slice(0, limit);

          return {results: matchingProducts};
        },
      },
    ]),
  ],
});
```

::: tip 提示
使用 `required: ['param1', 'param2', ...]` 可以从这些参数的类型中去掉 `undefined`；使用 `additionalProperties: false` 可以把参数对象的类型限制为只包含这些参数。

:::

## 为路由提供工具 {#provide-tools-for-a-route}

在构建复杂应用时，你可能希望某些工具只在用户浏览特定路由时才可用。为此，你可以直接在路由定义中提供工具。

```ts [routes.ts]
import {provideExperimentalWebMcpTools} from '@angular/core';
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard').then((m) => m.Dashboard),
    providers: [
      provideExperimentalWebMcpTools([
        {
          name: 'exportDashboardReports',
          description: 'Exports the current dashboard analytics.',
          execute: () => ({
            content: [{type: 'text', text: 'Dashboard export successfully triggered.'}],
          }),
        },
      ]),
    ],
  },
];
```

::: info 注意
把工具注册到特定路由时，建议把路由器配置为使用 [`withAutoCleanupInjectors`](https://angular.dev/api/router/withAutoCleanupInjectors)，以确保用户离开该路由时工具会被自动 _注销_。如果不使用这个选项，即使用户已经导航到其他路由，在路由上声明的 WebMCP 工具仍会继续对 AI 智能体可用。

:::

```ts [app.config.ts]
import {ApplicationConfig} from '@angular/core';
import {provideRouter, withAutoCleanupInjectors} from '@angular/router';
import {routes} from './routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withAutoCleanupInjectors())],
};
```

## 在服务中提供工具 {#provide-tools-within-services}

对于动态的使用场景，[`declareExperimentalWebMcpTool`](https://angular.dev/api/core/declareExperimentalWebMcpTool) 函数会直接在某个注入上下文中注册工具，并在该上下文销毁时自动注销它。

```ts [counter.ts]
import {Service, declareExperimentalWebMcpTool, signal, inject} from '@angular/core';

@Service()
export class Counter {
  readonly count = signal(0);

  constructor() {
    declareExperimentalWebMcpTool({
      name: 'getCounter',
      description: 'Reads the global counter.',
      execute: () => ({
        content: [{type: 'text', text: `The count is: ${this.count()}.`}],
      }),
    });
  }
}
```

虽然 `declareExperimentalWebMcpTool` 可以在任何注入上下文中使用，但要注意 [名称冲突](#name-collisions)，并优先在根服务中使用它。

## 信号表单中的隐式工具 {#implicit-tools-in-signal-forms}

只需极少的配置，你就可以从现有的 Angular [信号表单](/essentials/signal-forms) 隐式创建 WebMCP 工具。Angular 会把你的表单模型转换成功能丰富的 WebMCP 工具，从而有效支持高度动态的表单，而无需你手动编写 JSON schema 或事件处理器。

### 启用 WebMCP 表单特性 {#enable-the-webmcp-forms-feature}

首先，把 [`provideExperimentalWebMcpForms`](https://angular.dev/api/forms/signals/provideExperimentalWebMcpForms) 添加到根应用的提供者中：

```ts [main.ts]
import {bootstrapApplication} from '@angular/platform-browser';
import {provideExperimentalWebMcpForms} from '@angular/forms/signals';
import {AppRoot} from './app-root';

bootstrapApplication(AppRoot, {
  providers: [provideExperimentalWebMcpForms()],
});
```

### 让信号表单选择启用 {#opt-in-a-signal-form}

其次，在使用 [`form`](https://angular.dev/api/forms/signals/form) 定义信号表单时，传入 `experimentalWebMcpTool` 配置选项，即可选择启用隐式 WebMCP 工具。Angular 会检查表单的数据模型，并自动为已连接的 AI 智能体生成 JSON schema。

```ts [user-registration.ts]
import {Component, signal} from '@angular/core';
import {form, required, minLength} from '@angular/forms/signals';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.html',
})
export class UserRegistration {
  private readonly model = signal({
    firstName: '',
    lastName: '',
    age: 0,
    hobbies: ['Web Development'],
  });

  readonly userForm = form(
    this.model,
    (f) => {
      required(f.firstName, {message: 'First name is mandatory.'});
      required(f.lastName, {message: 'Last name is mandatory.'});
    },
    {
      // 隐式注册一个名为 `registerUser` 的 WebMCP 工具，其参数派生自 `model`。
      experimentalWebMcpTool: {
        name: 'registerUser',
        description: 'Registers a new user.',
      },
      submission: {
        action: async (formValue) => {
          console.log('Submitting user:', formValue().value());
          // ...
        },
      },
    },
  );
}
```

在这个示例中，Angular 会生成一个 WebMCP 工具，其 JSON schema：

1. 包含 `firstName`、`lastName`、`age` 和 `hobbies` 这几个参数，它们是根据 `model` 信号的初始值推断出来的。
2. 根据 [`required`](https://angular.dev/api/forms/signals/required) 验证器，将 `firstName` 和 `lastName` 定义为 _必填_ 字段。
3. 将 `hobbies` 定义为字符串数组，允许智能体提供任意数量的爱好。

除了推断输入 schema 之外，Angular 还会把 WebMCP 工具与表单的验证逻辑和提交处理器连接起来。这意味着智能体能够观察到由其输入触发的任何验证错误，以及提交过程中发生的任何失败，从而进行自我纠正，并可能重试。

::: info 注意
默认情况下，异步验证器不会阻止提交：提交操作会在它们完成之前运行，因此它们的错误不会报告给智能体。请改为在提交操作中处理这些检查。

:::

#### 约束 {#constraints}

Angular 根据表单模型的初始值推断 WebMCP schema。这要求：

- 具体的初始值（`''`、`0`、`false`）：Angular 无法从 `null` 或 `undefined` 推断数据类型。
- 非空数组（`['Hello!']`）：Angular 无法从空数组推断数据类型，至少需要一个初始值。

## 最佳实践 {#best-practices}

请牢记以下最佳实践：

### 名称冲突 {#name-collisions}

WebMCP 要求每个工具都有唯一的名称，如果同一个工具名称被多次注册，就会抛出错误。这意味着，在可能被多次注册的上下文中（例如组件构造函数中）调用 `declareExperimentalWebMcpTool` 或 `provideExperimentalWebMcpTools`，可能会在运行时导致错误。

尽可能把工具放在应用提供者、路由提供者或根服务中。如果要把工具放在组件上（包括 [信号表单中的隐式工具](#implicit-tools-in-signal-forms)），请确保该组件在任意时刻最多只在页面上渲染 _一次_。

### 验证工具输入 {#validate-tool-inputs}

Angular 不会对智能体提供的输入是否真正符合所定义的 JSON schema 进行任何隐式验证。为确保可靠性，建议在使用 `execute` 函数的参数之前对其进行显式验证。

### 定义显式的输出 schema {#define-explicit-output-schemas}

为了让 AI 智能体执行工具的结果尽可能可预测，请显式定义 `outputSchema`，并确保 `execute` 函数返回的对象严格符合它。Angular 不会自动验证返回的内容是否符合所定义的 `outputSchema`。请确保你的数据符合 `outputSchema`，或者考虑在运行时进行验证，以免向智能体提供不一致的信息而造成混淆。

### 测试 {#testing}

建议使用 [`@mcp-b/webmcp-polyfill`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill) 这类模拟的 WebMCP 实现，来有效地对你的工具进行单元测试。
