# 部署

当你准备好将 Angular 应用部署到远程服务器时，有多种方案可供选择。

## 使用 CLI 自动部署

Angular CLI 命令 `ng deploy` 会执行与你的项目关联的 `deploy` [CLI 构建器](/tools/cli/cli-builder)。
许多第三方构建器实现了部署到不同平台的能力。
你可以使用 `ng add` 将其中任意一个添加到项目中。

当你添加一个具备部署能力的包时，它会自动更新你的工作区配置（`angular.json` 文件），为所选项目添加一个 `deploy` 部分。
然后，你就可以使用 `ng deploy` 命令部署该项目了。

例如，以下命令会自动将项目部署到 [Firebase](https://firebase.google.com/)。

```shell

ng add @angular/fire
ng deploy

```

该命令是交互式的。
在这个例子中，你必须拥有或创建一个 Firebase 账号，并使用它进行身份验证。
该命令会提示你选择一个用于部署的 Firebase 项目，然后构建应用并将生产环境资源上传到 Firebase。

下表列出了实现了部署到不同平台功能的工具。
每个包的 `deploy` 命令可能需要不同的命令行选项。
你可以通过下方包名对应的链接了解更多信息：

| 部署目标                                                          | 设置命令                                                                                    |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| [Firebase hosting](https://firebase.google.com/docs/hosting)      | [`ng add @angular/fire`](https://www.npmjs.com/package/@angular/fire)                       |
| [Vercel](https://vercel.com/solutions/angular)                    | [`vercel init angular`](https://github.com/vercel/vercel/tree/main/examples/angular)        |
| [Netlify](https://www.netlify.com)                                | [`ng add @netlify-builder/deploy`](https://www.npmjs.com/package/@netlify-builder/deploy)   |
| [GitHub Pages](https://pages.github.com)                          | [`ng add angular-cli-ghpages`](https://www.npmjs.com/package/angular-cli-ghpages)           |
| [Amazon Cloud S3](https://aws.amazon.com/s3/?nc2=h_ql_prod_st_s3) | [`ng add @jefiozie/ngx-aws-deploy`](https://www.npmjs.com/package/@jefiozie/ngx-aws-deploy) |

如果你要部署到自行管理的服务器，或者你喜欢的云平台没有对应的构建器，你可以[创建一个构建器](/tools/cli/cli-builder)以便使用 `ng deploy` 命令，也可以阅读本指南，了解如何手动部署应用。

## 手动部署到远程服务器

要手动部署应用，请创建一个生产构建，并将输出产物部署到你的托管环境中。
默认情况下，`ng build` 使用 `production` 配置。
如果你自定义过构建配置，那么在部署之前，最好确认一下[生产环境优化](/tools/cli/deployment#production-optimizations)是否已生效。

`ng build` 默认会将构建产物输出到 `dist/my-app/`，不过这个路径可以通过 `@angular/build:application` 构建器中的 `outputPath` 选项进行配置。
具体要部署哪些内容，取决于应用的渲染方式：

- **静态托管（客户端渲染或 `outputMode: "static"`）：** 将 `dist/my-app/browser/` 目录复制到 Web 服务器或内容分发网络（CDN），并配置为提供该目录中的内容。
- **服务端渲染（`outputMode: "server"`）：** 将 `dist/my-app/browser/` 和 `dist/my-app/server/` 两个目录都复制到服务器上，然后运行 `node dist/my-app/server/server.mjs`。

更多详情请参阅[服务端渲染与混合渲染](/guide/ssr)。

虽然这是一个最简单的部署方案，但要让服务器正确地提供 Angular 应用，还需要满足一些要求。

## 服务器配置

本节介绍为了运行 Angular 应用，你可能需要在服务器上进行的配置更改。

### 带路由的应用必须回退到 `index.html`

客户端渲染的 Angular 应用非常适合用静态 HTML 服务器来提供，因为所有内容都是静态的，并在构建时生成。

如果应用使用了 Angular 路由器（Router），那么当请求服务器上不存在的文件时，你必须将服务器配置为返回应用的宿主页面（`index.html`）。

带路由的应用应该支持“深链接”。
_深链接_ 是指向应用内部某个组件路径的 URL。
例如，`http://my-app.test/users/42` 就是一个指向用户详情页的 _深链接_，该页面显示 `id` 为 42 的用户。

如果用户先加载首页，然后在运行中的客户端里导航到该 URL，是没有问题的。
Angular 路由器会在 _客户端_ 执行导航，不会请求新的 HTML 页面。

但是，点击电子邮件中的深链接、在浏览器地址栏中输入它，甚至在深链接页面上刷新浏览器，都会由浏览器自身在运行中的应用 _之外_ 处理。
浏览器会绕过 Angular 的路由器，直接向服务器请求 `/users/42`。

静态服务器在收到 `http://my-app.test/` 的请求时，通常会返回 `index.html`。
但大多数服务器默认会拒绝 `http://my-app.test/users/42` 并返回 `404 - Not Found` 错误，_除非_ 它被配置为改为返回 `index.html`。
请将服务器的回退路由或 404 页面配置为 `index.html`，这样深链接也能加载 Angular，并显示正确的路由。
有些服务器把这种回退行为称为“单页应用”（SPA）模式。

::: warning 重要
当你使用 `outputMode: "static"` 预渲染应用时，请将服务器配置为使用 `index.csr.html` 而不是 `index.html` 作为回退页面。构建过程会把宿主页面写入 `index.csr.html`，而 `index.html`（如果生成了的话）包含的是根路由（`/`）的预渲染内容。

:::

浏览器加载应用后，Angular 路由器会读取 URL 来确定当前所在的页面，并正确显示 `/users/42`。

对于 `http://my-app.test/does-not-exist` 这样“真正的” 404 页面，服务器不需要任何额外配置。
[在 Angular 路由器中实现的 404 页面](/guide/routing/common-router-tasks#displaying-a-404-page)会被正确显示。

### 从其他服务器请求数据（CORS）

当 Web 开发者向应用自身宿主服务器以外的服务器发起网络请求时，可能会遇到[_跨源资源共享_](https://developer.mozilla.org/docs/Web/HTTP/CORS 'Cross-origin resource sharing')错误。
除非服务器明确允许，否则浏览器会禁止此类请求。

对于这类错误，Angular 或客户端应用本身无能为力。
必须对 _服务器_ 进行配置，使其接受应用的请求。
关于如何为特定服务器启用 CORS，请参阅 [enable-cors.org](https://enable-cors.org/server.html 'Enabling CORS server')。

## 生产环境优化

除非另行配置，`ng build` 会使用 `production` 配置。该配置会启用以下构建优化特性。

| 特性                                                               | 详情                                                       |
| :----------------------------------------------------------------- | :--------------------------------------------------------- |
| [预先（AOT）编译](/tools/cli/aot-compiler)                          | 预编译 Angular 组件模板。                                  |
| [生产模式](/tools/cli/deployment#development-only-features)         | 优化应用以获得最佳运行时性能                               |
| 打包                                                               | 将应用和库的众多文件合并成尽可能少的部署文件。             |
| 压缩                                                               | 移除多余的空白、注释和可选的 token。                       |
| 混淆                                                               | 将函数、类和变量重命名为更短的任意标识符。                 |
| 死代码消除                                                         | 移除未被引用的模块和未使用的代码。                         |

关于 CLI 构建选项及其作用的更多信息，请参阅 [`ng build`](https://angular.dev/cli/build)。

### 仅限开发环境的特性

当你使用 `ng serve` 在本地运行应用时，Angular 会在运行时使用开发配置，
它会启用：

- 额外的安全检查，例如 [`expression-changed-after-checked`](/errors/NG0100) 检测。
- 更详细的错误消息。
- 额外的调试工具，例如带有[调试函数](/api#angular_core_globals)的全局 `ng` 变量，以及对 [Angular DevTools](/tools/devtools) 的支持。

这些特性在开发期间很有用，但它们需要在应用中加入额外的代码，
这在生产环境中是不可取的。为了确保这些特性不会对最终用户的包体积产生负面影响，Angular CLI
在为生产环境构建时会从包中移除仅用于开发的代码。

使用 `ng build` 构建应用时，默认会使用 `production` 配置，从而将这些特性从输出中移除，以获得最佳的包体积。

## `--deploy-url`

`--deploy-url` 是一个命令行选项，用于在 _编译_ 时指定解析图片、脚本和样式表等资源相对 URL 时所用的基础路径。

```shell

ng build --deploy-url /my/assets

```

`--deploy-url` 的作用和目的与 [`<base href>`](/guide/routing/router-reference#base-href) 有所重叠。两者都可以用于初始脚本、样式表、延迟加载的脚本和 CSS 资源。

`<base href>` 可以在运行时于单一位置定义，而 `--deploy-url` 则需要在构建时硬编码到应用中。
应尽可能优先使用 `<base href>`。
