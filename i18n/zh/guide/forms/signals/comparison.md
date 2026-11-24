# 与其他表单方案的比较

Angular 提供了三种构建表单的方案：信号表单（Signal Forms）、响应式表单（Reactive Forms）和模板驱动表单（Template-driven Forms）。它们在管理状态、验证和数据流方面各有不同的模式。本指南帮助你理解它们之间的差异，并为项目选择合适的方案。

## 快速比较

| 特性         | 信号表单                         | 响应式表单                          | 模板驱动表单          |
| ------------ | -------------------------------- | ----------------------------------- | --------------------- |
| 数据源       | 用户定义的可写信号模型           | `FormControl`/`FormGroup`           | 组件中的用户模型      |
| 类型安全     | 从模型推断                       | 使用类型化表单显式声明              | 很少                  |
| 验证         | 带有基于路径的验证器的 schema    | 传给控件的验证器列表                | 基于指令              |
| 状态管理     | 基于信号                         | 基于 Observable                     | 由 Angular 管理       |
| 设置方式     | 信号 + schema 函数               | FormControl 树                      | 模板中的 NgModel      |
| 最适合       | 基于信号的应用                   | 复杂表单                            | 简单表单              |
| 学习曲线     | 中等                             | 中等偏高                            | 低                    |
| 状态         | 稳定（v22+）                     | 稳定                                | 稳定                  |

## 示例：登录表单

理解这些差异的最好方式，是看看用三种方案分别实现的同一个表单。

::: code-group

```ts [Signal forms]
import {Component, signal} from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="loginForm" (submit)="onSubmit()">
      <div>
        <label>
          Email
          <input type="email" [formField]="loginForm.email" />
        </label>
        @if (loginForm.email().touched() && loginForm.email().invalid()) {
          <span class="error">
            {{ loginForm.email().errors()[0].message }}
          </span>
        }
      </div>

      <div>
        <label>
          Password
          <input type="password" [formField]="loginForm.password" />
        </label>
        @if (loginForm.password().touched() && loginForm.password().invalid()) {
          <span class="error">
            {{ loginForm.password().errors()[0].message }}
          </span>
        }
      </div>

      <button type="submit" [disabled]="loginForm().invalid()">Sign In</button>
    </form>
  `,
})
export class LoginComponent {
  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.email, {message: 'Email is required'});
    email(fieldPath.email, {message: 'Enter a valid email address'});

    required(fieldPath.password, {message: 'Password is required'});
    minLength(fieldPath.password, 8, {message: 'Password must be at least 8 characters'});
  });

  onSubmit() {
    // 仅在表单有效时才运行 action。
    submit(this.loginForm, async (field) => {
      console.log('Submitting:', field().value());
    });
  }
}
```

```ts [Reactive forms]
import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="loginForm" (submit)="onSubmit()">
      <div>
        <label>
          Email
          <input type="email" formControlName="email" />
        </label>
        @if (loginForm.controls.email.touched && loginForm.controls.email.invalid) {
          <span class="error">
            @if (loginForm.controls.email.errors?.['required']) {
              Email is required
            }
            @if (loginForm.controls.email.errors?.['email']) {
              Enter a valid email address
            }
          </span>
        }
      </div>

      <div>
        <label>
          Password
          <input type="password" formControlName="password" />
        </label>
        @if (loginForm.controls.password.touched && loginForm.controls.password.invalid) {
          <span class="error">
            @if (loginForm.controls.password.errors?.['required']) {
              Password is required
            }
            @if (loginForm.controls.password.errors?.['minlength']) {
              Password must be at least 8 characters
            }
          </span>
        }
      </div>

      <button type="submit" [disabled]="loginForm.invalid">Sign In</button>
    </form>
  `,
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      console.log('Submitting:', credentials);
    }
  }
}
```

```ts [Template-driven forms]
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <form #loginForm="ngForm" (submit)="onSubmit()">
      <div>
        <label>
          Email
          <input
            type="email"
            name="email"
            [(ngModel)]="email"
            #emailInput="ngModel"
            required
            email
          />
        </label>
        @if (emailInput.touched && emailInput.invalid) {
          <span class="error">
            @if (emailInput.errors?.['required']) {
              Email is required
            }
            @if (emailInput.errors?.['email']) {
              Enter a valid email address
            }
          </span>
        }
      </div>

      <div>
        <label>
          Password
          <input
            type="password"
            name="password"
            [(ngModel)]="password"
            #passwordInput="ngModel"
            required
            minlength="8"
          />
        </label>
        @if (passwordInput.touched && passwordInput.invalid) {
          <span class="error">
            @if (passwordInput.errors?.['required']) {
              Password is required
            }
            @if (passwordInput.errors?.['minlength']) {
              Password must be at least 8 characters
            }
          </span>
        }
      </div>

      <button type="submit" [disabled]="loginForm.invalid">Sign In</button>
    </form>
  `,
})
export class LoginComponent {
  email = '';
  password = '';

