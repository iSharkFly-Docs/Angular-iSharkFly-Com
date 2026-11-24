# 跨字段逻辑

当某个字段的规则、验证或行为依赖于另一个字段的值或状态时，就需要用到**跨字段逻辑**（cross-field logic）。

信号表单（Signal Forms）会为每个规则函数提供一个**字段上下文**（field context）。字段上下文让你可以访问当前字段的值和状态，并能通过 `valueOf()`、`stateOf()` 和 `fieldTreeOf()` 读取表单中的其他字段。

本指南将深入介绍字段上下文 API，并展示常见的跨字段模式。关于单个字段的验证，请参阅[验证指南](/guide/forms/signals/validation)。

## 理解字段上下文

信号表单中的每个规则函数都会接收一个字段上下文参数，它是一个对象，用于描述当前字段并提供对表单其余部分的访问。

对于当前字段，你可以访问以下三个属性：

| 属性        | 类型                 | 说明                                                          |
| ----------- | -------------------- | -------------------------------------------------------------------- |
| `value`     | `Signal<TValue>`     | 以信号形式提供的当前字段值                                |
| `state`     | `FieldState<TValue>` | 当前字段的状态（例如有效性、错误、touched、dirty） |
| `fieldTree` | `FieldTree<TValue>`  | 当前字段的字段树，用于以编程方式访问子字段    |

对于跨字段逻辑，可以使用以下三个属性访问表单的其他部分：

| 属性        | 类型                           | 说明                                                                                                                        |
| --------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `valueOf()`     | `(path) => PValue`             | 最常用。当你需要另一个字段的原始值来进行比较或计算时使用。                                          |
| `stateOf()`     | `(path) => FieldState<PValue>` | 当你的逻辑依赖于另一个字段的状态（例如它是否有效、是否被触碰（touched）或是否已修改（dirty））时使用。                               |
| `fieldTreeOf()` | `(path) => FieldTree<PModel>`  | 当你需要以编程方式访问另一个字段的字段树时使用，例如通过 validateTree 把错误推送到某个特定的子字段上。 |

下面的示例使用 `value` 和 `valueOf()` 来验证当前字段（结束日期）是否晚于表单中的开始日期：

```ts
import {Component, signal} from '@angular/core';
import {form, validate} from '@angular/forms/signals';

@Component({/* ... */})
export class EventForm {
  eventModel = signal({
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-05'),
  });

  eventForm = form(this.eventModel, (schemaPath) => {
    validate(schemaPath.endDate, ({value, valueOf}) => {
      if (value() <= valueOf(schemaPath.startDate)) {
        return {
          kind: 'invalidDateRange',
          message: 'End date must be after start date',
        };
      }

      return null;
    });
  });
}
```

::: info 注意
`fieldContext` 参数通常会被解构，只取出规则需要的部分。本指南其余的示例都采用这种写法。

:::

## 跨字段验证模式

上一节中的日期范围示例会根据开始日期来验证结束日期。由于该规则读取了 `valueOf(schemaPath.startDate)`，因此只要任一日期发生变化，它都会自动重新求值。换句话说，只需一个验证器就足以保证错误状态正确。

不过，这个验证器只会把错误放在结束日期字段上。如果你希望在日期范围无效时两个字段都显示错误，就要为每个字段各添加一条对应的验证规则：

```ts
import {Component, signal} from '@angular/core';
import {form, validate} from '@angular/forms/signals';

@Component({/* ... */})
export class EventForm {
  eventModel = signal({
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-05'),
  });

  eventForm = form(this.eventModel, (schemaPath) => {
    validate(schemaPath.startDate, ({value, valueOf}) => {
      if (value() >= valueOf(schemaPath.endDate)) {
        return {
          kind: 'invalidDateRange',
          message: 'Start date must be before end date',
        };
      }
      return null;
    });

    validate(schemaPath.endDate, ({value, valueOf}) => {
      if (value() <= valueOf(schemaPath.startDate)) {
        return {
          kind: 'invalidDateRange',
          message: 'End date must be after start date',
        };
      }
      return null;
    });
  });
}
```

这两条规则都使用 `valueOf()` 读取另一个字段。由于每条规则都是响应式的，修改任一日期都会自动重新执行两项验证。

::: info 注意
当一条规则涉及多个字段时，你需要决定错误应该放在哪里：放在某个特定字段上、放在多个字段上，还是放在父字段上。一般来说，应把错误放在用户最可能去修正问题的位置。

:::

### 条件必填

在某些表单中，某些字段只在特定条件下才是必填的。例如，注册表单可能只在用户选择企业账户类型时才要求填写公司名称：

```ts
import {Component, signal} from '@angular/core';
import {form, required} from '@angular/forms/signals';

@Component({/* ... */})
export class RegistrationForm {
  registrationModel = signal({
    accountType: 'personal' as 'personal' | 'business',
    companyName: '',
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.companyName, {
      when: ({valueOf}) => valueOf(schemaPath.accountType) === 'business',
      message: 'Company name is required for business accounts',
    });
  });
}
```

