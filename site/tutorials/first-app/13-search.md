# 为应用添加搜索功能 {#add-the-search-feature-to-your-app}

本节教程演示如何为 Angular 应用添加搜索功能。

该应用将允许用户搜索应用所提供的数据，并只显示与输入内容相匹配的结果。

<iframe src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k&amp;start=457" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: warning 重要
建议你在本地环境中完成本节教程的这一步骤。

:::

## 你将学到什么 {#what-you-ll-learn}

- 你的应用将使用表单中的数据来搜索匹配的房源位置
- 你的应用将只显示匹配的房源位置



### 1. 更新首页组件的属性 {#_1-update-the-home-component-properties}

在这一步中，你将更新 `Home` 类，把数据存储到一个新的数组属性中，用于过滤。

1. 在 `src/app/home/home.ts` 中，为该类添加一个名为 `filteredLocationList` 的新属性。

   ```ts [Add the filteredLocationList property in home.ts]
   import {ChangeDetectorRef, Component, inject} from '@angular/core';
   import {HousingLocation} from '../housing-location/housing-location';
   import {HousingLocationInfo} from '../housinglocation';
   import {HousingService} from '../housing-service';

   @Component({
     selector: 'app-home',
     imports: [HousingLocation],
     template: `
       <section>
         <form>
           <input type="text" placeholder="Filter by city" #filter />
           <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button>
         </form>
       </section>
       <section class="results">
         @for (housingLocation of filteredLocationList; track $index) {
           <app-housing-location [housingLocation]="housingLocation" />
         }
       </section>
     `,
     styleUrl: './home.css',
   })
   export class Home {
     private readonly changeDetectorRef = inject(ChangeDetectorRef);
     housingLocationList: HousingLocationInfo[] = [];
     housingService: HousingService = inject(HousingService);
     filteredLocationList: HousingLocationInfo[] = [];

     constructor() {
       this.housingLocationList = this.housingService.getAllHousingLocations();
       this.filteredLocationList = this.housingLocationList;
     }

     filterResults(text: string) {
       if (!text) {
         this.filteredLocationList = this.housingLocationList;
         return;
       }

       this.filteredLocationList = this.housingLocationList.filter((housingLocation) =>
         housingLocation?.city.toLowerCase().includes(text.toLowerCase()),
       );
     }
   }
   ```

   `filteredLocationList` 保存与用户输入的搜索条件相匹配的值。

1. 页面加载时，`filteredLocationList` 默认应包含全部房源位置数据。更新 `Home` 的 `constructor` 来设置这个值。

   ```ts [Set the value of filteredLocationList]
   import {ChangeDetectorRef, Component, inject} from '@angular/core';
   import {HousingLocation} from '../housing-location/housing-location';
   import {HousingLocationInfo} from '../housinglocation';
   import {HousingService} from '../housing-service';

   @Component({
     selector: 'app-home',
     imports: [HousingLocation],
     template: `
       <section>
         <form>
           <input type="text" placeholder="Filter by city" #filter />
           <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button>
         </form>
       </section>
       <section class="results">
         @for (housingLocation of filteredLocationList; track $index) {
           <app-housing-location [housingLocation]="housingLocation" />
         }
       </section>
     `,
     styleUrl: './home.css',
   })
   export class Home {
     private readonly changeDetectorRef = inject(ChangeDetectorRef);
     housingLocationList: HousingLocationInfo[] = [];
     housingService: HousingService = inject(HousingService);
     filteredLocationList: HousingLocationInfo[] = [];

     constructor() {
       this.housingLocationList = this.housingService.getAllHousingLocations();
       this.filteredLocationList = this.housingLocationList;
     }

     filterResults(text: string) {
       if (!text) {
         this.filteredLocationList = this.housingLocationList;
         return;
       }

       this.filteredLocationList = this.housingLocationList.filter((housingLocation) =>
         housingLocation?.city.toLowerCase().includes(text.toLowerCase()),
       );
     }
   }
   ```


