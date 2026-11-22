---
untranslated: true
---

# Add an input parameter to the component

This tutorial lesson demonstrates how to create a component `input` and use it to pass data to a component for customization.

<iframe src="https://www.youtube.com/embed/eM3zi_n7lNs?si=WvRGFSkW_7_zDIFD&amp;start=241" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: info NOTE
This video reflects an older syntax, but the main concepts remain valid.

:::

## What you'll learn

Your app's `HousingLocation` template will have a `HousingLocation` property to receive input.

## Conceptual preview of Inputs

[Inputs](https://angular.dev/api/core/input) allow components to specify data that can be passed to it from a parent component.

In this lesson, you'll define an `input` property in the `HousingLocation` component that enables you to customize the data displayed in the component.

Learn more in the [Accepting data with input properties](/guide/components/inputs) and [Custom events with outputs](/guide/components/outputs) guides.



### 1. Import the input() function

In the code editor, import the `input` helper method from `@angular/core` and the `HousingLocationInfo` interface from `../housinglocation` into the `HousingLocation` component.

```ts [Import input and HousingLocationInfo in housing-location.ts]
import {Component, input} from '@angular/core';
import {HousingLocationInfo} from '../housinglocation';

@Component({
  selector: 'app-housing-location',
  template: ` <p>housing-location works!</p> `,
  styleUrl: './housing-location.css',
})
export class HousingLocation {
  housingLocation = input.required<HousingLocationInfo>();
}
```


### 2. Add the Input property

Add a required property called `housingLocation` and initialize it using `input.required()` with the type `HousingLocationInfo`.

  ```ts [Declare the input property in housing-location.ts]
  import {Component, input} from '@angular/core';
  import {HousingLocationInfo} from '../housinglocation';

  @Component({
    selector: 'app-housing-location',
    template: ` <p>housing-location works!</p> `,
    styleUrl: './housing-location.css',
  })
  export class HousingLocation {
    housingLocation = input.required<HousingLocationInfo>();
  }
  ```

You have to invoke the `required` method on `input` to indicate that the parent component must provide a value. In our example application, we know this value will always be passed in — this is by design. The `.required()` call ensures that the TypeScript compiler enforces this and treats the property as non-nullable when this component is used in a template.


### 3. Pass data to the input

Send the `housingLocation` value from the `Home` component to the `housingLocation` property of the HousingLocation component.

```ts [Declare the input property for HousingLocation in home.ts]
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
      <app-housing-location [housingLocation]="housingLocation" />
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




::: info SUMMARY
In this lesson, you created a new `input` property. You also used the `.required` method to ensure the signal value is always defined.

:::

- [Accepting data with input properties](/guide/components/inputs)
- [Custom events with outputs](/guide/components/outputs)

