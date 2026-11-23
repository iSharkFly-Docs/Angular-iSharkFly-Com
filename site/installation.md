# 安装 {#installation}




通过在线入门项目快速上手 Angular，或者使用终端在本地开始。

## 在线体验 {#play-online}

如果你只是想在浏览器中试用 Angular，而不想搭建项目，可以使用我们的在线沙盒：

- [**Playground**](https://angular.dev/playground)：体验 Angular 应用最快的方式，无需任何设置。

## 在本地搭建新项目 {#set-up-a-new-project-locally}

如果你要开始一个新项目，那么你很可能需要创建一个本地项目，以便使用 Git 等工具。

### 前提条件 {#prerequisites}

- **Node.js** - [v22.22.3 或更高版本](/reference/versions)
- **文本编辑器** - 我们推荐 [Visual Studio Code](https://code.visualstudio.com/)
- **终端** - 运行 [Angular CLI](/tools/cli) 命令时需要
- **开发工具** - 为了改进你的开发工作流，我们推荐使用 [Angular 语言服务](/tools/language-service)

### 操作步骤 {#instructions}

下面的指南将带你逐步搭建一个本地 Angular 项目。

#### 安装 Angular CLI {#install-angular-cli}

打开终端（如果你使用的是 [Visual Studio Code](https://code.visualstudio.com/)，可以打开[集成终端](https://code.visualstudio.com/docs/editor/integrated-terminal)），然后运行以下命令：

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

如果你在 Windows 或 Unix 上运行此命令时遇到问题，请查看 [CLI 文档](/tools/cli/setup-local#install-the-angular-cli)了解更多信息。

#### 创建新项目 {#create-a-new-project}

在终端中，使用你想要的项目名称运行 CLI 命令 [`ng new`](https://angular.dev/cli/new)。在下面的示例中，我们将使用示例项目名称 `my-first-angular-app`。

```shell
ng new <project-name>
```

接下来会出现一些项目配置选项。使用方向键和回车键来浏览并选择你想要的选项。

如果你没有特别的偏好，直接按回车键采用默认选项，继续完成设置即可。

选择好配置选项、CLI 完成设置后，你应该会看到以下消息：

```text
✔ Packages installed successfully.
    Successfully initialized git.
```

到这里，你就可以在本地运行项目了！

#### 在本地运行新项目 {#running-your-new-project-locally}

在终端中，切换到你的新 Angular 项目目录。

```shell
cd my-first-angular-app
```

此时所有依赖都应该已经安装好了（你可以检查项目中是否存在 `node_modules` 文件夹来确认），因此你可以运行以下命令来启动项目：

```shell
npm start
```

如果一切顺利，你应该会在终端中看到类似的确认消息：

```text
Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4200/
  ➜  press h + enter to show help
```

现在，你可以访问 `Local` 中的路径（例如 `http://localhost:4200`）来查看你的应用。祝你编码愉快！🎉

### 使用 AI 进行开发 {#using-ai-for-development}

要在你喜欢的 AI 驱动的 IDE 中开始构建，请[查看 Angular 提示词规则与最佳实践](/ai/develop-with-ai)。

## 后续步骤 {#next-steps}

现在你已经创建了 Angular 项目，可以在我们的[基础指南](/essentials)中进一步了解 Angular，或者在深入指南中选择一个主题！
