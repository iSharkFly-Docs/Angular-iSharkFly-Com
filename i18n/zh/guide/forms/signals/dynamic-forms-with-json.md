# 使用 JSON 构建动态表单

有些表单无法在编译期确定结构。服务端驱动的表单、管理后台、多租户应用以及由 CMS 管理的内容，都需要根据运行时下发的配置来渲染字段（field），这些配置通常是来自后端、管理工具或租户设置的 JSON。

本指南介绍如何构建这样的表单：它的模型、schema、验证和渲染全部派生自同一份运行时配置。

## 何时使用 JSON 驱动的表单

以下情况适合采用这种模式：

- 后端根据用户角色、功能开关或业务规则决定显示哪些字段
- 非开发人员通过管理后台或 CMS 配置表单结构
- 多租户应用中的每个租户都有自己的表单结构，并以配置形式存储
- 表单需要在不重新部署前端的情况下持续演进

如果表单结构在构建时就已确定，请使用静态表单（直接在组件（Component）中定义字段）。静态表单的每个字段都能获得完整的 TypeScript 类型检查，测试和工具支持也更简单直接。

## 定义带类型的字段配置

当你想根据运行时配置渲染字段时，先定义一个 TypeScript 类型来描述每个字段的形状。以 `kind` 作为判别字段的可辨识联合类型，可以让每个变体声明各自的验证选项：

```ts
type FieldConfig =
  | {kind: 'text'; name: string; label: string; required?: boolean}
  | {kind: 'number'; name: string; label: string; required?: boolean; min?: number; max?: number};
```

每个变体都有 name、label 和可选的 `required` 标志。数字字段还额外接受 `min` 和 `max` 边界。要添加新的变体，只需添加新的 `kind` 分支。

一份具体的配置可能如下所示：

```ts
const profileConfig: FieldConfig[] = [
  {kind: 'text', name: 'fullName', label: 'Full Name', required: true},
  {kind: 'number', name: 'age', label: 'Age', required: true, min: 18, max: 120},
];
```

在实践中，这个 `FieldConfig[]` 通常来自你的后端、管理后台或 CMS。为简洁起见，下面的示例直接在组件中使用字面量。

## 根据配置构建模型

表单的模型需要为每个字段提供一个条目，其默认值要与字段的 kind 相匹配。一个小的辅助函数就能处理这件事：

```ts
function buildModel(configs: FieldConfig[]): Record<string, string | number | null> {
  const initial: Record<string, string | number | null> = {};
  for (const config of configs) {
    initial[config.name] = config.kind === 'number' ? null : '';
  }
  return initial;
}
```

模型使用 `Record<string, string | number | null>`，因为键无法事先确定。

