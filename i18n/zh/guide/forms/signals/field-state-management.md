# 字段状态管理

信号表单（Signal Forms）的字段状态让你能够对用户交互做出响应：它提供了一组响应式信号（Signal），分别表示验证状态（如 `valid`、`invalid`、`errors`）、交互跟踪（如 `touched`、`dirty`）以及可用性（如 `disabled`、`hidden`）。

## 理解字段状态

当你用 [`form()`](https://angular.dev/api/forms/signals/form) 函数创建表单时，它会返回一个**字段树**（field tree）——一个与表单模型结构相对应的对象结构。树中的每个字段（field）都可以通过点号语法访问（例如 [`form.email`](https://angular.dev/api/forms/signals/FieldTree)）。

### 访问字段状态

把字段树中的任意字段当作函数调用（例如 [`form.email()`](https://angular.dev/api/forms/signals/FieldState)），会返回一个 `FieldState` 对象，其中包含一组响应式信号，用于跟踪该字段的验证、交互和可用性状态。例如，`invalid()` 信号会告诉你该字段是否存在验证错误：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, email} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <input type="email" [formField]="registrationForm.email" />

    @if (registrationForm.email().invalid()) {
      <p class="error">Email has validation errors:</p>
      <ul>
        @for (error of registrationForm.email().errors(); track error) {
          <li>{{ error.message }}</li>
        }
      </ul>
    }
  `,
})
export class Registration {
  registrationModel = signal({
    email: '',
    password: '',
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});
  });
}
```

在这个例子中，模板（Template）通过检查 `registrationForm.email().invalid()` 来决定是否显示错误消息。

### 字段状态信号

最常用的信号是 `value()`，它是一个 `WritableSignal`，用于访问字段的当前值：

```ts
const emailValue = registrationForm.email().value();
console.log(emailValue); // 当前的 email 字符串
```

除了 `value()`，字段状态还包含用于验证、交互跟踪和可用性控制的信号：

| 类别                                | 信号       | 说明                                                                       |
| --------------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| **[验证](#validation-state)**     | `valid()`    | 字段通过了所有验证规则，且没有处于等待中的验证器                   |
|                                         | `invalid()`  | 字段存在验证错误                                                       |
|                                         | `errors()`   | 验证错误对象的数组                                                 |
|                                         | `pending()`  | 异步验证正在进行中                                                      |
| **[交互](#interaction-state)**   | `touched()`  | 用户曾聚焦并移出该字段（仅限可交互字段）                           |
|                                         | `dirty()`    | 用户修改过该字段（仅限可交互字段），即使当前值与初始值相同 |
| **[可用性](#availability-state)** | `disabled()` | 字段已禁用，且不影响父表单的状态                            |
|                                         | `hidden()`   | 表示字段应被隐藏；它在模板中是否可见由 `@if` 控制 |
|                                         | `readonly()` | 字段为只读，且不影响父表单的状态                            |

借助这些信号，你可以构建能对用户行为做出响应的表单交互体验。下面各节会逐一详细介绍每个类别。

## 验证状态

验证状态信号会告诉你字段是否有效，以及它包含哪些错误。

::: info 注意
本指南侧重于在模板和逻辑中**使用**验证状态（例如读取 `valid()`、`invalid()`、`errors()` 来显示反馈）。关于如何**定义**验证规则和创建自定义验证器（validator），请参阅[验证指南](/guide/forms/signals/validation)。

:::

### 检查有效性

使用 `valid()` 和 `invalid()` 检查验证状态：

```ts
@Component({
  template: `
    <input type="email" [formField]="loginForm.email" />

    @if (loginForm.email().invalid()) {
      <p class="error">Email is invalid</p>
    }
    @if (loginForm.email().valid()) {
      <p class="success">Email looks good</p>
    }
  `,
})
export class Login {
  loginModel = signal({email: '', password: ''});
  loginForm = form(this.loginModel);
}
```

| 信号      | 何时返回 `true`                                             |
| ----------- | --------------------------------------------------------------- |
| `valid()`   | 字段通过了所有验证规则，且没有处于等待中的验证器 |
| `invalid()` | 字段存在验证错误                                     |

在代码中检查有效性时，如果你想区分「存在错误」和「验证等待中」，请使用 `invalid()` 而不是 `!valid()`。原因在于：当异步验证处于等待状态时，`valid()` 和 `invalid()` 可能同时为 `false`——字段还不是有效的，因为验证尚未完成；同时它也不是无效的，因为目前还没有发现任何错误。

### 读取验证错误

使用 `errors()` 访问验证错误数组，或使用 `getError()` 获取单个错误。每个错误对象包含：

| 属性    | 说明                                                     |
| ----------- | --------------------------------------------------------------- |
| `kind`      | 未通过的验证规则（例如 "required" 或 "email"） |
| `message`   | 可选的、便于人阅读的错误消息                           |
| `fieldTree` | 指向发生错误的 `FieldTree` 的引用           |

::: info 注意
`message` 属性是可选的。验证器可以提供自定义错误消息；如果没有指定，你可能需要自行把错误的 `kind` 值映射为对应的消息。

:::

下面的例子演示了如何在模板中通过验证错误数组来显示错误：

```ts
@Component({
  template: `
    <input type="email" [formField]="loginForm.email" />

    @if (loginForm.email().errors().length > 0) {
      <div class="errors">
        @for (error of loginForm.email().errors(); track error) {
          <p>{{ error.message }}</p>
        }
      </div>
    }
  `
})
```

这种方式会遍历字段的所有错误，并把每条错误消息显示给用户。

下面的例子演示了如何在模板中使用 `getError()` 显示单个错误：

```ts
@Component({
  template: `
    <input type="email" [formField]="loginForm.email" />

    @if (loginForm.email().getError('required'); as error) {
      <div class="errors">
        <p>{{ error.message }}</p>
      </div>
    }
  `
})
```

`getError()` 接受任意字符串作为错误的 `kind`，并能识别内置的验证错误类型（例如 "required"、"email"、"minLength"）。

### 等待中的验证

`pending()` 信号表示异步验证正在进行中：

```ts
@Component({
  template: `
    <input type="email" [formField]="signupForm.email" />

    @if (signupForm.email().pending()) {
      <p>Checking if email is available...</p>
    }

    @if (signupForm.email().invalid() && !signupForm.email().pending()) {
      <p>Email is already taken</p>
    }
  `
})
```

借助这个信号，你可以在异步验证执行期间显示加载状态。

## 交互状态

交互状态跟踪用户是否与字段发生过交互，从而支持「仅在用户触碰过字段之后才显示错误」之类的模式。

### 已触碰状态

`touched()` 信号跟踪用户是否曾聚焦并随后移出某个字段，或者该字段是否已通过编程方式被标记为已触碰（touched）。只有可交互的字段才会变为已触碰；隐藏、禁用和只读字段不会因用户交互或 `markAsTouched()` 而变为已触碰。

如果你需要通过一个区块级的操作来显示该区块内的验证错误，可以在该区块字段上调用 `markAsTouched()`。`skipDescendants` 的默认值为 `false`，因此这个调用会把区块字段及其每个后代字段都标记为已触碰。

例如，结账流程可以在允许用户进入下一步之前，先验证收货信息区块：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';

@Component({
  selector: 'app-checkout-shipping',
  imports: [FormField],
  template: `
    <label>
      Name
      <input [formField]="checkoutForm.shipping.name" />
    </label>
    @if (checkoutForm.shipping.name().touched() && checkoutForm.shipping.name().invalid()) {
      <p>{{ checkoutForm.shipping.name().errors()[0].message }}</p>
    }

    <label>
      Address
      <input [formField]="checkoutForm.shipping.address" />
    </label>
    @if (checkoutForm.shipping.address().touched() && checkoutForm.shipping.address().invalid()) {
      <p>{{ checkoutForm.shipping.address().errors()[0].message }}</p>
    }

    <button type="button" (click)="continueToPayment()">Continue</button>

    @if (showPayment() && checkoutForm.shipping().valid()) {
      <p>Ready for payment.</p>
    }
  `,
})
export class CheckoutShipping {
  checkoutModel = signal({
    shipping: {
      name: '',
      address: '',
    },
  });

  showPayment = signal(false);

  checkoutForm = form(this.checkoutModel, (schemaPath) => {
    required(schemaPath.shipping.name, {message: 'Enter a name'});
    required(schemaPath.shipping.address, {message: 'Enter an address'});
  });

  continueToPayment() {
    this.checkoutForm.shipping().markAsTouched();

    if (this.checkoutForm.shipping().invalid()) {
      return;
    }

    this.showPayment.set(true);
  }
}
```

当 `continueToPayment()` 在 `checkoutForm.shipping()` 上调用 `markAsTouched()` 时，使用的是默认的 `skipDescendants: false` 行为。Angular 会把 `shipping`、`shipping.name` 和 `shipping.address` 都标记为已触碰，因此子字段中基于 `touched() && invalid()` 的错误消息会在整个表单提交之前就显示出来。

::: info 注意
只有当你希望接收调用的字段变为已触碰、而不改变其后代字段的已触碰状态时，才传入 `{skipDescendants: true}`。

:::

### 已修改状态

表单经常需要检测数据是否真的发生了变化——例如，提醒用户有未保存的更改，或者只在必要时才启用保存按钮。`dirty()` 信号跟踪用户是否修改过该字段。

当用户修改了某个可交互字段的值时，`dirty()` 信号会变为 `true`，并且即使之后把值改回与初始值相同，它仍然保持为 `true`：

```ts
@Component({
  template: `
    <form novalidate>
      <input [formField]="profileForm.name" />
      <input [formField]="profileForm.bio" />

      @if (profileForm().dirty()) {
        <p class="warning">You have unsaved changes</p>
      }
    </form>
  `,
})
export class Profile {
  profileModel = signal({name: 'Alice', bio: 'Developer'});
  profileForm = form(this.profileModel);
}
```

`dirty()` 可用于「未保存的更改」提醒，或者只在数据发生变化时才启用保存按钮。

### 已触碰与已修改的区别

这两个信号跟踪的是不同类型的交互状态：

| 信号      | 何时变为 true                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `touched()` | 用户曾聚焦并移出某个可交互字段，或者该字段已通过编程方式被标记为已触碰                          |
| `dirty()`   | 用户修改过某个可交互字段（即使从未移出该字段，即使当前值与初始值相同） |

字段可能处于以下不同的组合状态：

| 状态                  | 场景                                                  |
| ---------------------- | --------------------------------------------------------- |
| 已触碰但未修改  | 用户聚焦并移出了字段，但没有做任何更改    |
| 已触碰且已修改 | 用户聚焦了字段、修改了值，然后移出 |

::: info 注意
隐藏、禁用和只读字段都是不可交互的——它们不会因用户交互而变为已触碰或已修改。

:::

## 可用性状态

可用性状态信号控制字段是否可交互、可编辑或可见。禁用、隐藏和只读字段都是不可交互的，它们不会影响父表单是否有效、是否已触碰或是否已修改。

### 禁用字段

`disabled()` 信号表示字段是否接受用户输入。禁用字段会显示在 UI 中，但用户无法与之交互。

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  // 提示：`[formField]` 指令会根据字段的 `disabled()` 状态自动绑定 `disabled` attribute，
  // 因此你无需手动添加 `[disabled]="field().disabled()"`
  template: `
    <input [formField]="orderForm.couponCode" />

    @if (orderForm.couponCode().disabled()) {
      <p class="info">Coupon code is only available for orders over $50</p>
    }
  `,
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    disabled(schemaPath.couponCode, {when: ({valueOf}) => valueOf(schemaPath.total) < 50});
  });
}
```

在这个例子中，我们使用 `valueOf(schemaPath.total)` 检查 `total` 字段的值，以决定 `couponCode` 是否应被禁用。

::: info 注意
schema 回调参数（这些例子中的 `schemaPath`）是一个 `SchemaPathTree` 对象，它提供了指向表单中所有字段的路径。你可以随意给这个参数命名。

:::

在定义 `disabled()`、`hidden()` 或 `readonly()` 等规则时，`when` 函数会接收一个 `FieldContext` 对象，通常会对它进行解构（例如 `({valueOf})`）。验证规则中常用的两个方法是：

- `valueOf(schemaPath.otherField)` - 读取表单中另一个字段的值
- `value()` - 一个信号，包含当前规则所作用字段的值

禁用字段不会参与父表单的验证状态。即使某个禁用字段本应是无效的，父表单仍然可以是有效的。`disabled()` 状态会影响交互性和验证，但不会改变字段的值。

### 隐藏字段

`hidden()` 信号表示字段是否被有条件地隐藏。将 `hidden()` 与 `@if` 结合使用，可以根据条件显示或隐藏字段：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, hidden} from '@angular/forms/signals';

@Component({
  selector: 'app-profile',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="profileForm.isPublic" />
      Make profile public
    </label>

    @if (!profileForm.publicUrl().hidden()) {
      <label>
        Public URL
        <input [formField]="profileForm.publicUrl" />
      </label>
    }
  `,
})
export class Profile {
  profileModel = signal({
    isPublic: false,
    publicUrl: '',
  });

  profileForm = form(this.profileModel, (schemaPath) => {
    hidden(schemaPath.publicUrl, {when: ({valueOf}) => !valueOf(schemaPath.isPublic)});
  });
}
```

隐藏字段不参与验证。如果某个必填字段被隐藏了，它不会阻止表单提交。`hidden()` 状态会影响可用性和验证，但不会改变字段的值。

### 只读字段

`readonly()` 信号表示字段是否为只读。只读字段会显示其值，但用户无法编辑：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, readonly} from '@angular/forms/signals';

@Component({
  selector: 'app-account',
  imports: [FormField],
  template: `
    <label>
      Username (cannot be changed)
      <input [formField]="accountForm.username" />
    </label>

    <label>
      Email
      <input [formField]="accountForm.email" />
    </label>
  `,
})
export class Account {
  accountModel = signal({
    username: 'johndoe',
    email: 'john@example.com',
  });

  accountForm = form(this.accountModel, (schemaPath) => {
    readonly(schemaPath.username);
  });
}
```

::: info 注意
`[formField]` 指令会根据字段的 `readonly()` 状态自动绑定 `readonly` attribute，因此你无需手动添加 `[readonly]="field().readonly()"`。

:::

与禁用字段和隐藏字段一样，只读字段也是不可交互的，不会影响父表单的状态。`readonly()` 状态会影响可编辑性和验证，但不会改变字段的值。

### 何时使用哪一种

| 状态        | 适用场景                                                            | 用户能否看到 | 用户能否交互 | 是否参与验证 |
| ------------ | ------------------------------------------------------------------- | --------------- | ----------------- | ------------------------- |
| `disabled()` | 字段暂时不可用（例如取决于其他字段的值） | 能             | 否                | 否                        |
| `hidden()`   | 字段与当前上下文无关                               | 否（配合 @if）   | 否                | 否                        |
| `readonly()` | 值应当可见但不可编辑                            | 能             | 否                | 否                        |

## 表单级状态

根表单本身也是字段树中的一个字段。把它当作函数调用时，同样会返回一个 `FieldState` 对象，该对象汇总了所有子字段的状态。

### 访问表单状态

```ts
import {Component, signal} from '@angular/core';
import {FormField, FormRoot, form, required} from '@angular/forms/signals';

@Component({
  imports: [FormRoot, FormField],
  template: `
    <form [formRoot]="loginForm">
      <input [formField]="loginForm.email" />
      <input [formField]="loginForm.password" />

      <button type="submit" [disabled]="!loginForm().valid()">Sign In</button>
    </form>
  `,
})
export class Login {
  loginModel = signal({email: '', password: ''});
  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email);
    required(schemaPath.password);
  });
}
```

在这个例子中，只有当所有子字段都有效时，表单才是有效的。这样你就可以根据表单的整体有效性来启用或禁用提交按钮。

### 表单级信号

由于根表单也是一个字段，它拥有相同的信号（例如 `valid()`、`invalid()`、`touched()`、`dirty()` 等）。

| 信号      | 表单级行为                                            |
| ----------- | -------------------------------------------------------------- |
| `valid()`   | 所有可交互字段都有效，且没有处于等待中的验证器 |
| `invalid()` | 至少有一个可交互字段存在验证错误           |
| `pending()` | 至少有一个可交互字段的异步验证处于等待中    |
| `touched()` | 表单本身或至少一个可交互的后代字段已被触碰   |
| `dirty()`   | 用户修改过至少一个可交互字段               |

### 何时使用表单级状态与字段级状态

**以下情况使用表单级状态：**

- 提交按钮的启用 / 禁用状态
- 「保存」按钮的状态
- 表单整体有效性检查
- 未保存更改的提醒

**以下情况使用字段级状态：**

- 单个字段的错误消息
- 针对特定字段的样式
- 逐字段的验证反馈
- 字段的条件可用性

## 状态传播

字段状态会从子字段开始，经由父级字段组，一路向上传播到根表单。

### 子字段状态如何影响父表单

当某个子字段变为无效时，它的父级字段组也会变为无效，根表单同样如此。当某个子字段变为已触碰或已修改时，父级字段组和根表单也会反映这一变化。这种汇总机制让你可以在任意层级检查有效性——无论是单个字段还是整个表单。

```ts
const userModel = signal({
  profile: {
    firstName: '',
    lastName: '',
  },
  address: {
    street: '',
    city: '',
  },
});

const userForm = form(userModel);

// 如果 firstName 无效，则 profile 无效
userForm.profile.firstName().invalid() === true;
// → userForm.profile().invalid() === true
// → userForm().invalid() === true
```

### 隐藏、禁用和只读字段

隐藏、禁用和只读字段都是不可交互的，不会影响父表单的状态：

```ts
const orderModel = signal({
  customerName: '',
  requiresShipping: false,
  shippingAddress: '',
});

const orderForm = form(orderModel, (schemaPath) => {
  hidden(schemaPath.shippingAddress, {when: ({valueOf}) => !valueOf(schemaPath.requiresShipping)});
});
```

在这个例子中，当 `shippingAddress` 被隐藏时，它不会影响表单的有效性。因此，即使 `shippingAddress` 为空且是必填的，表单仍然可以是有效的。

这种行为可以防止隐藏、禁用或只读字段阻碍表单提交，或影响验证、已触碰和已修改状态。

## 在模板中使用状态

字段状态信号与 Angular 模板无缝集成，无需手动处理事件即可实现响应式的表单交互体验。

### 有条件地显示错误

仅在用户与字段交互之后才显示错误：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, email} from '@angular/forms/signals';

@Component({
  selector: 'app-signup',
  imports: [FormField],
  template: `
    <label>
      Email
      <input type="email" [formField]="signupForm.email" />
    </label>

    @if (signupForm.email().touched() && signupForm.email().invalid()) {
      <p class="error">{{ signupForm.email().errors()[0].message }}</p>
    }
  `,
})
export class Signup {
  signupModel = signal({email: '', password: ''});

  signupForm = form(this.signupModel, (schemaPath) => {
    email(schemaPath.email);
  });
}
```

这种模式可以避免在用户还没来得及与字段交互时就显示错误。只有当用户聚焦并离开该字段之后，错误才会出现。

### 字段的条件可用性

将 `hidden()` 信号与 `@if` 结合使用，可以有条件地显示或隐藏字段：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, hidden} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="orderForm.requiresShipping" />
      Requires shipping
    </label>

    @if (!orderForm.shippingAddress().hidden()) {
      <label>
        Shipping Address
        <input [formField]="orderForm.shippingAddress" />
      </label>
    }
  `,
})
export class Order {
  orderModel = signal({
    requiresShipping: false,
    shippingAddress: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    hidden(schemaPath.shippingAddress, {
      when: ({valueOf}) => !valueOf(schemaPath.requiresShipping),
    });
  });
}
```

隐藏字段不参与验证，因此即使隐藏字段本应是无效的，表单仍然可以提交。

### 跟踪数组字段的值

在信号表单中，遍历一组字段的 `@for` 块应按字段的身份进行跟踪。

```ts
@Component({
  imports: [FormField],
  template: `
    @for (field of form.emails; track field) {
      <input [formField]="field" />
    }
  `,
})
export class App {
  formModel = signal({emails: ['john.doe@mail.com', 'max.musterman@mail.com']});
  form = form(this.formModel);
}
```

表单系统本身已经在跟踪数组中的模型值，并会为它自动创建的字段维护稳定的身份。

当某一项发生变化时，即使它的某些属性看起来相同，它也可能代表一个新的逻辑实体。按身份跟踪可以确保框架把它当作一个独立的条目，而不是复用已有的 UI 元素。这样可以防止表单输入框之类的有状态元素被错误地共享，并让绑定（Binding）始终与模型中正确的部分保持对应。

## 在组件逻辑中使用字段状态

字段状态信号可以与 Angular 的 `computed()`、`effect()` 等响应式原语配合使用，实现更高级的表单逻辑。

### 提交前的验证检查

在组件（Component）方法中检查表单的有效性：

```ts
export class Registration {
  registrationModel = signal({
    username: '',
    email: '',
    password: '',
  });

  registrationForm = form(this.registrationModel);

  async onSubmit() {
    // 等待所有处于等待中的异步验证
    if (this.registrationForm().pending()) {
      console.log('Waiting for validation...');
      return;
    }

    // 防止提交无效数据
    if (this.registrationForm().invalid()) {
      console.error('Form is invalid');
      return;
    }

    const data = this.registrationModel();
    await this.api.register(data);
  }
}
```

这样可以确保只有有效且已完成全部验证的数据才会到达你的 API。

### 使用 computed 派生状态

基于字段状态创建计算信号（Computed），使其在底层字段状态变化时自动更新：

```ts
export class Password {
  passwordModel = signal({password: '', confirmPassword: ''});
  passwordForm = form(this.passwordModel);

  // 计算密码强度指示
  passwordStrength = computed(() => {
    const password = this.passwordForm.password().value();
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    return 'strong';
  });

  // 检查所有必填字段是否都已填写
  allFieldsFilled = computed(() => {
    return (
      this.passwordForm.password().value().length > 0 &&
      this.passwordForm.confirmPassword().value().length > 0
    );
  });
}
```

### 以编程方式更改状态

虽然字段状态通常会随用户交互（输入、聚焦、失焦）而更新，但有时你需要以编程方式控制它。常见场景包括表单提交和重置表单。

#### 表单提交

信号表单提供了一个 `FormRoot` 指令（Directive），用于简化表单提交。它会自动阻止浏览器默认的表单提交行为，并在 `<form>` 元素上设置 `novalidate` attribute。

```ts
import {FormField, FormRoot, form, required, email} from '@angular/forms/signals';
import {Component, signal} from '@angular/core';

@Component({
  imports: [FormRoot, FormField],
  template: `
    <form [formRoot]="registrationForm">
      <input [formField]="registrationForm.username" />
      <input type="email" [formField]="registrationForm.email" />
      <input type="password" [formField]="registrationForm.password" />

      <button type="submit">Register</button>
    </form>
  `,
})
export class Registration {
  registrationModel = signal({username: '', email: '', password: ''});

  registrationForm = form(
    this.registrationModel,
    (schemaPath) => {
      required(schemaPath.username);
      email(schemaPath.email);
      required(schemaPath.password);
    },
    {
      submission: {
        action: async () => this.submitToServer(),
      },
    },
  );

  private submitToServer() {
    // 把数据发送到服务器
  }
}
```

当你把 `FormRoot` 用于带有 `submission` 选项的表单时，提交表单会自动调用 `submit()` 函数。该函数会把所有字段标记为已触碰（从而显示验证错误），并在表单有效时执行你的 `action` 回调。

你也可以不使用该指令，而是调用 `submit(this.registrationForm)` 来手动提交表单。像这样显式调用 `submit` 函数时，你可以传入一个 `FormSubmitOptions` 来覆盖表单默认的 `submission` 逻辑：`submit(this.registrationForm, {action: () => /* ... */ })`。

#### 提交后重置表单

成功提交表单后，你可能希望让它回到初始状态——同时清除用户交互记录和字段值。`reset()` 方法会清除已触碰和已修改标志。你还可以向 `reset()` 传入一个可选的值来更新模型数据：

```ts
export class Contact {
  private readonly INITIAL_MODEL = {name: '', email: '', message: ''};
  contactModel = signal({...this.INITIAL_MODEL});
  contactForm = form(this.contactModel, {
    submission: {
      action: async (f) => {
        await this.api.sendMessage(this.contactModel());
        // 清除交互状态（touched、dirty）并重置为初始值
        f().reset({...this.INITIAL_MODEL});
      },
    },
  });
}
```

这样可以确保表单为新的输入做好准备，而不会显示过时的错误消息或已修改状态的标识。

## 根据验证状态设置样式

你可以根据验证状态绑定 CSS 类，为表单应用自定义样式：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, email} from '@angular/forms/signals';

