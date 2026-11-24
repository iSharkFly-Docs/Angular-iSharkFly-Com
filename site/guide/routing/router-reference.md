# 路由器参考 {#router-reference}

以下各节重点介绍一些核心的路由器（router）概念和术语。

## 路由器事件 {#router-events}

在每次导航（navigation）期间，`Router` 会通过 `Router.events` 属性发出导航事件。
下表列出了这些事件。

| 路由器事件                                              | 详情                                                                                                                                                                |
| :-------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`NavigationStart`](https://angular.dev/api/router/NavigationStart)           | 在导航开始时触发。                                                                                                                                      |
| [`RouteConfigLoadStart`](https://angular.dev/api/router/RouteConfigLoadStart) | 在 `Router` 延迟加载（lazy loading）路由配置之前触发。                                                                                                        |
| [`RouteConfigLoadEnd`](https://angular.dev/api/router/RouteConfigLoadEnd)     | 在某个路由完成延迟加载之后触发。                                                                                                                          |
| [`RoutesRecognized`](https://angular.dev/api/router/RoutesRecognized)         | 在路由器解析 URL 并识别出路由时触发。                                                                                                |
| [`GuardsCheckStart`](https://angular.dev/api/router/GuardsCheckStart)         | 在路由器开始路由的守卫阶段时触发。                                                                                                          |
| [`ChildActivationStart`](https://angular.dev/api/router/ChildActivationStart) | 在路由器开始激活某个路由的子路由时触发。                                                                                                        |
| [`ActivationStart`](https://angular.dev/api/router/ActivationStart)           | 在路由器开始激活某个路由时触发。                                                                                                                   |
| [`GuardsCheckEnd`](https://angular.dev/api/router/GuardsCheckEnd)             | 在路由器成功完成路由的守卫阶段时触发。                                                                                           |
| [`ResolveStart`](https://angular.dev/api/router/ResolveStart)                 | 在路由器开始路由的解析阶段时触发。                                                                                                         |
| [`ResolveEnd`](https://angular.dev/api/router/ResolveEnd)                     | 在路由器成功完成路由的解析阶段时触发。                                                                                          |
| [`ChildActivationEnd`](https://angular.dev/api/router/ChildActivationEnd)     | 在路由器完成激活某个路由的子路由时触发。                                                                                                      |
| [`ActivationEnd`](https://angular.dev/api/router/ActivationEnd)               | 在路由器完成激活某个路由时触发。                                                                                                                 |
| [`NavigationEnd`](https://angular.dev/api/router/NavigationEnd)               | 在导航成功结束时触发。                                                                                                                           |
| [`NavigationCancel`](https://angular.dev/api/router/NavigationCancel)         | 在导航被取消时触发。当路由守卫（route guard）在导航期间返回 false，或者通过返回 `UrlTree` 或 `RedirectCommand` 进行重定向时，就可能发生这种情况。 |
| [`NavigationError`](https://angular.dev/api/router/NavigationError)           | 在导航因意外错误而失败时触发。                                                                                                            |
| [`Scroll`](https://angular.dev/api/router/Scroll)                             | 表示一个滚动事件。                                                                                                                                          |

启用 `withDebugTracing` 特性后，Angular 会把这些事件记录到控制台。

## 路由器术语 {#router-terminology}

以下是 `Router` 的关键术语及其含义：

| 路由器部件           | 详情                                                                                                                                                                                                                                   |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Router`              | 为当前激活的 URL 显示应用组件（component），并管理从一个组件到下一个组件的导航。                                                                                                                                 |
| `provideRouter`       | 提供在应用视图之间导航所需的服务提供者（provider）。                                                                                                                                                        |
| `RouterModule`        | 一个独立的 NgModule，提供在应用视图之间导航所需的服务提供者和指令（directive）。                                                                                                                |
| `Routes`              | 定义一个路由数组，其中每个路由都把一个 URL 路径映射到一个组件。                                                                                                                                                                       |
| `Route`               | 定义路由器应如何根据 URL 模式导航到某个组件。路由可以包含路径、组件、子路由、守卫、解析器（resolver）和资源（Resource）。                                                                       |
| `RouterOutlet`        | 标记路由器在何处显示视图的指令（`<router-outlet>`）。                                                                                                                                                          |
| `RouterLink`          | 用于把可点击的 HTML 元素绑定到某个路由的指令。点击带有 `routerLink` 指令且该指令绑定到*字符串*或*链接参数数组*的元素时，会触发导航。                                           |
| `RouterLinkActive`    | 当元素上或元素内部关联的 `routerLink` 变为激活/非激活状态时，用于在 HTML 元素上添加/移除 CSS 类的指令。它还可以为激活的链接设置 `aria-current`，以获得更好的无障碍性。 |
| `ActivatedRoute`      | 提供给每个路由组件的服务（service），包含路由特有的信息，例如路由参数、静态数据、解析数据、路由资源、全局查询参数和全局片段。                        |
| `RouterState`         | 路由器的当前状态，包括当前已激活路由组成的树，以及用于遍历该路由树的便捷方法。                                                                                       |
| 链接参数数组 | 路由器将其解释为路由指令的数组。你可以把这个数组绑定到 `RouterLink`，或者将其作为参数传给 `Router.navigate` 方法。                                                                 |
| 路由组件     | 带有 `RouterOutlet` 的 Angular 组件，它会根据路由器的导航显示视图。                                                                                                                                               |

## `<base href>`

路由器使用浏览器的 [history.pushState](https://developer.mozilla.org/docs/Web/API/History_API/Working_with_the_History_API#adding_and_modifying_history_entries 'HTML5 browser history push-state') 进行导航。
`pushState` 让你可以自定义应用内的 URL 路径，例如 `localhost:4200/crisis-center`。
应用内的 URL 可以与服务器 URL 毫无区别。

现代 HTML5 浏览器最先支持 `pushState`，这也是许多人把这类 URL 称为“HTML5 风格”URL 的原因。

::: tip 提示
HTML5 风格的导航是路由器的默认方式。
在 [LocationStrategy 与浏览器 URL 风格](/guide/routing/common-router-tasks#locationstrategy-and-browser-url-styles)一节中，你可以了解为什么 HTML5 风格更可取、如何调整其行为，以及在必要时如何切换到较老的 hash（`#`）风格。

:::

要让 `pushState` 路由正常工作，你必须在应用的 `index.html` 中添加一个 [`<base href>` 元素](https://developer.mozilla.org/docs/Web/HTML/Element/base 'base href')。
浏览器在引用 CSS 文件、脚本和图片时，会使用 `<base href>` 的值作为相对 URL 的前缀。

请把 `<base>` 元素添加在 `<head>` 标签之后。
如果 `app` 文件夹是应用的根目录（就像本应用一样），请在 `index.html` 中按如下所示设置 `href` 值。

```html
<base href="/" />
```

### HTML5 URL 与 `<base href>` {#html5-urls-and-the}

接下来的指导原则会提到 URL 的不同部分。
下图概括了这些部分分别指什么：

```text
foo://example.com:8042/over/there?name=ferret#nose
\_/   \______________/\_________/ \_________/ \__/
 |           |            |            |        |
scheme    authority      path        query   fragment
```

虽然路由器默认使用 [HTML5 pushState](https://developer.mozilla.org/docs/Web/API/History_API#Adding_and_modifying_history_entries 'Browser history push-state') 风格，但你必须通过 `<base href>` 来配置该策略。

配置该策略的首选方式，是在 `index.html` 的 `<head>` 中添加一个 [`<base href>` 元素](https://developer.mozilla.org/docs/Web/HTML/Element/base 'base href')标签。

```html
<base href="/" />
```

如果没有这个标签，在“深度链接”进入应用时，浏览器可能无法加载资源（图片、CSS、脚本）。

有些开发者可能无法添加 `<base>` 元素，也许是因为他们无权访问 `<head>` 或 `index.html`。

这些开发者仍然可以通过以下两个步骤使用 HTML5 URL：

1. 为路由器提供一个合适的 `APP_BASE_HREF` 值。
1. 对所有 Web 资源（CSS、图片、脚本和模板 HTML 文件）使用根 URL（带有 `authority` 的 URL）。
   - `<base href>` 的 `path` 应以“/”结尾，因为浏览器会忽略 `path` 中最右侧“`/`”之后的字符
   - 如果 `<base href>` 包含 `query` 部分，那么只有当页面中某个链接的 `path` 为空且没有 `query` 时，才会使用这个 `query`。
     这意味着只有在使用 `HashLocationStrategy` 时，才会包含 `<base href>` 中的 `query`。

   - 如果页面中的某个链接是根 URL（带有 `authority`），就不会使用 `<base href>`。
     因此，带有 authority 的 `APP_BASE_HREF` 会让 Angular 创建的所有链接都忽略 `<base href>` 的值。

   - `<base href>` 中的片段（fragment）*永远*不会被保留

关于如何使用 `<base href>` 构造目标 URI 的更完整信息，请参阅 [RFC](https://tools.ietf.org/html/rfc3986#section-5.2.2) 中关于引用转换的章节。

### `HashLocationStrategy` {#hashlocationstrategy}

要使用 `HashLocationStrategy`，请在 `AppModule` 中把 `useHash: true` 放在一个对象里，作为 `RouterModule.forRoot()` 的第二个参数提供。

```ts
providers: [provideRouter(appRoutes, withHashLocation())];
```

使用 `RouterModule.forRoot` 时，可以在第二个参数中通过 `useHash: true` 进行配置：`RouterModule.forRoot(routes, {useHash: true})`。
