# 为组件创建测试工具（harness） {#creating-harnesses-for-your-components}

## 开始之前 {#before-you-start}

::: tip 提示
本指南假定你已经阅读过[组件测试工具概览指南](/guide/testing/component-harnesses-overview)。如果你刚开始使用组件测试工具，请先阅读那篇指南。

:::

### 什么时候适合创建测试工具？ {#when-does-creating-a-test-harness-make-sense}

Angular 团队建议为那些在许多地方使用、且具有一定用户交互的共享组件（Component）创建组件测试工具（harness）。这最常见于组件库（widget library）以及类似的可复用组件。在这些场景下，测试工具很有价值，因为它们为这些共享组件的使用者提供了一套得到良好支持的 API，用于与组件交互。使用测试工具的测试可以避免依赖这些共享组件中不可靠的实现细节，例如 DOM 结构和特定的事件监听器（Event Listener）。

对于只出现在一个地方的组件（例如应用中的某个页面），测试工具带来的好处就没那么多了。在这些情况下，组件的测试依赖该组件的实现细节是合理的，因为测试和组件会同时更新。不过，如果你会在单元测试和端到端测试中同时使用测试工具，它仍然能提供一些价值。

### 安装 CDK {#cdk-installation}

[组件开发工具包（Component Dev Kit，CDK）](https://material.angular.dev/cdk/categories)是一组用于构建组件的行为原语。要使用组件测试工具，请先从 npm 安装 `@angular/cdk`。你可以在终端中使用 Angular CLI 完成安装：

```shell
ng add @angular/cdk
```

## 扩展 `ComponentHarness` {#extending-componentharness}

抽象类 `ComponentHarness` 是所有组件测试工具的基类。要创建自定义的组件测试工具，请扩展 `ComponentHarness` 并实现静态属性 `hostSelector`。

`hostSelector` 属性用于在 DOM 中识别与该测试工具子类相匹配的元素。大多数情况下，`hostSelector` 应该与对应 `Component` 或 `Directive` 的选择器（Selector）相同。例如，考虑一个简单的弹出框组件：

```ts
@Component({
  selector: 'my-popup',
  template: `
    <button (click)="toggle()">{{ triggerText() }}</button>
    @if (isOpen()) {
      <div class="my-popup-content"><ng-content /></div>
    }
  `,
})
class MyPopup {
  triggerText = input('');

  isOpen = signal(false);

  toggle() {
    this.isOpen.update((value) => !value);
  }
}
```

在这种情况下，该组件的最简测试工具如下所示：

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';
}
```

虽然 `ComponentHarness` 子类只要求提供 `hostSelector` 属性，但大多数测试工具还应该实现一个静态的 `with` 方法，用于生成 `HarnessPredicate` 实例。[筛选测试工具](/guide/testing/using-component-harnesses#filtering-harnesses)一节对此有更详细的介绍。

## 在组件的 DOM 中查找元素 {#finding-elements-in-the-component-s-dom}

`ComponentHarness` 子类的每个实例都代表对应组件的一个特定实例。你可以通过 `ComponentHarness` 基类的 `host() `方法访问组件的宿主元素（Host Element）。

`ComponentHarness` 还提供了几个用于在组件 DOM 中定位元素的方法：`locatorFor()`、`locatorForOptional()` 和 `locatorForAll()`。这些方法创建的是用于查找元素的函数，而不是直接查找元素。这种做法可以防止缓存对过期元素的引用。例如，当 `@if` 块先隐藏再显示某个元素时，得到的是一个新的 DOM 元素；使用函数可以确保测试始终引用 DOM 的当前状态。

关于各种 `locatorFor` 方法的完整列表和详细信息，请参阅 [ComponentHarness API 参考页面](https://angular.dev/api/cdk/testing/ComponentHarness)。

例如，前面讨论的 `MyPopupHarness` 示例可以提供获取触发元素和内容元素的方法，如下所示：

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  // 获取触发元素
  getTriggerElement = this.locatorFor('button');

  // 获取内容元素。
  getContentElement = this.locatorForOptional('.my-popup-content');
}
```

## 使用 `TestElement` 实例 {#working-with-testelement-instances}

`TestElement` 是一种抽象，设计用于在不同的测试环境（单元测试、WebDriver 等）中工作。使用测试工具时，你应该通过这个接口完成所有 DOM 交互。其他访问 DOM 元素的方式（例如 `document.querySelector()`）并不能在所有测试环境中工作。

