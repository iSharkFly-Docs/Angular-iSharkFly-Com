---
untranslated: true
---

# Tabs

- [Tabs ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [Tabs API Reference](https://angular.dev/api/aria/tabs/Tabs)


## Overview

Tabs display layered content sections where only one panel is visible at a time. Users switch between panels by clicking tab buttons or using arrow keys to navigate the tab list.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.css)

</TabItem>

</Tabs>

## Usage

Tabs work well for organizing related content into distinct sections where users switch between different views or categories.

**Use tabs when:**

- Organizing related content into distinct sections
- Creating settings panels with multiple categories
- Building documentation with multiple topics
- Implementing dashboards with different views
- Showing content where users need to switch contexts

**Avoid tabs when:**

- Building sequential forms or wizards (use a stepper pattern)
- Navigating between pages (use router navigation)
- Showing single content sections (no need for tabs)
- Having more than 7-8 tabs (consider a different layout)

## Features

- **Selection modes** - Tabs activate automatically on focus or require manual activation
- **Keyboard navigation** - Arrow keys, Home, and End for efficient tab navigation
- **Orientation** - Horizontal or vertical tab list layouts
- **Lazy content** - Tab panels render only when activated
- **Disabled tabs** - Disable individual tabs with focus management
- **Focus modes** - Roving tabindex or activedescendant focus strategies
- **RTL support** - Right-to-left language navigation

## Examples

### Selection follows focus

When selection follows focus, tabs activate immediately as you navigate with arrow keys. This provides instant feedback and works well for lightweight content.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/selection-follows-focus/retro/app/app.css)

</TabItem>

</Tabs>

Set `[selectionMode]="'follow'"` on the tab list to enable this behavior.

### Manual activation

With manual activation, arrow keys move focus between tabs without changing the selected tab. Users press Space or Enter to activate the focused tab.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/explicit-selection/retro/app/app.css)

</TabItem>

</Tabs>

Use `[selectionMode]="'explicit'"` for heavy content panels to avoid unnecessary rendering.

### Vertical tabs

Arrange tabs vertically for interfaces like settings panels or navigation sidebars.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/vertical/retro/app/app.css)

</TabItem>

</Tabs>

Set `[orientation]="'vertical'"` on the tab list. Navigation changes to Up/Down arrow keys.

### Lazy content rendering

Use the `ngTabContent` directive on an `ng-template` to defer rendering tab panels until they're shown.

```html
<div ngTabs>
  <ul ngTabList [(selectedTab)]="selectedTab">
    <li ngTab value="tab1">Tab 1</li>
    <li ngTab value="tab2">Tab 2</li>
  </ul>

  <div ngTabPanel value="tab1">
    <ng-template ngTabContent>
      <!-- This content only renders when Tab 1 is shown -->
      <app-heavy-component />
    </ng-template>
  </div>

  <div ngTabPanel value="tab2">
    <ng-template ngTabContent>
      <!-- This content only renders when Tab 2 is shown -->
      <app-another-component />
    </ng-template>
  </div>
</div>
```

By default, content is removed from the DOM when the panel is hidden. Set `[preserveContent]="true"` to keep it, for example when the panel contains a video that shouldn't reset when switching tabs.

### Disabled tabs

Disable specific tabs to prevent user interaction. Control whether disabled tabs can receive keyboard focus.

<Tabs :tabs="[{label:'Basic',value:'t0'},{label:'Material',value:'t1'},{label:'Retro',value:'t2'}]">

<TabItem value="t0">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/app/app.css)

</TabItem>

<TabItem value="t1">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/material/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/material/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/material/app/app.css)

</TabItem>

<TabItem value="t2">

Example source: [app.ts](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/retro/app/app.ts) · [app.html](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/retro/app/app.html) · [app.css](https://github.com/angular/angular/blob/main/adev/src/content/examples/aria/tabs/src/disabled/retro/app/app.css)

</TabItem>

</Tabs>

When `[softDisabled]="true"` on the tab list, disabled tabs can receive focus but cannot be activated. When `[softDisabled]="false"`, disabled tabs are skipped during keyboard navigation.

## Testing

Angular Aria provides component harnesses for testing tabs components.
Here is an example of how to use the harnesses in a component test:

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentHarness, HarnessLoader} from '@angular/cdk/testing';
import {TabsHarness} from '@angular/aria/tabs/testing';
import {MyTabsComponent} from './my-tabs'; // Your component

// A simple harness to help query content inside the tab panel
class TestContentHarness extends ComponentHarness {
  static hostSelector = '.test-content';
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}

describe('MyTabsComponent', () => {
  let fixture: ComponentFixture<MyTabsComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyTabsComponent],
    });

    fixture = TestBed.createComponent(MyTabsComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should switch tabs and scope panel queries', async () => {
    const tabs = await loader.getHarness(TabsHarness);

    // Get all tabs
    const tabItems = await tabs.getTabs();
    expect(tabItems.length).toBe(3);

    // Verify initial selection
    expect(await tabItems[0].isSelected()).toBe(true);
    expect(await tabItems[1].isSelected()).toBe(false);

    // Query content inside the active tab panel
    // TabHarness automatically scopes queries to its associated panel
    const content = await tabItems[0].getHarness(TestContentHarness);
    expect(await content.getText()).toBe('Content 1');

    // Switch to the second tab
    await tabItems[1].select();

    // Verify selection updated
    expect(await tabItems[0].isSelected()).toBe(false);
    expect(await tabItems[1].isSelected()).toBe(true);
  });
});
```

## API reference

For detailed API documentation, inspect the following API references:

- [`Tabs`](https://angular.dev/api/aria/tabs/Tabs)
- [`TabList`](https://angular.dev/api/aria/tabs/TabList)
- [`Tab`](https://angular.dev/api/aria/tabs/Tab)
- [`TabPanel`](https://angular.dev/api/aria/tabs/TabPanel)
- [`TabContent`](https://angular.dev/api/aria/tabs/TabContent)
