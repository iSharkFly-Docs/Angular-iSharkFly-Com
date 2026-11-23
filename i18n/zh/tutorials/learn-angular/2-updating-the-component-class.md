# 更新组件类

在 Angular 中，组件（Component）的逻辑和行为定义在组件的 TypeScript 类中。

::: info 注意
在[基础知识指南中了解更多关于显示动态文本的内容](/essentials/templates#showing-dynamic-text)。

:::

在本练习中，你将学习如何更新组件类，以及如何使用[插值（Interpolation）](/guide/templates/binding#render-dynamic-text-with-text-interpolation)。

<hr />



### 1. 添加一个名为 `city` 的属性

通过向 `App` 类添加一个名为 `city` 的属性来更新组件类。

```ts
export class App {
  city = 'San Francisco';
}
```

`city` 属性的类型是 `string`，但由于 [TypeScript 中的类型推断](https://www.typescriptlang.org/docs/handbook/type-inference.html)，你可以省略类型声明。`city` 属性可以在 `App` 类中使用，也可以在组件模板中引用。

<br>

要在模板（Template）中使用类属性，你需要使用 `{{ }}` 语法。


### 2. 更新组件模板

更新 `template` 属性，使其与下面的 HTML 一致：

```ts
template: `Hello {{ city }}`,
```

这是插值的一个例子，它是 Angular 模板语法的一部分。它能做的远不止在模板中放入动态文本。你还可以用这种语法调用函数、编写表达式等。


### 3. 更多插值练习

试试这个：再添加一组 `{{ }}`，内容为 `1 + 1`：

```ts
template: `Hello {{ city }}, {{ 1 + 1 }}`,
```

Angular 会对 `{{ }}` 中的内容求值，并将结果渲染到模板中。




这只是 Angular 模板能力的冰山一角，继续学习来了解更多吧。
