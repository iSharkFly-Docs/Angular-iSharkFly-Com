# 表单提交 {#form-submission}

当用户提交表单时，应用通常需要同时处理多项事务：显示验证错误、防止重复提交、把数据发送到服务器等等。手动处理每一项既繁琐又容易出错。

信号表单（Signal Forms）提供了一个 `submit()` 函数，帮助你管理表单提交的生命周期。本指南介绍如何使用它。

## `submit()` 做了什么？ {#what-does-submit-do}

`submit()` 函数会按特定顺序执行以下步骤：

1. **把可交互字段标记为已触碰（touched）**：那些只在被触碰后才显示错误的字段，此时会显示其验证错误。隐藏、禁用和只读字段会被跳过。
1. **检查验证**：如果有任何验证规则未通过，提交就会停止，`action` 函数不会运行。
1. **运行 action**：`action` 函数以表单的当前值执行。在它运行期间，`submitting()` 返回 `true`。
1. **处理结果**：如果 action 返回了错误，这些错误会被分派到对应的目标字段。如果什么都不返回，则视为提交成功。

`submit()` 函数返回一个 `Promise<boolean>`：当 action 无错误完成时解析为 `true`；当验证失败、action 返回错误或已有一次提交正在进行时解析为 `false`。如果 action 抛出异常，该 Promise 会以这个错误拒绝（reject）。

## 使用 `FormRoot` 设置表单提交 {#setting-up-form-submission-with-formroot}

使用 `submit()` 函数最常见的方式是通过 `FormRoot` 指令（Directive）。

`FormRoot` 指令绑定到 `<form>` 元素后，会自动处理三件事：

1. **设置 [`novalidate`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form#novalidate)**：禁用浏览器内置的验证，改由信号表单管理验证
1. **阻止默认行为**：阻止浏览器在表单提交时进行页面跳转
1. **调用 `submit()`**：如果创建表单时提供了 `submission` 选项，在用户提交表单时触发提交流程

::: info 注意
`FormRoot` 指令会自动在 `form` 元素上设置 `novalidate` attribute。使用 `FormRoot` 时无需手动添加。

:::

`FormRoot` 会处理提交事件，但你仍需要告诉它要对表单数据*做什么*。这需要三件事：

1. 把表单绑定到 `FormRoot` 指令
1. 向 `form()` 函数传入 `submission` 选项
1. 在 `submission` 选项中定义一个 `action` 函数，用于处理提交的数据

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, FormRoot, required} from '@angular/forms/signals';

