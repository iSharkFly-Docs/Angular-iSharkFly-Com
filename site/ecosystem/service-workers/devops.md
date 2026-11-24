# Service Worker 运维 {#service-worker-devops}

本页是部署和维护使用 Angular Service Worker 的生产应用的参考文档。
它解释了 Angular Service Worker 如何融入更大的生产环境、Service Worker 在各种条件下的行为，以及可用的资源和故障保护机制。

## Service Worker 与应用资源的缓存 {#service-worker-and-caching-of-application-resources}

可以把 Angular Service Worker 想象成安装在最终用户 Web 浏览器中的前向缓存（cache）或内容分发网络（CDN）边缘节点。
Service Worker 会从本地缓存中响应 Angular 应用对资源（asset）或数据的请求，而无需等待网络。
与任何缓存一样，它也有一套规则来决定内容如何过期和更新。

### 应用版本 {#application-versions}

在 Angular Service Worker 的语境中，「版本」是一组资源的集合，代表 Angular 应用的某一次特定构建。
每当部署应用的新构建时，Service Worker 都会把该构建视为应用的一个新版本。
即使只更新了一个文件，也是如此。
在任何时候，Service Worker 的缓存中都可能有应用的多个版本，并且可能同时提供它们。
更多信息，参见[应用标签页](#application-tabs)一节。

为了保证应用的完整性，Angular Service Worker 会把所有文件一起归入同一个版本。
归入一个版本的文件通常包括 HTML、JS 和 CSS 文件。
对这些文件进行分组对完整性至关重要，因为 HTML、JS 和 CSS 文件经常相互引用，并依赖于特定的内容。
例如，`index.html` 文件可能有一个引用 `bundle.js` 的 `<script>` 标签，并可能尝试从该脚本中调用函数 `startApp()`。
每当提供这个版本的 `index.html` 时，都必须同时提供与之对应的 `bundle.js`。
例如，假设在两个文件中都把 `startApp()` 函数重命名为了 `runApp()`。
在这种情况下，同时提供调用 `startApp()` 的旧 `index.html` 和定义 `runApp()` 的新包（bundle）是不正确的。

在延迟加载（Lazy Loading）时，这种文件完整性尤其重要。
一个 JS 包可能引用许多延迟加载的块（chunk），而这些块的文件名对于应用的某次特定构建是唯一的。
如果版本 `X` 的运行中应用尝试加载一个延迟加载的块，而服务器已经更新到了版本 `X + 1`，延迟加载操作就会失败。

应用的版本标识符由所有资源的内容决定，只要其中任何一个发生变化，它就会改变。
实际上，版本由 `ngsw.json` 文件的内容决定，该文件包含所有已知内容的哈希（hash）。
如果任何已缓存的文件发生变化，该文件在 `ngsw.json` 中的哈希也会变化。这一变化会让 Angular Service Worker 把当前这组活动文件视为一个新版本。

::: tip 提示
构建过程会使用 `ngsw-config.json` 中的信息创建清单（manifest）文件 `ngsw.json`。

:::

借助 Angular Service Worker 的版本控制行为，应用服务器可以确保 Angular 应用始终拥有一组一致的文件。

#### 更新检查 {#update-checks}

每当用户打开或刷新应用时，Angular Service Worker 都会通过查找 `ngsw.json` 清单的更新来检查应用是否有更新。
如果发现了更新，就会自动下载并缓存，并在下次加载应用时提供它。

### 资源完整性 {#resource-integrity}

长期缓存的潜在副作用之一，是可能会无意中缓存一个无效的资源。
在普通的 HTTP 缓存中，强制刷新或缓存过期能限制缓存无效文件所带来的负面影响。
Service Worker 会忽略这些限制，实际上会对整个应用进行长期缓存。
让 Service Worker 获取正确的内容非常重要，因此它会保存资源的哈希来维护其完整性。

#### 有哈希的内容 {#hashed-content}

为了确保资源完整性，Angular Service Worker 会验证所有它拥有哈希的资源的哈希。
对于使用 [Angular CLI](/tools/cli) 创建的应用，这指的是 `dist` 目录中被用户的 `src/ngsw-config.json` 配置所覆盖的所有内容。

如果某个文件验证失败，Angular Service Worker 会尝试使用一个用于「绕过缓存」的 URL 参数重新获取内容，以避免浏览器缓存或中间层缓存。
如果该内容仍然验证失败，Service Worker 就会认为应用的整个版本都无效，并停止提供该应用。
必要时，Service Worker 会进入安全模式，此时请求会回退到网络。如果提供损坏、过时或无效内容的风险很高，Service Worker 就不会使用它的缓存。

哈希不匹配可能由多种原因导致：

- 源服务器和最终用户之间的缓存层可能提供了过时的内容
- 非原子化的部署可能导致 Angular Service Worker 看到部分更新的内容
- 构建过程中的错误可能导致资源已更新而 `ngsw.json` 却没有更新。
  反过来也可能发生，即 `ngsw.json` 已更新而资源却没有更新。

#### 没有哈希的内容 {#unhashed-content}

在 `ngsw.json` 清单中拥有哈希的资源，只有那些在构建清单时就已存在于 `dist` 目录中的资源。
其他资源，尤其是从 CDN 加载的资源，其内容在构建时是未知的，或者其更新频率比应用的部署更频繁。

如果 Angular Service Worker 没有可用于验证资源有效性的哈希，它仍然会缓存该资源的内容。同时，它会采用 _stale while revalidate_ 策略来遵循 HTTP 缓存头。
即使资源的 HTTP 缓存头表明它已不再有效，Angular Service Worker
仍会继续提供该资源。同时，它会尝试在后台刷新这个已过期的资源。
这样，损坏的无哈希资源就不会在缓存中停留超过其配置的有效期。

### 应用标签页 {#application-tabs}

如果应用接收到的资源版本突然改变或在没有任何提示的情况下改变，就可能给应用带来问题。
关于这类问题的描述，参见[应用版本](#application-versions)一节。

Angular Service Worker 提供了一项保证：正在运行的应用会继续运行同一个版本的应用。
如果在新的 Web 浏览器标签页中打开了应用的另一个实例，则会提供应用的最新版本。
因此，这个新标签页运行的应用版本可能与原来的标签页不同。

::: warning 重要
这项保证比普通 Web 部署模型所提供的保证**更强**。如果没有 Service Worker，就无法保证延迟加载的代码与应用的初始代码来自同一个版本。

:::

在某些错误情况下，Angular Service Worker 可能会更改正在运行的应用的版本，例如：

- 当前版本因哈希校验失败而变得无效。
- 某个无关的错误导致 Service Worker 进入安全模式，并暂时停用它。

当没有标签页在使用某个应用版本时，Angular Service Worker 会清理这些版本。

Angular Service Worker 可能更改正在运行的应用版本的其他原因属于正常事件：

- 页面被重新加载/刷新。
- 页面使用 `SwUpdate` 服务请求立即激活一个更新。

### Service Worker 更新 {#service-worker-updates}

Angular Service Worker 是一个在 Web 浏览器中运行的小脚本。
Service Worker 会不时更新，以修复 bug 和改进功能。

Angular Service Worker 会在首次打开应用时，以及在一段时间不活动后再次访问应用时下载。
如果 Service Worker 发生了变化，就会在后台更新。

Angular Service Worker 的大多数更新对应用都是透明的。旧的缓存仍然有效，内容仍然正常提供。
偶尔，Angular Service Worker 中的某个 bug 修复或功能可能需要让旧缓存失效。
在这种情况下，Service Worker 会透明地从网络刷新应用。

#### 仅响应头发生变化时更新 Service Worker {#updating-the-service-worker-when-only-its-response-headers-change}

只有当 Service Worker 脚本与已安装的脚本存在字节差异时，浏览器才会安装新的 Service Worker。
由于 `ngsw-worker.js` 在不同构建之间通常是相同的，因此只修改服务器随它一起发送的响应头（例如 `Content-Security-Policy`）并不会更新已安装的 Service Worker。
Service Worker 会继续使用安装时的那些响应头运行。

要让浏览器重新安装 Service Worker，请使用带版本号的脚本 URL 来注册它，并在这些响应头发生变化时更改版本号：

```ts
provideServiceWorker('ngsw-worker.js?v=2', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000',
});
```

注册一个不同的脚本 URL 会让浏览器重新获取并安装 Service Worker，即使其内容没有变化。
Angular Service Worker 是相对于其注册作用域（而不是脚本 URL）来解析它的缓存和 `ngsw.json` 的，因此查询参数不会影响已缓存的内容。

### 绕过 Service Worker {#bypassing-the-service-worker}

在某些情况下，你可能希望完全绕过 Service Worker，让浏览器来处理请求。
例如，当你依赖某个 Service Worker 目前尚不支持的功能时，比如[报告文件上传进度](https://github.com/w3c/ServiceWorker/issues/1141)。

要绕过 Service Worker，请把 `ngsw-bypass` 设置为请求头或查询参数。
该请求头或查询参数的值会被忽略，可以为空，也可以省略。

### 无法访问服务器时的 Service Worker 请求 {#service-worker-requests-when-the-server-can-t-be-reached}

除非[显式绕过了 Service Worker](#bypassing-the-service-worker)，否则 Service Worker 会处理所有请求。
根据缓存的状态和配置，Service Worker 要么返回缓存的响应，要么把请求发送到服务器。
Service Worker 只缓存对不修改数据的请求（例如 `GET` 和 `HEAD`）的响应。

如果 Service Worker 从服务器收到错误，或者没有收到响应，它会返回一个表示调用结果的错误状态。
例如，如果 Service Worker 没有收到响应，它会创建一个 [504 Gateway Timeout](https://developer.mozilla.org/docs/Web/HTTP/Status/504) 状态并返回。在这个例子中，返回 `504` 状态可能是因为服务器离线或客户端断开了连接。

## 调试 Angular Service Worker {#debugging-the-angular-service-worker}

有时，可能需要检查处于运行状态的 Angular Service Worker，以排查问题或确认它是否按设计运行。
浏览器提供了用于调试 Service Worker 的内置工具，Angular Service Worker 本身也包含一些有用的调试功能。

### 查找和分析调试信息 {#locating-and-analyzing-debugging-information}

Angular Service Worker 会在 `ngsw/` 虚拟目录下公开调试信息。
目前，唯一公开的 URL 是 `ngsw/state`。
下面是这个调试页面内容的一个示例：

```shell

NGSW Debug Info:

Driver version: 13.3.7
Driver state: NORMAL ((nominal))
Latest manifest hash: eea7f5f464f90789b621170af5a569d6be077e5c
Last update check: never

=== Version eea7f5f464f90789b621170af5a569d6be077e5c ===

Clients: 7b79a015-69af-4d3d-9ae6-95ba90c79486, 5bc08295-aaf2-42f3-a4cc-9e4ef9100f65

=== Idle Task Queue ===
Last update tick: 1s496u
Last update run: never
Task queue:

- init post-load (update, cleanup)

Debug log:

```

#### 驱动状态 {#driver-state}

第一行表示驱动状态：

```shell

Driver state: NORMAL ((nominal))

```

`NORMAL` 表示 Service Worker 运行正常，没有处于降级状态。

有两种可能的降级状态：

| 降级状态         | 详情                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXISTING_CLIENTS_ONLY` | Service Worker 没有应用最新已知版本的干净副本。较旧的已缓存版本可以安全使用，因此现有的标签页会继续从缓存运行，但新加载的应用会从网络提供。当检测到并安装了应用的新版本时，Service Worker 会尝试从这种状态中恢复。这会在有新的 `ngsw.json` 可用时发生。 |
| `SAFE_MODE`             | Service Worker 无法保证使用缓存数据的安全性。要么发生了意外错误，要么所有已缓存的版本都无效。所有流量都会从网络提供，并尽可能少地运行 Service Worker 代码。                                                                                                                                                                                  |

在这两种情况下，括号中的注释都会给出
导致 Service Worker 进入降级状态的错误。

这两种状态都是暂时的；它们只在 [ServiceWorker 实例](https://developer.mozilla.org/docs/Web/API/ServiceWorkerGlobalScope)的生命周期内保存。
浏览器有时会终止空闲的 Service Worker 以节省内存和处理器资源，并在响应网络事件时创建新的 Service Worker 实例。
无论之前实例的状态如何，新实例都以 `NORMAL` 模式启动。

#### 最新清单哈希 {#latest-manifest-hash}

```shell

Latest manifest hash: eea7f5f464f90789b621170af5a569d6be077e5c

```

这是 Service Worker 所知的应用最新版本的 SHA1 哈希。

#### 上次更新检查 {#last-update-check}

```shell

Last update check: never

```

它表示 Service Worker 上次检查应用新版本（即更新）的时间。
`never` 表示 Service Worker 从未检查过更新。

在这个示例调试文件中，更新检查目前已被安排执行，下一节会对此进行解释。

#### 版本 {#version}

```shell

=== Version eea7f5f464f90789b621170af5a569d6be077e5c ===

Clients: 7b79a015-69af-4d3d-9ae6-95ba90c79486, 5bc08295-aaf2-42f3-a4cc-9e4ef9100f65

```

在这个例子中，Service Worker 缓存了应用的一个版本，并用它为两个不同的标签页提供服务。

::: tip 提示
这个版本哈希就是上面列出的「最新清单哈希（latest manifest hash）」。两个客户端都在使用最新版本。每个客户端都按其在浏览器 `Clients` API 中的 ID 列出。

:::

#### 空闲任务队列 {#idle-task-queue}

```shell

=== Idle Task Queue ===
Last update tick: 1s496u
Last update run: never
Task queue:

- init post-load (update, cleanup)

```

空闲任务队列（Idle Task Queue）是 Service Worker 中所有在后台执行的待处理任务的队列。
如果队列中有任何任务，它们会连同描述一起列出。
在这个例子中，Service Worker 安排了一个这样的任务，即一个初始化后的操作，包括更新检查和清理过时的缓存。

last update tick/run 计数器给出了自与空闲队列相关的特定事件发生以来经过的时间。
「Last update run」计数器显示空闲任务上次实际执行的时间。
「Last update tick」显示自上一个可能触发队列处理的事件以来经过的时间。

#### 调试日志 {#debug-log}

```shell

Debug log:

```

Service Worker 中发生的错误会记录在这里。

### 开发者工具 {#developer-tools}

Chrome 等浏览器提供了用于与 Service Worker 交互的开发者工具。
这些工具在正确使用时非常强大，但有几点需要注意。

- 使用开发者工具时，Service Worker 会一直在后台运行，永远不会重启。
  这可能导致打开开发者工具时的行为与用户实际体验到的行为不同。

- 如果你查看 Cache Storage 查看器，会发现缓存经常是过时的。
  右键单击 Cache Storage 标题并刷新缓存即可。

- 在 Service Worker 面板中停止并重新启动 Service Worker 会检查更新

## Service Worker 的安全保护 {#service-worker-safety}

bug 或错误的配置可能会导致 Angular Service Worker 出现意外行为。
如果发生这种情况，Angular Service Worker 包含几种故障保护机制，以便管理员在需要时快速停用 Service Worker。

### 故障保护 {#fail-safe}

要停用 Service Worker，请重命名或删除 `ngsw.json` 文件。
当 Service Worker 对 `ngsw.json` 的请求返回 `404` 时，Service Worker 会删除它的所有缓存并注销自身，实际上就是自毁。

### 安全 Worker {#safety-worker}

<!-- vale Angular.Google_Acronyms = NO -->

`@angular/service-worker` npm 包中还包含一个小脚本 `safety-worker.js`。
它被加载后，会从浏览器中注销自身，并删除 Service Worker 的缓存。
这个脚本可以作为最后的手段，用来清除已经安装在客户端页面上的不需要的 Service Worker。

<!-- vale Angular.Google_Acronyms = YES -->

::: danger 严重
你不能直接注册这个 worker，因为带有缓存状态的旧客户端可能看不到用于安装另一个 worker 脚本的新 `index.html`。

:::

相反，你必须在要注销的 Service Worker 脚本所在的 URL 上提供 `safety-worker.js` 的内容。你必须一直这样做，直到确定所有用户都已成功注销旧的 worker。
对于大多数网站来说，这意味着你应该永远在旧的 Service Worker URL 上提供这个安全 worker。
这个脚本可用于停用 `@angular/service-worker` 并删除相应的缓存。它还会删除过去可能在你的网站上提供过的任何其他 Service Worker。

### 更改应用的位置 {#changing-your-application-s-location}

::: warning 重要
Service Worker 无法在重定向之后工作。
你可能已经遇到过错误 `The script resource is behind a redirect, which is disallowed`。

:::

如果你必须更改应用的位置，这可能会成为一个问题。
如果你设置了从旧位置（例如 `example.com`）到新位置（本例中为 `www.example.com`）的重定向，worker 就会停止工作。
此外，对于完全从 Service Worker 加载网站的用户来说，重定向根本不会触发。
在 `example.com` 上注册的旧 worker 会尝试更新，并向旧位置 `example.com` 发送请求。这个请求被重定向到新位置 `www.example.com`，从而产生错误：`The script resource is behind a redirect, which is disallowed`。

要解决这个问题，你可能需要使用前面介绍的方法之一停用旧的 worker：[故障保护](#fail-safe)或[安全 Worker](#safety-worker)。

## 关于 Angular Service Worker 的更多内容 {#more-on-angular-service-workers}

你可能还对以下内容感兴趣：

- [配置文件](/ecosystem/service-workers/config)
- [与 Service Worker 通信](/ecosystem/service-workers/communications)