此外，数字字段初始化为 `null` 而不是 `0`，这样空字段读起来就是空的。如果使用 `0`，[`required()`](https://angular.dev/api/forms/signals/required) 会认为该字段已经填写，而任何大于零的 [`min()`](https://angular.dev/api/forms/signals/min) 约束都会在用户输入任何内容之前就把该字段标记为无效。

## 根据配置构建 schema

schema 同样派生自配置。你可以遍历每个条目，并应用与其 kind 相匹配的验证器：

```ts
import {required, min, max, SchemaFn, SchemaPath} from '@angular/forms/signals';

function buildSchema(configs: FieldConfig[]): SchemaFn<Record<string, string | number | null>> {
  return (path) => {
    for (const config of configs) {
      const fieldPath = path[config.name];

      if (config.required) {
        required(fieldPath);
      }

      if (config.kind === 'number') {
        const numberPath = fieldPath as unknown as SchemaPath<number | null>;
        if (config.min !== undefined) min(numberPath, config.min);
        if (config.max !== undefined) max(numberPath, config.max);
      }
    }
  };
}
```

可辨识联合类型会在每个分支内收窄 `config` 的类型，因此当 `config.kind === 'number'` 时，`config.min` 和 `config.max` 的类型是正确的。

## 在配置中表达条件规则

有些验证规则只在特定条件下才有意义。例如，只有当国家是美国时，才需要验证美国的州代码。可以在配置中添加一个 `when` 判别字段来表达这类依赖关系，它指明另一个字段以及该字段必须等于的值：

```ts
type WhenCondition = {field: string; equals: string | number};

type FieldConfig =
  | {kind: 'text'; name: string; label: string; required?: boolean; when?: WhenCondition}
  | {
      kind: 'number';
      name: string;
      label: string;
      required?: boolean;
      min?: number;
      max?: number;
      when?: WhenCondition;
    };
```

更新 `buildSchema()`，把 `when` 转换成 [`applyWhen()`](https://angular.dev/api/forms/signals/applyWhen) 调用。共用的规则应用逻辑被移到一个小闭包中，这样条件分支和无条件分支都调用同一个函数：

```ts
import {applyWhen, required, min, max, SchemaFn, SchemaPath} from '@angular/forms/signals';

function buildSchema(configs: FieldConfig[]): SchemaFn<Record<string, string | number | null>> {
  return (rootPath) => {
    for (const config of configs) {
      const applyRules = (path: typeof rootPath) => {
        const fieldPath = path[config.name];
        if (config.required) required(fieldPath);
        if (config.kind === 'number') {
          const numberPath = fieldPath as unknown as SchemaPath<number | null>;
          if (config.min !== undefined) min(numberPath, config.min);
          if (config.max !== undefined) max(numberPath, config.max);
        }
      };

      if (config.when) {
        const {field, equals} = config.when;
        applyWhen(rootPath, ({valueOf}) => valueOf(rootPath[field]) === equals, applyRules);
      } else {
        applyRules(rootPath);
      }
    }
  };
}
```

当 `applyWhen()` 的条件为 true 时，其中的规则会被激活。当条件变为 false 时，这些规则会被停用，字段的验证状态也会被清除。由于条件函数通过 `valueOf(rootPath[field])` 读取值，每当被引用的字段发生变化时，表单都会重新评估这个条件。

使用 `when` 的配置如下所示：

```ts
const addressConfig: FieldConfig[] = [
  {kind: 'text', name: 'country', label: 'Country', required: true},
  {
    kind: 'text',
    name: 'stateCode',
    label: 'State',
    required: true,
    when: {field: 'country', equals: 'US'},
  },
];
```

只有当 `country` 为 `'US'` 时，`stateCode` 字段才要求填写。输入其他国家的用户可以把 `stateCode` 留空，不会妨碍提交。

对于更复杂的条件（多个字段、范围或非相等判断），可以为 `WhenCondition` 扩展更多判别字段（例如 `in: string[]` 或 `notEquals: string | number`），并在 `buildSchema()` 中分别转换每种变体。原理是一样的：配置承载数据，`buildSchema()` 把它转换成 `applyWhen()` 调用。

如果要控制的是可见性而不是验证，可以按同样的模式在字段路径上使用 [`hidden()`](https://angular.dev/api/forms/signals/hidden)。详情参见[在字段上配置 `hidden()` 状态](/guide/forms/signals/form-logic#configuring-hidden-state-on-fields)。

## 在配置中表达重复字段

有些配置需要在运行时增减的字段，比如电话号码列表、标签或发票明细行。可以在配置中添加一个 `array` kind，并把它转换成 [`applyEach()`](https://angular.dev/api/forms/signals/applyEach)，这样无论条目如何增减，每个条目的规则都能统一应用。

为 `FieldConfig` 扩展一个 `array` 变体。这个示例使用字符串数组；把条目的形状换成一个 record，同样的方法也可以扩展到对象数组：

```ts
type FieldConfig =
  | {kind: 'text'; name: string; label: string; required?: boolean; when?: WhenCondition}
  | {
      kind: 'number';
      name: string;
      label: string;
      required?: boolean;
      min?: number;
      max?: number;
      when?: WhenCondition;
    }
  | {kind: 'array'; name: string; label: string; itemRequired?: boolean; when?: WhenCondition};
```

更新 `buildModel()`，用空数组初始化数组字段。模型的类型随之放宽，包含了 `string[]`：

```ts
function buildModel(configs: FieldConfig[]): Record<string, string | number | null | string[]> {
  const initial: Record<string, string | number | null | string[]> = {};
  for (const config of configs) {
    if (config.kind === 'number') initial[config.name] = null;
    else if (config.kind === 'array') initial[config.name] = [];
    else initial[config.name] = '';
  }
  return initial;
}
```

更新 `buildSchema()`，用 `applyEach()` 应用每个条目的规则。来自 `Record<string, string | number | null | string[]>` 模型的路径类型过于宽泛，`applyEach()`（以及 `min()` / `max()`）无法直接对它进行类型检查，因此要在每个 `kind` 分支内把 `fieldPath` 转换成合适的形状：

```ts
import {
  applyEach,
  applyWhen,
  required,
  min,
  max,
  SchemaFn,
  SchemaPath,
} from '@angular/forms/signals';

function buildSchema(
  configs: FieldConfig[],
): SchemaFn<Record<string, string | number | null | string[]>> {
  return (rootPath) => {
    for (const config of configs) {
      const applyRules = (path: typeof rootPath) => {
        const fieldPath = path[config.name];

        if (config.kind === 'array') {
          const arrayPath = fieldPath as unknown as SchemaPath<string[]>;
          if (config.itemRequired) {
            applyEach(arrayPath, (item) => required(item));
          }
          return;
        }

        if (config.required) required(fieldPath);

        if (config.kind === 'number') {
          const numberPath = fieldPath as unknown as SchemaPath<number | null>;
          if (config.min !== undefined) min(numberPath, config.min);
          if (config.max !== undefined) max(numberPath, config.max);
        }
      };

      if (config.when) {
        const {field, equals} = config.when;
        applyWhen(rootPath, ({valueOf}) => valueOf(rootPath[field]) === equals, applyRules);
      } else {
        applyRules(rootPath);
      }
    }
  };
}
```

每个分支内的类型转换是有意为之的「逃生舱」：你是在用编译器的结构化保证，换取一个由外围 `kind` 检查来保证的运行时不变式。每次转换都限定在一个 `kind` 块内，因此这个假设只在局部生效，也便于审查。

使用 `array` kind 的配置如下所示：

```ts
const contactConfig: FieldConfig[] = [
  {kind: 'text', name: 'fullName', label: 'Full name', required: true},
  {kind: 'array', name: 'phoneNumbers', label: 'Phone numbers', itemRequired: true},
];
```

要渲染数组字段，请用 `@for` 遍历它，并通过更新模型信号（Signal）让用户添加或移除条目。添加一个返回 [`FieldTree`](https://angular.dev/api/forms/signals/FieldTree) 的带类型访问器，让遍历能看到数组结构，并定义用于增减模型的方法：

```ts
import {FieldTree} from '@angular/forms/signals';

// 在组件类内部
asArrayField(name: string): FieldTree<string[]> {
  return this.dynamicForm[name] as unknown as FieldTree<string[]>;
}

addItem(name: string) {
  this.model.update(current => ({
    ...current,
    [name]: [...(current[name] as string[]), ''],
  }));
}

removeItem(name: string, index: number) {
  this.model.update(current => ({
    ...current,
    [name]: (current[name] as string[]).filter((_, i) => i !== index),
  }));
}
```

`FieldTree<string[]>` 是可迭代的，因此 `@for` 可以遍历它；每个条目都是一个 `FieldTree<string>`，可以直接满足 `[formField]` 的要求。叶子字段则可以改用 `Field<T>` 访问器，因为 `Field<T>` 是不带迭代能力的可调用签名。

在模板（Template）中，像这样渲染数组分支：

```html
@case ('array') {
  <fieldset>
    <legend>{{ config.label }}</legend>
    @for (item of asArrayField(config.name); track item) {
      <input type="text" [formField]="item" />
      <button type="button" (click)="removeItem(config.name, $index)">Remove</button>
    }
    <button type="button" (click)="addItem(config.name)">Add</button>
  </fieldset>
}
```

`addItem()` 方法扩展模型，表单会自动重新派生数组的字段。新条目以全新的验证状态开始。`removeItem()` 方法则对模型进行过滤。由于原始值数组是[按位置跟踪](#tracking-item-identity)的，字段状态绑定的是索引而不是值：当某个条目被移除时，后面的值会移到前面的位置并继承那些位置已有的字段状态，而最后一个字段会被丢弃。

### 跟踪条目标识

信号表单（Signal Forms）会按标识跟踪对象数组中的每个条目。当你保存某个位置上字段的引用时，这个引用跟随的是底层数据，而不是位置。即使数据移动了位置，通过所保存的引用读取状态，返回的仍是原来的数据：

```ts
const contactModel = signal([
  {name: 'Alice', phone: '555-0001'},
  {name: 'Bob', phone: '555-0002'},
]);

const contactForm = form(contactModel);

// 保存当前位于索引 0 的字段（Alice）的引用。
const aliceField = contactForm[0];

// 交换数组条目，让 Bob 位于索引 0，Alice 位于索引 1。
contactModel.update(([alice, bob]) => [bob, alice]);

// 交换之后，所保存的引用仍然指向 Alice 的字段。
console.log(aliceField().value().phone); // '555-0001'（Alice 的号码）
console.log(contactForm[0]().value().phone); // '555-0002'（Bob，现在位于索引 0）
```

只要被引用的条目仍在数组中，这种标识跟踪就能防止排序、重新排列或过滤时出现 bug。即使数组顺序发生变化，所保存的字段引用仍然有效；但如果移除了被引用的条目本身，所保存的引用就会失去归属。

对于原始值数组（上面的 `phoneNumbers` 示例），信号表单改为按位置跟踪条目：索引 0 始终指向当前位于位置 0 的值。

这里的标识指的是 JavaScript 对象引用，而不是数据库主键之类的逻辑 id。如果你用新反序列化的对象替换数组（例如在从服务器重新加载之后），即使每个条目的 `id` 没变，字段状态也不会跟随逻辑上的条目。这一保证只涵盖排序、重新排列和过滤这类内存中的操作，不包括数据刷新。

## 验证配置

来自外部的配置在构建表单之前需要先进行验证。不受信任的 JSON 中可能隐藏着以下几种失败情形：

- 重复的 `name` 值会覆盖先前的模型条目，并破坏模板中的 `track config.name` 表达式。
- `when` 子句如果引用了不存在的字段，会在条件首次求值时于运行时失败。
- `when` 子句如果与 `array` 字段进行比较，则没有定义好的相等语义。
- `when.equals` 的值类型如果与被引用字段的 kind 不匹配，就永远不会匹配，而且不会有任何提示，条件行为被隐藏起来，就好像这条规则从未生效过。

在边界处把这四种情况全部拦截下来：

```ts
function validateConfigs(configs: FieldConfig[]): FieldConfig[] {
  const knownNames = new Set<string>();

  for (const config of configs) {
    if (knownNames.has(config.name)) {
      throw new Error(`Duplicate field name in config: "${config.name}"`);
    }
    knownNames.add(config.name);
  }

  for (const config of configs) {
    if (!config.when) continue;
    if (!knownNames.has(config.when.field)) {
      throw new Error(
        `Field "${config.name}" references unknown field "${config.when.field}" in its 'when' condition.`,
      );
    }
    const referenced = configs.find((c) => c.name === config.when!.field)!;
    if (referenced.kind === 'array') {
      throw new Error(
        `Field "${config.name}" cannot use 'when' to compare against array field "${config.when.field}".`,
      );
    }
    const expected = referenced.kind === 'text' ? 'string' : 'number';
    if (typeof config.when.equals !== expected) {
      throw new Error(
        `Field "${config.name}" compares ${referenced.kind} field "${config.when.field}" against a ${typeof config.when.equals} value; expected a ${expected}.`,
      );
    }
  }

  return configs;
}
```

第一遍检查确保名称唯一；第二遍检查遍历每个 `when` 子句，确认被引用的字段存在、不是数组，并且比较值的类型正确。验证成功时，函数原样返回这些配置，因此它可以很自然地与组件中保存配置的字段初始化器组合使用。失败会在应用与上游数据源之间的边界处暴露出来，而不是在之后表现为难以排查的表单异常行为。

## 动态渲染表单

在组件中，使用 `@for` 遍历配置，并对 `kind` 使用 `@switch` 来选择合适的输入控件：

```ts
import {Component, signal} from '@angular/core';
import {Field, FieldTree, form, FormField, FormRoot} from '@angular/forms/signals';

@Component({
  selector: 'app-dynamic-form',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="dynamicForm">
      @for (config of configs; track config.name) {
        @switch (config.kind) {
          @case ('text') {
            <label>
              {{ config.label }}
              <input type="text" [formField]="asTextField(config.name)" />
            </label>
          }
          @case ('number') {
            <label>
              {{ config.label }}
              <input type="number" [formField]="asNumberField(config.name)" />
            </label>
          }
          @case ('array') {
            <fieldset>
              <legend>{{ config.label }}</legend>
              @for (item of asArrayField(config.name); track item; let i = $index) {
                <input type="text" [formField]="item" />
                <button type="button" (click)="removeItem(config.name, i)">Remove</button>
              }
              <button type="button" (click)="addItem(config.name)">Add</button>
            </fieldset>
          }
        }
      }
    </form>
  `,
})
export class DynamicForm {
  configs: FieldConfig[] = validateConfigs([
    {kind: 'text', name: 'fullName', label: 'Full Name', required: true},
    {kind: 'number', name: 'age', label: 'Age', required: true, min: 18, max: 120},
    {kind: 'array', name: 'phoneNumbers', label: 'Phone numbers', itemRequired: true},
  ]);

  model = signal(buildModel(this.configs));

  dynamicForm = form(this.model, buildSchema(this.configs));

  asTextField(name: string): Field<string> {
    // <input type="text"> 需要 Field<string>。
    return this.dynamicForm[name] as unknown as Field<string>;
  }

  asNumberField(name: string): Field<number | null> {
    // <input type="number"> 需要 Field<number | null>。
    return this.dynamicForm[name] as unknown as Field<number | null>;
  }

  asArrayField(name: string): FieldTree<string[]> {
    // 使用 FieldTree（而不是 Field），这样 @for 才能遍历数组。
    return this.dynamicForm[name] as unknown as FieldTree<string[]>;
  }

  addItem(name: string) {
    this.model.update((current) => ({
      ...current,
      [name]: [...(current[name] as string[]), ''],
    }));
  }

  removeItem(name: string, index: number) {
    this.model.update((current) => ({
      ...current,
      [name]: (current[name] as string[]).filter((_, i) => i !== index),
    }));
  }
}
```

模板类型检查会把 `dynamicForm[name]` 视为一个独立的表达式，因此 `@switch` 对 `config.kind` 的类型收窄不会作用到这个索引访问上。这些访问器在绑定处以类型转换的形式重新表达了这种收窄，而相匹配的 `kind` 分支保证了收窄后的类型在运行时是正确的。

由于模型和 schema 都是在组件构造时从同一个 `FieldConfig[]` 派生出来的，对于给定的配置，它们不会彼此脱节。上面的示例假设在创建组件时，配置已经可以同步获取。

## 后续步骤

JSON 驱动的表单通过从同一个 `FieldConfig[]` 派生模型和 schema，让两者保持一致。本指南中的每一项扩展（条件规则、重复字段）都会放宽类型，并在 `buildSchema()` 中增加一个转换步骤，同时保持这种一致性。无论配置来自哪里、如何增长，模型和 schema 始终紧密绑定在一起。

关于信号表单其他方面的相关指南，请参阅：

- [schema 与 schema 的可组合性](/guide/forms/signals/schemas)
- [验证](/guide/forms/signals/validation)
- [添加表单逻辑](/guide/forms/signals/form-logic)
- [字段状态管理](/guide/forms/signals/field-state-management)


详细的 API 文档，请参阅：

- [`form()`](https://angular.dev/api/forms/signals/form) - 根据模型信号创建表单
- [`applyWhen()`](https://angular.dev/api/forms/signals/applyWhen) - 根据响应式状态有条件地应用 schema
- [`applyEach()`](https://angular.dev/api/forms/signals/applyEach) - 对数组字段中的每个条目应用 schema
- [`FieldTree`](https://angular.dev/api/forms/signals/FieldTree) - 由 `form()` 暴露的可导航字段树
- [`SchemaFn`](https://angular.dev/api/forms/signals/SchemaFn) - schema 函数的类型签名
