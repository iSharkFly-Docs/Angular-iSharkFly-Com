# 手风琴

- [手风琴 ARIA 模式](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
- [Accordion API 参考](/api?query=accordion#angular_aria_accordion)


## 概览

手风琴（accordion）把相关内容组织成可展开、可折叠的区块，从而减少页面滚动，帮助用户专注于相关信息。每个区块都有一个触发按钮和一个内容面板。点击触发按钮会切换其关联面板的可见性。

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.css)

## 用法

当用户通常一次只需查看一个区块时，手风琴非常适合把内容组织成逻辑分组。

**以下情况适合使用手风琴：**

- 展示包含多个问题和答案的常见问题（FAQ）
- 把较长的表单拆分为便于处理的多个区块
- 减少内容繁多的页面上的滚动
- 渐进式地展示相关信息

**以下情况应避免使用手风琴：**

- 构建导航菜单（请改用[菜单](/guide/aria/menu)组件）
- 创建标签页式界面（请改用[标签页](/guide/aria/tabs)组件）
- 只展示单个可折叠区块（请改用展开 / 收起（disclosure）模式）
- 用户需要同时查看多个区块（考虑采用其他布局）

## 特性

- **展开模式** - 控制同一时间只能打开一个面板还是可以打开多个面板
- **键盘导航** - 使用方向键、Home 和 End 在触发按钮之间导航
- **延迟渲染** - 仅在面板展开时才创建内容，提升初始加载性能
- **禁用状态** - 禁用整个分组或单个触发按钮
- **焦点管理** - 控制被禁用的条目能否获得键盘焦点（focus）
- **编程式控制** - 在组件（component）代码中展开、折叠或切换面板
- **RTL 支持** - 自动支持从右到左书写的语言

## 示例

### 单一展开模式

设置 `[multiExpandable]="false"` 即可让同一时间只能打开一个面板。打开新面板时，会自动关闭之前打开的面板。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.css)

</TabItem>

</Tabs>

这种模式适用于常见问题，或者希望用户一次只关注一个答案的场景。

### 多重展开模式

设置 `[multiExpandable]="true"` 即可允许同时打开多个面板。用户可以根据需要展开任意数量的面板，而无需关闭其他面板。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.css)

</TabItem>

</Tabs>

这种模式适用于表单区块，或者用户需要在多个面板之间对比内容的场景。

::: info 注意
`multiExpandable` 输入（input）默认为 `true`。如果你想要单一展开的行为，请显式地将其设为 `false`。

:::

### 禁用的手风琴条目

使用 `disabled` 输入禁用特定的触发按钮。通过手风琴分组上的 `softDisabled` 输入，可以控制被禁用的条目在键盘导航时的行为。

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.css)

</TabItem>

<TabItem value="t1">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.css)

</TabItem>

<TabItem value="t2">

示例源码：[TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.css)

</TabItem>

</Tabs>

当 `[softDisabled]="true"`（默认值）时，被禁用的条目可以获得焦点，但无法被激活。当 `[softDisabled]="false"` 时，键盘导航会完全跳过被禁用的条目。

### 延迟渲染内容

在 `ng-template` 上使用 `ngAccordionContent` 指令（directive），可以把内容的渲染推迟到面板展开时。对于包含图片、图表或复杂组件等重量级内容的手风琴，这样做可以提升性能。

```html
<div ngAccordionGroup>
  <div>
    <button ngAccordionTrigger [panel]="panel1">Trigger Text</button>
    <div ngAccordionPanel #panel1="ngAccordionPanel">
      <ng-template ngAccordionContent>
        <!-- 这些内容只会在面板打开时渲染 -->
        <img src="large-image.jpg" alt="Description" />
        <app-expensive-component />
      </ng-template>
    </div>
  </div>
</div>
```

默认情况下，面板折叠时内容会从 DOM 中移除。设置 `[preserveContent]="true"` 可以保留内容，例如当面板中包含一个不应在折叠时被重置的视频时。

## 测试

Angular Aria 提供了组件测试工具（harness），用于测试手风琴组件。
下面是在组件测试中使用这些测试工具的示例：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {AccordionGroupHarness} from '@angular/aria/accordion/testing';
import {MyAccordionComponent} from './my-accordion'; // 你的组件

describe('MyAccordionComponent', () => {
  let fixture: ComponentFixture<MyAccordionComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyAccordionComponent],
    });

    fixture = TestBed.createComponent(MyAccordionComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow expanding panels', async () => {
    // 加载手风琴分组的测试工具
    const group = await loader.getHarness(AccordionGroupHarness);

    // 获取分组中所有单独的手风琴（条目）
    const accordions = await group.getAccordions();
    expect(accordions.length).toBe(3);

    // 验证初始状态（第一个展开，其余折叠）
    expect(await accordions[0].isExpanded()).toBe(true);
    expect(await accordions[1].isExpanded()).toBe(false);

    // 展开第二个面板
    await accordions[1].expand();

    // 验证更新后的状态
    expect(await accordions[1].isExpanded()).toBe(true);
    // 如果 multiExpandable 为 false，第一个面板此时应已折叠
    expect(await accordions[0].isExpanded()).toBe(false);
  });
});
```

## API 参考

详细的 API 文档请参阅以下 API 参考：

- [`AccordionGroup`](https://angular.dev/api/aria/accordion/AccordionGroup)
- [`AccordionTrigger`](https://angular.dev/api/aria/accordion/AccordionTrigger)
- [`AccordionPanel`](https://angular.dev/api/aria/accordion/AccordionPanel)
- [`AccordionContent`](https://angular.dev/api/aria/accordion/AccordionContent)
