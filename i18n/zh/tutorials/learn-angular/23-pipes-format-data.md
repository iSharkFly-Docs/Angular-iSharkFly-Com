# 使用管道格式化数据

通过配置管道（Pipe），你可以更进一步地使用它们。可以通过向管道传递选项来配置它们。

::: info 注意
在[深入指南中了解更多关于使用管道格式化数据的内容](/guide/templates/pipes)。

:::

在本活动中，你将使用一些管道和管道参数。

<hr>

要向管道传递参数，请使用 `:` 语法，后面跟上参数值。示例如下：

```html
template: `{{ date | date: 'medium' }}`;
```

输出为 `Jun 15, 2015, 9:43:11 PM`。

现在来自定义一些管道的输出吧：



### 1. 使用 `DecimalPipe` 格式化数字

在 `app.ts` 中更新模板（Template），为 `decimal` 管道添加参数。

```html
template: ` ...
<li>Number with "decimal" {{ num | number: '3.2-2' }}</li>
`
```

::: info 注意
这是什么格式？`DecimalPipe` 的参数叫做 `digitsInfo`，该参数使用的格式为：`{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`

:::


### 2. 使用 `DatePipe` 格式化日期

现在，更新模板以使用 `date` 管道。

```html
template: ` ...
<li>Date with "date" {{ birthday | date: 'medium' }}</li>
`
```

想多点乐趣的话，可以试试给 `date` 传入不同的参数。更多信息请参阅 [Angular 文档](/guide/templates/pipes)。


### 3. 使用 `CurrencyPipe` 格式化货币

最后一项任务，更新模板以使用 `currency` 管道。

```html
template: ` ...
<li>Currency with "currency" {{ cost | currency }}</li>
`
```

你也可以试试给 `currency` 传入不同的参数。更多信息请参阅 [Angular 文档](/guide/templates/pipes)。




管道用得很棒。到目前为止你已经取得了很大的进步。

还有更多内置管道可以在应用中使用。你可以在 [Angular 文档](/guide/templates/pipes)中找到完整列表。

如果内置管道无法满足你的需求，你还可以创建自定义管道。请查看下一课了解更多。
