# 添加表单逻辑

信号表单（Signal Forms）允许你使用 schema 为表单添加逻辑。验证逻辑在[验证指南](/guide/forms/signals/validation)中介绍，本指南讨论 schema 中可用的其他规则。你可以有条件地禁用字段（field）、根据其他值隐藏字段、将字段设为只读、对用户输入进行防抖，以及为自定义控件附加元数据。

本指南将展示如何使用 `disabled()`、`hidden()`、`readonly()`、`debounce()` 和 `metadata()` 等规则来控制字段的行为。

## 何时添加表单逻辑

当字段的行为依赖于其他字段的值，或者需要响应式更新时，就可以使用规则。例如：

- 当订单总额过低时禁用的优惠码字段
- 除非需要配送，否则隐藏的地址字段
- 通过防抖来减少 API 调用的搜索字段

## 规则的工作原理

规则会把响应式逻辑绑定（binding）到表单中的特定字段上。大多数条件规则都接受一个带有 `when` 函数的选项对象。每当 `when` 函数引用的信号（signal）发生变化时，它都会自动重新计算，就像 `computed` 一样。

```ts
const orderForm = form(this.orderModel, (schemaPath) => {
  disabled(schemaPath.couponCode, {when: ({valueOf}) => valueOf(schemaPath.total) < 50});
  //~~~~~~ ~~~~~~~~~~~~~~~~~~~~~  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //规则     路径                   响应式逻辑函数
});
```

响应式逻辑函数会接收一个 `FieldContext` 对象，它通过 `valueOf()` 和 `stateOf()` 等辅助函数提供对字段值和状态的访问。通常会对它进行解构，以便直接使用这些辅助函数。

::: info 注意
schema 回调的参数（这些例子中的 `schemaPath`）是一个 `SchemaPathTree` 对象，它提供了表单中所有字段的路径。你可以随意为这个参数命名。

:::

关于 `FieldContext` 属性和方法的完整细节，请参阅[验证指南](/guide/forms/signals/validation)。

## 使用 `disabled()` 阻止字段更新

`disabled()` 规则用于配置字段的禁用状态。

它与 `[formField]` 指令（Directive）配合使用，会根据字段的状态自动绑定 `disabled` attribute，因此你无需在模板（Template）中手动添加 `[disabled]="yourForm.fieldName().disabled()"`。

::: info 注意
禁用的字段会跳过验证，它们不参与表单的验证检查。字段的值会被保留，但不会被验证。关于验证行为的详细信息，请参阅[验证指南](/guide/forms/signals/validation)。

:::

### 始终禁用

要永久禁用某个字段，只需传入字段路径来调用 `disabled()`：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-settings',
  imports: [FormField],
  template: `
    <label>
      System ID (cannot be changed)
      <input [formField]="settingsForm.systemId" />
    </label>
  `,
})
export class Settings {
  settingsModel = signal({
    systemId: 'SYS-12345',
    userName: '',
  });

