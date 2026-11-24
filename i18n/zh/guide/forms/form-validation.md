# 验证表单输入

通过验证用户输入的准确性和完整性，你可以提高整体数据质量。
本页介绍如何在响应式表单（Reactive Forms）和模板驱动表单（Template-driven Forms）中验证来自 UI 的用户输入，并显示有用的验证消息。

## 在模板驱动表单中验证输入

要为模板驱动表单添加验证，你只需添加与[原生 HTML 表单验证](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5/Constraint_validation)相同的验证 attribute。
Angular 使用指令（Directive）将这些 attribute 与框架中的验证器（validator）函数相匹配。

每当表单控件（form control）的值发生变化时，Angular 都会运行验证，并生成一个验证错误列表（导致 `INVALID` 状态），或者生成 `null`（导致 `VALID` 状态）。

然后，你可以通过把 `ngModel` 导出到一个局部模板变量（template variable）来检查控件的状态。
下面的例子把 `NgModel` 导出到名为 `name` 的变量中：

```html [actor-form-template.component.html (name)]
<input
  type="text"
  id="name"
  name="name"
  class="form-control"
  required
  minlength="4"
  appForbiddenName="bob"
  [(ngModel)]="actor.name"
  #name="ngModel"
/>

@if (name.invalid && (name.dirty || name.touched)) {
  <div class="alert">
    @if (name.hasError('required')) {
      <div>Name is required.</div>
    }
    @if (name.hasError('minlength')) {
      <div>Name must be at least 4 characters long.</div>
    }
    @if (name.hasError('forbiddenName')) {
      <div>Name cannot be Bob.</div>
    }
  </div>
}
```

请注意这个例子展示的以下特性。

