# 将详情页集成到应用中

本节教程演示如何将详情页连接到你的应用。

<iframe src="https://www.youtube.com/embed/-jRxG84AzCI?si=CbqIpmRpwp5ZZDnu&amp;start=345" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: warning 重要
我们建议使用本地环境来学习路由。

:::

## 你将学到什么

在本节课结束时，你的应用将支持通过路由导航到详情页。

## 带路由参数的路由概念预览

每个房源位置都有特定的详细信息，当用户导航到该条目的详情页时应显示这些信息。为了实现这一目标，你需要使用路由参数。

路由参数让你可以把动态信息作为路由 URL 的一部分。为了识别用户点击了哪个房源位置，你将使用 `HousingLocation` 类型的 `id` 属性。



### 1. 使用 `routerLink` 进行动态导航

在第 10 课中，你向 `src/app/routes.ts` 添加了第二个路由，其中包含一个用于标识路由参数 `id` 的特殊片段：

```
'details/:id'
```

在这里，`:id` 是动态的，会根据代码请求该路由的方式而变化。

1.  在 `src/app/housing-location/housing-location.ts` 中，向 `section` 元素添加一个锚点标签，并加上 `routerLink` 指令（Directive）：

    ```ts [Add anchor with a routerLink directive to housing-location.ts]
    import {Component, input} from '@angular/core';
    import {HousingLocationInfo} from '../housinglocation';
    import {RouterLink} from '@angular/router';

    @Component({
      selector: 'app-housing-location',
      imports: [RouterLink],
      template: `
        <section class="listing">
          <img
            class="listing-photo"
            [src]="housingLocation().photo"
            alt="Exterior photo of {{ housingLocation().name }}"
            crossorigin
          />
          <h2 class="listing-heading">{{ housingLocation().name }}</h2>
          <p class="listing-location">{{ housingLocation().city }}, {{ housingLocation().state }}</p>
          <a [routerLink]="['/details', housingLocation().id]">Learn More</a>
        </section>
      `,
      styleUrl: './housing-location.css',
    })
    export class HousingLocation {
      housingLocation = input.required<HousingLocationInfo>();
    }
    ```

    `routerLink` 指令让 Angular 的路由器（Router）能够在应用中创建动态链接。赋给 `routerLink` 的值是一个包含两个条目的数组：路径的静态部分和动态数据。

    为了让 `routerLink` 在模板（Template）中生效，请从 '@angular/router' 添加 `RouterLink` 的文件级导入，然后更新组件（Component）的 `imports` 数组以包含 `RouterLink`。

1.  此时，你可以确认路由在应用中已经正常工作。在浏览器中刷新首页，然后点击某个房源位置的“Learn More”按钮。

      <img alt="details page displaying the text 'details works!'" src="/assets/images/tutorials/first-app/homes-app-lesson-11-step-1.png">


### 2. 获取路由参数

在这一步中，你将在 `Details` 中获取路由参数。目前，应用显示的是 `details works!`。接下来，你将更新代码，以显示通过路由参数传入的 `id` 值。

1.  在 `src/app/details/details.ts` 中更新模板，导入在 `Details` 中需要用到的函数、类和服务（Service）：

      ```ts [Update file level imports]
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';
      import {HousingService} from '../housing-service';
      import {HousingLocationInfo} from '../housinglocation';

      @Component({
        selector: 'app-details',
        template: `
          <article>
            <img
              class="listing-photo"
              [src]="housingLocation?.photo"
              alt="Exterior photo of {{ housingLocation?.name }}"
              crossorigin
            />
            <section class="listing-description">
              <h2 class="listing-heading">{{ housingLocation?.name }}</h2>
              <p class="listing-location">{{ housingLocation?.city }}, {{ housingLocation?.state }}</p>
            </section>
            <section class="listing-features">
              <h2 class="section-heading">About this housing location</h2>
              <ul>
                <li>Units available: {{ housingLocation?.availableUnits }}</li>
                <li>Does this location have wifi: {{ housingLocation?.wifi }}</li>
                <li>Does this location have laundry: {{ housingLocation?.laundry }}</li>
              </ul>
            </section>
          </article>
        `,
        styleUrl: './details.css',
      })
      export class Details {
        route: ActivatedRoute = inject(ActivatedRoute);
        housingService = inject(HousingService);
        housingLocation: HousingLocationInfo | undefined;

        constructor() {
          const housingLocationId = Number(this.route.snapshot.params['id']);
          this.housingLocation = this.housingService.getHousingLocationById(housingLocationId);
        }
      }
      ```

