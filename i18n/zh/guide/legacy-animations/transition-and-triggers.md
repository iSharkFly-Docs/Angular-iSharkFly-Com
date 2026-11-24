# 动画过渡与触发器

::: warning 重要
`@angular/animations` 包现已弃用。Angular 团队建议所有新代码都使用原生 CSS 配合 `animate.enter` 和 `animate.leave` 来实现动画。请参阅新的进入与离开[动画指南](/guide/animations)了解更多信息。另请参阅[迁移出 Angular 的 Animations 包](/guide/animations/migration)，了解如何开始将应用迁移到纯 CSS 动画。

:::

本指南深入介绍特殊的过渡（transition）状态，例如 `*` 通配符和 `void`，并展示如何把这些状态用于进入和离开视图的元素。
本节还会探讨多个动画触发器（trigger）、动画回调，以及使用关键帧实现的基于序列的动画（animation）。

## 预定义状态和通配符匹配

在 Angular 中，过渡状态既可以通过 [`state()`](https://angular.dev/api/animations/state) 函数显式定义，也可以使用预定义的 `*` 通配符状态和 `void` 状态。

### 通配符状态

星号 `*`，即*通配符*，可以匹配任何动画状态。
它适用于定义那些无论 HTML 元素的起始状态或结束状态如何都适用的过渡。

例如，`open => *` 这个过渡会在元素的状态从 open 变为其他任何状态时生效。

<img alt="wildcard state expressions" src="/assets/images/guide/animations/wildcard-state-500.png">

下面是另一个代码示例，它把通配符状态与前面使用 `open` 和 `closed` 状态的示例结合在一起。
这里没有逐一定义每一对状态之间的过渡，而是让任何变为 `closed` 的过渡耗时 1 秒，任何变为 `open` 的过渡耗时 0.5 秒。

这样一来，添加新状态时就无需为每个状态单独编写过渡。

```ts [open-close.ts]
animations: [
  trigger('openClose', [
    // ...
    state(
      'open',
      style({
        height: '200px',
        opacity: 1,
        backgroundColor: 'yellow',
      }),
    ),
    state(
      'closed',
      style({
        height: '100px',
        opacity: 0.8,
        backgroundColor: 'blue',
      }),
    ),
    transition('* => closed', [animate('1s')]),
    transition('* => open', [animate('0.5s')]),
  ]),
],
```

使用双箭头语法可以指定双向的状态间过渡。

```ts [open-close.ts]
transition('open <=> closed', [animate('0.5s')]),
```

### 在多个过渡状态中使用通配符状态

在这个只有两种状态的按钮示例中，通配符的用处不大，因为只有 `open` 和 `closed` 两种可能的状态。
一般来说，当一个元素可能变为多种状态时，才使用通配符状态。
如果按钮可以从 `open` 变为 `closed` 或者类似 `inProgress` 的状态，使用通配符状态就可以减少所需的代码量。

<img alt="wildcard state with 3 states" src="/assets/images/guide/animations/wildcard-3-states.png">

```ts [open-close.ts]
animations: [
  trigger('openClose', [
    // ...
    state(
      'open',
      style({
        height: '200px',
        opacity: 1,
        backgroundColor: 'yellow',
      }),
    ),
    state(
      'closed',
      style({
        height: '100px',
        opacity: 0.8,
        backgroundColor: 'blue',
      }),
    ),
    transition('open => closed', [animate('1s')]),
    transition('closed => open', [animate('0.5s')]),
    transition('* => closed', [animate('1s')]),
    transition('* => open', [animate('0.5s')]),
    transition('open <=> closed', [animate('0.5s')]),
    transition('* => open', [animate('1s', style({opacity: '*'}))]),
    transition('* => *', [animate('1s')]),
```

`* => *` 过渡会在任意两个状态之间发生变化时生效。

过渡会按照定义的顺序进行匹配。
因此，你可以在 `* => *` 过渡的基础上叠加其他过渡。
例如，定义只适用于 `open => closed` 的样式变化或动画，然后把 `* => *` 作为兜底，用于其他未单独指定的状态组合。

为此，要把更具体的过渡列在 `* => *` *之前*。

### 在样式中使用通配符

在样式中使用通配符 `*`，可以让动画使用当前的样式值，并以此为基础执行动画。
通配符是一个兜底值，当被执行动画的状态没有在触发器中声明时就会使用它。

```ts [open-close.ts]
transition('* => open', [animate('1s', style({opacity: '*'}))]),
```

### void 状态

使用 `void` 状态可以为正在进入或离开页面的元素配置过渡。
参阅[为进入和离开视图添加动画](/guide/legacy-animations/transition-and-triggers#aliases-enter-and-leave)。

### 组合使用通配符状态和 void 状态

在过渡中组合使用通配符状态和 void 状态，可以触发进入和离开页面的动画：

- `* => void` 过渡会在元素离开视图时生效，无论它离开前处于什么状态
- `void => *` 过渡会在元素进入视图时生效，无论它进入时处于什么状态
- 通配符状态 `*` 可以匹配*任何*状态，包括 `void`

## 为进入和离开视图添加动画

本节介绍如何为进入或离开页面的元素添加动画。

添加一个新行为：

- 当你把一个英雄添加到英雄列表时，它看起来像是从左侧飞入页面
- 当你从列表中移除一个英雄时，它看起来像是向右侧飞出

```ts [hero-list-enter-leave.ts]
animations: [
  trigger('flyInOut', [
    state('in', style({transform: 'translateX(0)'})),
    transition('void => *', [style({transform: 'translateX(-100%)'}), animate(100)]),
    transition('* => void', [animate(100, style({transform: 'translateX(100%)'}))]),
  ]),
],
```

在上面的代码中，当 HTML 元素没有附加到视图上时，你应用了 `void` 状态。

## 别名 :enter 和 :leave

`:enter` 和 `:leave` 分别是 `void => *` 和 `* => void` 过渡的别名。
多个动画函数都会用到这两个别名。

```ts

transition ( ':enter', [ … ] ); // void => _ 的别名
transition ( ':leave', [ … ] ); // _ => void 的别名

```

正在进入视图的元素比较难以定位，因为它还不在 DOM 中。
使用别名 `:enter` 和 `:leave` 可以定位那些被插入视图或从视图中移除的 HTML 元素。

### 在 :enter 和 :leave 中使用 `*ngIf` 和 `*ngFor`

当任何 `*ngIf` 或 `*ngFor` 视图被放置到页面上时，会运行 `:enter` 过渡；当这些视图从页面上移除时，会运行 `:leave` 过渡。

::: warning 重要
进入 / 离开行为有时可能令人困惑。
一条经验法则是：任何由 Angular 添加到 DOM 中的元素都会经过 `:enter` 过渡。只有被 Angular 直接从 DOM 中移除的元素才会经过 `:leave` 过渡。例如，某个元素的视图是因为其父元素被从 DOM 中移除而从 DOM 中移除的。

:::

这个示例为进入和离开动画设置了一个名为 `myInsertRemoveTrigger` 的特殊触发器。
HTML 模板（template）包含以下代码。

```html [insert-remove.html]
@if (isShown) {
  <div @myInsertRemoveTrigger class="insert-remove-container">
    <p>The box is inserted</p>
  </div>
}
```

在组件（component）文件中，`:enter` 过渡把初始不透明度设置为 0，然后在元素被插入视图时，通过动画把不透明度变为 1。

```ts [insert-remove.ts]
trigger('myInsertRemoveTrigger', [
  transition(':enter', [style({opacity: 0}), animate('100ms', style({opacity: 1}))]),
  transition(':leave', [animate('100ms', style({opacity: 0}))]),
]),
```

注意，这个示例不需要使用 [`state()`](https://angular.dev/api/animations/state)。

## :increment 和 :decrement 过渡

`transition()` 函数还接受其他选择器（selector）值：`:increment` 和 `:decrement`。
当数值增大或减小时，可以用它们来启动过渡。

::: tip 提示
下面的示例使用了 `query()` 和 `stagger()` 方法。
关于这些方法的更多信息，请参阅[复杂序列](/guide/legacy-animations/complex-sequences)页面。

:::

```ts [hero-list-page.ts]
trigger('filterAnimation', [
  transition(':enter, * => 0, * => -1', []),
  transition(':increment', [
    query(
      ':enter',
      [
        style({opacity: 0, width: 0}),
        stagger(50, [animate('300ms ease-out', style({opacity: 1, width: '*'}))]),
      ],
      {optional: true},
    ),
  ]),
  transition(':decrement', [
    query(':leave', [stagger(50, [animate('300ms ease-out', style({opacity: 0, width: 0}))])]),
  ]),
]),
```

## 过渡中的布尔值

如果触发器以布尔值作为绑定（binding）值，那么可以使用比较 `true` 和 `false`（或 `1` 和 `0`）的 `transition()` 表达式来匹配这个值。

```html [open-close.html]
<div [@openClose]="isOpen ? true : false" class="open-close-container">
</div>
```

在上面的代码片段中，HTML 模板把一个 `<div>` 元素绑定到名为 `openClose` 的触发器上，其状态表达式为 `isOpen`，可能的值为 `true` 和 `false`。
这种模式可以替代创建 `open` 和 `close` 这样两个具名状态的做法。

在 `@Component` 元数据的 `animations:` 属性中，当状态求值为 `true` 时，相关 HTML 元素的高度是通配符样式或默认值。
在这种情况下，动画会使用元素在动画开始前已有的高度。
当元素处于 `closed` 状态时，元素会以动画方式变为 0 高度，从而变得不可见。

```ts [open-close.ts]
animations: [
  trigger('openClose', [
    state('true', style({height: '*'})),
    state('false', style({height: '0px'})),
    transition('false <=> true', animate(500)),
  ]),
],
```

## 多个动画触发器

你可以为一个组件定义多个动画触发器。
把动画触发器附加到不同的元素上，元素之间的父子关系会影响动画运行的方式和时机。

### 父子动画

在 Angular 中，每次触发动画时，父动画总是优先，子动画会被阻塞。
要让子动画运行，父动画必须查询每个包含子动画的元素，然后使用 [`animateChild()`](https://angular.dev/api/animations/animateChild) 函数让这些动画运行。

#### 在 HTML 元素上禁用动画

可以在 HTML 元素上放置一个名为 `@.disabled` 的特殊动画控制绑定，以关闭该元素及其所有嵌套元素上的动画。
当其值为 true 时，`@.disabled` 绑定会阻止所有动画的渲染。

下面的代码示例展示了如何使用这个功能。

::: code-group

```html [open-close.html]
<div [@.disabled]="isDisabled">
  <div [@childAnimation]="isOpen ? 'open' : 'closed'" class="open-close-container">
    <p>The box is now {{ isOpen ? 'Open' : 'Closed' }}!</p>
  </div>
</div>
```

```ts [open-close.ts]
@Component({
  animations: [
    trigger('childAnimation', [
      // ...
    ]),
  ],
})
export class OpenCloseChild {
  isDisabled = false;
  isOpen = false;
}
```

:::

当 `@.disabled` 绑定为 true 时，`@childAnimation` 触发器不会启动。

当 HTML 模板中的某个元素通过 `@.disabled` 宿主绑定关闭了动画时，其所有内部元素上的动画也会被关闭。
你无法有选择地关闭单个元素上的多个动画。<!-- vale off -->

不过，在已禁用动画的父元素上，仍然可以通过以下方式之一有选择地运行子动画：

- 父动画可以使用 [`query()`](https://angular.dev/api/animations/query) 函数收集位于 HTML 模板中已禁用区域内的内部元素。
这些元素仍然可以执行动画。
<!-- vale on -->

- 子动画可以先被父动画查询，然后再通过 `animateChild()` 函数执行动画

#### 禁用所有动画

要关闭 Angular 应用中的所有动画，可以把 `@.disabled` 宿主绑定放在最顶层的 Angular 组件上。

```ts [app.ts]
@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['app.css'],
  imports: [RouterLink, RouterOutlet],
  animations: [
    slideInAnimation,
  ],
})
export class AppComponent {
  @HostBinding('@.disabled')
  public animationsDisabled = false;
}
```

::: tip 提示
在端到端（E2E）测试期间，在整个应用范围内禁用动画会很有用。

:::

## 动画回调

动画的 `trigger()` 函数会在动画开始和结束时发出*回调*。
下面的示例中有一个包含 `openClose` 触发器的组件。

```ts [open-close.ts]
@Component({
  selector: 'app-open-close',
  animations: [
    trigger('openClose', [
      // ...
    ]),
  ],
  templateUrl: 'open-close.html',
  styleUrls: ['open-close.css'],
})
export class OpenClose {
  onAnimationEvent(event: AnimationEvent) {
  }
}
```

在 HTML 模板中，动画事件会以 `@triggerName.start` 和 `@triggerName.done` 的形式通过 `$event` 传回，其中 `triggerName` 是所用触发器的名称。
在这个示例中，`openClose` 触发器的写法如下。

```html [open-close.html]
<div
  [@openClose]="isOpen ? 'open' : 'closed'"
  (@openClose.start)="onAnimationEvent($event)"
  (@openClose.done)="onAnimationEvent($event)"
  class="open-close-container"
>
</div>
```

动画回调的一个潜在用途是掩盖较慢的 API 调用，例如数据库查找。
例如，可以为 **InProgress** 按钮设置它自己的循环动画，一直持续到后端系统操作完成。

当前动画结束时，还可以调用另一个动画。
例如，当 API 调用完成时，按钮会从 `inProgress` 状态变为 `closed` 状态。

动画可以让最终用户*感觉*操作更快，即使实际上并没有更快。

回调还可以作为调试工具，例如配合 `console.warn()` 在浏览器的开发者 JavaScript 控制台中查看应用的执行进度。
下面的代码片段为最初的示例（一个具有 `open` 和 `closed` 两种状态的按钮）生成控制台日志输出。

```ts [open-close.ts]
export class OpenClose {
  onAnimationEvent(event: AnimationEvent) {
    // 在这个示例中，openClose 是触发器名称
    console.warn(`Animation Trigger: ${event.triggerName}`);

    // phaseName 为 "start" 或 "done"
    console.warn(`Phase: ${event.phaseName}`);

    // 在我们的示例中，totalTime 为 1000（一秒对应的毫秒数）
    console.warn(`Total time: ${event.totalTime}`);

    // 在我们的示例中，fromState 为 "open" 或 "closed"
    console.warn(`From: ${event.fromState}`);

    // 在我们的示例中，toState 为 "open" 或 "closed"
    console.warn(`To: ${event.toState}`);

    // HTML 元素本身，在本例中就是按钮
    console.warn(`Element: ${event.element}`);
  }
}
```

## 关键帧

要创建由多个依次运行的步骤组成的动画，可以使用*关键帧*。

Angular 的 `keyframe()` 函数允许在单个时间段内进行多次样式变化。
例如，按钮可以不淡出，而是在 2 秒的时间段内多次改变颜色。

<img alt="keyframes" src="/assets/images/guide/animations/keyframes-500.png">

这种颜色变化的代码可能如下所示。

```ts [status-slider.ts]
transition('* => active', [
  animate(
    '2s',
    keyframes([
      style({backgroundColor: 'blue'}),
      style({backgroundColor: 'red'}),
      style({backgroundColor: 'orange'}),
    ]),
  ),
```

### 偏移量

关键帧包含一个 `offset`，用于定义每次样式变化发生在动画中的哪个时间点。
偏移量是从 0 到 1 的相对度量，分别标记动画的开始和结束。只要使用了一次偏移量，就应该为每个关键帧步骤都应用偏移量。

为关键帧定义偏移量是可选的。
如果省略它们，系统会自动分配均匀间隔的偏移量。
例如，三个未预先定义偏移量的关键帧，会分别得到 0、0.5 和 1 的偏移量。
在前面的示例中，为中间的过渡指定 0.8 的偏移量，效果可能如下所示。

<img alt="keyframes with offset" src="/assets/images/guide/animations/keyframes-offset-500.png">

指定了偏移量的代码如下所示。

```ts [status-slider.ts]
transition('* => active', [
  animate(
    '2s',
    keyframes([
      style({backgroundColor: 'blue', offset: 0}),
      style({backgroundColor: 'red', offset: 0.8}),
      style({backgroundColor: '#754600', offset: 1.0}),
    ]),
  ),
]),
transition('* => inactive', [
  animate(
    '2s',
    keyframes([
      style({backgroundColor: '#754600', offset: 0}),
      style({backgroundColor: 'red', offset: 0.2}),
      style({backgroundColor: 'blue', offset: 1.0}),
    ]),
  ),
]),
```

你可以在单个动画中把关键帧与 `duration`、`delay` 和 `easing` 组合使用。

### 带脉动效果的关键帧

通过在整个动画过程中的特定偏移量处定义样式，可以使用关键帧在动画中创建脉动效果。

下面是一个使用关键帧创建脉动效果的示例：

- 原有的 `open` 和 `closed` 状态，以及原有的高度、颜色和不透明度变化，在 1 秒的时间段内发生
- 在中间插入一个关键帧序列，使按钮在同样的 1 秒时间段内看起来在不规则地脉动

<img alt="keyframes with irregular pulsation" src="/assets/images/guide/animations/keyframes-pulsation.png">

这个动画的代码片段可能如下所示。

```ts [open-close.ts]
trigger('openClose', [
  state(
    'open',
    style({
      height: '200px',
      opacity: 1,
      backgroundColor: 'yellow',
    }),
  ),
  state(
    'close',
    style({
      height: '100px',
      opacity: 0.5,
      backgroundColor: 'green',
    }),
  ),
  // ...
  transition('* => *', [
    animate(
      '1s',
      keyframes([
        style({opacity: 0.1, offset: 0.1}),
        style({opacity: 0.6, offset: 0.2}),
        style({opacity: 1, offset: 0.5}),
        style({opacity: 0.2, offset: 0.7}),
      ]),
    ),
  ]),
]),
```

### 可动画的属性和单位

Angular 动画构建在 Web 动画之上，因此你可以为浏览器认为可动画的任何属性添加动画。
这包括位置、尺寸、变换、颜色、边框等。
W3C 在其 [CSS Transitions](https://www.w3.org/TR/css-transitions-1) 页面上维护了一份可动画属性列表。

对于数值型的属性，可以把值写成带有相应后缀的带引号字符串来定义单位：

- 50 像素：
  `'50px'`

- 相对字体大小：
  `'3em'`

- 百分比：
  `'100%'`

你也可以直接以数字形式提供值。此时，Angular 会假定使用默认单位像素，即 `px`。
把 50 像素写成 `50` 与写成 `'50px'` 是一样的。

::: tip 提示
而字符串 `"50"` 则不会被视为有效值。

:::

### 使用通配符自动计算属性

有时，尺寸类样式属性的值要到运行时才能知道。
例如，元素的宽度和高度通常取决于其内容或屏幕尺寸。
使用 CSS 为这些属性添加动画往往很有挑战性。

在这些情况下，可以在 `style()` 中使用特殊的通配符 `*` 作为属性值。该样式属性的值会在运行时计算，然后代入动画中。

下面的示例有一个名为 `shrinkOut` 的触发器，在 HTML 元素离开页面时使用。
该动画会获取元素离开前的高度，并以动画方式从该高度变为 0。

```ts [hero-list-auto.ts]
animations: [
  trigger('shrinkOut', [
    state('in', style({height: '*'})),
    transition('* => void', [style({height: '*'}), animate(250, style({height: 0}))]),
  ]),
],
```

### 关键帧小结

Angular 中的 `keyframes()` 函数允许你在单个过渡中指定多个中间样式。可以使用可选的 `offset` 来定义每次样式变化应发生在动画中的哪个时间点。

## 更多 Angular 动画相关内容

你可能还对以下内容感兴趣：

- [Angular 动画简介](/guide/legacy-animations)
- [复杂动画序列](/guide/legacy-animations/complex-sequences)
- [可复用动画](/guide/legacy-animations/reusable-animations)
- [路由过渡动画](/guide/routing/route-transition-animations)
- [迁移到原生 CSS 动画](/guide/animations/migration)

