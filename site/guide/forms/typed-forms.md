# 类型化表单 {#typed-forms}

从 Angular 14 开始，响应式表单（Reactive Forms）默认是严格类型化的。

阅读本指南之前，你应该已经熟悉 [Angular 响应式表单](/guide/forms/reactive-forms)。

## 类型化表单概览 {#overview-of-typed-forms}

<iframe src="https://www.youtube.com/embed/L-odCf4MfJc" title="Typed Forms in Angular" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

使用 Angular 响应式表单时，你需要显式指定一个*表单模型*。举个简单的例子，看看下面这个基本的用户登录表单：

```ts
const login = new FormGroup({
  email: new FormControl(''),
  password: new FormControl(''),
});
```

Angular 提供了许多与这个 `FormGroup` 交互的 API。例如，你可以调用 `login.value`、`login.controls`、`login.patchValue` 等。（完整的 API 参考请参阅 [API 文档](https://angular.dev/api/forms/FormGroup)。）

在以前的 Angular 版本中，这些 API 大多在类型的某处包含 `any`，因此与控件结构或值本身的交互都不是类型安全的。例如，你可以写出下面这段无效的代码：

```ts
const emailDomain = login.value.email.domain;
```

有了严格类型化的响应式表单，上面的代码将无法通过编译，因为 `email` 上没有 `domain` 属性。

除了更高的安全性，这些类型还带来了许多其他改进，例如 IDE 中更好的自动补全，以及一种显式指定表单结构的方式。

这些改进目前只适用于*响应式*表单（不适用于[*模板驱动*表单](/guide/forms/template-driven-forms)）。

## 非类型化表单 {#untyped-forms}

非类型化表单仍然受支持，并将像以前一样继续工作。要使用它们，你必须从 `@angular/forms` 中导入带 `Untyped` 前缀的符号：

```ts
const login = new UntypedFormGroup({
  email: new UntypedFormControl(''),
  password: new UntypedFormControl(''),
});
```

每个 `Untyped` 符号的语义都与以前的 Angular 版本完全相同。通过去掉 `Untyped` 前缀，你可以逐步启用类型。

## `FormControl`：入门 {#formcontrol-getting-started}

最简单的表单只包含一个控件：

```ts
const email = new FormControl('angularrox@gmail.com');
```

这个控件的类型会被自动推断为 `FormControl<string|null>`。TypeScript 会在整个 [`FormControl` API](https://angular.dev/api/forms/FormControl) 中自动强制使用这个类型，例如 `email.value`、`email.valueChanges` 和 `email.setValue(...)`。

### 可空性 {#nullability}

你可能会好奇：为什么这个控件的类型包含 `null`？这是因为控件随时可能通过调用 reset 变成 `null`：

```ts
const email = new FormControl('angularrox@gmail.com');
email.reset();
console.log(email.value); // null
```

TypeScript 会强制你始终处理控件已变为 `null` 的可能性。如果想让这个控件不可为空，可以使用 `nonNullable` 选项。这会让控件重置为它的初始值，而不是 `null`：

```ts
const email = new FormControl('angularrox@gmail.com', {nonNullable: true});
email.reset();
console.log(email.value); // angularrox@gmail.com
```

再强调一次，这个选项会影响调用 `.reset()` 时表单的运行时行为，切换时应当谨慎。

### 指定显式类型 {#specifying-an-explicit-type}

除了依赖类型推断，也可以显式指定类型。假设有一个初始化为 `null` 的控件。由于初始值是 `null`，TypeScript 会推断出 `FormControl<null>`，这比我们想要的类型更窄。

```ts
const email = new FormControl(null);
email.setValue('angularrox@gmail.com'); // 错误！
```

为了避免这种情况，我们把类型显式指定为 `string|null`：

```ts
const email = new FormControl<string | null>(null);
email.setValue('angularrox@gmail.com');
```

## `FormArray`：动态的同构集合 {#formarray-dynamic-homogenous-collections}

`FormArray` 包含一个长度不限的控件列表。它的类型参数对应于每个内部控件的类型：

```ts
const names = new FormArray([new FormControl('Alex')]);
names.push(new FormControl('Jess'));
```

当需要一次添加多个条目时，可以向 `aliases.push()` 传入一个控件数组。

```ts
const aliases = new FormArray([new FormControl('ng')]);
aliases.push([new FormControl('ngDev'), new FormControl('ngAwesome')]);
```

这个 `FormArray` 的内部控件类型为 `FormControl<string|null>`。

如果你想在数组中包含多种不同类型的元素，就必须使用 `UntypedFormArray`，因为 TypeScript 无法推断哪个位置会出现哪种元素类型。

`FormArray` 还提供了一个 `clear()` 方法，用于移除它包含的所有控件：

```ts
const aliases = new FormArray([new FormControl('ngDev'), new FormControl('ngAwesome')]);
aliases.clear();
console.log(aliases.length); // 0
```

## `FormGroup` 与 `FormRecord` {#formgroup-and-formrecord}

Angular 为键集合固定可枚举的表单提供了 `FormGroup` 类型，为开放式或动态的组提供了一个名为 `FormRecord` 的类型。

### 部分值 {#partial-values}

再来看一下登录表单：

```ts
const login = new FormGroup({
  email: new FormControl('', {nonNullable: true}),
  password: new FormControl('', {nonNullable: true}),
});
```

在任何 `FormGroup` 上，都[可以禁用控件](https://angular.dev/api/forms/FormGroup)。被禁用的控件不会出现在组的值中。

因此，`login.value` 的类型是 `Partial<{email: string, password: string}>`。这个类型中的 `Partial` 表示每个成员都可能是 undefined。

更具体地说，`login.value.email` 的类型是 `string|undefined`，TypeScript 会强制你处理可能为 `undefined` 的值（如果启用了 `strictNullChecks`）。

如果你想访问*包括*禁用控件在内的值，从而避开可能为 `undefined` 的字段，可以使用 `login.getRawValue()`。

### 可选控件与动态组 {#optional-controls-and-dynamic-groups}

有些表单中的控件可能存在也可能不存在，并且可以在运行时添加和移除。你可以使用*可选字段*来表示这些控件：

```ts
interface LoginForm {
  email: FormControl<string>;
  password?: FormControl<string>;
}

const login = new FormGroup<LoginForm>({
  email: new FormControl('', {nonNullable: true}),
  password: new FormControl('', {nonNullable: true}),
});

login.removeControl('password');
```

在这个表单中，我们显式指定了类型，从而可以让 `password` 控件成为可选的。TypeScript 会强制只有可选控件才能被添加或移除。

### `FormRecord` {#formrecord}

有些 `FormGroup` 的用法并不适合上面的模式，因为键无法事先知道。`FormRecord` 类正是为这种情况而设计的：

```ts
const addresses = new FormRecord<FormControl<string | null>>({});
addresses.addControl('Andrew', new FormControl('2340 Folsom St'));
```

任何类型为 `string|null` 的控件都可以添加到这个 `FormRecord` 中。

如果你需要一个既是动态的（开放式）又是异构的（控件类型各不相同）`FormGroup`，就无法获得更好的类型安全，这时应该使用 `UntypedFormGroup`。

`FormRecord` 也可以用 `FormBuilder` 来构建：

```ts
const addresses = fb.record({'Andrew': '2340 Folsom St'});
```

## `FormBuilder` 与 `NonNullableFormBuilder` {#formbuilder-and-nonnullableformbuilder}

`FormBuilder` 类也已经升级，以与上述示例相同的方式支持新的类型。

此外，还提供了另一个构建器：`NonNullableFormBuilder`。这个类型相当于在每个控件上都指定 `{nonNullable: true}` 的简写，可以在大型的不可为空表单中省去大量样板代码。你可以通过 `FormBuilder` 上的 `nonNullable` 属性来访问它：

```ts
const fb = new FormBuilder();
const login = fb.nonNullable.group({
  email: '',
  password: '',
});
```

在上面的例子中，两个内部控件都将是不可为空的（即设置了 `nonNullable`）。

你也可以使用 `NonNullableFormBuilder` 这个名字来注入它。
