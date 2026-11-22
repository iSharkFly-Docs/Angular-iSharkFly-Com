# Integrate details page into application

This tutorial lesson demonstrates how to connect the details page to your app.

<iframe src="https://www.youtube.com/embed/-jRxG84AzCI?si=CbqIpmRpwp5ZZDnu&amp;start=345" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: warning IMPORTANT
We recommend using your local environment to learn routing.

:::

## What you'll learn

At the end of this lesson your application will have support for routing to the details page.

## Conceptual preview of routing with route parameters

Each housing location has specific details that should be displayed when a user navigates to the details page for that item. To accomplish this goal, you will need to use route parameters.

Route parameters enable you to include dynamic information as a part of your route URL. To identify which housing location a user has clicked on you will use the `id` property of the `HousingLocation` type.



### 1. Using `routerLink` for dynamic navigation

In lesson 10, you added a second route to `src/app/routes.ts` which includes a special segment that identifies the route parameter, `id`:

```
'details/:id'
```

In this case, `:id` is dynamic and will change based on how the route is requested by the code.

1.  In `src/app/housing-location/housing-location.ts`, add an anchor tag to the `section` element and include the `routerLink` directive:

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

    The `routerLink` directive enables Angular's router to create dynamic links in the application. The value assigned to the `routerLink` is an array with two entries: the static portion of the path and the dynamic data.

    For the `routerLink` to work in the template, add a file level import of `RouterLink` from '@angular/router', then update the component `imports` array to include `RouterLink`.

1.  At this point you can confirm that the routing is working in your app. In the browser, refresh the home page and click the "Learn More" button for a housing location.

      <img alt="details page displaying the text 'details works!'" src="/assets/images/tutorials/first-app/homes-app-lesson-11-step-1.png">


### 2. Get route parameters

In this step, you will get the route parameter in the `Details`. Currently, the app displays `details works!`. Next you'll update the code to display the `id` value passed using the route parameters.

1.  In `src/app/details/details.ts` update the template to import the functions, classes and services that you'll need to use in the `Details`:

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

1.  Update the `template` property of the `@Component` decorator to display the value `housingLocationId`:

         ```ts
         template: `<p>details works! {{ housingLocationId }}</p>`,
         ```

1.  Update the body of the `Details` class with the following code:

         ```ts
         export class Details {
           route: ActivatedRoute = inject(ActivatedRoute);
           housingLocationId = -1;
           constructor() {
             this.housingLocationId = Number(this.route.snapshot.params['id']);
           }
         }
         ```

    This code gives the `Details` access to the `ActivatedRoute` router feature that enables you to have access to the data about the current route. In the `constructor`, the code converts the `id` parameter acquired from the route from a string to a number.

1.  Save all changes.

1.  In the browser, click on one of the housing location's "Learn More" links and confirm that the numeric value displayed on the page matches the `id` property for that location in the data.


### 3. Customize the `Details`

Now that routing is working properly in the application this is a great time to update the template of the `Details` to display the specific data represented by the housing location for the route parameter.

To access the data you will add a call to the `HousingService`.

1. Update the template code to match the following code:

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

   Notice that the `housingLocation` properties are being accessed with the optional chaining operator `?`. This ensures that if the `housingLocation` value is null or undefined the application doesn't crash.

1. Update the body of the `Details` class to match the following code:

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

   Now the component has the code to display the correct information based on the selected housing location. The `constructor` now includes a call to the `HousingService` to pass the route parameter as an argument to the `getHousingLocationById` service function.

1. Copy the following styles into the `src/app/details/details.css` file:

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

   and save your changes

1. In the browser refresh the page and confirm that when you click on the "Learn More" link for a given housing location the details page displays the correct information based on the data for that selected item.

<img alt="Details page listing home info" src="/assets/images/tutorials/first-app/homes-app-lesson-11-step-3.png">


### 4. Check navigation in the `Home`

In a previous lesson you updated the `App` template to include a `routerLink`. Adding that code updated your app to enable navigation back to the `Home` whenever the logo is clicked.

1.  Confirm that your code matches the following:

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

    Your code should already be up-to-date but confirm to be sure.




::: info SUMMARY
In this lesson you added routing to show details pages.

:::

You now know how to:

- use route parameters to pass data to a route
- use the `routerLink` directive to use dynamic data to create a route
- use route parameter to retrieve data from the `HousingService` to display specific housing location information.

Really great work so far.

For more information about the topics covered in this lesson, visit:

- [Route Parameters](/en/guide/routing/read-route-state#get-information-about-the-current-route-with-activatedroute)
- [Routing in Angular Overview](/en/guide/routing)
- [Common Routing Tasks](/en/guide/routing/common-router-tasks)
- [Optional Chaining Operator](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

