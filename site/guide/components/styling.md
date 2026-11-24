# 为组件设置样式 {#styling-components}

::: tip 提示
本指南假设你已经阅读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

组件（Component）可以选择性地包含作用于该组件 DOM 的 CSS 样式：

```ts
@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
  styles: `
    img {
      border-radius: 50%;
    }
  `,
})
export class ProfilePhoto {}
```

你也可以选择把样式写在单独的文件中：

```ts
@Component({
  selector: 'profile-photo',
  templateUrl: 'profile-photo.html',
  styleUrl: 'profile-photo.css',
})
export class ProfilePhoto {}
```

当 Angular 编译你的组件时，这些样式会随组件的 JavaScript 输出一起生成。
这意味着组件样式会参与 JavaScript 模块系统。当你
渲染一个 Angular 组件时，框架会自动包含与之关联的样式，即使是
延迟加载（Lazy Loading）的组件也是如此。

Angular 可以与任何输出 CSS 的工具配合使用，
包括 [Sass](https://sass-lang.com)、[Less](https://lesscss.org)
和 [Stylus](https://stylus-lang.com)。

## 样式作用域 {#style-scoping}

每个组件都有一个**视图封装**（View Encapsulation）设置，它决定了框架如何限定
组件样式的作用域。视图封装共有四种模式：`Emulated`、`ShadowDom`、`ExperimentalIsolatedShadowDom` 和 `None`。
你可以在 `@Component` 装饰器中指定模式：

```ts
@Component({
  ...,
  encapsulation: ViewEncapsulation.None,
})
export class ProfilePhoto { }
```

### ViewEncapsulation.Emulated {#viewencapsulation-emulated}

默认情况下，Angular 使用模拟封装，使组件的样式只作用于
该组件模板（Template）中定义的元素。在这种模式下，框架会为每个组件实例生成一个唯一的 HTML 属性，
把该属性添加到组件模板中的元素上，
并把该属性插入到组件样式中定义的 CSS 选择器（Selector）里。

这种模式确保组件的样式不会泄漏出去影响其他组件。不过，
在组件外部定义的全局样式仍然可能影响
使用模拟封装的组件内部的元素。

在模拟模式下，Angular 支持
[`:host`](https://developer.mozilla.org/docs/Web/CSS/:host) 伪类。
虽然 [`:host-context()`](https://developer.mozilla.org/docs/Web/CSS/:host-context) 伪类
在现代浏览器中已被弃用，但 Angular 编译器为它提供了完整的支持。这两个伪类
都可以在不依赖原生
[Shadow DOM](https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM) 的情况下使用。
在编译期间，框架会把这些伪类转换为属性，因此在运行时它们并不遵循
这些原生伪类的规则（例如浏览器兼容性、优先级）。Angular 的
模拟封装模式不支持任何其他与 Shadow DOM 相关的伪类，例如
`::shadow` 或 `::part`。

#### `::ng-deep` {#ng-deep}

Angular 的模拟封装模式支持一个自定义伪类 `::ng-deep`。
**Angular 团队强烈不建议在新代码中使用 `::ng-deep`**。这些 API 保留下来
仅仅是为了向后兼容。

当选择器包含 `::ng-deep` 时，Angular 会在选择器中该位置之后不再应用视图封装边界。选择器中位于 `::ng-deep` 之后的任何部分都可以匹配组件模板之外的元素。

例如：

- 像 `p a` 这样的 CSS 规则选择器，在使用模拟封装时，会匹配作为 `<p>` 元素后代的 `<a>` 元素，
  并且两者都必须位于组件自身的模板中。

- 像 `::ng-deep p a` 这样的选择器会匹配应用中任意位置的、作为 `<p>` 元素后代的 `<a>` 元素，这里的 `<p>` 元素也可以位于应用中的任意位置。

  这实际上让它表现得像一个全局样式。

- 在 `p ::ng-deep a` 中，Angular 要求 `<p>` 元素来自组件自身的模板，但 `<a>` 元素可以位于应用中的任意位置。

  因此，实际上 `<a>` 元素可以位于该组件的模板中，也可以位于它的任何投影内容或子内容中。

- 对于 `:host ::ng-deep p a`，`<a>` 和 `<p>` 元素都必须是组件宿主元素（Host Element）的后代。

  它们可以来自组件的模板或其子组件的视图，但不能来自应用中的其他地方。

### ViewEncapsulation.ShadowDom {#viewencapsulation-shadowdom}

这种模式通过
[Web 标准的 Shadow DOM API](https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM) 把样式限定在组件内部。
启用这种模式时，Angular 会为组件的宿主元素附加一个 shadow root，并把
组件的模板和样式渲染到对应的 shadow tree 中。

shadow tree 内部的样式无法影响该 shadow tree 之外的元素。

不过，启用 `ShadowDom` 封装所影响的不只是样式作用域。把
组件渲染到 shadow tree 中会影响事件传播、与
[`<slot>` API](https://developer.mozilla.org/docs/Web/Web_Components/Using_templates_and_slots) 的交互，
以及浏览器开发者工具显示元素的方式。在启用此选项之前，请务必充分了解在应用中使用
Shadow DOM 的全部影响。

### ViewEncapsulation.ExperimentalIsolatedShadowDom {#viewencapsulation-experimentalisolatedshadowdom}

其行为与上面相同，只是这种模式严格保证*只有*该组件自己的样式会作用于
组件模板中的元素。全局样式无法影响 shadow tree 中的元素，而
shadow tree 内部的样式也无法影响该 shadow tree 之外的元素。

### ViewEncapsulation.None {#viewencapsulation-none}

这种模式会禁用该组件的所有样式封装。与该
组件关联的任何样式都表现为全局样式。

::: info 注意
在 `Emulated` 和 `ShadowDom` 模式下，Angular 并不能 100% 保证你的组件样式总能覆盖来自组件外部的样式。
发生冲突时，会假定这些样式与组件样式具有相同的优先级。

:::

## 在模板中定义样式 {#defining-styles-in-templates}

你可以在组件模板中使用 `<style>` 元素来定义额外的样式。
组件的视图封装模式同样适用于以这种方式定义的样式。

Angular 不支持在 style 元素内部使用绑定（Binding）。

## 引用外部样式文件 {#referencing-external-style-files}

组件模板可以
使用 [`<link>` 元素](https://developer.mozilla.org/docs/Web/HTML/Element/link)来
引用 CSS 文件。此外，你的 CSS 也可以
使用 [`@import` at-rule](https://developer.mozilla.org/docs/Web/CSS/@import) 来引用
CSS 文件。Angular 会把这些引用视为*外部*样式。外部样式不受
模拟视图封装的影响。

## 为 CSS 自定义属性添加命名空间 {#namespacing-css-custom-properties}

Angular 可以为组件样式中声明和读取的 CSS 自定义属性（也称为 CSS 变量）
添加前缀。自定义属性会沿 DOM 树向下继承，因此当应用外部的某些东西
在祖先元素上定义了 `--primary-color` 之类的自定义属性时，你的组件就会读到这个值。
当你的应用与另一个应用或你无法控制的标记共享同一个页面时，这一点就很重要。
除非你主动要求，否则 Angular 不会为自定义属性添加命名空间；
独占整个页面的应用也不需要命名空间。

要把组件样式中的自定义属性限定在你的应用范围内，请把
[`provideCssVarNamespacing`](https://angular.dev/api/platform-browser/provideCssVarNamespacing) 添加到应用的
提供者（Provider）中。它会使用应用的 [`APP_ID`](https://angular.dev/api/core/APP_ID) 作为命名空间：

```ts [app.config.ts]
import {APP_ID, ApplicationConfig} from '@angular/core';
import {provideCssVarNamespacing} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [{provide: APP_ID, useValue: 'my-app'}, provideCssVarNamespacing()],
};
```

Angular 会给组件样式中的自定义属性加上该命名空间和一个下划线作为前缀，
因此 `--primary-color` 会变成 `--my-app_primary-color`。该前缀适用于
声明、`var()` 引用、`@property` 规则，以及 `[style.--primary-color]` 这样的样式绑定，
包括组件在其 `host` 对象中声明的样式绑定。

除非你另行设置，否则 `APP_ID` 为 `ng`，因此请为页面上的每个应用设置各自的 `APP_ID`。
否则，这些应用会共用同一个前缀，从而再次发生冲突。要使用不同于
应用 id 的命名空间，请把它传给 `provideCssVarNamespacing`。Angular 会自行追加下划线：
`provideCssVarNamespacing('my-app_')` 会生成 `--my-app__primary-color`。

Angular 会为它编译进组件的样式添加命名空间：包括组件的 `styles` 和 `styleUrl`、
在其模板中[用 `<style>` 元素编写](#defining-styles-in-templates)的样式、
其模板通过相对路径的 `<link rel="stylesheet">` 引用的样式表，以及
使用 `ViewEncapsulation.None` 的组件的样式。Angular 不会为浏览器在运行时加载的样式表添加命名空间，
例如构建配置中列出的全局样式表，或者
构建过程没有内联的[外部样式](#referencing-external-style-files)。

命名空间会应用于 Angular 编译的每一个组件，包括你所安装的库中的组件。
当库的样式读取由全局样式表定义的自定义属性（例如主题中的属性）时，
引用将不再匹配，浏览器会使用 `var()` 的
后备值（如果有的话），否则使用
[该属性的继承值或初始值](https://www.w3.org/TR/css-variables-1/#invalid-variables)，
而且不会报告任何错误。在现有应用中启用命名空间之前，
请先检查在全局样式表和
组件之间互相引用的自定义属性。

::: warning 重要
Angular 只会改写它所编译的样式和绑定中的自定义属性名。
其他地方都会保留你所写的名称，并且不会报告这种不匹配。

:::

Angular 不会改写以下位置中的名称：

- 静态 style 属性，例如 `style="--primary-color: red"`，包括
  组件 `host` 对象中的 `style` 条目。
- 对象和字符串形式的样式绑定，例如 `[style]="{'--primary-color': color}"`、
  `[style]="'--primary-color: red'"` 和 `ngStyle`，包括组件
  `host` 对象中的 `[style]` 条目。
- 绑定值内部的自定义属性名，例如
  `[style.border-color]="'var(--primary-color)'"`。
- 对 `Renderer2.setStyle` 的调用。

上述每一种情况生成的属性，都不会再被你添加了命名空间的样式读取。请按照
[在 TypeScript 中使用带命名空间的属性](#using-namespaced-properties-in-typescript)中的描述，
自行为这些名称添加命名空间。

### 退出命名空间 {#opting-out-of-namespacing}

要声明或读取一个 Angular 不添加命名空间的自定义属性（例如在
全局样式表中定义的属性），请在其名称前加上 `--global--` 前缀。Angular 会移除 `--global`，并保留
剩下的 `--` 和名称的其余部分不变：

```css
:host {
  /* 声明 --accent-color 并读取 --brand-color，而不是 --my-app_brand-color。 */
  --global--accent-color: navy;
  color: var(--global--brand-color);
}
```

`global` 之后要写两个连字符。只写一个连字符（如 `--global-brand-color`）并不会退出命名空间，
Angular 会像对待其他名称一样为它添加命名空间。避免使用以 `--global-` 开头、
但后面紧跟的不是第二个连字符的名称；未来的某个主版本计划在构建时拒绝这类名称。
Angular 会在每个应用中移除 `--global`，包括从未配置
命名空间的应用。

### 在 TypeScript 中使用带命名空间的属性 {#using-namespaced-properties-in-typescript}

优先使用 `[style.--primary-color]` 这样的样式绑定，Angular 会为你添加命名空间。当
你改为通过 DOM API 操作时，请把你在样式中写的名称（包括开头的 `--`）传给
[`CssVarNamespacer`](https://angular.dev/api/platform-browser/CssVarNamespacer)：

```ts [profile-photo.ts]
import {Component, ElementRef, inject} from '@angular/core';
import {CssVarNamespacer} from '@angular/platform-browser';

@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
  styles: `
    img {
      border: 2px solid var(--primary-color);
    }
  `,
})
export class ProfilePhoto {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly cssVarNamespacer = inject(CssVarNamespacer);

  setPrimaryColor(color: string): void {
    this.host.style.setProperty(this.cssVarNamespacer.namespace('--primary-color'), color);
  }
}
```

对于用 `--global--` 声明的属性，请使用不带前缀的名称，因为 Angular 从不为它们添加命名空间。
对于其他所有属性，当应用没有配置命名空间时，`namespace` 会原样返回名称，
因此库可以为其自身样式声明的自定义属性调用它。
