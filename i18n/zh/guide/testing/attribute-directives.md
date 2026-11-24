# 测试属性型指令

*属性型指令*（attribute directive）用于修改元素、组件（component）或其他指令（directive）的行为。
它的名字反映了该指令的应用方式：作为宿主元素（host element）上的一个 attribute。

## 测试 `Highlight` 指令

示例应用中的 `Highlight` 指令会根据数据绑定的颜色或默认颜色（浅灰色）来设置元素的背景色。
它还会把元素的一个自定义属性（`customProperty`）设置为 `true`，这么做没有别的原因，只是为了演示可以这样做。

```ts
import {Directive, inject, input} from '@angular/core';

/**
 * 把所附着元素的 backgroundColor 设置为高亮颜色
 * 并把该元素的 customProperty 属性设置为 true
 */
@Directive({
  selector: '[highlight]',
  host: {
    '[style.backgroundColor]': 'bgColor() || defaultColor',
  },
})
export class Highlight {
  readonly defaultColor = 'rgb(211, 211, 211)'; // 浅灰色

  readonly bgColor = input('', {alias: 'highlight'});
}
```

整个应用中都用到了它，最简单的用法大概就在 `About` 组件中：

```ts
@Component({
  imports: [Twain, Highlight],
  template: `
    <h2 highlight="skyblue">About</h2>
    <h3>Quote of the day:</h3>
    <twain-quote />
  `,
})
export class About {}
```

要测试 `About` 组件中对 `Highlight` 指令的这种特定用法，只需要用到[组件测试场景](/guide/testing/components-scenarios)中[「嵌套组件测试」](/guide/testing/components-scenarios#nested-component-tests)一节所介绍的技巧。

```ts
let fixture: ComponentFixture<About>;

beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [TwainService, UserService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });
  fixture = TestBed.createComponent(About);
  await fixture.whenStable();
});

it('should have skyblue <h2>', () => {
  const h2: HTMLElement = fixture.nativeElement.querySelector('h2');
  const bgColor = h2.style.backgroundColor;
  expect(bgColor).toBe('skyblue');
});
```

然而，只测试一种用例不太可能覆盖指令的全部能力。
找出并测试所有使用该指令的组件既繁琐又脆弱，而且同样难以实现完整的覆盖。

*仅针对类的测试*可能会有帮助，但像这样的属性型指令往往会操作 DOM。
隔离的单元测试不会接触 DOM，因此无法让人对指令的实际效果产生信心。

更好的解决方案是创建一个人工的测试组件，用它来演示应用该指令的所有方式。

```ts
@Component({
  imports: [Highlight],
  template: `
    <h2 highlight="yellow">Something Yellow</h2>
    <h2 highlight>The Default (Gray)</h2>
    <h2>No Highlight</h2>
    <input #box [highlight]="box.value" value="cyan" />
  `,
})
class Test {}
```

<img alt="HighlightDirective spec in action" src="/assets/images/guide/testing/highlight-directive-spec.png">

::: tip 提示
`<input>` 这个用例把 `Highlight` 绑定到了输入框中的颜色名称值上。
初始值是单词 "cyan"，它应该成为输入框的背景色。

:::

下面是针对这个组件的一些测试：

```ts
let fixture: ComponentFixture<Test>;
let des: DebugElement[]; // 带有该指令的三个元素

beforeEach(async () => {
  fixture = TestBed.createComponent(Test);
  await fixture.whenStable();

  // 所有附着了 Highlight 的元素
  des = fixture.debugElement.queryAll(By.directive(Highlight));
});

// 颜色测试
it('should have three highlighted elements', () => {
  expect(des.length).toBe(3);
});

it('should color 1st <h2> background "yellow"', () => {
  const bgColor = des[0].nativeElement.style.backgroundColor;
  expect(bgColor).toBe('yellow');
});

it('should color 2nd <h2> background w/ default color', () => {
  const dir = des[1].injector.get(Highlight);
  const bgColor = des[1].nativeElement.style.backgroundColor;
  expect(bgColor).toBe(dir.defaultColor);
});

it('should bind <input> background to value color', async () => {
  // 使用 nativeElement 更方便
  const input = des[2].nativeElement as HTMLInputElement;
  expect(input.style.backgroundColor, 'initial backgroundColor').toBe('cyan');

  input.value = 'green';

  // 派发一个 DOM 事件，让 Angular 响应输入值的变化。
  input.dispatchEvent(new Event('input'));
  await fixture.whenStable();

  expect(input.style.backgroundColor, 'changed backgroundColor').toBe('green');
});

it('bare <h2> should not have a backgroundColor', () => {
  // 没有 Highlight 指令的 h2
  const bareH2 = fixture.debugElement.query(By.css('h2:not([highlight])'));

  expect(bareH2.styles.backgroundColor).toBeUndefined();
});
```

有几个技巧值得注意：

- *当元素类型未知时*，`By.directive` 谓词是获取带有该指令的元素的好办法
- `By.css('h2:not([highlight])')` 中的 [`:not` 伪类](https://developer.mozilla.org/docs/Web/CSS/:not)可以帮你找到*没有*该指令的 `<h2>` 元素。
  `By.css('*:not([highlight])')` 则会找到*任何*没有该指令的元素。

- 借助 `DebugElement` 抽象，即使没有真实的浏览器，`DebugElement.styles` 也能访问元素的样式。
  不过，如果使用 `nativeElement` 看起来比这个抽象更简单或更清晰，也尽管用它。

- Angular 会把指令添加到其所应用元素的注入器（injector）中。
  针对默认颜色的测试使用第二个 `<h2>` 的注入器来获取它的 `Highlight` 实例及其 `defaultColor`。

- `DebugElement.properties` 可以访问由该指令设置的人工自定义属性

## 单独测试指令

可以使用 `TestBed.createDirective()` 单独创建一个指令，它会返回一个 `DirectiveFixture`。另外，你也可以通过组件的模板（template）来渲染它。
`Highlight` 指令就可以用这种方式来测试，用一个本地测试组件的输入（input）来控制该指令。

```ts
@Component({
  imports: [Highlight],
  template: `<p [highlight]="color()">{{ color() }}</p>`,
})
class Test {
  readonly color = input('');
}

describe('Highlight', () => {
  let fixture: ComponentFixture<Test>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Test);
    await fixture.whenStable();
  });

  it('should use the specified color once an input is provided', async () => {
    fixture.componentRef.setInput('color', 'blue');
    await fixture.whenStable();

    const p = fixture.nativeElement.querySelector('p');
    expect(p.style.backgroundColor).toBe('blue');
  });
});
```
