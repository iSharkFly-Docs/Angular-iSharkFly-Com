# 搭建本地环境和工作区

本指南介绍如何使用 [Angular CLI](/cli 'CLI command reference') 搭建 Angular 开发环境。
内容包括安装 CLI、创建初始工作区和入门应用，以及在本地运行该应用以验证环境是否搭建成功。

::: tip 无需本地环境即可试用 Angular
如果你刚接触 Angular，可以先从[立即试用！](/tutorials/learn-angular)开始，它会在浏览器中向你介绍 Angular 的基础知识。
这个独立教程利用了交互式的 [StackBlitz](https://stackblitz.com) 在线开发环境。
在你准备好之前，无需搭建本地环境。
:::

## 开始之前

要使用 Angular CLI，你应该熟悉以下内容：

- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)


你还应该熟悉命令行界面（CLI）工具的用法，并对命令行 shell 有基本了解。
了解 [TypeScript](https://www.typescriptlang.org) 会有所帮助，但不是必需的。

## 依赖项

要在本地系统上安装 Angular CLI，你需要先安装 [Node.js](https://nodejs.org/)。
Angular CLI 使用 Node 及其配套的包管理器 npm，在浏览器之外安装和运行 JavaScript 工具。

[下载并安装 Node.js](https://nodejs.org/en/download)，其中也会包含 `npm` CLI。
Angular 需要 Node.js 的[活跃 LTS 或维护 LTS](https://nodejs.org/en/about/previous-releases) 版本。
更多信息请参阅 [Angular 版本兼容性](/reference/versions)指南。

## 安装 Angular CLI

要安装 Angular CLI，请打开终端窗口并运行以下命令：

::: code-group

```shell [npm]
npm install -g @angular/cli
```

```shell [pnpm]
pnpm install -g @angular/cli
```

```shell [yarn]
yarn global add @angular/cli
```

```shell [bun]
bun install -g @angular/cli
```

:::

### Powershell 执行策略

在 Windows 客户端计算机上，PowerShell 脚本的执行默认是禁用的，因此上述命令可能会报错失败。
要允许执行 PowerShell 脚本（npm 全局二进制文件需要这样做），你必须设置以下<a href="https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_execution_policies" target="_blank">执行策略</a>：

```sh

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

```

请仔细阅读命令执行后显示的消息，并按照说明操作。确保你了解设置执行策略的影响。

### Unix 权限

在某些类 Unix 系统中，全局脚本可能归 root 用户所有，因此上述命令可能会因权限错误而失败。
请使用 `sudo` 以 root 用户身份执行该命令，并在提示时输入密码：

::: code-group

```shell [npm]
sudo npm install -g @angular/cli
```

```shell [pnpm]
sudo pnpm install -g @angular/cli
```

```shell [yarn]
sudo yarn global add @angular/cli
```

```shell [bun]
sudo bun install -g @angular/cli
```

:::

确保你了解以 root 身份运行命令的影响。

## 创建工作区和初始应用

你是在 Angular **工作区**的上下文中开发应用的。

要创建新的工作区和初始入门应用，请运行 CLI 命令 `ng new` 并提供名称 `my-app`（如下所示），然后回答有关要包含哪些特性的提示：

```shell

ng new my-app

```

Angular CLI 会安装必要的 Angular npm 包和其他依赖项。
这可能需要几分钟时间。

CLI 会在与工作区同名的新目录中创建一个新的工作区和一个小型欢迎应用，可以直接运行。
进入这个新目录，以便后续命令都在该工作区中执行。

```shell

cd my-app

```

## 运行应用

Angular CLI 内置了一个开发服务器，供你在本地构建和启动应用。运行以下命令：

```shell

ng serve --open

```

`ng serve` 命令会启动服务器并监视你的文件，当你修改这些文件时，它会重新构建应用并重新加载浏览器。

`--open`（或简写为 `-o`）选项会自动打开浏览器访问 `http://localhost:4200/`，以查看生成的应用。

## 工作区和项目文件

[`ng new`](https://angular.dev/cli/new) 命令会创建一个 [Angular 工作区](/reference/configs/workspace-config)文件夹，并在其中生成一个新应用。
一个工作区可以包含多个应用和库。
由 [`ng new`](https://angular.dev/cli/new) 命令创建的初始应用位于工作区的根目录下。
当你在现有工作区中生成额外的应用或库时，它们默认会放在 `projects/` 子文件夹中。

新生成的应用包含根组件（Component）及其模板（Template）的源文件。
每个应用都有一个 `src` 文件夹，其中包含它的组件、数据和静态资源。

你可以直接编辑生成的文件，也可以使用 CLI 命令添加和修改文件。
使用 [`ng generate`](https://angular.dev/cli/generate) 命令可以为额外的组件、指令（Directive）、管道（Pipe）、服务（Service）等添加新文件。
[`ng add`](https://angular.dev/cli/add) 和 [`ng generate`](https://angular.dev/cli/generate) 等用于创建或操作应用和库的命令，必须在工作区内执行。
相比之下，`ng new` 等命令必须在工作区 _之外_ 执行，因为它们会创建一个新的工作区。

## 后续步骤

- 进一步了解生成的工作区的[文件结构](/reference/configs/file-structure)和[配置](/reference/configs/workspace-config)。

- 使用 [`ng test`](https://angular.dev/cli/test) 测试你的新应用。

- 使用 [`ng generate`](https://angular.dev/cli/generate) 生成组件、指令和管道等样板代码。

- 使用 [`ng deploy`](https://angular.dev/cli/deploy) 部署你的新应用，让真实用户可以访问。

- 使用 [`ng e2e`](https://angular.dev/cli/e2e) 为你的应用设置并运行端到端测试。
