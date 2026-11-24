# 表单模型 {#form-models}

表单模型是信号表单（Signal Forms）的基础，是表单数据的唯一事实来源。本指南介绍如何创建表单模型、更新表单模型，以及如何设计出易于维护的表单模型。

::: info 注意
表单模型与 Angular 中用于组件（component）双向绑定（two-way binding）的 `model()` 信号（signal）不同。表单模型是一个存储表单数据的可写信号（writable signal），而 `model()` 创建的是用于父子组件通信的输入（input）/ 输出（output）。

:::

## 表单模型解决了什么问题 {#what-form-models-solve}

表单需要管理随时间变化的数据。如果没有清晰的结构，这些数据可能会分散在组件的各个属性中，导致难以跟踪变化、验证输入或将数据提交到服务器。

表单模型通过把表单数据集中到单个可写信号中来解决这个问题。当模型更新时，表单会自动反映这些变化；当用户与表单交互时，模型也会相应地更新。

## 创建模型 {#creating-models}

表单模型是用 Angular 的 `signal()` 函数创建的可写信号。该信号持有一个表示表单数据结构的对象。

```ts
import {Component, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `
    <input type="email" [formField]="loginForm.email" />
    <input type="password" [formField]="loginForm.password" />
  `,
})
export class LoginComponent {
  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
```

