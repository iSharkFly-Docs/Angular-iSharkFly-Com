# 创建库

本页从概念上介绍如何创建和发布新的库来扩展 Angular 的功能。

如果你发现需要在多个应用中解决同一个问题（或者希望与其他开发者分享你的解决方案），那么它就很适合做成一个库。
一个简单的例子是：一个把用户带到你公司网站的按钮，它会被包含在你公司构建的所有应用中。

## 快速上手

使用 Angular CLI，通过以下命令在一个新的工作区中生成新的库骨架。

```shell

ng new my-workspace --no-create-application
cd my-workspace
ng generate library my-lib

```

::: tip 为你的库命名
如果你打算以后把库发布到 npm 等公共包注册表中，选择库名时要非常谨慎。
参见[发布你的库](/tools/libraries/creating-libraries#publishing-your-library)。

避免使用以 `ng-` 为前缀的名称，例如 `ng-library`。
`ng-` 前缀是 Angular 框架及其库所使用的保留关键字。
推荐使用 `ngx-` 前缀，这是一种约定，用来表示该库适合与 Angular 一起使用。
它也能很好地帮助注册表的使用者区分不同 JavaScript 框架的库。
:::

`ng generate` 命令会在你的工作区中创建 `projects/my-lib` 文件夹，其中包含一个组件（Component）。

::: tip 提示
有关库项目结构的更多详情，请参阅[项目文件结构指南](/reference/configs/file-structure)中的[库项目文件](/reference/configs/file-structure#library-project-files)一节。

:::

可以使用 monorepo 模式，让多个项目共用同一个工作区。
参见[设置多项目工作区](/reference/configs/file-structure#multiple-projects)。

生成新库时，工作区配置文件 `angular.json` 会被更新，加入一个类型为 `library` 的项目。

```json

"projects": {
  …
  "my-lib": {
    "root": "projects/my-lib",
    "sourceRoot": "projects/my-lib",
    "projectType": "library",
    "prefix": "lib",
    "architect": {
      "build": {
        "builder": "@angular/build:library",
        …

```

使用 CLI 命令构建、测试和检查（lint）该项目：

```shell

ng build my-lib --configuration development
ng test my-lib
ng lint my-lib

```

注意，为该项目配置的构建器与应用项目的默认构建器不同。
除其他作用外，这个构建器还会确保库始终使用 [AOT 编译器](/tools/cli/aot-compiler)进行构建。

要让库代码可复用，你必须为它定义公共 API。
这个“用户层”定义了库的使用者可以使用哪些内容。
库的使用者应该能够通过单一的导入路径访问公共功能（例如服务提供者和通用工具函数）。

库的公共 API 维护在库文件夹中的 `public-api.ts` 文件里。
当你的库被导入到应用中时，从这个文件导出的所有内容都会成为公开的。

你的库应该提供用于安装和维护的文档（通常是一个 README 文件）。

## 入口点

_入口点_ 是使用者从中导入的模块说明符，以及该说明符所暴露的公共 API。
每个库都有一个 _主入口点_，你还可以添加任意数量的 _次级入口点_。

你可以在库的 `package.json` 文件中使用 `"exports"` 字段来配置入口点。
`"."` 键定义了主入口点，并指向导出其公共 API 的 TypeScript 文件：

```json [projects/my-lib/package.json]
{
  "name": "my-lib",
  "version": "0.0.1",
  "exports": {
    ".": "./src/public-api.ts"
  },
  …
}
```

使用者通过包名导入主入口点：

```ts
import {ThemeService} from 'my-lib';
```

次级入口点是 `"exports"` 中额外的子路径键，它指向自己的公共 API 文件。
例如，`"./button"` 导出会让使用者可以使用 `my-lib/button`：

```ts
import {ButtonComponent} from 'my-lib/button';
```

Angular 的各个包也使用相同的结构。
例如，`@angular/core` 是主入口点，而 `@angular/core/testing` 是同一个包的次级入口点。

::: tip 提示
关于入口点如何在 Angular 包格式中实现代码拆分并定义代码块边界的架构概述，请参阅[入口点与代码拆分](/tools/libraries/angular-package-format#entrypoints-and-code-splitting)。

:::

### 添加次级入口点

使用 [`entry-point` 原理图（Schematic）](https://angular.dev/cli/generate/entry-point)在库中生成新的次级入口点：

```shell
ng generate entry-point button --project my-lib
```

你也可以生成嵌套的子路径，例如 `testing/harness`：

```shell
ng generate entry-point testing/harness --project my-lib
```

运行 `ng generate entry-point button --project my-lib` 会执行以下步骤：

1. 在库中创建一个 `button/src/` 目录，其中包含它自己的 `public-api.ts` 文件和初始组件文件：

   ```text
   projects/my-lib/
   ├── package.json
   ├── src/
   │   ├── public-api.ts         (主入口点：my-lib)
   │   └── lib/
   │       ├── my-lib.spec.ts
   │       └── my-lib.ts
   └── button/
       └── src/
           ├── button.spec.ts
           ├── button.ts
           └── public-api.ts     (次级入口点：my-lib/button)
   ```

1. 在库的 `package.json` 中注册 `"./button"` 子路径：

   ```json [projects/my-lib/package.json]
   {
     "name": "my-lib",
     "version": "0.0.1",
     "exports": {
       ".": "./src/public-api.ts",
       "./button": "./button/src/public-api.ts"
     },
     …
   }
   ```

1. 在工作区的 `tsconfig.json` 中添加 `"my-lib/*"` 通配符路径映射（如果尚不存在），以便同一工作区中的应用可以从构建好的库输出中解析次级入口点：

   ```json [tsconfig.json]
   {
     "compilerOptions": {
       "paths": {
         "my-lib": ["./dist/my-lib"],
         "my-lib/*": ["./dist/my-lib/*"]
       }
     }
   }
   ```

   由于 `"my-lib/*"` 是一个通配符模式，它会在你第一次生成次级入口点时被添加，并自动覆盖当前和将来的所有次级入口点，无需再更新 `tsconfig.json`。

在构建过程中，`@angular/build:library` 会从 `projects/my-lib/package.json` 的 `"exports"` 字段中发现所有入口点，编译并打包每个入口点，然后把对应的 `types` 和 `default` 导出条件写入 `dist/my-lib/package.json`。

## 把应用的部分代码重构为库

要让你的解决方案可复用，需要对它进行调整，使其不依赖于特定于应用的代码。
在把应用功能迁移到库中时，需要考虑以下几点。

- 组件和管道（Pipe）等可声明对象应该设计为无状态的，也就是说它们不依赖或修改外部变量。
  如果确实依赖状态，你需要逐一评估每种情况，判断它是应用状态，还是应由库来管理的状态。

- 组件内部订阅的所有 Observable 都应该在这些组件的生命周期内被清理和释放
- 组件应该通过输入来接收上下文，通过输出把事件传递给其他组件，以此对外暴露它们的交互

- 检查所有内部依赖。
  - 对于组件或服务中使用的自定义类或接口，检查它们是否依赖于其他同样需要迁移的类或接口
  - 同样，如果你的库代码依赖某个服务，那么该服务也需要迁移
  - 如果你的库代码或其模板依赖于其他库（例如 Angular Material），你必须在库中配置这些依赖

- 考虑如何向客户端应用提供服务（Service）。
  - 服务应该声明它们自己的提供者（Provider），而不是在 NgModule 或组件中声明提供者。
    以这种方式声明提供者，可以让该服务变得 _可摇树优化（tree-shakable）_。
    这种做法使得当服务从未被注入到导入该库的应用中时，编译器可以把它排除在包之外。
    有关这方面的更多信息，请参阅[可摇树优化的提供者](/guide/di/lightweight-injection-tokens)。

  - 如果你要注册全局服务提供者，请暴露一个 `provideXYZ()` 提供者函数。
  - 如果你的库提供了一些并非所有客户端应用都会用到的可选服务，请使用[轻量级令牌设计模式](/guide/di/lightweight-injection-tokens)，为这种情况提供恰当的摇树优化支持

## 使用代码生成原理图与 CLI 集成

库通常包含 _可复用的代码_，用于定义组件、服务以及其他 Angular 构件（管道、指令（Directive）），你可以把它们导入到项目中。
库会被打包成 npm 包，以便发布和共享。
这个包还可以包含原理图，用于提供直接在你的项目中生成或转换代码的指令，就像 CLI 使用 `ng generate component` 创建一个通用的新组件一样。
例如，与库打包在一起的原理图可以为 Angular CLI 提供所需的信息，以生成一个组件，该组件会配置并使用该库中定义的某个特定功能或一组功能。
这方面的一个例子是 [Angular Material 的导航原理图](https://material.angular.dev/guide/schematics#navigation-schematic)，它会配置 CDK 的 [BreakpointObserver](https://material.angular.dev/cdk/layout/overview#breakpointobserver)，并将其与 Material 的 [MatSideNav](https://material.angular.dev/components/sidenav/overview) 和 [MatToolbar](https://material.angular.dev/components/toolbar/overview) 组件一起使用。

创建并包含以下几类原理图：

- 包含一个安装原理图，以便 `ng add` 可以把你的库添加到项目中
- 在库中包含生成原理图，以便 `ng generate` 可以在项目中为你定义的构件（组件、服务、测试）搭建脚手架
- 包含一个更新原理图，以便 `ng update` 可以更新库的依赖项，并为新版本中的破坏性变更提供迁移

库中包含什么取决于你的任务。
例如，你可以定义一个原理图，用来创建一个预先填充了固定数据的下拉框，以演示如何把它添加到应用中。
如果你希望下拉框每次都包含不同的传入值，你的库可以定义一个原理图，用给定的配置来创建它。
然后，开发者就可以使用 `ng generate` 为自己的应用配置一个实例。

假设你想读取一个配置文件，然后根据该配置生成一个表单。
如果使用你的库的开发者还需要对该表单进行额外定制，那么原理图可能是最合适的方式。
但如果表单总是相同的，开发者也不需要做太多定制，那么你可以创建一个动态组件，接收配置并生成表单。
一般来说，定制越复杂，原理图方式就越有用。

更多信息请参阅[原理图概览](/tools/cli/schematics)和[库的原理图](/tools/cli/schematics-for-libraries)。

## 发布你的库

使用 Angular CLI 和 npm 包管理器把你的库构建并发布为 npm 包。

Angular CLI 使用 `@angular/build:library` 构建器把你的代码编译成符合 [Angular 包格式](/tools/libraries/angular-package-format)的包，你可以把它们发布到 npm。
有关支持的分发格式以及如何为你的库选择合适格式的指导，请参阅[发布库](/tools/libraries/creating-libraries#publishing-libraries)。

构建用于分发的库时，应始终使用 `production` 配置（`ng build` 的默认配置）。
这能确保生成的输出使用了合适的优化以及适用于 npm 的正确包格式。

```shell

ng build my-lib
cd dist/my-lib
npm publish

```

## 管理库中的资源

在 Angular 库中，可分发的产物可以包含额外的资源，例如主题文件、Sass mixin 或文档（如变更日志）。
默认情况下，库构建器会把库根目录下的 `README.md` 和 `LICENSE*` 文件复制到输出目录，并把组件样式表中通过相对 `url()` 路径引用的资源以 data URL 的形式内联。
要在构建过程中复制额外的文件，请在 `angular.json` 中库的 `build` 目标上配置 [`assets` 选项](/reference/configs/workspace-config#assets-configuration)：

```json [angular.json]
{
  "projects": {
    "my-lib": {
      "architect": {
        "build": {
          "builder": "@angular/build:library",
          "options": {
            "tsConfig": "projects/my-lib/tsconfig.lib.json",
            "assets": [
              "projects/my-lib/CHANGELOG.md",
              "projects/my-lib/_index.scss",
              "projects/my-lib/prebuilt-themes",
              {
                "glob": "**/*.scss",
                "input": "projects/my-lib/src/theming",
                "output": "theming"
              }
            ]
          }
        }
      }
    }
  }
}
```

::: warning 重要
在包含 Sass mixin 或预编译 CSS 等额外资源时，请在库的 `package.json` 的 [`"exports"`](/tools/libraries/angular-package-format#exports) 字段中暴露它们。

:::

库构建器会把自定义的 `"exports"` 子路径和条件与生成的入口点导出合并，让你可以在 TypeScript 入口点之外暴露样式表或自定义条件：

```json [projects/my-lib/package.json]
{
  "exports": {
    ".": {
      "sass": "./_index.scss",
      "default": "./src/public-api.ts"
    },
    "./theming": {
      "sass": "./theming/_theming.scss"
    },
    "./prebuilt-themes/indigo-pink.css": {
      "style": "./prebuilt-themes/indigo-pink.css"
    }
  }
}
```

## 对等依赖

Angular 库应该把它所依赖的所有 `@angular/*` 依赖列为对等依赖（peer dependency）。
这能确保当各个模块请求 Angular 时，它们得到的都是完全相同的模块。
如果库把 `@angular/core` 列在 `dependencies` 而不是 `peerDependencies` 中，它可能会得到另一个不同的 Angular 模块，从而导致你的应用出错。

## 在应用中使用你自己的库

要在同一个工作区中使用你的库，并不需要把它发布到 npm 包管理器，但你必须先构建它。

要在应用中使用你自己的库：

- 构建库。
  在构建之前无法使用库。

```shell
  ng build my-lib
```

- 在你的应用中，按名称从库中导入：

```ts
import {myExport} from 'my-lib';
```

### 构建和重新构建你的库

如果你还没有把库发布为 npm 包，再从 npm 把该包安装回应用中，那么构建这一步就很重要。
例如，如果你克隆了 git 仓库并运行 `npm install`，而此时还没有构建库，编辑器就会把 `my-lib` 的导入显示为缺失。

::: tip 提示
当你在 Angular 应用中从某个库导入内容时，Angular 会查找库名与磁盘上某个位置之间的映射。
当你安装一个库包时，这个映射位于 `node_modules` 文件夹中。
当你构建自己的库时，它必须在 `tsconfig` 的 paths 中找到这个映射。

:::

使用 Angular CLI 生成库时，会自动把它的路径添加到 `tsconfig` 文件中。
Angular CLI 使用 `tsconfig` 的 paths 来告诉构建系统去哪里查找该库。

更多信息请参阅[路径映射概述](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)。

每次修改库之后，你都可以重新构建它，但这个额外的步骤需要花费时间。
_增量构建_ 功能可以改善库的开发体验。
每次文件发生变化时，都会执行一次部分构建，输出修改过的文件。

增量构建可以作为后台进程在你的开发环境中运行。
要使用这一功能，请在构建命令中添加 `--watch` 标志：

```shell

ng build my-lib --watch

```

::: warning 重要
CLI 的 `build` 命令为库使用的构建器（`@angular/build:library`）与为应用使用的构建器（`@angular/build:application`）不同。

:::

库会按照 [Angular 包格式](/tools/libraries/angular-package-format)进行编译和打包，这意味着同样的 TypeScript 源代码，在构建后的库中产生的输出与在构建后的应用中不同。

因此，依赖某个库的应用只应使用指向 _已构建库_ 的 TypeScript 路径映射。
TypeScript 路径映射 _不应_ 指向库的源 `.ts` 文件。

### 在本地开发中链接库

本节介绍如何使用包管理器的本地链接功能
（例如 [`npm link`](https://docs.npmjs.com/cli/v11/commands/npm-link) 或 [`pnpm link`](https://pnpm.io/cli/link)），在本地开发期间用外部应用测试独立的 Angular 库，
而无需依赖 monorepo 工作区结构，也无需发布到 npm 注册表。

::: info 注意
如果你的库和应用位于同一个 Angular 工作区中（monorepo 设置），标准的 monorepo 工作流会自动处理链接，通常也更高效。这种本地链接方式最适合以下情况：

:::

- 你正在开发一个独立的库，需要在外部的使用方应用中测试改动。
- 你正在 monorepo 工作区之外的使用方应用中测试库的改动。

#### 配置使用方应用

要使用链接的库，你需要在应用的 `angular.json` 文件中进行以下配置：

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "preserveSymlinks": true
          },
          "configurations": {
            "development": {
              "sourceMap": {
                "scripts": true,
                "styles": true,
                "vendor": true
              }
            }
          }
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "options": {
            "prebundle": {
              "exclude": ["my-lib"]
            }
          }
        }
      }
    }
  }
}
```

**配置选项说明：**

- `preserveSymlinks: true`：指示构建系统沿用包管理器链接命令创建的符号链接，而不是解析到符号链接的原始位置。这对于避免依赖的 node 包出现多个副本至关重要。
- `sourceMap.vendor`：启用第三方库的源码映射（尤其是 `vendor: true`），以便更轻松地调试链接库的代码。
- `prebundle.exclude`：默认情况下，Angular CLI 可能会对所有 node 依赖进行预打包。把你的库排除在外，可以确保链接的源代码在发生变化时能被正确监听并重新构建。

## 发布库

发布库时可以使用两种分发格式：

| 分发格式                    | 详情                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Partial-Ivy（推荐）         | 包含可移植的代码，可以被使用 Angular v12 及以后任意版本构建的 Ivy 应用使用。                                                                                                                                                                                                                                                                                                                                                                      |
| Full-Ivy                    | 包含私有的 Angular Ivy 指令。编译器 ABI（这些指令所调用的内部运行时 API）在补丁版本之间保持稳定，但在次版本之间可能发生变化。这种格式要求库和应用使用相同次版本的 Angular 构建。它适用于所有库和应用代码都从源码构建，或在微前端架构中共享的环境。                                                                                                                  |

发布到 npm 时请使用 partial-Ivy 格式，因为它在 Angular 的补丁版本之间是稳定的。

如果要发布到 npm，请避免用 full-Ivy 代码编译库，因为生成的 Ivy 指令依赖于编译器 ABI，而它可能会在次版本之间发生变化。

## 确保库的版本兼容性

用于构建应用的 Angular 版本，应始终等于或高于其所依赖的任何库在构建时使用的 Angular 版本。
例如，如果你有一个使用 Angular 13 版本的库，那么依赖该库的应用就应使用 Angular 13 或更高版本。
Angular 不支持应用使用更早的版本。

如果你打算把库发布到 npm，请使用 `production` 配置进行构建，该配置默认设置 `"compilationMode": "partial"`，以输出 partial-Ivy 代码。
这种 partial 格式在不同的 Angular 版本之间是稳定的，因此可以安全地发布到 npm。
这种格式的代码会在应用构建期间使用同一版本的 Angular 编译器进行处理，从而确保应用及其所有库都使用同一个版本的 Angular。

如果要发布到 npm，请避免用 full-Ivy 代码编译库，因为生成的 Ivy 指令依赖于编译器 ABI，而它可能会在次版本之间发生变化。

如果你以前从未在 npm 上发布过包，必须先创建一个用户账号。
更多信息请参阅[发布 npm 包](https://docs.npmjs.com/getting-started/publishing-npm-packages)。

## 在 Angular CLI 之外使用 partial-Ivy 代码

应用会从 npm 把许多 Angular 库安装到它的 `node_modules` 目录中。
然而，这些库中的代码并没有完全编译，因此无法直接与构建后的应用一起打包。
要完成编译，请使用 Angular 链接器（linker）。

对于不使用 Angular CLI 的应用，链接器以 [Babel](https://babeljs.io) 插件的形式提供。
该插件需要从 `@angular/compiler-cli/linker/babel` 导入。

Angular 链接器 Babel 插件支持构建缓存，这意味着无论其他 npm 操作如何，库都只需要被链接器处理一次。

下面的示例演示了如何使用 [babel-loader](https://webpack.js.org/loaders/babel-loader/#options) 把链接器注册为 [Babel](https://babeljs.io) 插件，从而将该插件集成到自定义的 [webpack](https://webpack.js.org) 构建中。

```js [webpack.config.mjs]
import linkerPlugin from '@angular/compiler-cli/linker/babel';

export default {
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [linkerPlugin],
            compact: false,
            cacheDirectory: true,
          },
        },
      },
    ],
  },
};
```

::: tip 提示
Angular CLI 会自动集成链接器插件，因此如果你的库的使用者在使用 CLI，他们无需任何额外配置，就可以从 npm 安装 Ivy 原生的库。

:::
