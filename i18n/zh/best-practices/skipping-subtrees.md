# 跳过组件子树

默认情况下，JavaScript 使用的是可变数据结构，多个不同的组件可以引用同一个数据结构。Angular 会在整个组件树上运行变更检测（Change Detection），以确保 DOM 中反映的是数据结构的最新状态。

对大多数应用来说，变更检测已经足够快了。但是，当应用的组件树特别庞大时，在整个应用上运行变更检测可能会引发性能问题。你可以通过配置变更检测，让它只在组件树的一部分上运行来解决这个问题。

## 使用 `OnPush`

OnPush 是 Angular 的默认变更检测策略（从 v22 开始）。它让 Angular **只**在以下情况下对组件子树运行变更检测：

- 子树的根组件因模板绑定而收到新的输入。Angular 使用 `Object.is` 比较输入的当前值和之前的值。
- Angular 在子树的根组件或它的任何子组件中处理了某个事件 _（例如通过事件绑定、输出绑定或 `@HostListener`）_，无论这些组件是否使用 OnPush 变更检测。
- 子树中的某个组件被标记为需要检查，例如通过 `ChangeDetectorRef.markForCheck` 或 `AsyncPipe`。
- 子树中某个组件的模板读取的信号（Signal）发生了变化。此时 Angular 只会刷新读取了该信号的组件。

## 常见的变更检测场景

本节通过几个常见的变更检测场景来说明 Angular 的行为。

### 由使用 `Eager` 变更检测的组件处理事件

如果 Angular 在使用 `Eager` 策略的组件中处理了事件，框架会在整个组件树上执行变更检测。对于以使用 `OnPush` 的组件为根、并且没有收到新输入的后代组件子树，Angular 会跳过它们。

例如，如果我们把 `MainComponent` 的变更检测策略设为 `OnPush`，而用户与以 `MainComponent` 为根的子树之外的组件进行交互，那么 Angular 会检查下图中所有粉色的组件（`AppComponent`、`HeaderComponent`、`SearchComponent`、`ButtonComponent`），除非 `MainComponent` 收到了新的输入：

```txt
graph TD;
    app[AppComponent] --- header[HeaderComponent];
    app --- main["MainComponent (OnPush)"];
    header --- search[SearchComponent];
    header --- button[ButtonComponent];
    main --- login["LoginComponent (OnPush)"];
    main --- details[DetailsComponent];
    event>Event] --- search

class app checkedNode
class header checkedNode
class button checkedNode
class search checkedNode
class event eventNode
```

## 由使用 OnPush 的组件处理事件

如果 Angular 在使用 OnPush 策略的组件中处理了事件，框架会在整个组件树上执行变更检测。对于以使用 OnPush 的组件为根、没有收到新输入、并且位于处理该事件的组件之外的组件子树，Angular 会忽略它们。

例如，如果 Angular 在 `MainComponent` 中处理了一个事件，框架会在整个组件树上运行变更检测。Angular 会忽略以 `LoginComponent` 为根的子树，因为它使用了 `OnPush`，而且事件发生在它的范围之外。

```txt
graph TD;
    app[AppComponent] --- header[HeaderComponent];
    app --- main["MainComponent (OnPush)"];
    header --- search[SearchComponent];
    header --- button[ButtonComponent];
    main --- login["LoginComponent (OnPush)"];
    main --- details[DetailsComponent];
    event>Event] --- main

class app checkedNode
class header checkedNode
class button checkedNode
class search checkedNode
class main checkedNode
class details checkedNode
class event eventNode
```

## 由使用 OnPush 的组件的后代处理事件

如果 Angular 在使用 OnPush 的组件中处理了事件，框架会在整个组件树上执行变更检测，包括该组件的祖先组件。

例如，在下图中，Angular 在使用 OnPush 的 `LoginComponent` 中处理了一个事件。Angular 会在整个组件子树上调用变更检测，包括 `MainComponent`（`LoginComponent` 的父组件），即使 `MainComponent` 也使用了 `OnPush`。Angular 之所以也会检查 `MainComponent`，是因为 `LoginComponent` 是它视图的一部分。

```txt
graph TD;
    app[AppComponent] --- header[HeaderComponent];
    app --- main["MainComponent (OnPush)"];
    header --- search[SearchComponent];
    header --- button[ButtonComponent];
    main --- login["LoginComponent (OnPush)"];
    main --- details[DetailsComponent];
    event>Event] --- login

class app checkedNode
class header checkedNode
class button checkedNode
class search checkedNode
class login checkedNode
class main checkedNode
class details checkedNode
class event eventNode
```

## 使用 OnPush 的组件收到新输入

当模板绑定设置了输入属性时，Angular 会在使用 `OnPush` 的子组件中运行变更检测。

例如，在下图中，`AppComponent` 向使用 `OnPush` 的 `MainComponent` 传入了一个新输入。Angular 会在 `MainComponent` 中运行变更检测，但不会在同样使用 `OnPush` 的 `LoginComponent` 中运行变更检测，除非它也收到了新的输入。

```txt
graph TD;
    app[AppComponent] --- header[HeaderComponent];
    app --- main["MainComponent (OnPush)"];
    header --- search[SearchComponent];
    header --- button[ButtonComponent];
    main --- login["LoginComponent (OnPush)"];
    main --- details[DetailsComponent];
    event>Parent passes new input to MainComponent]

class app checkedNode
class header checkedNode
class button checkedNode
class search checkedNode
class main checkedNode
class details checkedNode
class event eventNode
```

## 边界情况

- **在 TypeScript 代码中修改输入属性**。当你使用 `@ViewChild` 或 `@ContentChild` 之类的 API 在 TypeScript 中获取某个组件的引用，并手动修改它的 `@Input` 属性时，Angular 不会自动为 OnPush 组件运行变更检测。如果你需要 Angular 运行变更检测，可以在组件中注入 `ChangeDetectorRef`，并调用 `changeDetectorRef.markForCheck()`，告诉 Angular 调度一次变更检测。
- **修改对象引用**。如果某个输入收到的值是一个可变对象，而你修改了这个对象但保持引用不变，Angular 不会调用变更检测。这是预期的行为，因为输入的之前的值和当前的值指向的是同一个引用。
