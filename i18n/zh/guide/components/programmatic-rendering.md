# 以编程方式渲染组件

::: tip 提示
本指南假设你已经阅读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

除了在模板（Template）中直接使用组件（Component）之外，你还可以通过编程方式动态渲染组件。
当一开始并不知道要用哪个组件（因此无法
在模板中直接引用它），而是取决于某些条件时，这种方式很有用。

以编程方式渲染组件主要有两种方法：在模板中使用 `NgComponentOutlet`，
或者在 TypeScript 代码中使用 `ViewContainerRef`。

::: tip 提示
对于延迟加载（Lazy Loading）的用例（例如你想推迟加载一个体积较大的组件），请考虑
改用内置的 [`@defer` 特性](/guide/templates/defer)。`@defer` 特性可以把
`@defer` 块中所有组件、指令（Directive）和管道（Pipe）的代码自动提取到单独的 JavaScript
代码块中，并根据配置的触发器（trigger）仅在需要时加载。

:::

## 使用 NgComponentOutlet

`NgComponentOutlet` 是一个结构型指令（Structural Directive），它可以在模板中动态渲染
指定的组件。

```ts
import {NgComponentOutlet} from '@angular/common';
import {Component, input, computed} from '@angular/core';

@Component({/*...*/})
export class AdminBio {
  /* ... */
}

@Component({/*...*/})
export class StandardBio {
  /* ... */
}

@Component({
  imports: [NgComponentOutlet],
  template: `
    <p>Profile for {{ user().name }}</p>
    <ng-container *ngComponentOutlet="bioComponent()" />
  `,
})
export class CustomDialog {
  user = input.required<User>();

  bioComponent = computed(() => {
    return this.user().isAdmin ? AdminBio : StandardBio;
  });
}
```

### 向动态渲染的组件传递输入

你可以使用 `ngComponentOutletInputs` 属性向动态渲染的组件传递输入（Input）。该属性接受一个对象，其键为输入名，值为输入的值。

```ts
@Component({
  selector: 'user-greeting',
  template: `
    <div>
      <p>User: {{ username() }}</p>
      <p>Role: {{ role() }}</p>
    </div>
  `,
})
export class UserGreeting {
  username = input.required<string>();
  role = input('guest');
}

@Component({
  selector: 'profile-view',
  imports: [NgComponentOutlet],
  template: `<ng-container *ngComponentOutlet="greetingComponent; inputs: greetingInputs()" />`,
})
export class ProfileView {
  greetingComponent = UserGreeting;
  greetingInputs = signal({username: 'ngAwesome', role: 'admin'});
}
```

每当 `greetingInputs` 信号（Signal）发生变化时，这些输入都会随之更新，从而让动态组件与父组件的状态保持同步。

### 提供内容投影

使用 `ngComponentOutletContent` 向动态渲染的组件传递要投影的内容。当动态组件使用 `<ng-content>` 来显示内容时，这会很有用。

```ts
@Component({
  selector: 'card-wrapper',
  template: `
    <div class="card">
      <ng-content />
    </div>
  `,
})
export class CardWrapper {}

@Component({
  imports: [NgComponentOutlet],
  template: `
    <ng-container *ngComponentOutlet="cardComponent; content: cardContent()" />

    <ng-template #contentTemplate>
      <h3>Dynamic Content</h3>
      <p>This content is projected into the card.</p>
    </ng-template>
  `,
})
export class DynamicCard {
  private vcr = inject(ViewContainerRef);
  cardComponent = CardWrapper;

  private contentTemplate = viewChild<TemplateRef<unknown>>('contentTemplate');

  cardContent = computed(() => {
    const template = this.contentTemplate();
    if (!template) return [];
    // 返回一个投影槽数组，每个元素代表一个 <ng-content> 槽。
    // CardWrapper 只有一个 <ng-content>，所以我们返回只含一个元素的数组。
    return [this.vcr.createEmbeddedView(template).rootNodes];
  });
}
```

::: info 注意
水合（Hydration）不支持投影通过原生 DOM API 创建的 DOM 节点，这会导致 [NG0503 错误](/errors/NG0503)。请使用 Angular API 创建要投影的内容，或者为该组件添加 `ngSkipHydration`。

:::

### 提供注入器

你可以使用 `ngComponentOutletInjector` 为动态创建的组件提供自定义注入器（Injector）。这可用于提供组件专属的服务（Service）或配置。

