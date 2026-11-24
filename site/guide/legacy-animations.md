# Angular 动画简介 {#introduction-to-angular-animations}

::: warning 重要
`@angular/animations` 包现已弃用。Angular 团队建议所有新代码都使用原生 CSS 配合 `animate.enter` 和 `animate.leave` 来实现动画。请参阅新的进入与离开[动画指南](/guide/animations)了解更多信息。另请参阅[迁移出 Angular 的 Animations 包](/guide/animations/migration)，了解如何开始将应用迁移到纯 CSS 动画。

:::

动画（animation）营造出运动的错觉：HTML 元素的样式随时间而变化。
精心设计的动画可以让应用更直观、更吸引人，但它们的作用不仅仅是装饰。
动画可以从多个方面改进你的应用和用户体验：

- 没有动画时，网页的过渡会显得突兀、生硬
- 运动能极大地提升用户体验，因此动画让用户有机会感知应用对其操作的响应
- 好的动画能直观地把用户的注意力引向需要关注的地方

通常，动画会随时间对样式进行多次*变换*。
HTML 元素可以移动、改变颜色、放大或缩小、淡出，或者滑出页面。
这些变化可以同时发生，也可以依次发生。你可以控制每次变换的时间。

Angular 的动画系统构建在 CSS 功能之上，这意味着你可以为浏览器认为可动画的任何属性添加动画。
这包括位置、尺寸、变换、颜色、边框等等。
W3C 在其 [CSS Transitions](https://www.w3.org/TR/css-transitions-1) 页面上维护了一份可动画属性的列表。

## 关于本指南 {#about-this-guide}

本指南介绍 Angular 动画的基本特性，帮助你开始在项目中添加 Angular 动画。

## 快速上手 {#getting-started}

Angular 中用于动画的主要模块是 `@angular/animations` 和 `@angular/platform-browser`。

要开始在项目中添加 Angular 动画，请在导入标准 Angular 功能的同时导入动画专用的模块。


### 1. 启用动画模块 {#_1-enabling-the-animations-module}

从 `@angular/platform-browser/animations/async` 导入 `provideAnimationsAsync`，并把它添加到 `bootstrapApplication` 函数调用的提供者（provider）列表中。

```ts [Enabling Animations]
bootstrapApplication(AppComponent, {
  providers: [provideAnimationsAsync()],
});
```

::: warning 如果你的应用需要立即播放动画
如果你需要在应用加载时立即播放某个动画，
就应该改用立即加载（eagerly loaded）的动画模块。请从 `@angular/platform-browser/animations`
导入 `provideAnimations`，并在 `bootstrapApplication` 函数调用中用 `provideAnimations` **替代**
`provideAnimationsAsync`。
:::

对于基于 `NgModule` 的应用，请导入 `BrowserAnimationsModule`，它会把动画能力引入到 Angular 应用的根模块中。

```ts [app.module.ts]
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule],
  declarations: [],
  bootstrap: [],
})
export class AppModule {}
```

### 2. 把动画函数导入组件文件 {#_2-importing-animation-functions-into-component-files}

如果你打算在组件（component）文件中使用特定的动画函数，请从 `@angular/animations` 导入这些函数。

```ts [app.ts]
import {Component, HostBinding, inject} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';
```

请参阅本指南末尾列出的所有[可用动画函数](/guide/legacy-animations#animations-api-summary)。

### 3. 添加动画元数据属性 {#_3-adding-the-animation-metadata-property}

在组件文件中，在 `@Component()` 装饰器里添加一个名为 `animations:` 的元数据属性。
用于定义动画的触发器（trigger）就放在 `animations` 元数据属性中。

```ts [app.ts]
@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['app.css'],
  imports: [RouterLink, RouterOutlet],
  animations: [
    // 动画触发器放在这里
  ],
})
```



## 为过渡添加动画 {#animating-a-transition}

我们来为一个过渡（transition）添加动画，让单个 HTML 元素从一种状态变为另一种状态。
例如，你可以指定一个按钮根据用户的上一次操作显示 **Open** 或 **Closed**。
按钮处于 `open` 状态时，它是可见的，颜色为黄色。
处于 `closed` 状态时，它是半透明的，颜色为蓝色。

在 HTML 中，这些样式是通过普通的 CSS 样式（例如颜色和不透明度）来设置的。
在 Angular 中，使用 `style()` 函数来指定一组供动画使用的 CSS 样式。
把一组样式收集到一个动画状态中，并为该状态命名，例如 `open` 或 `closed`。

::: tip 提示
我们来创建一个新的 `open-close` 组件，用简单的过渡为它添加动画。

:::

在终端中运行以下命令来生成该组件：

```shell
ng g component open-close
```

这会在 `src/app/open-close.ts` 创建该组件。

### 动画状态和样式 {#animation-state-and-styles}

使用 Angular 的 [`state()`](https://angular.dev/api/animations/state) 函数来定义在每次过渡结束时要调用的不同状态。
这个函数接受两个参数：
一个唯一的名称（如 `open` 或 `closed`）和一个 `style()` 函数。

使用 `style()` 函数来定义与给定状态名称相关联的一组样式。
对于包含连字符的样式属性，必须使用*驼峰式（camelCase）*写法，例如 `backgroundColor`，或者用引号把它括起来，例如 `'background-color'`。

我们来看看 Angular 的 [`state()`](https://angular.dev/api/animations/state) 函数如何与 `style⁣­(⁠)` 函数配合来设置 CSS 样式属性。
在这段代码中，同时为该状态设置了多个样式属性。
在 `open` 状态下，按钮的高度为 200 像素，不透明度为 1，背景色为黄色。

```ts [open-close.ts]
// ...
state(
  'open',
  style({
    height: '200px',
    opacity: 1,
    backgroundColor: 'yellow',
  }),
),
```

在下面的 `closed` 状态中，按钮的高度为 100 像素，不透明度为 0.8，背景色为蓝色。

```ts [open-close.ts]
state(
  'closed',
  style({
    height: '100px',
    opacity: 0.8,
    backgroundColor: 'blue',
  }),
),
```

### 过渡与时间 {#transitions-and-timing}

在 Angular 中，你可以不使用任何动画就设置多个样式。
但如果不做进一步处理，按钮会瞬间变换，没有淡入淡出、没有收缩，也没有其他能表明正在发生变化的视觉提示。

为了让变化不那么突兀，你需要定义一个动画*过渡*，指定在一段时间内从一种状态到另一种状态所发生的变化。
`transition()` 函数接受两个参数：
第一个参数接受一个表达式，用于定义两个过渡状态之间的方向；第二个参数接受一个或一系列 `animate()` 步骤。

使用 `animate()` 函数来定义过渡的时长、延迟和缓动，并指定在过渡进行期间用于定义样式的 style 函数。
使用 `animate()` 函数为多步动画定义 `keyframes()` 函数。
这些定义放在 `animate()` 函数的第二个参数中。

#### 动画元数据：时长、延迟和缓动 {#animation-metadata-duration-delay-and-easing}

`animate()` 函数（transition 函数的第二个参数）接受 `timings` 和 `styles` 两个输入参数。

`timings` 参数可以是一个数字，也可以是由三部分组成的字符串。

```ts
animate(duration);
```

或

```ts
animate('duration delay easing');
```

第一部分 `duration` 是必需的。
时长可以表示为不带引号的数字（单位为毫秒），也可以表示为带引号且带时间单位的秒数。
例如，十分之一秒的时长可以这样表示：

- 用普通数字表示，单位为毫秒：
  `100`

- 用字符串表示，单位为毫秒：
  `'100ms'`

- 用字符串表示，单位为秒：
  `'0.1s'`

第二个参数 `delay` 的语法与 `duration` 相同。
例如：

- 等待 100ms，然后运行 200ms：`'0.2s 100ms'`

第三个参数 `easing` 控制动画在运行期间如何[加速和减速](https://easings.net)。
例如，`ease-in` 会让动画开始时较慢，然后随着进行逐渐加速。

- 等待 100ms，运行 200ms。
  使用减速曲线，开始时较快，然后逐渐减速直到静止：
  `'0.2s 100ms ease-out'`

- 运行 200ms，没有延迟。
  使用标准曲线，开始时较慢，在中间加速，然后在结尾逐渐减速：
  `'0.2s ease-in-out'`

- 立即开始，运行 200ms。
  使用加速曲线，开始时较慢，结束时达到全速：
  `'0.2s ease-in'`

::: tip 提示
有关缓动曲线的一般信息，请参阅 Material Design 网站上的[自然缓动曲线](https://material.io/design/motion/speed.html#easing)主题。

:::

这个示例提供了从 `open` 到 `closed` 的状态过渡，两个状态之间的过渡时长为 1 秒。

```ts [open-close.ts]
transition('open => closed', [animate('1s')]),
```

在上面的代码中，`=>` 运算符表示单向过渡，而 `<=>` 表示双向过渡。
在过渡中，`animate()` 指定过渡需要多长时间。
在本例中，从 `open` 到 `closed` 的状态变化耗时 1 秒，这里表示为 `1s`。

这个示例添加了从 `closed` 状态到 `open` 状态的过渡，过渡动画时长为 0.5 秒。

```ts [open-close.ts]
transition('closed => open', [animate('0.5s')]),
```

::: tip 提示
下面是关于在 [`state`](https://angular.dev/api/animations/state) 和 `transition` 函数中使用样式的一些补充说明。

:::

- 使用 [`state()`](https://angular.dev/api/animations/state) 定义在每次过渡结束时应用的样式，这些样式在动画完成后仍会保留
- 使用 `transition()` 定义中间样式，它们会在动画期间营造出运动的错觉
- 禁用动画时，可以跳过 `transition()` 的样式，但不能跳过 [`state()`](https://angular.dev/api/animations/state) 的样式
- 可以在同一个 `transition()` 参数中包含多个状态对：

  ```ts
  transition('on => off, off => void');
  ```

### 触发动画 {#triggering-the-animation}

动画需要一个*触发器*，以便知道何时开始。
`trigger()` 函数会收集状态和过渡，并为动画命名，这样你就可以在 HTML 模板（template）中把它附加到触发元素上。

`trigger()` 函数描述了要监视其变化的属性名。
当发生变化时，触发器会启动其定义中包含的动作。
这些动作可以是过渡，也可以是其他函数，我们稍后会看到。

在这个示例中，我们把触发器命名为 `openClose`，并把它附加到 `button` 元素上。
该触发器描述了 open 和 closed 两种状态，以及两个过渡的时间设置。

::: tip 提示
在每个 `trigger()` 函数调用中，一个元素在任意时刻只能处于一种状态。
不过，多个触发器可以同时处于活动状态。

:::

### 定义动画并把它们附加到 HTML 模板 {#defining-animations-and-attaching-them-to-the-html-template}

动画定义在控制待动画 HTML 元素的组件的元数据中。
把定义动画的代码放在 `@Component()` 装饰器的 `animations:` 属性下。

```ts [open-close.ts]
@Component({
  selector: 'app-open-close',
  animations: [
    trigger('openClose', [
      // ...
      state(
        'open',
        style({
          height: '200px',
          opacity: 1,
          backgroundColor: 'yellow',
        }),
      ),
      state(
        'closed',
        style({
          height: '100px',
          opacity: 0.8,
          backgroundColor: 'blue',
        }),
      ),
      transition('open => closed', [animate('1s')]),
      transition('closed => open', [animate('0.5s')]),
    ]),
  ],
  templateUrl: 'open-close.html',
  styleUrls: ['open-close.css'],
})
export class OpenClose {
  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }

}
```

为组件定义好动画触发器后，要把它附加到该组件模板中的某个元素上，方法是把触发器名称放在方括号中，并在前面加上 `@` 符号。
然后，你可以使用标准的 Angular 属性绑定（property binding）语法把触发器绑定到模板表达式，如下所示，其中 `triggerName` 是触发器的名称，`expression` 的求值结果是一个已定义的动画状态。

```html
<div [@triggerName]="expression">…</div>
```

当表达式的值变为新状态时，动画就会执行，也就是被触发。

下面的代码把触发器绑定到 `isOpen` 属性的值上。

```html [open-close.html]
<nav>
  <button type="button" (click)="toggle()">Toggle Open/Close</button>
</nav>

<div [@openClose]="isOpen ? 'open' : 'closed'" class="open-close-container">
  <p>The box is now {{ isOpen ? 'Open' : 'Closed' }}!</p>
</div>
```

在这个示例中，当 `isOpen` 表达式的求值结果为已定义的 `open` 或 `closed` 状态时，它会把状态变化通知给触发器 `openClose`。
接下来由 `openClose` 的代码处理状态变化，并启动状态变化动画。

对于进入或离开页面的元素（即插入 DOM 或从 DOM 中移除的元素），你可以让动画有条件地执行。
例如，在 HTML 模板中把 `*ngIf` 与动画触发器一起使用。

::: tip 提示
在组件文件中，把定义动画的触发器设置为 `@Component()` 装饰器中 `animations:` 属性的值。

:::

在 HTML 模板文件中，使用触发器名称把已定义的动画附加到要添加动画的 HTML 元素上。

### 代码回顾 {#code-review}

下面是过渡示例中讨论过的代码文件。

::: code-group

```ts [open-close.ts]
@Component({
  selector: 'app-open-close',
  animations: [
    trigger('openClose', [
      // ...
      state(
        'open',
        style({
          height: '200px',
          opacity: 1,
          backgroundColor: 'yellow',
        }),
      ),
      state(
        'closed',
        style({
          height: '100px',
          opacity: 0.8,
          backgroundColor: 'blue',
        }),
      ),
      transition('open => closed', [animate('1s')]),
      transition('closed => open', [animate('0.5s')]),
    ]),
  ],
  templateUrl: 'open-close.html',
  styleUrls: ['open-close.css'],
})
export class OpenClose {
  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }

}
```

```html [open-close.html]
<nav>
  <button type="button" (click)="toggle()">Toggle Open/Close</button>
</nav>

<div [@openClose]="isOpen ? 'open' : 'closed'" class="open-close-container">
  <p>The box is now {{ isOpen ? 'Open' : 'Closed' }}!</p>
</div>
```

```css [open-close.css]
:host {
  display: block;
  margin-top: 1rem;
}

.open-close-container {
  border: 1px solid #dddddd;
  margin-top: 1em;
  padding: 20px 20px 0px 20px;
  color: #000000;
  font-weight: bold;
  font-size: 20px;
}
```

:::

### 小结 {#summary}

你已经学会了使用 `style()` 和 [`state()`](https://angular.dev/api/animations/state)，并配合用于设置时间的 `animate()`，为两个状态之间的过渡添加动画。

要了解 Angular 动画的更多高级特性，请参阅「动画」部分，可以从[过渡与触发器](/guide/legacy-animations/transition-and-triggers)中的高级技巧开始。

## 动画 API 汇总 {#animations-api-summary}

`@angular/animations` 模块提供的函数式 API 提供了一种领域特定语言（DSL），用于在 Angular 应用中创建和控制动画。
有关核心函数及相关数据结构的完整列表和语法细节，请参阅 [API 参考](/api?package=angular_animations&status=8)。

| 函数名                            | 作用                                                                                                                                                                                                        |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger()`                       | 启动动画，并作为所有其他动画函数调用的容器。HTML 模板绑定到 `triggerName`。用第一个参数声明一个唯一的触发器名称。使用数组语法。 |
| `style()`                         | 定义一个或多个在动画中使用的 CSS 样式。控制 HTML 元素在动画期间的视觉外观。使用对象语法。                                                                 |
| [`state()`](https://angular.dev/api/animations/state) | 创建一组具名的 CSS 样式，在成功过渡到给定状态时应用。之后可以在其他动画函数中按名称引用该状态。                              |
| `animate()`                       | 指定过渡的时间信息。`delay` 和 `easing` 为可选值。内部可以包含 `style()` 调用。                                                                            |
| `transition()`                    | 定义两个具名状态之间的动画序列。使用数组语法。                                                                                                                                 |
| `keyframes()`                     | 允许在指定的时间间隔内按顺序在样式之间变化。在 `animate()` 中使用。每个 `keyframe()` 中可以包含多个 `style()` 调用。使用数组语法。                       |
| [`group()`](https://angular.dev/api/animations/group) | 指定一组要并行运行的动画步骤（*内部动画*）。只有在所有内部动画步骤都完成后，动画才会继续。在 `sequence()` 或 `transition()` 中使用。     |
| `query()`                         | 在当前元素中查找一个或多个内部 HTML 元素。                                                                                                                                           |
| `sequence()`                      | 指定一个依次逐个运行的动画步骤列表。                                                                                                                                  |
| `stagger()`                       | 为多个元素的动画错开开始时间。                                                                                                                                            |
| `animation()`                     | 生成一个可在其他地方调用的可复用动画。与 `useAnimation()` 一起使用。                                                                                                      |
| `useAnimation()`                  | 激活一个可复用动画。与 `animation()` 一起使用。                                                                                                                                                    |
| `animateChild()`                  | 允许子组件上的动画与父组件在同一时间段内运行。                                                                                                                    |


## 更多 Angular 动画相关内容 {#more-on-angular-animations}

::: tip 提示
请观看 2017 年 11 月在 AngularConnect 大会上展示的这个[演讲](https://www.youtube.com/watch?v=rnTK9meY5us)，以及配套的[源代码](https://github.com/matsko/animationsftw.in)。

:::

你可能还会对以下内容感兴趣：

- [过渡与触发器](/guide/legacy-animations/transition-and-triggers)
- [复杂动画序列](/guide/legacy-animations/complex-sequences)
- [可复用动画](/guide/legacy-animations/reusable-animations)
- [路由过渡动画](/guide/routing/route-transition-animations)
- [迁移到原生 CSS 动画](/guide/animations/migration)

