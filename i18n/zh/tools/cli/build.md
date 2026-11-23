# 构建 Angular 应用

你可以使用 `ng build` 命令来构建 Angular CLI 应用或库。
它会把 TypeScript 代码编译成 JavaScript，并根据需要对输出进行优化、打包和压缩。

`ng build` 只会执行 `angular.json` 中所指定默认项目的 `build` 目标所对应的构建器。
Angular CLI 包含四个通常用作 `build` 目标的构建器：

| 构建器 | 用途 |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@angular/build:application` | 使用 [esbuild](https://esbuild.github.io/) 构建应用，产出客户端包、Node 服务器以及构建时预渲染的路由。 |
| `@angular/build:library` | 构建遵循 [Angular 包格式](/tools/libraries/angular-package-format) 的 Angular 库。 |
| `@angular-devkit/build-angular:browser-esbuild` | 使用 [esbuild](https://esbuild.github.io/) 打包在浏览器中运行的客户端应用。更多信息请参阅 [`browser-esbuild` 文档](/tools/cli/build-system-migration#manual-migration-to-the-compatibility-builder)。 |
| `@angular-devkit/build-angular:browser` | 使用 [webpack](https://webpack.js.org/) 打包在浏览器中运行的客户端应用。 |

由 `ng new` 生成的应用默认使用 `@angular/build:application`。
由 `ng generate library` 生成的库默认使用 `@angular/build:library`。

你可以通过查看某个项目的 `build` 目标，来确定该项目使用的是哪个构建器。

```json
{
  "projects": {
    "my-app": {
      "architect": {
        // `ng build` 会调用名为 `build` 的 Architect 目标。
        "build": {
          "builder": "@angular/build:application",
          …
        },
        "serve": { … }
        "test": { … }
        …
      }
    }
  }
}
```

本页讨论 `@angular/build:application` 的用法和选项。

## 输出目录

构建过程的结果会输出到一个目录中（默认为 `dist/${PROJECT_NAME}`）。

## 配置体积预算

随着应用功能的增加，应用的体积也会随之增长。
CLI 允许你在配置中设置体积阈值，以确保应用的各个部分不会超出你定义的体积范围。

在 CLI 配置文件 `angular.json` 中，为每个 [已配置的环境](/tools/cli/environments) 在 `budgets` 部分中定义体积范围。

```json
{
  …
  "configurations": {
    "production": {
      …
      "budgets": [
        {
          "type": "initial",
          "maximumWarning": "250kb",
          "maximumError": "500kb"
        },
      ]
    }
  }
}
```

你可以为整个应用以及应用的特定部分指定体积预算。
每个预算条目都会配置一种指定类型的预算。
例如，`initial` 预算衡量的是用于引导应用的 JavaScript 和 CSS，它对应于构建输出摘要中显示的 `Initial Total` 值。
请使用以下格式指定体积值：

| 体积值 | 详情 |
| :-------------- | :-------------------------------------------------------------------------- |
| `123` 或 `123b` | 以字节为单位的体积。 |
| `123kb` | 以千字节为单位的体积。 |
| `123mb` | 以兆字节为单位的体积。 |
| `12%` | 相对于基线的体积百分比。（不适用于基线值。） |

配置预算后，当应用的某个部分达到或超过你设置的体积上限时，构建器就会发出警告或报告错误。

每个预算条目都是一个 JSON 对象，包含以下属性：

| 属性 | 值 |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| type | 预算的类型。可选值之一：<table> <thead> <tr> <th> 值 </th> <th> 详情 </th> </tr> </thead> <tbody> <tr> <td> <code>bundle</code> </td> <td> 某个特定包的体积。将此类型与 <code>name</code> 配合使用，可以为某个特定的包（包括延迟加载的包）设置预算。 </td> </tr> <tr> <td> <code>initial</code> </td> <td> 引导应用所需的 JavaScript 和 CSS 的体积。它对应于构建输出摘要中显示的 <code>Initial Total</code> 值。默认在 500kb 时警告，在 1mb 时报错。 </td> </tr> <tr> <td> <code>allScript</code> </td> <td> 所有脚本的体积。 </td> </tr> <tr> <td> <code>all</code> </td> <td> 整个应用的体积。 </td> </tr> <tr> <td> <code>anyComponentStyle</code> </td> <td> 任意一个组件样式表的体积。默认在 4kb 时警告，在 8kb 时报错。 </td> </tr> <tr> <td> <code>anyScript</code> </td> <td> 任意一个脚本的体积。 </td> </tr> <tr> <td> <code>any</code> </td> <td> 任意一个文件的体积。 </td> </tr> </tbody> </table> |
| name | `type=bundle` 时的包名。这是构建器报告的包名，而不是生成的输出文件名。 |
| baseline | 用于比较的基线体积。如果未设置，基线默认为 `0`，阈值会相对于该基线计算。 |
| maximumWarning | 相对于基线的最大警告阈值。 |
| maximumError | 相对于基线的最大错误阈值。 |
| minimumWarning | 相对于基线的最小警告阈值。 |
| minimumError | 相对于基线的最小错误阈值。 |
| warning | 相对于基线的警告阈值（同时用于最小值和最大值）。 |
| error | 相对于基线的错误阈值（同时用于最小值和最大值）。 |

要为延迟加载（Lazy Loading）的包配置预算，请使用 `type: "bundle"`，并将 `name` 设置为该包的名称。

```json
{
  "budgets": [
    {
      "type": "bundle",
      "name": "admin",
      "maximumWarning": "250kb",
      "maximumError": "300kb"
    }
  ]
}
```

`name` 字段匹配的是包名，而不是生成的文件名，因此它不支持 `admin.*.js` 这类通配符或正则表达式模式。

下面的例子展示了一个使用基线的预算：

```json
{
  "type": "bundle",
  "name": "main",
  "baseline": "200kb",
  "maximumWarning": "10%",
  "maximumError": "20%"
}
```

在这个例子中，当包的体积超过 `220kb` 时构建器会发出警告，超过 `240kb` 时则会报错。

## 配置 CommonJS 依赖

在整个应用及其依赖中，始终优先使用原生的 [ECMAScript 模块](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/import)（ESM）。
ESM 是一个完全标准化的 Web 标准和 JavaScript 语言特性，具有强大的静态分析支持。这让它的打包优化能力比其他模块格式更强。

Angular CLI 也支持在项目中导入 [CommonJS](https://nodejs.org/api/modules.html) 依赖，并会自动打包这些依赖。
不过，CommonJS 模块可能会妨碍打包器和压缩器有效地优化这些模块，从而导致包体积变大。
更多信息请参阅 [CommonJS 是如何让你的包变大的](https://web.dev/commonjs-larger-bundles)。

如果 Angular CLI 检测到你的浏览器应用依赖了 CommonJS 模块，就会输出警告。
当你遇到 CommonJS 依赖时，可以考虑请求维护者支持 ECMAScript 模块、自己贡献这一支持，或者改用其他能满足需求的依赖。
如果使用 CommonJS 依赖确实是最佳选择，你可以把该 CommonJS 模块的名称添加到 `angular.json` 中 `build` 选项的 `allowedCommonJsDependencies` 选项里，以禁用这些警告。

```json
"build": {
  "builder": "@angular/build:application",
  "options": {
     "allowedCommonJsDependencies": [
        "lodash"
     ]
     …
   }
   …
},
```

## 配置浏览器兼容性

Angular CLI 使用 [Browserslist](https://github.com/browserslist/browserslist) 来确保与不同浏览器版本的兼容性。
Angular 会根据所支持的浏览器，自动转换某些 JavaScript 和 CSS 特性，以确保构建出的应用不会使用受支持浏览器尚未实现的特性。不过，Angular CLI 不会自动添加 polyfill 来补充缺失的 Web API。请使用 `angular.json` 中的 `polyfills` 选项来添加 polyfill。

默认情况下，Angular CLI 使用的 `browserslist` 配置会 [匹配当前主版本的 Angular 所支持的浏览器](/reference/versions#browser-support)。

要覆盖内部配置，请运行 [`ng generate config browserslist`](https://angular.dev/cli/generate/config)，它会在项目目录中生成一个与 Angular 所支持浏览器相匹配的 `.browserslistrc` 配置文件。

关于如何针对特定浏览器和版本的更多示例，请参阅 [browserslist 仓库](https://github.com/browserslist/browserslist)。
不要把这个列表扩展到更多的浏览器。即使你的应用代码兼容性更广，Angular 本身也可能不兼容。
你只应该 _缩小_ 这个列表中的浏览器或版本范围。

::: tip 提示
使用 [browsersl.ist](https://browsersl.ist) 可以显示某个 `browserslist` 查询所兼容的浏览器。

:::

## 配置 Tailwind

Angular 支持 [Tailwind CSS](https://tailwindcss.com/)，这是一个实用工具优先（utility-first）的 CSS 框架。

要把 Tailwind CSS 与 Angular CLI 集成，请参阅 [在 Angular 中使用 Tailwind CSS](/guide/tailwind)

## 关键 CSS 内联

Angular 可以内联应用中的关键 CSS 定义，以改善 [首次内容绘制（FCP）](https://web.dev/first-contentful-paint)。
此选项默认启用。你可以在 [`styles` 自定义选项](/reference/configs/workspace-config#styles-optimization-options) 中禁用这种内联。

这项优化会提取渲染初始视口所需的 CSS，并将其直接内联到生成的 HTML 中，让浏览器无需等待完整的样式表加载完毕就能更快地显示内容。其余的 CSS 随后会在后台异步加载。Angular CLI 使用 [Beasties](https://github.com/danielroe/beasties) 来分析应用的 HTML 和样式。
