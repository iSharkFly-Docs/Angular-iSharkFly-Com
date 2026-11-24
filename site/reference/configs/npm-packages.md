# 工作区 npm 依赖 {#workspace-npm-dependencies}

Angular 框架、Angular CLI 以及 Angular 应用所使用的组件都打包为 [npm 包](https://docs.npmjs.com/getting-started/what-is-npm 'What is npm?')，并通过 [npm 注册表](https://docs.npmjs.com)分发。

你可以使用 [npm CLI 客户端](https://docs.npmjs.com/cli/install)下载并安装这些 npm 包。
默认情况下，Angular CLI 使用 npm 客户端。

::: tip 提示
关于 `Node.js` 和 `npm` 的版本要求及安装方法，请参阅[本地环境搭建](/tools/cli/setup-local 'Setting up for Local Development')。

:::

如果你的机器上已经有使用其他版本 Node.js 和 npm 的项目，可以考虑使用 [nvm](https://github.com/creationix/nvm) 来管理多个版本的 Node.js 和 npm。

## `package.json` {#package-json}

`npm` 会安装 [`package.json`](https://docs.npmjs.com/files/package.json) 文件中列出的包。

CLI 命令 `ng new` 在创建新工作区（workspace）时会创建一个 `package.json` 文件。
工作区中的所有项目（project）都使用这个 `package.json`，包括 CLI 创建工作区时一并创建的初始应用项目。
使用 `ng generate library` 创建的库会包含自己的 `package.json` 文件。

最初，这个 `package.json` 包含*一组初始包*，其中一些是 Angular 必需的，另一些则用于支持常见的应用场景。
随着应用的发展，你可以继续向 `package.json` 中添加包。

## 默认依赖 {#default-dependencies}

下列 Angular 包会作为依赖项包含在新建 Angular 工作区的默认 `package.json` 文件中。
完整的 Angular 包列表请参阅 [API 参考](/api)。

| 包名 | 详情 |
| :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@angular/common`](/api#angular_common) | 由 Angular 团队提供的常用服务（Service）、管道（Pipe）和指令（Directive）。 |
| `@angular/compiler` | Angular 的模板编译器。它能理解 Angular 模板（Template），并将其转换为让应用运行起来的代码。 |
| `@angular/compiler-cli` | Angular 的编译器，由 Angular CLI 的 `ng build` 和 `ng serve` 命令调用。它在标准的 TypeScript 编译过程中使用 `@angular/compiler` 处理 Angular 模板。 |
| [`@angular/core`](/api#angular_core) | 框架运行时的关键部分，每个应用都需要。包含所有元数据装饰器（如 `@Component`）、依赖注入（Dependency Injection）以及组件生命周期钩子（Lifecycle Hook）。 |
| [`@angular/forms`](/api#angular_forms) | 同时支持[模板驱动表单](/guide/forms)和[响应式表单](/guide/forms/reactive-forms)。请参阅[表单简介](/guide/forms)。 |
| [`@angular/platform-browser`](/api#angular_platform-browser) | 与 DOM 和浏览器相关的一切，尤其是帮助渲染到 DOM 中的部分。 |
| [`@angular/router`](/api#angular_router) | 路由器（Router）模块会在浏览器 URL 变化时在应用的各个页面之间导航。更多信息请参阅[路由与导航](/guide/routing)。 |
| [`@angular/cli`](https://github.com/angular/angular-cli) | 包含用于运行 `ng` 命令的 Angular CLI 可执行文件。 |
| [`@angular/build`](https://www.npmjs.com/package/@angular/build) | 包含默认的 CLI 构建器（builder），用于对 Angular 应用和库进行打包、测试和提供服务。 |
| [`rxjs`](https://www.npmjs.com/package/rxjs) | 一个使用 `Observables` 进行响应式编程的库。 |
| [`typescript`](https://www.npmjs.com/package/typescript) | TypeScript 编译器、语言服务器以及内置类型定义。 |
