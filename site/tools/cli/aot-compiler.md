# 预先（AOT）编译 {#ahead-of-time-aot-compilation}

Angular 应用主要由组件（Component）及其 HTML 模板（Template）组成。
由于浏览器无法直接理解 Angular 提供的组件和模板，Angular 应用在浏览器中运行之前需要先经过编译。

Angular 的预先（Ahead-of-Time，AOT）编译器会在构建阶段，也就是在浏览器下载并运行代码 _之前_，把你的 Angular HTML 和 TypeScript 代码转换为高效的 JavaScript 代码。
在构建过程中编译应用，可以让浏览器中的渲染速度更快。

本指南介绍如何指定元数据并应用可用的编译器选项，以便使用 AOT 编译器高效地编译应用。

::: tip 提示
[观看 Alex Rickabaugh 讲解 Angular 编译器](https://www.youtube.com/watch?v=anphffaCZrQ)（AngularConnect 2019）。

:::

以下是你可能希望使用 AOT 的一些原因。

| 原因                                    | 详情                                                                                                                                                                                                                                               |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 更快的渲染                              | 使用 AOT 时，浏览器下载的是应用的预编译版本。浏览器加载的是可执行代码，因此可以立即渲染应用，而无需先等待应用编译完成。                                                                                                                             |
| 更少的异步请求                          | 编译器会把外部 HTML 模板和 CSS 样式表 _内联_ 到应用的 JavaScript 中，省去了针对这些源文件的单独 ajax 请求。                                                                                                                                          |
| 更小的 Angular 框架下载体积             | 如果应用已经编译过，就不需要再下载 Angular 编译器。编译器大约占 Angular 本身体积的一半，因此省略它可以大幅减小应用的载荷。                                                                                                                           |
| 更早发现模板错误                        | AOT 编译器会在构建步骤中检测并报告模板绑定错误，让问题在用户看到之前就被发现。                                                                                                                                                                      |
| 更好的安全性                            | AOT 会在 HTML 模板和组件发送到客户端之前很久，就把它们编译成 JavaScript 文件。由于没有需要读取的模板，也没有存在风险的客户端 HTML 或 JavaScript 求值，注入攻击的机会也就更少。                                                                     |

## 选择编译器 {#choosing-a-compiler}

Angular 提供了两种编译应用的方式：

| Angular 编译方式      | 详情                                                                                              |
| :-------------------- | :------------------------------------------------------------------------------------------------ |
| 即时（JIT）           | 在运行时于浏览器中编译应用。在 Angular 8 之前，这是默认方式。                                     |
| 预先（AOT）           | 在构建时编译应用和库。从 Angular 9 开始，这是默认方式。                                           |

当你运行 [`ng build`](https://angular.dev/cli/build)（仅构建）或 [`ng serve`](https://angular.dev/cli/serve)（构建并在本地启动服务）CLI 命令时，编译类型（JIT 或 AOT）取决于 `angular.json` 中构建配置的 `aot` 属性值。
对于新的 CLI 应用，`aot` 默认设为 `true`。

更多信息请参阅 [CLI 命令参考](/cli)和[构建并运行 Angular 应用](/tools/cli/build)。

## AOT 的工作原理 {#how-aot-works}

Angular AOT 编译器会提取 **元数据**，以解读应用中应由 Angular 管理的部分。
你可以在 `@Component()` 等 **装饰器** 中显式指定元数据，也可以在被装饰类的构造函数声明中隐式指定。
元数据告诉 Angular 如何构造应用类的实例，以及如何在运行时与它们交互。

AOT 编译器生成的代码依赖于一组内部运行时 API，称为 **编译器 ABI（Application Binary Interface，应用二进制接口）**。Angular 在框架同一个次版本内的所有补丁版本之间保持 ABI 的稳定。这确保了使用同一次版本的不同补丁版本构建的不同应用或库，可以在执行时安全地共享同一个 Angular 运行时。

在下面的示例中，`@Component()` 元数据对象和类的构造函数告诉 Angular 如何创建和显示 `Typical` 的实例。

```ts
@Component({
  selector: 'app-typical',
  template: '<div>A typical component for {{data().name}}</div>',
})
export class Typical {
  data = input.required<TypicalData>();
  private someService = inject(SomeService);
}
```

Angular 编译器会 _一次性_ 提取元数据，并为 `Typical` 生成一个 _工厂_。
当需要创建 `Typical` 实例时，Angular 会调用该工厂，工厂会生成一个新的可视元素，并把它绑定到组件类的一个新实例上，同时注入其依赖。

### 编译阶段 {#compilation-phases}

AOT 编译分为三个阶段。

|     | 阶段                   | 详情                                                                                                                                                                                                                                                                                                                        |
| :-- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 代码分析               | 在这一阶段，TypeScript 编译器和 _AOT 收集器_ 会创建源码的一种表示形式。收集器不会尝试解读它收集到的元数据，而是尽可能地表示这些元数据，并在检测到元数据语法违规时记录错误。                                                                                                                                                 |
| 2   | 代码生成               | 在这一阶段，编译器的 `StaticReflector` 会解读第 1 阶段收集到的元数据，对元数据进行额外的验证，并在检测到违反元数据限制时抛出错误。                                                                                                                                                                                           |
| 3   | 模板类型检查           | 在这一阶段，Angular _模板编译器_ 会使用 TypeScript 编译器来验证模板中的绑定表达式。这一阶段默认启用严格检查，由 `strictTemplates` 配置选项控制；参见 [Angular 编译器选项](/reference/configs/angular-compiler-options)。                                                                                                     |

### 元数据限制 {#metadata-restrictions}

你需要用 TypeScript 的一个 _子集_ 来编写元数据，并且必须满足以下一般约束：

- 把[表达式语法](#expression-syntax-limitations)限制在受支持的 JavaScript 子集内
- [代码折叠](#code-folding)之后只引用已导出的符号
- 只调用编译器[支持的函数](#supported-classes-and-functions)
- 输入 / 输出以及参与数据绑定的类成员必须是 public 或 protected 的。有关为 AOT 编译准备应用的更多指南和说明，请参阅 [Angular: Writing AOT-friendly applications](https://medium.com/sparkles-blog/angular-writing-aot-friendly-applications-7b64c8afbe3f)。

::: tip 提示
AOT 编译中的错误，通常是由于元数据不符合编译器的要求造成的（下文会有更完整的说明）。
如需帮助理解和解决这些问题，请参阅 [AOT 元数据错误](/tools/cli/aot-metadata-errors)。

:::

### 配置 AOT 编译 {#configuring-aot-compilation}

你可以在 [TypeScript 配置文件](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)中提供控制编译过程的选项。
完整的可用选项列表请参阅 [Angular 编译器选项](/reference/configs/angular-compiler-options)。

## 第 1 阶段：代码分析 {#phase-1-code-analysis}

TypeScript 编译器承担了第一阶段的部分分析工作。
它会生成带有类型信息的 `.d.ts` _类型定义文件_，AOT 编译器需要这些信息来生成应用代码。
与此同时，AOT **收集器** 会分析 Angular 装饰器中记录的元数据，并把元数据信息输出到 **`.metadata.json`** 文件中，每个 `.d.ts` 文件对应一个。

你可以把 `.metadata.json` 看作装饰器元数据整体结构的一张图，它以[抽象语法树（AST）](https://en.wikipedia.org/wiki/Abstract_syntax_tree)的形式表示。

::: tip 提示
Angular 的 [schema.ts](https://github.com/angular/angular/blob/12.2.x/packages/compiler-cli/src/metadata/schema.ts) 以一组 TypeScript 接口的形式描述了这种 JSON 格式。

:::

### 表达式语法限制 {#expression-syntax-limitations}

AOT 收集器只能理解 JavaScript 的一个子集。
请使用以下有限的语法来定义元数据对象：

| 语法                      | 示例                                                       |
| :------------------------ | :--------------------------------------------------------- |
| 对象字面量                | `{cherry: true, apple: true, mincemeat: false}`            |
| 数组字面量                | `['cherries', 'flour', 'sugar']`                           |
| 数组字面量中的展开        | `['apples', 'flour', …]`                                   |
| 函数调用                  | `bake(ingredients)`                                        |
| New                       | `new Oven()`                                               |
| 属性访问                  | `pie.slice`                                                |
| 数组索引                  | `ingredients[0]`                                           |
| 标识符引用                | `Component`                                                |
| 模板字符串                | <code>`pie is ${multiplier} times better than cake`</code> |
| 字符串字面量              | `'pi'`                                                     |
| 数字字面量                | `3.14153265`                                               |
| 布尔字面量                | `true`                                                     |
| null 字面量               | `null`                                                     |
| 受支持的前缀运算符        | `!cake`                                                    |
| 受支持的二元运算符        | `a+b`                                                      |
| 条件运算符                | `a ? b : c`                                                |
| 括号                      | `(a+b)`                                                    |

如果表达式使用了不受支持的语法，收集器会向 `.metadata.json` 文件写入一个错误节点。
之后，如果编译器需要这部分元数据来生成应用代码，就会报告该错误。

::: tip 提示
如果你希望 `ngc` 立即报告语法错误，而不是生成带有错误的 `.metadata.json` 文件，请在 TypeScript 配置文件中设置 `strictMetadataEmit` 选项。

:::

```json

"angularCompilerOptions": {
  …
  "strictMetadataEmit" : true
}

```

Angular 库都启用了这个选项，以确保所有 Angular `.metadata.json` 文件都是干净的；在构建你自己的库时，这样做也是一种最佳实践。

### 代码折叠 {#code-folding}

编译器只能解析对 **_已导出_** 符号的引用。
不过，收集器可以在收集期间对表达式求值，并把结果而不是原始表达式记录到 `.metadata.json` 中。
这让你可以在表达式中有限地使用未导出的符号。

例如，收集器可以对表达式 `1 + 2 + 3 + 4` 求值，并用结果 `10` 替换它。
这个过程称为 _折叠_。
能以这种方式化简的表达式就是 _可折叠的_。

收集器可以对模块内局部的 `const` 声明以及已初始化的 `var` 和 `let` 声明的引用进行求值，从而有效地把它们从 `.metadata.json` 文件中移除。

请看下面的组件定义：

```ts
const template = '<div>{{hero().name}}</div>';

@Component({
  selector: 'app-hero',
  template: template,
})
export class Hero {
  hero = input.required<Hero>();
}
```

编译器无法引用 `template` 常量，因为它没有被导出。
不过，收集器可以通过内联其内容，把 `template` 常量折叠到元数据定义中。
效果与你这样写完全相同：

```ts
@Component({
  selector: 'app-hero',
  template: '<div>{{hero().name}}</div>',
})
export class Hero {
  hero = input.required<Hero>();
}
```

这样就不再有对 `template` 的引用，因此编译器之后解读 `.metadata.json` 中 _收集器_ 的输出时，也就不会遇到麻烦。

你还可以更进一步，把 `template` 常量用在另一个表达式中：

```ts
const template = '<div>{{hero().name}}</div>';

@Component({
  selector: 'app-hero',
  template: template + '<div>{{hero().title}}</div>',
})
export class Hero {
  hero = input.required<Hero>();
}
```

收集器会把这个表达式化简为等价的 _折叠后_ 字符串：

```ts
'<div>{{hero().name}}</div><div>{{hero().title}}</div>';
```

#### 可折叠的语法 {#foldable-syntax}

下表列出了收集器能够折叠和不能折叠的表达式：

| 语法                             | 是否可折叠                               |
| :------------------------------- | :--------------------------------------- |
| 对象字面量                       | 是                                       |
| 数组字面量                       | 是                                       |
| 数组字面量中的展开               | 否                                       |
| 函数调用                         | 否                                       |
| New                              | 否                                       |
| 属性访问                         | 是，如果目标是可折叠的                   |
| 数组索引                         | 是，如果目标和索引都是可折叠的           |
| 标识符引用                       | 是，如果它引用的是局部符号               |
| 没有替换的模板字符串             | 是                                       |
| 带有替换的模板字符串             | 是，如果替换部分是可折叠的               |
| 字符串字面量                     | 是                                       |
| 数字字面量                       | 是                                       |
| 布尔字面量                       | 是                                       |
| null 字面量                      | 是                                       |
| 受支持的前缀运算符               | 是，如果操作数是可折叠的                 |
| 受支持的二元运算符               | 是，如果左右两侧都是可折叠的             |
| 条件运算符                       | 是，如果条件是可折叠的                   |
| 括号                             | 是，如果其中的表达式是可折叠的           |

如果表达式不可折叠，收集器会把它以 [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) 的形式写入 `.metadata.json`，交由编译器解析。

## 第 2 阶段：代码生成 {#phase-2-code-generation}

收集器不会尝试理解它收集并输出到 `.metadata.json` 中的元数据。
它会尽可能地表示这些元数据，并在检测到元数据语法违规时记录错误。
在代码生成阶段解读 `.metadata.json` 是编译器的工作。

编译器能理解收集器支持的所有语法形式，但如果元数据的 _语义_ 违反了编译器规则，即使它在 _语法_ 上是正确的，编译器也可能拒绝它。

### public 或 protected 符号 {#public-or-protected-symbols}

编译器只能引用 _已导出的符号_。

- 被装饰的组件类成员必须是 public 或 protected 的。
  你不能把 `input()` 属性设为 private。

- 参与数据绑定的属性也必须是 public 或 protected 的

### 受支持的类和函数 {#supported-classes-and-functions}

只要语法有效，收集器就可以表示函数调用或使用 `new` 创建对象。
不过，编译器之后可能会拒绝生成对 _某个特定_ 函数的调用或 _某个特定_ 对象的创建。

编译器只能创建某些类的实例，只支持核心装饰器，并且只支持调用返回表达式的宏（函数或静态方法）。

| 编译器行为           | 详情                                                                                                                 |
| :------------------- | :------------------------------------------------------------------------------------------------------------------- |
| 新建实例             | 编译器只允许创建 `@angular/core` 中 `InjectionToken` 类实例的元数据。                                                |
| 受支持的装饰器       | 编译器只支持 [`@angular/core` 模块中的 Angular 装饰器](/api?type=decorator)的元数据。                                |

### 函数和静态方法调用 {#functions-and-static-method-calls}

收集器接受任何只包含一条 `return` 语句的函数或静态方法。
不过，编译器只支持以返回 _表达式_ 的函数或静态方法形式出现的宏。

例如，请看下面的函数：

```ts
export function wrapInArray<T>(value: T): T[] {
  return [value];
}
```

你可以在元数据定义中调用 `wrapInArray`，因为它返回的是一个符合编译器受限 JavaScript 子集的表达式的值。

你可以这样使用 `wrapInArray()`：

```ts
@NgModule({
  declarations: wrapInArray(Typical),
})
export class TypicalModule {}
```

编译器会把这种用法视为你写了如下代码：

```ts
@NgModule({
  declarations: [Typical],
})
export class TypicalModule {}
```

Angular 的 [`RouterModule`](https://angular.dev/api/router/RouterModule) 导出了两个宏静态方法 `forRoot` 和 `forChild`，用于帮助声明根路由和子路由。
查看这些方法的[源代码](https://github.com/angular/angular/blob/main/packages/router/src/router_module.ts#L139 'RouterModule.forRoot source code')，
了解宏如何简化复杂 [NgModule](/guide/ngmodules/overview) 的配置。

## 第 3 阶段：模板类型检查 {#phase-3-template-type-checking}

Angular 编译器最有用的功能之一，就是能够对模板中的表达式进行类型检查，在错误导致运行时崩溃之前就把它们捕获。
在模板类型检查阶段，Angular 模板编译器会使用 TypeScript 编译器来验证模板中的绑定表达式。

这一阶段默认启用严格检查，由项目 TypeScript 配置文件 `"angularCompilerOptions"` 中的编译器选项 `"strictTemplates"` 控制
（参见 [Angular 编译器选项](/reference/configs/angular-compiler-options)）。

当在模板绑定表达式中检测到类型错误时，模板验证会产生错误消息，
这与 TypeScript 编译器针对 `.ts` 文件中的代码报告类型错误的方式类似。

例如，请看下面的组件：

```ts
@Component({
  selector: 'my-component',
  template: '{{person.addresss.street}}',
})
class MyComponent {
  person?: Person;
}
```

这会产生以下错误：

```shell

my.component.ts.MyComponent.html(1,1): : Property 'addresss' does not exist on type 'Person'. Did you mean 'address'?

```

错误消息中报告的文件名 `my.component.ts.MyComponent.html` 是一个合成文件，
由模板编译器生成，用于保存 `MyComponent` 类模板的内容。
编译器永远不会把这个文件写入磁盘。
行号和列号是相对于该类 `@Component` 注解中的模板字符串而言的，在本例中即 `MyComponent`。
如果组件使用的是 `templateUrl` 而不是 `template`，错误会在 `templateUrl` 引用的 HTML 文件中报告，而不是在合成文件中。

错误位置是包含出错插值（Interpolation）表达式的文本节点的起始处。
如果错误出现在 `[value]="person.address.street"` 这样的属性绑定中，错误
位置就是包含该错误的属性所在的位置。

验证过程使用 TypeScript 类型检查器以及提供给 TypeScript 编译器的选项，来控制类型验证的详细程度。
例如，如果启用了 TypeScript 的 `strictNullChecks` 选项，那么除了上面的错误消息外，

```shell

my.component.ts.MyComponent.html(1,1): : Object is possibly 'undefined'

```

这个错误也会被报告。

### 类型收窄 {#type-narrowing}

在 Angular 模板编译器中，`ngIf` 指令（Directive）里使用的表达式会被用来收窄联合类型，
这与 TypeScript 中 `if` 表达式的作用相同。
例如，为了避免上面模板中的 `Object is possibly 'undefined'` 错误，可以修改模板，使其只在 `person` 的值已初始化时才输出插值，如下所示：

```ts
@Component({
  selector: 'my-component',
  template: '<span *ngIf="person"> {{person.address.street}} </span>',
})
class MyComponent {
  person?: Person;
}
```

使用 `*ngIf` 能让 TypeScript 编译器推断出绑定表达式中使用的 `person` 永远不会是 `undefined`。

有关输入类型收窄的更多信息，请参阅[改进自定义指令的模板类型检查](/guide/directives/structural-directives#improving-template-type-checking-for-custom-directives)。

### 非空类型断言运算符 {#non-null-type-assertion-operator}

当不方便使用 `*ngIf`，或者组件中的某些约束可以确保绑定表达式在插值时始终为非空时，可以使用非空类型断言运算符来抑制 `Object is possibly 'undefined'` 错误。

在下面的示例中，`person` 和 `address` 属性总是同时被设置，这意味着只要 `person` 非空，`address` 就一定非空。
没有方便的方式向 TypeScript 和模板编译器描述这一约束，但示例中通过使用 `address!.street` 抑制了该错误。

```ts
@Component({
  selector: 'my-component',
  template: '<span *ngIf="person"> {{person.name}} lives on {{address!.street}} </span>',
})
class MyComponent {
  person?: Person;
  address?: Address;

  setData(person: Person, address: Address) {
    this.person = person;
    this.address = address;
  }
}
```

应谨慎使用非空断言运算符，因为对组件的重构可能会破坏这一约束。

在这个示例中，建议像下面这样在 `*ngIf` 中加入对 `address` 的检查：

```ts
@Component({
  selector: 'my-component',
  template: '<span *ngIf="person && address"> {{person.name}} lives on {{address.street}} </span>',
})
class MyComponent {
  person?: Person;
  address?: Address;

  setData(person: Person, address: Address) {
    this.person = person;
    this.address = address;
  }
}
```