  settingsForm = form(this.settingsModel, (schemaPath) => {
    disabled(schemaPath.systemId);
  });
}
```

### 条件禁用

要根据条件禁用字段，可以提供一个返回 `true`（禁用）或 `false`（启用）的 `when` 函数：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      Order Total
      <input type="number" [formField]="orderForm.total" />
    </label>

    <label>
      Coupon Code
      <input [formField]="orderForm.couponCode" />
    </label>
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

在这个例子中，当订单总额低于 50 美元时，优惠码字段会被禁用。

### 禁用原因

禁用字段时，可以返回一个字符串而不是 `true`，以便向用户提供说明：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      Order Total
      <input type="number" [formField]="orderForm.total" />
    </label>

    <label>
      Coupon Code
      <input [formField]="orderForm.couponCode" />
    </label>

    @if (orderForm.couponCode().disabled()) {
      <div class="info">
        @for (reason of orderForm.couponCode().disabledReasons(); track reason) {
          <p>{{ reason.message }}</p>
        }
      </div>
    }
  `,
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    disabled(schemaPath.couponCode, {
      when: ({valueOf}) =>
        valueOf(schemaPath.total) < 50 ? 'Order must be $50 or more to use a coupon' : false,
    });
  });
}
```

`when` 函数可以返回：

- 一个**字符串**，表示禁用该字段并附带原因
- `false`，表示启用该字段（不是任意假值都可以，请显式使用 `false`）

通过字段状态上的 `disabledReasons()` 信号来访问这些原因。每个原因都有一个 `message` 属性，其中包含你返回的字符串。

#### 多个禁用原因

你也可以对同一个字段多次调用 `disabled()`，所有返回的原因都会累积起来：

```ts
orderForm = form(this.orderModel, (schemaPath) => {
  disabled(schemaPath.promoCode, {
    when: ({valueOf}) =>
      !valueOf(schemaPath.hasAccount) ? 'You must have an account to use promo codes' : false,
  });
  disabled(schemaPath.promoCode, {
    when: ({valueOf}) => (valueOf(schemaPath.total) < 25 ? 'Order must be at least $25' : false),
  });
});
```

如果两个条件都为真，该字段会显示两个禁用原因。当你希望将复杂的可用性规则分开管理时，这种模式很有用。

## 为字段配置 `hidden()` 状态

`hidden()` 规则用于配置字段的隐藏状态。不过，它只设置一个程序层面的状态。**字段是否显示在 UI 中由你来控制**。

::: warning 重要
与 `disabled` 和 `readonly` 不同，`hidden` 状态没有对应的原生 DOM 属性。`[formField]` 指令不会为元素应用 `hidden` attribute。你必须在模板中使用 `@if` 或 CSS，根据 `hidden()` 状态有条件地渲染字段。

:::

::: info 注意
与禁用的字段一样，隐藏的字段也会跳过验证。详情请参阅[验证指南](/guide/forms/signals/validation)。

:::

### 基本的字段隐藏

将 `hidden()` 与一个返回 `true`（隐藏）或 `false`（可见）的 `when` 函数配合使用：

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

### 始终隐藏

要永久隐藏某个字段，只需传入字段路径来调用 `hidden()`：

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

    <!-- publicUrl 被永久隐藏，因此这个块永远不会渲染 -->
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
    // 该字段现在被永久隐藏，并且不参与验证
    hidden(schemaPath.publicUrl);
  });
}
```

## 使用 `readonly()` 显示不可编辑的字段

`readonly()` 规则会阻止用户更新字段。`FormField` 指令会自动把这个状态绑定到 HTML 的 `readonly` attribute 上，它可以阻止编辑，同时仍允许用户聚焦和选择文本。

::: info 注意
只读字段会跳过[验证](/guide/forms/signals/validation)。

:::

### 始终只读

要让某个字段永久只读，只需传入字段路径来调用 `readonly()`：

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

`FormField` 指令会根据字段的状态自动绑定 `readonly` attribute。

### 条件只读

要根据条件让字段只读，可以提供一个 `when` 函数：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, readonly} from '@angular/forms/signals';

