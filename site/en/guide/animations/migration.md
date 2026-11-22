# Migrating away from Angular's Animations package

The `@angular/animations` package is deprecated as of v20.2, which also introduced the new `animate.enter` and `animate.leave` feature to add animations to your application. Using these new features, you can replace all animations based on `@angular/animations` with plain CSS or JS animation libraries. Removing `@angular/animations` from your application can significantly reduce the size of your JavaScript bundle. Native CSS animations generally offer superior performance, as they can benefit from hardware acceleration. This guide walks through the process of refactoring your code from `@angular/animations` to native CSS animations.

## How to write animations in native CSS

If you've never written any native CSS animations, there are a number of excellent guides to get you started. Here are a few of them:  
[MDN's CSS Animations guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)  
[W3Schools CSS3 Animations guide](https://www.w3schools.com/css/css3_animations.asp)  
[The Complete CSS Animations Tutorial](https://www.lambdatest.com/blog/css-animations-tutorial/)  
[CSS Animation for Beginners](https://thoughtbot.com/blog/css-animation-for-beginners)

and a couple of videos:  
[Learn CSS Animation in 9 Minutes](https://www.youtube.com/watch?v=z2LQYsZhsFw)  
[Net Ninja CSS Animation Tutorial Playlist](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

Check out some of these guides and tutorials, then come back to this guide.

## Creating Reusable Animations

Just like with the animations package, you can create reusable animations that can be shared across your application. The animations package version of this had you using the `animation()` function in a shared typescript file. The native CSS version of this is similar, but lives in a shared CSS file.

#### With Animations Package

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

#### With Native CSS

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

Adding the class `animated-class` to an element would trigger the animation on that element.

## Animating a Transition

### Animating State and Styles

The animations package allowed you to define various states using the [`state()`](https://angular.dev/api/animations/state) function within a component. Examples might be an `open` or `closed` state containing the styles for each respective state within the definition. For example:

#### With Animations Package {#animating-state-and-styles-with-animations-package}

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

This same behavior can be accomplished natively by using CSS classes, either with a keyframe animation or transition styling.

#### With Native CSS {#animating-state-and-styles-with-native-css}

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

Triggering the `open` or `closed` state is done by toggling classes on the element in your component. You can find examples of how to do this in our [template guide](/en/guide/templates/binding#css-class-and-style-property-bindings).

You can see similar examples in the template guide for [animating styles directly](/en/guide/templates/binding#css-style-properties).

### Transitions, Timing, and Easing

The animations package `animate()` function allows for providing timing, like duration, delays and easing. This can be done natively with CSS using several css properties or shorthand properties.

Specify `animation-duration`, `animation-delay`, and `animation-timing-function` for a keyframe animation in CSS, or alternatively use the `animation` shorthand property.

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

Similarly, you can use `transition-duration`, `transition-delay`, and `transition-timing-function` and the `transition` shorthand for animations that are not using `@keyframes`.

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

### Triggering an Animation

The animations package required specifying triggers using the `trigger()` function and nesting all of your states within it. With native CSS, this is unnecessary. Animations can be triggered by toggling CSS styles or classes. Once a class is present on an element, the animation will occur. Removing the class will revert the element back to whatever CSS is defined for that element. This results in significantly less code to do the same animation. Here's an example:

#### With Animations Package {#triggering-an-animation-with-animations-package}

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

#### With Native CSS {#triggering-an-animation-with-native-css}

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

## Transition and Triggers

### Predefined State and wildcard matching

The animations package offers the ability to match your defined states to a transition via strings. For example, animating from open to closed would be `open => closed`. You can use wildcards to match any state to a target state, like `* => closed` and the `void` keyword can be used for entering and exiting states. For example: `* => void` for when an element leaves a view or `void => *` for when the element enters a view.

These state matching patterns are not needed at all when animating with CSS directly. You can manage what transitions and `@keyframes` animations apply based on whatever classes you set and / or styles you set on the elements. You can also add `@starting-style` to control how the element looks upon immediately entering the DOM.

### Automatic Property Calculation with Wildcards

The animations package offers the ability to animate things that have been historically difficult to animate, like animating a set height to `height: auto`. You can now do this with pure CSS as well.

#### With Animations Package {#automatic-property-calculation-with-animations-package}

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

You can use CSS Grid to animate to auto height.

#### With Native CSS {#automatic-property-calculation-with-native-css}

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

If you don't have to worry about supporting all browsers, you can also check out `calc-size()`, which is the true solution to animating auto height. See [MDN's docs](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size) and (this tutorial)[https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/] for more information.

### Animate entering and leaving a view

The animations package offered the previously mentioned pattern matching for entering and leaving but also included the shorthand aliases of `:enter` and `:leave`.

#### With Animations Package {#enter-and-leave-with-animations-package}

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

#### With Native CSS {#enter-with-native-css}

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

#### With Native CSS {#leave-with-native-css}

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

For more information on `animate.enter` and `animate.leave`, see the [Enter and Leave animations guide](/en/guide/animations).

### Animating increment and decrement

Along with the aforementioned `:enter` and `:leave`, there's also `:increment` and `:decrement`. You can animate these also by adding and removing classes. Unlike the animation package built-in aliases, there is no automatic application of classes when the values go up or down. You can apply the appropriate classes programmatically. Here's an example:

#### With Animations Package {#increment-and-decrement-with-animations-package}

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

#### With Native CSS {#increment-and-decrement-with-native-css}

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

### Parent / Child Animations

Unlike the animations package, when multiple animations are specified within a given component, no animation has priority over another and nothing blocks any animation from firing. Any sequencing of animations would have to be handled by your definition of your CSS animation, using animation / transition delay, and / or using `animationend` or `transitionend` to handle adding the next css to be animated.

Child animations fire only within the same component template. In the `@angular/animations` package, parent animations could query and trigger animations in nested child components using `query()` and `animateChild()`. With `animate.leave` and native CSS animations, animations defined inside nested child component templates will not fire when a parent component removes an element or view. Only nested animations within the same Angular component template will execute. See the [Enter and Leave Animations guide](/en/guide/animations#element-removal-order) for more information on this.

### Disabling an animation or all animations

With native CSS animations, if you'd like to disable the animations that you've specified, you have multiple options.

1. Create a custom class that forces animation and transition to `none`.

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

Applying this class to an element prevents any animation from firing on that element. You could alternatively scope this to your entire DOM or section of your DOM to enforce this behavior. However, this prevents animation events from firing. If you are awaiting animation events for element removal, this solution won't work. A workaround is to set durations to 1 millisecond instead.

2. Use the [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) media query to ensure no animations play for users that prefer less animation.

3. Prevent adding animation classes programmatically

### Animation Callbacks

The animations package exposed callbacks for you to use in the case that you want to do something when the animation has finished. Native CSS animations also have these callbacks.

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)  
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)  
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationiteration_event)  
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)  
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)  
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)  
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)

The Web Animations API has a lot of additional functionality. [Take a look at the documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) to see all the available animation APIs.

::: info NOTE
Be aware of bubbling issues with these callbacks. If you are animating children and parents, the events bubble up from children to parents. Consider stopping propagation or looking at more details within the event to determine if you're responding to the desired event target rather than an event bubbling up from a child node. You can examine the `animationname` property or the properties being transitioned to verify you have the right nodes.

:::

## Complex Sequences

The animations package has built-in functionality for creating complex sequences. These sequences are all entirely possible without the animations package.

### Targeting specific elements

In the animations package, you could target specific elements by using the `query()` function to find specific elements by a CSS class name, similar to [`document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector). This is unnecessary in a native CSS animation world. Instead, you can use your CSS selectors to target sub-classes and apply any desired `transform` or `animation`.

To toggle classes for child nodes within a template, you can use class and style bindings to add the animations at the right points.

### Stagger()

The `stagger()` function allowed you to delay the animation of each item in a list of items by a specified time to create a cascade effect. You can replicate this behavior in native CSS by utilizing `animation-delay` or `transition-delay`. Here is an example of what that CSS might look like.

#### With Animations Package {#stagger-with-animations-package}

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

#### With Native CSS {#stagger-with-native-css}

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

### Parallel Animations

The animations package has a `group()` function to play multiple animations at the same time. In CSS, you have full control over animation timing. If you have multiple animations defined, you can apply all of them at once.

```css
.target-element {
  animation:
    rotate 3s,
    fade-in 2s;
}
```

In this example, the `rotate` and `fade-in` animations fire at the same time.

### Animating the items of a reordering list

Items reordering in a list works out of the box using the previously described techniques. No additional special work is required. Items in a `@for` loop will be removed and re-added properly, which will fire off animations using `@starting-styles` for entry animations. Alternatively, you can use `animate.enter` for this same behavior. Use `animate.leave` to animate elements as they are removed, as seen in the example above.

#### With Animations Package {#reordering-list-with-animations-package}

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

#### With Native CSS {#reordering-list-with-native-css}

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

## Migrating usages of AnimationPlayer

The `AnimationPlayer` class allows access to an animation to do more advanced things like pause, play, restart, and finish an animation through code. All of these things can be handled natively as well.

You can retrieve animations off an element directly using [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations). This returns an array of every [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) on that element. You can use the `Animation` API to do much more than you could with what the `AnimationPlayer` from the animations package offered. From here you can `cancel()`, `play()`, `pause()`, `reverse()` and much more. This native API should provide everything you need to control your animations.

## Route Transitions

You can use view transitions to animate between routes. See the [Route Transition Animations Guide](/en/guide/routing/route-transition-animations) to get started.
