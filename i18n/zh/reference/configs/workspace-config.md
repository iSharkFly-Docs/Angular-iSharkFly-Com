# Angular 工作区配置

位于 Angular 工作区（workspace）根目录的 `angular.json` 文件提供了整个工作区范围以及特定项目（project）的配置默认值。Angular CLI 提供的构建和开发工具会使用这些配置。
配置中给出的路径值都是相对于工作区根目录的。

## 通用 JSON 结构

在 `angular.json` 的顶层，有几个属性用于配置工作区，另有一个 `projects` 区段包含其余的各项目配置选项（option）。
你可以用项目级别设置的默认值来覆盖在工作区级别设置的 Angular CLI 默认值。
你还可以通过命令行覆盖在项目级别设置的默认值。

文件顶层的下列属性用于配置工作区。

| 属性 | 详情 |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version` | 配置文件的版本。 |
| `newProjectRoot` | 通过 `ng generate application` 或 `ng generate library` 等工具创建新项目时所在的路径。路径可以是绝对路径，也可以是相对于工作区目录的路径。默认为 `projects` |
| `cli` | 一组用于自定义 [Angular CLI](/tools/cli) 的选项。参阅下文的 [Angular CLI 配置选项](#angular-cli-configuration-options)。 |
| `schematics` | 一组[原理图（Schematic）](/tools/cli/schematics)，用于自定义此工作区中 `ng generate` 子命令选项的默认值。参阅下文的[原理图](#schematics)。 |
| `projects` | 为工作区中的每个应用或库各包含一个子区段，其中是特定于该项目的配置选项。 |

使用 `ng new app-name` 创建的初始应用会列在 "projects" 下：

当你使用 `ng generate library` 创建库项目时，该库项目也会被添加到 `projects` 区段中。

::: tip 提示
配置文件中的 `projects` 区段与工作区的文件结构并不完全对应。

:::

<!-- markdownlint-disable-next-line MD032 -->

- 由 `ng new` 创建的初始应用位于工作区文件结构的顶层。
- 其他应用和库默认位于 `projects` 目录下。

更多信息请参阅[工作区与项目文件结构](/reference/configs/file-structure)。

## Angular CLI 配置选项

下列属性是一组用于自定义 Angular CLI 的选项。

| 属性 | 详情 | 值类型 | 默认值 |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :------------ |
| `analytics` | 与 Angular 团队共享匿名使用数据。布尔值表示是否共享数据，而 UUID 字符串表示使用假名标识符共享数据。 | `boolean` \| `string` | `false` |
| `cache` | 控制 [Angular CLI 构建器](/tools/cli/cli-builder)所使用的[持久化磁盘缓存](https://angular.dev/cli/cache)。 | [缓存选项](#cache-options) | `{}` |
| `schematicCollections` | 列出 `ng generate` 中要使用的原理图集合。 | `string[]` | `[]` |
| `packageManager` | 首选使用的包管理器工具。 | `npm` \| `pnpm` \| `yarn` \| `bun` | `npm` |
| `warnings` | 控制 Angular CLI 特有的控制台警告。 | [警告选项](#warnings-options) | `{}` |

### 缓存选项

| 属性 | 详情 | 值类型 | 默认值 |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------- | :--------------- |
| `enabled` | 配置是否为构建启用磁盘缓存。 | `boolean` | `true` |
| `environment` | 配置在哪种环境下启用磁盘缓存。<br><br>_ `ci` 仅在持续集成（CI）环境中启用缓存。<br>_ `local` 仅在 CI 环境*之外*启用缓存。<br>\* `all` 在所有环境中都启用缓存。 | `local` \| `ci` \| `all` | `local` |
| `path` | 用于存储缓存结果的目录。 | `string` | `.angular/cache` |

### 警告选项

| 属性 | 详情 | 值类型 | 默认值 |
| :---------------- | :------------------------------------------------------------------------------ | :--------- | :------------ |
| `versionMismatch` | 当全局 Angular CLI 版本比本地版本更新时显示警告。 | `boolean` | `true` |

## 项目配置选项

每个项目都可以在 `projects['project-name']` 下使用下列顶层配置属性。

| 属性 | 详情 | 值类型 | 默认值 |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- | :-------------- |
| `root` | 此项目文件的根目录，相对于工作区目录。对于位于工作区顶层的初始应用，此值为空。 | `string` | 无（必填） |
| `projectType` | "application" 或 "library" 之一。应用可以在浏览器中独立运行，而库不能。 | `application` \| `library` | 无（必填） |
| `sourceRoot` | 此项目源文件的根目录。 | `string` | `''` |
| `prefix` | 使用 `ng generate` 生成新的组件、指令和管道时，Angular 添加到选择器前面的字符串。可以自定义，以标识某个应用或功能区域。 | `string` | `'app'` |
| `i18n` | 项目的国际化选项。定义源语言环境以及要构建的其他语言环境。参阅[在构建配置中定义语言环境](/guide/i18n/merge#define-locales-in-the-build-configuration)。 | 参阅 [i18n 选项](#i18n-options) | `{}` |
| `schematics` | 一组原理图，用于自定义此项目中 `ng generate` 子命令选项的默认值。参阅[生成原理图](#schematics)一节。 | 参阅[原理图](#schematics) | `{}` |
| `architect` | 此项目的 Architect 构建器目标（target）的配置默认值。 | 参阅[配置构建器目标](#configuring-builder-targets) | `{}` |

## i18n 选项

使用项目的 `i18n` 选项来定义应用的源语言环境以及要构建的其他语言环境。

| 属性 | 详情 | 值类型 | 默认值 |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ | :------------ |
| `sourceLocale` | 应用源代码所使用的语言环境。可以是语言环境标识符字符串，也可以是[配置对象](#sourcelocale-object)。 | `string` \| [sourceLocale 对象](#sourcelocale-object) | `"en-US"` |
| `locales` | 从语言环境标识符到翻译文件或[语言环境配置对象](#locale-object)的映射。 | `object` | `{}` |

### `sourceLocale` 对象

传入对象而不是字符串，可以为源语言环境自定义输出目录或基础 HREF：

| 属性 | 详情 | 值类型 | 默认值 |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :------------ |
| `code` | 源语言环境标识符。 | `string` | `"en-US"` |
| `baseHref` | 覆盖此语言环境的 HTML `<base href>`。输出目录名称仍保持为语言环境代码。不能与 `subPath` 同时使用。 | `string` | 语言环境代码 |
| `subPath` | 同时设置此语言环境的输出目录名称和 HTML `<base href>`。不能与 `baseHref` 同时使用。 | `string` | 语言环境代码 |

### 语言环境对象

每个 `locales` 条目可以是一个路径字符串、一个路径数组，或者一个对象：

| 属性 | 详情 | 值类型 | 默认值 |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- | :------------ |
| `translation` | 此语言环境的翻译文件路径（一个或多个）。 | `string` \| `string[]` | |
| `baseHref` | 覆盖此语言环境的 HTML `<base href>`。输出目录名称仍保持为语言环境标识符。不能与 `subPath` 同时使用。 | `string` | 语言环境代码 |
| `subPath` | 同时设置此语言环境的输出目录名称和 HTML `<base href>`。不能与 `baseHref` 同时使用。 | `string` | 语言环境代码 |

::: tip 提示
当你还需要重命名输出目录时，请使用 `subPath` 而不是 `baseHref`——例如，输出到 `de-DE/` 而不是 `de/`。

:::

## 原理图

[Angular 原理图](/tools/cli/schematics)是通过添加新文件或修改现有文件来修改项目的指令。
可以通过把原理图名称映射到一组默认选项来配置它们。

原理图的「名称」格式为：`<schematic-package>:<schematic-name>`。
默认的 Angular CLI `ng generate` 子命令所对应的原理图都收录在 [`@schematics/angular`](https://github.com/angular/angular-cli/blob/main/packages/schematics/angular/application/schema.json) 包中。
例如，使用 `ng generate component` 生成组件的原理图是 `@schematics/angular:component`。

原理图 schema 中给出的字段，对应于 Angular CLI 子命令选项所允许的命令行参数值及其默认值。
你可以更新工作区的 schema 文件，为子命令选项设置不同的默认值。例如，要在 `ng generate component` 中默认禁用 `standalone`：

```json
{
  "projects": {
    "my-app": {
      "schematics": {
        "@schematics/angular:component": {
          "standalone": false
        }
      }
    }
  }
}
```

## 配置 CLI 构建器

Architect 是 Angular CLI 用来执行编译、运行测试等复杂任务的工具。
Architect 是一个外壳程序，它会根据目标配置，运行指定的构建器（builder）来执行给定的任务。
你可以定义和配置新的构建器和目标，以扩展 Angular CLI。
参阅 [Angular CLI 构建器](/tools/cli/cli-builder)。

### 默认的 Architect 构建器和目标

Angular 定义了一些默认构建器，用于特定命令或通用的 `ng run` 命令。
为这些构建器定义选项和默认值的 JSON schema 都收录在 [`@angular/build`](https://github.com/angular/angular-cli/blob/main/packages/angular/build/builders.json) 包中。
这些 schema 为下列构建器配置选项。

### 配置构建器目标

`angular.json` 的 `architect` 区段包含一组 Architect 目标。
许多目标与运行它们的 Angular CLI 命令相对应。
其他目标可以使用 `ng run` 命令执行，你也可以定义自己的目标。

每个目标对象都为该目标指定了 `builder`，即 Architect 所运行工具的 npm 包。
每个目标还有一个 `options` 区段，用于配置该目标的默认选项；以及一个 `configurations` 区段，用于为该目标命名并指定备选配置。
参阅下文[构建目标](#build-target)中的示例。

| 属性 | 详情 |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build` | 配置 `ng build` 命令选项的默认值。更多信息请参阅[构建目标](#build-target)一节。 |
| `serve` | 配置 `ng serve` 命令选项的默认值。开发服务器有自己的选项，并使用其 `buildTarget` 选项中设置的构建目标来构建应用。 |
| `e2e` | 配置 `ng e2e` 命令选项的默认值，该命令用于运行端到端测试。`ng new` 不会生成此目标。在没有此目标的情况下运行 `ng e2e`，会提示你添加一个端到端测试包。 |
| `test` | 配置 `ng test` 命令选项的默认值。单元测试构建器使用其 `buildTarget` 选项中设置的构建目标来构建测试。 |
| `lint` | 配置 `ng lint` 命令选项的默认值，该命令对项目源文件执行静态代码分析。`ng new` 不会生成此目标。在没有此目标的情况下运行 `ng lint`，会提示你添加 `angular-eslint`。 |
| `extract-i18n` | 配置 `ng extract-i18n` 命令选项的默认值，该命令从源代码中提取本地化消息字符串，并输出用于国际化的翻译文件。 |

::: tip 提示
配置文件中的所有选项都必须使用 `camelCase`，而不是命令行中使用的 `dash-case`。

:::

## 构建目标

`architect` 下的每个目标都具有下列属性：

| 属性 | 详情 |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `builder` | 用于创建此目标的 CLI 构建器，格式为 `<package-name>:<builder-name>`。 |
| `options` | 构建目标的默认选项。 |
| `configurations` | 执行该目标时的备选配置。每个配置为其预期环境设置默认选项，覆盖 `options` 下的相应值。参阅下文的[备选构建配置](#alternate-build-configurations)。 |

例如，要配置一个禁用优化的构建：

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "optimization": false
          }
        }
      }
    }
  }
}
```

### 备选构建配置

Angular CLI 自带两种构建配置：`production` 和 `development`。
默认情况下，`ng build` 命令使用 `production` 配置，该配置会应用多项构建优化，包括：

- 打包文件
- 尽量减少多余的空白
- 移除注释和死代码
- 压缩代码，使用简短的混淆名称

你可以定义并命名适合你开发流程的其他备选配置（例如 `staging`）。
把配置名称传给 `--configuration` 命令行标志，即可选择相应的备选配置。

例如，要配置一个仅在生产构建（`ng build --configuration production`）时启用优化的构建：

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "optimization": false
          },
          "configurations": {
            "production": {
              "optimization": true
            }
          }
        }
      }
    }
  }
}
```

