# 列表框 {#listbox}

- [列表框模式](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [Listbox API 参考](/api?query=listbox#angular_aria_listbox)


## 概览 {#overview}

列表框（listbox）是一个指令（directive），用于显示一组供用户选择的选项，支持键盘导航（keyboard navigation）、单选或多选，以及屏幕阅读器（screen reader）。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

## 用法 {#usage}

列表框是一个基础指令，[选择框](/guide/aria/select)、[多选](/guide/aria/multiselect)和[自动完成](/guide/aria/autocomplete)模式都基于它构建。对于大多数下拉需求，请改用这些已有文档的模式。

以下情况可以考虑直接使用列表框：

- **构建自定义选择组件** - 创建具有特定行为的专用界面
- **可见的选择列表** - 直接在页面上（而不是在下拉框中）显示可选条目
- **自定义集成模式** - 需要与特殊的弹出层或布局要求相集成

以下情况应避免使用列表框：

- **需要导航菜单时** - 对于操作和命令，请使用[菜单](/guide/aria/menu)指令

## 特性 {#features}

Angular 的列表框提供了完全无障碍的列表实现，具有以下特性：

- **键盘导航** - 用方向键浏览选项，用 Enter 或 Space 选择
- **屏幕阅读器支持** - 内置 ARIA 属性，包括 role="listbox"
- **单选或多选** - 由 `multi` 属性控制选择模式
- **水平或垂直** - 由 `orientation` 属性控制布局方向
- **预输入搜索** - 输入字符即可跳转到匹配的选项
- **基于信号的响应式** - 使用 Angular 信号（signal）进行响应式状态管理

## 示例 {#examples}

### 基本列表框 {#basic-listbox}

应用有时需要直接在页面上显示可选列表，而不是将其隐藏在下拉框中。独立（standalone）的列表框可以为这类可见的列表界面提供键盘导航和选择功能。

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/basic/app/app.html)

`value` 模型信号为选中的条目提供双向绑定（two-way binding）。设置 `selectionMode="explicit"` 后，用户需要按 Space 或 Enter 来选择选项。对于将列表框与组合框（combobox）和浮层定位相结合的下拉模式，请参阅[选择框](/guide/aria/select)模式。

### 水平列表框 {#horizontal-listbox}

有些列表更适合水平排列，例如类似工具栏的界面或标签页风格的选择。`orientation` 属性会同时改变布局方向和键盘导航方向。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/horizontal/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/horizontal/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/horizontal/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.css)

</TabItem>

</Tabs>

设置 `orientation="horizontal"` 后，使用左右方向键（而不是上下方向键）在选项之间导航。对于从右到左（RTL）书写的语言，列表框会自动反转导航方向。

### 选择模式 {#selection-modes}

列表框支持两种选择模式，用于控制条目何时被选中。

`'follow'` 模式会自动选中获得焦点的条目，在选择频繁变化时能提供更快捷的交互。`'explicit'` 模式需要按 Space 或 Enter 来确认选择，可以防止导航过程中的误操作。下拉模式通常在单选时使用 `'follow'` 模式。

#### 显式 {#explicit}

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.html)

#### 跟随 {#follow}

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/modes/app/follow/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/listbox/src/modes/app/follow/app.html)

| 模式         | 说明                                                   |
| ------------ | ------------------------------------------------------ |
| `'follow'`   | 自动选中获得焦点的条目，在选择频繁变化时提供更快捷的交互 |
| `'explicit'` | 需要按 Space 或 Enter 确认选择，防止导航过程中的误操作  |

::: tip 提示
下拉模式通常在单选时使用 `'follow'` 模式。

:::

## 测试 {#testing}

Angular Aria 提供了组件测试工具（harness），用于测试列表框组件（component）。
下面是在组件测试中使用这些测试工具的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ListboxHarness} from '@angular/aria/listbox/testing';
import {MyListboxComponent} from './my-listbox'; // 你的组件

describe('MyListboxComponent', () => {
  let fixture: ComponentFixture<MyListboxComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyListboxComponent],
    });

    fixture = TestBed.createComponent(MyListboxComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow selecting options', async () => {
    const listbox = await loader.getHarness(ListboxHarness);

    // 验证列表框的属性
    expect(await listbox.isMulti()).toBe(true);

    // 获取所有选项
    const options = await listbox.getOptions();
    expect(options.length).toBe(2);

    // 点击一个选项
    await options[0].click();

    // 验证该选项已被选中
    expect(await options[0].isSelected()).toBe(true);

    // 按文本过滤选项
    const bananaOption = await listbox.getOptions({text: 'Banana'});
    expect(bananaOption.length).toBe(1);
  });
});
```

## API 参考 {#api-reference}

详细的 API 文档请参阅以下 API 参考：

- [`Listbox`](https://angular.dev/api/aria/listbox/Listbox)
- [`Option`](https://angular.dev/api/aria/listbox/Option)

### 相关模式 {#related-patterns}

以下有文档的下拉模式使用了列表框：

- [选择框](/guide/aria/select) - 单选下拉模式，使用只读组合框 + 列表框
- [多选](/guide/aria/multiselect) - 多选下拉模式，使用只读组合框 + 带 `multi` 的列表框
- [自动完成](/guide/aria/autocomplete) - 可过滤的下拉模式，使用组合框 + 列表框

如果需要包含触发器、弹出层和浮层定位的完整下拉模式，请参阅这些模式的指南，而不要单独使用列表框。
