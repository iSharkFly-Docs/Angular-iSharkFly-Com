# 组件测试场景 {#component-testing-scenarios}

本指南探讨常见的组件（component）测试用例。

## 组件绑定 {#component-binding}

在示例应用中，`Banner` 组件在 HTML 模板（template）中展示静态的标题文本。

经过一些修改后，`Banner` 组件通过绑定（binding）到组件的 `title` 属性来展示动态标题，如下所示。

```ts [banner.ts]
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-banner',
  template: '<h1>{{ title() }}</h1>',
  styles: ['h1 { color: green; font-size: 350%}'],
})
export class Banner {
  title = signal('Test Tour of Heroes');
}
```

尽管它如此简单，你还是决定添加一个测试，确认组件确实在你认为应该显示的位置显示了正确的内容。

### 查询 `<h1>` {#query-for-the}

你将编写一系列测试，检查包裹着 *title* 属性插值绑定的 `<h1>` 元素的值。

你更新 `beforeEach`，用标准的 HTML `querySelector` 找到该元素，并把它赋值给 `h1` 变量。

```ts [banner.component.spec.ts]
let component: Banner;
let fixture: ComponentFixture<Banner>;
let h1: HTMLElement;

beforeEach(() => {
  fixture = TestBed.createComponent(Banner);
  component = fixture.componentInstance; // Banner 测试实例
  h1 = fixture.nativeElement.querySelector('h1');
});
```

### `createComponent()` 不会绑定数据 {#createcomponent-does-not-bind-data}

在第一个测试中，你想确认屏幕上显示的是默认的 `title`。
你的直觉是编写一个立即检查 `<h1>` 的测试，如下所示：

```ts
it('should display original title', () => {
  expect(h1.textContent).toContain(component.title());
});
```

*这个测试会失败*，并给出如下消息：

```shell
expected '' to contain 'Test Tour of Heroes'.
```

绑定发生在 Angular 执行**变更检测**（change detection）的时候。

在生产环境中，变更检测会自动触发，例如在 Angular 创建组件或用户按下按键时。

`TestBed.createComponent` 不会同步触发变更检测；修改后的测试证实了这一点：

```ts
it('no title in the DOM after createComponent()', () => {
  expect(h1.textContent).toEqual('');
});
```

### `whenStable()` {#whenstable}

你可以用 `await fixture.whenStable()` 让 `TestBed` 等待变更检测运行。
只有这样，`<h1>` 才会有预期的标题。

```ts
it('should display original title', async () => {
  await fixture.whenStable();
  expect(h1.textContent).toContain(component.title());
});
```

延迟变更检测是有意为之的，而且很有用。
它让测试者有机会*在 Angular 发起数据绑定并调用[生命周期钩子](/guide/components/lifecycle)之前*检查并修改组件的状态。

下面是另一个测试，它在调用 `fixture.whenStable()` *之前*修改了组件的 `title` 属性。

```ts
it('should display a different test title', async () => {
  component.title.set('Test Title');
  await fixture.whenStable();
  expect(h1.textContent).toContain('Test Title');
});
```

### 把信号绑定到输入 {#binding-signals-to-inputs}

为了反映输入（input）的变化并监听输出（output），你可以动态地把信号（signal）绑定到输入，把函数绑定到输出。

```ts
import {inputBinding, outputBinding} from '@angular/core';
import {TestBed} from '@angular/core/testing';

const fixture = TestBed.createComponent(ValueDisplay, {
  bindings: [
    inputBinding('value', value),
    outputBinding('valueChange', () =>  (/* ... */) ),
  ],
});
```

### 用 `dispatchEvent()` 修改输入值 {#change-an-input-value-with-dispatchevent}

要模拟用户输入，请找到 input 元素并设置它的 `value` 属性。

但还有一个必不可少的中间步骤。

Angular 并不知道你设置了 input 元素的 `value` 属性。
在你调用 `dispatchEvent()` 触发该元素的 `input` 事件之前，它不会读取这个属性。

下面这个使用 `TitleCasePipe` 的组件示例演示了正确的步骤顺序。

```ts
it('should convert hero name to Title Case', async () => {
  const hostElement = fixture.nativeElement;
  const nameInput: HTMLInputElement = hostElement.querySelector('input')!;
  const nameDisplay: HTMLElement = hostElement.querySelector('span')!;

  // 模拟用户在输入框中输入新名字
  nameInput.value = 'quick BROWN  fOx';

  // 派发一个 DOM 事件，让 Angular 知道输入值发生了变化
  nameInput.dispatchEvent(new Event('input'));

  // 等待 Angular 通过 title 管道更新显示的绑定
  await fixture.whenStable();

  expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
});
```

## 带有依赖的组件 {#component-with-a-dependency}

组件经常会依赖服务（service）。

`Welcome` 组件向已登录的用户显示欢迎消息。
它根据注入的 `UserAuthentication` 的某个属性来知道用户是谁：

```ts
import {Component, computed, inject} from '@angular/core';
import {UserAuthentication} from '../model/user.authentication';

@Component({
  selector: 'app-welcome',
  template: '<h3 class="welcome"><i>{{ welcome() }}</i></h3>',
})
export class Welcome {
  private userAuth = inject(UserAuthentication);
  welcome = computed(() =>
    this.userAuth.isLoggedIn() ? `Welcome, ${this.userAuth.user().name}` : 'Please log in.',
  );
}
```

`Welcome` 组件包含与服务交互的决策逻辑，正是这些逻辑让这个组件值得测试。

### 提供服务的测试替身 {#provide-service-test-doubles}

*被测组件*不一定要使用真实的服务。

