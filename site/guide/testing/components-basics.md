# 组件测试基础 {#basics-of-testing-components}

与 Angular 应用中的其他所有部分不同，组件（Component）把 HTML 模板（Template）和 TypeScript 类结合在了一起。
组件实际上就是模板和类的*协同工作*。
要充分测试一个组件，你应该测试它们是否按预期协同工作。

这类测试需要像 Angular 那样在浏览器 DOM 中创建组件的宿主元素（Host Element），并按照模板的描述，检查组件类与 DOM 之间的交互。

Angular 的 `TestBed` 可以帮助你进行这类测试，后续各节会介绍具体做法。
但在很多情况下，*只测试组件类*、不涉及 DOM，就能以简单直接、更显而易见的方式验证组件的大部分行为。

## 组件的 DOM 测试 {#component-dom-testing}

组件不仅仅是它的类。
组件会与 DOM 以及其他组件交互。
单凭类本身，无法告诉你组件能否正确渲染、能否响应用户输入和手势，或者能否与其父组件和子组件正确集成。

- `Lightswitch.clicked()` 是否绑定到了某个可供用户调用的地方？
- `Lightswitch.message` 是否显示出来了？
- 用户真的能选中 `DashboardHero` 组件所显示的英雄吗？
- 英雄名字是否按预期显示（比如大写）？
- `Welcome` 组件的模板是否显示了欢迎消息？

对于前面展示的那些简单组件来说，这些问题可能并不棘手。
但很多组件与模板中描述的 DOM 元素之间存在复杂的交互，会随着组件状态的变化而让 HTML 出现或消失。

要回答这类问题，你必须创建与组件关联的 DOM 元素，必须检查 DOM 以确认组件状态在适当的时机正确显示，还必须模拟用户与屏幕的交互，以判断这些交互是否会让组件按预期运作。

要编写这类测试，你需要用到 `TestBed` 的更多特性以及其他测试辅助工具。

### CLI 生成的测试 {#cli-generated-tests}

默认情况下，当你让 CLI 生成一个新组件时，它会为你创建一个初始测试文件。

例如，下面的 CLI 命令会在 `app/banner` 文件夹中生成一个 `Banner` 组件（使用内联模板和内联样式）：

```shell
ng generate component banner --inline-template --inline-style
```

它还会为该组件生成一个初始测试文件 `banner.spec.ts`，内容如下：

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Banner} from './banner';

