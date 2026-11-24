# 使用 `linkedSignal` 管理依赖状态 {#dependent-state-with-linkedsignal}

你可以使用 `signal` 函数在 Angular 代码中保存一些状态。有时，这个状态依赖于某个*其他*状态。例如，设想有一个组件（Component），让用户为订单选择配送方式：

```ts
@Component({
  /* ... */
})
export class ShippingMethodPicker {
  shippingOptions: Signal<ShippingMethod[]> = getShippingOptions();

  // 默认选中第一个配送选项。
  selectedOption = signal(this.shippingOptions()[0]);

  changeShipping(newOptionIndex: number) {
    this.selectedOption.set(this.shippingOptions()[newOptionIndex]);
  }
}
```

在这个例子中，`selectedOption` 默认为第一个选项，如果用户选择了其他选项，它就会随之改变。但 `shippingOptions` 是一个信号（Signal）——它的值可能会变！如果 `shippingOptions` 发生变化，`selectedOption` 可能会包含一个已经不再是有效选项的值。

**`linkedSignal` 函数让你可以创建一个信号，用来保存与某个其他状态天然*链接*在一起的状态。** 回到上面的例子，可以用 `linkedSignal` 替换 `signal`：

```ts
@Component({
  /* ... */
})
export class ShippingMethodPicker {
  shippingOptions: Signal<ShippingMethod[]> = getShippingOptions();

  // 把 selectedOption 初始化为第一个配送选项。
  selectedOption = linkedSignal(() => this.shippingOptions()[0]);

  changeShipping(index: number) {
    this.selectedOption.set(this.shippingOptions()[index]);
  }
}
```

`linkedSignal` 的工作方式与 `signal` 类似，但有一个关键区别——你传入的不是默认值，而是一个*计算函数*，就像 `computed` 一样。当计算的值发生变化时，`linkedSignal` 的值就会变为计算结果。这有助于确保 `linkedSignal` 始终持有有效的值。

下面的例子展示了 `linkedSignal` 的值如何根据其链接的状态发生变化：

```ts
const shippingOptions = signal(['Ground', 'Air', 'Sea']);
const selectedOption = linkedSignal(() => shippingOptions()[0]);
console.log(selectedOption()); // 'Ground'

selectedOption.set(shippingOptions()[2]);
console.log(selectedOption()); // 'Sea'

shippingOptions.set(['Email', 'Will Call', 'Postal service']);
console.log(selectedOption()); // 'Email'
```

## 考虑之前的状态 {#accounting-for-previous-state}

在某些情况下，`linkedSignal` 的计算需要考虑 `linkedSignal` 之前的值。

在上面的例子中，每当 `shippingOptions` 变化时，`selectedOption` 总会更新回第一个选项。不过，如果用户选择的选项仍然在列表中，你可能希望保留用户的选择。为此，你可以创建一个分别指定*源*（source）和*计算*（computation）的 `linkedSignal`：

```ts
interface ShippingMethod {
  id: number;
  name: string;
}

@Component({
  /* ... */
})
export class ShippingMethodPicker {
  constructor() {
    this.changeShipping(2);
    this.changeShippingOptions();
    console.log(this.selectedOption()); // {"id":2,"name":"Postal Service"}
  }

  shippingOptions = signal<ShippingMethod[]>([
    {id: 0, name: 'Ground'},
    {id: 1, name: 'Air'},
    {id: 2, name: 'Sea'},
  ]);

  selectedOption = linkedSignal<ShippingMethod[], ShippingMethod>({
    // 每当这个 `source` 变化时，`selectedOption` 都会被设置为 `computation` 的结果。
    source: this.shippingOptions,
    computation: (newOptions, previous) => {
      // 如果 newOptions 包含之前选中的选项，就保留该选择。
      // 否则，默认使用第一个选项。
      return newOptions.find((opt) => opt.id === previous?.value.id) ?? newOptions[0];
    },
  });

  changeShipping(index: number) {
    this.selectedOption.set(this.shippingOptions()[index]);
  }

  changeShippingOptions() {
    this.shippingOptions.set([
      {id: 0, name: 'Email'},
      {id: 1, name: 'Sea'},
      {id: 2, name: 'Postal Service'},
    ]);
  }
}
```