`TestElement` 提供了许多与底层 DOM 交互的方法，例如 `blur()`、`click()`、`getAttribute()` 等。完整的方法列表请参阅 [TestElement API 参考页面](https://angular.dev/api/cdk/testing/TestElement)。

不要把 `TestElement` 实例暴露给测试工具的使用者，除非该元素是由组件使用者直接定义的，例如组件的宿主元素。为内部元素暴露 `TestElement` 实例，会导致使用者依赖组件内部的 DOM 结构。

相反，应该针对最终用户可能执行的特定操作或可能观察到的特定状态，提供更有针对性的方法。例如，前面各节中的 `MyPopupHarness` 可以提供 `toggle` 和 `isOpen` 这样的方法：

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  protected getTriggerElement = this.locatorFor('button');
  protected getContentElement = this.locatorForOptional('.my-popup-content');

  /** 切换弹出框的打开状态。 */
  async toggle() {
    const trigger = await this.getTriggerElement();
    return trigger.click();
  }

  /** 检查弹出框是否已打开。 */
  async isOpen() {
    const content = await this.getContentElement();
    return !!content;
  }
}
```

## 为子组件加载测试工具 {#loading-harnesses-for-subcomponents}

较大的组件通常由多个子组件组合而成。你也可以在组件的测试工具中反映这种结构。`ComponentHarness` 上的每个 `locatorFor` 方法都有一个替代签名，可以用来定位子测试工具，而不是元素。

关于各种 locatorFor 方法的完整列表，请参阅 [ComponentHarness API 参考页面](https://angular.dev/api/cdk/testing/ComponentHarness)。

例如，考虑一个使用上面的弹出框构建的菜单：

```ts
@Directive({
  selector: 'my-menu-item',
})
class MyMenuItem {}

@Component({
  selector: 'my-menu',
  template: `
    <my-popup>
      <ng-content />
    </my-popup>
  `,
})
class MyMenu {
  triggerText = input('');

  items = contentChildren(MyMenuItem);
}
```

这样，`MyMenu` 的测试工具就可以利用 `MyPopup` 和 `MyMenuItem` 的其他测试工具：

```ts
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  protected getPopupHarness = this.locatorFor(MyPopupHarness);

  /** 获取当前显示的菜单项（菜单关闭时为空列表）。 */
  getItems = this.locatorForAll(MyMenuItemHarness);

  /** 切换菜单的打开状态。 */
  async toggle() {
    const popupHarness = await this.getPopupHarness();
    return popupHarness.toggle();
  }
}

class MyMenuItemHarness extends ComponentHarness {
  static hostSelector = 'my-menu-item';
}
```

## 使用 `HarnessPredicate` 筛选测试工具实例 {#filtering-harness-instances-with-harnesspredicate}

当页面中包含某个组件的多个实例时，你可能希望根据组件的某个属性进行筛选，以获取特定的组件实例。例如，你可能想要一个带有特定文本的按钮，或者一个带有特定 ID 的菜单。`HarnessPredicate` 类可以为某个 `ComponentHarness` 子类描述这类条件。虽然测试作者可以手动构造 `HarnessPredicate` 实例，但如果 `ComponentHarness` 子类提供了一个辅助方法来为常见筛选条件构造谓词，就会更方便。

你应该在每个 `ComponentHarness` 子类上创建一个静态的 `with()` 方法，用于返回该类的 `HarnessPredicate`。这样测试作者就能编写易于理解的代码，例如 `loader.getHarness(MyMenuHarness.with({selector: '#menu1'}))`。除了标准的 selector 和 ancestor 选项之外，`with` 方法还应该添加对该子类有意义的其他选项。

需要添加额外选项的测试工具应该扩展 `BaseHarnessFilters` 接口，并根据需要添加额外的可选属性。`HarnessPredicate` 提供了几个用于添加选项的便捷方法：`stringMatches()`、`addOption()` 和 `add()`。完整说明请参阅 [HarnessPredicate API 页面](https://angular.dev/api/cdk/testing/HarnessPredicate)。

例如，在处理菜单时，按触发器文本筛选菜单、按文本筛选菜单项会很有用：

```ts
interface MyMenuHarnessFilters extends BaseHarnessFilters {
  /** 根据菜单的触发器文本进行筛选。 */
  triggerText?: string | RegExp;
}

interface MyMenuItemHarnessFilters extends BaseHarnessFilters {
  /** 根据菜单项的文本进行筛选。 */
  text?: string | RegExp;
}

class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  /** 创建一个用于定位特定 `MyMenuHarness` 的 `HarnessPredicate`。 */
  static with(options: MyMenuHarnessFilters): HarnessPredicate<MyMenuHarness> {
    return new HarnessPredicate(MyMenuHarness, options).addOption(
      'trigger text',
      options.triggerText,
      (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text),
    );
  }

  protected getPopupHarness = this.locatorFor(MyPopupHarness);

  /** 获取菜单触发器的文本。 */
  async getTriggerText(): Promise<string> {
    const popupHarness = await this.getPopupHarness();
    return popupHarness.getTriggerText();
  }
}