你也可以用逗号分隔的列表传入多个配置名称。
例如，要同时应用 `staging` 和 `french` 两个构建配置，请使用命令 `ng build --configuration staging,french`。
在这种情况下，命令会从左到右解析这些命名配置。
如果多个配置修改了同一项设置，则以最后设置的值为准。
在这个例子中，如果 `staging` 和 `french` 配置都设置了输出路径，那么最终会使用 `french` 中的值。

### 额外的构建和测试选项

默认构建或目标构建的可配置选项，通常与 [`ng build`](https://angular.dev/cli/build) 和 [`ng test`](https://angular.dev/cli/test) 命令的可用选项相对应。
关于这些选项及其可能取值的详细信息，请参阅 [Angular CLI 参考](/cli)。

| 选项属性 | 详情 |
| :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets` | 一个对象，包含要随应用一起提供的静态资源路径。默认路径指向项目的 `public` 目录。更多信息请参阅[资源配置](#assets-configuration)一节。 |
| `styles` | 一个 CSS 文件数组，这些文件会被添加到项目的全局上下文中。Angular CLI 支持 CSS 导入以及所有主流 CSS 预处理器。更多信息请参阅[样式和脚本配置](#styles-and-scripts-configuration)一节。 |
| `stylePreprocessorOptions` | 一个对象，包含要传给样式预处理器的选项-值对。更多信息请参阅[样式和脚本配置](#styles-and-scripts-configuration)一节。 |
| `inlineStyleLanguage` | 应用中组件内联样式所使用的样式表语言。可接受 `css`、`less`、`sass` 或 `scss`，默认为 `css`。 |
| `scripts` | 一个对象，包含要添加到应用中的 JavaScript 文件。这些脚本的加载方式与你在 `index.html` 中通过 `<script>` 标签添加它们完全相同。更多信息请参阅[样式和脚本配置](#styles-and-scripts-configuration)一节。 |
| `budgets` | 应用整体或部分的默认大小预算类型和阈值。你可以配置构建器在输出达到或超过阈值大小时报告警告或错误。参阅[配置大小预算](/tools/cli/build#configuring-size-budgets)。 |
| `fileReplacements` | 一个对象，包含文件及其编译时的替换文件。更多信息请参阅[配置特定于目标的文件替换](/tools/cli/environments#configure-environment-specific-defaults)。 |
| `index` | 用于加载应用的基础 HTML 文档。更多信息请参阅 [Index 配置](#index-configuration)。 |
| `security` | 一个用于配置安全特性的对象。更多信息请参阅[安全配置](#security-configuration)一节。 |

### 额外的 serve 选项

开发服务器有自己的一组选项，这些选项通常与 [`ng serve`](https://angular.dev/cli/serve) 命令的可用选项相对应。

| 选项属性 | 详情 |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `allowedHosts` | 开发服务器会响应的主机数组。此选项会设置 Vite 中的同名选项。更多详情请[参阅 Vite 文档](https://vite.dev/config/server-options.html#server-allowedhosts) |

## 复杂配置值

`assets`、`index`、`outputPath`、`styles` 和 `scripts` 选项既可以是简单的路径字符串值，也可以是带有特定字段的对象值。
`sourceMap` 和 `optimization` 选项可以设置为简单的布尔值，也可以在配置文件中为它们指定复杂值。

以下各节详细介绍了在每种情况下如何使用这些复杂值。

### 资源配置

每个 `build` 目标配置都可以包含一个 `assets` 数组，列出构建项目时要原样复制的文件或文件夹。
默认情况下，会复制 `public/` 目录中的内容。

要排除某个资源，可以将其从资源配置中移除。

你可以将资源指定为对象，而不是相对于工作区根目录的简单路径，从而进一步配置要复制的资源。
资源规范对象可以包含下列字段。

| 字段 | 详情 |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `glob` | 一个以 `input` 作为基础目录的 [node-glob](https://github.com/isaacs/node-glob/blob/main/README.md)。 |
| `input` | 相对于工作区根目录的路径。 |
| `output` | 相对于 `outDir` 的路径。出于安全考虑，Angular CLI 绝不会把文件写到项目输出路径之外。 |
| `ignore` | 要排除的 glob 列表。 |
| `followSymlinks` | 允许 glob 模式跟随符号链接目录，从而可以搜索符号链接的子目录。默认为 `false`。 |

例如，下面的资源对象会把 `src/assets/` 中的内容复制到 `/assets/`，并把 `src/favicon.ico` 复制到输出根目录。

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "src/assets/",
                "output": "/assets/"
              },
              {
                "glob": "favicon.ico",
                "input": "src/",
                "output": "/"
              }
            ]
          }
        }
      }
    }
  }
}
```

下面的示例使用 `ignore` 字段，把资源目录中的某些文件排除在构建复制之外：

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "src/assets/",
                "ignore": ["**/*.svg"],
                "output": "/assets/"
              }
            ]
          }
        }
      }
    }
  }
}
```

### 样式和脚本配置

`styles` 和 `scripts` 选项的数组条目可以是简单的路径字符串，也可以是指向额外入口点（entry point）文件的对象。
相关的构建器会在构建期间把该文件及其依赖项作为一个单独的包（bundle）加载。
使用配置对象时，你可以通过 `bundleName` 字段为该入口点的包命名。

包默认会被注入，但你可以把 `inject` 设置为 `false`，以便不注入该包。
例如，下面的对象值会创建并命名一个包含样式和脚本的包，并将其排除在注入之外：

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "styles": [
              {
                "input": "src/external-module/styles.scss",
                "inject": false,
                "bundleName": "external-module"
              }
            ],
            "scripts": [
              {
                "input": "src/external-module/main.js",
                "inject": false,
                "bundleName": "external-module"
              }
            ]
          }
        }
      }
    }
  }
}
```

