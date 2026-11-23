# 表单概览

表单是许多应用的重要组成部分，因为它让应用能够接收用户输入。我们来学习一下 Angular 是如何处理表单的。

在 Angular 中，有两种类型的表单：模板驱动表单（Template-driven Forms）和响应式表单（Reactive Forms）。在接下来的几个活动中，你会学到这两种表单。

::: info 注意
在[深入指南中了解更多关于 Angular 表单的内容](/guide/forms)。

:::

在本活动中，你将学习如何使用模板驱动的方式来设置表单。

<hr>



### 1. 创建输入框

在 `user.ts` 中更新模板（Template），添加一个文本输入框，将 `id` 设置为 `framework`，类型设置为 `text`。

```html
<label for="framework">
  Favorite Framework:
  <input id="framework" type="text" />
</label>
```


### 2. 导入 `FormsModule`

为了让这个表单能使用 Angular 中支持表单数据绑定的特性，你需要导入 `FormsModule`。

从 `@angular/forms` 导入 `FormsModule`，并将其添加到 `User` 的 `imports` 数组中。

```ts
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
...
imports: [FormsModule],
})
export class User {}
```


### 3. 为输入框的值添加绑定

`FormsModule` 中有一个名为 `ngModel` 的指令（Directive），它可以把输入框的值绑定到类中的某个属性。

更新输入框以使用 `ngModel` 指令，具体使用 `[(ngModel)]="favoriteFramework"` 语法来绑定到 `favoriteFramework` 属性。

```html
<label for="framework">
  Favorite Framework:
  <input id="framework" type="text" [(ngModel)]="favoriteFramework" />
</label>
```

完成修改后，试着在输入框中输入一个值。注意观察屏幕上的内容是如何随之更新的（没错，非常酷）。

::: info 注意
`[()]` 语法俗称「盒子里的香蕉」（banana in a box），它表示双向绑定：属性绑定加事件绑定。在 [Angular 双向数据绑定文档](/guide/templates/two-way-binding)中了解更多。

:::




你已经迈出了使用 Angular 构建表单的重要第一步。

干得漂亮。让我们保持这股势头！
