# 为表单添加验证

为表单添加验证至关重要，它能确保用户输入有效的数据。信号表单（Signal Forms）在一个模式函数（schema function）中使用验证器，你需要把这个函数传给 `form()` 函数。

在本练习中，你将学习如何：

- 导入内置验证器
- 为表单定义模式函数
- 为特定字段应用验证器，并提供自定义错误消息

让我们来添加验证吧！

<hr />



### 1. 导入验证器

从 `@angular/forms/signals` 导入 `required` 和 `email` 验证器：

```ts
import {form, FormField, required, email} from '@angular/forms/signals';
```


### 2. 为表单添加模式函数

更新 `form()` 调用，把模式函数作为第二个参数传入。模式函数会接收一个 `fieldPath` 参数，你可以通过它访问每个字段：

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  // 验证器写在这里
});
```


### 3. 为 email 字段添加验证

在模式函数内部，为 email 字段添加验证。同时使用 `required()` 和 `email()` 两个验证器：

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  required(fieldPath.email, {message: 'Email is required'});
  email(fieldPath.email, {message: 'Enter a valid email address'});
});
```

`message` 选项用于为用户提供自定义错误消息。


### 4. 为 password 字段添加验证

使用 `required()` 验证器为 password 字段添加验证：

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  required(fieldPath.email, {message: 'Email is required'});
  email(fieldPath.email, {message: 'Enter a valid email address'});
  required(fieldPath.password, {message: 'Password is required'});
});
```




完美！你已经为表单添加了验证。当用户与表单交互时，验证器会自动运行。验证失败时，字段的状态会反映出这些错误。

接下来，你将学习[如何在模板中显示验证错误](/tutorials/signal-forms/4-display-errors)！
