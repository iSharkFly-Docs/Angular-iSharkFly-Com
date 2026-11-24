# 创建自定义路由匹配 {#creating-custom-route-matches}

Angular 路由器（Router）支持一种强大的匹配策略，可以用来帮助用户在应用中导航（navigation）。
这种匹配策略支持静态路由、带参数的变量路由、通配符路由等。
此外，对于 URL 更复杂的情况，你还可以构建自己的自定义模式匹配。

在本教程中，你将使用 Angular 的 `UrlMatcher` 构建一个自定义路由匹配器。
这个匹配器会在 URL 中查找 X（前身为 Twitter）用户名。

## 目标 {#objectives}

实现 Angular 的 `UrlMatcher` 来创建自定义路由匹配器。

## 创建示例应用 {#create-a-sample-application}

使用 Angular CLI 创建一个新应用 *angular-custom-route-match*。
除了默认的 Angular 应用框架之外，你还要创建一个 *profile* 组件（component）。

1. 创建一个新的 Angular 项目 *angular-custom-route-match*。

   ```shell
   ng new angular-custom-route-match
   ```

   当提示 `Would you like to add Angular routing?` 时，选择 `Y`。

   当提示 `Which stylesheet format would you like to use?` 时，选择 `CSS`。

   片刻之后，新项目 `angular-custom-route-match` 就准备好了。

1. 在终端中进入 `angular-custom-route-match` 目录。
1. 创建一个组件 *profile*。

   ```shell
   ng generate component profile
   ```

1. 在代码编辑器中找到 `profile.html` 文件，把占位内容替换为以下 HTML。

   ```html [profile.html]
   <p>Hello {{ username() }}!</p>
   ```

1. 在代码编辑器中找到 `app.html` 文件，把占位内容替换为以下 HTML。

   ```html [app.html]
   <h2>Routing with Custom Matching</h2>
   
   Navigate to <a routerLink="/@Angular">my profile</a>
   
   <router-outlet />
   ```

## 为应用配置路由 {#configure-your-routes-for-your-application}

应用框架就绪后，接下来需要在 `app.config.ts` 文件中添加路由（routing）功能。
在这个过程中，你将创建一个自定义 URL 匹配器，用于在 URL 中查找 X 用户名。
这个用户名以前面的 `@` 符号作为标识。

1. 在代码编辑器中打开 `app.config.ts` 文件。
1. 添加一条 `import` 语句，导入 Angular 的 `provideRouter` 和 `withComponentInputBinding`，以及应用的路由。

   ```ts
   import {provideRouter, withComponentInputBinding} from '@angular/router';

   import {routes} from './app.routes';
   ```

1. 在 providers 数组中添加 `provideRouter(routes, withComponentInputBinding())` 语句。

1. 在应用路由中添加以下代码，定义自定义路由匹配器。

   ```ts [app.routes.ts]
   {
     matcher: (url) => {
       if (url.length === 1 && url[0].path.match(/^@[\w]+$/gm)) {
         return {consumed: url, posParams: {username: new UrlSegment(url[0].path.slice(1), {})}};
       }

       return null;
     },
     component: Profile,
   },
   ```

这个自定义匹配器是一个函数，它执行以下任务：

- 匹配器验证数组中只包含一个片段
- 匹配器使用正则表达式确保用户名的格式匹配
- 如果匹配，函数返回整个 URL，并把路径的子串定义为 `username` 路由参数
- 如果不匹配，函数返回 null，路由器会继续查找与该 URL 匹配的其他路由

::: tip 提示
自定义 URL 匹配器的行为与其他任何路由定义都一样。可以像对待其他路由那样定义子路由或延迟加载（lazy loading）的路由。

:::

## 读取路由参数 {#reading-the-route-parameters}

有了自定义匹配器之后，现在就可以在 `profile` 组件中绑定路由参数了。

在代码编辑器中打开 `profile.ts` 文件，创建一个与 `username` 参数相匹配的 `input`。
我们之前已经在 `provideRouter` 中
添加了 `withComponentInputBinding` 特性。它让 `Router` 可以把信息直接绑定到路由组件上。

```ts
username = input.required<string>();
```

## 测试自定义 URL 匹配器 {#test-your-custom-url-matcher}

代码就绪后，现在就可以测试自定义 URL 匹配器了。

1. 在终端窗口中运行 `ng serve` 命令。

   ```shell
   ng serve
   ```

1. 在浏览器中打开 `http://localhost:4200`。

   你应该会看到一个网页，其中包含一句话：`Navigate to my profile`。

1. 点击 **my profile** 超链接。

   页面上会出现一句新的话：`Hello, Angular!`。

## 后续步骤 {#next-steps}

当应用中存在动态 URL 时，Angular 路由器的模式匹配为你提供了很大的灵活性。
要进一步了解 Angular 路由器，请参阅以下主题：

- [应用内路由与导航](/guide/routing/common-router-tasks)
- [Router API](https://angular.dev/api/router/Router)


::: tip 提示
本文内容基于 [Brandon Roberts](https://x.com/brandontroberts) 的文章 [Custom Route Matching with the Angular Router](https://medium.com/@brandontroberts/custom-route-matching-with-the-angular-router-fbdd48665483)。

:::
