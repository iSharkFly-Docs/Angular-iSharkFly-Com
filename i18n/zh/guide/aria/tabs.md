# 标签页

- [标签页 ARIA 模式](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [Tabs API 参考](https://angular.dev/api/aria/tabs/Tabs)


## 概览

标签页（tabs）用于展示分层的内容区域，每次只显示一个面板。用户通过点击标签按钮，或用方向键在标签列表中导航来切换面板。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.css)

</TabItem>

</Tabs>

## 用法

标签页适合把相关内容组织成若干独立的区域，让用户在不同的视图或类别之间切换。

**以下情况适合使用标签页：**

- 把相关内容组织成若干独立的区域
- 创建包含多个类别的设置面板
- 构建包含多个主题的文档
- 实现具有不同视图的仪表盘
- 展示需要用户切换上下文的内容

**以下情况应避免使用标签页：**

- 构建按顺序填写的表单或向导（请使用步进器模式）
- 在页面之间导航（请使用路由器导航）
- 只展示单个内容区域（不需要标签页）
- 标签超过 7-8 个（请考虑换一种布局）

## 特性

- **选择模式** - 标签可以在获得焦点（focus）时自动激活，也可以要求手动激活
- **键盘导航（keyboard navigation）** - 使用方向键、Home 和 End 高效地在标签之间导航
- **方向** - 标签列表可以水平或垂直布局
- **延迟渲染内容** - 标签面板只在激活时才渲染
- **禁用标签** - 禁用单个标签，并配合焦点管理
- **焦点模式** - 支持 roving tabindex 或 activedescendant 两种焦点策略
- **RTL 支持** - 支持从右到左书写语言的导航

## 示例

### 选择跟随焦点

当选择跟随焦点时，用方向键导航到某个标签就会立即激活它。这种方式能提供即时反馈，适合轻量的内容。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.css)

</TabItem>

</Tabs>

在标签列表上设置 `[selectionMode]="'follow'"` 即可启用此行为。

### 手动激活

在手动激活模式下，方向键只在标签之间移动焦点，不会改变选中的标签。用户需要按 Space 或 Enter 来激活获得焦点的标签。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/retro/app/app.css)

</TabItem>

</Tabs>

对于内容较重的面板，请使用 `[selectionMode]="'explicit'"`，以避免不必要的渲染。

### 垂直标签页

对于设置面板或导航侧边栏这类界面，可以把标签垂直排列。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/retro/app/app.css)

</TabItem>

</Tabs>

在标签列表上设置 `[orientation]="'vertical'"`，导航方式就会变为上下方向键。

### 延迟渲染内容

在 `ng-template` 上使用 `ngTabContent` 指令（directive），可以把标签面板的渲染推迟到它们显示时。

```html
<div ngTabs>
  <ul ngTabList [(selectedTab)]="selectedTab">
    <li ngTab value="tab1">Tab 1</li>
    <li ngTab value="tab2">Tab 2</li>
  </ul>

  <div ngTabPanel value="tab1">
    <ng-template ngTabContent>
      <!-- 此内容只在显示 Tab 1 时渲染 -->
      <app-heavy-component />
    </ng-template>
  </div>

  <div ngTabPanel value="tab2">
    <ng-template ngTabContent>
      <!-- 此内容只在显示 Tab 2 时渲染 -->
      <app-another-component />
    </ng-template>
  </div>
</div>
```

默认情况下，面板隐藏时其内容会从 DOM 中移除。设置 `[preserveContent]="true"` 可以保留这些内容，例如当面板中包含一个不应在切换标签时被重置的视频时。

### 禁用的标签

可以禁用特定的标签以阻止用户交互，并控制禁用的标签能否获得键盘焦点。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/retro/app/app.css)

</TabItem>

</Tabs>

在标签列表上设置 `[softDisabled]="true"` 时，禁用的标签可以获得焦点，但无法被激活。设置 `[softDisabled]="false"` 时，键盘导航会跳过禁用的标签。

## 测试

Angular Aria 提供了组件测试工具（harness），用于测试标签页组件（component）。
下面是在组件测试中使用这些测试工具的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentHarness, HarnessLoader} from '@angular/cdk/testing';
import {TabsHarness} from '@angular/aria/tabs/testing';
import {MyTabsComponent} from './my-tabs'; // 你的组件

// 一个简单的测试工具，用于帮助查询标签面板中的内容
class TestContentHarness extends ComponentHarness {
  static hostSelector = '.test-content';
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}

describe('MyTabsComponent', () => {
  let fixture: ComponentFixture<MyTabsComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyTabsComponent],
    });

    fixture = TestBed.createComponent(MyTabsComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should switch tabs and scope panel queries', async () => {
    const tabs = await loader.getHarness(TabsHarness);

    // 获取所有标签
    const tabItems = await tabs.getTabs();
    expect(tabItems.length).toBe(3);

    // 验证初始选择
    expect(await tabItems[0].isSelected()).toBe(true);
    expect(await tabItems[1].isSelected()).toBe(false);

    // 查询当前激活的标签面板中的内容
    // TabHarness 会自动把查询范围限定在与之关联的面板内
    const content = await tabItems[0].getHarness(TestContentHarness);
    expect(await content.getText()).toBe('Content 1');

    // 切换到第二个标签
    await tabItems[1].select();

    // 验证选择已更新
    expect(await tabItems[0].isSelected()).toBe(false);
    expect(await tabItems[1].isSelected()).toBe(true);
  });
});
```

## API 参考

详细的 API 文档请参阅以下 API 参考：

- [`Tabs`](https://angular.dev/api/aria/tabs/Tabs)
- [`TabList`](https://angular.dev/api/aria/tabs/TabList)
- [`Tab`](https://angular.dev/api/aria/tabs/Tab)
- [`TabPanel`](https://angular.dev/api/aria/tabs/TabPanel)
- [`TabContent`](https://angular.dev/api/aria/tabs/TabContent)
