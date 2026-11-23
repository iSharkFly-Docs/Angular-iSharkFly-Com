# 使用信号构建表单 {#forms-with-signals}




信号表单（Signal Forms）使用 Angular 信号（Signal）来管理表单状态，借助 Angular Signals 在数据模型与 UI 之间实现自动同步。

本指南将带你了解使用信号表单创建表单的核心概念。具体流程如下：

## 创建你的第一个表单 {#creating-your-first-form}

### 1. 使用 `signal()` 创建表单模型 {#_1-create-a-form-model-with-signal}

每个表单都从创建一个保存表单数据模型的信号开始：

```ts
interface LoginData {
  email: string;
  password: string;
}

const loginModel = signal<LoginData>({
  email: '',
  password: '',
});
```

### 2. 将表单模型传给 `form()` 以创建 `FieldTree` {#_2-pass-the-form-model-to-form-to-create-a-fieldtree}

接着，把表单模型传入 `form()` 函数，创建一个**字段树（field tree）**——这是一个与模型结构相对应的对象结构，让你可以通过点号语法访问各个字段。

根表单对象及其嵌套属性都是 `FieldTree` 节点：

```ts
const loginForm = form(loginModel);

loginForm; // 是一个 FieldTree
loginForm.email; // 也是一个 FieldTree
```

### 3. 使用 `[formField]` 指令绑定 HTML 输入框 {#_3-bind-html-inputs-with-formfield-directive}

然后，使用 `[formField]` 指令（Directive）将 HTML 输入框绑定到表单，它会在两者之间建立双向绑定：

```html
<input type="email" [formField]="loginForm.email" />
<input type="password" [formField]="loginForm.password" />
```

这样，用户的修改（例如在字段中输入内容）会自动更新表单。

::: info 注意
`[formField]` 指令还会在适当的时候同步 `required`、`disabled` 和 `readonly` 等属性的字段状态。

:::

### 4. 通过 `FieldTree` 信号读取状态 {#_4-read-state-with-fieldtree-signals}

你可以把 `FieldTree` 节点当作函数调用，来访问树中任意部分的状态。它会返回一个状态对象，其中包含表示值、验证状态和交互状态的响应式信号：

```ts
loginForm(); // 返回整个表单的状态
loginForm.email(); // 返回 email 字段的状态
```

要读取当前值，可以访问 `value()` 信号：

```html
<!-- 渲染会随用户输入自动更新的值 -->
<p>Form value: {{ loginForm().value() | json }}</p>
<p>Email: {{ loginForm.email().value() }}</p>
```

```ts
// 获取当前值
const currentEmail = loginForm.email().value();
```

### 5. 使用 `set()` 更新值 {#_5-update-values-with-set}

你可以在任意节点上调用 `value.set()` 方法，以编程方式更新值。这会同时更新 `FieldTree` 和底层的模型信号：

```ts
// 以编程方式更新值
loginForm.email().value.set('alice@wonderland.com');
```

这样，字段值和模型信号都会被自动更新：

```ts
// 模型信号也会被更新
console.log(loginModel().email); // 'alice@wonderland.com'
```

### 完整示例 {#complete-example}

::: code-group

```ts [app.ts]
import {Component, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';

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

  loginForm = form(this.loginModel);

  onSubmit(event: Event) {
    event.preventDefault();

    // 在这里执行登录逻辑
    const credentials = this.loginModel();
    console.log('Logging in with:', credentials);

    // 例如：await this.authService.login(credentials);
  }
}
```

```html [app.html]
<form (submit)="onSubmit($event)">
  <label>
    Email:
    <input type="email" [formField]="loginForm.email" />
  </label>

  <label>
    Password:
    <input type="password" [formField]="loginForm.password" />
  </label>

  <p>Hello {{ loginForm.email().value() }}!</p>
  <p>Password length: {{ loginForm.password().value().length }}</p>

  <button type="submit">Log In</button>
</form>
```

```css [app.css]
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  padding: 1rem;
  font-family: Inter, system-ui, -apple-system, sans-serif;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

p {
  margin: 0.5rem 0;
  color: #666;
}
```

:::

## 基本用法 {#basic-usage}

`[formField]` 指令适用于所有标准的 HTML 输入类型。以下是最常见的几种用法：

### 文本输入框 {#text-inputs}

文本输入框支持多种 `type` 属性，也适用于 textarea：

```html
<!-- 文本和邮箱 -->
<input type="text" [formField]="form.name" />
<input type="email" [formField]="form.email" />
```

#### 数字 {#numbers}

数字输入框会在字符串和数字之间自动转换：

```html
<!-- 数字：自动转换为 number 类型 -->
<input type="number" [formField]="form.age" />
```

#### 日期和时间 {#date-and-time}

日期输入框以 `YYYY-MM-DD` 格式的字符串存储值，时间输入框使用 `HH:mm` 格式：

```html
<!-- 日期和时间：以 ISO 格式字符串存储 -->
<input type="date" [formField]="form.eventDate" />
<input type="time" [formField]="form.eventTime" />
```

如果需要把日期字符串转换为 Date 对象，可以把字段值传入 `Date()`：

```ts
const dateObject = new Date(form.eventDate().value());
```

#### 多行文本 {#multiline-text}

textarea 的用法与文本输入框相同：

```html
<!-- Textarea -->
<textarea [formField]="form.message" rows="4"></textarea>
```

### 复选框 {#checkboxes}

复选框绑定到布尔值：

```html
<!-- 单个复选框 -->
<label>
  <input type="checkbox" [formField]="form.agreeToTerms" />
  I agree to the terms
</label>
```

#### 多个复选框 {#multiple-checkboxes}

