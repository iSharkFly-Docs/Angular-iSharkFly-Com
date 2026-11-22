# Reusable animations

::: warning IMPORTANT
The `@angular/animations` package is now deprecated. The Angular team recommends using native CSS with `animate.enter` and `animate.leave` for animations for all new code. Learn more at the new enter and leave [animation guide](/en/guide/animations). Also see [Migrating away from Angular's Animations package](/en/guide/animations/migration) to learn how you can start migrating to pure CSS animations in your apps.

:::

This topic provides examples of how to create reusable animations.

## Create reusable animations

To create a reusable animation, use the [`animation()`](https://angular.dev/api/animations/animation) function to define an animation in a separate `.ts` file and declare this animation definition as a `const` export variable.
You can then import and reuse this animation in your application components using the [`useAnimation()`](https://angular.dev/api/animations/useAnimation) function.

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

In the preceding code snippet, `transitionAnimation` is made reusable by declaring it as an export variable.

::: tip HELPFUL
The `height`, `opacity`, `backgroundColor`, and `time` inputs are replaced during runtime.

:::

You can also export a part of an animation.
For example, the following snippet exports the animation `trigger`.

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

From this point, you can import reusable animation variables into your component class.
For example, the following code snippet imports the `transitionAnimation` variable and uses it via the `useAnimation()` function.

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

## More on Angular animations

You might also be interested in the following:

- [Introduction to Angular animations](/en/guide/legacy-animations)
- [Transition and triggers](/en/guide/legacy-animations/transition-and-triggers)
- [Complex animation sequences](/en/guide/legacy-animations/complex-sequences)
- [Route transition animations](/en/guide/routing/route-transition-animations)
- [Migrating to Native CSS Animations](/en/guide/animations/migration)