注入真实的 `UserAuthentication` 可能会很困难。
真实的服务可能会要求用户输入登录凭据，并尝试连接认证服务器。
这些行为可能很难拦截。请注意，使用测试替身会让测试的行为与生产环境不同，所以要谨慎使用。

### 获取注入的服务 {#get-injected-services}

测试需要访问注入到 `Welcome` 组件中的 `UserAuthentication`。

Angular 有一个分层的注入系统。
注入器（injector）可以存在于多个层级，从 `TestBed` 创建的根注入器一直向下贯穿整棵组件树。

获取注入服务最安全的方式，也就是***始终有效***的方式，
是**从*被测组件*的注入器中获取它**。
组件注入器是 fixture 的 `DebugElement` 的一个属性。

```ts
// 实际注入到组件中的 UserAuthentication
userAuth = fixture.debugElement.injector.get(UserAuthentication);
```

::: tip 提示
这*通常*是不必要的。服务通常在根级别或 TestBed 的覆盖配置中提供，可以更方便地用 `TestBed.inject()` 获取（见下文）。

:::

### `TestBed.inject()` {#testbed-inject}

与通过 fixture 的 `DebugElement` 获取服务相比，这种方式更容易记住，也更简洁。

在这个测试套件中，`UserAuthentication` *唯一*的提供者（provider）是根测试模块，所以可以放心地像下面这样调用 `TestBed.inject()`：

```ts
userAuth = TestBed.inject(UserAuthentication);
```

