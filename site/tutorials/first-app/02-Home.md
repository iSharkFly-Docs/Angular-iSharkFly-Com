---
untranslated: true
---

# Create Home component

This tutorial lesson demonstrates how to create a new [component](/guide/components) for your Angular app.

<iframe src="https://www.youtube.com/embed/R0nRX8jD2D0?si=OMVaw71EIa44yIOJ" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## What you'll learn

Your app will have a new component: `Home`.

## Conceptual preview of Angular components

Angular apps are built around components, which are Angular's building blocks.
Components contain the code, HTML layout, and CSS style information that provide the function and appearance of an element in the app.
In Angular, components can contain other components. An app's functions and appearance can be divided and partitioned into components.

In Angular, components have metadata that define its properties.
When you create your `Home`, you use these properties:

- `selector`: to describe how Angular refers to the component in templates.
- `imports`: to describe the component's dependencies.
- `template`: to describe the component's HTML markup and layout.
- `styleUrl`: to specify the URL of the CSS file that the component uses.

- [Learn more about Components](https://angular.dev/api/core/Component)




### 1. Create the `Home`

In this step, you create a new component for your app.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.
1. Run this command to create a new `Home`

   ```shell
   ng generate component home
   ```

1. Run this command to build and serve your app.

   ::: info NOTE
   This step is only for your local environment!

   :::

   ```shell
   ng serve
   ```

1. Open a browser and navigate to `http://localhost:4200` to find the application.

1. Confirm that the app builds without error.

   ::: tip HELPFUL
   It should render the same as it did in the previous lesson because even though you added a new component, you haven't included it in any of the app's templates, yet.

   :::

1. Leave `ng serve` running as you complete the next steps.


### 2. Add the new component to your app's layout

In this step, you add the new component, `Home` to your app's root component, `App`, so that it displays in your app's layout.

In the **Edit** pane of your IDE:

1.  Open `app.ts` in the editor.
1.  In `app.ts`, import `Home` by adding this line to the file level imports.

      ```ts [Import Home in src/app/app.ts]
      import {Component} from '@angular/core';
      import {Home} from './home/home';

      @Component({
        selector: 'app-root',
        imports: [Home],
        template: `
          <main>
            <header class="brand-name">
              <img class="brand-logo" src="/public/logo.svg" alt="logo" aria-hidden="true" />
            </header>
            <section class="content">
              <app-home />
            </section>
          </main>
        `,
        styleUrl: './app.css',
      })
      export class App {
        title = 'homes';
      }
      ```

1.  In `app.ts`, in `@Component`, update the `imports` array property and add `Home`.

      ```ts [Replace in src/app/app.ts]
      import {Component} from '@angular/core';
      import {Home} from './home/home';

      @Component({
        selector: 'app-root',
        imports: [Home],
        template: `
          <main>
            <header class="brand-name">
              <img class="brand-logo" src="/public/logo.svg" alt="logo" aria-hidden="true" />
            </header>
            <section class="content">
              <app-home />
            </section>
          </main>
        `,
        styleUrl: './app.css',
      })
      export class App {
        title = 'homes';
      }
      ```

1.  In `app.ts`, in `@Component`, update the `template` property to include the following HTML code.

      ```ts [Replace in src/app/app.ts]
      import {Component} from '@angular/core';
      import {Home} from './home/home';

      @Component({
        selector: 'app-root',
        imports: [Home],
        template: `
          <main>
            <header class="brand-name">
              <img class="brand-logo" src="/public/logo.svg" alt="logo" aria-hidden="true" />
            </header>
            <section class="content">
              <app-home />
            </section>
          </main>
        `,
        styleUrl: './app.css',
      })
      export class App {
        title = 'homes';
      }
      ```

1.  Save your changes to `app.ts`.
1.  If `ng serve` is running, the app should update.
    If `ng serve` is not running, start it again.
    _Hello world_ in your app should change to _home works!_ from the `Home`.
1.  Check the running app in the browser and confirm that the app has been updated.

  <img alt="browser frame of page displaying the text 'home works!'" src="/assets/images/tutorials/first-app/homes-app-lesson-02-step-2.png">


### 3. Add features to `Home`

In this step you add features to `Home`.

In the previous step, you added the default `Home` to your app's template so its default HTML appeared in the app.
In this step, you add a search filter and button that is used in a later lesson.
For now, that's all that `Home` has.
Note that this step just adds the search elements to the layout without any functionality, yet.

If you started from a fresh Angular project instead of downloading the starter
(ng new): add these globals to `src/styles.css` so the search button and input border are visible:

```css
:root {
  --primary-color: #605dc8;
  --secondary-color: #8b89e6;
  --accent-color: #e8e7fa;
  --shadow-color: #e8e8e8;
}

button.primary {
  padding: 10px;
  border: solid 1px var(--primary-color);
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
}
```

In the **Edit** pane of your IDE:

1.  In the `first-app` directory, open `home.ts` in the editor.
1.  In `home.ts`, in `@Component`, update the `template` property with this code.

      ```ts [Replace in src/app/home/home.ts]
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-home',
        template: `
          <section>
            <form>
              <input type="text" placeholder="Filter by city" />
              <button class="primary" type="button">Search</button>
            </form>
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {}
      ```

1.  Next, open `home.css` in the editor and update the content with these styles.

    ::: info NOTE
    In the browser, these can go in `src/app/home/home.ts` in the `styles` array.

    :::

       ```css [Replace in src/app/home/home.css]
       .results {
         display: grid;
         column-gap: 14px;
         row-gap: 14px;
         grid-template-columns: repeat(auto-fill, minmax(400px, 400px));
         margin-top: 50px;
         justify-content: space-around;
       }
       
       input[type="text"] {
         border: solid 1px var(--primary-color);
         padding: 10px;
         border-radius: 8px;
         margin-right: 4px;
         display: inline-block;
         width: 30%;
       }
       
       button {
         padding: 10px;
         border: solid 1px var(--primary-color);
         background: var(--primary-color);
         color: white;
         border-radius: 8px;
       }
       
       @media (min-width: 500px) and (max-width: 768px) {
         .results {
             grid-template-columns: repeat(2, 1fr);
         }
         input[type="text"] {
             width: 70%;
         }   
       }
       
       @media (max-width: 499px) {
         .results {
             grid-template-columns: 1fr;
         }    
       }
       ```

1.  Confirm that the app builds without error. You should find the filter query box and button in your app and they should be styled. Correct any errors before you continue to the next step.

   <img alt="browser frame of homes-app displaying logo, filter text input box and search button" src="/assets/images/tutorials/first-app/homes-app-lesson-02-step-3.png">




::: info SUMMARY
In this lesson, you created a new component for your app and gave it a filter edit control and button.

:::

For more information about the topics covered in this lesson, visit:

- [`ng generate component`](https://angular.dev/cli/generate/component)
- [`Component` reference](https://angular.dev/api/core/Component)
- [Angular components overview](/guide/components)

