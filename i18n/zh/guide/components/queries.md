# 用查询引用组件的子元素

::: tip 提示
本指南假定你已经读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

组件（Component）可以定义**查询**（Query），用来查找子元素并从它们的注入器（Injector）中读取值。

开发者最常使用查询来获取对子组件、指令（Directive）、DOM 元素等的引用。

所有查询函数都返回信号（Signal），这些信号反映了最新的结果。你可以
通过调用信号函数来读取结果，包括在 `computed` 和 `effect` 等[响应式上下文](/guide/signals#reactive-contexts)中。

查询分为两类：**视图查询**（view query）和**内容查询**（content query）。

## 视图查询

视图查询从组件**视图**中的元素（即组件自身模板（Template）中定义的元素）获取结果。你可以使用 `viewChild` 函数查询单个结果。

```ts
@Component({
  selector: 'custom-card-header',
  /*...*/
})
export class CustomCardHeader {
  text: string;
}

@Component({
  selector: 'custom-card',
  template: '<custom-card-header>Visit sunny California!</custom-card-header>',
})
export class CustomCard {
  header = viewChild(CustomCardHeader);
  headerText = computed(() => this.header()?.text);
}
```

在这个例子中，`CustomCard` 组件查询子组件 `CustomCardHeader`，并在 `computed` 中使用其结果。

如果查询找不到结果，它的值就是 `undefined`。当目标元素被 `@if` 隐藏时就可能出现这种情况。随着应用状态的变化，Angular 会让 `viewChild` 的结果保持最新。

你也可以使用 `viewChildren` 函数查询多个结果。

```ts
@Component({
  selector: 'custom-card-action',
  /*...*/
})
export class CustomCardAction {
  text: string;
}

@Component({
  selector: 'custom-card',
  template: `
    <custom-card-action>Save</custom-card-action>
    <custom-card-action>Cancel</custom-card-action>
  `,
})
export class CustomCard {
  actions = viewChildren(CustomCardAction);
  actionsTexts = computed(() => this.actions().map((action) => action.text));
}
```

`viewChildren` 会创建一个信号，其值是包含查询结果的 `Array`。

**查询永远不会穿透组件边界**。视图查询只能从组件的模板中获取结果。

## 内容查询

内容查询从组件**内容**中的元素（即在使用该组件的模板中，嵌套在组件内部的元素）获取结果。你可以使用 `contentChild` 函数查询单个结果。

```ts
@Component({
  selector: 'custom-toggle',
  /*...*/
})
export class CustomToggle {
  text: string;
}

@Component({
  selector: 'custom-expando',
  /* ... */
})
export class CustomExpando {
  toggle = contentChild(CustomToggle);
  toggleText = computed(() => this.toggle()?.text);
}

@Component({
  /* ... */
  // CustomToggle 作为内容在 CustomExpando 内部使用。
  template: `
    <custom-expando>
      <custom-toggle>Show</custom-toggle>
    </custom-expando>
  `,
})
export class UserProfile {}
```

如果查询找不到结果，它的值就是 `undefined`。当目标元素不存在或被 `@if` 隐藏时就可能出现这种情况。随着应用状态的变化，Angular 会让 `contentChild` 的结果保持最新。

默认情况下，`contentChild` 查询会深入后代元素，而 `contentChildren` 查询只查找**直接**子元素。参见[内容后代](#content-descendants)。

你也可以使用 `contentChildren` 函数查询多个结果。

```ts
@Component({
  selector: 'custom-menu-item',
  /*...*/
})
export class CustomMenuItem {
  text: string;
}

@Component({
  selector: 'custom-menu',
  /*...*/
})
export class CustomMenu {
  items = contentChildren(CustomMenuItem);
  itemTexts = computed(() => this.items().map((item) => item.text));
}

@Component({
  selector: 'user-profile',
  template: `
    <custom-menu>
      <custom-menu-item>Cheese</custom-menu-item>
      <custom-menu-item>Tomato</custom-menu-item>
    </custom-menu>
  `,
})
export class UserProfile {}
```

`contentChildren` 会创建一个信号，其值是包含查询结果的 `Array`。

**查询永远不会穿透组件边界**。内容查询只能从组件自身所在的同一个模板中获取结果。

## 必需查询

如果子级查询（`viewChild` 或 `contentChild`）找不到结果，它的值就是 `undefined`。当目标元素被 `@if` 或 `@for` 之类的控制流（control flow）语句隐藏时，就可能出现这种情况。因此，子级查询返回的信号的值类型中包含 `undefined`。

在某些情况下（尤其是使用 `viewChild` 时），你可以确定某个特定的子元素始终可用。在另一些情况下，你可能希望严格要求某个特定的子元素必须存在。对于这些情况，你可以使用**必需查询**。

```ts
@Component(/* ... */)
export class CustomCard {
  header = viewChild.required(CustomCardHeader);
  body = contentChild.required(CustomCardBody);
}
```

如果必需查询找不到匹配的结果，Angular 会报错。由于这保证了结果一定可用，必需查询不会自动在信号的值类型中包含 `undefined`。

## 查询定位器

每个查询装饰器的第一个参数是它的**定位器**（locator）。

大多数情况下，你会使用组件或指令作为定位器。

你也可以指定一个字符串定位器，它对应于
一个[模板引用变量](/guide/templates/variables#template-reference-variables)。

```ts
@Component({
  /*...*/
  template: `
    <button #save>Save</button>
    <button #cancel>Cancel</button>
  `,
})
export class ActionBar {
  saveButton = viewChild<ElementRef<HTMLButtonElement>>('save');
}
```

如果有多个元素定义了相同的模板引用变量，查询会获取第一个匹配的元素。

Angular 不支持把 CSS 选择器（selector）用作查询定位器。

### 查询与注入器树

::: tip 提示
关于提供者（Provider）和 Angular 注入树的背景知识，请参阅[依赖注入（Dependency Injection）](/guide/di)。

:::

对于更高级的情况，你可以使用任意 `ProviderToken` 作为定位器。这让你可以根据组件和指令的提供者来定位元素。

```ts
const SUB_ITEM = new InjectionToken<string>('sub-item');

@Component({
  /*...*/
  providers: [{provide: SUB_ITEM, useValue: 'special-item'}],
})
export class SpecialItem {}

@Component(/* ... */)
export class CustomList {
  subItemType = contentChild(SUB_ITEM);
}
```

上面的例子使用 `InjectionToken` 作为定位器，但你可以使用任意 `ProviderToken` 来定位特定元素。

## 查询选项

所有查询函数都接受一个选项对象作为第二个参数。这些选项控制查询如何查找结果。

### 从元素的注入器中读取特定值

默认情况下，查询定位器既指明了你要搜索的元素，也指明了要获取的值。你也可以指定 `read` 选项，从定位器所匹配的元素中获取另一个值。

```ts
@Component(/* ... */)
export class CustomExpando {
  toggle = contentChild(ExpandoContent, {read: TemplateRef});
}
```

上面的例子定位了带有 `ExpandoContent` 指令的元素，并获取
与该元素关联的 `TemplateRef`。

开发者最常使用 `read` 来获取 `ElementRef` 和 `TemplateRef`。

你也可以把 `Injector` 传给 `read`。

```ts
@Component({
  selector: 'custom-table',
  template: `
    <third-party-table #inner>
      <ng-template>
        <ng-container [ngTemplateOutlet]="columns()" [ngTemplateOutletInjector]="innerInjector()" />
      </ng-template>
    </third-party-table>
  `,
})
export class CustomTable {
  columns = contentChild(TemplateRef);
  innerInjector = viewChild('inner', {read: Injector});
}
```

上面的例子获取了 `third-party-table` 元素的节点注入器，也就是从该元素在树中的位置
所看到的注入器。通过 `ngTemplateOutletInjector` 把它传给 `NgTemplateOutlet`，
可以让投影模板中的指令注入该
第三方组件所提供的值。

### 内容后代

默认情况下，`contentChildren` 查询只查找组件的**直接**子元素，不会深入后代元素。
`contentChild` 查询默认会深入后代元素。

```ts
@Component({
  selector: 'custom-expando',
  /*...*/
})
export class CustomExpando {
  toggle = contentChildren(CustomToggle); // 找不到
  // toggle = contentChild(CustomToggle); // 能找到
}

@Component({
  selector: 'user-profile',
  template: `
    <custom-expando>
      <some-other-component>
        <custom-toggle>Show</custom-toggle>
      </some-other-component>
    </custom-expando>
  `,
})
export class UserProfile {}
```

在上面的例子中，`CustomExpando` 无法用 `contentChildren` 找到 `<custom-toggle>`，因为它不是 `<custom-expando>` 的直接子元素。通过设置 `descendants: true`，你可以让查询遍历同一模板中的所有后代元素。不过，查询**永远不会**穿透到组件内部去遍历其他模板中的元素。

视图查询没有这个选项，因为它们**总是**会深入后代元素。

## 基于装饰器的查询

::: tip 提示
虽然 Angular 团队建议新项目使用基于信号的查询函数，但原有的
基于装饰器的查询 API 仍然受到完全支持。

:::

你也可以给属性添加相应的装饰器来声明查询。除了下文所述的差异之外，基于装饰器的查询与基于信号的查询行为相同。

### 视图查询 {#decorator-view-queries}

你可以使用 `@ViewChild` 装饰器查询单个结果。

```ts
@Component({
  selector: 'custom-card-header',
  /*...*/
})
export class CustomCardHeader {
  text: string;
}

@Component({
  selector: 'custom-card',
  template: '<custom-card-header>Visit sunny California!</custom-card-header>',
})
export class CustomCard implements AfterViewInit {
  @ViewChild(CustomCardHeader) header: CustomCardHeader;

  ngAfterViewInit() {
    console.log(this.header.text);
  }
}
```

在这个例子中，`CustomCard` 组件查询子组件 `CustomCardHeader`，并在 `ngAfterViewInit` 中访问其结果。

随着应用状态的变化，Angular 会让 `@ViewChild` 的结果保持最新。

**视图查询的结果在 `ngAfterViewInit` 生命周期方法中才可用**。在此之前，其值为 `undefined`。关于组件生命周期的详细信息，请参阅[生命周期](/guide/components/lifecycle)一节。

你也可以使用 `@ViewChildren` 装饰器查询多个结果。

```ts
@Component({
  selector: 'custom-card-action',
  /*...*/
})
export class CustomCardAction {
  text: string;
}

@Component({
  selector: 'custom-card',
  template: `
    <custom-card-action>Save</custom-card-action>
    <custom-card-action>Cancel</custom-card-action>
  `,
})
export class CustomCard implements AfterViewInit {
  @ViewChildren(CustomCardAction) actions: QueryList<CustomCardAction>;

  ngAfterViewInit() {
    this.actions.forEach((action) => {
      console.log(action.text);
    });
  }
}
```

`@ViewChildren` 会创建一个包含查询结果的 `QueryList` 对象。你可以通过 `changes` 属性订阅查询结果随时间发生的变化。

### 内容查询 {#decorator-content-queries}

你可以使用 `@ContentChild` 装饰器查询单个结果。

```ts
@Component({
  selector: 'custom-toggle',
  /*...*/
})
export class CustomToggle {
  text: string;
}

@Component({
  selector: 'custom-expando',
  /*...*/
})
export class CustomExpando implements AfterContentInit {
  @ContentChild(CustomToggle) toggle: CustomToggle;

  ngAfterContentInit() {
    console.log(this.toggle.text);
  }
}

@Component({
  selector: 'user-profile',
  template: `
    <custom-expando>
      <custom-toggle>Show</custom-toggle>
    </custom-expando>
  `,
})
export class UserProfile {}
```

在这个例子中，`CustomExpando` 组件查询子组件 `CustomToggle`，并在 `ngAfterContentInit` 中访问其结果。

随着应用状态的变化，Angular 会让 `@ContentChild` 的结果保持最新。

**内容查询的结果在 `ngAfterContentInit` 生命周期方法中才可用**。在此之前，其值为 `undefined`。关于组件生命周期的详细信息，请参阅[生命周期](/guide/components/lifecycle)一节。

你也可以使用 `@ContentChildren` 装饰器查询多个结果。

```ts
@Component({
  selector: 'custom-menu-item',
  /*...*/
})
export class CustomMenuItem {
  text: string;
}

@Component({
  selector: 'custom-menu',
  /*...*/
})
export class CustomMenu implements AfterContentInit {
  @ContentChildren(CustomMenuItem) items: QueryList<CustomMenuItem>;

  ngAfterContentInit() {
    this.items.forEach((item) => {
      console.log(item.text);
    });
  }
}

@Component({
  selector: 'user-profile',
  template: `
    <custom-menu>
      <custom-menu-item>Cheese</custom-menu-item>
      <custom-menu-item>Tomato</custom-menu-item>
    </custom-menu>
  `,
})
export class UserProfile {}
```

`@ContentChildren` 会创建一个包含查询结果的 `QueryList` 对象。你可以通过 `changes` 属性订阅查询结果随时间发生的变化。

### 基于装饰器的查询选项

所有查询装饰器都接受一个选项对象作为第二个参数。除了下文所述的差异之外，这些选项的工作方式与基于信号的查询相同。

### 静态查询

`@ViewChild` 和 `@ContentChild` 装饰器接受 `static` 选项。

```ts
@Component({
  selector: 'custom-card',
  template: '<custom-card-header>Visit sunny California!</custom-card-header>',
})
export class CustomCard implements OnInit {
  @ViewChild(CustomCardHeader, {static: true}) header: CustomCardHeader;

  ngOnInit() {
    console.log(this.header.text);
  }
}
```

通过设置 `static: true`，你向 Angular 保证该查询的目标**始终**存在，不会被有条件地渲染。这样就能更早地拿到结果，即在 `ngOnInit` 生命周期方法中。

静态查询的结果在初始化之后不会再更新。

`static` 选项不适用于 `@ViewChildren` 和 `@ContentChildren` 查询。

### 使用 QueryList

`@ViewChildren` 和 `@ContentChildren` 都会提供一个包含结果列表的 `QueryList` 对象。

`QueryList` 提供了许多便捷 API，让你可以像操作数组一样处理结果，例如 `map`、`reduce` 和 `forEach`。你可以调用 `toArray` 获取当前结果组成的数组。

你可以订阅 `changes` 属性，以便在结果每次发生变化时执行某些操作。

## 常见的查询陷阱

使用查询时，一些常见的陷阱会让代码更难理解和维护。

对于在多个组件之间共享的状态，始终只保留单一的事实来源。这可以避免不同组件中重复的状态变得不同步。

避免直接向子组件写入状态。这种模式可能导致代码脆弱、难以理解，并且容易出现 [ExpressionChangedAfterItHasBeenChecked](/errors/NG0100) 错误。

永远不要直接向父组件或祖先组件写入状态。这种模式可能导致代码脆弱、难以理解，并且容易出现 [ExpressionChangedAfterItHasBeenChecked](/errors/NG0100) 错误。
