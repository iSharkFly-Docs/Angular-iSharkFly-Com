# 字段元数据

字段元数据（field metadata）是可以附加到单个字段（field）上的响应式数据。Angular 内置的约束类验证器（Validator），例如 `required()` 和 `min()`，内部就使用了这套机制。换句话说，每次调用验证器时，你都在为该字段的某个元数据键贡献一个值。

本指南将深入介绍元数据系统：归约器（reducer）如何合并多条 schema 规则的贡献、如何编写自定义归约器、读取操作如何与 `hasMetadata()` 配合，以及托管元数据如何把具备生命周期感知能力的对象绑定到单个字段上。

## 你其实已经在使用元数据了

当你在 schema 中调用 `required()`，并在模板（Template）中读取对应字段的 `.required()` 时，你就在使用元数据系统。`state.required` 并不是特殊处理的属性，它只是一个便捷的 getter，返回内置 `REQUIRED` 元数据键的当前值。

```ts
import {Component, signal} from '@angular/core';
import {form, required, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form>
      <label>
        Username
        @if (registrationForm.username().required()) {
          <span class="required-marker" aria-hidden="true">*</span>
        }
        <input [formField]="registrationForm.username" />
      </label>
    </form>
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (path) => {
    required(path.username);
  });
}
```

调用 `required(path.username)` 会向该字段的 `REQUIRED` 元数据键贡献一个值；读取 `registrationForm.username().required()` 则返回累积后的值。元数据键就是连接两者的桥梁。

以下几个内置约束类验证器都遵循这种模式：

| 验证器        | 元数据键                   | 类型                  | `FieldState` getter |
| ------------- | -------------------------- | --------------------- | ------------------- |
| `required()`  | `REQUIRED`                 | `boolean`             | `required`          |
| `min()`       | `MIN` 选择 `MIN_NUMBER`    | `number \| undefined` | `min`               |
| `max()`       | `MAX` 选择 `MAX_NUMBER`    | `number \| undefined` | `max`               |
| `minDate()`   | `MIN` 选择 `MIN_DATE`      | `Date \| undefined`   | `min`               |
| `maxDate()`   | `MAX` 选择 `MAX_DATE`      | `Date \| undefined`   | `max`               |
| `minLength()` | `MIN_LENGTH`               | `number \| undefined` | `minLength`         |
| `maxLength()` | `MAX_LENGTH`               | `number \| undefined` | `maxLength`         |
| `pattern()`   | `PATTERN`                  | `RegExp[]`            | `pattern`           |

`email()` 和 `validate()` 这类非约束类验证器不会贡献元数据。它们只执行检查并给出验证错误，不会发布供模板读取的响应式值。

## 何时使用自定义元数据

如果你需要把某些响应式数据附加到特定字段上，而 `valid()`、`disabled()`、`touched()` 等内置状态信号（Signal）又无法满足需求，就可以使用**自定义元数据**。

一些示例：

- **附加到可复用字段 schema 上的配置。** 比如价格字段上的货币符号，这样任何渲染该字段的模板或自定义控件都可以显示它。又比如日期字段上的 `MIN_DATE` 和 `MAX_DATE`，供可复用的日期范围选择器读取。
- **同一字段多条规则之间共享的解析结果。** 比如把电话号码一次性解析为 E.164 格式，这样格式验证器和唯一性检查都能读取同一个规范形式，而无需重复解析。
- **根据字段状态组装出的显示提示。** 比如由 UI 映射为徽章和图标的严重级别（`'info' | 'warning' | 'error'`），或者根据用户输入内容以及其他字段填写情况而变化的上下文帮助信息。

如果你发现自己在表单之外另外维护了一个 `Map<fieldKey, value>`，用来按字段跟踪某些数据，这就说明元数据是更合适的工具。元数据与 schema 放在一起，保持响应式，并参与字段的生命周期。

## 创建元数据键

要创建自定义键，请调用 `createMetadataKey<TWrite>()`。类型参数描述了 schema 规则所贡献的值的类型。

```ts
import {createMetadataKey} from '@angular/forms/signals';

export const USERNAME_HELP = createMetadataKey<string>();
```

