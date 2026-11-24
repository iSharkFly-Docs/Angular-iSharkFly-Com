# 通过输入属性接收数据 {#accepting-data-with-input-properties}

::: tip 提示
本指南假定你已经读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。如果你熟悉其他 Web 框架，可以把输入属性理解为类似 **props** 的东西。

:::

使用组件（Component）时，你通常希望向它传递一些数据。组件通过声明
**输入**（input）来指定它接收哪些数据：

```ts
import {Component, input} from '@angular/core';

@Component(/* ... */)
export class CustomSlider {
  // 声明一个名为 'value' 的输入，默认值为 0。
  value = input(0);
}
```

这样你就可以在模板（Template）中绑定到该属性：

```html
<custom-slider [value]="50" />
```

如果输入有默认值，TypeScript 会根据默认值推断其类型：

```ts
@Component(/* ... */)
export class CustomSlider {
  // TypeScript 推断该输入是 number 类型，返回 InputSignal<number>。
  value = input(0);
}
```

你也可以为函数指定泛型参数，显式声明输入的类型。

如果没有默认值的输入未被设置，它的值就是 `undefined`：

```ts
@Component(/* ... */)
export class CustomSlider {
  // 生成 InputSignal<number | undefined>，因为 `value` 可能未被设置。
  value = input<number>();
}
```

**Angular 在编译期静态记录输入**。输入不能在运行时添加或移除。

`input` 函数对 Angular 编译器有特殊意义。**你只能在组件和指令（Directive）的属性初始化器中调用 `input`。**

扩展组件类时，**输入会被子类继承。**

**输入名称区分大小写。**

## 读取输入 {#reading-inputs}

`input` 函数返回一个 `InputSignal`。你可以通过调用该信号（Signal）来读取值：

```ts
import {Component, input, computed} from '@angular/core';

@Component(/* ... */)
export class CustomSlider {
  // 声明一个名为 'value' 的输入，默认值为 0。
  value = input(0);

  // 创建一个读取 value 输入的计算表达式
  label = computed(() => `The slider's value is ${this.value()}`);
}
```

由 `input` 函数创建的信号是只读的。

## 必需输入 {#required-inputs}

你可以调用 `input.required` 而不是 `input`，把输入声明为 `required`（必需）：

```ts
@Component(/* ... */)
export class CustomSlider {
  // 声明一个名为 value 的必需输入。返回 `InputSignal<number>`。
  value = input.required<number>();
}
```

Angular 强制要求在模板中使用组件时**必须**设置必需输入。如果你在使用组件时没有指定它的所有必需输入，Angular 会在构建时报错。

必需输入不会自动在所返回 `InputSignal` 的泛型参数中包含 `undefined`。

## 配置输入 {#configuring-inputs}

`input` 函数接受一个配置对象作为第二个参数，用来改变输入的工作方式。

### 输入转换 {#input-transforms}

你可以指定一个 `transform` 函数，在 Angular 设置输入值时对其进行转换。

```ts
@Component({
  selector: 'custom-slider',
  /*...*/
})
export class CustomSlider {
  label = input('', {transform: trimString});
}

function trimString(value: string | undefined): string {
  return value?.trim() ?? '';
}
```

```html
<custom-slider [label]="systemVolume" />
```

在上面的例子中，每当 `systemVolume` 的值发生变化时，Angular 都会运行 `trimString`，并把结果设置给 `label`。

输入转换最常见的用途是让模板可以传入更多类型的值，通常包括 `null` 和 `undefined`。

**输入转换函数必须能在构建时被静态分析**。你不能有条件地设置转换函数，也不能把它设置为某个表达式求值的结果。

**输入转换函数应该始终是[纯函数](https://en.wikipedia.org/wiki/Pure_function)**。依赖转换函数之外的状态可能导致不可预测的行为。

#### 类型检查 {#type-checking}

当你指定输入转换时，转换函数参数的类型决定了在模板中可以为该输入设置哪些类型的值。

```ts
@Component(/* ... */)
export class CustomSlider {
  widthPx = input('', {transform: appendPx});
}

function appendPx(value: number): string {
  return `${value}px`;
}
```

在上面的例子中，`widthPx` 输入接受 `number`，而 `InputSignal` 属性返回的是 `string`。

#### 内置转换 {#built-in-transformations}

Angular 内置了两个转换函数，用于两种最常见的场景：把值强制转换为布尔值和数字。

```ts
import {Component, input, booleanAttribute, numberAttribute} from '@angular/core';

