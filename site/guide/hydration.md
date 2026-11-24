# 水合 {#hydration}

## 什么是水合 {#what-is-hydration}

水合（hydration）是在客户端恢复服务端渲染（SSR）应用的过程。这包括复用服务端渲染的 DOM 结构、保留应用状态、传输服务端已经获取的应用数据，以及其他一些过程。

## 为什么水合很重要？ {#why-is-hydration-important}

水合通过避免重新创建 DOM 节点的额外工作来提升应用性能。Angular 会尝试在运行时把现有的 DOM 元素与应用结构进行匹配，并尽可能复用 DOM 节点。这带来的性能提升可以通过 [Core Web Vitals (CWV)](https://web.dev/learn-core-web-vitals/) 统计数据来衡量，例如降低首次输入延迟（[FID](https://web.dev/fid/)）和最大内容绘制（[LCP](https://web.dev/lcp/)），以及累积布局偏移（[CLS](https://web.dev/cls/)）。改善这些指标也会影响 SEO 表现等方面。

如果没有启用水合，服务端渲染的 Angular 应用会销毁并重新渲染应用的 DOM，这可能导致明显的 UI 闪烁。这种重新渲染会对 [Core Web Vitals](https://web.dev/learn-core-web-vitals/)（例如 [LCP](https://web.dev/lcp/)）产生负面影响，并造成布局偏移。启用水合后，现有的 DOM 可以被复用，从而避免闪烁。

## 如何在 Angular 中启用水合 {#how-do-you-enable-hydration-in-angular}

只有服务端渲染（SSR）的应用才能启用水合。请先按照 [Angular SSR 指南](/guide/ssr)启用服务端渲染。

### 使用 Angular CLI {#using-angular-cli}

如果你使用 Angular CLI 启用了 SSR（无论是在创建应用时启用，还是之后通过 `ng add @angular/ssr` 启用），那么启用水合的代码应该已经包含在你的应用中了。

### 手动设置 {#manual-setup}

如果你使用的是自定义设置，并且没有通过 Angular CLI 启用 SSR，你可以手动启用水合：打开应用的主组件（component）或模块，从 `@angular/platform-browser` 导入 `provideClientHydration`，然后把这个提供者（provider）添加到应用启动时的提供者列表中。

```ts
import {
  bootstrapApplication,
  provideClientHydration,
} from '@angular/platform-browser';
...

bootstrapApplication(App, {
  providers: [provideClientHydration()]
});
```

或者，如果你使用的是 NgModule，则需要把 `provideClientHydration` 添加到根应用模块的提供者列表中。

```ts
import {provideClientHydration} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

@NgModule({
  declarations: [App],
  exports: [App],
  bootstrap: [App],
  providers: [provideClientHydration()],
})
export class AppModule {}
```

::: warning 重要
请确保 `provideClientHydration()` 调用也包含在用于在**服务端**启动应用的提供者集合中。在使用默认项目结构（由 `ng new` 命令生成）的应用中，只需把该调用添加到根 `AppModule` 中即可，因为服务端模块会导入这个模块。如果你使用的是自定义设置，请把 `provideClientHydration()` 调用添加到服务端启动配置的提供者列表中。

:::

### 验证水合已启用 {#verify-that-hydration-is-enabled}

配置好水合并启动服务器后，在浏览器中加载你的应用。

::: tip 提示
在水合完全生效之前，你可能需要修复直接操作 DOM 的地方，可以改用 Angular 的构造，或者使用 `ngSkipHydration`。详情请参阅[约束](#constraints)、[直接操作 DOM](#direct-dom-manipulation)以及[如何跳过特定组件的水合](#how-to-skip-hydration-for-particular-components)。

:::

在开发模式下运行应用时，你可以打开浏览器的开发者工具并查看控制台，以确认水合已启用。你应该会看到一条包含水合相关统计信息的消息，例如已水合的组件和节点数量。Angular 会基于页面上渲染的所有组件（包括来自第三方库的组件）来计算这些统计信息。

你还可以使用 [Angular DevTools 浏览器扩展](/tools/devtools)查看页面上各组件的水合状态。Angular DevTools 还允许你启用一个覆盖层，用来标示页面中哪些部分已经水合。如果出现水合不匹配错误，DevTools 也会高亮显示导致该错误的组件。

## 捕获和重放事件 {#capturing-and-replaying-events}

当应用在服务端渲染时，生成的 HTML 一加载完，页面就会在浏览器中显示出来。用户可能会认为自己已经可以与页面交互，但在水合完成之前，事件监听器（event listener）并不会被附加。事件重放（Event Replay）功能会捕获水合之前发生的所有事件，并在水合完成后重放这些事件。

事件重放会随[增量水合](/guide/incremental-hydration)一起启用。如果你通过 `withNoIncrementalHydration()` 禁用了增量水合，仍然可以使用 `withEventReplay()` 函数启用事件重放：

```ts
import {
  provideClientHydration,
  withEventReplay,
  withNoIncrementalHydration,
  bootstrapApplication,
} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [provideClientHydration(withNoIncrementalHydration(), withEventReplay())],
});
```

### 事件重放的工作原理 {#how-event-replay-works}

事件重放是一项改善用户体验的功能，它会捕获在水合过程完成之前触发的用户事件，然后重放这些事件，确保不会丢失任何交互。

事件重放分为三个主要阶段：

- **捕获用户交互**<br>
  在**水合**之前，事件重放会捕获并存储用户可能执行的所有交互，例如点击和其他浏览器原生事件。

- **存储事件**<br>
  **Event Contract** 会把上一步记录的所有交互保存在内存中，确保它们不会丢失，以便之后重放。

- **重新触发事件**<br>
  **水合**完成后，Angular 会重新调用所捕获的事件。

事件重放支持*浏览器原生事件*，例如 `click`、`mouseover` 和 `focusin`。如果你想进一步了解为事件重放提供支持的库 JSAction，可以阅读[它的 readme](https://github.com/angular/angular/tree/main/packages/core/primitives/event-dispatch#readme)。

此功能可确保一致的用户体验，防止用户在水合之前执行的操作被忽略。

## 约束 {#constraints}

水合会给你的应用带来一些未启用水合时不存在的约束。你的应用在服务端和客户端必须生成相同的 DOM 结构。水合过程要求两端的 DOM 树结构相同，这也包括 Angular 在服务端渲染期间生成的空白字符和注释节点。这些空白字符和节点必须存在于服务端渲染过程生成的 HTML 中。

::: warning 重要
服务端渲染操作生成的 HTML 在服务端和客户端之间**不得**被修改。

:::

如果服务端和客户端的 DOM 树结构不匹配，水合过程在尝试把预期的结构与 DOM 中实际存在的结构进行匹配时就会遇到问题。使用原生 DOM API 直接操作 DOM 的组件是最常见的罪魁祸首。

### 直接操作 DOM {#direct-dom-manipulation}

如果你的组件使用原生 DOM API 操作 DOM，或者使用了 `innerHTML` 或 `outerHTML`，水合过程就会遇到错误。DOM 操作会导致问题的具体情形包括：访问 `document`、查询特定元素，以及使用 `appendChild` 注入额外的节点。分离 DOM 节点并把它们移动到其他位置同样会导致错误。

这是因为 Angular 并不知道这些 DOM 变化，无法在水合过程中处理它们。Angular 期望的是某种结构，但在尝试水合时却遇到了不同的结构。这种不匹配会导致水合失败，并抛出 DOM 不匹配错误（[见下文](#errors)）。

最好重构你的组件，避免这类 DOM 操作。如果可以的话，尽量使用 Angular API 来完成这些工作。如果无法重构这种行为，请先使用 `ngSkipHydration` attribute（[见下文说明](#how-to-skip-hydration-for-particular-components)），直到你能把它重构为对水合友好的方案。

### 有效的 HTML 结构 {#valid-html-structure}

在某些情况下，如果组件模板（template）的 HTML 结构无效，可能会在水合期间导致 DOM 不匹配错误。

下面是这类问题中最常见的几种情况。

- 没有 `<tbody>` 的 `<table>`
- `<p>` 内部的 `<div>`
- 嵌套在另一个 `<a>` 内部的 `<a>`

如果你不确定自己的 HTML 是否有效，可以使用[语法验证器](https://validator.w3.org/)进行检查。

::: info 注意
虽然 HTML 标准并不要求表格内必须有 `<tbody>` 元素，但现代浏览器会自动为未声明 `<tbody>` 的表格创建一个 `<tbody>` 元素。由于存在这种不一致，请始终在表格中显式声明 `<tbody>` 元素，以避免水合错误。

:::

### 保留空白字符配置 {#preserve-whitespaces-configuration}

使用水合功能时，我们建议对 `preserveWhitespaces` 使用默认值 `false`。如果你的 tsconfig 中没有这个设置，其值就是 `false`，无需做任何修改。如果你选择通过在 tsconfig 中添加 `preserveWhitespaces: true` 来启用空白字符保留，就可能会遇到水合问题。这还不是一种完全受支持的配置。

::: tip 提示
请确保在服务端的 `tsconfig.server.json` 和浏览器构建的 `tsconfig.app.json` 中**一致地**设置此选项。值不匹配会导致水合失败。

:::

如果你选择在 tsconfig 中设置此选项，我们建议只在 `tsconfig.app.json` 中设置，`tsconfig.server.json` 默认会继承它。

### 尚不支持自定义或 Noop Zone.js {#custom-or-noop-zone-js-are-not-yet-supported}

水合依赖于 Zone.js 在应用内部变得稳定时发出的信号，以便 Angular 可以在服务端开始序列化过程，或者在客户端执行水合后的清理工作，移除仍未被认领的 DOM 节点。

提供自定义的或 "noop" 的 Zone.js 实现可能会导致 "stable" 事件的时机不同，从而过早或过晚地触发序列化或清理。这还不是一种完全受支持的配置，你可能需要在自定义 Zone.js 实现中调整 `onStable` 事件的时机。

## 错误 {#errors}

你可能会遇到多种与水合相关的错误，从节点不匹配到在无效的宿主节点上使用了 `ngSkipHydration` 等情况。最常见的错误情形是使用原生 API 直接操作 DOM，导致水合无法在客户端找到或匹配服务端渲染出的预期 DOM 树结构。另一种可能遇到此类错误的情形已在前面的[有效的 HTML 结构](#valid-html-structure)一节中提到。因此，请确保模板中的 HTML 使用有效的结构，这样就能避免该错误情形。

有关水合相关错误的完整参考，请访问[错误参考指南](/errors)。

## 如何跳过特定组件的水合 {#how-to-skip-hydration-for-particular-components}

由于前面提到的一些问题（例如[直接操作 DOM](#direct-dom-manipulation)），某些组件在启用水合后可能无法正常工作。作为一种变通方法，你可以在组件的标签上添加 `ngSkipHydration` attribute，以跳过整个组件的水合。

```html
<app-example ngSkipHydration />
```

或者，你也可以把 `ngSkipHydration` 设置为宿主绑定。

```ts
@Component({
  ...
  host: {ngSkipHydration: 'true'},
})
class ExampleComponent {}
```

`ngSkipHydration` attribute 会强制 Angular 跳过整个组件及其子组件的水合。使用这个 attribute 意味着该组件的行为就像未启用水合一样，也就是说，它会销毁并重新渲染自身。

::: tip 提示
这可以修复渲染问题，但也意味着该组件（及其子组件）无法获得水合带来的好处。你需要调整组件的实现，避免会破坏水合的模式（即直接操作 DOM），才能移除跳过水合的标注。

:::

`ngSkipHydration` attribute 只能用在组件的宿主节点上。如果把这个 attribute 添加到其他节点上，Angular 会抛出错误。

请记住，在应用的根组件上添加 `ngSkipHydration` attribute 实际上会禁用整个应用的水合。使用这个 attribute 时要谨慎、深思熟虑。它是作为最后手段的变通方法。破坏水合的组件应被视为需要修复的 bug。

## 水合时机与应用稳定性 {#hydration-timing-and-application-stability}

应用稳定性是水合过程的重要组成部分。只有在应用报告已稳定之后，水合以及所有水合后的处理才会进行。有多种情况会延迟应用达到稳定，例如设置 timeout 和 interval、未决的 Promise 以及待处理的微任务。在这些情况下，你可能会遇到 [Application remains unstable](/errors/NG0506) 错误，它表示你的应用在 10 秒后仍未达到稳定状态。如果你发现应用没有立即水合，请检查有哪些因素在影响应用稳定性，并进行重构以避免造成这些延迟。

### 调试应用稳定性 {#debugging-application-stability}

`provideStabilityDebugging` 工具可以帮助你找出应用无法稳定的原因。在开发模式下使用 `provideClientHydration` 时，会默认提供此工具。你也可以手动把它添加到应用的提供者中，例如在生产包（bundle）中使用，或者在使用 SSR 但未启用水合时使用。如果应用达到稳定所需的时间比预期更长，该功能会把相关信息输出到控制台。

```ts
import {provideStabilityDebugging} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import 'zone.js/plugins/task-tracking'; // 如果你通过 `provideZoneChangeDetection` 使用 Zone.js，请引入它

bootstrapApplication(App, {
  providers: [provideStabilityDebugging()],
});
```

启用后，该工具会把待处理任务（`PendingTasks`）输出到控制台。如果你的应用使用了 Zone.js，还可以导入 `zone.js/plugins/task-tracking`，查看是哪些宏任务导致 Angular Zone 无法稳定。这个插件会提供宏任务创建时的堆栈跟踪，从而有效地帮助你找出延迟的来源。

::: warning 重要
Angular 不会从生产包中移除 zone.js 任务跟踪插件或此工具。请只在开发期间临时用它们调试稳定性问题，包括针对优化后的生产构建进行调试。

:::

## 国际化（I18N） {#i18n}

::: tip 提示
默认情况下，Angular 会跳过使用了 i18n 块的组件的水合，实际上会从头重新渲染这些组件。

:::

要为 i18n 块启用水合，你可以在 `provideClientHydration` 调用中添加 [`withI18nSupport`](https://angular.dev/api/platform-browser/withI18nSupport)。

```ts
import {
  bootstrapApplication,
  provideClientHydration,
  withI18nSupport,
} from '@angular/platform-browser';
...

bootstrapApplication(App, {
  providers: [provideClientHydration(withI18nSupport())]
});
```

## 服务端与客户端渲染保持一致 {#consistent-rendering-across-server-side-and-client-side}

避免引入在服务端渲染和客户端渲染时显示不同内容的 `@if` 块和其他条件逻辑，例如把 `@if` 块与 Angular 的 `isPlatformBrowser` 函数一起使用。这些渲染差异会造成布局偏移，对最终用户体验和 Core Web Vitals 产生负面影响。

## 操作 DOM 的第三方库 {#third-party-libraries-with-dom-manipulation}

有许多第三方库依赖 DOM 操作来完成渲染，D3 图表就是一个典型例子。这些库在没有水合时可以正常工作，但启用水合后可能会导致 DOM 不匹配错误。目前，如果你在使用这类库时遇到 DOM 不匹配错误，可以在使用该库进行渲染的组件上添加 `ngSkipHydration` attribute。

## 操作 DOM 的第三方脚本 {#third-party-scripts-with-dom-manipulation}

许多第三方脚本（例如广告跟踪器和分析工具）会在水合发生之前修改 DOM。这些脚本可能会导致水合错误，因为页面已不再与 Angular 期望的结构相匹配。请尽可能把这类脚本推迟到水合之后执行。可以考虑使用 [`AfterNextRender`](https://angular.dev/api/core/afterNextRender)，把脚本延迟到水合后的处理完成之后再执行。

### CDN 和浏览器扩展 {#cdns-and-browser-extensions}

应用之外的代码可能会在水合开始之前修改来自服务器的 HTML。你通常无法在自己的电脑上看到这些错误，因为它们不会在本地服务器上发生。

**会修改 HTML 的 CDN**。有些 CDN 功能会在 HTML 发送到浏览器的途中修改它。例如，有些功能会移除注释节点和空白字符，但水合需要它们。另一个例子是 Cloudflare 的电子邮件地址混淆（Email Address Obfuscation）功能，它默认是开启的。此功能会把电子邮件地址改成类似 `<span class="__cf_email__" data-cfemail="...">` 的元素，还会修改 `mailto:` 链接，并添加一段脚本把内容改回来。如果这段脚本在水合开始之前没有运行，Angular 就会在本应是文本的位置发现一个元素。你的本地服务器不使用 CDN，所以应用在你的电脑上可以正常工作，只在生产环境中失败。

**浏览器扩展**。有些浏览器扩展会在水合开始之前修改页面，例如点击拨号工具、翻译工具和密码管理器。你无法控制这些扩展。只有安装了它们的用户才会遇到问题，因此你可能只会看到部分用户报告的错误。

要修复这些错误：

- 在被修改内容外层的组件宿主上添加 `ngSkipHydration`。在编写该内容的模板中添加它，例如：`<app-contact ngSkipHydration><a href="tel:...">...</a></app-contact>`。这样 Angular 会在浏览器中重新渲染这部分内容，从而消除这些修改。这个 attribute 只能用在组件的宿主元素（host element）上，所以你不能把它添加到 `<a>` 元素上。更多内容请阅读[如何跳过水合](#how-to-skip-hydration-for-particular-components)。
- 为你的应用关闭该 CDN 功能。在 Cloudflare 中，可以在安全设置里关闭[电子邮件地址混淆](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/)，或者使用[配置规则（Configuration Rule）](https://developers.cloudflare.com/rules/configuration-rules/settings/)为你应用的主机名关闭它。

::: info 注意
Cloudflare 的 `<!--email_off-->` 注释在 Angular 模板中不起作用，因为编译器会移除模板中的注释。

:::

## 增量水合 {#incremental-hydration}

增量水合是一种高级形式的水合，它允许你更精细地控制水合发生的时机。更多信息请参阅[增量水合指南](/guide/incremental-hydration)。
