# 安全 {#security}

本主题介绍 Angular 针对常见 Web 应用漏洞和攻击（例如跨站脚本攻击）内置的防护措施。
它不涉及应用级的安全，例如身份验证和授权。

关于下文所述攻击及其缓解措施的更多信息，请参阅 [Open Web Application Security Project (OWASP) 指南](https://www.owasp.org/index.php/Category:OWASP_Guide_Project)。

<a id="report-issues"></a>

::: tip 报告漏洞
Angular 是 Google [开源软件漏洞奖励计划](https://bughunters.google.com/about/rules/6521337925468160/google-open-source-software-vulnerability-reward-program-rules)的一部分。如果发现 Angular 中的漏洞，请在 [https://bughunters.google.com](https://bughunters.google.com/report) 提交报告。

关于 Google 如何处理安全问题的更多信息，请参阅 [Google 的安全理念](https://www.google.com/about/appsecurity)。
:::

## 最佳实践 {#best-practices}

下面是一些确保 Angular 应用安全的最佳实践。

1. **及时更新到最新的 Angular 库版本**：Angular 库会定期更新，这些更新可能会修复在以前版本中发现的安全缺陷。请查看 Angular 的[变更日志](https://github.com/angular/angular/blob/main/CHANGELOG.md)，了解与安全相关的更新。
2. **不要修改你的 Angular 副本**：私有的、定制的 Angular 版本往往会落后于当前版本，可能缺少重要的安全修复和增强。请把你对 Angular 的改进分享给社区，并提交拉取请求。
3. **避免使用文档中标记为「_安全风险_」的 Angular API**：更多信息请参阅本页的[信任安全的值](#trusting-safe-values)一节。

## 防范跨站脚本（XSS） {#preventing-cross-site-scripting-xss}

[跨站脚本（XSS）](https://en.wikipedia.org/wiki/Cross-site_scripting)让攻击者可以向网页中注入恶意代码。
这些代码随后可能会窃取用户数据和登录数据，或者冒充用户执行操作。
这是 Web 上最常见的攻击之一。

要阻止 XSS 攻击，就必须防止恶意代码进入文档对象模型（DOM）。
例如，如果攻击者能诱使你在 DOM 中插入一个 `<script>` 标签，他们就能在你的网站上运行任意代码。
这种攻击并不局限于 `<script>` 标签：DOM 中有许多元素和属性都允许执行代码，例如 `<img alt="" onerror="...">` 和 `<a href="javascript:...">`。
只要攻击者可控的数据进入了 DOM，就要预料到会有安全漏洞。

### Angular 的跨站脚本安全模型 {#angular-s-cross-site-scripting-security-model}

为了系统性地阻止 XSS 漏洞，Angular 默认把所有值都视为不可信的。
当通过模板绑定或插值（Interpolation）把值插入 DOM 时，Angular 会对不可信的值进行清理和转义。
如果某个值已经在 Angular 之外清理过，并且被认为是安全的，请通过把[该值标记为可信](#trusting-safe-values)来告知 Angular。

与用于渲染的值不同，Angular 模板默认被视为可信的，应该被当作可执行代码对待。
永远不要通过把用户输入和模板语法拼接起来的方式创建模板。
这样做会让攻击者能够向你的应用[注入任意代码](https://en.wikipedia.org/wiki/Code_injection)。
为了防止这些漏洞，在生产部署中请始终使用默认的[预先（AOT）模板编译器](#use-the-aot-template-compiler)。

还可以通过使用内容安全策略和可信类型（Trusted Types）提供额外一层防护。
这些 Web 平台功能在 DOM 层面起作用，而这正是防范 XSS 问题最有效的地方。在这一层，它们无法通过其他更底层的 API 被绕过。
因此，强烈建议使用这些功能。为此，请为应用配置[内容安全策略](#content-security-policy)，并启用[可信类型强制执行](#enforcing-trusted-types)。

### 清理与安全上下文 {#sanitization-and-security-contexts}

*清理*是对不可信的值进行检查，把它转换成可以安全插入 DOM 的值。
在很多情况下，清理根本不会改变值。
清理取决于上下文。
例如，一个在 CSS 中无害的值，放在 URL 中可能就是危险的。

Angular 定义了以下安全上下文：

| 安全上下文 | 详情 |
| :---------------- | :-------------------------------------------------------------------------------- |
| HTML | 把值解释为 HTML 时使用，例如绑定到 `innerHtml` 时。 |
| Style | 把 CSS 绑定到 `style` 属性时使用。 |
| URL | 用于 URL 属性，例如 `<a href>`。 |
| Resource URL | 会被作为代码加载和执行的 URL，例如 `<script src>` 中的 URL。 |

Angular 会清理用于 HTML 和 URL 的不可信值。资源 URL 无法被清理，因为它们包含任意代码。
在开发模式下，当 Angular 在清理过程中不得不修改某个值时，会在控制台打印一条警告。

### 清理示例 {#sanitization-example}

下面的模板绑定了 `htmlSnippet` 的值。一次是通过插值放入元素的内容中，另一次是绑定到元素的 `innerHTML` 属性：

```html [inner-html-binding.component.html]
<h3>Binding innerHTML</h3>
<p>Bound value:</p>
<p class="e2e-inner-html-interpolated">{{ htmlSnippet }}</p>
<p>Result of binding to innerHTML:</p>
<p class="e2e-inner-html-bound" [innerHTML]="htmlSnippet"></p>
```

插值的内容总是会被转义：HTML 不会被解释，浏览器会在元素的文本内容中显示尖括号。

要让 HTML 被解释，请把它绑定到 `innerHTML` 之类的 HTML 属性上。
要注意，把攻击者可能控制的值绑定到 `innerHTML`，通常会导致 XSS 漏洞。
例如，可以通过下面的方式运行 JavaScript：

```ts [inner-html-binding.component.ts (class)]
export class InnerHtmlBindingComponent {
  // 例如，来自 URL 的、由用户/攻击者控制的值。
  htmlSnippet = 'Template <script>alert("0wned")</script> <b>Syntax</b>';
}
```

Angular 会识别出这个值是不安全的，并自动清理它：移除 `script` 元素，但保留 `<b>` 元素这样的安全内容。

<img alt="A screenshot showing interpolated and bound HTML values" src="/assets/images/guide/security/binding-inner-html.png">

### 直接使用 DOM API 和显式调用清理 {#direct-use-of-the-dom-apis-and-explicit-sanitization-calls}

除非你强制执行可信类型，否则浏览器内置的 DOM API 不会自动保护你免受安全漏洞的影响。
例如，`document`、通过 `ElementRef` 获得的节点，以及许多第三方 API 都包含不安全的方法。
同样，如果你与其他操作 DOM 的库进行交互，很可能也不会像使用 Angular 插值那样得到自动清理。
请避免直接与 DOM 交互，尽可能使用 Angular 模板。

在无法避免的情况下，请使用 Angular 内置的清理函数。
使用 [DomSanitizer.sanitize](https://angular.dev/api/platform-browser/DomSanitizer#sanitize) 方法和合适的 `SecurityContext` 清理不可信的值。
该函数也接受使用 `bypassSecurityTrust` 系列函数标记为可信的值，并且不会清理它们，详见[下文](#trusting-safe-values)。

### 信任安全的值 {#trusting-safe-values}

有时，应用确实需要包含可执行代码、显示来自某个 URL 的 `<iframe>`，或者构造可能危险的 URL。
要在这些情况下阻止自动清理，请告诉 Angular：你已经检查过这个值、核实过它是如何创建的，并确认它是安全的。
请*务必小心*。
如果你信任了一个可能是恶意的值，就是在给应用引入安全漏洞。
如有疑问，请找专业的安全审查人员。

要把某个值标记为可信，请注入 `DomSanitizer` 并调用以下方法之一：

- `bypassSecurityTrustHtml`
- `bypassSecurityTrustScript`
- `bypassSecurityTrustStyle`
- `bypassSecurityTrustUrl`
- `bypassSecurityTrustResourceUrl`

请记住，一个值是否安全取决于上下文，所以请根据你打算如何使用这个值来选择正确的上下文。
假设下面的模板需要把一个 URL 绑定到 `javascript:alert(...)` 调用上：

```html [bypass-security.component.html (URL)]
<h4>An untrusted URL:</h4>
<p><a class="e2e-dangerous-url" [href]="dangerousUrl">Click me</a></p>
<h4>A trusted URL:</h4>
<p><a class="e2e-trusted-url" [href]="trustedUrl">Click me</a></p>
```

通常，Angular 会自动清理这个 URL，禁用其中的危险代码，并在开发模式下把这一操作记录到控制台。
要阻止这种行为，请调用 `bypassSecurityTrustUrl`，把这个 URL 值标记为可信的 URL：

```ts [bypass-security.component.ts (trust-url)]
private sanitizer = inject(DomSanitizer);
constructor() {
  // 如果被攻击者控制，javascript: URL 是危险的。
  // Angular 会在数据绑定中清理它们，但你可以
  // 显式地告诉 Angular 信任这个值：
  this.dangerousUrl = 'javascript:alert("Hi there")';
  this.trustedUrl = this.sanitizer.bypassSecurityTrustUrl(this.dangerousUrl);
```

<img alt="A screenshot showing an alert box created from a trusted URL" src="/assets/images/guide/security/bypass-security-component.png">

如果你需要把用户输入转换为可信的值，请使用组件方法。
下面的模板让用户输入一个 YouTube 视频 ID，并在 `<iframe>` 中加载对应的视频。
`<iframe src>` 属性属于资源 URL 安全上下文，因为不可信的来源可能会偷偷塞入文件下载，而毫无戒心的用户可能会运行这些文件。
为了防止这种情况，请调用组件上的方法来构造一个可信的视频 URL，这样 Angular 就会允许绑定到 `<iframe src>`：

```html [bypass-security.component.html (iframe)]
<h4>Resource URL:</h4>
<p>Showing: {{ dangerousVideoUrl }}</p>
<p>Trusted:</p>
<iframe
  class="e2e-iframe-trusted-src"
  width="640"
  height="390"
  [src]="videoUrl"
  title="trusted video url"
></iframe>
<p>Untrusted:</p>
<iframe
  class="e2e-iframe-untrusted-src"
  width="640"
  height="390"
  [src]="dangerousVideoUrl"
  title="unTrusted video url"
></iframe>
```

```ts [bypass-security.component.ts (trust-video-url)]
updateVideoUrl(id: string) {
  // 把 ID 追加到 YouTube URL 后面是安全的。
  // 始终尽可能在靠近输入数据的地方构造 SafeValue 对象，
  // 这样更容易检查这个值是否安全。
  this.dangerousVideoUrl = 'https://www.youtube.com/embed/' + id;
  this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.dangerousVideoUrl);
}
```

### 内容安全策略 {#content-security-policy}

内容安全策略 \(CSP\) 是一种防范 XSS 的纵深防御技术。
要启用 CSP，请配置 Web 服务器返回合适的 `Content-Security-Policy` HTTP 响应头。
关于内容安全策略的更多信息，请阅读 Google Developers 网站上的 [Web Fundamentals 指南](https://developers.google.com/web/fundamentals/security/csp)。

一个全新的 Angular 应用所需的最小策略是：

```txt
default-src 'self'; style-src 'self' 'nonce-randomNonceGoesHere'; script-src 'self' 'nonce-randomNonceGoesHere';
```

在提供 Angular 应用服务时，服务器应该针对每个请求，在 HTTP 响应头中包含一个随机生成的 nonce。
你必须把这个 nonce 提供给 Angular，框架才能渲染 `<style>` 元素。
你可以用以下方式之一为 Angular 设置 nonce：

1. 在应用的根元素上设置 `ngCspNonce` 属性，写成 `<app ngCspNonce="randomNonceGoesHere"></app>`。如果你可以使用服务端模板，在构造响应时同时把 nonce 添加到响应头和 `index.html` 中，就使用这种方式。
1. 使用 `CSP_NONCE` 注入令牌提供 nonce。如果你可以在运行时获取 nonce，并且希望能够缓存 `index.html`，就使用这种方式。

```ts
import {CSP_NONCE} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: CSP_NONCE,
      useValue: globalThis.myRandomNonceValue,
    },
  ],
});
```

::: tip 唯一的 nonce
始终确保你提供的 nonce <strong>对每个请求都是唯一的</strong>，并且无法被预测或猜到。
如果攻击者能预测未来的 nonce，就能绕过 CSP 提供的防护。

使用 CDN 时，通常不建议在源服务器上生成 nonce，因为响应经常会被缓存。如果服务器生成了一个 nonce，而 CDN 缓存了这个 HTML 响应，那么之后的每个访问者都会收到同一个「唯一」值，攻击者就可以发现这个静态值并绕过 CSP 防护。

为了保持 nonce「一次性使用」的完整性，理想情况下应该在内容交付给用户之前，在边缘层（例如 CDN）生成它。
:::

::: info 注意
如果你想[内联应用的关键 CSS](/tools/cli/build#critical-css-inlining)，就不能使用 `CSP_NONCE` 令牌，而应该优先使用[工作区配置](/reference/configs/workspace-config#extra-build-and-test-options)中的 `security.autoCsp` 选项，或者在应用的根元素上设置 `ngCspNonce` 属性。

:::

如果你的项目无法生成 nonce，可以在 CSP 响应头的 `style-src` 部分加上 `'unsafe-inline'`，以允许内联样式。

| 部分 | 详情 |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default-src 'self';` | 允许页面从同源加载它所需的所有资源。 |
| `style-src 'self' 'nonce-randomNonceGoesHere';` | 允许页面从同源 \(`'self'`\) 加载全局样式，以及加载 Angular 插入的、带有 `nonce-randomNonceGoesHere` 的样式。 |
| `script-src 'self' 'nonce-randomNonceGoesHere';` | 允许页面从同源 \(`'self'`\) 加载 JavaScript，以及加载 Angular CLI 插入的、带有 `nonce-randomNonceGoesHere` 的脚本。只有在启用关键 CSS 内联或子资源完整性（它会注入一个 import map 来验证动态导入的代码块）时才需要，这两者都会向 `index.html` 添加内联脚本。 |

Angular 本身只需要这些设置就能正常工作。
随着项目的增长，你可能需要扩展 CSP 设置，以适应应用特有的额外功能。

#### 没有按响应生成 nonce 的静态托管 {#static-hosting-without-per-response-nonces}

如果你的托管环境或 CDN 能在边缘替换已缓存 HTML 中的占位令牌（例如使用 SSI、ESI 或边缘函数），你可以在构建 `index.html` 时在 `ngCspNonce` 中放一个占位符（例如 `<app ngCspNonce="__CSP_NONCE__"></app>`），并在每次响应时把它替换为唯一的 nonce。

如果你把应用部署到一个原样提供 `index.html`、没有边缘转换的静态托管服务上，不要硬编码一个静态的 nonce。请改用以下方式之一：

##### 使用 `autoCsp` 对内联脚本计算哈希 {#hash-inline-scripts-with-autocsp}

在[工作区配置](/reference/configs/workspace-config#extra-build-and-test-options)中把 `security.autoCsp` 选项设为 `true`。
在构建时，Angular CLI 会为 `index.html` 中的每个内联脚本计算哈希，包括关键 CSS 内联和子资源完整性添加的脚本。
CLI 会把 `<script src>` 元素替换为一个带哈希的加载器脚本，并在 `<head>` 的开头添加一个 `<meta>` 标签：

```txt
script-src 'strict-dynamic' 'sha256-...' https: 'unsafe-inline'; object-src 'none'; base-uri 'self';
```

由于哈希只取决于脚本的内容，`index.html` 对每个访问者都有效，并且可以被缓存。
支持哈希和 `'strict-dynamic'` 的浏览器会忽略 `https:` 和 `'unsafe-inline'` 这两个回退来源。

`autoCsp` 生成的策略有以下限制：

- 它只覆盖脚本。你必须单独配置 `style-src`。
- 当 `frame-ancestors`、`report-uri` 和 `sandbox` 等指令出现在 `<meta>` 标签中时，浏览器会忽略它们。请通过 `Content-Security-Policy` HTTP 响应头发送这些指令。
- 当页面有多条策略时，浏览器会全部强制执行。如果你还发送了 CSP 响应头，请在响应头中省略 `script-src` 和 `default-src`，以免它们阻止带哈希的内联脚本。
- `autoCsp` 不能与服务端渲染一起使用。

##### 避免内联脚本 {#avoid-inline-scripts}

Angular CLI 只会因为关键 CSS 内联和子资源完整性（它会输出一个 import map，用于携带动态模块导入的完整性元数据）而向 `index.html` 添加内联脚本。
如果你把 `optimization.styles.inlineCritical` 设为 `false`，并保持 `subresourceIntegrity` 处于禁用状态，`index.html` 中就不会包含内联脚本。这时你就可以配置带有 `script-src 'self'` 的 `Content-Security-Policy` 响应头。

::: info 注意
禁用关键 CSS 内联可能会拖慢应用的初始渲染，而禁用子资源完整性会去掉脚本的完整性检查。

:::

##### 为静态托管配置样式 {#configure-styles-for-static-hosting}

Angular 会在运行时为组件样式插入 `<style>` 元素，而关键 CSS 内联会向 `index.html` 添加一个 `<style>` 元素。
无论是 `autoCsp` 还是禁用内联脚本，都覆盖不到这些样式。在没有按响应生成 nonce 的情况下，请在 `style-src` 中加上 `'unsafe-inline'` 来允许它们。
例如，如果你的构建避免了内联脚本，请配置托管服务发送以下响应头：

```txt
default-src 'self'; style-src 'self' 'unsafe-inline';
```

如果你使用 `autoCsp`，请在 HTTP 响应头中发送 `style-src 'self' 'unsafe-inline'`，不要带 `default-src` 或 `script-src`。

在这两种情况下，你的应用代码和第三方库可能还需要额外的指令。

### 强制执行可信类型 {#enforcing-trusted-types}

建议使用[可信类型（Trusted Types）](https://w3c.github.io/trusted-types/dist/spec/)来帮助保护应用免受跨站脚本攻击。
可信类型是一项 [Web 平台](https://en.wikipedia.org/wiki/Web_platform)功能，它通过强制执行更安全的编码实践，帮助你防范跨站脚本攻击。
可信类型还有助于简化对应用代码的审计。

::: tip 可信类型
在你的应用所面向的浏览器中，可能还有一些不支持可信类型。
如果启用了可信类型的应用运行在不支持可信类型的浏览器中，应用的功能会保持不变。你的应用仍然会通过 Angular 的 DomSanitizer 防范 XSS。
当前的浏览器支持情况请参阅 [caniuse.com/trusted-types](https://caniuse.com/trusted-types)。
:::

要为应用强制执行可信类型，你必须配置应用的 Web 服务器，让它发出带有以下 Angular 策略之一的 HTTP 响应头：

| 策略 | 详情 |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `angular` | 这个策略用于 Angular 内部经过安全审查的代码，在强制执行可信类型时，Angular 需要它才能正常工作。任何内联模板值或经 Angular 清理过的内容，都会被这个策略视为安全的。 |
| `angular#bundler` | 这个策略由 Angular CLI 打包器在创建延迟加载的代码块文件时使用。 |
| `angular#unsafe-bypass` | 这个策略用于使用了 Angular [DomSanitizer](https://angular.dev/api/platform-browser/DomSanitizer) 中任何绕过安全检查的方法（例如 `bypassSecurityTrustHtml`）的应用。任何使用这些方法的应用都必须启用这个策略。 |
| `angular#unsafe-jit` | 这个策略由[即时（JIT）编译器](https://angular.dev/api/core/Compiler)使用。如果你的应用直接与 JIT 编译器交互，或者使用 [platform browser dynamic](https://angular.dev/api/platform-browser-dynamic/platformBrowserDynamic) 以 JIT 模式运行，就必须启用这个策略。 |
| `angular#unsafe-upgrade` | 这个策略由 [@angular/upgrade](https://angular.dev/api/upgrade/static/UpgradeModule) 包使用。如果你的应用是 AngularJS 混合应用，就必须启用这个策略。 |

你应该在以下位置为可信类型配置 HTTP 响应头：

- 生产环境的服务基础设施
- Angular CLI \(`ng serve`\)，使用 `angular.json` 文件中的 `headers` 属性，用于本地开发和端到端测试
- Karma \(`ng test`\)，使用 `karma.config.js` 文件中的 `customHeaders` 属性，用于单元测试

下面是一个专门为可信类型和 Angular 配置的响应头示例：

```html
Content-Security-Policy: trusted-types angular; require-trusted-types-for 'script';
```

下面是一个专门为可信类型、以及使用了 Angular [DomSanitizer](https://angular.dev/api/platform-browser/DomSanitizer) 中任何绕过安全检查方法的 Angular 应用配置的响应头示例：

```html
Content-Security-Policy: trusted-types angular angular#unsafe-bypass; require-trusted-types-for
'script';
```

下面是一个专门为可信类型、以及使用 JIT 的 Angular 应用配置的响应头示例：

```html
Content-Security-Policy: trusted-types angular angular#unsafe-jit; require-trusted-types-for
'script';
```

下面是一个专门为可信类型、以及使用模块延迟加载的 Angular 应用配置的响应头示例：

```html
Content-Security-Policy: trusted-types angular angular#bundler; require-trusted-types-for 'script';
```

::: tip 社区贡献
要进一步了解如何排查可信类型配置的问题，下面的资源可能会有帮助：

[Prevent DOM-based cross-site scripting vulnerabilities with Trusted Types](https://web.dev/trusted-types/#how-to-use-trusted-types)
:::

### 使用 AOT 模板编译器 {#use-the-aot-template-compiler}

AOT 模板编译器可以防范一整类被称为模板注入的漏洞，还能大幅提升应用性能。
AOT 模板编译器是 Angular CLI 应用默认使用的编译器，你应该在所有生产部署中使用它。

AOT 编译器的替代方案是 JIT 编译器，它会在运行时在浏览器中把模板编译成可执行的模板代码。
Angular 信任模板代码，因此动态生成并编译模板（尤其是包含用户数据的模板）会绕过 Angular 的内置防护。这是一种安全反模式。
关于如何以安全的方式动态构造表单，请参阅[动态表单](/guide/forms/dynamic-forms)指南。

### 服务端 XSS 防护 {#server-side-xss-protection}

在服务器上构造的 HTML 容易受到注入攻击。
向 Angular 应用注入模板代码，就等同于向应用注入可执行代码：
它会让攻击者完全控制应用。
为了防止这种情况，请在服务器上使用能自动转义值的模板语言，以防范 XSS 漏洞。
不要在服务端使用模板语言来创建 Angular 模板。这样做引入模板注入漏洞的风险很高。

## HTTP 层面的漏洞 {#http-level-vulnerabilities}

Angular 内置了对两种常见 HTTP 漏洞的防护支持：跨站请求伪造 \(CSRF 或 XSRF\) 和跨站脚本包含 \(XSSI\)。
这两种漏洞主要都必须在服务端缓解，但 Angular 提供了一些辅助功能，让客户端的集成更容易。

### 跨站请求伪造 {#cross-site-request-forgery}

在跨站请求伪造 \(CSRF 或 XSRF\) 中，攻击者诱骗用户访问另一个含有恶意代码的网页 \(例如 `evil.com`\)。这个网页会偷偷向应用的 Web 服务器 \(例如 `example-bank.com`\) 发送恶意请求。

假设用户已经登录了 `example-bank.com` 上的应用。
用户打开一封电子邮件，点击了一个指向 `evil.com` 的链接，该链接在新标签页中打开。

`evil.com` 页面立即向 `example-bank.com` 发送一个恶意请求。
这个请求可能是要把钱从用户的账户转到攻击者的账户。
浏览器会随这个请求自动发送 `example-bank.com` 的 Cookie，包括身份验证 Cookie。

如果 `example-bank.com` 的服务器缺少 XSRF 防护，它就无法区分来自应用的合法请求和来自 `evil.com` 的伪造请求。

为了防止这种情况，应用必须确保用户请求来自真正的应用，而不是来自其他网站。
服务器和客户端必须协作来挫败这种攻击。

在一种常见的反 XSRF 技术中，应用服务器会在 Cookie 中发送一个随机生成的身份验证令牌。
客户端代码读取这个 Cookie，并在之后的所有请求中添加一个携带该令牌的自定义请求头。
服务器把收到的 Cookie 值与请求头的值进行比较，如果值缺失或不匹配，就拒绝请求。

这种技术之所以有效，是因为所有浏览器都实现了*同源策略*。
只有来自设置 Cookie 的那个网站的代码，才能读取该网站的 Cookie，并在发往该网站的请求上设置自定义请求头。
这意味着只有你的应用能读取这个 Cookie 令牌并设置自定义请求头。
`evil.com` 上的恶意代码做不到。

### `HttpClient` 的 XSRF/CSRF 安全 {#httpclient-xsrf-csrf-security}

`HttpClient` 支持一种用于防范 XSRF 攻击的[常见机制](https://en.wikipedia.org/wiki/Cross-site_request_forgery#Cookie-to-header_token)。在执行 HTTP 请求时，一个拦截器会从 Cookie（默认是 `XSRF-TOKEN`）中读取令牌，并把它设置为 HTTP 请求头 `X-XSRF-TOKEN`。由于只有在你的域名下运行的代码才能读取这个 Cookie，后端就可以确定这个 HTTP 请求来自你的客户端应用，而不是攻击者。

默认情况下，拦截器会在所有发往相对 URL 和同源 URL 的变更类请求（例如 `POST`）上发送这个请求头，但不会在 `GET` 或 `HEAD` 请求上发送。

::: tip 为什么不保护 GET 请求？
只有能改变后端状态的请求才需要 CSRF 防护。CSRF 攻击本质上是跨域的，而 Web 的[同源策略](https://developer.mozilla.org/docs/Web/Security/Same-origin_policy)会阻止攻击页面获取经过身份验证的 `GET` 请求的结果。
:::

要利用这一机制，你的服务器需要在页面加载时或第一个 GET 请求时，在一个名为 `XSRF-TOKEN`、可被 JavaScript 读取的会话 Cookie 中设置令牌。在之后的请求中，服务器可以验证这个 Cookie 是否与 `X-XSRF-TOKEN` HTTP 请求头一致，从而确定只有在你的域名下运行的代码才可能发送这个请求。这个令牌必须对每个用户都是唯一的，并且必须能被服务器验证，以防客户端自己编造令牌。为了提高安全性，可以把令牌设为网站身份验证 Cookie 加盐后的摘要。

在多个 Angular 应用共享同一个域名或子域名的环境中，为了防止冲突，请给每个应用一个唯一的 Cookie 名称。

::: warning HttpClient 只支持 XSRF 防护方案中客户端的那一半
你的后端服务必须配置为给页面设置这个 Cookie，并在所有符合条件的请求上验证该请求头是否存在。否则，Angular 的默认防护就会失效。
:::

### 配置自定义的 Cookie/请求头名称 {#configure-custom-cookie-header-names}

如果你的后端服务对 XSRF 令牌的 Cookie 或请求头使用了不同的名称，请使用 `withXsrfConfiguration` 覆盖默认值。

把它添加到 `provideHttpClient` 调用中，如下所示：

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'CUSTOM_XSRF_TOKEN',
        headerName: 'X-Custom-Xsrf-Header',
      }),
    ),
  ],
};
```

### 禁用 XSRF 防护 {#disabling-xsrf-protection}

如果内置的 XSRF 防护机制不适用于你的应用，可以使用 `withNoXsrfProtection` 特性禁用它：

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withNoXsrfProtection())],
};
```

关于 Open Web Application Security Project \(OWASP\) 中 CSRF 的信息，请参阅 [Cross-Site Request Forgery (CSRF)](https://owasp.org/www-community/attacks/csrf) 和 [Cross-Site Request Forgery (CSRF) Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)。
斯坦福大学的论文 [Robust Defenses for Cross-Site Request Forgery](https://seclab.stanford.edu/websec/csrf/csrf.pdf) 提供了丰富的细节。

另请参阅 Dave Smith 在 [AngularConnect 2016 上关于 XSRF 的演讲](https://www.youtube.com/watch?v=9inczw6qtpY 'Cross Site Request Funkery Securing Your Angular Apps From Evil Doers')。

### 跨站脚本包含（XSSI） {#cross-site-script-inclusion-xssi}

跨站脚本包含，也称为 JSON 漏洞，可能让攻击者的网站从 JSON API 读取数据。
这种攻击在较旧的浏览器上有效：先覆盖内置的 JavaScript 对象构造函数，然后用 `<script>` 标签引入一个 API URL。

只有当返回的 JSON 可以作为 JavaScript 执行时，这种攻击才能成功。
服务器可以通过给所有 JSON 响应加上前缀使其无法执行来防范这种攻击，按照惯例，使用的是众所周知的字符串 `")]}',\n"`。

Angular 的 `HttpClient` 库能识别这一约定，并在进一步解析之前，自动从所有响应中去掉字符串 `")]}',\n"`。

更多信息请参阅这篇 [Google Web 安全博客文章](https://security.googleblog.com/2011/05/website-security-for-webmasters.html)中的 XSSI 部分。

## 防范服务端请求伪造（SSRF） {#preventing-server-side-request-forgery-ssrf}

Angular 在请求处理管道中对 `Host`、`Forwarded`、`X-Forwarded-Host`、`X-Forwarded-Proto`、`X-Forwarded-Prefix` 和 `X-Forwarded-Port` 请求头进行严格验证，以防范基于请求头的[服务端请求伪造（SSRF）](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/SSRF)。

验证规则如下：

- `Host`、`X-Forwarded-Host` 以及 `Forwarded` 请求头中的 `host` 参数会按照严格的允许列表进行验证，并且不能包含路径分隔符。
- `X-Forwarded-Port` 请求头必须是数字。
- `X-Forwarded-Proto` 请求头以及 `Forwarded` 请求头中的 `proto` 参数必须是 `http` 或 `https`。
- `X-Forwarded-Prefix` 请求头必须以 `/` 开头，并且只能包含由单个斜杠分隔的字母、数字、连字符和下划线。
- 默认情况下，`Forwarded` 请求头和所有 `X-Forwarded-*` 请求头都被视为不可信的，会从请求中移除。要保留它们，必须通过配置 `trustProxyHeaders` 显式允许。

无效的请求头会触发错误日志，未被允许的代理请求头会从请求中移除。主机名无法识别的请求会得到 `400 Bad Request` 响应。

::: info 注意
大多数云服务商和 CDN 服务商都会在请求到达应用源站之前，自动验证这些请求头。这种内在的过滤大大缩小了实际的攻击面。

:::

### 配置允许的主机 {#configuring-allowed-hosts}

要允许特定的主机名，你需要把它们添加到允许列表中。这对于确保应用部署后能够正确、安全地运行至关重要。这些模式支持通配符，以便灵活地匹配主机名。

你可以在 `angular.json` 中配置 `allowedHosts` 选项：

```json
{
  // ...
  "projects": {
    "your-project-name": {
      // ...
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "security": {
              "allowedHosts": [
                "example.com",
                "*.example.com" // 允许 example.com 的所有子域名
              ]
            }
            // ... 其他选项
          }
        }
      }
    }
  }
}
```

你也可以在初始化应用引擎时配置 `allowedHosts`：

```ts
const appEngine = new AngularAppEngine({
  allowedHosts: ['example.com', '*.trusted-example.com'],
});

const nodeAppEngine = new AngularNodeAppEngine({
  allowedHosts: ['example.com', '*.trusted-example.com'],
});
```

对于 Node.js 版本的 `AngularNodeAppEngine`，你还可以提供 `NG_ALLOWED_HOSTS` 环境变量（逗号分隔的列表）来授权主机。

```bash
export NG_ALLOWED_HOSTS="example.com,*.trusted-example.com"
```

::: warning 重要
你可以在 `allowedHosts` 中使用 `*` 作为值来允许所有主机名，但通常不建议这样做，因为它存在安全风险。接受任意 Host 请求头可能会让应用暴露于 Host 请求头注入和[服务端请求伪造（SSRF）](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/SSRF)攻击之下。只有当 `Host` 和 `X-Forwarded-Host` 请求头的验证在其他层（例如负载均衡器或反向代理）中进行时，才应该使用这种配置。为了更好的安全性，我们建议尽可能使用明确的允许主机列表。更多细节请参阅 [GHSA-x288-3778-4hhx](https://github.com/angular/angular-cli/security/advisories/GHSA-x288-3778-4hhx)。

:::

### 配置可信的代理请求头 {#configuring-trusted-proxy-headers}

默认情况下，Angular 会忽略标准的 `Forwarded` 请求头和所有 `X-Forwarded-*` 请求头。如果你的应用位于会设置这些请求头的可信反向代理（例如负载均衡器）之后，可以配置 Angular 信任它们。

如果 `Forwarded` 请求头是可信的，就会提取其中的 `host` 和 `proto` 参数，并且它们优先于对应的 `x-forwarded-host` 和 `x-forwarded-proto` 请求头。

你可以在初始化应用引擎时配置 `trustProxyHeaders`：

```ts
const appEngine = new AngularAppEngine({
  trustProxyHeaders: ['forwarded'], // 信任标准的 Forwarded 请求头
});

const appEngine = new AngularAppEngine({
  trustProxyHeaders: ['x-forwarded-host', 'x-forwarded-proto'], // 信任非标准的请求头
});

const nodeAppEngine = new AngularNodeAppEngine({
  trustProxyHeaders: true, // 信任标准的 Forwarded 请求头和所有 X-Forwarded-* 请求头
});
```

对于 Node.js 版本的 `AngularNodeAppEngine`，你还可以提供 `NG_TRUST_PROXY_HEADERS` 环境变量（值为逗号分隔的请求头列表），以允许使用这些请求头。

```bash
export NG_TRUST_PROXY_HEADERS="X-FORWARDED-HOST,X-FORWARDED-PREFIX"
```

::: warning 重要
只有当你的应用位于会严格验证或覆盖这些请求头的可信代理之后，才启用 `trustProxyHeaders`。否则，攻击者可以伪造这些请求头，发起[服务端请求伪造（SSRF）](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/SSRF)攻击。

:::

## 审计 Angular 应用 {#auditing-angular-applications}

Angular 应用必须遵循与普通 Web 应用相同的安全原则，也必须像普通 Web 应用一样接受审计。
在安全审查中应该审计的 Angular 专有 API（例如 [_bypassSecurityTrust_](#trusting-safe-values) 系列方法）在文档中都被标记为安全敏感。
