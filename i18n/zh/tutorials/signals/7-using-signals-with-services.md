# 在服务中使用信号

现在你已经学会了[使用模型信号实现双向绑定](/tutorials/signals/6-two-way-binding-with-model-signals)，接下来让我们探索如何在 Angular 服务（Service）中使用信号（Signal）。服务非常适合在多个组件（Component）之间共享响应式状态，而信号通过提供自动变更检测（Change Detection）和简洁的响应式模式，让这一切变得更加强大。

在本活动中，你将学习如何使用信号创建一个购物车存储（store），让购物车展示组件能够自动响应状态变化。

<hr />



### 1. 添加购物车存储的信号

在 `cart-store.ts` 中添加只读信号和计算信号（Computed），让购物车状态具备响应性。

```ts
// 添加 computed 的导入
import {Service, signal, computed} from '@angular/core';

// 然后在类中添加以下信号：

// 只读信号
readonly cartItems = this.items.asReadonly();

// 计算信号
readonly totalQuantity = computed(() => {
  return this.items().reduce((sum, item) => sum + item.quantity, 0);
});

readonly totalPrice = computed(() => {
  return this.items().reduce((sum, item) => sum + item.price * item.quantity, 0);
});
```

这些信号让组件能够以响应式的方式访问购物车数据和计算出的总计。`asReadonly()` 方法可以防止外部代码直接修改购物车中的商品，而 `computed()` 会创建派生状态，在源信号变化时自动更新。


### 2. 完成数量更新方法

`cart-display.ts` 中的购物车展示组件已经在其模板（Template）中使用了购物车存储的信号。完成以下数量更新方法，以修改购物车中的商品：

```ts
increaseQuantity(id: string) {
  const items = this.cartStore.cartItems();
  const currentItem = items.find((item) => item.id === id);
  if (currentItem) {
    this.cartStore.updateQuantity(id, currentItem.quantity + 1);
  }
}

decreaseQuantity(id: string) {
  const items = this.cartStore.cartItems();
  const currentItem = items.find((item) => item.id === id);
  if (currentItem && currentItem.quantity > 1) {
    this.cartStore.updateQuantity(id, currentItem.quantity - 1);
  }
}
```

这些方法通过 `cartItems()` 读取当前的购物车状态，并借助存储提供的方法来更新数量。当信号变化时，UI 会自动更新！


### 3. 更新主应用组件

更新 `app.ts` 中的主应用组件，让它使用购物车服务并显示购物车组件。

```ts
import {Component, inject} from '@angular/core';
import {CartStore} from './cart-store';
import {CartDisplay} from './cart-display';

@Component({
  selector: 'app-root',
  imports: [CartDisplay],
  template: `
    <div class="shopping-app">
      <header>
        <h1>Signals with Services Demo</h1>
        <div class="cart-badge">
          Cart: {{ cartStore.totalQuantity() }} items (\${{ cartStore.totalPrice() }})
        </div>
      </header>

      <main>
        <cart-display />
      </main>
    </div>
  `,
  styleUrl: './app.css',
})
export class App {
  cartStore = inject(CartStore);
}
```




太棒了！你已经学会了如何在服务中使用信号。需要记住的关键概念：

- **服务级信号**：服务可以使用信号来管理响应式状态
- **依赖注入（Dependency Injection）**：在组件中使用 `inject()` 来访问带有信号的服务
- **服务中的计算信号**：创建可自动更新的派生状态
- **只读信号**：暴露信号的只读版本，以防止外部修改

在下一课中，你将学习[如何在指令中使用信号](/tutorials/signals/8-using-signals-with-directives)！
