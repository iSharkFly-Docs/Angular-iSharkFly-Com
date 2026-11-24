# 使用翻译文件 {#work-with-translation-files}

为组件（component）做好翻译准备之后，使用 [`extract-i18n`][CliExtractI18n] [Angular CLI][CliMain] 命令把组件中已标记的文本提取到一个*源语言*文件中。

已标记的文本包括用 `i18n` 标记的文本、用 `i18n-`*attribute* 标记的 attribute，以及用 `$localize` 标记的文本，详见[为翻译准备组件][GuideI18nCommonPrepare]。

完成以下步骤，为你的项目创建和更新翻译文件（translation file）。

1. [提取源语言文件][GuideI18nCommonTranslationFilesExtractTheSourceLanguageFile]。
   1. 可选：修改位置、格式和名称。
1. 复制源语言文件，[为每种语言创建一个翻译文件][GuideI18nCommonTranslationFilesCreateATranslationFileForEachLanguage]。
1. [翻译每个翻译文件][GuideI18nCommonTranslationFilesTranslateEachTranslationFile]。
1. 分别翻译复数和替代表达式。
   1. [翻译复数][GuideI18nCommonTranslationFilesTranslatePlurals]。
   1. [翻译替代表达式][GuideI18nCommonTranslationFilesTranslateAlternateExpressions]。
   1. [翻译嵌套表达式][GuideI18nCommonTranslationFilesTranslateNestedExpressions]。

## 提取源语言文件 {#extract-the-source-language-file}

要提取源语言文件，请完成以下操作。

1. 打开一个终端窗口。
1. 切换到项目的根目录。
1. 运行下面的 CLI 命令。

```shell [commands.sh]
ng extract-i18n
```

`extract-i18n` 命令会在项目的根目录下创建一个名为 `messages.xlf` 的源语言文件。
有关 XML 本地化交换文件格式 \(XLIFF，1.2 版\) 的更多信息，请参阅 [XLIFF][WikipediaWikiXliff]。

使用下列 [`extract-i18n`][CliExtractI18n] 命令选项来修改源语言文件的位置、格式和文件名。

| 命令选项        | 详情                                 |
| :-------------- | :----------------------------------- |
| `--format`      | 设置输出文件的格式                   |
| `--out-file`    | 设置输出文件的名称                   |
| `--output-path` | 设置输出目录的路径                   |

### 修改源语言文件的位置 {#change-the-source-language-file-location}

要在 `src/locale` 目录中创建文件，请把输出路径指定为选项。

#### `extract-i18n --output-path` 示例 {#extract-i18n-output-path-example}

下面的示例把输出路径指定为选项。

```shell [commands.sh]
ng extract-i18n --output-path src/locale
```

### 修改源语言文件的格式 {#change-the-source-language-file-format}

`extract-i18n` 命令可以创建以下翻译格式的文件。

| 翻译格式           | 详情                                                                                                             | 文件扩展名        |
| :----------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------- |
| ARB                | [Application Resource Bundle][GithubGoogleAppResourceBundleWikiApplicationresourcebundlespecification]           | `.arb`            |
| JSON               | [JavaScript Object Notation][JsonMain]                                                                           | `.json`           |
| XLIFF 1.2          | [XML Localization Interchange File Format, version 1.2][OasisOpenDocsXliffXliffCoreXliffCoreHtml]                | `.xlf`            |
| XLIFF 2            | [XML Localization Interchange File Format, version 2][OasisOpenDocsXliffXliffCoreV20Cos01XliffCoreV20Cose01Html] | `.xlf`            |
| XMB                | [XML Message Bundle][UnicodeCldrDevelopmentDevelopmentProcessDesignProposalsXmb]                                 | `.xmb` \(`.xtb`\) |

使用 `--format` 命令选项显式指定翻译格式。

::: tip 提示
XMB 格式会生成 `.xmb` 源语言文件，但使用 `.xtb` 翻译文件。

:::

#### `extract-i18n --format` 示例 {#extract-i18n-format-example}

下面的示例演示了几种翻译格式。

```shell [commands.sh]
ng extract-i18n --format=xlf
ng extract-i18n --format=xlf2
ng extract-i18n --format=xmb
ng extract-i18n --format=json
ng extract-i18n --format=arb
```

### 修改源语言文件的名称 {#change-the-source-language-file-name}

要修改提取工具生成的源语言文件的名称，请使用 `--out-file` 命令选项。

#### `extract-i18n --out-file` 示例 {#extract-i18n-out-file-example}

下面的示例演示了如何为输出文件命名。

```shell [commands.sh]
ng extract-i18n --out-file source.xlf
```