@Component({
  selector: 'app-document',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="documentForm.isLocked" />
      Lock document
    </label>

    <label>
      Document Title
      <input [formField]="documentForm.title" />
    </label>
  `,
})
export class Document {
  documentModel = signal({
    isLocked: false,
    title: 'Untitled',
  });

  documentForm = form(this.documentModel, (schemaPath) => {
    readonly(schemaPath.title, {when: ({valueOf}) => valueOf(schemaPath.isLocked)});
  });
}
```

当 `isLocked` 为 true 时，标题字段会变为只读。

## 在 hidden、disabled 和 readonly 之间做选择

这三个配置函数以不同的方式控制字段的可用性：

在以下情况下选择 `hidden()`：

- 字段根本不应出现在 UI 中
- 字段与当前表单状态无关
- 例如：勾选了 "same as billing"（与账单地址相同）时的配送地址字段

在以下情况下选择 `disabled()`：

- 字段应该可见但不可编辑
- 需要说明它为何不可用（使用禁用原因）
- 应从 HTML 表单提交中排除
- 例如：在表单有效之前禁用的提交按钮，对非管理员用户禁用的审批字段

在以下情况下选择 `readonly()`：

- 字段应该可见但不可编辑
- 包含用户需要查看、选择或复制的数据
- 应包含在 HTML 表单提交中
- 例如：订单确认号、系统生成的参考编码

这三者在生效时都会跳过验证并阻止用户编辑。主要区别如下：

| 特性                             | `hidden()` | `disabled()` | `readonly()` |
| -------------------------------- | ---------- | ------------ | ------------ |
| 在 UI 中可见                     | 否         | 是           | 是           |
| 用户可以聚焦/选择                | 否         | 否           | 是           |
| 包含在 HTML 表单提交中           | 否         | 否           | 是           |

## 使用 `debounce()` 延迟输入操作

`debounce()` 规则会推迟表单模型的更新。这对于性能优化以及在快速输入时减少不必要的操作很有用。

### 防抖的作用

如果没有防抖，每次按键都会立即更新表单模型。这可能会触发：

- 每次变化都要重新计算的、开销较大的计算信号（computed）
- 每输入一个字符后的验证检查
- 与模型值相关联的 API 调用或其他副作用

防抖可以推迟这些更新，减少不必要的工作。

### 基本防抖

你可以通过指定以毫秒为单位的延迟来为字段设置防抖：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, debounce} from '@angular/forms/signals';

@Component({
  selector: 'app-search',
  imports: [FormField],
  template: `
    <label>
      Search
      <input [formField]="searchForm.query" />
    </label>

    <p>Searching for: {{ searchForm.query().value() }}</p>
  `,
})
export class Search {
  searchModel = signal({
    query: '',
  });

  searchForm = form(this.searchModel, (schemaPath) => {
    debounce(schemaPath.query, 300);
  });
}
```

设置 300 毫秒的防抖后：

- 用户在输入框中输入
- 只有在停止输入 300 毫秒后，表单模型才会更新
- 如果用户持续输入，每次按键都会重置计时器
- 一旦用户停顿 300 毫秒，模型就会以最终值更新

### 时机保证

`debounce()` 函数通过以下机制确保用户不会丢失数据：

- **被标记为已触碰（touched）时**：值会立即同步，并中止所有挂起的防抖延迟。这会在字段失去焦点（blur）或被显式标记为已触碰时发生。
- **表单提交时**：在验证之前，所有字段都会被标记为已触碰，从而确保所有防抖中的值都会立即同步。

这意味着用户可以快速输入、按 Tab 键离开或提交表单，而无需等待防抖延迟到期。

### 自定义防抖逻辑

如需更高级的控制，可以提供一个防抖函数来控制何时同步值。每次控件值更新时都会调用这个函数，它可以返回 `undefined` 来立即同步，也可以返回一个 Promise，在它 resolve 之前阻止同步：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, debounce} from '@angular/forms/signals';

@Component({
  selector: 'app-search',
  imports: [FormField],
  template: `
    <label>
      Search
      <input [formField]="searchForm.query" />
    </label>
  `,
})
export class Search {
  searchModel = signal({
    query: '',
  });

  searchForm = form(this.searchModel, (schemaPath) => {
    debounce(schemaPath.query, (context, abortSignal) => {
      // 返回一个 Promise，它在 500 毫秒后 resolve，或在防抖被中止时立即 resolve
      return new Promise<void>((resolve) => {
        const timeoutId = setTimeout(resolve, 500);
        abortSignal.addEventListener(
          'abort',
          () => {
            clearTimeout(timeoutId);
            resolve();
          },
          {once: true},
        );
      });
    });
  });
}
```

防抖函数可以返回：

- `undefined`，表示立即同步值
- 一个 `Promise<void>`，在它 resolve 之前阻止同步

自定义防抖逻辑的使用场景：

- 实现超出简单延迟的自定义时机逻辑
- 将同步与外部事件进行协调
- 根据应用状态有条件地防抖

### 何时使用防抖

防抖在以下情况下最有用：

- 有依赖于该字段值的、开销较大的计算信号
- 该字段会触发 API 调用或其他副作用
- 希望在快速输入时减少验证开销
- 性能分析表明模型更新导致了性能下降

在以下情况下不要使用防抖：

- 字段需要立即更新才能获得良好的用户体验（例如计算器输入）
- 性能收益微乎其微
- 用户期望实时反馈

## 使用 `metadata()` 将数据与字段关联

元数据（metadata）会把响应式数据附加到字段上。验证规则在内部使用这个系统，你也可以发布自己的键，用于帮助文本、配置或计算出的显示值等应用特定的信息。

信号表单提供了一些预定义的元数据键，内置验证器（validator）会自动填充它们：

| 键           | 填充者               | 读取方式              |
| ------------ | -------------------- | --------------------- |
| `REQUIRED`   | `required()`         | `field().required()`  |
| `MIN`        | `min()`, `minDate()` | `field().min()`       |
| `MAX`        | `max()`, `maxDate()` | `field().max()`       |
| `MIN_LENGTH` | `minLength()`        | `field().minLength()` |
| `MAX_LENGTH` | `maxLength()`        | `field().maxLength()` |
| `PATTERN`    | `pattern()`          | `field().pattern()`   |

`[formField]` 指令会自动把其中五个键（`REQUIRED`、`MIN`、`MAX`、`MIN_LENGTH` 和 `MAX_LENGTH`）绑定到原生表单控件上对应的 HTML attribute。`PATTERN` 是例外，因为信号表单支持每个字段有多个模式，而 HTML 的 `pattern` attribute 只接受一个正则表达式。

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, min, max} from '@angular/forms/signals';

