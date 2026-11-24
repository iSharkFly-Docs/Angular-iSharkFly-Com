# 使用 ng-content 进行内容投影

::: tip 提示
本指南假设你已经阅读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

你经常需要创建一些组件（Component），把它们用作承载各种不同类型内容的容器。
例如，你可能想创建一个自定义卡片组件：

```ts
@Component({
  selector: 'custom-card',
  template: '<div class="card-shadow"> <!-- card content goes here --> </div>',
})
export class CustomCard {
  /* ... */
}
```

**你可以使用 `<ng-content>` 元素作为占位符，标记内容应该放置的位置**：

```ts
@Component({
  selector: 'custom-card',
  template: '<div class="card-shadow"> <ng-content/> </div>',
})
export class CustomCard {
  /* ... */
}
```

::: tip 提示
`<ng-content>` 的工作方式类似于
[原生 `<slot>` 元素](https://developer.mozilla.org/docs/Web/HTML/Element/slot)，
但带有一些 Angular 特有的功能。

:::

当你使用一个带有 `<ng-content>` 的组件时，组件宿主元素（Host Element）的所有子元素都会
被渲染（或者说被**投影**）到那个 `<ng-content>` 所在的位置：

```ts
// 组件源码
@Component({
  selector: 'custom-card',
  template: `
    <div class="card-shadow">
      <ng-content />
    </div>
  `,
})
export class CustomCard {
  /* ... */
}
```

```html
<!-- 使用该组件 -->
<custom-card>
  <p>This is the projected content</p>
</custom-card>
```

```html
<!-- 渲染出的 DOM -->
<custom-card>
  <div class="card-shadow">
    <p>This is the projected content</p>
  </div>
</custom-card>
```

Angular 把以这种方式传入组件的子元素称为该组件的**内容（content）**。这与
组件的**视图**（view）不同，视图指的是在组件
模板（Template）中定义的元素。

**`<ng-content>` 元素既不是组件，也不是 DOM 元素**。它是一个特殊的
占位符，用来告诉 Angular 在哪里渲染内容。Angular 编译器会在构建期处理
所有 `<ng-content>` 元素。你不能在运行时插入、移除或修改 `<ng-content>`，
也不能为 `<ng-content>` 添加指令（Directive）、样式或任意属性。

::: warning 重要
你不应该用 `@if`、`@for` 或 `@switch` 有条件地包含 `<ng-content>`。对于渲染到 `<ng-content>` 占位符中的内容，
Angular 总是会实例化并创建其 DOM 节点，即使
该 `<ng-content>` 占位符是隐藏的。要有条件地渲染组件内容，
请参阅[模板片段](https://angular.dev/api/core/ng-template)。

:::

## 多个内容占位符

Angular 支持根据 CSS 选择器（Selector），把多个不同的元素投影到不同的 `<ng-content>` 占位符中。
扩展上面的卡片示例，你可以使用 `select` 属性，为卡片标题和卡片正文
创建两个占位符：

```ts
@Component({
  selector: 'card-title',
  template: `<ng-content>card-title</ng-content>`,
})
export class CardTitle {}

@Component({
  selector: 'card-body',
  template: `<ng-content>card-body</ng-content>`,
})
export class CardBody {}
```

```ts
<!-- 组件模板 -->
@Component({
  selector: 'custom-card',
  template: `
  <div class="card-shadow">
    <ng-content select="card-title" />
    <div class="card-divider"></div>
    <ng-content select="card-body" />
  </div>
  `,
})
export class CustomCard {}
```

```ts
<!-- 使用该组件 -->
@Component({
  selector: 'app-root',
  imports: [CustomCard, CardTitle, CardBody],
  template: `
    <custom-card>
      <card-title>Hello</card-title>
      <card-body>Welcome to the example</card-body>
    </custom-card>
`,
})
export class App {}
```

```html
<!-- 渲染出的 DOM -->
<custom-card>
  <div class="card-shadow">
    <card-title>Hello</card-title>
    <div class="card-divider"></div>
    <card-body>Welcome to the example</card-body>
  </div>
</custom-card>
```

`<ng-content>` 占位符支持的 CSS 选择器
与[组件选择器](/guide/components/selectors)相同。

::: warning 重要
如果使用属性选择器或类选择器，该属性或类必须是静态设置的，即 `class="within"`。
`select` 选择器无法识别 `[class.within]="isWithin()"` 这样的动态绑定。

:::

如果你同时包含了一个或多个带 `select` 属性的 `<ng-content>` 占位符，以及
一个不带 `select` 属性的 `<ng-content>` 占位符，那么后者会捕获所有
未匹配任何 `select` 属性的元素：

```html
<!-- 组件模板 -->
<div class="card-shadow">
  <ng-content select="card-title" />
  <div class="card-divider"></div>
  <!-- 捕获除 "card-title" 以外的所有内容 -->
  <ng-content />
</div>
```

```html
<!-- 使用该组件 -->
<custom-card>
  <card-title>Hello</card-title>
  <img src="..." />
  <p>Welcome to the example</p>
</custom-card>
```

```html
<!-- 渲染出的 DOM -->
<custom-card>
  <div class="card-shadow">
    <card-title>Hello</card-title>
    <div class="card-divider"></div>
    <img src="..." />
    <p>Welcome to the example</p>
  </div>
</custom-card>
```

如果组件中没有不带 `select` 属性的 `<ng-content>` 占位符，那么任何
未匹配该组件某个占位符的元素都不会渲染到 DOM 中。

## 后备内容

如果组件没有任何匹配的子内容，Angular 可以为该组件的 `<ng-content>` 占位符显示*后备内容*。你可以通过向 `<ng-content>` 元素本身添加子内容来指定后备内容。

```html
<!-- 组件模板 -->
<div class="card-shadow">
  <ng-content select="card-title">Default Title</ng-content>
  <div class="card-divider"></div>
  <ng-content select="card-body">Default Body</ng-content>
</div>
```

```html
<!-- 使用该组件 -->
<custom-card>
  <card-title>Hello</card-title>
  <!-- 未提供 card-body -->
</custom-card>
```

```html
<!-- 渲染出的 DOM -->
<custom-card>
  <div class="card-shadow">
    <card-title>Hello</card-title>
    <div class="card-divider"></div>
    Default Body
  </div>
</custom-card>
```

## 为投影内容起别名

Angular 支持一个特殊属性 `ngProjectAs`，它允许你在任意元素上指定一个 CSS 选择器。
每当带有 `ngProjectAs` 的元素与某个 `<ng-content>` 占位符进行匹配时，
Angular 都会使用 `ngProjectAs` 的值进行比较，而不是元素本身的标识：

```html
<!-- 组件模板 -->
<div class="card-shadow">
  <ng-content select="card-title" />
  <div class="card-divider"></div>
  <ng-content />
</div>
```

```html
<!-- 使用该组件 -->
<custom-card>
  <h3 ngProjectAs="card-title">Hello</h3>

  <p>Welcome to the example</p>
</custom-card>
```

```html
<!-- 渲染出的 DOM -->
<custom-card>
  <div class="card-shadow">
    <h3>Hello</h3>
    <div class="card-divider"></div>
    <p>Welcome to the example</p>
  </div>
</custom-card>
```

`ngProjectAs` 只支持静态值，不能绑定到动态表达式。

## 注意事项

### 投影的内容属于父组件的视图

虽然投影的内容是在接收它的组件内部*渲染*的，但它仍然归声明它的那个组件所有。Angular 会把它当作父组件视图的一部分来跟踪，这会带来几个值得了解的副作用。

**变更检测（Change Detection）：** 投影的内容会在*父组件*运行变更检测时被检查。如果接收内容的组件使用了 `OnPush`，Angular 可以跳过对该组件自身模板的检查——但不会跳过投影的内容，因为那部分内容属于父组件。

```html
<!-- 父组件模板（默认变更检测） -->
<onpush-wrapper>
  <!-- 每次父组件变更检测时仍会被检查，OnPush 在这里帮不上忙 -->
  <expensive-component />
</onpush-wrapper>
```

**依赖注入（Dependency Injection）：** 投影的内容从父组件的注入器（Injector）获取依赖，而不是从接收内容的组件的 `viewProviders` 获取。详情请参阅[提供者和 viewProviders](/guide/di/hierarchical-dependency-injection)。

### 某些库组件不支持投影的子元素

某些组件（如菜单、标签页、列表）会使用 `ContentChildren` 查找它们的子元素，并为其接入键盘导航、焦点管理或 ARIA 属性等行为。这些组件在编写时假设自己直接拥有这些子元素，因此把外部内容投影进去，往往会以一些不易察觉的方式破坏功能。

例如，把 `<mat-menu-item>` 元素再包裹一层，然后投影到 `<mat-menu>` 中，可能会在没有任何提示的情况下破坏键盘导航和屏幕阅读器支持。查询（Query）仍然能找到这些菜单项，但当它们来自不同的视图上下文时，让它们可交互的内部设置可能无法正常工作。

如果某个库组件负责管理其子元素的行为，在使用内容投影（Content Projection）之前请先查阅它的文档——它可能并不支持这种用法。
