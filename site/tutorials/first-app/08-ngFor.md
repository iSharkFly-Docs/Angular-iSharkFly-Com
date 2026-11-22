---
untranslated: true
---

# Use @for to list objects in component

This tutorial lesson demonstrates how to use `@for` block in Angular templates in order to display dynamically repeated data in a template.

<iframe src="https://www.youtube.com/embed/eM3zi_n7lNs?si=MIl5NcRxvcLjYt5f&amp;start=477" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: info NOTE
This video reflects an older syntax, but the main concepts remain valid.

:::

## What you'll learn

- You will have added a data set to the app
- Your app will display a list of elements from the new data set using `@for`

## Conceptual preview of `@for`

In Angular, `@for` is a specific type of [control flow block](/guide/templates/control-flow) used to dynamically repeat data in a template. In plain JavaScript you would use a for loop - `@for` provides similar functionality for Angular templates.

You can utilize `@for` to iterate over arrays and even asynchronous values. In this lesson, you'll add a new array of data to iterate over.

For a more in depth explanation, please refer to the [control flow](/guide/templates/control-flow#repeat-content-with-the-for-block) guide.



### 1. Add housing data to the `Home`

In the `Home` there is only a single housing location. In this step, you will add an array of `HousingLocation` entries.

1. In `src/app/home/home.ts`, remove the `housingLocation` property from the `Home` class.
1. Update the `Home` class to have a property called `housingLocationList`. Update your code to match the following code:
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

   ::: warning IMPORTANT
   Do not remove the `@Component` decorator, you will update that code in an upcoming step.

   :::


### 2. Update the `Home` template to use `@for`

Now the app has a dataset that you can use to display the entries in the browser using the `@for` block.

1. Update the `<app-housing-location>` tag in the template code to this:
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

   Note, in the code `[housingLocation] = "housingLocation"` the `housingLocation` value now refers to the variable used in the `@for` block. Before this change, it referred to the property on the `Home` class.

1. Save all changes.

1. Refresh the browser and confirm that the app now renders a grid of housing locations.

<section class="lightbox">
<img alt="browser frame of homes-app displaying logo, filter text input box, search button and a grid of housing location cards" src="/assets/images/tutorials/first-app/homes-app-lesson-08-step-2.png">
</section>




::: info SUMMARY
In this lesson, you used the `@for` block to repeat data dynamically in Angular templates. You also added a new array of data to be used in the Angular app. The application now dynamically renders a list of housing locations in the browser.

:::

The app is taking shape, great job.

For more information about the topics covered in this lesson, visit:

- [Control flow blocks](/guide/templates/control-flow)
- [@for guide](/guide/templates/control-flow#repeat-content-with-the-for-block)
- [@for](https://angular.dev/api/core/@for)

