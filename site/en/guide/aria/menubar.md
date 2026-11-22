# Menubar

- [Menubar ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [Menubar API Reference](https://angular.dev/api/aria/menu/MenuBar)


## Overview

The menubar is a horizontal navigation bar that provides persistent access to application menus. Menubars organize commands into logical categories like File, Edit, and View, helping users discover and execute application features through keyboard or mouse interaction.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

## Usage

Menubars work well for organizing application commands into persistent, discoverable navigation.

**Use menubars when:**

- Building application command bars (such as File, Edit, View, Insert, Format)
- Creating persistent navigation that stays visible across the interface
- Organizing commands into logical top-level categories
- Need horizontal menu navigation with keyboard support
- Building desktop-style application interfaces

**Avoid menubars when:**

- Building dropdown menus for individual actions (use [Menu with trigger](/en/guide/aria/menu) instead)
- Creating context menus (use [Menu](/en/guide/aria/menu) guide pattern)
- Simple standalone action lists (use [Menu](/en/guide/aria/menu) instead)
- Mobile interfaces where horizontal space is limited
- Navigation belongs in a sidebar or header navigation pattern

## Features

- **Horizontal navigation** - Left/Right arrow keys move between top-level categories
- **Persistent visibility** - Always visible, not modal or dismissable
- **Hover-to-open** - Submenus open on hover after first keyboard or click interaction
- **Nested submenus** - Support multiple levels of menu depth
- **Keyboard navigation** - Arrow keys, Enter/Space, Escape, and typeahead search
- **Disabled states** - Disable entire menubar or individual items
- **RTL support** - Automatic right-to-left language navigation

## Examples

### Basic menubar

A menubar provides persistent access to application commands organized into top-level categories. Users navigate between categories with Left/Right arrows and open menus with Enter or Down arrow.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/basic/retro/app/app.css)

</TabItem>

</Tabs>

Press Right arrow to move between File, Edit, and View. Press Enter or Down arrow to open a menu and navigate submenu items with Up/Down arrows.

### Disabled menubar items

Disable specific menu items or the entire menubar to prevent interaction. Control whether disabled items can receive keyboard focus with the `softDisabled` input.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.css)

</TabItem>

</Tabs>

When `[softDisabled]="true"` on the menubar, disabled items can receive focus but cannot be activated. When `[softDisabled]="false"`, disabled items are skipped during keyboard navigation.

### RTL support

Menubars automatically adapt to right-to-left (RTL) languages. Arrow key navigation reverses direction, and submenus position on the left side.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.css)

</TabItem>

</Tabs>

The `dir="rtl"` attribute enables RTL mode. Left arrow moves right, Right arrow moves left, maintaining natural navigation for RTL language users.

## Testing

Angular Aria provides component harnesses for testing menubar components.
Here is an example of how to use the harnesses in a component test:

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MenuHarness} from '@angular/aria/menu/testing';
import {MyMenubarComponent} from './my-menubar'; // Your component

describe('MyMenubarComponent', () => {
  let fixture: ComponentFixture<MyMenubarComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyMenubarComponent],
    });

    fixture = TestBed.createComponent(MyMenubarComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should interact with menubar items', async () => {
    // Load the menubar harness (which is a MenuHarness with selector '[ngMenuBar]')
    const menubar = await loader.getHarness(MenuHarness.with({selector: '[ngMenuBar]'}));

    // Menubars are persistent and always "open"
    expect(await menubar.isOpen()).toBe(true);
    expect(await menubar.isMenuBar()).toBe(true);

    // Get top-level items
    const items = await menubar.getItems();
    expect(items.length).toBe(2);
    expect(await items[0].getText()).toBe('File');
    expect(await items[1].getText()).toBe('Edit');

    // Click an item to open its dropdown menu
    await items[0].click();

    const fileMenu = await items[0].getSubmenu();
    expect(fileMenu).toBeTruthy();
    expect(await fileMenu!.isOpen()).toBe(true);
  });
});
```

## API reference

For detailed API documentation, inspect the following API references:

- [`MenuBar`](https://angular.dev/api/aria/menu/MenuBar)
- [`MenuItem`](https://angular.dev/api/aria/menu/MenuItem)
- [`MenuTrigger`](https://angular.dev/api/aria/menu/MenuTrigger)
- [`Menu`](https://angular.dev/api/aria/menu/Menu)
