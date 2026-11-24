# 响应式表单

响应式表单（Reactive Forms）提供了一种模型驱动的方式来处理值会随时间变化的表单输入。
本指南将介绍如何创建和更新基本的表单控件（form control）、在一个组中使用多个控件、验证表单值，以及创建可以在运行时添加或移除控件的动态表单。

## 响应式表单概览

响应式表单使用显式且不可变的方式来管理表单在某个特定时间点的状态。
对表单状态的每次修改都会返回一个新的状态，从而在两次变更之间保持模型的完整性。
响应式表单围绕可观察流（observable stream）构建，表单输入和值都以流的形式提供，并且可以同步访问。

响应式表单还让测试（testing）变得简单直接，因为你可以确信在请求数据时，数据是一致且可预测的。
这些流的任何消费者都可以安全地操作这些数据。

响应式表单与[模板驱动表单](/guide/forms/template-driven-forms)（Template-driven Forms）有着明显的区别。
响应式表单提供对数据模型的同步访问、借助可观察对象操作符实现的不可变性，以及通过可观察流进行的变更追踪。

模板驱动表单允许直接在模板（template）中修改数据，但不如响应式表单那样明确，因为它们依赖于嵌入在模板中的指令（directive），并借助可变数据来异步追踪变更。
关于这两种范式的详细比较，请参阅[表单概览](/guide/forms)。

## 添加基本的表单控件

使用表单控件需要三个步骤。

1. 生成一个新组件（component），并注册响应式表单模块。该模块声明了使用响应式表单所需的响应式表单指令。
1. 实例化一个新的 `FormControl`。
1. 在模板中注册这个 `FormControl`。

然后，你就可以通过把该组件添加到模板中来显示这个表单。

下面的示例展示了如何添加单个表单控件。
在这个示例中，用户在输入框中输入自己的名字，程序捕获这个输入值，并显示表单控件元素的当前值。



### 1. 生成一个新组件并导入 ReactiveFormsModule

使用 CLI 命令 `ng generate component` 在项目中生成一个组件，从 `@angular/forms` 包中导入 `ReactiveFormsModule`，并把它添加到组件的 `imports` 数组中。

```ts [name-editor.component.ts (excerpt)]
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-name-editor',
  templateUrl: './name-editor.component.html',
  styleUrls: ['./name-editor.component.css'],
  imports: [ReactiveFormsModule],
})
export class NameEditorComponent {
```


### 2. 声明一个 FormControl 实例

使用 `FormControl` 的构造函数来设置它的初始值，在本例中是一个空字符串。通过在组件类中创建这些控件，你可以立即监听、更新和验证表单输入的状态。

```ts [name-editor.component.ts]
import {Component} from '@angular/core';

import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-name-editor',
  templateUrl: './name-editor.component.html',
  styleUrls: ['./name-editor.component.css'],
  imports: [ReactiveFormsModule],
})
export class NameEditorComponent {
  name = new FormControl('');
}
```


### 3. 在模板中注册控件

在组件类中创建控件之后，你必须把它与模板中的某个表单控件元素关联起来。使用 `FormControlDirective` 提供的 `formControl` 绑定（binding）在模板中更新这个表单控件，该指令同样包含在 `ReactiveFormsModule` 中。

```html [name-editor.component.html]
<label for="name">Name: </label>
<input id="name" type="text" [formControl]="name" />
```

借助模板绑定语法，这个表单控件现在已经注册到模板中的 `name` 输入元素上了。表单控件和 DOM 元素会相互通信：视图会反映模型中的变化，模型也会反映视图中的变化。


### 4. 显示组件

当把 `<app-name-editor>` 组件添加到模板中时，赋值给 `name` 属性的 `FormControl` 就会显示出来。

```html [app.component.html (name editor)]
<app-name-editor />
```



### 显示表单控件的值

你可以通过以下方式显示这个值：

- 通过可观察对象 `valueChanges`，你可以在模板中使用 `AsyncPipe`，或在组件类中使用 `subscribe()` 方法来监听表单值的变化
- 通过 `value` 属性，它会给出当前值的快照

下面的示例展示了如何在模板中使用插值来显示当前值。

```html [name-editor.component.html (control value)]
<p>Value: {{ name.value }}</p>
```

当你更新表单控件元素时，显示的值也会随之改变。