### 2. 更新首页组件的模板 {#_2-update-the-home-component-template}

`Home` 中已经包含一个输入框，你将用它来获取用户的输入。这段字符串文本将用于过滤结果。

1. 更新 `Home` 的模板（Template），在 `input` 元素上添加一个名为 `#filter` 的模板变量。

   ```ts [Add a template variable to the input HTML element in home.ts]
   import {ChangeDetectorRef, Component, inject} from '@angular/core';
   import {HousingLocation} from '../housing-location/housing-location';
   import {HousingLocationInfo} from '../housinglocation';
   import {HousingService} from '../housing-service';

   @Component({
     selector: 'app-home',
     imports: [HousingLocation],
     template: `
       <section>
         <form>
           <input type="text" placeholder="Filter by city" #filter />
           <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button>
         </form>
       </section>
       <section class="results">
         @for (housingLocation of filteredLocationList; track $index) {
           <app-housing-location [housingLocation]="housingLocation" />
         }
       </section>
     `,
     styleUrl: './home.css',
   })
   export class Home {
     private readonly changeDetectorRef = inject(ChangeDetectorRef);
     housingLocationList: HousingLocationInfo[] = [];
     housingService: HousingService = inject(HousingService);
     filteredLocationList: HousingLocationInfo[] = [];

     constructor() {
       this.housingLocationList = this.housingService.getAllHousingLocations();
       this.filteredLocationList = this.housingLocationList;
     }

     filterResults(text: string) {
       if (!text) {
         this.filteredLocationList = this.housingLocationList;
         return;
       }

       this.filteredLocationList = this.housingLocationList.filter((housingLocation) =>
         housingLocation?.city.toLowerCase().includes(text.toLowerCase()),
       );
     }
   }
   ```
   本例使用[模板引用变量](/guide/templates)来访问 `input` 元素，从而获取它的值。

1. 接下来，更新组件（Component）模板，为 "Search" 按钮绑定一个事件处理器。

   ```ts [Bind the button click event to a method in home.ts]
   import {ChangeDetectorRef, Component, inject} from '@angular/core';
   import {HousingLocation} from '../housing-location/housing-location';
   import {HousingLocationInfo} from '../housinglocation';
   import {HousingService} from '../housing-service';

   @Component({
     selector: 'app-home',
     imports: [HousingLocation],
     template: `
       <section>
         <form>
           <input type="text" placeholder="Filter by city" #filter />
           <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button>
         </form>
       </section>
       <section class="results">
         @for (housingLocation of filteredLocationList; track $index) {
           <app-housing-location [housingLocation]="housingLocation" />
         }
       </section>
     `,
     styleUrl: './home.css',
   })
   export class Home {
     private readonly changeDetectorRef = inject(ChangeDetectorRef);
     housingLocationList: HousingLocationInfo[] = [];
     housingService: HousingService = inject(HousingService);
     filteredLocationList: HousingLocationInfo[] = [];

     constructor() {
       this.housingLocationList = this.housingService.getAllHousingLocations();
       this.filteredLocationList = this.housingLocationList;
     }

     filterResults(text: string) {
       if (!text) {
         this.filteredLocationList = this.housingLocationList;
         return;
       }

       this.filteredLocationList = this.housingLocationList.filter((housingLocation) =>
         housingLocation?.city.toLowerCase().includes(text.toLowerCase()),
       );
     }
   }
   ```

   通过绑定 `button` 元素的 `click` 事件，你就可以调用 `filterResults` 函数。该函数的参数是 `filter` 模板变量的 `value` 属性，具体来说，就是 `input` HTML 元素的 `.value` 属性。