::: tip 提示
关于 `TestBed.inject()` 不起作用的用例，请参阅[*覆盖组件的提供者*](#override-component-providers)一节，其中解释了何时以及为什么必须改为从组件的注入器中获取服务。

:::

### 最终的设置和测试 {#final-setup-and-tests}

下面是使用 `TestBed.inject()` 的完整 `beforeEach()`：

```ts
let fixture: ComponentFixture<Welcome>;
let comp: Welcome;
let userAuth: UserAuthentication; // TestBed 注入的服务
let el: HTMLElement; // 包含欢迎消息的 DOM 元素

beforeEach(() => {
  fixture = TestBed.createComponent(Welcome);
  comp = fixture.componentInstance;

  // 来自根注入器的 UserAuthentication
  userAuth = TestBed.inject(UserAuthentication);

  //  通过 CSS 选择器（例如类名）获取 "welcome" 元素
  el = fixture.nativeElement.querySelector('.welcome');
});
```

下面是一些测试：

```ts
it('should welcome the user', async () => {
  await fixture.whenStable();
  const content = el.textContent;

  expect(content, '"Welcome ..."').toContain('Welcome');
  expect(content, 'expected name').toContain('Test User');
});

it('should welcome "Bubba"', async () => {
  userAuth.user.set({name: 'Bubba'}); // 欢迎消息还没有显示
  await fixture.whenStable();

  expect(el.textContent).toContain('Bubba');
});

it('should request login if not logged in', async () => {
  userAuth.isLoggedIn.set(false); // 欢迎消息还没有显示
  await fixture.whenStable();
  const content = el.textContent;

  expect(content, 'not welcomed').not.toContain('Welcome');
  expect(content, '"log in"').toMatch(/log in/i);
});
```

第一个是健全性测试；它确认 `UserAuthentication` 被调用并且正常工作。

::: tip 提示
`expect` 的第二个参数（例如 `'expected name'`）是一个可选的失败标签。
如果断言失败，Vitest 会把这个标签附加到断言失败消息中。
在包含多个断言的测试规约中，它有助于说明出了什么问题以及哪个断言失败了。

:::

其余测试确认了服务返回不同值时组件的逻辑。
第二个测试验证修改用户名的效果。
第三个测试检查没有已登录用户时，组件是否显示了正确的消息。

## 带有异步服务的组件 {#component-with-async-service}

在这个示例中，`About` 组件的模板中托管了一个 `Twain` 组件。
`Twain` 组件显示马克·吐温的名言。

```html
<p class="twain">
  <i>{{ quote | async }}</i>
</p>
<button type="button" (click)="getQuote()">Next quote</button>
@if (errorMessage()) {
  <p class="error">{{ errorMessage() }}</p>
}
```

::: tip 提示
组件的 `quote` 属性的值会经过一个 `AsyncPipe`。
这意味着该属性返回的要么是 `Promise`，要么是 `Observable`。

:::

在这个例子中，`TwainQuotes.getQuote()` 方法告诉你 `quote` 属性返回的是一个 `Observable`。

```ts
getQuote() {
  this.errorMessage.set('');
  this.quote = this.twainQuotes.getQuote().pipe(
    startWith('...'),
    catchError((err: any) => {
      this.errorMessage.set(err.message || err.toString());
      return of('...'); // 把消息重置为占位符
    }),
  );
}
```

`Twain` 组件从注入的 `TwainQuotes` 获取名言。
在服务返回第一条名言之前，组件会让返回的 `Observable` 以一个占位值（`'...'`）开始。

`catchError` 会拦截服务的错误，准备一条错误消息，并在成功通道上返回占位值。

这些都是你需要测试的特性。

### 使用 `HttpTestingController` 模拟 http 请求进行测试。 {#testing-by-mocking-http-requests-with-the-httptestingcontroller}

测试组件时，只有服务的公共 API 才是重要的。
一般来说，测试本身不应该调用远程服务器。
它们应该模拟这类调用。

如果你的异步服务依赖 `HttpClient` 来加载远程数据，建议使用 `HttpTestingController` 在 HTTP 层面返回模拟响应。

关于模拟 `HttpBackend` 的更多细节，请参阅[专门的指南](/guide/http/testing)。

### 通过提供服务的桩实现进行测试。 {#testing-by-providing-a-stubbed-implementation-of-a-service}

当无法在 http 层面模拟异步请求时，另一种做法是利用间谍（spy）。

这个 `app/twain/twain-quotes.spec.ts` 中的设置展示了一种实现方式：

```ts [twain.spec.ts]
class TwainQuotesStub implements TwainQuotes {
  private testQuote = 'Test Quote';

  getQuote() {
    return of(this.testQuote);
  }

  // ... 实现所有内容以符合该 API
}

beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
  });

  fixture = TestBed.createComponent(Twain);
  component = fixture.componentInstance;
  await fixture.whenStable();
  quoteEl = fixture.nativeElement.querySelector('.twain');
});
```

重点关注桩实现是如何替换原始实现的。

```ts
TestBed.configureTestingModule({
  providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
});
```

这个桩的设计使得任何注入它的组件或服务都会得到桩实现。
这意味着对 `getQuote` 的任何调用都会得到一个带有测试名言的 observable。

与真实的 `getQuote()` 方法不同，这个间谍绕过了服务器，返回一个同步的 observable，其值立即可用。

### 使用 Vitest 假定时器进行异步测试 {#async-test-with-a-vitest-fake-timers}

要模拟 `setTimeout` 或 `Promise` 这样的异步函数，可以利用 Vitest 的假定时器来控制它们何时触发。

```ts
it('should display error when TwainQuotes service fails', async () => {
  class TwainQuotesStub implements TwainQuotes {
    getQuote() {
      return defer(() => {
        return new Promise<string>((_, reject) => {
          setTimeout(() => reject('TwainService test failure'));
        });
      });
    }

    // ... 实现所有内容以符合该 API
  }

  TestBed.configureTestingModule({
    providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
  });

  vi.useFakeTimers(); // 设置假定时器
  const fixture = TestBed.createComponent(TwainComponent);

  // 渲染不是异步的，我们需要刷新
  await vi.runAllTimersAsync();

  await expect(fixture.nativeElement.querySelector('.error')!.textContent).toMatch(/test failure/);
  expect(fixture.nativeElement.querySelector('.twain')!.textContent).toBe('...');

  vi.useRealTimers(); // 恢复为常规的异步执行
});
```

### 更多异步测试 {#more-async-tests}

由于桩服务返回的是异步 observable，你的大多数测试也必须是异步的。

下面这个测试演示了你在真实世界中预期的数据流。

```ts
class MockTwainQuotes implements TwainQuotes {
  private subject = new Subject<string>();

  getQuote() {
    return this.subject.asObservable();
  }

  emit(val: string) {
    this.subject.next(val);
  }
}

it('should show quote after getQuote (success)', async () => {
  vi.useFakeTimers();

  TestBed.configureTestingModule({
    providers: [{provide: TwainQuotes, useClass: MockTwainQuotes}],
  });

  const fixture = TestBed.createComponent(TwainComponent);
  const twainQuotes = TestBed.inject(TwainQuotes) as MockTwainQuotes;
  await vi.runAllTimersAsync(); // 在收到名言之前渲染

  const quoteEl = fixture.nativeElement.querySelector('.twain');
  expect(quoteEl.textContent).toBe('...');

  twainQuotes.emit('Twain Quote'); // 发出名言
  await vi.runAllTimersAsync(); // 收到名言后渲染

  expect(quoteEl.textContent).toBe('Twain Quote');
  expect(fixture.nativeElement.querySelector('.error')).toBeNull();

  vi.useRealTimers();
});
```

注意，名言元素在首次渲染时显示的是占位值（`'...'`）。
第一条名言还没有到达。

然后你就可以断言名言元素显示了预期的文本。

### 使用 `zone.js` 和 `fakeAsync` 进行异步测试 {#async-tests-with-zone-js-and-fakeasync}

`fakeAsync` 辅助函数是另一种模拟时钟，它依赖于用 `zone.js` 修补异步 API。它过去在基于 `zone.js` 的应用中常用于测试。现在已不再推荐使用 `fakeAsync`。

::: tip 提示
优先使用原生的异步测试策略，或者其他假定时器（也称为模拟时钟），例如 Vitest 或 Jasmine 提供的假定时器。

:::

::: warning 重要
`fakeAsync` 需要 `zone.js`。要在 Vitest 测试运行器中使用它，请按照 [Vitest 迁移指南](/guide/testing/migrating-to-vitest#zonejs-vitest-patch)中的说明添加 `zone.js/plugins/vitest-patch` 腻子脚本（polyfill）。

:::

## 带有输入和输出的组件 {#component-with-inputs-and-outputs}

带有输入和输出的组件通常出现在宿主组件的视图模板中。
宿主使用属性绑定（property binding）来设置输入属性，并使用事件绑定（event binding）来监听输出属性发出的事件。

测试的目标是验证这些绑定是否按预期工作。
测试应该设置输入值并监听输出事件。

`DashboardHero` 组件就是一个扮演这种角色的小例子。
它显示由 `Dashboard` 组件提供的单个英雄。
点击该英雄会告诉 `Dashboard` 组件用户选中了这个英雄。

`DashboardHero` 组件像这样嵌入在 `Dashboard` 组件的模板中：

```html
@for (hero of heroes; track hero) {
  <dashboard-hero class="col-1-4" [hero]="hero" (selected)="gotoDetail($event)" />
}
```

`DashboardHero` 组件出现在一个 `@for` 块中，它把每个组件的 `hero` 输入属性设置为循环的值，并监听组件的 `selected` 事件。

下面是该组件的完整定义：

```ts
@Component({
  selector: 'dashboard-hero',
  imports: [UpperCasePipe],
  template: `
    <button type="button" (click)="click()" class="hero">
      {{ hero().name | uppercase }}
    </button>
  `,
})
export class DashboardHero {
  readonly hero = input.required<Hero>();
  readonly selected = output<Hero>();

  click() {
    this.selected.emit(this.hero());
  }
}
```

虽然测试这样一个简单的组件本身没什么价值，但了解怎么做还是值得的。
可以使用下列方法之一：

- 按照 `Dashboard` 组件使用它的方式进行测试
- 把它作为独立（standalone）组件进行测试
- 按照 `Dashboard` 组件的替代品使用它的方式进行测试

当前的目标是测试 `DashboardHero` 组件，而不是 `Dashboard` 组件，所以尝试第二种和第三种方法。

### 独立测试 `DashboardHero` 组件 {#test-the-dashboardhero-component-standalone}

下面是测试规约文件设置的核心部分。

```ts
let fixture: ComponentFixture<DashboardHero>;
let comp: DashboardHero;
let heroDe: DebugElement;
let heroEl: HTMLElement;
let expectedHero: Hero;

beforeEach(async () => {
  fixture = TestBed.createComponent(DashboardHero);
  comp = fixture.componentInstance;

  // 找到英雄的 DebugElement 和元素
  heroDe = fixture.debugElement.query(By.css('.hero'));
  heroEl = heroDe.nativeElement;

  // 模拟由父组件提供的英雄
  expectedHero = {id: 42, name: 'Test Name'};

  // 模拟父组件用该英雄设置输入属性
  fixture.componentRef.setInput('hero', expectedHero);

  // 等待初始数据绑定
  await fixture.whenStable();
});
```

注意设置代码是如何把一个测试英雄（`expectedHero`）赋值给组件的 `hero` 属性的，这模拟了 `Dashboard` 在其循环中使用属性绑定设置它的方式。

下面的测试验证英雄的名字通过绑定传递到了模板中。

```ts
it('should display hero name in uppercase', () => {
  const expectedPipedName = expectedHero.name.toUpperCase();
  expect(heroEl.textContent).toContain(expectedPipedName);
});
```

因为模板会让英雄的名字经过 Angular 的 `UpperCasePipe`，所以测试必须用大写的名字来匹配元素的值。

### 点击 {#clicking}

点击英雄应该会触发一个 `selected` 事件，宿主组件（大概是 `Dashboard`）能够监听到它：

```ts
it('should raise selected event when clicked (triggerEventHandler)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  heroDe.triggerEventHandler('click');
  expect(selectedHero).toBe(expectedHero);
});
```

组件的 `selected` 属性是一个 `OutputEmitterRef`，它的 `subscribe` 方法会同步通知订阅者。
测试*显式地*订阅它，就像宿主组件*隐式地*订阅它一样。

如果组件的行为符合预期，点击英雄的元素应该会让组件的 `selected` 属性发出 `hero` 对象。

测试通过对 `selected` 的订阅来检测该事件。

### `triggerEventHandler` {#triggereventhandler}

上一个测试中的 `heroDe` 是一个代表英雄 `<button>` 的 `DebugElement`。

它拥有一些 Angular 属性和方法，用于抽象与原生元素的交互。
这个测试用 "click" 事件名调用 `DebugElement.triggerEventHandler`。
"click" 事件绑定的响应是调用 `DashboardHero.click()`。

Angular 的 `DebugElement.triggerEventHandler` 可以通过*事件名*触发*任何数据绑定的事件*。
第二个参数是传给处理函数的事件对象。

这个测试触发了一个 "click" 事件。

```ts
heroDe.triggerEventHandler('click');
```

在这个例子中，测试正确地假设了运行时的事件处理函数（即组件的 `click()` 方法）并不关心事件对象。

::: tip 提示
其他处理函数就没这么宽容了。
例如，`RouterLink` 指令（directive）期望一个带有 `button` 属性的对象，用来标识点击时按下的是哪个鼠标按键（如果有的话）。
如果缺少事件对象，`RouterLink` 指令会抛出错误。

:::

### 点击元素 {#click-the-element}

下面这个替代测试调用了原生元素自己的 `click()` 方法，这对*这个组件*来说完全没问题。

```ts
it('should raise selected event when clicked (element.click)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  heroEl.click();
  expect(selectedHero).toBe(expectedHero);
});
```

### `click()` 辅助函数 {#click-helper}

点击按钮、链接或任意 HTML 元素是常见的测试任务。

把*触发点击*的过程封装到一个辅助函数中（例如下面的 `click()` 函数），可以让这件事变得一致而直接：

```ts
/** 传给 `DebugElement.triggerEventHandler` 的按钮事件，用于 RouterLink 事件处理函数 */
export const ButtonClickEvents = {
  left: {button: 0},
  right: {button: 2},
};

/** 模拟元素点击。默认为鼠标左键点击事件。 */
export function click(
  el: DebugElement | HTMLElement,
  eventObj: any = ButtonClickEvents.left,
): void {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}
```

第一个参数是*要点击的元素*。
如果需要，可以把自定义的事件对象作为第二个参数传入。
默认值是一个部分的[鼠标左键事件对象](https://developer.mozilla.org/docs/Web/API/MouseEvent/button)，包括 `RouterLink` 指令在内的许多处理函数都接受它。

::: warning 重要
`click()` 辅助函数**不是** Angular 测试工具的一部分。
它是*本指南示例代码*中定义的一个函数。
所有示例测试都使用了它。
如果你喜欢它，可以把它加入你自己的辅助函数集合中。

:::

下面是用 click 辅助函数重写的上一个测试。

```ts
it('should raise selected event when clicked (click helper with DebugElement)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  click(heroDe); // 对 DebugElement 使用 click 辅助函数

  expect(selectedHero).toBe(expectedHero);
});
```

## 测试宿主中的组件 {#component-inside-a-test-host}

前面的测试自己扮演了宿主 `Dashboard` 组件的角色。
但是，当 `DashboardHero` 组件正确地数据绑定到宿主组件时，它能正常工作吗？

```ts
@Component({
  imports: [DashboardHero],
  template: ` <dashboard-hero [hero]="hero" (selected)="onSelected($event)" />`,
})
class TestHost {
  hero: Hero = {id: 42, name: 'Test Name'};
  selectedHero: Hero | undefined;

  onSelected(hero: Hero) {
    this.selectedHero = hero;
  }
}
```

测试宿主用它的测试英雄设置组件的 `hero` 输入属性。
它把组件的 `selected` 事件绑定到自己的 `onSelected` 处理函数，该函数把发出的英雄记录在 `selectedHero` 属性中。

之后，测试就可以检查 `selectedHero` 来验证 `DashboardHero.selected` 事件发出了预期的英雄。

`test-host` 测试的设置与独立测试的设置类似：

```ts
beforeEach(async () => {
  // 创建 TestHost 而不是 DashboardHero
  fixture = TestBed.createComponent(TestHost);
  testHost = fixture.componentInstance;
  heroEl = fixture.nativeElement.querySelector('.hero');

  await fixture.whenStable();
});
```

这个测试模块的配置体现了两个重要的区别：

- 它*创建*的是 `TestHost` 组件，而不是 `DashboardHero`
- `TestHost` 组件通过绑定来设置 `DashboardHero.hero`

`createComponent` 返回的 `fixture` 持有的是 `TestHost` 的实例，而不是 `DashboardHero` 的实例。

创建 `TestHost` 会带来创建 `DashboardHero` 的副作用，因为后者出现在前者的模板中。
对英雄元素（`heroEl`）的查询仍然能在测试 DOM 中找到它，只是它在元素树中的位置比之前更深。

测试本身与独立版本几乎完全相同：

```ts
it('should display hero name', () => {
  const expectedPipedName = testHost.hero.name.toUpperCase();
  expect(heroEl.textContent).toContain(expectedPipedName);
});

it('should raise selected event when clicked', () => {
  click(heroEl);
  // 选中的英雄应该就是数据绑定的那个英雄
  expect(testHost.selectedHero).toBe(testHost.hero);
});
```

只有选中事件的测试有所不同。
它确认了选中的 `DashboardHero` 英雄确实通过事件绑定向上传递到了宿主组件。

## 路由组件 {#routing-component}

*路由组件*是指示 `Router` 导航到另一个组件的组件。
`Dashboard` 组件就是一个*路由组件*，因为用户可以通过点击仪表盘上的某个*英雄按钮*导航到 `HeroDetail` 组件。

Angular 提供了一些测试辅助工具，用来减少样板代码，并更有效地测试依赖于 `HttpClient` 的代码。`provideRouter` 函数也可以直接在测试模块中使用。

```ts
beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{path: '**', component: Dashboard}]),
      provideHttpClientTesting(),
      HeroService,
    ],
  });
  harness = await RouterTestingHarness.create();
  comp = await harness.navigateByUrl('/', Dashboard);
  TestBed.inject(HttpTestingController).expectOne('api/heroes').flush(getTestHeroes());
});
```

下面的测试点击显示的英雄，并确认我们导航到了预期的 URL。

```ts
it('should tell navigate when hero clicked', async () => {
  // 获取第一个 <dashboard-hero> 的 DebugElement
  const heroDe = harness.routeDebugElement!.query(By.css('dashboard-hero'));
  heroDe.triggerEventHandler('selected', comp.heroes[0]);

  // 预期导航到组件第一个英雄的 id
  const id = comp.heroes[0].id;
  expect(TestBed.inject(Router).url, 'should nav to HeroDetail for first hero').toEqual(
    `/heroes/${id}`,
  );
});
```

## 被路由的组件 {#routed-components}

*被路由的组件*是 `Router` 导航的目标。
它可能更难测试，尤其是当通往该组件的路由（route）*包含参数*时。
`HeroDetail` 就是这样一个路由的目标，它是一个*被路由的组件*。

当用户点击 *Dashboard* 上的英雄时，`Dashboard` 会指示 `Router` 导航到 `heroes/:id`。
`:id` 是一个路由参数，它的值是要编辑的英雄的 `id`。

`Router` 把这个 URL 匹配到通往 `HeroDetail` 的路由。
它会创建一个包含路由信息的 `ActivatedRoute` 对象，并把它注入到 `HeroDetail` 的新实例中。

下面是注入到 `HeroDetail` 中的服务：

```ts
private heroDetailService = inject(HeroDetailService);
private route = inject(ActivatedRoute);
private router = inject(Router);
```

`HeroDetail` 组件需要 `id` 参数，以便使用 `HeroDetailService` 获取对应的英雄。
组件必须从 `ActivatedRoute.paramMap` 属性中获取 `id`，而这个属性是一个 `Observable`。

它不能直接引用 `ActivatedRoute.paramMap` 的 `id` 属性。
组件必须*订阅* `ActivatedRoute.paramMap` 这个 observable，并准备好应对 `id` 在其生命周期内发生变化。

```ts
constructor() {
  // 当 `id` 参数变化时获取英雄
  this.route.paramMap.subscribe((pmap) => this.getHero(pmap.get('id')));
}
```

测试可以通过导航到不同的路由，来探究 `HeroDetail` 如何响应不同的 `id` 参数值。

## 嵌套组件测试 {#nested-component-tests}

组件模板中经常有嵌套的组件，而这些组件的模板中可能还包含更多组件。

组件树可能非常深，有时嵌套的组件在测试树顶端的组件时不起任何作用。

例如，`App` 组件显示了一个导航栏，其中包含链接及其 `RouterLink` 指令。

```html
<app-banner />
<app-welcome />

<nav>
  <a routerLink="/dashboard">Dashboard</a>
  <a routerLink="/heroes">Heroes</a>
  <a routerLink="/about">About</a>
</nav>

<router-outlet />
```

要验证链接而不验证导航（navigation），你不需要 `Router` 去导航，也不需要 `<router-outlet>` 来标记 `Router` 插入*被路由的组件*的位置。

`Banner` 和 `Welcome` 组件（由 `<app-banner>` 和 `<app-welcome>` 表示）同样无关紧要。

然而，任何在 DOM 中创建 `App` 组件的测试也会创建这三个组件的实例；如果你任由这种情况发生，就必须配置 `TestBed` 来创建它们。

如果你没有声明它们，Angular 编译器将无法识别 `App` 模板中的 `<app-banner>`、`<app-welcome>` 和 `<router-outlet>` 标签，并会抛出错误。

如果你声明了真实的组件，就还必须声明*它们*的嵌套组件，并为树中*任何*组件所注入的*所有*服务提供支持。

本节介绍两种最大限度减少设置工作的技术。
单独或组合使用它们，可以让你专注于测试主要组件。

### 为不需要的组件创建桩 {#stubbing-unneeded-components}

在第一种技术中，你为那些在测试中作用很小或不起作用的组件和指令创建并声明桩版本。

```ts
@Component({selector: 'app-banner', template: ''})
class BannerStub {}

@Component({selector: 'router-outlet', template: ''})
class RouterOutletStub {}

@Component({selector: 'app-welcome', template: ''})
class WelcomeStub {}
```

桩的选择器（selector）与对应的真实组件的选择器相匹配。
但它们的模板和类都是空的。

然后使用 `TestBed.overrideComponent` 覆盖组件的 `imports` 来声明它们。

```ts
let comp: App;
let fixture: ComponentFixture<App>;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), UserAuthentication],
  }).overrideComponent(App, {
    set: {
      imports: [RouterLink, BannerStub, RouterOutletStub, WelcomeStub],
    },
  });

  fixture = TestBed.createComponent(App);
  comp = fixture.componentInstance;
});
```

::: tip 提示
这个例子中的 `set` 键会替换组件上所有现有的导入，所以请确保导入所有依赖，而不仅仅是桩。或者，你也可以使用 `remove`/`add` 键有选择地移除和添加导入。

:::

### `NO_ERRORS_SCHEMA` {#noerrorsschema}

在第二种方法中，把 `NO_ERRORS_SCHEMA` 添加到组件的元数据覆盖配置中。

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), UserAuthentication],
  }).overrideComponent(App, {
    set: {
      imports: [], // 重置所有导入
      schemas: [NO_ERRORS_SCHEMA],
    },
  });
});
```

`NO_ERRORS_SCHEMA` 告诉 Angular 编译器忽略无法识别的元素和 attribute。

编译器能识别 `<app-root>` 元素和 `routerLink` attribute，因为你在 `TestBed` 配置中声明了对应的 `App` 组件和 `RouterLink`。

但编译器在遇到 `<app-banner>`、`<app-welcome>` 或 `<router-outlet>` 时不会抛出错误。
它只是把它们渲染为空标签，浏览器会忽略它们。

你不再需要桩组件了。

### 同时使用两种技术 {#use-both-techniques-together}

这些是用于*浅层组件测试*的技术，之所以这样命名，是因为它们把组件的可视范围缩小到组件模板中对测试有意义的那些元素。

`NO_ERRORS_SCHEMA` 方法是两者中更简单的一种，但不要过度使用它。

`NO_ERRORS_SCHEMA` 还会阻止编译器告诉你那些因疏忽而遗漏或拼错的组件和 attribute。
你可能会浪费好几个小时去追查编译器本可以瞬间发现的幽灵 bug。

*桩组件*方法还有另一个优点。
虽然*这个*例子中的桩是空的，但如果你的测试需要以某种方式与它们交互，你可以给它们提供精简的模板和类。

在实践中，你会在同一个设置中组合使用这两种技术，就像这个例子中这样。

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), UserAuthentication],
  }).overrideComponent(App, {
    remove: {imports: [RouterOutlet, Welcome]},
    set: {schemas: [NO_ERRORS_SCHEMA]},
  });
});
```

