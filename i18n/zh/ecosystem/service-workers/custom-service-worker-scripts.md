# 自定义 Service Worker 脚本

虽然 Angular Service Worker 提供了出色的能力，但你可能还需要添加一些自定义功能，例如处理推送通知（push notification）、后台同步或其他 Service Worker 事件。你可以创建一个自定义的 Service Worker 脚本，在其中导入并扩展 Angular Service Worker。

## 创建自定义 Service Worker

要创建一个扩展 Angular 功能的自定义 Service Worker：

1. 在 `src` 目录中创建一个自定义 Service Worker 文件（例如 `custom-sw.js`）：

```js
// 导入 Angular Service Worker
importScripts('./ngsw-worker.js');

(function () {
  'use strict';

  // 添加自定义的通知点击处理器
  self.addEventListener('notificationclick', (event) => {
    console.log('Custom notification click handler');
    console.log('Notification details:', event.notification);

    // 处理通知点击：如果提供了 URL，就打开它
    if (clients.openWindow && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url));
      console.log('Opening URL:', event.notification.data.url);
    }
  });

  // 添加自定义的后台同步处理器
  self.addEventListener('sync', (event) => {
    console.log('Custom background sync handler');

    if (event.tag === 'background-sync') {
      event.waitUntil(doBackgroundSync());
    }
  });

  function doBackgroundSync() {
    // 在这里实现你的后台同步逻辑
    return fetch('https://example.com/api/sync')
      .then((response) => response.json())
      .then((data) => console.log('Background sync completed:', data))
      .catch((error) => console.error('Background sync failed:', error));
  }
})();
```

2. 更新 `angular.json` 文件，以使用自定义的 Service Worker：

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "public"
              },
              "app/src/custom-sw.js"
            ]
          }
        }
      }
    }
  }
}
```

3. 配置 Service Worker 的注册，以使用你的自定义脚本：

```ts
import {ApplicationConfig, isDevMode} from '@angular/core';
import {provideServiceWorker} from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('custom-sw.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
```

### 自定义 Service Worker 的最佳实践

扩展 Angular Service Worker 时：

- **始终先导入 Angular Service Worker**：使用 `importScripts('./ngsw-worker.js')`，以确保获得所有缓存（cache）和更新功能
- **将自定义代码包裹在 IIFE 中**（立即调用函数表达式，Immediately Invoked Function Expression），以避免污染全局作用域
- **对异步操作使用 `event.waitUntil()`**，以确保它们在 Service Worker 终止之前完成
- 在开发环境和生产环境中都要 **进行充分测试**
- **妥善处理错误**，防止自定义代码破坏 Angular Service Worker 的功能

### 常见用例

自定义 Service Worker 通常用于：

- **推送通知**：处理传入的推送消息并显示通知
- **后台同步**：在网络连接恢复时同步数据
- **自定义导航**：处理特殊的路由或离线页面场景
