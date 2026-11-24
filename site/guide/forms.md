# Angular 中的表单 {#forms-in-angular}

用表单处理用户输入是许多常见应用的基石。


应用通过表单让用户登录、更新个人资料、输入敏感信息，以及完成许多其他数据录入任务。

Angular 提供了两种通过表单处理用户输入的方式：响应式和模板驱动。

两者都会从视图中捕获用户输入事件、验证输入、创建表单和数据模型，并提供跟踪变化的方法。

::: tip 提示
如果你在找新的信号表单（Signal Forms），请查看我们的[信号表单基础指南](/essentials/signal-forms)！

:::

本指南提供的信息可以帮助你判断哪种表单最适合你的场景。
它介绍了两种方式共用的基础构建块。
它还总结了两种方式之间的关键区别，并从设置、数据流和测试三个方面展示这些区别。

## 选择一种方式 {#choosing-an-approach}

响应式表单（Reactive Forms）和模板驱动表单（Template-driven Forms）处理和管理表单数据的方式不同。
每种方式各有优势。

| 表单 | 详情 |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 响应式表单 | 提供对底层表单对象模型的直接、显式访问。与模板驱动表单相比，它们更健壮：可扩展性、可复用性和可测试性都更好。如果表单是应用的关键部分，或者你已经在使用响应式模式构建应用，请使用响应式表单。 |
| 模板驱动表单 | 依靠模板（Template）中的指令（Directive）来创建和操作底层对象模型。它们适合为应用添加简单的表单，比如邮件列表注册表单。它们很容易添加到应用中，但可扩展性不如响应式表单。如果你的表单需求和逻辑非常简单，完全可以在模板中管理，那么模板驱动表单可能很合适。 |

### 关键区别 {#key-differences}

下表总结了响应式表单和模板驱动表单之间的关键区别。

