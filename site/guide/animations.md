# 使用 `animate.enter` 和 `animate.leave` 为应用添加动画 {#animating-your-applications-with-animate-enter-and-animate-leave}

精心设计的动画（animation）可以让你的应用更直观、更有吸引力，但它们不只是装饰。
动画可以从多个方面改进你的应用和用户体验：

- 没有动画时，网页之间的切换可能显得突兀、生硬
- 动效能极大地提升用户体验，动画让用户有机会察觉应用对其操作的响应
- 好的动画可以在整个工作流中流畅地引导用户的注意力

Angular 提供了 `animate.enter` 和 `animate.leave` 来为应用中的元素添加动画。这两个特性会在适当的时机应用进入和离开的 CSS 类，或者调用函数来应用第三方库的动画。`animate.enter` 和 `animate.leave` 不是指令（directive），而是由 Angular 编译器直接支持的特殊 API。它们既可以直接用在元素上，也可以用作宿主绑定。

## `animate.enter` {#animate-enter}

你可以使用 `animate.enter` 为*进入* DOM 的元素添加动画。你可以使用带有过渡（transition）或关键帧动画的 CSS 类来定义进入动画。

::: code-group

```ts [enter.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-enter',
  templateUrl: 'enter.html',
  styleUrls: ['enter.css'],
})
export class Enter {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
```

```html [enter.html]
<!-- #docplaster -->
<h2><code>animate.enter</code> Example</h2>

<button type="button" class="toggle-btn" (click)="toggle()">Toggle Element</button>

@if (isShown()) {
  <div class="enter-container" animate.enter="enter-animation">
    <p>The box is entering.</p>
  </div>
}
```

```css [enter.css]
:host {
  display: block;
  height: 200px;
}

.enter-container {
  border: 1px solid #dddddd;
  margin-top: 1em;
  padding: 20px;
  font-weight: bold;
  font-size: 20px;
}

.enter-container p {
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

动画完成后，Angular 会从 DOM 中移除你在 `animate.enter` 中指定的一个或多个类。动画类只会在动画进行期间存在。

::: info 注意
当在一个元素上使用多个关键帧动画或过渡属性时，Angular 只会在耗时最长的动画完成*之后*才移除所有类。

:::

你可以把 `animate.enter` 与任何其他 Angular 特性一起使用，例如控制流（control flow）或动态表达式。`animate.enter` 既接受单个类字符串（多个类之间用空格分隔），也接受类字符串数组。

关于使用 CSS 过渡的简要说明：如果你选择使用过渡而不是关键帧动画，那么通过 `animate.enter` 添加到元素上的类表示过渡*最终要达到*的状态。元素的基础 CSS 决定了没有动画运行时元素的外观，这很可能与 CSS 过渡的结束状态相似。因此，你仍然需要搭配 `@starting-style`，为过渡提供合适的*起始*状态，过渡才能生效。

::: code-group

```ts [enter-binding.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-enter-binding',
  templateUrl: 'enter-binding.html',
  styleUrls: ['enter-binding.css'],
})
export class EnterBinding {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }

  enterClass = signal('enter-animation');
}
```

```html [enter-binding.html]
<!-- #docplaster -->
<h2><code>animate.enter</code> Binding Example</h2>

<button type="button" class="toggle-btn" (click)="toggle()">Toggle Element</button>

@if (isShown()) {
  <div class="enter-container" [animate.enter]="enterClass()">
    <p>The box is entering.</p>
  </div>
}
```

```css [enter-binding.css]
:host {
  display: block;
  height: 200px;
}

.enter-container {
  border: 1px solid #dddddd;
  margin-top: 1em;
  padding: 20px;
  font-weight: bold;
  font-size: 20px;
}

.enter-container p {
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

## `animate.leave` {#animate-leave}

你可以使用 `animate.leave` 为*离开* DOM 的元素添加动画。你可以使用带有变换（transform）或关键帧动画的 CSS 类来定义离开动画。

::: code-group

```ts [leave.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-leave',
  templateUrl: 'leave.html',
  styleUrls: ['leave.css'],
})
export class Leave {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
```

```html [leave.html]
<!-- #docplaster -->
<h2><code>animate.leave</code> Example</h2>

<button type="button" class="toggle-btn" (click)="toggle()">Toggle Element</button>

@if (isShown()) {
  <div class="leave-container" animate.leave="leaving">
    <p>Goodbye</p>
  </div>
}
```

```css [leave.css]
:host {
  display: block;
  height: 200px;
}

.leave-container {
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

.leave-container p {
  margin: 0;
}

.leaving {
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

动画完成后，Angular 会自动从 DOM 中移除执行动画的元素。

::: info 注意
当在一个元素上使用多个关键帧动画或过渡属性时，Angular 会等到其中耗时最长的动画完成*之后*才移除该元素。

:::

`animate.leave` 也可以与信号（signal）和其他绑定（binding）一起使用。你可以为 `animate.leave` 指定单个类或多个类，既可以写成用空格分隔的简单字符串，也可以写成字符串数组。

::: code-group

```ts [leave-binding.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-leave-binding',
  templateUrl: 'leave-binding.html',
  styleUrls: ['leave-binding.css'],
})
export class LeaveBinding {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }

  farewell = signal('leaving');
}
```

```html [leave-binding.html]
<!-- #docplaster -->
<h2><code>animate.leave</code> Binding Example</h2>

<button type="button" class="toggle-btn" (click)="toggle()">Toggle Element</button>

@if (isShown()) {
  <div class="leave-container" [animate.leave]="farewell()">
    <p>Goodbye</p>
  </div>
}
```

```css [leave-binding.css]
:host {
  display: block;
  height: 200px;
}

