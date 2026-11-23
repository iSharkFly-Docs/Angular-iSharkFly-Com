# 管道

管道（Pipe）是用于在模板（Template）中转换数据的函数。一般来说，管道是不会产生副作用的「纯」函数。Angular 内置了许多实用的管道，你可以导入它们并在组件（Component）中使用。你也可以创建自定义管道。

::: info 注意
在[深入指南中了解更多关于管道的内容](/guide/templates/pipes)。

:::

在本活动中，你将导入一个管道并在模板中使用它。

<hr>

要在模板中使用管道，请把它放在插值表达式中。看看这个示例：

```ts
import {UpperCasePipe} from '@angular/common';

@Component({
  ...
  template: `{{ loudMessage | uppercase }}`,
  imports: [UpperCasePipe],
})
export class App {
  loudMessage = 'we think you are doing great!'
}
```

现在轮到你来试一试了：



### 1. 导入 `LowerCase` 管道

首先，更新 `app.ts`，在文件级别添加从 `@angular/common` 导入 `LowerCasePipe` 的语句。

```ts
import {LowerCasePipe} from '@angular/common';
```


### 2. 把管道添加到模板的 imports 中

接下来，更新 `@Component()` 装饰器的 `imports`，加入对 `LowerCasePipe` 的引用

```ts
@Component({
  ...
  imports: [LowerCasePipe]
})
```


### 3. 在模板中添加管道

最后，在 `app.ts` 中更新模板，加入 `lowercase` 管道：

```html
template: `{{ username | lowercase }}`
```




管道还可以接收参数，用于配置其输出。在下一个活动中了解更多。

附言：你做得很棒 ⭐️
