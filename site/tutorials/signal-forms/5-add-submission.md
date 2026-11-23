# 添加表单提交 {#add-form-submission}

最后，让我们来学习如何处理表单提交。你将学习如何使用 `submit()` 函数在表单有效时执行异步操作，以及如何在表单存在错误时禁用提交按钮。

在本练习中，你将学习如何：

- 导入 `submit()` 函数
- 创建提交处理方法
- 使用 `submit()` 仅在表单有效时执行逻辑
- 根据表单状态禁用提交按钮

让我们完成这个表单吧！

<hr />



### 1. 导入 submit 函数 {#_1-import-the-submit-function}

从 `@angular/forms/signals` 导入 `submit` 函数：

```ts
import {form, FormField, required, email, submit} from '@angular/forms/signals';
```


### 2. 添加 onSubmit 方法 {#_2-add-the-onsubmit-method}

在组件（Component）类中，添加一个处理表单提交的 `onSubmit()` 方法：

```ts
onSubmit(event: Event) {
  event.preventDefault();
  submit(this.loginForm, async () => {
    const credentials = this.loginModel();
    console.log('Logging in with:', credentials);
    // 在这里添加你的登录逻辑
  });
}
```

只有当表单有效时，`submit()` 函数才会运行你的异步回调。它还会自动处理表单的提交状态。


### 3. 将提交处理器绑定到表单 {#_3-bind-the-submit-handler-to-the-form}

在模板（Template）中，将 `onSubmit()` 方法绑定到表单的 submit 事件：

```html
<form (submit)="onSubmit($event)"></form>
```


### 4. 在表单无效时禁用按钮 {#_4-disable-the-button-when-form-is-invalid}

更新提交按钮，使其在表单无效时处于禁用状态：

```html
<button type="submit" [disabled]="loginForm().invalid()">Log in</button>
```

这样可以在表单存在验证错误时阻止提交。




恭喜！你已经使用信号表单（Signal Forms）构建了一个完整的登录表单。

准备好回顾所学内容并探索进阶主题了吗？继续前往[后续步骤](/tutorials/signal-forms/6-next-steps)吧！
