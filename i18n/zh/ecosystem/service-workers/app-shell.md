# 应用外壳模式

[应用外壳（App Shell）模式](https://developer.chrome.com/blog/app-shell)是一种在构建时使用某个路由来渲染应用一部分内容的方式。
它可以快速呈现一个静态渲染的页面（所有页面共用的骨架），同时浏览器在后台下载完整的客户端版本，并在代码加载完成后自动切换过去，从而改善用户体验。

这样，用户能很快看到应用有意义的首次绘制，因为浏览器无需初始化任何 JavaScript 就能渲染 HTML 和 CSS。


### 1. 准备应用

使用下面的 Angular CLI 命令来完成：

```shell
ng new my-app
```

对于现有应用，你需要手动添加 `Router`，并在应用中定义一个 `<router-outlet>`。

### 2. 创建应用外壳

使用 Angular CLI 自动创建应用外壳。

```shell
ng generate app-shell
```

关于此命令的更多信息，参见[应用外壳命令](https://angular.dev/cli/generate/app-shell)。

该命令会更新应用代码，并向项目结构中添加额外的文件。

```text
src
├── app
│ ├── app.config.server.ts # 服务端应用配置
│ ├── app.routes.server.ts # 服务端路由配置
│ └── app-shell # app-shell 组件
│   ├── app-shell.css
│   ├── app-shell.html
│   ├── app-shell.spec.ts
│   └── app-shell.ts
└── main.server.ts # 服务端应用的主引导文件
```

### 3. 验证应用构建时包含了外壳内容

```shell
ng build --configuration=development
```

或者使用生产配置。

```shell
ng build
```

要验证构建输出，请打开 <code class="no-auto-link">dist/my-app/browser/index.html</code>。
查找默认文本 `app-shell works!`，它表明应用外壳路由已作为输出的一部分被渲染出来。


