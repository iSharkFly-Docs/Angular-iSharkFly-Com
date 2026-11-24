# 工作区与项目文件结构 {#workspace-and-project-file-structure}

你在 Angular 工作区（workspace）的上下文中开发应用。
一个工作区包含一个或多个项目的文件。
项目是构成一个应用或一个可共享库的一组文件。

Angular CLI 的 `ng new` 命令会创建一个工作区。

```shell
ng new my-project
```

运行此命令时，CLI 会在一个新工作区中安装必要的 Angular npm 包及其他依赖，并创建一个名为 _my-project_ 的根级应用。

默认情况下，`ng new` 会在工作区的根级创建一个初始骨架应用。
这个骨架是一个简单的欢迎应用，可以直接运行，也易于修改。
根级应用与工作区同名，其源文件位于工作区的 `src/` 子文件夹中。

这种默认行为适合典型的“多仓库（multi-repo）”开发风格，即每个应用都位于各自的工作区中。
建议初学者和中级用户使用 `ng new` 为每个应用创建单独的工作区。

Angular 也支持包含[多个项目](#multiple-projects)的工作区。
这种开发环境适合正在开发可共享库的高级用户，
以及采用“单体仓库（monorepo）”开发风格的企业，即所有 Angular 项目使用单个仓库和全局配置。

要设置单体仓库工作区，应跳过创建根应用。
请参阅下文的[设置多项目工作区](#multiple-projects)。

## 工作区配置文件 {#workspace-configuration-files}

工作区中的所有项目共享同一份[配置](/reference/configs/workspace-config)。
工作区的顶层包含工作区级的配置文件、根级应用的配置文件，以及存放根级应用源文件和测试文件的子文件夹。

| 工作区配置文件 | 用途 |
| :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.editorconfig` | 代码编辑器的配置。请参阅 [EditorConfig](https://editorconfig.org)。 |
| `.gitignore` | 指定 [Git](https://git-scm.com) 应当忽略的、有意不纳入跟踪的文件。 |
| `README.md` | 工作区的文档。 |
| `angular.json` | 工作区中所有项目的 CLI 配置，包括如何构建、启动开发服务器和测试每个项目的配置选项。详情请参阅 [Angular 工作区配置](/reference/configs/workspace-config)。 |
| `package.json` | 配置工作区中所有项目都可使用的 [npm 包依赖](/reference/configs/npm-packages)。有关此文件的具体格式和内容，请参阅 [npm 文档](https://docs.npmjs.com/files/package.json)。 |
| `package-lock.json` | 提供 npm 客户端安装到 `node_modules` 中的所有包的版本信息。详情请参阅 [npm 文档](https://docs.npmjs.com/files/package-lock.json)。 |
| `src/` | 根级应用项目的源文件。 |
| `public/` | 包含图片及其他资源文件，这些文件由开发服务器作为静态文件提供，并在构建应用时原样复制。 |
| `node_modules/` | 为整个工作区安装的 [npm 包](/reference/configs/npm-packages)。工作区级的 `node_modules` 依赖对所有项目可见。 |
| `tsconfig.json` | 工作区中各项目的基础 [TypeScript](https://www.typescriptlang.org) 配置。所有其他配置文件都继承自这个基础文件。更多信息请参阅 [TypeScript 相关文档](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#tsconfig-bases)。 |

## 应用项目文件 {#application-project-files}

默认情况下，CLI 命令 `ng new my-app` 会创建一个名为 "my-app" 的工作区文件夹，并在工作区顶层的 `src/` 文件夹中生成一个新的应用骨架。
新生成的应用包含根组件（Component）及其模板（Template）的源文件。

工作区文件结构就绪后，你可以在命令行中使用 `ng generate` 命令为应用添加功能和数据。
这个初始的根级应用是 CLI 命令的 _默认应用_（除非你在创建[其他应用](#multiple-projects)之后更改了默认设置）。

对于单应用工作区，工作区的 `src` 子文件夹包含根应用的源文件（应用逻辑、数据和资源）。
对于多项目工作区，`projects` 文件夹中的其他项目都包含一个结构相同的 `project-name/src/` 子文件夹。

### 应用源文件 {#application-source-files}

`src/` 顶层的文件用于支持应用的运行。
子文件夹中包含应用源代码和应用专属的配置。

| 应用支持文件 | 用途 |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/` | 包含定义应用逻辑和数据的组件文件。详见下文。 |
| `index.html` | 有人访问你的网站时所提供的主 HTML 页面。CLI 在构建应用时会自动添加所有 JavaScript 和 CSS 文件，因此通常无需在这里手动添加任何 `<script>` 或`<link>` 标签。 |
| `main.ts` | 应用的主入口点（entry point）。 |
| `styles.css` | 应用于整个应用的全局 CSS 样式。 |

在 `src` 文件夹中，`app` 文件夹包含项目的逻辑和数据。
Angular 组件、模板和样式都放在这里。

| `src/app/` 文件 | 用途 |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app.config.ts` | 定义应用配置，告诉 Angular 如何组装应用。当你向应用中添加更多提供者（Provider）时，应在这里声明它们。<br><br>_仅在使用 `--standalone` 选项时生成。_ |
| `app.ts` | 定义应用的根组件，名为 `App`。当你向应用中添加组件和服务（Service）时，与此根组件关联的视图会成为视图层次结构的根。 |
| `app.html` | 定义与 `App` 关联的 HTML 模板。 |
| `app.css` | 定义 `App` 的 CSS 样式表。 |
| `app.spec.ts` | 定义 `App` 的单元测试。 |
| `app-module.ts` | 定义名为 `AppModule` 的根模块，告诉 Angular 如何组装应用。最初只声明了 `App` 组件。当你向应用中添加更多组件时，必须在这里声明它们。<br><br>_仅在使用 `--standalone false` 选项时生成。_ |
| `app.routes.ts` | 定义应用的路由配置。 |

### 应用配置文件 {#application-configuration-files}

根应用的应用专属配置文件位于工作区根级。
对于多项目工作区，项目专属的配置文件位于项目根目录 `projects/project-name/` 下。

项目专属的 [TypeScript](https://www.typescriptlang.org) 配置文件继承自工作区级的 `tsconfig.json`。

| 应用专属配置文件 | 用途 |
| :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsconfig.app.json` | 应用专属的 [TypeScript 配置](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)，包括 [Angular 编译器选项](/reference/configs/angular-compiler-options)。 |
| `tsconfig.spec.json` | 应用测试的 [TypeScript 配置](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)。 |

## 多个项目 {#multiple-projects}

多项目工作区适合那些为多个 Angular 项目使用单个仓库和全局配置的组织（即“单体仓库”模式）。
多项目工作区也支持库的开发。

### 设置多项目工作区 {#setting-up-for-a-multi-project-workspace}

如果你打算在一个工作区中包含多个项目，可以在创建工作区时跳过初始应用的生成，并为工作区指定一个唯一的名称。
以下命令会创建一个包含所有工作区级配置文件、但没有根级应用的工作区。

```shell
ng new my-workspace --no-create-application
```

然后，你就可以生成在工作区内名称唯一的应用和库了。

```shell
cd my-workspace
ng generate application my-app
ng generate library my-lib
```

### 多项目文件结构 {#multiple-project-file-structure}

第一个显式生成的应用会与工作区中的所有其他项目一起放入 `projects` 文件夹中。
新生成的库也会添加到 `projects` 下。
以这种方式创建项目时，工作区的文件结构与[工作区配置文件](/reference/configs/workspace-config) `angular.json` 的结构完全一致。

```markdown
my-workspace/
├── … (工作区级配置文件)
└── projects/ (应用和库)
├── my-app/ (显式生成的应用)
│ └── … (应用专属的代码和配置)
└── my-lib/ (生成的库)
└── … (库专属的代码和配置)
```

## 库项目文件 {#library-project-files}

当你使用 CLI 生成库时（例如使用 `ng generate library my-lib` 命令），生成的文件会放入工作区的 `projects/` 文件夹中。
关于如何创建你自己的库，请参阅[创建库](/tools/libraries/creating-libraries)。

与应用不同，库有自己的 `package.json` 配置文件。

在 `projects/` 文件夹下，`my-lib` 文件夹包含你的库代码。

| 库源文件 | 用途 |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib` | 包含库项目的逻辑和数据。与应用项目一样，库项目可以包含组件、服务、模块、指令和管道。 |
| `src/public-api.ts` | 指定从库的主入口点导出的所有文件。 |
| `package.json` | 为此库配置 [npm 包依赖](/reference/configs/npm-packages)和入口点（`exports`）。 |
| `tsconfig.lib.json` | 库专属的 [TypeScript 配置](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)，包括 [Angular 编译器选项](/reference/configs/angular-compiler-options)。 |
| `tsconfig.spec.json` | 库单元测试的 [TypeScript 配置](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)。 |
