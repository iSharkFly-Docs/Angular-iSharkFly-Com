# 结构型指令

结构型指令（Structural Directive）是应用在 `<ng-template>` 元素上的指令（Directive），它们会有条件地或重复地渲染该 `<ng-template>` 的内容。

对于日常的条件渲染和重复渲染，请使用 Angular 内置的[控制流（Control Flow）块](/guide/templates/control-flow)（`@if`、`@for` 和 `@switch`）。当你需要控制流无法覆盖的可复用渲染行为时，再编写结构型指令，例如把内容放在权限检查之后，或者用来自外部数据源的数据为模板（Template）提供数据。

## 示例用例

本指南以一个名为 `SelectDirective` 的指令作为贯穿全文的例子。该指令从给定的数据源获取数据，并在数据可用时渲染它的模板。它以 SQL 关键字 `SELECT` 命名，并通过属性选择器（Selector）`[select]` 进行匹配。

`SelectDirective` 有一个名为 `selectFrom` 的输入（Input），用来指定要使用的数据源。这个输入的 `select` 前缀对于[简写语法](#structural-directive-shorthand)很重要。该指令会用一个提供所选数据的模板上下文来实例化它的 `<ng-template>`。

直接在 `<ng-template>` 上使用这个指令的写法如下：

```html
<ng-template select let-data [selectFrom]="source">
  <p>The data is: {{ data }}</p>
</ng-template>
```

结构型指令可以等待数据可用，然后再渲染它的 `<ng-template>`。

::: tip 提示
Angular 的 `<ng-template>` 元素定义了一个默认不渲染任何内容的模板。如果你把元素包裹在 `<ng-template>` 中却没有应用结构型指令，这些元素就不会被渲染。

:::

更多信息请参阅 [ng-template API](https://angular.dev/api/core/ng-template) 文档。

## 结构型指令简写

Angular 为结构型指令提供了一种简写语法，免去了显式编写 `<ng-template>` 元素的麻烦。

在指令的属性选择器前加上星号（`*`），例如 `*select`，就可以把结构型指令直接应用到元素上。Angular 会把结构型指令前的星号转换成一个 `<ng-template>`，由它承载该指令，并包裹住这个元素及其后代。

你可以这样把它用于 `SelectDirective`：

```html
<p *select="let data; from: source">The data is: {{ data }}</p>
```

这个例子展示了结构型指令简写语法的灵活性，这种语法有时也被称为*微语法*（microsyntax）。

以这种方式使用时，只有结构型指令及其绑定（Binding）会被应用到 `<ng-template>` 上。`<p>` 标签上的其他属性或绑定都保持不变。例如，下面两种形式是等价的：

```html
<!-- 简写语法： -->
<p class="data-view" *select="let data; from: source">The data is: {{ data }}</p>

<!-- 完整语法： -->
<ng-template select let-data [selectFrom]="source">
  <p class="data-view">The data is: {{ data }}</p>
</ng-template>
```

简写语法会按照一组约定进行展开。下文定义了更完整的[语法](#structural-directive-syntax-reference)，但就上面的例子而言，这种转换可以这样解释：

`*select` 表达式的第一部分是 `let data`，它声明了一个模板变量（Template Variable）`data`。由于后面没有赋值，该模板变量会被绑定到模板上下文属性 `$implicit`。

语法的第二部分是一个键-表达式对 `from source`。`from` 是绑定键，`source` 是一个普通的模板表达式。绑定键会被转换为 PascalCase 并在前面加上结构型指令的选择器，从而映射到属性。`from` 键被映射为 `selectFrom`，然后绑定到表达式 `source`。这就是为什么许多结构型指令的输入都以该结构型指令的选择器作为前缀。

## 每个元素只能有一个结构型指令

使用简写语法时，每个元素只能应用一个结构型指令。这是因为只有一个 `<ng-template>` 元素可以用来展开该指令。多个指令就需要多个嵌套的 `<ng-template>`，而且无法确定哪个指令应该在最外层。当需要在同一个物理 DOM 元素或组件（Component）周围应用多个结构型指令时，可以用 `<ng-container>` 创建包装层，让用户自行定义嵌套结构。

## 创建结构型指令

结构型指令是一个注入了两个依赖的指令类：

- [`TemplateRef`](https://angular.dev/api/core/TemplateRef) 让指令能够访问它所应用到的 `<ng-template>` 的内容。
- [`ViewContainerRef`](https://angular.dev/api/core/ViewContainerRef) 代表 DOM 中指令可以渲染该模板的位置。

指令通过在视图容器中基于模板创建（或不创建）嵌入式视图来控制渲染。完整的 `SelectDirective` 如下所示：

```ts
import {Directive, TemplateRef, ViewContainerRef, inject, input} from '@angular/core';

export interface DataSource<T> {
  load(): Promise<T>;
}

@Directive({
  selector: '[select]',
})
export class SelectDirective {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);

  selectFrom = input.required<DataSource<unknown>>();

  async ngOnInit() {
    const data = await this.selectFrom().load();
    this.viewContainerRef.createEmbeddedView(this.templateRef, {
      // 用一个上下文对象创建嵌入式视图，该对象
      // 通过键 `$implicit` 包含数据。
      $implicit: data,
    });
  }
}
```

`selectFrom` 输入指定了指令要读取的数据源。它使用了 [`input.required()`](/guide/components/inputs#required-inputs)，因为没有数据源，这个指令就做不了任何有用的事情。

当 Angular 初始化该指令时，它会加载数据，然后调用 `createEmbeddedView()` 渲染模板。第二个参数是模板的*上下文对象*：模板可以通过 `let` 声明绑定到其中的值。把数据赋给 `$implicit` 键，就使它成为 `let-data`（简写中为 `let data`）接收的默认值。

::: info 注意
这个例子只在指令初始化时渲染一次模板。当绑定的数据源发生变化时，它不会重新渲染。

:::

指令可以正常工作之后，可以考虑[添加模板类型检查支持](#typing-the-directives-context)。

::: tip 提示
CLI 命令 [`ng generate directive`](/tools/cli/schematics) 会生成指令的骨架代码及其测试文件。

:::

## 结构型指令语法参考

编写自己的结构型指令时，请使用以下语法：

```ts
_: prefix = "( :let | :expression ) (';' | ',')? ( :let | :as | :keyExp )_";
```

下面的模式描述了结构型指令语法的各个部分：

```ts
as = :export "as" :local ";"?
keyExp = :key ":"? :expression ("as" :local)? ";"?
let = "let" :local "=" :export ";"?
```

| 关键字       | 详情                                               |
| :----------- | :------------------------------------------------- |
| `prefix`     | HTML 属性键                                 |
| `key`        | HTML 属性键                                 |
| `local`      | 模板中使用的局部变量名           |
| `export`     | 指令以给定名称导出的值 |
| `expression` | 标准 Angular 表达式                        |

### Angular 如何转换简写

Angular 会按如下方式把结构型指令简写转换为普通的绑定语法：

| 简写                            | 转换结果                                                        |
| :------------------------------ | :-------------------------------------------------------------- |
| `prefix` 和单独的 `expression` | `[prefix]="expression"`                                         |
| `keyExp`                        | `[prefixKey]="expression"`（`prefix` 会被加到 `key` 前面） |
| `let local`                     | `let-local="export"`                                            |

### 简写示例

下表给出了一些简写示例：

| 简写                                                                  | Angular 如何解释该语法                                                                                        |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `*myDir="let item of [1,2,3]"`                                        | `<ng-template myDir let-item [myDirOf]="[1, 2, 3]">`                                                          |
| `*myDir="let item of [1,2,3] as items; trackBy: myTrack; index as i"` | `<ng-template myDir let-item [myDirOf]="[1,2,3]" let-items="myDirOf" [myDirTrackBy]="myTrack" let-i="index">` |
| `*ngComponentOutlet="componentClass"`                                 | `<ng-template [ngComponentOutlet]="componentClass">`                                                          |
| `*ngComponentOutlet="componentClass; inputs: myInputs"`               | `<ng-template [ngComponentOutlet]="componentClass" [ngComponentOutletInputs]="myInputs">`                     |
| `*myDir="exp as value"`                                               | `<ng-template [myDir]="exp" let-value="myDir">`                                                               |

## 改进自定义指令的模板类型检查

你可以在指令定义中添加模板守卫，以改进自定义指令的模板类型检查。
这些守卫可以帮助 Angular 模板类型检查器在编译期发现模板中的错误，从而避免运行时错误。
守卫有两种不同的类型：

- `ngTemplateGuard_(input)` 让你可以根据特定输入的类型，控制如何收窄输入表达式的类型。
- `ngTemplateContextGuard` 用于根据指令本身的类型，确定模板上下文对象的类型。

本节给出了这两种守卫的示例。
更多信息请参阅[模板类型检查](/tools/cli/template-typecheck '模板类型检查指南')。

### 使用模板守卫进行类型收窄

模板中的结构型指令控制着该模板在运行时是否被渲染。有些结构型指令希望根据输入表达式的类型进行类型收窄。

输入守卫可以实现两种收窄：

- 根据 TypeScript 类型断言函数收窄输入表达式。
- 根据输入表达式的真假性收窄它。

要通过定义类型断言函数来收窄输入表达式：

```ts
// 这个指令只有在 actor 是用户时才会渲染它的模板。
// 你希望断言在模板中，`actor` 表达式的类型
// 被收窄为 `User`。
@Directive(...)
class ActorIsUser {
  actor = input<User | Robot>();

  static ngTemplateGuard_actor(dir: ActorIsUser, expr: User | Robot): expr is User {
    // 实际上这条 return 语句是不必要的，加上它只是为了
    // 避免 TypeScript 报错。
    return true;
  }
}
```

在模板中，类型检查的行为就如同对绑定到该输入的表达式执行了 `ngTemplateGuard_actor` 断言一样。

有些指令只在某个输入为真值时才渲染它们的模板。类型断言函数无法完整表达真假性的语义，因此可以改用字面量类型 `'binding'`，告诉模板类型检查器应该把绑定表达式本身用作守卫：

```ts
@Directive(...)
class CustomIf {
  condition = input.required<boolean>();

  static ngTemplateGuard_condition: 'binding';
}
```

模板类型检查器的行为会如同在模板中断言了绑定到 `condition` 的表达式为真值一样。

### 为指令的上下文提供类型

如果你的结构型指令向实例化的模板提供了上下文，你可以提供一个静态的 `ngTemplateContextGuard` 类型断言函数，以便在模板中为它提供正确的类型。这个函数可以利用指令的类型推导出上下文的类型，这在指令的类型是泛型时非常有用。

对于上文介绍的 `SelectDirective`，即使数据源是泛型的，你也可以实现一个 `ngTemplateContextGuard` 来正确指定数据类型。

```ts
// 为模板上下文声明一个接口：
export interface SelectTemplateContext<T> {
  $implicit: T;
}

@Directive(...)
export class SelectDirective<T> {
  // 指令的泛型类型 `T` 会根据传给输入的
  // `DataSource` 类型推断出来。
  selectFrom = input.required<DataSource<T>>();

  // 使用指令的泛型类型来收窄上下文的类型。
  static ngTemplateContextGuard<T>(dir: SelectDirective<T>, ctx: any): ctx is SelectTemplateContext<T> {
    // 与之前一样，守卫的函数体在运行时不会被使用，加上它只是为了
    // 避免 TypeScript 报错。
    return true;
  }
}
```

## 下一步

- [指令组合 API](/guide/directives/directive-composition-api)
- [ng-template](/guide/templates/ng-template)
- [控制流](/guide/templates/control-flow)

