# 使用模型信号实现双向绑定

现在你已经学会了[使用输入信号向组件传递数据](/tutorials/signals/5-component-communication-with-signals)，接下来让我们探索 Angular 用于双向绑定（Two-way Binding）的 `model()` API。模型信号（Model Signal）非常适合复选框、滑块或自定义表单控件这类 UI 组件（Component）——这些组件既需要接收一个值，又需要更新这个值。

在本活动中，你将创建一个自定义复选框组件，它在管理自身状态的同时，还会让父组件保持同步。

<hr />



### 1. 使用模型信号设置自定义复选框

在 `custom-checkbox` 组件中创建一个模型信号，它既能接收父组件的值，也能更新该值。

```ts
// 添加模型信号所需的导入
import {Component, model, input, ChangeDetectionStrategy} from '@angular/core';

// 用于双向绑定的模型信号
checked = model.required<boolean>();

// 用于标签的可选输入
label = input<string>('');
```

与只读的 `input()` 信号不同，`model()` 信号既可以读取，也可以写入。


### 2. 创建复选框模板

构建复选框的模板（Template），使其能够响应点击并更新自身的模型。

```html
<label class="custom-checkbox">
  <input type="checkbox" [checked]="checked()" (change)="toggle()" />
  <span class="checkmark"></span>
  {{ label() }}
</label>
```

该组件从它的模型信号中读取值，并提供一个方法来更新它。


### 3. 添加切换方法

实现 toggle 方法，在复选框被点击时更新模型信号。

```ts
toggle() {
  // 这会同时更新组件自身的状态和父组件的模型！
  this.checked.set(!this.checked());
}
```

当子组件调用 `this.checked.set()` 时，这一变化会自动传回父组件。这正是它与 `input()` 信号的关键区别。


### 4. 在父组件中设置双向绑定

首先，取消 `app.ts` 中模型信号属性和方法的注释：

```ts
// 父组件的信号模型
agreedToTerms = model(false);
enableNotifications = model(true);

// 用于测试双向绑定的方法
toggleTermsFromParent() {
  this.agreedToTerms.set(!this.agreedToTerms());
}

resetAll() {
  this.agreedToTerms.set(false);
  this.enableNotifications.set(false);
}
```

然后更新模板：

第 1 部分. **取消复选框的注释并添加双向绑定：**

- 对于第一个复选框，将 `___ADD_TWO_WAY_BINDING___` 替换为 `[(checked)]="agreedToTerms"`
- 对于第二个复选框，将 `___ADD_TWO_WAY_BINDING___` 替换为 `[(checked)]="enableNotifications"`

第 2 部分. **将 `???` 占位符替换为 @if 块：**

```html
@if (agreedToTerms()) {
  Yes
} @else {
  No
}

@if (enableNotifications()) {
  Yes
} @else {
  No
}
```

第 3 部分. **为按钮添加点击处理器：**

```html
<button (click)="toggleTermsFromParent()">Toggle Terms from Parent</button>
<button (click)="resetAll()">Reset All</button>
```

`[(checked)]` 语法会创建双向绑定——数据向下流入组件，而变化则通过发出一个事件向上流回父组件。这个事件引用的是信号本身，*不会* 直接调用信号的 getter。


### 5. 测试双向绑定

与应用进行交互，观察双向绑定的实际效果：

1. **点击复选框** - 组件更新自身状态并通知父组件
2. **点击“Toggle Terms from Parent”** - 父组件的更新会向下传递到组件
3. **点击“Reset All”** - 父组件重置两个模型，组件会自动更新

父组件和子组件都可以更新共享状态，而且两者会自动保持同步！




完美！你已经了解了模型信号如何实现双向绑定：

- **模型信号** - 对既可读又可写的值使用 `model()` 和 `model.required()`
- **双向绑定** - 使用 `[(property)]` 语法将父组件的信号绑定到子组件的模型
- **非常适合 UI 组件** - 例如需要管理自身状态的复选框、表单控件和小部件
- **自动同步** - 父组件和子组件无需手动处理事件即可保持同步

**何时使用 `model()`，何时使用 `input()`：**

- 对只向下流动的数据（展示数据、配置）使用 `input()`
- 对需要更新自身值的 UI 组件（表单控件、开关）使用 `model()`

在下一课中，你将学习[在服务中使用信号](/tutorials/signals/7-using-signals-with-services)！
