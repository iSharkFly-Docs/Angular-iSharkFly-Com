# 将现有表单迁移到信号表单 {#migrating-existing-forms-to-signal-forms}

本指南介绍将现有代码库迁移到信号表单（Signal Forms）的策略，重点关注与
现有响应式表单（Reactive Forms）的互操作性。

## 使用 `compatForm` 自上而下迁移 {#top-down-migration-using-compatform}

有时你可能希望在信号表单中使用现有的响应式 `FormControl` 实例。对于
涉及以下情况的控件，这种做法很有用：

- 复杂的异步逻辑。
- 尚未移植的复杂 RxJS 操作符。
- 与现有第三方库的集成。

### 将 `FormControl` 集成到信号表单中 {#integrating-a-formcontrol-into-a-signal-form}

假设现有一个 `passwordControl`，它使用了一个专门的 `enterprisePasswordValidator`。你无需重写这个
验证器（validator），而是可以把该控件桥接到你的信号（Signal）状态中。

我们可以使用 `compatForm` 来实现：

```ts
import {signal} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {compatForm} from '@angular/forms/signals/compat';

// 1. 带有专门验证器的现有控件
const passwordControl = new FormControl('', {
  validators: [Validators.required, enterprisePasswordValidator()],
  nonNullable: true,
});

// 2. 把它包装进你的表单状态信号中
const user = signal({
  email: '',
  password: passwordControl, // 直接嵌套现有控件
});

// 3. 创建表单
const f = compatForm(user);

// 通过信号树访问值
console.log(f.email().value()); // 当前的 email 值
console.log(f.password().value()); // passwordControl 的当前值

// 响应式状态会被自动代理
const isPasswordValid = f.password().valid();
const passwordErrors = f.password().errors(); // 如果现有验证器未通过，则返回 CompatValidationError
```

在模板（Template）中，通过绑定底层控件来使用标准的响应式语法：

```html
<form novalidate>
  <div>
    <label>
      Email:
      <input [formField]="f.email" />
    </label>
  </div>

  <div>
    <label>
      Password:
      <input [formField]="f.password" type="password" />
    </label>

    @if (f.password().touched() && f.password().invalid()) {
      <div class="error-list">
        @for (error of f.password().errors(); track error) {
          <p>{{ errorMessage(error) }}</p>
        }
      </div>
    }
  </div>
</form>
```

来自现有验证器的错误是 `CompatValidationError`。它们不会设置 `message`；验证器返回的错误对象可以通过 `context` 获取：

```ts
import {ValidationError} from '@angular/forms/signals';
import {CompatValidationError} from '@angular/forms/signals/compat';

errorMessage(error: ValidationError) {
  if (error instanceof CompatValidationError) {
    return (error.context as {message?: string} | null)?.message ?? error.kind;
  }
  return error.message ?? error.kind;
}
```

::: code-group

```ts [app.ts]
import {JsonPipe} from '@angular/common';
import {Component, computed, signal} from '@angular/core';
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import {FormField, ValidationError} from '@angular/forms/signals';
import {compatForm, CompatValidationError} from '@angular/forms/signals/compat';

// 本示例使用的模拟 enterprisePasswordValidator
function enterprisePasswordValidator() {
  return (control: AbstractControl) => {
    if (control.value && control.value.length < 8) {
      return {enterprisePassword: {message: 'Password must be at least 8 characters.'}};
    }
    return null;
  };
}

@Component({
  selector: 'app',
  imports: [FormField, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // 1. 带有专门验证器的现有旧版控件
  readonly passwordControl = new FormControl('', {
    validators: [Validators.required, enterprisePasswordValidator()],
    nonNullable: true,
  });

  // 2. 把它包装进你的表单状态信号中
  readonly user = signal({
    email: '',
    password: this.passwordControl, // 直接嵌套旧版控件
  });

  // 3. 创建表单
  readonly f = compatForm(this.user);

  // 我们必须手动提取值，因为 JSON 管道无法序列化 FormControl
  readonly formValue = computed(() => ({
    email: this.f.email().value(),
    password: this.f.password().value(),
  }));

  errorMessage(error: ValidationError) {
    // 来自响应式验证器的错误会把验证器的错误对象保存在 `context` 中。
    if (error instanceof CompatValidationError) {
      return (error.context as {message?: string} | null)?.message ?? error.kind;
    }
    return error.message ?? error.kind;
  }

  constructor() {
    console.log(this.f.email().value()); // ""
    console.log(this.f.password().value()); // passwordControl 的当前值
  }
}
```

