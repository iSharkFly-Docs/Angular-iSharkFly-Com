# AOT 元数据错误 {#aot-metadata-errors}

以下是你可能遇到的元数据错误，以及相应的解释和修正建议。

## 不支持的表达式形式 {#expression-form-not-supported}

::: tip 提示
The compiler encountered an expression it didn't understand while evaluating Angular metadata.
（编译器在对 Angular 元数据求值时，遇到了一个它无法理解的表达式。）

:::

超出编译器[受限表达式语法](/tools/cli/aot-compiler)范围的语言特性
可能会产生这个错误，如下例所示：

```ts
// 错误
export class Fooish { … }
…
const prop = typeof Fooish; // typeof 在元数据中无效
  …
  // 方括号表示法在元数据中无效
  { provide: 'token', useValue: { [prop]: 'value' } };
  …
```

你可以在普通的应用代码中使用 `typeof` 和方括号表示法，
只是不能在定义 Angular 元数据的表达式中使用这些特性。

要避免这个错误，在编写 Angular 元数据时，请遵守编译器的[受限表达式语法](/tools/cli/aot-compiler)，
并警惕那些新的或不常见的 TypeScript 特性。

## 引用了局部（未导出的）符号 {#reference-to-a-local-non-exported-symbol}

::: tip 提示
Reference to a local \(non-exported\) symbol 'symbol name'. Consider exporting the symbol.
（引用了局部（未导出的）符号 'symbol name'。请考虑导出该符号。）

:::

编译器遇到了对某个局部定义符号的引用，而该符号要么没有导出，要么没有初始化。

下面是一个出现该问题的 `provider` 示例。

```ts

// 错误
let foo: number; // 既没有导出，也没有初始化

@Component({
  selector: 'my-component',
  template: … ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}

```

编译器会在一个单独的模块中生成组件工厂，其中包含 `useValue` 提供者（Provider）的代码。_那个_ 工厂模块无法反过来访问 _这个_ 源模块中的局部（未导出的）`foo` 变量。

你可以通过初始化 `foo` 来解决这个问题。

```ts
let foo = 42; // 已初始化
```

