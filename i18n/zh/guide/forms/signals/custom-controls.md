# 自定义控件

::: info 注意
本指南假定你已熟悉[信号表单基础](/essentials/signal-forms)。

:::

浏览器内置的表单控件（如 input、select、textarea）能处理常见情况，但应用常常需要专门的输入控件。带日历界面的日期选择器、带格式工具栏的富文本编辑器、带自动补全的标签选择器，都需要自定义实现。

信号表单（Signal Forms）可以与任何实现了特定接口的组件（component）协同工作。**控件接口**（control interface）定义了让组件与表单系统通信的属性和信号（signal）。当你的组件实现了其中某个接口后，`[formField]` 指令（directive）会自动把你的控件连接到表单状态、验证和数据绑定（binding）。

::: tip 提示
自定义的信号表单控件[可以直接用于](/guide/forms/signals/migration#custom-controls)信号表单、响应式表单（Reactive Forms）和模板驱动表单（Template-driven Forms），无需任何额外的兼容代码。

:::

## 创建基本的自定义控件

我们先从最小实现开始，再按需添加功能。

### 最小的输入控件

一个基本的自定义输入控件只需实现 `FormValueControl` 接口，并定义必需的 `value` 模型信号。

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
  /** 当前输入值 */
  value = model('');
}
```

### 最小的复选框控件

复选框风格的控件需要做两件事：

1. 实现 `FormCheckboxControl` 接口，让 `FormField` 指令把它识别为表单控件
2. 提供一个 `checked` 模型信号

```ts
import {Component, model, ChangeDetectionStrategy} from '@angular/core';
import {FormCheckboxControl} from '@angular/forms/signals';

@Component({
  selector: 'app-basic-toggle',
  template: `
    <button type="button" [class.active]="checked()" (click)="toggle()">
      <span class="toggle-slider"></span>
    </button>
  `,
})
export class BasicToggle implements FormCheckboxControl {
  /** 开关是否处于选中状态 */
  checked = model<boolean>(false);

  toggle() {
    this.checked.update((val) => !val);
  }
}
```

### 使用自定义控件

创建好控件后，只要给它加上 `FormField` 指令，就可以在任何使用内置输入框的地方使用它：

```ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';
import {BasicInput} from './basic-input';
import {BasicToggle} from './basic-toggle';

@Component({
  imports: [FormField, BasicInput, BasicToggle],
  template: `
    <form novalidate>
      <label>
        Email
        <app-basic-input [formField]="registrationForm.email" />
      </label>

      <label>
        Accept terms
        <app-basic-toggle [formField]="registrationForm.acceptTerms" />
      </label>

      <button type="submit" [disabled]="registrationForm().invalid()">Register</button>
    </form>
  `,
})
export class Registration {
  registrationModel = signal({
    email: '',
    acceptTerms: false,
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    required(schemaPath.acceptTerms, {message: 'You must accept the terms'});
  });
}
```

::: info 注意
schema 回调参数（在这些示例中是 `schemaPath`）是一个 `SchemaPathTree` 对象，提供了指向表单中所有字段（field）的路径。你可以随意给这个参数命名。

:::

`[formField]` 指令对自定义控件和内置输入框的作用完全相同。信号表单一视同仁：验证照常运行，状态照常更新，数据绑定也会自动生效。

## 理解控件接口

你已经看到了自定义控件的实际效果，下面来探究它们是如何与信号表单集成的。

### 控件接口

你创建的 `BasicInput` 和 `BasicToggle` 组件实现了特定的控件接口，这些接口告诉信号表单该如何与它们交互。

#### FormValueControl

`FormValueControl` 是适用于大多数输入类型的接口，包括文本输入框、数字输入框、日期选择器、下拉选择框，以及任何编辑单个值的控件。当你的组件实现了这个接口时：

- **必需的属性**：组件必须提供一个 `value` 模型信号
- **FormField 指令的作用**：把表单字段的值绑定到控件的 `value` 信号

::: warning 重要
实现 `FormValueControl` 的控件**不能**有 `checked` 属性

:::

#### FormCheckboxControl

`FormCheckboxControl` 是适用于类复选框控件的接口，包括开关、切换按钮，以及任何表示布尔开 / 关状态的控件。当你的组件实现了这个接口时：

- **必需的属性**：组件必须提供一个 `checked` 模型信号
- **FormField 指令的作用**：把表单字段的值绑定到控件的 `checked` 信号

::: warning 重要
实现 `FormCheckboxControl` 的控件**不能**有 `value` 属性

:::

### 可选的状态属性

`FormValueControl` 和 `FormCheckboxControl` 都扩展自 `FormUiControl`，这是一个基础接口，提供了用于与表单状态集成的可选属性。

所有属性都是可选的，只需实现控件需要的那些。

#### 交互状态

跟踪用户何时与你的控件交互：

| 属性      | 用途                                                                  |
| --------- | --------------------------------------------------------------------- |
| `touched` | 用户是否与该字段交互过                                                |
| `dirty`   | 用户是否修改过值，即使后来又改回原值                                  |

#### 验证状态

向用户显示验证反馈：

| 属性      | 用途                                    |
| --------- | --------------------------------------- |
| `errors`  | 当前验证错误的数组                      |
| `invalid` | 字段是否存在验证错误                    |
| `pending` | 异步验证是否正在进行                    |

#### 可用性状态

控制用户能否与字段交互：

| 属性              | 用途                                                     |
| ----------------- | -------------------------------------------------------- |
| `disabled`        | 字段是否被禁用                                           |
| `disabledReasons` | 字段被禁用的原因                                         |
| `readonly`        | 字段是否只读（可见但不可编辑）                           |
| `hidden`          | 字段是否被隐藏                                           |

::: info 注意
`disabledReasons` 是一个 `DisabledReason` 对象数组。每个对象都有一个 `fieldTree` 属性（指向字段树的引用）和一个可选的 `message` 属性。可以通过 `reason.message` 访问消息。

:::

#### 验证约束

从表单接收验证约束值：

| 属性        | 用途                                                 |
| ----------- | ---------------------------------------------------- |
| `required`  | 字段是否必填                                         |
| `min`       | 最小数值（无约束时为 `undefined`）                   |
| `max`       | 最大数值（无约束时为 `undefined`）                   |
| `minLength` | 最小字符串长度（无约束时为 undefined）               |
| `maxLength` | 最大字符串长度（无约束时为 undefined）               |
| `pattern`   | 要匹配的正则表达式模式数组                           |

#### 字段元数据

| 属性     | 用途                                                               |
| -------- | ------------------------------------------------------------------ |
| `name`   | 字段的 name attribute（在各个表单和应用中都是唯一的）              |

下文的「[添加状态信号](#adding-state-signals)」一节展示了如何在控件中实现这些属性。

### FormField 指令的工作原理

`[formField]` 指令会检测控件实现了哪个接口，并自动绑定相应的信号：

```ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';
import {CustomInput} from './custom-input';
import {CustomToggle} from './custom-toggle';