每次调用 `createMetadataKey()` 都会创建一个新的唯一键。即使两次调用的类型参数相同，得到的也是两个不同的键，所以请在模块作用域中只定义一次每个键，并在需要的地方导入。

::: info 注意
未指定归约器的键默认使用「覆盖」语义：如果多条规则都设置了该键，则最后一个贡献值生效。

:::

## 在 schema 中设置值

要为特定字段上的某个键注册值，请在 schema 函数中使用 `metadata(path, key, logic)`。

```ts
import {Component, computed, signal} from '@angular/core';
import {form, metadata, FormField} from '@angular/forms/signals';
import {USERNAME_HELP} from './metadata-keys';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form>
      <label>
        Username
        <input [formField]="registrationForm.username" />
      </label>
      <p class="help">{{ usernameHelp() }}</p>
    </form>
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (path) => {
    metadata(path.username, USERNAME_HELP, ({value}) => {
      const username = value();
      if (username.length === 0) {
        return 'Choose a unique username between 3 and 20 characters.';
      }
      if (username.length < 3) {
        return 'Keep typing, usernames are at least 3 characters.';
      }
      if (username.length > 20) {
        return 'Usernames are at most 20 characters.';
      }
      return 'Looks good.';
    });
  });

  usernameHelp = computed(() => this.registrationForm.username().metadata(USERNAME_HELP)?.() ?? '');
}
```

逻辑函数会接收字段的上下文，其中 `value` 是表示字段当前值的信号，`state` 是字段的 `FieldState`，此外还有 `valueOf(path)` 和 `stateOf(path)` 等方法，用于读取同一表单中的其他字段。函数中读取的任何信号都会成为响应式依赖：当 `value()` 变化时，元数据会重新计算，所有读取该键的模板也会随之更新。

## 从字段读取元数据

如果有任何 schema 规则在该字段上注册了这个键，`hasMetadata(key)` 就返回 `true`。没有规则注册该键时，`state.metadata(key)` 返回 `undefined`；否则返回一个信号，其值为当前归约后的结果。

```ts
registrationForm.username().hasMetadata(USERNAME_HELP); // 只要有 metadata() 规则注册了该键，就为 true
```

内部值的形态（它本身是否可能为 `undefined`、持有什么类型）取决于键的归约器。归约器将在下一节介绍。

当键可能未被注册时，先用 `hasMetadata()` 判断再读取：

```html
@if (registrationForm.username().hasMetadata(USERNAME_HELP)) {
  <p class="help">{{ registrationForm.username().metadata(USERNAME_HELP)!() }}</p>
}
```

如果你确定某条规则总会注册该键（因为同一文件中的 schema 就是这么做的），可以省略 `hasMetadata()` 检查，改用可选链作为更简洁的写法：

```ts
const message = registrationForm.username().metadata(USERNAME_HELP)?.();
// message: string | undefined
```

或者，在规则一定已经注册的情况下，去掉可选链，直接使用非空断言：

```ts
const message = registrationForm.username().metadata(USERNAME_HELP)!();
// message: string | undefined（仍然如此，因为内部值可能是 undefined）
```

上面的组件（Component）示例在 `computed()` 中使用了可选链，这样模板绑定的是普通的 `string`，并在初始帧时回退为空字符串。

以上就是单个贡献者时的全部 API。下一节将介绍当多条 schema 规则向同一个键贡献值时会发生什么，以及如何使用归约器合并这些贡献。

## 使用归约器合并贡献

当某个字段上只有一条规则向键贡献值时，覆盖语义没有问题。但一旦有两条规则贡献值，第一个值就会被悄无声息地丢弃：

```ts
const HELP = createMetadataKey<string>();

form(model, (path) => {
  metadata(path.username, HELP, () => 'Choose something unique across the system.');
  metadata(path.username, HELP, () => 'Usernames are 3 to 20 characters.');
});
```

两条规则都运行后，`state.metadata(HELP)!()` 只返回第二条消息。这几乎从来都不是你想要的结果。贡献往往来自不同的来源：比如通过 `apply()` 组合的两个 schema 各自附加了帮助文本，或者多条验证规则各自贡献了一条提示。

要合并这些贡献，请向 `createMetadataKey()` 传入一个归约器。归约器描述了如何把各个值折叠成一个累积结果：

