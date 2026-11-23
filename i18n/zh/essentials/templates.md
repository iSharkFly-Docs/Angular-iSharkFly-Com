# 模板

使用 Angular 的模板语法创建动态用户界面。


组件（Component）模板（Template）不只是静态 HTML——它们可以使用组件类中的数据，并为用户交互设置处理器。

## 显示动态文本

在 Angular 中，_绑定（Binding）_会在组件的模板与其数据之间建立动态连接。这种连接确保组件数据的变化会自动更新渲染出的模板。

你可以使用双花括号创建绑定，在模板中显示动态文本：

```ts
@Component({
  selector: 'user-profile',
  template: `<h1>Profile for {{ userName() }}</h1>`,
})
export class UserProfile {
  userName = signal('pro_programmer_123');
}
```

当 Angular 渲染该组件时，你会看到：

```html
<h1>Profile for pro_programmer_123</h1>
```

当信号（Signal）的值发生变化时，Angular 会自动让绑定保持最新。在上面示例的
基础上，如果我们更新 `userName` 信号的值：

```ts
this.userName.set('cool_coder_789');
```

渲染出的页面会随之更新，反映新的值：

```html
<h1>Profile for cool_coder_789</h1>
```

## 设置动态属性和特性

Angular 支持使用方括号将动态值绑定到 DOM 属性（property）上：

```ts
@Component({
  /*...*/
  // 根据 `isValidUserId` 的值设置按钮的 `disabled` 属性。
  template: `<button [disabled]="!isValidUserId()">Save changes</button>`,
})
export class UserProfile {
  isValidUserId = signal(false);
}
```

你也可以在特性名前加上 `attr.` 前缀，以绑定到 HTML _特性（attribute）_：

```html
<!-- 将 `<ul>` 元素上的 `role` 特性绑定到 `listRole` 的值。 -->
<ul [attr.role]="listRole()"></ul>
```

当绑定的值发生变化时，Angular 会自动更新 DOM 属性和特性。

## 处理用户交互

Angular 允许你使用圆括号为模板中的元素添加事件监听器：

```ts
@Component({
  /*...*/
  // 添加一个调用 `cancelSubscription` 方法的 'click' 事件处理器。
  template: `<button (click)="cancelSubscription()">Cancel subscription</button>`,
})
export class UserProfile {
  /* ... */

  cancelSubscription() {
    /* 你的事件处理代码写在这里。 */
  }
}
```

如果你需要将 [event](https://developer.mozilla.org/docs/Web/API/Event) 对象传递给监听器，可以在函数调用中使用 Angular 内置的 `$event` 变量：

```ts
@Component({
  /*...*/
  // 添加一个调用 `cancelSubscription` 方法的 'click' 事件处理器。
  template: `<button (click)="cancelSubscription($event)">Cancel subscription</button>`,
})
export class UserProfile {
  /* ... */

  cancelSubscription(event: Event) {
    /* 你的事件处理代码写在这里。 */
  }
}
```

## 使用 `@if` 和 `@for` 进行控制流

你可以使用 Angular 的 `@if` 块有条件地隐藏和显示模板的某些部分：

```html
<h1>User profile</h1>

@if (isAdmin()) {
  <h2>Admin settings</h2>
  <!-- ... -->
}
```

`@if` 块还支持一个可选的 `@else` 块：

```html
<h1>User profile</h1>

@if (isAdmin()) {
  <h2>Admin settings</h2>
  <!-- ... -->
} @else {
  <h2>User settings</h2>
  <!-- ... -->
}
```

你可以使用 Angular 的 `@for` 块将模板的某一部分重复多次：

```html
<h1>User profile</h1>

<ul class="user-badge-list">
  @for (badge of badges(); track badge.id) {
    <li class="user-badge">{{ badge.name }}</li>
  }
</ul>
```

Angular 使用上例中所示的 `track` 关键字，将数据与 `@for` 创建的 DOM 元素关联起来。更多信息请参阅[_为什么 @for 块中的 track 很重要？_](/guide/templates/control-flow#why-is-track-in-for-blocks-important)。

::: tip 提示
想进一步了解 Angular 模板吗？完整细节请参阅[深入模板指南](/guide/templates)。

:::

## 下一步

现在应用中已经有了动态数据和模板，接下来该学习如何增强模板，例如有条件地隐藏或显示某些元素、遍历元素等。

- [使用信号构建表单](/essentials/signal-forms)
- [深入模板指南](/guide/templates)