```html [app.html]
<form>
  <div>
    <label>
      Email:
      <input [formField]="f.email" />
    </label>
  </div>

  <div>
    <label>
      Password:
      <input [formField]="f.password" type="password" />
    </label>

    @if (f.password().touched() && f.password().invalid()) {
      <div class="error-list">
        @for (error of f.password().errors(); track error) {
          <p>{{ errorMessage(error) }}</p>
        }
      </div>
    }
  </div>
  <h3>Value</h3>
  <pre>{{ formValue() | json }}</pre>
</form>
```

:::

### 将 `FormGroup` 集成到信号表单中 {#integrating-a-formgroup-into-a-signal-form}

你也可以包装整个 `FormGroup`。当表单中某个可复用的子区块（例如
**地址区块**）仍由现有的响应式表单管理时，这种做法很常见。

```ts
import {signal} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {compatForm} from '@angular/forms/signals/compat';
import {required} from '@angular/forms/signals';

// 1. 一个带有自身验证逻辑的现有地址组
const addressGroup = new FormGroup({
  street: new FormControl('123 Angular Way', Validators.required),
  city: new FormControl('Mountain View', Validators.required),
  zip: new FormControl('94043', Validators.required),
});

// 2. 像普通值一样把它放进状态中
const checkoutModel = signal({
  customerName: 'Pirojok the Cat',
  shippingAddress: addressGroup,
});

const f = compatForm(checkoutModel, (p) => {
  required(p.customerName);
});
```

`shippingAddress` 字段在信号表单树中充当一个分支。你可以通过 `.control()` 访问底层的现有控件，
从而在模板中绑定这些嵌套控件：

```html
<form novalidate>
  <h3>Shipping Details</h3>

  <div>
    <label>
      Customer Name:
      <input [formField]="f.customerName" />
    </label>

    @if (f.customerName().touched() && f.customerName().invalid()) {
      <div class="error-list">
        <p>Customer name is required.</p>
      </div>
    }
  </div>

  <fieldset>
    <legend>Address</legend>

    @let street = f.shippingAddress().control().controls.street;
    <div>
      <label>
        Street:
        <input [formControl]="street" />
      </label>
      @if (street.touched && street.invalid) {
        <div class="error-list">
          <p>Street is required</p>
        </div>
      }
    </div>

    @let city = f.shippingAddress().control().controls.city;
    <div>
      <label>
        City:
        <input [formControl]="city" />
      </label>
      @if (city.touched && city.invalid) {
        <div class="error-list">
          <p>City is required</p>
        </div>
      }
    </div>

    @let zip = f.shippingAddress().control().controls.zip;
    <div>
      <label>
        Zip Code:
        <input [formControl]="zip" />
      </label>
      @if (zip.touched && zip.invalid) {
        <div class="error-list">
          <p>Zip Code is required</p>
        </div>
      }
    </div>
  </fieldset>
</form>
```

::: code-group

