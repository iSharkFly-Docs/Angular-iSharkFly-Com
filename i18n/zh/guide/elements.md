# Angular 元素概览

*Angular 元素*（Angular elements）是打包为*自定义元素*（custom elements，也称为 Web Components）的 Angular 组件（component）。自定义元素是一项 Web 标准，可以用与框架无关的方式定义新的 HTML 元素。

[自定义元素](https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements)是一项 Web 平台特性，Angular 所支持的所有浏览器都可以使用它。
自定义元素扩展了 HTML，让你可以定义一个标签，其内容由 JavaScript 代码创建和控制。
浏览器会维护一个已定义自定义元素的 `CustomElementRegistry`，它把可实例化的 JavaScript 类映射到 HTML 标签上。

`@angular/elements` 包导出了一个 `createCustomElement()` API，它在 Angular 的组件接口和变更检测（change detection）功能与内置 DOM API 之间搭建了一座桥梁。

把组件转换为自定义元素后，浏览器就可以使用所需的全部 Angular 基础设施。
创建自定义元素简单直接，它会自动把组件定义的视图与变更检测和数据绑定（binding）连接起来，将 Angular 的功能映射到对应的内置 HTML 等价物上。

## 使用自定义元素

自定义元素会自行启动：它们在被添加到 DOM 时启动，在从 DOM 中移除时销毁。
自定义元素一旦被添加到任意页面的 DOM 中，其外观和行为就与其他 HTML 元素无异，不需要了解任何 Angular 术语或使用约定。

要把 `@angular/elements` 包添加到你的工作区，请运行以下命令：

::: code-group

```shell [npm]
npm install @angular/elements
```

```shell [yarn]
yarn add @angular/elements
```

```shell [pnpm]
pnpm add @angular/elements
```

```shell [bun]
bun add @angular/elements
```

:::

### 工作原理

`createCustomElement()` 函数会把组件转换为一个类，这个类可以作为自定义元素注册到浏览器中。
在把配置好的类注册到浏览器的自定义元素注册表后，你就可以在直接添加到 DOM 的内容中像使用内置 HTML 元素一样使用这个新元素：

```html
<my-popup message="Use Angular!" />
```

当你的自定义元素被放到页面上时，浏览器会创建已注册类的一个实例，并把它添加到 DOM 中。
其内容由组件的模板（template）提供，模板使用 Angular 模板语法，并基于组件和 DOM 数据进行渲染。
组件中的输入（input）属性对应于该元素的输入 attribute。

## 把组件转换为自定义元素

Angular 提供了 `createCustomElement()` 函数，用于把 Angular 组件及其依赖项一起转换为自定义元素。

该转换过程实现了 `NgElementConstructor` 接口，并创建一个
构造函数类，该类经过配置，可以生成组件的自启动实例。

