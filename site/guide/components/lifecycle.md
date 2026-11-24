# 组件生命周期 {#component-lifecycle}

::: tip 提示
本指南假定你已经读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

组件（Component）的**生命周期**是指从组件创建
到销毁之间所经历的一系列步骤。每个步骤都代表了 Angular 渲染组件、
并随时间推移检查组件是否需要更新这一过程中的不同环节。

在组件中，你可以实现**生命周期钩子**（Lifecycle Hook），在这些步骤中运行代码。
与特定组件实例相关的生命周期钩子，以组件类上的方法来实现。
与整个 Angular 应用相关的生命周期钩子，则以接受回调函数的
函数形式来实现。

组件的生命周期与 Angular 如何随时间推移检查组件变化紧密相关。
就理解生命周期而言，你只需要知道：Angular 会自上而下遍历
应用树，检查模板（Template）绑定是否发生了变化。下文介绍的生命周期
钩子就在 Angular 执行这次遍历时运行。这次遍历会恰好访问每个
组件一次，所以你应该始终避免在这个过程中途
进一步修改状态。

## 概要 {#summary}

<div class="docs-table docs-scroll-track-transparent">
  <table>
    <tr>
      <td><strong>阶段</strong></td>
      <td><strong>方法</strong></td>
      <td><strong>概要</strong></td>
    </tr>
    <tr>
      <td>创建</td>
      <td><code>constructor</code></td>
      <td>
        <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Classes/constructor" target="_blank">
          标准 JavaScript 类构造函数
        </a>。在 Angular 实例化组件时运行。
      </td>
    </tr>
    <tr>
      <td rowspan="7">变更<br>检测</td>
      <td><code>ngOnInit</code>
      </td>
      <td>在 Angular 初始化完组件的所有输入之后运行一次。</td>
    </tr>
    <tr>
      <td><code>ngOnChanges</code></td>
      <td>每当组件的输入发生变化时运行。</td>
    </tr>
    <tr>
      <td><code>ngDoCheck</code></td>
      <td>每次检查该组件的变化时运行。</td>
    </tr>
    <tr>
      <td><code>ngAfterContentInit</code></td>
      <td>在组件的<em>内容</em>初始化之后运行一次。</td>
    </tr>
    <tr>
      <td><code>ngAfterContentChecked</code></td>
      <td>每次检查完该组件内容的变化后运行。</td>
    </tr>
    <tr>
      <td><code>ngAfterViewInit</code></td>
      <td>在组件的<em>视图</em>初始化之后运行一次。</td>
    </tr>
    <tr>
      <td><code>ngAfterViewChecked</code></td>
      <td>每次检查完组件视图的变化后运行。</td>
    </tr>
    <tr>
      <td rowspan="2">渲染</td>
      <td><code>afterNextRender</code></td>
      <td>在下一次<strong>所有</strong>组件都渲染到 DOM 之后运行一次。</td>
    </tr>
    <tr>
      <td><code>afterEveryRender</code></td>
      <td>每当<strong>所有</strong>组件都渲染到 DOM 之后运行。</td>
    </tr>
    <tr>
      <td>销毁</td>
      <td><code>ngOnDestroy</code></td>
      <td>在组件销毁之前运行一次。</td>
    </tr>
  </table>
</div>

### ngOnInit {#ngoninit}

`ngOnInit` 方法会在 Angular 用初始值初始化完组件的所有输入（input）之后
运行。组件的 `ngOnInit` 恰好运行一次。

这一步发生在组件自身的模板初始化**之前**。这意味着你可以
根据输入的初始值来更新组件的状态。

### ngOnChanges {#ngonchanges}

`ngOnChanges` 方法会在组件的任意输入发生变化之后运行。

这一步发生在检查组件自身的模板**之前**。这意味着你可以
根据输入的初始值来更新组件的状态。

在初始化期间，第一次 `ngOnChanges` 会在 `ngOnInit` 之前运行。

#### 检查变化 {#inspecting-changes}

`ngOnChanges` 方法接受一个 `SimpleChanges` 参数。这个对象是
一个 [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)，
它把组件的每个输入名称映射到一个 `SimpleChange` 对象。每个 `SimpleChange` 都包含
该输入的旧值、当前值，以及一个表示这是否是该输入第一次
变化的标志。

你还可以把当前类或 this 作为第一个泛型参数传入，以获得更强的类型检查。

```ts
@Component({/* ... */})
export class UserProfile {
  name = input('');

  ngOnChanges(changes: SimpleChanges<UserProfile>) {
    if (changes.name) {
      console.log(`Previous: ${changes.name.previousValue}`);
      console.log(`Current: ${changes.name.currentValue}`);
      console.log(`Is first ${changes.name.firstChange}`);
    }
  }
}
```

