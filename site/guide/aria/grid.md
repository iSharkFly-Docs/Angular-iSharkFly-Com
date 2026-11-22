---
untranslated: true
---

# Grid

- [Grid ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [Grid API Reference](/api?query=grid#angular_aria_grid)


## Overview

A grid enables users to navigate two-dimensional data or interactive elements using directional arrow keys, Home, End, and Page Up/Down. Grids work for data tables, calendars, spreadsheets, and layout patterns that group related interactive elements.

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/overview/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/overview/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/overview/basic/app/app.css)

## Usage

Grids work well for data or interactive elements organized in rows and columns where users need keyboard navigation in multiple directions.

**Use grids when:**

- Building interactive data tables with editable or selectable cells
- Creating calendars or date pickers
- Implementing spreadsheet-like interfaces
- Grouping interactive elements (buttons, checkboxes) to reduce tab stops on a page
- Building interfaces requiring two-dimensional keyboard navigation

**Avoid grids when:**

- Displaying simple read-only tables (use semantic HTML `<table>` instead)
- Showing single-column lists (use [Listbox](/guide/aria/listbox) instead)
- Displaying hierarchical data (use [Tree](/guide/aria/tree) instead)
- Building forms without tabular layout (use standard form controls)

## Features

- **Two-dimensional navigation** - Arrow keys move between cells in all directions
- **Focus modes** - Choose between roving tabindex or activedescendant focus strategies
- **Selection support** - Optional cell selection with single or multi-select modes
- **Wrapping behavior** - Configure how navigation wraps at grid edges (continuous, loop, or nowrap)
- **Range selection** - Select multiple cells with modifier keys or dragging
- **Disabled states** - Disable the entire grid or individual cells
- **RTL support** - Automatic right-to-left language navigation

## Examples

### Data table grid

Use a grid for interactive tables where users need to navigate between cells using arrow keys. This example shows a basic data table with keyboard navigation.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Retro',value:'t1'}]">

<TabItem value="t0">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/table/retro/app/app.css)

</TabItem>

</Tabs>

Apply the `ngGrid` directive to the table element, `ngGridRow` to each row, and `ngGridCell` to each cell.

### Calendar grid

Calendars are a common use case for grids. This example shows a month view where users navigate dates using arrow keys.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/material/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/material/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/calendar/retro/app/app.css)

</TabItem>

</Tabs>

Users can activate a date by pressing Enter or Space when focused on a cell.

### Layout grid

Use a layout grid to group interactive elements and reduce tab stops. This example shows a grid of pill buttons.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/material/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/material/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.css)

</TabItem>

</Tabs>

Instead of tabbing through each button, users navigate with arrow keys and only one button receives tab focus.

### Selection and focus modes

Enable selection with `[enableSelection]="true"` and configure how focus and selection interact.

```html
<table
  ngGrid
  [enableSelection]="true"
  [selectionMode]="'explicit'"
  [multi]="true"
  [focusMode]="'roving'"
>
  <tr ngGridRow>
    <td ngGridCell>Cell 1</td>
    <td ngGridCell>Cell 2</td>
  </tr>
</table>
```

**Selection modes:**

- `follow`: Focused cell is automatically selected
- `explicit`: Users select cells with Space or click

**Focus modes:**

- `roving`: Focus moves to cells using `tabindex` (better for simple grids)
- `activedescendant`: Focus stays on grid container, `aria-activedescendant` indicates active cell (better for virtual scrolling)

## Testing

Angular Aria provides component harnesses for testing grid components.
Here is an example of how to use the harnesses in a component test:

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {GridHarness} from '@angular/aria/grid/testing';
import {MyGridComponent} from './my-grid'; // Your component

describe('MyGridComponent', () => {
  let fixture: ComponentFixture<MyGridComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyGridComponent],
    });

    fixture = TestBed.createComponent(MyGridComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should read cell values and focus cells', async () => {
    const grid = await loader.getHarness(GridHarness);

    // Get all cells text in a 2D array organized by rows
    const cellTexts = await grid.getCellTextByIndex();
    expect(cellTexts).toEqual([
      ['Cell 1.1', 'Cell 1.2'],
      ['Cell 2.1', 'Cell 2.2'],
    ]);

    // Get a specific cell by text
    const cells = await grid.getCells({text: 'Cell 1.1'});
    expect(cells.length).toBe(1);
    const cell = cells[0];

    // Verify cell state
    expect(await cell.isSelected()).toBe(true);
    expect(await cell.isActive()).toBe(true);

    // Focus the cell
    await cell.focus();
    expect(await cell.isFocused()).toBe(true);
  });
});
```

## API reference

For detailed API documentation, inspect the following API references:

- [`Grid`](https://angular.dev/api/aria/grid/Grid)
- [`GridRow`](https://angular.dev/api/aria/grid/GridRow)
- [`GridCell`](https://angular.dev/api/aria/grid/GridCell)
- [`GridCellWidget`](https://angular.dev/api/aria/grid/GridCellWidget)