```ts [app.ts]
import {JsonPipe} from '@angular/common';
import {Component, computed, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormField, required} from '@angular/forms/signals';
import {compatForm} from '@angular/forms/signals/compat';

@Component({
  selector: 'app',
  imports: [ReactiveFormsModule, FormField, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // 1. 一个带有自身验证逻辑的旧版地址组
  readonly addressGroup = new FormGroup({
    street: new FormControl('123 Angular Way', Validators.required),
    city: new FormControl('Mountain View', Validators.required),
    zip: new FormControl('94043', Validators.required),
  });

  // 2. 像普通值一样把它放进状态中
  readonly checkoutModel = signal({
    customerName: '',
    shippingAddress: this.addressGroup,
  });

  // 3. 创建表单
  readonly f = compatForm(this.checkoutModel, (p) => {
    required(p.customerName);
  });

  // 我们必须手动提取值，因为 JSON 管道无法序列化 FormControl
  readonly formValue = computed(() => ({
    customerName: this.f.customerName().value(),
    shippingAddress: this.f.shippingAddress().value(),
  }));

  constructor() {
    console.log('Customer Name:', this.f.customerName().value());
    console.log('Street:', this.f.shippingAddress().value().street);
  }
}
```

```html [app.html]
<form>
  <h3>Shipping Details</h3>

  <div>
    <label>
      Customer Name:
      <input [formField]="f.customerName" />
    </label>

    @if (f.customerName().touched() && f.customerName().invalid()) {
      <div class="error-list">
        <p>Customer name is required.</p>
      </div>
    }
  </div>

  <fieldset>
    <legend>Address</legend>

    @let street = f.shippingAddress().control().controls.street;
    <div>
      <label>
        Street:
        <input [formControl]="street" />
      </label>
      @if (street.touched && street.invalid) {
        <div class="error-list">
          <p>Street is required</p>
        </div>
      }
    </div>

    @let city = f.shippingAddress().control().controls.city;
    <div>
      <label>
        City:
        <input [formControl]="city" />
      </label>
      @if (city.touched && city.invalid) {
        <div class="error-list">
          <p>City is required</p>
        </div>
      }
    </div>

    @let zip = f.shippingAddress().control().controls.zip;
    <div>
      <label>
        Zip Code:
        <input [formControl]="zip" />
      </label>
      @if (zip.touched && zip.invalid) {
        <div class="error-list">
          <p>Zip Code is required</p>
        </div>
      }
    </div>
  </fieldset>
  <h3>Value</h3>
  <pre>{{ formValue() | json }}</pre>
</form>
```

:::

### 访问值 {#accessing-values}

虽然 `compatForm` 会在 `FormControl` 层级上代理值的访问，但完整的表单值仍会保留控件本身：

```ts
const passwordControl = new FormControl('password' /** ... */);

const user = signal({
  email: '',
  password: passwordControl, // 直接嵌套现有控件
});

const form = compatForm(user);
form.password().value(); // 'password'
form().value(); // { email: '', password: FormControl}
```

如果你需要获取把控件解包后的完整表单值，请使用 `@angular/forms/signals/compat` 中的 `extractValue`：

```ts
import {extractValue} from '@angular/forms/signals/compat';

const formValue = computed(() => extractValue(form)); // {email: '', password: 'password'}
```

## 自下而上迁移 {#bottom-up-migration}

### 将信号表单集成到 `FormGroup` 中 {#integrating-a-signal-form-into-a-formgroup}

你可以使用 `SignalFormControl` 把基于信号的表单暴露为一个标准的 `FormControl`。当你想把表单的叶子节点
迁移到信号，同时保留父级 `FormGroup` 结构时，这种做法很有用。

```ts
import {Component, signal} from '@angular/core';
import {ReactiveFormsModule, FormGroup} from '@angular/forms';
import {SignalFormControl} from '@angular/forms/signals/compat';
import {required} from '@angular/forms/signals';

@Component({
  // ...
  imports: [ReactiveFormsModule],
})
export class UserProfile {
  // 1. 创建一个 SignalFormControl，并使用信号表单规则。
  emailControl = new SignalFormControl('', (p) => {
    required(p, {message: 'Email is required'});
  });

  // 2. 在现有的 FormGroup 中使用它
  form = new FormGroup({
    email: this.emailControl,
  });
}
```

`SignalFormControl` 会在**信号表单**系统和**响应式表单**系统之间双向同步值：

