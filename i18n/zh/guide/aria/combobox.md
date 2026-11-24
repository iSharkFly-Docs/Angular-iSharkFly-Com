# 组合框

- [组合框 ARIA 模式](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [Combobox API 参考](/api?query=combobox#angular_aria_combobox)


## 概览

组合框（combobox）是一个指令（directive），用于协调触发元素（例如文本输入框、按钮或 `div`）与弹出层，是自动完成（autocomplete）、选择框（select）和多选（multiselect）模式的基础指令。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/manual/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/manual/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/manual/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.css)

</TabItem>

</Tabs>

## 用法

组合框是一个基础指令，用于协调可交互的触发元素（例如文本输入框、按钮或 `div`）与弹出层，为自动完成、选择框和多选模式提供基础。以下情况可以考虑直接使用组合框：

- **构建自定义自动完成模式** - 创建专门的过滤或建议行为
- **创建自定义选择组件** - 开发具有特殊需求的下拉框
- **协调输入框与弹出层** - 将文本输入框与列表框（listbox）、树（tree）或对话框内容搭配使用
- **实现自定义过滤** - 在用户代码中过滤并编排匹配的选项

以下情况请改用已有文档的模式：

- 需要带过滤功能的标准自动完成 - 请参阅[自动完成模式](/guide/aria/autocomplete)，获取开箱即用的示例
- 需要单选下拉框 - 请参阅[选择框模式](/guide/aria/select)，获取完整的下拉框实现
- 需要多选下拉框 - 请参阅[多选模式](/guide/aria/multiselect)，获取紧凑显示的多选实现

::: info 注意
[自动完成](/guide/aria/autocomplete)、[选择框](/guide/aria/select)和[多选](/guide/aria/multiselect)指南展示了针对特定使用场景、将此指令与[列表框](/guide/aria/listbox)结合使用的已有文档模式。

:::

## 特性

Angular 的组合框提供了完全无障碍的输入框与弹出层协调机制，具有以下特性：

- **触发元素与弹出层** - 协调触发元素与弹出内容
- **灵活的协调方式** - 与标准布局（列表框、树、网格或对话框）无缝集成
- **键盘导航（keyboard navigation）** - 处理方向键、Enter 和 Escape
- **屏幕阅读器（screen reader）支持** - 内置 ARIA 属性，包括 role="combobox" 和 aria-expanded
- **弹出层管理** - 根据用户交互自动显示或隐藏
- **基于信号的响应式** - 使用 Angular 信号（signal）进行响应式状态管理

## 示例

### 自动完成

一个无障碍的输入框，会在用户输入时过滤并建议选项，帮助用户从列表中查找并选择值。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

过滤在用户代码中管理：更新一个信号，由它以响应式的方式过滤选项列表。用户用方向键导航，用 Enter 或点击进行选择。这种方式让你对自定义选择逻辑拥有完全的控制和最大的灵活性。完整的过滤模式和示例请参阅[自动完成指南](/guide/aria/autocomplete)。

### 只读模式

这种模式将只读组合框与列表框结合，创建支持键盘导航和屏幕阅读器的单选下拉框。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/retro/app/app.css)

</TabItem>

</Tabs>

若要在没有文本输入的情况下触发下拉框，可以使用按钮作为宿主触发元素，或者为输入框触发元素加上原生 HTML 的 `readonly` attribute。点击或按方向键即可打开弹出层。

这种配置是[选择框](/guide/aria/select)和[多选](/guide/aria/multiselect)模式的基础。包含触发元素和浮层定位的完整下拉框实现，请参阅这两篇指南。

### 日期选择器网格

组合框可以与二维网格（grid）协同，创建无障碍的日期选择器。用户在日历网格表格中用方向键浏览日期，并通过点击、Enter 或空格键确认选择。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.css)

</TabItem>

</Tabs>

### 对话框弹出层

对话框弹出层将组合框触发元素与标准的对话框布局和焦点（focus）陷阱（例如 CDK 的 `cdkTrapFocus`）结合起来。当浮层需要模态行为或背景遮罩交互时，请使用对话框弹出层。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/dialog/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/dialog/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/dialog/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/dialog/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/dialog/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/dialog/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.css)

</TabItem>

</Tabs>

## 测试

Angular Aria 提供了 `ComboboxHarness`，用于测试组合框组件（component）。
下面是在组件测试中使用该测试工具的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComboboxHarness} from '@angular/aria/combobox/testing';
import {MyComboboxComponent} from './my-combobox'; // 你的组件

describe('MyComboboxComponent', () => {
  let fixture: ComponentFixture<MyComboboxComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyComboboxComponent],
    });

    fixture = TestBed.createComponent(MyComboboxComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow opening and closing the popup', async () => {
    const combobox = await loader.getHarness(ComboboxHarness);

    // 验证初始状态
    expect(await combobox.isOpen()).toBe(false);

    // 打开弹出层
    await combobox.open();
    expect(await combobox.isOpen()).toBe(true);

    // 关闭弹出层
    await combobox.close();
    expect(await combobox.isOpen()).toBe(false);
  });
});
```

## API 参考

详细的 API 文档请参阅以下 API 参考：

- [`Combobox`](https://angular.dev/api/aria/combobox/Combobox)
- [`ComboboxPopup`](https://angular.dev/api/aria/combobox/ComboboxPopup)
- [`ComboboxWidget`](https://angular.dev/api/aria/combobox/ComboboxWidget)

### 相关模式和指令

组合框是以下已有文档模式的基础指令：

- [自动完成](/guide/aria/autocomplete) - 过滤和建议模式（协调输入内容与选项列表）
- [选择框](/guide/aria/select) - 单选下拉框模式（直接应用在不可编辑的按钮触发元素上）
- [多选](/guide/aria/multiselect) - 多选模式（应用在不可编辑的触发元素上，并搭配启用多选的列表框）

组合框通常与以下指令结合使用：

- [列表框](/guide/aria/listbox) - 最常见的弹出内容
- [树](/guide/aria/tree) - 层级结构的弹出内容（示例请参阅树指南）
