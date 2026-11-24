# 从 Karma 迁移到 Vitest {#migrating-from-karma-to-vitest}

Angular CLI 使用 [Vitest](https://vitest.dev/) 作为新项目的默认单元测试运行器。本指南介绍如何把现有项目从 Karma 和 Jasmine 迁移到 Vitest。

::: warning 重要
把现有项目迁移到 Vitest 目前仍属实验性功能。这个过程还要求使用 `application` 构建系统，它是所有新建项目的默认构建系统。

:::

## 手动迁移步骤 {#manual-migration-steps}

在使用自动重构原理图（schematic）之前，你必须先手动更新项目，使其使用 Vitest 测试运行器。

### 1. 安装依赖 {#_1-install-dependencies}

安装 `vitest` 和一个 DOM 模拟库。虽然仍然可以在浏览器中测试（参见[第 5 步](#5-configure-browser-mode-optional)），但 Vitest 默认使用 DOM 模拟库在 Node.js 中模拟浏览器环境，以加快测试执行速度。如果安装了 `happy-dom`，CLI 会自动检测并使用它；否则会回退到 `jsdom`。你必须安装这两个包中的一个。

::: code-group

```shell [npm]
npm install --save-dev vitest jsdom
```

```shell [yarn]
yarn add --dev vitest jsdom
```

```shell [pnpm]
pnpm add -D vitest jsdom
```

```shell [bun]
bun add --dev vitest jsdom
```

:::

### 2. 更新 `angular.json` {#_2-update-angular-json}

在 `angular.json` 文件中找到项目的 `test` 目标，并把 `builder` 改为 `@angular/build:unit-test`。

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test"
        }
      }
    }
  }
}
```

`unit-test` 构建器默认使用 `"tsConfig": "tsconfig.spec.json"` 和 `"buildTarget": "::development"`。如果项目需要不同的值，可以显式设置这些选项。例如，如果缺少 `development` 构建配置，或者测试需要不同的选项，你可以创建一个名为 `testing`（或类似名称）的构建配置，并将其用作 `buildTarget`。

以前的 `@angular/build:karma` 构建器允许直接在 `test` 目标中配置构建选项（例如 `polyfills`、`assets` 或 `styles`）。新的 `@angular/build:unit-test` 构建器不支持这种做法。如果测试专用的构建选项与现有的 `development` 构建配置不同，你必须把它们移到一个专门的构建目标配置中。如果测试构建选项已经与 `development` 构建配置一致，则无需任何操作。

### 3. 处理自定义的 `karma.conf.js` 配置 {#_3-handle-custom-karma-conf-js-configurations}

`karma.conf.js` 中的自定义配置不会被自动迁移。在删除 `karma.conf.js` 文件之前，请检查其中是否有需要迁移的自定义设置。

许多 Karma 选项在 Vitest 中都有对应的设置，可以在自定义的 Vitest 配置文件（例如 `vitest.config.ts`）中设置，并通过 `runnerConfig` 选项关联到 `angular.json`。

常见的迁移方式包括：

- **报告器（Reporters）**：Karma 报告器必须替换为与 Vitest 兼容的报告器。这些报告器通常可以直接在 `angular.json` 的 `test.options.reporters` 属性下配置。如需更高级的配置，请使用自定义的 `vitest.config.ts` 文件。
- **插件（Plugins）**：Karma 插件可能有对应的 Vitest 插件，你需要自行查找并安装。注意，代码覆盖率是 Angular CLI 的一等功能，可以通过 `ng test --coverage` 启用。
- **自定义浏览器启动器（Custom Browser Launchers）**：它们由 `angular.json` 中的 `browsers` 选项以及安装 `@vitest/browser-playwright` 之类的浏览器提供程序来替代。

其他设置请查阅官方 [Vitest 文档](https://vitest.dev/config/)。

### 4. 删除 Karma 和 `test.ts` 文件 {#_4-remove-karma-and-test-ts-files}

现在可以从项目中删除 `karma.conf.js` 和 `src/test.ts`，并卸载与 Karma 相关的包。以下命令基于新建 Angular CLI 项目中安装的包；你的项目可能还有其他需要移除的 Karma 相关包。

::: code-group

```shell [npm]
npm uninstall karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core
```

```shell [yarn]
yarn remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core
```

```shell [pnpm]
pnpm remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core
```

```shell [bun]
bun remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core
```

:::

### 5. 配置浏览器模式（可选） {#_5-configure-browser-mode-optional}

如果需要在真实浏览器中运行测试，你必须安装一个浏览器提供程序并配置 `angular.json`。

**安装浏览器提供程序：**

根据需要选择以下浏览器提供程序之一：

- **Playwright**：`@vitest/browser-playwright`，适用于 Chromium、Firefox 和 WebKit。
- **WebdriverIO**：`@vitest/browser-webdriverio`，适用于 Chrome、Firefox、Safari 和 Edge。
- **Preview**：`@vitest/browser-preview`，适用于 WebContainer 环境（例如 StackBlitz）。

::: code-group

```shell [npm]
npm install --save-dev @vitest/browser-playwright
```

```shell [yarn]
yarn add --dev @vitest/browser-playwright
```

```shell [pnpm]
pnpm add -D @vitest/browser-playwright
```

```shell [bun]
bun add --dev @vitest/browser-playwright
```

:::

**更新 `angular.json` 以启用浏览器模式：**

在 `test` 目标的选项中添加 `browsers` 选项。浏览器名称取决于你安装的提供程序（例如 Playwright 用 `chromium`，WebdriverIO 用 `chrome`）。

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "browsers": ["chromium"]
          }
        }
      }
    }
  }
}
```

