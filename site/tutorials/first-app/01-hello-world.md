# Hello world {#hello-world}

这第一课是整个教程的起点，之后的每一课都会在此基础上添加新功能，最终构建出一个完整的 Angular 应用。在本课中，我们将更新应用，让它显示那句著名的文字："Hello World"。

<iframe src="https://www.youtube.com/embed/UnOwDuliqZA?si=uML-cDRbrxmYdD_9" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## 你将学到什么 {#what-you-ll-learn}

如果你的应用能在浏览器中成功运行，并且没有错误地显示出执行后的内容，就说明你的开发环境和 IDE 已正确设置好，可以开始构建 Angular 应用了。

::: info 注意
如果你使用的是内嵌编辑器，请直接跳到[第四步](#create-hello-world)。
在浏览器演练场（playground）中，你不需要运行 `ng serve` 来启动应用。其他命令（如 `ng generate`）可以在右侧的控制台窗口中执行。

:::



### 1. 下载默认应用 {#_1-download-the-default-app}

首先点击代码编辑器右上方窗格中的"Download"图标。这会下载一个包含本教程源代码的 `.zip` 文件。在本地终端和 IDE 中打开它，然后继续测试默认应用。

在教程的任何一步，你都可以点击这个图标下载该步骤的源代码，并从那里开始。


### 2. 测试默认应用 {#_2-test-the-default-app}

在这一步中，下载默认的初始应用后，你将构建这个默认的 Angular 应用。
这可以确认你的开发环境已具备继续本教程所需的一切。

在 IDE 的**终端**（Terminal）窗格中：

1. 在你的项目目录中，进入 `first-app` 目录。
1. 运行此命令，安装运行应用所需的依赖项。

   ```shell
   npm install
   ```

1. 运行此命令，构建并启动默认应用。

   ```shell
   ng serve
   ```

   应用应该能够无错误地完成构建。

1. 在开发计算机的 Web 浏览器中，打开 `http://localhost:4200`。
1. 确认浏览器中显示了默认网站。
1. 在完成后续步骤时，你可以让 `ng serve` 保持运行。


### 3. 查看项目中的文件 {#_3-review-the-files-in-the-project}

在这一步中，你将了解组成默认 Angular 应用的各个文件。

在 IDE 的**资源管理器**（Explorer）窗格中：

1. 在你的项目目录中，进入 `first-app` 目录。
1. 打开 `src` 目录，查看以下文件。
   1. 在文件资源管理器中，找到 Angular 应用文件（`/src`）。
      1. `index.html` 是应用的顶层 HTML 模板（Template）。
      1. `styles.css` 是应用的顶层样式表。
      1. `main.ts` 是应用开始运行的地方。
      1. `favicon.ico` 是应用的图标，和你在任何网站上看到的一样。
   1. 在文件资源管理器中，找到 Angular 应用的组件文件（`/app`）。
      1. `app.ts` 是描述 `app-root` 组件的源文件。
         这是应用中的顶层 Angular 组件（Component）。组件是 Angular 应用的基本构建块。
         组件描述包括组件的代码、HTML 模板和样式，它们可以写在这个文件中，也可以写在单独的文件中。

         在这个应用中，样式位于单独的文件中，而组件的代码和 HTML 模板位于这个文件中。

      1. `app.css` 是此组件的样式表。
      1. 新组件会添加到这个目录中。

   1. 在文件资源管理器中，找到存放应用所用图片的图片目录（`/public`）。
   1. 在文件资源管理器中，找到 Angular 应用构建和运行所需的文件和目录。这些通常不是你需要直接打交道的文件。
      1. `.angular` 包含构建 Angular 应用所需的文件。
      1. `.node_modules` 包含应用所使用的 node.js 包。
      1. `angular.json` 向应用构建工具描述这个 Angular 应用。
      1. `package.json` 供 `npm`（node 包管理器）用来运行最终的应用。
      1. `tsconfig.*` 是向 TypeScript 编译器描述应用配置的文件。

查看完组成 Angular 应用项目的文件后，继续下一步。


### 4. 创建 `Hello World` {#_4-create-hello-world}

在这一步中，你将更新 Angular 项目文件，以修改显示的内容。

在你的 IDE 中：

1. 打开 `first-app/src/index.html`。
   ::: info 注意
   这一步和下一步仅适用于你的本地环境！

   :::

1. 在 `index.html` 中，用以下代码替换 `<title>` 元素，以更新应用的标题。

   ```html [Replace in src/index.html]
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <title>Homes</title>
       <base href="/" />
       <meta name="viewport" content="width=device-width, initial-scale=1" />
       <link rel="icon" type="image/x-icon" href="favicon.ico" />
       <link
         href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,700;1,400;1,700&display=swap"
         rel="stylesheet"
       />
     </head>
     <body>
       <app-root></app-root>
     </body>
   </html>
   ```

   然后，保存你刚才对 `index.html` 所做的修改。

1. 接下来，打开 `first-app/src/app/app.ts`。
1. 在 `app.ts` 的 `@Component` 定义中，用以下代码替换 `template` 这一行，以修改 app 组件中的文本。

   ```ts [Replace in src/app/app.ts]
   import {Component} from '@angular/core';

   @Component({
     selector: 'app-root',
     imports: [],
     template: ` <h1>Hello world!</h1> `,
     styleUrl: './app.css',
   })
   export class App {
     title = 'homes';
   }
   ```

1. 在 `app.ts` 的 `App` 类定义中，用以下代码替换 `title` 这一行，以修改组件标题。

   ```ts [Replace in src/app/app.ts]
   import {Component} from '@angular/core';

   @Component({
     selector: 'app-root',
     imports: [],
     template: ` <h1>Hello world!</h1> `,
     styleUrl: './app.css',
   })
   export class App {
     title = 'homes';
   }
   ```

   然后，保存你对 `app.ts` 所做的修改。

1. 如果你在第 1 步之后停止了 `ng serve` 命令，请在 IDE 的**终端**窗口中再次运行 `ng serve`。
1. 打开浏览器并访问 `localhost:4200`，确认应用无错误地完成构建，并在标题中显示 _Homes_，在应用正文中显示 _Hello world_：
   <img alt="browser frame of page displaying the text 'Hello World'" src="/assets/images/tutorials/first-app/homes-app-lesson-01-browser.png">




::: info 总结
在本课中，你更新了一个默认的 Angular 应用，使其显示 _Hello world_。
在此过程中，你了解了 `ng serve` 命令，它可以在本地启动应用以便测试。

:::

关于本课程所涉及主题的更多信息，请访问：

- [Angular 组件](/guide/components)
- [使用 Angular CLI 创建应用](/tools/cli)