响应式表单通过每个实例提供的属性和方法，让你可以访问某个控件的相关信息。
底层 [AbstractControl](https://angular.dev/api/forms/AbstractControl 'API reference') 类的这些属性和方法，用于控制表单状态，并在处理[输入验证](#validating-form-input 'Learn more about validating form input')时决定何时显示消息。

关于 `FormControl` 的其他属性和方法，请参阅 [API 参考](https://angular.dev/api/forms/FormControl 'Detailed syntax reference')。

### 替换表单控件的值

响应式表单提供了以编程方式修改控件值的方法，让你可以灵活地在没有用户交互的情况下更新值。
表单控件实例提供了一个 `setValue()` 方法，它会更新表单控件的值，并根据控件的结构来验证所提供值的结构。
例如，当从后端 API 或服务（service）获取表单数据时，可以使用 `setValue()` 方法把控件更新为新值，从而完全替换旧值。

下面的示例在组件类中添加了一个方法，使用 `setValue()` 方法把控件的值更新为 *Nancy*。

```ts [name-editor.component.ts (update value)]
updateName() {
  this.name.setValue('Nancy');
}
```

在模板中添加一个按钮，用来模拟名字的更新。
当你点击 **Update Name** 按钮时，表单控件元素中输入的值就会反映为它的当前值。

```html [name-editor.component.html (update value)]
<button type="button" (click)="updateName()">Update Name</button>
```

表单模型是控件的唯一事实来源（source of truth），因此当你点击按钮时，输入框的值会在组件类中被修改，覆盖其当前值。

::: tip 提示
在这个示例中，你使用的是单个控件。
当对[表单组](#grouping-form-controls)或[表单数组](#creating-dynamic-forms)实例使用 `setValue()` 方法时，值需要与组或数组的结构相匹配。

:::

## 对表单控件进行分组

表单通常包含多个相关的控件。
响应式表单提供了两种方式，可以把多个相关控件分组到同一个输入表单中。

| 表单分组 | 详情                                                                                                                                                                                                                                                |
| :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 表单组（form group）  | 定义一个包含固定控件集合的表单，你可以统一管理这些控件。本节将讨论表单组的基础知识。你还可以[嵌套表单组](#creating-nested-form-groups 'See more about nesting groups')来创建更复杂的表单。 |
| 表单数组（form array）  | 定义一个动态表单，你可以在运行时添加和移除控件。你也可以嵌套表单数组来创建更复杂的表单。关于这种方式的更多信息，请参阅[创建动态表单](#creating-dynamic-forms)。                              |

就像表单控件实例让你可以控制单个输入字段一样，表单组实例会追踪一组表单控件实例（例如一个表单）的表单状态。
创建表单组时，表单组实例中的每个控件都会按名称进行追踪。
下面的示例展示了如何在一个组中管理多个表单控件实例。

生成一个 `ProfileEditor` 组件，并从 `@angular/forms` 包中导入 `FormGroup` 和 `FormControl` 类。

```shell
ng generate component ProfileEditor
```

```ts [profile-editor.component.ts (imports)]
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  imports: [ReactiveFormsModule],
})
export class ProfileEditorComponent {
```

要为这个组件添加表单组，请执行以下步骤。

1. 创建一个 `FormGroup` 实例。
1. 关联 `FormGroup` 模型和视图。
1. 保存表单数据。



### 1. 创建一个 FormGroup 实例

在组件类中创建一个名为 `profileForm` 的属性，并把它设置为一个新的表单组实例。要初始化这个表单组，需要向构造函数提供一个对象，其中的各个命名键分别映射到对应的控件。

对于这个个人资料表单，添加两个表单控件实例，名称分别为 `firstName` 和 `lastName`

```ts [profile-editor.component.ts (form group)]
import {Component} from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  imports: [ReactiveFormsModule],
})
export class ProfileEditorComponent {
  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
  });
}
```

现在，各个表单控件都被收集到了一个组中。`FormGroup` 实例以一个对象的形式提供其模型值，该对象由组中每个控件的值汇总而成。表单组实例拥有与表单控件实例相同的属性（例如 `value` 和 `untouched`）和方法（例如 `setValue()`）。


### 2. 关联 FormGroup 模型和视图

表单组会追踪其中每个控件的状态和变化，因此只要其中一个控件发生变化，父控件也会发出新的状态或值变更。组的模型由其成员共同维护。定义好模型之后，你必须更新模板，以便在视图中反映这个模型。

```html [profile-editor.component.html (template form group)]
<form [formGroup]="profileForm">
  <label for="first-name">First Name: </label>
  <input id="first-name" type="text" formControlName="firstName" />

  <label for="last-name">Last Name: </label>
  <input id="last-name" type="text" formControlName="lastName" />

</form>
```

就像表单组包含一组控件一样，*profileForm* 这个 `FormGroup` 通过 `FormGroup` 指令绑定到 `form` 元素上，在模型和包含这些输入框的表单之间建立了一个通信层。`FormControlName` 指令提供的 `formControlName` 输入（input）会把每个单独的输入框绑定到 `FormGroup` 中定义的表单控件上。各个表单控件会与各自对应的元素通信。它们还会把变更通知给表单组实例，而表单组实例是模型值的唯一事实来源。


### 3. 保存表单数据

`ProfileEditor` 组件会接收用户的输入，但在实际场景中，你需要捕获表单值，并让它可以在组件外部做进一步处理。`FormGroup` 指令会监听 `form` 元素发出的 `submit` 事件，并发出一个 `ngSubmit` 事件，你可以把它绑定到一个回调函数上。在 `form` 标签上添加一个 `ngSubmit` 事件监听器（event listener），并使用 `onSubmit()` 回调方法。

```html [profile-editor.component.html (submit event)]
<form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
```

`ProfileEditor` 组件中的 `onSubmit()` 方法会捕获 `profileForm` 的当前值。使用 `output()` 来保持表单的封装性，并把表单值提供给组件外部。下面的示例使用 `console.warn` 把一条消息输出到浏览器控制台。

```ts [profile-editor.component.ts (submit method)]
onSubmit() {
  // TODO: 使用 output() 传出表单值
  console.warn(this.profileForm.value);
}
```

`submit` 事件由 `form` 标签通过内置的 DOM 事件发出。你可以通过点击一个 `submit` 类型的按钮来触发这个事件。这样用户就可以按下 **Enter** 键来提交填写完成的表单。

使用一个 `button` 元素在表单底部添加一个按钮，用于触发表单提交。

```html [profile-editor.component.html (submit button)]
<p>Complete the form to enable button.</p>
<button type="submit" [disabled]="!profileForm.valid">Submit</button>
```

上面代码片段中的按钮还附加了一个 `disabled` 绑定，用于在 `profileForm` 无效时禁用按钮。由于你还没有进行任何验证，因此这个按钮始终是启用的。基本的表单验证会在[验证表单输入](#validating-form-input)一节中介绍。


### 4. 显示组件 {#display-the-component-form-group}

要显示包含该表单的 `ProfileEditor` 组件，请把它添加到某个组件模板中。

```html [app.component.html (profile editor)]
<app-profile-editor />
```

`ProfileEditor` 让你可以在表单组实例中管理 `firstName` 和 `lastName` 这两个表单控件实例。



### 创建嵌套表单组

表单组既可以接受单独的表单控件实例，也可以接受其他表单组实例作为子级。
这让复杂表单模型的组合更容易维护，也更便于进行逻辑分组。

构建复杂表单时，把不同类别的信息拆分成更小的部分来管理会更容易。
使用嵌套的表单组实例，可以把大型表单组拆分成更小、更易于管理的组。

要创建更复杂的表单，请执行以下步骤。

1. 创建一个嵌套组。
1. 在模板中对嵌套表单进行分组。

某些类型的信息天然就属于同一组。
姓名和地址就是这类嵌套组的典型例子，下面的示例中也会用到它们。


### 1. 创建一个嵌套组

要在 `profileForm` 中创建嵌套组，请向表单组实例中添加一个嵌套的 `address` 元素。

```ts [profile-editor.component.ts (nested form group)]
import {Component} from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  imports: [ReactiveFormsModule],
})
export class ProfileEditorComponent {
  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    address: new FormGroup({
      street: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      zip: new FormControl(''),
    }),
  });
}
```

在这个示例中，`address group` 把现有的 `firstName` 和 `lastName` 控件与新增的 `street`、`city`、`state` 和 `zip` 控件组合在一起。尽管表单组中的 `address` 元素是表单组中整个 `profileForm` 元素的子级，但值和状态变更同样遵循相同的规则。嵌套表单组中的状态和值变更会传播到父表单组，从而与整体模型保持一致。


### 2. 在模板中对嵌套表单进行分组

在组件类中更新模型之后，再更新模板，把表单组实例与其输入元素连接起来。把包含 `street`、`city`、`state` 和 `zip` 字段的 `address` 表单组添加到 `ProfileEditor` 模板中。

```html [profile-editor.component.html (template nested form group)]
<div formGroupName="address">
  <h2>Address</h2>

  <label for="street">Street: </label>
  <input id="street" type="text" formControlName="street" />

  <label for="city">City: </label>
  <input id="city" type="text" formControlName="city" />

  <label for="state">State: </label>
  <input id="state" type="text" formControlName="state" />

  <label for="zip">Zip Code: </label>
  <input id="zip" type="text" formControlName="zip" />
</div>
```

`ProfileEditor` 表单显示为一个整体，但模型被进一步拆分，以表示各个逻辑分组区域。

在组件模板中使用 `value` 属性和 `JsonPipe` 来显示这个表单组实例的值。



### 更新部分数据模型

当更新包含多个控件的表单组实例的值时，你可能只想更新模型的一部分。
本节介绍如何更新表单控件数据模型中的特定部分。

有两种方式可以更新模型值：

| 方法        | 详情                                                                                                                                                               |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setValue()`   | 为单个控件设置新值。`setValue()` 方法会严格遵循表单组的结构，并替换控件的整个值。 |
| `patchValue()` | 用对象中定义的属性替换表单模型中发生了变化的对应属性。                                                                                     |

`setValue()` 方法的严格检查有助于发现复杂表单中的嵌套错误，而 `patchValue()` 遇到这类错误时会静默失败。

在 `ProfileEditorComponent` 中，参考下面的示例使用 `updateProfile` 方法来更新用户的名字和街道地址。

```ts [profile-editor.component.ts (patch value)]
updateProfile() {
  this.profileForm.patchValue({
    firstName: 'Nancy',
    address: {
      street: '123 Drew Street',
    },
  });
}
```

在模板中添加一个按钮来模拟更新，以便按需更新用户资料。

```html [profile-editor.component.html (update value)]
<button type="button" (click)="updateProfile()">Update Profile</button>
```

当用户点击这个按钮时，`profileForm` 模型会用 `firstName` 和 `street` 的新值进行更新。注意，`street` 是在 `address` 属性内的一个对象中提供的。
这是必需的，因为 `patchValue()` 方法会依据模型结构来应用更新。
`patchValue()` 只会更新表单模型中定义了的属性。

## 使用 FormBuilder 服务生成控件

在处理多个表单时，手动创建表单控件实例会变得十分繁琐。
`FormBuilder` 服务提供了一些用于生成控件的便捷方法。

按照以下步骤来使用这个服务。

1. 导入 `FormBuilder` 类。
1. 注入 `FormBuilder` 服务。
1. 生成表单内容。

下面的示例展示了如何重构 `ProfileEditor` 组件，使用表单构建器服务来创建表单控件和表单组实例。


### 1. 导入 FormBuilder 类

从 `@angular/forms` 包中导入 `FormBuilder` 类。

```ts [profile-editor.component.ts (import)]
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
```


### 2. 注入 FormBuilder 服务

`FormBuilder` 服务是响应式表单模块中一个可注入的提供者（provider）。使用 `inject()` 函数在组件中注入这个依赖。

```ts [profile-editor.component.ts (property init)]
private formBuilder = inject(FormBuilder);
```

### 3. 生成表单控件

`FormBuilder` 服务有四个方法：`control()`、`group()`、`record()` 和 `array()`。它们都是工厂方法，用于在组件类中生成各种实例，包括表单控件、表单组、表单记录（form record）和表单数组。使用 `group` 方法来创建 `profileForm` 的控件。

```ts [profile-editor.component.ts (form builder)]
profileForm = this.formBuilder.group({
  firstName: [''],
  lastName: [''],
  address: this.formBuilder.group({
    street: [''],
    city: [''],
    state: [''],
    zip: [''],
  }),
});
```

在上面的示例中，你使用 `group()` 方法和同样的对象来定义模型中的属性。每个控件名对应的值都是一个数组，数组的第一项是初始值。

::: tip 提示
你可以只用初始值来定义控件，但如果控件需要同步或异步验证，请把同步验证器和异步验证器分别添加为数组的第二项和第三项。请比较一下使用表单构建器与手动创建实例这两种方式。

:::

  ::: code-group

  ```ts [profile-editor.component.ts (instances)]
  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    address: new FormGroup({
      street: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      zip: new FormControl(''),
    }),
  });
  ```

  ```ts [profile-editor.component.ts (form builder)]
  profileForm = this.formBuilder.group({
    firstName: [''],
    lastName: [''],
    address: this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      zip: [''],
    }),
  });
  ```

  :::




## 验证表单输入

*表单验证*用于确保用户的输入完整且正确。
本节介绍如何为表单控件添加单个验证器，以及如何显示表单的整体状态。
[表单验证](/guide/forms/form-validation)指南中会更全面地介绍表单验证。

按照以下步骤添加表单验证。

1. 在表单组件中导入一个验证器函数。
1. 把验证器添加到表单中的字段上。
1. 添加处理验证状态的逻辑。

最常见的验证是把某个字段设为必填。
下面的示例展示了如何为 `firstName` 控件添加必填验证，并显示验证结果。


### 1. 导入验证器函数

响应式表单为常见的使用场景提供了一组验证器函数。这些函数接收一个要验证的控件，并根据验证检查的结果返回一个错误对象或 null 值。

从 `@angular/forms` 包中导入 `Validators` 类。

```ts [profile-editor.component.ts (import)]
import {Validators} from '@angular/forms';
```


### 2. 把字段设为必填

在 `ProfileEditor` 组件中，把 `Validators.required` 静态方法添加为 `firstName` 控件数组中的第二项。

```ts [profile-editor.component.ts (required validator)]
private formBuilder = inject(FormBuilder);

profileForm = this.formBuilder.group({
  firstName: ['', Validators.required],
  lastName: [''],
  address: this.formBuilder.group({
    street: [''],
    city: [''],
    state: [''],
    zip: [''],
  }),
});
```


### 3. 显示表单状态

为表单控件添加必填字段后，它的初始状态是无效的。这个无效状态会传播到父表单组元素，使其状态也变为无效。可以通过表单组实例的 `status` 属性访问其当前状态。

使用插值显示 `profileForm` 的当前状态。

```html [profile-editor.component.html (display status)]
<p>Form Status: {{ profileForm.status }}</p>
```

由于必填的 `firstName` 表单控件，`profileForm` 处于无效状态，因此 **Submit** 按钮被禁用。填写 `firstName` 输入框之后，表单就会变为有效，**Submit** 按钮也随之启用。

关于表单验证的更多信息，请参阅[表单验证](/guide/forms/form-validation)指南。



## 创建动态表单

`FormArray` 是 `FormGroup` 之外的另一种选择，用于管理任意数量的匿名控件。
与表单组实例一样，你可以在表单数组实例中动态插入和移除控件，表单数组实例的值和验证状态都由其子控件计算得出。
不过，你不需要为每个控件按名称定义一个键，所以当你事先不知道子值的数量时，这是一个很好的选择。

要定义动态表单，请执行以下步骤。

1. 导入 `FormArray` 类。
1. 定义一个 `FormArray` 控件。
1. 使用 getter 方法访问 `FormArray` 控件。
1. 在模板中显示表单数组。

下面的示例展示了如何在 `ProfileEditor` 中管理一个*别名*（aliases）数组。


### 1. 导入 `FormArray` 类

从 `@angular/forms` 中导入 `FormArray` 类，以便使用其类型信息。`FormBuilder` 服务已经可以用来创建 `FormArray` 实例了。

```ts [profile-editor.component.ts (import)]
import {FormArray} from '@angular/forms';
```


### 2. 定义一个 `FormArray` 控件

你可以通过在数组中定义控件，来用任意数量（从零个到多个）的控件初始化表单数组。为 `profileForm` 的表单组实例添加一个 `aliases` 属性来定义这个表单数组。

使用 `FormBuilder.array()` 方法定义该数组，并使用 `FormBuilder.control()` 方法用一个初始控件来填充该数组。

```ts [profile-editor.component.ts (aliases form array)]
private formBuilder = inject(FormBuilder);

profileForm = this.formBuilder.group({
  firstName: ['', Validators.required],
  lastName: [''],
  address: this.formBuilder.group({
    street: [''],
    city: [''],
    state: [''],
    zip: [''],
  }),
  aliases: this.formBuilder.array([this.formBuilder.control('')]),
});
```

现在，表单组实例中的 aliases 控件里已经填充了一个控件，直到动态添加更多控件为止。


### 3. 访问 `FormArray` 控件

与反复调用 `profileForm.get()` 方法来获取每个实例相比，getter 提供了一种访问表单数组实例中各个别名的方式。表单数组实例在一个数组中表示数量不定的控件。通过 getter 访问控件很方便，而且这种方式也很容易推广到其他控件上。 <br />

使用 getter 语法创建一个 `aliases` 类属性，从父表单组中获取别名的表单数组控件。

```ts [profile-editor.component.ts (aliases getter)]
get aliases() {
  return this.profileForm.get('aliases') as FormArray;
}
```

由于返回的控件是 `AbstractControl` 类型，你需要提供一个明确的类型，才能使用表单数组实例的方法。定义一个方法，用于把别名控件动态插入到别名的表单数组中。`FormArray.push()` 方法会把控件作为新项插入到数组中，你也可以向 FormArray.push() 传入一个控件数组，一次性注册多个控件。

```ts [profile-editor.component.ts (add alias)]
addAlias() {
  this.aliases.push(this.formBuilder.control(''));
}
```

在模板中，每个控件都显示为一个单独的输入字段。


### 4. 在模板中显示表单数组

要关联表单模型中的别名，你必须把它添加到模板中。与 `FormGroupName` 提供的 `formGroupName` 输入类似，`formArrayName` 借助 `FormArrayName` 把表单数组实例与模板之间的通信绑定起来。

在闭合 `formGroupName` 元素的 `<div>` 之后添加以下模板 HTML。

```html [profile-editor.component.html (aliases form array template)]
<div formArrayName="aliases">
  <h2>Aliases</h2>
  <button type="button" (click)="addAlias()">+ Add another alias</button>

  @for (alias of aliases.controls; track $index; let i = $index) {
    <div>
      <!-- 重复的别名模板 -->
      <label for="alias-{{ i }}">Alias:</label>
      <input id="alias-{{ i }}" type="text" [formControlName]="i" />
    </div>
  }
</div>
```

`@for` 块会遍历 aliases 表单数组实例提供的每个表单控件实例。由于表单数组中的元素是匿名的，因此你把索引赋值给变量 `i`，并把它传给每个控件，以绑定到 `formControlName` 输入上。

每次添加新的别名实例时，新的表单数组实例都会根据索引获得其对应的控件。这样，在计算根控件的状态和值时，你就可以追踪每一个单独的控件。

::: info 注意
在无 Zone（zoneless）应用中，修改响应式表单模型（例如调用 `FormArray.push()`）不会自动调度组件的变更检测（change detection）。如果你的模板依赖于 `aliases.controls` 这类结构性的模型变化，请确保组件会通知 Angular 运行变更检测，例如把某个表单的可观察对象桥接到 `ChangeDetectorRef.markForCheck()`：

:::

```ts
import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({/* ... */})
export class ProfileEditor {
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.profileForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cdr.markForCheck());
  }
}
```


### 使用 `FormArrayDirective` 处理顶层表单数组

你可以使用 `FormArrayDirective` 把 `FormArray` 直接绑定到 `<form>` 元素上。  
当表单没有使用顶层的 `FormGroup`，而是由数组本身表示完整的表单模型时，这种方式非常有用。

```ts
import {Component} from '@angular/core';
import {FormArray, FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'form-array-example',
  imports: [ReactiveFormsModule],
  template: `
    <form [formArray]="form">
      @for (control of form.controls; track $index) {
        <input [formControlName]="$index" />
      }
    </form>
  `,
})
export class FormArrayExampleComponent {
  controls = [new FormControl('fish'), new FormControl('cat'), new FormControl('dog')];

