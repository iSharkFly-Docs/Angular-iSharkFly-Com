# 端到端测试

端到端（E2E）测试是一种测试形式，用于断言整个应用从头到尾（即 _“端到端”_）都能按预期工作。E2E 测试与单元测试的不同之处在于，它与代码的底层实现细节完全解耦。它通常以模拟用户与应用交互的方式来验证应用。本页将作为指南，介绍如何使用 Angular CLI 在 Angular 中开始进行端到端测试。

## 设置 E2E 测试

Angular CLI 会下载并安装为 Angular 应用运行端到端测试所需的一切。

```shell

ng e2e

```

`ng e2e` 命令会先检查你的项目中是否有 "e2e" 目标。如果找不到，CLI 会提示你选择要使用的 e2e 包，并引导你完成设置。

```text

Cannot find "e2e" target for the specified project.
You can add a package that implements these capabilities.

For example:
Playwright: ng add playwright-ng-schematics
Cypress: ng add @cypress/schematic
Nightwatch: ng add @nightwatch/schematics
WebdriverIO: ng add @wdio/schematics
Puppeteer: ng add @puppeteer/ng-schematics

Would you like to add a package with "e2e" capabilities now?
❯ No
Playwright
Cypress
Nightwatch
WebdriverIO
Puppeteer

```

如果上面的列表中没有你想使用的测试运行器，可以使用 `ng add` 手动添加一个包。

## 运行 E2E 测试

现在应用已经配置好了端到端测试，我们可以运行同一个命令来执行测试。

```shell

ng e2e

```

注意，使用任何集成的 e2e 包运行测试并没有什么“特别”之处。`ng e2e` 命令实际上只是在底层运行 `e2e` 构建器。你随时可以[创建自己的自定义构建器](/tools/cli/cli-builder#creating-a-builder)并命名为 `e2e`，然后用 `ng e2e` 来运行它。

## 有关端到端测试工具的更多信息

| 测试工具    | 详情                                                                                                    |
| :---------- | :------------------------------------------------------------------------------------------------------ |
| Cypress     | [Cypress 入门](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test) |
| Nightwatch  | [Nightwatch 入门](https://nightwatchjs.org/guide/writing-tests/introduction.html)                    |
| WebdriverIO | [Webdriver.io 入门](https://webdriver.io/docs/gettingstarted)                                        |
| Playwright  | [Playwright 入门](https://playwright.dev/docs/writing-tests)                                         |
| Puppeteer   | [Puppeteer 入门](https://pptr.dev)                                                                   |
