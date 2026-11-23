# 使用信号查询来查询子元素

现在你已经学会了[如何在指令中使用信号](/tutorials/signals/8-using-signals-with-directives)，接下来让我们探索基于信号（Signal）的查询（Query）API。它们提供了一种响应式的方式来访问子组件（Component）和指令（Directive）并与之交互。组件和指令既可以执行查询，也可以被查询。与传统的 ViewChild 不同，信号查询会自动更新，并提供对子组件和指令的类型安全访问。

在本活动中，你将添加 viewChild 查询，以编程方式与子组件交互。

<hr />



### 1. 添加 viewChild 导入

首先，在 `app.ts` 中添加 `viewChild` 导入，以便访问子组件。

```ts
import {Component, signal, computed, viewChild, ChangeDetectionStrategy} from '@angular/core';
```


### 2. 创建 viewChild 查询

向 App 组件添加 viewChild 查询，以访问子组件。

```ts
// 用于访问子组件的查询 API
firstProduct = viewChild(ProductCard);
cartSummary = viewChild(CartSummary);
```

这些查询会创建引用子组件实例的信号。


### 3. 实现父组件中的方法

在 `app.ts` 中，使用 viewChild 查询调用子组件上的方法：

```ts
showFirstProductDetails() {
  const product = this.firstProduct();
  if (product) {
    product.highlight();
  }
}

initiateCheckout() {
  const summary = this.cartSummary();
  if (summary) {
    summary.initiateCheckout();
  }
}
```


### 4. 测试交互

现在控制按钮应该可以正常工作了：

- **“Show First Product Details”** - 调用 ProductCard 上的 `highlight()`
- **“Initiate Checkout”** - 调用 CartSummary 上的 `initiateCheckout()`

点击这些按钮，看看 viewChild 查询如何让父组件控制子组件的行为。




完美！你已经学会了如何使用基于信号的查询 API 与子组件交互：

在下一课中，你将学习[如何使用 effect 响应信号变化](/tutorials/signals/10-reacting-to-signal-changes-with-effect)！
