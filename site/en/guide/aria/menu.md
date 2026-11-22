# Menu

- [Menu ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [Menu API Reference](https://angular.dev/api/aria/menu/Menu)


## Overview

A menu offers a list of actions or options to users, typically appearing in response to a button click or right-click. Menus support keyboard navigation with arrow keys, submenus, checkboxes, radio buttons, and disabled items.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.css)

</TabItem>

</Tabs>

## Usage

Menus work well for presenting lists of actions or commands that users can choose from.

**Use menus when:**

- Building application command menus (File, Edit, View)
- Creating context menus (right-click actions)
- Showing dropdown action lists
- Implementing toolbar dropdowns
- Organizing settings or options

**Avoid menus when:**

- Building site navigation (use navigation landmarks instead)
- Creating form selects (use the [Select](/en/guide/aria/select) component)
- Switching between content panels (use [Tabs](/en/guide/aria/tabs))
- Showing collapsible content (use [Accordion](/en/guide/aria/accordion))

## Features

- **Keyboard navigation** - Arrow keys, Home/End, and character search for efficient navigation
- **Submenus** - Nested menu support with automatic positioning
- **Menu types** - Standalone menus, triggered menus, and menubars
- **Checkboxes and radios** - Toggle and selection menu items
- **Disabled items** - Soft or hard disabled states with focus management
- **Auto-close behavior** - Configurable close on selection
- **RTL support** - Right-to-left language navigation

## Examples

### Menu with trigger

Create a dropdown menu by pairing a trigger button with a menu. The trigger opens and closes the menu.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger/retro/app/app.css)

</TabItem>

</Tabs>

The menu automatically closes when a user selects an item or presses Escape.

### Context menu

Context menus appear at the cursor position when users right-click an element.

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-context/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-context/app/app.html)

Position the menu using the `contextmenu` event coordinates.

### Standalone menu

A standalone menu doesn't require a trigger and remains visible in the interface.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-standalone/retro/app/app.css)

</TabItem>

</Tabs>

Standalone menus work well for always-visible action lists or navigation.

### Disabled menu items

Disable specific menu items using the `disabled` input. Control focus behavior with `softDisabled`.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/menu/src/menu-trigger-disabled/retro/app/app.css)

</TabItem>

</Tabs>

When `[softDisabled]="true"`, disabled items can receive focus but cannot be activated. When `[softDisabled]="false"`, disabled items are skipped during keyboard navigation.

## Testing

Angular Aria provides component harnesses for testing menu components.
Here is an example of how to use the harnesses in a component test:

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MenuHarness, MenuItemHarness} from '@angular/aria/menu/testing';
import {MyMenuComponent} from './my-menu'; // Your component

describe('MyMenuComponent', () => {
  let fixture: ComponentFixture<MyMenuComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyMenuComponent],
    });

    fixture = TestBed.createComponent(MyMenuComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should open menu and click item', async () => {
    // Load the menu harness by its trigger text
    const menu = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));

    // Verify initial state
    expect(await menu.isOpen()).toBe(false);

    // Open the menu
    await menu.open();
    expect(await menu.isOpen()).toBe(true);

    // Get items
    const items = await menu.getItems();
    expect(items.length).toBe(3);
    expect(await items[0].getText()).toBe('Item 1');

    // Click first item
    await items[0].click();

    // Menu should close after selection (depending on your implementation)
    expect(await menu.isOpen()).toBe(false);
  });

  it('should interact with submenus', async () => {
    const menu = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));
    await menu.open();

    // Get the item that triggers a submenu
    const subItem = await loader.getHarness(MenuItemHarness.with({text: 'Submenu'}));
    expect(await subItem.hasSubmenu()).toBe(true);

    // Open submenu
    await subItem.click();
    const submenu = await subItem.getSubmenu();
    expect(submenu).toBeTruthy();
    expect(await submenu!.isOpen()).toBe(true);

    // Interact with submenu items
    const subItems = await submenu!.getItems();
    expect(subItems.length).toBe(1);
  });
});
```

## API reference

For detailed API documentation, inspect the following API references:

- [`Menu`](https://angular.dev/api/aria/menu/Menu)
- [`MenuBar`](https://angular.dev/api/aria/menu/MenuBar)
- [`MenuItem`](https://angular.dev/api/aria/menu/MenuItem)
- [`MenuTrigger`](https://angular.dev/api/aria/menu/MenuTrigger)
- [`MenuContent`](https://angular.dev/api/aria/menu/MenuContent)