使用浏览器原生的 [`customElements.define()`](https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define) 函数，把配置好的构造函数及其关联的自定义元素标签注册到浏览器的 [`CustomElementRegistry`](https://developer.mozilla.org/docs/Web/API/CustomElementRegistry) 中。
当浏览器遇到已注册元素的标签时，会使用该构造函数创建一个自定义元素实例。

::: warning 重要
避免使用组件的选择器（selector）作为自定义元素的标签名。
这可能导致意外行为，因为 Angular 会为同一个 DOM 元素创建两个组件实例：
一个是普通的 Angular 组件，另一个则使用自定义元素。

:::

### 映射

自定义元素会*承载*（host）一个 Angular 组件，在组件中定义的数据和逻辑与标准 DOM API 之间搭建桥梁。
组件的属性和逻辑会直接映射到 HTML attribute 和浏览器的事件系统。

- 创建 API 会解析组件，查找输入属性，并为自定义元素定义对应的 attribute。
  它会转换属性名，使其与不区分大小写的自定义元素兼容。
  生成的 attribute 名使用以短横线分隔的小写形式。
  例如，对于包含 `inputProp = input('', {alias: 'myInputProp'})` 的组件，对应的自定义元素会定义一个 `my-input-prop` attribute。

- 组件的输出（output）会作为 HTML [自定义事件](https://developer.mozilla.org/docs/Web/API/CustomEvent)派发，自定义事件的名称与输出名称一致。
  例如，对于包含 `valueChanged = output()` 的组件，对应的自定义元素会派发名为 "valueChanged" 的事件，所发出的数据存放在事件的 `detail` 属性中。
  如果你提供了别名，就会使用该别名；例如，`clicks = output<string>({alias: 'myClick'});` 会派发名为 "myClick" 的事件。

更多信息请参阅 Web Component 文档中的[创建自定义事件](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Events#creating_custom_events)。

## 示例：弹窗服务

要在运行时把组件添加到应用中，你可以使用 `createComponent` API [以编程方式渲染它](/guide/components/programmatic-rendering)。
采用这种方式时，周边的基础设施都需要你自己负责：把组件的宿主视图附加到 `ApplicationRef` 以便运行变更检测、设置它的输入、订阅它的输出，以及在移除组件时分离并清理视图。

使用 Angular 自定义元素可以让这个过程更简单、更透明，因为它会自动提供所有这些基础设施——你只需要定义想要的事件处理方式即可。

下面的弹窗服务（Popup Service）示例应用定义了一个组件，你既可以动态加载它，也可以把它转换为自定义元素。

| 文件              | 详情                                                                                                                                                                                                             |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `popup.ts`         | 定义一个简单的弹出元素，用于显示输入的消息，并带有一些动画和样式。                                                                                                                    |
| `popup.service.ts` | 创建一个可注入的服务（service），它提供两种调用 `Popup` 的不同方式：作为动态组件，或作为自定义元素。注意动态加载方式需要多得多的准备工作。        |
| `app.ts`           | 定义应用的根组件，它使用 `PopupService` 在运行时把弹窗添加到 DOM 中。应用运行时，根组件的构造函数会把 `Popup` 转换为自定义元素。 |

为了便于比较，该演示同时展示了这两种方式。
一个按钮使用动态加载方式添加弹窗，另一个按钮则使用自定义元素。
结果相同，但准备工作不同。

::: code-group

```ts [popup.ts]
import {Component, computed, input, output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'my-popup',
  template: `
    <span>Popup: {{ message() }}</span>
    <button type="button" (click)="closed.emit()">&#x2716;</button>
  `,
  animations: [
    trigger('state', [
      state('opened', style({transform: 'translateY(0%)'})),
      state('void, closed', style({transform: 'translateY(100%)', opacity: 0})),
      transition('* => *', animate('100ms ease-in')),
    ]),
  ],
  styles: [
    `
      :host {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: #009cff;
        height: 48px;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid black;
        font-size: 24px;
      }

      button {
        border-radius: 50%;
      }
    `,
  ],
  host: {
    '[@state]': 'state()',
  },
})
export class Popup {
  readonly message = input('');
  readonly closed = output<void>();

  readonly state = computed(() => (this.message() ? 'opened' : 'closed'));
}
```

```ts [popup.service.ts]
import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import {NgElement, WithProperties} from '@angular/elements';
import {Popup} from './popup';

@Injectable()
export class PopupService {
  private readonly injector = inject(EnvironmentInjector);
  private readonly applicationRef = inject(ApplicationRef);

  // 以前的动态加载方式要求你先搭建好基础设施，
  // 然后才能把弹窗添加到 DOM 中。
  showAsComponent(message: string) {
    // 创建元素
    const popup = document.createElement('popup-component');

    // 创建组件，并将其与元素关联起来
    const popupComponentRef = createComponent(Popup, {
      environmentInjector: this.injector,
      hostElement: popup,
    });

    // 附加到视图，让变更检测器知道需要运行
    this.applicationRef.attachView(popupComponentRef.hostView);

    // 监听关闭事件
    popupComponentRef.instance.closed.subscribe(() => {
      document.body.removeChild(popup);
      this.applicationRef.detachView(popupComponentRef.hostView);
    });

    // 设置消息
    popupComponentRef.setInput('message', message);

    // 添加到 DOM
    document.body.appendChild(popup);
  }

  // 这里使用新的自定义元素方式把弹窗添加到 DOM 中。
  showAsElement(message: string) {
    // 创建元素
    const popupEl: NgElement & WithProperties<Popup> = document.createElement(
      'popup-element',
    ) as any;

    // 监听关闭事件
    popupEl.addEventListener('closed', () => document.body.removeChild(popupEl));

    // 设置消息
    popupEl.setAttribute('message', message);
    // 添加到 DOM
    document.body.appendChild(popupEl);
  }
}
```

```ts [app.ts]
import {Component, Injector} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {Popup} from './popup';
import {PopupService} from './popup.service';

@Component({
  selector: 'app-root',
  template: `
    <input #input value="Message" />
    <button type="button" (click)="popup.showAsComponent(input.value)">Show as component</button>
    <button type="button" (click)="popup.showAsElement(input.value)">Show as element</button>
  `,
  providers: [PopupService],
  imports: [Popup],
})
export class App {
  constructor(
    injector: Injector,
    public popup: PopupService,
  ) {
    // 把 `PopupComponent` 转换为自定义元素。
    const PopupElement = createCustomElement(Popup, {injector});
    // 向浏览器注册该自定义元素。
    customElements.define('popup-element', PopupElement);
  }
}
```

:::

## 自定义元素的类型定义

通用的 DOM API，例如 `document.createElement()` 或 `document.querySelector()`，会返回与指定参数相应的元素类型。
例如，调用 `document.createElement('a')` 会返回一个 `HTMLAnchorElement`，TypeScript 知道它具有 `href` 属性。
同样，`document.createElement('div')` 会返回一个 `HTMLDivElement`，TypeScript 知道它没有 `href` 属性。

当使用未知元素（例如自定义元素名称，本例中的 `popup-element`）调用这些方法时，它们会返回一个通用类型，例如 `HTMLElement`，因为 TypeScript 无法推断出返回元素的正确类型。

用 Angular 创建的自定义元素扩展自 `NgElement`（而 `NgElement` 又扩展自 `HTMLElement`）。
此外，这些自定义元素还会为对应组件的每个输入提供一个属性。
例如，我们的 `popup-element` 有一个类型为 `string` 的 `message` 属性。

如果你想为自定义元素获取正确的类型，有几种方式可选。
假设你基于以下组件创建了一个 `my-dialog` 自定义元素：

```ts
@Component(/* ... */)
class MyDialog {
  content = input('');
}
```

获得准确类型最直接的方法，是把相关 DOM 方法的返回值强制转换为正确的类型。
为此，请使用 `NgElement` 和 `WithProperties` 类型（两者都从 `@angular/elements` 导出）：

```ts
const aDialog = document.createElement('my-dialog') as NgElement &
  WithProperties<{content: string}>;
aDialog.content = 'Hello, world!';
aDialog.content = 123; // <-- ERROR: TypeScript 知道这里应该是字符串。
aDialog.body = 'News'; // <-- ERROR: TypeScript 知道 `aDialog` 上没有 `body` 属性。
```

这是一种为自定义元素快速获得 TypeScript 特性（例如类型检查和自动补全支持）的好方法。
但如果你需要在多个地方使用，就会变得繁琐，因为每次出现时都必须对返回类型进行强制转换。

另一种方法只需为每个自定义元素定义一次类型，那就是扩充 `HTMLElementTagNameMap`。TypeScript 会根据标签名，用它来推断返回元素的类型（适用于 `document.createElement()`、`document.querySelector()` 等 DOM 方法）：

```ts

declare global {
  interface HTMLElementTagNameMap {
    'my-dialog': NgElement & WithProperties<{content: string}>;
    'my-other-element': NgElement & WithProperties<{foo: 'bar'}>;
    …
  }
}

```

现在，TypeScript 就可以像处理内置元素一样推断出正确的类型：

```ts
document.createElement('div'); //--> HTMLDivElement （内置元素）
document.querySelector('foo'); //--> Element        （未知元素）
document.createElement('my-dialog'); //--> NgElement & WithProperties<{content: string}> （自定义元素）
document.querySelector('my-other-element'); //--> NgElement & WithProperties<{foo: 'bar'}>      （自定义元素）
```

## 局限性

由于 [disconnect()](https://github.com/angular/angular/issues/38778) 回调存在问题，在销毁并重新附加用 `@angular/elements` 创建的自定义元素时要格外小心。你可能会遇到此问题的情况有：

- 在 `AngularJS` 中的 `ng-if` 或 `ng-repeat` 里渲染组件
- 手动把元素从 DOM 中分离再重新附加
