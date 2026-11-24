# 使用 DOM API {#using-dom-apis}

::: tip 提示
本指南假设你已经阅读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

Angular 会替你处理绝大多数 DOM 的创建、更新和移除工作。不过在极少数情况下，你可能需要
直接与组件（Component）的 DOM 交互。组件可以注入 ElementRef 来获取该组件
宿主元素（Host Element）的引用：

```ts
@Component(/* ... */)
export class ProfilePhoto {
  constructor() {
    const elementRef = inject(ElementRef);
    console.log(elementRef.nativeElement);
  }
}
```

`nativeElement` 属性引用的是宿主
[Element](https://developer.mozilla.org/docs/Web/API/Element) 实例。

你可以使用 Angular 的 `afterEveryRender` 和 `afterNextRender` 函数注册一个**渲染
回调**，它会在 Angular 完成页面渲染后运行。

```ts
@Component(/* ... */)
export class ProfilePhoto {
  constructor() {
    const elementRef = inject(ElementRef);
    afterEveryRender(() => {
      // 让该组件中的第一个 input 元素获得焦点。
      elementRef.nativeElement.querySelector('input')?.focus();
    });
  }
}
```

`afterEveryRender` 和 `afterNextRender` 必须在*注入上下文*（Injection Context）中调用，通常是
组件的构造函数。

**尽可能避免直接操作 DOM。** 始终优先在组件模板（Template）中表达 DOM 的结构，
并通过绑定（Binding）来更新 DOM。

**渲染回调永远不会在服务端渲染或构建时预渲染期间运行。**

**永远不要在其他 Angular 生命周期钩子（Lifecycle Hook）中直接操作 DOM**。除了渲染回调之外，Angular 不
保证组件的 DOM 在任何其他时刻都已完全渲染。
此外，在其他生命周期钩子中读取或修改 DOM 可能会
导致[布局抖动（layout thrashing）](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing)，
从而对页面性能产生负面影响。

## 使用组件的渲染器 {#using-a-component-s-renderer}

组件可以注入 `Renderer2` 的实例，来执行某些与其他 Angular 特性相关联的
DOM 操作。

由组件的 `Renderer2` 创建的任何 DOM 元素都会参与该
组件的[样式封装](/guide/components/styling#style-scoping)。

某些 `Renderer2` API 还与 Angular 的动画系统相关联。你可以使用 `setProperty`
方法更新合成动画属性，并使用 `listen` 方法为合成动画事件添加
事件监听器（Event Listener）。详情请参阅[动画](/guide/animations)指南。

除了这两种特定的用例之外，使用 `Renderer2` 和使用原生
DOM API 没有任何区别。两者都可以在服务端渲染和构建时预渲染中工作，但服务端的 DOM 缺少
仅浏览器提供的 API，例如布局测量和各种观察器（observer）。

## 何时使用 DOM API {#when-to-use-dom-apis}

虽然 Angular 处理了大多数渲染相关的事务，但某些行为可能仍然需要使用 DOM API。一些
常见的用例包括：

- 管理元素焦点
- 测量元素的几何尺寸，例如使用 `getBoundingClientRect`
- 读取元素的文本内容
- 设置原生观察器，例如
  [`MutationObserver`](https://developer.mozilla.org/docs/Web/API/MutationObserver)、
  [`ResizeObserver`](https://developer.mozilla.org/docs/Web/API/ResizeObserver) 或
  [`IntersectionObserver`](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API)。

避免插入、移除和修改 DOM 元素。尤其是，**永远不要直接设置
元素的 `innerHTML` 属性**，这会让你的应用容易受到
[跨站脚本（XSS）攻击](https://developer.mozilla.org/docs/Glossary/Cross-site_scripting)。
Angular 的模板绑定（包括对 `innerHTML` 的绑定）内置了有助于
防范 XSS 攻击的保护措施。详情请参阅[安全指南](/best-practices/security)。
