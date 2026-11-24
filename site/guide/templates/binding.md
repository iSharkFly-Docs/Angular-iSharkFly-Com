# 绑定动态文本、属性和 attribute {#binding-dynamic-text-properties-and-attributes}

在 Angular 中，**绑定**（Binding）会在组件（Component）的模板（Template）与其数据之间建立动态连接。这种连接可以确保组件数据的变化会自动更新渲染出的模板。

## 使用文本插值渲染动态文本 {#render-dynamic-text-with-text-interpolation}

你可以在模板中用双花括号绑定动态文本，它告诉 Angular 由它负责其中的表达式，并确保它被正确更新。这称为**文本插值（Interpolation）**。

```ts
@Component({
  template: `
    <p>Your color preference is {{ theme }}.</p>
  `,
  ...
})
export class App {
  theme = 'dark';
}
```

在这个示例中，当这段代码渲染到页面上时，Angular 会把 `{{ theme }}` 替换为 `dark`。

```html
<!-- 渲染输出 -->
<p>Your color preference is dark.</p>
```

会随时间变化的绑定应该从[信号](/guide/signals)中读取值。Angular 会跟踪模板中读取的信号（Signal），并在这些信号的值发生变化时更新渲染出的页面。

```ts
@Component({
  template: `
    <!-- `welcomeMessage` 变化时不一定会更新。 -->
    <p>{{ welcomeMessage }}</p>

    <p>Your color preference is {{ theme() }}.</p> <!-- `theme` 信号的值变化时总会更新。 -->
  `
  ...
})
export class App {
  welcomeMessage = "Welcome, enjoy this app that we built for you";
  theme = signal('dark');
}
```

更多细节请参阅[信号指南](/guide/signals)。

继续上面的主题示例，如果用户在页面加载后点击了一个按钮，把 `theme` 信号更新为 `'light'`，页面就会相应地更新为：

```html
<!-- 渲染输出 -->
<p>Your color preference is light.</p>
```

在 HTML 中通常可以书写文本的任何地方，都可以使用文本插值。

表达式的值会被转换为字符串。`null` 和 `undefined` 会渲染为空字符串。对象和数组会使用该值的 `toString` 方法进行转换。

## 绑定动态属性和 attribute {#binding-dynamic-properties-and-attributes}

Angular 支持用方括号把动态值绑定到对象属性（property）和 HTML attribute 上。

你可以绑定到 HTML 元素的 DOM 实例、[组件](/guide/components)实例或[指令](/guide/directives)实例上的属性。

### 原生元素属性 {#native-element-properties}

每个 HTML 元素都有对应的 DOM 表示。例如，每个 `<button>` HTML 元素都对应 DOM 中的一个 `HTMLButtonElement` 实例。在 Angular 中，你可以使用属性绑定（Property Binding）直接为元素的 DOM 表示设置值。

```html
<!-- 绑定按钮元素 DOM 对象上的 `disabled` 属性 -->
<button [disabled]="isFormValid()">Save</button>
```

在这个示例中，每当 `isFormValid` 发生变化时，Angular 都会自动设置 `HTMLButtonElement` 实例的 `disabled` 属性。

### 组件和指令属性 {#component-and-directive-properties}

当元素是一个 Angular 组件时，你可以使用相同的方括号语法，通过属性绑定来设置组件的输入（Input）属性。

```html
<!-- 绑定 `MyListbox` 组件实例上的 `value` 属性。 -->
<my-listbox [value]="mySelection()" />
```

在这个示例中，每当 `mySelection` 发生变化时，Angular 都会自动设置 `MyListbox` 实例的 `value` 属性。

你也可以绑定到指令（Directive）的属性。

```html
<!-- 绑定到 `NgOptimizedImage` 指令的 `ngSrc` 属性  -->
<img [ngSrc]="profilePhotoUrl()" alt="The current user's profile photo" />
```

### Attribute {#attributes}

当你需要设置没有对应 DOM 属性的 HTML attribute（例如 SVG attribute）时，可以在模板中使用 `attr.` 前缀把 attribute 绑定到元素上。

<!-- prettier-ignore -->
```html
<!-- 把 `<ul>` 元素的 `role` attribute 绑定到组件的 `listRole` 属性。 -->
<ul [attr.role]="listRole()">
```

在这个示例中，每当 `listRole` 发生变化时，Angular 都会调用 `setAttribute`，自动设置 `<ul>` 元素的 `role` attribute。

如果 attribute 绑定的值是 `null` 或 `undefined`，Angular 会调用 `removeAttribute` 移除该 attribute。

### 在属性和 attribute 中使用文本插值 {#text-interpolation-in-properties-and-attributes}

你也可以在属性和 attribute 中使用文本插值语法：用双花括号语法代替属性名或 attribute 名两侧的方括号。使用这种语法时，Angular 会把这个赋值当作属性绑定来处理。

```html
<!-- 把一个值绑定到图片元素 DOM 对象的 `alt` 属性上。 -->
<img src="profile-photo.jpg" alt="Profile photo of {{ firstName() }}" />
```

## CSS 类和样式属性绑定 {#css-class-and-style-property-bindings}

Angular 还提供了一些额外的功能，用于把 CSS 类和 CSS 样式属性绑定到元素上。

### CSS 类 {#css-classes}