Angular 编译器为 `<app-banner>` 元素创建 `BannerStub`，并把 `RouterLink` 应用到带有 `routerLink` attribute 的链接上，但它会忽略 `<app-welcome>` 和 `<router-outlet>` 标签。

### `By.directive` 与注入的指令 {#by-directive-and-injected-directives}

再做一点设置，就可以触发初始数据绑定并获取导航链接的引用：

```ts
beforeEach(async () => {
  await fixture.whenStable();

  // 找到附加了 RouterLinkStubDirective 的 DebugElement
  linkDes = fixture.debugElement.queryAll(By.directive(RouterLink));

  // 使用每个 DebugElement 的注入器
  // 获取附加的链接指令实例
  routerLinks = linkDes.map((de) => de.injector.get(RouterLink));
});
```

有三点特别值得关注：

- 使用 `By.directive` 定位附加了指令的链接元素
- 查询返回的是包裹着匹配元素的 `DebugElement` 包装器
- 每个 `DebugElement` 都暴露了一个依赖注入器，其中包含附加到该元素上的特定指令实例

要验证的 `App` 组件链接如下：

```html
<nav>
  <a routerLink="/dashboard">Dashboard</a>
  <a routerLink="/heroes">Heroes</a>
  <a routerLink="/about">About</a>
</nav>
```