[`form()`](https://angular.dev/api/forms/signals/form) 函数接收模型信号并创建一个**字段树**（field tree）——一种与模型形状相对应的特殊对象结构。字段树既可以导航（使用 `loginForm.email` 这样的点号语法访问子字段），也可以调用（把字段当作函数调用以访问其状态）。

`[formField]` 指令（directive）把每个输入元素绑定到字段树中对应的字段（field）上，从而在 UI 与模型之间实现自动的双向同步。

### 支持的模型结构 {#supported-model-structures}

信号表单通过遍历模型来构建字段树。它所遍历的对象和数组（即**结构层**）必须是普通的 JavaScript 对象和数组。位于**叶子**（没有嵌套字段的位置）上的值通常是原始类型（字符串、数字、布尔值）或 `null`。原生的 `date`、`month`、`time` 和 `week` 输入框也接受 `Date`，而自定义控件可以接受它们能理解的任何值类型。

```ts [Plain structure]
interface UserFormModel {
  name: string;
  birthday: Date | null;
  preferences: {
    theme: string;
    notifications: boolean;
  };
  tags: string[];
}

const userModel = signal<UserFormModel>({
  name: '',
  birthday: null,
  preferences: {
    theme: 'dark',
    notifications: true,
  },
  tags: [],
});
```

::: warning 重要
类实例、`Map` 和 `Set` **不能用在结构层中**，尽管 TypeScript 会接受它们。信号表单不会在运行时验证模型的形状，因此框架接受这些值时不会抛出错误，但随后会根据形状的不同以不同的方式产生错误行为：

:::

- **类实例**在第一次写入时就会丢失原型，因为信号表单在更新时会对父对象进行浅拷贝。之后方法、getter 和 `instanceof` 检查都会失效。
- **数组中不可扩展或已冻结的对象**会抛出错误，因为信号表单需要给它们赋一个跟踪用的 symbol，以便在重新排序时保持条目的身份。
- **`Map` 和 `Set`** 会生成空的字段树，因为信号表单使用 `Object.keys` 来枚举子项。

如果你的应用使用类来进行领域建模，请在表单边界处将其转换为普通对象。参见[在表单模型与领域模型之间转换](/guide/forms/signals/model-design#translating-between-form-model-and-domain-model)。

### 使用 TypeScript 类型 {#using-typescript-types}

虽然 TypeScript 会从对象字面量推断类型，但定义显式类型可以提高代码质量，并提供更好的 IntelliSense 支持。

```ts
interface LoginData {
  email: string;
  password: string;
}

export class LoginComponent {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
```

有了显式类型，字段树就能提供完整的类型安全。访问 `loginForm.email` 得到的类型是 `FieldTree<string>`，而尝试访问不存在的属性会导致编译时错误。

```ts
// TypeScript 知道这是 FieldTree<string>
const emailField = loginForm.email;

// TypeScript 错误：Property 'username' does not exist
const usernameField = loginForm.username;
```

### 初始化所有字段 {#initializing-all-fields}

表单模型应当为所有你希望包含在字段树中的字段提供初始值。

```ts
// 推荐：所有字段都已初始化
const userModel = signal({
  name: '',
  email: '',
  age: 0,
});
```

```ts
// 避免：缺少初始值
const userModel = signal({
  name: '',
  email: '',
  // 未定义 age 字段——无法访问 userForm.age
});
```

对于可选字段，请显式地把它们设置为空值或 `null`：

```ts
interface UserData {
  name: string;
  email: string;
  phoneNumber: string | null;
}

const userModel = signal<UserData>({
  name: '',
  email: '',
  phoneNumber: null,
});
```

::: tip 提示
`<input type=text>` 和 `<textarea>` 等原生文本控件不支持 `null`，请使用 `''` 表示空值。

:::

设置为 `undefined` 的字段会被排除在字段树之外。`{value: undefined}` 模型的行为与 `{}` 完全相同——访问该字段返回的是 `undefined`，而不是 `FieldTree`。

## 读取模型值 {#reading-model-values}

你可以通过两种方式访问表单值：直接从模型信号读取，或者通过各个字段读取。两种方式各有用途。

### 从模型读取 {#reading-from-the-model}

当你需要完整的表单数据时（例如提交表单时），可以访问模型信号：

```ts
async onSubmit() {
  const formData = this.loginModel();
  console.log(formData.email, formData.password);

  // 发送到服务器
  await this.authService.login(formData);
}
```

模型信号返回整个数据对象，非常适合处理完整表单状态的操作。

### 从字段状态读取 {#reading-from-field-state}

字段树中的每个字段都是一个函数。调用字段会返回一个 `FieldState` 对象，其中包含该字段的值、验证状态和交互状态的响应式信号。

在模板（template）或响应式计算中处理单个字段时，可以访问字段状态：

```ts
@Component({
  template: `
    <p>Current email: {{ loginForm.email().value() }}</p>
    <p>Password length: {{ passwordLength() }}</p>
  `,
})
export class LoginComponent {
  loginModel = signal({email: '', password: ''});
  loginForm = form(this.loginModel);

  passwordLength = computed(() => {
    return this.loginForm.password().value().length;
  });
}
```

字段状态为每个字段的值提供响应式信号，适合用来显示特定字段的信息或创建派生状态。

::: tip 提示
除了 `value()` 之外，字段状态还包含许多其他信号，例如验证状态（如 valid、invalid、errors）、交互跟踪（如 touched、dirty）以及可见性（如 hidden、disabled）。

:::

完整内容请参阅[字段状态管理指南](/guide/forms/signals/field-state-management)。

## 以编程方式更新表单模型 {#updating-form-models-programmatically}

### 用 `set()` 替换表单模型 {#replacing-form-models-with-set}

在表单模型上使用 `set()` 来替换整个值：

```ts
loadUserData() {
  this.userModel.set({
    name: 'Alice',
    email: 'alice@example.com',
    age: 30,
  });
}

resetForm() {
  this.userModel.set({
    name: '',
    email: '',
    age: 0,
  });
}
```

这种方式非常适合从 API 加载数据或重置整个表单。

### 用 `set()` 或 `update()` 直接更新单个字段 {#update-a-single-field-directly-with-set-or-update}

在单个字段的值上使用 `set()` 来直接更新字段状态：

```ts
clearEmail() {
  this.userForm.email().value.set('');
}

incrementAge() {
  this.userForm.age().value.update(currentAge => currentAge + 1);
}
```

这也被称为「字段级更新」。它们会自动传播到模型信号，并让两者保持同步。

### 示例：从 API 加载数据 {#example-loading-data-from-an-api}

一种常见的模式是获取数据并填充模型：

```ts
export class UserProfileComponent {
  userModel = signal({
    name: '',
    email: '',
    bio: '',
  });

  userForm = form(this.userModel);
  private userService = inject(UserService);

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    const userData = await this.userService.getUserProfile();
    this.userModel.set(userData);
  }
}
```

模型变化时，表单字段会自动更新，无需额外代码就能显示获取到的数据。

### 示例：同步到服务 {#example-synchronizing-to-a-service}

在某些用例中，可以由服务（service）来存储表单模型：

```ts
@Service()
export class FormService {
  private readonly formModel = signal<UserFormModel>({ name: '', birthday: null });
  public readonly model = this.formModel.asReadonly();

  public syncFormModel(value: UserFormModel) {
    this.formModel.set(value);
  }

  // 模型在服务的其他地方以同步或异步方式设置
}

@Component(...)
export class UserForm {
  private readonly formService = inject(FormService);

  private readonly formModel = linkedSignal(() => this.formService.model(), {
    set: (value) => this.formService.syncFormModel(value),
  });

  protected readonly form = form(this.formModel);
}
```

`linkedSignal` 的计算函数读取服务的表单模型，而选项中的 `set` 函数
则可以把组件的表单模型同步到服务的表单模型。当服务的模型发生变化时，
表单字段会自动更新；而当表单字段更新组件的表单模型时，
也会自动更新服务的表单模型。

## 双向数据绑定 {#two-way-data-binding}

`[formField]` 指令在模型、表单状态和 UI 之间建立自动的双向同步。

### 数据如何流动 {#how-data-flows}

变化是双向流动的：

**用户输入 → 模型：**

1. 用户在输入元素中输入内容
2. `[formField]` 指令检测到变化
3. 字段状态更新
4. 模型信号更新

**程序化更新 → UI：**

1. 代码使用 `set()` 或 `update()` 更新模型
2. 模型信号通知订阅者
3. 字段状态更新
4. `[formField]` 指令更新输入元素

这种同步是自动进行的。你无需编写订阅或事件处理器来保持模型与 UI 同步。

### 示例：双向 {#example-both-directions}

```ts
@Component({
  template: `
    <input type="text" [formField]="userForm.name" />
    <button (click)="setName('Bob')">Set Name to Bob</button>
    <p>Current name: {{ userModel().name }}</p>
  `,
})
export class UserComponent {
  userModel = signal({name: ''});
  userForm = form(this.userModel);

  setName(name: string) {
    this.userForm.name().value.set(name);
    // 输入框会自动显示 'Bob'
  }
}
```

当用户在输入框中输入时，`userModel().name` 会更新。点击按钮时，输入框的值会变为 "Bob"。不需要任何手动同步代码。

## 模型结构模式 {#model-structure-patterns}

表单模型可以是扁平对象，也可以包含嵌套的对象和数组。你选择的结构会影响访问字段和组织验证的方式。

### 扁平模型与嵌套模型 {#flat-vs-nested-models}

扁平的表单模型把所有字段都放在顶层：

```ts
// 扁平结构
const userModel = signal({
  name: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zip: '',
});
```

嵌套模型则把相关字段组织在一起：

```ts
// 嵌套结构
const userModel = signal({
  name: '',
  email: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
  },
});
```

**以下情况使用扁平结构：**

- 字段之间没有明确的概念分组
- 你希望更简单地访问字段（`userForm.city` 对比 `userForm.address.city`）
- 验证规则跨越多个潜在的分组

**以下情况使用嵌套结构：**

- 字段构成一个明确的概念分组（例如地址）
- 分组后的数据与你的 API 结构相匹配
- 你希望把这个分组作为一个整体进行验证

### 使用嵌套对象 {#working-with-nested-objects}

你可以沿着对象路径访问嵌套字段：

```ts
const userModel = signal({
  profile: {
    firstName: '',
    lastName: '',
  },
  settings: {
    theme: 'light',
    notifications: true,
  },
});

const userForm = form(userModel);

// 访问嵌套字段
userForm.profile.firstName; // FieldTree<string>
userForm.settings.theme; // FieldTree<string>
```

在模板中，绑定嵌套字段的方式与顶层字段相同：

```ts
@Component({
  template: `
    <input [formField]="userForm.profile.firstName" />
    <input [formField]="userForm.profile.lastName" />

    <select [formField]="userForm.settings.theme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  `,
})
```

### 使用数组 {#working-with-arrays}

模型可以包含数组，用来表示条目集合：

```ts
const orderModel = signal({
  customerName: '',
  items: [{product: '', quantity: 0, price: 0}],
});

const orderForm = form(orderModel);

// 通过索引访问数组条目
orderForm.items[0].product; // FieldTree<string>
orderForm.items[0].quantity; // FieldTree<number>
```

包含对象的数组条目会自动获得跟踪身份，这有助于在条目在数组中改变位置时保持字段状态。这样可以确保数组重新排序时，验证状态和用户交互能够正确保留。

<!-- TBD: For dynamic arrays and complex array operations, see the [Working with arrays guide](https://angular.dev/guide/forms/signals/arrays). -->

## 后续步骤 {#next-steps}

本指南介绍了如何创建模型和更新值。相关指南探讨了信号表单的其他方面：

- [字段状态管理](/guide/forms/signals/field-state-management)
- [验证](/guide/forms/signals/validation)
- [自定义控件](/guide/forms/signals/custom-controls)
- [使用数组](https://angular.dev/guide/forms/signals/arrays)