@Component({
  selector: 'app-age',
  imports: [FormField],
  template: `
    <label>
      Age (between {{ ageForm.age().min?.() }} and {{ ageForm.age().max?.() }})
      <input type="number" [formField]="ageForm.age" />
    </label>

    @if (ageForm.age().required()) {
      <span class="required-indicator">*</span>
    }
  `,
})
export class Age {
  ageModel = signal({age: 0});

  ageForm = form(this.ageModel, (schemaPath) => {
    required(schemaPath.age);
    min(schemaPath.age, 18);
    max(schemaPath.age, 120);
  });
}
```

### 响应式元数据

验证规则可以从其他字段派生约束，从而使发布的元数据具有响应性：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, max} from '@angular/forms/signals';

@Component({
  selector: 'app-inventory',
  imports: [FormField],
  template: `
    <label>
      Item
      <select [formField]="inventoryForm.item">
        <option value="widget">Widget</option>
        <option value="gadget">Gadget</option>
      </select>
    </label>

    <label>
      Quantity (max: {{ inventoryForm.quantity().max?.() }})
      <input type="number" [formField]="inventoryForm.quantity" />
    </label>
  `,
})
export class Inventory {
  inventoryModel = signal({
    item: 'widget',
    quantity: 0,
  });

  inventoryForm = form(this.inventoryModel, (schemaPath) => {
    max(schemaPath.quantity, ({valueOf}) => {
      const item = valueOf(schemaPath.item);
      return item === 'widget' ? 100 : 50;
    });
  });
}
```

`max()` 验证规则会根据所选的商品以响应式的方式设置 `MAX` 元数据，因此任何读取 `field().max()` 的模板或控件都会在商品变化时随之更新。

如需更深入的介绍，包括如何定义自定义键、如何用归约函数（reducer）合并多个贡献值，以及如何为具有生命周期的对象使用托管元数据，请参阅[字段元数据指南](/guide/forms/signals/field-metadata)。

## 组合规则

你可以对同一个字段应用多个规则，也可以使用条件逻辑，根据表单状态应用整组规则。

### 在一个字段上应用多个规则

