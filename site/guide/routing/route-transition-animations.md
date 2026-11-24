# 路由过渡动画 {#route-transition-animations}

路由过渡动画（route transition animation）会在 Angular 应用的不同视图之间导航（navigation）时提供流畅的视觉过渡，从而提升用户体验。[Angular 路由器（Router）](/guide/routing)内置了对浏览器视图过渡 API（View Transitions API）的支持，可以在受支持的浏览器中为路由切换提供无缝动画。

## 视图过渡的工作原理 {#how-view-transitions-work}

视图过渡使用浏览器原生的 [`document.startViewTransition` API](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition)，在应用的不同状态之间创建流畅的动画。该 API 的工作步骤如下：

1. **捕获当前状态** - 浏览器为当前页面截图
2. **执行 DOM 更新** - 运行你的回调函数来更新 DOM
3. **捕获新状态** - 浏览器捕获更新后的页面状态
4. **播放过渡** - 浏览器在新旧状态之间播放动画

下面是 `startViewTransition` API 的基本结构：

```ts
document.startViewTransition(async () => {
  await updateTheDOMSomehow();
});
```

关于该浏览器 API 的更多细节，请参阅 [Chrome 说明文档](https://developer.chrome.com/docs/web-platform/view-transitions)。

## 路由器如何使用视图过渡 {#how-the-router-uses-view-transitions}

Angular 路由器把视图过渡集成到导航生命周期中，从而实现无缝的路由切换。在导航过程中，路由器会：

1. **完成导航准备工作** - 执行路由匹配、[延迟加载（lazy loading）](/guide/routing/loading-strategies#lazily-loaded-components-and-routes)、[守卫](/guide/routing/route-guards)、[资源（Resource）](/guide/routing/data-fetching-with-resources)和[解析器](/guide/routing/data-resolvers)
2. **启动视图过渡** - 当路由准备好激活时，路由器调用 `startViewTransition`
3. **更新 DOM** - 路由器在过渡回调中激活新路由并停用旧路由
4. **完成过渡** - 当 Angular 完成渲染后，过渡的 Promise 会被解析

路由器的视图过渡集成是一种[渐进增强](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement)。当浏览器不支持视图过渡 API 时，路由器会在不播放动画的情况下执行普通的 DOM 更新，确保应用在所有浏览器中都能正常工作。

## 在路由器中启用视图过渡 {#enabling-view-transitions-in-the-router}

在[路由器配置](/guide/routing/define-routes#adding-the-router-to-your-application)中添加 `withViewTransitions` 特性即可启用视图过渡。Angular 同时支持独立（standalone）引导和 NgModule 引导两种方式：

### 独立引导 {#standalone-bootstrap}

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withViewTransitions} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(MyApp, {
  providers: [provideRouter(routes, withViewTransitions())],
});
```

### NgModule 引导 {#ngmodule-bootstrap}

```ts
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableViewTransitions: true})],
})
export class AppRouting {}
```

[在 StackBlitz 上试试 "count" 示例](https://stackblitz.com/edit/stackblitz-starters-2dnvtm?file=src%2Fmain.ts)

这个示例演示了如何用路由器导航来代替直接调用 `startViewTransition` 进行计数器更新。

## 使用 CSS 自定义过渡 {#customizing-transitions-with-css}

你可以使用 CSS 自定义视图过渡，创造独特的动画效果。浏览器会创建独立的过渡元素，你可以用 CSS 选择器（selector）来选中它们。

要创建自定义过渡：

1. **添加 view-transition-name** - 为想要添加动画的元素指定唯一名称
2. **定义全局动画** - 在全局样式中创建 CSS 动画
3. **选中过渡伪元素** - 使用 `::view-transition-old()` 和 `::view-transition-new()` 选择器

下面的示例为计数器元素添加了旋转效果：

```css
/* 定义关键帧动画 */
@keyframes rotate-out {
  to {
    transform: rotate(90deg);
  }
}

@keyframes rotate-in {
  from {
    transform: rotate(-90deg);
  }
}

/* 选中视图过渡伪元素 */
::view-transition-old(count),
::view-transition-new(count) {
  animation-duration: 200ms;
  animation-name: -ua-view-transition-fade-in, rotate-in;
}

::view-transition-old(count) {
  animation-name: -ua-view-transition-fade-out, rotate-out;
}
```

::: warning 重要
请在全局样式文件中定义视图过渡动画，而不是在组件样式中定义。Angular 的[视图封装（view encapsulation）](/guide/components/styling#style-scoping)会限定组件样式的作用范围，导致这些样式无法正确选中过渡伪元素。

:::

[在 StackBlitz 上试试更新后的 “count” 示例](https://stackblitz.com/edit/stackblitz-starters-fwn4i7?file=src%2Fmain.ts)

## 使用 onViewTransitionCreated 进行高级过渡控制 {#advanced-transition-control-with-onviewtransitioncreated}

`withViewTransitions` 特性接受一个选项对象，其中的 `onViewTransitionCreated` 回调可用于对视图过渡进行高级控制。这个回调：

- 在[注入上下文（injection context）](/guide/di/dependency-injection-context#run-within-an-injection-context)中运行
- 接收一个 [`ViewTransitionInfo`](https://angular.dev/api/router/ViewTransitionInfo) 对象，其中包含：
  - 来自 `startViewTransition` 的 `ViewTransition` 实例
  - 导航起点路由的 [`ActivatedRouteSnapshot`](https://angular.dev/api/router/ActivatedRouteSnapshot)
  - 导航目标路由的 [`ActivatedRouteSnapshot`](https://angular.dev/api/router/ActivatedRouteSnapshot)

你可以使用这个回调，根据导航上下文自定义过渡行为。例如，可以针对特定类型的导航跳过过渡：

```ts
import {inject} from '@angular/core';
import {Router, withViewTransitions, isActive, IsActiveMatchOptions} from '@angular/router';

