# 通过 ID 引用语言环境

Angular 使用 Unicode *语言环境标识符*（Unicode locale ID）来查找正确的语言环境（locale）数据，以便对文本字符串进行国际化。

::: tip Unicode 语言环境 ID
- 语言环境 ID 遵循 [Unicode 通用语言环境数据仓库（CLDR）核心规范][UnicodeCldrDevelopmentCoreSpecification]。
  关于语言环境 ID 的更多信息，请参阅 [Unicode 语言和语言环境标识符][UnicodeCldrDevelopmentCoreSpecificationLocaleID]。

- CLDR 和 Angular 使用 [BCP 47 标签][RfcEditorInfoBcp47]作为语言环境 ID 的基础
:::

语言环境 ID 指定了语言、国家/地区，以及一个可选的代码，用于表示进一步的变体或细分。
语言环境 ID 由语言标识符、连字符（`-`）和语言环境扩展组成。

```html
{language_id}-{locale_extension}
```

::: tip 提示
要准确地翻译 Angular 项目，你必须先确定国际化所面向的语言和语言环境。

:::

许多国家使用同一种语言，但用法有所不同。
这些差异包括语法、标点，以及货币、小数、日期等的格式。

本指南中的示例使用下列语言和语言环境。

| 语言   | 语言环境         | Unicode 语言环境 ID |
| :----- | :--------------- | :------------------ |
| 英语   | 加拿大           | `en-CA`             |
| 英语   | 美国             | `en-US`             |
| 法语   | 加拿大           | `fr-CA`             |
| 法语   | 法国             | `fr-FR`             |

[Angular 代码仓库][GithubAngularAngularTreeMasterPackagesCommonLocales]中包含了常用的语言环境。

::: tip 
关于语言代码的列表，请参阅 [ISO 639-2](https://www.loc.gov/standards/iso639-2)。
:::

## 设置源语言环境 ID

使用 Angular CLI 设置你编写组件（Component）模板（Template）和代码时所用的源语言。

默认情况下，Angular 使用 `en-US` 作为项目的源语言环境。

要为构建修改项目的源语言环境，请完成以下操作。

1. 打开 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件。
2. 在 `i18n` 部分中添加或修改 `sourceLocale` 字段：

```json
{
  "projects": {
    "your-project": {
      "i18n": {
        "sourceLocale": "ca" // 使用你想要的语言环境代码
      }
    }
  }
}
```

## 在依赖注入之外读取当前语言环境

在组件或服务（Service）中，注入 `LOCALE_ID` 令牌即可获取当前的语言环境。

如果无法注入 `LOCALE_ID`，例如在注入上下文（Injection Context）之外的普通函数中，请读取 `$localize.locale`。
每次本地化构建都会设置这个值，它也正是默认的 `LOCALE_ID` 工厂所读取的值。
如果你的应用提供了自己的 `LOCALE_ID`，`$localize.locale` 不会反映它。

```ts
declare const $localize: {locale?: string};

export const locale = (typeof $localize !== 'undefined' && $localize.locale) || 'en-US';
```

请把这段代码放在一个包含 `import` 或 `export` 的文件中。如果你的项目已经包含了 `@angular/localize` 的类型，请省略 `declare` 那一行。

## 下一步

- [根据语言环境格式化数据](/guide/i18n/format-data-locale)


[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
[GithubAngularAngularTreeMasterPackagesCommonLocales]: https://github.com/angular/angular/tree/main/packages/common/locales 'angular/packages/common/locales | angular/angular | GitHub'
[RfcEditorInfoBcp47]: https://www.rfc-editor.org/info/bcp47 'BCP 47 | RFC Editor'
[UnicodeCldrDevelopmentCoreSpecification]: https://cldr.unicode.org/index/cldr-spec 'Core Specification | Unicode CLDR Project'
[UnicodeCldrDevelopmentCoreSpecificationLocaleID]: https://cldr.unicode.org/index/cldr-spec/picking-the-right-language-code 'Unicode Language and Locale Identifiers - Core Specification | Unicode CLDR Project'