如果设置了 `CI` 环境变量，或者浏览器名称中包含 "Headless"（例如 `ChromeHeadless`），就会自动启用无头模式。否则，测试会在有界面的浏览器中运行。

## 使用原理图自动重构测试 {#automated-test-refactoring-with-schematics}

::: warning 重要
`refactor-jasmine-vitest` 原理图是实验性的，可能无法覆盖所有的测试模式。请务必审查原理图所做的更改。

:::

Angular CLI 提供了 `refactor-jasmine-vitest` 原理图，可以自动把 Jasmine 测试重构为使用 Vitest。

### 概览 {#overview}

该原理图会在测试文件（`.spec.ts`）中自动执行以下转换：

- 把 `fit` 和 `fdescribe` 转换为 `it.only` 和 `describe.only`。
- 把 `xit` 和 `xdescribe` 转换为 `it.skip` 和 `describe.skip`。
- 把 `spyOn` 调用转换为等效的 `vi.spyOn`。
- 用 `expect.objectContaining` 替换 `jasmine.objectContaining`。
- 用 `expect.any` 替换 `jasmine.any`。
- 用 `vi.fn` 替换 `jasmine.createSpy`。
- 把 `beforeAll`、`beforeEach`、`afterAll` 和 `afterEach` 更新为对应的 Vitest 写法。
- 把 `fail()` 转换为 Vitest 的 `expect.fail()`。
- 调整断言以匹配 Vitest API
- 为无法自动转换的代码添加 TODO 注释

该原理图**不会**执行以下操作：

- 不会安装 `vitest` 或其他相关依赖。
- 不会修改 `angular.json` 以使用 Vitest 构建器，也不会从 `test` 目标迁移任何构建选项（例如 `polyfills` 或 `styles`）。
- 不会删除 `karma.conf.js` 或 `test.ts` 文件。
- 不会处理复杂或嵌套的间谍（spy）场景，这些可能需要手动重构。

### 运行原理图 {#running-the-schematic}

项目配置好 Vitest 之后，就可以运行该原理图来重构测试文件。

要重构默认项目中的**所有**测试文件，请运行：

```bash
ng g @schematics/angular:refactor-jasmine-vitest
```

### 选项 {#options}

你可以使用以下选项来自定义原理图的行为：

| 选项                   | 描述                                                                                         |
| :----------------------- | :-------------------------------------------------------------------------------------------------- |
| `--project <name>`       | 在多项目工作区中指定要重构的项目。<br> 示例：`--project=my-lib`      |
| `--include <path>`       | 只重构指定的文件或目录。<br> 示例：`--include=src/app/app.component.spec.ts` |
| `--file-suffix <suffix>` | 为测试文件指定不同的文件后缀。<br> 示例：`--file-suffix=.test.ts`              |
| `--add-imports`          | 如果在 Vitest 配置中禁用了全局变量，则添加显式的 `vitest` 导入。            |
| `--verbose`              | 查看所有已应用转换的详细日志。                                                |
| `--browser-mode`         | 如果你打算在浏览器模式下运行测试，请使用此选项。                                                     |

### 迁移之后 {#after-migrating}

原理图执行完成后，最好做以下几件事：

1.  **运行测试**：执行 `ng test`，确保重构后所有测试仍然通过。
2.  **审查更改**：仔细检查原理图所做的更改，特别留意那些复杂的测试，尤其是含有复杂间谍或模拟（mock）的测试，因为它们可能需要进一步手动调整。

`ng test` 命令会以*监视模式*（watch mode）构建应用，并启动所配置的运行器。在交互式终端中且不在 CI 上运行时，默认会启用监视模式。

## 配置 {#configuration}

Angular CLI 会替你处理 Vitest 的配置，它会根据 `angular.json` 中的选项在内存中构建完整的配置。

### 自定义 Vitest 配置 {#custom-vitest-configuration}

::: warning 重要
虽然使用自定义配置可以启用一些高级选项，但 Angular 团队不会为配置文件的具体内容或其中使用的任何第三方插件提供直接支持。CLI 还会覆盖某些属性（`test.projects`、`test.include`），以确保正常运行。

:::

你可以提供一个自定义的 Vitest 配置文件来覆盖默认设置。完整的可用选项列表，请参阅官方 [Vitest 文档](https://vitest.dev/config/)。

**1. 直接路径：**
在 `angular.json` 中提供 Vitest 配置文件的直接路径：

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {"runnerConfig": "vitest.config.ts"}
        }
      }
    }
  }
}
```

**2. 自动搜索基础配置：**
如果把 `runnerConfig` 设置为 `true`，构建器会自动在项目根目录和工作区根目录中搜索共享的 `vitest-base.config.*` 文件。

## `zone.js` Vitest 补丁 {#zone-js-vitest-patch}

为了使用 `fakeAsync`、`flush` 或 `waitForAsync` 等函数，或者让现有测试能够配合这些函数工作，你可以把 `zone.js/plugins/vitest-patch` 添加到 `angular.json` 中测试目标的 polyfills 里。

尽管如此，我们仍然强烈建议你开始计划把现有的测试套件转换为原生 `async` 和 Vitest 假定时器（fake timers），因为这已是公认的做法。

关于在 Vitest 中使用假定时器的示例，请参阅[这里的示例](/guide/testing/components-scenarios#async-test-with-a-vitest-fake-timers)。

## 问题报告 {#bug-reports}

请在 [GitHub](https://github.com/angular/angular-cli/issues) 上报告问题和功能请求。

请尽可能提供一个最小复现，以帮助团队解决问题。
