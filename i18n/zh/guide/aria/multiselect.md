# 多选

## 概览

多选（multiselect）模式把只读的组合框（combobox）触发器与支持多选的列表框（listbox）弹出层结合起来，用于创建高度无障碍、支持键盘导航（keyboard navigation）和屏幕阅读器（screen reader）的多选下拉框。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.css)

</TabItem>

</Tabs>

## 用法

当用户需要从一组熟悉的选项中选择多个相关条目时，多选模式最为合适。

以下情况可以考虑使用这种模式：

- **用户需要选择多项** - 适用于可同时选择多个值的标签、类别、筛选条件或标记
- **选项列表固定**（少于 20 项）- 用户无需搜索即可浏览选项
- **筛选内容** - 多个筛选条件可以同时生效
- **分配属性** - 适合多个值的标记、权限或功能
- **相关的选择** - 在逻辑上配合使用的选项（例如选择多名团队成员）

以下情况应避免使用这种模式：

- **只需要单选** - 请使用[选择框模式](/guide/aria/select)，实现更简单的单选下拉框
- **列表超过 20 项且需要搜索** - 请使用具备多选能力的[自动完成模式](/guide/aria/autocomplete)
- **大部分或全部选项都会被选中** - 复选清单模式能提供更好的可见性
- **各个选项是彼此独立的二元选项** - 使用单独的复选框能更清楚地传达这些选择

## 特性

多选模式结合了[组合框](/guide/aria/combobox)和[列表框](/guide/aria/listbox)指令（directive），提供完全无障碍的下拉框，具备：

- **键盘导航** - 使用方向键浏览选项，按 Space 切换选中状态，按 Escape 关闭
- **屏幕阅读器支持** - 内置包括 aria-multiselectable 在内的 ARIA attribute
- **选中数量显示** - 选择多项时，以紧凑的“Item + 2 more”形式显示
- **基于信号的响应式** - 使用 Angular 信号（signal）进行响应式状态管理
- **智能定位** - 由 CDK Overlay 处理视口边缘和滚动
- **持久选中** - 选中后，已选选项会保持可见并带有勾选标记

## 示例

### 基本多选

用户需要从选项列表中选择多个条目。只读组合框与启用了多选的列表框搭配使用，可以提供用户熟悉的多选功能，并具备完整的无障碍支持。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

`ngListbox` 上的 `multi` attribute 用于启用多选。按 Space 可以切换选项的选中状态，弹出层会保持打开，以便继续选择。显示区域会显示第一个选中的条目，以及其余选中条目的数量。

### 自定义显示的多选

选项常常需要图标或颜色之类的视觉标识，帮助用户识别各个选项。在选项中使用自定义模板（template）可以实现丰富的格式，而显示值则以紧凑的摘要形式呈现。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.css)

</TabItem>

</Tabs>

每个选项都会在标签旁显示一个图标。显示值会随之更新，显示第一个选中项的图标和文本，后面跟着其余选中项的数量。已选中的选项会显示勾选标记，提供清晰的视觉反馈。

### 受控选择

表单有时需要限制可选数量，或验证用户的选择。通过编程方式控制选择，可以在保持无障碍的同时实现这些约束。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/limited/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/limited/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/limited/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/limited/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/limited/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/limited/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.css)

</TabItem>

</Tabs>

本示例把可选数量限制为两项。达到上限后，未选中的选项会被禁用以阻止继续选择，组合框的显示内容也会随之更新以反映当前的选择。

## 测试

可以组合使用 `@angular/aria/combobox/testing` 中的 `ComboboxHarness` 和 `@angular/aria/listbox/testing` 中的 `ListboxHarness` 来测试多选模式。
下面是使用这些测试工具（harness）测试多选组件（component）的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComboboxHarness} from '@angular/aria/combobox/testing';
import {ListboxHarness} from '@angular/aria/listbox/testing';
import {MyMultiselectComponent} from './my-multiselect'; // 你的组件

describe('MyMultiselectComponent', () => {
  let fixture: ComponentFixture<MyMultiselectComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyMultiselectComponent],
    });

    fixture = TestBed.createComponent(MyMultiselectComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow selecting multiple options', async () => {
    const select = await loader.getHarness(ComboboxHarness);

    // 打开下拉框
    await select.open();

    // 从弹出层中获取列表框测试工具
    const listbox = await select.getPopupWidget(ListboxHarness);
    expect(await listbox.isMulti()).toBe(true);

    const options = await listbox.getOptions();

    // 选中第一个和第二个选项
    await options[0].click();
    await options[1].click();

    // 验证两个选项都已选中
    expect(await options[0].isSelected()).toBe(true);
    expect(await options[1].isSelected()).toBe(true);

    // 关闭下拉框
    await select.close();

    // 验证值已更新（例如逗号分隔的列表或数量）
    expect(await (await select.host()).text()).toContain('Option 1, Option 2');
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
