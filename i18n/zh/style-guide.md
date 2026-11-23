# Angular 编码风格指南

## 简介

本指南涵盖了 Angular 应用代码的一系列风格约定。这些建议并不是 Angular 正常运行所必需的，
而是确立了一套编码实践，以促进整个 Angular 生态系统的一致性。一套一致的实践能让共享
代码以及在不同项目之间切换变得更容易。

本指南*不*涵盖 TypeScript 或与 Angular 无关的通用编码实践。关于
TypeScript，请参阅
[Google 的 TypeScript 风格指南](https://google.github.io/styleguide/tsguide.html)。

### 拿不准时，优先保持一致

每当遇到这些规则与某个特定文件的风格相冲突的情况时，
应优先保持文件内部的一致性。在单个文件中混用不同的风格约定，
比偏离本指南的建议造成的混乱更大。

## 命名

### 用连字符分隔文件名中的单词

用连字符（`-`）分隔文件名中的单词。例如，名为 `UserProfile` 的组件（Component）
的文件名为 `user-profile.ts`。

### 测试文件使用相同的名称，并以 `.spec` 结尾

单元测试的文件名以 `.spec.ts` 结尾。例如，
`UserProfile` 组件的单元测试文件名为 `user-profile.spec.ts`。

### 文件名与其中的 TypeScript 标识符相匹配

文件名通常应描述文件中代码的内容。当文件包含一个
TypeScript 类时，文件名应体现该类的名称。例如，包含
名为 `UserProfile` 的组件的文件命名为 `user-profile.ts`。

如果文件包含不止一个主要的可命名标识符，请选择一个能描述其中代码共同主题的名称。
如果文件中的代码不属于同一个共同主题或功能领域，
请考虑将代码拆分到不同的文件中。避免使用过于宽泛的文件名，
例如 `helpers.ts`、`utils.ts` 或 `common.ts`。

### 组件的 TypeScript、模板和样式使用相同的文件名

组件通常由一个 TypeScript 文件、一个模板（Template）文件和一个样式文件组成。这些
文件应使用相同的名称和不同的文件扩展名。例如，`UserProfile`
组件可以包含 `user-profile.ts`、`user-profile.html` 和 `user-profile.css` 这几个文件。

如果组件有不止一个样式文件，请在名称后追加额外的单词，用来描述
该文件特有的样式。例如，`UserProfile` 可能有
`user-profile-settings.css` 和 `user-profile-subscription.css` 两个样式文件。

## 项目结构

### 应用的所有代码都放在名为 `src` 的目录中

你所有的 Angular UI 代码（TypeScript、HTML 和样式）都应放在一个
名为 `src` 的目录中。与 UI 无关的代码，例如配置文件或脚本，应放在
`src` 目录之外。

这能让不同 Angular 项目的应用根目录保持一致，并在项目中的
UI 代码与其他代码之间形成清晰的分隔。

### 在 `src` 目录下直接创建名为 `main.ts` 的文件来引导应用

启动（或称**引导**）Angular 应用的代码应始终放在一个
名为 `main.ts` 的文件中。它代表应用的主入口点。

### 将密切相关的文件放在同一个目录中

Angular 组件由一个 TypeScript 文件以及可选的一个模板文件和一个或多个样式
文件组成。你应该把它们放在同一个目录中。

单元测试应与被测代码放在同一个目录中。避免将互不相关的
测试集中到单个 `tests` 目录中。

### 按功能领域组织项目

根据应用的功能或目录中代码的共同主题，将项目组织成多个子目录。
例如，一个名为 MovieReel 的电影院网站，
其项目结构可能如下所示：

```
src/
├─ movie-reel/
│ ├─ show-times/
│ │ ├─ film-calendar/
│ │ ├─ film-details/
│ ├─ reserve-tickets/
│ │ ├─ payment-info/
│ │ ├─ purchase-confirmation/
```

避免根据目录中代码的类型来创建子目录。例如，
避免创建 `components`、`directives` 和 `services` 这样的目录。

避免在一个目录中放入过多文件，以至于难以阅读或浏览。随着
目录中文件数量的增长，请考虑进一步拆分为更多的子目录。

### 每个文件一个概念

源文件最好专注于单一*概念*。具体到 Angular 类，这通常
意味着每个文件一个组件、指令（Directive）或服务（Service）。不过，如果你的类相对较小，
并且它们共同构成同一个概念的一部分，那么一个文件包含不止
一个组件或指令也是可以的。

拿不准时，选择能让文件更小的方式。

## 依赖注入

### 优先使用 `inject` 函数，而不是构造函数参数注入

优先使用 [`inject`](https://angular.dev/api/core/inject) 函数，而不是注入构造函数参数。[`inject`](https://angular.dev/api/core/inject) 函数的工作方式与构造函数参数注入相同，但在风格上有以下几个优势：

- [`inject`](https://angular.dev/api/core/inject) 通常可读性更好，尤其是当一个类注入很多依赖时。
- 为注入的依赖添加注释在语法上更直接
- [`inject`](https://angular.dev/api/core/inject) 提供更好的类型推断。
- 当以 ES2022+ 为目标并启用 [`useDefineForClassFields`](https://www.typescriptlang.org/tsconfig/#useDefineForClassFields) 时，如果字段需要读取注入的依赖，你可以避免将字段声明与初始化分开。

[你可以使用自动化工具将现有代码重构为使用 `inject`](/reference/migrations/inject-function)。

## 组件和指令

### 选择组件选择器

请参阅
[组件指南中关于选择组件选择器的详细说明](/guide/components/selectors#choosing-a-selector)。

### 组件和指令成员的命名

请参阅组件指南中关于
[输入属性命名](/guide/components/inputs#choosing-input-names)
和[输出属性命名](/guide/components/outputs#choosing-event-names)的详细说明。

### 选择指令选择器

指令应使用与组件
相同的[应用专属前缀](/guide/components/selectors#selector-prefixes)。

为指令使用属性选择器时，请使用 camelCase 形式的属性名。例如，如果
你的应用名为 "MovieReel"，而你构建了一个为元素添加工具提示的指令，
可以使用选择器 `[mrTooltip]`。

### 将 Angular 特有的属性放在方法之前

组件和指令应将 Angular 特有的属性集中在一起，通常放在
类声明的顶部附近。这包括注入的依赖、输入、输出和查询。请在
类的方法之前定义这些属性以及其他属性。

这种做法能让人更容易找到类的模板 API 和依赖。

### 让组件和指令专注于展示

组件和指令中的代码通常应与页面上显示的 UI 相关。对于
能够脱离 UI 独立存在的代码，最好将其重构到其他文件中。例如，
你可以把表单验证规则或数据转换提取为单独的函数或
类。

### 避免在模板中编写过于复杂的逻辑

Angular 模板被设计为
支持[类似 JavaScript 的表达式](/guide/templates/expression-syntax)。
你应该利用这些表达式，直接在模板表达式中表达
相对简单的逻辑。

不过，当模板中的代码变得过于复杂时，请将逻辑重构到 TypeScript 代码中（通常使用 [computed](/guide/signals#computed-signals)）。

并没有一条硬性规定来界定什么才算「复杂」。请根据你的最佳
判断来决定。

### 对仅由组件模板使用的类成员使用 `protected`

组件类的公共成员本质上定义了一个公共 API，可以通过
依赖注入（Dependency Injection）和[查询](/guide/components/queries)访问。对于要从组件模板中读取的成员，
最好使用 `protected` 访问修饰符。

```ts
@Component({
  ...,
  template: `<p>{{ fullName() }}</p>`,
})
export class UserProfile {
  firstName = input();
  lastName = input();

// `fullName` 不属于组件的公共 API，但会在模板中使用。
  protected fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}
```

### 对不应改变的属性使用 `readonly`

将由 Angular 初始化的组件和指令属性标记为 `readonly`。这包括
由 `input`、`model`、`output` 和查询初始化的属性。readonly 访问修饰符
可确保 Angular 设置的值不会被覆盖。

```ts
@Component(/* ... */)
export class UserProfile {
  readonly userId = input();
  readonly userSaved = output();
  readonly userName = model();
}
```

对于使用基于装饰器的 `@Input`、`@Output` 和查询 API 的组件和指令，这条
建议适用于输出属性和查询，但不适用于输入属性。

```ts
@Component(/* ... */)
export class UserProfile {
  @Output() readonly userSaved = new EventEmitter<void>();
  @ViewChildren(PaymentMethod) readonly paymentMethods?: QueryList<PaymentMethod>;
}
```

### 优先使用 `class` 和 `style`，而不是 `ngClass` 和 `ngStyle`

优先使用 `class` 和 `style` 绑定，而不是 [`NgClass`](https://angular.dev/api/common/NgClass) 和 [`NgStyle`](https://angular.dev/api/common/NgStyle) 指令。

```html
<div [class.admin]="isAdmin" [class.dense]="density === 'high'">
  <div [style.color]="textColor" [style.background-color]="backgroundColor">
    <!-- 或者 -->
    <div [class]="{admin: isAdmin, dense: density === 'high'}">
      <div [style]="{'color': textColor, 'background-color': backgroundColor}"></div>
    </div>
  </div>
</div>
```

```html
<div [ngClass]="{admin: isAdmin, dense: density === 'high'}">
  <div [ngStyle]="{'color': textColor, 'background-color': backgroundColor}"></div>
</div>
```

`class` 和 `style` 绑定使用的语法都更直观，与
标准 HTML 属性非常接近。这能让你的模板更易于阅读和理解，尤其是对于
熟悉基础 HTML 的开发者。

此外，与内置的 `class` 和 `style` 绑定语法相比，`NgClass` 和 `NgStyle` 指令
会带来额外的性能开销。

更多详情，请参阅[绑定指南](/guide/templates/binding#css-class-and-style-property-bindings)

### 按事件处理器所*做的事*来命名，而不是按触发事件命名

事件处理器最好按其执行的操作来命名，而不是按触发事件来命名：

```html
<button (click)="saveUserData()">Save</button>
```

```html
<button (click)="handleClick()">Save</button>
```

使用这样有意义的名称，在阅读模板时就能更容易看出某个事件做了什么。

对于键盘事件，你可以将 Angular 的按键事件修饰符与具体的处理器名称结合使用：

```html
<textarea (keydown.control.enter)="commitNotes()" (keydown.control.space)="showSuggestions()">
```

有时，事件处理逻辑特别长或特别复杂，导致无法只声明
一个命名恰当的处理器。在这种情况下，可以退而使用 'handleKeydown' 这样的名称，
然后根据事件详情委托给更具体的行为：

```ts
@Component(/* ... */)
class RichText {
  handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey) {
      if (event.key === 'B') {
        this.activateBold();
      } else if (event.key === 'I') {
        this.activateItalic();
      }
      // ...
    }
  }
}
```

### 保持生命周期方法简洁

避免在 `ngOnInit` 等生命周期钩子（Lifecycle Hook）中放入冗长或复杂的逻辑。相反，最好创建
命名恰当的方法来容纳这些逻辑，然后在生命周期钩子中*调用这些方法*。
生命周期钩子的名称描述的是它们*何时*运行，这意味着其中的代码
没有一个能描述其具体作用的有意义的名称。

```ts
ngOnInit() {
  this.startLogging();
  this.runBackgroundTask();
}
```

```ts
ngOnInit() {
  this.logger.setMode('info');
  this.logger.monitorErrors();
  // ……以及从这些方法中展开的所有其余代码。
}
```

### 使用生命周期钩子接口

Angular 为每个生命周期方法都提供了一个 TypeScript 接口。为类添加生命周期钩子时，
请导入并 `implement` 这些接口，以确保方法名称正确。

```ts
import {Component, OnInit} from '@angular/core';

@Component(/* ... */)
export class UserProfile implements OnInit {
  // `OnInit` 接口可确保此方法的名称正确。
  ngOnInit() {
    /* ... */
  }
}
```
