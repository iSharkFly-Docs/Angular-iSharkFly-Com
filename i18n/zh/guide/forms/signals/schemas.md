# schema 与 schema 的可组合性

信号表单（Signal Forms）采用双层架构，把*表单的结构*与*表单在运行时的行为*区分开来。

当你把一个 schema 函数传给 `form()` 时，这个函数会在创建表单时*只运行一次*。它的任务是建立表单的逻辑树：声明哪些字段（field）有验证、哪些字段被禁用、哪些字段依赖于其他字段。这就是表单的**结构层**。

在 schema 函数内部，你会调用 `disabled()`、`validate()` 等规则函数。这些规则函数接收响应式逻辑，只要其中引用的信号（Signal）发生变化，这些逻辑就会重新计算。像 `disabled()` 和 `required()` 这样的条件规则可以接收可选配置，其中包括用于激活该规则的 `when` 函数。它们共同构成了表单在运行时的**行为层**。

```ts
contactForm = form(this.contactModel, (schemaPath) => {
  // schema 函数：在创建表单时只运行一次
  required(schemaPath.name);
  disabled(schemaPath.couponCode, {when: ({valueOf}) => valueOf(schemaPath.total) < 50});
  //  ^^^ 响应式逻辑：total 变化时重新计算
});
```

```txt
graph TD
    A["form(model, schemaFn)"] --> B["Schema function runs ONCE"]
    B --> C["required(path)"]
    B --> D["disabled(path, {when: logicFn})"]
    B --> E["validate(path, logicFn)"]
    B --> F["apply(path, schema)"]
    C --> G["Reactive: recomputes on signal change"]
    D --> G
    E --> G
    F --> B2["Nested schema function runs ONCE"]
    B2 --> G
```

在组合 schema 时，这个区别非常重要，因为 `apply()`、`applyWhen()` 和 `schema()` 等函数都作用于结构层。schema 控制*哪些*规则存在以及它们*是否*处于激活状态，而规则函数定义的是这些规则要*计算什么*。

## 使用 `schema()` 创建可复用的 schema

当多个表单对同一种常见数据结构使用相同的规则时，可以使用 `schema()` 函数把这些规则提取成一个可复用的 schema。

```ts
import {schema, required, minLength} from '@angular/forms/signals';

const nameSchema = schema<{first: string; last: string}>((name) => {
  required(name.first);
  required(name.last);
  minLength(name.first, 2);
  minLength(name.last, 2);
});
```

`schema()` 函数会包装一个函数，并将其转换为可复用的 `Schema<T>` 对象。和任何 schema 函数一样，它在每个表单中*只运行一次*，但这个对象本身可以在任意多个表单之间共享。

::: tip 提示
如果规则只出现在一个地方，使用内联的 schema 函数同样可以。当你想在多个表单之间复用同一个 schema，或者把同一个 schema 应用到多个路径上时，再使用 `schema()`。可复用的 `Schema` 对象会在每次表单编译时被缓存。

:::

### 通过 `apply()` 使用 schema

你可以使用 `apply()` 函数把可复用的 schema 应用到表单中的特定路径。调用 `apply()` 时，schema 会收到一个限定了作用域的路径，只能看到该子路径下的字段：

```ts
import {apply, form} from '@angular/forms/signals';

profileForm = form(this.profileModel, (schemaPath) => {
  apply(schemaPath.name, nameSchema);
});

registrationForm = form(this.registrationModel, (schemaPath) => {
  apply(schemaPath.name, nameSchema);
});
```

## 使用 `applyWhen()` 的条件 schema

::: info 注意
[添加表单逻辑指南](/guide/forms/signals/form-logic)介绍了如何用 `applyWhen()` 配合内联逻辑实现条件规则。本节介绍如何把 `applyWhen()` 与可复用的 schema 组合使用。

:::

有些规则只应在特定条件下生效。例如，邮政编码字段可能只在所选国家是美国时才需要验证。

`applyWhen()` 函数会根据响应式状态有条件地应用 schema。它接收三个参数：

1. 要应用 schema 的路径
1. 一个响应式逻辑函数，在 schema 应当激活时返回 `true`
1. 包含条件规则的 schema 或 schema 函数

```ts
import {form, applyWhen, required, pattern} from '@angular/forms/signals';

addressForm = form(this.addressModel, (schemaPath) => {
  applyWhen(
    schemaPath,
    ({valueOf}) => valueOf(schemaPath.country) === 'US',
    (schemaPath) => {
      required(schemaPath.zipCode);
      pattern(schemaPath.zipCode, /^\d{5}(-\d{4})?$/);
    },
  );
});
```

逻辑函数会收到一个 `FieldContext`，通过它可以访问 `value`、`valueOf`、`stateOf` 以及其他响应式辅助函数。由于它是响应式的，只要它读取的信号发生变化，条件就会重新求值。当条件变为 `false` 时，schema 中的规则会停用；当它再次变为 `true` 时，这些规则会重新激活。

schema 本身仍然属于结构层：schema 函数在创建表单时只运行一次。条件控制的是这些规则是否*激活*，而不是它们是否*存在*。

在条件 schema 内部，请使用传给该 schema 函数的限定作用域的路径参数。外层 schema 的路径在嵌套 schema 中是无效的。

### 把 `applyWhen()` 与可复用 schema 组合使用

由于 `applyWhen()` 接受 `Schema` 对象，你可以把它与 `schema()` 搭配使用，有条件地应用可复用的 schema：

