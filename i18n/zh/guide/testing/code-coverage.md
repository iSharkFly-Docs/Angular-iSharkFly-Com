# 代码覆盖率

代码覆盖率（code coverage）报告会展示代码库中哪些部分可能没有被单元测试充分覆盖。

## 前提条件

要用 Vitest 生成代码覆盖率报告，必须先安装 `@vitest/coverage-v8` 包：

::: code-group

```shell [npm]
npm install --save-dev @vitest/coverage-v8
```

```shell [yarn]
yarn add --dev @vitest/coverage-v8
```

```shell [pnpm]
pnpm add -D @vitest/coverage-v8
```

```shell [bun]
bun add --dev @vitest/coverage-v8
```

:::

## 生成报告

要生成覆盖率报告，请给 `ng test` 命令加上 `--coverage` 标志：

```shell
ng test --coverage
```

测试运行完成后，该命令会在项目中创建一个新的 `coverage/` 目录。打开其中的 `index.html` 文件，即可查看包含源代码和代码覆盖率数值的报告。

如果希望每次测试时都生成代码覆盖率报告，可以在 `angular.json` 文件中把 `coverage` 选项设置为 `true`：

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true
          }
        }
      }
    }
  }
}
```

## 强制执行代码覆盖率阈值

代码覆盖率百分比可以让你估算代码有多少经过了测试。如果团队确定了单元测试的最低覆盖量，就可以在配置中强制执行这个下限。

例如，假设你希望代码库的代码覆盖率至少达到 80%。要启用这一点，请在 `angular.json` 文件中添加 `coverageThresholds` 选项：

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true,
            "coverageThresholds": {
              "statements": 80,
              "branches": 80,
              "functions": 80,
              "lines": 80
            }
          }
        }
      }
    }
  }
}
```

现在，如果运行测试时覆盖率低于 80%，该命令就会失败。

## 高级配置

你还可以在 `angular.json` 文件中配置其他几个覆盖率选项：

- `coverageInclude`：要纳入覆盖率报告的文件的 glob 模式。
- `coverageExclude`：要从覆盖率报告中排除的文件的 glob 模式。
- `coverageReporters`：要使用的报告器数组（例如 `html`、`lcov`、`json`）。
- `coverageWatermarks`：一个为 HTML 报告器指定 `[low, high]` 水位线的对象，会影响报告的颜色标记。

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true,
            "coverageReporters": ["html", "lcov"],
            "coverageWatermarks": {
              "statements": [50, 80],
              "branches": [50, 80],
              "functions": [50, 80],
              "lines": [50, 80]
            }
          }
        }
      }
    }
  }
}
```
