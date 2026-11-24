# 自定义构建流水线 {#custom-build-pipeline}

在构建 Angular 应用时，我们强烈建议你使用 Angular CLI，以便利用它基于项目结构的更新功能以及对构建系统的抽象。这样，你的项目就能受益于最新的安全、性能和 API 改进，以及透明的构建改进。

本页探讨在 **少数情况下** 需要不使用 Angular CLI 的自定义构建流水线时的用法。下面列出的所有工具都是由 Angular 社区成员维护的开源构建插件。要了解它们的支持模式和维护状态，请查看它们的文档和 GitHub 仓库地址。

## 什么时候应该使用自定义构建流水线？ {#when-should-you-use-a-custom-build-pipeline}

在一些小众场景下，你可能希望维护一个自定义构建流水线。例如：

- 你已有一个使用其他工具链的应用，并希望在其中加入 Angular
- 你与 [模块联邦（module federation）](https://module-federation.io/) 强耦合，无法采用与打包工具无关的 [原生联邦（native federation）](https://www.npmjs.com/package/@angular-architects/native-federation)
- 你希望使用自己喜欢的构建工具做一个短期实验

## 有哪些选择？ {#what-are-the-options}

目前，有两个支持良好的社区工具可以让你创建自定义构建流水线：[Vite 插件](https://www.npmjs.com/package/@analogjs/vite-plugin-angular) 和 [Rspack 插件](https://www.npmjs.com/package/@nx/angular-rspack)。它们都使用了支撑 Angular CLI 的底层抽象。它们让你可以创建灵活的构建流水线，但需要手动维护，并且没有自动更新体验。

### Rspack {#rspack}

Rspack 是一个基于 Rust 的打包工具，旨在提供与 webpack 插件生态系统的兼容性。

如果你的项目与 webpack 生态系统紧密耦合，严重依赖自定义的 webpack 配置，那么可以借助 Rspack 缩短构建时间。

你可以在该项目的 [文档网站](https://nx.dev/recipes/angular/rspack/introduction) 上了解更多关于 Angular Rspack 的信息。

### Vite {#vite}

Vite 是一个前端构建工具，旨在为现代 Web 项目提供更快、更精简的开发体验。Vite 还可以通过其插件系统进行扩展，让各个生态系统构建与 Vite 的集成，例如用于单元测试和浏览器测试的 Vitest、用于独立编写组件的 Storybook 等。Angular CLI 也使用 Vite 作为其开发服务器。

[面向 Angular 的 AnalogJS Vite 插件](https://www.npmjs.com/package/@analogjs/vite-plugin-angular) 让你可以在使用 Vite 或基于 Vite 构建的项目或框架中采用 Angular。这既可以是直接使用 Vite 开发和构建 Angular 项目，也可以是把 Angular 添加到现有的项目或流水线中。一个例子是使用 [Astro 和 Starlight](https://analogjs.org/docs/packages/astro-angular/overview) 将 Angular UI 组件集成到文档网站中。

你可以通过 AnalogJS 的 [文档页面](https://analogjs.org/docs/packages/vite-plugin-angular/overview) 进一步了解 AnalogJS 以及如何使用该插件。