@Component({
  selector: 'app-contact',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="contactForm">
      <label>
        Name
        <input [formField]="contactForm.name" />
      </label>

      <label>
        Email
        <input type="email" [formField]="contactForm.email" />
      </label>

      <button type="submit">Send</button>
    </form>
  `,
})
export class Contact {
  contactModel = signal({
    name: '',
    email: '',
  });

  contactForm = form(
    this.contactModel,
    (schemaPath) => {
      required(schemaPath.name);
      required(schemaPath.email);
    },
    {
      submission: {
        action: async (field) => {
          const result = await saveContact(field().value());
          if (result.ok) return;

          return {kind: 'serverError', message: 'Failed to submit form'};
        },
      },
    },
  );
}
```

`action` 函数只有在没有验证规则失败时才会运行。默认情况下，进行中的异步验证器不会阻止提交（详见[控制验证对提交的拦截](#controlling-validation-gating-with-ignorevalidators)）。action 会接收字段树以及一个包含 `root` 和 `submitted` 字段树的 `detail` 对象，这在提交子表单时很有用。

即使验证通过，action 本身仍可能因为网络错误或重复条目等情况而失败。这时可以通过返回错误来呈现失败。反之，要表示成功，只需返回 `null` 或 `undefined`，或者直接写一个空的 `return`。

## 使用 `submitting()` 显示提交状态 {#showing-submission-state-with-submitting}

当你需要追踪表单是否正在提交时，信号表单提供了一个 `submitting()` 信号（Signal），它在 `action` 函数运行期间返回 `true`。可以用它显示加载指示器，或禁用提交按钮以防止重复提交。

```html
<button type="submit" [disabled]="contactForm().submitting()">
  @if (contactForm().submitting()) {
    Sending...
  } @else {
    Send
  }
</button>
```

一旦 `action` 函数成功或返回错误，`submitting()` 信号会自动重置为 `false`。

## 管理提交错误 {#managing-submission-errors}

### 服务器错误 {#server-errors}

当 `action` 函数与服务器通信时，服务器可能返回需要显示在特定字段上的错误。从 `action` 中返回这些错误，就能把它们分派到目标字段。

#### 提交字段上的错误 {#errors-on-the-submitted-field}

默认情况下，`action` 返回的错误会分配给被提交的字段（即你传给 `submit()` 的那个字段树）：

```ts
action: async (field) => {
  const result = await saveContact(field().value());
  if (result.ok) return;

  return {kind: 'serverError', message: 'Failed to submit form'};
};
```

#### 特定字段上的错误 {#errors-on-specific-fields}

如果想把错误分派到某个特定字段，可以加上一个指向该字段的 `fieldTree` 属性：

```ts
action: async (field) => {
  const result = await saveContact(field().value());
  if (result.ok) return;

  return {kind: 'taken', message: result.message, fieldTree: field.email};
};
```

#### 多个错误 {#multiple-errors}

如果想在多个字段上报告错误，可以返回一个数组：

```ts
action: async (field) => {
  const result = await registerUser(field().value());
  if (result.ok) return;

  return result.errors.map((err: {field: string; message: string}) => ({
    kind: 'serverError',
    message: err.message,
    fieldTree: field[err.field as keyof typeof field],
  }));
};
```

### 自动清除提交错误 {#auto-clearing-submission-errors}

当用户编辑字段时，提交错误会自动清除。如果 `action` 在 email 字段上返回了错误，用户一修改 email 的值，这个错误就会消失。

这一点与验证错误不同，验证错误是响应式重新计算的。每次变化后验证规则都会重新运行，并可能再次产生相同的错误。而提交错误是服务器返回的一次性结果，一旦被清除，除非再次提交表单，否则不会重新出现。

::: tip 提示
提交错误会与验证错误一起出现在字段的 `errors()` 信号中。关于如何在模板中显示错误，请参阅[字段状态管理指南](/guide/forms/signals/field-state-management)。

:::

## 使用 `onInvalid` 处理无效提交 {#handling-invalid-submissions-with-oninvalid}

验证失败时，`action` 函数不会运行。如果你需要对一次失败的提交尝试作出响应（例如滚动到第一个错误、显示一条提示消息或聚焦到无效字段），可以使用 `onInvalid` 回调。

```ts
contactForm = form(
  this.contactModel,
  (schemaPath) => {
    required(schemaPath.name);
    required(schemaPath.email);
  },
  {
    submission: {
      action: async (field) => {
        await saveContact(field().value());
      },
      onInvalid: (field) => {
        const firstError = field().errorSummary()[0];
        firstError?.fieldTree().focusBoundControl();
      },
    },
  },
);
```

`onInvalid` 回调接收与 `action` 相同的 `(field, detail)` 参数。它在所有可交互字段都被标记为已触碰之后运行，因此执行时验证错误已经在界面上可见了。

## 使用 `ignoreValidators` 控制验证对提交的拦截 {#controlling-validation-gating-with-ignorevalidators}

默认情况下，`submit()` 会忽略进行中的验证器。只要没有验证器失败，即使某些异步验证器仍在进行中，action 也会运行。`ignoreValidators` 选项让你可以控制这一行为。

| 值          | 行为                                                       |
| ----------- | ---------------------------------------------------------- |
| `'pending'` | 只要没有验证器失败就提交，即使有些仍在进行中（默认）       |
| `'none'`    | 只有在所有验证器都通过时才提交，进行中的验证器会阻止提交   |
| `'all'`     | 无论验证状态如何都提交                                     |

```ts
contactForm = form(
  this.contactModel,
  (schemaPath) => {
    required(schemaPath.name);
    required(schemaPath.email);
  },
  {
    submission: {
      action: async (field) => {
        await saveContact(field().value());
      },
      ignoreValidators: 'none',
    },
  },
);
```

当表单中有异步验证器（例如检查用户名是否可用），并且需要在提交前完成所有验证时，使用 `'none'`。在保存草稿这类无论验证状态如何都要持久化数据的场景中，使用 `'all'`。

## 使用 `submit()` 手动提交 {#manual-submission-with-submit}

`FormRoot` 指令是触发提交最常见的方式，但你也可以直接调用 `submit()`。这适用于多步向导、自动保存，或者从表单元素之外触发提交等场景。

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, submit} from '@angular/forms/signals';

@Component({
  selector: 'app-contact',
  imports: [FormField],
  template: `
    <label>
      Name
      <input [formField]="contactForm.name" />
    </label>

    <label>
      Email
      <input type="email" [formField]="contactForm.email" />
    </label>

    <button (click)="onSave()">Save</button>
  `,
})
export class Contact {
  contactModel = signal({
    name: '',
    email: '',
  });

  contactForm = form(this.contactModel, (schemaPath) => {
    required(schemaPath.name);
    required(schemaPath.email);
  });

  async onSave() {
    // 直接调用 `submit()` 时，把 action 作为第二个参数传入，
    // 而不是在 `FormOptions` 中配置。
    const success = await submit(this.contactForm, async (field) => {
      const result = await saveContact(field().value());
      if (result.ok) return;

      return {kind: 'serverError', message: 'Failed to save'};
    });

    if (success) {
      // 处理成功情况：导航、显示确认信息等。
    }
  }
}
```

## 处理副作用 {#handling-side-effects}

`submit()` 函数返回一个 `Promise<boolean>`：action 无错误完成时为 `true`；验证失败、action 返回错误或已有提交正在进行时为 `false`。如果 action 抛出异常，该 Promise 会被拒绝。可以据此触发导航或通知等副作用。

```ts
async onSave() {
  const success = await submit(this.contactForm, async (field) => {
    await saveContact(field().value());
  });

  if (success) {
    await this.router.navigate(['/confirmation']);
  }
}
```

当 action 产生的数据是副作用所需要的（例如服务器生成的 ID），就在 action 内部处理该副作用：

```ts
async onSave() {
  await submit(this.contactForm, async (field) => {
    const contact = await createContact(field().value());
    await this.router.navigate(['/confirmation', contact.id]);
  });
}
```

使用 `FormRoot` 时，副作用同样要放在 `action` 里，因为 `FormRoot` 会在内部调用 `submit()`：

```ts
submission: {
  action: async (field) => {
    const result = await saveContact(field().value());
    if (result.ok) {
      await this.router.navigate(['/confirmation']);
      return;
    }

    return {kind: 'serverError', message: 'Failed to submit form'};
  },
}
```

## 并发提交 {#concurrent-submissions}

当一次提交正在进行时，对同一表单或其任何后代再调用 `submit()` 都会立即返回 `false`，而不会运行 action。这样即使用户快速多次触发提交操作，也能防止重复提交和重复的副作用。

## 后续步骤 {#next-steps}

本指南介绍了如何提交表单以及如何处理表单提交错误。以下相关指南探讨了信号表单的其他方面：

- [验证](/guide/forms/signals/validation)
- [字段状态管理](/guide/forms/signals/field-state-management)
- [添加表单逻辑](/guide/forms/signals/form-logic)

