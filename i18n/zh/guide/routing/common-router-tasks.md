# 其他常见路由任务

本指南介绍在应用中使用 Angular 路由器（Router）时的其他一些常见任务。

## 获取路由信息

当用户在应用中导航（navigation）时，你通常需要把信息从一个组件（component）传递给另一个组件。
例如，设想一个显示杂货购物清单的应用。
清单中的每一项都有唯一的 `id`。
要编辑某一项，用户会点击 Edit 按钮，打开一个 `EditGroceryItem` 组件。
你希望该组件能获取这一杂货项的 `id`，以便向用户显示正确的信息。

可以使用路由（route）把这类信息传递给应用中的组件。
为此，你需要在 `provideRouter` 中使用 `withComponentInputBinding` 特性，或者使用 `RouterModule.forRoot` 的 `bindToComponentInputs` 选项。

要从路由中获取信息：



### 1. 添加 `withComponentInputBinding`

在 `provideRouter` 方法中添加 `withComponentInputBinding` 特性。

```ts
providers: [provideRouter(appRoutes, withComponentInputBinding())];
```


### 2. 为组件添加 `input`

更新组件，添加一个与参数同名的 `input()` 属性。

```ts
id = input.required<string>();
hero = computed(() => this.service.getHero(this.id()));
```

### 3. 可选：使用默认值

启用 `withComponentInputBinding` 后，路由器会根据当前路由为所有输入（input）赋值。
如果没有与输入的键匹配的路由数据（例如缺少某个可选的查询参数），路由器会赋值为 `undefined`。
当某个输入有可能无法被路由匹配时，你应该在该 `input` 的类型中包含 `undefined`。

你可以通过输入的 `transform` 选项提供默认值，也可以用 `linkedSignal` 管理本地状态来提供默认值。

```ts
id = input.required({
  transform: (maybeUndefined: string | undefined) => maybeUndefined ?? '0',
});
// 或者
id = input<string | undefined>();
internalId = linkedSignal(() => this.id() ?? getDefaultId());
```



::: info 注意
你可以把所有以键值对形式存在的路由数据绑定到组件输入上：路由资源、静态或已解析的路由数据、路径参数、矩阵参数以及查询参数。

:::

### 输入绑定的优先级

当多个路由来源定义了相同的键时，路由器会按以下优先级顺序（从高到低）解决冲突：

1. **路由资源**：在路由的 `resources` 映射中定义的值。阻塞式资源绑定其解包后的值（`resource.value()`），而非阻塞式资源绑定 `Resource` 实例本身。
2. **路由数据和解析器**：在 `data` 中定义的静态数据，或通过 `resolve` 解析出的值。
3. **路径参数和矩阵参数**：来自 URL 路径的参数（如 `:id`）以及矩阵参数。
4. **查询参数**：来自查询字符串的参数（如 `?id=123`）。

例如，如果某个路由同时具有路径参数 `:id` 和查询参数 `?id=...`，那么绑定到组件 `id` 输入上的是路径参数的值。如果该路由还定义了名为 `id` 的资源，则资源的值优先于这两者。

### 禁用查询参数绑定

如果你单独管理查询参数，可以使用 `ComponentInputBindingOptions` 禁用查询参数绑定：

```ts
provideRouter(appRoutes, withComponentInputBinding({queryParams: false}));
```

### 配置路由数据中不存在的输入的行为

默认情况下，如果某个输入在导航期间不存在于路由数据中，路由器会把它设置为 `undefined`。这可以确保不会保留过期的数据。

如果你希望对于当前组件实例而言*从未*出现在路由数据中的输入，不要被设置为 `undefined`，可以把 `unmatchedInputBehavior` 选项设置为 `'undefinedIfStale'`：

```ts
provideRouter(appRoutes, withComponentInputBinding({unmatchedInputBehavior: 'undefinedIfStale'}));
```

当你把 `unmatchedInputBehavior: 'undefinedIfStale'` 与 `queryParams: false` 结合使用时，除非路由器显式提供了值，否则输入会保留其初始值。矩阵参数是个例外：如果某个矩阵参数在一次导航中提供了、在后续导航中又被移除，路由器会把该输入设置为 `undefined`，以免保留过期的数据。

```ts
provideRouter(
  appRoutes,
  withComponentInputBinding({
    queryParams: false,
    unmatchedInputBehavior: 'undefinedIfStale',
  }),
);
```

### 继承父路由数据

默认情况下，子路由会继承父路由的参数和数据（相当于 `paramsInheritanceStrategy: 'always'`）。这意味着你可以在子组件中直接访问父路由的信息。

如果需要恢复旧的行为，即参数只从空路径路由继承，可以把 `paramsInheritanceStrategy` 设置为 `'emptyOnly'`：

```ts
provideRouter(routes, withRouterConfig({paramsInheritanceStrategy: 'emptyOnly'}));
```

