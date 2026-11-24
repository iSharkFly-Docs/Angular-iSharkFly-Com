# 菜单 {#menu}

- [菜单 ARIA 模式](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [Menu API 参考](https://angular.dev/api/aria/menu/Menu)


## 概览 {#overview}

菜单（menu）向用户提供一组操作或选项，通常在用户点击按钮或右键单击时出现。菜单支持使用方向键进行键盘导航（keyboard navigation），并支持子菜单、复选框、单选按钮和禁用的条目。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.css)

</TabItem>

</Tabs>

## 用法 {#usage}

菜单非常适合展示可供用户选择的操作或命令列表。

**以下情况适合使用菜单：**

- 构建应用的命令菜单（File、Edit、View）
- 创建上下文菜单（右键单击操作）
- 显示下拉操作列表
- 实现工具栏中的下拉菜单
- 组织设置或选项

**以下情况应避免使用菜单：**

- 构建站点导航（请改用导航地标（landmark））
- 创建表单中的选择框（请使用[选择框](/guide/aria/select)组件）
- 在内容面板之间切换（请使用[标签页](/guide/aria/tabs)）
- 展示可折叠的内容（请使用[手风琴](/guide/aria/accordion)）

## 特性 {#features}

- **键盘导航** - 支持方向键、Home / End 和字符搜索，导航高效
- **子菜单** - 支持嵌套菜单，并自动定位
- **菜单类型** - 独立菜单、由触发器打开的菜单以及菜单栏
- **复选框和单选按钮** - 可切换和可选择的菜单条目
- **禁用条目** - 软禁用或硬禁用状态，并配合焦点（focus）管理
- **自动关闭行为** - 可配置在选择后关闭
- **RTL 支持** - 支持从右到左书写语言的导航

## 示例 {#examples}

### 带触发器的菜单 {#menu-with-trigger}

把一个触发按钮与菜单配对，即可创建下拉菜单。触发器负责打开和关闭菜单。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.css)

</TabItem>

</Tabs>

当用户选择某个条目或按下 Escape 时，菜单会自动关闭。

### 上下文菜单 {#context-menu}

当用户右键单击某个元素时，上下文菜单会出现在光标位置。

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-context/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-context/app/app.html)

使用 `contextmenu` 事件的坐标来定位菜单。

### 独立菜单 {#standalone-menu}

独立菜单不需要触发器，并会一直显示在界面中。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/retro/app/app.css)

</TabItem>

</Tabs>

独立菜单非常适合始终可见的操作列表或导航。

### 禁用的菜单条目 {#disabled-menu-items}

使用 `disabled` 输入（input）禁用特定的菜单条目。使用 `softDisabled` 控制焦点行为。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/retro/app/app.css)

</TabItem>

</Tabs>

当 `[softDisabled]="true"` 时，被禁用的条目可以获得焦点，但无法被激活。当 `[softDisabled]="false"` 时，键盘导航会跳过被禁用的条目。

## 测试 {#testing}

Angular Aria 提供了组件测试工具（harness），用于测试菜单组件（component）。
下面是在组件测试中使用这些测试工具的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MenuHarness, MenuItemHarness} from '@angular/aria/menu/testing';
import {MyMenuComponent} from './my-menu'; // 你的组件

describe('MyMenuComponent', () => {
  let fixture: ComponentFixture<MyMenuComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyMenuComponent],
    });

    fixture = TestBed.createComponent(MyMenuComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should open menu and click item', async () => {
    // 按触发器文本加载菜单测试工具
    const menu = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));

    // 验证初始状态
    expect(await menu.isOpen()).toBe(false);

    // 打开菜单
    await menu.open();
    expect(await menu.isOpen()).toBe(true);

    // 获取条目
    const items = await menu.getItems();
    expect(items.length).toBe(3);
    expect(await items[0].getText()).toBe('Item 1');

    // 点击第一个条目
    await items[0].click();

    // 选择后菜单应关闭（取决于你的实现）
    expect(await menu.isOpen()).toBe(false);
  });

  it('should interact with submenus', async () => {
    const menu = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));
    await menu.open();

    // 获取会触发子菜单的条目
    const subItem = await loader.getHarness(MenuItemHarness.with({text: 'Submenu'}));
    expect(await subItem.hasSubmenu()).toBe(true);

    // 打开子菜单
    await subItem.click();
    const submenu = await subItem.getSubmenu();
    expect(submenu).toBeTruthy();
    expect(await submenu!.isOpen()).toBe(true);

    // 与子菜单条目交互
    const subItems = await submenu!.getItems();
    expect(subItems.length).toBe(1);
  });
});
```

## API 参考 {#api-reference}

详细的 API 文档请参阅以下 API 参考：

- [`Menu`](https://angular.dev/api/aria/menu/Menu)
- [`MenuBar`](https://angular.dev/api/aria/menu/MenuBar)
- [`MenuItem`](https://angular.dev/api/aria/menu/MenuItem)
- [`MenuTrigger`](https://angular.dev/api/aria/menu/MenuTrigger)
- [`MenuContent`](https://angular.dev/api/aria/menu/MenuContent)