withViewTransitions({
  onViewTransitionCreated: ({transition}) => {
    const router = inject(Router);
    const targetUrl = router.currentNavigation()!.finalUrl!;

    // 如果只有片段或查询参数发生变化，则跳过过渡
    const config: Partial<IsActiveMatchOptions> = {
      paths: 'exact',
      matrixParams: 'exact',
      fragment: 'ignored',
      queryParams: 'ignored',
    };

    const isTargetRouteCurrent = isActive(targetUrl, router, config);

    if (isTargetRouteCurrent()) {
      transition.skipTransition();
    }
  },
});
```

这个示例会在导航只改变 [URL 片段或查询参数](/guide/routing/read-route-state#query-parameters)时（例如同一页面内的锚点链接）跳过视图过渡。`skipTransition()` 方法会阻止动画播放，但仍允许导航完成。

## 尊重用户的动效偏好 {#respecting-the-user-s-motion-preferences}

无论用户的 [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) 设置如何，路由器都会运行视图过渡。偏好减少动效并不一定意味着用户完全不想要任何动效，因此框架把选择权留给应用：你可以为这些用户[提供更柔和的动画](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#react_to_the_reduced_motion_preference)，也可以通过 `onViewTransitionCreated` 回调完全跳过过渡：

```ts
withViewTransitions({
  onViewTransitionCreated: ({transition}) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      transition.skipTransition();
    }
  },
});
```

## 改编自 Chrome 说明文档的 Angular 示例 {#examples-from-the-chrome-explainer-adapted-to-angular}

以下示例改编自 Chrome 团队的文档，演示了在 Angular 路由器中使用的各种视图过渡技巧：

### 参与过渡的元素不必是同一个 DOM 元素 {#transitioning-elements-don-t-need-to-be-the-same-dom-element}

只要不同的 DOM 元素共享同一个 `view-transition-name`，它们之间就可以平滑过渡。

- [Chrome 说明文档](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#transitioning_elements_dont_need_to_be_the_same_dom_element)
- [StackBlitz 上的 Angular 示例](https://stackblitz.com/edit/stackblitz-starters-dh8npr?file=src%2Fmain.ts)

### 自定义进入和退出动画 {#custom-entry-and-exit-animations}

为路由过渡期间进入和离开视口的元素创建独特的动画。

- [Chrome 说明文档](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#custom_entry_and_exit_transitions)
- [StackBlitz 上的 Angular 示例](https://stackblitz.com/edit/stackblitz-starters-8kly3o)

### 异步 DOM 更新与等待内容 {#async-dom-updates-and-waiting-for-content}

Angular 路由器优先保证过渡立即进行，而不是等待额外内容加载完成。

- [Chrome 说明文档](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#async_dom_updates_and_waiting_for_content)

::: info 注意
Angular 路由器没有提供延迟视图过渡的方式。这一设计决策可以防止页面在等待额外内容时变得无法交互。正如 Chrome 文档所说：“在此期间页面处于冻结状态，因此这里的延迟应尽可能短……在某些情况下，最好完全避免延迟，直接使用已有的内容。”

:::

### 使用视图过渡类型处理多种视图过渡样式 {#handle-multiple-view-transition-styles-with-view-transition-types}

使用视图过渡类型，根据导航上下文应用不同的动画样式。

- [Chrome 说明文档](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#view-transition-types)
- [StackBlitz 上的 Angular 示例](https://stackblitz.com/edit/stackblitz-starters-vxzcam)

### 通过视图过渡根元素上的类名处理多种视图过渡样式（已弃用） {#handle-multiple-view-transition-styles-with-a-class-name-on-the-view-transition-root-deprecated}

这种方法在过渡根元素上使用 CSS 类来控制动画样式。

- [Chrome 说明文档](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#changing-on-navigation-type)
- [StackBlitz 上的 Angular 示例](https://stackblitz.com/edit/stackblitz-starters-nmnzzg?file=src%2Fmain.ts)

### 过渡时不冻结其他动画 {#transitioning-without-freezing-other-animations}

在视图过渡期间保持页面上的其他动画，打造更具动感的用户体验。

- [Chrome 说明文档](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#transitioning-without-freezing)
- [StackBlitz 上的 Angular 示例](https://stackblitz.com/edit/stackblitz-starters-76kgww)

### 使用 JavaScript 实现动画 {#animating-with-javascript}

在复杂的动画场景中，使用 JavaScript API 以编程方式控制视图过渡。

- [Chrome 说明文档](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#animating-with-javascript)
- [StackBlitz 上的 Angular 示例](https://stackblitz.com/edit/stackblitz-starters-cklnkm)
