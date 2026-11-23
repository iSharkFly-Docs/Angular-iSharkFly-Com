# Angular 服务 {#angular-services}

本节教程演示如何创建 Angular 服务（Service），并使用依赖注入（Dependency Injection）将其引入你的应用。

<iframe src="https://www.youtube.com/embed/-jRxG84AzCI?si=rieGfJawp9xJ00Sz" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## 你将学到什么 {#what-you-ll-learn}

你的应用将拥有一个服务，它读取本地的静态数据并将其提供给应用。
在后续课程中，你将更新该服务，使其从 Web 服务获取数据。

## 服务概念预览 {#conceptual-preview-of-services}

本教程介绍 Angular 服务和依赖注入。

### Angular 服务 {#angular-services-1}

_Angular 服务_为你提供了一种方式，用来分离 Angular 应用中可供多个组件（Component）使用的数据和函数。
要被多个组件使用，服务必须是_可注入的（injectable）_。
可注入并被某个组件使用的服务，会成为该组件的依赖。
该组件依赖这些服务，没有它们就无法正常工作。

### 依赖注入 {#dependency-injection}

_依赖注入_是一种机制，用于管理应用中组件的依赖，以及可供其他组件使用的服务。



### 1. 为应用创建新服务 {#_1-create-a-new-service-for-your-app}

这一步为你的应用创建一个可注入的服务。

在 IDE 的**终端（Terminal）**面板中：

1. 在项目目录中，进入 `first-app` 目录。
1. 在 `first-app` 目录中，运行以下命令创建新服务。

   ```shell
   ng generate service housingService --skip-tests
   ```

1. 运行 `ng serve` 构建应用，并在 `http://localhost:4200` 上提供服务。
1. 确认应用构建没有错误。
   在继续下一步之前，修正所有错误。


### 2. 向新服务添加静态数据 {#_2-add-static-data-to-the-new-service}

这一步向新服务添加一些示例数据。
在后续课程中，你将用 Web 接口替换这些静态数据，像在真实应用中那样获取数据。
目前，应用的新服务使用的是到目前为止在 `Home` 中本地创建的数据。

在 IDE 的**编辑（Edit）**面板中：

1. 在 `src/app/home/home.ts` 中，从 `Home` 里复制 `baseUrl` 变量，以及 `housingLocationList` 变量及其数组值。
1. 在 `src/app/housing-service.ts` 中：
   1. 在 `HousingService` 类中，粘贴上一步从 `Home` 复制的变量。
   1. 在 `HousingService` 类中，把下面这些函数粘贴到你刚复制的数据之后。
      这些函数让依赖方可以访问服务中的数据。

      ```ts [Service functions in src/app/housing-service.ts]
      import {Service} from '@angular/core';
      import {HousingLocationInfo} from './housinglocation';

      @Service()
      export class HousingService {
        readonly baseUrl = 'https://angular.dev/assets/images/tutorials/common';

        protected housingLocationList: HousingLocationInfo[] = [
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

        getAllHousingLocations(): HousingLocationInfo[] {
          return this.housingLocationList;
        }

        getHousingLocationById(id: number): HousingLocationInfo | undefined {
          return this.housingLocationList.find((housingLocation) => housingLocation.id === id);
        }
      }
      ```

      你将在后续课程中用到这些函数。目前只需知道：这些函数要么按 id 返回某个特定的 `HousingLocation`，要么返回整个列表。

   1. 为 `HousingLocation` 添加文件级导入。

      ```ts [Import HousingLocation type in  src/app/housing-service.ts]
      import {Service} from '@angular/core';
      import {HousingLocationInfo} from './housinglocation';

      @Service()
      export class HousingService {
        readonly baseUrl = 'https://angular.dev/assets/images/tutorials/common';

        protected housingLocationList: HousingLocationInfo[] = [
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

        getAllHousingLocations(): HousingLocationInfo[] {
          return this.housingLocationList;
        }

        getHousingLocationById(id: number): HousingLocationInfo | undefined {
          return this.housingLocationList.find((housingLocation) => housingLocation.id === id);
        }
      }
      ```

1. 确认应用构建没有错误。
   在继续下一步之前，修正所有错误。


### 3. 将新服务注入到 `Home` 中 {#_3-inject-the-new-service-into-home}

这一步把新服务注入到应用的 `Home` 中，使其能够从服务中读取应用数据。
在后续课程中，你将用实时数据源替换这些静态数据，像在真实应用中那样获取数据。

在 IDE 的**编辑**面板中，打开 `src/app/home/home.ts`：

1.  在 `src/app/home/home.ts` 顶部，把 `inject` 添加到从 `@angular/core` 导入的项中。这会把 `inject` 函数导入到 `Home` 类中。

      ```ts [Update to src/app/home/home.ts]
      import {Component, inject} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';
      import {HousingLocationInfo} from '../housinglocation';
      import {HousingService} from '../housing-service';
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
        housingLocationList: HousingLocationInfo[] = [];
        housingService: HousingService = inject(HousingService);

        constructor() {
          this.housingLocationList = this.housingService.getAllHousingLocations();
        }
      }
      ```

1.  为 `HousingService` 添加一个新的文件级导入：

      ```ts [Add import to src/app/home/home.ts]
      import {Component, inject} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';
      import {HousingLocationInfo} from '../housinglocation';
      import {HousingService} from '../housing-service';
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
        housingLocationList: HousingLocationInfo[] = [];
        housingService: HousingService = inject(HousingService);

        constructor() {
          this.housingLocationList = this.housingService.getAllHousingLocations();
        }
      }
      ```

1.  在 `Home` 中，删除 `baseUrl` 变量，删除 `housingLocationList` 数组中的条目，并将 `housingLocationList` 赋值为空数组（`[]`）。稍后几步，你将更新代码，从 `HousingService` 中获取数据。

1.  在 `Home` 中添加以下代码，注入新服务并为应用初始化数据。`constructor` 是创建该组件时运行的第一个函数。`constructor` 中的代码会把调用 `getAllHousingLocations` 返回的值赋给 `housingLocationList`。

      ```ts [Initialize data from service in src/app/home/home.ts]
      import {Component, inject} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';
      import {HousingLocationInfo} from '../housinglocation';
      import {HousingService} from '../housing-service';
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
        housingLocationList: HousingLocationInfo[] = [];
        housingService: HousingService = inject(HousingService);

        constructor() {
          this.housingLocationList = this.housingService.getAllHousingLocations();
        }
      }
      ```

1.  保存对 `src/app/home/home.ts` 的更改，并确认应用构建没有错误。
    在继续下一步之前，修正所有错误。




::: info 总结
在本节中，你为应用添加了一个 Angular 服务，并将其注入到了 `Home` 类中。
这样就把应用获取数据的方式隔离了出来。
目前，新服务从一个静态数据数组中获取数据。
在后续课程中，你将重构该服务，使其从 API 端点获取数据。

:::

如需进一步了解本节涉及的主题，请访问：

- [创建可注入的服务](/guide/di/creating-and-using-services)
- [Angular 中的依赖注入](/guide/di)
- [ng generate service](https://angular.dev/cli/generate/service)
- [ng generate](https://angular.dev/cli/generate)

