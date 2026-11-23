# 模板类型检查

## 模板类型检查概览

就像 TypeScript 会捕获代码中的类型错误一样，Angular 也会检查应用模板（Template）中的表达式和绑定，并报告它发现的所有类型错误。
默认情况下，Angular 会以严格模式检查模板。
如有需要，你可以在 [Angular 编译器选项](/reference/configs/angular-compiler-options) 中把 `strictTemplates` 标志设为 `false`，暂时退出严格模式，回退到检查不那么全面的基本模式。

### 基本模式

在基本类型检查模式下（即 `strictTemplates` 标志设为 `false` 时），Angular 只验证模板中的顶层表达式。

如果你写的是 `<map [city]="user.address.city">`，编译器会验证以下几点：

- `user` 是组件（Component）类上的一个属性
- `user` 是一个具有 address 属性的对象
- `user.address` 是一个具有 city 属性的对象

编译器不会验证 `user.address.city` 的值能否赋给 `<map>` 组件的 city 输入属性。

在这种模式下，编译器还有一些重大限制：

- 重要的是，它不会检查嵌入式视图，例如 `@if`、`@for`、`*ngIf`、`*ngFor` 或其他 `<ng-template>` 嵌入式视图。
- 它不会推断 `#refs` 的类型、管道（Pipe）的结果，也不会推断事件绑定中 `$event` 的类型。

在很多情况下，这些内容最终都会成为 `any` 类型，从而导致表达式的后续部分得不到检查。

### 严格模式

严格模式是默认模式，当 `strictTemplates` 标志为 `true` 或未设置时启用。

在严格模式下，Angular 会执行以下操作：

- 检查嵌入式视图（例如 `@if`、`@for`、`*ngIf` 或 `*ngFor` 中的视图）
- 推断管道的正确返回类型
- 推断指向指令（Directive）和管道的本地引用的正确类型
- 验证组件/指令的绑定能否赋给它们的 `input()`
- 验证输入绑定时遵循 TypeScript 的 `strictNullChecks` 标志
- 推断组件/指令的正确类型，包括泛型
- 在已配置的情况下推断模板上下文类型（例如，让 `NgFor` 能得到正确的类型检查）
- 推断组件/指令、DOM 和动画事件绑定中 `$event` 的正确类型
- 根据标签名推断指向 DOM 元素的本地引用的正确类型（例如，`document.createElement` 对该标签所返回的类型）

## `*ngFor` 的检查

两种类型检查模式对嵌入式视图的处理方式不同。
来看下面的例子。

```ts [User interface]
interface User {
  name: string;
  address: {
    city: string;
    state: string;
  };
}
```

```html
<div *ngFor="let user of users">
  <h2>{{config.title}}</h2>
  <span>City: {{user.address.city}}</span>
</div>
```

`<h2>` 和 `<span>` 都位于 `*ngFor` 嵌入式视图中。
在基本模式下，Angular 不会检查其中任何一个。
在严格模式下，Angular 知道 `<span>` 中的 `user` 是 `User` 类型，并且 `address` 是一个具有 `string` 类型 `city` 属性的对象。

## 排查模板错误

使用严格模式时，你可能会遇到在基本模式下不会出现的模板错误。
这些错误往往代表模板中确实存在之前的工具没有捕获到的类型不匹配。
如果是这种情况，错误消息应该会清楚地指出问题出现在模板中的哪个位置。

当 Angular 库的类型定义不完整或不正确，或者类型定义与预期不太一致时，也可能出现误报，例如以下情况：

- 库的类型定义错误或不完整（例如，库在编写时没有考虑 `strictNullChecks`，因而缺少 `null | undefined`）
- 库的输入类型过于狭窄，而库又没有添加相应的元数据让 Angular 识别出这一点。
  这通常发生在作为属性使用的 disabled 或其他常见布尔输入上，例如 `<input disabled>`。

- 对 DOM 事件使用 `$event.target` 时（由于事件可能会冒泡，DOM 类型定义中的 `$event.target` 并不具备你所期望的类型）

遇到上述误报时，有以下几种选择：

- 在某些上下文中使用 `$any()` 类型转换函数，让表达式的某一部分退出类型检查
- 在应用的 TypeScript 配置文件 `tsconfig.json` 中设置 `strictTemplates: false`，完全禁用严格检查
- 将某个 _严格性标志_ 设为 `false`，单独禁用某些类型检查操作，同时在其他方面保持严格
- 如果你想同时使用 `strictTemplates` 和 `strictNullChecks`，可以使用 `strictNullInputTypes` 专门让输入绑定退出严格的空值类型检查

下面每个选项的值都跟随 `strictTemplates` 的值（`strictTemplates` 为 `true` 时它们也为 `true`，反之亦然）：

