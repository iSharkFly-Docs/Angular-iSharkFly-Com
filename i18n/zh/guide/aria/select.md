# 选择框

## 概览

选择框（select）是一种把组合框（combobox）与列表框（listbox）结合起来的模式，用于创建支持键盘导航（keyboard navigation）和屏幕阅读器（screen reader）的单选下拉框。

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

## 用法

当用户需要从一组熟悉的选项中选择单个值时，选择框模式最为合适。

以下情况可以考虑使用这种模式：

- **选项列表固定**（少于 20 项）- 用户无需筛选即可浏览并选择
- **选项为用户所熟悉** - 用户无需搜索就能认出各个选项
- **表单需要标准字段** - 国家、州 / 省、类别或状态的选择
- **设置和配置** - 用于偏好设置或选项的下拉菜单
- **选项标签清晰** - 每个选项都有清晰、易于浏览的名称

以下情况应避免使用这种模式：

- **列表超过 20 项** - 请使用[自动完成模式](/guide/aria/autocomplete)，以获得更好的筛选能力
- **用户需要搜索选项** - [自动完成](/guide/aria/autocomplete)提供文本输入和筛选功能
- **需要多选** - 请改用[多选模式](/guide/aria/multiselect)
- **选项非常少（2 - 3 个）** - 单选按钮能更好地同时展示所有选项

## 特性

选择框模式结合了[组合框](/guide/aria/combobox)和[列表框](/guide/aria/listbox)指令（directive），提供完全无障碍的下拉框，具备：

- **键盘导航** - 使用方向键浏览选项，按 Enter 选择，按 Escape 关闭
- **屏幕阅读器支持** - 内置 ARIA attribute，适配辅助技术
- **自定义显示** - 用图标、格式或富内容展示选中的值
- **基于信号的响应式** - 使用 Angular 信号（signal）进行响应式状态管理
- **智能定位** - 由 CDK Overlay 处理视口边缘和滚动
- **双向文本支持** - 自动处理从右到左（RTL）书写的语言

## 示例

### 基本选择框

用户需要一个标准的下拉框来从值列表中进行选择。组合框与列表框搭配使用，可以提供用户熟悉的选择框体验，并具备完整的无障碍支持。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

把 `ngCombobox` 指令直接应用到不可交互的宿主元素（host element）（例如 `div` 或 `button`）上，而不是 `<input>` 上，就可以阻止文本输入。用户像使用原生 select 元素一样，通过方向键和 Enter 与下拉框交互。

### 自定义显示的选择框

选项常常需要图标或徽章之类的视觉标识，帮助用户快速识别各个选项。在选项中使用自定义模板（template），可以在保持无障碍的同时实现丰富的格式。

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

每个选项都会在标签旁显示一个图标。选中的值会随之更新，显示所选选项的图标和文本，提供清晰的视觉反馈。

### 禁用的选择框

当某些表单条件不满足时，可以禁用选择框以阻止用户交互。禁用状态会提供视觉反馈，并阻止键盘交互。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/retro/app/app.css)

</TabItem>

</Tabs>

禁用后，选择框会显示禁用的视觉状态，并阻止所有用户交互。屏幕阅读器会向使用辅助技术的用户播报禁用状态。

## 测试

可以组合使用 `@angular/aria/combobox/testing` 中的 `ComboboxHarness` 和 `@angular/aria/listbox/testing` 中的 `ListboxHarness` 来测试选择框模式。
下面是使用这些测试工具（harness）测试选择框组件（component）的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComboboxHarness} from '@angular/aria/combobox/testing';
import {ListboxHarness} from '@angular/aria/listbox/testing';
import {MySelectComponent} from './my-select'; // 你的组件

describe('MySelectComponent', () => {
  let fixture: ComponentFixture<MySelectComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MySelectComponent],
    });

    fixture = TestBed.createComponent(MySelectComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow selecting an option', async () => {
    // 加载组合框测试工具（它充当选择框的触发器）
    const select = await loader.getHarness(ComboboxHarness);

    // 验证初始时处于关闭状态
    expect(await select.isOpen()).toBe(false);

    // 打开下拉框
    await select.open();
    expect(await select.isOpen()).toBe(true);

    // 从弹出层中获取列表框测试工具
    const listbox = await select.getPopupWidget(ListboxHarness);
    const options = await listbox.getOptions();
    expect(options.length).toBe(3);

    // 点击第二个选项
    await options[1].click();

    // 验证下拉框已关闭且值已更新
    expect(await select.isOpen()).toBe(false);
    expect(await (await select.host()).text()).toContain('Option 2');
  });
});
```

## API 参考

详细的 API 文档请参阅以下 API 参考：

- [`Combobox`](https://angular.dev/api/aria/combobox/Combobox)
- [`ComboboxPopup`](https://angular.dev/api/aria/combobox/ComboboxPopup)
- [`ComboboxWidget`](https://angular.dev/api/aria/combobox/ComboboxWidget)
- [`Listbox`](https://angular.dev/api/aria/listbox/Listbox)
- [`Option`](https://angular.dev/api/aria/listbox/Option)

### 定位

选择框模式集成了 [CDK Overlay](https://material.angular.dev/cdk/overlay/overview)，以实现智能定位。使用 `cdkConnectedOverlay` 可以自动处理视口边缘和滚动。
