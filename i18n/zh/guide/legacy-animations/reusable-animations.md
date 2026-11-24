# 可复用动画

::: warning 重要
`@angular/animations` 包现已弃用。Angular 团队建议所有新代码都使用原生 CSS 配合 `animate.enter` 和 `animate.leave` 来实现动画。请参阅新的进入与离开[动画指南](/guide/animations)了解更多信息。另请参阅[迁移出 Angular 的 Animations 包](/guide/animations/migration)，了解如何开始将应用迁移到纯 CSS 动画。

:::

本主题通过示例介绍如何创建可复用的动画（animation）。

## 创建可复用动画

要创建可复用动画，可以使用 [`animation()`](https://angular.dev/api/animations/animation) 函数在一个单独的 `.ts` 文件中定义动画，并把这个动画定义声明为 `const` 导出变量。
然后，你就可以在应用的组件（component）中导入这个动画，并通过 [`useAnimation()`](https://angular.dev/api/animations/useAnimation) 函数复用它。

```ts [animations.ts]
import {animation, style, animate, trigger, transition, useAnimation} from '@angular/animations';

export const transitionAnimation = animation([
  style({
    height: '{{ height }}',
    opacity: '{{ opacity }}',
    backgroundColor: '{{ backgroundColor }}',
  }),
  animate('{{ time }}'),
]);
```

在上面的代码片段中，`transitionAnimation` 被声明为导出变量，因而可以复用。

::: tip 提示
`height`、`opacity`、`backgroundColor` 和 `time` 这些输入会在运行时被替换。

:::

你也可以只导出动画的一部分。
例如，下面的代码片段导出了动画 `trigger`。

```ts [animations.ts]
import {animation, style, animate, trigger, transition, useAnimation} from '@angular/animations';
export const triggerAnimation = trigger('openClose', [
  transition('open => closed', [
    useAnimation(transitionAnimation, {
      params: {
        height: 0,
        opacity: 1,
        backgroundColor: 'red',
        time: '1s',
      },
    }),
  ]),
]);
```

此后，你就可以把这些可复用的动画变量导入组件类中。
例如，下面的代码片段导入了 `transitionAnimation` 变量，并通过 `useAnimation()` 函数使用它。

```ts [open-close.ts]
import {Component, input} from '@angular/core';
import {transition, trigger, useAnimation, AnimationEvent} from '@angular/animations';
import {transitionAnimation} from './animations';

@Component({
  selector: 'app-open-close-reusable',
  animations: [
    trigger('openClose', [
      transition('open => closed', [
        useAnimation(transitionAnimation, {
          params: {
            height: 0,
            opacity: 1,
            backgroundColor: 'red',
            time: '1s',
          },
        }),
      ]),
    ]),
  ],
  templateUrl: 'open-close.html',
  styleUrls: ['open-close.css'],
})
```

## 更多 Angular 动画相关内容

你可能还对以下内容感兴趣：

- [Angular 动画简介](/guide/legacy-animations)
- [过渡与触发器](/guide/legacy-animations/transition-and-triggers)
- [复杂动画序列](/guide/legacy-animations/complex-sequences)
- [路由过渡动画](/guide/routing/route-transition-animations)
- [迁移到原生 CSS 动画](/guide/animations/migration)

