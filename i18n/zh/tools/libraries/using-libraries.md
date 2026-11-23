# 使用发布到 npm 的 Angular 库

构建 Angular 应用时，你可以充分利用成熟的官方库，以及丰富的第三方库生态。
[Angular Material][AngularMaterialMain] 就是一个成熟官方库的例子。

## 安装库

库以 [npm 包][GuideNpmPackages]的形式发布，通常还会附带用于将其与 Angular CLI 集成的原理图（Schematic）。
要把可复用的库代码集成到应用中，你需要安装这个包，并在使用的位置导入它提供的功能。
对于大多数已发布的 Angular 库，可以使用 Angular CLI 命令 `ng add <lib_name>`。

Angular CLI 命令 `ng add` 会使用包管理器安装库包，并调用包中附带的原理图，在项目代码中生成其他脚手架内容。
包管理器的例子包括 [npm][NpmjsMain] 或 [yarn][YarnpkgMain]。
项目代码中额外生成的脚手架内容包括 import 语句、字体和主题。

已发布的库通常会提供一个 `README` 文件或其他文档，说明如何将该库添加到你的应用中。
例如，请参阅 [Angular Material][AngularMaterialMain] 的文档。

### 库的类型定义

通常，库包会在 `.d.ts` 文件中包含类型定义；可以参考 `node_modules/@angular/material` 中的例子。
如果你的库包中没有包含类型定义，并且 IDE 报错，你可能需要在安装库的同时安装 `@types/<lib_name>` 包。

例如，假设你有一个名为 `d3` 的库：

```shell

npm install d3 --save
npm install @types/d3 --save-dev

```

对于安装到工作区中的库，其 `@types/` 包中定义的类型会被自动添加到使用该库的项目的 TypeScript 配置中。
TypeScript 默认会在 `node_modules/@types` 目录中查找类型，因此你不必逐个添加每个类型包。

如果某个库在 `@types/` 中没有可用的类型定义，你可以手动为它添加类型定义后再使用。
具体做法如下：

1. 在 `src/` 目录中创建一个 `typings.d.ts` 文件。
   该文件会被自动作为全局类型定义包含进来。

1. 在 `src/typings.d.ts` 中添加以下代码：

   ```ts
   declare module 'host' {
     export interface Host {
       protocol?: string;
       hostname?: string;
       pathname?: string;
     }
     export function parse(url: string, queryString?: string): Host;
   }
   ```

1. 在使用该库的组件（Component）或文件中，添加以下代码：

   ```ts
   import * as host from 'host';
   const parsedUrl = host.parse('https://angular.dev');
   console.log(parsedUrl.hostname);
   ```

根据需要定义更多类型。

## 更新库

库可以由发布者进行更新，并且它自身也有各自的依赖项需要保持最新。
要检查已安装的库是否有更新，请使用 Angular CLI 命令 [`ng update`][CliUpdate]。

使用 Angular CLI 命令 `ng update <lib_name>` 更新单个库的版本。
Angular CLI 会检查该库最新发布的版本，如果最新版本比你已安装的版本更新，就会下载它并更新你的 `package.json` 以匹配最新版本。

当你将 Angular 更新到新版本时，需要确保你所使用的所有库都是最新的。
如果库之间存在相互依赖，你可能需要按特定顺序更新它们。
如需帮助，请参阅 [Angular 更新指南][AngularUpdateMain]。

## 将库添加到运行时全局作用域

如果某个旧式 JavaScript 库没有被导入到应用中，你可以把它添加到运行时全局作用域，并像通过 script 标签添加一样加载它。
可以在 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件中，使用构建目标的 `scripts` 和 `styles` 选项，让 Angular CLI 在构建时完成这项工作。

例如，要使用 [Bootstrap 4][GetbootstrapDocs40GettingStartedIntroduction] 库：

1. 使用 npm 包管理器安装该库及相关依赖：

   ```shell
     npm install jquery --save
     npm install popper.js --save
     npm install bootstrap --save
   ```

1. 在 `angular.json` 配置文件中，将相关的脚本文件添加到 `scripts` 数组中：

   ```json
     "scripts": [
         "node_modules/jquery/dist/jquery.slim.js",
         "node_modules/popper.js/dist/umd/popper.js",
         "node_modules/bootstrap/dist/js/bootstrap.js"
       ],
   ```

1. 将 CSS 文件 `bootstrap.css` 添加到 `styles` 数组中：

   ```json
     "styles": [
         "node_modules/bootstrap/dist/css/bootstrap.css",
         "src/styles.css"
     ],
   ```

1. 运行或重启 Angular CLI 命令 `ng serve`，即可看到 Bootstrap 4 在你的应用中生效。

### 在应用中使用运行时全局库

通过 "scripts" 数组导入库之后，**不要**再在 TypeScript 代码中使用 import 语句导入它。
下面的代码片段就是一个 import 语句的例子。

```ts
import * as $ from 'jquery';
```

如果你用 import 语句导入它，就会存在该库的两个不同副本：一个作为全局库导入，另一个作为模块导入。
对于像 jQuery 这样带插件的库来说，这种情况尤其糟糕，因为每个副本包含的插件各不相同。

正确的做法是运行 `npm install @types/jquery` 下载该库的类型定义，将 `"jquery"` 添加到 `tsconfig.app.json` 的 `types` 数组中，然后按照库的安装步骤操作。
这样你就可以访问该库所暴露的全局变量了。

### 为运行时全局库定义类型

如果你要使用的全局库没有全局类型定义，可以在 `src/typings.d.ts` 中手动将它们声明为 `any`。

例如：

```ts
declare var libraryName: any;
```

有些脚本会扩展其他库，例如 jQuery 插件：

```ts
$('.test').myPlugin();
```

在这种情况下，已安装的 `@types/jquery` 并不包含 `myPlugin`，因此你需要在 `src/typings.d.ts` 中添加一个接口。
例如：

```ts
interface JQuery {
  myPlugin(options?: any): any;
}
```

如果不为脚本定义的扩展添加接口，IDE 就会显示错误：

```text

[TS][Error] Property 'myPlugin' does not exist on type 'JQuery'

```

[CliUpdate]: cli/update 'ng update | CLI |Angular'
[GuideNpmPackages]: reference/configs/npm-packages 'Workspace npm dependencies | Angular'
[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
[Resources]: resources 'Explore Angular Resources | Angular'
[AngularMaterialMain]: https://material.angular.dev 'Angular Material | Angular'
[AngularUpdateMain]: /update-guide 'Angular Update Guide | Angular'
[GetbootstrapDocs40GettingStartedIntroduction]: https://getbootstrap.com/docs/4.0/getting-started/introduction 'Introduction | Bootstrap'
[NpmjsMain]: https://www.npmjs.com 'npm'
[YarnpkgMain]: https://yarnpkg.com ' Yarn'
