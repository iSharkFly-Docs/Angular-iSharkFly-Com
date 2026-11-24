# 在测试中使用组件测试工具

## 开始之前

::: tip 提示
本指南假设你已经读过[组件测试工具概览指南](/guide/testing/component-harnesses-overview)。如果你刚开始接触组件测试工具（component harness），请先阅读那篇指南。

:::

### 安装 CDK

[组件开发工具包（CDK）](https://material.angular.dev/cdk/categories)是一组用于构建组件（component）的行为原语。要使用组件测试工具，首先需要从 npm 安装 `@angular/cdk`。你可以在终端中使用 Angular CLI 完成安装：

```shell
ng add @angular/cdk
```

## 测试工具环境与加载器

你可以在不同的测试环境中使用组件测试工具。Angular CDK 支持两种内置环境：

- 使用 Angular `TestBed` 的单元测试
- 使用 [WebDriver](https://developer.mozilla.org/en-US/docs/Web/WebDriver) 的端到端测试

每种环境都提供一个<strong>测试工具加载器</strong>（harness loader）。加载器负责创建你在测试中使用的测试工具实例。关于所支持测试环境的更具体说明，请参阅下文。

其他测试环境需要自定义绑定（binding）。更多信息请参阅[为其他测试环境添加测试工具支持指南](/guide/testing/component-harnesses-testing-environments)。

### 在单元测试中使用 `TestbedHarnessEnvironment` 的加载器

对于单元测试，你可以通过 [TestbedHarnessEnvironment](https://angular.dev/api/cdk/testing/testbed/TestbedHarnessEnvironment) 创建测试工具加载器。这个环境使用由 Angular `TestBed` 创建的[组件 fixture](https://angular.dev/api/core/testing/ComponentFixture)。

要创建一个以 fixture 根元素为根的测试工具加载器，请使用 `loader()` 方法：

```ts
const fixture = TestBed.createComponent(MyComponent);

// 从 fixture 创建测试工具加载器
const loader = TestbedHarnessEnvironment.loader(fixture);
...

// 使用加载器获取测试工具实例
const myComponentHarness = await loader.getHarness(MyComponent);
```

要为位于 fixture 之外的元素创建测试工具加载器，请使用 `documentRootLoader()` 方法。例如，显示浮动元素或弹出框的代码常常会把 DOM 元素直接附加到 document body 上，Angular CDK 中的 `Overlay` 服务（service）就是如此。

你也可以直接使用 `harnessForFixture()`，为该 fixture 根元素上的测试工具直接创建加载器。

### 在端到端测试中使用 `SeleniumWebDriverHarnessEnvironment` 的加载器

对于基于 WebDriver 的端到端测试，你可以使用 `SeleniumWebDriverHarnessEnvironment` 创建测试工具加载器。

使用 `loader()` 方法获取当前 HTML 文档的测试工具加载器实例，它以文档的根元素为根。这个环境使用 WebDriver 客户端。

```ts
let wd: webdriver.WebDriver = getMyWebDriverClient();
const loader = SeleniumWebDriverHarnessEnvironment.loader(wd);
...
const myComponentHarness = await loader.getHarness(MyComponent);
```

## 使用测试工具加载器

测试工具加载器实例对应于某个特定的 DOM 元素，用于为该元素之下的元素创建组件测试工具实例。

要获取元素第一个实例的 `ComponentHarness`，请使用 `getHarness()` 方法。要获取所有的 `ComponentHarness` 实例，请使用 `getAllHarnesses()` 方法。

```ts
// 获取元素第一个实例的测试工具
const myComponentHarness = await loader.getHarness(MyComponent);

// 获取元素所有实例的测试工具
const myComponentHarnesses = await loader.getAllHarnesses(MyComponent);
```

除了 `getHarness` 和 `getAllHarnesses`，`HarnessLoader` 还有其他几个用于查询（query）测试工具的实用方法：

- `getHarnessAtIndex(...)`：获取在指定索引处、符合给定条件的组件的测试工具。
- `countHarnesses(...)`：统计符合给定条件的组件实例数量。
- `hasHarness(...)`：检查是否至少有一个组件实例符合给定条件。

举个例子，假设有一个可复用的对话框按钮组件，点击时会打开一个对话框。它包含以下组件，每个组件都有对应的测试工具：

- `MyDialogButton`（以便捷的 API 组合了 `MyButton` 和 `MyDialog`）
- `MyButton`（一个标准的按钮组件）
- `MyDialog`（点击时由 `MyDialogButton` 追加到 `document.body` 上的对话框）

下面的测试为其中每个组件加载测试工具：

```ts
let fixture: ComponentFixture<MyDialogButton>;
let loader: HarnessLoader;
let rootLoader: HarnessLoader;

beforeEach(() => {
  fixture = TestBed.createComponent(MyDialogButton);
  loader = TestbedHarnessEnvironment.loader(fixture);
  rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
});

it('loads harnesses', async () => {
  // 使用 `harnessForFixture` 为引导的组件加载测试工具
  dialogButtonHarness = await TestbedHarnessEnvironment.harnessForFixture(
    fixture,
    MyDialogButtonHarness,
  );

  // 按钮元素位于 fixture 的根元素内，所以我们使用 `loader`。
  const buttonHarness = await loader.getHarness(MyButtonHarness);

  // 点击按钮打开对话框
  await buttonHarness.click();

  // 对话框被追加到 `document.body` 上，位于 fixture 根元素之外，
  // 所以这里我们使用 `rootLoader`。
  const dialogHarness = await rootLoader.getHarness(MyDialogHarness);

  // ... 进行一些断言
});
```

### 测试工具在不同环境中的行为

测试工具在不同环境中的行为可能不完全相同。真实的用户交互与单元测试中生成的模拟事件之间，有些差异是不可避免的。Angular CDK 会尽最大努力在可能的范围内统一这些行为。

### 与子元素交互

要与该测试工具加载器根元素之下的元素交互，请使用子元素的 `HarnessLoader` 实例。对于子元素的第一个实例，使用 `getChildLoader()` 方法；对于子元素的所有实例，使用 `getAllChildLoaders()` 方法。

```ts
const myComponentHarness = await loader.getHarness(MyComponent);

// 获取第一个匹配 '.child' 选择器的子元素实例的加载器
const childLoader = await loader.getChildLoader('.child');

// 获取所有匹配 '.child' 选择器的子元素实例的加载器
const allChildLoaders = await loader.getAllChildLoaders('.child');
```

### 过滤测试工具

当页面中包含某个组件的多个实例时，你可能希望根据组件的某个属性进行过滤，以获取特定的组件实例。为此，你可以使用<strong>测试工具谓词</strong>（harness predicate）。它是一个类，用于把 `ComponentHarness` 类与可用来过滤组件实例的谓词函数关联起来。

当你向 `HarnessLoader` 请求测试工具时，实际上提供的是一个 HarnessQuery。查询可以是以下两种之一：

- 测试工具的构造函数。它只是获取该测试工具
- `HarnessPredicate`，它获取根据一个或多个条件过滤后的测试工具

`HarnessPredicate` 确实支持一些基础过滤器（selector、ancestor），它们适用于任何扩展自 `ComponentHarness` 的类。

```ts
// 使用测试工具谓词加载 MyButtonComponentHarness 的示例
const disabledButtonPredicate = new HarnessPredicate(MyButtonComponentHarness, {
  selector: '[disabled]',
});
const disabledButton = await loader.getHarness(disabledButtonPredicate);
```

不过，测试工具通常会实现一个静态的 `with()` 方法，它接受特定于组件的过滤选项，并返回一个 `HarnessPredicate`。

```ts
// 使用特定选择器加载 MyButtonComponentHarness 的示例
const button = await loader.getHarness(MyButtonComponentHarness.with({selector: 'btn'}));
```

由于额外的过滤选项因各个测试工具的实现而异，更多细节请参阅具体测试工具的文档。

## 使用测试工具 API

虽然每个测试工具都定义了特定于其对应组件的 API，但它们都共享一个公共基类 [ComponentHarness](https://angular.dev/api/cdk/testing/ComponentHarness)。这个基类定义了一个静态属性 `hostSelector`，用于把测试工具类与 DOM 中的组件实例匹配起来。

除此之外，任何测试工具的 API 都特定于其对应的组件；要了解如何使用某个特定的测试工具，请参阅该组件的文档。

举个例子，下面是一个使用 [Angular Material 滑块组件测试工具](https://material.angular.dev/components/slider/api#MatSliderHarness)的组件测试：

```ts
it('should get value of slider thumb', async () => {
  const slider = await loader.getHarness(MatSliderHarness);
  const thumb = await slider.getEndThumb();
  expect(await thumb.getValue()).toBe(50);
});
```

## 与 Angular 变更检测互操作

默认情况下，测试工具会在读取 DOM 元素状态之前以及与 DOM 元素交互之后，运行 Angular 的[变更检测](/best-practices/runtime-performance)（change detection）。

有时你可能需要在测试中更精细地控制变更检测，例如在异步操作尚未完成时检查组件的状态。在这些情况下，可以使用 `manualChangeDetection` 函数，为一段代码禁用对变更检测的自动处理。

```ts
it('checks state while async action is in progress', async () => {
  const buttonHarness = await loader.getHarness(MyButtonHarness);
  await manualChangeDetection(async () => {
    await buttonHarness.click();
    fixture.detectChanges();
    // 在异步点击操作进行期间检查预期。
    expect(isProgressSpinnerVisible()).toBe(true);
    await fixture.whenStable();
    // 在异步点击操作完成后检查预期。
    expect(isProgressSpinnerVisible()).toBe(false);
  });
});
```

几乎所有测试工具方法都是异步的，并返回一个 `Promise`，以支持以下几点：

- 支持单元测试
- 支持端到端测试
- 使测试不受异步行为变化的影响

Angular 团队建议使用 [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) 来提高测试的可读性。调用 `await` 会阻塞测试的执行，直到相关的 `Promise` 解析为止。

有时，你可能希望同时执行多个操作并等待它们全部完成，而不是依次执行每个操作。例如，读取单个组件的多个属性。在这些情况下，可以使用 `parallel` 函数让这些操作并行执行。`parallel` 函数的工作方式与 `Promise.all` 类似，同时还会优化变更检测的检查。

```ts
it('reads properties in parallel', async () => {
  const checkboxHarness = await loader.getHarness(MyCheckboxHarness);
  // 同时读取 checked 和 intermediate 属性。
  const [checked, indeterminate] = await parallel(() => [
    checkboxHarness.isChecked(),
    checkboxHarness.isIndeterminate(),
  ]);
  expect(checked).toBe(false);
  expect(indeterminate).toBe(true);
});
```
