# 指令组合 API {#directive-composition-api}

Angular 指令（Directive）是封装可复用行为的好方式。指令可以为元素应用属性、CSS 类和事件监听器（Event Listener）。

*指令组合 API* 让你可以在组件（Component）的 TypeScript 类*内部*，把指令应用到该组件的宿主元素（Host Element）上。

## 向组件添加指令 {#adding-directives-to-a-component}

要把指令应用到组件上，请在组件的装饰器中添加 `hostDirectives` 属性。这类指令被称为*宿主指令*（Host Directive）。

在这个例子中，`MenuBehavior` 指令被应用到 `AdminMenu` 的宿主元素上。这与在模板（Template）中把 `MenuBehavior` 应用到 `<admin-menu>` 元素上的效果类似。

```ts
@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.html',
  hostDirectives: [MenuBehavior],
})
export class AdminMenu {}
```

框架渲染组件时，Angular 还会为每个宿主指令创建一个实例。这些指令的宿主绑定（Host Binding）会应用到组件的宿主元素上。默认情况下，宿主指令的输入（Input）和输出（Output）不会作为组件公共 API 的一部分对外暴露。更多信息请参阅下文的[包含输入和输出](#including-inputs-and-outputs)。

宿主指令有以下限制：

- **Angular 在编译期静态地应用宿主指令。** 你无法在运行时动态添加
  指令。
- **在 `hostDirectives` 中使用的指令不能指定 `standalone: false`。**
- **对于在 `hostDirectives` 属性中应用的指令，Angular 会忽略它们的 `selector`。**

## 包含输入和输出 {#including-inputs-and-outputs}

当你为组件应用 `hostDirectives` 时，默认情况下宿主指令的输入和输出不会包含在组件的 API 中。你可以展开 `hostDirectives` 中的条目，显式地把输入和输出包含到组件的 API 中：

```ts
@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.html',
  hostDirectives: [
    {
      directive: MenuBehavior,
      inputs: ['menuId'],
      outputs: ['menuClosed'],
    },
  ],
})
export class AdminMenu {}
```

通过显式指定输入和输出，带有 `hostDirectives` 的组件的使用者就可以在模板中绑定它们：

```html
<admin-menu menuId="top-menu" (menuClosed)="logMenuClosed()"></admin-menu>
```

此外，你还可以为宿主指令的输入和输出设置别名，以定制组件的 API：

```ts
@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.html',
  hostDirectives: [
    {
      directive: MenuBehavior,
      inputs: ['menuId: id'],
      outputs: ['menuClosed: closed'],
    },
  ],
})
export class AdminMenu {}
```

```html
<admin-menu id="top-menu" (closed)="logMenuClosed()"></admin-menu>
```

## 向其他指令添加指令 {#adding-directives-to-another-directive}

除了组件之外，你也可以为其他指令添加 `hostDirectives`。这样就能以传递的方式聚合多种行为。

下面的例子定义了两个指令 `Menu` 和 `Tooltip`，然后在 `MenuWithTooltip` 中组合它们的行为。最后，再把 `MenuWithTooltip` 应用到 `SpecializedMenuWithTooltip` 上。

当在模板中使用 `SpecializedMenuWithTooltip` 时，它会创建 `Menu`、`Tooltip` 和 `MenuWithTooltip` 的全部实例。这些指令各自的宿主绑定都会应用到 `SpecializedMenuWithTooltip` 的宿主元素上。

```ts
@Directive({/* ... */})
export class Menu {}

@Directive({/* ... */})
export class Tooltip {}

// MenuWithTooltip 可以组合来自多个其他指令的行为
@Directive({
  hostDirectives: [Tooltip, Menu],
})
export class MenuWithTooltip {}

// CustomWidget 可以应用 MenuWithTooltip 中已经组合好的行为
@Directive({
  hostDirectives: [MenuWithTooltip],
})
export class SpecializedMenuWithTooltip {}
```

## 宿主指令的语义 {#host-directive-semantics}

### 指令的执行顺序 {#directive-execution-order}

宿主指令与直接在模板中使用的组件和指令经历相同的生命周期。不过，宿主指令总是*先于*它所应用到的组件或指令执行其构造函数、生命周期钩子（Lifecycle Hook）和绑定。

下面的例子展示了宿主指令的最简用法：

```ts
@Component({
  selector: 'admin-menu',
  templateUrl: './admin-menu.html',
  hostDirectives: [MenuBehavior],
})
export class AdminMenu {}
```

这里的执行顺序是：

1. `MenuBehavior` 被实例化
2. `AdminMenu` 被实例化
3. `MenuBehavior` 接收输入（`ngOnInit`）
4. `AdminMenu` 接收输入（`ngOnInit`）
5. `MenuBehavior` 应用宿主绑定
6. `AdminMenu` 应用宿主绑定

这种执行顺序意味着，带有 `hostDirectives` 的组件可以覆盖宿主指令所指定的任何宿主绑定。

这种执行顺序同样适用于嵌套的宿主指令链，如下例所示。

```ts
@Directive({...})
export class Tooltip { }

@Directive({
  hostDirectives: [Tooltip],
})
export class CustomTooltip { }

@Directive({
  hostDirectives: [CustomTooltip],
})
export class EvenMoreCustomTooltip { }
```

在上面的例子中，执行顺序是：

1. `Tooltip` 被实例化
2. `CustomTooltip` 被实例化
3. `EvenMoreCustomTooltip` 被实例化
4. `Tooltip` 接收输入（`ngOnInit`）
5. `CustomTooltip` 接收输入（`ngOnInit`）
6. `EvenMoreCustomTooltip` 接收输入（`ngOnInit`）
7. `Tooltip` 应用宿主绑定
8. `CustomTooltip` 应用宿主绑定
9. `EvenMoreCustomTooltip` 应用宿主绑定

### 依赖注入 {#dependency-injection}

指定了 `hostDirectives` 的组件或指令可以注入这些宿主指令的实例，反之亦然。

为组件应用宿主指令时，组件和宿主指令都可以定义提供者（Provider）。

如果带有 `hostDirectives` 的组件或指令与这些宿主指令提供了同一个注入令牌（Injection Token），那么带有 `hostDirectives` 的类所定义的提供者，优先于宿主指令所定义的提供者。

### 宿主指令去重 {#host-directive-de-duplication}

当同一个指令在解析后的宿主指令树中出现不止一次时，它会被自动去重，而不是抛出错误。Angular 使用两条确定性的规则来决定保留哪一个匹配。

#### 模板匹配优先 {#template-match-takes-precedence}

如果一个指令既通过**模板选择器**与某个元素匹配了一次，又作为**宿主指令**出现，Angular 只会保留模板匹配，并丢弃所有宿主指令匹配。

可以这样理解：宿主指令匹配代表 `Partial<YourDirective>`，是一种部分应用，只暴露在 `hostDirectives` 中显式列出的输入和输出；而模板匹配代表完整的指令，带有其全部公共 API。

```ts
@Directive({selector: '[hoverable]'})
export class Hoverable {}

@Component({
  selector: 'app-button',
  hostDirectives: [Hoverable],
})
export class Button {}
```

```html
<!-- Hoverable 既通过选择器匹配，又作为 Button 的宿主指令匹配。 -->
<!-- Angular 只保留选择器匹配，它拥有完整的公共 API。 -->
<app-button hoverable></app-button>
```

#### 多个宿主指令匹配会被合并 {#multiple-host-directive-matches-are-merged}

如果同一个指令**作为宿主指令出现了不止一次**，例如两个指令都在各自的 `hostDirectives` 中声明了一个共同的依赖，Angular 会把所有实例合并成一个指令实例。所有实例的输入和输出映射也会被合并。

这解决了宿主指令组合中经典的[菱形问题](https://en.wikipedia.org/wiki/Multiple_inheritance#The_diamond_problem)：

```ts
// 两个触发器都需要的共享行为
@Directive({
  host: {
    '[attr.data-trigger-id]': 'triggerId()',
  },
})
export class TriggerRef {
  readonly triggerId = input(`trigger-${crypto.randomUUID()}`);
}

// 两个独立的触发器，都把 TriggerRef 声明为宿主指令
@Directive({
  selector: '[popoverTrigger]',
  hostDirectives: [TriggerRef],
})
export class PopoverTrigger {
  readonly triggerRef = inject(TriggerRef);
}

@Directive({
  selector: '[dropdownTrigger]',
  hostDirectives: [TriggerRef],
})
export class DropdownTrigger {
  readonly triggerRef = inject(TriggerRef);
}
```

```html
<!-- Angular 只保留一个 TriggerRef 实例，由两个触发器共享。 -->
<button popoverTrigger dropdownTrigger>Actions</button>
```

::: tip 提示
由于 Angular 只为共享的指令创建一个实例，`PopoverTrigger` 和 `DropdownTrigger` 在注入 `TriggerRef` 时拿到的是同一个实例。

:::

#### 别名冲突 {#conflicting-aliases}

Angular 在合并重复的宿主指令匹配时，也会合并它们的输入和输出映射。

如果同一个宿主指令的两个实例以**不同的别名暴露同一个输入或输出**，Angular 会在编译期抛出错误（[NG8024](/errors/NG8024)）。

```ts
@Directive({
  selector: '[popoverTrigger]',
  hostDirectives: [{directive: TriggerRef, inputs: ['triggerId: popoverTriggerId']}],
})
export class PopoverTrigger {}

@Directive({
  selector: '[dropdownTrigger]',
  hostDirectives: [
    {directive: TriggerRef, inputs: ['triggerId: dropdownTriggerId']}, // 别名不同！
  ],
})
export class DropdownTrigger {}
```

```html
<!-- 错误：triggerId 同时以 "popoverTriggerId" 和 "dropdownTriggerId" 暴露。 -->
<button popoverTrigger dropdownTrigger></button>
```

要解决这个问题，请确保两条路径都以相同的别名暴露这个共享的输入或输出，或者干脆都不暴露它。

## 下一步 {#what-s-next}

- [结构型指令](/guide/directives/structural-directives)
- [组件宿主元素](/guide/components/host-elements)

