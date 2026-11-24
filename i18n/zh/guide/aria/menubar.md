# 菜单栏

- [菜单栏 ARIA 模式](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [Menubar API 参考](https://angular.dev/api/aria/menu/MenuBar)


## 概览

菜单栏（menubar）是一个水平导航栏，可让用户随时访问应用的各个菜单。菜单栏把命令组织成 File、Edit、View 等逻辑类别，帮助用户通过键盘或鼠标交互来发现并执行应用的功能。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

## 用法

菜单栏非常适合把应用命令组织成始终可见、易于发现的导航。

**以下情况适合使用菜单栏：**

- 构建应用的命令栏（例如 File、Edit、View、Insert、Format）
- 创建在整个界面中始终可见的持久导航
- 把命令组织成逻辑清晰的顶层类别
- 需要支持键盘操作的水平菜单导航
- 构建桌面风格的应用界面

**以下情况应避免使用菜单栏：**

- 为单个操作构建下拉菜单（请改用[带触发器的菜单](/guide/aria/menu)）
- 创建上下文菜单（请参阅[菜单](/guide/aria/menu)指南中的模式）
- 简单的独立操作列表（请改用[菜单](/guide/aria/menu)）
- 水平空间有限的移动端界面
- 导航更适合放在侧边栏或页头导航模式中

## 特性

- **水平导航** - 使用左 / 右方向键在顶层类别之间移动
- **始终可见** - 一直显示，不是模态的，也无法关闭
- **悬停打开** - 在第一次键盘或点击交互之后，鼠标悬停即可打开子菜单
- **嵌套子菜单** - 支持多层级的菜单
- **键盘导航** - 支持方向键、Enter / Space、Escape 和预输入搜索（typeahead）
- **禁用状态** - 禁用整个菜单栏或单个条目
- **RTL 支持** - 自动支持从右到左书写语言的导航

## 示例

### 基本菜单栏

菜单栏让用户可以随时访问按顶层类别组织的应用命令。用户使用左 / 右方向键在类别之间导航，并使用 Enter 或下方向键打开菜单。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

按右方向键可在 File、Edit 和 View 之间移动。按 Enter 或下方向键可打开菜单，并使用上 / 下方向键在子菜单条目之间导航。

### 禁用的菜单栏条目

禁用特定的菜单条目或整个菜单栏，以阻止交互。通过 `softDisabled` 输入（input）控制被禁用的条目能否获得键盘焦点（focus）。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.css)

</TabItem>

</Tabs>

在菜单栏上设置 `[softDisabled]="true"` 时，被禁用的条目可以获得焦点，但无法被激活。设置 `[softDisabled]="false"` 时，键盘导航会跳过被禁用的条目。

### RTL 支持

菜单栏会自动适配从右到左（RTL）书写的语言。方向键的导航方向会反转，子菜单会显示在左侧。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.css)

</TabItem>

</Tabs>

`dir="rtl"` attribute 用于启用 RTL 模式。此时左方向键向右移动，右方向键向左移动，从而为使用 RTL 语言的用户保持自然的导航体验。

## 测试

Angular Aria 提供了组件测试工具（harness），用于测试菜单栏组件（component）。
下面是在组件测试中使用这些测试工具的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MenuHarness} from '@angular/aria/menu/testing';
import {MyMenubarComponent} from './my-menubar'; // 你的组件

describe('MyMenubarComponent', () => {
  let fixture: ComponentFixture<MyMenubarComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyMenubarComponent],
    });

    fixture = TestBed.createComponent(MyMenubarComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should interact with menubar items', async () => {
    // 加载菜单栏测试工具（即选择器为 '[ngMenuBar]' 的 MenuHarness）
    const menubar = await loader.getHarness(MenuHarness.with({selector: '[ngMenuBar]'}));

    // 菜单栏是持久显示的，始终处于“打开”状态
    expect(await menubar.isOpen()).toBe(true);
    expect(await menubar.isMenuBar()).toBe(true);

    // 获取顶层条目
    const items = await menubar.getItems();
    expect(items.length).toBe(2);
    expect(await items[0].getText()).toBe('File');
    expect(await items[1].getText()).toBe('Edit');

    // 点击某个条目以打开其下拉菜单
    await items[0].click();

    const fileMenu = await items[0].getSubmenu();
    expect(fileMenu).toBeTruthy();
    expect(await fileMenu!.isOpen()).toBe(true);
  });
});
```

## API 参考

详细的 API 文档请参阅以下 API 参考：

- [`MenuBar`](https://angular.dev/api/aria/menu/MenuBar)
- [`MenuItem`](https://angular.dev/api/aria/menu/MenuItem)
- [`MenuTrigger`](https://angular.dev/api/aria/menu/MenuTrigger)
- [`Menu`](https://angular.dev/api/aria/menu/Menu)
