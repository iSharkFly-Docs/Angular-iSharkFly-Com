# 使用 Resource API 通过信号管理异步数据 {#managing-async-data-with-signals-using-the-resources-api}

现在你已经学会了[如何使用链接信号派生状态](/tutorials/signals/3-deriving-state-with-linked-signals)，接下来让我们探索如何使用 Resource API 处理异步数据。Resource API 提供了一种强大的方式，借助信号（Signal）来管理异步操作，并内置了加载状态、错误处理和请求管理等功能。

在本活动中，你将通过构建一个演示 Resource API 实际用法的用户资料加载器，学习如何使用 `resource()` 函数异步加载数据，以及如何处理异步操作的各种状态。

<hr />



### 1. 导入 resource 函数和 API {#_1-import-resource-function-and-api}

将 `resource` 添加到现有的导入中，并导入模拟的 API 函数。

```ts
// 将 resource 添加到现有的导入中
import {Component, signal, computed, resource, ChangeDetectionStrategy} from '@angular/core';
// 导入模拟的 API 函数
import {getUserData} from './user-api';
```


### 2. 为用户数据创建资源 {#_2-create-a-resource-for-user-data}

在组件（Component）类中添加一个属性，创建一个根据用户 ID 信号加载用户数据的资源（Resource）。

```ts
userId = signal(1);

userResource = resource({
  params: () => ({id: this.userId()}),
  loader: (params) => getUserData(params.params.id),
});
```


### 3. 添加与资源交互的方法 {#_3-add-methods-to-interact-with-the-resource}

添加用于更改用户 ID 和重新加载资源的方法。

```ts
loadUser(id: number) {
  this.userId.set(id);
}

reloadUser() {
  this.userResource.reload();
}
```

更改 params 信号会自动触发重新加载，你也可以使用 `reload()` 手动重新加载。


### 4. 为资源状态创建计算信号 {#_4-create-computed-signals-for-resource-states}

添加计算信号（Computed）来访问资源的不同状态。

```ts
isLoading = this.userResource.isLoading;
hasError = computed(() => this.userResource.status() === 'error');
```

资源提供了一个 `status()` 信号，其值可以是 'loading'、'reloading'、'resolved' 或 'error'；一个用于获取已加载数据的 `value()` 信号；以及一个可安全检查数据是否可用的 `hasValue()` 方法。在 'loading' 和 'reloading' 两种状态下，`isLoading()` 信号都为 true。


### 5. 连接按钮并显示资源状态 {#_5-wire-up-the-buttons-and-display-resource-states}

模板（Template）结构已经提供好了。现在把所有内容连接起来：

第 1 部分. **为按钮添加点击处理器：**

```html
<button (click)="loadUser(1)">Load User 1</button>
<button (click)="loadUser(2)">Load User 2</button>
<button (click)="loadUser(999)">Load Invalid User</button>
<button (click)="reloadUser()">Reload</button>
```

第 2 部分. **用资源状态处理逻辑替换占位内容：**

```html
@if (isLoading()) {
  <p>Loading user...</p>
} @else if (hasError()) {
  <p class="error">Error: {{ userResource.error()?.message }}</p>
} @else if (userResource.hasValue()) {
  <div class="user-info">
    <h3>{{ userResource.value().name }}</h3>
    <p>{{ userResource.value().email }}</p>
  </div>
}
```

资源提供了多种方法来检查其状态：

- `isLoading()` - 正在获取数据时为 true
- `hasError()` - 发生错误时为 true
- `userResource.hasValue()` - 数据可用时为 true
- `userResource.value()` - 访问已加载的数据
- `userResource.error()` - 访问错误信息




太棒了！你已经学会了如何将 Resource API 与信号结合使用。需要记住的关键概念：

- **资源是响应式的**：当 params 变化时，它们会自动重新加载
- **内置状态管理**：资源提供了 `status()`、`value()` 和 `error()` 信号
- **自动清理**：资源会自动处理请求的取消和清理
- **手动控制**：需要时，你可以手动重新加载或中止请求

在下一课中，你将学习[如何使用输入信号向组件传递数据](/tutorials/signals/5-component-communication-with-signals)！
