# 管道

## 概览

管道（Pipe）是 Angular 模板表达式中的特殊运算符，让你可以在模板中以声明式的方式转换数据。借助管道，你只需声明一次转换函数，就能在多个模板中使用这个转换。Angular 管道使用竖线字符（`|`），其灵感来自 [Unix 管道](<https://en.wikipedia.org/wiki/Pipeline_(Unix)>)。

::: info 注意
Angular 的管道语法与标准 JavaScript 不同，在标准 JavaScript 中，竖线字符用作[按位或运算符](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR)。Angular 模板表达式不支持按位运算符。

:::

下面是一个使用 Angular 提供的几个内置管道的示例：

```ts
import {Component} from '@angular/core';
import {CurrencyPipe, DatePipe, TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe],
  template: `
    <main>
      <!-- 把公司名称转换为首字母大写形式，
       并把 purchasedOn 日期转换为按区域格式化的字符串 -->
      <h1>Purchases from {{ company | titlecase }} on {{ purchasedOn | date }}</h1>

      <!-- 把金额转换为货币格式的字符串 -->
      <p>Total: {{ amount | currency }}</p>
    </main>
  `,
})
export class ShoppingCart {
  amount = 123.45;
  company = 'acme corporation';
  purchasedOn = '2024-07-08';
}
```

Angular 渲染该组件（Component）时，会确保日期格式和货币符合用户所在的区域（locale）。如果用户在美国，渲染结果会是：

```html
<main>
  <h1>Purchases from Acme Corporation on Jul 8, 2024</h1>
  <p>Total: $123.45</p>
</main>
```

要进一步了解 Angular 如何对值进行本地化，请参阅 [i18n 深入指南](/guide/i18n)。

### 内置管道

Angular 在 `@angular/common` 包中提供了一组内置管道：

| 名称                                          | 说明                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`AsyncPipe`](https://angular.dev/api/common/AsyncPipe)           | 从 `Promise` 或 RxJS `Observable` 中读取值。                                      |
| [`CurrencyPipe`](https://angular.dev/api/common/CurrencyPipe)     | 把数字转换为按区域规则格式化的货币字符串。                |
| [`DatePipe`](https://angular.dev/api/common/DatePipe)             | 按区域规则格式化 `Date` 值。                                             |
| [`DecimalPipe`](https://angular.dev/api/common/DecimalPipe)       | 把数字转换为带小数点、按区域规则格式化的字符串。  |
| [`I18nPluralPipe`](https://angular.dev/api/common/I18nPluralPipe) | 把值映射为按区域规则进行复数化的字符串。                 |
| [`I18nSelectPipe`](https://angular.dev/api/common/I18nSelectPipe) | 把键映射到一个自定义选择器，返回所需的值。                                 |
| [`JsonPipe`](https://angular.dev/api/common/JsonPipe)             | 通过 `JSON.stringify` 把对象转换为字符串表示，用于调试。 |
| [`KeyValuePipe`](https://angular.dev/api/common/KeyValuePipe)     | 把 Object 或 Map 转换为键值对数组。                                    |
| [`LowerCasePipe`](https://angular.dev/api/common/LowerCasePipe)   | 把文本全部转换为小写。                                                            |
| [`PercentPipe`](https://angular.dev/api/common/PercentPipe)       | 把数字转换为按区域规则格式化的百分比字符串。              |
| [`SlicePipe`](https://angular.dev/api/common/SlicePipe)           | 创建一个包含元素子集（切片）的新数组或字符串。                    |
| [`TitleCasePipe`](https://angular.dev/api/common/TitleCasePipe)   | 把文本转换为首字母大写形式。                                                                |
| [`UpperCasePipe`](https://angular.dev/api/common/UpperCasePipe)   | 把文本全部转换为大写。                                                            |

## 使用管道

Angular 的管道运算符在模板表达式中使用竖线字符（`|`）。管道运算符是一个二元运算符：左侧操作数是传给转换函数的值，右侧操作数是管道的名称以及任何附加参数（见下文）。

```html
<p>Total: {{ amount | currency }}</p>
```

在这个示例中，`amount` 的值被传入 `CurrencyPipe`，该管道的名称是 `currency`。然后它会按用户所在区域的默认货币进行渲染。

### 在同一个表达式中组合多个管道

你可以使用多个管道运算符，对一个值应用多个转换。Angular 会从左到右依次运行这些管道。

下面的示例组合使用多个管道，以全大写形式显示本地化日期：

```html
<p>The event will occur on {{ scheduledOn | date | uppercase }}.</p>
```

### 向管道传递参数

有些管道接受参数来配置转换。要指定参数，在管道名称后加上冒号（`:`），再跟上参数值。

例如，`DatePipe` 可以接受参数，按特定方式格式化日期。

```html
<p>The event will occur at {{ scheduledOn | date: 'hh:mm' }}.</p>
```

有些管道可以接受多个参数。你可以用冒号字符（`:`）分隔，指定更多参数值。

例如，我们还可以传入第二个可选参数来控制时区。

```html
<p>The event will occur at {{ scheduledOn | date: 'hh:mm' : 'UTC' }}.</p>
```

## 管道是如何工作的

从概念上讲，管道就是接受一个输入值并返回转换后的值的函数。

```ts
import {Component} from '@angular/core';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe],
  template: `
    <main>
      <p>Total: {{ amount | currency }}</p>
    </main>
  `,
})
export class AppComponent {
  amount = 123.45;
}
```

在这个示例中：

1. 从 `@angular/common` 中导入 `CurrencyPipe`
1. 把 `CurrencyPipe` 添加到 `imports` 数组中
1. 把 `amount` 数据传给 `currency` 管道

### 管道运算符的优先级

管道运算符的优先级低于其他二元运算符，包括 `+`、`-`、`*`、`/`、`%`、`&&`、`||` 和 `??`。

```html
<!-- firstName 和 lastName 会先拼接，然后再把结果传给 uppercase 管道 -->
{{ firstName + lastName | uppercase }}
```

管道运算符的优先级高于条件（三元）运算符。

```html
{{ (isAdmin ? 'Access granted' : 'Access denied') | uppercase }}
```

如果同样的表达式不加括号：

<!-- prettier-ignore -->
```html
{{ isAdmin ? 'Access granted' : 'Access denied' | uppercase }}
```

它会被解析为：

```html
{{ isAdmin ? 'Access granted' : ('Access denied' | uppercase) }}
```

当运算符优先级可能产生歧义时，请始终在表达式中使用括号。

### 管道的变更检测

默认情况下，所有管道都被视为 `pure`（纯管道），也就是说，只有当原始类型的输入值（如 `String`、`Number`、`Boolean` 或 `Symbol`）或对象引用（如 `Array`、`Object`、`Function` 或 `Date`）发生变化时，它们才会执行。纯管道具有性能优势，因为如果传入的值没有变化，Angular 就可以避免调用转换函数。

因此，这意味着对对象属性或数组元素的修改不会被检测到，除非整个对象或数组引用被替换为另一个实例。如果你需要这种程度的变更检测（Change Detection），请参阅[检测数组或对象内部的变化](#detecting-change-within-arrays-or-objects)。

## 创建自定义管道

你可以实现一个带有 `@Pipe` 装饰器的 TypeScript 类，来定义自定义管道。管道必须具备两样东西：

- 一个名称，在管道装饰器中指定
- 一个名为 `transform` 的方法，用于执行值的转换。

此外，这个 TypeScript 类还应该实现 `PipeTransform` 接口，以确保它满足管道的类型签名。

下面是一个把字符串转换为 kebab case 的自定义管道示例：

```ts [kebab-case.pipe.ts]
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'kebabCase',
})
export class KebabCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase().replace(/ /g, '-');
  }
}
```

### 使用 `@Pipe` 装饰器

创建自定义管道时，从 `@angular/core` 包中导入 `Pipe`，并把它用作 TypeScript 类的装饰器。

```ts
import {Pipe} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe {}
```

`@Pipe` 装饰器需要一个 `name`，它决定了管道在模板中的使用方式。

### 自定义管道的命名约定

自定义管道的命名约定包括两部分：

- `name`：推荐使用 camelCase。不要使用连字符。
- `class name`：`name` 的 PascalCase 形式，并在末尾加上 `Pipe`

### 实现 `PipeTransform` 接口

除了 `@Pipe` 装饰器之外，自定义管道还应该始终实现 `@angular/core` 中的 `PipeTransform` 接口。

```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {}
```

实现这个接口可以确保你的管道类具有正确的结构。

### 转换管道的值

每次转换都通过 `transform` 方法调用，它的第一个参数是传入的值，返回值是转换后的值。

```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {
  transform(value: string): string {
    return `My custom transformation of ${value}.`;
  }
}
```

### 为自定义管道添加参数

你可以给 `transform` 方法添加更多参数，从而为转换添加参数：

```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {
  transform(value: string, format: string): string {
    let msg = `My custom transformation of ${value}.`;

    if (format === 'uppercase') {
      return msg.toUpperCase();
    } else {
      return msg;
    }
  }
}
```

### 检测数组或对象内部的变化

如果希望管道能检测数组或对象内部的变化，就必须把 `pure` 标志设为 `false`，将其标记为非纯函数。

::: warning 重要
除非绝对必要，否则不要创建非纯管道，因为如果使用不慎，它们可能带来显著的性能损失。

:::

```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'joinNamesImpure',
  pure: false,
})
export class JoinNamesImpurePipe implements PipeTransform {
  transform(names: string[]): string {
    return names.join();
  }
}
```

Angular 开发者通常会遵循一个约定：在管道的 `name` 和类名中包含 `Impure`，以提醒其他开发者这里存在潜在的性能隐患。

## 在模板之外使用管道逻辑

管道是模板运算符，旨在模板中以声明式的方式转换数据。当你需要在服务（Service）、工具类或其他非模板上下文中使用相同的转换逻辑时，**不要注入管道类**。管道并不是为可注入服务而设计的。

### 从自定义管道中提取逻辑

创建自定义管道时，把转换逻辑提取到一个独立的函数中。让管道的 `transform()` 方法委托给这个函数，在其他需要的地方直接导入这个函数。

```ts [kebab-case.ts]
export function toKebabCase(value: string): string {
  return value.toLowerCase().replace(/ /g, '-');
}
```

```ts [kebab-case.pipe.ts]
import {Pipe, PipeTransform} from '@angular/core';
import {toKebabCase} from './kebab-case';

@Pipe({name: 'kebabCase'})
export class KebabCasePipe implements PipeTransform {
  transform(value: string): string {
    return toKebabCase(value);
  }
}
```

```ts [formatter.service.ts]
import {Service} from '@angular/core';
import {toKebabCase} from './kebab-case';

@Service()
export class FormatterService {
  formatSlug(title: string): string {
    return toKebabCase(title);
  }
}
```

```ts [formatter.service.ts]
import {inject, Service} from '@angular/core';
import {KebabCasePipe} from './kebab-case.pipe';

@Service()
export class FormatterService {
  // 避免把管道类注入到服务或其他类中。
  private kebabCasePipe = inject(KebabCasePipe);

  formatSlug(title: string): string {
    return this.kebabCasePipe.transform(title);
  }
}
```

### 为内置管道使用格式化函数

Angular 内置的那些支持区域设置的管道，在 `@angular/common` 中都导出了对应的独立格式化函数。请使用这些函数，而不是注入管道类。

| 管道           | 独立函数 |
| -------------- | ------------------- |
| `DatePipe`     | `formatDate`        |
| `CurrencyPipe` | `formatCurrency`    |
| `DecimalPipe`  | `formatNumber`      |
| `PercentPipe`  | `formatPercent`     |

```ts
import {Service, LOCALE_ID, inject} from '@angular/core';
import {formatNumber} from '@angular/common';

@Service()
export class PriceService {
  private locale = inject(LOCALE_ID);

  format(value: number) {
    return formatNumber(value, this.locale, '1.2-2');
  }
}
```

```ts
import {inject, Service} from '@angular/core';
import {DecimalPipe} from '@angular/common';

@Service()
export class PriceService {
  private decimalPipe = inject(DecimalPipe);

  format(value: number) {
    return this.decimalPipe.transform(value, '1.2-2');
  }
}
```
