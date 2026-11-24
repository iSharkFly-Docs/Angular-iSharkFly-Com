# 组件选择器 {#component-selectors}

::: tip 提示
本指南假设你已经阅读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

每个组件（Component）都会定义一个
[CSS 选择器（Selector）](https://developer.mozilla.org/docs/Web/CSS/CSS_selectors)，它决定了
该组件的使用方式：

```ts
@Component({
  selector: 'profile-photo',
  ...
})
export class ProfilePhoto { }
```

要使用某个组件，只需在*其他*组件的模板（Template）中创建一个与之匹配的 HTML 元素：

```ts
@Component({
  template: `
    <profile-photo />
    <button>Upload a new profile photo</button>`,
  ...,
})
export class UserProfile { }
```

**Angular 在编译期静态地匹配选择器**。在运行时修改 DOM，无论是通过
Angular 绑定（Binding）还是 DOM API，都不会影响渲染出的组件。

**一个元素只能匹配一个组件选择器。** 如果有多个组件选择器匹配
同一个元素，Angular 会报错。

**组件选择器区分大小写。**

## 选择器的类型 {#types-of-selectors}

Angular 在组件选择器中只支持
[基本 CSS 选择器类型](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors)中的
一个有限子集：

| **选择器类型**  | **说明**                                                                                                 | **示例**                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 类型选择器      | 根据 HTML 标签名或节点名匹配元素。                                                    | `profile-photo`               |
| 属性选择器 | 根据是否存在某个 HTML 属性来匹配元素，还可以选择性地要求该属性等于某个确切的值。 | `[dropzone]` `[type="reset"]` |
| 类选择器     | 根据是否存在某个 CSS 类来匹配元素。                                                          | `.menu-item`                  |

对于属性值，Angular 支持使用等号（`=`）运算符匹配确切的属性值。
Angular 不支持其他属性值运算符。

Angular 组件选择器不支持组合器，包括
[后代组合器](https://developer.mozilla.org/docs/Web/CSS/Descendant_combinator)
和[子组合器](https://developer.mozilla.org/docs/Web/CSS/Child_combinator)。

Angular 组件选择器不支持
指定[命名空间](https://developer.mozilla.org/docs/Web/SVG/Namespaces_Crash_Course)。

### `:not` 伪类 {#the-not-pseudo-class}

Angular 支持 [`:not` 伪类](https://developer.mozilla.org/docs/Web/CSS/:not)。
你可以把这个伪类附加到任何其他选择器之后，以缩小组件选择器
匹配的元素范围。例如，你可以定义一个 `[dropzone]` 属性选择器，并排除
`textarea` 元素：

```ts
@Component({
  selector: '[dropzone]:not(textarea)',
  ...
})
export class DropZone { }
```

Angular 在组件选择器中不支持任何其他伪类或伪元素。

### 组合选择器 {#combining-selectors}

你可以通过把多个选择器拼接在一起来组合它们。例如，你可以匹配指定了 `type="reset"` 的
`<button>` 元素：

```ts
@Component({
  selector: 'button[type="reset"]',
  ...
})
export class ResetButton { }
```

你也可以用逗号分隔的列表来定义多个选择器：

```ts
@Component({
  selector: 'drop-zone, [dropzone]',
  ...
})
export class DropZone { }
```

对于匹配列表中*任意*一个选择器的每个元素，Angular 都会为其创建一个组件。

## 选择选择器 {#choosing-a-selector}

绝大多数组件都应该使用自定义元素名作为选择器。按照
[HTML 规范](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name)的描述，
所有自定义元素名都应包含一个连字符。
默认情况下，如果 Angular 遇到一个不匹配任何可用组件的自定义标签名，就会报错，
从而避免因组件名拼写错误而导致的 bug。

关于在 Angular 模板中使用
[原生自定义元素](https://developer.mozilla.org/docs/Web/Web_Components)的详细信息，
请参阅[高级组件配置](/guide/components/advanced-configuration)。

### 选择器前缀 {#selector-prefixes}

Angular 团队建议为项目中定义的所有自定义组件使用一个简短且统一的前缀。
例如，如果你要用 Angular 构建 YouTube，你可能会给组件加上 `yt-` 前缀，
得到 `yt-menu`、`yt-player` 等组件。像这样为选择器划分命名空间，
可以让人一眼看出某个组件来自哪里。
默认情况下，Angular CLI 使用 `app-`。

::: warning 重要
Angular 自身的框架 API 使用 `ng` 选择器前缀。永远不要把 `ng` 用作你自己的自定义组件的选择器前缀。

:::

### 何时使用属性选择器 {#when-to-use-an-attribute-selector}

当你想在标准原生元素上创建组件时，应该考虑使用属性选择器。
例如，如果你想创建一个自定义按钮组件，就可以通过属性选择器
充分利用标准的 `<button>` 元素：

```ts
@Component({
  selector: 'button[yt-upload]',
   ...
})
export class YouTubeUploadButton { }
```

这种方式让组件的使用者无需额外工作，就能直接使用该元素的所有标准 API。
这对于 `aria-label` 等 ARIA 属性尤其有价值。

当 Angular 遇到不匹配任何可用组件的自定义属性时，不会报错。
使用带属性选择器的组件时，使用者可能会忘记导入该组件或其 NgModule，
导致组件无法渲染。
更多信息请参阅[导入和使用组件](/guide/components#imports-in-the-component-decorator)。

定义属性选择器的组件应使用小写、短横线分隔（dash-case）的属性名。
你也可以遵循上面描述的同样的前缀建议。
