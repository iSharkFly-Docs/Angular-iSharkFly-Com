# 组件中的控制流 - `@for` {#control-flow-in-components-for}

在构建 Web 应用时，你经常需要把某段代码重复特定的次数。例如，给定一个名字数组，你可能希望把每个名字都显示在一个 `<p>` 标签中。

::: info 注意
在[基础知识指南中了解更多关于控制流的内容](/essentials/templates#control-flow-with-if-and-for)。

:::

在本练习中，你将学习如何使用 `@for` 在模板（Template）中重复渲染元素。

<hr/>

在模板中实现元素重复渲染的语法是 `@for`。

下面是在组件（Component）中使用 `@for` 语法的示例：

```ts
@Component({
  ...
  template: `
    @for (os of operatingSystems; track os.id) {
      {{ os.name }}
    }
  `,
})
export class App {
  operatingSystems = [{id: 'win', name: 'Windows'}, {id: 'osx', name: 'macOS'}, {id: 'linux', name: 'Linux'}];
}
```

有两点需要注意：

- `for` 前面有一个 `@` 前缀，因为它是一种特殊的语法，称为 [Angular 模板语法](/guide/templates)
- 对于仍在使用 `*ngFor` 的应用，请参阅 [NgFor 的 Angular 文档](/guide/directives/structural-directives)



### 1. 添加 `users` 属性 {#_1-add-the-users-property}

在 `App` 类中，添加一个名为 `users` 的属性，其中包含用户及其名字。

```ts
[
  {id: 0, name: 'Sarah'},
  {id: 1, name: 'Amy'},
  {id: 2, name: 'Rachel'},
  {id: 3, name: 'Jessica'},
  {id: 4, name: 'Poornima'},
];
```


### 2. 更新模板 {#_2-update-the-template}

使用 `@for` 模板语法更新模板，把每个用户名显示在一个 `p` 元素中。

```html
@for (user of users; track user.id) {
  <p>{{ user.name }}</p>
}
```

::: info 注意
`track` 是必需的，你可以使用 `id` 或其他某个唯一标识符。

:::




这类功能称为控制流。接下来，你将学习如何自定义组件以及如何与组件通信。顺便说一句，到目前为止你做得非常棒。
