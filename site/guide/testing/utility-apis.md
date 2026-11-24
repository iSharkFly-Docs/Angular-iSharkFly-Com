# 测试工具 API {#testing-utility-apis}

::: info 注意
本指南正在针对 Vitest 进行更新，目前部分工具 API 的说明和示例仍基于 Karma/Jasmine。我们正在积极补充 Vitest 的对应写法，并在适用之处提供更新后的指导。

:::

本页介绍最有用的 Angular 测试特性。

Angular 测试工具包括 `TestBed`、`ComponentFixture`，以及少量用于控制测试环境的函数。
[`TestBed`](#testbed-class-summary) 和 [`ComponentFixture`](#the-componentfixture) 这两个类会分别单独介绍。

下面按可能的实用程度，汇总了这些独立函数：

| 函数 | 详情 |
| :----------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`inject`] | 从当前 `TestBed` 的注入器（Injector）中把一个或多个服务（Service）注入到测试函数中。它无法注入由组件（Component）自身提供的服务。参见关于 [debugElement.injector](/guide/testing/components-scenarios#get-injected-services) 的讨论。 |
| `getTestBed` | 获取 `TestBed` 的当前实例。通常不需要它，因为 `TestBed` 类的静态方法一般就够用了。`TestBed` 实例还暴露了少数几个很少用到、且没有对应静态方法的成员。 |

如需处理复杂的异步场景，或测试基于 Zone.js 的旧版应用，请参阅 [Zone.js 测试工具函数](/guide/testing/zone-js-testing-utilities)指南。

## `TestBed` 类概览 {#testbed-class-summary}

`TestBed` 类是最主要的 Angular 测试工具之一。
它的 API 相当庞大，在你一点点摸索熟悉之前，可能会让人有些应接不暇。
建议先阅读本指南的前面部分，掌握基础知识，再尝试消化完整的 API。

传给 `configureTestingModule` 的模块定义是 `@NgModule` 元数据属性的一个子集。

```ts
type TestModuleMetadata = {
  providers?: any[];
  declarations?: any[];
  imports?: any[];
  schemas?: Array<SchemaMetadata | any[]>;
};
```

每个覆盖（override）方法都接受一个 `MetadataOverride<T>`，其中 `T` 是适用于该方法的元数据类型，也就是 `@NgModule`、`@Component`、`@Directive` 或 `@Pipe` 的参数。

```ts
type MetadataOverride<T> = {
  add?: Partial<T>;
  remove?: Partial<T>;
  set?: Partial<T>;
};
```

`TestBed` 的 API 由一组静态类方法组成，它们会更新或引用 `TestBed` 的一个*全局*实例。

在内部，所有静态方法都对应着当前运行时 `TestBed` 实例上的方法，这个实例也可以通过 `getTestBed()` 函数获取。

请在 `beforeEach()` *内部*调用 `TestBed` 的方法，以确保每个测试开始前都是全新的状态。

下面按可能的实用程度列出最重要的静态方法。

| 方法 | 详情 |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `configureTestingModule` | 测试垫片（shim）会建立[初始测试环境](/guide/testing)和一个默认的测试模块。默认测试模块中配置了基本的可声明对象，以及每个测试者都需要的一些 Angular 服务替身。<br /> 调用 `configureTestingModule` 可以为特定的一组测试细化测试模块的配置，即添加或移除导入、声明（组件、指令和管道）以及提供者（Provider）。 |
| `compileComponents` | 在完成测试模块的配置之后，异步编译该测试模块。如果测试模块中*任何*组件带有异步加载的资源（例如 @defer 块），你就**必须**调用这个方法。 |
| `createComponent<T>` | 基于当前 `TestBed` 的配置，创建一个类型为 `T` 的组件实例。调用 `createComponent` 之后，`TestBed` 的配置在当前测试用例（spec）期间会被冻结。 |
| `overrideComponent` | 替换指定组件类的元数据，该组件类可能深嵌在某个内部模块中。 |
| `overrideDirective` | 替换指定指令（Directive）类的元数据，该指令类可能深嵌在某个内部模块中。 |
| `overridePipe` | 替换指定管道（Pipe）类的元数据，该管道类可能深嵌在某个内部模块中。 |
| `overrideModule` | 替换指定 `NgModule` 的元数据。别忘了模块可以导入其他模块。`overrideModule` 方法可以深入当前测试模块内部，修改其中某个内部模块。 |
| `inject` | 从当前 `TestBed` 注入器中获取一个服务。`inject` 函数通常足以满足这个需求，但如果无法提供该服务，`inject` 会抛出错误。<br /> 如果这个服务是可选的呢？<br /> `TestBed.inject()` 方法接受一个可选的第二个参数，即 Angular 找不到提供者时要返回的对象（本例中为 `null`）：`expect(TestBed.inject(NotProvided, null)).toBeNull();`。调用 `TestBed.inject` 之后，`TestBed` 的配置在当前测试用例期间会被冻结。 |
| `initTestEnvironment` | 为整个测试运行初始化测试环境。<br /> 测试垫片会替你调用它，所以你很少有理由自己调用。<br /> 这个方法*只能调用一次*。如果要在测试运行中途更改这个默认值，请先调用 `resetTestEnvironment`。<br /> 需要指定一个默认的 Angular 测试模块和一个 `PlatformRef`。非浏览器平台的替代方案以 `@angular/platform-<platform_name>/testing` 的通用形式提供。 |
| `resetTestEnvironment` | 重置初始测试环境，包括默认的测试模块。 |

`TestBed` 有少数几个实例方法没有对应的 `TestBed` 静态*类*方法。
这些方法很少用到。

## `ComponentFixture` {#the-componentfixture}

`TestBed.createComponent<T>` 会创建组件 `T` 的一个实例，并为该组件返回一个强类型的 `ComponentFixture`。

通过 `ComponentFixture` 的属性和方法，可以访问组件本身、它的 DOM 表示，以及它所处 Angular 环境的各个方面。

### `ComponentFixture` 的属性 {#componentfixture-properties}

下面按可能的实用程度列出对测试者最重要的属性。

| 属性 | 详情 |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `componentInstance` | 由 `TestBed.createComponent` 创建的组件类实例。 |
| `debugElement` | 与组件根元素关联的 `DebugElement`。<br /> 在测试和调试过程中，`debugElement` 能让你深入了解组件及其 DOM 元素。它是对测试者至关重要的属性。其中最值得关注的成员会在[下文](#debugelement)介绍。 |
| `nativeElement` | 组件根部的原生 DOM 元素。 |
| `changeDetectorRef` | 组件宿主视图的 `ChangeDetectorRef`，而不是组件自身的。参见[在 `TestBed` 中使用无 Zone（zoneless）](/guide/zoneless#using-zoneless-in-testbed)。 |

### `ComponentFixture` 的方法 {#componentfixture-methods}

这些*测试夹具*（fixture）方法会让 Angular 在组件树上执行特定的任务。
调用这些方法，可以触发 Angular 对模拟用户操作的响应行为。

下面是对测试者最有用的方法。

| 方法 | 详情 |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `detectChanges` | 为组件触发一轮变更检测（Change Detection）。<br /> 调用它来初始化组件（它会调用 `ngOnInit`），以及在测试代码修改了组件的数据绑定属性值之后调用。Angular 察觉不到你修改了 `personComponent.name`，在你调用 `detectChanges` 之前，它不会更新 `name` 绑定。<br /> 之后它还会运行 `checkNoChanges` 来确认没有循环更新，除非以 `detectChanges(false)` 的方式调用。 |
| `autoDetectChanges` | 如果希望测试夹具自动检测变更，请将它设为 `true`。<br /> 当自动检测为 `true` 时，测试夹具会在创建组件后立即调用 `detectChanges`，然后监听相关的 zone 事件并相应地调用 `detectChanges`。当测试代码直接修改组件的属性值时，你可能仍然需要调用 `fixture.detectChanges` 来触发数据绑定的更新。<br /> 在无 Zone 变更检测（`TestBed` 的默认方式）下默认值为 `true`，在基于 Zone 的变更检测下默认值为 `false`。 |
| `checkNoChanges` | 执行一次变更检测，确保没有待处理的变更。如果有，就抛出异常。 |
| `isStable` | 如果测试夹具当前处于*稳定*状态，则返回 `true`；如果还有未完成的异步任务，则返回 `false`。 |
| `whenStable` | 返回一个在测试夹具稳定时解析的 Promise。<br /> 若要在异步活动或异步变更检测完成后继续测试，请挂接这个 Promise。参见 [whenStable](/guide/testing/components-scenarios#whenstable)。 |
| `destroy` | 触发组件的销毁。 |

#### `DebugElement` {#debugelement}

`DebugElement` 能让你深入了解组件的 DOM 表示。

从 `fixture.debugElement` 返回的测试根组件的 `DebugElement` 出发，你可以遍历（和查询）测试夹具的整个元素子树和组件子树。

下面大致按实用程度列出对测试者最有用的 `DebugElement` 成员：

| 成员 | 详情 |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nativeElement` | 浏览器中对应的 DOM 元素 |
| `query` | 调用 `query(predicate: Predicate<DebugElement>)` 会返回子树中任意深度上第一个与谓词匹配的 `DebugElement`。 |
| `queryAll` | 调用 `queryAll(predicate: Predicate<DebugElement>)` 会返回子树中任意深度上所有与谓词匹配的 `DebugElements`。 |
| `injector` | 宿主的依赖注入器。例如，根元素的组件实例注入器。 |
| `componentInstance` | 该元素自身的组件实例（如果有的话）。 |
| `context` | 一个为该元素提供父级上下文的对象，通常是管理该元素的某个祖先组件实例。<br /> 当元素在 `@for` 块中重复渲染时，上下文是一个 `RepeaterContext`，其 `$implicit` 属性就是当前行实例的值。例如 `@for(hero of heroes; ...)` 中的 `hero`。 |
| `children` | 直接的 `DebugElement` 子元素。通过逐层向下遍历 `children` 来遍历整棵树。`DebugElement` 还有 `childNodes`，它是一个 `DebugNode` 对象列表。`DebugElement` 派生自 `DebugNode`，而且节点数通常比元素多。测试者一般可以忽略普通节点。 |
| `parent` | 父级 `DebugElement`。如果这是根元素，则为 null。 |
| `name` | 元素的标签名（如果它是元素的话）。 |
| `triggerEventHandler` | 如果元素的 `listeners` 集合中有对应的监听器，就按名称触发该事件。第二个参数是处理器所期望的*事件对象*。<br /> 如果该事件没有监听器，或者存在其他问题，可以考虑调用 `nativeElement.dispatchEvent(eventObject)`。 |
| `listeners` | 附加到组件的 `@Output` 属性和/或元素事件属性上的回调。 |
| `providerTokens` | 该组件注入器的查找令牌。包括组件本身，以及组件在其 `providers` 元数据中列出的令牌。 |
| `references` | 与模板（Template）局部变量（例如 `#foo`）关联的对象字典，以局部变量名为键。 |

`DebugElement.query(predicate)` 和 `DebugElement.queryAll(predicate)` 方法接受一个谓词，用于在源元素的子树中筛选匹配的 `DebugElement`。

谓词可以是任何接受一个 `DebugElement` 并返回*真值*的方法。
下面的例子会找出所有引用了名为 "content" 的模板局部变量的 `DebugElements`：

```ts
// 筛选带有 #content 引用的 DebugElements
const contentRefs = el.queryAll((de) => de.references['content']);
```

Angular 的 `By` 类提供了三个用于常见谓词的静态方法：

| 静态方法 | 详情 |
| :------------------------ | :------------------------------------------------------------------------- |
| `By.all` | 返回所有元素 |
| `By.css(selector)` | 返回与 CSS 选择器（Selector）匹配的元素 |
| `By.directive(directive)` | 返回 Angular 匹配到该指令类实例的元素 |

```ts
// 可以通过 CSS 选择器或指令来查找 DebugElement
const h2 = fixture.debugElement.query(By.css('h2'));
const directive = fixture.debugElement.query(By.directive(Highlight));
```