class MyMenuItemHarness extends ComponentHarness {
  static hostSelector = 'my-menu-item';

  /** 创建一个用于定位特定 `MyMenuItemHarness` 的 `HarnessPredicate`。 */
  static with(options: MyMenuItemHarnessFilters): HarnessPredicate<MyMenuItemHarness> {
    return new HarnessPredicate(MyMenuItemHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
    );
  }

  /** 获取菜单项的文本。 */
  async getText(): Promise<string> {
    const host = await this.host();
    return host.text();
  }
}
```

对于 `HarnessLoader`、`LocatorFactory` 或 `ComponentHarness` 上的任何 API，你都可以传入一个 `HarnessPredicate` 来代替 `ComponentHarness` 类。这让测试作者在创建测试工具实例时可以轻松地定位到特定的组件实例。它还让测试工具的作者可以利用同一个 `HarnessPredicate`，在自己的测试工具类上提供更强大的 API。例如，考虑上面 `MyMenuHarness` 中的 `getItems` 方法。添加筛选 API 后，测试工具的使用者就可以搜索特定的菜单项：

```ts
class MyMenuHarness extends ComponentHarness {
  static hostSelector = 'my-menu';

  /** 获取菜单中的菜单项列表，可以根据给定条件进行筛选。 */
  async getItems(filters: MyMenuItemHarnessFilters = {}): Promise<MyMenuItemHarness[]> {
    const getFilteredItems = this.locatorForAll(MyMenuItemHarness.with(filters));
    return getFilteredItems();
  }
  ...
}
```

## 为使用内容投影的元素创建 `HarnessLoader` {#creating-harnessloader-for-elements-that-use-content-projection}

有些组件会把额外的内容投影到组件的模板（Template）中。更多信息请参阅[内容投影指南](/guide/components/content-projection)。

当你为使用内容投影（Content Projection）的组件创建测试工具时，请添加一个作用域限定在包含 `<ng-content>` 的元素上的 `HarnessLoader` 实例。这样测试工具的使用者就可以为作为内容传入的任何组件加载额外的测试工具。`ComponentHarness` 提供了几个方法，可用于在这类情况下创建 HarnessLoader 实例：`harnessLoaderFor()`、`harnessLoaderForOptional()`、`harnessLoaderForAll()`。更多详情请参阅 [HarnessLoader 接口 API 参考页面](https://angular.dev/api/cdk/testing/HarnessLoader)。

例如，上面的 `MyPopupHarness` 示例可以扩展 `ContentContainerComponentHarness`，以支持在组件的 `<ng-content>` 中加载测试工具。

```ts
class MyPopupHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = 'my-popup';
}
```

## 访问组件宿主元素之外的元素 {#accessing-elements-outside-of-the-component-s-host-element}

有时，组件测试工具可能需要访问其对应组件宿主元素之外的元素。例如，显示浮动元素或弹出框的代码通常会把 DOM 元素直接附加到文档的 body 上，比如 Angular CDK 中的 `Overlay` 服务（Service）。

在这种情况下，`ComponentHarness` 提供了一个方法，可用于获取以文档根元素为根的 `LocatorFactory`。`LocatorFactory` 支持的 API 与 `ComponentHarness` 基类大部分相同，可以用来相对于文档根元素进行查询。

假设上面的 `MyPopup` 组件使用 CDK overlay 来显示弹出内容，而不是使用自己模板中的元素。在这种情况下，`MyPopupHarness` 就必须通过 `documentRootLocatorFactory()` 方法来访问内容元素，该方法会获取一个以文档根为根的定位器工厂。

```ts
class MyPopupHarness extends ComponentHarness {
  static hostSelector = 'my-popup';

  /** 获取一个以弹出框内容元素为根元素的 `HarnessLoader`。 */
  async getHarnessLoaderForContent(): Promise<HarnessLoader> {
    const rootLocator = this.documentRootLocatorFactory();
    return rootLocator.harnessLoaderFor('my-popup-content');
  }
}
```

## 等待异步任务 {#waiting-for-asynchronous-tasks}

`TestElement` 上的方法会自动触发 Angular 的变更检测（Change Detection），并等待 `NgZone` 中的任务。大多数情况下，测试工具的作者无需为等待异步任务做任何特殊处理。不过，在某些边缘情况下，这样可能还不够。

在某些情况下，Angular 动画（Animation）可能需要第二轮变更检测以及随后的 `NgZone` 稳定，才能完全清空动画事件。在需要这样做的情况下，`ComponentHarness` 提供了一个 `forceStabilize()` 方法，可以调用它来执行第二轮。

你可以使用 `NgZone.runOutsideAngular()` 在 NgZone 之外调度任务。如果需要显式等待 `NgZone` 之外的任务，请在对应的测试工具上调用 `waitForTasksOutsideAngular()` 方法，因为这不会自动发生。
