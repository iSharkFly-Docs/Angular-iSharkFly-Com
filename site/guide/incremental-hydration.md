# 增量水合 {#incremental-hydration}

**增量水合**（Incremental Hydration）是一种高级的[水合](/guide/hydration)方式，它可以让应用的某些部分保持未水合（dehydrated）状态，并在需要时*逐步*触发这些部分的水合。

## 为什么要使用增量水合？ {#why-use-incremental-hydration}

增量水合是在完整应用水合基础上的一项性能改进。它能生成更小的初始包（bundle），同时仍然提供与完整应用水合相当的最终用户体验。更小的包可以缩短初始加载时间，降低 [First Input Delay (FID)](https://web.dev/fid) 和 [Cumulative Layout Shift (CLS)](https://web.dev/cls)。

增量水合还能让你对以前无法延迟的内容使用可延迟视图（Deferrable Views，`@defer`）。具体来说，你现在可以对首屏（above the fold）内容使用可延迟视图。在增量水合出现之前，把 `@defer` 块放在首屏会先渲染占位内容，随后再被 `@defer` 块的主模板内容替换，从而导致布局偏移。有了增量水合，`@defer` 块的主模板会直接渲染，水合时不会产生布局偏移。

## 如何在 Angular 中启用增量水合？ {#how-do-you-enable-incremental-hydration-in-angular}

对于已经使用服务端渲染（SSR）并启用了水合的应用，你可以启用增量水合。请先按照 [Angular SSR 指南](/guide/ssr)启用服务端渲染，再按照 [Angular 水合指南](/guide/hydration)启用水合。

使用 `provideClientHydration()` 时，增量水合默认是启用的。

```ts
import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [provideClientHydration()],
});
```

::: info 注意
增量水合依赖于[事件重放](/guide/hydration#capturing-and-replaying-events)，并会自动启用它。如果你的列表中已经有 `withEventReplay()`，可以放心地把它删掉。

:::

要退出增量水合，请使用 `withNoIncrementalHydration()`：

```ts
import {
  bootstrapApplication,
  provideClientHydration,
  withNoIncrementalHydration,
} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [provideClientHydration(withNoIncrementalHydration())],
});
```

## 增量水合是如何工作的？ {#how-does-incremental-hydration-work}

增量水合建立在完整应用[水合](/guide/hydration)、[可延迟视图](/guide/templates/defer)和[事件重放](/guide/hydration#capturing-and-replaying-events)的基础之上。借助增量水合，你可以为 `@defer` 块添加额外的触发器（trigger），用来定义增量水合的边界。为 defer 块添加 `hydrate` 触发器，就是告诉 Angular 在服务端渲染期间加载该 defer 块的依赖，并渲染主模板而不是 `@placeholder`。在客户端渲染时，这些依赖仍然是延迟加载的，defer 块的内容会保持未水合状态，直到它的 `hydrate` 触发器触发。该触发器会让 defer 块去获取依赖并对内容进行水合。在水合之前由用户触发的任何浏览器事件（特别是与组件中注册的监听器相匹配的事件）都会被放入队列，并在水合过程完成后重放。

## 使用触发器控制内容的水合 {#controlling-hydration-of-content-with-triggers}

你可以指定**水合触发器**（hydrate trigger），用来控制 Angular 何时加载已延迟的内容并对其进行水合。这些是额外的触发器，可以与常规的 `@defer` 触发器一起使用。

每个 `@defer` 块可以有多个水合事件触发器，用分号（`;`）分隔。只要*任意*一个触发器触发，Angular 就会触发水合。

水合触发器有三种类型：`hydrate on`、`hydrate when` 和 `hydrate never`。

### `hydrate on` {#hydrate-on}

`hydrate on` 指定 `@defer` 块在什么条件下触发水合。

可用的触发器如下：

| 触发器                                              | 说明                                                                   |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| [`hydrate on idle`](#hydrate-on-idle)               | 在浏览器空闲时触发。支持可选的超时时间。                               |
| [`hydrate on viewport`](#hydrate-on-viewport)       | 在指定内容进入视口时触发                                               |
| [`hydrate on interaction`](#hydrate-on-interaction) | 在用户与指定元素交互时触发                                             |
| [`hydrate on hover`](#hydrate-on-hover)             | 在鼠标悬停于指定区域时触发                                             |
| [`hydrate on immediate`](#hydrate-on-immediate)     | 在非延迟内容渲染完成后立即触发                                         |
| [`hydrate on timer`](#hydrate-on-timer)             | 在指定时长后触发                                                       |

#### `hydrate on idle` {#hydrate-on-idle}

`hydrate on idle` 触发器会在浏览器进入空闲状态后（基于 `requestIdleCallback`）加载可延迟视图的依赖并对内容进行水合。

你可以选择以毫秒为单位指定一个超时时间，它会传给 [`requestIdleCallback`](https://developer.mozilla.org/docs/Web/API/Window/requestIdleCallback)。如果浏览器没有及时调度回调，这项工作最迟会在指定的超时时间到达时执行。

```html
@defer (hydrate on idle) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}

<!-- 超时时间为 500ms -->
@defer (hydrate on idle(500)) {
  <large-cmp />
}
```

#### `hydrate on viewport` {#hydrate-on-viewport}

`hydrate on viewport` 触发器会在指定内容进入视口时，使用
[Intersection Observer API](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API) 加载可延迟视图的依赖，并对应用中相应的部分进行水合。

```html
@defer (hydrate on viewport) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on interaction` {#hydrate-on-interaction}

`hydrate on interaction` 触发器会在用户通过
`click` 或 `keydown` 事件与指定元素交互时，加载可延迟视图的依赖并对内容进行水合。

```html
@defer (hydrate on interaction) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on hover` {#hydrate-on-hover}

`hydrate on hover` 触发器会在鼠标通过
`mouseover` 和 `focusin` 事件悬停于触发区域时，加载可延迟视图的依赖并对内容进行水合。

```html
@defer (hydrate on hover) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on immediate` {#hydrate-on-immediate}

`hydrate on immediate` 触发器会立即加载可延迟视图的依赖并对内容进行水合。这意味着一旦所有其他非延迟内容渲染完成，
延迟块就会立即加载。

```html
@defer (hydrate on immediate) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `hydrate on timer` {#hydrate-on-timer}

`hydrate on timer` 触发器会在指定时长之后加载可延迟视图的依赖并对内容进行水合。

```html
@defer (hydrate on timer(500ms)) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

时长参数必须以毫秒（`ms`）或秒（`s`）为单位指定。

### `hydrate when` {#hydrate-when}

`hydrate when` 触发器接受一个自定义的条件表达式，当
条件变为真值时，加载可延迟视图的依赖并对内容进行水合。

```html
@defer (hydrate when condition) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

::: info 注意
只有当 `hydrate when` 所在的 `@defer` 块是最顶层的未水合块时，其条件才会触发。为触发器提供的条件
是在父组件中指定的，父组件必须先存在，触发器才能被触发。如果父级块处于未水合状态，Angular 还无法
解析该表达式。

:::

### `hydrate never` {#hydrate-never}

`hydrate never` 允许用户指定 defer 块中的内容无限期保持未水合状态，实际上成为静态
内容。注意，这只适用于初始渲染。在之后的客户端渲染中，带有 `hydrate never` 的 `@defer` 块
仍然会获取依赖，因为水合只适用于服务端渲染内容的初始加载。在下面的示例中，之后的客户端
渲染会在进入视口时加载 `@defer` 块的依赖。

```html
@defer (on viewport; hydrate never) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

::: info 注意
使用 `hydrate never` 会阻止给定 `@defer` 块下整个嵌套子树的水合。嵌套在该块下面的内容不会再触发任何其他 `hydrate` 触发器。

:::

## 水合触发器与常规触发器配合使用 {#hydrate-triggers-alongside-regular-triggers}

水合触发器是与 `@defer` 块上的常规触发器一起使用的额外触发器。水合是一种针对初始加载的优化，这意味着水合触发器只适用于初始加载。之后的任何客户端渲染仍会使用常规触发器。

```html
@defer (on idle; hydrate on interaction) {
  <example-cmp />
} @placeholder {
  <div>Example Placeholder</div>
}
```

在这个示例中，初始加载时适用 `hydrate on interaction`，与 `<example-cmp />` 组件交互时会触发水合。在之后任何由客户端渲染的页面加载中（例如用户点击某个 routerLink，加载了包含该组件的页面），则适用 `on idle`。

## 增量水合如何与嵌套的 `@defer` 块配合工作？ {#how-does-incremental-hydration-work-with-nested-defer-blocks}

Angular 的组件和依赖体系是分层的，这意味着对任何组件进行水合，都要求它的所有父级也已经完成水合。因此，如果在一组嵌套的未水合 `@defer` 块中，某个子 `@defer` 块触发了水合，那么水合会从最顶层的未水合 `@defer` 块开始，一直向下到被触发的子块，并按此顺序依次进行。

```html
@defer (hydrate on interaction) {
  <parent-block-cmp />
  @defer (hydrate on hover) {
    <child-block-cmp />
  } @placeholder {
    <div>Child placeholder</div>
  }
} @placeholder {
  <div>Parent Placeholder</div>
}
```

在上面的示例中，鼠标悬停在嵌套的 `@defer` 块上会触发水合。包含 `<parent-block-cmp />` 的父级 `@defer` 块会先完成水合，随后包含 `<child-block-cmp />` 的子 `@defer` 块再完成水合。

## 约束条件 {#constraints}

增量水合与完整应用水合有着相同的约束条件，包括对直接操作 DOM 的限制以及要求 HTML 结构有效。更多详情请访问[水合指南的约束条件](/guide/hydration#constraints)一节。

## 我还需要指定 `@placeholder` 块吗？ {#do-i-still-need-to-specify-placeholder-blocks}

需要。增量水合不会使用 `@placeholder` 块的内容，但在之后的客户端渲染场景中仍然需要 `@placeholder`。如果你的内容不在初始加载的路由（route）上，那么任何导航到包含该 `@defer` 块内容的路由时，它都会像常规的 `@defer` 块一样渲染。因此，在这些客户端渲染场景中会渲染 `@placeholder`。
