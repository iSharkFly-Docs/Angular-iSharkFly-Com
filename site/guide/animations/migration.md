# 从 Angular 动画包迁移 {#migrating-away-from-angular-s-animations-package}

`@angular/animations` 包自 v20.2 起已被弃用，该版本同时引入了新的 `animate.enter` 和 `animate.leave` 特性，用于为应用添加动画（animation）。借助这些新特性，你可以用纯 CSS 或 JS 动画库替换所有基于 `@angular/animations` 的动画。从应用中移除 `@angular/animations` 可以显著减小 JavaScript 包（bundle）的体积。原生 CSS 动画通常性能更好，因为它们可以利用硬件加速。本指南将带你把代码从 `@angular/animations` 重构为原生 CSS 动画。

## 如何用原生 CSS 编写动画 {#how-to-write-animations-in-native-css}

如果你从未写过原生 CSS 动画，有很多优秀的指南可以帮你入门。下面列出其中几篇：
[MDN 的 CSS 动画指南](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
[W3Schools 的 CSS3 动画指南](https://www.w3schools.com/css/css3_animations.asp)
[完整的 CSS 动画教程](https://www.lambdatest.com/blog/css-animations-tutorial/)
[面向初学者的 CSS 动画](https://thoughtbot.com/blog/css-animation-for-beginners)

以及几个视频：
[9 分钟学会 CSS 动画](https://www.youtube.com/watch?v=z2LQYsZhsFw)
[Net Ninja 的 CSS 动画教程播放列表](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

看完其中一些指南和教程后，再回到本指南。

## 创建可复用的动画 {#creating-reusable-animations}

和动画包一样，你也可以创建可在整个应用中共享的可复用动画。在动画包中，你需要在一个共享的 TypeScript 文件里使用 `animation()` 函数来实现。原生 CSS 的做法与之类似，只是放在一个共享的 CSS 文件中。

#### 使用动画包 {#with-animations-package}

```ts [animations.ts]
export const sharedAnimation = animation([
  style({
    height: 0,
    opacity: 1,
    backgroundColor: 'red',
  }),
  animate('1s'),
]);
```

#### 使用原生 CSS {#with-native-css}

```css [animations.css]
@keyframes sharedAnimation {
  to {
    height: 0;
    opacity: 1;
    background-color: 'red';
  }
}

.animated-class {
  animation: sharedAnimation 1s;
}
```

给元素添加 `animated-class` 类，就会在该元素上触发这个动画。

## 为过渡添加动画 {#animating-a-transition}

### 为状态和样式添加动画 {#animating-state-and-styles}

动画包允许你在组件（component）中使用 [`state()`](https://angular.dev/api/animations/state) 函数定义各种状态。例如 `open` 或 `closed` 状态，在定义中分别包含各自状态的样式。例如：

#### 使用动画包 {#animating-state-and-styles-with-animations-package}

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

同样的行为可以用原生方式通过 CSS 类来实现，既可以使用关键帧动画，也可以使用过渡（transition）样式。

#### 使用原生 CSS {#animating-state-and-styles-with-native-css}

```css [animations.css]

.open {
  height: '200px';
  opacity: 1;
  background-color: 'yellow';
  transition: all 1s;
}

.closed {
  height: '100px';
  opacity: 0.8;
  background-color: 'blue';
  transition: all 1s;
}
```

触发 `open` 或 `closed` 状态的方式是在组件中切换元素上的类。你可以在我们的[模板指南](/guide/templates/binding#css-class-and-style-property-bindings)中找到相关示例。

在模板指南中，你还可以看到[直接为样式添加动画](/guide/templates/binding#css-style-properties)的类似示例。

### 过渡、时长与缓动 {#transitions-timing-and-easing}

动画包的 `animate()` 函数允许你提供时长、延迟和缓动等时间设置。在原生 CSS 中，可以通过若干 CSS 属性或简写属性来完成。

在 CSS 中，可以为关键帧动画指定 `animation-duration`、`animation-delay` 和 `animation-timing-function`，也可以改用 `animation` 简写属性。

```css [animations.css]

.example-element {
  animation-duration: 1s;
  animation-delay: 500ms;
  animation-timing-function: ease-in-out;
}

.example-shorthand {
  animation: exampleAnimation 1s ease-in-out 500ms;
}
```

同样，对于不使用 `@keyframes` 的动画，可以使用 `transition-duration`、`transition-delay`、`transition-timing-function` 以及 `transition` 简写属性。

```css [animations.css]

.example-element {
  transition-duration: 1s;
  transition-delay: 500ms;
  transition-timing-function: ease-in-out;
  transition-property: margin-right;
}

.example-shorthand {
  transition: margin-right 1s ease-in-out 500ms;
}
```

### 触发动画 {#triggering-an-animation}

动画包要求使用 `trigger()` 函数指定触发器（trigger），并把所有状态嵌套在其中。使用原生 CSS 时则不需要这样做。动画可以通过切换 CSS 样式或类来触发。一旦元素上出现某个类，动画就会发生。移除这个类后，元素会恢复为它原本定义的 CSS 样式。这样实现同样的动画所需的代码会少得多。下面是一个示例：

#### 使用动画包 {#triggering-an-animation-with-animations-package}

::: code-group

```ts [open-close.ts]
import {Component, signal} from '@angular/core';
import {trigger, transition, state, animate, style, keyframes} from '@angular/animations';

@Component({
  selector: 'app-open-close',
  animations: [
    trigger('openClose', [
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
          opacity: 0.5,
          backgroundColor: 'green',
        }),
      ),
      // ...
      transition('* => *', [
        animate(
          '1s',
          keyframes([
            style({opacity: 0.1, offset: 0.1}),
            style({opacity: 0.6, offset: 0.2}),
            style({opacity: 1, offset: 0.5}),
            style({opacity: 0.2, offset: 0.7}),
          ]),
        ),
      ]),
    ]),
  ],
  templateUrl: 'open-close.html',
  styleUrl: 'open-close.css',
})
export class OpenClose {
  isOpen = signal(false);

  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
```

```html [open-close.html]
<!-- #docplaster -->
<nav>
  <button type="button" (click)="toggle()">Toggle Open/Close</button>
</nav>

<div [@openClose]="isOpen() ? 'open' : 'closed'" class="open-close-container">
  <p>The box is now {{ isOpen() ? 'Open' : 'Closed' }}!</p>
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

#### 使用原生 CSS {#triggering-an-animation-with-native-css}

::: code-group

```ts [open-close.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-open-close',
  templateUrl: 'open-close.html',
  styleUrls: ['open-close.css'],
})
export class OpenClose {
  isOpen = signal(true);
  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
```

```html [open-close.html]
<!-- #docplaster -->
<h2>Open / Close Example</h2>

<button type="button" class="toggle-btn" (click)="toggle()">Toggle Open/Close</button>

<div class="open-close-container" [class.open]="isOpen()">
  <p>The box is now {{ isOpen() ? 'Open' : 'Closed' }}!</p>
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
  font-weight: bold;
  font-size: 20px;
  height: 100px;
  opacity: 0.8;
  background: #3b82f6;
  color: #ebebeb;
  transition-property: height, opacity, background-color, color;
  transition-duration: 1s;
}

.toggle-btn {
  background: transparent;
  border: 1px solid var(--primary-contrast, black);
  color: var(--primary-contrast, black);
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
}

.open {
  transition-duration: 0.5s;
  height: 200px;
  opacity: 1;
  background: #475569;
  color: #f9fafb;
}
```

:::

## 过渡与触发器 {#transition-and-triggers}

### 预定义状态与通配符匹配 {#predefined-state-and-wildcard-matching}

动画包可以通过字符串把你定义的状态与过渡匹配起来。例如，从打开到关闭的动画写作 `open => closed`。你可以使用通配符把任意状态匹配到目标状态，比如 `* => closed`；`void` 关键字则可用于进入和退出状态。例如：`* => void` 表示元素离开视图时，`void => *` 表示元素进入视图时。

直接用 CSS 编写动画时，完全不需要这些状态匹配模式。你可以根据在元素上设置的类和/或样式，来控制应用哪些过渡和 `@keyframes` 动画。你还可以添加 `@starting-style`，控制元素刚进入 DOM 时的外观。

### 使用通配符自动计算属性 {#automatic-property-calculation-with-wildcards}

动画包可以为一些历来难以添加动画的东西添加动画，例如从固定高度过渡到 `height: auto`。现在你也可以用纯 CSS 做到这一点。

#### 使用动画包 {#automatic-property-calculation-with-animations-package}

::: code-group

```ts [auto-height.ts]
import {Component, signal} from '@angular/core';
import {trigger, transition, state, animate, style} from '@angular/animations';

@Component({
  selector: 'app-open-close',
  animations: [
    trigger('openClose', [
      state('true', style({height: '*'})),
      state('false', style({height: '0px'})),
      transition('false <=> true', animate(1000)),
    ]),
  ],
  templateUrl: 'auto-height.html',
  styleUrl: 'auto-height.css',
})
export class AutoHeight {
  isOpen = signal(false);

  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
```

```html [auto-height.html]
<!-- #docplaster -->
<h2>Auto Height Example</h2>

<button type="button" (click)="toggle()">Toggle Open/Close</button>

<div class="container" [@openClose]="isOpen() ? true : false">
  <div class="content">
    <p>The box is now {{ isOpen() ? 'Open' : 'Closed' }}!</p>
  </div>
</div>
```

```css [auto-height.css]
.container {
  display: block;
  overflow: hidden;
}

.container .content {
  padding: 20px;
  margin-top: 1em;
  font-weight: bold;
  font-size: 20px;
  background: #3b82f6;
  color: #ebebeb;
}
```

:::

你可以使用 CSS Grid 实现到自动高度（auto height）的动画。

#### 使用原生 CSS {#automatic-property-calculation-with-native-css}

::: code-group

```ts [auto-height.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-auto-height',
  templateUrl: 'auto-height.html',
  styleUrls: ['auto-height.css'],
})
export class AutoHeight {
  isOpen = signal(true);
  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
```

```html [auto-height.html]
<!-- #docplaster -->
<h2>Auto Height Example</h2>

<button type="button" class="toggle-btn" (click)="toggle()">Toggle Open/Close</button>

<div class="container" [class.open]="isOpen()">
  <div class="content">
    <p>The box is now {{ isOpen() ? 'Open' : 'Closed' }}!</p>
  </div>
</div>
```

```css [auto-height.css]
.container {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows 1s;
}

.container.open {
  grid-template-rows: 1fr;
}

.container .content {
  min-height: 0;
  transition: visibility 1s;
  padding: 0 20px;
  visibility: hidden;
  margin-top: 1em;
  font-weight: bold;
  font-size: 20px;
  background: #3b82f6;
  color: #ebebeb;
  overflow: hidden;
}

.container.open .content {
  visibility: visible;
}

.toggle-btn {
  background: transparent;
  border: 1px solid var(--primary-contrast, black);
  color: var(--primary-contrast, black);
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
}
```

:::

如果你不需要考虑兼容所有浏览器，还可以了解一下 `calc-size()`，它才是为自动高度添加动画的真正解决方案。更多信息请参阅 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size)和 (这篇教程)[https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/]。

### 为进入和离开视图添加动画 {#animate-entering-and-leaving-a-view}

动画包除了提供前面提到的进入和离开的模式匹配外，还提供了 `:enter` 和 `:leave` 这两个简写别名。

#### 使用动画包 {#enter-and-leave-with-animations-package}

::: code-group

```ts [insert-remove.ts]
// #docplaster
import {Component} from '@angular/core';
import {trigger, transition, animate, style} from '@angular/animations';

@Component({
  selector: 'app-insert-remove',
  animations: [
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [style({opacity: 0}), animate('200ms', style({opacity: 1}))]),
      transition(':leave', [animate('200ms', style({opacity: 0}))]),
    ]),
  ],
  templateUrl: 'insert-remove.html',
  styleUrls: ['insert-remove.css'],
})
export class InsertRemove {
  isShown = false;

  toggle() {
    this.isShown = !this.isShown;
  }
}
```

```html [insert-remove.html]
<!-- #docplaster -->

<h2>Insert/Remove</h2>

<nav>
  <button type="button" (click)="toggle()">Toggle Insert/Remove</button>
</nav>

@if (isShown) {
  <div @myInsertRemoveTrigger class="insert-remove-container">
    <p>The box is inserted</p>
  </div>
}
```

```css [insert-remove.css]
:host {
  display: block;
}

.insert-remove-container {
  border: 1px solid #dddddd;
  margin-top: 1em;
  padding: 20px 20px 0px 20px;
  color: #000000;
  font-weight: bold;
  font-size: 20px;
}
```

:::

#### 使用原生 CSS {#enter-with-native-css}

::: code-group

```ts [insert.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-insert',
  templateUrl: 'insert.html',
  styleUrls: ['insert.css'],
})
export class Insert {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
```

```html [insert.html]
<!-- #docplaster -->
<h2>Insert Element Example</h2>

<nav>
  <button type="button" class="toggle-btn" (click)="toggle()">Toggle Element</button>
</nav>

@if (isShown()) {
  <div class="insert-container" animate.enter="enter-animation">
    <p>The box is inserted</p>
  </div>
}
```

```css [insert.css]
:host {
  display: block;
}

.insert-container {
  border: 1px solid #dddddd;
  margin-top: 1em;
  padding: 20px;
  font-weight: bold;
  font-size: 20px;
}

.insert-container p {
  margin: 0;
}

.enter-animation {
  animation: slide-fade 1s;
}

@keyframes slide-fade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toggle-btn {
  background: transparent;
  border: 1px solid var(--primary-contrast, black);
  color: var(--primary-contrast, black);
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
}
```

:::

#### 使用原生 CSS {#leave-with-native-css}

::: code-group

```ts [remove.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-remove',
  templateUrl: 'remove.html',
  styleUrls: ['remove.css'],
})
export class Remove {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
```

```html [remove.html]
<!-- #docplaster -->
<h2>Remove Element Example</h2>

<nav>
  <button type="button" class="toggle-btn" (click)="toggle()">Toggle Element</button>
</nav>

@if (isShown()) {
  <div class="insert-container" animate.leave="deleting">
    <p>The box is inserted</p>
  </div>
}
```

```css [remove.css]
:host {
  display: block;
}

.insert-container {
  border: 1px solid #dddddd;
  margin-top: 1em;
  padding: 20px;
  font-weight: bold;
  font-size: 20px;
  opacity: 1;
  transition: opacity 200ms ease-in;

  @starting-style {
    opacity: 0;
  }
}

.insert-container p {
  margin: 0;
}

.deleting {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 500ms ease-out,
    transform 500ms ease-out;
}

.toggle-btn {
  background: transparent;
  border: 1px solid var(--primary-contrast, black);
  color: var(--primary-contrast, black);
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
}
```

:::

关于 `animate.enter` 和 `animate.leave` 的更多信息，请参阅[进入和离开动画指南](/guide/animations)。

### 为递增和递减添加动画 {#animating-increment-and-decrement}

除了前面提到的 `:enter` 和 `:leave`，还有 `:increment` 和 `:decrement`。你同样可以通过添加和移除类来为它们添加动画。与动画包的内置别名不同，值增大或减小时不会自动应用类。你可以通过编程方式应用相应的类。下面是一个示例：

#### 使用动画包 {#increment-and-decrement-with-animations-package}

::: code-group

```ts [increment-decrement.ts]
// #docplaster
import {Component, signal} from '@angular/core';
import {trigger, transition, animate, style, query, stagger} from '@angular/animations';

@Component({
  selector: 'app-increment-decrement',
  templateUrl: 'increment-decrement.html',
  styleUrls: ['increment-decrement.css'],
  animations: [
    trigger('incrementAnimation', [
      transition(':increment', [
        animate('300ms ease-out', style({color: 'green', transform: 'scale(1.3, 1.2)'})),
      ]),
      transition(':decrement', [
        animate('300ms ease-out', style({color: 'red', transform: 'scale(0.8, 0.9)'})),
      ]),
    ]),
  ],
})
export class IncrementDecrement {
  num = signal(0);

  modify(n: number) {
    this.num.update((v) => (v += n));
  }
}
```

```html [increment-decrement.html]
<h3>Increment and Decrement Example</h3>
<section>
  <p [@incrementAnimation]="num()">Number {{ num() }}</p>
  <div class="controls">
    <button type="button" (click)="modify(1)">+</button>
    <button type="button" (click)="modify(-1)">-</button>
  </div>
</section>
```

```css [increment-decrement.css]
:host {
  display: block;
  font-size: 32px;
  margin: 20px;
  text-align: center;
}

section {
  border: 1px solid lightgray;
  border-radius: 50px;
}

p {
  display: inline-block;
  margin: 2rem 0;
  text-transform: uppercase;
}

.controls {
  padding-bottom: 2rem;
}

button {
  font: inherit;
  border: 0;
  background: lightgray;
  width: 50px;
  border-radius: 10px;
}

button + button {
  margin-left: 10px;
}
```

:::

#### 使用原生 CSS {#increment-and-decrement-with-native-css}

::: code-group

```ts [increment-decrement.ts]
// #docplaster
import {Component, ElementRef, OnInit, signal, viewChild} from '@angular/core';

@Component({
  selector: 'app-increment-decrement',
  templateUrl: 'increment-decrement.html',
  styleUrls: ['increment-decrement.css'],
})
export class IncrementDecrement implements OnInit {
  num = signal(0);
  el = viewChild<ElementRef<HTMLParagraphElement>>('el');

  ngOnInit() {
    this.el()?.nativeElement.addEventListener('animationend', (ev) => {
      if (ev.animationName.endsWith('decrement') || ev.animationName.endsWith('increment')) {
        this.animationFinished();
      }
    });
  }

  modify(n: number) {
    const targetClass = n > 0 ? 'increment' : 'decrement';
    this.num.update((v) => (v += n));
    this.el()?.nativeElement.classList.add(targetClass);
  }

  animationFinished() {
    this.el()?.nativeElement.classList.remove('increment', 'decrement');
  }

  ngOnDestroy() {
    this.el()?.nativeElement.removeEventListener('animationend', this.animationFinished);
  }
}
```

```html [increment-decrement.html]
<h3>Increment and Decrement Example</h3>
<section>
  <p #el>Number {{ num() }}</p>
  <div class="controls">
    <button type="button" (click)="modify(1)">+</button>
    <button type="button" (click)="modify(-1)">-</button>
  </div>
</section>
```

```css [increment-decrement.css]
:host {
  display: block;
  font-size: 32px;
  margin: 20px;
  text-align: center;
}

section {
  border: 1px solid lightgray;
  border-radius: 50px;
}

p {
  display: inline-block;
  margin: 2rem 0;
  text-transform: uppercase;
}

.increment {
  animation: increment 300ms;
}

.decrement {
  animation: decrement 300ms;
}

.controls {
  padding-bottom: 2rem;
}

button {
  font: inherit;
  border: 0;
  background: lightgray;
  width: 50px;
  border-radius: 10px;
}

button + button {
  margin-left: 10px;
}

@keyframes increment {
  33% {
    color: green;
    transform: scale(1.3, 1.2);
  }
  66% {
    color: green;
    transform: scale(1.2, 1.2);
  }
  100% {
    transform: scale(1, 1);
  }
}

@keyframes decrement {
  33% {
    color: red;
    transform: scale(0.8, 0.9);
  }
  66% {
    color: red;
    transform: scale(0.9, 0.9);
  }
  100% {
    transform: scale(1, 1);
  }
}
```

:::

### 父子动画 {#parent-child-animations}

与动画包不同，当某个组件中指定了多个动画时，没有哪个动画的优先级高于其他动画，也没有任何东西会阻止动画触发。动画的先后顺序需要由你的 CSS 动画定义来处理：使用 animation / transition 延迟，和/或利用 `animationend` 或 `transitionend` 来添加下一段要执行动画的 CSS。

子元素动画只会在同一个组件模板（template）内触发。在 `@angular/animations` 包中，父级动画可以使用 `query()` 和 `animateChild()` 查询并触发嵌套子组件中的动画。而使用 `animate.leave` 和原生 CSS 动画时，当父组件移除某个元素或视图时，嵌套子组件模板中定义的动画不会触发。只有同一个 Angular 组件模板中的嵌套动画才会执行。更多信息请参阅[进入和离开动画指南](/guide/animations#element-removal-order)。

### 禁用某个动画或全部动画 {#disabling-an-animation-or-all-animations}

使用原生 CSS 动画时，如果你想禁用已经指定的动画，有多种选择。

1. 创建一个自定义类，把 animation 和 transition 强制设为 `none`。

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

把这个类应用到元素上，就能阻止该元素上触发任何动画。你也可以把它的作用范围扩大到整个 DOM 或 DOM 的某个部分，以强制实现这种行为。不过，这样做也会阻止动画事件触发。如果你要等待动画事件来移除元素，这个方案就行不通了。一个变通办法是把时长设为 1 毫秒。

2. 使用 [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) 媒体查询，确保偏好减少动画的用户不会看到动画播放。

3. 以编程方式阻止添加动画类

### 动画回调 {#animation-callbacks}

动画包提供了回调，供你在动画结束时执行某些操作。原生 CSS 动画同样有这些回调。

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)  
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)  
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationiteration_event)  
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)  
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)  
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)  
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)

Web Animations API 还有大量其他功能。[请查看相关文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)，了解所有可用的动画 API。

::: info 注意
请注意这些回调的冒泡问题。如果你同时为子元素和父元素添加了动画，事件会从子元素向上冒泡到父元素。可以考虑阻止事件传播，或者查看事件的更多细节，以确定你响应的是预期的事件目标，而不是从子节点冒泡上来的事件。你可以检查 `animationname` 属性或正在过渡的属性，来确认处理的是正确的节点。

:::

## 复杂序列 {#complex-sequences}

动画包内置了创建复杂序列的功能。不使用动画包，这些序列也完全可以实现。

### 定位特定元素 {#targeting-specific-elements}

在动画包中，你可以使用 `query()` 函数按 CSS 类名查找特定元素，从而定位它们，类似于 [`document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector)。在原生 CSS 动画中这是不必要的。你可以直接使用 CSS 选择器（selector）定位子类，并应用所需的 `transform` 或 `animation`。

要在模板中切换子节点的类，可以使用 class 和 style 绑定（binding），在合适的时机添加动画。

### Stagger() {#stagger}

`stagger()` 函数可以让列表中每一项的动画按指定时间依次延迟，形成级联效果。在原生 CSS 中，你可以借助 `animation-delay` 或 `transition-delay` 复现这种行为。下面是相应 CSS 的一个示例。

#### 使用动画包 {#stagger-with-animations-package}

::: code-group

```ts [stagger.ts]
// #docplaster
import {Component, HostBinding, signal} from '@angular/core';
import {trigger, transition, animate, style, query, stagger} from '@angular/animations';

@Component({
  selector: 'app-stagger',
  templateUrl: 'stagger.html',
  styleUrls: ['stagger.css'],
  animations: [
    trigger('pageAnimations', [
      transition(':enter', [
        query('.item', [
          style({opacity: 0, transform: 'translateY(-10px)'}),
          stagger(200, [animate('500ms ease-in', style({opacity: 1, transform: 'none'}))]),
        ]),
      ]),
    ]),
  ],
})
export class Stagger {
  @HostBinding('@pageAnimations')
  items = [1, 2, 3];
}
```

```html [stagger.html]
<!-- #docplaster -->
<h2>Stagger Example</h2>

<ul class="items">
  @for (item of items; track item) {
    <li class="item">{{ item }}</li>
  }
</ul>
```

```css [stagger.css]
.items {
  list-style: none;
  padding: 0;
  margin: 0;
}
```

:::

#### 使用原生 CSS {#stagger-with-native-css}

::: code-group

```ts [stagger.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-stagger',
  templateUrl: './stagger.html',
  styleUrls: ['stagger.css'],
})
export class Stagger {
  show = signal(true);
  items = [1, 2, 3];

  refresh() {
    this.show.set(false);
    setTimeout(() => {
      this.show.set(true);
    }, 10);
  }
}
```

```html [stagger.html]
<!-- #docplaster -->
<h1>Stagger Example</h1>
<button type="button" class="toggle-btn" (click)="refresh()">Refresh</button>
<div class="items-container">
  @if (show()) {
    <ul class="items">
      @for (item of items; track $index) {
        <li class="item" style="--index: {{ $index }}">{{ item }}</li>
      }
    </ul>
  }
</div>
```

```css [stagger.css]
.items-container {
  min-height: 4.5rem;
}

.items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.items .item {
  transition-property: opacity, transform;
  transition-duration: 500ms;
  transition-delay: calc(200ms * var(--index));

  @starting-style {
    opacity: 0;
    transform: translateX(-10px);
  }
}

.toggle-btn {
  background: transparent;
  border: 1px solid var(--primary-contrast, black);
  color: var(--primary-contrast, black);
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
}
```

:::

### 并行动画 {#parallel-animations}

动画包提供了 `group()` 函数来同时播放多个动画。在 CSS 中，你可以完全掌控动画的时间安排。如果定义了多个动画，可以一次性全部应用。

```css
.target-element {
  animation:
    rotate 3s,
    fade-in 2s;
}
```

在这个例子中，`rotate` 和 `fade-in` 动画同时触发。

### 为重新排序的列表项添加动画 {#animating-the-items-of-a-reordering-list}

使用前面介绍的技术，列表项重新排序开箱即用，无需任何额外的特殊处理。`@for` 循环中的条目会被正确地移除并重新添加，这会触发使用 `@starting-styles` 编写的进入动画。你也可以使用 `animate.enter` 实现同样的行为。使用 `animate.leave` 为被移除的元素添加动画，如上例所示。

#### 使用动画包 {#reordering-list-with-animations-package}

::: code-group

```ts [reorder.ts]
// #docplaster
import {Component, signal} from '@angular/core';
import {trigger, transition, animate, query, style} from '@angular/animations';

@Component({
  selector: 'app-reorder',
  templateUrl: './reorder.html',
  styleUrls: ['reorder.css'],
  animations: [
    trigger('itemAnimation', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateX(-10px)'}),
        animate('300ms', style({opacity: 1, transform: 'translateX(none)'})),
      ]),
      transition(':leave', [
        style({opacity: 1, transform: 'translateX(none)'}),
        animate('300ms', style({opacity: 0, transform: 'translateX(-10px)'})),
      ]),
    ]),
  ],
})
export class Reorder {
  show = signal(true);
  items = ['stuff', 'things', 'cheese', 'paper', 'scissors', 'rock'];

  randomize() {
    const randItems = [...this.items];
    const newItems = [];
    for (let i of this.items) {
      const max: number = this.items.length - newItems.length;
      const randNum = Math.floor(Math.random() * max);
      newItems.push(...randItems.splice(randNum, 1));
    }

    this.items = newItems;
  }
}
```

```html [reorder.html]
<!-- #docplaster -->
<h1>Reordering List Example</h1>
<button type="button" (click)="randomize()">Randomize</button>

<ul class="items">
  @for (item of items; track item) {
    <li @itemAnimation class="item">{{ item }}</li>
  }
</ul>
```

```css [reorder.css]
.items {
  list-style: none;
  padding: 0;
  margin: 0;
}
```

:::

#### 使用原生 CSS {#reordering-list-with-native-css}

::: code-group

```ts [reorder.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-reorder',
  templateUrl: './reorder.html',
  styleUrls: ['reorder.css'],
})
export class Reorder {
  show = signal(true);
  items = ['stuff', 'things', 'cheese', 'paper', 'scissors', 'rock'];

  randomize() {
    const randItems = [...this.items];
    const newItems = [];
    for (let i of this.items) {
      const max: number = this.items.length - newItems.length;
      const randNum = Math.floor(Math.random() * max);
      newItems.push(...randItems.splice(randNum, 1));
    }

    this.items = newItems;
  }
}
```

```html [reorder.html]
<!-- #docplaster -->
<h1>Reordering List Example</h1>
<button type="button" class="toggle-btn" (click)="randomize()">Randomize</button>

<ul class="items">
  @for (item of items; track item) {
    <li class="item" animate.leave="fade">{{ item }}</li>
  }
</ul>
```

```css [reorder.css]
.items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.items .item {
  transition-property: opacity, transform;
  transition-duration: 500ms;

  @starting-style {
    opacity: 0;
    transform: translateX(-10px);
  }
}

.items .item.fade {
  animation: fade-out 500ms;
}

@keyframes fade-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

.toggle-btn {
  background: transparent;
  border: 1px solid var(--primary-contrast, black);
  color: var(--primary-contrast, black);
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
}
```

:::

## 迁移 AnimationPlayer 的用法 {#migrating-usages-of-animationplayer}

`AnimationPlayer` 类允许你访问某个动画，通过代码执行更高级的操作，如暂停、播放、重新开始和结束动画。所有这些也都可以用原生方式处理。

你可以使用 [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations) 直接获取元素上的动画。它会返回该元素上所有 [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) 组成的数组。借助 `Animation` API，你能做的远比动画包中的 `AnimationPlayer` 所提供的多得多。你可以调用 `cancel()`、`play()`、`pause()`、`reverse()` 等方法。这个原生 API 应该能满足你控制动画的所有需求。

## 路由过渡 {#route-transitions}

你可以使用视图过渡（view transitions）在路由之间添加动画。请参阅[路由过渡动画指南](/guide/routing/route-transition-animations)开始上手。