| 严格性标志 | 作用 |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strictInputTypes` | 是否检查绑定表达式能否赋给 `@Input()` 字段。同时也会影响指令泛型类型的推断。 |
| `strictNullInputTypes` | 检查 `@Input()` 绑定时（依据 `strictInputTypes`）是否遵循 `strictNullChecks`。在使用没有考虑 `strictNullChecks` 构建的库时，关闭此选项会很有用。 |
| `strictAttributeTypes` | 是否检查通过文本属性进行的 `@Input()` 绑定。例如，`<input matInput disabled="true">`（将 `disabled` 属性设置为字符串 `'true'`）与 `<input matInput [disabled]="true">`（将 `disabled` 属性设置为布尔值 `true`）。 |
| `strictSafeNavigationTypes` | 是否正确推断安全导航操作的返回类型（例如，`user?.name` 会基于 `user` 的类型被正确推断）。如果禁用，`user?.name` 将是 `any` 类型。 |
| `strictDomLocalRefTypes` | 指向 DOM 元素的本地引用是否具有正确的类型。如果禁用，对于 `<input #ref>`，`ref` 将是 `any` 类型。 |
| `strictOutputEventTypes` | 对于绑定到组件/指令的 `@Output()` 或动画事件的事件绑定，`$event` 是否具有正确的类型。如果禁用，它将是 `any`。 |
| `strictDomEventTypes` | 对于绑定到 DOM 事件的事件绑定，`$event` 是否具有正确的类型。如果禁用，它将是 `any`。 |
| `strictContextGenerics` | 是否正确推断泛型组件的类型参数（包括泛型约束）。如果禁用，所有类型参数都将是 `any`。 |
| `strictLiteralTypes` | 是否推断模板中声明的对象和数组字面量的类型。如果禁用，这些字面量的类型将是 `any`。 |

其他选项（与 `strictTemplates` 无关）：

| 严格性标志 | 作用 |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strictInputAccessModifiers` | 将绑定表达式赋给 `@Input()` 或 `input()` 时，是否遵循 `private`/`protected`/`readonly` 等访问修饰符。如果禁用，则会忽略输入的访问修饰符，只检查类型。注意：此检查仅适用于输入，不适用于输出。 |
| `strictUnclaimedEventNames` | 是否报告这样的事件绑定：其名称既不匹配元素上所应用指令的任何输出，也不匹配任何已知的原生 DOM 事件（即 TypeScript 的 `GlobalEventHandlersEventMap` 中所描述的事件，比较时忽略大小写）。这通常意味着输出名称拼写错误。只有单个标识符的 camelCase 名称会被检查；以短横线分隔的名称（例如 `my-event`，后代元素派发的自定义事件通常采用这种命名）不受检查，在使用 `CUSTOM_ELEMENTS_SCHEMA` 时没有匹配到组件的元素也同样豁免。此选项默认为 `false`，即使 `strictTemplates` 设为 `true` 也是如此。 |

如果使用这些标志进行排查后仍然存在问题，最后的手段是禁用 `strictTemplates`，回退到基本模式。

如果某个类型检查错误用任何推荐的方法都无法解决，那可能是模板类型检查器本身的 bug 导致的。
如果你遇到的错误需要回退到基本模式才能解决，那很可能就是这样的 bug。
如果发生这种情况，请 [提交 issue](https://github.com/angular/angular/issues)，以便团队进行处理。

## 输入与类型检查

模板类型检查器会检查绑定表达式的类型是否与对应指令输入的类型兼容。
例如，来看下面这个组件：

```ts
export interface User {
  name: string;
}