- **信号 -> 响应式**：通过信号表单更新值，会立即更新响应式表单控件。

```ts
// 信号表单更新
this.emailControl.fieldTree().value.set('new@example.com');

// 响应式表单反映了这一变化
console.log(this.form.value); // {email: 'new@example.com'}
```

- **响应式 -> 信号**：通过父级 `FormGroup` 更新值，会更新信号表单的状态。

```ts
// 响应式表单更新
this.form.patchValue({email: 'other@example.com'});

// 信号表单反映了这一变化
console.log(this.emailControl.fieldTree().value()); // 'other@example.com'
```

### 绑定 `SignalFormControl` {#binding-signalformcontrol}

要在 `FormGroup` 中使用 `SignalFormControl`，请把它作为控件传入，并在模板中通过 `.fieldTree` 进行绑定：

```ts
readonly emailControl = new SignalFormControl('', (p) => { required(p); });

readonly form = new FormGroup({
  name: new FormControl('Alice'),
  email: this.emailControl,
});
```

```html
<form [formGroup]="form">
  <!-- 标准控件 -->
  <input formControlName="name" />

  <!-- 信号控件 -->
  <input [formField]="emailControl.fieldTree" />
</form>
```

```html
<!-- 避免：对 SignalFormControl 使用 formControlName 或 [formControl] -->
<input formControlName="email" />
<input [formControl]="emailControl" />
```

### 为什么 `SignalFormControl` 接收的是值而不是信号 {#why-signalformcontrol-takes-a-value-instead-of-a-signal}

在标准的信号表单中，你通过传入一个信号来创建表单：`form(mySignal)`。

然而，`SignalFormControl` 的第一个参数接收的是一个**原始值**（例如字符串或对象）：

```ts
// 接收原始值，而不是信号
const userControl = new SignalFormControl({
  email: 'pirojok@example.com',
});
```

`SignalFormControl` 会在内部创建信号，以便拦截写入操作，并触发响应式表单所期望的**同步更新**。

你仍然可以通过 `.sourceValue` 访问这个内部信号：

```ts
const value = userControl.sourceValue();
```

### 禁用 / 启用控件 {#disabling-enabling-control}

`SignalFormControl` 有意不支持用于更改启用 / 禁用状态的命令式 API（例如 `enable()`、`disable()`）。
这是因为控件的状态应当从信号状态和规则中派生出来。

尝试调用 disable/enable 会抛出错误。

```ts
import {signal, effect} from '@angular/core';
import {SignalFormControl} from '@angular/forms/signals/compat';

export class UserProfile {
  readonly emailControl = new SignalFormControl('');

  readonly isLoading = signal(false);

  constructor() {
    // 这里会抛出错误
    effect(() => {
      if (this.isLoading()) {
        this.emailControl.disable();
      } else {
        this.emailControl.enable();
      }
    });
  }
}
```

应改用 disabled 规则：

```ts
import {signal} from '@angular/core';
import {SignalFormControl} from '@angular/forms/signals/compat';
import {disabled} from '@angular/forms/signals';

export class UserProfile {
  readonly isLoading = signal(false);

  readonly emailControl = new SignalFormControl('', (p) => {
    // 只要 isLoading 为 true，控件就会被禁用
    disabled(p, {when: () => this.isLoading()});
  });

  async saveData() {
    this.isLoading.set(true);
    // ... 执行保存 ...
    this.isLoading.set(false);
  }
}
```

### 动态操作 {#dynamic-manipulation}

用于添加或移除验证器的命令式 API（例如 `addValidators()`、`removeValidators()`、`setValidators()`）
在 `SignalFormControl` 中是有意不支持的。

尝试调用这些方法会抛出错误。

```ts
export class UserProfile {
  readonly emailControl = new SignalFormControl('');
  readonly isRequired = signal(false);

  toggleRequired() {
    this.isRequired.update((v) => !v);
    // 这里会抛出错误
    if (this.isRequired()) {
      this.emailControl.addValidators(Validators.required);
    } else {
      this.emailControl.removeValidators(Validators.required);
    }
  }
}
```

