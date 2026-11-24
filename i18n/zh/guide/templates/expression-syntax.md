# 表达式语法

Angular 表达式基于 JavaScript，但在一些关键方面有所不同。本指南介绍 Angular 表达式与标准 JavaScript 之间的异同。

## 值字面量

Angular 支持 JavaScript [字面量值](https://developer.mozilla.org/en-US/docs/Glossary/Literal)的一个子集。

### 支持的值字面量

| 字面量类型             | 示例值                          |
| ---------------------- | ------------------------------- |
| 字符串                 | `'Hello'`, `"World"`            |
| 布尔值                 | `true`, `false`                 |
| 数字                   | `123`, `3.14`                   |
| 对象                   | `{name: 'Alice'}`               |
| 数组                   | `['Onion', 'Cheese', 'Garlic']` |
| null                   | `null`                          |
| 正则表达式             | `/\d+/`                         |
| 模板字符串             | `` `Hello ${name}` ``           |
| 带标签的模板字符串     | `` tag`Hello ${name}` ``        |

### 不支持的值字面量

| 字面量类型   | 示例值         |
| ------------ | -------------- |
| BigInt       | `1n`           |

## 全局对象

Angular 表达式支持以下[全局对象](https://developer.mozilla.org/en-US/docs/Glossary/Global_object)：

- [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
- [$any](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any)

不支持其他任何 JavaScript 全局对象。常见的 JavaScript 全局对象包括 `Number`、`Boolean`、`NaN`、`Infinity`、`parseInt` 等。

## 局部变量

在特定上下文中，Angular 会自动提供一些特殊的局部变量，供表达式使用。这些特殊变量总是以美元符号（`$`）开头。

例如，`@for` 块提供了几个与循环信息相对应的局部变量，比如 `$index`。

## 支持哪些运算符？

### 支持的运算符

Angular 支持标准 JavaScript 中的以下运算符。

| 运算符                        | 示例                                           |
| ----------------------------- | ---------------------------------------------- |
| 加法 / 连接                   | `1 + 2`                                        |
| 减法                          | `52 - 3`                                       |
| 乘法                          | `41 * 6`                                       |
| 除法                          | `20 / 4`                                       |
| 取余（取模）                  | `17 % 5`                                       |
| 求幂                          | `10 ** 3`                                      |
| 圆括号                        | `9 * (8 + 4)`                                  |
| 条件（三元）                  | `a > b ? true : false`                         |
| 与（逻辑）                    | `&&`                                           |
| 或（逻辑）                    | `\|\|`                                         |
| 非（逻辑）                    | `!`                                            |
| 空值合并                      | `possiblyNullValue ?? 'default'`               |
| 比较运算符                    | `<`, `<=`, `>`, `>=`, `==`, `===`, `!==`, `!=` |
| 一元负号                      | `-x`                                           |
| 一元正号                      | `+y`                                           |
| 属性访问器                    | `person['name']`                               |
| typeof                        | `typeof 42`                                    |
| void                          | `void 1`                                       |
| in                            | `'model' in car`                               |
| instanceof                    | `car instanceof Automobile`                    |
| 赋值                          | `a = b`                                        |
| 自增                          | `a++`, `++a`                                   |
| 自减                          | `a--`, `--a`                                   |
| 加法赋值                      | `a += b`                                       |
| 减法赋值                      | `a -= b`                                       |
| 乘法赋值                      | `a *= b`                                       |
| 除法赋值                      | `a /= b`                                       |
| 取余赋值                      | `a %= b`                                       |
| 求幂赋值                      | `a **= b`                                      |
| 逻辑与赋值                    | `a &&= b`                                      |
| 逻辑或赋值                    | `a \|\|= b`                                    |
| 空值合并赋值                  | `a ??= b`                                      |
| 对象字面量中的展开            | `{...obj, foo: 'bar'}`                         |
| 数组字面量中的展开            | `[...arr, 1, 2, 3]`                            |
| 函数调用中的剩余参数          | `fn(...args)`                                  |
| 箭头函数                      | `items.filter((i) => i.active)`                |

::: info 注意
赋值运算符和自增 / 自减运算符只能用在[事件监听器语句](#event-listener-statements)中。在绑定（Binding）或插值（Interpolation）中使用它们会导致编译错误，除非它们位于箭头函数内部。

:::

箭头函数必须使用表达式体。不能在箭头函数内部使用管道（Pipe），但可以把箭头函数作为参数传给管道。

此外，Angular 表达式还支持以下非标准运算符：

| 运算符                          | 示例                           |
| ------------------------------- | ------------------------------ |
| [管道](/guide/templates/pipes)  | `{{ total \| currency }}`      |
| 可选链\*                        | `someObj.someProp?.nestedProp` |
| 非空断言（TypeScript）          | `someObj!.someProp`            |

### 安全导航迁移

在 Angular 22 之前，当左侧为 `null` 或 `undefined` 时，可选链运算符（`?.`）返回 `null`，而标准 JavaScript 的 `?.` 返回 `undefined`。
从 Angular 22 开始，Angular 表达式中可选链运算符的行为已与标准 JavaScript 保持一致。

在迁移到 v22 的过程中，`ng update` 原理图（Schematic）会给现有表达式加上 `$safeNavigationMigration` 函数，以保留之前的行为。

```html
{{ $safeNavigationMigration(foo?.bar) }}
```

`$safeNavigationMigration` **只是一个临时的迁移辅助工具**。它指示编译器使用旧的返回 `null` 的语义来编译被包裹的安全导航表达式，而不是使用标准 JavaScript 的 `?.` 语义。它并不是一个真正的函数，也不能在 TypeScript 中调用。

::: info 注意
建议迁移表达式，使其不再依赖 `null` 与 `undefined` 的区别，从而可以移除 `$safeNavigationMigration`。这个函数可能会在 Angular 的未来版本中被移除。

:::

### 不支持的运算符

| 运算符                | 示例                              |
| --------------------- | --------------------------------- |
| 所有位运算符          | `&`, `&=`, `~`, `\|=`, `^=`, etc. |
| 对象解构              | `const { name } = person`         |
| 数组解构              | `const [firstItem] = items`       |
| 逗号运算符            | `x = (x++, x)`                    |
| new                   | `new Car()`                       |

## 表达式的词法上下文

Angular 表达式在组件（Component）类的上下文中求值，同时也能访问相关的[模板变量（Template Variable）](/guide/templates/variables)、局部变量和全局对象。

引用组件类成员时，总是隐含 `this`。不过，如果模板声明了与某个成员同名的[模板变量](/guide/templates/variables)，该变量就会遮蔽这个成员。这时可以显式使用 `this.` 来明确引用该类成员。在创建遮蔽类成员的 `@let` 声明时（例如为了信号（Signal）类型收窄），这一点会很有用。

## 声明

一般来说，Angular 表达式不支持声明。这包括但不限于：

| 声明                              | 示例                                        |
| --------------------------------- | ------------------------------------------- |
| 变量                              | `let label = 'abc'`, `const item = 'apple'` |
| 函数                              | `function myCustomFunction() { }`           |
| 带块体的箭头函数                  | `() => { }`                                 |
| 类                                | `class Rectangle { }`                       |

## 事件监听器语句

事件处理器是**语句**而不是表达式。虽然它们支持与 Angular 表达式相同的所有语法，但有两个关键区别：

1. 语句**支持**赋值运算符（但不支持解构赋值）
1. 语句**不支持**管道