关于其他可用设置的详细信息，请参阅[路由器配置选项](/guide/routing/customizing-route-behavior#router-configuration-options)。

## 显示 404 页面

要显示 404 页面，请设置一个[通配符路由](/guide/routing/define-routes#wildcards)，并把其 `component` 属性设置为你想用作 404 页面的组件，如下所示：

```ts
const routes: Routes = [
  {path: 'first-component', component: First},
  {path: 'second-component', component: Second},
  {path: '**', component: PageNotFound}, // 用于 404 页面的通配符路由
];
```

最后一个 `path` 为 `**` 的路由就是通配符路由。
如果请求的 URL 与列表中前面的任何路径都不匹配，路由器就会选择这个路由，并把用户带到 `PageNotFound`。

## 链接参数数组

链接参数数组包含路由器导航所需的以下要素：

- 指向目标组件的路由路径
- 放入路由 URL 中的必需和可选路由参数

像下面这样把 `RouterLink` 指令（directive）绑定到这样的数组上：

```html
<a [routerLink]="['/heroes']">Heroes</a>
```

指定路由参数时，可以使用下面这样的二元素数组：

```html
<a [routerLink]="['/hero', hero.id]">
  <span class="badge">{{ hero.id }}</span
  >{{ hero.name }}
</a>
```

在对象中提供可选的路由参数，例如 `{ foo: 'foo' }`：

```html
<a [routerLink]="['/crisis-center', {foo: 'foo'}]">Crisis Center</a>
```

这种语法传递的是矩阵参数，即与特定 URL 段关联的可选参数。详细了解[矩阵参数](/guide/routing/read-route-state#matrix-parameters)。

这三个示例满足了只有一级路由的应用的需求。
不过，如果有子路由器（例如危机中心中的那样），就会出现新的链接数组形式。

下面这个最简的 `RouterLink` 示例基于为危机中心指定的默认子路由构建。

```html
<a [routerLink]="['/crisis-center']">Crisis Center</a>
```

请注意以下几点：

- 数组中的第一项标识父路由（`/crisis-center`）
- 这个父路由没有参数
- 子路由没有默认值，因此你需要选择一个
- 你要导航到的是 `CrisisList`，它的路由路径是 `/`，但不需要显式添加这个斜杠

再看下面这个路由器链接，它从应用的根导航到 Dragon Crisis：

```html
<a [routerLink]="['/crisis-center', 1]">Dragon Crisis</a>
```

- 数组中的第一项标识父路由（`/crisis-center`）
- 这个父路由没有参数
- 第二项标识关于某个特定危机的详情子路由（`/:id`）
- 详情子路由需要一个 `id` 路由参数
- 你把 Dragon Crisis 的 `id` 作为数组的第二项（`1`）添加进去
- 最终的路径是 `/crisis-center/1`

你也可以把 `App` 模板（template）重新定义为只包含危机中心的路由：

```ts
@Component({
  template: `
    <h1 class="title">Angular Router</h1>
    <nav>
      <a [routerLink]="['/crisis-center']">Crisis Center</a>
      <a [routerLink]="['/crisis-center/1', {foo: 'foo'}]">Dragon Crisis</a>
      <a [routerLink]="['/crisis-center/2']">Shark Crisis</a>
    </nav>
    <router-outlet />
  `,
})
export class App {}
```

总之，你可以编写具有一级、二级甚至更多级路由的应用。
链接参数数组足够灵活，可以表示任意深度的路由，以及任何合法的路由路径序列、（必需的）路由器参数和（可选的）路由参数对象。

## `LocationStrategy` 与浏览器 URL 风格

当路由器导航到新的组件视图时，它会用该视图的 URL 更新浏览器的地址和历史记录。

现代 HTML5 浏览器支持 [history.pushState](https://developer.mozilla.org/docs/Web/API/History_API/Working_with_the_History_API#adding_and_modifying_history_entries 'HTML5 browser history push-state')，这种技术可以在不触发服务器页面请求的情况下改变浏览器的地址和历史记录。
路由器可以组合出一个“自然”的 URL，它与需要加载页面的 URL 看起来没有任何区别。

下面是采用这种“HTML5 pushState”风格的危机中心 URL：

```text
localhost:3002/crisis-center
```

在旧版浏览器中，地址 URL 发生变化时会向服务器发送页面请求，除非变化发生在“#”（称为“hash”）之后。
路由器可以利用这个例外，使用 hash 来组合应用内的路由 URL。
下面是一个路由到危机中心的“hash URL”。

```text
localhost:3002/src/#/crisis-center
```

路由器通过两个 `LocationStrategy` 提供者（provider）支持这两种风格：

| 提供者                 | 说明                                 |
| :--------------------- | :----------------------------------- |
| `PathLocationStrategy` | 默认的“HTML5 pushState”风格。        |
| `HashLocationStrategy` | “hash URL”风格。                     |

`RouterModule.forRoot()` 函数会把 `LocationStrategy` 设置为 `PathLocationStrategy`，使其成为默认策略。
你也可以在引导过程中通过覆盖配置切换到 `HashLocationStrategy`。

::: tip 提示
关于提供者和引导过程的更多信息，请参阅[依赖注入（dependency injection）](/guide/di/defining-dependency-providers)。

:::
