# Angular Aria




## 什么是 Angular Aria？

构建无障碍组件（component）看似简单，但要按照 [W3C 无障碍指南](https://www.w3.org/TR/wcag/)来实现，需要投入大量精力，还需要具备无障碍方面的专业知识。

Angular Aria 是一组无头（headless）、无障碍的指令（directive），实现了常见的 [WAI-ARIA 模式](https://www.w3.org/WAI/ARIA/apg/patterns/)。这些指令负责处理键盘交互、ARIA 属性、焦点（focus）管理和屏幕阅读器（screen reader）支持。你只需要提供 HTML 结构、CSS 样式和业务逻辑即可！

## 安装

::: code-group

```shell [npm]
npm install @angular/aria
```

```shell [yarn]
yarn add @angular/aria
```

```shell [pnpm]
pnpm add @angular/aria
```

```shell [bun]
bun add @angular/aria
```

:::

## 示例展示

以工具栏（toolbar）菜单为例。它看起来可能只是一排绑定了特定逻辑的「简单」按钮，但对于不熟悉无障碍的开发者来说，键盘导航（keyboard navigation）和屏幕阅读器会带来许多意想不到的复杂性。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

仅在这一个场景中，开发者就需要考虑：

- **键盘导航**。用户需要用 Enter 或 Space 打开菜单，用方向键浏览选项，用 Enter 选择，用 Escape 关闭。
- **屏幕阅读器**需要播报菜单的状态、选项的数量以及哪个选项拥有焦点。
- **焦点管理**需要在触发按钮和菜单项之间合乎逻辑地移动。
- **从右到左书写的语言**需要支持反向导航。

## 包含哪些内容？

Angular Aria 为常见的交互模式提供了指令，并附带完整的文档、可运行的示例和 API 参考：

### 搜索与选择

| 组件                                     | 说明                                     |
| ---------------------------------------- | ---------------------------------------- |
| [Autocomplete](/guide/aria/autocomplete) | 带有过滤建议的文本输入框，建议会随用户输入而出现 |
| [Listbox](/guide/aria/listbox)           | 支持键盘导航的单选或多选选项列表         |
| [Select](/guide/aria/select)             | 支持键盘导航的单选下拉模式               |
| [Multiselect](/guide/aria/multiselect)   | 以紧凑方式显示的多选下拉模式             |
| [Combobox](/guide/aria/combobox)         | 协调文本输入框与弹出层的基础指令         |

### 导航与操作按钮

| 组件                           | 说明                             |
| ------------------------------ | -------------------------------- |
| [Menu](/guide/aria/menu)       | 支持嵌套子菜单和键盘快捷键的下拉菜单 |
| [Menubar](/guide/aria/menubar) | 用于常驻应用菜单的水平导航栏     |
| [Toolbar](/guide/aria/toolbar) | 支持合理键盘导航的成组控件集合   |

### 内容组织

| 组件                               | 说明                                   |
| ---------------------------------- | -------------------------------------- |
| [Accordion](/guide/aria/accordion) | 可单独展开或互斥展开的可折叠内容面板   |
| [Tabs](/guide/aria/tabs)           | 支持自动或手动激活模式的标签页界面     |
| [Tree](/guide/aria/tree)           | 具有展开 / 折叠功能的层级列表          |
| [Grid](/guide/aria/grid)           | 支持逐单元格键盘导航的二维数据展示     |

## 何时使用 Angular Aria

当你需要符合 WCAG 标准、并且使用自定义样式的无障碍交互组件时，Angular Aria 是很好的选择。例如：

- **构建设计系统** - 你的团队维护着一个组件库，有特定的视觉标准，需要无障碍的实现
- **企业级组件库** - 你正在为组织内的多个应用创建可复用的组件
- **自定义品牌要求** - 界面需要符合精确的设计规范，而预设样式的组件库很难满足这些规范

## 何时不使用 Angular Aria

Angular Aria 并不适合所有场景：

- **预设样式的组件** - 如果你需要无需自定义样式就外观完整的组件，请改用 Angular Material
- **简单表单** - 对于简单的用例，`<button>` 和 `<input type="radio">` 等原生 HTML 表单控件已经内置了无障碍支持
- **快速原型** - 在快速验证想法时，预设样式的组件库可以缩短初始开发时间

## 后续步骤

从侧边导航或[上面的列表](#whats-included)中挑选一个组件看看，或者从[工具栏](/guide/aria/toolbar)开始，通过一个完整的示例了解 Angular Aria 指令是如何工作的！