## 为每种语言创建一个翻译文件 {#create-a-translation-file-for-each-language}

要为某个语言环境（locale）或语言创建翻译文件，请完成以下操作。

1. [提取源语言文件][GuideI18nCommonTranslationFilesExtractTheSourceLanguageFile]。
1. 为每种语言复制一份源语言文件，作为*翻译*文件。
1. 重命名*翻译*文件，在文件名中加上语言环境。

   ```txt

   messages.xlf --> messages.{locale}.xlf

   ```

1. 在项目根目录下新建一个名为 `locale` 的目录。

   ```txt

   src/locale

   ```

1. 把*翻译*文件移到这个新目录中。
1. 把*翻译*文件发送给译者。
1. 对你想添加到应用中的每种语言重复上述步骤。

### 法语的 `extract-i18n` 示例 {#extract-i18n-example-for-french}

例如，要创建法语翻译文件，请完成以下操作。

1. 运行 `extract-i18n` 命令。
1. 复制一份 `messages.xlf` 源语言文件。
1. 把副本重命名为 `messages.fr.xlf`，用于法语 \(`fr`\) 翻译。
1. 把 `fr` 翻译文件移到 `src/locale` 目录中。
1. 把 `fr` 翻译文件发送给译者。

## 翻译每个翻译文件 {#translate-each-translation-file}

除非你精通该语言并且有时间编辑翻译，否则你多半会完成以下步骤。

1. 把每个翻译文件发送给一位译者。
1. 译者使用 XLIFF 文件编辑器完成以下操作。
   1. 创建翻译。
   1. 编辑翻译。

### 法语翻译流程示例 {#translation-process-example-for-french}

为了演示这个流程，请查看 [Angular 国际化示例应用][GuideI18nExample]中的 `messages.fr.xlf` 文件。[Angular 国际化示例应用][GuideI18nExample]包含一份法语翻译，你无需专门的 XLIFF 编辑器，也不需要懂法语，就可以编辑它。

以下操作描述了法语的翻译流程。

1. 打开 `messages.fr.xlf`，找到第一个 `<trans-unit>` 元素。
   这是一个*翻译单元*，也称为*文本节点*，它表示之前用 `i18n` attribute 标记的 `<h1>` 问候语标签的翻译。

   ```txt [src/locale/messages.fr.xlf (<trans-unit>)]
   <trans-unit id="introductionHeader" datatype="html">
     <source>Hello i18n!</source>
     <note priority="1" from="description">An introduction header for this sample</note>
     <note priority="1" from="meaning">User welcome</note>
   </trans-unit>
   ```

   `id="introductionHeader"` 是一个[自定义 ID][GuideI18nOptionalManageMarkedText]，但没有源 HTML 中所需的 `@@` 前缀。

1. 复制文本节点中的 `<source>... </source>` 元素，将其重命名为 `target`，然后把内容替换为法语文本。

   ```txt [src/locale/messages.fr.xlf (<trans-unit>, after translation)]
   <trans-unit id="introductionHeader" datatype="html">
     <source>Hello i18n!</source>
     <target>Bonjour i18n !</target>
     <note priority="1" from="description">An introduction header for this sample</note>
     <note priority="1" from="meaning">User welcome</note>
   </trans-unit>
   ```

   在更复杂的翻译中，[描述和含义元素][GuideI18nCommonPrepareAddHelpfulDescriptionsAndMeanings]中的信息和上下文可以帮助你选择合适的译词。

1. 翻译其他文本节点。
   下面的示例展示了翻译的方式。

   ```txt [src/locale/messages.fr.xlf (<trans-unit>)]
   <trans-unit id="ba0cc104d3d69bf669f97b8d96a4c5d8d9559aa3" datatype="html">
     <source>I don&apos;t output any element</source>
     <target>Je n'affiche aucun élément</target>
   </trans-unit>
   <trans-unit id="701174153757adf13e7c24a248c8a873ac9f5193" datatype="html">
     <source>Angular logo</source>
     <target>Logo d'Angular</target>
   </trans-unit>
   ```

::: warning 重要
不要修改翻译单元的 ID。
每个 `id` attribute 都由 Angular 生成，取决于组件文本的内容和所指定的含义。

:::

如果你修改了文本或含义，`id` attribute 就会随之改变。
有关管理文本更新和 ID 的更多信息，请参阅[自定义 ID][GuideI18nOptionalManageMarkedText]。

## 翻译复数 {#translate-plurals}

根据每种语言的需要添加或删除复数情况。

::: tip 提示
有关各语言的复数规则，请参阅 [CLDR 复数规则][GithubUnicodeOrgCldrStagingChartsLatestSupplementalLanguagePluralRulesHtml]。

