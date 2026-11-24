# 构建动态表单

许多表单（例如问卷）在格式和用途上可能非常相似。
为了更快、更轻松地生成这类表单的不同版本，你可以基于描述业务对象模型的元数据创建一个*动态表单模板（template）*。
然后，根据数据模型的变化，使用该模板自动生成新表单。

当某类表单的内容必须频繁变更以满足快速变化的业务和监管要求时，这种技术尤其有用。
一个典型的用例就是问卷。
你可能需要在不同的上下文中获取用户输入。
用户看到的表单的格式和样式应当保持不变，而你实际需要提出的问题则随上下文而变化。

在本教程中，你将构建一个呈现基础问卷的动态表单。
你要为求职的英雄们构建一个在线申请应用。
中介机构一直在调整申请流程，但借助动态表单，
你可以即时创建新表单，而无需修改应用代码。

本教程将引导你完成以下步骤：

1. 为项目启用响应式表单（Reactive Forms）。
1. 建立一个表示表单控件（form control）的数据模型。
1. 用示例数据填充模型。
1. 开发一个动态创建表单控件的组件（component）。

你创建的表单使用输入验证和样式来改善用户体验。
它有一个 Save 按钮，只有当所有用户输入都有效时才会启用，并且会用颜色标识和错误消息标记无效的输入。

这个基础版本可以进一步演进，以支持更丰富的问题类型、更优雅的渲染效果和更出色的用户体验。

## 为项目启用响应式表单

动态表单基于响应式表单。

为了让应用能够访问响应式表单指令（directive），请将 `@angular/forms` 包中的 `ReactiveFormsModule` 导入到所需的组件中。

::: code-group

```ts [dynamic-form.component.ts]
import {Component, computed, inject, input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

import {DynamicFormQuestionComponent} from './dynamic-form-question.component';

import {QuestionBase} from './question-base';
import {QuestionControlService} from './question-control.service';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [QuestionControlService],
  imports: [DynamicFormQuestionComponent, ReactiveFormsModule],
})
export class DynamicFormComponent {
  private readonly qcs = inject(QuestionControlService);

  readonly questions = input<QuestionBase<string>[] | null>([]);
  readonly form = computed<FormGroup>(() =>
    this.qcs.toFormGroup(this.questions() as QuestionBase<string>[]),
  );
  payLoad = '';

  onSubmit() {
    this.payLoad = JSON.stringify(this.form().getRawValue());
  }
}
```

```ts [dynamic-form-question.component.ts]
import {Component, input, Input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

import {QuestionBase} from './question-base';

@Component({
  selector: 'app-question',
  templateUrl: './dynamic-form-question.component.html',
  imports: [ReactiveFormsModule],
})
export class DynamicFormQuestionComponent {
  readonly question = input.required<QuestionBase<string>>();
  readonly form = input.required<FormGroup>();

  get isValid() {
    return this.form().controls[this.question().key].valid;
  }
}
```

:::

## 创建表单对象模型

动态表单需要一个对象模型，能够描述表单功能所需的所有场景。
示例中的英雄申请表单由一组问题组成，也就是说，表单中的每个控件都必须提出一个问题并接受一个回答。

这类表单的数据模型必须能表示一个问题。
示例中包含 `DynamicFormQuestionComponent`，它把问题定义为模型中的基本对象。

下面的 `QuestionBase` 是一组控件的基类，这些控件可以在表单中表示问题及其答案。

```ts [question-base.ts]
export class QuestionBase<T> {
  value: T | undefined;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  type: string;
  options: {key: string; value: string}[];

  constructor(
    options: {
      value?: T;
      key?: string;
      label?: string;
      required?: boolean;
      order?: number;
      controlType?: string;
      type?: string;
      options?: {key: string; value: string}[];
    } = {},
  ) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.type = options.type || '';
    this.options = options.options || [];
  }
}
```

### 定义控件类

示例从这个基类派生出两个新类 `TextboxQuestion` 和 `DropdownQuestion`，分别表示不同的控件类型。
在下一步创建表单模板时，你会实例化这些具体的问题类型，以便动态渲染相应的控件。

`TextboxQuestion` 控件类型在表单模板中用 `<input>` 元素表示。它呈现一个问题并让用户输入内容。该元素的 `type` attribute 根据 `options` 参数中指定的 `type` 字段来定义（例如 `text`、`email`、`url`）。

