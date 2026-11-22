# Add HTTP communication to your app

This tutorial demonstrates how to integrate HTTP and an API into your app.

Up until this point your app has read data from a static array in an Angular service. The next step is to use a JSON server that your app will communicate with over HTTP. The HTTP request will simulate the experience of working with data from a server.

<iframe src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: warning IMPORTANT
We recommend using your local environment for this step of the tutorial.

:::

## What you'll learn

Your app will use data from a JSON server



### 1. Configure the JSON server

JSON Server is an open source tool used to create mock REST APIs. You'll use it to serve the housing location data that is currently stored in the housing service.

1. Install `json-server` from npm by using the following command.

   ```bash
   npm install -g json-server
   ```

1. In the root directory of your project, create a file called `db.json`. This is where you will store the data for the `json-server`.

1. Open `db.json` and copy the following code into the file

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

1. Save this file.

1. Time to test your configuration. From the command line, at the root of your project run the following commands.

   ```bash
   json-server --watch db.json
   ```

1. In your web browser, navigate to the `http://localhost:3000/locations` and confirm that the response includes the data stored in `db.json`.

If you have any trouble with your configuration, you can find more details in the [official documentation](https://www.npmjs.com/package/json-server).


### 2. Update service to use web server instead of local array

The data source has been configured, the next step is to update your web app to connect to it use the data.

1.  In `src/app/housing-service.ts`, make the following changes:

1.  Update the code to remove `housingLocationList` property and the array containing the data, as well as the `baseUrl` property.

1.  Add a string property called `url` and set its value to `'http://localhost:3000/locations'`

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

    This code will result in errors in the rest of the file because it depends on the `housingLocationList` property. We're going to update the service methods next.

1.  Update the `getAllHousingLocations` function to make a call to the web server you configured.

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

    The code now uses asynchronous code to make a **GET** request over HTTP.

    ::: tip HELPFUL
    For this example, the code uses `fetch`. For more advanced use cases consider using `HttpClient` provided by Angular.

    :::

1.  Update the `getHousingLocationById` function to make a call to the web server you configured.

    ::: tip HELPFUL
    Notice the `fetch` URL now appends the `id` as a path segment (`${this.url}/${id}`) to request the location with a matching `id` property value.

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

1.  Once all the updates are complete, your updated service should match the following code.

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


### 3. Update the components to use asynchronous calls to the housing service

The server is now reading data from the HTTP request but the components that rely on the service now have errors because they were programmed to use the synchronous version of the service.

1.  In `src/app/home/home.ts`, update the `constructor` to use the new asynchronous version of the `getAllHousingLocations` method. Because we didn't use signals for our state, you have to notify Angular that a change happened that requires a synchronization. Call `this.changeDetectorRef.markForCheck()` to do this.

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

1.  In `src/app/details/details.ts`, update the `constructor` to use the new asynchronous version of the `getHousingLocationById` method. As before, you must also call `this.changeDetectorRef.markForCheck()` to notify Angular of the changes.

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

1.  Save your code.

1.  Open the application in the browser and confirm that it runs without any errors.




::: info NOTE
This lesson relies on the `fetch` browser API. For the support of interceptors, please refer to the [HTTP client documentation](/guide/http)

:::

::: info SUMMARY
In this lesson, you used a local web server (`json-server`) and asynchronous service methods to retrieve data.

:::

Congratulations! You've successfully completed this tutorial and are ready to continue your journey with building even more complex Angular Apps.

If you would like to learn more, please consider completing some of Angular's other developer [tutorials](/tutorials) and [guides](/overview).
