# 为更多测试环境添加测试工具（harness）支持

## 开始之前

::: tip 提示
本指南假设你已经读过[组件测试工具概览指南](/guide/testing/component-harnesses-overview)。如果你刚开始使用组件测试工具，请先阅读那篇。

:::

### 什么时候需要为测试环境添加支持？

要在以下环境中使用组件（component）测试工具，可以直接使用 Angular CDK 内置的两种环境：

- 单元测试
- WebDriver 端到端测试

要使用受支持的测试环境，请阅读[为组件创建测试工具指南](/guide/testing/creating-component-harnesses)。

否则，要为其他环境添加支持，你需要定义如何与 DOM 元素交互，以及 DOM 交互在你的环境中如何工作。请继续阅读以了解更多内容。

### 安装 CDK

[组件开发工具包（CDK）](https://material.angular.dev/cdk/categories)是一组用于构建组件的行为原语。要使用组件测试工具，首先需要从 npm 安装 `@angular/cdk`。可以在终端中使用 Angular CLI 安装：

```shell
ng add @angular/cdk
```

## 创建 `TestElement` 实现

每个测试环境都必须定义一个 `TestElement` 实现。`TestElement` 接口是 DOM 元素与环境无关的表示形式。它让测试工具无论底层环境是什么都能与 DOM 元素交互。由于有些环境不支持同步地与 DOM 元素交互（例如 WebDriver），`TestElement` 的所有方法都是异步的，返回一个包含操作结果的 `Promise`。

`TestElement` 提供了许多与底层 DOM 交互的方法，例如 `blur()`、`click()`、`getAttribute()` 等。完整的方法列表请参阅 [TestElement API 参考页](https://angular.dev/api/cdk/testing/TestElement)。

`TestElement` 接口主要由类似于 `HTMLElement` 上可用方法的方法组成。大多数测试环境中都有类似的方法，因此实现这些方法相当简单。不过，在实现 `sendKeys` 方法时需要注意一个重要区别：`TestKey` 枚举中的键码很可能与测试环境所用的键码不同。环境作者应当维护一份从 `TestKey` 键码到特定测试环境所用键码的映射。

Angular CDK 中的 [UnitTestElement](https://angular.dev/api/cdk/testing/testbed/UnitTestElement) 和 [SeleniumWebDriverElement](https://angular.dev/api/cdk/testing/selenium-webdriver/SeleniumWebDriverElement) 实现是这个接口很好的实现示例。

## 创建 `HarnessEnvironment` 实现

测试作者使用 `HarnessEnvironment` 来创建在测试中使用的组件测试工具实例。`HarnessEnvironment` 是一个抽象类，必须扩展它来为新环境创建一个具体子类。支持新的测试环境时，请创建一个 `HarnessEnvironment` 子类，为所有抽象成员添加具体实现。

`HarnessEnvironment` 有一个泛型类型参数：`HarnessEnvironment<E>`。这个参数 `E` 表示该环境的原始元素类型。例如，在单元测试环境中，这个参数是 Element。

下面是必须实现的抽象方法：

| 方法                                                         | 说明                                                                                                                       |
| :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `abstract getDocumentRoot(): E`                              | 获取环境的根元素（例如 `document.body`）。                                                                                 |
| `abstract createTestElement(element: E): TestElement`        | 为给定的原始元素创建一个 `TestElement`。                                                                                   |
| `abstract createEnvironment(element: E): HarnessEnvironment` | 创建一个以给定原始元素为根的 `HarnessEnvironment`。                                                                        |
| `abstract getAllRawElements(selector: string): Promise<E[]>` | 获取环境根元素下所有匹配给定选择器（selector）的原始元素。                                                                 |
| `abstract forceStabilize(): Promise<void>`                   | 获取一个在 `NgZone` 稳定时 resolve 的 `Promise`。此外，如果适用，还会让 `NgZone` 进入稳定状态（例如在 `fakeAsync` 测试中调用 `flush()`）。 |
| `abstract waitForTasksOutsideAngular(): Promise<void>`       | 获取一个在 `NgZone` 的父 zone 稳定时 resolve 的 `Promise`。                                                                |

除了实现这些缺失的方法外，这个类还应该为测试作者提供获取 `ComponentHarness` 实例的方式。你应当定义一个 protected 构造函数，并提供一个名为 `loader` 的静态方法，它返回一个 `HarnessLoader` 实例。这样测试作者就可以编写类似 `SomeHarnessEnvironment.loader().getHarness(...)` 的代码。根据特定环境的需要，这个类可以提供多个不同的静态方法，或者要求传入参数。（例如，`TestbedHarnessEnvironment` 上的 `loader` 方法接受一个 `ComponentFixture`，并且这个类还提供了名为 `documentRootLoader` 和 `harnessForFixture` 的额外静态方法）。

Angular CDK 中的 [`TestbedHarnessEnvironment`](https://angular.dev/api/cdk/testing/testbed/TestbedHarnessEnvironment) 和 [SeleniumWebDriverHarnessEnvironment](https://angular.dev/api/cdk/testing/selenium-webdriver/SeleniumWebDriverHarnessEnvironment) 实现是这个接口很好的实现示例。

## 处理自动变更检测

为了支持 `manualChangeDetection` 和 parallel API，你的环境应当为自动变更检测（change detection）状态安装一个处理函数。

当你的环境想要开始处理自动变更检测状态时，可以调用 `handleAutoChangeDetectionStatus(handler)`。处理函数会收到一个 `AutoChangeDetectionStatus`，它有两个属性：`isDisabled` 和 `onDetectChangesNow()`。更多信息请参阅 [AutoChangeDetectionStatus API 参考页](https://angular.dev/api/cdk/testing/AutoChangeDetectionStatus)。
如果你的环境想要停止处理自动变更检测状态，可以调用 `stopHandlingAutoChangeDetectionStatus()`。