下面是一些测试，用于确认这些链接按预期连接到了 `routerLink` 指令：

```ts
it('can get RouterLinks from template', () => {
  expect(routerLinks.length, 'should have 3 routerLinks').toBe(3);
  expect(routerLinks[0].href).toBe('/dashboard');
  expect(routerLinks[1].href).toBe('/heroes');
  expect(routerLinks[2].href).toBe('/about');
});

it('can click Heroes link in template', async () => {
  const heroesLinkDe = linkDes[1]; // heroes 链接的 DebugElement

  TestBed.inject(Router).resetConfig([{path: '**', children: []}]);
  heroesLinkDe.triggerEventHandler('click', {button: 0});

  await fixture.whenStable();

  expect(TestBed.inject(Router).url).toBe('/heroes');
});
```

## 使用 `page` 对象 {#use-a-page-object}

`HeroDetail` 组件是一个简单的视图，包含一个标题、两个英雄字段和两个按钮。

但即使是这样简单的表单，模板也相当复杂。

```html
@if (hero) {
  <div>
    <h2>
      <span>{{ hero.name | titlecase }}</span> Details
    </h2>
    <div><span>id: </span>{{ hero.id }}</div>
    <div>
      <label for="name">name: </label>
      <input id="name" [(ngModel)]="hero.name" placeholder="name" />
    </div>
    <button type="button" (click)="save()">Save</button>
    <button type="button" (click)="cancel()">Cancel</button>
  </div>
}
```