  form = new FormArray(this.controls);
}
```

### 5. 添加一个别名

一开始，表单中只包含一个 `Alias` 字段。要添加另一个字段，请点击 **Add Alias** 按钮。你还可以验证由表单模型报告的别名数组，它显示在模板底部的 `Form Value` 中。除了为每个别名使用一个表单控件实例外，你还可以组合另一个包含更多字段的表单组实例。为每一项定义控件的过程是一样的。




## 统一的控件状态变更事件

所有表单控件都通过 `AbstractControl`（`FormControl`、`FormGroup`、`FormArray` 和 `FormRecord`）上的可观察对象 `events`，暴露出一个统一的**控件状态变更事件**流。
借助这个统一的事件流，你可以响应 **value**、**status**、**pristine**、**touched** 和 **reset** 等状态变更，以及**提交**（submit）这类**表单级操作**，从而只需一个订阅就能处理所有更新，而无需连接多个可观察对象。

### 事件类型

`events` 发出的每一项都是某个特定事件类的实例：

- **`ValueChangeEvent`**：当控件的**值**发生变化时发出。
- **`StatusChangeEvent`**：当控件的**验证状态**更新为某个 `FormControlStatus` 值（`VALID`、`INVALID`、`PENDING` 或 `DISABLED`）时发出。
- **`PristineChangeEvent`**：当控件的 **pristine/dirty** 状态发生变化时发出。
- **`TouchedChangeEvent`**：当控件的 **touched/untouched** 状态发生变化时发出。
- **`FormResetEvent`**：当通过 `reset()` API 或原生操作重置控件或表单时发出。
- **`FormSubmittedEvent`**：当表单被提交时发出。

所有事件类都继承自 `ControlEvent`，并包含一个 `source` 引用，指向发起此次变更的 `AbstractControl`，这在大型表单中非常有用。

```ts
import {Component} from '@angular/core';
import {
  FormControl,
  ValueChangeEvent,
  StatusChangeEvent,
  PristineChangeEvent,
  TouchedChangeEvent,
  FormResetEvent,
  FormSubmittedEvent,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';

@Component(/* ... */)
export class UnifiedEventsBasicComponent {
  form = new FormGroup({
    username: new FormControl(''),
  });

  constructor() {
    this.form.events.subscribe((e) => {
      if (e instanceof ValueChangeEvent) {
        console.log('Value changed to: ', e.value);
      }

      if (e instanceof StatusChangeEvent) {
        console.log('Status changed to: ', e.status);
      }

      if (e instanceof PristineChangeEvent) {
        console.log('Pristine status changed to: ', e.pristine);
      }

      if (e instanceof TouchedChangeEvent) {
        console.log('Touched status changed to: ', e.touched);
      }

      if (e instanceof FormResetEvent) {
        console.log('Form was reset');
      }

      if (e instanceof FormSubmittedEvent) {
        console.log('Form was submitted');
      }
    });
  }
}
```

### 过滤特定事件

当你只需要部分事件类型时，优先使用 RxJS 操作符。

```ts
import {filter} from 'rxjs/operators';
import {StatusChangeEvent} from '@angular/forms';

control.events
  .pipe(filter((e) => e instanceof StatusChangeEvent))
  .subscribe((e) => console.log('Status:', e.status));
```

### 把多个订阅合而为一

**之前**

```ts
import {combineLatest} from 'rxjs';

combineLatest([control.valueChanges, control.statusChanges]).subscribe(([value, status]) => {
  /* ... */
});
```

**之后**

```ts
control.events.subscribe((e) => {
  // 处理 ValueChangeEvent、StatusChangeEvent 等事件
});
```

::: info 注意
在值发生变化时，事件会在该控件的值更新后立即发出。父控件的值（例如当这个 FormControl 是某个 FormGroup 的一部分时）会在稍后才更新，因此在该事件的回调中访问父控件的值（使用 `value` 属性）可能会得到一个尚未更新的值。这种情况下，请改为订阅父控件的 `events`。

:::

## 管理表单控件状态

响应式表单通过 **touched/untouched** 和 **pristine/dirty** 来追踪控件状态。Angular 会在 DOM 交互过程中自动更新这些状态，但你也可以以编程方式管理它们。

**[`markAsTouched`](https://angular.dev/api/forms/FormControl#markAsTouched)**：通过不改变值的聚焦和失焦事件，把控件或表单标记为 touched。默认会传播到父控件。

```ts
// 在用户离开字段后显示验证错误
onEmailBlur() {
  const email = this.form.get('email');
  email.markAsTouched();
}
```

**[`markAsUntouched`](https://angular.dev/api/forms/FormControl#markAsUntouched)**：把控件或表单标记为 untouched。会级联到所有子控件，并重新计算所有父控件的 touched 状态。

```ts
// 成功提交后重置表单状态
onSubmitSuccess() {
  this.form.markAsUntouched();
  this.form.markAsPristine();
}
```

**[`markAsDirty`](https://angular.dev/api/forms/FormControl#markAsDirty)**：把控件或表单标记为 dirty，表示其值已被修改。默认会传播到父控件。

```ts
// 把以编程方式修改的值标记为已修改
autofillAddress() {
  const previousAddress = getAddress();
  this.form.patchValue(previousAddress, { emitEvent: false });
  this.form.markAsDirty();
}
```

**[`markAsPristine`](https://angular.dev/api/forms/FormControl#markAsPristine)**：把控件或表单标记为 pristine。会把所有子控件标记为 pristine，并重新计算所有父控件的 pristine 状态。

```ts
// 保存后重置 pristine 状态，以便追踪新的变更
saveForm() {
  this.api.save(this.form.value).subscribe(() => {
    this.form.markAsPristine();
  });
}
```

**[`markAllAsDirty`](https://angular.dev/api/forms/FormControl#markAllAsDirty)**：把控件或表单及其所有后代控件标记为 dirty。

```ts
// 把导入的数据标记为 dirty
loadData(data: FormData) {
  this.form.patchValue(data);
  this.form.markAllAsDirty();
}
```

**[`markAllAsTouched`](https://angular.dev/api/forms/FormControl#markAllAsTouched)**：把控件或表单及其所有后代控件标记为 touched。适用于在整个表单范围内显示验证错误。

```ts
// 提交前显示所有验证错误
onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  this.saveForm();
}
```

## 控制事件的发出与传播

以编程方式更新表单控件时，你可以精确控制变更如何在表单层级结构中传播，以及是否发出事件。

### 理解事件的发出

默认情况下 `emitEvent: true`，对控件的任何修改都会通过 `valueChanges` 和 `statusChanges` 可观察对象发出事件。设置 `emitEvent: false` 可以抑制这些事件的发出。这在以下场景中很有用：以编程方式设置值而不触发自动保存之类的响应式行为、避免控件之间的循环更新，或者执行批量更新并希望只在最后发出一次事件。

```ts
@Component({/* ... */})
export class BlogPostEditor {
  postForm = new FormGroup({
    title: new FormControl(''),
    content: new FormControl(''),
  });

