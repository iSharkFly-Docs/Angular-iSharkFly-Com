# 在开发环境中运行 Angular 应用 {#serving-angular-apps-for-development}

你可以使用 `ng serve` 命令来运行 Angular CLI 应用。
该命令会编译应用、跳过不必要的优化、启动一个开发服务器，并在之后发生任何更改时自动重新构建并实时刷新。
按 `Ctrl+C` 即可停止服务器。

`ng serve` 只会执行 `angular.json` 中所指定的默认项目里 `serve` 目标的构建器。虽然这里可以使用任何构建器，但最常见（也是默认）的构建器是 `@angular/build:dev-server`。

要确定某个项目使用的是哪个构建器，可以查看该项目的 `serve` 目标。

```json
{
  "projects": {
    "my-app": {
      "architect": {
        // `ng serve` 会调用名为 `serve` 的 Architect 目标。
        "serve": {
          "builder": "@angular/build:dev-server"
          // ...
        },
        "build": {/* ... */},
        "test": {/* ... */}
      }
    }
  }
}
```

## 代理到后端服务器 {#proxying-to-a-backend-server}

通过向 `--proxy-config` 构建选项传入一个文件，可以使用[代理支持](https://vite.dev/config/server-options#server-proxy)把某些 URL 转发到后端服务器。
例如，要把所有对 `http://localhost:4200/api` 的调用转发到运行在 `http://localhost:3000/api` 上的服务器，请按以下步骤操作。

1. 在项目的 `src/` 文件夹中创建一个 `proxy.conf.json` 文件。
1. 在这个新的代理文件中添加以下内容：

```json
{
  "/api/**": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

1. 在 CLI 配置文件 `angular.json` 中，为 `serve` 目标添加 `proxyConfig` 选项：

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "serve": {
          "builder": "@angular/build:dev-server",
          "options": {
            "proxyConfig": "src/proxy.conf.json"
          }
        }
      }
    }
  }
}
```

1. 要使用此代理配置运行开发服务器，请调用 `ng serve`。

::: info 注意
修改代理配置文件后，必须重启 `ng serve` 进程才能使更改生效。

:::

### 路径匹配行为 {#path-matching-behavior}

- `/api` 匹配 `/api` 以及任何以它开头的路径，例如 `/api/users/123` 或 `/api-docs`。
- `/api/*` 匹配 `/api/users`，但不匹配 `/api` 或 `/api/users/123`。
- `/api/**` 匹配 `/api`、`/api/users` 和 `/api/users/123`，但不匹配 `/api-docs`。