:::

### `minute` `plural` 示例 {#minute-plural-example}

要翻译 `plural`，请翻译 ICU 格式的匹配值。

- `just now`
- `one minute ago`
- `<x id="INTERPOLATION" equiv-text="{{minutes}}"/> minutes ago`

下面的示例展示了翻译的方式。

```txt [src/locale/messages.fr.xlf (<trans-unit>)]
<trans-unit id="5a134dee893586d02bffc9611056b9cadf9abfad" datatype="html">
  <source>{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {<x id="INTERPOLATION" equiv-text="{{minutes}}"/> minutes ago} }</source>
  <target>{VAR_PLURAL, plural, =0 {à l'instant} =1 {il y a une minute} other {il y a <x id="INTERPOLATION" equiv-text="{{minutes}}"/> minutes} }</target>
</trans-unit>
```

## 翻译替代表达式 {#translate-alternate-expressions}

Angular 还会把替代用的 `select` ICU 表达式提取为单独的翻译单元。

### `gender` `select` 示例 {#gender-select-example}

下面的示例展示了组件模板（template）中的一个 `select` ICU 表达式。

```html [app.component.html]
<span i18n>The author is {gender, select, male {male} female {female} other {other}}</span>
```

在这个示例中，Angular 会把该表达式提取为两个翻译单元。
第一个包含 `select` 子句之外的文本，并为 `select` 使用一个占位符 \(`<x id="ICU">`\)：

```txt [src/locale/messages.fr.xlf (<trans-unit>)]
<trans-unit id="f99f34ac9bd4606345071bd813858dec29f3b7d1" datatype="html">
  <source>The author is <x id="ICU" equiv-text="{gender, select, male {...} female {...} other {...}}"/></source>
  <target>L'auteur est <x id="ICU" equiv-text="{gender, select, male {...} female {...} other {...}}"/></target>
</trans-unit>
```

::: warning 重要
翻译文本时，可以根据需要移动占位符，但不要删除它。
如果删除了占位符，翻译后的应用中就会缺少这个 ICU 表达式。

:::

下面的示例展示了包含 `select` 子句的第二个翻译单元。

```txt [src/locale/messages.fr.xlf (<trans-unit>)]
<trans-unit id="eff74b75ab7364b6fa888f1cbfae901aaaf02295" datatype="html">
  <source>{VAR_SELECT, select, male {male} female {female} other {other} }</source>
  <target>{VAR_SELECT, select, male {un homme} female {une femme} other {autre} }</target>
</trans-unit>
```

下面的示例展示了翻译完成后的两个翻译单元。

```txt [src/locale/messages.fr.xlf (<trans-unit>)]
<trans-unit id="f99f34ac9bd4606345071bd813858dec29f3b7d1" datatype="html">
  <source>The author is <x id="ICU" equiv-text="{gender, select, male {...} female {...} other {...}}"/></source>
  <target>L'auteur est <x id="ICU" equiv-text="{gender, select, male {...} female {...} other {...}}"/></target>
</trans-unit>
<trans-unit id="eff74b75ab7364b6fa888f1cbfae901aaaf02295" datatype="html">
  <source>{VAR_SELECT, select, male {male} female {female} other {other} }</source>
  <target>{VAR_SELECT, select, male {un homme} female {une femme} other {autre} }</target>
</trans-unit>
```

## 翻译嵌套表达式 {#translate-nested-expressions}

Angular 对待嵌套表达式的方式与替代表达式相同。
Angular 会把该表达式提取为两个翻译单元。

### 嵌套 `plural` 示例 {#nested-plural-example}

下面的示例展示了第一个翻译单元，它包含嵌套表达式之外的文本。

```txt [src/locale/messages.fr.xlf (<trans-unit>)]
<trans-unit id="972cb0cf3e442f7b1c00d7dab168ac08d6bdf20c" datatype="html">
  <source>Updated: <x id="ICU" equiv-text="{minutes, plural, =0 {...} =1 {...} other {...}}"/></source>
  <target>Mis à jour: <x id="ICU" equiv-text="{minutes, plural, =0 {...} =1 {...} other {...}}"/></target>
</trans-unit>
```

下面的示例展示了包含完整嵌套表达式的第二个翻译单元。

```txt [src/locale/messages.fr.xlf (<trans-unit>)]
<trans-unit id="7151c2e67748b726f0864fc443861d45df21d706" datatype="html">
  <source>{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {<x id="INTERPOLATION" equiv-text="{{minutes}}"/> minutes ago by {VAR_SELECT, select, male {male} female {female} other {other} }} }</source>
  <target>{VAR_PLURAL, plural, =0 {à l'instant} =1 {il y a une minute} other {il y a <x id="INTERPOLATION" equiv-text="{{minutes}}"/> minutes par {VAR_SELECT, select, male {un homme} female {une femme} other {autre} }} }</target>
</trans-unit>
```

