# 模板中的空白字符 {#whitespace-in-templates}

默认情况下，Angular 模板（Template）不会保留框架认为不必要的空白字符。这通常出现在两种情况下：元素之间的空白字符，以及文本内部可折叠的空白字符。

## 元素之间的空白字符 {#whitespace-between-elements}

大多数开发者喜欢用换行和缩进来格式化模板，让模板更易读：

```html
<section>
  <h3>User profile</h3>
  <label>
    User name
    <input />
  </label>
</section>
```

这个模板的所有元素之间都包含空白字符。下面的代码片段展示了同一段 HTML，其中每个空白字符都被替换成了井号（`#`），以突出显示到底有多少空白字符：

<!-- prettier-ignore -->
```html
<!-- 空白字符总数：20 -->
<section>###<h3>User profile</h3>###<label>#####User name#####<input>###</label>#</section>
```

如果按照模板中所写的那样保留空白字符，就会产生许多不必要的[文本节点](https://developer.mozilla.org/en-US/docs/Web/API/Text)，并增加页面渲染的开销。通过忽略元素之间的这些空白字符，Angular 在页面上渲染模板时要做的工作更少，从而提升整体性能。

## 文本内部可折叠的空白字符 {#collapsible-whitespace-inside-text}

当 Web 浏览器在页面上渲染 HTML 时，会把多个连续的空白字符折叠成一个字符：

<!-- prettier-ignore -->
```html
<!-- 在模板中的样子 -->
<p>Hello         world</p>
```

在这个例子中，浏览器只会在 "Hello" 和 "world" 之间显示一个空格。

```html
<!-- 在浏览器中显示的样子 -->
<p>Hello world</p>
```

关于其工作原理的更多背景，请参阅 [HTML、CSS 和 DOM 如何处理空白字符](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace)。

Angular 在编译模板时会把这些不必要的空白字符折叠成一个字符，从一开始就避免把它们发送给浏览器。

## 保留空白字符 {#preserving-whitespace}

你可以在模板所属的 `@Component` 装饰器中指定 `preserveWhitespaces: true`，告诉 Angular 保留模板中的空白字符。

```ts
@Component({
  /* ... */,
  preserveWhitespaces: true,
  template: `
    <p>Hello         world</p>
  `
})
```

除非确有必要，否则请避免设置此选项。保留空白字符可能会导致 Angular 在渲染时生成明显更多的节点，从而拖慢应用。

你还可以使用 Angular 特有的一个特殊 HTML 实体 `&ngsp;`。这个实体会生成一个在编译输出中被保留下来的空格字符。
