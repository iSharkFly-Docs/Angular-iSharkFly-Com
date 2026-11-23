# 创建并更新你的第一个信号

欢迎来到 Angular 信号教程！[信号（Signal）](/essentials/signals)是 Angular 的响应式原语，它提供了一种管理状态的方式，并能在状态变化时自动更新 UI。

在本活动中，你将学习如何：

- 使用 `signal()` 函数创建你的第一个信号
- 在模板（Template）中显示信号的值
- 使用 `set()` 和 `update()` 方法更新信号的值

让我们用信号来构建一个交互式的用户状态系统吧！

<hr />



### 1. 导入 signal 函数

在组件（Component）文件顶部，从 `@angular/core` 导入 `signal` 函数。

```ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
```


### 2. 在组件中创建信号

在组件类中添加一个 `userStatus` 信号，并将其初始值设为 `'offline'`。

```ts
@Component({
  /* 省略配置 */
})
export class App {
  userStatus = signal<'online' | 'offline'>('offline');
}
```


### 3. 在模板中显示信号的值

按以下方式更新状态指示器，使其显示当前的用户状态：
1. 使用 `[class]="userStatus()"` 将信号绑定到 class 属性
2. 将 `???` 替换为 `{{ userStatus() }}` 来显示状态文本

```html
<!-- 将原来的： -->
<div class="status-indicator offline">
  <span class="status-dot"></span>
  Status: ???
</div>

<!-- 改为： -->
<div class="status-indicator" [class]="userStatus()">
  <span class="status-dot"></span>
  Status: {{ userStatus() }}
</div>
```

注意，我们通过带括号的方式调用信号 `userStatus()` 来读取它的值。


### 4. 添加更新信号的方法

在组件中添加使用 `set()` 方法更改用户状态的方法。

```ts
goOnline() {
  this.userStatus.set('online');
}

goOffline() {
  this.userStatus.set('offline');
}
```

`set()` 方法会用一个新值完全替换信号原来的值。


### 5. 连接控制按钮

模板中已经有这些按钮了。现在通过添加以下内容把它们连接到你的方法：
1. 使用 `(click)` 添加点击处理器
2. 使用 `[disabled]` 在已处于对应状态时禁用按钮

```html
<!-- 为现有按钮添加绑定： -->
<button (click)="goOnline()" [disabled]="userStatus() === 'online'">Go Online</button>
<button (click)="goOffline()" [disabled]="userStatus() === 'offline'">Go Offline</button>
```


### 6. 使用 update() 添加切换方法

添加一个 `toggleStatus()` 方法，使用 `update()` 方法在 online 和 offline 之间切换。

```ts
toggleStatus() {
  this.userStatus.update(current => current === 'online' ? 'offline' : 'online');
}
```

`update()` 方法接收一个函数，该函数以当前值为参数并返回新值。当你需要基于当前状态修改现有值时，这个方法非常有用。


### 7. 添加切换按钮的处理器

模板中已经有切换按钮了。将它连接到你的 `toggleStatus()` 方法：

```html
<button (click)="toggleStatus()" class="toggle-btn">Toggle Status</button>
```




恭喜！你已经创建了第一个信号，并学会了使用 `set()` 和 `update()` 两种方法来更新它。`signal()` 函数会创建一个由 Angular 追踪的响应式值，当你更新它时，UI 会自动反映这些变化。

接下来，你将学习[如何使用 computed 从信号派生状态](/tutorials/signals/2-deriving-state-with-computed-signals)！