```ts [question-textbox.ts]
import {QuestionBase} from './question-base';

export class TextboxQuestion extends QuestionBase<string> {
  override controlType = 'textbox';
}
```

`DropdownQuestion` 控件类型在下拉选择框中呈现一组选项。

 ```ts [question-dropdown.ts]
 import {QuestionBase} from './question-base';

 export class DropdownQuestion extends QuestionBase<string> {
   override controlType = 'dropdown';
 }
 ```

### 组合表单组

动态表单使用一个服务（service），基于表单模型创建分组的输入控件集合。
下面的 `QuestionControlService` 根据问题模型中的元数据，构建一个由 `FormControl` 实例组成的 `FormGroup`。
你可以指定默认值和验证规则。

```ts [question-control.service.ts]
import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {QuestionBase} from './question-base';

@Injectable()
export class QuestionControlService {
  toFormGroup(questions: QuestionBase<string>[]) {
    const group: any = {};

    questions.forEach((question) => {
      group[question.key] = question.required
        ? new FormControl(question.value || '', Validators.required)
        : new FormControl(question.value || '');
    });
    return new FormGroup(group);
  }
}
```

## 组合动态表单内容

动态表单本身由一个容器组件表示，你会在后面的步骤中添加它。
每个问题在表单组件的模板中都由一个 `<app-question>` 标签表示，它对应一个 `DynamicFormQuestionComponent` 实例。