  constructor() {
    // 用户每次输入时自动保存草稿
    this.postForm.valueChanges.subscribe((formValue) => {
      this.autosaveDraft(formValue);
    });
  }

  loadExistingDraft(savedDraft: {title: string; content: string}) {
    // 恢复草稿，但不触发自动保存
    this.postForm.setValue(savedDraft, {emitEvent: false});
  }
}
```

### 理解传播控制

默认情况下 `onlySelf: false`，更新会级联到父控件，并重新计算它们的值和验证状态。设置 `onlySelf: true` 会把更新限制在当前控件内，不通知父控件。这在批量操作中很有用，你可以在最后手动触发一次父控件的更新。

```ts
updatePostalCodeValidator(country: string) {
  const postal = this.addressForm.get('postalCode');

  const validators = country === 'US'
    ? [Validators.maxLength(5)]
    : [Validators.maxLength(7)];

  postal.setValidators(validators);
  postal.updateValueAndValidity({ onlySelf: true, emitEvent: false });
}
```

::: tip 提示
关于在运行时动态管理验证器，请参阅表单验证指南中的[在响应式表单中动态管理验证器](/guide/forms/form-validation#managing-validators-dynamically-in-reactive-forms)一节。

:::

## 用于收窄表单控件类型的工具函数

Angular 提供了四个工具函数，用于判断 `AbstractControl` 的具体类型。这些函数充当**类型守卫**（type guard），在返回 `true` 时会收窄控件的类型，让你可以在同一个代码块中安全地访问特定子类型的属性。

| 工具函数 | 详情                                             |
| :--------------- | :-------------------------------------------------- |
| `isFormControl`  | 当控件是 `FormControl` 时返回 `true`。 |
| `isFormGroup`    | 当控件是 `FormGroup` 时返回 `true`    |
| `isFormRecord`   | 当控件是 `FormRecord` 时返回 `true`   |
| `isFormArray`    | 当控件是 `FormArray` 时返回 `true`    |

这些辅助函数在**自定义验证器**中尤其有用：这类函数的签名接收的是 `AbstractControl`，但其逻辑只针对某种特定类型的控件。

```ts
import {AbstractControl, isFormArray} from '@angular/forms';