@Component({
  selector: 'user-detail',
  template: '{{ user().name }}',
})
export class UserDetailComponent {
  user = input.required<User>();
}
```

`AppComponent` 的模板这样使用该组件：

```ts
@Component({
  selector: 'app-root',
  template: '<user-detail [user]="selectedUser"></user-detail>',
})
export class AppComponent {
  selectedUser: User | null = null;
}
```

在这里，对 `AppComponent` 的模板进行类型检查时，`[user]="selectedUser"` 绑定对应于 `UserDetailComponent.user` 输入。
因此，Angular 会把 `selectedUser` 属性赋给 `UserDetailComponent.user`，如果它们的类型不兼容，就会产生错误。
TypeScript 会依据其类型系统检查这一赋值，并遵循应用中所配置的 `strictNullChecks` 等标志。

为模板类型检查器提供更具体的模板内类型要求，可以避免运行时类型错误。
在指令定义中提供模板守卫函数，让你自己的指令的输入类型要求尽可能具体。
请参阅本指南中的 [改进自定义指令的模板类型检查](/guide/directives/structural-directives#improving-template-type-checking-for-custom-directives)。

### 严格空值检查

当你启用 `strictTemplates` 和 TypeScript 的 `strictNullChecks` 标志时，在某些不容易避免的情况下可能会出现类型检查错误。
例如：

- 将一个可为空的值绑定到某个库的指令上，而该库没有启用 `strictNullChecks`。

  对于没有启用 `strictNullChecks` 编译的库，其声明文件不会标明某个字段是否可以为 `null`。
  如果该库能够正确处理 `null`，这就会成为问题，因为编译器会拿可为空的值去对照省略了 `null` 类型的声明文件进行检查。
  因此，由于编译器遵循 `strictNullChecks`，它会产生类型检查错误。

- 对一个你知道会同步发出值的 Observable 使用 `async` 管道。

  `async` 管道目前会假设它所订阅的 Observable 可能是异步的，这意味着可能还没有可用的值。
  在这种情况下，它仍然必须返回某个值——也就是 `null`。
  换句话说，`async` 管道的返回类型包含 `null`，在已知 Observable 会同步发出非空值的情况下，这可能会导致错误。

对于上述问题，有两种可能的变通方法：

- 在模板中，在可为空的表达式末尾加上非空断言操作符 `!`，例如

```html
<user-detail [user]="user!"></user-detail>
```

在这个例子中，编译器会忽略可空性上的类型不兼容，就像在 TypeScript 代码中一样。
对于 `async` 管道，请注意表达式需要用括号括起来，例如

```html
<user-detail [user]="(user$ | async)!"></user-detail>
```

- 在 Angular 模板中完全禁用严格空值检查。

  启用 `strictTemplates` 后，仍然可以禁用类型检查的某些方面。
  把 `strictNullInputTypes` 选项设为 `false`，就会在 Angular 模板中禁用严格空值检查。
  该标志适用于应用中的所有组件。

### 给库作者的建议

作为库作者，你可以采取多种措施，为用户提供最佳的使用体验。
首先，启用 `strictNullChecks`，并在适当的时候把 `null` 包含在输入的类型中，可以让使用者明确知道能否传入可为空的值。
此外，你还可以提供专门针对模板类型检查器的类型提示。
请参阅 [改进自定义指令的模板类型检查](/guide/directives/structural-directives#improving-template-type-checking-for-custom-directives) 和 [输入 setter 强制转换](#input-setter-coercion)。

## 输入 setter 强制转换

有时，我们希望指令或组件的某个输入能够修改绑定到它的值，通常是在输入的 setter 中完成。
例如，来看这个自定义按钮组件：

```ts
@Component({
  selector: 'submit-button',
  template: `
    <div class="wrapper">
      <button [disabled]="disabled">Submit</button>
    </div>
  `,
})
class SubmitButton {
  private _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
  }
}
```

在这里，组件的 `disabled` 输入会被传递给模板中的 `<button>`。
只要绑定到该输入的是 `boolean` 值，一切都能按预期工作。
但是，假设使用者在模板中把这个输入当作属性来使用：

```html
<submit-button disabled></submit-button>
```

这与下面的绑定效果相同：

```html
<submit-button [disabled]="''"></submit-button>
```

在运行时，该输入会被设置为空字符串，而空字符串并不是 `boolean` 值。
处理这一问题的 Angular 组件库通常会在 setter 中把值「强制转换」为正确的类型：

```ts

set disabled(value: boolean) {
  this._disabled = (value === '') || value;
}

```

理想情况下，应该把这里 `value` 的类型从 `boolean` 改为 `boolean|''`，以匹配 setter 实际接受的值的集合。
TypeScript 4.3 之前的版本要求 getter 和 setter 具有相同的类型，所以如果 getter 需要返回 `boolean`，setter 就只能使用更窄的类型。

如果使用者启用了 Angular 最严格的模板类型检查，这就会带来问题：空字符串（`''`）实际上无法赋给 `disabled` 字段，因此在使用属性形式时会产生类型错误。

为了解决这个问题，Angular 支持为 `@Input()` 检查一个比输入字段本身声明的类型更宽、更宽松的类型。
在组件类中添加一个带 `ngAcceptInputType_` 前缀的静态属性即可启用此功能：

```ts
class SubmitButton {
  private _disabled: boolean;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value === '' || value;
  }

  static ngAcceptInputType_disabled: boolean | '';
}
```

从 TypeScript 4.3 开始，setter 可以声明为接受 `boolean|''` 类型，这使得输入 setter 强制转换字段不再必要。
因此，输入 setter 强制转换字段已被弃用。

这个字段不需要有值。
它的存在本身就是在告诉 Angular 类型检查器：`disabled` 输入应被视为可以接受与 `boolean|''` 类型匹配的绑定。
后缀应为 `@Input` 的 _字段_ 名称。

需要注意的是，如果某个输入存在 `ngAcceptInputType_` 覆盖，那么 setter 应该能够处理被覆盖类型的任何值。

## 使用 `$any()` 禁用类型检查

把绑定表达式包裹在 `$any()` 类型转换伪函数的调用中，就可以禁用对该表达式的检查。
编译器会把它当作向 `any` 类型的转换，就像在 TypeScript 中使用 `<any>` 或 `as any` 转换一样。

在下面的例子中，把 `person` 转换为 `any` 类型可以消除 `Property address does not exist` 错误。

```ts
@Component({
  selector: 'my-component',
  template: '{{$any(person).address.street}}',
})
class MyComponent {
  person?: Person;
}
```
