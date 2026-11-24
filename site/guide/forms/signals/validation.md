# 验证 {#validation}

表单需要验证（validation），以确保用户在提交前提供正确、完整的数据。没有验证，你就得在服务器端处理数据质量问题，用含糊的错误消息带来糟糕的用户体验，还要手动检查每一条约束。

信号表单（Signal Forms）提供了一种基于 schema 的验证方式。验证规则通过 schema 函数绑定到字段（field），在值变化时自动运行，并通过字段状态信号（signal）暴露错误。这样就能实现随用户与表单交互而实时更新的响应式验证。

示例源码：[app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.css)

## 验证基础 {#validation-basics}

信号表单中的验证是通过作为第二个参数传给 `form()` 的 schema 函数来定义的。

### schema 函数 {#the-schema-function}

schema 函数会接收一个 `SchemaPathTree` 对象，你可以用它来定义验证规则：

```ts [app.ts]
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {email, form, FormField, required, submit} from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [FormField],
})
export class App {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});

    required(schemaPath.password, {message: 'Password is required'});
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, {
      action: async () => {
        const credentials = this.loginModel();
        // 在真实应用中，这里会是异步的：
        // await this.authService.login(credentials);
        console.log('Logging in with:', credentials);
      },
    });
  }
}
```

schema 函数只在表单初始化时运行一次。验证规则通过 schema 路径参数（例如 `schemaPath.email`、`schemaPath.password`）绑定到字段，每当字段值变化时，验证都会自动运行。

::: info 注意
schema 回调参数（在这些示例中是 `schemaPath`）是一个 `SchemaPathTree` 对象，提供了指向表单中所有字段的路径。你可以随意给这个参数命名。

:::

### 验证的工作原理 {#how-validation-works}

信号表单中的验证遵循以下模式：

1. **在 schema 中定义验证规则**：在 schema 函数中把验证规则绑定到字段
2. **自动执行**：字段值变化时运行验证规则
3. **错误传播**：验证错误通过字段状态信号暴露出来
4. **响应式更新**：验证状态变化时 UI 自动更新

对于可交互的字段，每次值变化都会运行验证。隐藏、禁用和只读的字段不会运行验证，它们的验证规则会被跳过，直到字段重新变为可交互状态。

### 验证时机 {#validation-timing}

验证规则按以下顺序执行：

1. **同步验证**：值变化时运行所有同步验证规则
2. **异步验证**：只有在所有同步验证规则都通过后，才会运行异步验证规则
3. **字段状态更新**：`valid()`、`invalid()`、`errors()` 和 `pending()` 信号随之更新

同步验证规则（如 `required()`、`email()`）会立即完成。异步验证规则（如 `validateHttp()`）可能需要一些时间，并在执行期间把 `pending()` 信号设为 `true`。

每次变化时所有验证规则都会运行，验证不会在出现第一个错误后短路。如果一个字段同时有 `required()` 和 `email()` 验证规则，两者都会运行，并且可以同时产生错误。

### 原生 HTML 验证 {#native-html-validation}

信号表单**不会**使用浏览器内置的[约束验证](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation)来运行验证规则。这是有意为之：信号表单允许任何组件（component）充当表单控件，而不仅限于原生表单元素。

你的验证规则完全在 Angular 中运行，验证状态通过 `valid()`、`invalid()` 和 `errors()` 等字段状态信号暴露出来，而不是通过元素的原生有效性状态。[`FormRoot` 指令](/guide/forms/signals/form-submission)还会在 form 元素上设置 `novalidate` attribute，避免浏览器阻止提交。

当字段绑定到原生表单元素时，一些内置验证规则会把约束同步到对应的原生 attribute 上：`required()`、`min()`、`max()`、`minLength()` 和 `maxLength()` 会在元素支持时设置 `required`、`min`、`max`、`minlength` 和 `maxlength` attribute。`pattern()` 是个例外，它不会设置原生的 `pattern` attribute。信号表单设置这些 attribute 是为了控制输入行为并提升无障碍性，**而不是为了触发原生验证**。