下面的示例展示了翻译完成后的两个翻译单元。

```txt [src/locale/messages.fr.xlf (<trans-unit>)]
<trans-unit id="972cb0cf3e442f7b1c00d7dab168ac08d6bdf20c" datatype="html">
  <source>Updated: <x id="ICU" equiv-text="{minutes, plural, =0 {...} =1 {...} other {...}}"/></source>
  <target>Mis à jour: <x id="ICU" equiv-text="{minutes, plural, =0 {...} =1 {...} other {...}}"/></target>
</trans-unit>
<trans-unit id="7151c2e67748b726f0864fc443861d45df21d706" datatype="html">
  <source>{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {<x id="INTERPOLATION" equiv-text="{{minutes}}"/> minutes ago by {VAR_SELECT, select, male {male} female {female} other {other} }} }</source>
  <target>{VAR_PLURAL, plural, =0 {à l'instant} =1 {il y a une minute} other {il y a <x id="INTERPOLATION" equiv-text="{{minutes}}"/> minutes par {VAR_SELECT, select, male {un homme} female {une femme} other {autre} }} }</target>
</trans-unit>
```

## 下一步 {#what-s-next}

- [把翻译合并到应用中](/guide/i18n/merge)


[CliMain]: cli 'CLI Overview and Command Reference | Angular'
[CliExtractI18n]: cli/extract-i18n 'ng extract-i18n | CLI | Angular'
[GuideI18nCommonPrepare]: guide/i18n/prepare 'Prepare component for translation | Angular'
[GuideI18nCommonPrepareAddHelpfulDescriptionsAndMeanings]: guide/i18n/prepare#add-helpful-descriptions-and-meanings 'Add helpful descriptions and meanings - Prepare component for translation | Angular'
[GuideI18nCommonTranslationFilesCreateATranslationFileForEachLanguage]: guide/i18n/translation-files#create-a-translation-file-for-each-language 'Create a translation file for each language - Work with translation files | Angular'
[GuideI18nCommonTranslationFilesExtractTheSourceLanguageFile]: guide/i18n/translation-files#extract-the-source-language-file 'Extract the source language file - Work with translation files | Angular'
[GuideI18nCommonTranslationFilesTranslateAlternateExpressions]: guide/i18n/translation-files#translate-alternate-expressions 'Translate alternate expressions - Work with translation files | Angular'
[GuideI18nCommonTranslationFilesTranslateEachTranslationFile]: guide/i18n/translation-files#translate-each-translation-file 'Translate each translation file - Work with translation files | Angular'
[GuideI18nCommonTranslationFilesTranslateNestedExpressions]: guide/i18n/translation-files#translate-nested-expressions 'Translate nested expressions - Work with translation files | Angular'
[GuideI18nCommonTranslationFilesTranslatePlurals]: guide/i18n/translation-files#translate-plurals 'Translate plurals - Work with translation files | Angular'
[GuideI18nExample]: guide/i18n/example 'Example Angular Internationalization application | Angular'
[GuideI18nOptionalManageMarkedText]: guide/i18n/manage-marked-text 'Manage marked text with custom IDs | Angular'
[GithubGoogleAppResourceBundleWikiApplicationresourcebundlespecification]: https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification 'ApplicationResourceBundleSpecification | google/app-resource-bundle | GitHub'
[GithubUnicodeOrgCldrStagingChartsLatestSupplementalLanguagePluralRulesHtml]: https://cldr.unicode.org/index/cldr-spec/plural-rules 'Language Plural Rules - CLDR Charts | Unicode | GitHub'
[JsonMain]: https://www.json.org 'Introducing JSON | JSON'
[OasisOpenDocsXliffXliffCoreXliffCoreHtml]: https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html 'XLIFF Version 1.2 Specification | Oasis Open Docs'
[OasisOpenDocsXliffXliffCoreV20Cos01XliffCoreV20Cose01Html]: https://docs.oasis-open.org/xliff/xliff-core/v2.0/cos01/xliff-core-v2.0-cos01.html 'XLIFF Version 2.0 | Oasis Open Docs'
[UnicodeCldrDevelopmentDevelopmentProcessDesignProposalsXmb]: https://cldr.unicode.org/development/development-process/design-proposals/xmb 'XMB | CLDR - Unicode Common Locale Data Repository | Unicode'
[WikipediaWikiXliff]: https://en.wikipedia.org/wiki/XLIFF 'XLIFF | Wikipedia'
