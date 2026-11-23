# 使用 effect 响应信号变化 {#reacting-to-signal-changes-with-effect}

现在你已经学会了[使用信号查询来查询子元素](/tutorials/signals/9-query-child-elements-with-signal-queries)，接下来让我们探索如何使用副作用（Effect）来响应信号（Signal）的变化。副作用是在其依赖项变化时自动运行的函数，非常适合处理日志记录、DOM 操作或 API 调用等附带操作。

**重要提示：副作用应当是你最后才考虑使用的 API。** 对于派生值，始终优先使用 `computed()`；对于既可派生又可手动设置的值，优先使用 `linkedSignal()`。如果你发现自己在用副作用把数据从一个信号复制到另一个信号，这说明你应该把数据源（source-of-truth）提升到更高的层级，并改用 `computed()` 或 `linkedSignal()`。副作用最适合用于把信号状态同步到命令式的、非信号的 API。

在本活动中，你将学习如何恰当地使用 `effect()` 函数，处理那些确实需要响应信号变化的副作用。

<hr />

你已经有了一个设置好信号的主题管理器应用。现在你将添加副作用，让它自动响应信号的变化。



### 1. 导入 effect 函数 {#_1-import-effect-function}

将 `effect` 添加到现有的导入中。

```ts
// 将 effect 添加到现有的导入中
import {Component, signal, computed, effect, ChangeDetectionStrategy} from '@angular/core';
```

`effect` 函数会创建一个响应式副作用，每当它读取的任何信号发生变化时，都会自动运行。


### 2. 创建用于本地存储的副作用 {#_2-create-an-effect-for-local-storage}

添加一个副作用，在主题变化时自动将其保存到 local storage。

```ts
constructor() {
  // 每当主题变化时将其保存到 localStorage
  effect(() => {
    localStorage.setItem('theme', this.theme());
    console.log('Theme saved to localStorage:', this.theme());
  });
}
```

每当 theme 信号变化时，这个副作用都会运行，从而自动持久化用户的偏好设置。


### 3. 创建用于记录用户活动的副作用 {#_3-create-an-effect-for-logging-user-activity}

添加一个副作用，在用户登录或登出时记录日志。

```ts
constructor() {
  // ... 之前的副作用

  // 记录用户活动的变化
  effect(() => {
    const status = this.isLoggedIn() ? 'logged in' : 'logged out';
    const user = this.username();
    console.log(`User ${user} is ${status}`);
  });
}
```

这个副作用演示了副作用如何读取多个信号，并在其中任何一个发生变化时做出响应。


### 4. 创建带清理逻辑的副作用 {#_4-create-an-effect-with-cleanup}

添加一个副作用，它会设置一个定时器，并在组件（Component）销毁时进行清理。

```ts
constructor() {
  // ... 之前的副作用

  // 带清理逻辑的定时器副作用
  effect((onCleanup) => {
    const interval = setInterval(() => {
      console.log('Timer tick - Current theme:', this.theme());
    }, 5000);

    // 在副作用销毁时清理定时器
    onCleanup(() => {
      clearInterval(interval);
      console.log('Timer cleaned up');
    });
  });
}
```

这个副作用在运行期间不会读取任何信号，因为 `this.theme()` 只会在稍后的 `setInterval` 回调中被调用。它只运行一次，并且永远不会重新运行，因此只有在组件被销毁时（例如预览重新加载时）才会执行清理。


### 5. 测试副作用 {#_5-test-the-effects}

打开浏览器控制台，与应用进行交互：

- **切换主题（Toggle Theme）** - 查看 localStorage 的保存记录
- **登录/登出（Login/Logout）** - 查看用户活动日志
- **观察定时器** - 每 5 秒查看一次定期输出的主题日志

副作用会在组件创建时运行一次，因此在你点击任何内容之前，就会出现部分日志。之后，每当它们读取的信号发生变化时，它们都会再次运行。




太棒了！你已经学会了如何将副作用与信号结合使用。需要记住的关键概念：

- **副作用是响应式的**：每当它们读取的任何信号变化时，都会自动运行
- **仅用于附带操作**：非常适合日志记录、DOM 操作、API 调用以及同步到命令式 API
- **清理**：使用 `onCleanup` 回调来清理定时器或订阅等资源
- **自动追踪**：副作用会自动追踪它们读取了哪些信号，并在这些信号变化时重新运行

**记住：要谨慎使用副作用！** 本课中的示例（localStorage 同步、日志记录、定时器）都属于恰当的用法。以下情况应避免使用副作用：

- 从其他信号派生值——请改用 `computed()`
- 创建可写的派生状态——请改用 `linkedSignal()`
- 在信号之间复制数据——请重构代码，改用共享的单一数据源

副作用功能强大，但只有在 `computed()` 和 `linkedSignal()` 无法满足你的用例时，才应将其作为最后的手段。