你可以创建一个 CSS 类绑定，根据绑定值是[真值还是假值](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)，有条件地在元素上添加或移除某个 CSS 类。

<!-- prettier-ignore -->
```html
<!-- 当 `isExpanded` 为真值时，添加 `expanded` CSS 类。 -->
<ul [class.expanded]="isExpanded()">
```

你也可以直接绑定到 `class` 属性。Angular 接受三种类型的值：

| `class` 值的说明                                                                                                                                      | TypeScript 类型       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 包含一个或多个以空格分隔的 CSS 类的字符串                                                                                                   | `string`              |
| CSS 类字符串组成的数组                                                                                                                                     | `string[]`            |
| 一个对象，其每个属性名都是一个 CSS 类名，对应的值根据其真假决定是否把该类应用到元素上。 | `Record<string, any>` |

```ts
@Component({
  template: `
    <ul [class]="listClasses"> ... </ul>
    <section [class]="sectionClasses()"> ... </section>
    <button [class]="buttonClasses()"> ... </button>
  `,
  ...
})
export class UserProfile {
  listClasses = 'full-width outlined';
  sectionClasses = signal(['expandable', 'elevated']);
  buttonClasses = signal({
    highlighted: true,
    embiggened: false,
  });
}
```

上面的示例会渲染出如下 DOM：

<!-- prettier-ignore -->
```html
<ul class="full-width outlined"> ... </ul>
<section class="expandable elevated"> ... </section>
<button class="highlighted"> ... </button>
```

Angular 会按空白字符拆分字符串值，并忽略空字符串。

当同时使用静态 CSS 类、直接绑定 `class` 以及绑定特定的类时，Angular 会智能地把所有类合并到渲染结果中。

```ts
@Component({
  template: `<ul class="list" [class]="listType()" [class.expanded]="isExpanded()"> ...`,
  ...
})
export class Listbox {
  listType = signal('box');
  isExpanded = signal(true);
}
```

在上面的示例中，Angular 渲染出的 `ul` 元素会带有全部三个 CSS 类。

<!-- prettier-ignore -->
```html
<ul class="list box expanded">
```

Angular 不保证渲染出的元素上 CSS 类的顺序。

把 `class` 绑定到数组或对象时，Angular 会使用全等运算符（`===`）比较前一个值和当前值。修改这些值时，你必须创建新的对象或数组实例，Angular 才会应用更新。

如果一个元素对同一个 CSS 类有多个绑定，Angular 会按照其样式优先级顺序来解决冲突。

::: info 注意
类绑定不支持在单个键中使用以空格分隔的多个类名。由于绑定的引用保持不变，它们也不支持对对象的修改。如果你需要其中任一功能，请使用 [ngClass](https://angular.dev/api/common/NgClass) 指令。

:::

### CSS 样式属性 {#css-style-properties}

你也可以直接绑定元素上的 CSS 样式属性。

<!-- prettier-ignore -->
```html
<!-- 根据 `isExpanded` 属性设置 CSS 的 `display` 属性。 -->
<section [style.display]="isExpanded() ? 'block' : 'none'">
```

对于接受单位的 CSS 属性，你还可以进一步指定单位。

<!-- prettier-ignore -->
```html
<!-- 根据 `sectionHeightInPixels` 属性，把 CSS 的 `height` 属性设置为像素值。 -->
<section [style.height.px]="sectionHeightInPixels()">
```

你也可以在一个绑定中设置多个样式值。Angular 接受以下类型的值：

| `style` 值的说明                                                                                              | TypeScript 类型       |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 包含零个或多个 CSS 声明的字符串，例如 `"display: flex; margin: 8px"`。                                | `string`              |
| 一个对象，其每个属性名都是一个 CSS 属性名，对应的值就是该 CSS 属性的值。 | `Record<string, any>` |

```ts
@Component({
  template: `
    <ul [style]="listStyles()"> ... </ul>
    <section [style]="sectionStyles()"> ... </section>
  `,
  ...
})
export class UserProfile {
  listStyles = signal('display: flex; padding: 8px');
  sectionStyles = signal({
    border: '1px solid black',
    'font-weight': 'bold',
  });
}
```

上面的示例会渲染出如下 DOM。

<!-- prettier-ignore -->
```html
<ul style="display: flex; padding: 8px"> ... </ul>
<section style="border: 1px solid black; font-weight: bold"> ... </section>
```

把 `style` 绑定到对象时，Angular 会使用全等运算符（`===`）比较前一个值和当前值。修改这些值时，你必须创建新的对象实例，Angular 才会应用更新。

如果一个元素对同一个样式属性有多个绑定，Angular 会按照其样式优先级顺序来解决冲突。

## ARIA attribute {#aria-attributes}

Angular 支持把字符串值绑定到 ARIA attribute 上。

```html
<button type="button" [aria-label]="actionLabel()">
  {{ actionLabel() }}
</button>
```

Angular 会把字符串值写入元素的 `aria-label` attribute，并在绑定值为 `null` 或 `undefined` 时移除它。

有些 ARIA 功能会暴露接受结构化值（例如元素引用）的 DOM 属性或指令输入。这些情况请使用标准的属性绑定。示例和更多指导请参阅[无障碍指南](/best-practices/a11y#aria-attributes-and-properties)。