1. 最后一处模板更新是 `@for` 指令（Directive）。更新 `@for`，让它遍历 `filteredLocationList` 数组中的值。

   ```ts [Update the @for template directive in home.ts]
   import {ChangeDetectorRef, Component, inject} from '@angular/core';
   import {HousingLocation} from '../housing-location/housing-location';
   import {HousingLocationInfo} from '../housinglocation';
   import {HousingService} from '../housing-service';

   @Component({
     selector: 'app-home',
     imports: [HousingLocation],
     template: `
       <section>
         <form>
           <input type="text" placeholder="Filter by city" #filter />
           <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button>
         </form>
       </section>
       <section class="results">
         @for (housingLocation of filteredLocationList; track $index) {
           <app-housing-location [housingLocation]="housingLocation" />
         }
       </section>
     `,
     styleUrl: './home.css',
   })
   export class Home {
     private readonly changeDetectorRef = inject(ChangeDetectorRef);
     housingLocationList: HousingLocationInfo[] = [];
     housingService: HousingService = inject(HousingService);
     filteredLocationList: HousingLocationInfo[] = [];

     constructor() {
       this.housingLocationList = this.housingService.getAllHousingLocations();
       this.filteredLocationList = this.housingLocationList;
     }

     filterResults(text: string) {
       if (!text) {
         this.filteredLocationList = this.housingLocationList;
         return;
       }

       this.filteredLocationList = this.housingLocationList.filter((housingLocation) =>
         housingLocation?.city.toLowerCase().includes(text.toLowerCase()),
       );
     }
   }
   ```


### 3. 实现事件处理函数 {#_3-implement-the-event-handler-function}

模板已经更新，把 `filterResults` 函数绑定到了 `click` 事件上。接下来，你的任务是在 `Home` 类中实现 `filterResults` 函数。

1.  更新 `Home` 类，加入 `filterResults` 函数的实现。

    ```ts [Add the filterResults function implementation]
    import {ChangeDetectorRef, Component, inject} from '@angular/core';
    import {HousingLocation} from '../housing-location/housing-location';
    import {HousingLocationInfo} from '../housinglocation';
    import {HousingService} from '../housing-service';

    @Component({
      selector: 'app-home',
      imports: [HousingLocation],
      template: `
        <section>
          <form>
            <input type="text" placeholder="Filter by city" #filter />
            <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button>
          </form>
        </section>
        <section class="results">
          @for (housingLocation of filteredLocationList; track $index) {
            <app-housing-location [housingLocation]="housingLocation" />
          }
        </section>
      `,
      styleUrl: './home.css',
    })
    export class Home {
      private readonly changeDetectorRef = inject(ChangeDetectorRef);
      housingLocationList: HousingLocationInfo[] = [];
      housingService: HousingService = inject(HousingService);
      filteredLocationList: HousingLocationInfo[] = [];

      constructor() {
        this.housingLocationList = this.housingService.getAllHousingLocations();
        this.filteredLocationList = this.housingLocationList;
      }

      filterResults(text: string) {
        if (!text) {
          this.filteredLocationList = this.housingLocationList;
          return;
        }

        this.filteredLocationList = this.housingLocationList.filter((housingLocation) =>
          housingLocation?.city.toLowerCase().includes(text.toLowerCase()),
        );
      }
    }
    ```

    这个函数使用 `Array` 的 `filter` 函数，将 `text` 参数的值与 `housingLocation.city` 属性进行比较。作为一个有趣的练习，你可以修改这个函数，让它匹配任意一个或多个属性。

1.  保存代码。

1.  刷新浏览器，确认在输入文本后点击 "Search" 按钮时，可以按城市搜索房源位置数据。

       <img alt="filtered search results based on user input" src="/assets/images/tutorials/first-app/homes-app-lesson-13-step-3.png">




::: info 总结
在本节中，你使用模板变量与模板中的值进行交互，并借助事件绑定和数组函数添加了搜索功能。

:::

如需进一步了解本节涉及的主题，请访问：

- [模板变量](/guide/templates)
- [事件处理](/guide/templates/event-listeners)

