# Toolbar

- [Toolbar ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)
- [Toolbar API Reference](https://angular.dev/api/aria/toolbar/Toolbar)


## Overview

A container for grouping related controls and actions with keyboard navigation, commonly used for text formatting, toolbars, and command panels.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

## Usage

Toolbar works best for grouping related controls that users access frequently. Consider using toolbar when:

- **Multiple related actions** - You have several controls that perform related functions (like text formatting buttons)
- **Keyboard efficiency matters** - Users benefit from quick keyboard navigation through arrow keys
- **Grouped controls** - You need to organize controls into logical sections with separators
- **Frequent access** - Controls are used repeatedly within a workflow

Avoid toolbar when:

- A simple button group is sufficient - For just 2-3 unrelated actions, individual buttons work better
- Controls aren't related - Toolbar implies a logical grouping; unrelated controls confuse users
- Complex nested navigation - Deep hierarchies are better served by menus or navigation components

## Features

Angular's toolbar provides a fully accessible toolbar implementation with:

- **Keyboard Navigation** - Navigate widgets with arrow keys, Home, and End using roving tabindex, while controls retain native activation
- **Screen Reader Support** - Built-in ARIA attributes for assistive technologies
- **Widget Groups** - Organize related widgets like radio button groups or toggle button groups
- **Flexible Orientation** - Horizontal or vertical layouts with automatic keyboard navigation
- **Signal-Based Reactivity** - Reactive state management using Angular signals
- **Bidirectional Text Support** - Automatically handles right-to-left (RTL) languages
- **Configurable Focus** - Choose between wrapping navigation or hard stops at edges

## Examples

### Basic horizontal toolbar

Horizontal toolbars organize controls from left to right, matching the common pattern in text editors and design tools. Arrow keys navigate between widgets, maintaining focus within the toolbar until users press Tab to move to the next page element.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

### Vertical toolbar

Vertical toolbars stack controls top to bottom, useful for side panels or vertical command palettes. Up and down arrow keys navigate between widgets.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.css)

</TabItem>

</Tabs>

### Widget groups

Widget groups organize related controls that work together, such as text alignment options or formatting toggles. Groups maintain roving tabindex navigation while presenting the appropriate semantic structure to assistive technologies.

In the examples above, the alignment buttons are wrapped in `ngToolbarWidgetGroup` with `role="radiogroup"`. Selection is decoupled from the toolbar container, allowing you to manage state using Angular signals or custom directives:

```html
<!-- Mutually exclusive radio group -->
<div ngToolbarWidgetGroup role="radiogroup" aria-label="Alignment">
  <button
    ngToolbarWidget
    role="radio"
    type="button"
    [attr.aria-checked]="alignment() === 'left'"
    (click)="alignment.set('left')"
  >
    Left
  </button>
  <button
    ngToolbarWidget
    role="radio"
    type="button"
    [attr.aria-checked]="alignment() === 'center'"
    (click)="alignment.set('center')"
  >
    Center
  </button>
  <button
    ngToolbarWidget
    role="radio"
    type="button"
    [attr.aria-checked]="alignment() === 'right'"
    (click)="alignment.set('right')"
  >
    Right
  </button>
</div>

<!-- Toggle button group -->
<div class="group" role="group" aria-label="Text styling">
  <button ngToolbarWidget type="button" [attr.aria-pressed]="bold()" (click)="bold.set(!bold())">
    Bold
  </button>
  <button
    ngToolbarWidget
    type="button"
    [attr.aria-pressed]="italic()"
    (click)="italic.set(!italic())"
  >
    Italic
  </button>
</div>
```

### Disabled widgets

Toolbars support two disabled modes:

1. **Soft-disabled** widgets remain focusable but visually indicate they're unavailable
2. **Hard-disabled** widgets are completely removed from keyboard navigation.

By default, `softDisabled` is `true`, which allows disabled widgets to still receive focus. If you want to enable hard-disabled mode, set `[softDisabled]="false"` on the toolbar.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.css)

</TabItem>

</Tabs>

### Right-to-left (RTL) support

Toolbars automatically support right-to-left languages. Wrap the toolbar in a container with `dir="rtl"` to reverse the layout and keyboard navigation direction. Arrow key navigation adjusts automatically: left arrow moves to the next widget, right arrow to the previous.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.css)

</TabItem>

</Tabs>

## Testing

Angular Aria provides component harnesses for testing toolbar components.
Here is an example of how to use the harnesses in a component test:

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ToolbarHarness} from '@angular/aria/toolbar/testing';
import {MyToolbarComponent} from './my-toolbar'; // Your component

describe('MyToolbarComponent', () => {
  let fixture: ComponentFixture<MyToolbarComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyToolbarComponent],
    });

    fixture = TestBed.createComponent(MyToolbarComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should have widgets and update toggle state on click', async () => {
    // Load the toolbar harness
    const toolbar = await loader.getHarness(ToolbarHarness);

    // Get all widgets
    const widgets = await toolbar.getWidgets();
    expect(widgets.length).toBe(3);

    // Click the first widget
    await widgets[0].click();

    // Verify pressed state updated via click handler
    expect(await widgets[0].isSelected()).toBe(true);
  });
});
```

## API reference

For detailed API documentation, inspect the following API references:

- [`Toolbar`](https://angular.dev/api/aria/toolbar/Toolbar)
- [`ToolbarWidget`](https://angular.dev/api/aria/toolbar/ToolbarWidget)
- [`ToolbarWidgetGroup`](https://angular.dev/api/aria/toolbar/ToolbarWidgetGroup)
