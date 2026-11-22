# Add routes to the application

This tutorial lesson demonstrates how to add routes to your app.

<iframe src="https://www.youtube.com/embed/r5DEBMuStPw?si=H6Bx6nLJoMLaMxkx" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: warning IMPORTANT
We recommend using your local environment to learn routing.

:::

## What you'll learn

At the end of this lesson your application will have support for routing.

## Conceptual preview of routing

This tutorial introduces routing in Angular. Routing is the ability to navigate from one component in the application to another. In [Single Page Applications (SPA)](/en/guide/routing), only parts of the page are updated to represent the requested view for the user.

The [Angular Router](/en/guide/routing) enables users to declare routes and specify which component should be displayed on the screen if that route is requested by the application.

In this lesson, you will enable routing in your application to navigate to the details page.



### 1. Create a default details component 

1. From the terminal, enter the following command to create the `Details`:

    ```shell
    ng generate component details
    ```

    This component will represent the details page that provides more information on a given housing location.


### 2. Add routing to the application

1.  In the `src/app` directory, create a file called `routes.ts`. This file is where we will define the routes in the application.

2.  In `main.ts`, make the following updates to enable routing in the application:
    1.  Import the routes file and the `provideRouter` function:

          ```ts [Import routing details in src/main.ts]
          import {bootstrapApplication} from '@angular/platform-browser';
          import {App} from './app/app';
          import {provideRouter} from '@angular/router';
          import routeConfig from './app/routes';

          bootstrapApplication(App, {
            providers: [provideRouter(routeConfig)],
          }).catch((err) => console.error(err));
          ```

    1.  Update the call to `bootstrapApplication` to include the routing configuration:

          ```ts [Add router configuration in src/main.ts]
          import {bootstrapApplication} from '@angular/platform-browser';
          import {App} from './app/app';
          import {provideRouter} from '@angular/router';
          import routeConfig from './app/routes';

          bootstrapApplication(App, {
            providers: [provideRouter(routeConfig)],
          }).catch((err) => console.error(err));
          ```

3.  In `src/app/app.ts`, update the component to use routing:
    1.  Add file level imports for the router directives `RouterLink` and `RouterOutlet`:

          ```ts [Import router directives in src/app/app.ts]
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

    1.  In the `@Component` metadata imports, replace `Home` with `RouterLink` and `RouterOutlet`:

          ```ts [Add router directives to component imports in src/app/app.ts]
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

    1.  In the `template` property, replace the `<app-home />` tag with the `<router-outlet>` directive and add a link back to the home page. Your code should match this code:

          ```ts [Add router-outlet in src/app/app.ts]
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


### 3. Add route to new component

In the previous step you removed the reference to the `<app-home>` component in the template. In this step, you will add a new route to that component.

1. In `routes.ts`, perform the following updates to create a route.
   1. Add a file level imports for the `Home`, `Details` and the `Routes` type that you'll use in the route definitions.

      ```ts [Import components and Routes]
      import {Routes} from '@angular/router';
      import {Home} from './home/home';
      import {Details} from './details/details';

      const routeConfig: Routes = [
        {
          path: '',
          component: Home,
          title: 'Home page',
        },
        {
          path: 'details/:id',
          component: Details,
          title: 'Home details',
        },
      ];

      export default routeConfig;
      ```

   1. Define a variable called `routeConfig` of type `Routes` and define two routes for the app:
      ```ts [Add routes to the app]
      import {Routes} from '@angular/router';
      import {Home} from './home/home';
      import {Details} from './details/details';

      const routeConfig: Routes = [
        {
          path: '',
          component: Home,
          title: 'Home page',
        },
        {
          path: 'details/:id',
          component: Details,
          title: 'Home details',
        },
      ];

      export default routeConfig;
      ```

      The entries in the `routeConfig` array represent the routes in the application. The first entry navigates to the `Home` whenever the url matches `''`. The second entry uses some special formatting that will be revisited in a future lesson.

1. Save all changes and confirm that the application works in the browser. The application should still display the list of housing locations.




::: info SUMMARY
In this lesson, you enabled routing in your app as well as defined new routes. Now your app can support navigation between views. In the next lesson, you will learn to navigate to the "details" page for a given housing location.

:::

You are making great progress with your app, well done.

For more information about the topics covered in this lesson, visit:

- [Routing in Angular Overview](/en/guide/routing)
- [Common Routing Tasks](/en/guide/routing/common-router-tasks)

