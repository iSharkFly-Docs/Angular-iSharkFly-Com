# 组件的高级配置

::: tip 提示
本指南假定你已经读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

## ChangeDetectionStrategy

`@Component` 装饰器接受一个 `changeDetection` 选项，用于控制组件的**变更
检测模式**（Change Detection mode）。变更检测模式有两种选项。

**`ChangeDetectionStrategy.Eager`** 是一种可选模式。在这种模式下，
只要整个应用范围内可能发生了任何活动，Angular 都会检查该组件的 DOM 是否需要更新。
触发这种检查的活动包括用户交互、网络响应、
定时器等。

**`ChangeDetectionStrategy.OnPush`** 是默认策略（从 v22 开始）。这种模式减少了 Angular
需要执行的检查次数。在这种模式下，框架只会在以下情况检查组件的 DOM 是否需要更新：

- 组件的某个输入（input）因模板中的绑定（binding）而发生了变化，或者
- 该组件中的某个事件监听器（event listener）运行了
- 组件被显式标记为需要检查，比如通过 `ChangeDetectorRef.markForCheck` 或包装了它的东西（例如 `AsyncPipe`）。
- 组件模板中读取的某个信号（Signal）发生了变化。

在前三种情况下，Angular **还会**检查该组件的所有祖先
组件，沿应用树向上遍历。当信号发生变化时，Angular 只会
刷新那些在模板中读取了该信号的组件。

## PreserveWhitespaces

默认情况下，Angular 会移除并折叠模板（Template）中多余的空白字符，最常见的是
换行和缩进产生的空白。你可以在组件的元数据中显式地把 `preserveWhitespaces` 设置为
`true` 来更改这一设置。

## 自定义元素 schema

默认情况下，Angular 遇到未知的 HTML 元素时会抛出错误。你可以
在组件元数据的 `schemas` 属性中加入 `CUSTOM_ELEMENTS_SCHEMA`，
为组件禁用这一行为。

```ts
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

@Component({
  ...,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: '<some-unknown-component />'
})
export class ComponentWithCustomElements { }
```

Angular 还提供了 `NO_ERRORS_SCHEMA`，它允许任何元素和任何属性。
