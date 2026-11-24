# 工具栏

- [工具栏 ARIA 模式](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)
- [Toolbar API 参考](https://angular.dev/api/aria/toolbar/Toolbar)


## 概览

工具栏（toolbar）是一个容器，用于对相关的控件和操作进行分组，并支持键盘导航（keyboard navigation），常用于文本格式设置、工具条和命令面板。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

## 用法

工具栏最适合用来对用户经常使用的相关控件进行分组。以下情况可以考虑使用工具栏：

- **多个相关操作** - 有多个执行相关功能的控件（例如文本格式按钮）
- **注重键盘操作效率** - 用户可以通过方向键快速进行键盘导航
- **分组的控件** - 需要用分隔符把控件组织成若干逻辑分区
- **频繁使用** - 控件会在某个工作流中被反复使用

以下情况应避免使用工具栏：

- 简单的按钮组就足够 - 如果只有 2-3 个不相关的操作，单独的按钮效果更好
- 控件之间不相关 - 工具栏意味着逻辑上的分组，不相关的控件会让用户困惑
- 复杂的嵌套导航 - 层级较深的结构更适合使用菜单或导航组件（component）

## 特性

Angular 的工具栏提供了完全无障碍的工具栏实现，具有以下特性：

- **键盘导航** - 借助 roving tabindex，用方向键、Home 和 End 在各个部件之间导航，同时控件保留原生的激活方式
- **屏幕阅读器（screen reader）支持** - 为辅助技术内置 ARIA 属性
- **部件组** - 组织相关的部件，例如单选按钮组或切换按钮组
- **灵活的方向** - 支持水平或垂直布局，并自动适配键盘导航
- **基于信号的响应式** - 使用 Angular 信号（signal）进行响应式状态管理
- **双向文本支持** - 自动处理从右到左（RTL）书写的语言
- **可配置的焦点（focus）行为** - 可选择在边缘处循环导航或直接停止

## 示例

### 基本水平工具栏

水平工具栏把控件从左到右排列，与文本编辑器和设计工具中的常见模式一致。方向键用于在部件之间导航，焦点会一直保持在工具栏内，直到用户按 Tab 移到页面的下一个元素。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

### 垂直工具栏

垂直工具栏把控件从上到下堆叠，适用于侧边面板或纵向的命令面板。用上下方向键在部件之间导航。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.css)

</TabItem>

</Tabs>

### 部件组

部件组用于组织协同工作的相关控件，例如文本对齐选项或格式切换按钮。部件组既保持 roving tabindex 导航，又能向辅助技术呈现恰当的语义结构。

在上面的示例中，对齐按钮被包裹在带有 `role="radiogroup"` 的 `ngToolbarWidgetGroup` 中。选择状态与工具栏容器解耦，因此你可以用 Angular 信号或自定义指令（directive）来管理状态：

```html
<!-- 互斥的单选按钮组 -->
<div ngToolbarWidgetGroup role="radiogroup" aria-label="Alignment">
  <button
    ngToolbarWidget
    role="radio"
    type="button"
    [attr.aria-checked]="alignment() === 'left'"
    (click)="alignment.set('left')"
  >
    Left
  </button>
  <button
    ngToolbarWidget
    role="radio"
    type="button"
    [attr.aria-checked]="alignment() === 'center'"
    (click)="alignment.set('center')"
  >
    Center
  </button>
  <button
    ngToolbarWidget
    role="radio"
    type="button"
    [attr.aria-checked]="alignment() === 'right'"
    (click)="alignment.set('right')"
  >
    Right
  </button>
</div>

<!-- 切换按钮组 -->
<div class="group" role="group" aria-label="Text styling">
  <button ngToolbarWidget type="button" [attr.aria-pressed]="bold()" (click)="bold.set(!bold())">
    Bold
  </button>
  <button
    ngToolbarWidget
    type="button"
    [attr.aria-pressed]="italic()"
    (click)="italic.set(!italic())"
  >
    Italic
  </button>
</div>
```

### 禁用的部件

工具栏支持两种禁用模式：

1. **软禁用**（soft-disabled）的部件仍可获得焦点，但会在视觉上表明自己不可用
2. **硬禁用**（hard-disabled）的部件会完全从键盘导航中移除。

默认情况下，`softDisabled` 为 `true`，即禁用的部件仍然可以获得焦点。如果想启用硬禁用模式，请在工具栏上设置 `[softDisabled]="false"`。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.css)

</TabItem>

</Tabs>

### 从右到左（RTL）支持

工具栏自动支持从右到左书写的语言。把工具栏包裹在带有 `dir="rtl"` 的容器中，即可反转布局和键盘导航方向。方向键导航会自动调整：左方向键移到下一个部件，右方向键移到上一个部件。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.css)

</TabItem>

</Tabs>

## 测试

Angular Aria 提供了组件测试工具（harness），用于测试工具栏组件（component）。
下面是在组件测试中使用这些测试工具的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ToolbarHarness} from '@angular/aria/toolbar/testing';
import {MyToolbarComponent} from './my-toolbar'; // 你的组件

describe('MyToolbarComponent', () => {
  let fixture: ComponentFixture<MyToolbarComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyToolbarComponent],
    });

    fixture = TestBed.createComponent(MyToolbarComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should have widgets and update toggle state on click', async () => {
    // 加载工具栏测试工具
    const toolbar = await loader.getHarness(ToolbarHarness);

    // 获取所有部件
    const widgets = await toolbar.getWidgets();
    expect(widgets.length).toBe(3);

    // 点击第一个部件
    await widgets[0].click();

    // 验证按下状态已通过点击处理器更新
    expect(await widgets[0].isSelected()).toBe(true);
  });
});
```

## API 参考

详细的 API 文档请参阅以下 API 参考：

- [`Toolbar`](https://angular.dev/api/aria/toolbar/Toolbar)
- [`ToolbarWidget`](https://angular.dev/api/aria/toolbar/ToolbarWidget)
- [`ToolbarWidgetGroup`](https://angular.dev/api/aria/toolbar/ToolbarWidgetGroup)
