# 为应用添加 HTTP 通信

本教程演示如何将 HTTP 和 API 集成到你的应用中。

到目前为止，你的应用一直从 Angular 服务（Service）中的静态数组读取数据。下一步是使用一个 JSON 服务器，让应用通过 HTTP 与它通信。这个 HTTP 请求将模拟从服务器获取数据的体验。

<iframe src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: warning 重要
我们建议在本地环境中完成本教程的这一步。

:::

## 你将学到什么

你的应用将使用来自 JSON 服务器的数据



### 1. 配置 JSON 服务器

JSON Server 是一个用于创建模拟 REST API 的开源工具。你将用它来提供目前存储在 housing 服务中的房源位置数据。

1. 使用以下命令从 npm 安装 `json-server`。

   ```bash
   npm install -g json-server
   ```

1. 在项目的根目录中，创建一个名为 `db.json` 的文件。你将在这里为 `json-server` 存储数据。

1. 打开 `db.json`，并将以下代码复制到文件中

   ```json
   {
     "locations": [
       {
         "id": 0,
         "name": "Acme Fresh Start Housing",
         "city": "Chicago",
         "state": "IL",
         "photo": "https://angular.dev/assets/images/tutorials/common/bernard-hermant-CLKGGwIBTaY-unsplash.jpg",
         "availableUnits": 4,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 1,
         "name": "A113 Transitional Housing",
         "city": "Santa Monica",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/brandon-griggs-wR11KBaB86U-unsplash.jpg",
         "availableUnits": 0,
         "wifi": false,
         "laundry": true
       },
       {
         "id": 2,
         "name": "Warm Beds Housing Support",
         "city": "Juneau",
         "state": "AK",
         "photo": "https://angular.dev/assets/images/tutorials/common/i-do-nothing-but-love-lAyXdl1-Wmc-unsplash.jpg",
         "availableUnits": 1,
         "wifi": false,
         "laundry": false
       },
       {
         "id": 3,
         "name": "Homesteady Housing",
         "city": "Chicago",
         "state": "IL",
         "photo": "https://angular.dev/assets/images/tutorials/common/ian-macdonald-W8z6aiwfi1E-unsplash.jpg",
         "availableUnits": 1,
         "wifi": true,
         "laundry": false
       },
       {
         "id": 4,
         "name": "Happy Homes Group",
         "city": "Gary",
         "state": "IN",
         "photo": "https://angular.dev/assets/images/tutorials/common/krzysztof-hepner-978RAXoXnH4-unsplash.jpg",
         "availableUnits": 1,
         "wifi": true,
         "laundry": false
       },
       {
         "id": 5,
         "name": "Hopeful Apartment Group",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/r-architecture-JvQ0Q5IkeMM-unsplash.jpg",
         "availableUnits": 2,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 6,
         "name": "Seriously Safe Towns",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/phil-hearing-IYfp2Ixe9nM-unsplash.jpg",
         "availableUnits": 5,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 7,
         "name": "Hopeful Housing Solutions",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/r-architecture-GGupkreKwxA-unsplash.jpg",
         "availableUnits": 2,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 8,
         "name": "Seriously Safe Towns",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/saru-robert-9rP3mxf8qWI-unsplash.jpg",
         "availableUnits": 10,
         "wifi": false,
         "laundry": false
       },
       {
         "id": 9,
         "name": "Capital Safe Towns",
         "city": "Portland",
         "state": "OR",
         "photo": "https://angular.dev/assets/images/tutorials/common/webaliser-_TPTXZd9mOo-unsplash.jpg",
         "availableUnits": 6,
         "wifi": true,
         "laundry": true
       }
     ]
   }
   ```

1. 保存此文件。

1. 现在来测试你的配置。在命令行中，于项目根目录下运行以下命令。

   ```bash
   json-server --watch db.json
   ```

1. 在浏览器中访问 `http://localhost:3000/locations`，确认响应中包含 `db.json` 中存储的数据。