@Component(/* ... */)
export class CustomSlider {
  disabled = input(false, {transform: booleanAttribute});
  value = input(0, {transform: numberAttribute});
}
```

`booleanAttribute` 模仿标准 HTML [布尔属性](https://developer.mozilla.org/docs/Glossary/Boolean/HTML)的行为，即
只要**存在**该属性就表示“true”值。不过，Angular 的 `booleanAttribute` 会把字面字符串 `"false"` 视为布尔值 `false`。

`numberAttribute` 会尝试把给定的值解析为数字，解析失败时返回 `NaN`。

### 输入别名 {#input-aliases}

你可以指定 `alias` 选项来更改输入在模板中的名称。

```ts
@Component(/* ... */)
export class CustomSlider {
  value = input(0, {alias: 'sliderValue'});
}
```

```html
<custom-slider [sliderValue]="50" />
```

这个别名不会影响在 TypeScript 代码中对该属性的使用。

虽然一般应避免为组件的输入设置别名，但在重命名属性时，这个特性可以为原名称保留一个别名；它也可以用来避免与原生 DOM 元素属性的名称发生冲突。

## 模型输入 {#model-inputs}

**模型输入**（Model input）是一种特殊的输入，它让组件能够把新值传回给父组件。

创建组件时，你可以像创建标准输入一样定义模型输入。

两种输入都允许别人把值绑定到属性上。不过，**模型输入还允许组件作者向属性中写入值**。如果该属性使用了双向绑定（Two-way Binding），新值就会传播到该绑定上。

```ts
@Component(/* ... */)
export class CustomSlider {
  // 定义一个名为 "value" 的模型输入。
  value = model(0);

  increment() {
    // 用新值更新模型输入，并把该值传播到所有绑定。
    this.value.update((oldValue) => oldValue + 10);
  }
}

@Component({
  /* ... */
  // 使用双向绑定语法意味着，slider 的值发生的任何变化
  // 都会自动传播回 `volume` 信号。
  // 注意，这个绑定使用的是信号*实例*，而不是信号的值。
  template: `<custom-slider [(value)]="volume" />`,
})
export class MediaControls {
  // 为 `volume` 本地状态创建一个可写信号。
  volume = signal(0);
}
```

在上面的例子中，`CustomSlider` 可以向它的 `value` 模型输入写入值，这些值随后会传播回 `MediaControls` 中的 `volume` 信号。这个绑定让 `value` 和 `volume` 的值保持同步。注意，绑定传递的是 `volume` 信号实例，而不是该信号的**值**。

在其他方面，模型输入的工作方式与标准输入类似。你可以通过调用信号函数来读取它的值，包括在 `computed` 和 `effect` 等[响应式上下文](/guide/signals#reactive-contexts)中。

关于模板中双向绑定的更多细节，请参阅[双向绑定](/guide/templates/two-way-binding)。

### 与普通属性进行双向绑定 {#two-way-binding-with-plain-properties}

你可以把一个普通的 JavaScript 属性绑定到模型输入上。

```ts
@Component({
  /* ... */
  // `value` 是一个模型输入。
  // 方括号里套圆括号的语法（又称“盒子里的香蕉”）会创建一个双向绑定
  template: '<custom-slider [(value)]="volume" />',
})
export class MediaControls {
  protected volume = 0;
}
```

在上面的例子中，`CustomSlider` 可以向它的 `value` 模型输入写入值，这些值随后会传播回 `MediaControls` 中的 `volume` 属性。这个绑定让 `value` 和 `volume` 的值保持同步。

### 隐式的 `change` 事件 {#implicit-change-events}

当你在组件或指令中声明模型输入时，Angular 会自动为该模型创建一个对应的[输出（output）](/guide/components/outputs)。输出的名称是模型输入的名称加上后缀“Change”。

```ts
@Directive(/* ... */)
export class CustomCheckbox {
  // 这会自动创建一个名为 "checkedChange" 的输出。
  // 可以在模板中通过 `(checkedChange)="handler()"` 订阅它。
  checked = model(false);
}
```

每当你调用模型输入的 `set` 或 `update` 方法写入新值时，Angular 都会发出这个变更事件。

关于输出的更多细节，请参阅[使用输出自定义事件](/guide/components/outputs)。

### 自定义模型输入 {#customizing-model-inputs}

你可以像标准输入一样，把模型输入标记为[必需](#required-inputs)，或为它提供[别名](#input-aliases)。

模型输入不支持输入转换。

### 何时使用模型输入 {#when-to-use-model-inputs}

当你希望组件支持双向绑定时，就使用模型输入。这通常适用于那些根据用户交互来修改某个值的组件。最常见的是自定义表单控件（例如日期选择器或组合框），它们的主值应该使用模型输入。

## 选择输入名称 {#choosing-input-names}

避免选择与 DOM 元素（如 HTMLElement）上的属性相冲突的输入名称。名称冲突会让人搞不清所绑定的属性到底属于组件还是 DOM 元素。

避免像给组件选择器（selector）加前缀那样给组件输入加前缀。由于一个元素只能承载一个组件，任何自定义属性都可以认为属于该组件。

## 使用 `@Input` 装饰器声明输入 {#declaring-inputs-with-the-input-decorator}

::: tip 提示
虽然 Angular 团队建议新项目使用基于信号的 `input` 函数，但原有的基于装饰器的 `@Input` API 仍然受到完全支持。

:::

你也可以给属性添加 `@Input` 装饰器来声明组件输入：

```ts
@Component(/* ... */)
export class CustomSlider {
  @Input() value = 0;
}
```

无论是基于信号的输入还是基于装饰器的输入，绑定方式都是一样的：

```html
<custom-slider [value]="50" />
```

### 自定义基于装饰器的输入 {#customizing-decorator-based-inputs}

`@Input` 装饰器接受一个配置对象，用来改变输入的工作方式。

#### 必需输入 {#required-inputs-decorator}

你可以指定 `required` 选项，强制要求某个输入必须始终有值。

```ts
@Component(/* ... */)
export class CustomSlider {
  @Input({required: true}) value = 0;
}
```

如果你在使用组件时没有指定它的所有必需输入，Angular 会在构建时报错。

#### 输入转换 {#input-transforms-decorator}

你可以指定一个 `transform` 函数，在 Angular 设置输入值时对其进行转换。这个转换函数的工作方式与上文介绍的基于信号的输入的转换函数完全相同。

```ts
@Component({
  selector: 'custom-slider',
  ...
})
export class CustomSlider {
  @Input({transform: trimString}) label = '';
}

