# 为翻译准备组件

要为项目的翻译做好准备，请完成以下操作。

- 使用 `i18n` attribute 标记组件（component）模板（template）中的文本
- 使用 `i18n-` attribute 标记组件模板中的 attribute 文本字符串
- 使用 `$localize` 标记消息字符串标记组件代码中的文本字符串

## 标记组件模板中的文本

在组件模板中，i18n 元数据是 `i18n` attribute 的值。

```html
<element i18n="{i18n_metadata}">{string_to_translate}</element>
```

使用 `i18n` attribute 把组件模板中的静态文本消息标记为待翻译。
把它放在每个包含你要翻译的固定文本的元素标签上。

::: tip 提示
`i18n` attribute 是一个能被 Angular 工具和编译器识别的自定义 attribute。

:::

### `i18n` 示例

下面的 `<h1>` 标签显示了一句简单的英文问候语 "Hello i18n!"。

```html [app.component.html]
<h1>Hello i18n!</h1>
```

要把这句问候语标记为待翻译，请为 `<h1>` 标签添加 `i18n` attribute。

```html [app.component.html]
<h1 i18n>Hello i18n!</h1>
```

### 在 `i18n` 中使用条件语句

下面的 `<div>` 标签会根据切换状态，把翻译后的文本显示为 `div` 的内容和 `aria-label` 的值

::: code-group

```html [app.component.html]
<button type="button" (click)="toggleDisplay()">Toggle</button>
<div i18n [attr.aria-label]="toggleAriaLabel()">{{ toggle() }}</div>
```

```ts [app.component.ts]
import {Component, computed, signal} from '@angular/core';
import {$localize} from '@angular/localize/init';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  minutes = 0;
  gender = 'female';
  fly = true;
  logo = '${this.baseUrl}/angular.svg';
  readonly toggle = signal(false);
  readonly toggleAriaLabel = computed(() => {
    return this.toggle()
      ? $localize`:Toggle Button|A button to toggle status:Show`
      : $localize`:Toggle Button|A button to toggle status:Hide`;
  });

  inc(i: number) {
    this.minutes = Math.min(5, Math.max(0, this.minutes + i));
  }
  male() {
    this.gender = 'male';
  }
  female() {
    this.gender = 'female';
  }
  other() {
    this.gender = 'other';
  }
  toggleDisplay() {
    this.toggle.update((toggle) => !toggle);
  }
}
```

:::

### 翻译不带 HTML 元素的行内文本

使用 `<ng-container>` 元素为特定文本关联翻译行为，而不改变文本的显示方式。

::: tip 提示
每个 HTML 元素都会创建一个新的 DOM 元素。
为了避免创建新的 DOM 元素，请把文本包裹在 `<ng-container>` 元素中。
下面的示例展示了 `<ng-container>` 元素被转换成一个不显示的 HTML 注释。

:::

```html [app.component.html]
<ng-container i18n>I don't output any element</ng-container>
```

### 为插值占位符命名

默认情况下，Angular 会为翻译消息中的每个插值（Interpolation）生成一个占位符名称。要给它起一个有意义的名称，帮助译者理解上下文，请在插值内部添加 `//i18n(ph="name")` 注释。

```html
<element i18n>{{ expression //i18n(ph="placeholder_name") }}</element>
```

例如：

```html
<p i18n>Hello, {{ username //i18n(ph="name") }}!</p>
```

这在模板中等价于在组件代码里用 [`$localize`][ApiLocalizeInitLocalize] 为占位符命名：

```ts
$localize`Hello, ${username}:name:!`;
```

## 标记元素的 attribute 以供翻译

在组件模板中，i18n 元数据是 `i18n-{attribute_name}` attribute 的值。

```html
<element i18n-{attribute_name}="{i18n_metadata}" {attribute_name}="{attribute_value}" />
```

HTML 元素的 attribute 中包含一些文本，它们应当与组件模板中其余显示的文本一起翻译。

可以在任意元素的任意 attribute 上使用 `i18n-{attribute_name}`，并把 `{attribute_name}` 替换为该 attribute 的名称。
使用以下语法来指定含义、描述和自定义 ID。

```html
i18n-{attribute_name}="{meaning}|{description}@@{id}"
```

### `i18n-title` 示例

要翻译图片的标题，请参阅这个示例。
下面的示例显示了一张带有 `title` attribute 的图片。

```html [app.component.html]
<img [src]="logo" title="Angular logo" alt="Angular logo" />
```

要把 title attribute 标记为待翻译，请完成以下操作。

添加 `i18n-title` attribute