#### 样式预处理器选项

在 Sass 中，你可以为组件样式和全局样式使用 `includePaths` 特性。它允许你添加额外的基础路径，供导入时查找。

要添加路径，请使用 `stylePreprocessorOptions` 选项：

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "stylePreprocessorOptions": {
              "includePaths": ["src/style-paths"]
            }
          }
        }
      }
    }
  }
}
```

该目录中的文件（例如 `src/style-paths/_variables.scss`）可以在项目的任何位置导入，无需使用相对路径：

```scss [src/app/app.scss]
// 相对路径可以使用
@import '../style-paths/variables';

// 现在这种写法也同样可以
@import 'variables';
```

::: tip 提示
默认的 `@angular/build:unit-test` 构建器没有 `styles` 或 `scripts` 选项。它会从其 `buildTarget` 选项中设置的构建目标继承 `styles` 和 `stylePreprocessorOptions`，但不会继承 `scripts`。
要在单元测试之前运行某个脚本，请把它添加到 `test` 目标的 `setupFiles` 选项中。
如果你的项目使用 `@angular/build:karma` 构建器，请把单元测试所需的样式或脚本添加到 `test` 目标中。
另请参阅[在应用中使用运行时全局库](/tools/libraries/using-libraries#using-runtime-global-libraries-inside-your-app)。

:::

### 优化配置

`optimization` 选项既可以是布尔值，也可以是用于更精细配置的对象。
此选项会对构建输出启用多种优化，包括：

- 压缩脚本和样式
- 摇树优化（Tree-shaking）
- 消除死代码
- [内联关键 CSS](/tools/cli/build#critical-css-inlining)
- 内联字体

有多个选项可用于微调应用的优化。

| 选项 | 详情 | 值类型 | 默认值 |
| :-------- | :------------------------------------------------------------- | :----------------------------------------------------------------------- | :------------ |
| `scripts` | 启用对脚本输出的优化。 | `boolean` | `true` |
| `styles` | 启用对样式输出的优化。 | `boolean` \| [样式优化选项](#styles-optimization-options) | `true` |
| `fonts` | 启用对字体的优化。此功能需要访问互联网。 | `boolean` \| [字体优化选项](#fonts-optimization-options) | `true` |

#### 样式优化选项

| 选项 | 详情 | 值类型 | 默认值 |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------- | :--------- | :------------ |
| `minify` | 通过移除多余的空白和注释、合并标识符以及最小化取值来压缩 CSS 定义。 | `boolean` | `true` |
| `inlineCritical` | 提取并内联关键 CSS 定义，以改善[首次内容绘制（First Contentful Paint）](https://web.dev/first-contentful-paint)。 | `boolean` | `true` |
| `removeSpecialComments` | 移除全局 CSS 中包含 `@license` 或 `@preserve`、或者以 `//!` 或 `/*!` 开头的注释。 | `boolean` | `true` |

