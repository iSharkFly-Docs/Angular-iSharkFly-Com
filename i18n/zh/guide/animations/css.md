# 用 CSS 为应用添加动画

CSS 提供了一套强大的工具，可以在应用中创建美观、吸引人的动画（animation）。

## 如何用原生 CSS 编写动画

如果你从未写过原生 CSS 动画，有很多优秀的指南可以帮你入门。下面列出其中几篇：
[MDN 的 CSS 动画指南](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
[W3Schools 的 CSS3 动画指南](https://www.w3schools.com/css/css3_animations.asp)
[完整的 CSS 动画教程](https://www.lambdatest.com/blog/css-animations-tutorial/)
[面向初学者的 CSS 动画](https://thoughtbot.com/blog/css-animation-for-beginners)

以及几个视频：
[9 分钟学会 CSS 动画](https://www.youtube.com/watch?v=z2LQYsZhsFw)
[Net Ninja 的 CSS 动画教程播放列表](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

看完其中一些指南和教程后，再回到本指南。

## 创建可复用的动画

你可以使用 `@keyframes` 创建可在整个应用中共享的可复用动画。在一个共享的 CSS 文件中定义关键帧动画，就可以在应用中任何需要的地方复用这些关键帧动画。

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

## 为过渡添加动画

### 为状态和样式添加动画

你可能希望在两种不同状态之间做动画，例如元素打开或关闭时。可以借助 CSS 类来实现，既可以使用关键帧动画，也可以使用过渡（transition）样式。

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

触发 `open` 或 `closed` 状态的方式是在组件（component）中切换元素上的类。你可以在我们的[模板指南](/guide/templates/binding#css-class-and-style-property-bindings)中找到相关示例。

在模板指南中，你还可以看到[直接为样式添加动画](/guide/templates/binding#css-style-properties)的类似示例。

### 过渡、时长与缓动

动画通常需要调整时长、延迟和缓动行为。这可以通过若干 CSS 属性或简写属性来完成。

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

### 触发动画

动画可以通过切换 CSS 样式或类来触发。一旦元素上出现某个类，动画就会发生。移除这个类后，元素会恢复为它原本定义的 CSS 样式。下面是一个示例：

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

## 过渡与触发器

### 为自动高度添加动画

你可以使用 CSS Grid 实现到自动高度（auto height）的动画。

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

如果你不需要考虑兼容所有浏览器，还可以了解一下 `calc-size()`，它才是为自动高度添加动画的真正解决方案。更多信息请参阅 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size)和[这篇教程](https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/)。

### 为进入和离开视图添加动画

你可以为条目进入视图或离开视图创建动画。我们先来看看如何为元素进入视图添加动画。这里使用 `animate.enter`，它会在元素进入视图时应用动画类。

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

为元素离开视图添加动画，与进入视图时的做法类似。使用 `animate.leave` 指定元素离开视图时要应用的 CSS 类。

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

::: info 注意
子元素上的 `animate.leave` 动画只会在同一个组件模板（template）内触发。当父元素被移除时，嵌套组件中的 `animate.leave` 动画不会触发。

:::

关于 `animate.enter` 和 `animate.leave` 的更多信息，请参阅[进入和离开动画指南](/guide/animations)。

### 为递增和递减添加动画

在递增和递减时播放动画是应用中的常见模式。下面是实现这种行为的一个示例。

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

### 禁用某个动画或全部动画

如果你想禁用已经指定的动画，有多种选择。

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

### 动画回调

如果你希望在动画的特定时间点执行某些操作，可以监听许多可用的事件。下面列出其中一些。

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

## 复杂序列

动画往往不只是简单的淡入或淡出。你可能有许多复杂的动画序列需要运行。我们来看看其中一些可能的场景。

### 列表中的交错动画

一种常见效果是让列表中每一项的动画依次错开，形成级联效果。这可以借助 `animation-delay` 或 `transition-delay` 实现。下面是相应 CSS 的一个示例。

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

### 并行动画

你可以使用 `animation` 简写属性一次为元素应用多个动画，每个动画都可以有自己的时长和延迟。这样就能把动画组合在一起，创造出复杂的效果。

```css
.target-element {
  animation:
    rotate 3s,
    fade-in 2s;
}
```

在这个例子中，`rotate` 和 `fade-in` 动画同时触发，但时长不同。

### 为重新排序的列表项添加动画

`@for` 循环中的条目会被移除并重新添加，这会触发使用 `@starting-styles` 编写的进入动画。你也可以使用 `animate.enter` 实现同样的行为。使用 `animate.leave` 为被移除的元素添加动画，如下例所示。

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

## 以编程方式控制动画

你可以使用 [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations) 直接获取元素上的动画。它会返回该元素上所有 [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) 组成的数组。借助 `Animation` API，你能做的远比动画包中的 `AnimationPlayer` 所提供的多得多。你可以调用 `cancel()`、`play()`、`pause()`、`reverse()` 等方法。这个原生 API 应该能满足你控制动画的所有需求。

## 更多 Angular 动画相关内容

你可能还会对下列内容感兴趣：

- [进入和离开动画](/guide/animations)
- [路由过渡动画](/guide/routing/route-transition-animations)

