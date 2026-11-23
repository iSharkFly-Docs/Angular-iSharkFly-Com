# 将表单连接到模板

现在，你需要使用 `[formField]` 指令（Directive）将表单连接到模板（Template）。这会在表单模型和输入元素之间建立双向数据绑定。

在本课中，你将学习如何：

- 导入 `FormField` 指令
- 使用 `[formField]` 指令将表单字段绑定到输入框
- 将文本输入框和复选框连接到表单
- 在模板中显示表单字段的值

让我们把模板连起来吧！

<hr />



### 1. 导入 FormField 指令

从 `@angular/forms/signals` 导入 `FormField` 指令，并将其添加到组件（Component）的 imports 数组中：

```ts
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [FormField],
})
```


### 2. 绑定 email 字段

在模板中，为 email 输入框添加 `[formField]` 指令：

```html
<input type="email" [formField]="loginForm.email" />
```

`loginForm.email` 表达式会访问表单中的 email 字段。


### 3. 绑定 password 字段

为 password 输入框添加 `[formField]` 指令：

```html
<input type="password" [formField]="loginForm.password" />
```


### 4. 绑定复选框字段

为复选框输入框添加 `[formField]` 指令：

```html
<input type="checkbox" [formField]="loginForm.rememberMe" />
```


### 5. 显示表单值

表单下方有一个调试区域，用于显示当前的表单值。使用 `.value()` 显示每个字段的值：

```html
<p>Email: {{ loginForm.email().value() }}</p>
<p>Password: {{ loginForm.password().value() ? '••••••••' : '(empty)' }}</p>
<p>Remember me: {{ loginForm.rememberMe().value() ? 'Yes' : 'No' }}</p>
```

表单字段的值是信号（Signal），因此显示的值会随着你的输入自动更新。




做得好！你已经将表单连接到模板，并显示了表单值。`[formField]` 指令会自动处理双向数据绑定：当你输入时，`loginModel` 信号会更新，显示的值也会立即更新。

接下来，你将学习[如何为表单添加验证](/tutorials/signal-forms/3-add-validation)！