创建 `linkedSignal` 时，你可以传入一个带有独立 `source` 和 `computation` 属性的对象，而不是只提供一个计算函数。

`source` 可以是任何信号，例如 `computed` 或组件的 `input`。当 `source` 发生变化，或 `computation` 中引用的任何信号发生变化时，`linkedSignal` 都会用所提供的 `computation` 的结果来更新自己的值。

`computation` 是一个函数，它接收 `source` 的新值和一个 `previous` 对象。`previous` 对象有两个属性——`previous.source` 是 `source` 之前的值，`previous.value` 是 `linkedSignal` 之前的值。你可以利用这些之前的值来决定计算的新结果。

::: tip 提示
使用 `previous` 参数时，必须显式提供 `linkedSignal` 的泛型类型参数。第一个泛型类型对应 `source` 的类型，第二个泛型类型决定 `computation` 的输出类型。

:::

## 自定义相等性比较 {#custom-equality-comparison}

与其他信号一样，`linkedSignal` 也可以配置自定义的相等性函数。下游依赖会使用这个函数来判断 `linkedSignal` 的值（计算结果）是否发生了变化：

```ts
const activeUser = signal({id: 123, name: 'Morgan', isAdmin: true});

const activeUserEditCopy = linkedSignal(() => activeUser(), {
  // 只要 `id` 相同，就认为是同一个用户。
  equal: (a, b) => a.id === b.id,
});

// 或者，如果分别指定 `source` 和 `computation`
const activeUserEditCopy = linkedSignal({
  source: activeUser,
  computation: (user) => user,
  equal: (a, b) => a.id === b.id,
});
```

## 自定义 set 操作 {#customizing-the-set-operation}

有时你可能希望 `linkedSignal` 的 `set` 和 `update` 操作把值写回数据源（source of truth），而不是直接更新 `linkedSignal` 的值。你可以在选项中传入一个 `set` 函数来自定义这一行为。

自定义的 `set` 函数接收两个参数：

1. 要设置的新值。
2. 一个 `rawSet` 函数，调用它可以直接更新 `linkedSignal` 的内部状态（与默认行为一致）。

::: info 注意
使用 `rawSet` 可以直接更新 `linkedSignal` 的值。这可以用来避免运行计算，例如当计算是一个开销较大的派生、而你已经知道结果的时候。

:::

### 写回源信号 {#writing-back-to-a-source-signal}

设想有一个组件，它以华氏度显示温度并允许编辑，但以一个摄氏度信号作为数据源：

```ts
const tempC = signal(0);
const tempF = linkedSignal(() => (tempC() * 9) / 5 + 32, {
  set: (valF) => tempC.set(((valF - 32) * 5) / 9),
});

console.log(tempF()); // 32

// 设置华氏度会更新摄氏度，而摄氏度又会响应式地更新华氏度
tempF.set(212);
console.log(tempC()); // 100
console.log(tempF()); // 212
```

### 更新父对象中的属性 {#updating-a-property-inside-a-parent-object}

另一个常见场景是更新父对象中的某个特定属性。父对象保存在一个信号中，而你链接到其中的嵌套属性：

```ts
interface Order {
  id: number;
  shippingMethod: string;
}

const order = signal<Order>({
  id: 42,
  shippingMethod: 'Ground',
});

const shippingMethod = linkedSignal(() => order().shippingMethod, {
  set: (newMethod) => {
    // 执行不可变更新，把变更写回 order
    order.update((currentOrder) => ({
      ...currentOrder,
      shippingMethod: newMethod,
    }));
  },
});

console.log(shippingMethod()); // 'Ground'

// 更新 shippingMethod 会同时更新父级 order 对象
shippingMethod.set('Air');
console.log(order()); // { id: 42, shippingMethod: 'Air' }
console.log(shippingMethod()); // 'Air'
```