#### 字体优化选项

| 选项 | 详情 | 值类型 | 默认值 |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------- | :------------ |
| `inline` | 通过把外部 Google Fonts 和 Adobe Fonts 的 CSS 定义内联到应用的 HTML 索引文件中，来减少[阻塞渲染的请求](https://web.dev/render-blocking-resources)。此功能需要访问互联网。 | `boolean` | `true` |

你可以提供类似下面的值，只对其中某一部分应用优化：

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "optimization": {
              "scripts": true,
              "styles": {
                "minify": true,
                "inlineCritical": true
              },
              "fonts": true
            }
          }
        }
      }
    }
  }
}
```

### 源码映射配置

`sourceMap` 构建器选项既可以是布尔值，也可以是用于更精细配置的对象，用来控制应用的源码映射（source map）。

| 选项 | 详情 | 值类型 | 默认值 |
| :--------------- | :----------------------------------------------------------- | :--------- | :------------ |
| `scripts` | 为所有脚本输出源码映射。 | `boolean` | `true` |
| `styles` | 为所有样式输出源码映射。 | `boolean` | `true` |
| `vendor` | 解析第三方（vendor）包的源码映射。 | `boolean` | `false` |
| `hidden` | 在输出的 JavaScript 中省略指向源码映射的链接。 | `boolean` | `false` |
| `sourcesContent` | 在源码映射中输出文件的原始源代码内容。 | `boolean` | `true` |

下面的示例展示了如何切换一个或多个值来配置源码映射的输出：

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "sourceMap": {
              "scripts": true,
              "styles": false,
              "hidden": true,
              "vendor": true
            }
          }
        }
      }
    }
  }
}
```