如果配置过程中遇到任何问题，可以在[官方文档](https://www.npmjs.com/package/json-server)中找到更多详细信息。


### 2. 更新服务，改用 Web 服务器而不是本地数组

数据源已经配置好了，下一步是更新你的 Web 应用，让它连接到该数据源并使用其中的数据。

1.  在 `src/app/housing-service.ts` 中进行以下修改：

1.  更新代码，删除 `housingLocationList` 属性和包含数据的数组，以及 `baseUrl` 属性。

1.  添加一个名为 `url` 的字符串属性，并将其值设置为 `'http://localhost:3000/locations'`

    ```ts [Add url property to housing-service.ts]
    import {Service} from '@angular/core';
    import {HousingLocationInfo} from './housinglocation';

    @Service()
    export class HousingService {
      url = 'http://localhost:3000/locations';

      async getAllHousingLocations(): Promise<HousingLocationInfo[]> {
        const data = await fetch(this.url);
        return (await data.json()) ?? [];
      }

      async getHousingLocationById(id: number): Promise<HousingLocationInfo | undefined> {
        const data = await fetch(`${this.url}/${id}`);
        const locationJson = await data.json();
        return locationJson ?? {};
      }

      submitApplication(firstName: string, lastName: string, email: string) {
        console.log(
          `Homes application received: firstName: ${firstName}, lastName: ${lastName}, email: ${email}.`,
        );
      }
    }
    ```

    这段代码会导致文件其余部分出错，因为它们依赖 `housingLocationList` 属性。接下来我们将更新服务中的方法。

1.  更新 `getAllHousingLocations` 函数，让它调用你配置好的 Web 服务器。

     ```ts [Update the getAllHousingLocations method in housing-service.ts]
     import {Service} from '@angular/core';
     import {HousingLocationInfo} from './housinglocation';

     @Service()
     export class HousingService {
       url = 'http://localhost:3000/locations';

       async getAllHousingLocations(): Promise<HousingLocationInfo[]> {
         const data = await fetch(this.url);
         return (await data.json()) ?? [];
       }

       async getHousingLocationById(id: number): Promise<HousingLocationInfo | undefined> {
         const data = await fetch(`${this.url}/${id}`);
         const locationJson = await data.json();
         return locationJson ?? {};
       }

       submitApplication(firstName: string, lastName: string, email: string) {
         console.log(
           `Homes application received: firstName: ${firstName}, lastName: ${lastName}, email: ${email}.`,
         );
       }
     }
     ```

    现在，这段代码使用异步代码通过 HTTP 发起 **GET** 请求。

    ::: tip 提示
    在这个例子中，代码使用的是 `fetch`。对于更高级的用例，可以考虑使用 Angular 提供的 `HttpClient`。

    :::

1.  更新 `getHousingLocationById` 函数，让它调用你配置好的 Web 服务器。

    ::: tip 提示
    注意，现在 `fetch` 的 URL 会把 `id` 作为路径段追加在后面（`${this.url}/${id}`），以请求 `id` 属性值与之匹配的房源位置。

    :::

     ```ts [Update the getHousingLocationById method in housing-service.ts]
     import {Service} from '@angular/core';
     import {HousingLocationInfo} from './housinglocation';

     @Service()
     export class HousingService {
       url = 'http://localhost:3000/locations';

       async getAllHousingLocations(): Promise<HousingLocationInfo[]> {
         const data = await fetch(this.url);
         return (await data.json()) ?? [];
       }

       async getHousingLocationById(id: number): Promise<HousingLocationInfo | undefined> {
         const data = await fetch(`${this.url}/${id}`);
         const locationJson = await data.json();
         return locationJson ?? {};
       }

       submitApplication(firstName: string, lastName: string, email: string) {
         console.log(
           `Homes application received: firstName: ${firstName}, lastName: ${lastName}, email: ${email}.`,
         );
       }
     }
     ```

1.  完成所有更新后，你更新后的服务应与以下代码一致。

     ```ts [Final version of housing-service.ts]
     import {Service} from '@angular/core';
     import {HousingLocationInfo} from './housinglocation';

     @Service()
     export class HousingService {
       url = 'http://localhost:3000/locations';

       async getAllHousingLocations(): Promise<HousingLocationInfo[]> {
         const data = await fetch(this.url);
         return (await data.json()) ?? [];
       }

       async getHousingLocationById(id: number): Promise<HousingLocationInfo | undefined> {
         const data = await fetch(`${this.url}/${id}`);
         const locationJson = await data.json();
         return locationJson ?? {};
       }

       submitApplication(firstName: string, lastName: string, email: string) {
         console.log(
           `Homes application received: firstName: ${firstName}, lastName: ${lastName}, email: ${email}.`,
         );
       }
     }
     ```


### 3. 更新组件，以异步方式调用 housing 服务

现在服务器从 HTTP 请求中读取数据，但依赖该服务的组件（Component）出现了错误，因为它们是按照同步版本的服务编写的。

1.  在 `src/app/home/home.ts` 中，更新 `constructor`，改用新的异步版本的 `getAllHousingLocations` 方法。由于我们没有使用信号（Signal）来管理状态，你需要通知 Angular 发生了需要同步的变更。为此，调用 `this.changeDetectorRef.markForCheck()`。

      ```ts [Update constructor in home.ts]
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
          this.housingService
            .getAllHousingLocations()
            .then((housingLocationList: HousingLocationInfo[]) => {
              this.housingLocationList = housingLocationList;
              this.filteredLocationList = housingLocationList;
              this.changeDetectorRef.markForCheck();
            });
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

1.  在 `src/app/details/details.ts` 中，更新 `constructor`，改用新的异步版本的 `getHousingLocationById` 方法。和之前一样，你还必须调用 `this.changeDetectorRef.markForCheck()` 来通知 Angular 发生了变更。

      ```ts [Update constructor in details.ts]
      import {ChangeDetectorRef, Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';
      import {HousingService} from '../housing-service';
      import {HousingLocationInfo} from '../housinglocation';
      import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

      @Component({
        selector: 'app-details',
        imports: [ReactiveFormsModule],
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
            <section class="listing-apply">
              <h2 class="section-heading">Apply now to live here</h2>
              <form [formGroup]="applyForm" (submit)="submitApplication()">
                <label for="first-name">First Name</label>
                <input id="first-name" type="text" formControlName="firstName" />

                <label for="last-name">Last Name</label>
                <input id="last-name" type="text" formControlName="lastName" />

                <label for="email">Email</label>
                <input id="email" type="email" formControlName="email" />
                <button type="submit" class="primary">Apply now</button>
              </form>
            </section>
          </article>
        `,
        styleUrl: './details.css',
      })
      export class Details {
        private readonly changeDetectorRef = inject(ChangeDetectorRef);
        route: ActivatedRoute = inject(ActivatedRoute);
        housingService = inject(HousingService);
        housingLocation: HousingLocationInfo | undefined;

        applyForm = new FormGroup({
          firstName: new FormControl(''),
          lastName: new FormControl(''),
          email: new FormControl(''),
        });

        constructor() {
          const housingLocationId = parseInt(this.route.snapshot.params['id'], 10);
          this.housingService.getHousingLocationById(housingLocationId).then((housingLocation) => {
            this.housingLocation = housingLocation;
            this.changeDetectorRef.markForCheck();
          });
        }

        submitApplication() {
          this.housingService.submitApplication(
            this.applyForm.value.firstName ?? '',
            this.applyForm.value.lastName ?? '',
            this.applyForm.value.email ?? '',
          );
        }
      }
      ```

1.  保存代码。

1.  在浏览器中打开应用，确认它运行时没有任何错误。




::: info 注意
本课依赖浏览器的 `fetch` API。如需了解对拦截器的支持，请参阅 [HTTP 客户端文档](/guide/http)

:::

::: info 总结
在本课中，你使用了本地 Web 服务器（`json-server`）和异步服务方法来获取数据。

:::

恭喜！你已经成功完成了本教程，可以继续你的旅程，构建更复杂的 Angular 应用了。

如果想了解更多内容，请考虑完成 Angular 的其他开发者[教程](/tutorials)和[指南](/overview)。