`DynamicFormQuestionComponent` 负责根据数据绑定的问题对象中的值，渲染单个问题的详细内容。
表单依靠 [`[formGroup]` 指令](https://angular.dev/api/forms/FormGroupDirective 'API reference')将模板 HTML 连接到底层的控件对象。
`DynamicFormQuestionComponent` 接收由 `QuestionControlService` 构建的表单组（form group），为其问题渲染控件，并根据在那里设置的规则显示验证状态。

::: code-group

```html [dynamic-form-question.component.html]
<div [formGroup]="form()">
  <label [attr.for]="question().key">{{ question().label }}</label>

  <div>
    @switch (question().controlType) {
      @case ('textbox') {
        <input [formControlName]="question().key" [id]="question().key" [type]="question().type" />
      }
      @case ('dropdown') {
        <select [id]="question().key" [formControlName]="question().key">
          @for (opt of question().options; track opt) {
            <option [value]="opt.key">{{ opt.value }}</option>
          }
        </select>
      }
    }
  </div>

  @if (!isValid) {
    <div class="errorMessage">{{ question().label }} is required</div>
  }
</div>
```

```ts [dynamic-form-question.component.ts]
import {Component, input, Input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

import {QuestionBase} from './question-base';

@Component({
  selector: 'app-question',
  templateUrl: './dynamic-form-question.component.html',
  imports: [ReactiveFormsModule],
})
export class DynamicFormQuestionComponent {
  readonly question = input.required<QuestionBase<string>>();
  readonly form = input.required<FormGroup>();

  get isValid() {
    return this.form().controls[this.question().key].valid;
  }
}
```

:::

`DynamicFormQuestionComponent` 的目标是呈现模型中定义的各种问题类型。
目前你只有两种问题类型，但可以想象还会有更多。
模板中的 `@switch` 块决定要显示哪种类型的问题。
这个 switch 使用了带有 [`formControlName`](https://angular.dev/api/forms/FormControlName 'FormControlName directive API reference') 和 [`formGroup`](https://angular.dev/api/forms/FormGroupDirective 'FormGroupDirective API reference') 选择器（selector）的指令。
这两个指令都定义在 `ReactiveFormsModule` 中。

### 提供数据

还需要另一个服务来提供一组特定的问题，用以构建单个表单。
在本练习中，你将创建 `QuestionService`，从硬编码的示例数据中提供这个问题数组。
在真实的应用中，该服务可能会从后端系统获取数据。
不过关键在于，你完全通过 `QuestionService` 返回的对象来控制英雄求职申请中的问题。
当需求变化时，要维护这份问卷，你只需在 `questions` 数组中添加、更新和删除对象即可。

`QuestionService` 以数组的形式提供一组问题，该数组绑定到 `input()` 类型的 questions 上。

```ts [question.service.ts]
import {Injectable} from '@angular/core';

import {DropdownQuestion} from './question-dropdown';
import {QuestionBase} from './question-base';
import {TextboxQuestion} from './question-textbox';
import {of} from 'rxjs';

@Injectable()
export class QuestionService {
  // TODO: 从远程的问题元数据源获取
  getQuestions() {
    const questions: QuestionBase<string>[] = [
      new DropdownQuestion({
        key: 'favoriteAnimal',
        label: 'Favorite Animal',
        options: [
          {key: 'cat', value: 'Cat'},
          {key: 'dog', value: 'Dog'},
          {key: 'horse', value: 'Horse'},
          {key: 'capybara', value: 'Capybara'},
        ],
        order: 3,
      }),

      new TextboxQuestion({
        key: 'firstName',
        label: 'First name',
        value: 'Alex',
        required: true,
        order: 1,
      }),

      new TextboxQuestion({
        key: 'emailAddress',
        label: 'Email',
        type: 'email',
        order: 2,
      }),
    ];

    return of(questions.sort((a, b) => a.order - b.order));
  }
}
```

## 创建动态表单模板

`DynamicFormComponent` 组件是表单的入口点和主容器，在模板中用 `<app-dynamic-form>` 表示。

`DynamicFormComponent` 组件通过把每个问题绑定到一个与 `DynamicFormQuestionComponent` 匹配的 `<app-question>` 元素上，来呈现问题列表。

::: code-group

```html [dynamic-form.component.html]
<div>
  <form (ngSubmit)="onSubmit()" [formGroup]="form()">
    @for (question of questions(); track question) {
      <div class="form-row">
        <app-question [question]="question" [form]="form()" />
      </div>
    }

    <div class="form-row">
      <button type="submit" [disabled]="!form().valid">Save</button>
    </div>
  </form>

  @if (payLoad) {
    <div class="form-row"><strong>Saved the following values</strong><br />{{ payLoad }}</div>
  }
</div>
```

```ts [dynamic-form.component.ts]
import {Component, computed, inject, input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

import {DynamicFormQuestionComponent} from './dynamic-form-question.component';

import {QuestionBase} from './question-base';
import {QuestionControlService} from './question-control.service';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [QuestionControlService],
  imports: [DynamicFormQuestionComponent, ReactiveFormsModule],
})
export class DynamicFormComponent {
  private readonly qcs = inject(QuestionControlService);

  readonly questions = input<QuestionBase<string>[] | null>([]);
  readonly form = computed<FormGroup>(() =>
    this.qcs.toFormGroup(this.questions() as QuestionBase<string>[]),
  );
  payLoad = '';

  onSubmit() {
    this.payLoad = JSON.stringify(this.form().getRawValue());
  }
}
```

:::

### 显示表单

为了显示动态表单的实例，`AppComponent` 外壳模板会把 `QuestionService` 返回的 `questions` 数组传给表单容器组件 `<app-dynamic-form>`。

```ts [app.component.ts]
import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';

import {DynamicFormComponent} from './dynamic-form.component';

import {QuestionService} from './question.service';
import {QuestionBase} from './question-base';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h2>Job Application for Heroes</h2>
      <app-dynamic-form [questions]="questions$ | async" />
    </div>
  `,
  providers: [QuestionService],
  imports: [AsyncPipe, DynamicFormComponent],
})
export class AppComponent {
  questions$: Observable<QuestionBase<string>[]> = inject(QuestionService).getQuestions();
}
```

这种模型与数据的分离，让你可以把这些组件复用于任何类型的调查问卷，只要它与*问题*对象模型兼容即可。

### 确保数据有效

表单模板通过对元数据进行动态数据绑定（binding）来渲染表单，而不对具体问题做任何硬编码的假设。
它会动态添加控件元数据和验证条件。

为了确保输入有效，在表单处于有效状态之前，*Save* 按钮都是禁用的。
当表单有效时，点击 *Save*，应用就会把当前的表单值渲染为 JSON。

下图展示了最终的表单。

<img alt="Dynamic-Form" src="/assets/images/guide/dynamic-form/dynamic-form.png">

## 后续步骤

- [验证表单输入](/guide/forms/reactive-forms#validating-form-input)
- [表单验证指南](/guide/forms/form-validation)
