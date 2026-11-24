# 单元测试 {#unit-testing}

测试 Angular 应用可以帮助你确认它是否按预期运行。单元测试对于尽早发现 bug、保证代码质量以及安全地进行重构都至关重要。

::: info 注意
本指南介绍新建 Angular CLI 项目的默认测试配置，它使用 Vitest。如果你要把现有项目从 Karma 迁移过来，请参阅[从 Karma 迁移到 Vitest 指南](/guide/testing/migrating-to-vitest)。Karma 仍然受支持；更多信息请参阅 [Karma 测试指南](/guide/testing/karma)。

:::

## 搭建测试环境 {#set-up-for-testing}

Angular CLI 会下载并安装使用 [Vitest 测试框架](https://vitest.dev)测试 Angular 应用所需的一切。新项目默认包含 `vitest` 和 `jsdom`。

Vitest 在 Node.js 环境中运行单元测试。为了模拟浏览器的 DOM，Vitest 使用一个名为 `jsdom` 的库。这样可以省去启动浏览器的开销，让测试执行得更快。你也可以安装 `happy-dom` 之类的替代库并卸载 `jsdom`，用它来替换 `jsdom`。目前受支持的 DOM 模拟库是 `jsdom` 和 `happy-dom`。

用 CLI 创建的项目立即就可以进行测试。运行 [`ng test`](https://angular.dev/cli/test) 命令：

```shell
ng test
```

`ng test` 命令会以*监视模式*（watch mode）构建应用，并启动 [Vitest 测试运行器](https://vitest.dev)。

控制台输出如下所示：

```shell
 ✓ src/app/app.spec.ts (2)
   ✓ App should create the app
   ✓ App should render title
 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  18:18:01
   Duration  2.46s (transform 615ms, setup 2ms, collect 2.21s, tests 5ms)
```

`ng test` 命令还会监视文件的变化。如果你修改并保存了某个文件，测试会再次运行。

## 配置 {#configuration}

Angular CLI 会替你处理大部分 Vitest 配置。你可以修改 `angular.json` 文件中 `test` 目标的选项来自定义测试行为。

### Angular.json 选项 {#angular-json-options}

- `include`：要纳入测试的文件的 glob 模式。默认为 `['**/*.spec.ts', '**/*.test.ts']`。
- `exclude`：要从测试中排除的文件的 glob 模式。
- `setupFiles`：全局初始化文件（例如 polyfill 或全局模拟）的路径列表，这些文件会在测试之前执行。
- `providersFile`：一个文件的路径，该文件默认导出一个用于测试环境的 Angular 提供者（Provider）数组。这对于设置会注入到测试中的全局测试提供者很有用。
- `coverage`：一个布尔值，用于启用或禁用代码覆盖率（coverage）报告。默认为 `false`。
- `browsers`：一个浏览器名称数组，用于在真实浏览器中运行测试（例如 `["chromium"]`）。需要安装浏览器提供程序（browser provider）。更多详情请参阅[在浏览器中运行测试](#running-tests-in-a-browser)一节。

### 全局测试初始化和提供者 {#global-test-setup-and-providers}

`setupFiles` 和 `providersFile` 选项对于管理全局测试配置特别有用。

例如，你可以创建一个 `src/test-providers.ts` 文件，为所有测试提供 `provideHttpClientTesting`：

```ts [src/test-providers.ts]
import {EnvironmentProviders, Provider} from '@angular/core';
import {provideHttpClientTesting} from '@angular/common/http/testing';

const testProviders: (Provider | EnvironmentProviders)[] = [provideHttpClientTesting()];

export default testProviders;
```

然后在 `angular.json` 中引用这个文件：

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "providersFile": "src/test-providers.ts"
          }
        }
      }
    }
  }
}
```

::: tip 提示
为测试初始化或提供者创建新的 TypeScript 文件（例如 `src/test-providers.ts`）时，请确保它们包含在项目的测试 TypeScript 配置文件（通常是 `tsconfig.spec.json`）中。这样 TypeScript 编译器才能在测试期间正确处理这些文件。

:::

### Vitest 高级配置 {#advanced-vitest-configuration}

对于高级用例，你可以使用 `angular.json` 中的 `runnerConfig` 选项提供自定义的 Vitest 配置文件。

::: warning 重要
虽然使用自定义配置可以启用一些高级选项，但 Angular 团队不会为配置文件的内容或任何第三方插件提供支持。为了确保正确集成，CLI 还会覆盖某些属性（`test.projects`、`test.include`）。

:::

你可以创建一个 Vitest 配置文件（例如 `vitest-base.config.mts`），并在 `angular.json` 中引用它：

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "runnerConfig": "vitest-base.config.mts"
          }
        }
      }
    }
  }
}
```

你也可以使用 CLI 生成一个基础配置文件：

```shell
ng generate config vitest
```

这会创建一个 `vitest-base.config.mts` 文件，你可以对它进行自定义。