@Component({
  imports: [FormField],
  template: `
    <input
      type="email"
      [formField]="form.email"
      [class.is-invalid]="form.email().touched() && form.email().invalid()"
      [class.is-valid]="form.email().touched() && form.email().valid()"
    />
  `,
  styles: `
    input.is-invalid {
      border: 2px solid red;
      background-color: white;
    }

    input.is-valid {
      border: 2px solid green;
    }
  `,
})
export class StyleExample {
  model = signal({email: ''});

  form = form(this.model, (schemaPath) => {
    email(schemaPath.email);
  });
}
```

同时检查 `touched()` 和验证状态，可以确保样式只在用户与字段交互之后才会出现。

## 聚焦绑定到表单字段的表单控件

Angular 信号表单在字段状态上提供了 `focusBoundControl()` 方法，让你可以通过编程方式把[焦点](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)移到与指定表单字段关联的表单控件（form control）上。

一个常见的用例是改善表单提交时的无障碍性：当表单无效时，显示错误消息，并自动把焦点移到第一个无效字段上，引导用户进行修正。

### 基本用法

假设有一个注册表单：

```ts
@Component({/* ... */})
export class Registration {
  registrationModel = signal({username: '', email: '', password: ''});
  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.username);
    email(schemaPath.email);
    required(schemaPath.password);
  });
}
```

要把焦点移到绑定到 `email` 字段的控件上：

```ts
registrationForm.email().focusBoundControl();
```

### 防止滚动

如果目标控件位于视口之外，而你希望在聚焦时不触发滚动，可以在调用 `focusBoundControl()` 方法时把 [preventScroll](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#preventscroll) 选项设为 `true`。

```ts
registrationForm.email().focusBoundControl({preventScroll: true});
```

### 提交时聚焦第一个无效字段

当用户提交带有错误的表单时，使用 `errorSummary()` 找到第一个无效字段并聚焦它：

```ts
onSubmit() {
  const firstError = this.registrationForm().errorSummary()[0];
  if (firstError?.fieldTree) {
    firstError.fieldTree().focusBoundControl();
  } else {
    // 继续提交
  }
}
```

### 自定义控件

默认情况下，在自定义控件上调用 `focusBoundControl()` 会聚焦该控件的宿主元素（host element），而宿主元素通常无法获得焦点。一个自定义控件可能包含多个原生输入框，例如日期选择器可能包含独立的日、月、年字段。因此，Angular 无法确定应该由哪个元素获得焦点，也无法确定应执行什么操作。

要在自定义控件中支持编程式聚焦，请实现一个 `focus()` 方法。当在与自定义控件关联的字段状态上调用 `focusBoundControl()` 时，如果该控件存在 `focus()` 方法，Angular 就会调用它。

来看一个自定义密码输入控件：

```html
<div class="password-block">
  <input type="password" #passwordCtrl [value]="value()" (input)="value.set(passwordCtrl.value)" />
</div>
```

```ts
@Component({/* ... */})
export class PasswordInput implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly passwordCtrl = viewChild.required<ElementRef<HTMLInputElement>>('passwordCtrl');

  // 调用 focusBoundControl() 时会自动调用此方法，
  // 前提是在与该自定义控件关联的字段状态上调用
  focus(): void {
    this.passwordCtrl().nativeElement.focus();
  }
}
```

## 后续步骤

本指南介绍了验证状态与可用性状态的处理、交互跟踪以及字段状态的传播。以下相关指南探讨了信号表单的其他方面：

- [表单模型](/guide/forms/signals/models)
- [验证](/guide/forms/signals/validation)
- [自定义控件](/guide/forms/signals/custom-controls)
- [使用数组](https://angular.dev/guide/forms/signals/arrays)