describe('Banner', () => {
  let component: Banner;
  let fixture: ComponentFixture<Banner>;

  beforeEach(async () => {
    TestBed.configureTestingModule({});

    fixture = TestBed.createComponent(Banner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### 精简设置代码 {#reduce-the-setup}

这个文件中只有最后三行真正在测试组件，而它们所做的也只是断言 Angular 能够创建该组件。

文件的其余部分都是样板式的设置代码，是为组件将来发展得更复杂时*可能*需要的高级测试预先准备的。

你会在后续各节中学习这些高级测试特性。
目前，你可以把这个测试文件大幅精简到更易于管理的规模：

```ts
describe('Banner (minimal)', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(Banner);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
  });
});
```

之后，你会根据测试需要，在调用 `TestBed.configureTestingModule()` 时传入导入项、提供者（Provider）以及更多声明。
可选的 `override` 方法还可以进一步微调配置的各个方面。

::: info 注意
只有当被测组件中使用了 `@defer` 块时，才需要调用 `TestBed.compileComponents`。

:::

### `createComponent()` {#createcomponent}

配置好 `TestBed` 之后，调用它的 `createComponent()` 方法。

```ts
const fixture = TestBed.createComponent(Banner);
```

`TestBed.createComponent()` 会创建 `Banner` 组件的一个实例，向测试运行器的 DOM 中添加对应的元素，并返回一个 [`ComponentFixture`](#componentfixture)。

::: warning 重要
调用 `createComponent` 之后，不要再重新配置 `TestBed`。

:::

`createComponent` 方法会冻结当前的 `TestBed` 定义，使其不再接受进一步的配置。

你不能再调用任何 `TestBed` 配置方法，无论是 `configureTestingModule()` 还是任何 `override...` 方法。
如果你这么做，`TestBed` 会抛出错误。

### `ComponentFixture` {#componentfixture}

[`ComponentFixture`](https://angular.dev/api/core/testing/ComponentFixture) 是一个测试工具（harness），用于与创建出的组件及其对应元素进行交互。

通过测试夹具（fixture）访问组件实例，并用一个预期断言确认它存在：

```ts
const component = fixture.componentInstance;
expect(component).toBeDefined();
```

### `beforeEach()` {#beforeeach}

随着这个组件的演进，你会添加更多测试。
与其为每个测试重复编写 `TestBed` 配置，不如进行重构，把设置代码提取到 `beforeEach()` 和一些辅助变量中：

```ts
describe('Banner (with beforeEach)', () => {
  let component: Banner;
  let fixture: ComponentFixture<Banner>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Banner);
    component = fixture.componentInstance;

    await fixture.whenStable(); // 必须等待初次渲染完成
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
```

::: tip 提示
在 `beforeEach` 中通过 `await fixture.whenStable` 等待初次渲染完成，就可以让各个测试保持同步。

:::

现在添加一个测试，它从 `fixture.nativeElement` 获取组件的元素，并查找预期的文本。

```ts
it('should contain "banner works!"', () => {
  const bannerElement: HTMLElement = fixture.nativeElement;
  expect(bannerElement.textContent).toContain('banner works!');
});
```

### 创建 `setup` 函数 {#create-a-setup-function}

除了 `beforeEach`，你也可以创建一个 setup 函数，在每个测试中调用它。
setup 函数的优点是可以通过参数进行定制。

下面是一个 setup 函数的示例：

```ts
function setup(providers?: Provider[]): ComponentFixture<Banner> {
  TestBed.configureTestingModule({providers});
  return TestBed.createComponent(Banner);
}
```

### `nativeElement` {#nativeelement}

`ComponentFixture.nativeElement` 的值是 `any` 类型。
稍后你还会遇到 `DebugElement.nativeElement`，它同样是 `any` 类型。

Angular 在编译期无法知道 `nativeElement` 是哪种 HTML 元素，甚至无法知道它是不是 HTML 元素。
应用可能运行在*非浏览器平台*上，比如服务器或 Node 环境，在那里该元素的 API 可能有所缩减，甚至根本不存在。

本指南中的测试都设计为在浏览器中运行，因此 `nativeElement` 的值始终是 `HTMLElement` 或它的某个派生类。

既然知道它是某种 `HTMLElement`，就可以使用标准的 HTML `querySelector` 深入元素树。

下面是另一个测试，它调用 `HTMLElement.querySelector` 获取段落元素，并查找横幅文本：

```ts
it('should have <p> with "banner works!"', () => {
  const bannerElement: HTMLElement = fixture.nativeElement;
  const p = bannerElement.querySelector('p')!;
  expect(p.textContent).toEqual('banner works!');
});
```

### `DebugElement` {#debugelement}

Angular 的*测试夹具*通过 `fixture.nativeElement` 直接提供组件的元素。

```ts
const bannerElement: HTMLElement = fixture.nativeElement;
```

这实际上是一个便捷方法，其实现为 `fixture.debugElement.nativeElement`。

```ts
const bannerDe: DebugElement = fixture.debugElement;
const bannerEl: HTMLElement = bannerDe.nativeElement;
```

之所以绕这么一圈来获取元素，是有充分理由的。

`nativeElement` 的属性取决于运行时环境。
你可能在一个没有 DOM 的*非浏览器*平台上运行这些测试，或者该平台的 DOM 模拟不支持完整的 `HTMLElement` API。

Angular 依靠 `DebugElement` 这层抽象，才能在*所有受支持的平台*上安全运行。
Angular 不会创建 HTML 元素树，而是创建一棵 `DebugElement` 树，用来包装运行时平台的*原生元素*。
`nativeElement` 属性会解开 `DebugElement` 的包装，返回特定于平台的元素对象。

由于本指南的示例测试只设计为在浏览器中运行，因此这些测试中的 `nativeElement` 始终是一个 `HTMLElement`，你可以在测试中使用它那些熟悉的方法和属性。

下面用 `fixture.debugElement.nativeElement` 重新实现了前面的测试：

```ts
it('should find the <p> with fixture.debugElement.nativeElement', () => {
  const bannerDe: DebugElement = fixture.debugElement;
  const bannerEl: HTMLElement = bannerDe.nativeElement;
  const p = bannerEl.querySelector('p')!;
  expect(p.textContent).toEqual('banner works!');
});
```

`DebugElement` 还有其他在测试中很有用的方法和属性，你会在本指南的其他地方看到。

你需要从 Angular 核心库中导入 `DebugElement` 符号。

```ts
import {DebugElement} from '@angular/core';
```

### `By.css()` {#by-css}

虽然本指南中的测试都在浏览器中运行，但有些应用可能至少在某些时候运行在其他平台上。

例如，作为让应用在网络连接不佳的设备上更快启动的策略之一，组件可能会先在服务器上渲染。
服务端渲染器可能不支持完整的 HTML 元素 API。
如果它不支持 `querySelector`，前面的测试就可能失败。

`DebugElement` 提供了适用于所有受支持平台的查询方法。
这些查询方法接受一个*谓词*函数，当 `DebugElement` 树中的某个节点符合选择条件时，该函数返回 `true`。

你可以借助从运行时平台对应的库中导入的 `By` 类来创建*谓词*。
下面是浏览器平台的 `By` 导入语句：

```ts
import {By} from '@angular/platform-browser';
```

下面的例子使用 `DebugElement.query()` 和浏览器的 `By.css` 方法重新实现了前面的测试。

```ts
it('should find the <p> with fixture.debugElement.query(By.css)', () => {
  const bannerDe: DebugElement = fixture.debugElement;
  const paragraphDe = bannerDe.query(By.css('p'));
  const p: HTMLElement = paragraphDe.nativeElement;
  expect(p.textContent).toEqual('banner works!');
});
```

一些值得注意的地方：

- `By.css()` 静态方法使用[标准 CSS 选择器（Selector）](https://developer.mozilla.org/docs/Learn/CSS/Building_blocks/Selectors 'CSS selectors')来选择 `DebugElement` 节点。
- 该查询会返回段落对应的 `DebugElement`。
- 你必须解开这个结果的包装，才能拿到段落元素。

如果你是按 CSS 选择器进行筛选，并且只测试浏览器*原生元素*的属性，那么 `By.css` 这种方式可能有些大材小用。

用 `querySelector()` 或 `querySelectorAll()` 这类标准的 `HTMLElement` 方法来筛选，往往更直接、更清晰。