::: tip 提示
请在 [Vitest 官方文档](https://vitest.dev/config/)中进一步了解 Vitest 配置。

:::

## 代码覆盖率 {#code-coverage}

你可以在 `ng test` 命令中添加 `--coverage` 标志来生成代码覆盖率报告。报告会生成在 `coverage/` 目录下。

更多详细信息，请参阅[代码覆盖率指南](/guide/testing/code-coverage)。

## 在浏览器中运行测试 {#running-tests-in-a-browser}

虽然默认的 Node.js 环境对大多数单元测试来说速度更快，但你也可以在真实浏览器中运行测试。这对于依赖浏览器特有 API（例如渲染）的测试或调试很有用。

要在浏览器中运行测试，必须先安装一个浏览器提供程序。请在[官方文档](https://vitest.dev/guide/browser)中进一步了解 Vitest 的浏览器模式。

安装好提供程序后，你可以在 `angular.json` 中配置 `browsers` 选项，或使用 `--browsers` CLI 标志，在浏览器中运行测试。默认情况下，测试会在有界面的（headed）浏览器中运行。如果设置了 `CI` 环境变量，则会改用无头（headless）模式。要显式控制无头模式，可以在浏览器名称后加上 `Headless` 后缀（例如 `chromiumHeadless`）。

```bash
# Playwright 示例（有界面）
ng test --browsers=chromium

# Playwright 示例（无头）
ng test --browsers=chromiumHeadless

# WebdriverIO 示例（有界面）
ng test --browsers=chrome

# WebdriverIO 示例（无头）
ng test --browsers=chromeHeadless
```

根据需要从下列浏览器提供程序中选择一个：

### Playwright {#playwright}

[Playwright](https://playwright.dev/) 是一个浏览器自动化库，支持 Chromium、Firefox 和 WebKit。

::: code-group

```shell [npm]
npm install --save-dev @vitest/browser-playwright playwright
```

```shell [yarn]
yarn add --dev @vitest/browser-playwright playwright
```

```shell [pnpm]
pnpm add -D @vitest/browser-playwright playwright
```

```shell [bun]
bun add --dev @vitest/browser-playwright playwright
```

:::

### WebdriverIO {#webdriverio}

[WebdriverIO](https://webdriver.io/) 是一个浏览器和移动端自动化测试框架，支持 Chrome、Firefox、Safari 和 Edge。

::: code-group

```shell [npm]
npm install --save-dev @vitest/browser-webdriverio webdriverio
```

```shell [yarn]
yarn add --dev @vitest/browser-webdriverio webdriverio
```

```shell [pnpm]
pnpm add -D @vitest/browser-webdriverio webdriverio
```

```shell [bun]
bun add --dev @vitest/browser-webdriverio webdriverio
```

:::

### Preview {#preview}

`@vitest/browser-preview` 提供程序是为 StackBlitz 等 WebContainer 环境设计的，不适合在 CI/CD 中使用。

::: code-group

```shell [npm]
npm install --save-dev @vitest/browser-preview
```

```shell [yarn]
yarn add --dev @vitest/browser-preview
```

```shell [pnpm]
pnpm add -D @vitest/browser-preview
```

```shell [bun]
bun add --dev @vitest/browser-preview
```

:::

::: tip 提示
有关更高级的浏览器专属配置，请参阅 [Vitest 高级配置](#advanced-vitest-configuration)一节。

:::

## 其他测试框架 {#other-test-frameworks}

你也可以使用其他测试库和测试运行器对 Angular 应用进行单元测试。每种库和运行器都有各自的安装步骤、配置方式和语法。

## 在持续集成中测试 {#testing-in-continuous-integration}

健壮的测试套件是持续集成（CI）流水线的关键组成部分。CI 服务器可以让你在每次提交和每个拉取请求时自动运行测试。

要在 CI 服务器中测试 Angular 应用，请运行标准的测试命令：

```shell
ng test
```

大多数 CI 服务器会设置 `CI=true` 环境变量，`ng test` 会检测到它，并自动把测试配置为以非交互、单次运行的模式执行。

如果你的 CI 服务器没有设置这个变量，或者你需要手动强制使用单次运行模式，可以使用 `--no-watch` 和 `--no-progress` 标志：

```shell
ng test --no-watch --no-progress
```

## 关于测试的更多信息 {#more-information-on-testing}

为应用搭建好测试环境之后，你可能会发现下列测试指南很有用。

|                                                                    | 详情                                                                              |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| [代码覆盖率](/guide/testing/code-coverage)                          | 测试覆盖了应用的多少代码，以及如何指定所需的覆盖量。                              |
| [测试服务](/guide/testing/services)                                 | 如何测试应用所使用的服务。                                                        |
| [组件测试基础](/guide/testing/components-basics)                    | 测试 Angular 组件的基础知识。                                                     |
| [组件测试场景](/guide/testing/components-scenarios)                 | 各种组件测试场景和用例。                                                          |
| [测试属性型指令](/guide/testing/attribute-directives)               | 如何测试属性型指令。                                                              |
| [测试管道](/guide/testing/pipes)                                    | 如何测试管道。                                                                    |
| [调试测试](/guide/testing/debugging)                                | 常见的测试 bug。                                                                  |
| [测试工具 API](/guide/testing/utility-apis)                         | Angular 的测试特性。                                                              |