function trimString(value: string | undefined) {
  return value?.trim() ?? '';
}
```

#### 输入别名 {#input-aliases-decorator}

你可以指定 `alias` 选项来更改输入在模板中的名称。

```ts
@Component(/* ... */)
export class CustomSlider {
  @Input({alias: 'sliderValue'}) value = 0;
}
```

```html
<custom-slider [sliderValue]="50" />
```

`@Input` 装饰器也可以把别名作为第一个参数，来代替配置对象。

输入别名的工作方式与上文介绍的基于信号的输入相同。

### 带有 getter 和 setter 的输入 {#inputs-with-getters-and-setters}

使用基于装饰器的输入时，用 getter 和 setter 实现的属性也可以作为输入：

```ts
export class CustomSlider {
  @Input()
  get value(): number {
    return this.internalValue;
  }

  set value(newValue: number) {
    this.internalValue = newValue;
  }

  private internalValue = 0;
}
```

你甚至可以只定义一个公共 setter，创建一个**只写**输入：

```ts
export class CustomSlider {
  @Input()
  set value(newValue: number) {
    this.internalValue = newValue;
  }

  private internalValue = 0;
}
```

如果可能，**优先使用输入转换，而不是 getter 和 setter**。

避免编写复杂或开销很大的 getter 和 setter。Angular 可能会多次调用输入的 setter，如果 setter 执行了 DOM 操作之类的高开销行为，就可能对应用性能产生负面影响。

## 在 `@Component` 装饰器中指定输入 {#specify-inputs-in-the-component-decorator}

除了 `@Input` 装饰器之外，你还可以使用 `@Component` 装饰器中的 `inputs` 属性来指定组件的输入。当组件从基类继承某个属性时，这会很有用：

```ts
// `CustomSlider` 从 `BaseSlider` 继承了 `disabled` 属性。
@Component({
  ...,
  inputs: ['disabled'],
})
export class CustomSlider extends BaseSlider { }
```

你还可以在 `inputs` 列表中指定输入别名，方法是在字符串中把别名放在冒号之后：

```ts
// `CustomSlider` 从 `BaseSlider` 继承了 `disabled` 属性。
@Component({
  ...,
  inputs: ['disabled: sliderDisabled'],
})
export class CustomSlider extends BaseSlider { }
```