应改用 `applyWhen` 规则来有条件地应用验证器：

```ts
import {signal} from '@angular/core';
import {SignalFormControl} from '@angular/forms/signals/compat';
import {applyWhen, required} from '@angular/forms/signals';

export class UserProfile {
  readonly isRequired = signal(false);

  readonly emailControl = new SignalFormControl('', (p) => {
    // 只要 isRequired 为 true，控件就会变为必填
    applyWhen(
      p,
      () => this.isRequired(),
      (p) => {
        required(p);
      },
    );
  });
}
```

### 手动设置错误 {#manual-error-selection}

不支持 `setErrors()` 和 `markAsPending()` 方法。在信号表单中，错误是从验证规则和
异步验证状态中派生出来的。如果你需要报告某个错误，应当在 schema 中
通过验证规则以声明式的方式来实现。

## 自动状态类 {#automatic-status-classes}

响应式表单 / 模板驱动表单会自动添加 [class attribute](/guide/forms/template-driven-forms#track-control-states)（
例如 `.ng-valid` 或 `.ng-dirty`），以便为控件状态设置样式。信号表单不会这样做。

如果你希望保留这种行为，可以提供 `NG_STATUS_CLASSES` 预设：

```ts
import {provideSignalFormsConfig} from '@angular/forms/signals';
import {NG_STATUS_CLASSES} from '@angular/forms/signals/compat';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideSignalFormsConfig({
      classes: NG_STATUS_CLASSES,
    }),
  ],
});
```

你也可以提供自己的自定义配置，根据自定义逻辑应用任意你想要的类：

```ts
import {provideSignalFormsConfig} from '@angular/forms/signals';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideSignalFormsConfig({
      classes: {
        'ng-valid': ({state}) => state().valid(),
        'ng-invalid': ({state}) => state().invalid(),
        'ng-touched': ({state}) => state().touched(),
        'ng-dirty': ({state}) => state().dirty(),
      },
    }),
  ],
});
```

## 自定义控件 {#custom-controls}

任何[自定义信号表单控件](/guide/forms/signals/custom-controls)都可以
直接与响应式表单（以及模板驱动表单（Template-driven Forms））配合使用。这样你就可以把
现有的 `ControlValueAccessor` 实现迁移为
`FormValueControl`/`FormCheckboxControl`，而不会破坏现有的用法。

::: warning 重要
**不要**在同一个组件（Component）上同时实现 `ControlValueAccessor` 和
`FormValueControl`/`FormCheckboxControl`。只实现其中
之一即可。

:::

假设有如下自定义控件：

```ts
import {Component, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

@Component({
  selector: 'app-basic-input',
  template: `
    <div class="basic-input">
      <input
        type="text"
        [value]="value()"
        (input)="value.set($event.target.value)"
        placeholder="Enter text..."
      />
    </div>
  `,
})
export class BasicInput implements FormValueControl<string> {
  /** 当前的输入值 */
  value = model('');
}
```

你可以像使用原生输入框或基于 `ControlValueAccessor` 的自定义控件一样，
把这个自定义控件用于响应式表单。例如，来看下面这个
使用响应式表单的简单组件。

```ts
import {Component} from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import {BasicInput} from './basic-input';

@Component({
  selector: 'app-example',
  template: `
    <form [formGroup]="reactiveFormGroup">
      <app-basic-input formControlName="reactiveControlName" />
    </form>
    <p>Text: {{ reactiveFormGroup.value.reactiveControlName }}</p>
  `,
  imports: [ReactiveFormsModule, BasicInput],
})
export class ExampleComponent {
  readonly reactiveFormGroup = new FormGroup({
    reactiveControlName: new FormControl(''),
  });
}
```

对自定义控件 `app-basic-input` 的任何更改都会反映到
响应式 `FormControl` 中。