应用多个规则来配置字段行为的各个方面：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled, hidden, debounce, metadata} from '@angular/forms/signals';
import {PLACEHOLDER} from './metadata-keys';

@Component({
  selector: 'app-promo',
  imports: [FormField],
  template: `
    @if (!promoForm.promoCode().hidden()) {
      <label>
        Promo Code
        <input [formField]="promoForm.promoCode" />
      </label>
    }
  `,
})
export class Promo {
  promoModel = signal({
    hasAccount: false,
    subscriptionType: 'free' as 'free' | 'premium',
    promoCode: '',
  });

  promoForm = form(this.promoModel, (schemaPath) => {
    disabled(schemaPath.promoCode, {
      when: ({valueOf}) => (!valueOf(schemaPath.hasAccount) ? 'You must have an account' : false),
    });
    hidden(schemaPath.promoCode, {
      when: ({valueOf}) => valueOf(schemaPath.subscriptionType) === 'free',
    });
    debounce(schemaPath.promoCode, 300);
    metadata(schemaPath.promoCode, PLACEHOLDER, () => 'Enter promo code');
  });
}
```

这些规则会协同工作：

- 隐藏优先：如果字段被隐藏，禁用状态就无关紧要了
- 无论只读状态如何，禁用都会阻止编辑
- 无论其他状态如何，防抖都会影响模型更新
- 元数据是独立的，始终可用

### 使用 applyWhen 实现条件逻辑

使用 `applyWhen()` 有条件地应用整组规则：

```ts
import {Component, signal} from '@angular/core';
import {form, FormField, applyWhen, required, pattern} from '@angular/forms/signals';

@Component({
  selector: 'app-address',
  imports: [FormField],
  template: `
    <label>
      Country
      <select [formField]="addressForm.country">
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>
    </label>

    <label>
      Zip/Postal Code
      <input [formField]="addressForm.zipCode" />
    </label>
  `,
})
export class Address {
  addressModel = signal({
    country: 'US',
    zipCode: '',
  });

  addressForm = form(this.addressModel, (schemaPath) => {
    applyWhen(
      schemaPath,
      ({valueOf}) => valueOf(schemaPath.country) === 'US',
      (schemaPath) => {
        // 仅当国家为 US 时应用
        required(schemaPath.zipCode);
        pattern(schemaPath.zipCode, /^\d{5}(-\d{4})?$/);
      },
    );
  });
}
```

`applyWhen()` 函数接收：

1. 要应用逻辑的路径（通常是表单的根路径）
2. 一个返回 `true`（应用）或 `false`（不应用）的响应式逻辑函数
3. 一个定义条件规则的 schema 函数

只有当条件为真时，这些条件规则才会运行。对于验证规则或行为会随用户选择而变化的复杂表单，这非常有用。

### 可复用的 schema 函数

将常用的规则配置提取到可复用的函数中：

```ts
import {SchemaPath, debounce, metadata, maxLength, form} from '@angular/forms/signals';
import {PLACEHOLDER} from './metadata-keys';

function emailFieldConfig(path: SchemaPath<string>) {
  debounce(path, 300);
  metadata(path, PLACEHOLDER, () => 'user@example.com');
  maxLength(path, 255);
}

// 在多个表单中使用
const contactForm = form(contactModel, (schemaPath) => {
  emailFieldConfig(schemaPath.email);
  emailFieldConfig(schemaPath.alternateEmail);
});

const registrationForm = form(registrationModel, (schemaPath) => {
  emailFieldConfig(schemaPath.email);
});
```

当你的应用中有多个表单都会用到的标准字段配置时，这种模式很有用。

## 后续步骤

要进一步了解信号表单，请查看以下相关指南：

- [字段状态管理](/guide/forms/signals/field-state-management)：了解如何在模板和组件（Component）逻辑中使用这些函数创建的状态信号
- [验证](/guide/forms/signals/validation)：了解验证规则和错误处理
- [自定义控件](/guide/forms/signals/custom-controls)：了解自定义控件如何读取元数据和状态来自动完成自身配置
