# 构建模板驱动表单

本教程将向你展示如何创建模板驱动表单（Template-driven Forms）。表单中的控件元素会绑定到带有输入验证的数据属性上。输入验证有助于保持数据完整性，并通过样式改善用户体验。

模板驱动表单使用[双向数据绑定](/guide/templates/two-way-binding)：在模板（Template）中做出修改时更新组件（Component）中的数据模型，反之亦然。

::: tip 模板驱动表单与响应式表单
Angular 为交互式表单提供了两种设计方式。模板驱动表单允许你在 Angular 模板中使用表单专用的指令（Directive）。响应式表单（Reactive Forms）则提供了一种模型驱动的方式来构建表单。

模板驱动表单非常适合小型或简单的表单，而响应式表单的可扩展性更好，更适合复杂的表单。关于这两种方式的比较，请参阅[选择一种方式](/guide/forms#choosing-an-approach)
:::

使用 Angular 模板，几乎可以构建任何类型的表单——登录表单、联系表单，以及几乎所有的业务表单。
你可以灵活地布局各个控件，并把它们绑定到对象模型中的数据上。
你可以指定验证规则并显示验证错误，有条件地允许特定控件的输入，触发内置的视觉反馈，等等。

## 目标

本教程将教你完成以下事项：

- 使用组件和模板构建 Angular 表单
- 使用 `ngModel` 创建双向数据绑定，以读写输入控件的值
- 使用跟踪控件状态的特殊 CSS 类提供视觉反馈
- 向用户显示验证错误，并根据表单状态有条件地允许表单控件的输入
- 使用[模板引用变量](/guide/templates/variables#template-reference-variables)在 HTML 元素之间共享信息

## 构建模板驱动表单

模板驱动表单依赖于 `FormsModule` 中定义的指令。

| 指令           | 详情                                                                                                                                                                                                                                                                            |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NgModel`      | 将所附着表单元素中的值变化与数据模型中的变化保持一致，让你可以通过输入验证和错误处理来响应用户输入。                                                                                                                                                                            |
| `NgForm`       | 创建一个顶层的 `FormGroup` 实例，并将其绑定到 `<form>` 元素上，以跟踪表单的聚合值和验证状态。只要导入了 `FormsModule`，该指令就会默认在所有 `<form>` 标签上生效，你无需添加特殊的选择器。                                                                                       |
| `NgModelGroup` | 创建一个 `FormGroup` 实例并将其绑定到某个 DOM 元素上。                                                                                                                                                                                                                          |

### 步骤概览

在本教程中，你将通过以下步骤把一个示例表单绑定到数据并处理用户输入。

1. 构建基本表单。
   - 定义示例数据模型
   - 引入所需的基础设施，例如 `FormsModule`
1. 使用 `ngModel` 指令和双向数据绑定语法，将表单控件（form control）绑定到数据属性。
   - 了解 `ngModel` 如何使用 CSS 类报告控件状态
   - 为控件命名，使 `ngModel` 可以访问它们
1. 使用 `ngModel` 跟踪输入的有效性和控件状态。
   - 添加自定义 CSS，为状态提供视觉反馈
   - 显示和隐藏验证错误消息
1. 通过向模型添加数据来响应原生 HTML 按钮的点击事件。
1. 使用表单的 [`ngSubmit`](https://angular.dev/api/forms/NgForm#ngSubmit) 输出（output）属性处理表单提交。
   - 在表单有效之前禁用 **Submit** 按钮
   - 提交后，把已完成的表单替换为页面上的其他内容

## 构建表单

<!-- TODO: link to preview -->
<!-- <docs-code live/> -->

1. 所提供的示例应用创建了 `Actor` 类，它定义了表单所反映的数据模型。

   ```ts [actor.ts]
   export class Actor {
     constructor(
       public id: number,
       public name: string,
       public skill: string,
       public studio?: string,
     ) {}
   }
   ```

1. 表单的布局和细节在 `ActorFormComponent` 类中定义。

   ```ts [actor-form.component.ts (v1)]
   import {Component} from '@angular/core';

   import {Actor} from '../actor';
   import {FormsModule} from '@angular/forms';
   import {JsonPipe} from '@angular/common';

   @Component({
     selector: 'app-actor-form',
     templateUrl: './actor-form.component.html',
     imports: [FormsModule, JsonPipe],
   })
   export class ActorFormComponent {
     skills = ['Method Acting', 'Singing', 'Dancing', 'Swordfighting'];

     model = new Actor(18, 'Tom Cruise', this.skills[3], 'CW Productions');

     submitted = false;

     onSubmit() {
       this.submitted = true;
     }

   }
   ```

   该组件的 `selector` 值为 "app-actor-form"，这意味着你可以使用 `<app-actor-form>` 标签把这个表单放进父模板中。

1. 下面的代码创建了一个新的 actor 实例，这样初始表单就可以展示一个示例 actor。

   ```ts [actor-form.component.ts]
   const myActress = new Actor(42, 'Marilyn Monroe', 'Singing');
   console.log('My actress is called ' + myActress.name); // "My actress is called Marilyn"
   ```

   这个演示为 `model` 和 `skills` 使用了模拟数据。
   在真实应用中，你会注入一个数据服务（Service）来获取和保存真实数据，或者把这些属性公开为输入（Input）和输出（Output）。

1. 该组件通过导入 `FormsModule` 模块来启用表单功能。

   ```ts [actor-form.component.ts]
   @Component({
     selector: 'app-actor-form',
     templateUrl: './actor-form.component.html',
     imports: [FormsModule, JsonPipe],
   })
   export class ActorFormComponent {
   ```

1. 表单显示在根组件模板所定义的应用布局中。

   ```html [app.component.html]
   <app-actor-form />
   ```

   初始模板定义了一个表单的布局，其中包含两个表单组和一个提交按钮。
   这两个表单组分别对应 Actor 数据模型的两个属性：name 和 studio。
   每个组都有一个标签和一个供用户输入的输入框。
   - **Name** `<input>` 控件元素带有 HTML5 的 `required` attribute
   - **Studio** `<input>` 控件元素则没有，因为 `studio` 是可选的

   **Submit** 按钮上有一些用于设置样式的类。
   此时，表单布局全部是普通的 HTML5，没有任何绑定或指令。

1. 示例表单使用了 [Twitter Bootstrap](https://getbootstrap.com/css) 中的一些样式类：`container`、`form-group`、`form-control` 和 `btn`。
   为了使用这些样式，应用的样式表导入了该库。

   ```css [styles.css]
   @import url('https://unpkg.com/bootstrap@3.3.7/dist/css/bootstrap.min.css');
   ```

1. 该表单要求从 `ActorFormComponent` 内部维护的预定义 `skills` 列表中为 actor 选择一项技能。
   Angular 的 `@for` 循环会遍历这些数据值来填充 `<select>` 元素。

   ```html [actor-form.component.html (skills)]
   <div class="form-group">
     <label for="skill">Skill</label>
     <select class="form-control" id="skill" required>
       @for (skill of skills; track $index) {
         <option [value]="skill">{{ skill }}</option>
       }
     </select>
   </div>
   ```

如果现在运行应用，你会在选择控件中看到技能列表。
输入元素还没有绑定到数据值或事件，因此它们仍然是空白的，也没有任何行为。

## 将输入控件绑定到数据属性

下一步是使用双向数据绑定，将输入控件绑定到对应的 `Actor` 属性上。这样它们既能通过更新数据模型来响应用户输入，也能在数据以编程方式变更时更新显示内容。

`FormsModule` 中声明的 `ngModel` 指令让你可以把模板驱动表单中的控件绑定到数据模型中的属性上。
当你使用双向数据绑定语法 `[(ngModel)]` 引入该指令时，Angular 就能跟踪控件的值和用户交互，并让视图与模型保持同步。

1. 编辑模板文件 `actor-form.component.html`。
1. 找到 **Name** 标签旁边的 `<input>` 标签。
1. 使用双向数据绑定语法 `[(ngModel)]="..."` 添加 `ngModel` 指令。

```html [actor-form.component.html (excerpt)]
<input type="text" class="form-control" id="name" required [(ngModel)]="model.name" name="name" />
TODO: remove this: {{ model.name }}
```

::: tip 提示
这个示例在每个 input 标签后面都临时加了一个用于诊断的插值 `{{model.name}}`，用来显示对应属性的当前数据值。其中的注释提醒你，在观察完双向数据绑定的效果之后，要删除这些诊断行。

:::

### 访问表单的整体状态

当你在组件中导入 `FormsModule` 时，Angular 会自动创建一个 [NgForm](https://angular.dev/api/forms/NgForm) 指令，并把它附加到模板中的 `<form>` 标签上（因为 `NgForm` 的选择器 `form` 会匹配 `<form>` 元素）。

要访问 `NgForm` 和表单的整体状态，请声明一个[模板引用变量](/guide/templates/variables#template-reference-variables)。

1. 编辑模板文件 `actor-form.component.html`。
1. 为 `<form>` 标签添加模板引用变量 `#actorForm`，并按如下方式设置它的值。

   ```html [actor-form.component.html (excerpt)]
   <form #actorForm="ngForm">
   ```

   现在，模板变量 `actorForm` 就是对 `NgForm` 指令实例的引用，该实例管理着整个表单。

1. 运行应用。
1. 开始在 **Name** 输入框中输入内容。

   当你添加和删除字符时，可以看到它们在数据模型中出现和消失。

显示插值的诊断行表明，值确实从输入框流向了模型，并且又流了回来。

### 为控件元素命名

在元素上使用 `[(ngModel)]` 时，必须为该元素定义 `name` attribute。
Angular 会使用所分配的名称，把该元素注册到父级 `<form>` 元素上附加的 `NgForm` 指令中。

这个示例为 `<input>` 元素添加了 `name` attribute，并将其设置为 "name"，这对于 actor 的名字来说很合理。
任何唯一的值都可以，但使用具有描述性的名称会更有帮助。

1. 为 **Studio** 和 **Skill** 添加类似的 `[(ngModel)]` 绑定和 `name` attribute。
1. 现在可以删除显示插值的诊断消息了。
1. 为了确认双向数据绑定对整个 actor 模型都有效，在组件模板顶部添加一个使用 [`json`](https://angular.dev/api/common/JsonPipe) 管道（Pipe）的新文本绑定，它会把数据序列化为字符串。

完成这些修改后，表单模板应如下所示：

```html [actor-form.component.html (excerpt)]
{{ model | json }}
<div class="form-group">
  <label for="name">Name</label>
  <input
    type="text"
    class="form-control"
    id="name"
    required
    [(ngModel)]="model.name"
    name="name"
  />
</div>

<div class="form-group">
  <label for="studio">Studio</label>
  <input
    type="text"
    class="form-control"
    id="studio"
    [(ngModel)]="model.studio"
    name="studio"
  />
</div>

<div class="form-group">
  <label for="skill">Skill</label>
  <select class="form-control" id="skill" required [(ngModel)]="model.skill" name="skill">
    @for (skill of skills; track $index) {
      <option [value]="skill">{{ skill }}</option>
    }
  </select>
</div>
```

你会注意到：

- 每个 `<input>` 元素都有一个 `id` 属性。
  `<label>` 元素的 `for` attribute 会使用它，把标签与对应的输入控件关联起来。
  这是一个[标准的 HTML 特性](https://developer.mozilla.org/docs/Web/HTML/Element/label)。

- 每个 `<input>` 元素还有必需的 `name` 属性，Angular 用它把控件注册到表单中。

观察完效果后，就可以删除 `{{ model | json }}` 这个文本绑定了。

## 跟踪表单状态

表单提交后，Angular 会为 `form` 元素应用 `ng-submitted` 类。可以使用这个类在表单提交后改变它的样式。

## 跟踪控件状态

为控件添加 `NgModel` 指令后，会为该控件添加描述其状态的类名。
可以使用这些类，根据控件的状态改变它的样式。

下表描述了 Angular 根据控件状态所应用的类名。

| 状态                             | 为 true 时的类 | 为 false 时的类 |
| :------------------------------- | :------------ | :------------- |
| 控件已被访问过。                 | `ng-touched`  | `ng-untouched` |
| 控件的值已更改。                 | `ng-dirty`    | `ng-pristine`  |
| 控件的值有效。                   | `ng-valid`    | `ng-invalid`   |

Angular 还会在提交时为 `form` 元素应用 `ng-submitted` 类，但不会应用到 `form` 元素内部的控件上。

你可以使用这些 CSS 类，根据控件的状态为其定义样式。

### 观察控件状态

要查看框架是如何添加和移除这些类的，请打开浏览器的开发者工具，检查表示 actor 名字的 `<input>` 元素。

1. 使用浏览器的开发者工具，找到与 **Name** 输入框对应的 `<input>` 元素。
   你可以看到，除了 "form-control" 之外，该元素还有多个 CSS 类。

1. 刚打开时，这些类表明它的值有效、自初始化或重置以来值未被更改，并且自初始化或重置以来控件未被访问过。

   ```html
   <input class="form-control ng-untouched ng-pristine ng-valid" />
   ```

1. 对 **Name** `<input>` 输入框执行以下操作，并观察会出现哪些类。
   - 只看不碰。
     这些类表明它处于未触碰（untouched）、原始（pristine）且有效（valid）的状态。

   - 在 name 输入框内点击，然后在框外点击。
     控件现在已被访问过，元素上出现的是 `ng-touched` 类，而不是 `ng-untouched` 类。

   - 在名字末尾添加一些斜杠。
     它现在处于已触碰（touched）且已修改（dirty）的状态。

   - 清空名字。
     这会使值无效，因此 `ng-invalid` 类会替换 `ng-valid` 类。

### 为状态创建视觉反馈

`ng-valid`/`ng-invalid` 这一对尤其值得关注，因为当值无效时，你需要给出
强烈的视觉提示。
你还希望标记出必填字段。

你可以在输入框左侧使用一条彩色竖条，
同时标记必填字段和无效数据。

要以这种方式改变外观，请按以下步骤操作。

1. 为 `ng-*` CSS 类添加定义。
1. 把这些类定义添加到一个新的 `forms.css` 文件中。
1. 把这个新文件添加到项目中，与 `index.html` 放在同一级目录：

   ```css [forms.css]
   .ng-valid[required], .ng-valid.required  {
     border-left: 5px solid #42A948; /* 绿色 */
   }
   
   .ng-invalid:not(form)  {
     border-left: 5px solid #a94442; /* 红色 */
   }
   ```

1. 在 `index.html` 文件中，更新 `<head>` 标签以引入新的样式表。

   ```html [index.html (styles)]
   <link rel="stylesheet" href="assets/forms.css" />
   ```

### 显示和隐藏验证错误消息

**Name** 输入框是必填的，清空它会让竖条变成红色。
这表明出了问题，但用户并不知道哪里出了问题，也不知道该怎么做。
你可以通过检查并响应控件的状态来提供有用的提示信息。

**Skill** 选择框也是必填的，但它不需要这种错误处理，因为选择框已经把可选项限制为有效值了。

要在适当的时候定义并显示错误消息，请按以下步骤操作。


### 1. 为输入框添加本地引用

为 `input` 标签添加一个模板引用变量，以便在模板中访问该输入框对应的 Angular 控件。在本例中，这个变量是 `#name="ngModel"`。

模板引用变量（`#name`）被设置为 `"ngModel"`，因为这正是 [`NgModel.exportAs`](https://angular.dev/api/core/Directive#exportAs) 属性的值。该属性告诉 Angular 如何把引用变量关联到指令上。


### 2. 添加错误消息

添加一个包含适当错误消息的 `<div>`。


### 3. 让错误消息有条件地显示

把 `name` 控件的属性绑定到消息 `<div>` 元素的 `hidden` 属性上，以显示或隐藏错误消息。


```html [actor-form.component.html (hidden-error-msg)]
<div [hidden]="name.valid || name.pristine" class="alert alert-danger">
```

### 4. 为 name 添加有条件显示的错误消息

为 `name` 输入框添加一条有条件显示的错误消息，如下例所示。

```html [actor-form.component.html (excerpt)]
<label for="name">Name</label>
<input
  type="text"
  class="form-control"
  id="name"
  required
  [(ngModel)]="model.name"
  name="name"
  #name="ngModel"
/>
<div [hidden]="name.valid || name.pristine" class="alert alert-danger">
  Name is required
</div>
```



::: tip 演示「pristine」状态
在这个示例中，当控件有效或处于 *pristine*（原始）状态时，就会隐藏消息。
pristine 表示自从该值在表单中显示以来，用户还没有修改过它。
如果忽略 `pristine` 状态，那么只有在值有效时才会隐藏消息。
如果你带着一个新的空白 actor 或一个无效的 actor 进入这个组件，你会在做任何操作之前就立即看到错误消息。

你可能希望只有在用户做出无效修改时才显示消息。
在控件处于 `pristine` 状态时隐藏消息，就能达到这个目的。
在下一步向表单添加新 actor 时，你就会看到这一选择的意义。
:::

## 添加新的 actor

这个练习展示了如何通过向模型添加数据来响应原生 HTML 按钮的点击事件。
为了让表单用户可以添加新的 actor，你将添加一个响应点击事件的 **New Actor** 按钮。

1. 在模板中，把一个 "New Actor" `<button>` 元素放在表单底部。
1. 在组件文件中，为 actor 数据模型添加创建 actor 的方法。

   ```ts [actor-form.component.ts (New Actor method)]
   newActor() {
     this.model = new Actor(42, '', '');
   }
   ```

1. 把按钮的点击事件绑定到创建 actor 的方法 `newActor()` 上。

   ```html [actor-form.component.html (New Actor button)]
   <button type="button" class="btn btn-default" (click)="newActor()">New Actor</button>
   ```

1. 再次运行应用，并点击 **New Actor** 按钮。

   表单会被清空，输入框左侧表示*必填*的竖条变成红色，表明 `name` 和 `skill` 属性无效。
   请注意，错误消息是隐藏的。
   这是因为表单处于 pristine 状态，你还没有做任何修改。

1. 输入一个名字，然后再次点击 **New Actor**。

   现在应用会显示 `Name is required` 错误消息，因为输入框已不再处于 pristine 状态。
   表单记住了你在点击 **New Actor** 之前输入过名字。

1. 要恢复表单控件的 pristine 状态，请在调用 `newActor()` 方法之后调用表单的 `reset()` 方法，以命令式的方式清除所有标志。

   ```html [actor-form.component.html (Reset the form)]
   <button type="button" class="btn btn-default" (click)="newActor(); actorForm.reset()">
     New Actor
   </button>
   ```

   现在点击 **New Actor** 会同时重置表单及其控件标志。

## 使用 `ngSubmit` 提交表单

用户填写完表单后，应该能够提交它。
表单底部的 **Submit** 按钮本身什么也不做，但由于它的类型（`type="submit"`），它会触发表单提交事件。

要响应这个事件，请按以下步骤操作。



### 1. 监听 ngOnSubmit

把表单的 [`ngSubmit`](https://angular.dev/api/forms/NgForm#ngSubmit) 事件属性绑定到 actor-form 组件的 `onSubmit()` 方法上。

```html [actor-form.component.html (ngSubmit)]
<form (ngSubmit)="onSubmit()" #actorForm="ngForm">
```


### 2. 绑定 disabled 属性

使用模板引用变量 `#actorForm` 访问包含 **Submit** 按钮的表单，并创建一个事件绑定（Event Binding）。

你将把表示表单整体有效性的表单属性绑定到 **Submit** 按钮的 `disabled` 属性上。

```html [actor-form.component.html (submit-button)]
<button type="submit" class="btn btn-success" [disabled]="!actorForm.form.valid">
  Submit
</button>
```


### 3. 运行应用

请注意，按钮是可用的——尽管它目前还不能做任何有用的事。


### 4. 删除 Name 的值

这违反了「必填」规则，因此会显示错误消息——并且请注意，它还禁用了 **Submit** 按钮。

你无需显式地把按钮的启用状态与表单的有效性关联起来。
当你在增强后的表单元素上定义了模板引用变量，并在按钮控件中引用该变量时，`FormsModule` 就自动完成了这件事。



### 响应表单提交

要展示对表单提交的响应，可以隐藏数据输入区域，并在原处显示其他内容。


### 1. 包裹表单

把整个表单包裹在一个 `<div>` 中，并把它的 `hidden` 属性绑定到 `ActorFormComponent.submitted` 属性上。

```html [actor-form.component.html (excerpt)]
  <div [hidden]="submitted">
    <h1>Actor Form</h1>
    <form (ngSubmit)="onSubmit()" #actorForm="ngForm">

    <!-- ... 表单的全部内容 ... -->
  </form>
</div>
```

主表单从一开始就是可见的，因为在提交表单之前，`submitted` 属性一直为 false，正如 `ActorFormComponent` 中的这段代码所示：

```ts [actor-form.component.ts (submitted)]
submitted = false;

onSubmit() {
  this.submitted = true;
}
```

当你点击 **Submit** 按钮时，`submitted` 标志会变为 true，表单随之消失。


### 2. 添加已提交状态

要在表单处于已提交状态时显示其他内容，请在新的 `<div>` 包裹元素下方添加以下 HTML。

```html [actor-form.component.html (excerpt)]
<div [hidden]="!submitted">
  <h2>You submitted the following:</h2>
  <div class="row">
    <div class="col-xs-3">Name</div>
    <div class="col-xs-9">{{ model.name }}</div>
  </div>
  <div class="row">
    <div class="col-xs-3">Studio</div>
    <div class="col-xs-9">{{ model.studio }}</div>
  </div>
  <div class="row">
    <div class="col-xs-3">Skill</div>
    <div class="col-xs-9">{{ model.skill }}</div>
  </div>
  <br />
  <button type="button" class="btn btn-primary" (click)="submitted = false">Edit</button>
</div>
```

这个 `<div>` 使用插值绑定展示只读的 actor 信息，只有在组件处于已提交状态时才会出现。

这个替代显示区域包含一个 *Edit* 按钮，它的点击事件绑定到一个会清除 `submitted` 标志的表达式上。


### 3. 测试 Edit 按钮

点击 *Edit* 按钮，把显示切换回可编辑的表单。



## 总结

本页讨论的 Angular 表单利用了以下
框架特性来支持数据修改、验证等功能。

- Angular HTML 表单模板
- 带有 `@Component` 装饰器的表单组件类
- 通过绑定到 `NgForm.ngSubmit` 事件属性来处理表单提交
- 模板引用变量，例如 `#actorForm` 和 `#name`
- 用于双向数据绑定的 `[(ngModel)]` 语法
- 使用 `name` attribute 进行验证和跟踪表单元素的变更
- 输入控件上引用变量的 `valid` 属性，表明控件是否有效、是否应显示错误消息
- 通过绑定到 `NgForm` 的有效性来控制 **Submit** 按钮的启用状态
- 自定义 CSS 类，为用户提供有关无效控件的视觉反馈

以下是应用最终版本的代码：

::: code-group

```ts [actor-form.component.ts]
import {Component} from '@angular/core';

import {Actor} from '../actor';
import {FormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-actor-form',
  templateUrl: './actor-form.component.html',
  imports: [FormsModule, JsonPipe],
})
export class ActorFormComponent {
  skills = ['Method Acting', 'Singing', 'Dancing', 'Swordfighting'];

  model = new Actor(18, 'Tom Cruise', this.skills[3], 'CW Productions');

  submitted = false;

  onSubmit() {
    this.submitted = true;
  }

  newActor() {
    this.model = new Actor(42, '', '');
  }
}
```

```html [actor-form.component.html]
<div class="container">
  <div [hidden]="submitted">
    <h1>Actor Form</h1>
    <form (ngSubmit)="onSubmit()" #actorForm="ngForm">
      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          class="form-control"
          id="name"
          required
          [(ngModel)]="model.name"
          name="name"
          #name="ngModel"
        />
        <div [hidden]="name.valid || name.pristine" class="alert alert-danger">
          Name is required
        </div>
      </div>

      <div class="form-group">
        <label for="studio">Studio Affiliation</label>
        <input
          type="text"
          class="form-control"
          id="studio"
          [(ngModel)]="model.studio"
          name="studio"
        />
      </div>

      <div class="form-group">
        <label for="skill">Skill</label>
        <select
          class="form-control"
          id="skill"
          required
          [(ngModel)]="model.skill"
          name="skill"
          #skill="ngModel"
        >
          @for (skill of skills; track $index) {
            <option [value]="skill">{{ skill }}</option>
          }
        </select>
        <div [hidden]="skill.valid || skill.pristine" class="alert alert-danger">
          skill is required
        </div>
      </div>

      <button type="submit" class="btn btn-success" [disabled]="!actorForm.form.valid">
        Submit
      </button>
      <button type="button" class="btn btn-default" (click)="newActor(); actorForm.reset()">
        New Actor
      </button>
    </form>
  </div>

  <div [hidden]="!submitted">
    <h2>You submitted the following:</h2>
    <div class="row">
      <div class="col-xs-3">Name</div>
      <div class="col-xs-9">{{ model.name }}</div>
    </div>
    <div class="row">
      <div class="col-xs-3">Studio</div>
      <div class="col-xs-9">{{ model.studio }}</div>
    </div>
    <div class="row">
      <div class="col-xs-3">Skill</div>
      <div class="col-xs-9">{{ model.skill }}</div>
    </div>
    <br />
    <button type="button" class="btn btn-primary" (click)="submitted = false">Edit</button>
  </div>
</div>
```

```ts [actor.ts]
export class Actor {
  constructor(
    public id: number,
    public name: string,
    public skill: string,
    public studio?: string,
  ) {}
}
```

```html [app.component.html]
<app-actor-form />
```

```ts [app.component.ts]
import {Component} from '@angular/core';
import {ActorFormComponent} from './actor-form/actor-form.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ActorFormComponent],
})
export class AppComponent {}
```

```ts [main.ts]
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideZoneChangeDetection} from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [provideZoneChangeDetection({eventCoalescing: true})],
}).catch((err) => console.error(err));
```

```css [forms.css]
.ng-valid[required], .ng-valid.required  {
  border-left: 5px solid #42A948; /* 绿色 */
}

.ng-invalid:not(form)  {
  border-left: 5px solid #a94442; /* 红色 */
}
```

:::
