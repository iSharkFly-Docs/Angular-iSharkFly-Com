# Angular 中的属性绑定 {#property-binding-in-angular}

Angular 中的属性绑定（Property Binding）让你可以为 HTML 元素、Angular 组件（Component）等的属性设置值。

使用属性绑定可以动态设置 Property 和 Attribute 的值。你可以用它来切换按钮功能、以编程方式设置图片路径，以及在组件之间共享值。

::: info 注意
在[基础知识指南中了解更多关于设置动态 Property 和 Attribute 的内容](/essentials/templates#setting-dynamic-properties-and-attributes)。

:::

在本练习中，你将学习如何在模板（Template）中使用属性绑定。

<hr />

要绑定到元素的某个属性，请把属性名包裹在方括号中。下面是一个示例：

```html
<img alt="photo" [src]="imageURL" />
```

在这个例子中，`src` 属性的值会绑定到类属性 `imageURL`。无论 `imageURL` 的值是什么，都会被设置为 `img` 标签的 `src` 属性。



### 1. 添加一个名为 `isEditable` 的属性 {#_1-add-a-property-called-iseditable}

更新 `app.ts` 中的代码，向 `App` 类添加一个名为 `isEditable` 的属性，并将初始值设为 `true`。

```ts
export class App {
  isEditable = true;
}
```


### 2. 绑定到 `contentEditable` {#_2-bind-to-contenteditable}

接下来，使用 <code aria-label="square brackets">[]</code> 语法把 `div` 的 `contentEditable` 属性绑定到 `isEditable` 属性。

```ts
@Component({
  ...
  template: `<div [contentEditable]="isEditable"></div>`,
})
```




这个 div 现在可以编辑了。干得漂亮 👍

属性绑定是 Angular 众多强大功能之一。如果想了解更多，请查看 [Angular 文档](/guide/templates/binding#css-class-and-style-property-bindings)。
