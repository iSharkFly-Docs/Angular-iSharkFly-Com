# 使用原理图生成代码 {#generating-code-using-schematics}

原理图（Schematic）是一种基于模板、支持复杂逻辑的代码生成器。
它是一组指令，通过生成或修改代码来转换软件项目。
原理图会被打包成集合（collection），并通过 npm 安装。

原理图集合可以成为创建、修改和维护任何软件项目的强大工具，尤其适合按照你所在组织的特定需求来定制 Angular 项目。
例如，你可以使用原理图，基于预定义的模板或布局，生成常用的 UI 模式或特定的组件（Component）。
你还可以用原理图来强制执行架构规则和约定，让你的项目保持一致并且可以互相协作。

## Angular CLI 的原理图 {#schematics-for-the-angular-cli}

原理图是 Angular 生态系统的一部分。
Angular CLI 使用原理图对 Web 应用项目进行转换。
你可以修改这些原理图，也可以定义新的原理图来完成各种工作，例如更新代码以修复某个依赖中的破坏性变更，或者为现有项目添加新的配置选项或框架。

`@schematics/angular` 集合中包含的原理图，默认会由 `ng generate` 和 `ng add` 命令运行。
该包中包含一些具名原理图，它们负责配置 CLI 中 `ng generate` 子命令（如 `ng generate component` 和 `ng generate service`）可用的选项。
`ng generate` 的子命令就是对应原理图的简写。
要使用完整形式来指定并生成某个原理图或原理图集合：

```shell

ng generate my-schematic-collection:my-schematic-name

```

### 配置 CLI 原理图 {#configuring-cli-schematics}

与原理图关联的 JSON Schema 会告诉 Angular CLI，命令和子命令有哪些可用选项，并决定这些选项的默认值。
你可以在命令行中为选项提供不同的值来覆盖这些默认值。
关于如何修改工作区中生成选项的默认值，请参阅 [工作区配置](/reference/configs/workspace-config)。

CLI 用于生成项目及项目各部分的默认原理图，其 JSON Schema 都收集在 [`@schematics/angular`](https://github.com/angular/angular-cli/tree/main/packages/schematics/angular) 包中。
这些 Schema 描述了 CLI 中每个 `ng generate` 子命令可用的选项，就像 `--help` 输出中显示的那样。

### 自动格式化 {#automatic-formatting}

如果你的工作区中安装了 [Prettier](https://prettier.io/) 或 [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)，Angular CLI 会自动格式化由原理图和 `ng update` 迁移创建或修改的所有文件。
CLI 只会格式化受影响的文件，其他文件保持不变。

## 为库开发原理图 {#developing-schematics-for-libraries}

作为库的开发者，你可以创建自己的自定义原理图集合，把你的库与 Angular CLI 集成起来。

- _add 原理图_ 让开发者可以使用 `ng add` 在 Angular 工作区中安装你的库
- _生成原理图_ 可以告诉 `ng generate` 子命令如何修改项目、添加配置和脚本，以及为库中定义的各种构件搭建脚手架
- _update 原理图_ 可以告诉 `ng update` 命令，在你发布新版本时如何更新库的依赖，并针对破坏性变更进行调整

关于这些原理图的具体形式以及如何创建它们，请参阅：

- [编写原理图](/tools/cli/schematics-authoring)
- [库的原理图](/tools/cli/schematics-for-libraries)


### add 原理图 {#add-schematics}

_add 原理图_ 通常随库一起提供，这样就可以用 `ng add` 把库添加到现有项目中。
`add` 命令会使用你的包管理器下载新的依赖，并调用一个以原理图形式实现的安装脚本。

例如，[`@angular/material`](https://material.angular.dev/guide/schematics) 原理图会告诉 `add` 命令安装并设置 Angular Material 和主题，并注册一些可以用 `ng generate` 创建的新起步组件。
你可以把它作为编写自己的 add 原理图时的示例和范本。

合作伙伴和第三方库也通过 add 原理图来支持 Angular CLI。
例如，`@ng-bootstrap/schematics` 会把 [ng-bootstrap](https://ng-bootstrap.github.io) 添加到应用中，而 `@clr/angular` 会安装并设置 [VMWare 的 Clarity](https://clarity.design/documentation/get-started)。

_add 原理图_ 还可以通过配置变更来更新项目、添加额外的依赖（例如 polyfill），或者为特定包搭建初始化代码。
例如，`@angular/pwa` 原理图会添加应用清单（manifest）和 Service Worker，把你的应用变成一个 PWA。

### 生成原理图 {#generation-schematics}

生成原理图是供 `ng generate` 命令使用的指令。
文档中列出的子命令使用的是 Angular 默认的生成原理图，但你也可以指定一个不同的原理图（代替子命令）来生成库中定义的构件。

例如，Angular Material 为它定义的 UI 组件提供了生成原理图。
下面的命令使用其中一个原理图来渲染一个 Angular Material `<mat-table>`，它预先配置好了支持排序和分页的数据源。

```shell

ng generate @angular/material:table <component-name>

```

### update 原理图 {#update-schematics}

`ng update` 命令可以用来更新工作区中的库依赖。
如果你不提供任何选项，或者使用了 help 选项，该命令会检查你的工作区并建议需要更新的库。

```shell

ng update
We analyzed your package.json, there are some packages to update:

    Name                                      Version                     Command to update
    --------------------------------------------------------------------------------
    @angular/cdk                       7.2.2 -> 7.3.1           ng update @angular/cdk
    @angular/cli                       7.2.3 -> 7.3.0           ng update @angular/cli
    @angular/core                      7.2.2 -> 7.2.3           ng update @angular/core
    @angular/material                  7.2.2 -> 7.3.1           ng update @angular/material
    rxjs                                      6.3.3 -> 6.4.0           ng update rxjs

```

如果你向该命令传入一组要更新的库，它会更新这些库、它们的对等依赖（peer dependency），以及依赖于它们的对等依赖。

::: tip 提示
如果存在不一致的情况（例如，对等依赖无法用简单的 [semver](https://semver.org) 范围来匹配），该命令会报错，并且不会对工作区做任何修改。

:::

我们建议你不要默认强制更新所有依赖。
请先尝试更新特定的依赖。

关于 `ng update` 命令工作原理的更多信息，请参阅 [Update 命令](https://github.com/angular/angular-cli/blob/main/docs/specifications/update.md)。

如果你为库创建了一个可能带来破坏性变更的新版本，可以提供一个 _update 原理图_，让 `ng update` 命令在被更新的项目中自动处理这些变更。

例如，假设你要更新 Angular Material 库。

```shell
ng update @angular/material
```

该命令会同时更新工作区 `package.json` 中的 `@angular/material` 及其依赖 `@angular/cdk`。
如果其中任何一个包包含覆盖从现有版本迁移到新版本的 update 原理图，该命令就会在你的工作区中运行该原理图。
