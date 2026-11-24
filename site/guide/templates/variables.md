# 模板中的变量 {#variables-in-templates}

Angular 在模板（Template）中有两种变量声明：局部模板变量和模板引用变量。

::: tip 提示
在本指南中，「模板」并不是指整个 HTML 模板文件，而只是指文件中某个特定的模板结构或表达式。

:::

## 使用 `@let` 声明局部模板变量 {#local-template-variables-with-let}

Angular 的 `@let` 语法允许你定义一个局部变量并在整个模板中复用，类似于 [JavaScript 的 `let` 语法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)。

### 使用 `@let` {#using-let}

使用 `@let` 声明一个变量，其值基于某个模板表达式的结果。与[绑定（Binding）](/guide/templates/binding)类似，Angular 会自动让该变量的值与给定的表达式保持同步。

```html
@let name = user.name;
@let greeting = 'Hello, ' + name;
@let data = data$ | async;
@let pi = 3.14159;
@let coordinates = {x: 50, y: 100};
@let longExpression =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit ' +
  'sed do eiusmod tempor incididunt ut labore et dolore magna ' +
  'Ut enim ad minim veniam...';
```

每个 `@let` 块只能声明一个变量。不能在同一个块中用逗号声明多个变量。

### 引用 `@let` 的值 {#referencing-the-value-of-let}

用 `@let` 声明变量之后，就可以在同一个模板中复用它：

```html
@let user = user$ | async;

@if (user) {
  <h1>Hello, {{ user.name }}</h1>
  <user-avatar [photo]="user.photo" />

  <ul>
    @for (snack of user.favoriteSnacks; track snack.id) {
      <li>{{ snack.name }}</li>
    }
  </ul>

  <button (click)="update(user)">Update profile</button>
}
```

### 可赋值性 {#assignability}

`@let` 与 JavaScript 的 `let` 的一个关键区别是：`@let` 在声明之后不能重新赋值。不过，Angular 会自动让该变量的值与给定的表达式保持同步。

```html
@let value = 1;

<!-- 无效 - 这样写不起作用！ -->
<button (click)="value = value + 1">Increment the value</button>
```

### 变量作用域 {#variable-scope}

`@let` 声明的作用域是当前视图及其后代视图。Angular 会在组件（Component）边界处，以及模板中可能包含动态内容的地方创建新视图，例如控制流（Control Flow）块、`@defer` 块或结构型指令（Structural Directive）。

由于 `@let` 声明不会被提升，父视图或兄弟视图**无法**访问它们：

```html
@let topLevel = value;

<div>
  @let insideDiv = value;
</div>

<!-- 有效 -->
{{ topLevel }}
<!-- 有效 -->
{{ insideDiv }}

@if (condition) {
  <!-- 有效 -->
  {{ topLevel + insideDiv }}

  @let nested = value;

  @if (condition) {
    <!-- 有效 -->
    {{ topLevel + insideDiv + nested }}
  }
}

<!-- 错误，不会从 @if 中提升 -->
{{ nested }}
```

### 完整语法 {#full-syntax}

`@let` 语法的正式定义如下：

- `@let` 关键字。
- 后跟一个或多个空白字符（不包括换行符）。
- 后跟一个有效的 JavaScript 名称，以及零个或多个空白字符。
- 后跟 = 符号，以及零个或多个空白字符。
- 后跟一个 Angular 表达式，该表达式可以跨多行。
- 以 `;` 符号结尾。

## 模板引用变量 {#template-reference-variables}

模板引用变量让你可以声明一个变量，用来引用模板中某个元素上的值。

模板引用变量可以引用以下内容：