```ts
export const THEME_DATA = new InjectionToken<string>('THEME_DATA', {
  factory: () => 'light',
});

@Component({
  selector: 'themed-panel',
  template: `<div [class]="theme">...</div>`,
})
export class ThemedPanel {
  theme = inject(THEME_DATA);
}

@Component({
  selector: 'dynamic-panel',
  imports: [NgComponentOutlet],
  template: `<ng-container *ngComponentOutlet="panelComponent; injector: customInjector" />`,
})
export class DynamicPanel {
  panelComponent = ThemedPanel;

  customInjector = Injector.create({
    providers: [{provide: THEME_DATA, useValue: 'dark'}],
  });
}
```

### 访问组件实例

你可以借助该指令的 `exportAs` 特性访问动态创建的组件实例：

```ts
@Component({
  selector: 'counter',
  template: `<p>Count: {{ count() }}</p>`,
})
export class Counter {
  count = signal(0);
  increment() {
    this.count.update((c) => c + 1);
  }
}

@Component({
  imports: [NgComponentOutlet],
  template: `
    <ng-container [ngComponentOutlet]="counterComponent" #outlet="ngComponentOutlet" />

    <button (click)="outlet.componentInstance?.increment()">Increment</button>
  `,
})
export class CounterHost {
  counterComponent = Counter;
}
```

::: info 注意
在组件渲染之前，`componentInstance` 属性的值为 `null`。

:::

请参阅 [NgComponentOutlet API 参考](https://angular.dev/api/common/NgComponentOutlet)，了解
该指令功能的更多信息。

## 使用 ViewContainerRef

**视图容器**是 Angular 组件树中可以包含内容的节点。任何组件
或指令都可以注入 `ViewContainerRef`，以获取与该组件或指令在 DOM 中的位置
相对应的视图容器的引用。

你可以使用 `ViewContainerRef` 上的 `createComponent` 方法来动态创建并渲染
组件。当你用 `ViewContainerRef` 创建新组件时，Angular 会把它追加到
DOM 中，作为注入了该 `ViewContainerRef` 的组件或指令的下一个兄弟节点。

```ts
@Component({
  selector: 'leaf-content',
  template: `This is the leaf content`,
})
export class LeafContent {}

@Component({
  selector: 'outer-container',
  template: `
    <p>This is the start of the outer container</p>
    <inner-item />
    <p>This is the end of the outer container</p>
  `,
})
export class OuterContainer {}

@Component({
  selector: 'inner-item',
  template: `<button (click)="loadContent()">Load content</button>`,
})
export class InnerItem {
  private viewContainer = inject(ViewContainerRef);

  loadContent() {
    this.viewContainer.createComponent(LeafContent);
  }
}
```

在上面的例子中，点击“Load content”按钮会得到如下 DOM 结构：

```html
<outer-container>
  <p>This is the start of the outer container</p>
  <inner-item>
    <button>Load content</button>
  </inner-item>
  <leaf-content>This is the leaf content</leaf-content>
  <p>This is the end of the outer container</p>
</outer-container>
```

## 延迟加载组件

::: tip 提示
如果你想延迟加载某些组件，可以考虑改用内置的
[`@defer` 特性](/guide/templates/defer)。

:::

如果你的用例无法用 `@defer` 特性实现，你可以将 `NgComponentOutlet` 或
`ViewContainerRef` 与标准的 JavaScript [动态导入](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/import)结合使用。

```ts
@Component({
  ...,
  template: `
    <section>
      <h2>Basic settings</h2>
      <basic-settings />
    </section>
    <section>
      <h2>Advanced settings</h2>
      @if(!advancedSettings) {
        <button (click)="loadAdvanced()">
          Load advanced settings
        </button>
      }
      <ng-container *ngComponentOutlet="advancedSettings" />
    </section>
  `
})
export class AdminSettings {
  advancedSettings: {new(): AdvancedSettings} | undefined;

  async loadAdvanced() {
    const { AdvancedSettings } = await import('path/to/advanced_settings.js');
    this.advancedSettings = AdvancedSettings;
  }
}
```

上面的例子会在收到按钮点击后加载并显示 `AdvancedSettings`。

## 在创建时绑定输入、输出并设置宿主指令

在动态创建组件时，手动设置输入和订阅输出很容易出错。你常常需要编写额外的代码，仅仅是为了在组件实例化之后把绑定（Binding）连接起来。

为了简化这一过程，`createComponent` 和 `ViewContainerRef.createComponent` 都支持传入一个 `bindings` 数组，并借助 `inputBinding()`、`outputBinding()` 和 `twoWayBinding()` 等辅助函数预先配置输入和输出（Output）。你还可以指定一个 `directives` 数组来应用任意宿主指令（Host Directive）。这样，你就可以在一次声明式调用中，以类似模板绑定的方式以编程方式创建组件。

### 使用 `ViewContainerRef.createComponent` 创建宿主视图

`ViewContainerRef.createComponent` 会创建一个组件，并自动把它的宿主视图和宿主元素（Host Element）插入到容器的视图层次结构中容器所在的位置。当动态组件应当成为容器逻辑结构和视觉结构的一部分时（例如添加列表项或内联 UI），请使用这种方式。

相比之下，独立（Standalone）的 `createComponent` API 不会把新组件附加到任何现有的视图或 DOM 位置上——它会返回一个 `ComponentRef`，让你可以明确控制把组件的宿主元素放在哪里。

```ts
import {Component, input, model, output} from '@angular/core';

@Component({
  selector: 'app-warning',
  template: `
    @if (isExpanded()) {
      <section>
        <p>Warning: Action needed!</p>
        <button (click)="close.emit(true)">Close</button>
      </section>
    }
  `,
})
export class AppWarning {
  readonly canClose = input.required<boolean>();
  readonly isExpanded = model<boolean>();
  readonly close = output<boolean>();
}
```

```ts
import {
  Component,
  ViewContainerRef,
  signal,
  inputBinding,
  outputBinding,
  twoWayBinding,
  inject,
} from '@angular/core';
import {FocusTrap} from '@angular/cdk/a11y';
import {ThemeDirective} from '../theme.directive';

@Component({
  template: `<ng-container #container />`,
})
export class Host {
  private vcr = inject(ViewContainerRef);
  readonly canClose = signal(true);
  readonly isExpanded = signal(true);

