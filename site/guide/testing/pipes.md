# 测试管道 {#testing-pipes}

你可以在不使用 Angular 测试工具的情况下测试[管道（pipe）](/guide/templates/pipes)。

## 测试 `TitleCasePipe` {#testing-the-titlecasepipe}

管道类只有一个方法 `transform`，它把输入值处理成转换后的输出值。
`transform` 的实现很少与 DOM 交互。
除了 `@Pipe` 元数据和一个接口之外，大多数管道都不依赖 Angular。

来看一个把每个单词的首字母大写的 `TitleCasePipe`。
下面是一个用正则表达式实现的版本。

```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'titlecase', pure: true})
/** 转换为标题格式：把字符串中每个单词的首字母大写。 */
export class TitleCasePipe implements PipeTransform {
  transform(input: string): string {
    return input.length === 0
      ? ''
      : input.replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.slice(1).toLowerCase());
  }
}
```

凡是用到正则表达式的代码都值得彻底测试。你可以用标准的单元测试（test）技术来检查预期情况和边界情况。

```ts
describe('TitleCasePipe', () => {
  // 这个管道是纯的、无状态的函数，所以不需要 BeforeEach
  const pipe = new TitleCasePipe();

  it('transforms "abc" to "Abc"', () => {
    expect(pipe.transform('abc')).toBe('Abc');
  });

  it('transforms "abc def" to "Abc Def"', () => {
    expect(pipe.transform('abc def')).toBe('Abc Def');
  });

  // ... 更多测试 ...
});
```

## 编写 DOM 测试来配合管道测试 {#writing-dom-tests-to-support-a-pipe-test}

这些是对管道的*隔离*测试。
它们无法判断 `TitleCasePipe` 应用到应用的组件（component）中时是否能正常工作。

可以考虑添加类似下面这样的组件测试：

```ts
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