- 模板中的 DOM 元素（包括[自定义元素](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)）
- Angular 组件或指令（Directive）
- 来自 [ng-template](https://angular.dev/api/core/ng-template) 的 [TemplateRef](https://angular.dev/api/core/TemplateRef)

你可以使用模板引用变量，在同一个模板的一部分中读取另一部分的信息。

### 声明模板引用变量 {#declaring-a-template-reference-variable}

你可以在模板中的元素上添加一个以井号（`#`）开头、后跟变量名的属性，从而在该元素上声明一个变量。

```html
<!-- 创建一个名为 "taskInput" 的模板引用变量，它引用 HTMLInputElement。 -->
<input #taskInput placeholder="Enter task name" />
```

### 为模板引用变量赋值 {#assigning-values-to-template-reference-variables}

Angular 会根据声明变量的元素为模板变量（Template Variable）赋值。

如果在 Angular 组件上声明变量，该变量引用的是组件实例。

```html
<!-- `startDate` 变量被赋值为 `MyDatepicker` 的实例。 -->
<my-datepicker #startDate />
```

如果在 `<ng-template>` 元素上声明变量，该变量引用的是一个表示该模板的 TemplateRef 实例。更多信息请参阅[结构型指令](/guide/directives/structural-directives)中的 [Angular 如何使用星号 \* 语法](/guide/directives/structural-directives#structural-directive-shorthand)。

```html
<!-- `myFragment` 变量被赋值为与此模板片段对应的 `TemplateRef` 实例。 -->
<ng-template #myFragment>
  <p>This is a template fragment</p>
</ng-template>
```

如果在其他任何显示出来的元素上声明变量，该变量引用的是 `HTMLElement` 实例。

```html
<!-- "taskInput" 变量引用的是 HTMLInputElement 实例。 -->
<input #taskInput placeholder="Enter task name" />
```

#### 为 Angular 指令赋值引用 {#assigning-a-reference-to-an-angular-directive}

Angular 指令可以有一个 `exportAs` 属性，它定义了一个名称，用于在模板中引用该指令：

```ts
@Directive({
  selector: '[dropZone]',
  exportAs: 'dropZone',
})
export class DropZone {
  /* ... */
}
```

在元素上声明模板变量时，可以通过指定这个 `exportAs` 名称，把一个指令实例赋给该变量：

```html
<!-- `firstZone` 变量引用的是 `DropZone` 指令实例。 -->
<section dropZone #firstZone="dropZone">...</section>
```

不能引用没有指定 `exportAs` 名称的指令。

### 将模板引用变量与查询一起使用 {#using-template-reference-variables-with-queries}

除了使用模板变量在同一模板的另一部分读取值之外，你还可以使用这种变量声明方式来「标记」一个元素，供[组件和指令查询（Query）](/guide/components/queries)使用。

如果想查询模板中的某个特定元素，可以在该元素上声明一个模板变量，然后根据变量名查询该元素。

```html
<input #description value="Original description" />
```

```ts
@Component({
  /* ... */,
  template: `<input #description value="Original description">`,
})
export class AppComponent {
  // 根据模板变量名查询 input 元素。
  @ViewChild('description') input: ElementRef | undefined;
}
```

关于查询的更多信息，请参阅[使用查询引用子元素](/guide/components/queries)。

### 模板变量的作用域 {#template-variable-scope}

与 JavaScript 或 TypeScript 代码中的变量一样，模板变量的作用域是声明它们的模板。

同样，像 `@if` 和 `@for` 这样的[控制流块](/guide/templates/control-flow)、[结构型指令](/guide/directives/structural-directives)以及 `<ng-template>` 声明都会创建一个新的嵌套模板作用域，就像 JavaScript 中 `if` 和 `for` 这类控制流语句会创建新的词法作用域一样。在这些嵌套模板的边界之外，无法访问其中的模板变量。

::: tip 提示
在模板中只定义一次某个变量，这样它的运行时值才可预测。

:::

#### 在嵌套模板中访问 {#accessing-in-a-nested-template}

内层模板可以访问外层模板定义的模板变量。

在下面的例子中，修改 `<input>` 中的文本会改变 `<span>` 中的值，因为 Angular 会通过模板变量 `ref1` 立即更新变化。

```html
<input #ref1 type="text" [(ngModel)]="firstExample" />

@if (true) {
  <span>Value: {{ ref1.value }}</span>
}
```

在这种情况下，`@if` 块会创建一个新的模板作用域，其中包含来自父作用域的 `ref1` 变量。

但是，在父模板中访问子作用域里的模板变量是行不通的：

```html
@if (true) {
  <input #ref2 type="text" [(ngModel)]="secondExample" />
}

<span>Value: {{ ref2?.value }}</span>
```

这里，`ref2` 是在 `@if` 创建的子作用域中声明的，父模板无法访问它。
