# Angular services

This tutorial lesson demonstrates how to create an Angular service and use dependency injection to include it in your app.

<iframe src="https://www.youtube.com/embed/-jRxG84AzCI?si=rieGfJawp9xJ00Sz" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## What you'll learn

Your app will have a service that reads local, static data and serves it to your app.
In a later lesson, you'll update the service to get data from a web service.

## Conceptual preview of services

This tutorial introduces Angular services and dependency injection.

### Angular services

_Angular services_ provide a way for you to separate Angular app data and functions that can be used by multiple components in your app.
To be used by multiple components, a service must be made _injectable_.
Services that are injectable and used by a component become dependencies of that component.
The component depends on those services and can't function without them.

### Dependency injection

_Dependency injection_ is the mechanism that manages the dependencies of an app's components and the services that other components can use.



### 1. Create a new service for your app

This step creates an injectable service for your app.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.
1. In the `first-app` directory, run this command to create the new service.

   ```shell
   ng generate service housingService --skip-tests
   ```

1. Run `ng serve` to build the app and serve it to `http://localhost:4200`.
1. Confirm that the app builds without error.
   Correct any errors before you continue to the next step.


### 2. Add static data to the new service

This step adds some sample data to your new service.
In a later lesson, you'll replace the static data with a web interface to get data as you might in a real app.
For now, your app's new service uses the data that has, so far, been created locally in `Home`.

In the **Edit** pane of your IDE:

1. In `src/app/home/home.ts`, from `Home`, copy the `baseUrl` variable and the `housingLocationList` variable with its array value.
1. In `src/app/housing-service.ts`:
   1. Inside the `HousingService` class, paste the variables that you copied from `Home` in the previous step.
   1. Inside the `HousingService` class, paste these functions after the data you just copied.
      These functions allow dependencies to access the service's data.

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

      You will need these functions in a future lesson. For now, it is enough to understand that these functions return either a specific `HousingLocation` by id or the entire list.

   1. Add a file level import for the `HousingLocation`.

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

1. Confirm that the app builds without error.
   Correct any errors before you continue to the next step.


### 3. Inject the new service into `Home`

This step injects the new service into your app's `Home` so that it can read the app's data from a service.
In a later lesson, you'll replace the static data with a live data source to get data as you might in a real app.

In the **Edit** pane of your IDE, in `src/app/home/home.ts`:

1.  At the top of `src/app/home/home.ts`, add the `inject` to the items imported from `@angular/core`. This will import the `inject` function into the `Home` class.

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

1.  Add a new file level import for the `HousingService`:

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

1.  From `Home`, delete the `baseUrl` variable, delete the `housingLocationList` array entries and assign `housingLocationList` the value of empty array (`[]`). In a few steps you will update the code to pull the data from the `HousingService`.

1.  In `Home`, add the following code to inject the new service and initialize the data for the app. The `constructor` is the first function that runs when this component is created. The code in the `constructor` will assign the `housingLocationList` the value returned from the call to `getAllHousingLocations`.

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

1.  Save the changes to `src/app/home/home.ts` and confirm your app builds without error.
    Correct any errors before you continue to the next step.




::: info SUMMARY
In this lesson, you added an Angular service to your app and injected it into the `Home` class.
This compartmentalizes how your app gets its data.
For now, the new service gets its data from a static array of data.
In a later lesson, you'll refactor the service to get its data from an API endpoint.

:::

For more information about the topics covered in this lesson, visit:

- [Creating an injectable service](/guide/di/creating-and-using-services)
- [Dependency injection in Angular](/guide/di)
- [ng generate service](https://angular.dev/cli/generate/service)
- [ng generate](https://angular.dev/cli/generate)

