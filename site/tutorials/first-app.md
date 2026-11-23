# 构建你的第一个 Angular 应用 {#build-your-first-angular-app}

本教程由一系列课程组成，介绍开始用 Angular 编写代码所需了解的 Angular 概念。

你可以按自己的意愿完成任意数量的课程，也可以按任意顺序学习。

::: tip 提示
更喜欢看视频？我们还为本教程提供了完整的 [YouTube 课程](https://youtube.com/playlist?list=PL1w1q3fL4pmj9k1FrJ3Pe91EPub2_h4jF&si=1q9889ulHp8VZ0e7)！

:::

<iframe src="https://www.youtube.com/embed/xAT0lHYhHMY?si=cKUW_MGn3MesFT7o" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## 开始之前 {#before-you-start}

为了获得最佳的学习体验，请先查看以下要求，确保你已具备顺利完成本教程所需的一切。

### 你的经验 {#your-experience}

本教程中的课程假定你具备以下经验：

1. 通过直接编辑 HTML 来创建 HTML 网页。
1. 使用 JavaScript 编写网站内容。
1. 阅读层叠样式表（CSS）内容，并理解选择器的用法。
1. 使用命令行指令在计算机上执行任务。

### 你的设备 {#your-equipment}

这些课程既可以使用本地安装的 Angular 工具完成，也可以在我们的内嵌编辑器中完成。本地 Angular 开发可以在 Windows、macOS 或 Linux 系统上进行。

::: info 注意
请留意类似这样的提示，它们标出的步骤可能仅适用于你的本地编辑器。

:::

## 你的第一个 Angular 应用概览 {#conceptual-preview-of-your-first-angular-app}

本教程中的课程将创建一个 Angular 应用，它会列出待租房屋，并显示单个房屋的详细信息。
这个应用使用了许多 Angular 应用中常见的特性。

<img alt="Output of homes landing page" src="/assets/images/tutorials/first-app/homes-app-landing-page.png">

## 本地开发环境 {#local-development-environment}

::: info 注意
此步骤仅适用于你的本地环境！

:::

请在你打算用来学习本教程的计算机上，通过命令行工具执行以下步骤。



### 1. 确认 Angular 所需的 `node.js` 版本 {#_1-identify-the-version-of-node-js-that-angular-requires}

Angular 需要 Node 的活跃 LTS 版本或维护期 LTS 版本。我们先来确认你的 `node.js` 版本。关于具体的版本要求，请参阅 [package.json 文件](https://unpkg.com/browse/@angular/core@15.1.5/package.json)中的 engines 属性。

在**终端（Terminal）**窗口中：

1. 运行以下命令：`node --version`
1. 确认显示的版本号满足要求。


### 2. 为 Angular 安装正确版本的 `node.js` {#_2-install-the-correct-version-of-node-js-for-angular}

如果你还没有安装 `node.js`，请按照 [nodejs.org 上的安装说明](https://nodejs.org/en/download/)进行安装。


### 3. 安装最新版本的 Angular {#_3-install-the-latest-version-of-angular}

安装好 `node.js` 和 `npm` 后，下一步是安装 [Angular CLI](/tools/cli)，它提供了高效进行 Angular 开发的工具。

在**终端**窗口中运行以下命令：`npm install -g @angular/cli`。


### 4. 安装集成开发环境（IDE） {#_4-install-integrated-development-environment-ide}

你可以自由选择任何喜欢的工具来构建 Angular 应用。我们推荐以下工具：

1. [Visual Studio Code](https://code.visualstudio.com/)
   - 作为一个可选但推荐的步骤，你可以安装 [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)，进一步提升开发体验
1. [WebStorm](https://www.jetbrains.com/webstorm/)


### 5. 可选：设置你的 AI 驱动 IDE {#_5-optional-set-up-your-ai-powered-ide}

如果你要在自己喜欢的 AI 驱动 IDE 中学习本教程，请[查看 Angular 提示词规则和最佳实践](/ai/develop-with-ai)。




关于本课程所涉及主题的更多信息，请访问：

- [什么是 Angular](/overview)
- [设置本地环境和工作区](/tools/cli/setup-local)
- [Angular CLI 参考](/cli)