@Component({
  selector: 'app-my-form',
  imports: [FormField, CustomInput, CustomToggle],
  template: `
    <form novalidate>
      <app-custom-input [formField]="userForm.username" />
      <app-custom-toggle [formField]="userForm.subscribe" />
    </form>
  `,
})
export class MyForm {
  formModel = signal({
    username: '',
    subscribe: false,
  });

  userForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.username, {message: 'Username is required'});
  });
}
```

::: tip 提示
关于创建和管理表单模型的完整介绍，请参见[表单模型指南](/guide/forms/signals/models)。

:::

当你绑定 `[formField]="userForm.username"` 时，FormField 指令会：

1. 检测到你的控件实现了 `FormValueControl`
2. 在内部访问 `userForm.username().value()`，并把它绑定到控件的 `value` 模型信号
3. 把表单状态信号（`disabled()`、`errors()` 等）绑定到控件的可选输入（input）信号
4. 借助信号的响应式机制自动完成更新

## 添加状态信号

上面展示的最小控件可以工作，但它们不会响应表单状态。你可以添加可选的输入信号，让控件能够响应禁用状态、显示验证错误并跟踪用户交互。

下面是一个实现了常用状态属性的完整示例：

```ts
import {Component, model, input, output, ChangeDetectionStrategy} from '@angular/core';
import {
  FormValueControl,
  WithOptionalFieldTree,
  ValidationError,
  DisabledReason,
} from '@angular/forms/signals';

@Component({
  selector: 'app-stateful-input',
  template: `
    @if (!hidden()) {
      <div class="input-container">
        <input
          type="text"
          [value]="value()"
          (input)="value.set($event.target.value)"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [class.invalid]="invalid()"
          [attr.aria-invalid]="invalid()"
          (blur)="touch.emit()"
        />

        @if (invalid()) {
          <div class="error-messages" role="alert">
            @for (error of errors(); track error) {
              <span class="error">{{ error.message }}</span>
            }
          </div>
        }

        @if (disabled() && disabledReasons().length > 0) {
          <div class="disabled-reasons">
            @for (reason of disabledReasons(); track reason) {
              <span>{{ reason.message }}</span>
            }
          </div>
        }
      </div>
    }
  `,
})
export class StatefulInput implements FormValueControl<string> {
  // 必需
  value = model<string>('');

  // 可写的交互状态：由控件更新
  touched = input<boolean>(false);
  touch = output<void>();

