# 设计表单模型

信号表单（Signal Forms）采用模型驱动的方式，直接从你提供的模型中推导出表单的状态和结构。由于模型是整个表单的基础，因此一开始就设计好表单模型非常重要。本指南介绍设计表单模型的最佳实践。

## 表单模型与领域模型

表单用于收集用户输入。你的应用很可能已经有一个领域模型来表示这些输入，它针对业务逻辑或存储做了优化。然而，这往往与我们希望在表单中对数据建模的方式*不同*。

表单模型表示的是 UI 中呈现的原始用户输入。例如，在表单中你可能会让用户通过两个独立的输入框分别选择预约的日期和时间段，即使你的领域模型将其表示为单个 JavaScript `Date` 对象。

```ts
interface AppointmentFormModel {
  name: string; // 预约人的姓名
  date: Date; // 预约日期（只携带日期信息，时间部分不使用）
  time: string; // 以字符串表示的所选时间
}

interface AppointmentDomainModel {
  name: string; // 预约人的姓名
  time: Date; // 预约时间（同时携带日期和时间信息）
}
```

表单应当使用针对输入体验量身定制的表单模型，而不是简单地复用领域模型。

## 表单模型最佳实践

### 使用明确的类型

始终像[使用 TypeScript 类型](/guide/forms/signals/models#using-typescript-types)中所示那样为模型定义接口或类型。显式类型能提供更好的 IntelliSense，在编译时捕获错误，并且可以作为表单所含数据的文档。

### 初始化所有字段

为模型中的每个字段（field）提供初始值：

```ts [All fields initialized]
const taskModel = signal({
  title: '',
  description: '',
  priority: 'medium',
  completed: false,
});
```

```ts [Partial initialization]
const taskModel = signal({
  title: '',
  // 缺少 description、priority、completed
});
```

缺少初始值意味着这些字段不会出现在字段树中，表单交互也就无法访问它们。

### 保持模型专注

每个模型应当只表示一个表单，或一组内聚的相关数据：

```ts [Focused on a single purpose]
const loginModel = signal({
  email: '',
  password: '',
});
```

```ts [Mixing unrelated concerns]
const appModel = signal({
  // 登录数据
  email: '',
  password: '',
  // 用户偏好
  theme: 'light',
  language: 'en',
  // 购物车
  cartItems: [],
});
```

为不同的关注点使用不同的模型，能让表单更易于理解和复用。如果你要管理多组不同的数据，请创建多个表单。

### 考虑验证需求

设计模型时要把验证考虑进去。把需要一起验证的字段组织在一起：

```ts [Related fields grouped for comparison]
// 将密码字段组织在一起以便比较
interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

这种结构让跨字段验证（例如检查 `newPassword` 是否与 `confirmPassword` 一致）更加自然。

### 让数据类型与 UI 控件相匹配

表单模型上的属性应当与 UI 控件所期望的数据类型相匹配。

例如，假设有一个饮料订购表单，包含一个 `size` 字段（6 罐、12 罐或 24 罐装）和一个 `quantity` 字段。UI 使用下拉框（`<select>`）选择规格，使用数字输入框（`<input type="number">`）填写数量。

虽然规格选项看起来是数字，但 `<select>` 元素处理的是字符串值，因此 `size` 应当建模为字符串。而 `<input type="number">` 确实处理数字，所以 `quantity` 可以建模为数字。

```ts [Appropriate data types for the bound UI controls]
interface BeverageOrderFormModel {
  size: string; // 绑定到：<select>（选项值："6"、"12"、"24"）
  quantity: number; // 绑定到：<input type="number">
}
```

### 避免 `undefined`

表单模型中不能包含 `undefined` 值或属性。在信号表单中，表单的结构是从模型的结构推导而来的，而 `undefined` 表示*字段不存在*，而不是一个值为空的字段。这意味着你还必须避免可选字段（例如 `{property?: string}`），因为它们隐式地允许 `undefined`。

要在表单模型中表示一个空值属性，请使用 UI 控件能理解为「空」的值（例如对 `<input type="text">` 使用 `""`）。如果你在设计自定义 UI 控件，`null` 通常是表示「空」的好选择。

```ts [Appropriate empty values]
interface UserFormModel {
  name: string; // 绑定到 <input type="text">
  birthday: Date | null; // 绑定到 <input type="date">
}

// 用空值初始化表单。
form(signal({name: '', birthday: null}));
```

### 避免结构动态变化的模型

如果表单模型会根据其值改变形状（即对象上的属性发生变化），那么它就具有动态结构。当模型类型允许不同形状的值时就会出现这种情况，例如由属性不同的对象类型组成的联合类型，或者对象与原始类型的联合类型。下面几节将探讨几种常见场景：在这些场景中，结构动态变化的模型看似很有吸引力，但最终会带来问题。

#### 复杂对象的空值

我们经常用表单让用户输入全新的数据，而不是编辑系统中已有的数据。账号注册表单就是一个很好的例子。我们可能会用下面的表单模型来建模。

```ts
interface CreateAccountFormModel {
  name: {
    first: string;
    last: string;
  };
  username: string;
}
```

创建表单时我们会遇到一个难题：模型的初始值应该是什么？由于还没有任何用户输入，你可能很想创建一个 `form<CreateAccountFormModel | null>()`。

```ts [Using null as empty value for complex object]
createAccountForm = form<CreateAccountFormModel | null>(signal(/* 这里该填什么，null？ */));
```

然而，要记住信号表单是*模型驱动*的。如果模型是 `null`，而 `null` 没有 `name` 或 `username` 属性，那么表单也就不会有这些子字段。我们真正需要的是一个 `CreateAccountFormModel` 实例，其所有叶子字段都设置为空值。

```ts [Same shape value with empty values for properties]
createAccountForm = form<CreateAccountFormModel>(
  signal({
    name: {
      first: '',
      last: '',
    },
    username: '',
  }),
);
```

使用这种表示方式，我们需要的所有子字段都存在了，可以在模板（template）中用 `[formField]` 指令（directive）绑定它们。

```html
First: <input [formField]="createAccountForm.name.first" /> Last:
<input [formField]="createAccountForm.name.last" /> Username:
<input [formField]="createAccountForm.username" />
```

#### 有条件隐藏或不可用的字段

表单并不总是线性的。你经常需要根据用户之前的输入创建条件分支。一个例子是为用户提供不同支付方式的表单。我们先来想象一下这种表单的 UI 可能是什么样子。

```html
Name: <input type="text" />

<section>
  <h2>Payment Info</h2>
  <input type="radio" /> Credit Card @if (/* credit card selected */) {
  <section>
    Card Number <input type="text" /> Security Code <input type="text" /> Expiration
    <input type="text" />
  </section>
  }
  <input type="radio" /> Bank Account @if (/* bank account selected */) {
  <section>Account Number <input type="text" /> Routing Number <input type="text" /></section>
  }
</section>
```

处理这种情况的最佳方式是使用结构静态的表单模型，为*所有*可能的支付方式都包含字段。在 schema 中，我们可以隐藏或禁用当前不可用的字段。

```ts [Static structure model]
interface BillPayFormModel {
  name: string;
  method: {
    type: string;
    card: {
      cardNumber: string;
      securityCode: string;
      expiration: string;
    };
    bank: {
      accountNumber: string;
      routingNumber: string;
    };
  };
}

const billPaySchema = schema<BillPayFormModel>((billPay) => {
  // 当用户选择了信用卡以外的支付方式时，隐藏信用卡详情。
  hidden(billPay.method.card, {when: ({valueOf}) => valueOf(billPay.method.type) !== 'card'});
  // 当用户选择了银行账户以外的支付方式时，隐藏银行账户详情。
  hidden(billPay.method.bank, {when: ({valueOf}) => valueOf(billPay.method.type) !== 'bank'});
});
```

使用这个模型，`card` 和 `bank` 对象始终存在于表单状态中。当用户切换支付方式时，我们只更新 `type` 属性。用户在信用卡字段中输入的数据仍会安全地保存在 `card` 对象中，如果用户切换回来，就可以重新显示。

相比之下，结构动态的表单模型乍看之下似乎很适合这种用例。毕竟，如果用户选择了 "Credit Card"（信用卡），我们就不需要账号和路由号码字段。我们可能会想把它建模为可辨识联合类型：

```ts [Dynamic structure model]
interface BillPayFormModel {
  name: string;
  method:
    | {
        type: 'card';
        cardNumber: string;
        securityCode: string;
        expiration: string;
      }
    | {
        type: 'bank';
        accountNumber: string;
        routingNumber: string;
      };
}
```

但是，考虑一下下面这个场景会发生什么：

1. 用户填写了姓名和信用卡信息
2. 正准备提交时，他们在最后一刻注意到了手续费。
3. 他们改选银行账户选项，心想不如避开这笔手续费。
4. 正要输入银行账户信息时，他们又犹豫了，不希望这些信息最终被泄露。
5. 他们切换回信用卡选项，却发现刚才输入的所有信息都不见了！

这说明了结构动态的表单模型的另一个问题：它们可能导致数据丢失。这样的模型假定一旦某个字段被隐藏，其中的信息就再也不需要了。它用银行信息替换了信用卡信息，并且无法再找回信用卡信息。

#### 例外情况

虽然通常更推荐静态结构，但在某些特定场景下，动态结构是必要且受支持的。

##### 数组

数组是最常见的例外。表单经常需要收集数量可变的条目，例如电话号码列表、参会人员或订单中的明细行。

```ts
interface SendEmailFormModel {
  subject: string;
  recipientEmails: string[];
}
```

在这种情况下，`recipientEmails` 数组会随着用户与表单的交互而增长或缩减。虽然数组的长度是动态的，但各个条目的结构应当保持一致（每个条目都应具有相同的形状）。

##### 被 UI 控件当作原子值处理的字段

另一种可以接受动态结构的情况是：UI 控件把一个复杂对象当作单个原子值来处理。也就是说，控件不会尝试单独绑定或访问它的任何子字段。在这种场景下，控件通过一次性替换整个对象来更新值，而不是修改其内部属性。由于此时表单结构无关紧要，因此该结构是动态的也没有问题。

例如，假设一个用户资料表单包含 `location` 字段。位置通过一个复杂的「位置选择器」小部件（可能是地图或输入联想下拉框）来选择，它返回一个坐标对象。当尚未选择位置，或用户选择不分享位置时，选择器会将位置表示为 `null`。

```ts [Dynamic structure is ok when field is treated as atomic]
interface Location {
  lat: number;
  lng: number;
}

interface UserProfileFormModel {
  username: string;
  // 这个属性具有动态结构，
  // 但这没有问题，因为位置选择器把这个字段当作原子值处理。
  location: Location | null;
}
```

在模板中，我们直接把 `location` 字段绑定到自定义控件上：

```html
Username: <input [formField]="userForm.username" /> Location:
<location-picker [formField]="userForm.location"></location-picker>
```

这里，`<location-picker>` 消费并产出整个 `Location` 对象（或 `null`），而不会访问 `userForm.location.lat` 或 `userForm.location.lng`。因此，`location` 可以安全地拥有动态形状，而不会违背模型驱动表单的原则。

## 在表单模型与领域模型之间转换

由于表单模型和领域模型以不同方式表示同一个概念，我们需要一种在这两种表示之间进行转换的方法。当我们想在表单中向用户展示系统中已有的数据时，需要把它从领域模型表示转换为表单模型表示。反过来，当我们要保存用户的修改时，需要把数据从表单模型表示转换为领域模型表示。

假设我们有一个领域模型和一个表单模型，并且已经编写了一些在两者之间转换的函数。

```ts
interface MyDomainModel { ... }

interface MyFormModel { ... }

// 填充了空输入的 `MyFormModel` 实例（例如字符串输入使用 `''` 等）
const EMPTY_MY_FORM_MODEL: MyFormModel = { ... };

function domainModelToFormModel(domainModel: MyDomainModel): MyFormModel { ... }

function formModelToDomainModel(formModel: MyFormModel): MyDomainModel { ... }
```

### 领域模型到表单模型

当我们创建一个表单来编辑系统中已有的领域模型时，通常会通过表单组件（component）的 `input()` 或从后端（例如通过资源（Resource））获取该领域模型。无论哪种情况，`linkedSignal` 都是执行转换的绝佳方式。

如果领域模型是通过 `input()` 接收的，我们可以用 `linkedSignal` 基于输入（input）信号（signal）创建一个可写的表单模型。

```ts [Use linkedSignal to convert domain model to form model]
@Component(...)
class MyForm {
  // 用于初始化表单的领域模型，如果未提供，则从空表单开始。
  readonly domainModel = input<MyDomainModel>();

  private readonly formModel = linkedSignal({
    // 基于领域模型的链接信号
    source: this.domainModel,
    // 如果领域模型已定义，则将其转换为表单模型，否则使用空表单模型。
    computation: (domainModel) => domainModel
      ? domainModelToFormModel(domainModel)
      : EMPTY_MY_FORM_MODEL
  });

  protected readonly myForm = form(this.formModel);
}
```

同样，当我们通过资源从后端接收领域模型时，可以基于资源的值创建一个 `linkedSignal` 来得到 `formModel`。在这种场景下，获取领域模型可能需要一些时间，因此应当在数据加载完成之前禁用表单。

```ts [Disable or hide the form when data is unavailable]
@Component(...)
class MyForm {
  // 从后端获取领域模型。
  readonly domainModelResource: ResourceRef<MyDomainModel | undefined> = httpResource(...);

  private readonly formModel = linkedSignal({
    // 基于领域模型资源的链接信号
    source: this.domainModelResource.value,
    // 加载完成后转换领域模型，加载期间使用空表单模型。
    computation: (domainModel) => domainModel
      ? domainModelToFormModel(domainModel)
      : EMPTY_MY_FORM_MODEL
  });

  protected readonly myForm = form(this.formModel, (root) => {
    // 资源加载期间禁用整个表单。
    disabled(root, {when: () => this.domainModelResource.isLoading()});
  });
}
```

上面的示例展示的是直接从领域模型纯粹地推导出表单模型。不过在某些情况下，你可能希望在新的领域模型值与之前的领域模型值和表单模型值之间执行更高级的差异比对操作。这可以基于 `linkedSignal` 的[先前状态](/guide/signals/linked-signal#accounting-for-previous-state)来实现。

### 表单模型到领域模型

当我们准备把用户输入保存回系统时，需要把它转换为领域模型表示。这通常发生在用户提交表单时，对于自动保存的表单，则在用户编辑过程中持续进行。

要在提交时保存，可以在 `submit` 函数中处理转换。

```ts [Convert form model to domain model on submit]
@Component(...)
class MyForm {
  private readonly myDataService = inject(MyDataService);

  protected readonly myForm = form<MyFormModel>(...);

  handleSubmit() {
    submit(this.myForm, async () => {
      await this.myDataService.update(formModelToDomainModel(this.myForm().value()));
    });
  };
}
```

或者，你也可以直接把表单模型发送到服务器，在服务器上完成从
表单模型到领域模型的转换。

对于持续保存，可以在 `effect` 中更新领域模型。

```ts [Convert form model to domain model in an effect for auto-saving]
@Component(...)
class MyForm {
  readonly domainModel = model.required<MyDomainModel>()

  protected readonly myForm = form(...);

  constructor() {
    effect(() => {
      // 当表单模型变为有效值时，更新领域模型。
      if (this.myForm().valid()) {
        this.domainModel.set(formModelToDomainModel(this.myForm().value()));
      }
    });
  };
}
```

上面的示例展示的是从表单模型到领域模型的纯转换。不过，除了表单模型的值之外，同时考虑完整的表单状态也是完全可以的。例如，为了节省字节，我们可能只想根据用户修改过的内容向服务器发送部分更新。在这种情况下，转换函数可以设计为接收整个表单状态，并根据表单的值和脏状态返回一个稀疏的领域模型。

```ts
type Sparse<T> = T extends object ? {
    [P in keyof T]?: Sparse<T[P]>;
} : T;

function formStateToPartialDomainModel(
  formState: FieldState<MyFormModel>
): Sparse<MyDomainModel> { ... }
```
