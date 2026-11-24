# Angular 路由 {#angular-routing}

路由（routing）帮助你改变用户在单页应用中看到的内容。


Angular 路由器（Router，`@angular/router`）是用于管理 Angular 应用中导航（navigation）的官方库，也是框架的核心组成部分。所有通过 Angular CLI 创建的项目都会默认包含它。

## 为什么 SPA 需要路由？ {#why-is-routing-necessary-in-a-spa}

当你在 Web 浏览器中访问某个 URL 时，浏览器通常会向 Web 服务器发出网络请求，并显示返回的 HTML 页面。当你访问另一个 URL（例如点击链接）时，浏览器会再发出一次网络请求，并用新页面替换整个页面。

单页应用（SPA）的不同之处在于，浏览器只会为第一个页面（即 `index.html`）向 Web 服务器发出请求。之后，由客户端路由器接管，根据 URL 控制显示哪些内容。当用户导航到另一个 URL 时，路由器会就地更新页面内容，而不会触发整页重新加载。

## Angular 如何管理路由 {#how-angular-manages-routing}

Angular 中的路由由三个主要部分组成：

1. **路由**（Route）定义了用户访问特定 URL 时显示哪个组件（component）。
2. **出口**（outlet）是模板（template）中的占位符，会根据当前激活的路由动态加载并渲染组件。
3. **链接**（Link）让用户可以在应用的不同路由之间导航，而不会触发整页重新加载。

此外，Angular 路由库还提供了其他功能，例如：

- 嵌套路由
- 编程式导航
- 路由参数、查询参数和通配符
- 通过 `ActivatedRoute` 获取激活路由的信息
- 使用路由资源（resource）和解析器（resolver）获取数据
- 视图过渡效果
- 导航守卫

## 后续步骤 {#next-steps}

了解如何[使用 Angular 路由器定义路由](/guide/routing/define-routes)。
