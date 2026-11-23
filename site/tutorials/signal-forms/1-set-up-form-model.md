# 设置表单模型 {#set-up-the-form-model}

每个信号表单（Signal Forms）都从一个表单数据模型开始：它是一个信号（Signal），既定义了数据的结构，也存储着表单数据。

在本课中，你将学习如何：

- 为表单数据定义一个 TypeScript 接口
- 创建一个信号来保存表单值
- 使用 `form()` 函数创建信号表单

让我们为登录表单打好基础吧！

<hr />



### 1. 定义 LoginData 接口 {#_1-define-the-logindata-interface}

创建一个 TypeScript 接口，用来定义登录表单数据的结构。该表单将包含：

- 一个 `email` 字段（string）
- 一个 `password` 字段（string）
- 一个 `rememberMe` 字段（boolean）

```ts
interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}
```

将此接口添加到 `@Component` 装饰器的上方。


### 2. 导入 signal 和 form {#_2-import-signal-and-form}

从 `@angular/core` 导入 `signal` 函数，并从 `@angular/forms/signals` 导入 `form` 函数：

```ts
import {Component, signal} from '@angular/core';
import {form} from '@angular/forms/signals';
```


### 3. 创建表单模型信号 {#_3-create-the-form-model-signal}

在组件（Component）类中，创建一个带有初始值的 `loginModel` 信号。使用 `LoginData` 接口作为类型参数：

```ts
loginModel = signal<LoginData>({
  email: '',
  password: '',
  rememberMe: false,
});
```

文本字段的初始值为空字符串，复选框的初始值为 `false`。


### 4. 创建表单 {#_4-create-the-form}

现在，把模型信号传给 `form()` 函数来创建表单：

```ts
loginForm = form(this.loginModel);
```

`form()` 函数会根据你的模型创建一个表单，让你可以访问字段状态和验证。




太棒了！你已经设置好了表单模型。`loginModel` 信号保存着你的表单数据，而 `loginForm` 提供了对每个字段的类型安全访问。

接下来，你将学习[如何将表单连接到模板](/tutorials/signal-forms/2-connect-form-template)！
