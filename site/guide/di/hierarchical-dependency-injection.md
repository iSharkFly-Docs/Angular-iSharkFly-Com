# 分层注入器 {#hierarchical-injectors}

本指南深入介绍 Angular 的分层依赖注入（Dependency Injection）系统，包括解析规则、修饰符以及高级模式。

::: info 注意
关于注入器（Injector）层次结构和提供者（Provider）作用域的基本概念，请参阅[定义依赖提供者指南](/guide/di/defining-dependency-providers#injector-hierarchy-in-angular)。

:::

## 注入器层次结构的类型 {#types-of-injector-hierarchies}

Angular 有两种注入器层次结构：

| 注入器层次结构            | 详情                                                                                                                                                                   |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `EnvironmentInjector` 层次结构 | 使用 `@Service()` 或 `ApplicationConfig` 中的 `providers` 数组来配置该层次结构中的 `EnvironmentInjector`。                                                      |
| `ElementInjector` 层次结构     | 在每个 DOM 元素上隐式创建。默认情况下 `ElementInjector` 是空的，除非你在 `@Directive()` 或 `@Component()` 的 `providers` 属性中对其进行配置。 |

::: tip 基于 NgModule 的应用
对于基于 `NgModule` 的应用，你可以使用 `@NgModule()` 或 `@Injectable()` 注解，通过 `ModuleInjector` 层次结构来提供依赖。
:::

### `EnvironmentInjector` {#environmentinjector}

可以通过以下两种方式之一来配置 `EnvironmentInjector`：

- `@Service()`
- `ApplicationConfig` 的 `providers` 数组

::: tip 摇树优化与 @Service()
优先使用 `@Service()` 装饰器，而不是 `ApplicationConfig` 的 `providers` 数组。使用 `@Service` 时，优化工具可以执行摇树优化（Tree-shaking），移除应用中未使用的服务（Service），从而减小包（Bundle）的体积。

摇树优化对库尤其有用，因为使用该库的应用可能并不需要注入它。
:::

`EnvironmentInjector` 由 `ApplicationConfig.providers` 配置。

使用 `@Service()` 提供服务的方式如下：

```ts
import {Service} from '@angular/core';

@Service() // <--在根 EnvironmentInjector 中提供此服务
export class ItemService {
  name = 'telephone';
}
```

`@Service()` 或 `@Injectable()` 装饰器用于标识一个服务类。

### ModuleInjector {#moduleinjector}

对于基于 `NgModule` 的应用，可以通过以下几种方式之一来配置 ModuleInjector：

- `@Service()` 装饰器；
- `@Injectable()` 的 `providedIn` 属性，取值为 `root` 或 `platform`；
- `@NgModule()` 的 `providers` 数组。

`ModuleInjector` 由 `@NgModule.providers` 和 `NgModule.imports` 属性配置。`ModuleInjector` 是对递归遍历 `NgModule.imports` 所能到达的所有 providers 数组的扁平化合并。

当延迟加载（Lazy Loading）其他 `@NgModules` 时，会创建子 `ModuleInjector` 层次结构。

### 平台注入器 {#platform-injector}

在 `root` 之上还有两个注入器：一个额外的 `EnvironmentInjector` 和 `NullInjector()`。

来看看 Angular 是如何通过 `main.ts` 中的以下代码引导应用的：

```ts
bootstrapApplication(App, appConfig);
```

`bootstrapApplication()` 方法会创建平台注入器的一个子注入器，该子注入器由 `ApplicationConfig` 实例配置。
这就是 `root` `EnvironmentInjector`。

`bootstrapApplication()` 方法还会创建（或复用）平台注入器，其中包含平台特有的依赖。
这让多个应用可以共享同一份平台配置。
例如，无论你运行了多少个应用，浏览器都只有一个地址栏。
你可以通过 `platformBrowser()` 函数提供 `extraProviders`，在平台级别配置额外的平台特有提供者。

层次结构中的下一个父注入器是 `NullInjector()`，它位于树的顶端。
如果你已经沿着树一路向上，直到在 `NullInjector()` 中查找服务，那么除非你使用了 `@Optional()`，否则会得到一个错误。因为归根结底，一切都止于 `NullInjector()`，它会返回一个错误，或者在使用 `@Optional()` 的情况下返回 `null`。
关于 `@Optional()` 的更多信息，请参阅本指南的 [`@Optional()` 部分](#optional)。

下图展示了前面几段所描述的 `root` `ModuleInjector` 与其父注入器之间的关系。

```txt
stateDiagram-v2
    elementInjector: EnvironmentInjector<br>(configured by Angular)<br>has special things like PlatformLocation => providedIn 'platform'
    rootInjector: root EnvironmentInjector<br>(configured by AppConfig)<br>has things for your app => bootstrapApplication(..., AppConfig)
    nullInjector: NullInjector<br>always throws an error unless<br>you use @Optional()

    direction BT
    rootInjector --> elementInjector
    elementInjector --> nullInjector
```

`root` 这个名字是一个特殊的别名，而其他 `EnvironmentInjector` 层次结构则没有别名。
每当创建动态加载的组件（Component）时，你都可以选择创建 `EnvironmentInjector` 层次结构，例如路由器（Router）就会创建子 `EnvironmentInjector` 层次结构。

所有请求最终都会向上转发到根注入器，无论你是通过传给 `bootstrapApplication()` 方法的 `ApplicationConfig` 实例来配置它，还是在各个服务自身中把所有提供者注册到 `root`。

::: tip @Injectable() 与 ApplicationConfig
如果你在 `bootstrapApplication` 的 `ApplicationConfig` 中配置了一个应用级提供者，它会覆盖在 `@Injectable()` 元数据中为 `root` 配置的提供者。
你可以借此为一个由多个应用共享的服务配置非默认的提供者。

下面这个例子中，组件路由配置通过在 `ApplicationConfig` 的 `providers` 列表中列出其提供者，引入了一个非默认的[位置策略](/guide/routing/common-router-tasks#locationstrategy-and-browser-url-styles)。

```ts
providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}];
```

对于基于 `NgModule` 的应用，请在 `AppModule` 的 `providers` 中配置应用级提供者。
:::

### `ElementInjector` {#elementinjector}

Angular 会为每个 DOM 元素隐式创建 `ElementInjector` 层次结构。

在 `@Component()` 装饰器中使用其 `providers` 或 `viewProviders` 属性提供服务，就会配置一个 `ElementInjector`。
例如，下面的 `TestComponent` 通过如下方式提供服务来配置 `ElementInjector`：

```ts
@Component({
  /* … */
  providers: [{ provide: ItemService, useValue: { name: 'lamp' } }]
})
export class TestComponent
```

::: tip 提示
请参阅[解析规则](#resolution-rules)一节，了解 `EnvironmentInjector` 树、`ModuleInjector` 与 `ElementInjector` 树之间的关系。

:::

当你在组件中提供服务时，该服务可以通过该组件实例上的 `ElementInjector` 获得。
根据[解析规则](#resolution-rules)一节中描述的可见性规则，它也可能对子组件和子指令可见。

当组件实例被销毁时，该服务实例也会随之销毁。

#### `@Directive()` 和 `@Component()` {#directive-and-component}

组件是一种特殊类型的指令（Directive），这意味着正如 `@Directive()` 有 `providers` 属性一样，`@Component()` 也有。
也就是说，指令和组件都可以使用 `providers` 属性来配置提供者。
当你使用 `providers` 属性为组件或指令配置提供者时，该提供者属于该组件或指令的 `ElementInjector`。
同一元素上的组件和指令共享同一个注入器。

## 解析规则 {#resolution-rules}

在为组件或指令解析令牌时，Angular 分两个阶段进行解析：

1. 在 `ElementInjector` 层次结构中沿着其父级进行解析。
2. 在 `EnvironmentInjector` 层次结构中沿着其父级进行解析。

当组件声明了一个依赖时，Angular 会尝试用该组件自己的 `ElementInjector` 来满足这个依赖。
如果该组件的注入器中缺少对应的提供者，它就会把请求传给其父组件的 `ElementInjector`。

请求会一直向上转发，直到 Angular 找到能够处理该请求的注入器，或者已经没有更多祖先 `ElementInjector` 层次结构为止。

如果 Angular 在任何 `ElementInjector` 层次结构中都找不到提供者，它就会回到发起请求的元素，并在 `EnvironmentInjector` 层次结构中查找。
如果 Angular 仍然找不到提供者，就会抛出错误。

如果你在不同层级为同一个 DI 令牌注册了提供者，Angular 会使用它遇到的第一个提供者来解析该依赖。
例如，如果在需要某个服务的组件中本地注册了一个提供者，
Angular 就不会再去查找同一服务的其他提供者。

::: tip 提示
对于基于 `NgModule` 的应用，如果 Angular 在 `ElementInjector` 层次结构中找不到提供者，就会搜索 `ModuleInjector` 层次结构。

:::

## 解析修饰符 {#resolution-modifiers}

可以使用 `optional`、`self`、`skipSelf` 和 `host` 来修改 Angular 的解析行为。
它们都从 `@angular/core` 导入，在注入服务时用在 [`inject`](https://angular.dev/api/core/inject) 的配置中。

### 修饰符的类型 {#types-of-modifiers}

解析修饰符（Resolution Modifier）分为三类：

- 如果 Angular 找不到你要查找的内容该怎么办，即 `optional`
- 从哪里开始查找，即 `skipSelf`
- 在哪里停止查找，即 `host` 和 `self`

默认情况下，Angular 总是从当前的 `Injector` 开始，并一路向上搜索。
修饰符允许你改变查找的起始位置（即 _self_ 位置）和结束位置。

此外，除了以下组合之外，所有修饰符都可以组合使用：

- `host` 和 `self`
- `skipSelf` 和 `self`。

### `optional` {#optional}

`optional` 让 Angular 把你注入的服务视为可选的。
这样，如果在运行时无法解析它，Angular 会把该服务解析为 `null`，而不是抛出错误。
在下面的例子中，服务 `OptionalService` 既没有在服务中提供，也没有在 `ApplicationConfig`、`@NgModule()` 或组件类中提供，因此它在应用中的任何地方都不可用。

```ts [src/app/optional/optional.ts]
export class Optional {
  public optional? = inject(OptionalService, {optional: true});
}
```

### `self` {#self}

使用 `self`，Angular 将只查看当前组件或指令的 `ElementInjector`。

`self` 的一个典型用例是：注入某个服务，但仅当它在当前宿主元素（Host Element）上可用时才注入。
为了避免这种情况下出错，请把 `self` 与 `optional` 结合使用。

例如，在下面的 `SelfNoData` 中，请注意作为属性注入的 `LeafService`。

```ts [self-no-data.ts]
@Component({
  selector: 'app-self-no-data',
  templateUrl: './self-no-data.html',
  styleUrls: ['./self-no-data.css'],
})
export class SelfNoData {
  public leaf = inject(LeafService, {optional: true, self: true});
}
```

在这个例子中，存在一个父级提供者，直接注入该服务会返回其值；然而，使用 `self` 和 `optional` 注入该服务则会返回 `null`，因为 `self` 告诉注入器在当前宿主元素处停止搜索。

另一个例子展示了一个为 `FlowerService` 提供了提供者的组件类。
在这种情况下，注入器不会越过当前的 `ElementInjector` 继续查找，因为它找到了 `FlowerService` 并返回郁金香 🌷。

```ts [src/app/self/self.ts]
@Component({
  selector: 'app-self',
  templateUrl: './self.html',
  styleUrls: ['./self.css'],
  providers: [{provide: FlowerService, useValue: {emoji: '🌷'}}],
})
export class Self {
  public flower = inject(FlowerService, {self: true});
}
```

### `skipSelf` {#skipself}

`skipSelf` 与 `self` 相反。
使用 `skipSelf` 时，Angular 会从父级 `ElementInjector` 而不是当前的 `ElementInjector` 开始搜索服务。
因此，如果父级 `ElementInjector` 的 `emoji` 使用的是蕨叶 <code>🌿</code>，而你在组件的 `providers` 数组中使用的是枫叶 <code>🍁</code>，Angular 就会忽略枫叶 <code>🍁</code> 而使用蕨叶 <code>🌿</code>。

为了在代码中看到这一点，假设父组件所使用的 `emoji` 值如下面这个服务所示：

```ts [leaf.service.ts]
export class LeafService {
  emoji = '🌿';
}
```

想象一下，在子组件中你有一个不同的值——枫叶 🍁，但你希望改用父级的值。
这时就该使用 `skipSelf`：

```ts [skipself.ts]
@Component({
  selector: 'app-skipself',
  templateUrl: './skipself.html',
  styleUrls: ['./skipself.css'],
  // Angular 会忽略这个 LeafService 实例
  providers: [{provide: LeafService, useValue: {emoji: '🍁'}}],
})
export class Skipself {
  // 把 skipSelf 用作 inject 选项
  public leaf = inject(LeafService, {skipSelf: true});
}
```

在这种情况下，你得到的 `emoji` 值将是蕨叶 <code>🌿</code>，而不是枫叶 <code>🍁</code>。

#### `skipSelf` 选项与 `optional` 结合使用 {#skipself-option-with-optional}

将 `skipSelf` 选项与 `optional` 结合使用，可以在值为 `null` 时避免出错。

在下面的例子中，`Person` 服务在属性初始化期间被注入。
`skipSelf` 告诉 Angular 跳过当前注入器，而 `optional` 则会在 `Person` 服务为 `null` 时避免出错。

```ts
class Person {
  parent = inject(Person, {optional: true, skipSelf: true});
}
```

### `host` {#host}

<!-- TODO: Remove ambiguity between host and self. -->

`host` 让你可以把某个组件指定为在注入器树中搜索提供者时的最后一站。

即使树中更上层存在服务实例，Angular 也不会继续查找。
`host` 的用法如下：

```ts [host.ts]
@Component({
  selector: 'app-host',
  templateUrl: './host.html',
  styleUrls: ['./host.css'],
  // 提供服务
  providers: [{provide: FlowerService, useValue: {emoji: '🌷'}}],
})
export class Host {
  // 注入服务时使用 host
  flower = inject(FlowerService, {host: true, optional: true});
}
```

由于 `Host` 使用了 `host` 选项，无论 `Host` 的父级的 `flower.emoji` 值是什么，`Host` 都会使用郁金香 <code>🌷</code>。

### 在构造函数注入中使用修饰符 {#modifiers-with-constructor-injection}

与前面介绍的类似，构造函数注入的行为也可以通过 `@Optional()`、`@Self()`、`@SkipSelf()` 和 `@Host()` 来修改。

它们都从 `@angular/core` 导入，在注入服务时用在组件类的构造函数中。

```ts [self-no-data.ts]
export class SelfNoData {
  constructor(@Self() @Optional() public leaf?: LeafService) {}
}
```

## 模板的逻辑结构 {#logical-structure-of-the-template}

当你在组件类中提供服务时，服务在 `ElementInjector` 树中的可见性取决于你在何处以及如何提供这些服务。

理解 Angular 模板（Template）背后的逻辑结构，能为你配置服务、进而控制服务的可见性打下基础。

组件会在模板中使用，如下例所示：

```html
<app-root> <app-child />; </app-root>
```

::: tip 提示
通常，你会在不同的文件中声明组件及其模板。
为了理解注入系统的工作方式，从一棵合并后的逻辑树的角度来看待它们会很有帮助。
「逻辑」一词是为了把它与渲染树区分开来，渲染树指的是应用的 DOM 树。
为了标记组件模板所在的位置，本指南使用了 `<#VIEW>` 伪元素，它实际上并不存在于渲染树中，仅用于帮助建立心智模型。

:::

下面的例子展示了 `<app-root>` 和 `<app-child>` 的视图树是如何合并成一棵逻辑树的：

```html
<app-root>
  <#VIEW>
    <app-child>
     <#VIEW>
       …这里是内容…
     </#VIEW>
    </app-child>
  </#VIEW>
</app-root>
```

当你在组件类中配置服务时，理解 `<#VIEW>` 分界的概念尤为重要。

## 示例：在 `@Component()` 中提供服务 {#example-providing-services-in-component}

使用 `@Component()`（或 `@Directive()`）装饰器提供服务的方式决定了这些服务的可见性。
下面几节将演示 `providers` 和 `viewProviders`，以及如何使用 `skipSelf` 和 `host` 修改服务的可见性。

组件类可以通过两种方式提供服务：

| 数组                       | 详情                                        |
| :--------------------------- | :--------------------------------------------- |
| 使用 `providers` 数组     | `@Component({ providers: [SomeService] })`     |
| 使用 `viewProviders` 数组 | `@Component({ viewProviders: [SomeService] })` |

在下面的例子中，你会看到一个 Angular 应用的逻辑树。
为了说明注入器在模板上下文中的工作方式，逻辑树会表示应用的 HTML 结构。
例如，逻辑树会显示 `<child-component>` 是 `<parent-component>` 的直接子元素。

在逻辑树中，你会看到一些特殊属性：`@Provide`、`@Inject` 和 `@ApplicationConfig`。
它们并不是真实存在的属性，只是用来演示底层发生了什么。

| Angular 服务属性 | 详情                                                                                  |
| :------------------------ | :--------------------------------------------------------------------------------------- |
| `@Inject(Token)=>Value`   | 如果在逻辑树的这个位置注入 `Token`，它的值将是 `Value`。 |
| `@Provide(Token=Value)`   | 表示在逻辑树的这个位置用 `Value` 提供了 `Token`。    |
| `@ApplicationConfig`      | 表示在这个位置应当使用一个后备 `EnvironmentInjector`。      |

### 示例应用结构 {#example-app-structure}

示例应用在 `root` 中提供了一个 `FlowerService`，其 `emoji` 值为红色木槿 <code>🌺</code>。

```ts [flower.service.ts]
@Service()
export class FlowerService {
  emoji = '🌺';
}
```

假设一个应用只有 `App` 和 `Child`。
最基本的渲染视图看起来就是如下这样的嵌套 HTML 元素：

```html
<app-root>
  <!-- App 选择器 -->
  <app-child> <!-- Child 选择器 --> </app-child>
</app-root>
```

然而在幕后，Angular 在解析注入请求时会使用如下的逻辑视图表示：

```html
<app-root> <!-- App 选择器 -->
  <#VIEW>
    <app-child> <!-- Child 选择器 -->
      <#VIEW>
      </#VIEW>
    </app-child>
  </#VIEW>
</app-root>
```

这里的 `<#VIEW>` 表示模板的一个实例。
请注意，每个组件都有自己的 `<#VIEW>`。

了解这一结构，可以帮助你决定如何提供和注入服务，并让你完全掌控服务的可见性。

现在，假设 `<app-root>` 注入了 `FlowerService`：

```ts
export class App {
  flower = inject(FlowerService);
}
```

在 `<app-root>` 的模板中添加一个绑定（Binding）来查看结果：

```html
<p>Emoji from FlowerService: {{flower.emoji}}</p>
```

视图中的输出将是：

```text
Emoji from FlowerService: 🌺
```

在逻辑树中，这可以表示为：

```html
<app-root @ApplicationConfig
        @Inject(FlowerService) flower=>"🌺">
  <#VIEW>
    <p>Emoji from FlowerService: {{flower.emoji}} (🌺)</p>
    <app-child>
      <#VIEW>
      </#VIEW>
    </app-child>
  </#VIEW>
</app-root>
```

当 `<app-root>` 请求 `FlowerService` 时，由注入器负责解析 `FlowerService` 令牌。
令牌的解析分两个阶段进行：

1. 注入器确定在逻辑树中搜索的起始位置和结束位置。
   注入器从起始位置开始，在逻辑树的每个视图层级中查找该令牌。
   如果找到了令牌，就将其返回。

1. 如果没有找到令牌，注入器会查找最近的父级 `EnvironmentInjector`，并把请求委托给它。

在这个例子中，约束条件如下：

1. 从属于 `<app-root>` 的 `<#VIEW>` 开始，到 `<app-root>` 结束。
   - 通常，搜索的起点就是注入点。
     不过在这个例子中，`<app-root>` 是一个组件。`@Component` 的特殊之处在于它们还包含自己的 `viewProviders`，这就是为什么搜索会从属于 `<app-root>` 的 `<#VIEW>` 开始。
     对于在同一位置匹配的指令，则不会是这种情况。
   - 结束位置恰好与组件本身相同，因为它是这个应用中最顶层的组件。

1. 当在 `ElementInjector` 层次结构中找不到注入令牌（Injection Token）时，由 `ApplicationConfig` 提供的 `EnvironmentInjector` 会充当后备注入器。

### 使用 `providers` 数组 {#using-the-providers-array}

现在，在 `Child` 类中为 `FlowerService` 添加一个提供者，以便在接下来的几节中演示更复杂的解析规则：

```ts
@Component({
  selector: 'app-child',
  templateUrl: './child.html',
  styleUrls: ['./child.css'],
  // 使用 providers 数组来提供服务
  providers: [{provide: FlowerService, useValue: {emoji: '🌻'}}],
})
export class Child {
  // 注入服务
  flower = inject(FlowerService);
}
```

既然 `FlowerService` 已在 `@Component()` 装饰器中提供，当 `<app-child>` 请求该服务时，注入器只需查找到 `<app-child>` 中的 `ElementInjector` 即可。
它无需再沿着注入器树继续搜索。

下一步是在 `Child` 的模板中添加一个绑定。

```html
<p>Emoji from FlowerService: {{flower.emoji}}</p>
```

为了渲染新的值，把 `<app-child>` 添加到 `App` 模板的底部，这样视图中也会显示向日葵：

```text
Child Component
Emoji from FlowerService: 🌻
```

在逻辑树中，这可以表示为：

```html
<app-root @ApplicationConfig
          @Inject(FlowerService) flower=>"🌺">
  <#VIEW>

  <p>Emoji from FlowerService: {{flower.emoji}} (🌺)</p>
  <app-child @Provide(FlowerService="🌻" )
             @Inject(FlowerService)=>"🌻"> <!-- 搜索在此结束 -->
    <#VIEW> <!-- 搜索从此开始 -->
    <h2>Child Component</h2>
    <p>Emoji from FlowerService: {{flower.emoji}} (🌻)</p>
  </
  #VIEW>
  </app-child>
</#VIEW>
</app-root>
```

当 `<app-child>` 请求 `FlowerService` 时，注入器从属于 `<app-child>` 的 `<#VIEW>` 开始搜索（之所以包含 `<#VIEW>`，是因为它是从 `@Component()` 注入的），并在 `<app-child>` 处结束。
在这种情况下，`FlowerService` 在 `<app-child>` 的 `providers` 数组中被解析为向日葵 <code>🌻</code>。
注入器无需在注入器树中继续向上查找。
它一找到 `FlowerService` 就会停止，永远不会看到红色木槿 <code>🌺</code>。

### 使用 `viewProviders` 数组 {#using-the-viewproviders-array}

使用 `viewProviders` 数组是在 `@Component()` 装饰器中提供服务的另一种方式。
使用 `viewProviders` 会让服务在 `<#VIEW>` 中可见。

::: tip 提示
其步骤与使用 `providers` 数组相同，只是改用 `viewProviders` 数组。

:::

如需分步说明，请继续阅读本节。
如果你可以自行完成设置，请直接跳到[修改服务的可用性](#visibility-of-provided-tokens)。

为了演示，我们构建一个 `AnimalService` 来演示 `viewProviders`。
首先，创建一个 `AnimalService`，其 `emoji` 属性为鲸鱼 <code>🐳</code>：

```ts
import {Service} from '@angular/core';

@Service()
export class AnimalService {
  emoji = '🐳';
}
```

按照与 `FlowerService` 相同的模式，在 `App` 类中注入 `AnimalService`：

```ts
export class App {
  public flower = inject(FlowerService);
  public animal = inject(AnimalService);
}
```

::: tip 提示
你可以保留所有与 `FlowerService` 相关的代码，以便与 `AnimalService` 进行对比。

:::

同样在 `<app-child>` 类中添加一个 `viewProviders` 数组并注入 `AnimalService`，但为 `emoji` 设置一个不同的值。
这里的值是小狗 🐶。

```ts
@Component({
  selector: 'app-child',
  templateUrl: './child.html',
  styleUrls: ['./child.css'],
  // 提供服务
  providers: [{provide: FlowerService, useValue: {emoji: '🌻'}}],
  viewProviders: [{provide: AnimalService, useValue: {emoji: '🐶'}}],
})
export class Child {
  // 注入服务
  flower = inject(FlowerService);
  animal = inject(AnimalService);
}
```

在 `Child` 和 `App` 的模板中添加绑定。
在 `Child` 模板中，添加如下绑定：

```html
<p>Emoji from AnimalService: {{animal.emoji}}</p>
```

此外，在 `App` 模板中也添加同样的绑定：

```html
<p>Emoji from AnimalService: {{animal.emoji}}</p>
```

现在你应该能在浏览器中看到这两个值：

```text
App
Emoji from AnimalService: 🐳

Child Component
Emoji from AnimalService: 🐶
```

这个 `viewProviders` 示例的逻辑树如下：

```html
<app-root @ApplicationConfig
          @Inject(AnimalService) animal=>"🐳">
  <#VIEW>
  <app-child>
    <#VIEW @Provide(AnimalService="🐶")
    @Inject(AnimalService=>"🐶")>

    <!-- ^^使用 viewProviders 意味着 AnimalService 在 <#VIEW> 中可用-->
    <p>Emoji from AnimalService: {{animal.emoji}} (🐶)</p>
  </
  #VIEW>
  </app-child>
</#VIEW>
</app-root>
```

与 `FlowerService` 的例子一样，`AnimalService` 是在 `<app-child>` 的 `@Component()` 装饰器中提供的。
这意味着，由于注入器会先在组件的 `ElementInjector` 中查找，它会找到值为小狗 <code>🐶</code> 的 `AnimalService`。
它既不需要继续搜索 `ElementInjector` 树，也不需要搜索 `ModuleInjector`。

### `providers` 与 `viewProviders` 的对比 {#providers-vs-viewproviders}

`viewProviders` 字段在概念上与 `providers` 类似，但有一个显著的区别。
`viewProviders` 中的提供者只在组件自身的视图内可见——通过 `<ng-content>` 投影到组件中的内容看不到它们。

为了看出使用 `providers` 和 `viewProviders` 之间的区别，在示例中再添加一个组件，命名为 `Inspector`。
`Inspector` 将是 `Child` 的子组件。
在 `inspector.ts` 中，在属性初始化期间注入 `FlowerService` 和 `AnimalService`：

```ts
export class Inspector {
  flower = inject(FlowerService);
  animal = inject(AnimalService);
}
```

你不需要 `providers` 或 `viewProviders` 数组。
接下来，在 `inspector.html` 中添加与前面组件相同的标记：

```html
<p>Emoji from FlowerService: {{flower.emoji}}</p>
<p>Emoji from AnimalService: {{animal.emoji}}</p>
```

记得把 `Inspector` 添加到 `Child` 的 `imports` 数组中。

```ts
@Component({
  ...
  imports: [Inspector]
})
```

接下来，在 `child.html` 中添加以下内容：

```html
...

<div class="container">
  <h3>Content projection</h3>
  <ng-content />
</div>
<h3>Inside the view</h3>

<app-inspector />
```

`<ng-content>` 让你可以投影内容，而 `Child` 模板中的 `<app-inspector>` 则让 `Inspector` 成为 `Child` 的子组件。

接下来，在 `app.html` 中添加以下内容，以使用内容投影（Content Projection）。

```html
<app-child>
  <app-inspector />
</app-child>
```

现在浏览器会渲染如下内容（为简洁起见，省略了前面的示例）：

```text
...
Content projection

Emoji from FlowerService: 🌻
Emoji from AnimalService: 🐳

Emoji from FlowerService: 🌻
Emoji from AnimalService: 🐶
```

这四个绑定展示了 `providers` 和 `viewProviders` 之间的区别。
请记住，小狗表情 <code>🐶</code> 是在 `Child` 的 `<#VIEW>` 内部声明的，对投影内容不可见。
因此，投影内容看到的是鲸鱼 <code>🐳</code>。

你可能会好奇，为什么被投影的 `<app-inspector>` 仍然能看到 <code>🐳</code>，也就是在根上提供的 `AnimalService`。
原因在于 Angular DI 追踪的是**组件在哪里声明**，而不是它最终在哪里渲染。
`<app-inspector>` 位于 `App` 的模板中，处在 `App` 的 `<#VIEW>` 内，所以它的查找永远不会经过 `Child` 的 `<#VIEW>`。
把它投影到 `Child` 中会切断它对 `Child` 的 `viewProviders`（<code>🐶</code>）的访问，但沿着树向上仍然可以访问到根上的 `AnimalService`（<code>🐳</code>）。

然而，在接下来的输出部分中，`Inspector` 是 `Child` 真正的子组件，`Inspector` 位于 `<#VIEW>` 内部，因此当它请求 `AnimalService` 时，看到的是小狗 <code>🐶</code>。

逻辑树中的 `AnimalService` 看起来像这样：

```html
<app-root @ApplicationConfig
          @Inject(AnimalService) animal=>"🐳">
  <#VIEW>
  <app-child>
    <#VIEW @Provide(AnimalService="🐶")
    @Inject(AnimalService=>"🐶")>

    <!-- ^^使用 viewProviders 意味着 AnimalService 在 <#VIEW> 中可用-->
    <p>Emoji from AnimalService: {{animal.emoji}} (🐶)</p>

    <div class="container">
      <h3>Content projection</h3>
      <app-inspector @Inject(AnimalService) animal=>"🐳">
        <p>Emoji from AnimalService: {{animal.emoji}} (🐳)</p>
      </app-inspector>
    </div>

    <app-inspector>
      <#VIEW @Inject(AnimalService) animal=>"🐶">
      <p>Emoji from AnimalService: {{animal.emoji}} (🐶)</p>
    </
    #VIEW>
    </app-inspector>
  </
  #VIEW>
  </app-child>

</#VIEW>
</app-root>
```

被投影的 `<app-inspector>` 得到的是 <code>🐳</code>，因为 <code>🐶</code> 属于 `Child` 的视图，投影内容无法访问它。
<code>🐳</code> 之所以可以访问，是因为 `<app-inspector>` 是在 `App` 的模板中声明的，所以它仍然可以沿着树向上找到根上的 `AnimalService`。

直接位于 `Child` 模板中（未被投影）的 `<app-inspector>` 得到的是 <code>🐶</code>——它就在 `<#VIEW>` 内部，无需跨越任何边界。

### 让投影内容访问视图注入器 {#giving-projected-content-access-to-a-view-injector}

通过 `<ng-content>` 投影的内容看不到组件的 `viewProviders`，因为 Angular 是根据内容声明处的注入器来解析注入的，而不是根据内容渲染处的注入器。

如果你确实希望投影内容能够访问视图级服务——或者访问进行投影的组件实例本身——那么可以把内容作为模板来接收，而不是使用 `<ng-content>`，并使用显式指定的注入器来渲染它。

修改 `Child`，在 `viewProviders` 中提供 `AnimalService`，查询被投影的模板，并通过 [`NgTemplateOutlet`](https://angular.dev/api/common/NgTemplateOutlet) 渲染它，同时把 `ngTemplateOutletInjector` 设置为一个能看到该服务的注入器：

```ts
@Component({
  selector: 'app-child',
  viewProviders: [AnimalService],
  imports: [NgTemplateOutlet],
  template: `
    <ng-container [ngTemplateOutlet]="content()" [ngTemplateOutletInjector]="injector" />
  `,
})
export class Child {
  readonly content = contentChild.required(TemplateRef);
  readonly injector = inject(Injector);
}
```

使用方把要投影的标记包裹在 `<ng-template>` 中：

```html
<app-child>
  <ng-template>
    <app-inspector />
  </ng-template>
</app-child>
```

现在 `Child` 会在出口处使用自己的注入器来创建 `<app-inspector>`，因此即使这段标记写在 `App` 的模板中，`AnimalService` 也会被解析为小狗 <code>🐶</code>。代价是与 `<ng-content>` 相比，双方都需要多写一点标记。

### 所提供令牌的可见性 {#visibility-of-provided-tokens}

可见性装饰器会影响在逻辑树中搜索注入令牌的起点和终点。
为此，需要把可见性配置放在注入点上（即调用 `inject()` 时），而不是放在声明处。

要改变注入器开始查找 `FlowerService` 的位置，请在 `<app-child>` 中注入 `FlowerService` 的 `inject()` 调用里添加 `skipSelf`。
这个调用是 `<app-child>` 中的一个属性初始化器，如 `child.ts` 所示：

```ts
flower = inject(FlowerService, {skipSelf: true});
```

使用 `skipSelf` 后，`<app-child>` 的注入器不会在自身中查找 `FlowerService`。
相反，注入器会从 `<app-root>` 的 `ElementInjector` 开始查找 `FlowerService`，但在那里什么也找不到。
然后，它会回到 `<app-child>` 的 `ModuleInjector`，并找到红色木槿 <code>🌺</code> 这个值，之所以可用，是因为 `<app-child>` 和 `<app-root>` 共享同一个 `ModuleInjector`。
UI 会渲染如下内容：

```text
Emoji from FlowerService: 🌺
```

在逻辑树中，同样的思路看起来可能是这样的：

```html
<app-root @ApplicationConfig
          @Inject(FlowerService) flower=>"🌺">
  <#VIEW>
  <app-child @Provide(FlowerService="🌻" )>
    <#VIEW @Inject(FlowerService, SkipSelf)=>"🌺">

    <!-- 使用 SkipSelf 时，注入器会查找树中的上一级注入器（app-root） -->

  </
  #VIEW>
  </app-child>
</#VIEW>
</app-root>
```

尽管 `<app-child>` 提供了向日葵 <code>🌻</code>，应用渲染的却是红色木槿 <code>🌺</code>，因为 `skipSelf` 会让当前注入器（`app-child`）跳过自身，转而查找其父级。

如果你现在（在 `skipSelf` 之外）再加上 `host`，结果将是 `null`。
这是因为 `host` 把搜索的上限限制在了 `app-child` 的 `<#VIEW>`。
下面是这一思路在逻辑树中的表示：

```html
<app-root @ApplicationConfig
          @Inject(FlowerService) flower=>"🌺">
  <#VIEW> <!-- 在此结束搜索，结果为 null-->
  <app-child @Provide(FlowerService="🌻" )> <!-- 从此开始搜索 -->
    <#VIEW inject(FlowerService, {skipSelf: true, host: true, optional:true})=>null>
  </
  #VIEW>
  </app-parent>
</#VIEW>
</app-root>
```

这里的服务及其值都相同，但 `host` 会阻止注入器在 `<#VIEW>` 之外继续查找 `FlowerService`，因此它找不到该服务并返回 `null`。

### `skipSelf` 和 `viewProviders` {#skipself-and-viewproviders}

请记住，`<app-child>` 在 `viewProviders` 数组中提供了 `AnimalService`，其值为小狗 <code>🐶</code>。
由于注入器只需在 `<app-child>` 的 `ElementInjector` 中查找 `AnimalService`，它永远不会看到鲸鱼 <code>🐳</code>。

与 `FlowerService` 的例子一样，如果你在 `AnimalService` 的 `inject()` 中添加 `skipSelf`，注入器就不会在当前 `<app-child>` 的 `ElementInjector` 中查找 `AnimalService`。
相反，注入器会从 `<app-root>` 的 `ElementInjector` 开始查找。

```ts
@Component({
  selector: 'app-child',
  …
  viewProviders: [
    { provide: AnimalService, useValue: { emoji: '🐶' } },
  ],
})
```

在 `<app-child>` 中使用 `skipSelf` 时，逻辑树如下所示：

```html
<app-root @ApplicationConfig
          @Inject(AnimalService=>"🐳")>
  <#VIEW><!-- 搜索从此开始 -->
  <app-child>
    <#VIEW @Provide(AnimalService="🐶")
    @Inject(AnimalService, SkipSelf=>"🐳")>

    <!--添加 skipSelf -->

  </
  #VIEW>
  </app-child>
</#VIEW>
</app-root>
```

在 `<app-child>` 中使用 `skipSelf` 后，注入器会从 `<app-root>` 的 `ElementInjector` 开始搜索 `AnimalService`，并找到鲸鱼 🐳。

### `host` 和 `viewProviders` {#host-and-viewproviders}

如果你只在注入 `AnimalService` 时使用 `host`，结果将是小狗 <code>🐶</code>，因为注入器在 `<app-child>` 的 `<#VIEW>` 自身中就找到了 `AnimalService`。
`Child` 配置了 `viewProviders`，使小狗表情作为 `AnimalService` 的值被提供。
你也可以在 `inject()` 中看到 `host`：

```ts
@Component({
  selector: 'app-child',
  …
  viewProviders: [
    { provide: AnimalService, useValue: { emoji: '🐶' } },
  ]
})
export class Child {
  animal = inject(AnimalService, { host: true })
}
```

`host: true` 会让注入器一直查找，直到遇到 `<#VIEW>` 的边界为止。

```html
<app-root @ApplicationConfig
          @Inject(AnimalService=>"🐳")>
  <#VIEW>
  <app-child>
    <#VIEW @Provide(AnimalService="🐶")
    inject(AnimalService, {host: true}=>"🐶")> <!-- host 在此停止搜索 -->
  </
  #VIEW>
  </app-child>
</#VIEW>
</app-root>
```

在 `app.ts` 的 `@Component()` 元数据中添加一个 `viewProviders` 数组，其中包含第三种动物——刺猬 <code>🦔</code>：

```ts
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: [ './app.css' ],
  viewProviders: [
    { provide: AnimalService, useValue: { emoji: '🦔' } },
  ],
})
```

接下来，在 `child.ts` 中注入 `AnimalService` 的 `inject()` 里同时添加 `skipSelf` 和 `host`。
下面是 `animal` 属性初始化中的 `host` 和 `skipSelf`：

```ts
export class Child {
  animal = inject(AnimalService, {host: true, skipSelf: true});
}
```

<!-- TODO: This requires a rework. It seems not well explained what `viewProviders`/`injectors` is here
  and how `host` works.
 -->

当把 `host` 和 `skipSelf` 应用于位于 `providers` 数组中的 `FlowerService` 时，结果是 `null`，因为 `skipSelf` 从 `<app-child>` 注入器开始搜索，而 `host` 在 `<#VIEW>` 处停止搜索——那里并没有 `FlowerService`。
在逻辑树中可以看到，`FlowerService` 在 `<app-child>` 中可见，而不是在它的 `<#VIEW>` 中可见。

然而，在 `App` 的 `viewProviders` 数组中提供的 `AnimalService` 是可见的。

逻辑树的表示说明了其中的原因：

```html
<app-root @ApplicationConfig
          @Inject(AnimalService=>"🐳")>
  <#VIEW @Provide(AnimalService="🦔")
  @Inject(AnimalService, @Optional)=>"🦔">

  <!-- ^^skipSelf 从这里开始，host 在这里停止^^ -->
  <app-child>
    <#VIEW @Provide(AnimalService="🐶")
    inject(AnimalService, {skipSelf:true, host: true, optional: true})=>"🦔">
    <!-- 添加 skipSelf ^^-->
  </
  #VIEW>
  </app-child>
</#VIEW>
</app-root>
```

`skipSelf` 会让注入器从 `<app-root>` 而不是发起请求的 `<app-child>` 开始搜索 `AnimalService`，而 `host` 则会在 `<app-root>` 的 `<#VIEW>` 处停止搜索。
由于 `AnimalService` 是通过 `viewProviders` 数组提供的，注入器会在 `<#VIEW>` 中找到刺猬 <code>🦔</code>。

## 示例：`ElementInjector` 的使用场景 {#example-elementinjector-use-cases}

能够在不同层级配置一个或多个提供者，带来了许多有用的可能性。

### 场景：服务隔离 {#scenario-service-isolation}

出于架构上的考虑，你可能希望把对某个服务的访问限制在它所属的应用领域内。
例如，假设我们构建了一个 `VillainsList`，用于显示反派列表。
它从 `VillainsService` 获取这些反派。

如果你在根 `AppModule` 中提供 `VillainsService`，`VillainsService` 就会在应用的任何地方都可见。
如果你之后修改了 `VillainsService`，可能会破坏其他意外依赖了该服务的组件。

相反，你应该像下面这样在 `VillainsList` 的 `providers` 元数据中提供 `VillainsService`：

```ts
@Component({
  selector: 'app-villains-list',
  templateUrl: './villains-list.html',
  providers: [VillainsService],
})
export class VillainsList {}
```

只在 `VillainsList` 的元数据中提供 `VillainsService`、而不在其他地方提供，该服务就只能在 `VillainsList` 及其子组件树中使用。

对于 `VillainsList` 而言，`VillainsService` 是一个单例，因为它就是在那里声明的。
只要 `VillainsList` 没有被销毁，`VillainsService` 就始终是同一个实例；但如果存在多个 `VillainsList` 实例，那么每个 `VillainsList` 实例都会拥有自己的 `VillainsService` 实例。

### 场景：多个编辑会话 {#scenario-multiple-edit-sessions}

许多应用允许用户同时处理多个打开的任务。
例如，在一个报税应用中，报税员可能同时处理多份纳税申报表，在一天中不断地在它们之间切换。

为了演示这一场景，假设有一个显示超级英雄列表的 `HeroList`。

要打开某位英雄的纳税申报表，报税员需要点击英雄的名字，这会打开一个用于编辑该申报表的组件。
每份选中的英雄纳税申报表都在各自的组件中打开，并且可以同时打开多份申报表。

每个纳税申报表组件都具有以下特点：

- 拥有自己独立的纳税申报表编辑会话
- 修改一份纳税申报表时不会影响另一个组件中的申报表
- 能够保存或取消对其纳税申报表的修改

假设 `HeroTaxReturnEditor` 中包含管理和还原修改的逻辑。
对于一份英雄纳税申报表来说，这是一项简单直接的任务。
但在现实世界中，面对复杂的纳税申报数据模型，变更管理会变得很棘手。
你可以像本例这样，把这种管理工作委托给一个辅助服务。

`HeroTaxReturnService` 会缓存一份 `HeroTaxReturn`，跟踪对该申报表的修改，并能保存或还原它。
它还会委托给通过注入获得的应用级单例服务 `HeroService`。

```ts
import {inject, Service} from '@angular/core';
import {HeroTaxReturn} from './hero';
import {HeroesService} from './heroes.service';

@Service({autoProvided: false})
export class HeroTaxReturnService {
  private currentTaxReturn!: HeroTaxReturn;
  private originalTaxReturn!: HeroTaxReturn;

  private heroService = inject(HeroesService);

  set taxReturn(htr: HeroTaxReturn) {
    this.originalTaxReturn = htr;
    this.currentTaxReturn = htr.clone();
  }

  get taxReturn(): HeroTaxReturn {
    return this.currentTaxReturn;
  }

  restoreTaxReturn() {
    this.taxReturn = this.originalTaxReturn;
  }

  saveTaxReturn() {
    this.taxReturn = this.currentTaxReturn;
    this.heroService.saveTaxReturn(this.currentTaxReturn).subscribe();
  }
}
```

下面是使用了 `HeroTaxReturnService` 的 `HeroTaxReturnEditor`。

```ts
import {Component, effect, inject, input, output} from '@angular/core';
import {HeroTaxReturn} from './hero';
import {HeroTaxReturnService} from './hero-tax-return.service';

@Component({
  selector: 'app-hero-tax-return',
  templateUrl: './hero-tax-return.html',
  styleUrls: ['./hero-tax-return.css'],
  providers: [HeroTaxReturnService],
})
export class HeroTaxReturnEditor {
  message = '';

  close = output<void>();

  taxReturn = input.required<HeroTaxReturn>();

  private heroTaxReturnService = inject(HeroTaxReturnService);

  constructor() {
    effect(() => {
      this.heroTaxReturnService.taxReturn = this.taxReturn();
    });
  }

  onCanceled() {
    this.flashMessage('Canceled');
    this.heroTaxReturnService.restoreTaxReturn();
  }

  onClose() {
    this.close.emit();
  }

  onSaved() {
    this.flashMessage('Saved');
    this.heroTaxReturnService.saveTaxReturn();
  }

  flashMessage(msg: string) {
    this.message = msg;
    setTimeout(() => (this.message = ''), 500);
  }
}
```

*待编辑的纳税申报表*通过 `taxReturn` 信号（Signal）输入（Input）传入。
每当该输入发生变化时，一个副作用（effect）会用传入的申报表来初始化该组件自己的 `HeroTaxReturnService` 实例。
该服务的 getter 始终返回服务所认定的该英雄的当前状态。
组件还会请求该服务保存和还原这份纳税申报表。

如果该服务是一个应用级单例，这种做法就行不通了。
每个组件都会共享同一个服务实例，每个组件都会覆盖属于另一位英雄的纳税申报表。

为了防止这种情况，请使用组件元数据中的 `providers` 属性，配置 `HeroTaxReturnEditor` 的组件级注入器来提供该服务。

```ts
providers: [HeroTaxReturnService];
```

`HeroTaxReturnEditor` 拥有自己的 `HeroTaxReturnService` 提供者。
回想一下，每个组件*实例*都有自己的注入器。
在组件级别提供该服务，可以确保该组件的*每个*实例都获得一个私有的服务实例。这样就能确保不会有纳税申报表被覆盖。

::: tip 提示
该场景的其余代码依赖于其他 Angular 特性和技术，你可以在文档的其他地方了解它们。

:::

### 场景：专门化的提供者 {#scenario-specialized-providers}

在另一个层级再次提供某个服务的另一个原因，是为了在组件树的更深处用该服务的一个*更专门化*的实现来替换它。

例如，假设有一个 `Car` 组件，它包含轮胎服务信息，并依赖其他服务来提供关于这辆车的更多细节。

标记为 (A) 的根注入器为 `CarService` 和 `EngineService` 的细节使用*通用*提供者。

1. `Car` 组件 (A)。组件 (A) 显示一辆车的轮胎服务数据，并指定通用服务来提供关于这辆车的更多信息。

2. 子组件 (B)。组件 (B) 为 `CarService` 和 `EngineService` 定义了自己的*专门化*提供者，这些提供者具有适合组件 (B) 中具体情况的特殊能力。

3. 子组件 (C)，作为组件 (B) 的子组件。组件 (C) 为 `CarService` 定义了自己的、*更加专门化*的提供者。

```txt
graph TD;
subgraph COMPONENT_A[Component A]
subgraph COMPONENT_B[Component B]
COMPONENT_C[Component C]
end
end

style COMPONENT_A fill:#BDD7EE
style COMPONENT_B fill:#FFE699
style COMPONENT_C fill:#A9D18E,color:#000
classDef noShadow filter:none
class COMPONENT_A,COMPONENT_B,COMPONENT_C noShadow
```

在幕后，每个组件都会建立自己的注入器，其中包含为该组件自身定义的零个、一个或多个提供者。

当你在最深层的组件 (C) 中解析 `Car` 的实例时，它的注入器会产生：

- 由注入器 (C) 解析的 `Car` 实例
- 由注入器 (B) 解析的 `Engine`
- 由根注入器 (A) 解析的 `Tires`。

```txt
graph BT;

subgraph A[" "]
direction LR
RootInjector["(A) RootInjector"]
ServicesA["CarService, EngineService, TiresService"]
end

subgraph B[" "]
direction LR
ParentInjector["(B) ParentInjector"]
ServicesB["CarService2, EngineService2"]
end

subgraph C[" "]
direction LR
ChildInjector["(C) ChildInjector"]
ServicesC["CarService3"]
end

direction LR
car["(C) Car"]
engine["(B) Engine"]
tires["(A) Tires"]

direction BT
car-->ChildInjector
ChildInjector-->ParentInjector-->RootInjector

class car,engine,tires,RootInjector,ParentInjector,ChildInjector,ServicesA,ServicesB,ServicesC,A,B,C noShadow
style car fill:#A9D18E,color:#000
style ChildInjector fill:#A9D18E,color:#000
style engine fill:#FFE699,color:#000
style ParentInjector fill:#FFE699,color:#000
style tires fill:#BDD7EE,color:#000
style RootInjector fill:#BDD7EE,color:#000
```

## 关于依赖注入的更多内容 {#more-on-dependency-injection}

- [DI 提供者](/guide/di/defining-dependency-providers)

