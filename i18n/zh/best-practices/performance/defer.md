# 使用 `@defer` 延迟加载

可延迟视图（Deferrable Views），也就是 `@defer` 块，通过推迟加载那些对页面初始渲染并非绝对必要的代码，来减小应用的初始包体积。这通常能加快初始加载，并改善 Core Web Vitals（CWV），主要是最大内容绘制（LCP）和首字节时间（TTFB）。

要使用这项功能，你可以用 @defer 块声明式地包裹模板中的一部分：

```html
@defer {
  <large-component />
}
```

`@defer` 块中所有组件、指令和管道的代码都会被拆分到一个单独的 JavaScript 文件中，只在必要时、在模板其余部分渲染完成之后才加载。

可延迟视图支持多种触发器（trigger）、预取选项，以及用于管理占位、加载中和错误状态的子块。

## 哪些依赖会被延迟加载？

加载应用时，组件、指令、管道以及组件的 CSS 样式都可以被延迟加载。

要让 `@defer` 块中的依赖被延迟加载，它们需要满足两个条件：

1. **它们必须是独立的（standalone）。** 非独立的依赖无法被延迟加载，即使位于 `@defer` 块中，也仍然会被立即加载。
1. **在同一个文件中，不能在 `@defer` 块之外引用它们。** 如果在 `@defer` 块之外引用了它们，或者在 ViewChild 查询中引用了它们，这些依赖就会被立即加载。

`@defer` 块中使用的组件、指令和管道的*传递性*依赖不一定必须是独立的；传递性依赖仍然可以在 `NgModule` 中声明，并参与延迟加载。

Angular 编译器会为 `@defer` 块中使用的每个组件、指令和管道生成一条[动态导入](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)语句。所有导入都解析完成后，块的主要内容才会渲染。Angular 不保证这些导入的顺序。

## 如何管理延迟加载的不同阶段

`@defer` 块有几个子块，让你可以优雅地处理延迟加载过程中的不同阶段。

### `@defer`