如果你为某些输入属性提供了 `alias`（别名），`SimpleChanges` Record 仍然使用
TypeScript 属性名而不是别名作为键。

### ngOnDestroy {#ngondestroy}

`ngOnDestroy` 方法会在组件销毁之前运行一次。当组件不再显示在页面上时
（例如被 `@if` 隐藏，或者导航到
其他页面时），Angular 就会销毁它。

#### DestroyRef {#destroyref}

作为 `ngOnDestroy` 方法的替代方案，你可以注入一个 `DestroyRef` 实例。你可以
调用 `DestroyRef` 的 `onDestroy` 方法，注册一个在组件销毁时
调用的回调函数。

```ts
@Component({/* ... */})
export class UserProfile {
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      console.log('UserProfile destruction');
    });
  }
}
```

你可以把 `DestroyRef` 实例传给组件之外的函数或类。如果你有其他代码
需要在组件销毁时执行一些清理行为，就可以使用
这种模式。

你还可以使用 `DestroyRef` 把设置代码和清理代码放在一起，而不是把
所有清理代码都放在 `ngOnDestroy` 方法中。

##### 检测实例是否已销毁 {#detecting-instance-destruction}

`DestroyRef` 提供了一个 `destroyed` 属性，用于检查给定实例是否已经被销毁。这有助于避免对已销毁的组件执行操作，尤其是在处理延迟或异步逻辑时。

通过检查 `destroyRef.destroyed`，你可以避免在实例被清理之后继续执行代码，从而避免诸如 `NG0911: View has already been destroyed.` 之类的潜在错误。

### ngDoCheck {#ngdocheck}

`ngDoCheck` 方法会在 Angular 每次检查组件模板的变化之前运行。

你可以使用这个生命周期钩子，在 Angular 常规的
变更检测（Change Detection）之外手动检查状态变化，并手动更新组件的状态。

这个方法运行得非常频繁，可能会显著影响页面性能。尽可能
避免定义这个钩子，只在别无选择时才使用它。

在初始化期间，第一次 `ngDoCheck` 会在 `ngOnInit` 之后运行。

### ngAfterContentInit {#ngaftercontentinit}

`ngAfterContentInit` 方法会在组件内嵌套的所有子元素（即组件的
**内容**）都初始化之后运行一次。