`when` 选项接收的字段上下文与其他任何规则函数相同，因此 `valueOf` 的用法也完全一样。当用户切换回 `'personal'` 时，条件会重新求值，必填要求连同它的错误都会自动清除。

使用带 `when` 的 `required()`，而不是手动编写 `validate()` 检查，还能为字段添加正确的必填元数据，从而启用无障碍功能，例如为屏幕阅读器把该字段标记为必填。

### 基于另一个字段的状态进行验证

前面的示例都使用 `valueOf()` 读取另一个字段的值。有时你的逻辑依赖的是另一个字段的*状态*，例如它是否有效、是否被触碰（touched）或是否已修改（dirty）。这时请使用 `stateOf()`。

例如，确认密码字段应当在用户与密码字段交互过之后才检查两者是否一致。如果用户还没有触碰过密码字段，就在确认字段上标记不一致还为时过早：

```ts
import {Component, signal} from '@angular/core';
import {form, validate} from '@angular/forms/signals';

@Component({/* ... */})
export class PasswordForm {
  passwordModel = signal({
    password: '',
    confirmPassword: '',
  });

  passwordForm = form(this.passwordModel, (schemaPath) => {
    validate(schemaPath.confirmPassword, ({value, valueOf, stateOf}) => {
      if (!stateOf(schemaPath.password).touched()) {
        return null;
      }
      if (value() !== valueOf(schemaPath.password)) {
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

`stateOf()` 调用会返回另一个字段的[字段状态](https://angular.dev/api/forms/signals/FieldState)，让你可以访问 `invalid()`、`touched()` 和 `dirty()` 等信号。由于它们都是信号，只要密码字段的有效性发生变化，该规则就会重新求值。

::: danger 严重
注意不要读取依赖于当前字段验证结果的状态，否则会形成循环。例如，检查父字段是否有效的验证器会造成无限循环，因为父字段的有效性取决于其子字段的有效性（其中也包括你的这个验证器）。

:::

## 使用 validateTree

前面的示例都使用 `validate()` 检查单个字段。有时你需要验证一组字段，而这类逻辑本质上关乎组内的多个字段，并且需要把错误指向组内特定的子字段。`validateTree` 非常适合处理这类场景。

例如，在数独谜题中，每一行的数字都必须互不相同。这是一条组级别的规则：你要检查整行，然后标记出违反规则的具体单元格。这种验证无法在各个字段上用 `validate` 简洁地表达，因为每个单元格都需要了解其他所有单元格。

```ts
import {Component, signal} from '@angular/core';
import {form, validateTree} from '@angular/forms/signals';

@Component({/* ... */})
export class SudokuRow {
  rowModel = signal({
    cell1: 1,
    cell2: 3,
    cell3: 1,
    cell4: 4,
  });

  rowForm = form(this.rowModel, (schemaPath) => {
    validateTree(schemaPath, ({value, fieldTreeOf}) => {
      const row = value();
      const entries = [
        {val: row.cell1, fieldTree: fieldTreeOf(schemaPath.cell1)},
        {val: row.cell2, fieldTree: fieldTreeOf(schemaPath.cell2)},
        {val: row.cell3, fieldTree: fieldTreeOf(schemaPath.cell3)},
        {val: row.cell4, fieldTree: fieldTreeOf(schemaPath.cell4)},
      ];

      const counts = new Map<number, number>();
      for (const {val} of entries) {
        if (val !== 0) {
          counts.set(val, (counts.get(val) ?? 0) + 1);
        }
      }

      const errors = entries
        .filter(({val}) => val !== 0 && (counts.get(val) ?? 0) > 1)
        .map(({val, fieldTree}) => ({
          kind: 'duplicateInRow',
          message: `${val} already appears in this row`,
          fieldTree,
        }));

      return errors.length > 0 ? errors : null;
    });
  });
}
```

该验证器运行在父字段（即这一行）上，它读取所有单元格的值、统计重复次数，并为每个包含重复数字的单元格返回一个错误。每个错误上的 `fieldTree` 属性会准确告诉 Angular 应该由哪个单元格显示该错误。如果没有 `fieldTree`，这些错误就会作用于这一行本身，而不是用户需要看到它们的地方。

由于 `validateTree` 可以返回一个错误数组，单个验证器就能同时标记多个单元格。每个错误都包含一个指向其目标的 `fieldTree`，因此 Angular 会把这些错误分发到正确的字段上。

### 何时使用 validateTree，何时使用 validate

当错误属于正在验证的字段时，即使规则需要读取其他字段，也应优先使用 `validate()` 搭配 `valueOf()`。在以下情况下再考虑使用 `validateTree`：

- 验证逻辑本质上关乎一组字段，而不是某个单独的字段
- 验证器需要返回指向不同子字段的错误

::: tip 提示
关于 `validateTree` 及其返回类型的介绍，请参阅[验证指南](/guide/forms/signals/validation)。

:::

## 后续步骤

本指南介绍了字段上下文 API 以及常见的跨字段模式。要了解更多相关的信号表单指南，请查看：

- [验证](/guide/forms/signals/validation)
- [字段状态管理](/guide/forms/signals/field-state-management)
- [自定义控件](/guide/forms/signals/custom-controls)
