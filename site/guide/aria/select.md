---
untranslated: true
---

# Select

## Overview

A pattern that combines a combobox with a listbox to create single-selection dropdowns with keyboard navigation and screen reader support.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/retro/app/app.css)

</TabItem>

</Tabs>

## Usage

The select pattern works best when users need to choose a single value from a familiar set of options.

Consider using this pattern when:

- **The option list is fixed** (fewer than 20 items) - Users can scan and choose without filtering
- **Options are familiar** - Users recognize the choices without needing to search
- **Forms need standard fields** - Country, state, category, or status selection
- **Settings and configuration** - Dropdown menus for preferences or options
- **Clear option labels** - Each choice has a distinct, scannable name

Avoid this pattern when:

- **The list has more than 20 items** - Use the [Autocomplete pattern](/guide/aria/autocomplete) for better filtering
- **Users need to search options** - [Autocomplete](/guide/aria/autocomplete) provides text input and filtering
- **Multiple selection is needed** - Use the [Multiselect pattern](/guide/aria/multiselect) instead
- **Very few options exist (2-3)** - Radio buttons provide better visibility of all choices

## Features

The select pattern combines [Combobox](/guide/aria/combobox) and [Listbox](/guide/aria/listbox) directives to provide a fully accessible dropdown with:

- **Keyboard Navigation** - Navigate options with arrow keys, select with Enter, close with Escape
- **Screen Reader Support** - Built-in ARIA attributes for assistive technologies
- **Custom Display** - Show selected values with icons, formatting, or rich content
- **Signal-Based Reactivity** - Reactive state management using Angular signals
- **Smart Positioning** - CDK Overlay handles viewport edges and scrolling
- **Bidirectional Text Support** - Automatically handles right-to-left (RTL) languages

## Examples

### Basic select

Users need a standard dropdown to choose from a list of values. A combobox paired with a listbox provides the familiar select experience with full accessibility support.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

Text input is prevented by applying the `ngCombobox` directive directly onto a non-interactive host element (such as a `div` or a `button`) instead of an `<input>`. Users interact with the dropdown using arrow keys and Enter, just like a native select element.

### Select with custom display

Options often need visual indicators like icons or badges to help users identify choices quickly. Custom templates within options allow rich formatting while maintaining accessibility.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/icons/retro/app/app.css)

</TabItem>

</Tabs>

Each option displays an icon alongside the label. The selected value updates to show the chosen option's icon and text, providing clear visual feedback.

### Disabled select

Selects can be disabled to prevent user interaction when certain form conditions aren't met. The disabled state provides visual feedback and prevents keyboard interaction.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/select/src/disabled/retro/app/app.css)

</TabItem>

</Tabs>

When disabled, the select shows a disabled visual state and blocks all user interaction. Screen readers announce the disabled state to assistive technology users.

## Testing

The select pattern can be tested using a combination of `ComboboxHarness` and `ListboxHarness` from `@angular/aria/combobox/testing` and `@angular/aria/listbox/testing`.
Here is an example of how to use the harnesses to test a select component:

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComboboxHarness} from '@angular/aria/combobox/testing';
import {ListboxHarness} from '@angular/aria/listbox/testing';
import {MySelectComponent} from './my-select'; // Your component

describe('MySelectComponent', () => {
  let fixture: ComponentFixture<MySelectComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MySelectComponent],
    });

    fixture = TestBed.createComponent(MySelectComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow selecting an option', async () => {
    // Load the combobox harness (which acts as the select trigger)
    const select = await loader.getHarness(ComboboxHarness);

    // Verify it is closed initially
    expect(await select.isOpen()).toBe(false);

    // Open the dropdown
    await select.open();
    expect(await select.isOpen()).toBe(true);

    // Get the listbox harness from the popup
    const listbox = await select.getPopupWidget(ListboxHarness);
    const options = await listbox.getOptions();
    expect(options.length).toBe(3);

    // Click the second option
    await options[1].click();

    // Verify the dropdown closed and the value updated
    expect(await select.isOpen()).toBe(false);
    expect(await (await select.host()).text()).toContain('Option 2');
  });
});
```

## API reference

For detailed API documentation, inspect the following API references:

- [`Combobox`](https://angular.dev/api/aria/combobox/Combobox)
- [`ComboboxPopup`](https://angular.dev/api/aria/combobox/ComboboxPopup)
- [`ComboboxWidget`](https://angular.dev/api/aria/combobox/ComboboxWidget)
- [`Listbox`](https://angular.dev/api/aria/listbox/Listbox)
- [`Option`](https://angular.dev/api/aria/listbox/Option)

### Positioning

The select pattern integrates with [CDK Overlay](https://material.angular.dev/cdk/overlay/overview) for smart positioning. Use `cdkConnectedOverlay` to handle viewport edges and scrolling automatically.
