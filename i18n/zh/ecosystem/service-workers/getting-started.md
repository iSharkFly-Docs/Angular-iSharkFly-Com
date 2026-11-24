# Service Worker 入门

本文介绍如何在使用 [Angular CLI](/tools/cli) 创建的项目中启用 Angular Service Worker 支持，然后通过一个示例展示 Service Worker 的实际运行效果，演示加载和基本的缓存（cache）功能。

## 为项目添加 Service Worker

要在项目中设置 Angular Service Worker，请运行以下 CLI 命令：

```shell

ng add @angular/pwa

```

CLI 会通过以下操作，将你的应用配置为使用 Service Worker：

1. 将 `@angular/service-worker` 包添加到你的项目中。
1. 在 CLI 中启用 Service Worker 构建支持。
1. 在应用的根提供者中导入并注册 Service Worker。
1. 更新 `index.html` 文件：
   - 添加一个用于引入 `manifest.webmanifest` 文件的链接
   - 添加 `theme-color` 的 meta 标签
1. 安装图标文件，以支持已安装的渐进式 Web 应用（PWA）。
1. 创建名为 [`ngsw-config.json`](/ecosystem/service-workers/config) 的 Service Worker 配置文件，
   用于指定缓存行为和其他设置。

现在，构建项目：

```shell

ng build

```

这个 CLI 项目现在已经设置为使用 Angular Service Worker 了。

## Service Worker 实战：一次导览

本节通过一个示例应用来演示 Service Worker 的实际运行效果。
要在本地开发期间启用 Service Worker 支持，请使用以下命令以生产配置运行：

```shell

ng serve --configuration=production

```

或者，你也可以使用 npm 上的 [`http-server package`](https://www.npmjs.com/package/http-server)，
它支持 Service Worker 应用。无需安装即可通过以下命令运行：

```shell

npx http-server -p 8080 -c-1 dist/<project-name>/browser

```

这会在 http://localhost:8080 上提供带有 Service Worker 支持的应用。

### 初始加载

服务器在端口 `8080` 上运行后，在浏览器中访问 `http://localhost:8080`。
你的应用应该能正常加载。

::: tip 提示
测试 Angular Service Worker 时，最好使用浏览器的隐身窗口或无痕窗口，以确保 Service Worker 不会读取先前遗留的状态，否则可能导致意外行为。

:::

::: tip 提示
如果你没有使用 HTTPS，那么只有在 `localhost` 上访问应用时才会注册 Service Worker。

:::

### 模拟网络故障

要模拟网络故障，请为你的应用禁用网络交互。

在 Chrome 中：

1. 选择 **Tools** > **Developer Tools**（位于右上角的 Chrome 菜单中）。
1. 转到 **Network tab**。
1. 在 **Throttling** 下拉菜单中选择 **Offline**。

<img alt="The offline option in the Network tab is selected" src="/assets/images/guide/service-worker/offline-option.png">

现在，应用无法进行任何网络交互。

对于未使用 Angular Service Worker 的应用，此时刷新会显示 Chrome 的网络断开页面，提示 "There is no Internet connection"。

添加 Angular Service Worker 之后，应用的行为发生了变化。
刷新时，页面能够正常加载。

查看 Network 标签页，以确认 Service Worker 处于活动状态。

<img alt="Requests are marked as from ServiceWorker" src="/assets/images/guide/service-worker/sw-active.png">

::: tip 提示
在 "Size" 列下，请求的状态为 `(ServiceWorker)`。
这表示这些资源并不是从网络加载的，
而是从 Service Worker 的缓存中加载的。

:::

### 缓存了哪些内容？

注意，浏览器渲染此应用所需的所有文件都已被缓存。
`ngsw-config.json` 的样板配置被设置为缓存 CLI 所使用的特定资源：

- `index.html`（对于使用服务端渲染或预渲染的应用，还包括 `index.csr.html`）
- `favicon.ico` 和 `manifest.webmanifest`
- 构建产物（JS 和 CSS 包（bundle））
- 浏览器输出目录（默认为 `./dist/<project-name>/browser/`）中任意位置的图片和字体

::: warning 重要
生成的 `ngsw-config.json` 只包含有限的可缓存字体和图片扩展名列表。在某些情况下，你可能需要修改 glob 模式以满足自己的需求。

:::

### 修改你的应用

你已经了解了 Service Worker 如何缓存应用，下一步是了解更新是如何工作的。
对应用做一些修改，然后观察 Service Worker 如何安装更新：

1. 如果你是在隐身窗口中测试，请打开第二个空白标签页。
   这样可以在测试期间保持隐身窗口和缓存状态不被清除。

1. 关闭应用标签页，但不要关闭窗口。
   这样也会同时关闭开发者工具。

1. 关闭 `http-server`（Ctrl-c）。
1. 打开 `src/app/app.html` 进行编辑。
1. 将文本 `Hello, {{ title() }}` 修改为 `Bienvenue à {{ title() }}!`。
1. 重新构建并运行服务器：

```shell
    ng build
    npx http-server -p 8080 -c-1 dist/<project-name>/browser
```

### 在浏览器中更新应用

现在来看看浏览器和 Service Worker 是如何处理更新后的应用的。

1. 在同一个窗口中再次打开 [http://localhost:8080](http://localhost:8080)。
   发生了什么？

   <img alt="It still says Welcome to Service Workers!" src="/assets/images/guide/service-worker/welcome-msg-en.png">

   哪里出错了吗？
   _其实什么问题都没有！_
   Angular Service Worker 正在履行它的职责：即使有可用的更新，它也会提供它已 **安装** 的应用版本。
   为了速度，Service Worker 不会等到检查完更新后才提供已缓存的应用。

   查看 `http-server` 的日志，可以看到 Service Worker 正在请求 `/ngsw.json`。

   ```text
   [2023-09-07T00:37:24.372Z]  "GET /ngsw.json?ngsw-cache-bust=0.9365263935102124" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
   ```

   Service Worker 就是通过这种方式检查更新的。

1. 刷新页面。

   <img alt="The text has changed to say Bienvenue à app!" src="/assets/images/guide/service-worker/welcome-msg-fr.png">

   Service Worker 已在 _后台_ 安装了应用的更新版本，下次加载或重新加载页面时，Service Worker 就会切换到最新版本。

## Service Worker 配置

Angular Service Worker 通过 `SwRegistrationOptions` 接口支持全面的配置选项，可以对注册行为、缓存和脚本执行进行细粒度控制。

### 启用和禁用 Service Worker

`enabled` 选项控制是否注册 Service Worker，以及相关服务是否尝试与它通信。

```ts
import {ApplicationConfig, isDevMode} from '@angular/core';
import {provideServiceWorker} from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(), // 在开发环境中禁用，在生产环境中启用
    }),
  ],
};
```

### 使用 updateViaCache 控制缓存

`updateViaCache` 选项控制浏览器在更新 Service Worker 时如何查询 HTTP 缓存。借助它，你可以细粒度地控制浏览器何时获取更新后的 Service Worker 脚本及其导入的模块。

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      updateViaCache: 'imports',
    }),
  ],
};
```

`updateViaCache` 选项可接受以下值：

- **`'imports'`** - 对 Service Worker 脚本所导入的脚本查询 HTTP 缓存，但对 Service Worker 脚本本身不查询
- **`'all'`** - 对 Service Worker 脚本及其导入的脚本都查询 HTTP 缓存
- **`'none'`** - 对 Service Worker 脚本及其导入的脚本都不查询 HTTP 缓存

### 使用 type 选项支持 ES 模块

`type` 选项用于在注册 Service Worker 时指定脚本类型，从而让你可以在 Service Worker 脚本中使用 ES 模块特性。

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      type: 'module', // 启用 ES 模块特性
    }),
  ],
};
```

