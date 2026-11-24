# 根据语言环境格式化数据 {#format-data-based-on-locale}

Angular 提供了下列内置的数据转换[管道（Pipe）](/guide/templates/pipes)。
这些数据转换管道使用 [`LOCALE_ID`][ApiCoreLocaleId] 令牌，根据各个语言环境（locale）的规则来格式化数据。

| 数据转换管道                            | 详情                       |
| :-------------------------------------- | :------------------------- |
| [`DatePipe`][ApiCommonDatepipe]         | 格式化日期值。             |
| [`CurrencyPipe`][ApiCommonCurrencypipe] | 把数字转换为货币字符串。   |
| [`DecimalPipe`][ApiCommonDecimalpipe]   | 把数字转换为十进制数字符串。 |
| [`PercentPipe`][ApiCommonPercentpipe]   | 把数字转换为百分比字符串。 |

## 使用 DatePipe 显示当前日期 {#use-datepipe-to-display-the-current-date}

要以当前语言环境的格式显示当前日期，请对 `DatePipe` 使用下面的格式。

```html
{{ today | date }}
```

## 为 CurrencyPipe 覆盖当前语言环境 {#override-current-locale-for-currencypipe}

给管道添加 `locale` 参数，即可覆盖 `LOCALE_ID` 令牌的当前值。

要强制货币使用美式英语（`en-US`），请对 `CurrencyPipe` 使用下面的格式

```html
{{ amount | currency: 'USD' : 'symbol' : '1.2-2' : 'en-US' }}
```

::: tip 提示
为 `CurrencyPipe` 指定的语言环境会覆盖应用全局的 `LOCALE_ID` 令牌。

:::

## 下一步 {#what-s-next}

- [准备要翻译的组件](/guide/i18n/prepare)


[ApiCommonCurrencypipe]: api/common/CurrencyPipe 'CurrencyPipe | Common - API | Angular'
[ApiCommonDatepipe]: api/common/DatePipe 'DatePipe | Common - API | Angular'
[ApiCommonDecimalpipe]: api/common/DecimalPipe 'DecimalPipe | Common - API | Angular'
[ApiCommonPercentpipe]: api/common/PercentPipe 'PercentPipe | Common - API | Angular'
[ApiCoreLocaleId]: api/core/LOCALE_ID 'LOCALE_ID | Core - API | Angular'
