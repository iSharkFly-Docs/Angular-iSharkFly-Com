# 配置应用环境

你可以为项目定义不同的具名构建配置，例如 `development` 和 `staging`，并为它们设置不同的默认值。

每个具名配置都可以为适用于各种构建器目标（例如 `build`、`serve` 和 `test`）的任意选项设置默认值。
这样，[Angular CLI](/tools/cli) 的 `build`、`serve` 和 `test` 命令就能针对你的目标环境，把文件替换为相应的版本。

## Angular CLI 配置

Angular CLI 构建器支持 `configurations` 对象，它允许根据命令行中提供的配置覆盖构建器的特定选项。

```json

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            // 默认禁用 source map 生成。
            "sourceMap": false
          },
          "configurations": {
            // 在 `debug` 配置中启用 source map。
            "debug": {
              "sourceMap": true
            }
          }
        },
        …
      }
    }
  }
}

```

你可以使用 `--configuration` 选项选择要使用的配置。

```shell

ng build --configuration debug

```

配置可以应用于任何 Angular CLI 构建器。可以用逗号分隔指定多个配置。这些配置会按顺序应用，发生冲突的选项会使用最后一个配置中的值。

```shell

ng build --configuration debug,production,customer-facing

```

## 配置特定于环境的默认值

`@angular/build:application` 支持文件替换（file replacements），这个选项可以在执行构建之前替换源文件。
将它与 `--configuration` 结合使用，就可以为应用配置特定于环境的数据。

首先，[生成环境文件](https://angular.dev/cli/generate/environments)来创建 `src/environments/` 目录，并将项目配置为使用文件替换。

```shell

ng generate environments

```

项目的 `src/environments/` 目录中包含基础配置文件 `environment.ts`，它提供了生产环境的默认配置。
你可以在特定于目标的配置文件中，为 `development` 和 `staging` 等其他环境覆盖默认值。

例如：

```text

my-app/src/environments
├── environment.development.ts
├── environment.staging.ts
└── environment.ts

```

基础文件 `environment.ts` 包含默认的环境设置。
例如：

```ts
export const environment = {
  production: true,
};
```

当没有指定环境时，`build` 命令会使用它作为构建目标。
你可以添加更多变量，既可以作为 environment 对象上的额外属性，也可以作为单独的对象。
例如，下面的代码为默认环境添加了一个变量的默认值：

```ts
export const environment = {
  production: true,
  apiUrl: 'http://my-prod-url',
};
```

::: danger 严重
`src/environments/` 中的文件会被打包进客户端应用，任何加载该页面的人都能看到。切勿在这里存储 API 密钥等机密信息。请改用服务端代理或密钥管理服务。

:::

你可以添加特定于目标的配置文件，例如 `environment.development.ts`。
以下内容为 development 构建目标设置了默认值：

```ts
export const environment = {
  production: false,
  apiUrl: 'http://my-dev-url',
};
```

## 在应用中使用特定于环境的变量

要使用你定义的环境配置，你的组件（Component）必须导入原始的 environments 文件：

```ts
import {environment} from './environments/environment';
```

这可以确保 build 和 serve 命令能够找到特定构建目标的配置。

组件文件（`app.ts`）中的以下代码使用了配置文件中定义的环境变量。

```ts
import {environment} from './../environments/environment';

// 在生产环境中从 `http://my-prod-url` 获取数据，在开发环境中从 `http://my-dev-url` 获取数据。
fetch(environment.apiUrl);
```

CLI 的主配置文件 `angular.json` 在每个构建目标的配置中都包含一个 `fileReplacements` 部分，它允许你把 TypeScript 程序中的任何文件替换为该文件的特定于目标的版本。
当你需要在针对特定环境（例如生产环境或预发布环境）的构建中包含特定于目标的代码或变量时，这非常有用。

默认情况下不会替换任何文件，不过 `ng generate environments` 会自动设置好这项配置。
你可以直接编辑 `angular.json` 配置，为特定构建目标修改或添加文件替换。

```json

  "configurations": {
    "development": {
      "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.development.ts"
          }
        ],
        …

```

这意味着，当你使用 `ng build --configuration development` 构建 development 配置时，`src/environments/environment.ts` 文件会被替换为该文件的特定于目标的版本 `src/environments/environment.development.ts`。

要添加预发布（staging）环境，请创建 `src/environments/environment.ts` 的副本并命名为 `src/environments/environment.staging.ts`，然后在 `angular.json` 中添加一个 `staging` 配置：

```json

  "configurations": {
    "development": { … },
    "production": { … },
    "staging": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.staging.ts"
        }
      ]
    }
  }

```

你还可以为这个目标环境添加更多配置选项。
构建所支持的任何选项都可以在构建目标配置中被覆盖。

要使用 staging 配置进行构建，请运行以下命令：

```shell

ng build --configuration staging

```

默认情况下，`build` 目标包含 `production` 和 `development` 两个配置，而 `ng serve` 使用应用的开发构建。
如果设置了 `buildTarget` 选项，你也可以将 `ng serve` 配置为使用目标构建配置：

```json

  "serve": {
    "builder": "@angular/build:dev-server",
    "options": { … },
    "configurations": {
      "development": {
        // 使用 `build` 目标的 `development` 配置。
        "buildTarget": "my-app:build:development"
      },
      "production": {
        // 使用 `build` 目标的 `production` 配置。
        "buildTarget": "my-app:build:production"
      }
    },
    "defaultConfiguration": "development"
  },

```

`defaultConfiguration` 选项指定了默认使用哪个配置。
如果没有设置 `defaultConfiguration`，则会直接使用 `options`，不做任何修改。