1.  更新 `@Component` 装饰器的 `template` 属性，以显示 `housingLocationId` 的值：

         ```ts
         template: `<p>details works! {{ housingLocationId }}</p>`,
         ```

1.  用以下代码更新 `Details` 类的主体：

         ```ts
         export class Details {
           route: ActivatedRoute = inject(ActivatedRoute);
           housingLocationId = -1;
           constructor() {
             this.housingLocationId = Number(this.route.snapshot.params['id']);
           }
         }
         ```

    这段代码让 `Details` 可以访问路由器的 `ActivatedRoute` 功能，借助它你可以获取当前路由的相关数据。在 `constructor` 中，代码将从路由中获取的 `id` 参数从字符串转换为数字。

1.  保存所有更改。

1.  在浏览器中，点击某个房源位置的“Learn More”链接，确认页面上显示的数值与数据中该位置的 `id` 属性一致。


### 3. 自定义 `Details`

现在应用中的路由已经可以正常工作了，正好可以更新 `Details` 的模板，以显示该路由参数所对应房源位置的具体数据。

为了访问这些数据，你需要添加对 `HousingService` 的调用。

1. 更新模板代码，使其与以下代码一致：

   ```ts [Update the Details template in src/app/details/details.ts]
   import {Component, inject} from '@angular/core';
   import {ActivatedRoute} from '@angular/router';
   import {HousingService} from '../housing-service';
   import {HousingLocationInfo} from '../housinglocation';

   @Component({
     selector: 'app-details',
     template: `
       <article>
         <img
           class="listing-photo"
           [src]="housingLocation?.photo"
           alt="Exterior photo of {{ housingLocation?.name }}"
           crossorigin
         />
         <section class="listing-description">
           <h2 class="listing-heading">{{ housingLocation?.name }}</h2>
           <p class="listing-location">{{ housingLocation?.city }}, {{ housingLocation?.state }}</p>
         </section>
         <section class="listing-features">
           <h2 class="section-heading">About this housing location</h2>
           <ul>
             <li>Units available: {{ housingLocation?.availableUnits }}</li>
             <li>Does this location have wifi: {{ housingLocation?.wifi }}</li>
             <li>Does this location have laundry: {{ housingLocation?.laundry }}</li>
           </ul>
         </section>
       </article>
     `,
     styleUrl: './details.css',
   })
   export class Details {
     route: ActivatedRoute = inject(ActivatedRoute);
     housingService = inject(HousingService);
     housingLocation: HousingLocationInfo | undefined;

     constructor() {
       const housingLocationId = Number(this.route.snapshot.params['id']);
       this.housingLocation = this.housingService.getHousingLocationById(housingLocationId);
     }
   }
   ```

   注意，这里使用可选链运算符 `?` 来访问 `housingLocation` 的属性。这样可以确保当 `housingLocation` 的值为 null 或 undefined 时应用不会崩溃。

