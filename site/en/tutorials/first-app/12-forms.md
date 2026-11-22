# Adding a form to your Angular app

This tutorial lesson demonstrates how to add a form that collects user data to an Angular app.
This lesson starts with a functional Angular app and shows how to add a form to it.

The data that the form collects is sent only to the app's service, which writes it to the browser's console.
Using a REST API to send and receive the form's data is not covered in this lesson.

<iframe src="https://www.youtube.com/embed/kWbk-dOJaNQ?si=FYMXGdUiT-qh321h" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: warning IMPORTANT
We recommend using your local environment for this step of the tutorial.

:::

## What you'll learn

- Your app will have a form into which users can enter data that is sent to your app's service.
- The service will write the data from the form to the browser's console log.



### 1. Add a method to send form data

This step adds a method to your app's service that receives the form data to send to the data's destination.
In this example, the method writes the data from the form to the browser's console log.

In the **Edit** pane of your IDE:

1.  In `src/app/housing-service.ts`, inside the `HousingService` class, paste this method at the bottom of the class definition.

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

1.  Confirm that the app builds without error.
    Correct any errors before you continue to the next step.


### 2. Add the form functions to the details page

This step adds the code to the details page that handles the form's interactions.

In the **Edit** pane of your IDE, in `src/app/details/details.ts`:

1.  After the `import` statements at the top of the file, add the following code to import the Angular form classes.

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

1.  In the `Details` decorator metadata, update the `imports` property with the following code:

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

1.  In the `Details` class, before the `constructor()` method, add the following code to create the form object.

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

    In Angular, `FormGroup` and `FormControl` are types that enable you to build forms. The `FormControl` type can provide a default value and shape the form data. In this example `firstName` is a `string` and the default value is empty string.

1.  In the `Details` class, after the `constructor()` method, add the following code to handle the **Apply now** click.

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

    This button does not exist yet - you will add it in the next step. In the above code, the `FormControl`s may return `null`. This code uses the nullish coalescing operator to default to empty string if the value is `null`.

1.  Confirm that the app builds without error.
    Correct any errors before you continue to the next step.


### 3. Add the form's markup to the details page

This step adds the markup to the details page that displays the form.

In the **Edit** pane of your IDE, in `src/app/details/details.ts`:

1. In the `Details` decorator metadata, update the `template` HTML to match the following code to add the form's markup.

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

   The template now includes an event handler `(submit)="submitApplication()"`. Angular uses parentheses syntax around the event name to define events in the template code. The code on the right hand side of the equals sign is the code that should be executed when this event is triggered. You can bind to browser events and custom events.

1. Confirm that the app builds without error.
   Correct any errors before you continue to the next step.

   <img alt="details page with a form for applying to live at this location" src="/assets/images/tutorials/first-app/homes-app-lesson-12-step-3.png">


### 4. Test your app's new form

This step tests the new form to see that when the form data is submitted to the app, the form data appears in the console log.

1. In the **Terminal** pane of your IDE, run `ng serve`, if it isn't already running.
1. In your browser, open your app at `http://localhost:4200`.
1. Right click on the app in the browser and from the context menu, choose **Inspect**.
1. In the developer tools window, choose the **Console** tab.
   Make sure that the developer tools window is visible for the next steps
1. In your app:
   1. Select a housing location and click **Learn more**, to see details about the house.
   1. In the house's details page, scroll to the bottom to find the new form.
   1. Enter data into the form's fields - any data is fine.
   1. Choose **Apply now** to submit the data.
1. In the developer tools window, review the log output to find your form data.




::: info SUMMARY
In this lesson, you added a form using Angular's forms feature, and connected the data captured in the form to a component using an event handler.

:::

For more information about the topics covered in this lesson, visit:

- [Angular Forms](/en/guide/forms)
- [Event Handling](/en/guide/templates/event-listeners)

