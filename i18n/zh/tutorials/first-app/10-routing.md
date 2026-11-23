# 为应用添加路由

本节教程演示如何为你的应用添加路由。

<iframe src="https://www.youtube.com/embed/r5DEBMuStPw?si=H6Bx6nLJoMLaMxkx" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: warning 重要
我们建议使用本地环境来学习路由。

:::

## 你将学到什么

在本节课结束时，你的应用将支持路由。

## 路由的概念预览

本教程介绍 Angular 中的路由。路由是指在应用中从一个组件（Component）导航到另一个组件的能力。在[单页应用（SPA）](/guide/routing)中，只会更新页面的一部分，以便为用户呈现所请求的视图。

[Angular 路由器（Router）](/guide/routing)让用户可以声明路由，并指定当应用请求某个路由时应在屏幕上显示哪个组件。

在本节课中，你将在应用中启用路由，以便导航到详情页。



### 1. 创建一个默认的详情组件 

1. 在终端中输入以下命令来创建 `Details`：

    ```shell
    ng generate component details
    ```

    该组件将表示详情页，用于提供某个房源位置的更多信息。


### 2. 为应用添加路由

1.  在 `src/app` 目录下，创建一个名为 `routes.ts` 的文件。我们将在这个文件中定义应用的路由。

2.  在 `main.ts` 中，进行以下修改以在应用中启用路由：
    1.  导入路由文件和 `provideRouter` 函数：

          ```ts [Import routing details in src/main.ts]
          import {bootstrapApplication} from '@angular/platform-browser';
          import {App} from './app/app';
          import {provideRouter} from '@angular/router';
          import routeConfig from './app/routes';

          bootstrapApplication(App, {
            providers: [provideRouter(routeConfig)],
          }).catch((err) => console.error(err));
          ```

    1.  更新对 `bootstrapApplication` 的调用，使其包含路由配置：

          ```ts [Add router configuration in src/main.ts]
          import {bootstrapApplication} from '@angular/platform-browser';
          import {App} from './app/app';
          import {provideRouter} from '@angular/router';
          import routeConfig from './app/routes';

          bootstrapApplication(App, {
            providers: [provideRouter(routeConfig)],
          }).catch((err) => console.error(err));
          ```

3.  在 `src/app/app.ts` 中，更新组件以使用路由：
    1.  为路由指令（Directive）`RouterLink` 和 `RouterOutlet` 添加文件级导入：

          ```ts [Import router directives in src/app/app.ts]
          import {Component} from '@angular/core';
          import {RouterLink, RouterOutlet} from '@angular/router';

          @Component({
            selector: 'app-root',
            imports: [RouterLink, RouterOutlet],
            template: `
              <main>
                <a [routerLink]="['/']">
                  <header class="brand-name">
                    <img class="brand-logo" src="/public/logo.svg" alt="logo" aria-hidden="true" />
                  </header>
                </a>
                <section class="content">
                  <router-outlet />
                </section>
              </main>
            `,
            styleUrl: './app.css',
          })
          export class App {
            title = 'homes';
          }
          ```

    1.  在 `@Component` 元数据的 imports 中，将 `Home` 替换为 `RouterLink` 和 `RouterOutlet`：

          ```ts [Add router directives to component imports in src/app/app.ts]
          import {Component} from '@angular/core';
          import {RouterLink, RouterOutlet} from '@angular/router';

          @Component({
            selector: 'app-root',
            imports: [RouterLink, RouterOutlet],
            template: `
              <main>
                <a [routerLink]="['/']">
                  <header class="brand-name">
                    <img class="brand-logo" src="/public/logo.svg" alt="logo" aria-hidden="true" />
                  </header>
                </a>
                <section class="content">
                  <router-outlet />
                </section>
              </main>
            `,
            styleUrl: './app.css',
          })
          export class App {
            title = 'homes';
          }
          ```

    1.  在 `template` 属性中，将 `<app-home />` 标签替换为 `<router-outlet>` 指令，并添加一个返回首页的链接。你的代码应与以下代码一致：

          ```ts [Add router-outlet in src/app/app.ts]
          import {Component} from '@angular/core';
          import {RouterLink, RouterOutlet} from '@angular/router';

          @Component({
            selector: 'app-root',
            imports: [RouterLink, RouterOutlet],
            template: `
              <main>
                <a [routerLink]="['/']">
                  <header class="brand-name">
                    <img class="brand-logo" src="/public/logo.svg" alt="logo" aria-hidden="true" />
                  </header>
                </a>
                <section class="content">
                  <router-outlet />
                </section>
              </main>
            `,
            styleUrl: './app.css',
          })
          export class App {
            title = 'homes';
          }
          ```


### 3. 为新组件添加路由

在上一步中，你移除了模板（Template）中对 `<app-home>` 组件的引用。在这一步中，你将为该组件添加一个新路由。

1. 在 `routes.ts` 中，进行以下修改来创建路由。
   1. 为 `Home`、`Details` 以及将在路由定义中使用的 `Routes` 类型添加文件级导入。

      ```ts [Import components and Routes]
      import {Routes} from '@angular/router';
      import {Home} from './home/home';
      import {Details} from './details/details';

      const routeConfig: Routes = [
        {
          path: '',
          component: Home,
          title: 'Home page',
        },
        {
          path: 'details/:id',
          component: Details,
          title: 'Home details',
        },
      ];

      export default routeConfig;
      ```

   1. 定义一个名为 `routeConfig`、类型为 `Routes` 的变量，并为应用定义两个路由：
      ```ts [Add routes to the app]
      import {Routes} from '@angular/router';
      import {Home} from './home/home';
      import {Details} from './details/details';

      const routeConfig: Routes = [
        {
          path: '',
          component: Home,
          title: 'Home page',
        },
        {
          path: 'details/:id',
          component: Details,
          title: 'Home details',
        },
      ];

      export default routeConfig;
      ```

      `routeConfig` 数组中的条目表示应用中的路由。当 url 匹配 `''` 时，第一个条目会导航到 `Home`。第二个条目使用了一些特殊格式，我们将在后续课程中再次介绍。

1. 保存所有更改，并在浏览器中确认应用正常运行。应用应该仍然显示房源位置列表。




::: info 总结
在本节课中，你在应用中启用了路由，并定义了新的路由。现在你的应用可以支持在视图之间导航了。在下一节课中，你将学习如何导航到某个房源位置的“详情”页。

:::

你的应用进展得很顺利，干得好。

如需了解本节课所涉及主题的更多信息，请访问：

- [Angular 路由概览](/guide/routing)
- [常见路由任务](/guide/routing/common-router-tasks)