1. 更新 `Details` 类的主体，使其与以下代码一致：

   ```ts [Update the Details class in src/app/details/details.ts]
   import {Component, inject} from '@angular/core';
   import {ActivatedRoute} from '@angular/router';
   import {HousingService} from '../housing-service';
   import {HousingLocationInfo} from '../housinglocation';

   @Component({
     selector: 'app-details',
     template: `
       <article>
         <img
           class="listing-photo"
           [src]="housingLocation?.photo"
           alt="Exterior photo of {{ housingLocation?.name }}"
           crossorigin
         />
         <section class="listing-description">
           <h2 class="listing-heading">{{ housingLocation?.name }}</h2>
           <p class="listing-location">{{ housingLocation?.city }}, {{ housingLocation?.state }}</p>
         </section>
         <section class="listing-features">
           <h2 class="section-heading">About this housing location</h2>
           <ul>
             <li>Units available: {{ housingLocation?.availableUnits }}</li>
             <li>Does this location have wifi: {{ housingLocation?.wifi }}</li>
             <li>Does this location have laundry: {{ housingLocation?.laundry }}</li>
           </ul>
         </section>
       </article>
     `,
     styleUrl: './details.css',
   })
   export class Details {
     route: ActivatedRoute = inject(ActivatedRoute);
     housingService = inject(HousingService);
     housingLocation: HousingLocationInfo | undefined;

     constructor() {
       const housingLocationId = Number(this.route.snapshot.params['id']);
       this.housingLocation = this.housingService.getHousingLocationById(housingLocationId);
     }
   }
   ```

   现在，组件已经具备根据所选房源位置显示正确信息的代码。`constructor` 中现在包含了对 `HousingService` 的调用，把路由参数作为实参传给服务函数 `getHousingLocationById`。

1. 将以下样式复制到 `src/app/details/details.css` 文件中：

   ```css [Add styles for the Details]
   .listing-photo {
     height: 600px;
     width: 50%;
     object-fit: cover;
     border-radius: 30px;
     float: right;
   }
   
   .listing-heading {
     font-size: 48pt;
     font-weight: bold;
     margin-bottom: 15px;
   }
   
   .listing-location::before {
     content: url('/public/location-pin.svg') / '';
   }
   
   .listing-location {
     font-size: 24pt;
     margin-bottom: 15px;
   }
   
   .listing-features > .section-heading {
     color: var(--secondary-color);
     font-size: 24pt;
     margin-bottom: 15px;
   }
   
   .listing-features {
     margin-bottom: 20px;
   }
   
   .listing-features li {
     font-size: 14pt;
   }
   
   li {
     list-style-type: none;
   }
   
   .listing-apply .section-heading {
     font-size: 18pt;
     margin-bottom: 15px;
   }
   
   label,
   input {
     display: block;
   }
   label {
     color: var(--secondary-color);
     font-weight: bold;
     text-transform: uppercase;
     font-size: 12pt;
   }
   input {
     font-size: 16pt;
     margin-bottom: 15px;
     padding: 10px;
     width: 400px;
     border-top: none;
     border-right: none;
     border-left: none;
     border-bottom: solid 0.3px;
   }
   @media (max-width: 1024px) {
     .listing-photo {
       width: 100%;
       height: 400px;
     }
   }
   ```

   然后保存你的更改

1. 在浏览器中刷新页面，确认当你点击某个房源位置的“Learn More”链接时，详情页会根据所选条目的数据显示正确的信息。

<img alt="Details page listing home info" src="/assets/images/tutorials/first-app/homes-app-lesson-11-step-3.png">


### 4. 检查 `Home` 中的导航

在之前的课程中，你更新了 `App` 模板，使其包含一个 `routerLink`。添加这段代码后，每当点击 logo 时，应用都可以导航回 `Home`。

1.  确认你的代码与以下代码一致：

      ```ts [Confirm the routerLink in app.ts]
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

    你的代码应该已经是最新的了，但还是确认一下比较稳妥。




::: info 总结
在本节课中，你添加了用于显示详情页的路由。

:::

现在你已经学会了：

- 使用路由参数向路由传递数据
- 使用 `routerLink` 指令，借助动态数据创建路由
- 使用路由参数从 `HousingService` 获取数据，以显示特定房源位置的信息。

到目前为止，你做得非常棒。

如需了解本节课所涉及主题的更多信息，请访问：

- [路由参数](/guide/routing/read-route-state#get-information-about-the-current-route-with-activatedroute)
- [Angular 路由概览](/guide/routing)
- [常见路由任务](/guide/routing/common-router-tasks)
- [可选链运算符](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

