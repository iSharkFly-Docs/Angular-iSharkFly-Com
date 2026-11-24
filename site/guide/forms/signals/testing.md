# 测试信号表单 {#testing-signal-forms}

表单通常是应用中至关重要的部分，测试能让你确信在代码库变化时它们依然行为正确。信号表单（Signal Forms）把大部分逻辑放在 schema 中而不是模板（Template）中，这意味着你无需渲染组件（Component）就能测试绝大部分表单行为。

本指南介绍如何编写这些测试：先从隔离的逻辑测试开始，再介绍在 DOM 交互很重要的场景下所需的组件绑定测试。

## 隔离测试表单逻辑 {#testing-form-logic-in-isolation}

当你只需验证验证规则、禁用状态、必填状态或错误输出时，应直接测试表单，而不是渲染组件。隔离测试让准备工作保持精简，并让测试专注于表单的行为。

关键的要求在于注入器（Injector）。信号表单在创建表单时需要一个注入上下文（injection context）。如果测试在没有注入上下文的情况下调用 `form()`，这次调用会在测试对表单做任何断言之前就抛出异常。

满足这一要求最直接的方式是显式传入一个注入器。下面的测试创建了一个带有 `required` 规则的表单，并验证该字段在获得值之后变为有效：

```ts [profile-form.spec.ts]
import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {describe, expect, it} from 'vitest';

describe('profile form', () => {
  it('marks required fields as invalid until they have a value', () => {
    const model = signal({name: ''});

    const profileForm = form(
      model,
      (path) => {
        required(path.name);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(profileForm.name().valid()).toBe(false);
    expect(profileForm.name().errors()).toEqual([expect.objectContaining({kind: 'required'})]);

    profileForm.name().value.set('Ada');

    expect(profileForm.name().valid()).toBe(true);
    expect(profileForm.name().errors()).toEqual([]);
  });
});
```

这种模式适用于大多数隔离测试，因为对注入器的需求在调用处一目了然。这也与 Angular 源码中信号表单单元测试创建表单的方式一致。

当被测代码在内部调用 `form()` 时，你可能无法直接传入注入器。这种情况下，可以把调用包裹在一个环境注入上下文中：

```ts [profile-form.spec.ts]
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {describe, expect, it} from 'vitest';

describe('profile form', () => {
  it('can create a form inside an injection context', () => {
    const model = signal({name: ''});

    TestBed.runInInjectionContext(() => {
      const profileForm = form(model, (path) => {
        required(path.name);
      });

      expect(profileForm.name().valid()).toBe(false);
    });
  });
});
```

两种模式创建出的表单是一样的。当测试直接创建表单时，传入 `{injector}` 通常是最清晰的选择。当被测代码在内部调用 `form()`、需要你提供外围的注入上下文时，`TestBed.runInInjectionContext()` 就很有用。

表单创建好之后，通过字段状态信号（Signal）来测试它。常见的断言包括 `valid()`、`invalid()`、`disabled()`、`required()` 和 `errors()`。对于大多数表单逻辑来说，这些已足以在不涉及 DOM 的情况下验证其行为。

## 测试包含多条规则的表单 {#testing-a-form-with-multiple-rules}

准备好注入器之后，下一步可以编写一个完整的测试，同时覆盖几部分表单逻辑。这类测试仍然是隔离的，但看起来已经非常接近真实应用中的表单了。

例如，下面的测试同时验证了一条基本的必填规则，以及一条依赖于另一个字段的条件必填规则：

```ts [profile-form.spec.ts]
import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {describe, expect, it} from 'vitest';

describe('profile form', () => {
  it('updates validation state when related fields change', () => {
    const model = signal({
      name: '',
      age: 5,
    });

    const profileForm = form(
      model,
      (path) => {
        required(path.name);
        required(path.name, {
          error: (ctx) => ({kind: `required-${ctx.valueOf(path.age)}`}),
          when: ({valueOf}) => valueOf(path.age) > 10,
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(profileForm.name().invalid()).toBe(true);
    expect(profileForm.name().errors()).toEqual([expect.objectContaining({kind: 'required'})]);

    profileForm.age().value.set(15);

    expect(profileForm.name().errors()).toEqual([
      expect.objectContaining({kind: 'required'}),
      expect.objectContaining({kind: 'required-15'}),
    ]);

    profileForm.name().value.set('Ada');

    expect(profileForm.name().valid()).toBe(true);
    expect(profileForm.name().errors()).toEqual([]);
  });
});
```

