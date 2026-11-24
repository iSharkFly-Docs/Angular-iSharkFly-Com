# 把翻译合并到应用中

要把已完成的翻译合并到项目中，请完成以下操作

1. 使用 [Angular CLI][CliMain] 构建项目可分发文件的一份副本
1. 使用 `"localize"` 选项把所有 i18n 消息替换为有效的翻译，并构建一个本地化的变体应用。
   变体应用是你的应用的可分发文件的一份完整副本，它针对单个语言环境（locale）进行了翻译。

合并翻译之后，使用服务端语言检测或不同的子目录来提供应用的每个可分发副本。

::: tip 提示
有关如何提供应用的每个可分发副本的更多信息，请参阅[部署多个语言环境](/guide/i18n/deploy)。

:::

对于应用的编译期翻译，构建过程会使用预先（AOT）编译来生成一个小巧、快速、可直接运行的应用。

::: tip 提示
有关构建过程的详细说明，请参阅[构建和启动 Angular 应用][GuideBuild]。
构建过程适用于 `.xlf` 格式的翻译文件（translation file），也适用于 Angular 能理解的其他格式，例如 `.xtb`。
有关 Angular 使用的翻译文件格式的更多信息，请参阅[修改源语言文件的格式][GuideI18nCommonTranslationFilesChangeTheSourceLanguageFileFormat]

:::

要为每个语言环境构建单独的应用可分发副本，请在项目的 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件中[在构建配置中定义语言环境][GuideI18nCommonMergeDefineLocalesInTheBuildConfiguration]。

这种方法无需为每个语言环境执行一次完整的应用构建，从而缩短了构建过程。

要[为每个语言环境生成应用变体][GuideI18nCommonMergeGenerateApplicationVariantsForEachLocale]，请在 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件中使用 `"localize"` 选项。
此外，要[从命令行构建][GuideI18nCommonMergeBuildFromTheCommandLine]，请使用带 `--localize` 选项的 [`build`][CliBuild] [Angular CLI][CliMain] 命令。

::: tip 提示
你还可以选择[只为一个语言环境应用特定的构建选项][GuideI18nCommonMergeApplySpecificBuildOptionsForJustOneLocale]，以实现自定义的语言环境配置。

:::

## 在构建配置中定义语言环境

在项目的 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件中使用 `i18n` 项目选项，为项目定义语言环境。

以下子选项用于指定源语言，并告诉编译器在哪里查找项目所支持的翻译。

| 子选项         | 详情                                                                                                                                                   |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceLocale` | 你在应用源代码中使用的语言环境 \(默认为 `en-US`\)。也可以是一个带有 `code`、`baseHref` 和 `subPath` 属性的对象。                                       |
| `locales`      | 从语言环境标识符到翻译文件的映射。每个条目也可以是一个带有 `translation`、`baseHref` 和 `subPath` 属性的对象。                                         |

有关 `i18n` 属性及其类型的完整列表，请参阅 [i18n 选项][GuideWorkspaceConfigI18n]。

### 针对 `en-US` 和 `fr` 的 `angular.json` 示例

例如，下面这段 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件的摘录把源语言环境设置为 `en-US`，并提供了法语 \(`fr`\) 语言环境翻译文件的路径。

```json [angular.json]
  "projects": {
    "angular.io-example": {
      "i18n": {
        "sourceLocale": "en-US",
        "locales": {
          "fr": {
            "translation": "src/locale/messages.fr.xlf",
          }
        }
      },
      "architect": {
      }
    }
  }
}
```

## 为每个语言环境生成应用变体

要在构建配置中使用你的语言环境定义，请在 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件中使用 `"localize"` 选项，告诉 CLI 要为该构建配置生成哪些语言环境。

- 把 `"localize"` 设置为 `true`，以构建之前在构建配置中定义的所有语言环境。
- 把 `"localize"` 设置为之前定义的语言环境标识符的一个子集数组，只构建这些语言环境的版本。
- 把 `"localize"` 设置为 `false`，以禁用本地化，不生成任何特定于语言环境的版本。

::: tip 提示
要本地化组件（component）模板（template），必须使用预先（AOT）编译。

:::

如果你修改过这项设置，请把 `"aot"` 设置为 `true` 以使用 AOT。

::: tip 提示
由于 i18n 的部署较为复杂，并且需要尽量缩短重新构建的时间，开发服务器一次只支持本地化单个语言环境。
如果你把 `"localize"` 选项设置为 `true` 或包含多个语言环境的数组，并使用 `ng serve`，开发服务器会记录一条警告并禁用本地化。
如果你想针对特定语言环境进行开发，请把 `"localize"` 选项设置为该语言环境。
例如，对于法语 \(`fr`\)，请指定 `"localize": ["fr"]`。

:::

CLI 会加载并注册语言环境数据，把生成的每个版本放到特定于语言环境的目录中，使其与其他语言环境版本分开，并把这些目录放在项目所配置的 `outputPath` 下。
对于每个应用变体，`html` 元素的 `lang` attribute 都会被设置为相应的语言环境。
CLI 还会把语言环境添加到所配置的 `baseHref` 中，从而为应用的每个版本调整 HTML 的 base HREF。

把 `"localize"` 属性设置为共享配置，以便所有配置都能有效地继承它。
此外，也可以设置该属性来覆盖其他配置。

### 在 `angular.json` 中构建所有语言环境的示例

下面的示例展示了在 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件中把 `"localize"` 选项设置为 `true`，从而构建在构建配置中定义的所有语言环境。

```json [angular.json]
"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
    "localize": true,
  },