```ts
import {createMetadataKey, MetadataReducer, form, metadata} from '@angular/forms/signals';
import {model} from '@angular/core';

const HELP = createMetadataKey<string, string[]>(MetadataReducer.list());

form(model, (path) => {
  metadata(path.username, HELP, () => 'Choose something unique across the system.');
  metadata(path.username, HELP, () => 'Usernames are 3 to 20 characters.');
});

// state.metadata(HELP)!() === [
//   'Choose something unique across the system.',
//   'Usernames are 3 to 20 characters.',
// ]
```

注意 `createMetadataKey<TWrite, TAcc>` 上的两个类型参数：第一个是每条规则所贡献的值的类型，第二个是归约器产出的类型。使用 `list()` 时，规则贡献的是 `string`，而字段读取到的是 `string[]`。

### 内置归约器

Angular 在 [`MetadataReducer`](https://angular.dev/api/forms/signals/MetadataReducer) 命名空间中提供了六个内置归约器。其中 `override()` 有两种形式，语义略有不同，因此在表中分别列出：

| 归约器         | 累加器类型            | 作用                                                                   | 初始值        |
| -------------- | --------------------- | ---------------------------------------------------------------------- | ------------- |
| `list<T>()`    | `T[]`                 | 接受 `T \| undefined` 类型的贡献；追加所有非 `undefined` 的值          | `[]`          |
| `or()`         | `boolean`             | 只要有任一贡献为 `true`，结果就为 `true`                               | `false`       |
| `and()`        | `boolean`             | 只有所有贡献都为 `true`，结果才为 `true`                               | `true`        |
| `min()`        | `number \| undefined` | 保留贡献中最小的数字                                                   | `undefined`   |
| `max()`        | `number \| undefined` | 保留贡献中最大的数字                                                   | `undefined`   |
| `override()`   | `T \| undefined`      | 后一个贡献替换前一个（默认行为）                                       | `undefined`   |
| `override(fn)` | `T`                   | 同上，但使用提供的初始值                                               | `fn()`        |

`list()` 是唯一一个元素类型比累加器元素类型更宽的内置归约器。规则可以贡献 `undefined`，归约器会悄悄丢弃它。内置的 `PATTERN` 键正是借此处理动态 `pattern()` 规则的：当逻辑函数返回 `undefined` 时，这个 `undefined` 贡献会被跳过，而不会被加入最终的正则表达式列表。

### 内置验证器键如何使用归约器

虽然 `MetadataReducer.min()` 和 `MetadataReducer.max()` 是归约器，但你可能会惊讶地发现它们并不是验证器。`MetadataReducer.min()` 选取某个键的最小贡献值，而 `min()` 验证器则对字段的值施加下限约束。它们名字相同，解决的却是不同的问题。

内置约束键会根据该约束「最严格」的含义来选择归约器，而这往往与键名给人的直觉恰好相反：

| 键           | 归约器           | 理由                                                                                                                                   |
| ------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `REQUIRED`   | `or()`           | 只要有任一 `required()` 规则求值为 `true`，该字段就是必填的。                                                                          |
| `MIN_NUMBER` | `max()`          | 最小值约束越大就越严格。如果一条规则要求 `>= 5`，另一条要求 `>= 10`，那么实际生效的最小值是 `10`。                                     |
| `MIN_DATE`   | `max()`          | 与 `MIN_NUMBER` 逻辑相同：要求的最晚日期胜出。                                                                                         |
| `MAX_NUMBER` | `min()`          | 最大值约束越小就越严格。如果一条规则的上限是 `100`，另一条是 `50`，那么实际生效的最大值是 `50`。                                       |
| `MAX_DATE`   | `min()`          | 与 `MAX_NUMBER` 逻辑相同：允许的最早日期胜出。                                                                                         |
| `MIN_LENGTH` | `max()`          | 与 `MIN_NUMBER` 逻辑相同：要求的最长长度胜出。                                                                                         |
| `MAX_LENGTH` | `min()`          | 与 `MAX_NUMBER` 逻辑相同：允许的最短长度胜出。                                                                                         |
| `PATTERN`    | `list<RegExp>()` | 每次调用 `pattern()` 都会贡献一个正则表达式；值必须匹配其中所有的正则表达式。                                                          |

`MIN` 和 `MAX` 是选择键。它们指向与字段值类型匹配的具体键，例如 `min()` 对应 `MIN_NUMBER`，`minDate()` 对应 `MIN_DATE`。正因如此，`field().min()` 和 `field().max()` 对数字字段和日期字段都适用。

正是这种「最严格者胜出」的配对，使得在两个组合的 schema 中分别调用 `min(path.age, 18)` 和 `min(path.age, 21)` 能够正确工作。每次调用都会注册自己的验证器，强制执行各自的下限（因此低于任一下限的值都无法通过验证）。另外，每次调用还会向 `MIN_NUMBER` 键贡献值，而 `state.min!()` 会报告汇总结果（`21`），以便 UI 和自定义控件读取实际生效的最小值。

### 编写自定义归约器

要编写自己的归约器，请实现一个符合 `MetadataReducer<TAcc, TItem>` 接口的对象：

```ts
interface MetadataReducer<TAcc, TItem> {
  reduce: (acc: TAcc, item: TItem) => TAcc;
  getInitial: () => TAcc;
}
```

当没有任何内置归约器符合你所需的语义时，就可以定义自定义归约器。例如，一个 `SEVERITY` 键，保留所有规则贡献中最严重的级别：

```ts
import {createMetadataKey, type MetadataReducer} from '@angular/forms/signals';

type Severity = 'info' | 'warning' | 'error';

const SEVERITY_RANK: Record<Severity, number> = {info: 0, warning: 1, error: 2};

const maxSeverity: MetadataReducer<Severity | undefined, Severity> = {
  reduce(acc, item) {
    if (acc === undefined) return item;
    return SEVERITY_RANK[item] > SEVERITY_RANK[acc] ? item : acc;
  },
  getInitial: () => undefined,
};

export const SEVERITY = createMetadataKey<Severity, Severity | undefined>(maxSeverity);
```

现在，任意数量的规则都可以贡献严重级别，而字段会报告其中最高的级别：

```ts
form(model, (path) => {
  metadata(path.password, SEVERITY, () => 'info');
  metadata(path.password, SEVERITY, ({value}) => (value().length < 12 ? 'warning' : 'info'));
  metadata(path.password, SEVERITY, ({value}) =>
    /password|1234/i.test(value()) ? 'error' : 'info',
  );
});
```

只要任一贡献所依赖的信号发生变化，归约器就会重新运行，因此 `state.metadata(SEVERITY)!()` 始终与所有规则中当前最严重的情况保持同步。

::: tip 提示
保持归约器的纯粹性：`reduce()` 应该只依赖它的两个参数，`getInitial()` 每次调用都应返回相同的值。归约器运行在一个响应式计算中，任一贡献所依赖的信号发生变化时都会重新执行，因此不纯的归约器会产生不一致的元数据。

:::

## 使用托管元数据附加具备生命周期感知的对象

托管元数据（managed metadata）在字段上存储的是一个具备生命周期感知能力的对象，而不是响应式值。可以用它来存放按字段划分的对象，例如获取外部数据的 `resource()`、与外部系统同步的 `effect()`，或者作用域限定于单个字段的服务（Service）句柄。

### 创建托管键

要定义托管键，请调用 `createManagedMetadataKey<TRead, TWrite>(create)`。你传入的 `create` 函数负责生成该键所持有的值。

```ts
import {Signal} from '@angular/core';
import {httpResource} from '@angular/common/http';
import {createManagedMetadataKey} from '@angular/forms/signals';

export interface UrlPreview {
  title: string;
  description?: string;
  image?: string;
}

export const URL_PREVIEW = createManagedMetadataKey((_state, url: Signal<string | undefined>) => {
  return httpResource<UrlPreview>(() => {
    const currentUrl = url();
    return currentUrl ? {url: '/api/url-preview', params: {url: currentUrl}} : undefined;
  });
});
```

`create` 函数会接收字段的 `FieldState`，以及一个 `Signal<TAcc>`（其中是 `metadata()` 规则为该键贡献的数据），并返回应当挂在该字段上的任意对象。返回值会被原样存储：与非托管键不同，框架不会把它包装在 `computed()` 中。

`create` 会在字段构造时运行一次，并且运行在字段的注入上下文（Injection Context）中。因此你可以在 `create` 中调用 `inject()`、`resource()` 和 `effect()`，并把清理工作与字段的生命周期绑定：当字段被销毁时，Angular 会销毁该注入上下文，你在其中注册的所有 `resource()`、`effect()` 或 `DestroyRef` 回调都会自动清理。

由于 `create` 本身不是响应式的，任何需要响应信号变化的行为，都必须放在这次初始调用中创建的 `effect()`、`resource()` 或 `httpResource()` 里。`URL_PREVIEW` 演示了这种模式：`httpResource()` 在其请求函数中读取 URL 信号，因此每当该信号变化时，请求都会重新执行。schema 规则（`metadata(path.url, URL_PREVIEW, ({value}) => value())`）决定输入什么数据，托管键则决定如何处理这些数据。

### 在表单中使用托管键

要在表单中使用托管键，请为该键注册一条 `metadata()` 规则，然后从字段状态中读取返回的对象。

```ts
import {Component, computed, signal} from '@angular/core';
import {applyEach, form, metadata, FormField} from '@angular/forms/signals';
import {URL_PREVIEW} from './url-preview';

@Component({
  selector: 'app-link-editor',
  imports: [FormField],
  template: `
    <form>
      @for (link of linksForm.links; track link) {
        <fieldset>
          <label>
            URL
            <input [formField]="link.url" />
          </label>
          <!-- 读取该链接 url 字段上的 URL_PREVIEW 键；结果就是其 create 函数生成的 resource -->
          @let preview = link.url().metadata(URL_PREVIEW);
          @if (preview?.isLoading()) {
            <p>Loading preview...</p>
          } @else if (preview?.hasValue() && preview.value(); as data) {
            <article class="preview">
              <h3>{{ data.title }}</h3>
              @if (data.description) {
                <p>{{ data.description }}</p>
              }
            </article>
          } @else if (preview?.error()) {
            <p class="error">Could not load preview.</p>
          }
        </fieldset>
      }
      <button type="button" (click)="addLink()">Add link</button>
    </form>
  `,
})
export class LinkEditor {
  URL_PREVIEW = URL_PREVIEW;

  linksModel = signal({links: [{url: ''}]});

  linksForm = form(this.linksModel, (path) => {
    // 在每个链接的 url 字段上注册 URL_PREVIEW 键。
    // applyEach 会为每一项分别运行 schema，因此 create() 对每个链接运行一次，
    // 每个链接都会得到自己的 resource。
    applyEach(path.links, (itemPath) => {
      metadata(itemPath.url, URL_PREVIEW, ({value}) => value());
    });
  });

  addLink() {
    this.linksForm.links().value.update((links) => [...links, {url: ''}]);
  }
}
```

由于 `applyEach` 会针对每个数组项独立注册 schema 规则，因此每一项都会得到自己的 `URL_PREVIEW` 资源（Resource）。当用户添加链接时，`create` 会为新项的字段运行。当某个链接被移除时（这里没有演示，但这是很常见的模式），框架会销毁该字段的注入器（Injector）以及其中的资源。

## 后续步骤

请记住，元数据存在的意义在于：让响应式数据随字段一起贯穿 schema 组合，在多条规则之间累积，并随字段的生命周期一起销毁。它利用的正是 Angular 内置验证器所使用的同一套系统，并且可以按你自己的使用场景进行定制。

详细的 API 文档请参阅：

- [`createMetadataKey()`](https://angular.dev/api/forms/signals/createMetadataKey) - 定义元数据键，可选指定归约器
- [`createManagedMetadataKey()`](https://angular.dev/api/forms/signals/createManagedMetadataKey) - 定义具备生命周期感知能力的元数据键
- [`metadata()`](https://angular.dev/api/forms/signals/metadata) - 在 schema 中向元数据键贡献值
- [`MetadataReducer`](https://angular.dev/api/forms/signals/MetadataReducer) - 用于合并贡献的内置归约器

更多有关信号表单（Signal Forms）的相关指南，请查看：

- [添加表单逻辑](/guide/forms/signals/form-logic)
- [验证](/guide/forms/signals/validation)
- [字段状态管理](/guide/forms/signals/field-state-management)
- [异步操作](/guide/forms/signals/async-operations)