export function positiveValues(control: AbstractControl) {
  if (!isFormArray(control)) {
    return null; // 不是 FormArray：该验证器不适用。
  }

  // 收窄类型之后，就可以安全地访问 FormArray 特有的 API。
  const hasNegative = control.controls.some((c) => c.value < 0);
  return hasNegative ? {positiveValues: true} : null;
}
```

## 响应式表单 API 汇总

下表列出了用于创建和管理响应式表单控件的基础类和服务。
关于完整的语法细节，请参阅 [Forms 包](/api#angular_forms 'API reference')的 API 参考文档。

### 类

| 类             | 详情                                                                                                                                                                                 |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AbstractControl` | 具体表单控件类 `FormControl`、`FormGroup` 和 `FormArray` 的抽象基类。它提供了这些类的通用行为和属性。                           |
| `FormControl`     | 管理单个表单控件的值和有效性状态。它对应于一个 HTML 表单控件，例如 `<input>` 或 `<select>`。                                            |
| `FormGroup`       | 管理一组 `AbstractControl` 实例的值和有效性状态。组的属性包括它的子控件。组件中的顶层表单就是 `FormGroup`。 |
| `FormArray`       | 管理一个按数字索引的 `AbstractControl` 实例数组的值和有效性状态。                                                                                     |
| `FormBuilder`     | 一个可注入的服务，提供用于创建控件实例的工厂方法。                                                                                                     |
| `FormRecord`      | 追踪一组 `FormControl` 实例的值和有效性状态，其中每个实例的值类型都相同。                                                                  |

### 指令

| 指令              | 详情                                                                                    |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| `FormControlDirective` | 把一个独立的 `FormControl` 实例同步到表单控件元素上。                       |
| `FormControlName`      | 按名称把现有 `FormGroup` 实例中的 `FormControl` 同步到表单控件元素上。 |
| `FormGroupDirective`   | 把现有的 `FormGroup` 实例同步到 DOM 元素上。                                   |
| `FormGroupName`        | 把嵌套的 `FormGroup` 实例同步到 DOM 元素上。                                      |
| `FormArrayName`        | 把嵌套的 `FormArray` 实例同步到 DOM 元素上。                                      |
| `FormArrayDirective`   | 把一个独立的 `FormArray` 实例同步到 DOM 元素上。                                  |
