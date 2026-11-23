# 验证表单 {#validating-forms}

使用表单时，另一个常见的场景是需要验证输入，以确保提交的数据是正确的。

::: info 注意
在[深入指南中了解更多关于验证表单输入的内容](/guide/forms/reactive-forms#validating-form-input)。

:::

在本活动中，你将学习如何使用响应式表单（Reactive Forms）来验证表单。

<hr>



### 1. 导入 Validators {#_1-import-validators}

Angular 提供了一组验证工具。要使用它们，首先更新组件（Component），从 `@angular/forms` 导入 `Validators`。

```ts
import {ReactiveFormsModule, Validators} from '@angular/forms';

@Component({...})
export class App {}
```


### 2. 为表单添加验证 {#_2-add-validation-to-form}

每个 `FormControl` 都可以传入你想用来验证该 `FormControl` 值的 `Validators`。例如，如果你想让 `profileForm` 中的 `name` 字段成为必填项，就使用 `Validators.required`。
对于 Angular 表单中的 `email` 字段，我们希望确保它不为空，并且符合有效的电子邮件地址格式。可以把 `Validators.required` 和 `Validators.email` 两个验证器组合在一个数组中来实现。
更新 `name` 和 `email` 的 `FormControl`：

```ts
profileForm = new FormGroup({
  name: new FormControl('', Validators.required),
  email: new FormControl('', [Validators.required, Validators.email]),
});
```


### 3. 在模板中检查表单验证状态 {#_3-check-form-validation-in-template}

要判断表单是否有效，可以使用 `FormGroup` 类的 `valid` 属性。
你可以用这个属性来动态绑定属性。更新提交 `button`，使其根据表单的有效性来决定是否可用。

```html
<button type="submit" [disabled]="!profileForm.valid">Submit</button>
```




现在你已经了解了响应式表单中验证的基本工作原理。

很好，你已经学会了在 Angular 中使用表单的这些核心概念。如果想了解更多，请务必参阅 [Angular 表单文档](/guide/forms/form-validation)。
