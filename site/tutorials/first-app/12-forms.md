# 为 Angular 应用添加表单 {#adding-a-form-to-your-angular-app}

本节教程演示如何为 Angular 应用添加一个收集用户数据的表单。
本节从一个可以正常运行的 Angular 应用开始，演示如何为它添加表单。

表单收集到的数据只会发送给应用的服务（Service），由服务将其输出到浏览器控制台。
本节不涉及如何使用 REST API 发送和接收表单数据。

<iframe src="https://www.youtube.com/embed/kWbk-dOJaNQ?si=FYMXGdUiT-qh321h" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: warning 重要
建议你在本地环境中完成本节教程的这一步骤。

:::

## 你将学到什么 {#what-you-ll-learn}

- 你的应用将拥有一个表单，用户可以在其中输入数据，这些数据会被发送到应用的服务。
- 服务会把表单中的数据输出到浏览器的控制台日志中。



### 1. 添加一个用于发送表单数据的方法 {#_1-add-a-method-to-send-form-data}

这一步会在应用的服务中添加一个方法，用于接收表单数据并将其发送到数据的目的地。
在本例中，该方法会把表单数据输出到浏览器的控制台日志中。

在 IDE 的 **Edit** 窗格中：

1.  在 `src/app/housing-service.ts` 中，将这个方法粘贴到 `HousingService` 类定义的底部。

       ```ts [Submit method in src/app/housing-service.ts]
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

         submitApplication(firstName: string, lastName: string, email: string) {
           console.log(
             `Homes application received: firstName: ${firstName}, lastName: ${lastName}, email: ${email}.`,
           );
         }
       }
       ```

1.  确认应用构建时没有错误。
    在继续下一步之前，先修正所有错误。


### 2. 在详情页中添加表单相关的函数 {#_2-add-the-form-functions-to-the-details-page}

这一步会在详情页中添加处理表单交互的代码。

在 IDE 的 **Edit** 窗格中，打开 `src/app/details/details.ts`：

1.  在文件顶部的 `import` 语句之后，添加以下代码以导入 Angular 的表单类。

      ```ts [Forms imports in src/app/details/details.ts]
      import {Component, inject} from '@angular/core';
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
          this.housingLocation = this.housingService.getHousingLocationById(housingLocationId);
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

1.  在 `Details` 的装饰器元数据中，用以下代码更新 `imports` 属性：

      ```ts [imports directive in src/app/details/details.ts]
      import {Component, inject} from '@angular/core';
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
          this.housingLocation = this.housingService.getHousingLocationById(housingLocationId);
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

1.  在 `Details` 类中，在 `constructor()` 方法之前，添加以下代码来创建表单对象。

      ```ts [template directive in src/app/details/details.ts]
      import {Component, inject} from '@angular/core';
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
          this.housingLocation = this.housingService.getHousingLocationById(housingLocationId);
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

    在 Angular 中，`FormGroup` 和 `FormControl` 是用于构建表单的类型。`FormControl` 类型可以提供默认值，并决定表单数据的结构。在本例中，`firstName` 是 `string` 类型，默认值为空字符串。

1.  在 `Details` 类中，在 `constructor()` 方法之后，添加以下代码来处理 **Apply now** 按钮的点击。

      ```ts [template directive in src/app/details/details.ts]
      import {Component, inject} from '@angular/core';
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
          this.housingLocation = this.housingService.getHousingLocationById(housingLocationId);
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

    这个按钮现在还不存在——你将在下一步中添加它。在上面的代码中，`FormControl` 可能会返回 `null`。这段代码使用空值合并运算符（nullish coalescing operator），在值为 `null` 时默认使用空字符串。

1.  确认应用构建时没有错误。
    在继续下一步之前，先修正所有错误。


### 3. 在详情页中添加表单的标记 {#_3-add-the-form-s-markup-to-the-details-page}

这一步会在详情页中添加用于显示表单的标记。

在 IDE 的 **Edit** 窗格中，打开 `src/app/details/details.ts`：

1. 在 `Details` 的装饰器元数据中，将 `template` 的 HTML 更新为以下代码，以添加表单的标记。

   ```ts [template directive in src/app/details/details.ts]
   import {Component, inject} from '@angular/core';
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
       this.housingLocation = this.housingService.getHousingLocationById(housingLocationId);
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

   现在模板（Template）中包含了一个事件处理器 `(submit)="submitApplication()"`。Angular 在模板代码中使用将事件名括在圆括号中的语法来定义事件。等号右侧的代码就是该事件触发时要执行的代码。你可以绑定浏览器事件，也可以绑定自定义事件。

1. 确认应用构建时没有错误。
   在继续下一步之前，先修正所有错误。

   <img alt="details page with a form for applying to live at this location" src="/assets/images/tutorials/first-app/homes-app-lesson-12-step-3.png">


### 4. 测试应用的新表单 {#_4-test-your-app-s-new-form}

这一步会测试新表单，确认当表单数据提交给应用后，表单数据会出现在控制台日志中。

1. 在 IDE 的 **Terminal** 窗格中运行 `ng serve`（如果它还没有运行）。
1. 在浏览器中打开应用，地址为 `http://localhost:4200`。
1. 在浏览器中右键点击应用，然后从上下文菜单中选择 **Inspect**（检查）。
1. 在开发者工具窗口中，选择 **Console**（控制台）标签页。
   确保在接下来的步骤中开发者工具窗口保持可见
1. 在你的应用中：
   1. 选择一个房源位置并点击 **Learn more**，查看该房屋的详细信息。
   1. 在房屋详情页中，滚动到底部找到新的表单。
   1. 在表单字段中输入数据——任意数据都可以。
   1. 选择 **Apply now** 提交数据。
1. 在开发者工具窗口中，查看日志输出，找到你的表单数据。




::: info 总结
在本节中，你使用 Angular 的表单功能添加了一个表单，并通过事件处理器把表单中采集到的数据连接到了组件（Component）。

:::

如需进一步了解本节涉及的主题，请访问：

- [Angular 表单](/guide/forms)
- [事件处理](/guide/templates/event-listeners)