下面的示例展示了如何通过添加 `i18n-title` 来标记 `img` 标签上的 `title` attribute。

```html [app.component.html]
<img [src]="logo" i18n-title title="Angular logo" alt="Angular logo" />
```

## 标记组件代码中的文本

在组件代码中，翻译源文本和元数据都由反引号 \(<code>&#96;</code>\) 字符包围。

使用 [`$localize`][ApiLocalizeInitLocalize] 标记消息字符串，把代码中的字符串标记为待翻译。

```ts
$localize`string_to_translate`;
```

i18n 元数据由冒号 \(`:`\) 字符包围，并放在翻译源文本之前。

```ts
$localize`:{i18n_metadata}:string_to_translate`;
```

### 包含插值文本

在 [`$localize`][ApiLocalizeInitLocalize] 标记消息字符串中包含[插值](/guide/templates/binding#render-dynamic-text-with-text-interpolation)。

```ts
$localize`string_to_translate ${variable_name}`;
```

### 为插值占位符命名 {#name-the-interpolation-placeholder-in-code}

```ts
$localize`string_to_translate ${variable_name}:placeholder_name:`;
```

### 用于翻译的条件语法

```ts
return this.show ? $localize`Show Tabs` : $localize`Hide tabs`;
```

## 用于翻译的 i18n 元数据

```html
{meaning}|{description}@@{custom_id}
```

以下参数提供了上下文和附加信息，可以减少译者的困惑。

| 元数据参数   | 详情                                         |
| :----------- | :------------------------------------------- |
| 自定义 ID    | 提供一个自定义标识符                         |
| 描述         | 提供附加信息或上下文                         |
| 含义         | 提供文本在特定上下文中的含义或意图           |

有关自定义 ID 的更多信息，请参阅[使用自定义 ID 管理已标记的文本][GuideI18nOptionalManageMarkedText]。

### 添加有用的描述和含义

为了准确翻译文本消息，请为译者提供附加信息或上下文。

把文本消息的*描述*作为 `i18n` attribute 或 [`$localize`][ApiLocalizeInitLocalize] 标记消息字符串的值。

下面的示例展示了 `i18n` attribute 的值。

```html [app.component.html]
<h1 i18n="An introduction header for this sample">Hello i18n!</h1>
```

下面的示例展示了带有描述的 [`$localize`][ApiLocalizeInitLocalize] 标记消息字符串的值。

```ts
$localize`:An introduction header for this sample:Hello i18n!`;
```

译者可能还需要了解文本消息在这个特定应用上下文中的含义或意图，以便与其他含义相同的文本保持一致的译法。
让 `i18n` attribute 的值以*含义*开头，并用 `|` 字符将其与*描述*分隔开：`{meaning}|{description}`。

#### `h1` 示例

例如，你可能想说明 `<h1>` 标签是一个站点标题，无论它是作为标题使用，还是在另一段文本中被引用，都需要以相同的方式翻译。

下面的示例展示了如何指定 `<h1>` 标签必须作为标题翻译，或在其他地方被引用时也保持一致。

```html [app.component.html]
<h1 i18n="site header|An introduction header for this sample">Hello i18n!</h1>
```

结果是，所有以 `site header` 作为*含义*标记的文本都会以完全相同的方式翻译。

下面的代码示例展示了带有含义和描述的 [`$localize`][ApiLocalizeInitLocalize] 标记消息字符串的值。

```ts
$localize`:site header|An introduction header for this sample:Hello i18n!`;
```

::: tip 含义如何控制文本的提取与合并
Angular 提取工具会为模板中的每个 `i18n` attribute 生成一个翻译单元条目。
Angular 提取工具会根据源文本和*含义*为每个翻译单元分配一个唯一 ID。*描述*不会影响该 ID。

::: tip 提示
有关 Angular 提取工具的更多信息，请参阅[使用翻译文件](/guide/i18n/translation-files)。

:::

相同文本元素如果*含义*不同，提取时会得到不同的 ID。
例如，如果单词 "right" 在两个不同位置分别使用下面两种定义，那么该单词会被翻译成不同的内容，并作为不同的翻译条目合并回应用中。

- `correct`，如 "you are right"
- `direction`，如 "turn right"

如果相同的文本元素满足以下条件，它们只会被提取一次，并使用同一个 ID。

- 含义或定义相同
- 描述不同

这一个翻译条目会被合并回应用中所有出现相同文本元素的地方。
:::

## ICU 表达式

ICU 表达式可以帮助你在组件模板中标记满足特定条件时显示的替代文本。
ICU 表达式包含一个组件属性、一个 ICU 子句，以及由左花括号 \(`{`\) 和右花括号 \(`}`\) 字符包围的 case 语句。

```html
{ component_property, icu_clause, case_statements }
```

组件属性定义了变量。
ICU 子句定义了条件文本的类型。

| ICU 子句                                                             | 详情                                                                |
| :------------------------------------------------------------------- | :------------------------------------------------------------------ |
| [`plural`][GuideI18nCommonPrepareMarkPlurals]                        | 标记复数的用法                                                      |
| [`select`][GuideI18nCommonPrepareMarkAlternatesAndNestedExpressions] | 根据你定义的字符串值标记替代文本的选项                              |

为了简化翻译，请将 Unicode 国际化组件子句 \(ICU 子句\) 与正则表达式一起使用。

::: tip 提示
ICU 子句遵循 [CLDR 复数规则][UnicodeCldrIndexCldrSpecPluralRules]中规定的 [ICU 消息格式][GithubUnicodeOrgIcuUserguideFormatParseMessages]。

:::

### 标记复数

不同的语言有不同的复数规则，这增加了翻译的难度。
由于其他语言环境（locale）表达基数的方式不同，你可能需要设置与英语不一致的复数类别。
使用 `plural` 子句来标记那些逐词翻译后可能没有意义的表达式。

```html
{ component_property, plural, pluralization_categories }
```

在复数类别之后，输入由左花括号 \(`{`\) 和右花括号 \(`}`\) 字符包围的默认文本 \(英文\)。

```html
pluralization_category { }
```

以下复数类别适用于英语，并可能因语言环境而异。

| 复数类别    | 详情                       | 示例                       |
| :---------- | :------------------------- | :------------------------- |
| `zero`      | 数量为零                   | `=0 { }` <br /> `zero { }` |
| `one`       | 数量为 1                   | `=1 { }` <br /> `one { }`  |
| `two`       | 数量为 2                   | `=2 { }` <br /> `two { }`  |
| `few`       | 数量为 2 或更多            | `few { }`                  |
| `many`      | 数量很大                   | `many { }`                 |
| `other`     | 默认数量                   | `other { }`                |

如果没有任何复数类别匹配，Angular 会使用 `other` 来匹配缺失类别时的标准回退。

```html
other { default_quantity }
```

::: tip 提示
有关复数类别的更多信息，请参阅 [CLDR - Unicode 通用语言环境数据存储库][UnicodeCldrMain]中的[选择复数类别名称][UnicodeCldrIndexCldrSpecPluralRulesTocChoosingPluralCategoryNames]。

:::

::: tip 背景：语言环境可能不支持某些复数类别
许多语言环境不支持某些复数类别。
默认语言环境 \(`en-US`\) 使用一个非常简单的 `plural()` 函数，它不支持 `few` 复数类别。
另一个使用简单 `plural()` 函数的语言环境是 `es`。
下面的代码示例展示了 [en-US 的 `plural()`][GithubAngularAngularBlobEcffc3557fe1bff9718c01277498e877ca44588dPackagesCoreSrcI18nLocaleEnTsL14L18] 函数。

```ts [locale_plural_function.ts]
/* eslint-disable */
function plural(n: number): number {
  let i = Math.floor(Math.abs(n)),
    v = n.toString().replace(/^[^.]*\.?/, '').length;
  if (i === 1 && v === 0) return 1;
  return 5;
}
```

`plural()` 函数只会返回 1 \(`one`\) 或 5 \(`other`\)。
`few` 类别永远不会匹配。
:::

#### `minutes` 示例

假设你想用英文显示下面这句话，其中 `x` 是一个数字。

<!--todo: replace output docs-code with screen capture image --->

```html
updated x minutes ago
```

同时你还想根据 `x` 的基数显示下面这些短语。

<!--todo: replace output docs-code with screen capture image --->

```html
updated just now
```

<!--todo: replace output docs-code with screen capture image --->

```html
updated one minute ago
```

使用 HTML 标记和[插值](/guide/templates/binding#render-dynamic-text-with-text-interpolation)。
下面的代码示例展示了如何在 `<span>` 元素中使用 `plural` 子句来表达前面三种情况。

```html [app.component.html]
<span i18n
  >Updated
  {minutes, plural, =0 {just now} =1 {one minute ago} other {{{ minutes }} minutes ago}}</span
>
```

请查看前面代码示例中的以下细节。

| 参数                              | 详情                                                                                                                  |
| :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `minutes`                         | 第一个参数指定组件属性为 `minutes`，它决定了分钟数。                                                                  |
| `plural`                          | 第二个参数指定 ICU 子句为 `plural`。                                                                                  |
| `=0 {just now}`                   | 对于零分钟，复数类别为 `=0`，值为 `just now`。                                                                        |
| `=1 {one minute}`                 | 对于一分钟，复数类别为 `=1`，值为 `one minute`。                                                                      |
| `other {{{minutes}} minutes ago}` | 对于任何未匹配的基数，默认复数类别为 `other`，值为 `{{minutes}} minutes ago`。                                        |

`{{minutes}}` 是一个[插值](/guide/templates/binding#render-dynamic-text-with-text-interpolation)。

### 标记替代表达式和嵌套表达式

`select` 子句会根据你定义的字符串值标记替代文本的选项。

```html
{ component_property, select, selection_categories }
```

翻译所有替代项，以便根据变量的值显示替代文本。

在选择类别之后，输入由左花括号 \(`{`\) 和右花括号 \(`}`\) 字符包围的文本 \(英文\)。

```html
selection_category { text }
```

不同的语言环境有不同的语法结构，这增加了翻译的难度。
使用 HTML 标记。
如果没有任何选择类别匹配，Angular 会使用 `other` 来匹配缺失类别时的标准回退。

```html
other { default_value }
```

#### `gender` 示例

假设你想用英文显示下面这句话。

<!--todo: replace output docs-code with screen capture image --->

```html
The author is other
```

同时你还想根据组件的 `gender` 属性显示下面这些短语。

<!--todo: replace output docs-code with screen capture image --->

```html
The author is female
```

<!--todo: replace output docs-code with screen capture image --->

```html
The author is male
```

下面的代码示例展示了如何绑定组件的 `gender` 属性，并使用 `select` 子句在 `<span>` 元素中表达前面三种情况。

`gender` 属性会把输出绑定到下列各个字符串值。

| 值     | 英文值        |
| :----- | :------------ |
| female | `female`      |
| male   | `male`        |
| other  | `other`       |

`select` 子句会把这些值映射到相应的翻译。
下面的代码示例展示了与 select 子句一起使用的 `gender` 属性。

```html [app.component.html]
<span i18n>The author is {gender, select, male {male} female {female} other {other}}</span>
```

#### `gender` 和 `minutes` 示例

可以把不同的子句组合在一起，例如 `plural` 和 `select` 子句。
下面的代码示例展示了基于 `gender` 和 `minutes` 示例的嵌套子句。

```html [app.component.html]
<span i18n
  >Updated:
  {minutes, plural,
    =0 {just now}
    =1 {one minute ago}
    other {{{ minutes }} minutes ago by {gender, select, male {male} female {female} other {other}}}
  }
</span>
```

## 下一步

- [使用翻译文件](/guide/i18n/translation-files)


[ApiLocalizeInitLocalize]: api/localize/init/$localize '$localize | init - localize - API  | Angular'
[GuideI18nCommonPrepareMarkAlternatesAndNestedExpressions]: guide/i18n/prepare#mark-alternates-and-nested-expressions 'Mark alternates and nested expressions - Prepare templates for translation | Angular'
[GuideI18nCommonPrepareMarkPlurals]: guide/i18n/prepare#mark-plurals 'Mark plurals - Prepare component for translation | Angular'
[GuideI18nOptionalManageMarkedText]: guide/i18n/manage-marked-text 'Manage marked text with custom IDs | Angular'
[GithubAngularAngularBlobEcffc3557fe1bff9718c01277498e877ca44588dPackagesCoreSrcI18nLocaleEnTsL14L18]: https://github.com/angular/angular/blob/ecffc3557fe1bff9718c01277498e877ca44588d/packages/core/src/i18n/locale_en.ts#L14-L18 'Line 14 to 18 - angular/packages/core/src/i18n/locale_en.ts | angular/angular | GitHub'
[GithubUnicodeOrgIcuUserguideFormatParseMessages]: https://unicode-org.github.io/icu/userguide/format_parse/messages 'ICU Message Format - ICU Documentation | Unicode | GitHub'
[UnicodeCldrMain]: https://cldr.unicode.org 'Unicode CLDR Project'
[UnicodeCldrIndexCldrSpecPluralRules]: https://cldr.unicode.org/index/cldr-spec/plural-rules 'Plural Rules | CLDR - Unicode Common Locale Data Repository | Unicode'
[UnicodeCldrIndexCldrSpecPluralRulesTocChoosingPluralCategoryNames]: https://cldr.unicode.org/index/cldr-spec/plural-rules#TOC-Choosing-Plural-Category-Names 'Choosing Plural Category Names - Plural Rules | CLDR - Unicode Common Locale Data Repository | Unicode'
