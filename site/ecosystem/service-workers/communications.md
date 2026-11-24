# 与 Service Worker 通信 {#communicating-with-the-service-worker}

启用 Service Worker 支持不仅仅是注册 Service Worker，它还会提供一些服务，你可以用它们与 Service Worker 交互，并控制应用的缓存（cache）。

## `SwUpdate` 服务 {#swupdate-service}

`SwUpdate` 服务让你可以访问一些事件，这些事件会在 Service Worker 发现并安装应用的可用更新时发出通知。

`SwUpdate` 服务支持三种独立的操作：

- 在服务器上 _检测到_ 新版本、新版本 _已安装并可在本地使用_，或者 _安装失败_ 时接收通知。
- 要求 Service Worker 检查服务器上是否有新的更新。
- 要求 Service Worker 为当前标签页激活应用的最新版本。

### 版本更新 {#version-updates}

`versionUpdates` 是 `SwUpdate` 的一个 `Observable` 属性，会发出四种事件类型：

| 事件类型                      | 详情                                                                                                                                                                     |
| :------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VersionDetectedEvent`           | 当 Service Worker 在服务器上检测到应用的新版本并即将开始下载时发出。                                                   |
| `NoNewVersionDetectedEvent`      | 当 Service Worker 检查了服务器上的应用版本但未发现新版本时发出。                                                            |
| `VersionReadyEvent`              | 当应用的新版本可供客户端激活时发出。可以用它通知用户有可用的更新，或提示用户刷新页面。 |
| `VersionInstallationFailedEvent` | 当新版本安装失败时发出。可用于日志记录或监控。                                                                      |

```ts [log-update.service.ts]
@Service()
export class LogUpdateService {
  private updates = inject(SwUpdate);
  constructor() {
    this.updates.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
      }
    });
  }
}
```

### 检查更新 {#checking-for-updates}

你可以要求 Service Worker 检查服务器上是否部署了任何更新。
Service Worker 会在初始化期间以及每次导航请求时（即用户从其他地址导航到你的应用时）检查更新。
不过，如果你的网站变化频繁，或者希望按计划进行更新，也可以选择手动检查更新。

使用 `checkForUpdate()` 方法来实现：

```ts [check-for-update.service.ts]
import {ApplicationRef, inject, Service} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {concat, interval, first} from 'rxjs';

@Service()
export class CheckForUpdateService {
  private appRef = inject(ApplicationRef);
  private updates = inject(SwUpdate);

  constructor() {
    // 先让应用稳定下来，再开始
    // 使用 `interval()` 轮询更新。
    const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable === true));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await this.updates.checkForUpdate();
        console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }
}
```

该方法返回一个 `Promise<boolean>`，表示是否有可供激活的更新。
检查可能会失败，此时 `Promise` 会被拒绝（reject）。

::: warning 稳定性与 Service Worker 注册
为了避免对页面的初始渲染造成负面影响，默认情况下，Angular Service Worker 服务会等待应用稳定（最多 30 秒）后再注册 ServiceWorker 脚本。

持续轮询更新（例如使用 [setInterval()](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/setInterval) 或 RxJS 的 [interval()](https://rxjs.dev/api/index/function/interval)）会阻止应用进入稳定状态，导致 ServiceWorker 脚本直到达到 30 秒上限时才会向浏览器注册。

应用中进行的任何形式的轮询都是如此。
更多信息请参阅 [isStable](https://angular.dev/api/core/ApplicationRef#isStable) 文档。

如前面的示例所示，先等待应用稳定，再开始轮询更新，就可以避免这种延迟。
或者，你也可以为 ServiceWorker 定义不同的 [注册策略](https://angular.dev/api/service-worker/SwRegistrationOptions#registrationStrategy)。
:::

### 更新到最新版本 {#updating-to-the-latest-version}

你可以在新版本就绪后立即重新加载页面，将现有标签页更新到最新版本。
为了避免打断用户的操作，通常最好先提示用户，让他们确认可以重新加载页面并更新到最新版本：

```ts [prompt-update.service.ts]
@Service()
export class PromptUpdateService {
  constructor() {
    const swUpdate = inject(SwUpdate);
    swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe((evt) => {
        if (promptUser(evt)) {
          // 重新加载页面以更新到最新版本。
          document.location.reload();
        }
      });
  }
}
```

::: warning 不重新加载就更新的安全性
调用 `activateUpdate()` 可以在不重新加载页面的情况下将标签页更新到最新版本，但这可能会破坏应用。

不重新加载就更新，可能会导致应用外壳（App Shell）与其他页面资源（例如延迟加载（lazy loading）的代码块，其文件名可能在不同版本之间发生变化）之间出现版本不匹配。

只有在确定对你的特定用例而言是安全的情况下，才应该使用 `activateUpdate()`。
:::

### 处理不可恢复的状态 {#handling-an-unrecoverable-state}

在某些情况下，Service Worker 用来为客户端提供服务的应用版本可能处于损坏状态，不进行整页重新加载就无法恢复。

例如，设想以下场景：

1. 用户首次打开应用，Service Worker 缓存了应用的最新版本。
   假设应用缓存的资源包括 `index.html`、`main.<main-hash-1>.js` 和 `lazy-chunk.<lazy-hash-1>.js`。

1. 用户关闭了应用，并在一段时间内没有再打开。
1. 一段时间后，应用的新版本被部署到服务器上。
   这个新版本包含文件 `index.html`、`main.<main-hash-2>.js` 和 `lazy-chunk.<lazy-hash-2>.js`。

::: warning 重要
由于文件内容发生了变化，哈希值现在也不同了。旧版本在服务器上已不再可用。

:::

1. 与此同时，用户的浏览器决定将 `lazy-chunk.<lazy-hash-1>.js` 从缓存中清除。
   浏览器可能会为了回收磁盘空间，而决定从缓存中清除特定（或全部）资源。

1. 用户再次打开应用。
   Service Worker 提供此时它所知道的最新版本，也就是旧版本（`index.html` 和 `main.<main-hash-1>.js`）。

1. 稍后某个时刻，应用请求延迟加载的包 `lazy-chunk.<lazy-hash-1>.js`。
1. Service Worker 无法在缓存中找到该资源（别忘了浏览器已经把它清除了），
   也无法从服务器获取它（因为服务器现在只有新版本中的 `lazy-chunk.<lazy-hash-2>.js`）。

在上述场景中，Service Worker 无法提供一个通常本应被缓存的资源。
这个特定的应用版本已经损坏，除了重新加载页面之外，没有其他办法修复客户端的状态。
在这种情况下，Service Worker 会通过发送 `UnrecoverableStateEvent` 事件来通知客户端。
订阅 `SwUpdate#unrecoverable` 即可收到通知并处理这些错误。

```ts [handle-unrecoverable-state.service.ts]
@Service()
export class HandleUnrecoverableStateService {
  private updates = inject(SwUpdate);
  constructor() {
    this.updates.unrecoverable.subscribe((event) => {
      notifyUser(
        'An error occurred that we cannot recover from:\n' +
          event.reason +
          '\n\nPlease reload the page.',
      );
    });
  }
}
```

## 关于 Angular Service Worker 的更多内容 {#more-on-angular-service-workers}

你可能还对以下内容感兴趣：

- [推送通知](/ecosystem/service-workers/push-notifications)
- [Service Worker 运维](/ecosystem/service-workers/devops)
