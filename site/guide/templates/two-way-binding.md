# 双向绑定 {#two-way-binding}

**双向绑定（Two-way Binding）** 是一种简写形式，它把一个值绑定到元素上，同时让该元素能够通过这个绑定把变化传播回来。

## 语法 {#syntax}

双向绑定的语法是方括号和圆括号的组合 `[()]`。它结合了属性绑定（Property Binding）的语法 `[]` 和事件绑定（Event Binding）的语法 `()`。Angular 社区非正式地把这种语法称为「盒子里的香蕉」（banana-in-a-box）。

## 表单控件的双向绑定 {#two-way-binding-with-form-controls}

开发者通常使用双向绑定，在用户与表单控件交互时让组件（Component）数据与该控件保持同步。例如，当用户填写文本输入框时，组件中的状态应该随之更新。

下面的例子会动态更新页面上的 `firstName` 属性：

```ts
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  imports: [FormsModule],
  template: `
    <main>
      <h2>Hello {{ firstName }}!</h2>
      <input type="text" [(ngModel)]="firstName" />
    </main>
  `,
})
export class App {
  firstName = 'Ada';
}
```

要在原生表单控件上使用双向绑定，你需要：

1. 从 `@angular/forms` 导入 `FormsModule`
1. 使用带有双向绑定语法的 `ngModel` 指令（Directive）（例如 `[(ngModel)]`）
1. 把要更新的状态赋给它（例如 `firstName`）

设置完成后，Angular 会确保文本输入框中的任何更新都能正确反映到组件状态中！

在官方文档中了解更多关于 [`NgModel`](https://angular.dev/api/forms/NgModel) 的信息。

## 组件之间的双向绑定 {#two-way-binding-between-components}

与表单元素相比，在父组件和子组件之间使用双向绑定需要更多的配置。

在下面这个例子中，`App` 负责设置初始的计数状态，而更新计数和渲染计数器 UI 的逻辑主要位于其子组件 `Counter` 中。

```ts [app.ts]
import {Component} from '@angular/core';
import {Counter} from './counter';

@Component({
  selector: 'app-root',
  imports: [Counter],
  template: `
    <main>
      <h1>Counter: {{ initialCount }}</h1>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class App {
  initialCount = 18;
}
```

```ts [counter.ts]
import {Component, model} from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <button (click)="updateCount(-1)">-</button>
    <span>{{ count() }}</span>
    <button (click)="updateCount(+1)">+</button>
  `,
})
export class Counter {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update((currentCount) => currentCount + amount);
  }
}
```

### 启用组件之间的双向绑定 {#enabling-two-way-binding-between-components}

把上面的例子拆解到核心，组件之间的每个双向绑定都需要满足以下条件：

子组件必须包含一个 `model` 属性。

下面是一个简化的例子：

```ts [counter.ts]
import {Component, model} from '@angular/core';

@Component({
  /* 为简洁起见已省略 */
})
export class Counter {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update((currentCount) => currentCount + amount);
  }
}
```

父组件必须：

1. 用双向绑定语法包裹 `model` 属性名。
1. 把一个属性或信号（Signal）赋给这个 `model` 属性。

下面是一个简化的例子：

```ts [app.ts]
import {Component} from '@angular/core';
import {Counter} from './counter';

@Component({
  selector: 'app-root',
  imports: [Counter],
  template: `
    <main>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class App {
  initialCount = 18;
}
```
