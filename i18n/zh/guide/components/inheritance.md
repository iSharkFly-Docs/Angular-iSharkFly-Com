# 继承

::: tip 提示
本指南假设你已经阅读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

Angular 组件（Component）就是 TypeScript 类，遵循标准的 JavaScript 继承
语义。

组件可以继承任何基类：

```ts
export class ListboxBase {
  value: string;
}

@Component(/* ... */)
export class CustomListbox extends ListboxBase {
  // CustomListbox 继承了 `value` 属性。
}
```

## 继承其他组件和指令

当一个组件继承另一个组件或指令（Directive）时，它会继承基类装饰器中定义的部分元数据，
以及基类中带装饰器的成员。这包括
宿主绑定（Host Binding）、输入（Input）、输出（Output）和生命周期方法。

```ts
@Component({
  selector: 'base-listbox',
  template: ` ... `,
  host: {
    '(keydown)': 'handleKey($event)',
  },
})
export class ListboxBase {
  value = input.required<string>();
  handleKey(event: KeyboardEvent) {
    /* ... */
  }
}

@Component({
  selector: 'custom-listbox',
  template: ` ... `,
  host: {
    '(click)': 'focusActiveOption()',
  },
})
export class CustomListbox extends ListboxBase {
  disabled = input(false);
  focusActiveOption() {
    /* ... */
  }
}
```

在上面的例子中，`CustomListbox` 继承了与 `ListboxBase` 关联的所有信息，
并用自己的值覆盖了选择器（Selector）和模板（Template）。`CustomListbox` 有两个输入（`value`
和 `disabled`），以及两个事件监听器（Event Listener）（`keydown` 和 `click`）。

子类最终拥有的是其所有祖先类的输入、输出和宿主绑定
与其自身的这些内容的*并集*。

### 转发注入的依赖

当基类在属性初始化器中使用 `inject()` 时，子类会自动继承该属性，无需通过 `super` 转发。

```ts
@Component(/* ... */)
export class ListboxBase {
  protected element = inject(ElementRef);
}

@Component(/* ... */)
export class CustomListbox extends ListboxBase {
  // `element` 继承自 `ListboxBase`。
}
```

如果基类以构造函数参数的形式注入依赖，子类就必须显式地把这些依赖传给 `super`。

```ts
@Component(/* ... */)
export class ListboxBase {
  constructor(private element: ElementRef) {}
}

@Component(/* ... */)
export class CustomListbox extends ListboxBase {
  constructor(element: ElementRef) {
    super(element);
  }
}
```

### 覆盖生命周期方法

如果基类定义了某个生命周期方法（例如 `ngOnInit`），而子类也
实现了 `ngOnInit`，那么子类就会*覆盖*基类的实现。如果你想保留基类的
生命周期方法，请通过 `super` 显式调用该方法：

```ts
@Component(/* ... */)
export class ListboxBase {
  protected isInitialized = false;
  ngOnInit() {
    this.isInitialized = true;
  }
}

@Component(/* ... */)
export class CustomListbox extends ListboxBase {
  override ngOnInit() {
    super.ngOnInit();
    /* ... */
  }
}
```
