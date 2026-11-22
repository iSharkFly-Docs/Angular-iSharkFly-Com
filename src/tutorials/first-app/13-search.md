# Add the search feature to your app

This tutorial lesson demonstrates how to add a search functionality to your Angular app.

The app will enable users to search through the data provided by your app and display only the results that match the entered term.

<iframe src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k&amp;start=457" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: warning IMPORTANT
We recommend using your local environment for this step of the tutorial.

:::

## What you'll learn

- Your app will use data from a form to search for matching housing locations
- Your app will display only the matching housing locations



### 1. Update the home component properties

In this step, you'll update the `Home` class to store data in a new array property that you will use for filtering.

1. In `src/app/home/home.ts`, add new property to the class called `filteredLocationList`.

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

   The `filteredLocationList` hold the values that match the search criteria entered by the user.

1. The `filteredLocationList` should contain the total set of housing locations values by default when the page loads. Update the `constructor` for the `Home` to set the value.

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


### 2. Update the home component template

The `Home` already contains an input field that you will use to capture input from the user. That string text will be used to filter the results.

1. Update the `Home` template to include a template variable in the `input` element called `#filter`.

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
   This example uses a [template reference variable](/guide/templates) to get access to the `input` element as its value.

1. Next, update the component template to attach an event handler to the "Search" button.

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

   By binding to the `click` event on the `button` element, you are able to call the `filterResults` function. The argument to the function is the `value` property of the `filter` template variable. Specifically, the `.value` property from the `input` HTML element.

1. The last template update is to the `@for` directive. Update the `@for` to iterate over values from the `filteredLocationList` array.

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


### 3. Implement the event handler function

The template has been updated to bind the `filterResults` function to the `click` event. Next, your task is to implement the `filterResults` function in the `Home` class.

1.  Update the `Home` class to include the implementation of the `filterResults` function.

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

    This function uses the `Array` `filter` function to compare the value of the `text` parameter against the `housingLocation.city` property. You can update this function to match against any property or multiple properties for a fun exercise.

1.  Save your code.

1.  Refresh the browser and confirm that you can search the housing location data by city when you click the "Search" button after entering text.

       <img alt="filtered search results based on user input" src="/assets/images/tutorials/first-app/homes-app-lesson-13-step-3.png">




::: info SUMMARY
In this lesson, you used template variables to interact with template values, and added search functionality using event binding and array functions.

:::

For more information about the topics covered in this lesson, visit:

- [Template Variables](/guide/templates)
- [Event Handling](/guide/templates/event-listeners)