- `<input>` 元素带有 HTML 验证 attribute：`required` 和 `minlength`。
  它还带有一个自定义验证器指令 `forbiddenName`。
  更多信息参见[自定义验证器](#defining-custom-validators)一节。

- `#name="ngModel"` 把 `NgModel` 导出到名为 `name` 的局部变量中。
  `NgModel` 镜像了其底层 `FormControl` 实例的许多属性，因此你可以在模板（Template）中用它来检查控件状态，例如 `valid` 和 `dirty`。
  完整的控件属性列表，参见 [AbstractControl](https://angular.dev/api/forms/AbstractControl) API 参考。
  - 最外层的 `@if` 会显示一组嵌套消息，但仅当 `name` 无效且控件处于 `dirty` 或 `touched` 状态时才显示。

  - 每个嵌套的 `@if` 可以针对某一种可能的验证错误显示自定义消息。
    这里分别有针对 `required`、`minlength` 和 `forbiddenName` 的消息。

::: tip 提示
为了防止在用户有机会编辑表单之前验证器就显示错误，你应该检查控件的 `dirty` 或 `touched` 状态。

:::

- 当用户修改被监视字段的值时，控件会被标记为 "dirty"
- 当用户让表单控件元素失去焦点时，控件会被标记为 "touched"

## 在响应式表单中验证输入

在响应式表单中，事实之源是组件（Component）类。
你不是通过模板中的 attribute 来添加验证器，而是直接在组件类中把验证器函数添加到表单控件模型上。
之后每当控件的值发生变化时，Angular 就会调用这些函数。

### 验证器函数

验证器函数可以是同步的，也可以是异步的。

| 验证器类型   | 详情                                                                                                                                                                                                                 |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 同步验证器  | 同步函数，接收一个控件实例，并立即返回一组验证错误或 `null`。在实例化 `FormControl` 时把它们作为第二个参数传入。                       |
| 异步验证器 | 异步函数，接收一个控件实例，并返回一个 Promise 或 Observable，稍后发出一组验证错误或 `null`。在实例化 `FormControl` 时把它们作为第三个参数传入。 |

出于性能考虑，只有在所有同步验证器都通过之后，Angular 才会运行异步验证器。
每个验证器都必须完成之后才会设置错误。

### 内置验证器函数

你可以选择[编写自己的验证器函数](#defining-custom-validators)，也可以使用 Angular 的一些内置验证器。

在模板驱动表单中可以作为 attribute 使用的那些内置验证器（例如 `required` 和 `minlength`），都可以作为 `Validators` 类中的函数来使用。
内置验证器的完整列表，参见 [Validators](https://angular.dev/api/forms/Validators) API 参考。

要把演员表单改成响应式表单，可以使用一些相同的
内置验证器——这次使用函数形式，如下例所示。

```ts [actor-form-reactive.component.ts (validator functions)]
actorForm = new FormGroup({
  name: new FormControl(this.actor.name, [
    Validators.required,
    Validators.minLength(4),
    forbiddenNameValidator(/bob/i), // <-- 这里展示了如何传入自定义验证器。
  ]),
  role: new FormControl(this.actor.role),
  skill: new FormControl(this.actor.skill, Validators.required),
});

get name() {
  return this.actorForm.get('name');
}

get skill() {
  return this.actorForm.get('skill');
}
```

在这个例子中，`name` 控件设置了两个内置验证器——`Validators.required` 和 `Validators.minLength(4)`——以及一个自定义验证器 `forbiddenNameValidator`。

这些验证器都是同步的，因此作为第二个参数传入。
请注意，你可以通过以数组形式传入这些函数来支持多个验证器。

这个例子还添加了几个 getter 方法。
在响应式表单中，你总是可以通过父级表单组上的 `get` 方法访问任何表单控件，但有时为模板定义一些 getter 作为简写会很有用。

再看一下 `name` 输入框的模板，它与模板驱动的例子相当相似。

```html [actor-form-reactive.component.html (name with error msg)]
<input type="text" id="name" class="form-control" formControlName="name" required />

@if (name.invalid && (name.dirty || name.touched)) {
  <div class="alert alert-danger">
    @if (name.hasError('required')) {
      <div>Name is required.</div>
    }
    @if (name.hasError('minlength')) {
      <div>Name must be at least 4 characters long.</div>
    }
    @if (name.hasError('forbiddenName')) {
      <div>Name cannot be Bob.</div>
    }
  </div>
}
```

这个表单与模板驱动版本的不同之处在于，它不再导出任何指令，而是使用组件类中定义的 `name` getter。

请注意，模板中仍然保留了 `required` attribute。虽然它对验证来说不是必需的，但出于无障碍访问的考虑应该保留它。

## 定义自定义验证器

内置验证器并不总是能与你的应用场景完全匹配，因此有时你需要创建自定义验证器。

看一下前面例子中的 `forbiddenNameValidator` 函数。
该函数的定义如下。

```ts [forbidden-name.directive.ts (forbiddenNameValidator)]
/** 演员的名字不能匹配给定的正则表达式 */
export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? {forbiddenName: {value: control.value}} : null;
  };
}
```

这个函数是一个工厂函数，它接收一个用于检测*特定*禁用名字的正则表达式，并返回一个验证器函数。

在这个示例中，禁用的名字是 "bob"，因此验证器会拒绝任何包含 "bob" 的演员名字。
在其他地方，它也可以拒绝 "alice"，或者任何与所配置的正则表达式匹配的名字。

`forbiddenNameValidator` 工厂返回配置好的验证器函数。
该函数接收一个 Angular 控件对象，如果控件值有效就返回 null，*否则*返回一个验证错误对象。
验证错误对象通常有一个属性，其名称是验证键 `'forbiddenName'`，其值是一个任意的值字典，你可以把这些值插入到错误消息中，例如 `{name}`。

自定义异步验证器与同步验证器类似，但它们必须返回一个 Promise 或 Observable，稍后发出 null 或一个验证错误对象。
如果是 Observable，它必须完成，此时表单会使用它最后发出的值进行验证。

### 为响应式表单添加自定义验证器

在响应式表单中，直接把函数传给 `FormControl` 即可添加自定义验证器。

```ts [actor-form-reactive.component.ts (validator functions)]
actorForm = new FormGroup({
  name: new FormControl(this.actor.name, [
    Validators.required,
    Validators.minLength(4),
    forbiddenNameValidator(/bob/i), // <-- 这里展示了如何传入自定义验证器。
  ]),
  role: new FormControl(this.actor.role),
  skill: new FormControl(this.actor.skill, Validators.required),
});
```

### 为模板驱动表单添加自定义验证器

在模板驱动表单中，要向模板添加一个指令，由该指令包装验证器函数。
例如，对应的 `ForbiddenValidatorDirective` 就是 `forbiddenNameValidator` 的包装器。

Angular 能识别该指令在验证过程中的作用，是因为该指令把自己注册到了 `NG_VALIDATORS` 提供者（Provider）中，如下例所示。
`NG_VALIDATORS` 是一个预定义的提供者，包含一个可扩展的验证器集合。

```ts [forbidden-name.directive.ts (providers)]
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ForbiddenValidatorDirective),
      multi: true,
    },
  ],
})
export class ForbiddenValidatorDirective implements Validator {
  readonly forbiddenName = input<string>('', {alias: 'appForbiddenName'});

  validate(control: AbstractControl): ValidationErrors | null {
    return this.forbiddenName()
      ? forbiddenNameValidator(new RegExp(this.forbiddenName(), 'i'))(control)
      : null;
  }
}
```

然后，该指令类实现了 `Validator` 接口，以便能轻松地与 Angular 表单集成。
下面是该指令的其余部分，帮助你了解它们是如何组合在一起的。

```ts [forbidden-name.directive.ts (directive)]
@Directive({
  selector: '[appForbiddenName]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ForbiddenValidatorDirective),
      multi: true,
    },
  ],
})
export class ForbiddenValidatorDirective implements Validator {
  readonly forbiddenName = input<string>('', {alias: 'appForbiddenName'});

  validate(control: AbstractControl): ValidationErrors | null {
    return this.forbiddenName()
      ? forbiddenNameValidator(new RegExp(this.forbiddenName(), 'i'))(control)
      : null;
  }
}
```

一旦 `ForbiddenValidatorDirective` 准备就绪，你就可以把它的选择器（selector）`appForbiddenName` 添加到任何 input 元素上来激活它。
例如：

```html [actor-form-template.component.html (forbidden-name-input)]
<input
  type="text"
  id="name"
  name="name"
  class="form-control"
  required
  minlength="4"
  appForbiddenName="bob"
  [(ngModel)]="actor.name"
  #name="ngModel"
/>
```

::: tip 提示
请注意，这个自定义验证指令是用 `useExisting` 而不是 `useClass` 来实例化的。
注册的验证器必须是 `ForbiddenValidatorDirective` 的*这个实例*——也就是表单中 `forbiddenName` 属性绑定到 "bob" 的那个实例。

:::

如果你把 `useExisting` 换成 `useClass`，那么你注册的将是一个新的类实例，它没有 `forbiddenName`。

## 控件状态 CSS 类

Angular 会自动把许多控件属性以 CSS 类的形式镜像到表单控件元素上。
你可以使用这些类，根据表单的状态为表单控件元素设置样式。
目前支持以下这些类。

- `.ng-valid`
- `.ng-invalid`
- `.ng-pending`
- `.ng-pristine`
- `.ng-dirty`
- `.ng-untouched`
- `.ng-touched`
- `.ng-submitted`（仅限外层的 form 元素）

在下面的例子中，演员表单使用 `.ng-valid` 和 `.ng-invalid` 类来
设置每个表单控件边框的颜色。

```css [forms.css (status classes)]
.ng-valid[required], .ng-valid.required  {
  border-left: 5px solid #42A948; /* 绿色 */
}

.ng-invalid:not(form)  {
  border-left: 5px solid #a94442; /* 红色 */
}

.alert div {
  background-color: #fed3d3;
  color: #820000;
  padding: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: .5rem;
}

select {
  width: 100%;
  padding: .5rem;
}
```

## 跨字段验证

跨字段验证器是一种[自定义验证器](#defining-custom-validators '了解自定义验证器')，它会比较表单中不同字段的值，并根据它们的组合来接受或拒绝。
例如，你的表单可能提供了互不兼容的选项，用户可以选择 A 或 B，但不能同时选择两者。
某些字段的值也可能依赖于其他字段；例如只有在选择了 A 时，才允许用户选择 B。

下面的跨字段验证示例展示了如何做到以下几点：

- 根据两个同级控件的值来验证响应式表单或模板驱动表单的输入，
- 在用户与表单交互过且验证失败后，显示一条描述性的错误消息。

这些示例使用跨字段验证来确保演员在填写演员表单（Actor Form）时，不会在角色中重复使用相同的名字。
验证器通过检查演员名字和角色是否相同来实现这一点。

### 为响应式表单添加跨字段验证

该表单的结构如下：

```ts
const actorForm = new FormGroup({
  'name': new FormControl(),
  'role': new FormControl(),
  'skill': new FormControl(),
});
```

请注意，`name` 和 `role` 是同级控件。
要在单个自定义验证器中同时评估这两个控件，你必须在它们的共同祖先控件 `FormGroup` 中执行验证。
你可以查询 `FormGroup` 的子控件，从而比较它们的值。

要为 `FormGroup` 添加验证器，请在创建时把新的验证器作为第二个参数传入。

```ts
const actorForm = new FormGroup(
  {
    'name': new FormControl(),
    'role': new FormControl(),
    'skill': new FormControl(),
  },
  {validators: unambiguousRoleValidator},
);
```

验证器的代码如下。

```ts [unambiguous-role.directive.ts]
/** 演员的名字不能与演员的角色相同 */
export const unambiguousRoleValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const name = control.get('name');
  const role = control.get('role');

  return name && role && name.value === role.value ? {unambiguousRole: true} : null;
};
```

`unambiguousRoleValidator` 验证器实现了 `ValidatorFn` 接口。
它接收一个 Angular 控件对象作为参数，如果表单有效就返回 null，否则返回 `ValidationErrors`。

该验证器通过调用 `FormGroup` 的 [get](https://angular.dev/api/forms/AbstractControl#get) 方法获取子控件，然后比较 `name` 和 `role` 控件的值。

如果两个值不同，说明角色没有歧义，两者都有效，验证器返回 null。
如果两个值相同，说明演员的角色有歧义，验证器必须通过返回一个错误对象把表单标记为无效。

为了提供更好的用户体验，当表单无效时，模板会显示一条相应的错误消息。

```html [actor-form-reactive.component.html]
@if (actorForm.hasError('unambiguousRole') && (actorForm.touched || actorForm.dirty)) {
  <div class="cross-validation-error-message alert alert-danger">
    Name cannot match role or audiences will be confused.
  </div>
}
```

如果 `FormGroup` 带有 `unambiguousRoleValidator` 验证器返回的跨字段验证错误，这个 `@if` 就会显示该错误，但仅当用户已经完成了[与表单的交互](#control-status-css-classes)时才显示。

### 为模板驱动表单添加跨字段验证

对于模板驱动表单，你必须创建一个指令来包装验证器函数。
你可以使用 [`NG_VALIDATORS` 令牌](https://angular.dev/api/forms/NG_VALIDATORS)把该指令作为验证器提供出去，如下例所示。

```ts [unambiguous-role.directive.ts]
@Directive({
  selector: '[appUnambiguousRole]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => UnambiguousRoleValidatorDirective),
      multi: true,
    },
  ],
})
export class UnambiguousRoleValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return unambiguousRoleValidator(control);
  }
}
```

你必须把这个新指令添加到 HTML 模板中。
由于验证器必须注册在表单的最高层级，下面的模板把该指令放在了 `form` 标签上。

```html [actor-form-template.component.html]
<form #actorForm="ngForm" appUnambiguousRole>
```

为了提供更好的用户体验，当表单无效时会显示一条相应的错误消息。

```html [actor-form-template.component.html]
@if (actorForm.hasError('unambiguousRole') && (actorForm.touched || actorForm.dirty)) {
  <div class="cross-validation-error-message alert">Name cannot match role.</div>
}
```

这一点在模板驱动表单和响应式表单中都是一样的。

## 创建异步验证器

异步验证器实现了 `AsyncValidatorFn` 和 `AsyncValidator` 接口。
它们与对应的同步版本非常相似，区别如下。

- `validate()` 函数必须返回一个 Promise 或 Observable，
- 返回的 Observable 必须是有限的，也就是说它必须在某个时刻完成。
  要把一个无限的 Observable 转换成有限的，可以通过 `first`、`last`、`take` 或 `takeUntil` 等过滤操作符对它进行管道处理。

异步验证在同步验证之后进行，并且只有在同步验证成功时才会执行。
这项检查让表单在更基础的验证方法已经发现无效输入时，可以避免执行可能代价高昂的异步验证过程（例如 HTTP 请求）。

异步验证开始后，表单控件会进入 `pending` 状态。
你可以检查控件的 `pending` 属性，并用它为正在进行的验证操作提供视觉反馈。

一种常见的 UI 模式是在执行异步验证时显示一个加载指示器（spinner）。
下面的例子展示了如何在模板驱动表单中实现这一点。

```html
<input [(ngModel)]="name" #model="ngModel" appSomeAsyncValidator />

@if (model.pending) {
  <app-spinner />
}
```

### 实现自定义异步验证器

在下面的例子中，异步验证器确保演员被分配到一个尚未被占用的角色。
新演员不断参加试镜，老演员不断退休，因此无法提前获取可用角色的列表。
为了验证可能填入的角色，验证器必须发起一个异步操作，去查询一个包含所有当前已选定演员的中央数据库。

下面的代码创建了验证器类 `UniqueRoleValidator`，它实现了 `AsyncValidator` 接口。

```ts [role.directive.ts]
@Service()
export class UniqueRoleValidator implements AsyncValidator {
  private readonly actorsService = inject(ActorsService);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.actorsService.isRoleTaken(control.value).pipe(
      map((isTaken) => (isTaken ? {uniqueRole: true} : null)),
      catchError(() => of(null)),
    );
  }
}
```

`actorsService` 属性被初始化为 `ActorsService` 令牌的一个实例，该令牌定义了如下接口。

```ts
interface ActorsService {
  isRoleTaken: (role: string) => Observable<boolean>;
}
```

在真实的应用中，`ActorsService` 会负责向演员数据库发起 HTTP 请求，检查该角色是否可用。
从验证器的角度看，服务（Service）的实际实现并不重要，因此这个例子只需针对 `ActorsService` 接口编写代码即可。

验证开始时，`UniqueRoleValidator` 会使用当前控件值调用 `ActorsService` 的 `isRoleTaken()` 方法。
此时控件被标记为 `pending`，并一直保持这个状态，直到 `validate()` 方法返回的 Observable 链完成。

`isRoleTaken()` 方法会发出一个 HTTP 请求来检查该角色是否可用，并返回 `Observable<boolean>` 作为结果。
`validate()` 方法通过 `map` 操作符对响应进行管道处理，并把它转换成验证结果。

然后，与任何验证器一样，该方法在表单有效时返回 `null`，无效时返回 `ValidationErrors`。
这个验证器使用 `catchError` 操作符处理任何可能出现的错误。
在这个例子中，验证器把 `isRoleTaken()` 的错误视为验证成功，因为验证请求失败并不一定意味着角色无效。
你也可以用不同的方式处理错误，转而返回 `ValidationError` 对象。

经过一段时间后，Observable 链完成，异步验证也就结束了。
`pending` 标志被设置为 `false`，表单的有效性也随之更新。

### 为响应式表单添加异步验证器

要在响应式表单中使用异步验证器，首先把验证器注入到组件类的一个属性中。

```ts [actor-form-reactive.component.ts]
roleValidator = inject(UniqueRoleValidator);
```

然后，直接把验证器函数传给 `FormControl` 来应用它。

在下面的例子中，`UniqueRoleValidator` 的 `validate` 函数被应用到 `roleControl` 上：把它传给控件的 `asyncValidators` 选项，并把它绑定到注入到 `ActorFormReactiveComponent` 中的那个 `UniqueRoleValidator` 实例上。
`asyncValidators` 的值可以是单个异步验证器函数，也可以是一个函数数组。
要了解 `FormControl` 选项的更多信息，参见 [AbstractControlOptions](https://angular.dev/api/forms/AbstractControlOptions) API 参考。

```ts [actor-form-reactive.component.ts]
const roleControl = new FormControl('', {
  asyncValidators: [this.roleValidator.validate.bind(this.roleValidator)],
  updateOn: 'blur',
});
```

### 为模板驱动表单添加异步验证器

要在模板驱动表单中使用异步验证器，请创建一个新指令，并在其上注册 `NG_ASYNC_VALIDATORS` 提供者。

在下面的例子中，该指令注入了包含实际验证逻辑的 `UniqueRoleValidator` 类，并在 `validate` 函数中调用它；当需要进行验证时，Angular 会触发这个函数。

```ts [role.directive.ts]
@Directive({
  selector: '[appUniqueRole]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => UniqueRoleValidatorDirective),
      multi: true,
    },
  ],
})
export class UniqueRoleValidatorDirective implements AsyncValidator {
  private readonly validator = inject(UniqueRoleValidator);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.validator.validate(control);
  }
}
```

然后，与同步验证器一样，把该指令的选择器添加到一个 input 上来激活它。

```html [actor-form-template.component.html (unique-unambiguous-role-input)]
<input
  type="text"
  id="role"
  name="role"
  #role="ngModel"
  [(ngModel)]="actor.role"
  [ngModelOptions]="{updateOn: 'blur'}"
  appUniqueRole
/>
```

### 优化异步验证器的性能

默认情况下，每次表单值发生变化后，所有验证器都会运行。
对于同步验证器，这通常不会对应用性能产生明显影响。
然而，异步验证器通常会执行某种 HTTP 请求来验证控件。
每次按键后都发出一个 HTTP 请求可能会给后端 API 带来压力，应尽可能避免。

你可以把 `updateOn` 属性从 `change`（默认值）改为 `submit` 或 `blur`，从而推迟表单有效性的更新。

对于模板驱动表单，在模板中设置该属性。

```html
<input [(ngModel)]="name" [ngModelOptions]="{updateOn: 'blur'}" />
```

对于响应式表单，在 `FormControl` 实例中设置该属性。

```ts
new FormControl('', {updateOn: 'blur'});
```

## 在响应式表单中动态管理验证器

在复杂的响应式表单中，你可能需要根据用户输入或应用状态来添加、移除或修改验证器。
Angular 在 `AbstractControl` 上提供了几个方法，让你无需重新创建表单控件就能在运行时管理验证器。

### 添加和移除验证器

[`addValidators`](https://angular.dev/api/forms/AbstractControl#addValidators) 和 [`removeValidators`](https://angular.dev/api/forms/AbstractControl#removeValidators) 方法允许你在初始化之后修改控件的验证器。
Angular 按引用匹配验证器，因此你传给 `removeValidators` 的函数必须与传给 `addValidators` 的是同一个。

```ts
private readonly usPostalCode = Validators.pattern(/^\d{5}$/);

onCountryChange(country: string) {
    const postalCodeControl = this.profileForm.get('postalCode');

    if (country === 'US') {
      // 为美国邮政编码添加验证器
      postalCodeControl.addValidators([Validators.required, this.usPostalCode]);
    } else {
      // 不是美国时移除验证器
      postalCodeControl.removeValidators([Validators.required, this.usPostalCode]);
    }

    postalCodeControl.updateValueAndValidity();
}
```

### 替换所有验证器

使用 [`setValidators`](https://angular.dev/api/forms/AbstractControl#setValidators) 替换控件上所有现有的同步验证器，或使用 [`clearValidators`](https://angular.dev/api/forms/AbstractControl#clearValidators) 移除所有验证器。

```ts
toggleStrictNameValidation(isStrict: boolean) {
  const nameControl = this.profileForm.get('name');

  if (isStrict) {
    // 设置严格的验证规则
    nameControl.setValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z]+$/),
    ]);
  } else {
    // 清除所有验证器
    nameControl.clearValidators();
  }

  nameControl.updateValueAndValidity();
}
```

同样的模式也适用于异步验证器，对应的方法是 [`addAsyncValidators`](https://angular.dev/api/forms/AbstractControl#addAsyncValidators)、[`removeAsyncValidators`](https://angular.dev/api/forms/AbstractControl#removeAsyncValidators)、[`setAsyncValidators`](https://angular.dev/api/forms/AbstractControl#setAsyncValidators) 和 [`clearAsyncValidators`](https://angular.dev/api/forms/AbstractControl#clearAsyncValidators)。

### 触发验证更新

修改验证器之后，调用 [`updateValueAndValidity`](https://angular.dev/api/forms/AbstractControl#updateValueAndValidity) 来重新计算控件的验证状态。
这个方法接受一些选项来控制更新行为。

```ts
// 更新控件并通知父级
control.updateValueAndValidity();

// 只更新控件本身，不通知父级，也不发出事件
control.updateValueAndValidity({onlySelf: true, emitEvent: false});
```

## 与原生 HTML 表单验证的交互

默认情况下，Angular 会在外层的 `<form>` 上添加 `novalidate` attribute 来禁用[原生 HTML 表单验证](https://developer.mozilla.org/docs/Web/Guide/HTML/Constraint_validation)，并使用指令把这些 attribute 与框架中的验证器函数相匹配。
如果你想把原生验证与基于 Angular 的验证**结合**使用，可以通过 `ngNativeValidate` 指令重新启用它。
详情参见 [API 文档](https://angular.dev/api/forms/NgForm#native-dom-validation-ui)。