.leave-container {
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

.leave-container p {
  margin: 0;
}

.leaving {
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

### 元素移除顺序 {#element-removal-order}

`animate.leave` 动画如何运行以及何时发生，存在一些细微差别。`animate.leave` 放在被移除的元素上时会生效；如果 `animate.leave` 放在*同一个组件模板内*被移除元素的某个*后代*元素上，那么这些子元素的 `animate.leave` 动画会在父节点从 DOM 中移除*之前*执行。这样你就可以放心地为子元素添加离开动画，而不必担心父节点过早消失。

::: code-group

```ts [leave-parent.ts]
// #docplaster
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-leave-parent',
  templateUrl: 'leave-parent.html',
  styleUrls: ['leave-parent.css'],
})
export class LeaveParent {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
```

```html [leave-parent.html]
<!-- #docplaster -->
<h2><code>animate.leave</code> Parent Sub-tree Animation Example</h2>

<button type="button" class="toggle-btn" (click)="toggle()">Toggle Element</button>

@if (isShown()) {
  <div class="leave-parent">
    <!-- 带有 `animate.leave` 的子节点会先执行动画，
         然后父节点才会从 DOM 中移除。 -->
    <div class="leave-container" animate.leave="leaving">
      <p>Goodbye</p>
    </div>
  </div>
}
```

```css [leave-parent.css]
:host {
  display: block;
  height: 200px;
}

.leave-container {
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

.leave-container p {
  margin: 0;
}

.leaving {
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

::: warning 重要
子动画只会对同一个组件模板（template）内的元素触发。如果被移除的元素包含子组件（component），那么在这些子组件模板内部定义的任何 `animate.leave` 动画都**不会**在父元素被移除之前运行。要在子组件被移除时为其添加动画，请改为在父模板中直接把 `animate.leave` 应用到子组件的宿主元素（host element）上，或者在子组件中以编程方式触发动画，并把父元素的移除推迟到该动画完成之后。

:::

## 事件绑定、函数和第三方库 {#event-bindings-functions-and-third-party-libraries}

`animate.enter` 和 `animate.leave` 都支持事件绑定（event binding）语法，允许进行函数调用。你可以用这种语法调用组件代码中的函数，或者使用第三方动画库，例如 [GSAP](https://gsap.com/)、[anime.js](https://animejs.com/) 或其他任何 JavaScript 动画库。

::: code-group

```ts [leave-event.ts]
// #docplaster
import {AnimationCallbackEvent, Component, signal} from '@angular/core';

@Component({
  selector: 'app-leave-binding',
  templateUrl: 'leave-event.html',
  styleUrls: ['leave-event.css'],
})
export class LeaveEvent {
  isShown = signal(false);

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }

  leavingFn(event: AnimationCallbackEvent) {
    // 调用 GSAP 的示例
    // gsap.to(event.target, {
    //   duration: 1,
    //   x: 100,
    //   // 箭头函数便于编写简洁的回调
    //   onComplete: () => event.animationComplete()
    // });
    event.animationComplete();
  }
}
```

```html [leave-event.html]
<!-- #docplaster -->
<h2><code>animate.leave</code> Function Example</h2>

<button type="button" class="toggle-btn" (click)="toggle()">Toggle Element</button>

@if (isShown()) {
  <div class="leave-container" (animate.leave)="leavingFn($event)">
    <p>Goodbye</p>
  </div>
}
```

```css [leave-event.css]
:host {
  display: block;
  height: 200px;
}

.leave-container {
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

.leave-container p {
  margin: 0;
}

.leaving {
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

`$event` 对象的类型是 `AnimationCallbackEvent`。它把元素作为 `target` 包含在内，并提供一个 `animationComplete()` 函数，用于在动画结束时通知框架。

::: warning 重要
使用 `animate.leave` 时，你**必须**调用 `animationComplete()` 函数，Angular 才会移除该元素。

:::

如果你在使用 `animate.leave` 时没有调用 `animationComplete()`，Angular 会在延迟四秒后自动调用该函数。你可以通过提供令牌 `MAX_ANIMATION_TIMEOUT`（以毫秒为单位）来配置延迟时长。

```ts
  { provide: MAX_ANIMATION_TIMEOUT, useValue: 6000 }
```

## 与旧版 Angular 动画的兼容性 {#compatibility-with-legacy-angular-animations}

你不能在同一个组件中同时使用旧版动画和 `animate.enter`、`animate.leave`。这样做会导致进入类残留在元素上，或者离开的节点不会被移除。除此之外，在同一个*应用*中同时使用旧版动画和新的 `animate.enter`、`animate.leave` 动画是没有问题的。唯一需要注意的是内容投影（content projection）。如果你把内容从一个使用旧版动画的组件投影到另一个使用 `animate.enter` 或 `animate.leave` 的组件中（或者反过来），其行为就和在同一个组件中同时使用它们一样。这是不受支持的。

## 测试 {#testing}

TestBed 内置支持在测试环境中启用或禁用动画。CSS 动画需要在浏览器中运行，而很多 API 在测试环境中不可用。默认情况下，TestBed 会在测试环境中为你禁用动画。

如果你想在浏览器测试（例如端到端测试）中测试动画是否正常执行，可以在测试配置中指定 `animationsEnabled: true`，让 TestBed 启用动画。

```ts
TestBed.configureTestingModule({animationsEnabled: true});
```

这样，测试环境中的动画就会正常运行。

::: info 注意
某些测试环境不会发出 `animationstart`、`animationend` 之类的动画事件，以及与之对应的过渡事件。

:::

## 关于 Angular 动画的更多内容 {#more-on-angular-animations}

你可能还会对以下内容感兴趣：

- [使用 CSS 实现复杂动画](/guide/animations/css)
- [路由过渡动画](/guide/routing/route-transition-animations)

