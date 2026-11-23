# 组件输入属性 {#component-input-properties}

有时在应用开发中，你需要把数据传入组件（Component）。这些数据可以用来定制组件，或者把信息从父组件传递给子组件。

Angular 使用一个叫做 `input` 的概念，它类似于其他框架中的 `props`。要创建 `input` 属性，请使用 `input()` 函数。

::: info 注意
在[输入指南中了解更多关于通过输入属性接收数据的内容](/guide/components/inputs)。

:::

在本练习中，你将学习如何使用 `input()` 函数向组件传递信息。

<hr>

要创建 `input` 属性，请使用 `input()` 函数来初始化组件类的某个属性：

```ts [user.ts]
class User {
  occupation = input<string>();
}
```

当你准备通过 `input` 传入值时，可以在模板（Template）中使用 Attribute 语法来设置值。下面是一个示例：

```ts [app.ts]
@Component({
  ...
  template: `<app-user occupation="Angular Developer"></app-user>`
})
export class App {}
```

`input` 函数返回一个 `InputSignal`。你可以通过调用该信号（Signal）来读取它的值。

```ts [user.ts]
@Component({
  ...
  template: `<p>The user's occupation is {{occupation()}}</p>`
})
```



### 1. 定义一个 `input()` 属性 {#_1-define-an-input-property}

更新 `user.ts` 中的代码，在 `User` 上定义一个名为 `name` 的 `input` 属性，并指定其类型为 `string`。目前先不要设置初始值，调用 `input()` 时不传参数。一定要更新模板，在句子末尾调用并插值显示 `name` 属性。


### 2. 向 `input` 属性传值 {#_2-pass-a-value-to-the-input-property}

更新 `app.ts` 中的代码，传入 `name` 属性，其值为 `"Simran"`。
<br>

代码更新成功后，应用将显示 `The user's name is Simran`。




这很棒，但这只是组件通信的一个方向。如果你想把信息和数据从子组件发送给父组件呢？请查看下一课来一探究竟。

附言：你做得很棒，继续加油 🎉
