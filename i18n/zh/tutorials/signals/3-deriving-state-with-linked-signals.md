# 使用链接信号派生状态

在[使用计算信号派生状态](/tutorials/signals/2-deriving-state-with-computed-signals)一课中，你为 `notificationsEnabled` 创建了一个计算信号（Computed），它会自动跟随用户状态变化。但如果用户希望在在线时也能手动关闭通知，该怎么办呢？这正是链接信号（Linked Signal）的用武之地。

链接信号是可写的信号（Signal），它会与其源信号保持响应式连接。它们非常适合用来创建这样一种状态：通常跟随某个计算结果，但在需要时又可以被覆盖。

在本活动中，你将把上一个用户状态系统中计算得到的 `notificationsEnabled` 改造为一个可写的链接信号，从而了解 `linkedSignal()` 与 `computed()` 的区别。

<hr />



### 1. 导入 linkedSignal 函数

将 `linkedSignal` 添加到现有的导入中。

```ts
// 将 linkedSignal 添加到现有的导入中
import {Component, signal, computed, linkedSignal, ChangeDetectionStrategy} from '@angular/core';
```


### 2. 用相同的表达式将 computed 改为 linkedSignal

用 linkedSignal 替换计算信号 `notificationsEnabled`，并使用完全相同的表达式：

```ts
// 之前（第 2 课中）：
// notificationsEnabled = computed(() => this.userStatus() === 'online');

// 现在使用 linkedSignal —— 表达式相同，但它是可写的：
notificationsEnabled = linkedSignal(() => this.userStatus() === 'online');
```

表达式完全相同，但 linkedSignal 创建的是一个可写信号。它仍会在 `userStatus` 变化时自动更新，同时你也可以手动设置它的值。


### 3. 添加手动切换通知的方法

添加一个方法，演示链接信号可以被直接写入：

```ts
toggleNotifications() {
  // 这在 linkedSignal 上可以正常工作，但在 computed 上会报错！
  this.notificationsEnabled.set(!this.notificationsEnabled());
}
```

这就是关键区别：计算信号是只读的，而链接信号既可以被手动更新，又能保持其响应式连接。


### 4. 更新模板，添加手动通知控制

更新模板（Template），添加一个用于切换通知的按钮：

```html
<div class="status-info">
  <div class="notifications">
    <strong>Notifications:</strong>
    @if (notificationsEnabled()) {
      Enabled
    } @else {
      Disabled
    }
    <button (click)="toggleNotifications()" class="override-btn">
      @if (notificationsEnabled()) {
        Disable
      } @else {
        Enable
      }
    </button>
  </div>
  <!-- 现有的 message 和 working-hours div 保持不变 -->
</div>
```


### 5. 观察响应式行为

现在来测试一下它的行为：

1. 更改用户状态——注意 `notificationsEnabled` 会自动更新
2. 手动切换通知——它会覆盖计算出的值
3. 再次更改状态——链接信号会重新与其计算结果同步

这说明即使被手动设置过，链接信号仍然会保持其响应式连接！




太棒了！你已经了解了计算信号和链接信号之间的关键区别：

- **计算信号**：只读，始终从其他信号派生
- **链接信号**：可写，既可以派生，也可以手动更新
- **何时使用 computed**：值应当始终由计算得出时
- **何时使用 linkedSignal**：你需要一个可以被覆盖的默认计算时

在下一课中，你将学习[如何使用信号管理异步数据](/tutorials/signals/4-managing-async-data-with-signals)！
