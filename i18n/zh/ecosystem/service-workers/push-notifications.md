# 推送通知

推送通知（push notification）是吸引用户参与的一种有效方式。
借助 Service Worker 的强大能力，即使你的应用不在焦点上，通知也可以送达设备。

Angular Service Worker 支持显示推送通知以及处理通知的点击事件。

::: tip 提示
使用 Angular Service Worker 时，推送通知的交互通过 `SwPush` 服务来处理。
要进一步了解其中涉及的浏览器 API，请参阅 [Push API](https://developer.mozilla.org/docs/Web/API/Push_API) 和 [Using the Notifications API](https://developer.mozilla.org/docs/Web/API/Notifications_API/Using_the_Notifications_API)。

:::

## 通知载荷

通过推送一条带有有效载荷（payload）的消息来触发推送通知。
相关指导请参阅 `SwPush`。

::: tip 提示
在 Chrome 中，你可以在没有后端的情况下测试推送通知。
打开 Devtools -> Application -> Service Workers，使用 `Push` 输入框发送一个 JSON 格式的通知载荷。

:::

## 处理通知点击

`notificationclick` 事件的默认行为是关闭通知并通知 `SwPush.notificationClicks`。

你可以在 `data` 对象中添加 `onActionClick` 属性并提供一个 `default` 条目，来指定在 `notificationclick` 时要执行的额外操作。
当点击通知时没有任何打开的客户端，这一点尤其有用。

```json
{
  "notification": {
    "title": "New Notification!",
    "data": {
      "onActionClick": {
        "default": {"operation": "openWindow", "url": "foo"}
      }
    }
  }
}
```

### 操作

Angular Service Worker 支持以下操作：

| 操作                  | 详情                                                                                                                                          |
| :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `openWindow`                | 在指定的 URL 打开一个新标签页。                                                                                                            |
| `focusLastFocusedOrOpen`    | 聚焦到上一个获得焦点的客户端。如果没有打开的客户端，则在指定的 URL 打开一个新标签页。                                       |
| `navigateLastFocusedOrOpen` | 聚焦到上一个获得焦点的客户端，并将其导航到指定的 URL。如果没有打开的客户端，则在指定的 URL 打开一个新标签页。 |
| `sendRequest`               | 向指定的 URL 发送一个简单的 GET 请求。                                                                                                  |

::: warning 重要
URL 是相对于 Service Worker 的注册作用域来解析的。<br />如果某个 `onActionClick` 条目没有定义 `url`，则使用 Service Worker 的注册作用域。

:::

### 动作

动作（action）提供了一种方式，用于自定义用户与通知的交互方式。

使用 `actions` 属性，你可以定义一组可用的动作。
每个动作都表现为一个动作按钮，用户可以点击它来与通知交互。

此外，通过 `data` 对象上的 `onActionClick` 属性，你可以把每个动作与一个操作关联起来，在点击相应的动作按钮时执行该操作：

```json
{
  "notification": {
    "title": "New Notification!",
    "actions": [
      {"action": "foo", "title": "Open new tab"},
      {"action": "bar", "title": "Focus last"},
      {"action": "baz", "title": "Navigate last"},
      {"action": "qux", "title": "Send request in the background"},
      {"action": "other", "title": "Just notify existing clients"}
    ],
    "data": {
      "onActionClick": {
        "default": {"operation": "openWindow"},
        "foo": {"operation": "openWindow", "url": "/absolute/path"},
        "bar": {"operation": "focusLastFocusedOrOpen", "url": "relative/path"},
        "baz": {"operation": "navigateLastFocusedOrOpen", "url": "https://other.domain.com/"},
        "qux": {"operation": "sendRequest", "url": "https://yet.another.domain.com/"}
      }
    }
  }
}
```

::: warning 重要
如果某个动作没有对应的 `onActionClick` 条目，则会关闭通知，并在现有客户端上通知 `SwPush.notificationClicks`。

:::

## 关于 Angular Service Worker 的更多内容

你可能还对以下内容感兴趣：

- [与 Service Worker 通信](/ecosystem/service-workers/communications)
- [Service Worker 运维](/ecosystem/service-workers/devops)
