---
untranslated: true
---

# Hello world

This first lesson serves as the starting point from which each lesson in this tutorial adds new features to build a complete Angular app. In this lesson, we'll update the application to display the famous text, "Hello World".

<iframe src="https://www.youtube.com/embed/UnOwDuliqZA?si=uML-cDRbrxmYdD_9" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## What you'll learn

If your application runs successfully in the browser and displays the executed content without errors, it confirms that your development environment and IDE are correctly set up to begin building an Angular app.

::: info NOTE
If you are working with the embedded editor, skip to [step four](#create-hello-world).
When working in the browser playground, you do not need to `ng serve` to run the app. Other commands like `ng generate` can be done in the console window to your right.

:::



### 1. Download the default app

Start by clicking the "Download" icon in the top right pane of the code editor. This will download a `.zip` file containing the source code for this tutorial. Open this in your local Terminal and IDE then move on to testing the default app.

At any step in the tutorial, you can click this icon to download the step's source code and start from there.


### 2. Test the default app

In this step, after you download the default starting app, you build the default Angular app.
This confirms that your development environment has what you need to continue the tutorial.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.
1. Run this command to install the dependencies needed to run the app.

   ```shell
   npm install
   ```

1. Run this command to build and serve the default app.

   ```shell
   ng serve
   ```

   The app should build without errors.

1. In a web browser on your development computer, open `http://localhost:4200`.
1. Confirm that the default web site appears in the browser.
1. You can leave `ng serve` running as you complete the next steps.


### 3. Review the files in the project

In this step, you get to know the files that make up a default Angular app.

In the **Explorer** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.
1. Open the `src` directory to see these files.
   1. In the file explorer, find the Angular app files (`/src`).
      1. `index.html` is the app's top level HTML template.
      1. `styles.css` is the app's top level style sheet.
      1. `main.ts` is where the app starts running.
      1. `favicon.ico` is the app's icon, just as you would find in any web site.
   1. In the file explorer, find the Angular app's component files (`/app`).
      1. `app.ts` is the source file that describes the `app-root` component.
         This is the top-level Angular component in the app. A component is the basic building block of an Angular application.
         The component description includes the component's code, HTML template, and styles, which can be described in this file, or in separate files.

         In this app, the styles are in a separate file while the component's code and HTML template are in this file.

      1. `app.css` is the style sheet for this component.
      1. New components are added to this directory.

   1. In the file explorer, find the image directory (`/public`) that contains images used by the app.
   1. In the file explorer, find the files and directories that an Angular app needs to build and run. They are not files that you normally interact with.
      1. `.angular` has files required to build the Angular app.
      1. `.node_modules` has the node.js packages that the app uses.
      1. `angular.json` describes the Angular app to the app building tools.
      1. `package.json` is used by `npm` (the node package manager) to run the finished app.
      1. `tsconfig.*` are the files that describe the app's configuration to the TypeScript compiler.

After you have reviewed the files that make up an Angular app project, continue to the next step.


### 4. Create `Hello World`

In this step, you update the Angular project files to change the displayed content.

In your IDE:

1. Open `first-app/src/index.html`.
   ::: info NOTE
   This step and the next are only for your local environment!

   :::

1. In `index.html`, replace the `<title>` element with this code to update the title of the app.

   ```html [Replace in src/index.html]
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <title>Homes</title>
       <base href="/" />
       <meta name="viewport" content="width=device-width, initial-scale=1" />
       <link rel="icon" type="image/x-icon" href="favicon.ico" />
       <link
         href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,700;1,400;1,700&display=swap"
         rel="stylesheet"
       />
     </head>
     <body>
       <app-root></app-root>
     </body>
   </html>
   ```

   Then, save the changes you just made to `index.html`.

1. Next, open `first-app/src/app/app.ts`.
1. In `app.ts`, in the `@Component` definition, replace the `template` line with this code to change the text in the app component.

   ```ts [Replace in src/app/app.ts]
   import {Component} from '@angular/core';

   @Component({
     selector: 'app-root',
     imports: [],
     template: ` <h1>Hello world!</h1> `,
     styleUrl: './app.css',
   })
   export class App {
     title = 'homes';
   }
   ```

1. In `app.ts`, in the `App` class definition, replace the `title` line with this code to change the component title.

   ```ts [Replace in src/app/app.ts]
   import {Component} from '@angular/core';

   @Component({
     selector: 'app-root',
     imports: [],
     template: ` <h1>Hello world!</h1> `,
     styleUrl: './app.css',
   })
   export class App {
     title = 'homes';
   }
   ```

   Then, save the changes you made to `app.ts`.

1. If you stopped the `ng serve` command from step 1, in the **Terminal** window of your IDE, run `ng serve` again.
1. Open your browser and navigate to `localhost:4200` and confirm that the app builds without error and displays _Homes_ in the title and _Hello world_ in the body of your app:
   <img alt="browser frame of page displaying the text 'Hello World'" src="/assets/images/tutorials/first-app/homes-app-lesson-01-browser.png">




::: info SUMMARY
In this lesson, you updated a default Angular app to display _Hello world_.
In the process, you learned about the `ng serve` command to serve your app locally for testing.

:::

For more information about the topics covered in this lesson, visit:

- [Angular Components](/guide/components)
- [Creating applications with the Angular CLI](/tools/cli)