`type` 选项可接受以下值：

- **`'classic'`**（默认）- 传统的 Service Worker 脚本执行方式。脚本中**不允许**使用 `import` 和 `export` 等 ES 模块特性
- **`'module'`** - 将脚本注册为 ES 模块。允许使用 `import`/`export` 语法和模块特性

### 控制注册作用域

`scope` 选项定义 Service Worker 的注册作用域，决定它可以控制哪些范围的 URL。

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      scope: '/app/', // Service Worker 只会控制 /app/ 下的 URL
    }),
  ],
};
```

- 控制 Service Worker 可以拦截和管理哪些 URL
- 默认情况下，作用域是包含 Service Worker 脚本的目录
- 在调用 `ServiceWorkerContainer.register()` 时使用

### 配置注册策略

`registrationStrategy` 选项定义何时向浏览器注册 Service Worker，用于控制注册的时机。

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
```

可用的注册策略：

- **`'registerWhenStable:timeout'`**（默认值：`'registerWhenStable:30000'`）- 在应用稳定（没有待处理的微任务 / 宏任务）后立即注册，但不晚于指定的超时时间（以毫秒为单位）
  超时时间是必需的。如果不指定，`'registerWhenStable'` 会立即注册 Service Worker。
- **`'registerImmediately'`** - 立即注册 Service Worker
- **`'registerWithDelay:timeout'`** - 延迟指定的超时时间（以毫秒为单位）后注册

```ts
// 立即注册
export const immediateConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately',
    }),
  ],
};

// 延迟 5 秒后注册
export const delayedConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWithDelay:5000',
    }),
  ],
};
```

你还可以提供一个返回可观察对象（Observable）的工厂函数，来自定义注册时机：

```ts
import {ApplicationConfig, isDevMode} from '@angular/core';
import {provideServiceWorker} from '@angular/service-worker';
import {timer} from 'rxjs';

export const customConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: () => timer(10_000), // 10 秒后注册
    }),
  ],
};
```

## 关于 Angular Service Worker 的更多内容

你可能还对以下内容感兴趣：

- [配置文件](/ecosystem/service-workers/config)
- [与 Service Worker 通信](/ecosystem/service-workers/communications)
- [推送通知](/ecosystem/service-workers/push-notifications)
- [Service Worker 运维](/ecosystem/service-workers/devops)
- [应用外壳（App Shell）模式](/ecosystem/service-workers/app-shell)
