# 创建 Home 组件 {#create-home-component}

本节教程演示如何为你的 Angular 应用创建一个新的[组件（Component）](/guide/components)。

<iframe src="https://www.youtube.com/embed/R0nRX8jD2D0?si=OMVaw71EIa44yIOJ" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## 你将学到什么 {#what-you-ll-learn}

你的应用将拥有一个新组件：`Home`。

## Angular 组件概览 {#conceptual-preview-of-angular-components}

Angular 应用是围绕组件构建的，组件是 Angular 的基本构建块。
组件包含代码、HTML 布局和 CSS 样式信息，它们共同决定了应用中某个元素的功能和外观。
在 Angular 中，组件可以包含其他组件。应用的功能和外观可以被拆分并划分到各个组件中。

在 Angular 中，组件具有定义其属性的元数据。
创建 `Home` 时，你会用到以下属性：

- `selector`：描述 Angular 如何在模板（Template）中引用该组件。
- `imports`：描述该组件的依赖项。
- `template`：描述该组件的 HTML 标记和布局。
- `styleUrl`：指定该组件所使用的 CSS 文件的 URL。

- [进一步了解组件](https://angular.dev/api/core/Component)




### 1. 创建 `Home` {#_1-create-the-home}

在这一步中，你将为应用创建一个新组件。

在 IDE 的**终端（Terminal）**窗格中：

1. 在你的项目目录中，进入 `first-app` 目录。
1. 运行此命令，创建一个新的 `Home`

   ```shell
   ng generate component home
   ```

1. 运行此命令，构建并启动你的应用。

   ::: info 注意
   此步骤仅适用于你的本地环境！

   :::

   ```shell
   ng serve
   ```

1. 打开浏览器并访问 `http://localhost:4200`，找到该应用。

1. 确认应用无错误地完成构建。

   ::: tip 提示
   它的渲染结果应该和上一课相同，因为虽然你添加了一个新组件，但还没有把它包含到应用的任何模板中。

   :::

1. 在完成后续步骤时，让 `ng serve` 保持运行。


### 2. 将新组件添加到应用的布局中 {#_2-add-the-new-component-to-your-app-s-layout}

在这一步中，你将把新组件 `Home` 添加到应用的根组件 `App` 中，使其显示在应用的布局里。

在 IDE 的**编辑（Edit）**窗格中：

1.  在编辑器中打开 `app.ts`。
1.  在 `app.ts` 中，将下面这行代码添加到文件顶部的导入语句中，以导入 `Home`。

      ```ts [Import Home in src/app/app.ts]
      import {Component} from '@angular/core';
      import {Home} from './home/home';

      @Component({
        selector: 'app-root',
        imports: [Home],
        template: `
          <main>
            <header class="brand-name">
              <img class="brand-logo" src="/public/logo.svg" alt="logo" aria-hidden="true" />
            </header>
            <section class="content">
              <app-home />
            </section>
          </main>
        `,
        styleUrl: './app.css',
      })
      export class App {
        title = 'homes';
      }
      ```

1.  在 `app.ts` 的 `@Component` 中，更新 `imports` 数组属性，添加 `Home`。

      ```ts [Replace in src/app/app.ts]
      import {Component} from '@angular/core';
      import {Home} from './home/home';

      @Component({
        selector: 'app-root',
        imports: [Home],
        template: `
          <main>
            <header class="brand-name">
              <img class="brand-logo" src="/public/logo.svg" alt="logo" aria-hidden="true" />
            </header>
            <section class="content">
              <app-home />
            </section>
          </main>
        `,
        styleUrl: './app.css',
      })
      export class App {
        title = 'homes';
      }
      ```

1.  在 `app.ts` 的 `@Component` 中，更新 `template` 属性，使其包含以下 HTML 代码。

      ```ts [Replace in src/app/app.ts]
      import {Component} from '@angular/core';
      import {Home} from './home/home';

      @Component({
        selector: 'app-root',
        imports: [Home],
        template: `
          <main>
            <header class="brand-name">
              <img class="brand-logo" src="/public/logo.svg" alt="logo" aria-hidden="true" />
            </header>
            <section class="content">
              <app-home />
            </section>
          </main>
        `,
        styleUrl: './app.css',
      })
      export class App {
        title = 'homes';
      }
      ```

1.  保存对 `app.ts` 的修改。
1.  如果 `ng serve` 正在运行，应用应该会自动更新。
    如果 `ng serve` 没有运行，请重新启动它。
    应用中的 _Hello world_ 应该会变成来自 `Home` 的 _home works!_。
1.  在浏览器中查看正在运行的应用，确认应用已经更新。

  <img alt="browser frame of page displaying the text 'home works!'" src="/assets/images/tutorials/first-app/homes-app-lesson-02-step-2.png">


### 3. 为 `Home` 添加功能 {#_3-add-features-to-home}

在这一步中，你将为 `Home` 添加功能。

在上一步中，你把默认的 `Home` 添加到了应用的模板中，因此它的默认 HTML 显示在了应用里。
在这一步中，你将添加一个搜索过滤框和一个按钮，它们会在后面的课程中用到。
目前，`Home` 中只有这些内容。
请注意，这一步只是把搜索元素添加到布局中，暂时还没有任何功能。

如果你是从一个全新的 Angular 项目（ng new）开始，而不是下载了初始项目，
请将以下全局样式添加到 `src/styles.css` 中，这样搜索按钮和输入框的边框才能显示出来：

```css
:root {
  --primary-color: #605dc8;
  --secondary-color: #8b89e6;
  --accent-color: #e8e7fa;
  --shadow-color: #e8e8e8;
}

button.primary {
  padding: 10px;
  border: solid 1px var(--primary-color);
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
}
```

在 IDE 的**编辑**窗格中：

1.  在 `first-app` 目录中，在编辑器里打开 `home.ts`。
1.  在 `home.ts` 的 `@Component` 中，用以下代码更新 `template` 属性。

      ```ts [Replace in src/app/home/home.ts]
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-home',
        template: `
          <section>
            <form>
              <input type="text" placeholder="Filter by city" />
              <button class="primary" type="button">Search</button>
            </form>
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {}
      ```

1.  接下来，在编辑器中打开 `home.css`，并用以下样式更新其内容。

    ::: info 注意
    在浏览器中，这些样式可以放在 `src/app/home/home.ts` 的 `styles` 数组中。

    :::

       ```css [Replace in src/app/home/home.css]
       .results {
         display: grid;
         column-gap: 14px;
         row-gap: 14px;
         grid-template-columns: repeat(auto-fill, minmax(400px, 400px));
         margin-top: 50px;
         justify-content: space-around;
       }
       
       input[type="text"] {
         border: solid 1px var(--primary-color);
         padding: 10px;
         border-radius: 8px;
         margin-right: 4px;
         display: inline-block;
         width: 30%;
       }
       
       button {
         padding: 10px;
         border: solid 1px var(--primary-color);
         background: var(--primary-color);
         color: white;
         border-radius: 8px;
       }
       
       @media (min-width: 500px) and (max-width: 768px) {
         .results {
             grid-template-columns: repeat(2, 1fr);
         }
         input[type="text"] {
             width: 70%;
         }   
       }
       
       @media (max-width: 499px) {
         .results {
             grid-template-columns: 1fr;
         }    
       }
       ```

1.  确认应用无错误地完成构建。你应该能在应用中看到过滤查询框和按钮，并且它们已经应用了样式。在继续下一步之前，请修正所有错误。

   <img alt="browser frame of homes-app displaying logo, filter text input box and search button" src="/assets/images/tutorials/first-app/homes-app-lesson-02-step-3.png">




::: info 总结
在本课中，你为应用创建了一个新组件，并为它添加了一个过滤编辑框和一个按钮。

:::

关于本课程所涉及主题的更多信息，请访问：

- [`ng generate component`](https://angular.dev/cli/generate/component)
- [`Component` 参考](https://angular.dev/api/core/Component)
- [Angular 组件概览](/guide/components)

