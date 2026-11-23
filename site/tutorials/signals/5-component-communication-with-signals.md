# 使用输入信号向组件传递数据 {#passing-data-to-components-with-input-signals}

现在你已经学会了[使用信号管理异步数据](/tutorials/signals/4-managing-async-data-with-signals)，接下来让我们探索 Angular 基于信号（Signal）的 `input()` API，它用于把数据从父组件（Component）传递给子组件，使组件之间的数据流更具响应性、更高效。如果你熟悉其他框架中的组件 props，那么输入（Input）就是同样的概念。

在本活动中，你将为一个商品卡片组件添加信号输入（Signal Input），并观察父组件的数据如何以响应式的方式向下流动。

<hr />



### 1. 为 ProductCard 添加信号输入 {#_1-add-signal-inputs-to-productcard}

在 `product-card` 组件中添加信号 `input()` 函数来接收数据。

```ts
// 添加信号输入所需的导入
import {Component, input, ChangeDetectionStrategy} from '@angular/core';

// 添加这些信号输入
name = input.required<string>();
price = input.required<number>();
available = input<boolean>(true);
```

注意，`input.required()` 创建的是一个必须提供的输入，而带有默认值的 `input()` 则是可选的。


### 2. 将输入连接到模板 {#_2-connect-inputs-to-the-template}

更新 `product-card` 中的模板（Template），以显示信号输入的值。

```html
<div class="product-card">
  <h3>{{ name() }}</h3>
  <p class="price">\${{ price() }}</p>
  <p class="status">
    Status:
    @if (available()) {
      Available
    } @else {
      Out of Stock
    }
  </p>
</div>
```

在模板中，输入信号的用法与普通信号完全相同——像调用函数一样调用它们即可获取值。


### 3. 将父组件的信号连接到子组件的输入 {#_3-connect-parent-signals-to-child-inputs}

更新 `app.ts` 中 `product-card` 的用法，传入动态的信号值，而不是静态值。

```html
<!-- 将静态值： -->
<product-card name="Static Product" price="99" available="true" />

<!-- 改为动态信号： -->
<product-card [name]="productName()" [price]="productPrice()" [available]="productAvailable()" />
```

方括号 `[]` 会创建属性绑定，把信号的当前值传递给子组件。


### 4. 测试响应式更新 {#_4-test-reactive-updates}

在 `app.ts` 中添加用于更新父组件信号的方法，观察子组件如何自动做出响应。

```ts
updateProduct() {
  this.productName.set(`Product ${Math.floor(Math.random() * 100)}`);
  this.productPrice.set(Math.floor(Math.random() * 500) + 50);
}

toggleAvailability() {
  this.productAvailable.set(!this.productAvailable());
}
```

```html
<!-- 添加用于测试响应性的控件 -->
<div class="controls">
  <button (click)="updateProduct()">Update Product Data</button>
  <button (click)="toggleAvailability()">Toggle Availability</button>
</div>
```

当父组件的信号变化时，子组件会自动接收并显示新的值！




太棒了！你已经了解了信号输入的工作方式：

- **信号输入** - 使用 `input()` 和 `input.required()` 从父组件接收数据
- **响应式更新** - 当父组件的信号值变化时，子组件会自动更新
- **类型安全** - 信号输入提供完整的 TypeScript 类型检查
- **默认值** - 可选输入可以有默认值，而必需输入则必须提供

信号输入让组件间通信更具响应性，并且在很多情况下无需再使用 `OnChanges` 生命周期钩子（Lifecycle Hook）。

在下一课中，你将学习[使用模型信号实现双向绑定](/tutorials/signals/6-two-way-binding-with-model-signals)！
