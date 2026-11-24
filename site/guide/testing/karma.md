# 使用 Karma 和 Jasmine 进行测试 {#testing-with-karma-and-jasmine}

虽然 [Vitest](https://vitest.dev) 是新 Angular 项目的默认测试运行器，但 [Karma](https://karma-runner.github.io) 仍然是一个受支持且被广泛使用的测试运行器。本指南介绍如何使用 Karma 测试运行器和 [Jasmine](https://jasmine.github.io) 测试框架来测试 Angular 应用。

## 设置 Karma 和 Jasmine {#setting-up-karma-and-jasmine}

你可以为新项目设置 Karma 和 Jasmine，也可以把它们添加到现有项目中。

### 新项目 {#for-new-projects}

要创建一个预先配置好 Karma 和 Jasmine 的新项目，请带上 `--test-runner=karma` 选项运行 `ng new` 命令：

```shell
ng new my-karma-app --test-runner=karma
```

### 现有项目 {#for-existing-projects}

要把 Karma 和 Jasmine 添加到现有项目中，请按以下步骤操作：

1.  **安装必要的包：**

    ::: code-group

    ```shell [npm]
    npm install --save-dev karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
    ```

    ```shell [yarn]
    yarn add --dev karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
    ```

    ```shell [pnpm]
    pnpm add -D karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
    ```

    ```shell [bun]
    bun add --dev karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
    ```

    :::

2.  **在 `angular.json` 中配置测试运行器：**

    在 `angular.json` 文件中找到 `test` 目标，并把 `runner` 选项设置为 `karma`：

    ```json
    {
      // ...
      "projects": {
        "your-project-name": {
          // ...
          "architect": {
            "test": {
              "builder": "@angular/build:unit-test",
              "options": {
                "runner": "karma"
                // ... 其他选项
              }
            }
          }
        }
      }
    }
    ```

3.  **更新 `tsconfig.spec.json` 以使用 Jasmine 类型：**

    为了让 TypeScript 能识别 `describe`、`it` 等全局测试函数，请在 `tsconfig.spec.json` 的 `types` 数组中添加 `"jasmine"`：

    ```json
    {
      // ...
      "compilerOptions": {
        // ...
        "types": ["jasmine"]
      }
      // ...
    }
    ```

## 运行测试 {#running-tests}

项目配置完成后，使用 [`ng test`](https://angular.dev/cli/test) 命令运行测试：

```shell
ng test
```

`ng test` 命令会以*监视模式*（watch mode）构建应用，并启动 [Karma 测试运行器](https://karma-runner.github.io)。

控制台输出如下所示：

```shell

02 11 2022 09:08:28.605:INFO [karma-server]: Karma v6.4.1 server started at http://localhost:9876/
02 11 2022 09:08:28.607:INFO [launcher]: Launching browsers Chrome with concurrency unlimited
02 11 2022 09:08:28.620:INFO [launcher]: Starting browser Chrome
02 11 2022 09:08:31.312:INFO [Chrome]: Connected on socket -LaEYvD2R7MdcS0-AAAB with id 31534482
Chrome: Executed 3 of 3 SUCCESS (0.193 secs / 0.172 secs)
TOTAL: 3 SUCCESS

```

测试结果会通过 [Karma Jasmine HTML Reporter](https://github.com/dfederm/karma-jasmine-html-reporter) 显示在浏览器中。

<img alt="Jasmine HTML Reporter in the browser" src="/assets/images/guide/testing/initial-jasmine-html-reporter.png">

点击某个测试行可以只重新运行该测试，点击某个描述则会重新运行所选测试组（"test suite"，测试套件）中的测试。

与此同时，`ng test` 命令会持续监视变更。要看到它的效果，可以对某个源文件做一点小改动并保存。测试会再次运行，浏览器会刷新，并显示新的测试结果。

## 配置 {#configuration}

Angular CLI 会替你处理 Jasmine 和 Karma 的配置。它会根据 `angular.json` 文件中指定的选项，在内存中构建完整的配置。

### 自定义 Karma 配置 {#customizing-karma-configuration}

如果想自定义 Karma，可以运行以下命令来创建 `karma.conf.js`：

```shell
ng generate config karma
```

::: tip 提示
关于 Karma 配置的更多信息，请参阅 [Karma 配置指南](https://karma-runner.github.io/6.4/config/configuration-file.html)。

:::

### 在 `angular.json` 中设置测试运行器 {#setting-the-test-runner-in-angular-json}

要显式地把 Karma 设置为项目的测试运行器，请在 `angular.json` 文件中找到 `test` 目标，并把 `runner` 选项设置为 `karma`：

```json
{
  // ...
  "projects": {
    "your-project-name": {
      // ...
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "runner": "karma"
            // ... 其他选项
          }
        }
      }
    }
  }
}
```

## 强制执行代码覆盖率 {#code-coverage-enforcement}

要强制要求最低的代码覆盖率（code coverage），可以使用 `karma.conf.js` 文件中 `coverageReporter` 部分的 `check` 属性。

例如，要求覆盖率至少达到 80%：

```javascript
coverageReporter: {
  dir: require('path').join(__dirname, './coverage/<project-name>'),
  subdir: '.',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' }
  ],
  check: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}
```

这样，如果没有达到指定的覆盖率阈值，测试运行就会失败。

## 在持续集成中测试 {#testing-in-continuous-integration}

要在 CI 环境中运行 Karma 测试，请使用以下命令：

```shell
ng test --no-watch --no-progress --browsers=ChromeHeadless
```

::: info 注意
在 CI 环境中，`--no-watch` 和 `--no-progress` 标志对 Karma 至关重要，它们能确保测试只运行一次并干净地退出。`--browsers=ChromeHeadless` 标志同样必不可少，它让测试可以在没有图形界面的浏览器环境中运行。

:::

## 调试测试 {#debugging-tests}

如果测试的运行结果不符合预期，你可以在浏览器中检查并调试它们。

要使用 Karma 测试运行器调试应用：

1.  显示 Karma 浏览器窗口。如果这一步需要帮助，请参阅[为测试做准备](/guide/testing#set-up-for-testing)。
2.  点击 **DEBUG** 按钮，打开一个新的浏览器标签页并重新运行测试。
3.  打开浏览器的**开发者工具**（Developer Tools）。在 Windows 上按 `Ctrl-Shift-I`，在 macOS 上按 `Command-Option-I`。
4.  选择 **Sources** 面板。
5.  按 `Control/Command-P`，然后开始输入测试文件的名称来打开它。
6.  在测试中设置一个断点。
7.  刷新浏览器，你会发现它停在了断点处。

<img alt="Karma debugging" src="/assets/images/guide/testing/karma-1st-spec-debug.png">
