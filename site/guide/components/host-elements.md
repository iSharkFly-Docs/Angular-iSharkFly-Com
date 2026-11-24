# 组件宿主元素 {#component-host-elements}

::: tip 提示
本指南假设你已经阅读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

对于每个与组件（Component）选择器（Selector）相匹配的 HTML 元素，Angular 都会创建该组件的一个实例。
与组件选择器相匹配的那个 DOM 元素，就是该组件的**宿主元素（Host Element）**。
组件模板（Template）的内容会渲染在其宿主元素内部。

```ts
// 组件源码
@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
})
export class ProfilePhoto {}
```

```html
<!-- 使用该组件 -->
<h3>Your profile photo</h3>
<profile-photo />
<button>Upload a new profile photo</button>
```

```html
<!-- 渲染出的 DOM -->
<h3>Your profile photo</h3>
<profile-photo>
  <img src="profile-photo.jpg" alt="Your profile photo" />
</profile-photo>
<button>Upload a new profile photo</button>
```

在上面的例子中，`<profile-photo>` 就是 `ProfilePhoto` 组件的宿主元素。

## 绑定到宿主元素 {#binding-to-the-host-element}

组件可以把 DOM 属性、HTML 属性、样式和事件绑定到自己的宿主元素上。其行为与
组件模板内元素上的绑定（Binding）完全相同，只不过是通过
`@Component` 装饰器中的 `host` 属性来定义的：

```ts
@Component({
  ...,
  host: {
    'role': 'slider',
    '[attr.aria-valuenow]': 'value',
    '[class.active]': 'isActive()',
    '[style.background]' : `hasError() ? 'red' : 'green'`,
    '[tabIndex]': 'disabled ? -1 : 0',
    '(keydown)': 'updateValue($event)',
  },
})
export class CustomSlider {
  value: number = 0;
  disabled: boolean = false;
  isActive = signal(false);
  hasError = signal(false);
  updateValue(event: KeyboardEvent) { /* ... */ }

  /* ... */
}
```

::: info 注意
可用作事件名前缀的全局目标名有 `document:`、`window:` 和 `body:`。

:::

::: info 注意
像 `'(keydown.enter)'` 这样的按键名是与 `KeyboardEvent.key` 进行匹配的，而后者取决于
用户的键盘布局和输入语言。要在任何布局下都匹配同一个物理按键，请改用
`code` 修饰符，例如 `'(keydown.code.Enter)'`。详情请参阅
[使用按键修饰符](/guide/templates/event-listeners#using-key-modifiers)。

:::

## `@HostBinding` 和 `@HostListener` 装饰器 {#the-hostbinding-and-hostlistener-decorators}

你也可以把 `@HostBinding` 和 `@HostListener` 装饰器应用到类成员上，
以此绑定到宿主元素。

`@HostBinding` 让你可以把宿主的 DOM 属性和 HTML 属性绑定到类的属性和 getter 上：

```ts
@Component({/* ... */})
export class CustomSlider {
  @HostBinding('attr.aria-valuenow')
  value: number = 0;

  @HostBinding('tabIndex')
  get tabIndex() {
    return this.disabled ? -1 : 0;
  }

  /* ... */
}
```

`@HostListener` 让你可以把事件监听器（Event Listener）绑定到宿主元素上。该装饰器接受一个事件
名称和一个可选的参数数组：

```ts
export class CustomSlider {
  @HostListener('keydown', ['$event'])
  updateValue(event: KeyboardEvent) {
    /* ... */
  }
}
```

::: danger 优先使用 `host` 属性，而不是这些装饰器
  **始终优先使用 `host` 属性，而不是 `@HostBinding` 和 `@HostListener`。** 这些
装饰器的存在仅仅是为了向后兼容。
:::

## 绑定冲突 {#binding-collisions}

在模板中使用组件时，你可以为该组件的元素应用绑定。而组件（或应用在它上面的指令（Directive））也可能为相同的 DOM 属性、HTML 属性、CSS 类或样式定义宿主绑定（Host Binding）。

Angular 如何处理这些冲突取决于绑定的类型：

### 类绑定和样式绑定 {#class-and-style-bindings}

类绑定和样式绑定有明确的优先级顺序。模板中定义的绑定优先于指令或组件上定义的宿主绑定：

1. **模板绑定**（例如 `[class.active]` 或 `[style.color]`）
2. **模板中的静态值**（例如模板中的 `class="..."` 或 `style="..."`）
3. **指令的宿主绑定**
4. **组件的宿主绑定**
5. **宿主上的静态值**（例如 `host: {class: '...'}`）

如果某个绑定的值为 `undefined`，Angular 会回退到下一个级别。值为 `null` 则会移除该类或样式，而不会回退。

### DOM 属性和 HTML 属性冲突 {#property-and-attribute-collisions}

对于非样式类的 DOM 属性和 HTML 属性（例如 `id`、`role` 或 `[attr.aria-*]`）：

- **静态属性：** 如果模板和组件都声明了同一个静态属性（例如 `<my-cmp id="parent">` 和 `host: {id: 'child'}`），则模板中设置的属性胜出。
- **静态与动态：** 如果一个值是静态的、另一个是动态的，则动态值胜出。
- **动态绑定：** 避免同时在模板中和通过宿主绑定绑定到同一个 DOM 属性或 HTML 属性。Angular 不会协调重复的属性绑定（Property Binding）；重叠的动态绑定可能会根据变更检测（Change Detection）的执行顺序导致意外的覆盖。

## 使用 CSS 自定义属性设置样式 {#styling-with-css-custom-properties}

开发者经常借助 [CSS 自定义属性](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties)来灵活配置组件的样式。
你可以通过[样式绑定](/guide/templates/binding#css-style-properties)在宿主元素上设置这类自定义属性。

```ts
@Component({
  /* ... */
  host: {
    '[style.--my-background]': 'color()',
  },
})
export class MyComponent {
  color = signal('lightgreen');
}
```

在这个例子中，CSS 自定义属性 `--my-background` 绑定到了 `color` 信号（Signal）。每当 `color` 信号变化时，该自定义属性的值都会自动更新。这会影响当前组件及其所有依赖该自定义属性的子组件。

### 在子组件上设置自定义属性 {#setting-custom-properties-on-children-components}

另外，你也可以通过[样式绑定](/guide/templates/binding#css-style-properties)在子组件的宿主元素上设置 CSS 自定义属性。

```ts
@Component({
  selector: 'my-component',
  template: `<my-child [style.--my-background]="color()" />`,
})
export class MyComponent {
  color = signal('lightgreen');
}
```

## 注入宿主元素的属性 {#injecting-host-element-attributes}

组件和指令可以将 `HostAttributeToken` 与 [`inject`](https://angular.dev/api/core/inject) 函数配合使用，从宿主元素上读取静态属性。

```ts
import { Component, HostAttributeToken, inject } from '@angular/core';

@Component({
  selector: 'app-button',
  ...,
})
export class Button {
  variation = inject(new HostAttributeToken('variation'));
}
```

```html
<app-button variation="primary">Click me</app-button>
```

::: tip 提示
如果该属性不存在，`HostAttributeToken` 会抛出错误，除非将这次注入标记为可选。

:::
