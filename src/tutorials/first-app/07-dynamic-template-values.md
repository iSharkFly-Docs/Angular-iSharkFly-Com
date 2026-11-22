# Add an interpolation to a component’s template

This tutorial lesson demonstrates how to add interpolation to Angular templates in order to display dynamic data in a template.

<iframe src="https://www.youtube.com/embed/eM3zi_n7lNs?si=IFAly3Ss8dwqFx8N&amp;start=338" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## What you'll learn

- Your app will display interpolated values in the `HousingLocation` template.
- Your app will render a housing location data to the browser.

## Conceptual preview of interpolation

In this step you will display values read from `input` properties in a template using interpolation.

Using the `{{ expression }}` in Angular templates, you can render values from properties, `inputs`, and valid JavaScript expressions.

For a more in depth explanation, please refer to the [Displaying values with interpolation](/guide/templates/binding#render-dynamic-text-with-text-interpolation) guide.



### 1. Update `HousingLocation` template to include interpolated values

This step adds new HTML structure and interpolated values in the `HousingLocation` template.

In the code editor:

1.  Navigate to `src/app/housing-location/housing-location.ts`
1.  In the template property of the `@Component` decorator, replace the existing HTML markup with the following code:

    ```ts [Update HousingLocation template in housing-location.ts]
    import {Component, input} from '@angular/core';
    import {HousingLocationInfo} from '../housinglocation';

    @Component({
      selector: 'app-housing-location',
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
        </section>
      `,
      styleUrl: './housing-location.css',
    })
    export class HousingLocation {
      housingLocation = input.required<HousingLocationInfo>();
    }
    ```

In this updated template code you have used property binding to bind the `housingLocation.photo` to the `src` attribute. The `alt` attribute uses interpolation to give more context to the alt text of the image.

You use interpolation to include the values for `name`, `city` and `state` of the `housingLocation` property.


### 2. Confirm the changes render in the browser

1.  Save all changes.
1.  Open the browser and confirm that the app renders the photo, city and state sample data.
    <img alt="browser frame of homes-app displaying logo, filter text input box, search button and the same housing location UI card" src="/assets/images/tutorials/first-app/homes-app-lesson-07-step-2.png">




::: info SUMMARY
In this lesson, you added a new HTML structure and used Angular template syntax to render values in the `HousingLocation` template.

:::

Now, you have two important skills:

- passing data to components
- Interpolating values into a template

With these skills, your app can now share data and display dynamic values in the browser. Great work so far.

For more information about the topics covered in this lesson, visit:

- [Template syntax](/guide/templates)
- [Displaying values with interpolation](/guide/templates/binding#render-dynamic-text-with-text-interpolation)

