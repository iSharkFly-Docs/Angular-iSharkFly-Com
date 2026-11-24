# 树

- [树 ARIA 模式](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
- [Tree API 参考](https://angular.dev/api/aria/tree/Tree)


## 概览

树（tree）用于展示层级数据，其中的条目可以展开以显示子项，也可以折叠以隐藏子项。用户可以用方向键导航、展开和折叠节点，并可根据需要选择条目，以用于导航或数据选择场景。

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.css)

## 用法

当用户需要在嵌套结构中导航时，树非常适合用来展示层级数据。

**以下情况适合使用树：**

- 构建文件系统导航
- 展示文件夹和文档的层级结构
- 创建嵌套的菜单结构
- 展示组织架构图
- 浏览层级数据
- 实现带有嵌套栏目的站点导航

**以下情况应避免使用树：**

- 展示扁平列表（请改用[列表框](/guide/aria/listbox)）
- 展示数据表格（请改用[网格](/guide/aria/grid)）
- 创建简单的下拉菜单（请改用[选择框](/guide/aria/select)）
- 构建面包屑导航（请使用面包屑模式）

## 特性

- **层级导航** - 支持展开和折叠的嵌套树结构
- **选择模式** - 单选或多选，支持显式选择或选择跟随焦点
- **选择跟随焦点** - 可选：焦点（focus）变化时自动选择
- **键盘导航** - 支持方向键、Home、End 和预输入搜索（type-ahead）
- **展开 / 折叠** - 使用右 / 左方向键或 Enter 切换父节点
- **禁用条目** - 禁用特定节点，并配合焦点管理
- **焦点模式** - 漫游 tabindex（roving tabindex）或 activedescendant 两种焦点策略
- **RTL 支持** - 支持从右到左书写语言的导航

## 示例

### 导航树

将树用于导航时，点击条目会触发操作，而不是选中条目。

<Tabs :tabs="[{label:'Basic',value:'t0'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/nav/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/nav/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/nav/basic/app/app.css)

</TabItem>

</Tabs>

设置 `[nav]="true"` 即可启用导航模式。该模式使用 `aria-current` 来标示当前页面，而不是使用选中状态。

### 单选

当用户需要从树中选择一个条目时，可以启用单选。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Retro',value:'t1'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/retro/app/app.css)

</TabItem>

</Tabs>

保持 `[multi]="false"`（默认值）即为单选。用户按 Space 选中当前获得焦点的条目。

### 多选

允许用户从树中选择多个条目。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Retro',value:'t1'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.css)

</TabItem>

</Tabs>

在树上设置 `[multi]="true"`。用户可以用 Space 逐个选择条目，或用 Shift+方向键选择一个范围。

### 选择跟随焦点

当选择跟随焦点时，获得焦点的条目会被自动选中。这可以简化导航场景下的交互。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Retro',value:'t1'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.css)

</TabItem>

</Tabs>

在树上设置 `[selectionMode]="'follow'"`。用户用方向键导航时，选择会自动更新。

### 禁用的树条目

禁用特定的树节点以阻止交互，并可控制被禁用的条目能否获得焦点。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Retro',value:'t1'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.css)

</TabItem>

</Tabs>

当在树上设置 `[softDisabled]="true"` 时，被禁用的条目可以获得焦点，但不能被激活或选中。当设置 `[softDisabled]="false"` 时，键盘导航会跳过被禁用的条目。

## 测试

Angular Aria 提供了组件测试工具（harness），用于测试树组件（component）。
下面是在组件测试中使用这些测试工具的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {TreeHarness} from '@angular/aria/tree/testing';
import {MyTreeComponent} from './my-tree'; // 你的组件

describe('MyTreeComponent', () => {
  let fixture: ComponentFixture<MyTreeComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyTreeComponent],
    });

    fixture = TestBed.createComponent(MyTreeComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should navigate and expand tree items', async () => {
    const tree = await loader.getHarness(TreeHarness);

    // 获取顶层结构的表示
    expect(await tree.getTreeStructure()).toEqual({
      children: [{text: 'public'}, {text: 'src'}, {text: 'package.json'}],
    });

    // 获取所有（当前可见的）条目
    const items = await tree.getItems();
    expect(items.length).toBe(3);

    // 展开第一个条目（'public'）
    expect(await items[0].isExpanded()).toBe(false);
    await items[0].click();
    expect(await items[0].isExpanded()).toBe(true);

    // 验证展开后树结构已更新
    expect(await tree.getTreeStructure()).toEqual({
      children: [
        {
          text: 'public',
          children: [{text: 'index.html'}, {text: 'styles.css'}],
        },
        {text: 'src'},
        {text: 'package.json'},
      ],
    });
  });
});
```

## API 参考

详细的 API 文档请参阅以下 API 参考：

- [`Tree`](https://angular.dev/api/aria/tree/Tree)
- [`TreeItem`](https://angular.dev/api/aria/tree/TreeItem)
- [`TreeItemGroup`](https://angular.dev/api/aria/tree/TreeItemGroup)
