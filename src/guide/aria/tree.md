# Tree

- [Tree ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
- [Tree API Reference](https://angular.dev/api/aria/tree/Tree)


## Overview

A tree displays hierarchical data where items can expand to reveal children or collapse to hide them. Users navigate with arrow keys, expand and collapse nodes, and optionally select items for navigation or data selection scenarios.

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.css)

## Usage

Trees work well for displaying hierarchical data where users need to navigate through nested structures.

**Use trees when:**

- Building file system navigation
- Showing folder and document hierarchies
- Creating nested menu structures
- Displaying organization charts
- Browsing hierarchical data
- Implementing site navigation with nested sections

**Avoid trees when:**

- Displaying flat lists (use [Listbox](/guide/aria/listbox) instead)
- Showing data tables (use [Grid](/guide/aria/grid) instead)
- Creating simple dropdowns (use [Select](/guide/aria/select) instead)
- Building breadcrumb navigation (use breadcrumb patterns)

## Features

- **Hierarchical navigation** - Nested tree structure with expand and collapse functionality
- **Selection modes** - Single or multi-selection with explicit or follow-focus behavior
- **Selection follows focus** - Optional automatic selection when focus changes
- **Keyboard navigation** - Arrow keys, Home, End, and type-ahead search
- **Expand/collapse** - Right/Left arrows or Enter to toggle parent nodes
- **Disabled items** - Disable specific nodes with focus management
- **Focus modes** - Roving tabindex or activedescendant focus strategies
- **RTL support** - Right-to-left language navigation

## Examples

### Navigation tree

Use a tree for navigation where clicking items triggers actions rather than selecting them.

<Tabs :tabs="[{label:'Basic',value:'t0'}]">

<TabItem value="t0">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/nav/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/nav/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/nav/basic/app/app.css)

</TabItem>

</Tabs>

Set `[nav]="true"` to enable navigation mode. This uses `aria-current` to indicate the current page instead of selection.

### Single selection

Enable single selection for scenarios where users choose one item from the tree.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Retro',value:'t1'}]">

<TabItem value="t0">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select/retro/app/app.css)

</TabItem>

</Tabs>

Leave `[multi]="false"` (the default) for single selection. Users press Space to select the focused item.

### Multi-selection

Allow users to select multiple items from the tree.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Retro',value:'t1'}]">

<TabItem value="t0">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.css)

</TabItem>

</Tabs>

Set `[multi]="true"` on the tree. Users select items individually with Space or select ranges with Shift+Arrow keys.

### Selection follows focus

When selection follows focus, the focused item is automatically selected. This simplifies interaction for navigation scenarios.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Retro',value:'t1'}]">

<TabItem value="t0">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.css)

</TabItem>

</Tabs>

Set `[selectionMode]="'follow'"` on the tree. Selection automatically updates as users navigate with arrow keys.

### Disabled tree items

Disable specific tree nodes to prevent interaction. Control whether disabled items can receive focus.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Retro',value:'t1'}]">

<TabItem value="t0">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [TS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.ts) · [HTML](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.html) · [CSS](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.css)

</TabItem>

</Tabs>

When `[softDisabled]="true"` on the tree, disabled items can receive focus but cannot be activated or selected. When `[softDisabled]="false"`, disabled items are skipped during keyboard navigation.

## Testing

Angular Aria provides component harnesses for testing tree components.
Here is an example of how to use the harnesses in a component test:

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {TreeHarness} from '@angular/aria/tree/testing';
import {MyTreeComponent} from './my-tree'; // Your component

describe('MyTreeComponent', () => {
  let fixture: ComponentFixture<MyTreeComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyTreeComponent],
    });

    fixture = TestBed.createComponent(MyTreeComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should navigate and expand tree items', async () => {
    const tree = await loader.getHarness(TreeHarness);

    // Get top-level structure representation
    expect(await tree.getTreeStructure()).toEqual({
      children: [{text: 'public'}, {text: 'src'}, {text: 'package.json'}],
    });

    // Get all items (currently visible)
    const items = await tree.getItems();
    expect(items.length).toBe(3);

    // Expand the first item ('public')
    expect(await items[0].isExpanded()).toBe(false);
    await items[0].click();
    expect(await items[0].isExpanded()).toBe(true);

    // Verifying tree structure updates after expansion
    expect(await tree.getTreeStructure()).toEqual({
      children: [
        {
          text: 'public',
          children: [{text: 'index.html'}, {text: 'styles.css'}],
        },
        {text: 'src'},
        {text: 'package.json'},
      ],
    });
  });
});
```

## API reference

For detailed API documentation, inspect the following API references:

- [`Tree`](https://angular.dev/api/aria/tree/Tree)
- [`TreeItem`](https://angular.dev/api/aria/tree/TreeItem)
- [`TreeItemGroup`](https://angular.dev/api/aria/tree/TreeItemGroup)
