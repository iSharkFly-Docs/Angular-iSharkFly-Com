# 指令

指令（Directive）为 Angular 应用中的元素和组件（Component）添加行为。


指令可以改变元素的外观、行为，或者它在 DOM 中的位置。Angular 自带了若干内置指令，你也可以编写自己的指令。

## 何时使用指令

当指令封装的是你想应用到现有元素或组件上的**可复用**行为时，它最能发挥作用。

常见的例子包括：

- 在许多元素上应用相同的外观或行为，例如自动聚焦或工具提示。
- 读取或写入宿主元素（Host Element）的 DOM、属性或 CSS 类。
- 在不修改源代码的情况下，为不归你所有的组件添加行为。

如果你需要渲染自己的标记，或者用自己的模板（Template）管理一块 UI，请使用[组件](/guide/components)——一种拥有自己模板的特殊指令。

## 一个简单的例子

假设你希望元素在用户鼠标悬停时高亮显示，把背景色变为黄色。与其在每个元素上重复同样的事件处理逻辑，不如把这种行为封装到一个指令中，在需要的地方应用它。

下面的 `appHighlight` 指令会在鼠标进入时设置宿主元素的背景色，在鼠标离开时清除它：

```ts
import {Directive, signal} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'isHovered.set(true)',
    '(mouseleave)': 'isHovered.set(false)',
    '[style.background-color]': 'isHovered() ? "yellow" : null',
  },
})
export class HighlightDirective {
  protected isHovered = signal(false);
}
```

`host` 元数据监听鼠标事件来更新 `isHovered` 信号（Signal），并把宿主元素的 `background-color` 样式绑定到该信号的值。

把指令的选择器（Selector）作为属性添加到元素上，即可应用该指令：

```html
<p appHighlight>Highlight me!</p>
```

每个带有 `appHighlight` 属性的元素都会获得相同的悬停行为，而逻辑只在一处定义。

## 指令的类型

Angular 有三种主要的指令类型：

| 指令类型                                                        | 详情                                                                              |
| :-------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| [组件](/guide/components)                                  | 用自己的模板定义可复用的 UI。                                       |
| [属性型指令](/guide/directives/attribute-directives)   | 改变元素、组件或其他指令的外观或行为。 |
| [结构型指令](/guide/directives/structural-directives) | 通过添加和移除 DOM 元素来改变 DOM 布局。                        |

## 下一步

在下面的指南中进一步了解每种类型的指令。

- [属性型指令](/guide/directives/attribute-directives)
- [结构型指令](/guide/directives/structural-directives)
- [指令组合 API](/guide/directives/directive-composition-api)