|                                                   | 响应式 | 模板驱动 |
| :------------------------------------------------ | :----------------------------------- | :------------------------------ |
| [表单模型的设置](#setting-up-the-form-model) | 显式，在组件类中创建 | 隐式，由指令创建 |
| [数据模型](#mutability-of-the-data-model)       | 结构化且不可变 | 非结构化且可变 |
| [数据流](#data-flow-in-forms)                  | 同步 | 异步 |
| [表单验证](#form-validation)               | 函数 | 指令 |

### 可扩展性 {#scalability}

如果表单是应用的核心部分，可扩展性就非常重要。
能够在多个组件（Component）之间复用表单模型至关重要。

响应式表单比模板驱动表单更具可扩展性。
它们提供对底层表单 API 的直接访问，并在视图和数据模型之间使用[同步数据流](#data-flow-in-reactive-forms)，这让创建大型表单更容易。
响应式表单的测试所需的设置更少，而且测试时不需要深入理解变更检测（Change Detection），就能正确测试表单的更新和验证。

模板驱动表单侧重于简单场景，复用性较差。
它们把底层表单 API 抽象掉了，并在视图和数据模型之间使用[异步数据流](#data-flow-in-template-driven-forms)。
模板驱动表单的这层抽象也会影响测试。
测试严重依赖手动执行变更检测才能正确运行，并且需要更多设置。

## 设置表单模型 {#setting-up-the-form-model}

响应式表单和模板驱动表单都会跟踪用户交互的表单输入元素与组件模型中的表单数据之间的值变化。
两种方式共享底层构建块，但在创建和管理通用的表单控件（form control）实例的方式上有所不同。

### 通用的表单基础类 {#common-form-foundation-classes}

响应式表单和模板驱动表单都构建在以下基类之上。

| 基类 | 详情 |
| :--------------------- | :---------------------------------------------------------------------------------- |
| `FormControl`          | 跟踪单个表单控件的值和验证状态。 |
| `FormGroup`            | 跟踪一组表单控件的值和状态。 |
| `FormArray`            | 跟踪一个表单控件数组的值和状态。 |
| `ControlValueAccessor` | 在 Angular 的 `FormControl` 实例和内置 DOM 元素之间建立桥梁。 |

### 在响应式表单中设置 {#setup-in-reactive-forms}

使用响应式表单时，你直接在组件类中定义表单模型。
`[formControl]` 指令通过内部的值访问器（value accessor），把显式创建的 `FormControl` 实例链接到视图中的特定表单元素。

下面的组件使用响应式表单，为单个控件实现了一个输入框。
在这个例子中，表单模型就是 `FormControl` 实例。

```ts [favorite-color.component.ts]
import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-reactive-favorite-color',
  template: ` Favorite Color: <input type="text" [formControl]="favoriteColorControl" /> `,
  imports: [ReactiveFormsModule],
})
export class FavoriteColorReactive {
  favoriteColorControl = new FormControl('');
}
```

::: warning 重要
在响应式表单中，表单模型是唯一可信来源（source of truth）；它通过 `<input>` 元素上的 `[formControl]` 指令，提供表单元素在任一时刻的值和状态。

:::

### 在模板驱动表单中设置 {#setup-in-template-driven-forms}

在模板驱动表单中，表单模型是隐式的，而不是显式的。
`NgModel` 指令会为给定的表单元素创建并管理一个 `FormControl` 实例。

下面的组件使用模板驱动表单，为单个控件实现了同样的输入框。

```ts [favorite-color.component.ts]
import {Component, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-template-favorite-color',
  template: ` Favorite Color: <input type="text" [(ngModel)]="favoriteColor" /> `,
  imports: [FormsModule],
})
export class FavoriteColorTemplate {
  favoriteColor = signal('');
}
```

::: warning 重要
在模板驱动表单中，唯一可信来源是模板。`NgModel` 指令会自动为你管理 `FormControl` 实例。

:::

## 表单中的数据流 {#data-flow-in-forms}

当应用包含表单时，Angular 必须让视图与组件模型保持同步，同时也让组件模型与视图保持同步。
当用户通过视图修改值和做出选择时，新值必须反映到数据模型中。
同样，当程序逻辑修改数据模型中的值时，这些值也必须反映到视图中。

响应式表单和模板驱动表单处理来自用户或程序化修改的数据流的方式不同。
下面的图表以上文定义的 favorite-color 输入框为例，展示了每种表单的两类数据流。

### 响应式表单中的数据流 {#data-flow-in-reactive-forms}

在响应式表单中，视图中的每个表单元素都直接链接到表单模型（一个 `FormControl` 实例）。
从视图到模型、从模型到视图的更新都是同步的，并且不依赖于 UI 的渲染方式。

视图到模型的图表展示了当输入框的值在视图中发生变化时，数据如何按以下步骤流动：

1. 用户在输入元素中输入一个值，这里是最喜欢的颜色 *Blue*。
1. 表单输入元素发出一个带有最新值的 "input" 事件。
1. 监听表单输入元素事件的 `ControlValueAccessor` 立即把新值转发给 `FormControl` 实例。
1. `FormControl` 实例通过 `valueChanges` 可观察对象发出新值。
1. `valueChanges` 可观察对象的所有订阅者都会收到新值。

```txt
flowchart TB
    U{User}
    I("&lt;input&gt;")
    CVA(ControlValueAccessor)
    FC(FormControl)
    O(Observers)
    U-->|Types in the input box|I
    I-->|Fires the 'input' event|CVA
    CVA-->|"Calls setValue() on the FormControl"|FC
    FC-.->|Fires a 'valueChanges' event to observers|O
```

模型到视图的图表展示了对模型的程序化修改如何按以下步骤传播到视图。

1. 用户调用 `favoriteColorControl.setValue()` 方法，更新 `FormControl` 的值。
1. `FormControl` 实例通过 `valueChanges` 可观察对象发出新值。
1. `valueChanges` 可观察对象的所有订阅者都会收到新值。
1. 表单输入元素上的控件值访问器（control value accessor）用新值更新该元素。

```txt
flowchart TB
    U{User}
    I("&lt;input&gt;")
    CVA(ControlValueAccessor)
    FC(FormControl)
    O(Observers)
    U-->|"Calls setValue() on the FormControl"|FC
    FC-->|Notifies the ControlValueAccessor|CVA
    FC-.->|Fires a 'valueChanges' event to observers|O
    CVA-->|"Updates the value of the &lt;input&gt;"|I
```

### 模板驱动表单中的数据流 {#data-flow-in-template-driven-forms}

在模板驱动表单中，每个表单元素都链接到一个在内部管理表单模型的指令。

视图到模型的图表展示了当输入框的值在视图中发生变化时，数据如何按以下步骤流动。

1. 用户在输入元素中输入 *Blue*。
1. 输入元素发出一个值为 *Blue* 的 "input" 事件。
1. 附加在该输入框上的控件值访问器触发 `FormControl` 实例的 `setValue()` 方法。
1. `FormControl` 实例通过 `valueChanges` 可观察对象发出新值。
1. `valueChanges` 可观察对象的所有订阅者都会收到新值。
1. 控件值访问器还会调用 `NgModel.viewToModelUpdate()` 方法，该方法会发出一个 `ngModelChange` 事件。
1. 由于组件模板对 `favoriteColor` 属性使用了双向数据绑定（two-way data binding），组件中的 `favoriteColor` 属性会被更新为 `ngModelChange` 事件发出的值（*Blue*）。

```txt
flowchart TB
    U{User}
    I("&lt;input&gt;")
    CVA(ControlValueAccessor)
    FC(FormControl)
    M(NgModel)
    O(Observers)
    C(Component)
    P(Two-way binding)
    U-->|Types in the input box|I
    I-->|Fires the 'input' event|CVA
    CVA-->|"Calls setValue() on the FormControl"|FC
    FC-.->|Fires a 'valueChanges' event to observers|O
    CVA-->|"Calls viewToModelUpdate()"|M
    M-->|Emits an ngModelChange event|C
    C-->|Updates the value of the two-way bound property|P
```

模型到视图的图表展示了当 `favoriteColor` 从 *Blue* 变为 *Red* 时，数据如何按以下步骤从模型流向视图

1. 组件中的 `favoriteColor` 值被更新。
1. 变更检测开始。
1. 在变更检测期间，由于 `NgModel` 指令实例的某个输入（Input）的值发生了变化，该实例上的 `ngOnChanges` 生命周期钩子（Lifecycle Hook）会被调用。
1. `ngOnChanges()` 方法把一个异步任务加入队列，用于设置内部 `FormControl` 实例的值。
1. 变更检测完成。
1. 在下一个 tick 中，设置 `FormControl` 实例值的任务被执行。
1. `FormControl` 实例通过 `valueChanges` 可观察对象发出最新值。
1. `valueChanges` 可观察对象的所有订阅者都会收到新值。
1. 控件值访问器用最新的 `favoriteColor` 值更新视图中的表单输入元素。

```txt
flowchart TB
    C(Component)
    P(Property bound to NgModel)
    C-->|Updates the property value|P
    P-->|Triggers CD|CD1


    subgraph CD1 [First Change Detection]
        direction TB
        M(NgModel)
        FC(FormControl)

        M-->|Asynchronously sets FormControl value|FC
    end
    CD1-->|Async actions trigger a second round of Change Detection|CD2

    subgraph CD2 [Second Change Detection]
        direction TB
        FC2(FormControl)
        O(Observers)
        CVA(ControlValueAccessor)
        I("&lt;input&gt;")
        FC2-.->|Fires a 'valueChanges' event to observers|O
        O-->|ControlValueAccessor receives valueChanges event|CVA
        CVA-->|Sets the value in the control|I
    end
```

::: info 注意
`NgModel` 会触发第二次变更检测，以避免出现 `ExpressionChangedAfterItHasBeenChecked` 错误，因为值的变化源自一个输入绑定。

:::

### 数据模型的可变性 {#mutability-of-the-data-model}

变化跟踪方式会影响应用的效率。

| 表单 | 详情 |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 响应式表单 | 通过把数据模型提供为不可变的数据结构来保持其纯净。每次数据模型上触发变化时，`FormControl` 实例都会返回一个新的数据模型，而不是更新现有的数据模型。这让你可以通过控件的可观察对象跟踪数据模型的每一次独立变化。变更检测也更高效，因为它只需要针对这些独立变化进行更新。由于数据更新遵循响应式模式，你可以结合可观察对象的操作符来转换数据。 |
| 模板驱动表单 | 依靠可变性和双向数据绑定，在模板中发生变化时更新组件中的数据模型。由于使用双向数据绑定时数据模型上没有可跟踪的独立变化，变更检测在判断何时需要更新方面效率较低。 |

前面使用 favorite-color 输入元素的例子就展示了这种区别。

- 使用响应式表单时，每当控件的值更新，**`FormControl` 实例**总会返回一个新值
- 使用模板驱动表单时，**favorite color 属性**总是被直接修改为新值

## 表单验证 {#form-validation}

验证是管理任何表单的必要组成部分。
无论是检查必填字段，还是查询外部 API 以确认用户名是否已存在，Angular 都提供了一组内置验证器（validator），也支持创建自定义验证器。

| 表单 | 详情 |
| :-------------------- | :----------------------------------------------------------------------------------------------------------- |
| 响应式表单 | 把自定义验证器定义为**函数**，接收要验证的控件 |
| 模板驱动表单 | 与模板中的**指令**绑定，必须提供包装了验证函数的自定义验证器指令 |

更多信息，请参阅[表单验证](/guide/forms/form-validation#validating-input-in-reactive-forms)。

## 测试 {#testing}

测试在复杂应用中扮演着重要角色。
在验证表单是否正常工作时，更简单的测试策略会很有帮助。
响应式表单和模板驱动表单在根据表单控件和表单字段的变化进行断言时，对 UI 渲染的依赖程度不同。
下面的例子演示了测试响应式表单和模板驱动表单的过程。

### 测试响应式表单 {#testing-reactive-forms}

响应式表单提供了相对直接的测试策略，因为它们可以同步访问表单和数据模型，而且无需渲染 UI 就能测试。
在这些测试中，状态和数据通过控件来查询和操作，无需与变更检测周期交互。

下面的测试使用前面例子中的 favorite-color 组件，来验证响应式表单中视图到模型和模型到视图的数据流。

<!--todo: make consistent with other topics -->

#### 验证视图到模型的数据流 {#verifying-view-to-model-data-flow}

第一个例子执行以下步骤来验证视图到模型的数据流。

1. 在视图中查询表单输入元素，并为测试创建一个自定义的 "input" 事件。
1. 把输入框的新值设为 *Red*，并在表单输入元素上派发 "input" 事件。
1. 断言组件的 `favoriteColorControl` 值与输入框中的值一致。

```ts [Favorite color test - view to model]
it('should update the value of the input field', () => {
  const input = fixture.nativeElement.querySelector('input');
  const event = createNewEvent('input');

  input.value = 'Red';
  input.dispatchEvent(event);

  expect(fixture.componentInstance.favoriteColorControl.value).toEqual('Red');
});
```

下一个例子执行以下步骤来验证模型到视图的数据流。

1. 使用 `favoriteColorControl`（一个 `FormControl` 实例）设置新值。
1. 在视图中查询表单输入元素。
1. 断言在控件上设置的新值与输入框中的值一致。

```ts [Favorite color test - model to view]
it('should update the value in the control', () => {
  component.favoriteColorControl.setValue('Blue');

  const input = fixture.nativeElement.querySelector('input');

  expect(input.value).toBe('Blue');
});
```

### 测试模板驱动表单 {#testing-template-driven-forms}

为模板驱动表单编写测试，需要详细了解变更检测过程，并理解指令在每个周期中如何运行，才能确保在正确的时机查询、测试或修改元素。

下面的测试使用前面提到的 favorite color 组件，来验证模板驱动表单中从视图到模型、从模型到视图的数据流。

下面的测试验证从视图到模型的数据流。

```ts [Favorite color test - view to model]
it('should update the favorite color in the component', async () => {
  const input = fixture.nativeElement.querySelector('input');
  const event = createNewEvent('input');

  input.value = 'Red';
  input.dispatchEvent(event);

  await fixture.whenStable();

  expect(component.favoriteColor()).toEqual('Red');
});
```

以下是视图到模型测试中执行的步骤。

1. 在视图中查询表单输入元素，并为测试创建一个自定义的 "input" 事件。
1. 把输入框的新值设为 *Red*，并在表单输入元素上派发 "input" 事件。
1. 使用 `await fixture.whenStable()` 等待更新处理完成。
1. 断言组件的 `favoriteColor` 属性值与输入框中的值一致。

下面的测试验证从模型到视图的数据流。

```ts [Favorite color test - model to view]
it('should update the favorite color on the input field', async () => {
  component.favoriteColor.set('Blue');

  await fixture.whenStable();

  const input = fixture.nativeElement.querySelector('input');
  expect(input.value).toBe('Blue');
});
```

以下是模型到视图测试中执行的步骤。

1. 使用组件实例设置 `favoriteColor` 属性的值。
1. 使用 `await fixture.whenStable()` 等待下一次渲染。
1. 在视图中查询表单输入元素。
1. 断言输入框的值与组件实例中 `favoriteColor` 属性的值一致。

## 下一步 {#next-steps}

要深入了解响应式表单，请参阅以下指南：

- [响应式表单](/guide/forms/reactive-forms)
- [表单验证](/guide/forms/form-validation#validating-input-in-reactive-forms)
- [动态表单](/guide/forms/dynamic-forms)


要深入了解模板驱动表单，请参阅以下指南：

- [模板驱动表单教程](/guide/forms/template-driven-forms)
- [表单验证](/guide/forms/form-validation#validating-input-in-template-driven-forms)
- [NgForm 指令 API 参考](https://angular.dev/api/forms/NgForm)