```ts
const usZipCodeSchema = schema<{zipCode: string}>((address) => {
  required(address.zipCode);
  pattern(address.zipCode, /^\d{5}(-\d{4})?$/);
});

const caPostalCodeSchema = schema<{postalCode: string}>((address) => {
  required(address.postalCode);
  pattern(address.postalCode, /^[A-Z]\d[A-Z] \d[A-Z]\d$/);
});

shippingForm = form(this.shippingModel, (schemaPath) => {
  applyWhen(
    schemaPath.address,
    ({valueOf}) => valueOf(schemaPath.country) === 'US',
    usZipCodeSchema,
  );
  applyWhen(
    schemaPath.address,
    ({valueOf}) => valueOf(schemaPath.country) === 'CA',
    caPostalCodeSchema,
  );
});
```

::: info 注意
尽管路径参数是 `schemaPath.address`，逻辑函数仍然访问了 `valueOf(schemaPath.country)`。这是因为 `valueOf` 辅助函数可以访问表单中的任何字段，而不仅限于该作用域路径内的字段。

:::

这种模式让验证逻辑保持模块化：每个国家的地址规则都放在各自的 schema 中，表单则根据用户的选择决定激活哪一个。

## 使用 `applyWhenValue()` 进行类型收窄

`applyWhenValue()` 函数简化了只需要检查字段值的条件。条件函数收到的不是 `FieldContext`，而是字段的原始值。

```ts [applyWhen — logic function receives FieldContext]
applyWhen(schemaPath.payment, ({value}) => value().type === 'credit-card', creditCardSchema);
```

```ts [applyWhenValue — condition receives the value directly]
applyWhenValue(schemaPath.payment, (payment) => payment.type === 'credit-card', creditCardSchema);
```

`applyWhenValue()` 的主要优势在于支持 TypeScript 类型守卫。当条件函数是一个类型守卫时，schema 的类型参数会被收窄为守卫所确定的类型。这对可辨识联合类型尤其有用，因为其中每个变体都有不同的字段，需要不同的规则。

```ts
import {form, applyWhenValue, required} from '@angular/forms/signals';

interface CreditCard {
  type: 'credit-card';
  cardNumber: string;
  expiry: string;
  cvv: string;
}

interface BankTransfer {
  type: 'bank-transfer';
  accountNumber: string;
  routingNumber: string;
}

type PaymentMethod = CreditCard | BankTransfer;

function isCreditCard(value: PaymentMethod): value is CreditCard {
  return value.type === 'credit-card';
}

function isBankTransfer(value: PaymentMethod): value is BankTransfer {
  return value.type === 'bank-transfer';
}

paymentForm = form(this.paymentModel, (schemaPath) => {
  applyWhenValue(schemaPath, isCreditCard, (payment) => {
    // TypeScript 知道 payment 的作用域是 CreditCard
    required(payment.cardNumber);
    required(payment.expiry);
    required(payment.cvv);
  });

  applyWhenValue(schemaPath, isBankTransfer, (payment) => {
    // TypeScript 知道 payment 的作用域是 BankTransfer
    required(payment.accountNumber);
    required(payment.routingNumber);
  });
});
```

如果没有类型守卫，TypeScript 就无法知道每个 schema 函数中有哪些字段可用。类型收窄确保了在信用卡分支中访问 `payment.cardNumber`、在银行转账分支中访问 `payment.accountNumber` 都是类型安全的。

## 使用 `applyEach()` 处理数组项

当表单包含一个对象数组时，你常常需要对每一项应用相同的规则。`applyEach()` 函数会把一个 schema 应用到数组字段中的每一项，无论有多少项。

```ts
import {form, applyEach, required, min} from '@angular/forms/signals';

type LineItem = {name: string; quantity: number};

orderForm = form(this.orderModel, (schemaPath) => {
  required(schemaPath.title);

  applyEach(schemaPath.items, (item) => {
    required(item.name);
    min(item.quantity, 1);
  });
});
```

传给 `applyEach()` 的 schema 函数会收到一个作用域限定为单个数组项的 `SchemaPathTree`。其中声明的规则会应用到数组中的每一项，包括创建表单之后才添加的项。

### 把 `applyEach()` 与可复用 schema 组合使用

由于 `applyEach()` 接受 `Schema` 对象，你可以把项级别的规则提取到一个可复用的 schema 中，并在多个表单之间共享：

```ts
const lineItemSchema = schema<LineItem>((item) => {
  required(item.name);
  min(item.quantity, 1);
});

orderForm = form(this.orderModel, (schemaPath) => {
  required(schemaPath.title);
  applyEach(schemaPath.items, lineItemSchema);
});

invoiceForm = form(this.invoiceModel, (schemaPath) => {
  required(schemaPath.invoiceNumber);
  applyEach(schemaPath.lineItems, lineItemSchema);
});
```

::: tip 提示
关于验证数组项的更多内容（包括为每个字段自定义错误消息），请参阅[验证指南](/guide/forms/signals/validation)。

:::

## 后续步骤

要进一步了解信号表单，请查看以下相关指南：

- [添加表单逻辑](/guide/forms/signals/form-logic) - 了解如何为表单添加条件逻辑、动态行为和元数据
- [验证](/guide/forms/signals/validation) - 了解验证规则和错误处理
- [异步操作](/guide/forms/signals/async-operations) - 了解如何处理表单提交和异步验证