用来测试这个组件的测试需要……

- 等待英雄到达，元素才会出现在 DOM 中
- 对标题文本的引用
- 对名字输入框的引用，以便检查和设置它
- 对两个按钮的引用，以便点击它们

即使是这样一个小表单，也可能产生一堆繁琐的条件设置和 CSS 元素选择代码。

用一个 `Page` 类来驯服这种复杂性，由它处理对组件属性的访问，并封装设置这些属性的逻辑。

下面就是为 `hero-detail.component.spec.ts` 编写的这样一个 `Page` 类

```ts
class Page {
  // getter 属性在被调用时才去查询 DOM。
  get buttons() {
    return this.queryAll<HTMLButtonElement>('button');
  }
  get saveBtn() {
    return this.buttons[0];
  }
  get cancelBtn() {
    return this.buttons[1];
  }
  get nameDisplay() {
    return this.query<HTMLElement>('span');
  }
  get nameInput() {
    return this.query<HTMLInputElement>('input');
  }

  //// 查询辅助函数 ////
  private query<T>(selector: string): T {
    return harness.routeNativeElement!.querySelector(selector)! as T;
  }

  private queryAll<T>(selector: string): T[] {
    return harness.routeNativeElement!.querySelectorAll(selector) as any as T[];
  }
}
```

