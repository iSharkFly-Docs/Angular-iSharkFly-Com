# 让你的 Angular 项目保持最新 {#keeping-your-angular-projects-up-to-date}

就像 Web 以及整个 Web 生态系统一样，Angular 也在不断改进。
Angular 在持续改进的同时，也高度重视稳定性，并力求让更新过程简单直接。
让你的 Angular 应用保持最新，可以让你享受到前沿的新特性，以及各种优化和 bug 修复。

本文档包含的信息和资源可以帮助你让 Angular 应用和库保持最新。

有关我们的版本策略和实践（包括支持和弃用实践以及发布计划），请参阅 [Angular 版本与发布](/reference/releases 'Angular 版本与发布')。

::: tip 提示
如果你目前在使用 AngularJS，请参阅[从 AngularJS 升级](https://angular.io/guide/upgrade '从 AngularJS 升级')。
_AngularJS_ 是 Angular 所有 v1.x 版本的名称。

:::

## 获取新版本发布通知 {#getting-notified-of-new-releases}

要在新版本发布时收到通知，请在 X（原 Twitter）上关注 [@angular](https://x.com/angular 'X 上的 @angular')，或订阅 [Angular 博客](https://blog.angular.dev 'Angular 博客')。

## 了解新特性 {#learning-about-new-features}

有什么新内容？有什么变化？我们会在 Angular 博客的[发布公告](https://blog.angular.dev/ 'Angular 博客 - 发布公告')中分享你需要了解的最重要信息。

要查看按版本组织的完整变更列表，请参阅 [Angular 变更日志](https://github.com/angular/angular/blob/main/CHANGELOG.md 'Angular 变更日志')。

## 检查你的 Angular 版本 {#checking-your-version-of-angular}

要检查应用所使用的 Angular 版本，请在项目目录中运行 `ng version` 命令。

## 查找 Angular 的当前版本 {#finding-the-current-version-of-angular}

Angular 最新的稳定发布版本显示在 [npm 上](https://www.npmjs.com/package/@angular/core 'npm 上的 Angular')的 "Version" 下方。例如 `16.2.4`。

你也可以使用 CLI 命令 [`ng update`](https://angular.dev/cli/update) 来查找 Angular 的最新版本。
默认情况下，[`ng update`](https://angular.dev/cli/update)（不带额外参数）会列出你可用的更新。

## 更新你的环境和应用 {#updating-your-environment-and-apps}

为了让更新变得简单，我们在交互式的 [Angular 更新指南](https://angular.dev/update-guide)中提供了完整的说明。

Angular 更新指南会根据你指定的当前版本和目标版本，提供定制化的更新说明。
它包含基础和高级两种更新路径，以匹配你的应用的复杂程度。
它还包含故障排除信息以及推荐的手动修改，帮助你充分利用新版本。

对于简单的更新，你只需要 CLI 命令 [`ng update`](https://angular.dev/cli/update)。
不带额外参数时，[`ng update`](https://angular.dev/cli/update) 会列出你可用的更新，并提供将应用更新到最新版本的推荐步骤。

[Angular 版本与发布](/reference/releases#angular-versioning 'Angular 发布实践与版本')描述了根据发布版本号你可以预期的变更程度。
它还描述了受支持的更新路径。

## 资源汇总 {#resource-summary}

- 发布公告：
  [Angular 博客 - 发布公告](https://blog.angular.dev/ 'Angular 博客上关于近期发布的公告')

- 发布详情：
  [Angular 变更日志](https://github.com/angular/angular/blob/main/CHANGELOG.md 'Angular 变更日志')

- 更新说明：
  [Angular 更新指南](https://angular.dev/update-guide)

- 更新命令参考：
  [Angular CLI `ng update` 命令参考](https://angular.dev/cli/update)

- 版本、发布、支持和弃用实践：
  [Angular 版本与发布](/reference/releases 'Angular 版本与发布')
