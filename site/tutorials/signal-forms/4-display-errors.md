# 显示验证错误 {#display-validation-errors}

现在你已经能够验证表单了，接下来很重要的一点是向用户显示验证错误。

在本练习中，你将学习如何：

- 通过验证信号访问字段状态
- 使用 `@if` 有条件地显示错误
- 使用 `@for` 遍历错误
- 仅在用户交互后才显示错误

让我们来显示验证反馈吧！

<hr />



### 1. 为 email 字段添加错误显示 {#_1-add-error-display-for-email-field}

在 email 输入框下方，添加条件式的错误显示。只有当字段既无效又已被触碰（touched）时，才会显示错误：

```html
<label>
  Email
  <input type="email" [formField]="loginForm.email" />
</label>
@if (loginForm.email().invalid() && loginForm.email().touched()) {
  <div class="error">
    @for (error of loginForm.email().errors(); track error.kind) {
      <span>{{ error.message }}</span>
    }
  </div>
}
```

`loginForm.email()` 调用会访问该字段的状态信号（Signal）。验证失败时，`invalid()` 方法返回 `true`；用户与该字段交互后，`touched()` 返回 `true`；`errors()` 则提供一个验证错误数组，其中包含各自的自定义消息。


### 2. 为 password 字段添加错误显示 {#_2-add-error-display-for-password-field}

在 password 输入框下方，为密码错误添加同样的模式：

```html
<label>
  Password
  <input type="password" [formField]="loginForm.password" />
</label>
@if (loginForm.password().invalid() && loginForm.password().touched()) {
  <div class="error">
    @for (error of loginForm.password().errors(); track error.kind) {
      <span>{{ error.message }}</span>
    }
  </div>
}
```




太棒了！你已经为表单添加了错误显示。错误只会在用户与字段交互后出现，既能提供有用的反馈，又不会打扰用户。

接下来，你将学习[如何处理表单提交](/tutorials/signal-forms/5-add-submission)！
