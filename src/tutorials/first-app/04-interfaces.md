# Creating an interface

This tutorial lesson demonstrates how to create an interface and include it in a component of your app.

<iframe src="https://www.youtube.com/embed/eM3zi_n7lNs?si=YkFSeUeV8Ixtz8pm" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## What you'll learn

- Your app will have a new interface that it can use as a data type.
- Your app will have an instance of the new interface with sample data.

## Conceptual preview of interfaces

[Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html) are custom data types for your app.

Angular uses TypeScript to take advantage of working in a strongly typed programming environment.
Strong type checking reduces the likelihood of one element in your app sending incorrectly formatted data to another.
Such type-mismatch errors are caught by the TypeScript compiler and many such errors can also be caught in your IDE.

In this lesson, you'll create an interface to define properties that represent data about a single housing location.



### 1. Create a new Angular interface

This step creates a new interface in your app.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.
1. In the `first-app` directory, run this command to create the new interface.

   ```shell

   ng generate interface housinglocation

   ```

1. Run `ng serve` to build the app and serve it to `http://localhost:4200`.
1. In a browser, open `http://localhost:4200` to see your app.
1. Confirm that the app builds without error.
   Correct any errors before you continue to the next step.


### 2. Add properties to the new interface

This step adds the properties to the interface that your app needs to represent a housing location.

1.  In the **Terminal** pane of your IDE, start the `ng serve` command, if it isn't already running, to build the app and serve it to `http://localhost:4200`.
1.  In the **Edit** pane of your IDE, open the `src/app/housinglocation.ts` file.
1.  In `housinglocation.ts`, replace the default content with the following code to make your new interface to match this example.

      ```ts [Update src/app/housinglocation.ts to match this code]
      export interface HousingLocationInfo {
        id: number;
        name: string;
        city: string;
        state: string;
        photo: string;
        availableUnits: number;
        wifi: boolean;
        laundry: boolean;
      }
      ```

1.  Save your changes and confirm the app does not display any errors. Correct any errors before you continue to the next step.

At this point, you've defined an interface that represents data about a housing location including an `id`, `name`, and location information.


### 3. Create a test house for your app

You have an interface, but you aren't using it yet.

In this step, you create an instance of the interface and assign some sample data to it.
You won't see this sample data appear in your app yet.
There are a few more lessons to complete before that happens.

1.  In the **Terminal** pane of your IDE, run the `ng serve` command, if it isn't already running, to build the app and serve your app to `http://localhost:4200`.
1.  In the **Edit** pane of your IDE, open `src/app/home/home.ts`.
1.  In `src/app/home/home.ts`, add this import statement after the existing `import` statements so that `Home` can use the new interface.

      ```ts [Import Home in src/app/home/home.ts]
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
            <app-housing-location />
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {
        readonly baseUrl = 'https://angular.dev/assets/images/tutorials/common';

        housingLocation: HousingLocationInfo = {
          id: 9999,
          name: 'Test Home',
          city: 'Test city',
          state: 'ST',
          photo: `${this.baseUrl}/example-house.jpg`,
          availableUnits: 99,
          wifi: true,
          laundry: false,
        };
      }
      ```

1.  In `src/app/home/home.ts`, replace the empty `export class Home {}` definition with this code to create a single instance of the new interface in the component.

      ```ts [Add sample data to src/app/home/home.ts]
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
            <app-housing-location />
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {
        readonly baseUrl = 'https://angular.dev/assets/images/tutorials/common';

        housingLocation: HousingLocationInfo = {
          id: 9999,
          name: 'Test Home',
          city: 'Test city',
          state: 'ST',
          photo: `${this.baseUrl}/example-house.jpg`,
          availableUnits: 99,
          wifi: true,
          laundry: false,
        };
      }
      ```

1.  Confirm that your `home.ts` file matches this example.

      ```ts [src/app/home/home.ts]
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
            <app-housing-location />
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {
        readonly baseUrl = 'https://angular.dev/assets/images/tutorials/common';

        housingLocation: HousingLocationInfo = {
          id: 9999,
          name: 'Test Home',
          city: 'Test city',
          state: 'ST',
          photo: `${this.baseUrl}/example-house.jpg`,
          availableUnits: 99,
          wifi: true,
          laundry: false,
        };
      }
      ```

    By adding the `housingLocation` property of type `HousingLocation` to the `Home` class, we're able to confirm that the data matches the description of the interface. If the data didn't satisfy the description of the interface, the IDE has enough information to give us helpful errors.

1.  Save your changes and confirm the app does not have any errors. Open the browser and confirm that your application still displays the message "housing-location works!"

      <img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!'" src="/assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">

1.  Correct any errors before you continue to the next step.




::: info SUMMARY
In this lesson, you created an interface that created a new data type for your app.
This new data type makes it possible for you to specify where `HousingLocation` data is required.
This new data type also makes it possible for your IDE and the TypeScript compiler can ensure that `HousingLocation` data is used where it's required.

:::

For more information about the topics covered in this lesson, visit:

- [ng generate interface](https://angular.dev/cli/generate/interface)
- [ng generate](https://angular.dev/cli/generate)

