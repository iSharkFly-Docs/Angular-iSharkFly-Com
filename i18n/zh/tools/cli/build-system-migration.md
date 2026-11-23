# Angular 应用构建系统

从 v17 开始，新的构建系统为构建 Angular 应用提供了一种更好的方式。这个新构建系统包括：

- 使用 ESM 的现代输出格式，并通过动态导入表达式支持模块的延迟加载（Lazy Loading）。
- 更快的构建性能，无论是首次构建还是增量重建。
- 更新的 JavaScript 生态工具，例如 [esbuild](https://esbuild.github.io/) 和 [Vite](https://vitejs.dev/)。
- 集成的服务端渲染（SSR）和预渲染能力。
- 全局样式表和组件样式表的自动热替换。

这个新构建系统已经稳定，并完全支持用于 Angular 应用。
使用 `browser` 构建器的应用可以迁移到新构建系统。
如果你使用的是自定义构建器，请查阅该构建器的文档，了解可能的迁移方式。

::: warning 重要
现有的基于 webpack 的构建系统和 `browser` 构建器均已弃用。
应用暂时可以继续使用 `browser` 构建器，项目也可以在升级时选择不迁移，但 Angular 团队建议迁移到新构建系统。

:::

## 新应用

新应用默认会通过 `application` 构建器使用这个新构建系统。

## 现有应用

根据项目的需求，可以选择自动迁移或手动迁移。
从 v18 开始，升级到新的主版本时，升级流程会询问你是否要通过自动迁移让现有应用使用新构建系统。
迁移之前，请先查看[已知问题](#known-issues)一节，其中可能包含与你的项目相关的信息。

::: tip 提示
如果使用了 SSR，请记得移除应用服务端代码中对 CommonJS 的所有假设，例如 `require`、`__filename`、`__dirname`，或 [CommonJS 模块作用域](https://nodejs.org/api/modules.html#the-module-scope)中的其他结构。所有应用代码都应兼容 ESM。这一点不适用于第三方依赖。

:::

### 自动迁移（推荐）

自动迁移会调整 `angular.json` 中的应用配置，同时修改代码和样式表，移除之前对 webpack 专有功能的使用。
虽然许多改动都可以自动完成，大多数应用也不需要再做其他修改，但每个应用都各不相同，可能仍需要一些手动修改。
迁移完成后，请尝试构建一次应用，因为可能会出现需要调整代码的新错误。
这些错误会尽可能给出问题的解决方案，本指南后面的章节也介绍了一些你可能遇到的常见情况。
通过 `ng update` 升级到新的主版本时，系统会询问你是否执行该迁移。
这项迁移完全是可选的，也可以在升级后的任何时候通过以下命令手动运行：

```shell

ng update @angular/cli --name use-application-builder

```

该迁移会执行以下操作：

- 把现有的 `browser` 或 `browser-esbuild` 目标转换为 `application`
- 移除之前所有的 SSR 构建器（因为现在由 `application` 负责这些工作）。
- 相应地更新配置。
- 把 `tsconfig.server.json` 合并到 `tsconfig.app.json` 中，并添加 TypeScript 选项 `"esModuleInterop": true`，以确保 `express` 的导入[符合 ESM 规范](#esm-default-imports-vs-namespace-imports)。
- 更新应用服务端代码，以使用新的引导方式和输出目录结构。
- 移除样式表中对 webpack 专有构建器特性的使用，例如 `@import`/`url()` 中的波浪号或脱字符，并更新配置以提供等效的行为
- 如果没有发现对 `@angular-devkit/build-angular` 的其他使用，则改为使用依赖更少的新 Node.js 包 `@angular/build`。

### 手动迁移

此外，对于现有项目，你也可以按应用逐个手动启用新构建器，有两种不同的选项。
这两种选项都被视为稳定版本，并得到 Angular 团队的完整支持。
选择哪一种，取决于迁移需要做多少修改，以及你希望在项目中使用哪些新功能。

- `browser-esbuild` 构建器只构建应用的客户端包，它被设计为与提供旧构建系统的现有 `browser` 构建器兼容。
  该构建器提供了等效的构建选项，在很多情况下，可以直接替换现有的 `browser` 应用。
- `application` 构建器覆盖整个应用，例如客户端包，还可以选择为服务端渲染构建服务器，并在构建时预渲染静态页面。

通常更推荐使用 `application` 构建器，因为它改进了服务端渲染（SSR）的构建，也让客户端渲染的项目将来更容易采用 SSR。
不过它需要稍多一些的迁移工作，尤其是对手动迁移的现有 SSR 应用而言。
如果你的项目难以采用 `application` 构建器，`browser-esbuild` 可能是更简单的方案，它能带来大部分构建性能上的好处，同时破坏性变更更少。

#### 手动迁移到兼容构建器

`@angular-devkit/build-angular` 包中提供了一个名为 `browser-esbuild` 的构建器，使用 `browser` 构建器的应用本来就已经依赖这个包。
你可以在使用 `browser` 构建器的应用中试用新构建系统。
如果你使用的是自定义构建器，请查阅该构建器的文档，了解可能的迁移方式。

兼容选项的目的是尽量减少应用初次迁移时所需的改动。
它通过一个替代构建器（`browser-esbuild`）提供。
你可以更新任意应用目标的 `build` 目标，以迁移到新构建系统。

下面是你在 `angular.json` 中通常会看到的应用配置：

```json
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
...
```

只需要修改 `builder` 字段即可。

```json
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser-esbuild",
...
```

#### 手动迁移到新的 `application` 构建器

`@angular-devkit/build-angular` 包中也提供了一个名为 `application` 的构建器。
通过 `ng new` 创建的新应用则使用 `@angular/build` 包中的同一个构建器（`@angular/build:application`）。

下面是你在 `angular.json` 中通常会看到的应用配置：

```json
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
...
```

第一步要修改的是 `builder` 字段。

```json
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:application",
...
```

修改构建器名称之后，还需要更新 `build` 目标中的选项。
下面列出了所有需要调整的 `browser` 构建器选项。

- `main` 应重命名为 `browser`。
- `polyfills` 应该是一个数组，而不是单个文件。
- `buildOptimizer` 应移除，因为 `optimization` 选项已经涵盖了它。
- `resourcesOutputPath` 应移除，现在它始终是 `media`。
- `vendorChunk` 应移除，因为它是一项已不再需要的性能优化。
- `commonChunk` 应移除，因为它是一项已不再需要的性能优化。
- `ngswConfigPath` 应重命名为 `serviceWorker`。

如果应用目前没有使用 SSR，那么这应该是让 `ng build` 正常工作的最后一步。
首次执行 `ng build` 后，可能会因为行为差异或应用使用了 webpack 专有功能而出现新的警告或错误。
许多警告都会给出修复建议。
如果你认为某个警告有误，或者解决方案不明确，请在 [GitHub](https://github.com/angular/angular-cli/issues) 上提交 issue。
此外，本指南后面的章节还提供了一些特定情况以及当前已知问题的补充信息。

对于新接入 SSR 的应用，[Angular SSR 指南](/guide/ssr)提供了为应用添加 SSR 的设置过程的更多信息。

对于已经在使用 SSR 的应用，还需要做一些额外调整，以更新应用服务器来支持新的集成 SSR 能力。
`application` 构建器现在为以下所有旧构建器提供了集成的功能：

- `app-shell`
- `prerender`
- `server`
- `ssr-dev-server`

`ng update` 流程会自动移除对 `@nguniversal` 作用域下各个包的使用，其中一些构建器以前就位于这些包中。
升级期间还会自动添加并使用新的 `@angular/ssr` 包，同时调整相关配置和代码。
`@angular/ssr` 包既支持 `browser` 构建器，也支持 `application` 构建器。

## 执行构建

更新应用配置后，可以像以前一样使用 `ng build` 执行构建。
根据所选的构建器迁移方式，部分命令行选项可能会有所不同。
如果构建命令包含在 `npm` 或其他脚本中，请确保检查并更新这些脚本。
对于已迁移到 `application` 构建器并使用 SSR 和/或预渲染的应用，由于 `ng build` 已经集成了 SSR 支持，你或许还可以从脚本中移除多余的 `ng run` 命令。

```shell

ng build

```

## 启动开发服务器

开发服务器会自动检测新构建系统，并用它来构建应用。
要启动开发服务器，无需修改 `dev-server` 构建器的配置或命令行。

```shell

ng serve

```

你可以继续在开发服务器中使用以前用过的[命令行选项](https://angular.dev/cli/serve)。

::: tip 提示
使用开发服务器时，在服务器初始化期间，你可能会在启动时看到短暂的无样式内容闪烁（FOUC）。
开发服务器会尽量把样式表的处理推迟到首次使用时，以缩短重建时间。
在开发服务器之外的构建中不会出现这种情况。

:::

### 模块热替换

模块热替换（HMR）是开发服务器使用的一种技术，用于在应用只有部分内容发生变化时避免重新加载整个页面。
在很多情况下，变更可以立即显示在浏览器中，从而在开发应用时改善「编辑 / 刷新」的循环体验。
虽然目前还不支持通用的基于 JavaScript 的模块热替换（HMR），但提供了以下几种更具体的 HMR 形式：

- **全局样式表**（`styles` 构建选项）
- **组件样式表**（内联和基于文件的）
- **组件模板**（内联和基于文件的）

HMR 功能会自动启用，无需修改任何代码或配置即可使用。
无论是基于文件的（`templateUrl`/`styleUrl`/`styleUrls`）还是内联的（`template`/`styles`）组件样式和模板，Angular 都提供 HMR 支持。
当检测到只有样式表发生变化时，构建系统会尽量只编译和处理最少量的应用代码。

如果需要，可以把开发服务器的 `hmr` 选项设置为 `false` 来禁用 HMR 功能。
也可以在命令行中通过以下方式修改：

```shell

ng serve --no-hmr

```

### 用 Vite 作为开发服务器

目前 Angular CLI 对 Vite 的使用_仅限于开发服务器_。即使不使用底层的 Vite 构建系统，Vite 也提供了一个功能完备、支持客户端的开发服务器，并被打包成一个依赖很少的 npm 包。这使它非常适合用来提供全面的开发服务器功能。当前的开发服务器流程会使用新构建系统在内存中生成应用的开发构建，然后把结果交给 Vite 来提供应用服务。与基于 Webpack 的开发服务器一样，Vite 的使用被封装在 Angular CLI 的 `dev-server` 构建器中，目前无法直接配置。

### 预打包

预打包可以缩短使用开发服务器时的构建和重建时间。
Vite 提供了[预打包能力](https://vite.dev/guide/dep-pre-bundling)，在使用 Angular CLI 时默认启用。
预打包过程会分析项目中所有的第三方依赖，并在第一次运行开发服务器时处理它们。
这样就不必在每次重建或运行开发服务器时都重新构建和打包项目的依赖。

大多数情况下无需额外的自定义。不过，以下一些情况可能需要自定义：

- 自定义依赖内部导入的加载器行为，例如 [`loader` 选项](#file-extension-loader-customization)
- 在开发时把某个依赖符号链接到本地代码，例如 [`npm link`](https://docs.npmjs.com/cli/v10/commands/npm-link)
- 绕过某个依赖在预打包时遇到的错误

如果项目需要，可以完全禁用预打包，也可以排除个别依赖。
可以使用 `dev-server` 构建器的 `prebundle` 选项进行这些自定义。
要排除特定依赖，可以使用 `prebundle.exclude` 选项：

```json
    "serve": {
      "builder": "@angular/build:dev-server",
      "options": {
        "prebundle": {
          "exclude": ["some-dep"]
        }
      },
```

`prebundle` 默认设置为 `true`，也可以设置为 `false` 来完全禁用预打包。
不过，更推荐排除特定依赖，因为禁用预打包会增加重建时间。

```json
    "serve": {
      "builder": "@angular/build:dev-server",
      "options": {
        "prebundle": false
      },
```

## 新功能

应用构建系统的主要好处之一是构建和重建速度的提升。
此外，新的应用构建系统还提供了一些 `browser` 构建器所没有的功能。

::: warning 重要
这里介绍的 `application` 构建器新功能，默认与 `@angular-devkit/build-angular:karma` 测试构建器不兼容，因为该测试构建器内部使用的是 `browser` 构建器。
用户可以把该构建器的 `builderMode` 选项设置为 `application`，以选择使用 `application` 构建器。
`@angular/build:karma` 和 `@angular/build:unit-test` 构建器始终使用 `application` 构建器。
如果你发现任何问题，请[在这里](https://github.com/angular/angular-cli/issues)报告。

:::

### 使用 `define` 在构建时替换值

`define` 选项可以在构建时把代码中出现的标识符替换为另一个值。
这与 Webpack 的 `DefinePlugin` 的行为类似，以前一些使用第三方构建器的自定义 Webpack 配置会用到它。
该选项既可以在 `angular.json` 配置文件中使用，也可以在命令行中使用。
如果值是常量并且可以提交到源代码管理中，那么在 `angular.json` 中配置 `define` 会很有用。

在配置文件中，该选项是一个对象。
对象的键表示要替换的标识符，对象的值表示该标识符对应的替换值。
示例如下：

```json
  "build": {
    "builder": "@angular/build:application",
    "options": {
      ...
      "define": {
          "SOME_NUMBER": "5",
          "ANOTHER": "'this is a string literal, note the extra single quotes'",
          "REFERENCE": "globalThis.someValue.noteTheAbsentSingleQuotes"
      }
    }
  }
```

::: tip 提示
在配置文件中，所有替换值都以字符串形式定义。
如果替换值本身应该是一个字符串字面量，就需要用单引号把它括起来。
这样就可以灵活地使用任意有效的 JSON 类型或另一个标识符作为替换值。

:::

对于每次构建可能都不同的值，例如 git 提交哈希或环境变量，更推荐使用命令行方式。
CLI 会把命令行中的 `--define` 值与 `angular.json` 中的 `define` 值合并，在构建中同时使用两者。
如果同一个标识符在两处都存在，则命令行中的值优先。
在命令行中使用时，`--define` 选项的格式为 `IDENTIFIER=VALUE`。

```shell
ng build --define SOME_NUMBER=5 --define "ANOTHER='these will overwrite existing'"
```

也可以有选择地把环境变量包含到构建中。
对于非 Windows 的 shell，如果愿意，可以直接对哈希字面量两侧的引号进行转义。
这个示例假设使用类 bash 的 shell，不过其他 shell 也有类似的用法。

```shell
export MY_APP_API_HOST="http://example.com"
export API_RETRY=3
ng build --define API_HOST=\'$MY_APP_API_HOST\' --define API_RETRY=$API_RETRY
```

无论采用哪种方式，TypeScript 都需要知道这些标识符的类型，以免在构建时出现类型检查错误。
可以在应用源代码中添加一个类型定义文件（例如 `src/types.d.ts`）来实现，内容类似于：

```ts
declare const SOME_NUMBER: number;
declare const ANOTHER: string;
declare const GIT_HASH: string;
declare const API_HOST: string;
declare const API_RETRY: number;
```

默认的项目配置已经设置为使用项目源代码目录中的所有类型定义文件。
如果修改过项目的 TypeScript 配置，可能需要调整配置以引用这个新添加的类型定义文件。

::: warning 重要
该选项不会替换 Angular 元数据中的标识符，例如组件（Component）或指令（Directive）装饰器中的标识符。

:::

### 按文件扩展名自定义加载器

::: warning 重要
此功能仅在 `application` 构建器中可用。

:::

有些项目可能需要控制具有特定扩展名的所有文件如何被加载并打包进应用。
使用 `application` 构建器时，可以用 `loader` 选项来处理这些情况。
该选项允许项目为指定的文件扩展名定义要使用的加载器类型。
之后，就可以在应用代码中通过 import 语句或动态导入表达式使用具有该扩展名的文件。
可用的加载器有：

- `text` - 把内容内联为 `string`，作为默认导出提供
- `binary` - 把内容内联为 `Uint8Array`，作为默认导出提供
- `file` - 把文件输出到应用的输出路径，并把该文件的运行时位置作为默认导出提供
- `dataurl` - 把内容内联为 [data URL](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)。
- `base64` - 把内容内联为 Base64 编码的字符串。
- `empty` - 把内容视为空，不会将其包含在包中

`empty` 值虽然不太常用，但对于兼容某些第三方库很有用，这些库可能包含需要移除的、特定于打包器的导入用法。
一个例子是对 CSS 文件的副作用导入（`import 'my.css';`），这种导入在浏览器中不起任何作用。
这时项目可以使用 `empty`，然后把这些 CSS 文件添加到 `styles` 构建选项中，或者使用其他注入方式。

loader 选项是一个对象形式的选项，其中键用于定义文件扩展名，值用于定义加载器类型。

下面这个构建选项示例会把 SVG 文件的内容内联到打包后的应用中：

```json
  "build": {
    "builder": "@angular/build:application",
    "options": {
      ...
      "loader": {
        ".svg": "text"
      }
    }
  }
```

然后就可以导入 SVG 文件了：

```ts
import contents from './some-file.svg';

console.log(contents); // <svg>...</svg>
```

此外，TypeScript 还需要知道导入的模块类型，以免在构建时出现类型检查错误。可以在应用源代码中添加一个类型定义文件（例如 `src/types.d.ts`）来实现，内容如下或类似：

```ts
declare module '*.svg' {
  const content: string;
  export default content;
}
```

默认的项目配置已经设置为使用项目源代码目录中的所有类型定义文件（`.d.ts` 文件）。如果修改过项目的 TypeScript 配置，可能需要调整 tsconfig 以引用这个新添加的类型定义文件。

### 通过导入属性自定义加载器

如果只有某些特定文件需要以特定方式加载，可以对加载行为进行逐文件的控制。
这是通过 `loader` [导入属性](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with)实现的，它既可用于 import 语句，也可用于 import 表达式。
导入属性的优先级高于所有其他加载行为，包括 JS/TS 以及任何 `loader` 构建选项的值。
如果要对某种原本不受支持的文件类型的所有文件进行统一加载，推荐使用 [`loader`](#file-extension-loader-customization) 构建选项。

导入属性支持以下加载器值：

- `text` - 把内容内联为 `string`，作为默认导出提供
- `binary` - 把内容内联为 `Uint8Array`，作为默认导出提供
- `file` - 把文件输出到应用的输出路径，并把该文件的运行时位置作为默认导出提供
- `dataurl` - 把内容内联为 [data URL](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)。
- `base64` - 把内容内联为 Base64 编码的字符串。

使用导入属性还有一个额外要求：TypeScript 的 `module` 选项必须设置为 `esnext` 或 `preserve`，TypeScript 才能成功构建应用代码。
新项目默认使用 `preserve`，因此无需修改。

目前，TypeScript 还不支持基于导入属性值的类型定义。
目前需要使用 `@ts-expect-error`/`@ts-ignore`，或者使用单独的类型定义文件（前提是该文件只会以相同的 loader 属性导入）。
例如，可以通过以下方式把 SVG 文件作为文本导入：

```ts
// @ts-expect-error TypeScript 目前还无法基于属性提供类型
import contents from './some-file.svg' with {loader: 'text'};
```

在异步函数中使用 import 表达式也可以实现同样的效果。

```ts
async function loadSvg(): Promise<string> {
  // @ts-expect-error TypeScript 目前还无法基于属性提供类型
  return import('./some-file.svg', {with: {loader: 'text'}}).then((m) => m.default);
}
```

对于 import 表达式，`loader` 的值必须是字符串字面量，以便进行静态分析。
如果该值不是字符串字面量，会发出警告。

当文件需要在运行时通过 `fetch()`、设置为图片元素的 `src` 或其他类似方式加载时，`file` 加载器非常有用。

```ts
// @ts-expect-error TypeScript 目前还无法基于属性提供类型
import imagePath from './image.webp' with {loader: 'file'};

console.log(imagePath); // media/image-ULK2SIIB.webp
```

当需要把文件作为编码字符串直接嵌入包中，以便之后用来构造 Data URL 时，`base64` 加载器非常有用。

```ts
// @ts-expect-error TypeScript 目前还无法基于属性提供类型
import logo from './logo.png' with {loader: 'base64'};

console.log(logo); // "iVBORw0KGgoAAAANSUhEUgAA..."
```

`dataurl` 加载器用于把资源内联为完整的 Data URL。

```ts
// @ts-expect-error TypeScript 目前还无法基于属性提供类型
import icon from './icon.svg' with {loader: 'dataurl'};

console.log(icon); // "data:image/svg+xml;..."
```

对于生产构建，如上面代码注释所示，路径中会自动加上哈希值，以便进行长期缓存。

::: tip 提示
使用开发服务器时，如果通过 `loader` 属性从某个 Node.js 包中导入文件，就必须通过开发服务器的 `prebundle` 选项把该包排除在预打包之外。

:::

### 导入 / 导出条件

项目可能需要根据构建类型，把某些导入路径映射到不同的文件。
这在某些场景下特别有用，例如 `ng serve` 需要使用调试 / 开发专用的代码，而 `ng build` 需要使用不包含任何开发功能 / 信息的代码。
为了满足这些项目需求，系统会自动应用以下几种导入 / 导出[条件](https://nodejs.org/api/packages.html#community-conditions-definitions)：

- 对于优化构建，会启用 `production` 条件。
- 对于非优化构建，会启用 `development` 条件。
- 对于浏览器端输出代码，会启用 `browser` 条件。

是否为优化构建由 `optimization` 选项的值决定。
当 `optimization` 设置为 `true`，或者更具体地说 `optimization.scripts` 设置为 `true` 时，该构建就被视为优化构建。
这一分类同时适用于 `ng build` 和 `ng serve`。
在新项目中，`ng build` 默认是优化构建，而 `ng serve` 默认是非优化构建。

在应用代码中利用这些条件的一个实用方法，是把它们与[子路径导入](https://nodejs.org/api/packages.html#subpath-imports)结合起来。
使用如下 import 语句：

```ts
import {verboseLogging} from '#logger';
```

就可以在 `package.json` 的 `imports` 字段中切换对应的文件：

```json
{
  ...
  "imports": {
    "#logger": {
      "development": "./src/logging/debug.ts",
      "default": "./src/logging/noop.ts"
    }
  }
}
```

对于同时使用 SSR 的应用，可以通过 `browser` 条件切换浏览器端和服务端代码：

```json
{
  ...
  "imports": {
    "#crashReporter": {
      "browser": "./src/browser-logger.ts",
      "default": "./src/server-logger.ts"
    }
  }
}
```

这些条件同样适用于 Node.js 包，以及包中定义的任何 [`exports`](https://nodejs.org/api/packages.html#conditional-exports)。

::: tip 提示
如果目前正在使用 `fileReplacements` 构建选项，这个功能或许可以取代它。

:::

## 已知问题

试用新构建系统时，目前可能会遇到几个已知问题。此列表会持续更新。如果其中任何问题当前阻碍了你试用新构建系统，请以后再来查看，因为它可能已经被解决了。

### Web Worker 代码的类型检查与嵌套 Web Worker 的处理

在应用代码中可以使用 Web Worker，语法（`new Worker(new URL('<workerfile>', import.meta.url))`）与 `browser` 构建器所支持的相同。
不过，Worker 内部的代码目前不会经过 TypeScript 编译器的类型检查。TypeScript 代码是受支持的，只是不进行类型检查。
此外，构建系统不会处理任何嵌套的 Worker。嵌套 Worker 是指在另一个 Worker 文件中实例化的 Worker。

### ESM 默认导入与命名空间导入

TypeScript 默认允许把默认导出作为命名空间导入，并在调用表达式中使用。
遗憾的是，这与 ECMAScript 规范存在差异。
新构建系统中的底层打包器（`esbuild`）期望的是符合规范的 ESM 代码。
如果你的应用对某个包使用了不正确的导入类型，构建系统现在会生成警告。
不过，要让 TypeScript 接受正确的用法，必须在应用的 `tsconfig` 文件中启用一个 TypeScript 选项。
启用后，[`esModuleInterop`](https://www.typescriptlang.org/tsconfig#esModuleInterop) 选项能更好地与 ECMAScript 规范保持一致，这也是 TypeScript 团队推荐的做法。
启用之后，你就可以在适用的地方把包的导入更新为符合 ECMAScript 规范的形式。

以 [`moment`](https://npmjs.com/package/moment) 包为例，下面的应用代码会导致运行时错误：

```ts
import * as moment from 'moment';

console.log(moment().format());
```

构建会生成一条警告，提示你存在潜在问题。警告内容类似于：

```text
▲ [WARNING] Calling "moment" will crash at run-time because it's an import namespace object, not a function [call-import-namespace]

    src/main.ts:2:12:
      2 │ console.log(moment().format());
        ╵             ~~~~~~

Consider changing "moment" to a default import instead:

    src/main.ts:1:7:
      1 │ import * as moment from 'moment';
        │        ~~~~~~~~~~~
        ╵        moment

```

不过，只要为应用启用 `esModuleInterop` TypeScript 选项，并把导入改为如下形式，就可以避免运行时错误和警告：

```ts
import moment from 'moment';

console.log(moment().format());
```

### 延迟加载模块中依赖顺序的副作用导入

如果某些 import 语句依赖特定的顺序，并且同时被多个延迟加载模块使用，可能会导致顶层语句以错误的顺序执行。
这种情况并不常见，因为它取决于是否使用了带副作用的模块，并且不适用于 `polyfills` 选项。
这是由底层打包器的一个[缺陷](https://github.com/evanw/esbuild/issues/399)引起的，会在未来的更新中修复。

::: warning 重要
无论使用哪种构建系统，都建议尽量避免使用具有非局部副作用的模块（polyfills 除外），这样也能避免这个问题。具有非局部副作用的模块还可能对应用体积和运行时性能产生负面影响。

:::

### 输出位置的变化

默认情况下，application 构建器构建成功后，包会位于 `dist/<project-name>/browser` 目录中（而不是 browser 构建器所用的 `dist/<project-name>`）。
这可能会破坏一些依赖之前位置的工具链。这种情况下，你可以[配置输出路径](/reference/configs/workspace-config#output-path-configuration)以满足需求。

## 缺陷报告

请在 [GitHub](https://github.com/angular/angular-cli/issues) 上报告问题和提交功能请求。

请尽可能提供一个最小复现，以帮助团队处理问题。
