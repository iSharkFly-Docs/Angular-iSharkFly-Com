# 复杂动画序列 {#complex-animation-sequences}

::: warning 重要
`@angular/animations` 包现已弃用。Angular 团队建议所有新代码都使用原生 CSS 配合 `animate.enter` 和 `animate.leave` 来实现动画。请参阅新的进入与离开[动画指南](/guide/animations)了解更多信息。另请参阅[迁移出 Angular 的 Animations 包](/guide/animations/migration)，了解如何开始将应用迁移到纯 CSS 动画。

:::

到目前为止，我们已经学习了单个 HTML 元素的简单动画（animation）。
Angular 还允许你为协同的动画序列添加动画，例如整个网格或元素列表在进入和离开页面时的动画。
你可以选择并行运行多个动画，也可以依次顺序运行多个独立的动画。

控制复杂动画序列的函数如下：

| 函数                              | 详情                                                           |
| :-------------------------------- | :------------------------------------------------------------- |
| `query()`                         | 查找一个或多个内部 HTML 元素。                                 |
| `stagger()`                       | 为多个元素的动画应用级联延迟。                                 |
| [`group()`](https://angular.dev/api/animations/group) | 并行运行多个动画步骤。                     |
| `sequence()`                      | 依次运行各个动画步骤。                                         |

## query() 函数 {#the-query-function}

大多数复杂动画都依赖 `query()` 函数来查找子元素并为其应用动画。基本示例包括：

| 示例                                   | 详情                                                                                                                                         |
| :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `query()` 后接 `animate()`             | 用于查询简单的 HTML 元素，并直接为其应用动画。                                                                                               |
| `query()` 后接 `animateChild()`        | 用于查询本身已应用了动画元数据的子元素，并触发这些动画（否则它们会被当前元素 / 父元素的动画所阻塞）。                                        |

`query()` 的第一个参数是一个 [CSS 选择器（selector）](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors)字符串，其中还可以包含以下 Angular 特有的标记：

| 标记                       | 详情                                         |
| :------------------------- | :------------------------------------------- |
| `:enter` <br /> `:leave`   | 用于正在进入 / 离开的元素。                  |
| `:animating`               | 用于当前正在执行动画的元素。                 |
| `@*` <br /> `@triggerName` | 用于带有任意触发器或特定触发器的元素。       |
| `:self`                    | 正在执行动画的元素本身。                     |

::: tip 进入和离开的元素
并非所有子元素都会被视为正在进入 / 离开；这有时会违反直觉、令人困惑。更多信息请参阅 [query API 文档](https://angular.dev/api/animations/query#entering-and-leaving-elements)。

你还可以在动画示例（在动画[简介部分](/guide/legacy-animations#about-this-guide)中介绍）的 Querying 标签页下看到相关演示。
:::

## 使用 query() 和 stagger() 函数为多个元素添加动画 {#animate-multiple-elements-using-query-and-stagger-functions}

通过 `query()` 查询到子元素后，可以用 `stagger()` 函数在各个条目之间定义时间间隔，让元素之间带着延迟依次执行动画。

下面的示例演示了如何使用 `query()` 和 `stagger()` 函数为一个（英雄）列表添加动画，让各个条目从上到下依次带着轻微延迟加入。

- 使用 `query()` 查找满足特定条件、正在进入页面的元素
- 对每个元素，使用 `style()` 为其设置相同的初始样式。
  让它变为透明，并使用 `transform` 把它移出原位，以便它能滑入到位。

- 使用 `stagger()` 让每个动画延迟 30 毫秒
- 使用自定义的缓动曲线，在 0.5 秒内为屏幕上的每个元素添加动画，同时让它淡入并取消变换

```ts [hero-list-page.ts]
animations: [
  trigger('pageAnimations', [
    transition(':enter', [
      query('.hero', [
        style({opacity: 0, transform: 'translateY(-100px)'}),
        stagger(30, [
          animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({opacity: 1, transform: 'none'})),
        ]),
      ]),
    ]),
  ]),
```

## 使用 group() 函数实现并行动画 {#parallel-animation-using-group-function}

你已经看到了如何在相邻的动画之间添加延迟。
不过，你可能还想配置并行发生的动画。
例如，你可能想为同一个元素的两个 CSS 属性添加动画，但为每个属性使用不同的 `easing` 函数。
为此，可以使用动画的 [`group()`](https://angular.dev/api/animations/group) 函数。

::: tip 提示
[`group()`](https://angular.dev/api/animations/group) 函数用于对动画*步骤*进行分组，而不是对执行动画的元素进行分组。

:::

下面的示例在 `:enter` 和 `:leave` 上都使用了 [`group()`](https://angular.dev/api/animations/group)，以实现两种不同的时间配置，从而把两个独立的动画并行地应用到同一个元素上。

```ts [hero-list-groups.ts (excerpt)]
animations: [
  trigger('flyInOut', [
    state(
      'in',
      style({
        width: '*',
        transform: 'translateX(0)',
        opacity: 1,
      }),
    ),
    transition(':enter', [
      style({width: 10, transform: 'translateX(50px)', opacity: 0}),
      group([
        animate(
          '0.3s 0.1s ease',
          style({
            transform: 'translateX(0)',
            width: '*',
          }),
        ),
        animate(
          '0.3s ease',
          style({
            opacity: 1,
          }),
        ),
      ]),
    ]),
    transition(':leave', [
      group([
        animate(
          '0.3s ease',
          style({
            transform: 'translateX(50px)',
            width: 10,
          }),
        ),
        animate(
          '0.3s 0.2s ease',
          style({
            opacity: 0,
          }),
        ),
      ]),
    ]),
  ]),
],
```

## 顺序动画与并行动画 {#sequential-vs-parallel-animations}

复杂动画可能同时发生很多事情。
但如果你想创建一个由多个动画依次发生组成的动画呢？前面你使用了 [`group()`](https://angular.dev/api/animations/group) 来同时并行运行多个动画。

另一个名为 `sequence()` 的函数可以让这些动画依次运行。
在 `sequence()` 中，动画步骤由 `style()` 或 `animate()` 函数调用组成。

- 使用 `style()` 立即应用所提供的样式数据。
- 使用 `animate()` 在给定的时间间隔内应用样式数据。

## 筛选动画示例 {#filter-animation-example}

再看看示例页面上的另一个动画。
在 Filter/Stagger 标签页下，在 **Search Heroes** 文本框中输入一些文字，例如 `Magnet` 或 `tornado`。

筛选会在你输入时实时生效。
每输入一个新字母，筛选条件就会更严格，元素随之离开页面。
当你逐个删除筛选框中的字母时，英雄列表又会逐渐重新进入页面。

HTML 模板（template）中包含一个名为 `filterAnimation` 的触发器（trigger）。

```html [hero-list-page.html]
<label for="search">Search heroes: </label>
<input
  type="text"
  id="search"
  #criteria
  (input)="updateCriteria(criteria.value)"
  placeholder="Search heroes"
/>

<ul class="heroes" [@filterAnimation]="heroesTotal">
  @for (hero of heroes; track hero) {
    <li class="hero">
      <div class="inner">
        <span class="badge">{{ hero.id }}</span>
        <span class="name">{{ hero.name }}</span>
      </div>
    </li>
  }
</ul>
```

组件（component）装饰器中的 `filterAnimation` 包含三个过渡（transition）。

```ts [hero-list-page.ts]
@Component({
  animations: [
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
  ],
})
export class HeroListPage implements OnInit {
  heroesTotal = -1;

  get heroes() {
    return this._heroes;
  }
  private _heroes: Hero[] = [];

  ngOnInit() {
    this._heroes = HEROES;
  }

  updateCriteria(criteria: string) {
    criteria = criteria ? criteria.trim() : '';

    this._heroes = HEROES.filter((hero) =>
      hero.name.toLowerCase().includes(criteria.toLowerCase()),
    );
    const newTotal = this.heroes.length;

    if (this.heroesTotal !== newTotal) {
      this.heroesTotal = newTotal;
    } else if (!criteria) {
      this.heroesTotal = -1;
    }
  }
}
```

这个示例中的代码执行以下任务：

- 在用户首次打开或导航到此页面时跳过动画（筛选动画是对已有内容进行收窄，因此它只作用于 DOM 中已经存在的元素）
- 根据搜索输入框的值筛选英雄

每次发生变化时：

- 通过把不透明度和宽度设置为 0 来隐藏正在离开 DOM 的元素
- 在 300 毫秒内为正在进入 DOM 的元素添加动画。
  在动画过程中，该元素会恢复其默认的宽度和不透明度。

- 如果有多个元素正在进入或离开 DOM，则从页面顶部开始依次错开每个动画，每个元素之间间隔 50 毫秒

## 为重新排序的列表条目添加动画 {#animating-the-items-of-a-reordering-list}

尽管 Angular 开箱即可为 `*ngFor` 列表条目正确地添加动画，但如果条目的顺序发生变化，它就无法做到了。
这是因为它会无法区分哪个元素是哪个，从而导致动画出错。
帮助 Angular 跟踪这些元素的唯一方法，就是为 `NgForOf` 指令（directive）指定一个 `TrackByFunction`。
这样可以确保 Angular 始终知道哪个元素是哪个，从而始终把正确的动画应用到正确的元素上。

::: warning 重要
如果你需要为 `*ngFor` 列表的条目添加动画，并且这些条目的顺序有可能在运行时发生变化，请务必使用 `TrackByFunction`。

:::

## 动画与组件视图封装 {#animations-and-component-view-encapsulation}

Angular 动画基于组件的 DOM 结构，并不会直接考虑[视图封装（View Encapsulation）](/guide/components/styling#style-scoping)。这意味着使用 `ViewEncapsulation.Emulated` 的组件，其行为与使用 `ViewEncapsulation.None` 时完全相同（`ViewEncapsulation.ShadowDom` 和 `ViewEncapsulation.ExperimentalIsolatedShadowDom` 的行为则不同，稍后会讨论）。

例如，如果把 `query()` 函数（在动画指南的其余部分中你会看到更多相关内容）应用在一棵使用模拟视图封装的组件树的顶部，这样的查询能够识别（从而为其添加动画）树中任意深度的 DOM 元素。

另一方面，`ViewEncapsulation.ShadowDom` 和 `ViewEncapsulation.ExperimentalIsolatedShadowDom` 会通过把 DOM 元素「隐藏」在 [`ShadowRoot`](https://developer.mozilla.org/docs/Web/API/ShadowRoot) 元素中来改变组件的 DOM 结构。这类 DOM 操作确实会导致部分动画实现无法正常工作，因为动画实现依赖于简单的 DOM 结构，并不考虑 `ShadowRoot` 元素。因此，建议避免对包含使用 ShadowDom 视图封装的组件的视图应用动画。

## 动画序列小结 {#animation-sequence-summary}

用于为多个元素添加动画的 Angular 函数，都从使用 `query()` 查找内部元素开始；例如，收集某个 `<div>` 中的所有图片。
其余函数 `stagger()`、[`group()`](https://angular.dev/api/animations/group) 和 `sequence()` 用于应用级联效果，或让你控制多个动画步骤的应用方式。

## 更多 Angular 动画相关内容 {#more-on-angular-animations}

你可能还对以下内容感兴趣：

- [Angular 动画简介](/guide/legacy-animations)
- [过渡与触发器](/guide/legacy-animations/transition-and-triggers)
- [可复用动画](/guide/legacy-animations/reusable-animations)
- [路由过渡动画](/guide/routing/route-transition-animations)
- [迁移到原生 CSS 动画](/guide/animations/migration)