  onSubmit() {
    const credentials = {
      email: this.email,
      password: this.password,
    };
    console.log('Submitting:', credentials);
  }
}
```

:::

## 理解这些差异

三种方案做出了不同的设计选择，这些选择会影响你编写和维护表单的方式。这些差异源于每种方案在哪里存储表单状态，以及如何管理验证。

### 表单数据存放在哪里

最根本的差异在于，每种方案把什么当作表单值的「数据源（source of truth）」。

信号表单把数据存储在一个可写信号中。需要当前表单值时，调用这个信号即可：

```ts
const credentials = this.loginModel(); // { email: '...', password: '...' }
```

这样表单数据就保存在单个响应式容器中，值发生变化时会自动通知 Angular。表单结构与你的数据模型完全对应。

响应式表单把数据存储在 FormControl 和 FormGroup 实例中。你需要通过表单层级结构访问值：

```ts
const credentials = this.loginForm.value; // { email: '...', password: '...' }
```

这种方式把表单状态管理与组件的数据模型分离开来。表单结构是显式的，但需要更多的设置代码。

模板驱动表单把数据存储在组件属性中。你可以直接访问这些值：

```ts
const credentials = {email: this.email, password: this.password};
```

这是最直接的方案，但需要值时得手动把它们组装起来。Angular 通过模板中的指令来管理表单状态。

### 验证如何工作

每种方案定义验证规则的方式都不同，这会影响验证逻辑放在哪里以及如何维护。

信号表单使用一个 schema 函数，在其中把验证器绑定到字段路径上：

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  required(fieldPath.email, {message: 'Email is required'});
  email(fieldPath.email, {message: 'Enter a valid email address'});
});
```

所有验证规则都集中在一处。schema 函数在创建表单时只运行一次，字段值变化时验证器会自动执行。错误消息是验证定义的一部分。

响应式表单在创建控件时附加验证器：

```ts
loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
});
```

验证器与表单结构中的各个控件绑定在一起，因此验证分散在整个表单定义中。错误消息通常放在模板里。

模板驱动表单在模板中使用指令 attribute：

```html
<input [(ngModel)]="email" required email />
```

验证规则与 HTML 一起放在模板中。这让验证贴近界面，但逻辑会分散在模板和组件之间。

### 类型安全与自动补全

不同方案对 TypeScript 的集成程度差别很大，这会影响编译器能在多大程度上帮你避免错误。

信号表单从模型结构推断类型：

```ts
const loginModel = signal({email: '', password: ''});
const loginForm = form(loginModel);
// TypeScript 知道：loginForm.email 存在，并返回 FieldState<string>
```

你只需在信号中定义一次数据结构，TypeScript 就会自动知道有哪些字段以及它们的类型。访问 `loginForm.username`（并不存在）会产生类型错误。

响应式表单需要借助类型化表单显式添加类型注解：

```ts
const loginForm = new FormGroup({
  email: new FormControl<string>(''),
  password: new FormControl<string>(''),
});
// TypeScript 知道：loginForm.controls.email 是 FormControl<string>
```

你需要为每个控件单独指定类型。TypeScript 会检查表单结构，但类型信息需要与数据模型分开维护。

模板驱动表单只提供很少的类型安全：

```ts
email = '';
password = '';
// TypeScript 只知道它们是字符串，没有表单级别的类型
```

TypeScript 了解组件的属性，但对表单结构或验证一无所知。表单操作因此失去了编译期检查。

## 选择你的方案

### 以下情况使用信号表单：

- 你在构建新的、基于信号的应用（Angular v22+）
- 你希望从模型结构推断出类型安全
- 你喜欢基于 schema 的验证
- 你的团队熟悉信号

### 以下情况使用响应式表单：

- 你需要生产就绪的稳定性
- 你在构建复杂的动态表单
- 你偏好基于 Observable 的模式
- 你需要对表单状态进行细粒度控制
- 你在维护一个已有的响应式表单代码库

### 以下情况使用模板驱动表单：

- 你在构建简单的表单（登录、联系、搜索）
- 你在做快速原型开发
- 你的表单逻辑很简单
- 你倾向于把表单逻辑放在模板中
- 你在维护一个已有的模板驱动表单代码库

## 后续步骤

进一步了解各个方案：

- **信号表单**：参阅[概览指南](/guide/forms/signals/overview)开始上手，或者深入了解[表单模型](/guide/forms/signals/models)、[验证](/guide/forms/signals/validation)和[字段状态管理](/guide/forms/signals/field-state-management)
- **响应式表单**：参阅 Angular 文档中的[响应式表单指南](/guide/forms/reactive-forms)
- **模板驱动表单**：参阅 Angular 文档中的[模板驱动表单指南](/guide/forms/template-driven-forms)
