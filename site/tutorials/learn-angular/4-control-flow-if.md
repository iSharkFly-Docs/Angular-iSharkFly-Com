# 组件中的控制流 - `@if` {#control-flow-in-components-if}

决定在屏幕上向用户显示什么内容，是应用开发中的常见任务。很多时候，这种决定是通过条件以编程方式做出的。

为了在模板（Template）中表达条件显示，Angular 使用 `@if` 模板语法。

::: info 注意
在[基础知识指南中了解更多关于控制流的内容](/essentials/templates#control-flow-with-if-and-for)。

:::

在本练习中，你将学习如何在模板中使用条件语句。

<hr/>

在模板中实现元素条件显示的语法是 `@if`。

下面是在组件（Component）中使用 `@if` 语法的示例：

```ts
@Component({
  ...
  template: `
    @if (isLoggedIn) {
      <p>Welcome back, Friend!</p>
    }
  `,
})
export class App {
  isLoggedIn = true;
}
```

有两点需要注意：

- `if` 前面有一个 `@` 前缀，因为它是一种特殊的语法，称为 [Angular 模板语法](/guide/templates)
- 对于仍在使用 `*ngIf` 的应用，请参阅 [NgIf 的 Angular 文档](/guide/directives/structural-directives)了解更多信息。



### 1. 创建一个名为 `isServerRunning` 的属性 {#_1-create-a-property-called-isserverrunning}

在 `App` 类中，添加一个名为 `isServerRunning` 的 `boolean` 属性，并将初始值设为 `true`。


### 2. 在模板中使用 `@if` {#_2-use-if-in-the-template}

更新模板，当 `isServerRunning` 的值为 `true` 时显示消息 `Yes, the server is running`。


### 3. 在模板中使用 `@else` {#_3-use-else-in-the-template}

现在 Angular 支持使用原生模板语法 `@else` 来定义 else 分支。更新模板，在 else 分支中显示消息 `No, the server is not running`。

下面是一个示例：

```html
template: `
@if (isServerRunning) {
  ...
} @else {
  ...
}
`;
```

添加你的代码，补全缺失的标记。




这类功能称为条件控制流。接下来你将学习如何在模板中重复渲染条目。