你可以使用这个生命周期钩子来读取
[内容查询（content query）](/guide/components/queries#content-queries)的结果。虽然你可以访问这些查询初始化后的
状态，但要避免修改祖先模板已经渲染过的
非信号状态。这样做可能会导致
[ExpressionChangedAfterItHasBeenCheckedError](/errors/NG0100)。

### ngAfterContentChecked {#ngaftercontentchecked}

`ngAfterContentChecked` 方法会在每次检查完组件内嵌套的子元素（即组件的
**内容**）的变化之后运行。

这个方法运行得非常频繁，可能会显著影响页面性能。尽可能
避免定义这个钩子，只在别无选择时才使用它。

虽然你可以在这里访问
[内容查询](/guide/components/queries#content-queries)更新后的状态，但要避免修改祖先模板已经渲染过的非信号
状态。这样做可能会导致
[ExpressionChangedAfterItHasBeenCheckedError](/errors/NG0100)。

### ngAfterViewInit {#ngafterviewinit}

`ngAfterViewInit` 方法会在组件模板中的所有子元素（即组件的
**视图**）都初始化之后运行一次。

你可以使用这个生命周期钩子来读取
[视图查询（view query）](/guide/components/queries#view-queries)的结果。虽然你可以访问这些查询初始化后的状态，
但要避免修改模板已经渲染过的非信号状态。这样做可能会
导致 [ExpressionChangedAfterItHasBeenCheckedError](/errors/NG0100)。

### ngAfterViewChecked {#ngafterviewchecked}

`ngAfterViewChecked` 方法会在每次检查完组件模板中的子元素（即组件的
**视图**）的变化之后运行。

这个方法运行得非常频繁，可能会显著影响页面性能。尽可能
避免定义这个钩子，只在别无选择时才使用它。

虽然你可以在这里访问[视图查询](/guide/components/queries#view-queries)更新后的状态，
但要避免修改模板已经渲染过的非信号状态。这样做可能会
导致 [ExpressionChangedAfterItHasBeenCheckedError](/errors/NG0100)。

### afterEveryRender 和 afterNextRender {#aftereveryrender-and-afternextrender}

`afterEveryRender` 和 `afterNextRender` 函数让你可以注册一个**渲染回调**，它会在
Angular 把页面上的**所有组件**都渲染到 DOM 之后被调用。

这些函数与本指南介绍的其他生命周期钩子不同。它们不是
类方法，而是接受回调函数的独立函数。渲染回调的执行
不与任何特定组件实例绑定，而是一个应用级别的钩子。

`afterEveryRender` 和 `afterNextRender` 必须在
[注入上下文（injection context）](/guide/di/dependency-injection-context)中调用，通常是在
组件的构造函数中。

你可以使用渲染回调来执行手动 DOM 操作。
关于在 Angular 中操作 DOM 的指导，请参阅[使用 DOM API](/guide/components/dom-apis)。

渲染回调不会在服务端渲染期间或构建时预渲染期间运行。

#### after\*Render 阶段 {#after-render-phases}

使用 `afterEveryRender` 或 `afterNextRender` 时，你可以选择把工作拆分到多个阶段中。
阶段让你可以控制 DOM 操作的先后顺序，把**写**
操作安排在**读**操作之前，以尽量减少
[布局抖动（layout thrashing）](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing)。为了
在各阶段之间通信，阶段函数可以返回一个结果值，供
下一个阶段访问。

```ts
import {Component, ElementRef, afterNextRender, inject} from '@angular/core';

@Component(/* ... */)
export class UserProfile {
  private prevPadding = 0;
  private elementHeight = 0;

  constructor() {
    const elementRef = inject(ElementRef);
    const nativeElement = elementRef.nativeElement;

    afterNextRender({
      // 使用 `Write` 阶段写入几何属性。
      write: () => {
        const padding = computePadding();
        const changed = padding !== this.prevPadding;
        if (changed) {
          nativeElement.style.padding = padding;
        }
        return changed; // 告知 read 阶段是否有任何变化。
      },

      // 使用 `Read` 阶段在所有写入完成后读取几何属性。
      read: (didWrite) => {
        if (didWrite) {
          this.elementHeight = nativeElement.getBoundingClientRect().height;
        }
      },
    });
  }
}
```

共有四个阶段，按以下顺序运行：

| 阶段             | 说明                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| `earlyRead`      | 使用此阶段读取后续计算严格需要的、会影响布局的 DOM 属性和样式。尽可能避免使用此阶段，优先使用 `write` 和 `read` 阶段。 |
| `write`          | 使用此阶段写入会影响布局的 DOM 属性和样式。                                                             |
| `mixedReadWrite` | 默认阶段。用于既需要读取又需要写入会影响布局的属性和样式的操作。尽可能避免使用此阶段，优先使用显式的 `write` 和 `read` 阶段。 |
| `read`           | 使用此阶段读取会影响布局的 DOM 属性。                                                                   |

## 生命周期接口 {#lifecycle-interfaces}

Angular 为每个生命周期方法都提供了一个 TypeScript 接口。你可以选择导入
并 `implement` 这些接口，以确保你的实现没有任何笔误或
拼写错误。

每个接口的名称都与对应的方法相同，只是去掉了 `ng` 前缀。例如，
`ngOnInit` 对应的接口是 `OnInit`。

```ts
@Component({/* ... */})
export class UserProfile implements OnInit {
  ngOnInit() {
    /* ... */
  }
}
```

## 执行顺序 {#execution-order}

下图展示了 Angular 生命周期钩子的执行顺序。

### 初始化期间 {#during-initialization}

```txt
graph TD;
id[constructor]-->CHANGE;
subgraph CHANGE [Change detection]
direction TB
ngOnChanges-->ngOnInit;
ngOnInit-->ngDoCheck;
ngDoCheck-->ngAfterContentInit;
ngDoCheck-->ngAfterViewInit
ngAfterContentInit-->ngAfterContentChecked
ngAfterViewInit-->ngAfterViewChecked
end
CHANGE--Rendering-->afterNextRender-->afterEveryRender
```

### 后续更新 {#subsequent-updates}

```txt
graph TD;
subgraph CHANGE [Change detection]
direction TB
ngOnChanges-->ngDoCheck
ngDoCheck-->ngAfterContentChecked;
ngDoCheck-->ngAfterViewChecked
end
CHANGE--Rendering-->afterEveryRender
```

### 与指令的执行顺序 {#ordering-with-directives}

当你把一个或多个指令（Directive）与组件放在同一个元素上时（无论是在模板中，还是通过
`hostDirectives` 属性），框架都不保证同一元素上的组件和指令之间
某个生命周期钩子的执行顺序。永远不要依赖观察到的
顺序，因为它可能会在 Angular 的后续版本中发生变化。
