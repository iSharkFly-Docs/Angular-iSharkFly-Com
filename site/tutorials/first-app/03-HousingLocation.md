# 创建应用的 HousingLocation 组件 {#create-the-application-s-housinglocation-component}

本节教程演示如何将 `HousingLocation` 组件（Component）添加到你的 Angular 应用中。

<iframe src="https://www.youtube.com/embed/R0nRX8jD2D0?si=U4ONEbPvtptdUHTt&amp;start=440" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## 你将学到什么 {#what-you-ll-learn}

你的应用将拥有一个新组件 `HousingLocation`，它会显示一条消息，确认该组件已添加到你的应用中。



### 1. 创建 `HousingLocation` {#_1-create-the-housinglocation}

在这一步中，你将为应用创建一个新组件。

在 IDE 的**终端（Terminal）**窗格中：

1. 在你的项目目录中，进入 `first-app` 目录。

1. 运行此命令，创建一个新的 `HousingLocation`

   ```shell
   ng generate component housingLocation
   ```

1. 运行此命令，构建并启动你的应用。

   ```shell
   ng serve
   ```

   ::: info 注意
   此步骤仅适用于你的本地环境！

   :::

1. 打开浏览器并访问 `http://localhost:4200`，找到该应用。
1. 确认应用无错误地完成构建。

   ::: tip 提示
   它的渲染结果应该和上一课相同，因为虽然你添加了一个新组件，但还没有把它包含到应用的任何模板（Template）中。

   :::

1. 在完成后续步骤时，让 `ng serve` 保持运行。


### 2. 将新组件添加到应用的布局中 {#_2-add-the-new-component-to-your-app-s-layout}

在这一步中，你将把新组件 `HousingLocation` 添加到应用的 `Home` 中，使其显示在应用的布局里。

在 IDE 的**编辑（Edit）**窗格中：

1.  在编辑器中打开 `home.ts`。
1.  在 `home.ts` 中，将下面这行代码添加到文件顶部的导入语句中，以导入 `HousingLocation`。

      ```ts [Import HousingLocation in src/app/home/home.ts]
      import {Component} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';

      @Component({
        selector: 'app-home',
        imports: [HousingLocation],
        template: `
          <section>
            <form>
              <input type="text" placeholder="Filter by city" />
              <button class="primary" type="button">Search</button>
            </form>
          </section>
          <section class="results">
            <app-housing-location />
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {}
      ```

1.  接下来，更新 `@Component` 元数据的 `imports` 属性，把 `HousingLocation` 添加到数组中。

      ```ts [Add HousingLocation to imports array in src/app/home/home.ts]
      import {Component} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';

      @Component({
        selector: 'app-home',
        imports: [HousingLocation],
        template: `
          <section>
            <form>
              <input type="text" placeholder="Filter by city" />
              <button class="primary" type="button">Search</button>
            </form>
          </section>
          <section class="results">
            <app-housing-location />
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {}
      ```

1.  现在，该组件已经可以在 `Home` 的模板中使用了。更新 `@Component` 元数据的 `template` 属性，加入对 `<app-housing-location>` 标签的引用。

      ```ts [Add housing location to the component template in src/app/home/home.ts]
      import {Component} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';

      @Component({
        selector: 'app-home',
        imports: [HousingLocation],
        template: `
          <section>
            <form>
              <input type="text" placeholder="Filter by city" />
              <button class="primary" type="button">Search</button>
            </form>
          </section>
          <section class="results">
            <app-housing-location />
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {}
      ```


### 3. 为组件添加样式 {#_3-add-the-styles-for-the-component}

在这一步中，你将把预先写好的 `HousingLocation` 样式复制到应用中，让应用能够正确渲染。

1. 打开 `src/app/housing-location/housing-location.css`，将下面的样式粘贴到文件中：

   ::: info 注意
   在浏览器中，这些样式可以放在 `src/app/housing-location/housing-location.ts` 的 `styles` 数组中。

   :::

   ```css [Add CSS styles to housing location to the component in src/app/housing-location/housing-location.css]
   .listing {
     background: var(--accent-color);
     border-radius: 30px;
     padding-bottom: 30px;
   }
   .listing-heading {
     color: var(--primary-color);
     padding: 10px 20px 0 20px;
   }
   .listing-photo {
     height: 250px;
     width: 100%;
     object-fit: cover;
     border-radius: 30px 30px 0 0;
   }
   .listing-location {
     padding: 10px 20px 20px 20px;
   }
   .listing-location::before {
     content: url('/public/location-pin.svg') / '';
   }
   
   section.listing a {
     padding-left: 20px;
     text-decoration: none;
     color: var(--primary-color);
   }
   section.listing a::after {
     content: '\203A';
     margin-left: 5px;
   }
   ```

1. 保存代码，回到浏览器，确认应用无错误地完成构建。你应该能看到屏幕上渲染出了消息 "housing-location works!"。在继续下一步之前，请修正所有错误。

   <img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!" src="/assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">




::: info 总结
在本课中，你为应用创建了一个新组件，并将其添加到了应用的布局中。

:::