编译器会把这个表达式[折叠](/tools/cli/aot-compiler#code-folding)到提供者中，就像你写的是下面这样。

```ts
providers: [{provide: Foo, useValue: 42}];
```

或者，你也可以导出 `foo` 来解决这个问题，前提是 `foo` 会在运行时、在你真正知道它的值时被赋值。

```ts
// 已修正
export let foo: number; // 已导出

@Component({
  selector: 'my-component',
  template: … ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```

对于在 `providers` 和 `animations` 等元数据中引用的变量，添加 `export` 通常是有效的，因为编译器可以在这些表达式中生成对已导出变量的 _引用_，而不需要这些变量的 _值_。

当编译器需要 _实际值_ 才能生成代码时，
添加 `export` 就不起作用了。
例如，它对 `template` 属性就不起作用。

```ts
// 错误
export let someTemplate: string; // 已导出，但未初始化

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

编译器 _当下_ 就需要 `template` 属性的值来生成组件工厂。
仅有变量引用是不够的。
在声明前加上 `export` 只会产生一个新的错误："[`Only initialized variables and constants can be referenced`](#only-initialized-variables-and-constants)"。

## 只能引用已初始化的变量和常量 {#only-initialized-variables-and-constants}

::: tip 提示
_Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler._
（_只能引用已初始化的变量和常量，因为模板编译器需要该变量的值。_）

:::

编译器发现了对某个未初始化的已导出变量或静态字段的引用。
它需要该变量的值来生成代码。

下面的例子试图把组件的 `template` 属性设置为已导出变量 `someTemplate` 的值，而该变量已声明但 _未赋值_。

```ts
// 错误
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

如果你从其他模块导入了 `someTemplate`，却忘了在那个模块中初始化它，也会出现这个错误。

```ts
import {Component} from '@angular/core';
// 错误 - 那里也没有初始化
import {someTemplate} from './config';

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

编译器不能等到运行时才获取模板信息。
它必须从源代码中静态推导出 `someTemplate` 变量的值，才能生成组件工厂，而组件工厂中包含了根据模板构建元素的指令。

要修正这个错误，请 _在同一行_ 的初始化子句中提供该变量的初始值。

```ts
// 已修正
export let someTemplate = '<h1>Greetings from Angular</h1>';

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

## 引用了未导出的类 {#reference-to-a-non-exported-class}

::: tip 提示
_Reference to a non-exported class `<class name>`._
_Consider exporting the class._
（_引用了未导出的类 `<class name>`。请考虑导出该类。_）

:::

元数据引用了一个未导出的类。

例如，你可能定义了一个类，并在 providers 数组中把它用作注入令牌，却忘了导出这个类。

```ts
// 错误
abstract class MyStrategy { }

  …
  providers: [
    { provide: MyStrategy, useValue: … }
  ]
  …
```

Angular 会在单独的模块中生成类工厂，而该工厂[只能访问已导出的类](/tools/cli/aot-compiler#public-or-protected-symbols)。
要修正这个错误，请导出被引用的类。

```ts
// 已修正
export abstract class MyStrategy { }

  …
  providers: [
    { provide: MyStrategy, useValue: … }
  ]
  …
```

## 不支持解构的变量或常量 {#destructured-variable-or-constant-not-supported}

::: tip 提示
_Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring._
（_模板编译器不支持引用已导出的解构变量或常量。请考虑简化代码以避免解构。_）

:::

编译器不支持引用通过[解构](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring)赋值的变量。

例如，你不能编写下面这样的代码：

```ts
// 错误
import { configuration } from './configuration';

// 通过解构赋值给 foo 和 bar
const {foo, bar} = configuration;
  …
  providers: [
    {provide: Foo, useValue: foo},
    {provide: Bar, useValue: bar},
  ]
  …
```

要修正这个错误，请引用未经解构的值。

```ts
// 已修正
import { configuration } from './configuration';
  …
  providers: [
    {provide: Foo, useValue: configuration.foo},
    {provide: Bar, useValue: configuration.bar},
  ]
  …
```

## 无法解析类型 {#could-not-resolve-type}

::: tip 提示
_The compiler encountered a type and can't determine which module exports that type._
（_编译器遇到了一个类型，但无法确定是哪个模块导出了该类型。_）

:::

如果你引用了环境类型（ambient type），就可能发生这种情况。
例如，`Window` 类型就是在全局 `.d.ts` 文件中声明的环境类型。

如果你在组件构造函数中引用它，就会报错，因为编译器必须对组件构造函数进行静态分析。

```ts
// 错误
@Component({ })
export class MyComponent {
  constructor (private win: Window) { … }
}
```

TypeScript 能够理解环境类型，因此你不需要导入它们。
但 Angular 编译器无法理解那些你没有导出或导入的类型。

在这个例子中，编译器不知道如何使用 `Window` 令牌注入某个东西。

不要在元数据表达式中引用环境类型。

如果你必须注入某个环境类型的实例，
可以通过以下四个步骤巧妙地解决这个问题：

1. 为该环境类型的实例创建一个注入令牌。
1. 创建一个返回该实例的工厂函数。
1. 使用该工厂函数添加一个 `useFactory` 提供者。
1. 使用 `@Inject` 注入该实例。

下面是一个示例。

```ts
// 已修正
import {Inject, InjectionToken, Component} from '@angular/core';

export const WINDOW = new InjectionToken('Window');
export function _window() { return window; }

@Component({
  …
  providers: [
    { provide: WINDOW, useFactory: _window }
  ]
})
export class MyComponent {
  constructor (@Inject(WINDOW) private win: Window) { … }
}
```

构造函数中的 `Window` 类型对编译器来说不再是问题，因为编译器
会使用 `@Inject(WINDOW)` 来生成注入代码。

Angular 对 `DOCUMENT` 令牌也做了类似的处理，因此你可以注入浏览器的 `document` 对象（或者它的某种抽象，具体取决于应用所运行的平台）。

```ts
import {Inject, Component} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({ … })
export class MyComponent {
  constructor (@Inject(DOCUMENT) private doc: Document) { … }
}
```

## 期望名称 {#name-expected}

::: tip 提示
_The compiler expected a name in an expression it was evaluating._
（_编译器期望在它正在求值的表达式中出现一个名称。_）

:::

如果你像下例这样使用数字作为属性名，就可能发生这种情况。

```ts
// 错误
provider: [{provide: Foo, useValue: {0: 'test'}}];
```

把属性名改为非数字的名称。

```ts
// 已修正
provider: [{provide: Foo, useValue: {'0': 'test'}}];
```

## 不支持的枚举成员名称 {#unsupported-enum-member-name}

::: tip 提示
_Angular couldn't determine the value of the [enum member](https://www.typescriptlang.org/docs/handbook/enums.html) that you referenced in metadata._
（_Angular 无法确定你在元数据中引用的[枚举成员](https://www.typescriptlang.org/docs/handbook/enums.html)的值。_）

:::

编译器能够理解简单的枚举值，但无法理解复杂的值，例如由计算属性派生出来的值。

```ts
// 错误
enum Colors {
  Red = 1,
  White,
  Blue = "Blue".length // 计算得出
}

  …
  providers: [
    { provide: BaseColor,   useValue: Colors.White } // 正确
    { provide: DangerColor, useValue: Colors.Red }   // 正确
    { provide: StrongColor, useValue: Colors.Blue }  // 错误
  ]
  …
```

避免引用带有复杂初始化表达式或计算属性的枚举。

## 不支持带标签的模板表达式 {#tagged-template-expressions-are-not-supported}

::: tip 提示
_Tagged template expressions are not supported in metadata._
（_元数据中不支持带标签的模板表达式。_）

:::

编译器遇到了 JavaScript ES2015 的[带标签的模板表达式](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals)，例如下面这样。

```ts

// 错误
const expression = 'funky';
const raw = String.raw`A tagged template ${expression} string`;
 …
 template: '<div>' + raw + '</div>'
 …

```

[`String.raw()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/raw) 是 JavaScript ES2015 原生的 _标签函数_。

AOT 编译器不支持带标签的模板表达式；请避免在元数据表达式中使用它们。

## 期望符号引用 {#symbol-reference-expected}

::: tip 提示
_The compiler expected a reference to a symbol at the location specified in the error message._
（_编译器期望在错误消息所指定的位置出现一个符号引用。_）

:::

如果你在类的 `extends` 子句中使用了表达式，就可能发生这个错误。

<!--todo: Chuck: After reviewing your PR comment I'm still at a loss. See [comment there](https://github.com/angular/angular/pull/17712#discussion_r132025495). -->