  showWarning() {
    const compRef = this.vcr.createComponent(AppWarning, {
      bindings: [
        inputBinding('canClose', this.canClose),
        twoWayBinding('isExpanded', this.isExpanded),
        outputBinding<boolean>('close', (confirmed) => {
          console.log('Closed with result:', confirmed);
        }),
      ],
      directives: [
        FocusTrap,
        {type: ThemeDirective, bindings: [inputBinding('theme', () => 'warning')]},
      ],
    });
  }
}
```

在上面的例子中，动态创建的 **AppWarning** 组件的 `canClose` 输入绑定到了一个响应式信号，其 `isExpanded` 状态使用了双向绑定（Two-way Binding），并为 `close` 添加了输出监听器。`FocusTrap` 和 `ThemeDirective` 则通过 `directives` 附加到了宿主元素上。

### 使用 `createComponent` + `hostElement` 将弹出框附加到 `document.body`

当需要在当前视图层次结构之外渲染时（例如浮层），请使用这种方式。所提供的 `hostElement` 会成为该组件在 DOM 中的宿主，因此 Angular 不会再创建一个与选择器（Selector）匹配的新元素。你可以直接配置**绑定**。

```ts
import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  inputBinding,
  outputBinding,
  Service,
} from '@angular/core';
import {Popup} from './popup';

@Service()
export class PopupService {
  private readonly injector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);

  show(message: string) {
    // 为弹出框创建一个宿主元素
    const host = document.createElement('popup-host');

    // 在一次调用中创建组件并完成绑定
    const ref = createComponent(Popup, {
      environmentInjector: this.injector,
      hostElement: host,
      bindings: [
        inputBinding('message', () => message),
        outputBinding('closed', () => {
          document.body.removeChild(host);
          this.appRef.detachView(ref.hostView);
          ref.destroy();
        }),
      ],
    });

    // 注册组件的视图，使其参与变更检测周期。
    this.appRef.attachView(ref.hostView);
    // 把提供的宿主元素插入到 DOM 中（位于常规的 Angular 视图层次结构之外）。
    // 正是这一步让弹出框显示在屏幕上，通常用于浮层或模态框。
    document.body.appendChild(host);
  }
}
```

## 处理渲染错误

::: warning 重要
`onError` 选项及其 `ErrorDetails` 参数目前处于[开发者预览](/reference/releases#developer-preview)阶段。

:::

使用 `ViewContainerRef.createComponent` 或独立的 `createComponent` 函数动态创建组件时，你可以在选项对象中提供一个 `onError` 回调，用于处理在渲染或变更检测（Change Detection）阶段发生的错误。这相当于在模板中使用 `@error` 块的编程式写法。

```ts
viewContainerRef.createComponent(DynamicComponent, {
  onError: (err: Error, details: ErrorDetails) => {
    console.error('Component rendering failed:', err);
    // 渲染替代 UI 或记录指标
  },
});
```

::: info 注意
`onError` 回调只会捕获在渲染或变更检测阶段发生的错误，不会捕获组件实例化期间（例如在构造函数中）发生的错误。调用该 API 时，Angular 会同步抛出构造阶段的错误。

:::