  // 只读状态：由表单系统管理
  disabled = input<boolean>(false);
  disabledReasons = input<readonly WithOptionalFieldTree<DisabledReason>[]>([]);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  invalid = input<boolean>(false);
  errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
}
```

这样，你就可以把该控件与验证和状态管理一起使用：

```ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {form, FormField, required, email} from '@angular/forms/signals';
import {StatefulInput} from './stateful-input';

@Component({
  imports: [FormField, StatefulInput],
  template: `
    <form novalidate>
      <label>
        Email
        <app-stateful-input [formField]="loginForm.email" />
      </label>
    </form>
  `,
})
export class Login {
  loginModel = signal({email: ''});

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});
  });
}
```

当用户输入了无效的邮箱时，FormField 指令会自动更新 `invalid()` 和 `errors()`，你的控件就可以显示验证反馈。

### 配合 `debounce('blur')` 使用

[`debounce('blur')`](https://angular.dev/api/forms/signals/debounce) 规则会把从 UI 到表单模型的更新推迟到字段失去焦点时，而不是在每次按键时都应用。内置控件会自动向表单报告失焦。而自定义控件只有在响应原生 [`blur` 事件](https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event)时发出 `touch` 输出（output），才会参与其中：

```ts
import {Component, model, output} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

@Component({
  selector: 'app-custom-input',
  template: `
    <input
      type="text"
      [value]="value()"
      (input)="value.set($event.target.value)"
      (blur)="touch.emit()"
    />
  `,
})
export class CustomInput implements FormValueControl<string> {
  value = model('');
  touch = output<void>();
}
```

有了 `touch` 输出后，`debounce('blur')` 在你的控件上的行为就与内置输入框相同了：

```ts
import {Component, signal} from '@angular/core';
import {debounce, form, FormField} from '@angular/forms/signals';
import {CustomInput} from './custom-input';

@Component({
  selector: 'app-root',
  imports: [CustomInput, FormField],
  template: `<app-custom-input [formField]="userForm.name" />`,
})
export class App {
  userModel = signal({name: ''});

  userForm = form(this.userModel, (schemaPath) => {
    debounce(schemaPath.name, 'blur');
  });
}
```

::: warning 重要
在 `blur`（焦点离开控件）时发出 `touch`，而不是在 `focus` 时。如果控件不发出 `touch`，字段就永远不会被标记为已触碰（touched），`debounce('blur')` 也永远不会把控件发出的值写入表单模型。

:::

## 值转换

控件显示值的方式有时与表单模型存储值的方式不同：日期选择器可能显示 "January 15, 2024"，而存储的是 "2024-01-15"；货币输入框可能显示 "$1,234.56"，而存储的是 1234.56。

使用 `transformedValue()`（来自 `@angular/forms/signals`）让 UI 中显示的原始值与模型值保持同步。它接收控件的 `value` 模型信号以及一个 `parse` 函数和一个 `format` 函数，并返回一个保存原始值的可写信号（writable signal）：

- `format` 把模型值转换为模板（template）要渲染的原始值。
- `parse` 把用户输入的内容转换回模型值，也可以改为报告解析错误。

```ts
import {Component, model} from '@angular/core';
import {FormValueControl, transformedValue} from '@angular/forms/signals';

@Component({
  selector: 'number-input',
  template: `
    <input type="text" [value]="rawValue()" (input)="rawValue.set($event.target.value)" />
  `,
})
export class NumberInput implements FormValueControl<number | null> {
  readonly value = model.required<number | null>();

  protected readonly rawValue = transformedValue(this.value, {
    parse: (val: string): {value: number | null} => ({value: val ? Number(val) : null}),
    format: (val: number | null): string => val?.toString() ?? '',
  });
}
```

写入返回的信号（`rawValue.set(...)`）时会运行 `parse`，并把结果写入 `value`。每当模型从别处发生变化，比如 `reset()`、某条 schema 规则或应用的其他部分，`format` 都会重新运行，原始值也会随之更新。

### 报告解析错误

有时原始值没有有效的模型表示形式，比如只输入了一半的日期，或数字字段中的字母。上面的 `NumberInput` 就有这个问题：`Number('abc')` 的结果是 `NaN`，而 `parse` 会毫无顾忌地把它写入模型。

这时应改为返回 `{error}`：

```ts
export class NumberInput implements FormValueControl<number | null> {
  readonly value = model.required<number | null>();