这是主块，定义了要延迟加载的那部分内容。它一开始不会渲染：只有当指定的[触发器](#controlling-deferred-content-loading-with-triggers)发生，或者满足 `when` 条件时，延迟内容才会加载并渲染。

默认情况下，`@defer` 块会在浏览器变为[空闲](/guide/templates/defer#idle)状态时触发。

```html
@defer {
  <large-component />
}
```

### 使用 `@placeholder` 显示占位内容

默认情况下，defer 块在被触发之前不会渲染任何内容。

`@placeholder` 是一个可选块，声明在 `@defer` 块被触发之前要显示什么内容。

```html
@defer {
  <large-component />
} @placeholder {
  <p>Placeholder content</p>
}
```

虽然是可选的，但某些触发器可能需要有 `@placeholder` 或[模板引用变量](/guide/templates/variables#template-reference-variables)才能工作。更多细节请参阅[触发器](#controlling-deferred-content-loading-with-triggers)一节。

加载完成后，Angular 会用主要内容替换占位内容。占位部分可以使用任何内容，包括普通 HTML、组件、指令和管道。请记住，*占位块的依赖会被立即加载*。

`@placeholder` 块接受一个可选参数，用来指定占位内容首次渲染后至少要显示的时长 `minimum`。

```html
@defer {
  <large-component />
} @placeholder (minimum 500ms) {
  <p>Placeholder content</p>
}
```

`minimum` 参数以毫秒（ms）或秒（s）为单位指定。如果延迟依赖获取得很快，可以用这个参数防止占位内容快速闪烁。

### 使用 `@loading` 显示加载中内容

`@loading` 块是一个可选块，让你声明在延迟依赖加载期间显示的内容。一旦触发加载，它就会替换 `@placeholder` 块。

```html
@defer {
  <large-component />
} @loading {
  <img alt="loading..." src="loading.gif" />
} @placeholder {
  <p>Placeholder content</p>
}
```

它的依赖会被立即加载（与 `@placeholder` 类似）。

`@loading` 块接受两个可选参数，用于防止在延迟依赖获取得很快时出现内容快速闪烁：

- `minimum`：这个占位内容至少要显示的时长
- `after`：开始加载后，等待多长时间才显示加载中模板

```html
@defer {
  <large-component />
} @loading (after 100ms; minimum 1s) {
  <img alt="loading..." src="loading.gif" />
}
```

这两个参数都以毫秒（ms）或秒（s）为单位指定。此外，两个参数的计时器都会在触发加载后立即开始。

### 使用 `@error` 在延迟加载失败时显示错误状态

`@error` 块是一个可选块，在延迟加载失败时显示。与 `@placeholder` 和 `@loading` 类似，@error 块的依赖也会被立即加载。

```html
@defer {
  <large-component />
} @error {
  <p>Failed to load large component.</p>
}
```

## 使用触发器控制延迟内容的加载

你可以指定**触发器**来控制 Angular 何时加载并显示延迟内容。

当 `@defer` 块被触发时，它会用延迟加载的内容替换占位内容。

可以用分号 `;` 分隔来定义多个事件触发器，它们会以「或」条件进行计算。

触发器有两种类型：`on` 和 `when`。

### `on`

`on` 指定 `@defer` 块在什么条件下被触发。

可用的触发器如下：

| 触发器 | 说明 |
| ----------------------------- | ---------------------------------------------------------------------- |
| [`idle`](#idle) | 浏览器空闲时触发。支持可选的超时时间。 |
| [`viewport`](#viewport) | 指定内容进入视口时触发 |
| [`interaction`](#interaction) | 用户与指定元素交互时触发 |
| [`hover`](#hover) | 鼠标悬停在指定区域上时触发 |
| [`immediate`](#immediate) | 非延迟内容渲染完成后立即触发 |
| [`timer`](#timer) | 经过指定时长后触发 |

#### `idle`

`idle` 触发器基于 requestIdleCallback，在浏览器进入空闲状态后加载延迟内容。这是 defer 块的默认行为。

你可以选择指定一个以毫秒为单位的超时时间，它会被传给 [`requestIdleCallback`](https://developer.mozilla.org/docs/Web/API/Window/requestIdleCallback)。如果浏览器没有及时调度回调，这项工作最迟也会在指定的超时时间到达时运行。

```html
<!-- @defer (on idle) -->
@defer {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}

<!-- 带 500ms 超时 -->
@defer (on idle(500)) {
  <large-cmp />
}
```

##### 自定义 `idle` 行为

你可以提供自己的 `IdleService` 实现，并在应用的提供者中通过 `provideIdleServiceWith` 注册它，从而自定义 `idle` 触发器。

```ts
@Service()
class CustomIdleService implements IdleService {
  requestOnIdle(callback: (deadline?: IdleDeadline) => void, options?: IdleRequestOptions): number {
    // 可以在这里实现自定义的空闲调度逻辑。
    return requestIdleCallback(callback, options);
  }

  cancelOnIdle(id: number) {
    // 在这里实现自定义的空闲取消逻辑。
  }
}

bootstrapApplication(App, {
  providers: [provideIdleServiceWith(CustomIdleService)],
});
```

#### `viewport`

`viewport` 触发器使用 [Intersection Observer API](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API)，在指定内容进入视口时加载延迟内容。被观察的内容可以是 `@placeholder` 中的内容，也可以是一个显式的元素引用。

默认情况下，`@defer` 会观察占位内容是否进入视口。以这种方式使用的占位内容必须只有一个根元素。

```html
@defer (on viewport) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

或者，你也可以在 `@defer` 块所在的同一个模板中，指定一个[模板引用变量](/guide/templates/variables)，作为要观察是否进入视口的元素。这个变量作为参数传给 viewport 触发器。

```html
<div #greeting>Hello!</div>
@defer (on viewport(greeting)) {
  <greetings-cmp />
}
```

如果你想自定义 `IntersectionObserver` 的选项，`viewport` 触发器支持传入一个对象字面量。这个字面量支持 `IntersectionObserver` 第二个参数的所有属性，`root` 除外。使用对象字面量写法时，必须通过 `trigger` 属性传入触发元素。

```html
<div #greeting>Hello!</div>

<!-- 带选项和触发元素 -->
@defer (
  on viewport({trigger: greeting, rootMargin: '100px', scrollMargin: '50px', threshold: 0.5})
) {
  <greetings-cmp />
}

<!-- 带选项，触发元素为隐式的占位内容 -->
@defer (on viewport({rootMargin: '100px', scrollMargin: '50px', threshold: 0.5})) {
  <greetings-cmp />
} @placeholder {
  <div>Implied trigger</div>
}
```

#### `interaction`

`interaction` 触发器在用户通过 `click` 或 `keydown` 事件与指定元素交互时加载延迟内容。

默认情况下，占位内容充当交互元素。以这种方式使用的占位内容必须只有一个根元素。

```html
@defer (on interaction) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

或者，你也可以在 `@defer` 块所在的同一个模板中，指定一个[模板引用变量](/guide/templates/variables)，作为要监听交互的元素。这个变量作为参数传给 interaction 触发器。

```html
<div #greeting>Hello!</div>
@defer (on interaction(greeting)) {
  <greetings-cmp />
}
```

#### `hover`

`hover` 触发器在鼠标通过 `mouseover` 和 `focusin` 事件悬停到触发区域上时加载延迟内容。

默认情况下，占位内容充当交互元素。以这种方式使用的占位内容必须只有一个根元素。

```html
@defer (on hover) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

或者，你也可以在 `@defer` 块所在的同一个模板中，指定一个[模板引用变量](/guide/templates/variables)，作为被悬停的元素。这个变量作为参数传给 hover 触发器。

```html
<div #greeting>Hello!</div>
@defer (on hover(greeting)) {
  <greetings-cmp />
}
```

#### `immediate`

`immediate` 触发器会立即加载延迟内容。也就是说，一旦所有其他非延迟内容渲染完成，延迟块就会开始加载。

```html
@defer (on immediate) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

#### `timer`

`timer` 触发器会在指定时长之后加载延迟内容。

```html
@defer (on timer(500ms)) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

时长参数必须以毫秒（`ms`）或秒（`s`）为单位指定。

### `when`

`when` 触发器接受一个自定义的条件表达式，并在条件变为真值时加载延迟内容。

```html
@defer (when condition) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

这是一次性操作：如果条件在变为真值之后又变回假值，`@defer` 块不会恢复为占位内容。

## 使用 `prefetch` 预取数据

除了指定决定何时显示延迟内容的条件之外，你还可以选择指定一个**预取触发器**。这个触发器让你可以在显示延迟内容之前，就加载与 `@defer` 块相关的 JavaScript。

预取可以实现更高级的行为，例如在用户还没有真正看到或与 defer 块交互、但很可能马上就会交互时，提前开始预取资源，让资源更快可用。

你可以像指定块的主触发器一样指定预取触发器，只是要加上 `prefetch` 关键字作为前缀。块的主触发器和预取触发器之间用分号（`;`）分隔。

在下面的示例中，预取会在浏览器空闲时开始，而块的内容只有在用户与占位内容交互后才会渲染。

```html
@defer (on interaction; prefetch on idle) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}

<!-- 使用 500ms 空闲超时进行预取 -->
@defer (on interaction; prefetch on idle(500)) {
  <large-cmp />
}
```

## 测试 `@defer` 块

Angular 提供了一些 TestBed API，简化 `@defer` 块的测试，并让你在测试中触发不同的状态。默认情况下，测试中的 `@defer` 块会像在真实应用中一样依次经历各个状态。如果你想手动逐步切换状态，可以在 TestBed 配置中把 defer 块的行为切换为 `Manual`。

```ts
it('should render a defer block in different states', async () => {
  // 把 defer 块的行为配置为从「暂停」状态开始，以便手动控制。
  TestBed.configureTestingModule({deferBlockBehavior: DeferBlockBehavior.Manual});
  @Component({
    // ...
    template: `
      @defer {
        <large-component />
      } @placeholder {
        Placeholder
      } @loading {
        Loading...
      }
    `,
  })
  class ExampleA {}
  // 创建组件测试夹具。
  const componentFixture = TestBed.createComponent(ExampleA);
  // 获取所有 defer 块测试夹具的列表，并取第一个块。
  const deferBlockFixture = (await componentFixture.getDeferBlocks())[0];
  // 默认渲染占位状态。
  expect(componentFixture.nativeElement.innerHTML).toContain('Placeholder');
  // 渲染加载中状态并验证渲染结果。
  await deferBlockFixture.render(DeferBlockState.Loading);
  expect(componentFixture.nativeElement.innerHTML).toContain('Loading');
  // 渲染最终状态并验证输出。
  await deferBlockFixture.render(DeferBlockState.Complete);
  expect(componentFixture.nativeElement.innerHTML).toContain('large works!');
});
```

## `@defer` 能与 `NgModule` 一起使用吗？

`@defer` 块同时兼容独立的以及基于 NgModule 的组件、指令和管道。但是，**只有独立的组件、指令和管道才能被延迟加载**。基于 NgModule 的依赖不会被延迟加载，而是会包含在立即加载的包中。

## `@defer` 块与热模块重载（HMR）的兼容性

当热模块替换（HMR）处于启用状态时，所有 `@defer` 块的代码块都会被立即获取，覆盖所有已配置的触发器。要恢复标准的触发器行为，你必须用 `--no-hmr` 标志启动应用，禁用 HMR。

## `@defer` 如何与服务端渲染（SSR）和静态站点生成（SSG）配合工作？

默认情况下，在服务器上渲染应用时（无论使用 SSR 还是 SSG），defer 块总是渲染它的 `@placeholder`（如果没有指定占位内容，则什么也不渲染），并且不会调用触发器。在客户端，`@placeholder` 的内容会被水合（Hydration），触发器随之被激活。

要在服务器上渲染 `@defer` 块的主要内容（SSR 和 SSG 都适用），你可以启用[增量水合功能](/guide/incremental-hydration)，并为需要的块配置 `hydrate` 触发器。

## 桶文件与延迟加载的代码块

如果你使用了 `@defer`，但在构建输出中没有看到单独的延迟加载代码块，请检查你是如何导入被延迟的组件的。通过桶文件（`index.ts`）导入是一个常见的原因：打包工具会把桶文件视为单个模块，并把它的所有导出放在一起，因此不管有没有 `@defer`，你的组件最终都会进入主包。

```ts [index.ts]
export {HeavyComponent} from './heavy.component';
export {OtherComponent} from './other.component';
```

```ts [parent.component.ts]
import {Component} from '@angular/core';
import {HeavyComponent} from './index'; // 也会把 OtherComponent 一起引入

@Component({
  imports: [HeavyComponent],
  template: `@defer {
    <heavy-component />
  }`,
})
export class ParentComponent {}
```

解决方法很简单：直接从组件自己的文件中导入：

```ts
import {HeavyComponent} from './heavy.component';
```

这样打包工具就能把它拆分到单独的代码块中，并在触发器触发时延迟加载它。

## 延迟加载视图的最佳实践

### 避免嵌套 `@defer` 块引起级联加载

如果有嵌套的 `@defer` 块，它们应该使用不同的触发器，以免同时加载。同时加载会引起级联请求，可能对页面加载性能产生负面影响。

### 避免布局偏移

避免延迟加载那些在初始加载时就出现在用户视口中的组件。这样做会增加累积布局偏移（CLS），从而可能对 Core Web Vitals 产生负面影响。

如果确实需要这样做，请避免使用 `immediate`、`timer`、`viewport` 以及自定义的 `when` 触发器，因为它们会让内容在页面初始渲染期间加载。

### 关注无障碍

使用 `@defer` 块时，要考虑对使用屏幕阅读器等辅助技术的用户的影响。
聚焦到延迟区域的屏幕阅读器一开始会读出占位内容或加载中内容，但在延迟内容加载完成时，可能不会播报变化。

为了确保延迟内容的变化能被屏幕阅读器播报，你可以用一个带有 live 区域的元素包裹 `@defer` 块：

```html
<div aria-live="polite" aria-atomic="true">
  @defer (on timer(2000)) {
    <user-profile [user]="currentUser" />
  } @placeholder {
    Loading user profile...
  } @loading {
    Please wait...
  } @error {
    Failed to load profile
  }
</div>
```

这样可以确保在状态切换（占位 &rarr; 加载中 &rarr; 内容/错误）时，变化会被播报给用户。
