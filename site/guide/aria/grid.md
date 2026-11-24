# 网格 {#grid}

- [网格 ARIA 模式](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [Grid API 参考](/api?query=grid#angular_aria_grid)


## 概览 {#overview}

网格（grid）让用户可以使用方向键、Home、End 以及 Page Up/Down 在二维数据或交互元素之间导航。网格适用于数据表格、日历、电子表格，以及将相关交互元素组合在一起的布局模式。

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/overview/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/overview/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/overview/basic/app/app.css)

## 用法 {#usage}

当数据或交互元素按行和列组织，并且用户需要在多个方向上进行键盘导航（keyboard navigation）时，网格是很好的选择。

**以下情况适合使用网格：**

- 构建单元格可编辑或可选择的交互式数据表格
- 创建日历或日期选择器
- 实现类似电子表格的界面
- 将交互元素（按钮、复选框）组合在一起，以减少页面上的 Tab 停靠点
- 构建需要二维键盘导航的界面

**以下情况应避免使用网格：**

- 展示简单的只读表格（请改用语义化的 HTML `<table>`）
- 展示单列列表（请改用[列表框](/guide/aria/listbox)）
- 展示层级数据（请改用[树](/guide/aria/tree)）
- 构建非表格布局的表单（请使用标准的表单控件）

## 特性 {#features}

- **二维导航** - 方向键可以在单元格之间向各个方向移动
- **焦点模式** - 可在漫游 tabindex（roving tabindex）和 activedescendant 两种焦点（focus）策略之间选择
- **选择支持** - 可选的单元格选择，支持单选或多选模式
- **换行行为** - 配置导航到达网格边缘时如何换行（continuous、loop 或 nowrap）
- **范围选择** - 通过修饰键或拖动来选择多个单元格
- **禁用状态** - 禁用整个网格或单个单元格
- **RTL 支持** - 自动支持从右到左书写语言的导航

## 示例 {#examples}

### 数据表格网格 {#data-table-grid}

当用户需要使用方向键在单元格之间导航时，可以将网格用于交互式表格。这个示例展示了一个支持键盘导航的基本数据表格。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Retro',value:'t1'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/retro/app/app.css)

</TabItem>

</Tabs>

将 `ngGrid` 指令（directive）应用到 table 元素上，将 `ngGridRow` 应用到每一行，将 `ngGridCell` 应用到每个单元格。

### 日历网格 {#calendar-grid}

日历是网格的常见用例。这个示例展示了一个月视图，用户可以使用方向键在日期之间导航。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/material/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/material/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/retro/app/app.css)

</TabItem>

</Tabs>

当焦点位于某个单元格上时，用户可以按 Enter 或 Space 激活该日期。

### 布局网格 {#layout-grid}

使用布局网格将交互元素组合在一起，减少 Tab 停靠点。这个示例展示了一个由药丸形按钮组成的网格。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/material/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/material/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.css)

</TabItem>

</Tabs>

用户无需用 Tab 逐个切换按钮，而是使用方向键导航，并且只有一个按钮会接收 Tab 焦点。

### 选择与焦点模式 {#selection-and-focus-modes}

通过 `[enableSelection]="true"` 启用选择，并配置焦点与选择之间的交互方式。

```html
<table
  ngGrid
  [enableSelection]="true"
  [selectionMode]="'explicit'"
  [multi]="true"
  [focusMode]="'roving'"
>
  <tr ngGridRow>
    <td ngGridCell>Cell 1</td>
    <td ngGridCell>Cell 2</td>
  </tr>
</table>
```

**选择模式：**

- `follow`：获得焦点的单元格会被自动选中
- `explicit`：用户通过 Space 或点击来选择单元格

**焦点模式：**

- `roving`：通过 `tabindex` 将焦点移动到单元格上（更适合简单的网格）
- `activedescendant`：焦点保持在网格容器上，由 `aria-activedescendant` 指示当前活动的单元格（更适合虚拟滚动）

## 测试 {#testing}

Angular Aria 提供了组件测试工具（harness），用于测试网格组件（component）。
下面是在组件测试中使用这些测试工具的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {GridHarness} from '@angular/aria/grid/testing';
import {MyGridComponent} from './my-grid'; // 你的组件

describe('MyGridComponent', () => {
  let fixture: ComponentFixture<MyGridComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyGridComponent],
    });

    fixture = TestBed.createComponent(MyGridComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should read cell values and focus cells', async () => {
    const grid = await loader.getHarness(GridHarness);

    // 获取所有单元格的文本，组织为按行排列的二维数组
    const cellTexts = await grid.getCellTextByIndex();
    expect(cellTexts).toEqual([
      ['Cell 1.1', 'Cell 1.2'],
      ['Cell 2.1', 'Cell 2.2'],
    ]);

    // 按文本获取特定单元格
    const cells = await grid.getCells({text: 'Cell 1.1'});
    expect(cells.length).toBe(1);
    const cell = cells[0];

    // 验证单元格状态
    expect(await cell.isSelected()).toBe(true);
    expect(await cell.isActive()).toBe(true);

    // 让单元格获得焦点
    await cell.focus();
    expect(await cell.isFocused()).toBe(true);
  });
});
```

## API 参考 {#api-reference}

详细的 API 文档请参阅以下 API 参考：

- [`Grid`](https://angular.dev/api/aria/grid/Grid)
- [`GridRow`](https://angular.dev/api/aria/grid/GridRow)
- [`GridCell`](https://angular.dev/api/aria/grid/GridCell)
- [`GridCellWidget`](https://angular.dev/api/aria/grid/GridCellWidget)
