# Create the application’s HousingLocation component

This tutorial lesson demonstrates how to add the `HousingLocation` component to your Angular app.

<iframe src="https://www.youtube.com/embed/R0nRX8jD2D0?si=U4ONEbPvtptdUHTt&amp;start=440" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## What you'll learn

Your app will have a new component, `HousingLocation`, and it will display a message confirming that the component was added to your application.



### 1. Create the `HousingLocation`

In this step, you create a new component for your app.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.

1. Run this command to create a new `HousingLocation`

   ```shell
   ng generate component housingLocation
   ```

1. Run this command to build and serve your app.

   ```shell
   ng serve
   ```

   ::: info NOTE
   This step is only for your local environment!

   :::

1. Open a browser and navigate to `http://localhost:4200` to find the application.
1. Confirm that the app builds without error.

   ::: tip HELPFUL
   It should render the same as it did in the previous lesson because even though you added a new component, you haven't included it in any of the app's templates, yet.

   :::

1. Leave `ng serve` running as you complete the next steps.


### 2. Add the new component to your app's layout

In this step, you add the new component, `HousingLocation` to your app's `Home`, so that it displays in your app's layout.

In the **Edit** pane of your IDE:

1.  Open `home.ts` in the editor.
1.  In `home.ts`, import `HousingLocation` by adding this line to the file level imports.

      ```ts [Import HousingLocation in src/app/home/home.ts]
      import {Component} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';

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
      export class Home {}
      ```

1.  Next update the `imports` property of the `@Component` metadata by adding `HousingLocation` to the array.

      ```ts [Add HousingLocation to imports array in src/app/home/home.ts]
      import {Component} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';

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
      export class Home {}
      ```

1.  Now the component is ready for use in the template for the `Home`. Update the `template` property of the `@Component` metadata to include a reference to the `<app-housing-location>` tag.

      ```ts [Add housing location to the component template in src/app/home/home.ts]
      import {Component} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';

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
      export class Home {}
      ```


### 3. Add the styles for the component

In this step, you will copy over the pre-written styles for the `HousingLocation` to your app so that the app renders properly.

1. Open `src/app/housing-location/housing-location.css`, and paste the styles below into the file:

   ::: info NOTE
   In the browser, these can go in `src/app/housing-location/housing-location.ts` in the `styles` array.

   :::

   ```css [Add CSS styles to housing location to the component in src/app/housing-location/housing-location.css]
   .listing {
     background: var(--accent-color);
     border-radius: 30px;
     padding-bottom: 30px;
   }
   .listing-heading {
     color: var(--primary-color);
     padding: 10px 20px 0 20px;
   }
   .listing-photo {
     height: 250px;
     width: 100%;
     object-fit: cover;
     border-radius: 30px 30px 0 0;
   }
   .listing-location {
     padding: 10px 20px 20px 20px;
   }
   .listing-location::before {
     content: url('/public/location-pin.svg') / '';
   }
   
   section.listing a {
     padding-left: 20px;
     text-decoration: none;
     color: var(--primary-color);
   }
   section.listing a::after {
     content: '\203A';
     margin-left: 5px;
   }
   ```

1. Save your code, return to the browser and confirm that the app builds without error. You should find the message "housing-location works!" rendered to the screen.Correct any errors before you continue to the next step.

   <img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!" src="/assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">




::: info SUMMARY
In this lesson, you created a new component for your app and added it to the app's layout.

:::