这个示例展示了一个重要的测试模式：更新一个字段，然后对另一个字段的状态进行断言。由于信号表单的规则是响应式的，一个字段的验证可能依赖于兄弟字段的值、父级的值或其他派生条件。测试应当直接验证这些关系，而不只是检查发生变化的那个字段。

对于以验证为主的测试，`errors()` 通常是最有用的断言。`valid()` 和 `invalid()` 只告诉你字段当前是否通过验证，而 `errors()` 能显示是哪条规则导致了失败。当一个字段有多个验证器或条件规则时，这一点尤其有用。

同样的结构适用于大多数日常的表单测试：

1. 用能复现该行为的最小数据结构创建一个模型信号。
1. 使用显式的注入器构建表单。
1. 断言字段的初始状态。
1. 用 `.value.set(...)` 修改字段；测试跨字段规则时也要修改兄弟字段。
1. 断言更新后的状态信号，通常是 `errors()`、`valid()` 或 `invalid()`。

当测试关注的是 schema 行为而非渲染时，默认采用这种隔离风格。它比组件测试更快，而且在行为发生变化时，更容易看出是哪条规则导致的。

## 测试绑定到组件的表单 {#testing-forms-bound-to-components}

当你需要验证的行为依赖于模板绑定、通过 `dispatchEvent` 进行的用户交互，或者自行管理渲染的自定义表单控件时，隔离测试就不够用了。你需要组件绑定测试来渲染模板，这样才能与真实的 DOM 元素交互。

### 搭建组件测试 {#setting-up-a-component-test}

组件绑定测试会渲染组件，让你可以与真实的 DOM 元素交互。使用 `TestBed.createComponent()` 创建组件，并在断言之前等待渲染完成：

```ts [profile-form.ts]
import {Component, signal} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';

@Component({
  selector: 'app-profile-form',
  imports: [FormField],
  template: `<input [formField]="profileForm.name" />`,
})
export class ProfileForm {
  readonly model = signal({name: 'Ada'});
  readonly profileForm = form(this.model, (path) => {
    required(path.name);
  });
}
```

```ts [profile-form.spec.ts]
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from 'vitest';
import {ProfileForm} from './profile-form';

describe('ProfileForm', () => {
  it('reflects model values in the DOM and updates the model on user input', async () => {
    const fixture = TestBed.createComponent(ProfileForm);
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    // 模型 → 视图：输入框反映模型的初始值
    expect(input.value).toBe('Ada');

    // 视图 → 模型：模拟用户清空该字段
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.profileForm.name().value()).toBe('');
    expect(fixture.componentInstance.profileForm.name().valid()).toBe(false);
  });
});
```

注意，该组件调用 `form()` 时没有传入显式的注入器，因为组件自身的注入上下文会自动提供它。每次变更之后，`await fixture.whenStable()` 会等待渲染和副作用（effect）完成，然后再进行断言。

同样的模式也适用于异步操作，例如异步验证器或服务器调用。在异步工作完成之后调用 `await fixture.whenStable()` 即可。

## 何时使用哪种方式 {#when-to-use-each-approach}

| 需要验证的内容                                       | 方式       |
| ---------------------------------------------------- | ---------- |
| 验证规则、`errors()`、`valid()`、`invalid()`         | 隔离测试   |
| 禁用、必填或只读状态                                 | 隔离测试   |
| 跨字段的响应式依赖                                   | 隔离测试   |
| 条件 schema（`applyWhen`、`applyWhenValue`）         | 隔离测试   |
| 输入值在 DOM 中的渲染                                | 组件绑定   |
| 用户输入更新模型                                     | 组件绑定   |
| 带有自身模板的自定义表单控件                         | 组件绑定   |
| 焦点管理或无障碍属性                                 | 组件绑定   |

大多数表单只需要隔离测试。表单的逻辑（例如验证、禁用状态、跨字段规则）都位于 schema 中，而 schema 无需模板就能运行。当你关心的行为跨越了表单与 DOM 之间的边界时，组件绑定测试才会体现出价值。

## 后续步骤 {#next-steps}

本指南介绍了如何以隔离方式以及结合组件模板来测试信号表单。以下相关指南探讨了信号表单的其他方面：

- [验证](/guide/forms/signals/validation)
- [字段状态管理](/guide/forms/signals/field-state-management)
- [表单提交](/guide/forms/signals/form-submission)

