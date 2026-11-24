# 使用输出自定义事件

::: tip 提示
本指南假定你已经读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

Angular 组件（Component）可以把某个属性赋值为 `output` 函数的返回值，以此定义自定义事件：

```ts
@Component({
  /*...*/
})
export class ExpandablePanel {
  panelClosed = output<void>();
}
```

```html
<expandable-panel (panelClosed)="savePanelState()" />
```

`output` 函数返回一个 `OutputEmitterRef`。你可以调用 `OutputEmitterRef` 上的 `emit` 方法来发出事件：

```ts
this.panelClosed.emit();
```

Angular 把用 `output` 函数初始化的属性称为**输出**（output）。你可以使用输出来触发自定义事件，就像 `click` 这样的原生浏览器事件一样。

**Angular 自定义事件不会在 DOM 中冒泡**。

**输出名称区分大小写。**

扩展组件类时，**输出会被子类继承。**

`output` 函数对 Angular 编译器有特殊意义。**你只能在组件和指令（Directive）的属性初始化器中调用 `output`。**

## 发出事件数据

调用 `emit` 时，你可以传递事件数据：

```ts
// 你可以发出原始类型的值。
this.valueChanged.emit(7);

// 你可以发出自定义的事件对象
this.thumbDropped.emit({
  pointerX: 123,
  pointerY: 456,
});
```

在模板（Template）中定义事件监听器（event listener）时，你可以通过 `$event` 变量访问事件数据：

```html
<custom-slider (valueChanged)="logValue($event)" />
```

在父组件中接收事件数据：

```ts
@Component({
 /*...*/
})
export class App {
  logValue(value: number) {
    ...
  }
}

```

## 自定义输出名称

`output` 函数接受一个参数，让你可以为事件在模板中指定一个不同的名称：

```ts
@Component(/* ... */)
export class CustomSlider {
  changed = output({alias: 'valueChanged'});
}
```

```html
<custom-slider (valueChanged)="saveVolume()" />
```

这个别名不会影响在 TypeScript 代码中对该属性的使用。

虽然一般应避免为组件的输出设置别名，但在重命名属性时，这个特性可以为原名称保留一个别名；它也可以用来避免与原生 DOM 事件的名称发生冲突。

## 以编程方式订阅输出

动态创建组件时，你可以以编程方式订阅组件实例上的
输出事件。`OutputRef` 类型包含一个 `subscribe` 方法：

```ts
const someComponentRef: ComponentRef<SomeComponent> = viewContainerRef.createComponent(/*...*/);

someComponentRef.instance.someEventProperty.subscribe((eventData) => {
  console.log(eventData);
});
```

当 Angular 销毁带有订阅者的组件时，会自动清理事件订阅。你也可以手动取消对事件的订阅。`subscribe` 函数返回一个带有 `unsubscribe` 方法的 `OutputRefSubscription`：

```ts
const eventSubscription = someComponent.someEventProperty.subscribe((eventData) => {
  console.log(eventData);
});

// ...

eventSubscription.unsubscribe();
```

## 选择事件名称

避免选择与 DOM 元素（如 HTMLElement）上的事件相冲突的输出名称。名称冲突会让人搞不清所绑定的属性到底属于组件还是 DOM 元素。

避免像给组件选择器（selector）加前缀那样给组件输出加前缀。由于一个元素只能承载一个组件，任何自定义属性都可以认为属于该组件。

输出名称始终使用 [camelCase](https://en.wikipedia.org/wiki/Camel_case)（小驼峰）形式。避免给输出名称加“on”前缀。

## 与 RxJS 一起使用输出

关于输出与 RxJS 之间的互操作，请参阅[RxJS 与组件和指令输出的互操作](/ecosystem/rxjs-interop/output-interop)。

## 使用 `@Output` 装饰器声明输出

::: tip 提示
虽然 Angular 团队建议新项目使用 `output` 函数，但原有的
基于装饰器的 `@Output` API 仍然受到完全支持。

:::

你也可以把某个属性赋值为一个新的 `EventEmitter`，并添加 `@Output` 装饰器，以此定义自定义事件：

```ts
@Component(/* ... */)
export class ExpandablePanel {
  @Output() panelClosed = new EventEmitter<void>();
}
```

你可以调用 `EventEmitter` 上的 `emit` 方法来发出事件。

### 使用 `@Output` 装饰器设置别名

`@Output` 装饰器接受一个参数，让你可以为事件在模板中指定一个不同的名称：

```ts
@Component(/* ... */)
export class CustomSlider {
  @Output('valueChanged') changed = new EventEmitter<number>();
}
```

```html
<custom-slider (valueChanged)="saveVolume()" />
```

这个别名不会影响在 TypeScript 代码中对该属性的使用。

## 在 `@Component` 装饰器中指定输出

除了 `@Output` 装饰器之外，你还可以使用 `@Component` 装饰器中的 `outputs` 属性来指定组件的输出。当组件从基类继承某个属性时，这会很有用：

```ts
// `CustomSlider` 从 `BaseSlider` 继承了 `valueChanged` 属性。
@Component({
  /*...*/
  outputs: ['valueChanged'],
})
export class CustomSlider extends BaseSlider {}
```

你还可以在 `outputs` 列表中指定输出别名，方法是在字符串中把别名放在冒号之后：

```ts
// `CustomSlider` 从 `BaseSlider` 继承了 `valueChanged` 属性。
@Component({
  /*...*/
  outputs: ['valueChanged: volumeChanged'],
})
export class CustomSlider extends BaseSlider {}
```
