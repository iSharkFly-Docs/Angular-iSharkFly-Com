# 事件处理

事件处理（Event Handling）为 Web 应用带来了交互功能。作为开发者，它让你能够响应用户的操作，例如点击按钮、提交表单等。

::: info 注意
在[基础知识指南中了解更多关于处理用户交互的内容](/essentials/templates#handling-user-interaction)。

:::

在本练习中，你将学习如何添加事件处理器。

<hr />

在 Angular 中，你使用圆括号语法 `()` 来绑定事件。在指定元素上，用圆括号把要绑定的事件包起来，并设置一个事件处理器。来看这个 `button` 示例：

```ts
@Component({
  ...
  template: `<button (click)="greet()">`
})
export class App {
  greet() {
    console.log('Hello, there 👋');
  }
}
```

在这个例子中，每次点击按钮时都会运行 `greet()` 函数。注意，`greet()` 语法中包含末尾的圆括号。

好了，轮到你来试一试了：



### 1. 添加事件处理器

在 `App` 类中，用下面的代码填充现有 `showSecretMessage()` 方法的方法体：

```ts
this.message = 'Way to go 🚀';
```


### 2. 绑定模板事件

更新 `app.ts` 中的模板代码，绑定到 `section` 元素的 `mouseover` 事件。

<!-- prettier-ignore -->
```html
<section (mouseover)="showSecretMessage()">
```




只需在代码中完成几个步骤，你就创建了自己在 Angular 中的第一个事件处理器。看起来你越来越得心应手了，继续保持！
