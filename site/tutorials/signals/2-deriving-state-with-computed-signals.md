# 使用计算信号派生状态 {#deriving-state-with-computed-signals}

现在你已经学会了[如何创建和更新信号](/tutorials/signals/1-creating-your-first-signal)，接下来让我们学习计算信号（Computed）。计算信号是派生出来的值，会在其依赖项发生变化时自动更新。它们非常适合基于其他信号创建响应式计算。

在本活动中，你将学习如何使用 `computed()` 函数创建派生状态，这些状态会在底层信号（Signal）变化时自动更新。

让我们为用户状态系统添加一些计算值，从用户状态信号中派生出更多信息。现在的起始代码包含三种状态选项：`'online'`、`'away'` 和 `'offline'`。

<hr />



### 1. 导入 computed 函数 {#_1-import-computed-function}

将 `computed` 添加到现有的导入中。

```ts
// 将 computed 添加到现有的导入中
import {Component, signal, computed, ChangeDetectionStrategy} from '@angular/core';
```


### 2. 为通知创建计算信号 {#_2-create-a-computed-signal-for-notifications}

添加一个计算信号，根据用户状态决定是否启用通知。

```ts
notificationsEnabled = computed(() => this.userStatus() === 'online');
```

每当 `userStatus` 信号发生变化时，这个计算信号都会自动重新计算。注意，我们在 computed 函数内部调用 `this.userStatus()` 来读取信号的值。


### 3. 为描述性消息创建计算信号 {#_3-create-a-computed-signal-for-a-descriptive-message}

添加一个计算信号，根据用户状态生成描述性消息。

```ts
statusMessage = computed(() => {
  const status = this.userStatus();
  switch (status) {
    case 'online':
      return 'Available for meetings and messages';
    case 'away':
      return 'Temporarily away, will respond soon';
    case 'offline':
      return 'Not available, check back later';
    default:
      return 'Status unknown';
  }
});
```

这展示了计算信号如何借助 switch 语句和字符串转换来处理更复杂的逻辑。


### 4. 创建计算工作时间可用性的计算信号 {#_4-create-a-computed-signal-that-calculates-working-hours-availability}

添加一个计算信号，计算用户当前是否处于工作时间内。

```ts
isWithinWorkingHours = computed(() => {
  const now = new Date();
  const hour = now.getHours();
  const isWeekday = now.getDay() > 0 && now.getDay() < 6;
  return this.userStatus() !== 'offline' && isWeekday && hour >= 9 && hour < 17;
});
```

这演示了计算信号如何执行计算并组合多个数据源。当 `userStatus` 变化时，它的值会自动更新。


### 5. 在模板中显示计算值 {#_5-display-the-computed-values-in-the-template}

模板（Template）中已经有显示“Loading...”的占位内容。用你的计算信号替换它们：

1. 对于通知，将 `Loading...` 替换为一个 `@if` 块：

   ```html
   @if (notificationsEnabled()) {
     Enabled
   } @else {
     Disabled
   }
   ```

1. 对于消息，将 `Loading...` 替换为：

   ```html
   {{ statusMessage() }}
   ```

1. 对于工作时间，将 `Loading...` 替换为一个 `@if` 块：

   ```html
   @if (isWithinWorkingHours()) {
     Yes
   } @else {
     No
   }
   ```

注意，计算信号的调用方式和普通信号完全一样——都要带上括号！




太棒了！你已经学会了如何创建计算信号。

以下是需要记住的几个要点：

- **计算信号是响应式的**：它们会在依赖项变化时自动更新
- **它们是只读的**：你不能直接设置计算信号的值，它们是从其他信号派生而来的
- **它们可以包含复杂的逻辑**：可用于计算、转换和派生状态
- **它们为基于动态状态的高性能计算提供了一种方式**：只有当依赖项真正发生变化时，Angular 才会重新计算它们

在下一课中，你将学习[另一种派生状态的方式：linkedSignal](/tutorials/signals/3-deriving-state-with-linked-signals)！
