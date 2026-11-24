# 迁移

了解如何把现有的 Angular 项目逐步迁移到最新特性。

- [**独立组件**](/reference/migrations/standalone)：独立组件（Standalone Component）提供了一种更简化的 Angular 应用构建方式。独立组件直接声明自己的依赖，而不是通过 NgModule 获取。
- [**控制流语法**](/reference/migrations/control-flow)：内置的控制流（Control Flow）语法让你可以使用更符合人体工程学、更接近 JavaScript 且类型检查更好的语法。使用它后，就不再需要为了使用 `*ngFor`、`*ngIf` 和 `*ngSwitch` 等功能而导入 `CommonModule`。
- [**inject() 函数**](/reference/migrations/inject-function)：与基于构造函数的注入相比，Angular 的 [`inject`](https://angular.dev/api/core/inject) 函数提供了更准确的类型，并且与标准装饰器的兼容性更好。
- [**延迟加载路由**](/reference/migrations/route-lazy-loading)：把立即加载的组件路由转换为延迟加载（Lazy Loading）路由。这样构建过程就可以把生产环境的包（bundle）拆分成更小的块，从而在首屏加载时加载更少的 JavaScript。
- [**新的 `input()` API**](/reference/migrations/signal-inputs)：把现有的 `@Input` 字段转换为新的信号输入 API，该 API 现已可用于生产环境。
- [**新的 `output()` 函数**](/reference/migrations/outputs)：把现有的 `@Output` 自定义事件转换为新的 output 函数，该函数现已可用于生产环境。
- [**信号形式的查询**](/reference/migrations/signal-queries)：把现有的装饰器查询字段转换为改进后的信号查询 API。该 API 现已可用于生产环境。
- [**清理未使用的导入**](/reference/migrations/cleanup-unused-imports)：清理项目中未使用的导入。
- [**自闭合标签**](/reference/migrations/self-closing-tags)：在可能的情况下，把组件模板转换为使用自闭合标签。
- [**从 NgClass 到 class 绑定**](/reference/migrations/ngclass-to-class)：在可能的情况下，把组件模板转换为优先使用 class 绑定而不是 `NgClass` 指令。
- [**从 NgStyle 到 style 绑定**](/reference/migrations/ngstyle-to-style)：在可能的情况下，把组件模板转换为优先使用 style 绑定而不是 `NgStyle` 指令。
- [**RouterTestingModule 迁移**](/reference/migrations/router-testing-module-migration)：在 TestBed 配置中把 `RouterTestingModule` 的用法转换为 `RouterModule`，并在适当时添加 `provideLocationMocks()`。
- [**从 CommonModule 到独立导入**](/reference/migrations/common-to-standalone)：在可能的情况下，把对 `CommonModule` 的导入替换为模板中实际使用的各个指令和管道的导入。
- [**从 Injectable 到 Service**](/reference/migrations/injectable-to-service)：把符合条件的 `@Injectable` 类转换为使用 `@Service` 装饰器。