  protected readonly rawValue = transformedValue(this.value, {
    parse: (val) => {
      const parsed = val ? Number(val) : null;

      return Number.isNaN(parsed)
        ? {error: {kind: 'parse', message: `${val} is not a number`}}
        : {value: parsed};
    },
    format: (val) => val?.toString() ?? '',
  });
}
```

如果你既想更新模型*又*想标记问题，就同时返回 `value` 和 `error`。

当控件通过 `[formField]` 绑定时，解析错误会自动报告给字段，因此它们会和验证错误一起出现在字段的 `errors()` 信号中：

```ts
@Component({
  imports: [NumberInput, FormField],
  template: `
    <number-input [formField]="orderForm.amount" />

    @for (error of orderForm.amount().errors(); track $index) {
      <!-- {kind: 'parse', message: '...'} 也会在这里报告 -->
      <p class="error">{{ error.message }}</p>
    }
  `,
})
export class Order {
  orderModel = signal<{amount: number | null}>({amount: null});
  orderForm = form(this.orderModel);
}
```

存在解析错误的字段是无效的，它会像验证规则失败一样阻止提交。

::: tip 提示
信号表单对原生输入框也使用同样的机制。当浏览器无法解析某个值时（例如 `<input type="date">` 中只输入了一部分的日期），它会作为 `parse` 错误出现在字段上。详情参见[原生 HTML 验证](/guide/forms/signals/validation#native-html-validation)。

:::

### 重置

对字段调用 `reset()` 会清除所有待处理的解析错误，并根据模型重新格式化原始值，这样处于无法解析状态的控件就会恢复为干净的显示值：

```ts
orderForm.amount().reset();
```

## 验证集成

控件负责显示验证状态，但不执行验证。验证发生在表单 schema 中：控件从 FormField 指令接收 `invalid()` 和 `errors()` 信号并把它们显示出来（如上面的 StatefulInput 示例所示）。

FormField 指令还会传入 `required`、`min`、`max`、`minLength`、`maxLength` 和 `pattern` 等验证约束值。你的控件可以用它们来增强 UI：

```ts
export class NumberInput implements FormValueControl<number> {
  value = model<number>(0);

  // 来自 schema 验证规则的约束值
  required = input<boolean>(false);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
}
```

当你在 schema 中添加 `min()` 和 `max()` 验证规则时，FormField 指令会把这些值传给控件。你可以用它们来设置 HTML5 attribute，或在模板中显示约束提示。

::: warning 重要
不要在控件中实现验证逻辑。应该在表单 schema 中定义验证规则，让控件只负责显示结果：

:::

```ts
// 避免：在控件中做验证
export class BadControl implements FormValueControl<string> {
  value = model<string>('');
  isValid() {
    return this.value().length >= 8;
  } // 不要这样做！
}
```

```ts
// 推荐：在 schema 中验证，由控件显示结果
accountForm = form(this.accountModel, (schemaPath) => {
  minLength(schemaPath.password, 8, {message: 'Password must be at least 8 characters'});
});
```

## 让控件可复用

自定义控件往往隐含着对验证的预期。比如邮箱输入框在每个使用它的表单中都需要 `required` 和 `email` 规则。与其依赖每个使用方重新声明这些规则，不如为控件配套打包一个 schema，并从同一个模块中同时导出两者：

```ts [email-input.ts]
import {schema, required, email} from '@angular/forms/signals';

export const emailFieldSchema = schema<string>((path) => {
  required(path, {message: 'Email is required'});
  email(path, {message: 'Enter a valid email address'});
});
```

使用方导入这个配套 schema，并通过 `apply()` 把它组合进自己的表单：

```ts [registration.ts]
import {form, apply} from '@angular/forms/signals';
import {emailFieldSchema} from './email-input';

registrationForm = form(this.registrationModel, (path) => {
  apply(path.email, emailFieldSchema);
});
```

`apply()` 会把配套 schema 中的规则合并到父表单的指定路径上。使用方仍然可以为同一个字段添加更多规则，因为 `apply()` 是与其他规则组合，而不是替换它们。关于 `schema()`、`apply()` 以及用 `applyWhen()` 进行条件组合的完整介绍，请参见 [schema 指南](/guide/forms/signals/schemas)。

### 设计考量

使用方的模型必须用一个已定义的值来初始化每个字段。在信号表单中，`undefined` 表示字段不存在，而不是空值。对于可复用的邮箱控件来说，这意味着使用方应该用 `''` 作为初始值，而不是让该属性保持 undefined。关于如何选择初始值，请参见[表单模型指南](/guide/forms/signals/models)。

此外，控件不应为状态管理注册自己的副作用（effect）。表单系统通过内部的副作用来管理字段状态，这意味着控件是通过输入信号接收状态更新的。如果控件需要转换值，请使用「[值转换](#value-transformation)」一节中介绍的 `transformedValue()`，而不是 `effect()`。

## 后续步骤

本指南介绍了如何构建与信号表单集成的自定义控件。以下相关指南探讨了信号表单的其他方面：

- [表单模型](/guide/forms/signals/models)
- [字段状态管理](/guide/forms/signals/field-state-management)
- [验证](/guide/forms/signals/validation)
- [使用数组](https://angular.dev/guide/forms/signals/arrays)

