# 控制流 {#control-flow}

Angular 模板（Template）支持控制流（Control Flow）块，可以用来有条件地显示、隐藏和重复元素。

## 使用 `@if`、`@else if` 和 `@else` 有条件地显示内容 {#conditionally-display-content-with-if-else-if-and-else}

当条件表达式为真值（truthy）时，`@if` 块会显示其中的内容：

```html
@if (a > b) {
  <p>{{ a }} is greater than {{ b }}</p>
}
```

如果要显示备选内容，可以提供任意数量的 `@else if` 块和一个 `@else` 块。

```html
@if (a > b) {
  {{ a }} is greater than {{ b }}
} @else if (b > a) {
  {{ a }} is less than {{ b }}
} @else {
  {{ a }} is equal to {{ b }}
}
```

### 引用条件表达式的结果 {#referencing-the-conditional-expression-s-result}

`@if` 条件支持把条件表达式的结果保存到一个变量中，以便在块内复用。

```html
@if (user.profile.settings.startDate; as startDate) {
  {{ startDate }}
}
```

对于较长的表达式，这种写法可以让模板更易读、更易维护。

## 使用 `@for` 块重复内容 {#repeat-content-with-the-for-block}

`@for` 块会遍历一个集合，并重复渲染块中的内容。集合可以是任何 JavaScript [可迭代对象（iterable）](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols)，不过 Angular 对 `Array` 值做了额外的性能优化。

一个典型的 `@for` 循环如下：

```html
@for (item of items; track item.id) {
  {{ item.name }}
}
```

Angular 的 `@for` 块不支持 JavaScript 中 `continue` 或 `break` 这类改变流程的语句。

### 为什么 `@for` 块中的 `track` 很重要？ {#why-is-track-in-for-blocks-important}

`track` 表达式让 Angular 能够维护数据与页面上 DOM 节点之间的对应关系。这样，当数据变化时，Angular 只需执行最少的必要 DOM 操作，从而优化性能。

在遍历数据集合时，合理使用 track 可以显著提升应用的渲染性能。

请在 `track` 表达式中选择一个能唯一标识每个条目的属性。如果你的数据模型中有唯一标识属性（通常是 `id` 或 `uuid`），就使用它。如果数据中没有这样的字段，强烈建议加上一个。

对于永远不会变化的静态集合，可以使用 `$index`，让 Angular 按照每个条目在集合中的索引进行跟踪。

如果没有其他选择，可以把条目本身用作跟踪键。这会让 Angular 使用全等运算符（`===`）按引用标识来跟踪条目。请尽量避免这种做法，因为 Angular 无法判断哪个数据条目对应哪些 DOM 节点，渲染更新可能会明显变慢。

```html
@for (item of items; track item) {
  {{ item.name }}
}
```

::: info 注意
与 `*ngFor` 不同，`@for` 块优先复用视图。如果被跟踪的属性发生变化，但对象引用保持不变，Angular 会更新视图的绑定（包括组件输入），而不是销毁并重新创建整个元素。

:::

### `@for` 块中的上下文变量 {#contextual-variables-in-for-blocks}

在 `@for` 块内部，始终可以使用以下几个隐式变量：

| 变量     | 含义                                          |
| -------- | --------------------------------------------- |
| `$count` | 被遍历集合中的条目数量                        |
| `$index` | 当前行的索引                                  |
| `$first` | 当前行是否为第一行                            |
| `$last`  | 当前行是否为最后一行                          |
| `$even`  | 当前行的索引是否为偶数                        |
| `$odd`   | 当前行的索引是否为奇数                        |

这些变量始终以上述名称提供，但也可以通过 `let` 片段为它们起别名：

```html
@for (item of items; track item.id; let idx = $index, e = $even) {
  <p>Item #{{ idx }}: {{ item.name }}</p>
}
```

在嵌套 `@for` 块时，别名很有用，可以让你在内层 `@for` 块中读取外层 `@for` 块的变量。

### 使用 `@empty` 块为 `@for` 块提供后备内容 {#providing-a-fallback-for-for-blocks-with-the-empty-block}

你可以选择在 `@for` 块内容之后紧接着加上一个 `@empty` 部分。当没有任何条目时，会显示 `@empty` 块的内容：

```html
@for (item of items; track item.name) {
  <li>{{ item.name }}</li>
} @empty {
  <li>There are no items.</li>
}
```

## 使用 `@switch` 块有条件地显示内容 {#conditionally-display-content-with-the-switch-block}

虽然 `@if` 块适用于大多数场景，但 `@switch` 块提供了另一种有条件渲染数据的语法。它的语法与 JavaScript 的 `switch` 语句非常相似。

```html
@switch (userPermissions) {
  @case ('admin') {
    <app-admin-dashboard />
  }
  @case ('reviewer')
  @case ('editor') {
    <app-editor-dashboard />
  }
  @default {
    <app-viewer-dashboard />
  }
}
```

条件表达式的值会使用全等（`===`）运算符与 case 表达式进行比较。

**`@switch` 没有贯穿（fallthrough）行为**，因此不需要在块中使用类似 `break` 或 `return` 的语句。

可以通过连续书写多个 `@case` 语句，为同一个块指定多个条件。

你可以选择加上一个 `@default` 块。如果前面所有 case 表达式都不匹配 switch 的值，就会显示 `@default` 块的内容。

如果没有任何 `@case` 与表达式匹配，并且也没有 `@default` 块，则什么都不会显示。

### 穷尽性类型检查 {#exhaustive-type-checking}

`@switch` 支持穷尽性类型检查（exhaustive type checking），让 Angular 能在编译时验证联合类型的所有可能取值都已被处理。

使用 `@default never;` 可以显式声明不应再有剩余的情况。如果之后扩展了联合类型，而新的情况没有被某个 @case 覆盖，Angular 的模板类型检查器就会报错，帮你尽早发现遗漏的分支。

::: info 注意
穷尽性检查依赖 TypeScript 的类型收窄，而类型收窄只对变量有效。如果 switch 条件是函数调用或信号（Signal）（例如 `@switch (state())`），检查就不会生效。解决方法是把信号赋值给一个 `@let` 变量，例如：`@let mySignal = this.mySignal()`。

:::

```ts
@Component({
  template: `
    @switch (state) {
      @case ('loggedOut') {
        <button>Login</button>
      }

      @case ('loggedIn') {
        <p>Welcome back!</p>
      }

      @default never;
      <!-- 会报错，因为缺少 @case ('loading') -->
    }
  `,
})
export class AppComponent {
  state: 'loggedOut' | 'loading' | 'loggedIn' = 'loggedOut';
}
```

当被 switch 的表达式嵌套在联合类型中时，必须显式指定要检查穷尽性的表达式。

<!-- prettier-ignore -->
```ts
@Component({
  template: `
    @switch (state.mode) {
      @case ('show') {
        {{ state.menu }};
      }
      @case ('hide') {}
      @default never(state);
    }
  `,
})
export class App {
  state!: {mode: 'hide'} | {mode: 'show'; menu: number};
}
```
