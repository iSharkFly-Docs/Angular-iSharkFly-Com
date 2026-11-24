# 自动完成 {#autocomplete}

## 概览 {#overview}

自动完成（autocomplete）是一个无障碍的输入框，会在用户输入时过滤并建议选项，帮助用户从列表中查找并选择值。

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

## 用法 {#usage}

当用户需要从大量选项中进行选择、而输入比滚动查找更快时，自动完成最为合适。以下情况可以考虑使用自动完成：

- **选项列表很长**（超过 20 项） - 输入能比在下拉框中滚动更快地缩小选择范围
- **用户知道自己要找什么** - 用户可以输入预期值的一部分（例如州名、产品名或用户名）
- **选项遵循可预测的模式** - 用户可以猜出部分匹配的内容（例如国家代码、邮箱域名或类别）
- **注重速度** - 表单可以借此快速完成选择，无需大量导航

以下情况应避免使用自动完成：

- 列表少于 10 个选项 - 普通的下拉框或单选按钮组能提供更好的可见性
- 用户需要浏览选项 - 如果让用户发现选项很重要，请预先显示所有选项
- 选项对用户来说很陌生 - 用户无法输入他们不知道存在于列表中的内容

## 特性 {#features}

Angular 的自动完成提供了完全无障碍的组合框（combobox）实现，具有以下特性：

- **键盘导航（keyboard navigation）** - 用方向键浏览选项，用 Enter 选择，用 Escape 关闭
- **屏幕阅读器（screen reader）支持** - 为辅助技术内置 ARIA 属性
- **动态高亮行为** - 内置对行内选择建议的支持
- **基于信号的响应式** - 使用 Angular 信号（signal）进行响应式状态管理
- **Popover API 集成** - 利用原生 HTML Popover API 实现最佳定位
- **双向文本支持** - 自动处理从右到左（RTL）书写的语言

## 示例 {#examples}

### 自动选择模式 {#auto-select-mode}

输入部分文本的用户希望立即确认自己的输入与某个可用选项匹配。自动选择模式会在用户输入时把输入框的值更新为第一个过滤后的选项，从而减少所需的按键次数，并即时反馈用户的搜索方向是正确的。

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

### 手动选择模式 {#manual-selection-mode}

手动选择模式会在用户浏览建议列表时保持已输入的文本不变，避免自动更新带来的困惑。只有当用户通过 Enter 或点击明确确认选择时，输入框的值才会改变。

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

### 高亮模式 {#highlight-mode}

高亮模式允许用户用方向键浏览选项，浏览期间不会改变输入框的值，直到用户通过 Enter 或点击明确选择新的选项为止。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/highlight/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/highlight/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/highlight/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.css)

</TabItem>

</Tabs>

### 与信号表单集成 {#signal-forms-integration}

Angular Aria 可以与基于信号的[信号表单（Signal Forms）](/guide/forms/signals/overview) API 无缝集成。你可以把复杂的输入控件封装成实现了 `FormValueControl` 的可复用自定义控件组件（component）。

下面的示例演示了一个实现 `FormValueControl<string>` 的国家选择组件，它通过 `[formField]` 绑定到父表单，并受 schema 验证规则的约束。

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/signal-forms/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/signal-forms/app/app.html) · [country-selector.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/signal-forms/app/country-selector.ts) · [country-selector.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/signal-forms/app/country-selector.html) · [country-selector.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/signal-forms/app/country-selector.css) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/autocomplete/src/signal-forms/app/app.css)

## 测试 {#testing}

自动完成模式可以组合使用 `@angular/aria/combobox/testing` 中的 `ComboboxHarness` 和 `@angular/aria/listbox/testing` 中的 `ListboxHarness` 进行测试。
下面是使用这些测试工具（harness）测试自动完成组件的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComboboxHarness} from '@angular/aria/combobox/testing';
import {ListboxHarness} from '@angular/aria/listbox/testing';
import {MyAutocompleteComponent} from './my-autocomplete'; // 你的组件

describe('MyAutocompleteComponent', () => {
  let fixture: ComponentFixture<MyAutocompleteComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyAutocompleteComponent],
    });

    fixture = TestBed.createComponent(MyAutocompleteComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should filter options based on input', async () => {
    const combobox = await loader.getHarness(ComboboxHarness);

    // 在输入框中输入以触发过滤
    await combobox.setValue('ap');
    expect(await combobox.isOpen()).toBe(true);

    // 从弹出层中获取列表框测试工具
    const listbox = await combobox.getPopupWidget(ListboxHarness);
    const options = await listbox.getOptions();

    // 验证选项已被过滤（例如 'Apple'、'Apricot'）
    expect(options.length).toBe(2);
    expect(await options[0].getText()).toBe('Apple');

    // 选择第一个选项
    await options[0].click();

    // 验证输入框的值已更新且弹出层已关闭
    expect(await combobox.isOpen()).toBe(false);
    expect(await combobox.getValue()).toBe('Apple');
  });
});
```

## API 参考 {#api-reference}

详细的 API 文档请参阅以下 API 参考：

- [`Combobox`](https://angular.dev/api/aria/combobox/Combobox)
- [`ComboboxPopup`](https://angular.dev/api/aria/combobox/ComboboxPopup)
- [`ComboboxWidget`](https://angular.dev/api/aria/combobox/ComboboxWidget)
- [`Listbox`](https://angular.dev/api/aria/listbox/Listbox)
- [`Option`](https://angular.dev/api/aria/listbox/Option)
