# 响应式表单

当你希望以编程方式管理表单，而不是完全依赖模板（Template）时，响应式表单（Reactive Forms）就是答案。

::: info 注意
在[深入指南中了解更多关于响应式表单的内容](/guide/forms/reactive-forms)。

:::

在本活动中，你将学习如何设置响应式表单。

<hr>



### 1. 导入 `ReactiveForms` 模块

在 `app.ts` 中，从 `@angular/forms` 导入 `ReactiveFormsModule`，并将其添加到组件（Component）的 `imports` 数组中。

```ts
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  template: `
    <form>
      <label>Name
        <input type="text" />
      </label>
      <label>Email
        <input type="email" />
      </label>
      <button type="submit">Submit</button>
    </form>
  `,
  imports: [ReactiveFormsModule],
})
```


### 2. 使用 FormControl 创建 `FormGroup` 对象

响应式表单使用 `FormControl` 类来表示表单控件（例如输入框）。Angular 提供了 `FormGroup` 类，用于把多个表单控件组合成一个便于使用的对象，让开发者处理大型表单时更加方便。

把 `FormControl` 和 `FormGroup` 添加到 `@angular/forms` 的导入中，这样你就可以为每个表单创建一个 FormGroup，并以 `name` 和 `email` 属性作为 FormControl。

```ts
import {ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
...
export class App {
  profileForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
  });
}
```


### 3. 把 FormGroup 和 FormControl 关联到表单

每个 `FormGroup` 都应该通过 `[formGroup]` 指令（Directive）关联到一个表单上。

此外，每个 `FormControl` 都可以通过 `formControlName` 指令进行关联，并赋值为对应的属性。用下面的表单代码更新模板：

```html
<form [formGroup]="profileForm">
  <label>
    Name
    <input type="text" formControlName="name" />
  </label>
  <label>
    Email
    <input type="email" formControlName="email" />
  </label>
  <button type="submit">Submit</button>
</form>
```


### 4. 处理表单的更新

当你想要访问 `FormGroup` 中的数据时，可以通过访问 `FormGroup` 的值来实现。更新 `template` 以显示表单的值：

```html
...
<h2>Profile Form</h2>
<p>Name: {{ profileForm.value.name }}</p>
<p>Email: {{ profileForm.value.email }}</p>
```


### 5. 访问 FormGroup 的值

在组件类中添加一个名为 `handleSubmit` 的新方法，稍后你会用它来处理表单提交。
这个方法会显示表单中的值，你可以从 FormGroup 中访问这些值。

在组件类中添加 `handleSubmit()` 方法来处理表单提交。

```ts
handleSubmit() {
  alert(
    this.profileForm.value.name + ' | ' + this.profileForm.value.email
  );
}
```


### 6. 为表单添加 `ngSubmit`

你已经能够访问表单的值了，现在是时候处理提交事件并使用 `handleSubmit` 方法了。
Angular 为此专门提供了一个名为 `ngSubmit` 的事件处理器。更新 form 元素，使表单提交时调用 `handleSubmit` 方法。

```html
<form [formGroup]="profileForm" (ngSubmit)="handleSubmit()"></form>
```




就这样，你已经知道如何在 Angular 中使用响应式表单了。

这个活动完成得非常出色。继续学习表单验证吧。