::: info 注意
有一种情况下信号表单会读取原生有效性状态：当浏览器无法解析原生输入框的值时（例如只输入了一部分的日期），信号表单会将其报告为解析错误。即便如此，这个错误也和其他验证错误一样，通过字段的 `errors()` 信号呈现。详情参见[值转换](/guide/forms/signals/custom-controls#value-transformation)。

:::

::: warning 重要
不要依赖原生有效性特性，例如 `:valid` 和 `:invalid` CSS 伪类、元素的 `validity` 属性或 `validationMessage`。由于同步过去的 attribute，浏览器可能会附带地把某些输入框报告为无效（例如值低于 `min` 的数字输入框），但这种行为因验证规则和输入框类型而异，并不是观察验证状态的受支持方式。

:::

要根据验证状态为控件设置样式，可以把 class 绑定到字段状态信号（参见[字段状态管理](/guide/forms/signals/field-state-management#conditional-error-display)），或者配置自动状态类（参见[自动状态类](/guide/forms/signals/migration#automatic-status-classes)）。

## 内置验证规则 {#built-in-validation-rules}

信号表单为常见的验证场景提供了验证规则。所有内置验证规则都接受一个选项对象，用于自定义错误消息和条件逻辑。

### required() {#required}

`required()` 验证规则确保字段有值：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Username
        <input [formField]="registrationForm.username" />
      </label>

      <label>
        Email
        <input type="email" [formField]="registrationForm.email" />
      </label>

      <button type="submit">Register</button>
    </form>
  `,
})
export class RegistrationComponent {
  registrationModel = signal({
    username: '',
    email: '',
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.username, {message: 'Username is required'});
    required(schemaPath.email, {message: 'Email is required'});
  });
}
```

当字段的值是以下之一时，它被视为「空」；其他任何值都视为非空，
包括 `0` 和空数组 `[]`：

| 条件                     | 示例        |
| ------------------------ | ----------- |
| 值为 `null`              | `null`      |
| 值为 `undefined`         | `undefined` |
| 值为空字符串             | `''`        |
| 值为 `false`             | `false`     |
| 值为 `NaN`               | `NaN`       |

最后两项值得特别说明：

- `false` 被视为空，是为了遵循 `<input type="checkbox">` 上 `required` 的原生语义，
  即未勾选的复选框无法通过验证。
- `NaN` 被视为空，是因为它通常是解析错误的结果，而且不是一个有效的数字。

对于有条件的必填要求，使用 `when` 选项：

```ts
registrationForm = form(this.registrationModel, (schemaPath) => {
  required(schemaPath.promoCode, {
    message: 'Promo code is required for discounts',
    when: ({valueOf}) => valueOf(schemaPath.applyDiscount),
  });
});
```

只有当 `when` 函数返回 `true` 时，该验证规则才会运行。

::: info 注意
`required` 会把空数组视为有值（有效），所以要使用 [`minLength()`](#minlength-and-maxlength) 来强制数组项的最少数量。

:::

### email() {#email}

`email()` 验证规则检查邮箱格式是否有效：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, email} from '@angular/forms/signals';

@Component({
  selector: 'app-contact',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Your Email
        <input type="email" [formField]="contactForm.email" />
      </label>
    </form>
  `,
})
export class ContactComponent {
  contactModel = signal({email: ''});

  contactForm = form(this.contactModel, (schemaPath) => {
    email(schemaPath.email, {message: 'Please enter a valid email address'});
  });
}
```

`email()` 验证规则使用标准的邮箱格式正则表达式。它接受 `user@example.com` 这样的地址，但会拒绝 `user@` 或 `@example.com` 这类格式错误的地址。

### min() 和 max() {#min-and-max}

`min()` 和 `max()` 验证规则用于数值：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, min, max} from '@angular/forms/signals';

@Component({
  selector: 'app-age-form',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Age
        <input type="number" [formField]="ageForm.age" />
      </label>

      <label>
        Rating (1-5)
        <input type="number" [formField]="ageForm.rating" />
      </label>
    </form>
  `,
})
export class AgeFormComponent {
  ageModel = signal({
    age: 0,
    rating: 0,
  });

  ageForm = form(this.ageModel, (schemaPath) => {
    min(schemaPath.age, 18, {message: 'You must be at least 18 years old'});
    max(schemaPath.age, 120, {message: 'Please enter a valid age'});

    min(schemaPath.rating, 1, {message: 'Rating must be at least 1'});
    max(schemaPath.rating, 5, {message: 'Rating cannot exceed 5'});
  });
}
```

你可以使用计算出的值来实现动态约束：

```ts
ageForm = form(this.ageModel, (schemaPath) => {
  min(schemaPath.participants, () => this.minimumRequired(), {
    message: 'Not enough participants',
  });
});
```

### minDate() 和 maxDate() {#mindate-and-maxdate}

`minDate()` 和 `maxDate()` 验证规则用于 `Date` 值，例如绑定到 `<input type="date">` 的字段。它们还会设置该输入框的 `min` 和 `max` attribute。

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, minDate, maxDate} from '@angular/forms/signals';

@Component({
  selector: 'app-booking-form',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Check-in
        <input type="date" [formField]="bookingForm.checkIn" />
      </label>
    </form>
  `,
})
export class BookingFormComponent {
  bookingModel = signal<{checkIn: Date | null}>({checkIn: null});

  bookingForm = form(this.bookingModel, (schemaPath) => {
    minDate(schemaPath.checkIn, new Date('2026-06-01'), {message: 'Bookings open on June 1'});
    maxDate(schemaPath.checkIn, new Date('2026-08-31'), {message: 'Bookings close on August 31'});
  });
}
```

::: warning 重要
无论用户处于哪个时区，`<input type="date">` 读写的 `Date` 值都是 UTC 午夜，因为浏览器的 `valueAsDate` 就是这样工作的。请用同样的方式构造边界值，例如 `new Date('2026-06-01')` 或 `new Date(Date.UTC(2026, 5, 1))`。由本地时间创建的 `Date`，例如 `new Date(2026, 5, 1)` 或 `new Date()`，会按用户的 UTC 偏移量发生偏移。根据时区不同，`min` 或 `max` attribute 可能因此相差一天，边界日期本身也可能被拒绝。

:::

要求日期不早于今天时，应使用用户所在时区的今天日历日期，并以 UTC 午夜表示：

```ts
const now = new Date();
const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

minDate(schemaPath.checkIn, today, {message: 'Check-in cannot be in the past'});
```

直接传入 `new Date()` 可能会拒绝今天的日期，因为在输入框中选取的值是 UTC 午夜，早于当前时间。这种情况会出现在 UTC 时区以及比 UTC 晚的时区中。

### minLength() 和 maxLength() {#minlength-and-maxlength}

`minLength()` 和 `maxLength()` 验证规则用于字符串和数组：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, minLength, maxLength} from '@angular/forms/signals';

@Component({
  selector: 'app-password-form',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Password
        <input type="password" [formField]="passwordForm.password" />
      </label>

      <label>
        Bio
        <textarea [formField]="passwordForm.bio"></textarea>
      </label>
    </form>
  `,
})
export class PasswordFormComponent {
  passwordModel = signal({
    password: '',
    bio: '',
  });

  passwordForm = form(this.passwordModel, (schemaPath) => {
    minLength(schemaPath.password, 8, {message: 'Password must be at least 8 characters'});
    maxLength(schemaPath.password, 100, {message: 'Password is too long'});

    maxLength(schemaPath.bio, 500, {message: 'Bio cannot exceed 500 characters'});
  });
}
```

对于字符串，「长度」指字符数；对于数组，「长度」指元素个数。

### pattern() {#pattern}

`pattern()` 验证规则根据正则表达式进行验证：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, pattern} from '@angular/forms/signals';

@Component({
  selector: 'app-phone-form',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Phone Number
        <input [formField]="phoneForm.phone" placeholder="555-123-4567" />
      </label>

      <label>
        Postal Code
        <input [formField]="phoneForm.postalCode" placeholder="12345" />
      </label>
    </form>
  `,
})
export class PhoneFormComponent {
  phoneModel = signal({
    phone: '',
    postalCode: '',
  });

  phoneForm = form(this.phoneModel, (schemaPath) => {
    pattern(schemaPath.phone, /^\d{3}-\d{3}-\d{4}$/, {
      message: 'Phone must be in format: 555-123-4567',
    });

    pattern(schemaPath.postalCode, /^\d{5}$/, {
      message: 'Postal code must be 5 digits',
    });
  });
}
```

常用模式：

| 模式类型         | 正则表达式              | 示例         |
| ---------------- | ----------------------- | ------------ |
| 电话             | `/^\d{3}-\d{3}-\d{4}$/` | 555-123-4567 |
| 邮政编码（美国） | `/^\d{5}$/`             | 12345        |
| 字母数字         | `/^[a-zA-Z0-9]+$/`      | abc123       |
| URL 安全         | `/^[a-zA-Z0-9_-]+$/`    | my-url_123   |

## 数组项的验证 {#validation-of-array-items}

表单中可以包含嵌套对象的数组（例如订单项列表）。要对数组中的每一项应用验证规则，请在 schema 函数中使用 `applyEach()`。`applyEach()` 会遍历数组路径，并为每一项提供一个路径，你可以像对顶层字段一样在上面应用验证器（validator）。

```ts
import {Component, signal} from '@angular/core';
import {applyEach, FormField, form, min, required, SchemaPathTree} from '@angular/forms/signals';

type Item = {name: string; quantity: number};

interface Order {
  title: string;
  description: string;
  items: Item[];
}

function ItemSchema(item: SchemaPathTree<Item>) {
  required(item.name, {message: 'Item name is required'});
  min(item.quantity, 1, {message: 'Quantity must be at least 1'});
}

@Component(/* ... */)
export class OrderComponent {
  orderModel = signal<Order>({
    title: '',
    description: '',
    items: [{name: '', quantity: 0}],
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    required(schemaPath.title);
    required(schemaPath.description);

    applyEach(schemaPath.items, ItemSchema);
  });
}
```

## 验证错误 {#validation-errors}

验证规则失败时，会产生描述问题所在的错误对象。理解错误的结构有助于你向用户提供清晰的反馈。

::: info 注意
本节介绍验证规则产生的错误。关于如何在 UI 中显示和使用验证错误，请参见[字段状态管理指南](/guide/forms/signals/field-state-management)。

:::

### 错误结构 {#error-structure}

每个验证错误对象都包含以下属性：

| 属性      | 说明                                                                     |
| --------- | ------------------------------------------------------------------------ |
| `kind`    | 失败的验证规则（例如 "required"、"email"、"minLength"）                  |
| `message` | 可选的、供人阅读的错误消息                                               |

内置验证规则会自动设置 `kind` 属性。`message` 属性是可选的，你可以通过验证规则的选项提供自定义消息。

### 自定义错误消息 {#custom-error-messages}

所有内置验证规则都接受 `message` 选项，用于自定义错误文本：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, minLength} from '@angular/forms/signals';

@Component({
  selector: 'app-signup',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Username
        <input [formField]="signupForm.username" />
      </label>

      <label>
        Password
        <input type="password" [formField]="signupForm.password" />
      </label>
    </form>
  `,
})
export class SignupComponent {
  signupModel = signal({
    username: '',
    password: '',
  });

  signupForm = form(this.signupModel, (schemaPath) => {
    required(schemaPath.username, {
      message: 'Please choose a username',
    });

    required(schemaPath.password, {
      message: 'Password cannot be empty',
    });
    minLength(schemaPath.password, 12, {
      message: 'Password must be at least 12 characters for security',
    });
  });
}
```

自定义消息应当清晰、具体，并告诉用户如何解决问题。不要写 "Invalid input"，而应写 "Password must be at least 12 characters for security"。

### 每个字段的多个错误 {#multiple-errors-per-field}

当一个字段有多条验证规则时，每条验证规则都会独立运行，并且都可能产生错误：

```ts
signupForm = form(this.signupModel, (schemaPath) => {
  required(schemaPath.email, {message: 'Email is required'});
  email(schemaPath.email, {message: 'Enter a valid email address'});
  minLength(schemaPath.email, 5, {message: 'Email is too short'});
});
```

如果 email 字段为空，只会出现 `required()` 错误。如果用户输入 "a@"，`email()` 和 `minLength()` 错误都会出现。所有验证规则都会运行，验证不会在第一次失败后停止。

::: tip 提示
在模板（template）中使用 `touched() && invalid()` 模式，可以避免在用户与字段交互之前就显示错误。关于显示验证错误的完整指导，请参见[字段状态管理指南](/guide/forms/signals/field-state-management#conditional-error-display)。

:::

## 自定义验证规则 {#custom-validation-rules}

虽然内置验证规则能处理常见情况，但你经常还需要自定义验证逻辑，用于业务规则、复杂格式或特定领域的约束。

### 使用 validate() {#using-validate}

`validate()` 函数用于创建自定义验证规则。它接收一个验证器函数，该函数可以访问字段上下文，并返回：

| 返回值                | 含义         |
| --------------------- | ------------ |
| 错误对象              | 值无效       |
| `null` 或 `undefined` | 值有效       |

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, validate} from '@angular/forms/signals';

@Component({
  selector: 'app-url-form',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Website URL
        <input [formField]="urlForm.website" />
      </label>
    </form>
  `,
})
export class UrlFormComponent {
  urlModel = signal({website: ''});

  urlForm = form(this.urlModel, (schemaPath) => {
    validate(schemaPath.website, ({value}) => {
      if (!value().startsWith('https://')) {
        return {
          kind: 'https',
          message: 'URL must start with https://',
        };
      }

      return null;
    });
  });
}
```

验证器函数接收的 `FieldContext` 对象包含：

| 属性            | 类型       | 说明                                        |
| --------------- | ---------- | ------------------------------------------- |
| `value`         | Signal     | 包含当前字段值的信号                        |
| `state`         | FieldState | 字段状态的引用                              |
| `fieldTree`     | FieldTree  | 字段树的引用                                |
| `valueOf()`     | Method     | 按路径获取另一个字段的值                    |
| `stateOf()`     | Method     | 按路径获取另一个字段的状态                  |
| `fieldTreeOf()` | Method     | 按路径获取另一个字段的字段树                |
| `pathKeys`      | Signal     | 从根到当前字段的路径键                      |

::: info 注意
子字段还有一个 `key` 信号，数组项字段则同时具有 `key` 和 `index` 信号。

:::

验证失败时，返回带有 `kind` 和 `message` 的错误对象；验证通过时，返回 `null` 或 `undefined`。

### 使用 validateTree() {#using-validatetree}

`validateTree()` 函数用于创建可以针对多个字段、或为整个子树提供复杂验证逻辑的自定义验证规则。

```ts
import {Component, model} from '@angular/core';
import {form, FormField, validateTree} from '@angular/forms/signals';

interface User {
  firstName: string;
  lastName: string;
}

@Component({/* ... */})
export class UserFormComponent {
  readonly userModel = model<User>({
    firstName: '',
    lastName: '',
  });

  userForm = form(this.userModel, (path) => {
    validateTree(path, (ctx) => {
      if (ctx.valueOf(path.firstName).length < 5) {
        return {
          kind: 'minLength5',
          message: 'First name must be at least 5 characters',
          fieldTree: ctx.fieldTree.lastName,
        };
      }

      return null;
    });
  });
}
```

`validateTree()` 的验证器函数接收的 `FieldContext` 对象与 `validate()` 相同。

### 可复用的验证规则 {#reusable-validation-rules}

通过包装 `validate()` 来创建可复用的验证规则函数：

```ts
function url(path: SchemaPath<string>, options?: {message?: string}) {
  validate(path, ({value}) => {
    try {
      new URL(value());
      return null;
    } catch {
      return {
        kind: 'url',
        message: options?.message || 'Enter a valid URL',
      };
    }
  });
}

function phoneNumber(path: SchemaPath<string>, options?: {message?: string}) {
  validate(path, ({value}) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

    if (!phoneRegex.test(value())) {
      return {
        kind: 'phoneNumber',
        message: options?.message || 'Phone must be in format: 555-123-4567',
      };
    }

    return null;
  });
}
```

你可以像使用内置验证规则一样使用自定义验证规则：

```ts
urlForm = form(this.urlModel, (schemaPath) => {
  url(schemaPath.website, {message: 'Please enter a valid website URL'});
  phoneNumber(schemaPath.phone);
});
```

## 跨字段验证 {#cross-field-validation}

跨字段验证用于比较或关联多个字段的值。

跨字段验证的一个常见场景是确认密码：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, minLength, validate} from '@angular/forms/signals';

@Component({
  selector: 'app-password-change',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        New Password
        <input type="password" [formField]="passwordForm.password" />
      </label>

      <label>
        Confirm Password
        <input type="password" [formField]="passwordForm.confirmPassword" />
      </label>

      <button type="submit">Change Password</button>
    </form>
  `,
})
export class PasswordChangeComponent {
  passwordModel = signal({
    password: '',
    confirmPassword: '',
  });

  passwordForm = form(this.passwordModel, (schemaPath) => {
    required(schemaPath.password, {message: 'Password is required'});
    minLength(schemaPath.password, 8, {message: 'Password must be at least 8 characters'});

    required(schemaPath.confirmPassword, {message: 'Please confirm your password'});

    validate(schemaPath.confirmPassword, ({value, valueOf}) => {
      const confirmPassword = value();
      const password = valueOf(schemaPath.password);

      if (confirmPassword !== password) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match',
        };
      }

      return null;
    });
  });
}
```

这条确认验证规则通过 `valueOf(schemaPath.password)` 访问密码字段的值，并与确认值进行比较。该验证规则是响应式运行的：任意一个密码发生变化，验证都会自动重新运行。

## 条件验证 {#conditional-validation}

有时某条验证规则只应在特定条件下生效，例如只有订单寄往国际时才验证收货地址，或者对联合类型字段的每种变体应用不同的规则集。

由于验证规则位于 schema 函数中，你可以用组合 schema 时所用的那些结构函数来有条件地应用它们：

- 使用 [`applyWhen()`](/guide/forms/signals/form-logic#conditional-logic-with-applywhen) 根据响应式的表单状态（包括其他字段的值）启用一组规则。
- 使用 [`applyWhenValue()`](/guide/forms/signals/schemas#type-narrowing-with-applywhenvalue) 根据字段自身的值应用规则。当谓词是类型守卫时，这些规则的类型会收窄到相应的值，因此它是验证可辨识联合类型及其他变体类型的推荐方式。

完整示例（包括可复用 schema 和可辨识联合类型）参见 [schema 与 schema 的可组合性指南](/guide/forms/signals/schemas)。

## 异步验证 {#async-validation}

异步验证用于处理需要外部数据源的验证，例如在服务器上检查用户名是否可用，或根据某个 API 进行验证。

### 使用 validateHttp() {#using-validatehttp}

`validateHttp()` 函数执行基于 HTTP 的验证：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, validateHttp} from '@angular/forms/signals';

@Component({
  selector: 'app-username-form',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Username
        <input [formField]="usernameForm.username" />

        @if (usernameForm.username().pending()) {
          <span class="checking">Checking availability...</span>
        }
      </label>
    </form>
  `,
})
export class UsernameFormComponent {
  usernameModel = signal({username: ''});

  usernameForm = form(this.usernameModel, (schemaPath) => {
    required(schemaPath.username, {message: 'Username is required'});

    validateHttp(schemaPath.username, {
      request: ({value}) => `/api/check-username?username=${value()}`,
      onSuccess: (response: any) => {
        if (response.taken) {
          return {
            kind: 'usernameTaken',
            message: 'Username is already taken',
          };
        }
        return null;
      },
      onError: (error) => ({
        kind: 'networkError',
        message: 'Could not verify username availability',
      }),
    });
  });
}
```

`validateHttp()` 验证规则会：

1. 调用 `request` 函数返回的 URL 或请求
2. 使用 `onSuccess` 把成功的响应映射为验证错误或 `null`
3. 使用 `onError` 处理请求失败（网络错误、HTTP 错误）
4. 在请求进行期间把 `pending()` 设为 `true`
5. 只在所有同步验证规则都通过后才运行

### 待定状态 {#pending-state}

异步验证运行期间，字段的 `pending()` 信号返回 `true`。可以用它来显示加载指示器：

```html
@if (form.username().pending()) {
  <span class="spinner">Checking...</span>
}
```

验证处于待定状态时，即使还没有错误，`valid()` 信号也会返回 `false`。而 `invalid()` 信号只有在存在错误时才返回 `true`。

## 与 schema 验证库集成 {#integration-with-schema-validation-libraries}

信号表单内置支持符合 [Standard Schema](https://standardschema.dev/) 规范的库，例如 [Zod](https://zod.dev/) 或 [Valibot](https://valibot.dev/)。这一集成通过 `validateStandardSchema` 函数提供。这样你就可以沿用现有的 schema，同时保留信号表单响应式验证的优势。

```ts
import {form, validateStandardSchema} from '@angular/forms/signals';
import {signal} from '@angular/core';
import * as z from 'zod';

// 定义 schema
const userSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// 在信号表单中使用
const userForm = form(signal({email: '', password: ''}), (schemaPath) => {
  validateStandardSchema(schemaPath, userSchema);
});
```

### 动态 schema {#dynamic-schemas}

除了静态 schema，你还可以传入一个返回 schema 的函数。这样当该函数读取的信号发生变化时，验证会自动更新。

```ts
import {Component, computed, signal} from '@angular/core';
import {form, FormField, validateStandardSchema} from '@angular/forms/signals';
import * as z from 'zod';

@Component({/* ... */})
export class DynamicSchema {
  model = signal({document: '', type: 'dni'});

  // schema 会随 type 的变化自动响应
  schema = computed(() =>
    z.object({
      document:
        this.model().type === 'dni'
          ? z.string().length(8, 'DNI must be 8 digits')
          : z.string().min(12, 'Passport must be at least 12 characters'),
    }),
  );

  f = form(this.model, (p) => validateStandardSchema(p, () => this.schema()));
}
```

## 后续步骤 {#next-steps}

本指南介绍了如何创建和应用验证规则。以下相关指南探讨了信号表单的其他方面：

- [字段状态管理](/guide/forms/signals/field-state-management)
- [表单模型](/guide/forms/signals/models)
- [添加表单逻辑](/guide/forms/signals/form-logic)
- [schema 与 schema 的可组合性](/guide/forms/signals/schemas)

