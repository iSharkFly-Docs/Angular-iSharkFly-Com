# 使用自定义 ID 管理已标记的文本

Angular 提取器会生成一个文件，并为以下每个实例生成一个翻译单元条目。

- 组件（component）模板（template）中的每个 `i18n` attribute
- 组件代码中的每个 [`$localize`][ApiLocalizeInitLocalize] 标记消息字符串

如[含义如何控制文本的提取与合并][GuideI18nCommonPrepareHowMeaningsControlTextExtractionAndMerges]中所述，Angular 会为每个翻译单元分配一个唯一 ID。

下面的示例展示了带有唯一 ID 的翻译单元。

```txt [messages.fr.xlf]
<trans-unit id="ba0cc104d3d69bf669f97b8d96a4c5d8d9559aa3" datatype="html">
```

当你修改可翻译的文本时，提取器会为该翻译单元生成一个新的 ID。
在大多数情况下，源文本的变化也需要相应地修改翻译。
因此，使用新的 ID 可以让文本的变化与翻译保持同步。

不过，有些翻译系统要求 ID 采用特定的形式或语法。
为了满足这一要求，请使用自定义 ID 来标记文本。
大多数开发者不需要使用自定义 ID。
如果你想用一种独特的语法来传达额外的元数据，请使用自定义 ID。
额外的元数据可以包括文本所在的库、组件或应用区域。

要在 `i18n` attribute 或 [`$localize`][ApiLocalizeInitLocalize] 标记消息字符串中指定自定义 ID，请使用 `@@` 前缀。
下面的示例在一个标题元素中定义了自定义 ID `introductionHeader`。

```html [app.component.html]
<h1 i18n="@@introductionHeader">Hello i18n!</h1>
```

下面的示例为一个变量定义了自定义 ID `introductionHeader`。

```ts
variableText1 = $localize`:@@introductionHeader:Hello i18n!`;
```

当你指定了自定义 ID 时，提取器会生成一个带有该自定义 ID 的翻译单元。

```txt [messages.fr.xlf]
<trans-unit id="introductionHeader" datatype="html">
```

如果你修改了文本，提取器不会改变这个 ID。
因此，你无需额外执行更新翻译的步骤。
使用自定义 ID 的缺点是，如果你修改了文本，翻译可能会与新修改的源文本不同步。

## 将自定义 ID 与描述一起使用

把自定义 ID 与描述和含义结合使用，可以进一步帮助译者。

下面的示例包含一个描述，后面跟着自定义 ID。

```html [app.component.html]
<h1 i18n="An introduction header for this sample@@introductionHeader">Hello i18n!</h1>
```

下面的示例为一个变量定义了自定义 ID `introductionHeader` 和描述。

```ts
variableText2 = $localize`:An introduction header for this sample@@introductionHeader:Hello i18n!`;
```

下面的示例添加了一个含义。

```html [app.component.html]
<h1 i18n="site header|An introduction header for this sample@@introductionHeader">Hello i18n!</h1>
```

下面的示例为一个变量定义了自定义 ID `introductionHeader`。

```ts
variableText3 = $localize`:site header|An introduction header for this sample@@introductionHeader:Hello i18n!`;
```

### 定义唯一的自定义 ID

请务必定义唯一的自定义 ID。
如果你为两个不同的文本元素使用了相同的 ID，提取工具只会提取第一个，而 Angular 会用这条翻译同时替换这两个原始文本元素。

例如，在下面的代码片段中，为两个不同的文本元素定义了同一个自定义 ID `myId`。

```html [app.component.html]
<h3 i18n="@@myId">Hello</h3>
<!-- ... -->
<p i18n="@@myId">Good bye</p>
```

下面展示了法语翻译。

```txt [src/locale/messages.fr.xlf]
<trans-unit id="myId" datatype="html">
  <source>Hello</source>
  <target state="new">Bonjour</target>
</trans-unit>
```

由于这两个元素是用同一个自定义 ID 定义的，它们现在都使用相同的翻译 \(`Bonjour`\)。

```html [rendered-output.html]
<h3>Bonjour</h3>
<!-- ... -->
<p>Bonjour</p>
```

[ApiLocalizeInitLocalize]: api/localize/init/$localize '$localize | init - localize - API | Angular'
[GuideI18nCommonPrepareHowMeaningsControlTextExtractionAndMerges]: guide/i18n/prepare#h1-example 'How meanings control text extraction and merges - Prepare components for translations | Angular'