现在，用于操作和检查组件的重要钩子都被整齐地组织起来，并且可以通过 `Page` 的实例访问。

`createComponent` 方法会创建一个 `page` 对象，并在 `hero` 到达后填充空白部分。

```ts
async function createComponent(id: number) {
  harness = await RouterTestingHarness.create();
  component = await harness.navigateByUrl(`/heroes/${id}`, HeroDetail);
  page = new Page();

  const request = TestBed.inject(HttpTestingController).expectOne(`api/heroes/?id=${id}`);
  const hero = getTestHeroes().find((h) => h.id === Number(id));
  request.flush(hero ? [hero] : []);
  await harness.fixture.whenStable();
}
```

下面是另外几个 `HeroDetail` 组件测试，用来强化这一点。

```ts
it("should display that hero's name", () => {
  expect(page.nameDisplay.textContent).toBe(expectedHero.name);
});

it('should navigate when click cancel', () => {
  click(page.cancelBtn);
  expect(TestBed.inject(Router).url).toEqual(`/heroes/${expectedHero.id}`);
});

it('should save when click save but not navigate immediately', () => {
  click(page.saveBtn);
  expect(TestBed.inject(HttpTestingController).expectOne({method: 'PUT', url: 'api/heroes'}));
  expect(TestBed.inject(Router).url).toEqual('/heroes/41');
});

it('should navigate when click save and save resolves', async () => {
  click(page.saveBtn);
  await harness.fixture.whenStable();
  expect(TestBed.inject(Router).url).toEqual('/heroes/41');
});

it('should convert hero name to Title Case', async () => {
  // 从 DOM 中获取名字的输入框和显示元素
  const hostElement: HTMLElement = harness.routeNativeElement!;
  const nameInput: HTMLInputElement = hostElement.querySelector('input')!;
  const nameDisplay: HTMLElement = hostElement.querySelector('span')!;

  // 模拟用户在输入框中输入新名字
  nameInput.value = 'quick BROWN  fOx';

  // 派发一个 DOM 事件，让 Angular 知道输入值发生了变化
  nameInput.dispatchEvent(new Event('input'));

  // 等待 Angular 通过 title 管道更新显示的绑定
  await harness.fixture.whenStable();

  expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
});
```

## 覆盖组件的提供者 {#override-component-providers}

`HeroDetail` 提供了它自己的 `HeroDetailService`。

```ts
@Component({
  /* ... */
  providers: [HeroDetailService],
})
export class HeroDetail {
  private heroDetailService = inject(HeroDetailService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
}
```

无法在 `TestBed.configureTestingModule` 的 `providers` 中为组件的 `HeroDetailService` 提供桩。
那些是*测试模块*的提供者，而不是组件的提供者。
它们在 *fixture 层级*准备依赖注入器。