```

## 从命令行构建

此外，也可以在 [`ng build`][CliBuild] 命令中搭配现有的 `production` 配置使用 `--localize` 选项。
CLI 会构建在构建配置中定义的所有语言环境。
如果你在构建配置中设置了语言环境，其效果类似于把 `"localize"` 选项设置为 `true`。

::: tip 提示
有关如何设置语言环境的更多信息，请参阅[为每个语言环境生成应用变体][GuideI18nCommonMergeGenerateApplicationVariantsForEachLocale]。

:::

```shell [commands.sh]
ng build --localize
```

## 只为一个语言环境应用特定的构建选项

要只为一个语言环境应用特定的构建选项，请指定单个语言环境来创建自定义的特定于语言环境的配置。

::: warning 重要
[Angular CLI][CliMain] 开发服务器 \(`ng serve`\) 只能与单个语言环境一起使用。

:::

### 为法语构建的示例

下面的示例展示了一个使用单个语言环境的自定义特定于语言环境的配置。

```json [angular.json]
  "build": {
    "configurations": {
      "fr": {
        "localize": ["fr"]
      }
    },
  },
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "configurations": {
      "fr": {
        "buildTarget": "angular.io-example:build:development,fr"
      }
    },
  },
}
```

把此配置传给 `ng serve` 或 `ng build` 命令。
下面的代码示例展示了如何启动法语语言文件。

```shell [commands.sh]
ng serve --configuration=fr
```

对于生产构建，请使用配置组合来同时运行这两个配置。

```shell [commands.sh]
ng build --configuration=production,fr
```

```json [angular.json]
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
    },
    "configurations": {
      "fr": {
        "localize": ["fr"]
      }
    },
  },
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "configurations": {
      "production": {
        "buildTarget": "angular.io-example:build:production"
      },
      "fr": {
        "buildTarget": "angular.io-example:build:development,fr"
      }
    },
  },
}
```

## 报告缺失的翻译

当缺少某条翻译时，构建会成功，但会生成一条警告，例如 `Missing translation for message "{translation_text}"`。
要配置 Angular 编译器所生成警告的级别，请指定以下级别之一。

| 警告级别      | 详情                                                 | 输出                                                   |
| :------------ | :--------------------------------------------------- | :----------------------------------------------------- |
| `error`       | 抛出错误，构建失败                                   | 不适用                                                 |
| `ignore`      | 不做任何处理                                         | 不适用                                                 |
| `warning`     | 在控制台或 shell 中显示默认警告                      | `Missing translation for message "{translation_text}"` |

在 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件中 `build` 目标的 `options` 部分指定警告级别。

### `angular.json` 中 `error` 警告的示例

下面的示例展示了如何把警告级别设置为 `error`。

```json [angular.json]
"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
    "i18nMissingTranslation": "error"
  },
```

::: tip 提示
当你把 Angular 项目编译成 Angular 应用时，`i18n` attribute 的各个实例会被替换为 [`$localize`][ApiLocalizeInitLocalize] 标记消息字符串的实例。
这意味着你的 Angular 应用是在编译之后才被翻译的。
这也意味着你可以创建 Angular 应用的本地化版本，而无需为每个语言环境重新编译整个 Angular 项目。

:::

当你翻译 Angular 应用时，*翻译转换*会用翻译集合中的字符串替换模板字面量字符串的各个部分 \(静态字符串和表达式\)，并对它们重新排序。
有关更多信息，请参阅 [`$localize`][ApiLocalizeInitLocalize]。

::: info 简而言之
只需编译一次，然后为每个语言环境进行翻译。

:::

## 下一步

- [部署多个语言环境](/guide/i18n/deploy)


[ApiLocalizeInitLocalize]: api/localize/init/$localize '$localize | init - localize - API | Angular'
[CliMain]: cli 'CLI Overview and Command Reference | Angular'
[CliBuild]: cli/build 'ng build | CLI | Angular'
[GuideBuild]: tools/cli/build 'Building and serving Angular apps | Angular'
[GuideI18nCommonMergeApplySpecificBuildOptionsForJustOneLocale]: guide/i18n/merge#apply-specific-build-options-for-just-one-locale 'Apply specific build options for just one locale - Merge translations into the application | Angular'
[GuideI18nCommonMergeBuildFromTheCommandLine]: guide/i18n/merge#build-from-the-command-line 'Build from the command line - Merge translations into the application | Angular'
[GuideI18nCommonMergeDefineLocalesInTheBuildConfiguration]: guide/i18n/merge#define-locales-in-the-build-configuration 'Define locales in the build configuration - Merge translations into the application | Angular'
[GuideI18nCommonMergeGenerateApplicationVariantsForEachLocale]: guide/i18n/merge#generate-application-variants-for-each-locale 'Generate application variants for each locale - Merge translations into the application | Angular'
[GuideI18nCommonTranslationFilesChangeTheSourceLanguageFileFormat]: guide/i18n/translation-files#change-the-source-language-file-format 'Change the source language file format - Work with translation files | Angular'
[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
[GuideWorkspaceConfigI18n]: reference/configs/workspace-config#i18n-options 'i18n options - Angular workspace configuration | Angular'