如果有多个选项，为每个选项分别创建一个布尔类型的 `formField`：

```html
<label>
  <input type="checkbox" [formField]="form.emailNotifications" />
  Email notifications
</label>
<label>
  <input type="checkbox" [formField]="form.smsNotifications" />
  SMS notifications
</label>
```

### 单选按钮 {#radio-buttons}

单选按钮的用法与复选框类似。只要这些单选按钮使用相同的 `[formField]` 值，信号表单就会自动为它们绑定相同的 `name` 属性：

```html
<label>
  <input type="radio" value="free" [formField]="form.plan" />
  Free
</label>
<label>
  <input type="radio" value="premium" [formField]="form.plan" />
  Premium
</label>
```

当用户选中某个单选按钮时，表单的 `formField` 会存储该单选按钮 `value` 属性的值。例如，选中「Premium」会把 `form.plan().value()` 设为 `"premium"`。

### 下拉选择框 {#select-dropdowns}

select 元素同时支持静态选项和动态选项：

```html
<!-- 静态选项 -->
<select [formField]="form.country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>

<!-- 使用 @for 生成动态选项 -->
<select [formField]="form.productId">
  <option value="">Select a product</option>
  @for (product of products; track product.id) {
    <option [value]="product.id">{{ product.name }}</option>
  }
</select>
```

::: info 注意
`[formField]` 指令目前不支持多选框（`<select multiple>`）。

:::

## 验证与状态 {#validation-and-state}

信号表单提供了内置的验证器，你可以把它们应用到表单字段上。要添加验证，请把一个 schema 函数作为第二个参数传给 `form()`：

```ts
const loginForm = form(loginModel, (schemaPath) => {
  debounce(schemaPath.email, 500);
  required(schemaPath.email);
  email(schemaPath.email);
});
```

schema 函数会接收一个 **schema 路径（schema path）** 参数，它提供了指向各个字段的路径，用于配置验证规则。

常用的验证器包括：

- **`required()`** - 确保字段有值
- **`email()`** - 验证邮箱格式
- **`min()`** / **`max()`** - 验证数字范围
- **`minLength()`** / **`maxLength()`** - 验证字符串或集合的长度
- **`pattern()`** - 按正则表达式进行验证

你也可以把一个选项对象作为第二个参数传给验证器，以自定义错误信息：

```ts
required(schemaPath.email, {message: 'Email is required'});
email(schemaPath.email, {message: 'Please enter a valid email address'});
```

`FieldTree` 中的每个节点都会通过响应式信号暴露其验证状态和交互状态。

### FieldTree 状态信号 {#fieldtree-state-signals}

树中的每个节点（包括根表单对象）都提供相同的一组信号来跟踪自身状态。由于每个节点都是 `FieldTree`，因此在任何层级上，用于监控有效性和交互的 API 都是完全一致的。

| 状态         | 说明                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| `valid()`    | 如果节点通过了所有验证规则，则返回 `true`                                       |
| `invalid()`  | 如果存在验证错误，则返回 `true`                                                 |
| `pending()`  | 如果异步验证正在进行中，则返回 `true`                                           |
| `touched()`  | 如果用户曾聚焦并离开该字段或其任意子字段，则返回 `true`                         |
| `dirty()`    | 如果值已被用户修改，则返回 `true`                                               |
| `disabled()` | 如果节点被禁用，则返回 `true`                                                   |
| `readonly()` | 如果节点为只读，则返回 `true`                                                   |
| `errors()`   | 返回一个验证错误数组，每个错误包含 `kind` 和 `message` 属性                     |

### 完整示例 {#complete-example-validation}

::: code-group

```ts [app.ts]
import {Component, signal} from '@angular/core';
import {email, form, FormField, required} from '@angular/forms/signals';

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
    // 在这里执行登录逻辑
    const credentials = this.loginModel();
    console.log('Logging in with:', credentials);
    // 例如：await this.authService.login(credentials);
  }
}
```

```html [app.html]
<form (submit)="onSubmit($event)">
  <div>
    <label>
      Email:
      <input type="email" [formField]="loginForm.email" />
    </label>

    @if (loginForm.email().touched() && loginForm.email().invalid()) {
      <ul class="error-list">
        @for (error of loginForm.email().errors(); track error) {
          <li>{{ error.message }}</li>
        }
      </ul>
    }
  </div>

  <div>
    <label>
      Password:
      <input type="password" [formField]="loginForm.password" />
    </label>

    @if (loginForm.password().touched() && loginForm.password().invalid()) {
      <div class="error-list">
        @for (error of loginForm.password().errors(); track error) {
          <p>{{ error.message }}</p>
        }
      </div>
    }
  </div>

  <button type="submit">Log In</button>
</form>
```

```css [app.css]
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  padding: 1rem;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    sans-serif;
}

div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 500;
}

input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: #4285f4;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #357ae8;
}

button:active {
  background-color: #2a65c8;
}

.error-list {
  color: red;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
  padding-left: 0;
  list-style-position: inside;
}

.error-list p {
  margin: 0;
}
```

:::

## 后续步骤 {#next-steps}

要深入了解信号表单及其工作原理，请查阅以下深度指南：

- [概览](/guide/forms/signals/overview) - 信号表单简介及其适用场景
- [表单模型](/guide/forms/signals/models) - 使用信号创建和管理表单数据
- [字段状态管理](/guide/forms/signals/field-state-management) - 处理验证状态、交互跟踪和字段可见性
- [验证](/guide/forms/signals/validation) - 内置验证器、自定义验证规则和异步验证

- [借助依赖注入（Dependency Injection）实现模块化设计](/essentials/dependency-injection)

