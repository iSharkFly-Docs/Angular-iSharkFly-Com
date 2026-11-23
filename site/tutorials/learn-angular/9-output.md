# 组件输出属性 {#component-output-properties}

在使用组件（Component）时，可能需要通知其他组件发生了某些事情。也许是某个按钮被点击了、列表中添加或删除了某个条目，或者发生了其他重要的更新。在这种场景下，组件需要与父组件进行通信。

Angular 使用 `output()` 函数来实现这类行为。

::: info 注意
在[输出指南中了解更多关于自定义事件的内容](/guide/components/outputs)。

:::

在本练习中，你将学习如何使用 `output()` 函数与组件通信。

<hr />

要创建从子组件到父组件的通信路径，请使用 `output` 函数来初始化一个类属性。

```ts [child.ts]
@Component({...})
class Child {
  incrementCountEvent = output<number>();
}
```

现在，该组件可以生成能被父组件监听的事件了。通过调用 `emit` 方法来触发事件：

```ts [child.ts]
class Child {
  ...

  onClick() {
    this.count++;
    this.incrementCountEvent.emit(this.count);
  }
}
```

emit 函数会生成一个事件，其类型与 `output` 中定义的类型相同。

好了，轮到你来试一试了。按照以下任务补全代码：



### 1. 添加一个 `output()` 属性 {#_1-add-an-output-property}

更新 `child.ts`，添加一个名为 `addItemEvent` 的输出属性，一定要把输出类型设为 `string`。


### 2. 完成 `addItem` 方法 {#_2-complete-additem-method}

在 `child.ts` 中更新 `addItem` 方法，使用以下代码作为其逻辑：

```ts [child.ts]
addItem() {
  this.addItemEvent.emit('🐢');
}
```


### 3. 更新 `App` 模板 {#_3-update-the-app-template}

在 `app.ts` 中更新模板（Template），添加以下代码来监听发出的事件：

```html
<app-child (addItemEvent)="addItem($event)" />
```

现在，每次点击「Add Item」按钮，都会向列表中添加一个新条目。




哇，到这里你已经学完了组件的基础知识，真了不起 👏

继续学习，解锁 Angular 更多出色的功能吧。
