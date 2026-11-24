# 属性型指令

属性型指令（Attribute Directive）用于改变 DOM 元素和 Angular 组件（Component）的外观或行为。

## 一次性的行为请使用模板绑定

Angular 的模板（Template）语法已经涵盖了修改单个元素的 CSS 类、样式、属性和事件：

- [CSS 类和样式绑定](/guide/templates/binding#css-class-and-style-property-bindings)用于添加和移除 CSS 类及内联样式。
- [属性绑定和 attribute 绑定](/guide/templates/binding)用于设置 DOM 属性和 HTML attribute。
- [事件监听器](/guide/templates/event-listeners)用于响应用户交互。

如果你想把这类行为打包成一个可复用的单元，应用到任意元素或组件上，属性型指令就派上用场了。

## 构建属性型指令

自定义属性型指令是一个带有 `@Directive()` 装饰器的 JavaScript 类。装饰器的 `selector` 定义了用来应用该指令的属性。方括号使其成为属性选择器（Selector），因此该指令会匹配带有该属性的元素。按照惯例，请使用 `app` 之类的前缀来避免命名冲突：

```ts
import {Directive} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {}
```

::: tip 提示
CLI 命令 [`ng generate directive`](/tools/cli/schematics) 会生成指令的骨架代码及其测试文件。

:::

指令可以通过宿主绑定（Host Binding）声明式地修改其宿主，也可以通过对宿主元素（Host Element）的引用命令式地修改它。这个例子[注入](/guide/di)了 [`ElementRef`](https://angular.dev/api/core/ElementRef)，并通过它的 `nativeElement` 属性访问元素，把背景设置为黄色：

```ts [highlight.directive.ts]
import {Directive, ElementRef, inject} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {
  private el = inject(ElementRef);

  constructor() {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }
}
```

::: warning 重要
指令*不*支持命名空间。

:::

```html
<p app:Highlight>This is invalid</p>
```

## 应用属性型指令

要应用该指令，请把它的选择器作为属性添加到元素上：

```html [app.component.html]
<p appHighlight>Highlight me!</p>
```

Angular 会为这个 `<p>` 元素创建一个 `HighlightDirective` 实例，注入对该元素的引用，并把它的背景设置为黄色。

## 处理用户事件

要响应用户交互，请通过 `@Directive()` 装饰器的 `host` 属性，把宿主元素的事件绑定到处理方法上。下面的指令会在指针位于宿主元素上方时高亮该元素，并在指针离开时清除高亮：

```ts [highlight.directive.ts]
// #docplaster
import {Directive, ElementRef, inject} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HighlightDirective {
  private el = inject(ElementRef);

  onMouseEnter() {
    this.highlight('yellow');
  }

  onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

`host` 属性把 `mouseenter` 和 `mouseleave` 事件映射到 `onMouseEnter()` 和 `onMouseLeave()` 方法，这两个方法再委托给 `highlight()` 辅助方法，由它设置宿主元素的背景色。关于宿主事件绑定的更多信息，请参阅[绑定到宿主元素](/guide/components/host-elements#binding-to-the-host-element)。

## 接受输入值

与组件一样，指令也通过 [`input()`](/guide/components/inputs) 函数接受输入（Input）。给输入取一个与选择器相同的名字，这样一个绑定（Binding）就能同时应用指令并向它传值：

```ts [highlight.directive.ts]
appHighlight = input('');
```

像调用信号（Signal）一样调用输入来读取它，并在没有设置颜色时回退到默认值：

```ts [highlight.directive.ts]
onMouseEnter() {
  this.highlight(this.appHighlight() || 'red');
}
```

在模板中，把值绑定到选择器上。由于输入与选择器同名，`[appHighlight]` 既会应用指令，也会设置它的值。这里绑定的 `color` 是组件上的一个属性：

```html [app.component.html]
<p [appHighlight]="color">Highlight me!</p>
```

```ts [app.component.ts]
export class AppComponent {
  color = '';
}
```

一个指令可以声明多个输入。下面的指令添加了一个 `defaultColor` 输入，然后依次回退到 `appHighlight`、`defaultColor`，最后是 `red`：

```ts [highlight.directive.ts]
import {Directive, ElementRef, inject, input} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HighlightDirective {
  private el = inject(ElementRef);

  defaultColor = input('');

  appHighlight = input('');

  onMouseEnter() {
    this.highlight(this.appHighlight() || this.defaultColor() || 'red');
  }

  onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

在同一个元素上绑定这两个输入。由于 `defaultColor` 接受的是静态字符串而不是动态表达式，因此不需要方括号：

```html [app.component.html]
<p [appHighlight]="color" defaultColor="violet">Highlight me too!</p>
```

## 使用 `NgNonBindable` 停用 Angular 处理

要阻止浏览器中的表达式求值，请在宿主元素上添加 `ngNonBindable`。
`ngNonBindable` 会停用模板中的插值（Interpolation）、指令和绑定。

在下面的例子中，表达式 `{{ 1 + 1 }}` 会按照它在代码编辑器中的样子原样渲染，而不会显示 `2`。

```html [app.component.html]
<p>Use ngNonBindable to stop evaluation.</p>
<p ngNonBindable>This should not evaluate: {{ 1 + 1 }}</p>
```

在元素上应用 `ngNonBindable` 会停止该元素的子元素上的绑定。
不过，`ngNonBindable` 仍然允许指令作用于应用了 `ngNonBindable` 的那个元素本身。
在下面的例子中，`appHighlight` 指令仍然有效，但 Angular 不会对表达式 `{{ 1 + 1 }}` 求值。

```html [app.component.html]
<h3>ngNonBindable with a directive</h3>
<div ngNonBindable [appHighlight]="'yellow'">
  This should not evaluate: {{ 1 + 1 }}, but will highlight yellow.
</div>
```

如果你在父元素上应用 `ngNonBindable`，Angular 就会对该元素的子元素禁用插值和任何类型的绑定，例如属性绑定（Property Binding）或事件绑定（Event Binding）。

## 下一步

- [结构型指令](/guide/directives/structural-directives)
- [指令组合 API](/guide/directives/directive-composition-api)

