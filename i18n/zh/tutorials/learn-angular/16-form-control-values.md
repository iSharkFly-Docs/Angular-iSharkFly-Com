# 获取表单控件的值

现在你已经用 Angular 设置好了表单，下一步是访问表单控件中的值。

::: info 注意
在[深入指南中了解更多关于添加基本表单控件的内容](/guide/forms/reactive-forms#adding-a-basic-form-control)。

:::

在本活动中，你将学习如何获取表单输入框的值。

<hr>



### 1. 在模板中显示输入框的值

要在模板（Template）中显示输入值，可以像使用组件（Component）的其他类属性一样，使用插值语法 `{{}}`：

```ts
@Component({
  selector: 'app-user',
  template: `
    ...
    <p>Framework: {{ favoriteFramework }}</p>
    <label for="framework">
      Favorite Framework:
      <input id="framework" type="text" [(ngModel)]="favoriteFramework" />
    </label>
  `,
})
export class User {
  favoriteFramework = '';
}
```


### 2. 获取输入框的值

当你需要在组件类中引用输入框的值时，可以通过 `this` 语法访问对应的类属性。

```ts
...
@Component({
  selector: 'app-user',
  template: `
    ...
    <button (click)="showFramework()">Show Framework</button>
  `,
  ...
})
export class User {
  favoriteFramework = '';
  ...

  showFramework() {
    alert(this.favoriteFramework);
  }
}
```




很好，你已经学会了如何在模板中显示输入值，以及如何在代码中访问它们。

接下来学习 Angular 中管理表单的另一种方式：响应式表单（Reactive Forms）。如果想深入了解模板驱动表单（Template-driven Forms），请参阅 [Angular 表单文档](/guide/forms/template-driven-forms)。
