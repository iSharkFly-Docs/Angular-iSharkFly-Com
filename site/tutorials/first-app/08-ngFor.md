# 使用 @for 在组件中列出对象 {#use-for-to-list-objects-in-component}

本节教程演示如何在 Angular 模板（Template）中使用 `@for` 块，以便在模板中显示动态重复的数据。

<iframe src="https://www.youtube.com/embed/eM3zi_n7lNs?si=MIl5NcRxvcLjYt5f&amp;start=477" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: info 注意
该视频使用的是较旧的语法，但其中的主要概念依然适用。

:::

## 你将学到什么 {#what-you-ll-learn}

- 你将为应用添加一个数据集
- 你的应用将使用 `@for` 显示新数据集中的元素列表

## `@for` 概念预览 {#conceptual-preview-of-for}

在 Angular 中，`@for` 是一种特定类型的[控制流块（Control Flow Block）](/guide/templates/control-flow)，用于在模板中动态重复数据。在普通 JavaScript 中你会使用 for 循环，而 `@for` 为 Angular 模板提供了类似的功能。

你可以使用 `@for` 遍历数组，甚至是异步值。在本节中，你将添加一个新的数据数组用于遍历。

如需更深入的说明，请参阅[控制流](/guide/templates/control-flow#repeat-content-with-the-for-block)指南。



### 1. 向 `Home` 添加房屋数据 {#_1-add-housing-data-to-the-home}

目前 `Home` 中只有一个房屋位置。在这一步中，你将添加一个由 `HousingLocation` 条目组成的数组。

1. 在 `src/app/home/home.ts` 中，从 `Home` 类里删除 `housingLocation` 属性。
1. 更新 `Home` 类，为它添加一个名为 `housingLocationList` 的属性。将你的代码更新为如下所示：
   ```ts [Add housingLocationList property in home.ts]
   import {Component} from '@angular/core';
   import {HousingLocation} from '../housing-location/housing-location';
   import {HousingLocationInfo} from '../housinglocation';

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
         @for (housingLocation of housingLocationList; track $index) {
           <app-housing-location [housingLocation]="housingLocation" />
         }
       </section>
     `,
     styleUrl: './home.css',
   })
   export class Home {
     readonly baseUrl = 'https://angular.dev/assets/images/tutorials/common';

     housingLocationList: HousingLocationInfo[] = [
       {
         id: 0,
         name: 'Acme Fresh Start Housing',
         city: 'Chicago',
         state: 'IL',
         photo: `${this.baseUrl}/bernard-hermant-CLKGGwIBTaY-unsplash.jpg`,
         availableUnits: 4,
         wifi: true,
         laundry: true,
       },
       {
         id: 1,
         name: 'A113 Transitional Housing',
         city: 'Santa Monica',
         state: 'CA',
         photo: `${this.baseUrl}/brandon-griggs-wR11KBaB86U-unsplash.jpg`,
         availableUnits: 0,
         wifi: false,
         laundry: true,
       },
       {
         id: 2,
         name: 'Warm Beds Housing Support',
         city: 'Juneau',
         state: 'AK',
         photo: `${this.baseUrl}/i-do-nothing-but-love-lAyXdl1-Wmc-unsplash.jpg`,
         availableUnits: 1,
         wifi: false,
         laundry: false,
       },
       {
         id: 3,
         name: 'Homesteady Housing',
         city: 'Chicago',
         state: 'IL',
         photo: `${this.baseUrl}/ian-macdonald-W8z6aiwfi1E-unsplash.jpg`,
         availableUnits: 1,
         wifi: true,
         laundry: false,
       },
       {
         id: 4,
         name: 'Happy Homes Group',
         city: 'Gary',
         state: 'IN',
         photo: `${this.baseUrl}/krzysztof-hepner-978RAXoXnH4-unsplash.jpg`,
         availableUnits: 1,
         wifi: true,
         laundry: false,
       },
       {
         id: 5,
         name: 'Hopeful Apartment Group',
         city: 'Oakland',
         state: 'CA',
         photo: `${this.baseUrl}/r-architecture-JvQ0Q5IkeMM-unsplash.jpg`,
         availableUnits: 2,
         wifi: true,
         laundry: true,
       },
       {
         id: 6,
         name: 'Seriously Safe Towns',
         city: 'Oakland',
         state: 'CA',
         photo: `${this.baseUrl}/phil-hearing-IYfp2Ixe9nM-unsplash.jpg`,
         availableUnits: 5,
         wifi: true,
         laundry: true,
       },
       {
         id: 7,
         name: 'Hopeful Housing Solutions',
         city: 'Oakland',
         state: 'CA',
         photo: `${this.baseUrl}/r-architecture-GGupkreKwxA-unsplash.jpg`,
         availableUnits: 2,
         wifi: true,
         laundry: true,
       },
       {
         id: 8,
         name: 'Seriously Safe Towns',
         city: 'Oakland',
         state: 'CA',
         photo: `${this.baseUrl}/saru-robert-9rP3mxf8qWI-unsplash.jpg`,
         availableUnits: 10,
         wifi: false,
         laundry: false,
       },
       {
         id: 9,
         name: 'Capital Safe Towns',
         city: 'Portland',
         state: 'OR',
         photo: `${this.baseUrl}/webaliser-_TPTXZd9mOo-unsplash.jpg`,
         availableUnits: 6,
         wifi: true,
         laundry: true,
       },
     ];
   }
   ```

   ::: warning 重要
   不要删除 `@Component` 装饰器，你将在后面的步骤中更新这段代码。

   :::


### 2. 更新 `Home` 模板以使用 `@for` {#_2-update-the-home-template-to-use-for}

现在应用已经有了一个数据集，你可以使用 `@for` 块在浏览器中显示这些条目。

1. 将模板代码中的 `<app-housing-location>` 标签更新为：
   ```ts [Add @for to Home template in home.ts]
   import {Component} from '@angular/core';
   import {HousingLocation} from '../housing-location/housing-location';
   import {HousingLocationInfo} from '../housinglocation';

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
         @for (housingLocation of housingLocationList; track $index) {
           <app-housing-location [housingLocation]="housingLocation" />
         }
       </section>
     `,
     styleUrl: './home.css',
   })
   export class Home {
     readonly baseUrl = 'https://angular.dev/assets/images/tutorials/common';

     housingLocationList: HousingLocationInfo[] = [
       {
         id: 0,
         name: 'Acme Fresh Start Housing',
         city: 'Chicago',
         state: 'IL',
         photo: `${this.baseUrl}/bernard-hermant-CLKGGwIBTaY-unsplash.jpg`,
         availableUnits: 4,
         wifi: true,
         laundry: true,
       },
       {
         id: 1,
         name: 'A113 Transitional Housing',
         city: 'Santa Monica',
         state: 'CA',
         photo: `${this.baseUrl}/brandon-griggs-wR11KBaB86U-unsplash.jpg`,
         availableUnits: 0,
         wifi: false,
         laundry: true,
       },
       {
         id: 2,
         name: 'Warm Beds Housing Support',
         city: 'Juneau',
         state: 'AK',
         photo: `${this.baseUrl}/i-do-nothing-but-love-lAyXdl1-Wmc-unsplash.jpg`,
         availableUnits: 1,
         wifi: false,
         laundry: false,
       },
       {
         id: 3,
         name: 'Homesteady Housing',
         city: 'Chicago',
         state: 'IL',
         photo: `${this.baseUrl}/ian-macdonald-W8z6aiwfi1E-unsplash.jpg`,
         availableUnits: 1,
         wifi: true,
         laundry: false,
       },
       {
         id: 4,
         name: 'Happy Homes Group',
         city: 'Gary',
         state: 'IN',
         photo: `${this.baseUrl}/krzysztof-hepner-978RAXoXnH4-unsplash.jpg`,
         availableUnits: 1,
         wifi: true,
         laundry: false,
       },
       {
         id: 5,
         name: 'Hopeful Apartment Group',
         city: 'Oakland',
         state: 'CA',
         photo: `${this.baseUrl}/r-architecture-JvQ0Q5IkeMM-unsplash.jpg`,
         availableUnits: 2,
         wifi: true,
         laundry: true,
       },
       {
         id: 6,
         name: 'Seriously Safe Towns',
         city: 'Oakland',
         state: 'CA',
         photo: `${this.baseUrl}/phil-hearing-IYfp2Ixe9nM-unsplash.jpg`,
         availableUnits: 5,
         wifi: true,
         laundry: true,
       },
       {
         id: 7,
         name: 'Hopeful Housing Solutions',
         city: 'Oakland',
         state: 'CA',
         photo: `${this.baseUrl}/r-architecture-GGupkreKwxA-unsplash.jpg`,
         availableUnits: 2,
         wifi: true,
         laundry: true,
       },
       {
         id: 8,
         name: 'Seriously Safe Towns',
         city: 'Oakland',
         state: 'CA',
         photo: `${this.baseUrl}/saru-robert-9rP3mxf8qWI-unsplash.jpg`,
         availableUnits: 10,
         wifi: false,
         laundry: false,
       },
       {
         id: 9,
         name: 'Capital Safe Towns',
         city: 'Portland',
         state: 'OR',
         photo: `${this.baseUrl}/webaliser-_TPTXZd9mOo-unsplash.jpg`,
         availableUnits: 6,
         wifi: true,
         laundry: true,
       },
     ];
   }
   ```

   注意，在代码 `[housingLocation] = "housingLocation"` 中，`housingLocation` 的值现在指的是 `@for` 块中使用的变量。在此更改之前，它指的是 `Home` 类上的属性。

1. 保存所有更改。

1. 刷新浏览器，确认应用现在渲染出了一个房屋位置网格。

<section class="lightbox">
<img alt="browser frame of homes-app displaying logo, filter text input box, search button and a grid of housing location cards" src="/assets/images/tutorials/first-app/homes-app-lesson-08-step-2.png">
</section>




::: info 总结
在本节中，你使用 `@for` 块在 Angular 模板中动态重复数据，还添加了一个供 Angular 应用使用的新数据数组。现在，应用会在浏览器中动态渲染房屋位置列表。

:::

应用已经初具雏形，干得好。

如需进一步了解本节涉及的主题，请访问：

- [控制流块](/guide/templates/control-flow)
- [@for 指南](/guide/templates/control-flow#repeat-content-with-the-for-block)
- [@for](https://angular.dev/api/core/@for)

