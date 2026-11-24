# Angular Service Worker 概览 {#angular-service-worker-overview}

::: warning 重要
Angular Service Worker 是一个基础的缓存（cache）工具，用于提供简单的离线支持，功能集有限。除安全修复外，我们不再接受任何新功能。如需更高级的缓存和离线能力，我们建议直接使用浏览器原生 API。

:::

Service Worker 增强了传统的 Web 部署模型，使应用能够提供与专为操作系统和硬件编写的原生代码相媲美的可靠性和性能体验。
为 Angular 应用添加 Service Worker，是把应用转变为 [渐进式 Web 应用](https://web.dev/progressive-web-apps/)（Progressive Web App，也称 PWA）的步骤之一。

简单来说，Service Worker 是一个运行在 Web 浏览器中、负责管理应用缓存的脚本。

Service Worker 的作用相当于网络代理。
它们会拦截应用发出的所有 HTTP 请求，并可以自行决定如何响应。
例如，它们可以查询本地缓存，如果有可用的缓存响应，就直接返回。
这种代理并不局限于通过编程式 API（例如 `fetch`）发出的请求，还包括 HTML 中引用的资源，甚至包括对 `index.html` 的初始请求。
因此，基于 Service Worker 的缓存是完全可编程的，不依赖服务器指定的缓存头。

与组成应用的其他脚本（例如 Angular 应用包（bundle））不同，Service Worker 在用户关闭标签页后依然会保留。
下次浏览器加载该应用时，Service Worker 会最先加载，并可以拦截加载应用所需的每一个资源请求。
如果 Service Worker 是按此目的设计的，它就可以 _在完全不需要网络的情况下完成应用的加载_。

即使在快速可靠的网络中，往返延迟也会在加载应用时带来明显的等待时间。
使用 Service Worker 减少对网络的依赖，可以显著改善用户体验。

## Angular 中的 Service Worker {#service-workers-in-angular}

Angular 应用作为单页应用，非常适合从 Service Worker 的优势中受益。Angular 自带了一个 Service Worker 实现。Angular 开发者可以利用这个 Service Worker，享受它带来的更高可靠性和性能，而无需针对底层 API 编写代码。

Angular 的 Service Worker 旨在优化用户在缓慢或不可靠网络连接下使用应用的体验，同时尽量降低提供过时内容的风险。

为此，Angular Service Worker 遵循以下准则：

- 缓存应用就像安装原生应用一样。
  应用作为一个整体被缓存，所有文件一起更新。

- 正在运行的应用会继续使用同一版本的所有文件运行。
  它不会突然开始接收来自新版本的缓存文件，因为这些文件很可能并不兼容。

- 当用户刷新应用时，会看到最新的、已完整缓存的版本。
  新标签页会加载最新缓存的代码。

- 更新在后台进行，在变更发布后相对较快地完成。
  在更新安装就绪之前，会一直提供应用的上一个版本。

- Service Worker 会尽可能节省带宽。
  只有发生变化的资源才会被下载。

为了支持这些行为，Angular Service Worker 会从服务器加载一个 _清单（manifest）_ 文件。
这个文件名为 `ngsw.json`（不要与 [Web 应用清单](https://developer.mozilla.org/docs/Web/Manifest) 混淆），它描述了要缓存的资源，并包含每个文件内容的哈希值。
当部署应用更新时，清单的内容会发生变化，从而通知 Service Worker 应该下载并缓存应用的新版本。
这个清单是根据 CLI 生成的配置文件 `ngsw-config.json` 生成的。

安装 Angular Service Worker 非常简单，只需 [运行一条 Angular CLI 命令](/ecosystem/service-workers/getting-started#adding-a-service-worker-to-your-project)。
除了在浏览器中注册 Angular Service Worker 之外，它还会提供一些可供注入的服务，这些服务可以与 Service Worker 交互并用于控制它。
例如，应用可以要求在有新的更新可用时收到通知，也可以要求 Service Worker 检查服务器上是否有可用的更新。

## 开始之前 {#before-you-start}

要使用 Angular Service Worker 的全部功能，请使用最新版本的 Angular 和 [Angular CLI](/tools/cli)。

要注册 Service Worker，必须通过 HTTPS（而不是 HTTP）访问应用。
对于通过不安全连接提供的页面，浏览器会忽略其中的 Service Worker。
原因是 Service Worker 的能力非常强大，因此需要格外小心，确保 Service Worker 脚本没有被篡改。

这条规则有一个例外：为了让本地开发更方便，在 `localhost` 上访问应用时，浏览器 _不_ 要求安全连接。

### 浏览器支持 {#browser-support}

要从 Angular Service Worker 中受益，你的应用必须运行在普遍支持 Service Worker 的 Web 浏览器中。
目前，最新版本的 Chrome、Firefox、Edge、Safari、Opera、UC 浏览器（Android 版）和 Samsung Internet 都支持 Service Worker。
IE 和 Opera Mini 等浏览器不支持 Service Worker。

如果用户使用不支持 Service Worker 的浏览器访问你的应用，Service Worker 就不会被注册，离线缓存管理和推送通知（push notification）等相关行为也不会发生。
具体来说：

- 浏览器不会下载 Service Worker 脚本和 `ngsw.json` 清单文件
- 主动与 Service Worker 交互的尝试（例如调用 `SwUpdate.checkForUpdate()`）会返回被拒绝的 Promise
- 相关服务的可观察事件（例如 `SwUpdate.versionUpdates`）不会被触发

强烈建议你确保应用在浏览器不支持 Service Worker 的情况下也能正常工作。
虽然不受支持的浏览器会忽略 Service Worker 缓存，但如果应用尝试与 Service Worker 交互，它仍然会报错。
例如，调用 `SwUpdate.checkForUpdate()` 会返回被拒绝的 Promise。
为避免此类错误，请使用 `SwUpdate.isEnabled` 检查 Angular Service Worker 是否已启用。

要进一步了解哪些浏览器已支持 Service Worker，请参阅 [Can I Use](https://caniuse.com/#feat=serviceworkers) 页面和 [MDN 文档](https://developer.mozilla.org/docs/Web/API/Service_Worker_API)。

## 相关资源 {#related-resources}

本节的其余文章专门介绍 Angular 对 Service Worker 的实现。

- [配置文件](/ecosystem/service-workers/config)
- [与 Service Worker 通信](/ecosystem/service-workers/communications)
- [推送通知](/ecosystem/service-workers/push-notifications)
- [Service Worker 运维](/ecosystem/service-workers/devops)
- [应用外壳（App Shell）模式](/ecosystem/service-workers/app-shell)


关于 Service Worker 的更多常规信息，请参阅 [Service Workers: an Introduction](https://developers.google.com/web/fundamentals/primers/service-workers)。

关于浏览器支持的更多信息，请参阅 [Service Workers: an Introduction](https://developers.google.com/web/fundamentals/primers/service-workers) 中的 [浏览器支持](https://developers.google.com/web/fundamentals/primers/service-workers/#browser_support) 一节、Jake Archibald 的 [Is Serviceworker ready?](https://jakearchibald.github.io/isserviceworkerready) 以及 [Can I Use](https://caniuse.com/serviceworkers)。

更多建议和示例，请参阅：

- [Precaching with Angular Service Worker](https://web.dev/precaching-with-the-angular-service-worker)
- [Creating a PWA with Angular CLI](https://web.dev/creating-pwa-with-angular-cli)


## 下一步 {#next-step}

要开始使用 Angular Service Worker，请参阅 [Service Worker 入门](/ecosystem/service-workers/getting-started)。