Angular 会用组件*自己的*注入器来创建组件，这个注入器是 fixture 注入器的*子*注入器。
它把组件的提供者（本例中是 `HeroDetailService`）注册到这个子注入器中。

测试无法从 fixture 注入器访问子注入器中的服务。
`TestBed.configureTestingModule` 也无法配置它们。

Angular 一直在创建真实的 `HeroDetailService` 的新实例！

::: tip 提示
如果 `HeroDetailService` 自己向远程服务器发起 XHR 调用，这些测试可能会失败或超时。
可能根本就没有可供调用的远程服务器。

:::

幸运的是，`HeroDetailService` 把访问远程数据的职责委托给了注入的 `HeroService`。

```ts
@Service()
export class HeroDetailService {
  private heroService = inject(HeroService);
}
```

之前的测试配置用 `TestHeroService` 替换了真实的 `HeroService`，它会拦截服务器请求并伪造响应。

如果你没那么幸运呢？
如果伪造 `HeroService` 很困难呢？
如果 `HeroDetailService` 自己发起服务器请求呢？

`TestBed.overrideComponent` 方法可以用易于管理的*测试替身*替换组件的 `providers`，如下面这个设置变体所示：

```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({
    providers: [
      provideRouter([
        {path: 'heroes', component: HeroList},
        {path: 'heroes/:id', component: HeroDetail},
      ]),
      // 这一层级的 HeroDetailService 无关紧要！
      {provide: HeroDetailService, useValue: {}},
    ],
  }).overrideComponent(HeroDetail, {
    set: {providers: [{provide: HeroDetailService, useClass: HeroDetailServiceSpy}]},
  });
});
```

注意，`TestBed.configureTestingModule` 不再提供伪造的 `HeroService`，因为[不需要它](#provide-a-spy-stub-herodetailservicespy)。

### `overrideComponent` 方法 {#the-overridecomponent-method}

重点关注 `overrideComponent` 方法。

```ts
.overrideComponent(HeroDetail, {
  set: {providers: [{provide: HeroDetailService, useClass: HeroDetailServiceSpy}]},
});
```

它接受两个参数：要覆盖的组件类型（`HeroDetail`）和一个覆盖元数据对象。
[覆盖元数据对象](/guide/testing/utility-apis#testbed-class-summary)是一个泛型，定义如下：

```ts
type MetadataOverride<T> = {
  add?: Partial<T>;
  remove?: Partial<T>;
  set?: Partial<T>;
};
```

元数据覆盖对象既可以在元数据属性中添加和移除元素，也可以完全重置这些属性。
这个例子重置了组件的 `providers` 元数据。

类型参数 `T` 是你会传给 `@Component` 装饰器的那种元数据：

```ts
selector?: string;
template?: string;
templateUrl?: string;
providers?: any[];
…
```

### 提供*间谍桩*（`HeroDetailServiceSpy`） {#provide-a-spy-stub-herodetailservicespy}

这个例子用一个包含 `HeroDetailServiceSpy` 的新数组完全替换了组件的 `providers` 数组。

`HeroDetailServiceSpy` 是真实 `HeroDetailService` 的桩版本，它伪造了该服务所有必要的功能。
它既不注入也不委托给更底层的 `HeroService`，因此不需要为后者提供测试替身。

相关的 `HeroDetail` 组件测试会通过监视服务方法来断言 `HeroDetailService` 的方法被调用了。
因此，这个桩把它的方法实现为间谍：

```ts
import {vi} from 'vitest';

class HeroDetailServiceSpy {
  testHero: Hero = {...testHero};

  /* 发出克隆的测试英雄 */
  getHero = vi.fn(() => asyncData({...this.testHero}));

  /* 发出合并了修改的测试英雄克隆 */
  saveHero = vi.fn((hero: Hero) => asyncData(Object.assign(this.testHero, hero)));
}
```

### 覆盖后的测试 {#the-override-tests}

现在，测试可以通过操作间谍桩的 `testHero` 直接控制组件的英雄，并确认服务方法被调用了。

```ts
let hdsSpy: HeroDetailServiceSpy;

beforeEach(async () => {
  harness = await RouterTestingHarness.create();
  component = await harness.navigateByUrl(`/heroes/${testHero.id}`, HeroDetail);
  page = new Page();
  // 获取组件注入的 HeroDetailServiceSpy
  hdsSpy = harness.routeDebugElement!.injector.get(HeroDetailService) as any;

  harness.detectChanges();
});

it('should have called `getHero`', () => {
  expect(hdsSpy.getHero, 'getHero called once').toHaveBeenCalledTimes(1);
});

it("should display stub hero's name", () => {
  expect(page.nameDisplay.textContent).toBe(hdsSpy.testHero.name);
});

it('should save stub hero change', async () => {
  const origName = hdsSpy.testHero.name;
  const newName = 'New Name';

  page.nameInput.value = newName;

  page.nameInput.dispatchEvent(new Event('input')); // 通知 Angular

  expect(component.hero.name, 'component hero has new name').toBe(newName);
  expect(hdsSpy.testHero.name, 'service hero unchanged before save').toBe(origName);

  click(page.saveBtn);
  expect(hdsSpy.saveHero, 'saveHero called once').toHaveBeenCalledTimes(1);

  await harness.fixture.whenStable();
  expect(hdsSpy.testHero.name, 'service hero has new name after save').toBe(newName);
  expect(TestBed.inject(Router).url).toEqual('/heroes');
});
```

### 更多覆盖 {#more-overrides}

`TestBed.overrideComponent` 方法可以针对相同或不同的组件多次调用。
`TestBed` 还提供了类似的 `overrideDirective`、`overrideModule` 和 `overridePipe` 方法，用于深入并替换这些其他类的部分内容。

请自行探索各种选项和组合。
