# 创建自定义管道

你可以在 Angular 中创建自定义管道（Pipe），以满足你的数据转换需求。

::: info 注意
在[深入指南中了解更多关于创建自定义管道的内容](/guide/templates/pipes#creating-custom-pipes)。

:::

在本活动中，你将创建一个自定义管道，并在模板（Template）中使用它。

<hr>

管道是一个带有 `@Pipe` 装饰器的 TypeScript 类。示例如下：

```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'star',
})
export class StarPipe implements PipeTransform {
  transform(value: string): string {
    return `⭐️ ${value} ⭐️`;
  }
}
```

`StarPipe` 接收一个字符串值，并返回在其两侧加上星星的字符串。请注意：

- `@Pipe` 装饰器配置中的 name 就是在模板中使用的名称
- `transform` 函数是你编写逻辑的地方

好了，轮到你来试一试了——你将创建 `ReversePipe`：



### 1. 创建 `ReversePipe`

在 `reverse.pipe.ts` 中，为 `ReversePipe` 类添加 `@Pipe` 装饰器，并提供以下配置：

```ts
@Pipe({
  name: 'reverse'
})
```


### 2. 实现 `transform` 函数

现在 `ReversePipe` 类已经是一个管道了。更新 `transform` 函数，添加反转逻辑：

```ts
export class ReversePipe implements PipeTransform {
  transform(value: string): string {
    let reverse = '';

    for (let i = value.length - 1; i >= 0; i--) {
      reverse += value[i];
    }

    return reverse;
  }
}
```


### 3. 在模板中使用 `ReversePipe`

管道逻辑实现之后，最后一步就是在模板中使用它。在 `app.ts` 中把管道加入模板，并将其添加到组件（Component）的 imports 中：

```ts
@Component({
  ...
  template: `Reverse Machine: {{ word | reverse }}`,
  imports: [ReversePipe]
})
```




这样就大功告成了。恭喜你完成了本活动。现在你已经知道如何使用管道，甚至还能实现自己的自定义管道。