::: tip 提示
使用隐藏的源码映射时，包中不会引用源码映射。
如果你只想让源码映射在错误报告工具中映射堆栈跟踪，而不希望它们出现在浏览器开发者工具中，这种方式就很有用。
请注意，尽管 `hidden` 会阻止在输出包中链接源码映射，但你的部署流程仍必须注意不要在生产环境中提供生成的源码映射文件，否则相关信息依然会泄露。

:::

#### 不含源码内容的源码映射

你可以生成不包含 `sourcesContent` 字段（该字段包含原始源代码）的源码映射。
这样，你就可以把源码映射部署到生产环境，以便借助原始源码名称获得更好的错误报告，同时又能防止源代码泄露。

要从源码映射中排除源码内容，请把 `sourcesContent` 选项设置为 `false`：

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "sourceMap": {
              "scripts": true,
              "styles": true,
              "sourcesContent": false
            }
          }
        }
      }
    }
  }
}
```

### Index 配置

配置应用 HTML 索引文件的生成方式。

`index` 选项既可以是字符串，也可以是用于更精细配置的对象。
把它设置为 `false` 则不生成 HTML 索引文件。

以字符串形式提供该值时，会使用指定路径的文件名作为生成文件的名称，并在应用所配置输出路径的根目录中创建该文件。

#### Index 选项

| 选项 | 详情 | 值类型 | 默认值 |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :--------------------------------------------------------- |
| `input` | 用于生成应用 HTML 索引文件的源文件路径。 | `string` | 无（必填） |
| `output` | 应用所生成 HTML 索引文件的输出路径。将使用所提供的完整路径，并视为相对于应用所配置的输出路径。 | `string` | `index.html` |
| `preloadInitial` | 为应用的初始文件和资源生成 `preload`、`modulepreload` 和 `preconnect` 链接元素。 | `boolean` | 启用 Service Worker 时为 `false`，否则为 `true` |

### 安全配置

`security` 选项是一个用于启用各项安全特性的对象。

| 选项 | 详情 |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `autoCsp` | 设置为 `true` 时生成基于哈希的内容安全策略（Content Security Policy）；设置为 `{"unsafeEval": true}` 时还会允许 `eval`。参阅[使用 `autoCsp` 对内联脚本进行哈希](/best-practices/security#hash-inline-scripts-with-autocsp)。 |
| `allowedHosts` | 允许访问服务端应用的主机名。参阅[防范服务端请求伪造（SSRF）](/best-practices/security#preventing-server-side-request-forgery-ssrf)。 |

### 输出路径配置

`outputPath` 选项既可以是字符串（将用作 `base` 值），也可以是用于更精细配置的对象。

有多个选项可用于微调应用的输出结构。

| 选项 | 详情 | 值类型 | 默认值 |
| :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :------------ |
| `base` | 指定相对于工作区根目录的输出路径。 | `string` | |
| `browser` | 浏览器构建产物的输出目录名称，位于基础输出路径之内。该目录可以安全地提供给用户访问。 | `string` | `browser` |
| `server` | 服务端构建产物的输出目录名称，位于基础输出路径之内。 | `string` | `server` |
| `media` | 媒体文件的输出目录名称，位于浏览器输出目录之内。这些媒体文件通常是 CSS 文件中引用的资源。 | `string` | `media` |
