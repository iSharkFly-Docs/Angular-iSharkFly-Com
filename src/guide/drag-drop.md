# Drag and drop

## Overview

This page describes the drag and drop directives which let you quickly create drag and drop interfaces with the following:

- Free dragging
- Create a list of reorderable draggable elements
- Transfer draggable elements between lists
- Dragging animations
- Lock draggable elements along an axis or element
- Add custom drag handles
- Add previews on drag
- Add custom drag placeholder

For the full API reference, please see the [Angular CDK's drag and drop API reference page](/api#angular_cdk_drag-drop).

## Before you start

### CDK Installation

The [Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) is a set of behavior primitives for building components. To use the drag and drop directives, first install `@angular/cdk` from npm. You can do this from your terminal using Angular CLI:

```shell
ng add @angular/cdk
```

### Importing drag and drop

To use drag and drop, import what you need from the directives in your component.

```ts
import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

@Component({
  selector: 'drag-drop-example',
  templateUrl: 'drag-drop-example.html',
  imports: [CdkDrag],
})
export class DragDropExample {}
```

## Create draggable elements

You can make any element draggable by adding the `cdkDrag` directive. By default, all draggable elements support free dragging.

::: code-group

```html [app.html]
<div class="example-box" cdkDrag>Drag me around</div>
```

```ts [app.ts]
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Basic Drag&Drop
 */
@Component({
  selector: 'cdk-drag-drop-overview-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDrag],
})
export class CdkDragDropOverviewExample {}
```

```css [app.css]
.example-box {
  width: 200px;
  height: 200px;
  border: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  cursor: move;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #fff;
  border-radius: 4px;
  position: relative;
  z-index: 1;
  font-family: sans-serif;
  transition: box-shadow 200ms cubic-bezier(0, 0, 0.2, 1);
  box-shadow:
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.example-box:active {
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
```

:::

## Create a list of reorderable draggable elements

Add the `cdkDropList` directive to a parent element to group draggable elements into a reorderable collection. This defines where draggable elements can be dropped. The draggable elements in the drop list group rearrange automatically as an element moves.

The drag and drop directives don't update your data model. To update the data model, listen to the `cdkDropListDropped` event (once the user finishes dragging) and update the data model manually.

::: code-group

```html [app.html]
<div cdkDropList class="example-list" (cdkDropListDropped)="drop($event)">
  @for (movie of movies; track movie) {
    <div class="example-box" cdkDrag>{{ movie }}</div>
  }
</div>
```

```ts [app.ts]
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop sorting
 */
@Component({
  selector: 'cdk-drag-drop-sorting-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropSortingExample {
  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IX - The Rise of Skywalker',
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }
}
```

```css [app.css]
.example-list {
  width: 500px;
  max-width: 100%;
  border: solid 1px #ccc;
  min-height: 60px;
  display: block;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.example-box {
  padding: 20px 10px;
  border-bottom: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  font-family: sans-serif;
}

.cdk-drag-preview {
  border: none;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

You can use the `CDK_DROP_LIST` injection token that can be used to reference instances of `cdkDropList`. For more information see the [dependency injection guide](/guide/di) and the [drop list injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DROP_LIST).

## Transfer draggable elements between lists

The `cdkDropList` directive supports transferring draggable elements between connected drop lists. There are two ways to connect one or more `cdkDropList` instances together:

- Set the `cdkDropListConnectedTo` property to another drop list.
- Wrap the elements in an element with the `cdkDropListGroup` attribute.

The `cdkDropListConnectedTo` directive works both with a direct reference to another `cdkDropList` or by referencing the id of another drop container.

```html
<!-- This is valid -->
<div cdkDropList #listOne="cdkDropList" [cdkDropListConnectedTo]="[listTwo]"></div>
<div cdkDropList #listTwo="cdkDropList" [cdkDropListConnectedTo]="[listOne]"></div>

<!-- This is valid as well -->
<div cdkDropList id="list-one" [cdkDropListConnectedTo]="['list-two']"></div>
<div cdkDropList id="list-two" [cdkDropListConnectedTo]="['list-one']"></div>
```

::: code-group

```html [app.html]
<div class="example-container">
  <h2>To do</h2>

  <div
    cdkDropList
    #todoList="cdkDropList"
    [cdkDropListData]="todo"
    [cdkDropListConnectedTo]="[doneList]"
    class="example-list"
    (cdkDropListDropped)="drop($event)"
  >
    @for (item of todo; track item) {
      <div class="example-box" cdkDrag>{{ item }}</div>
    }
  </div>
</div>

<div class="example-container">
  <h2>Done</h2>

  <div
    cdkDropList
    #doneList="cdkDropList"
    [cdkDropListData]="done"
    [cdkDropListConnectedTo]="[todoList]"
    class="example-list"
    (cdkDropListDropped)="drop($event)"
  >
    @for (item of done; track item) {
      <div class="example-box" cdkDrag>{{ item }}</div>
    }
  </div>
</div>
```

```ts [app.ts]
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop connected sorting
 */
@Component({
  selector: 'cdk-drag-drop-connected-sorting-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropConnectedSortingExample {
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
```

```css [app.css]
.example-container {
  width: 400px;
  max-width: 100%;
  margin: 0 25px 25px 0;
  display: inline-block;
  vertical-align: top;
}

.example-list {
  border: solid 1px #ccc;
  min-height: 60px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  display: block;
  font-family: sans-serif;
}

h2 {
  font-family: sans-serif;
}

.example-box {
  padding: 20px 10px;
  border-bottom: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  font-family: sans-serif;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

Use the `cdkDropListGroup` directive if you have an unknown number of connected drop lists to set up the connection automatically. Any new `cdkDropList` that is added under a group automatically connects to all other lists.

```html
<div cdkDropListGroup>
  <!-- All lists in here will be connected. -->
  @for (list of lists; track list) {
    <div cdkDropList></div>
  }
</div>
```

::: code-group

```html [app.html]
<div cdkDropListGroup>
  <div class="example-container">
    <h2>To do</h2>

    <div
      cdkDropList
      [cdkDropListData]="todo"
      class="example-list"
      (cdkDropListDropped)="drop($event)"
    >
      @for (item of todo; track item) {
        <div class="example-box" cdkDrag>{{ item }}</div>
      }
    </div>
  </div>

  <div class="example-container">
    <h2>Done</h2>

    <div
      cdkDropList
      [cdkDropListData]="done"
      class="example-list"
      (cdkDropListDropped)="drop($event)"
    >
      @for (item of done; track item) {
        <div class="example-box" cdkDrag>{{ item }}</div>
      }
    </div>
  </div>
</div>
```

```ts [app.ts]
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop connected sorting group
 */
@Component({
  selector: 'cdk-drag-drop-connected-sorting-group-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag],
})
export class CdkDragDropConnectedSortingGroupExample {
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
```

```css [app.css]
.example-container {
  width: 400px;
  max-width: 100%;
  margin: 0 25px 25px 0;
  display: inline-block;
  vertical-align: top;
}

.example-list {
  border: solid 1px #ccc;
  min-height: 60px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  display: block;
  font-family: sans-serif;
}

h2 {
  font-family: sans-serif;
}

.example-box {
  padding: 20px 10px;
  border-bottom: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  font-family: sans-serif;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

You can use the `CDK_DROP_LIST_GROUP` injection token that can be used to reference instances of `cdkDropListGroup`. For more information see the [dependency injection guide](/guide/di) and the [drop list group injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DROP_LIST_GROUP).

### Selective dragging

By default, a user can move `cdkDrag` elements from one container into another connected container. For more fine-grained control over which elements can be dropped into a container, use `cdkDropListEnterPredicate`. Angular calls the predicate whenever a draggable element enters a new container. Depending on whether the predicate returns true or false, the item may or may not be allowed into the new container.

::: code-group

```html [app.html]
<div class="example-container">
  <h2>Available numbers</h2>

  <div
    id="all"
    cdkDropList
    [cdkDropListData]="all"
    cdkDropListConnectedTo="even"
    class="example-list"
    (cdkDropListDropped)="drop($event)"
    [cdkDropListEnterPredicate]="noReturnPredicate"
  >
    @for (number of all; track number) {
      <div class="example-box" [cdkDragData]="number" cdkDrag>{{ number }}</div>
    }
  </div>
</div>

<div class="example-container">
  <h2>Even numbers</h2>

  <div
    id="even"
    cdkDropList
    [cdkDropListData]="even"
    cdkDropListConnectedTo="all"
    class="example-list"
    (cdkDropListDropped)="drop($event)"
    [cdkDropListEnterPredicate]="evenPredicate"
  >
    @for (number of even; track number) {
      <div class="example-box" cdkDrag [cdkDragData]="number">{{ number }}</div>
    }
  </div>
</div>
```

```ts [app.ts]
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop enter predicate
 */
@Component({
  selector: 'cdk-drag-drop-enter-predicate-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropEnterPredicateExample {
  all = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  even = [10];

  drop(event: CdkDragDrop<number[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  /** Predicate function that only allows even numbers to be dropped into a list. */
  evenPredicate(item: CdkDrag<number>) {
    return item.data % 2 === 0;
  }

  /** Predicate function that doesn't allow items to be dropped into a list. */
  noReturnPredicate() {
    return false;
  }
}
```

```css [app.css]
.example-container {
  width: 400px;
  max-width: 100%;
  margin: 0 25px 25px 0;
  display: inline-block;
  vertical-align: top;
}

.example-list {
  border: solid 1px #ccc;
  min-height: 60px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  display: block;
}

h2 {
  font-family: sans-serif;
}

.example-box {
  padding: 20px 10px;
  border-bottom: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  font-family: sans-serif;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

## Attach data

You can associate some arbitrary data with both `cdkDrag` and `cdkDropList` by setting `cdkDragData` or `cdkDropListData`, respectively. You can bind to the events fired from both directives that will include this data, allowing you to easily identify the origin of the drag or drop interaction.

```html
@for (list of lists; track list) {
  <div cdkDropList [cdkDropListData]="list" (cdkDropListDropped)="drop($event)">
    @for (item of list; track item) {
      <div cdkDrag [cdkDragData]="item"></div>
    }
  </div>
}
```

## Dragging customizations

### Customize drag handle

By default, the user can drag the entire `cdkDrag` element to move it around. To restrict the user to only be able to do so using a handle element, add the `cdkDragHandle` directive to an element inside of `cdkDrag`. You can have as many `cdkDragHandle` elements as you want.

::: code-group

```html [app.html]
<div class="example-box" cdkDrag>
  I can only be dragged using the handle

  <div class="example-handle" cdkDragHandle>
    <svg width="24px" fill="currentColor" viewBox="0 0 24 24">
      <path
        d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"
      ></path>
      <path d="M0 0h24v24H0z" fill="none"></path>
    </svg>
  </div>
</div>
```

```ts [app.ts]
import {CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop with a handle
 */
@Component({
  selector: 'cdk-drag-drop-handle-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDrag, CdkDragHandle],
})
export class CdkDragDropHandleExample {}
```

```css [app.css]
.example-box {
  width: 200px;
  height: 200px;
  padding: 10px;
  box-sizing: border-box;
  border: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #fff;
  border-radius: 4px;
  position: relative;
  z-index: 1;
  font-family: sans-serif;
  transition: box-shadow 200ms cubic-bezier(0, 0, 0.2, 1);
  box-shadow:
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.example-box:active {
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.example-handle {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #ccc;
  cursor: move;
  width: 24px;
  height: 24px;
}
```

:::

You can use the `CDK_DRAG_HANDLE` injection token that can be used to reference instances of `cdkDragHandle`. For more information see the [dependency injection guide](/guide/di) and the [drag handle injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_HANDLE).

### Customize drag preview

A preview element becomes visible when a `cdkDrag` element is being dragged. By default, the preview is a clone of the original element positioned next to the user's cursor.

To customize the preview, provide a custom template via `*cdkDragPreview`. The custom preview won't match the size of the original dragged element since assumptions aren't made about the element's content. To match the size of the element for the drag preview, pass true to the `matchSize` input.

The cloned element removes its id attribute in order to avoid having multiple elements with the same id on the page. This will cause any CSS that targets that id not to be applied.

::: code-group

```html [app.html]
<div cdkDropList class="example-list" (cdkDropListDropped)="drop($event)">
  @for (movie of movies; track movie) {
    <div class="example-box" cdkDrag>
      {{ movie.title }}
      <img *cdkDragPreview [src]="movie.poster" [alt]="movie.title" />
    </div>
  }
</div>
```

```ts [app.ts]
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPreview,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop custom preview
 */
@Component({
  selector: 'cdk-drag-drop-custom-preview-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropList, CdkDrag, CdkDragPreview],
})
export class CdkDragDropCustomPreviewExample {
  // tslint:disable:max-line-length
  movies = [
    {
      title: 'Episode I - The Phantom Menace',
      poster: 'https://upload.wikimedia.org/wikipedia/en/4/40/Star_Wars_Phantom_Menace_poster.jpg',
    },
    {
      title: 'Episode II - Attack of the Clones',
      poster:
        'https://upload.wikimedia.org/wikipedia/en/3/32/Star_Wars_-_Episode_II_Attack_of_the_Clones_%28movie_poster%29.jpg',
    },
    {
      title: 'Episode III - Revenge of the Sith',
      poster:
        'https://upload.wikimedia.org/wikipedia/en/9/93/Star_Wars_Episode_III_Revenge_of_the_Sith_poster.jpg',
    },
    {
      title: 'Episode IV - A New Hope',
      poster: 'https://upload.wikimedia.org/wikipedia/en/8/87/StarWarsMoviePoster1977.jpg',
    },
    {
      title: 'Episode V - The Empire Strikes Back',
      poster:
        'https://upload.wikimedia.org/wikipedia/en/3/3f/The_Empire_Strikes_Back_%281980_film%29.jpg',
    },
    {
      title: 'Episode VI - Return of the Jedi',
      poster: 'https://upload.wikimedia.org/wikipedia/en/b/b2/ReturnOfTheJediPoster1983.jpg',
    },
    {
      title: 'Episode VII - The Force Awakens',
      poster:
        'https://upload.wikimedia.org/wikipedia/en/a/a2/Star_Wars_The_Force_Awakens_Theatrical_Poster.jpg',
    },
    {
      title: 'Episode VIII - The Last Jedi',
      poster: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Star_Wars_The_Last_Jedi.jpg',
    },
    {
      title: 'Episode IX – The Rise of Skywalker',
      poster:
        'https://upload.wikimedia.org/wikipedia/en/a/af/Star_Wars_The_Rise_of_Skywalker_poster.jpg',
    },
  ];
  // tslint:enable:max-line-length

  drop(event: CdkDragDrop<{title: string; poster: string}[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }
}
```

```css [app.css]
.example-list {
  width: 500px;
  max-width: 100%;
  border: solid 1px #ccc;
  min-height: 60px;
  display: block;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  font-family: sans-serif;
}

.example-box {
  padding: 20px 10px;
  border-bottom: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  font-family: sans-serif;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

You can use the `CDK_DRAG_PREVIEW` injection token that can be used to reference instances of `cdkDragPreview`. For more information see the [dependency injection guide](/guide/di) and the [drag preview injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_PREVIEW).

### Customize drag insertion point

By default, Angular inserts the `cdkDrag` preview into the `<body>` of the page in order to avoid issues with positioning and overflow. This may not be desirable in some cases because the preview won't have its inherited styles applied.

You can change where Angular inserts the preview using the `cdkDragPreviewContainer` input on `cdkDrag`. The possible values are:

| Value                         | Description                                                                            | Advantages                                                                                                                  | Disadvantages                                                                                                                                                             |
| :---------------------------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `global`                      | Default value. Angular inserts the preview into the &lt;body&gt; or the closest shadow root. | Preview won't be affected by `z-index` or `overflow: hidden`. It also won't affect `:nth-child` selectors and flex layouts. | Doesn't retain inherited styles.                                                                                                                                          |
| `parent`                      | Angular inserts the preview inside the parent of the element that is being dragged.    | Preview inherits the same styles as the dragged element.                                                                    | Preview may be clipped by `overflow: hidden` or be placed under other elements due to `z-index`. Furthermore, it can affect `:nth-child` selectors and some flex layouts. |
| `ElementRef` or `HTMLElement` | Angular inserts the preview into the specified element.                                | Preview inherits styles from the specified container element.                                                               | Preview may be clipped by `overflow: hidden` or be placed under other elements due to `z-index`. Furthermore, it can affect `:nth-child` selectors and some flex layouts. |

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update `previewContainer` within the config if the value is `global` or `parent`. For more information see the [dependency injection guide](/guide/di), [drag config injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig).

### Customize drag placeholder

While a `cdkDrag` element is being dragged, the directive creates a placeholder element that shows where the element will be placed when dropped. By default, the placeholder is a clone of the element that is being dragged. You can replace the placeholder with a custom one using the `*cdkDragPlaceholder` directive:

::: code-group

```html [app.html]
<div cdkDropList class="example-list" (cdkDropListDropped)="drop($event)">
  @for (movie of movies; track movie) {
    <div class="example-box" cdkDrag>
      <div class="example-custom-placeholder" *cdkDragPlaceholder></div>
      {{ movie }}
    </div>
  }
</div>
```

```ts [app.ts]
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop custom placeholder
 */
@Component({
  selector: 'cdk-drag-drop-custom-placeholder-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder],
})
export class CdkDragDropCustomPlaceholderExample {
  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IX - The Rise of Skywalker',
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }
}
```

```css [app.css]
.example-list {
  width: 500px;
  max-width: 100%;
  border: solid 1px #ccc;
  min-height: 60px;
  display: block;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  font-family: sans-serif;
}

.example-box {
  padding: 20px 10px;
  border-bottom: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  font-family: sans-serif;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-custom-placeholder {
  background: #ccc;
  border: dotted 3px #999;
  min-height: 60px;
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

You can use the `CDK_DRAG_PLACEHOLDER` injection token that can be used to reference instances of `cdkDragPlaceholder`. For more information see the [dependency injection guide](/guide/di) and the [drag placeholder injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_PLACEHOLDER).

### Customize drag root element

Set the `cdkDragRootElement` attribute if there's an element that you want to make draggable but you don't have direct access to it.

The attribute accepts a selector and looks up the DOM until it finds an element that matches the selector. If an element is found, it becomes draggable. This is useful for cases such as making a dialog draggable.

::: code-group

```html [app.html]
<button type="button" (click)="openDialog()">Open a draggable dialog</button>

<ng-template>
  <div class="example-dialog-content" cdkDrag cdkDragRootElement=".cdk-overlay-pane">
    Drag the dialog around!
  </div>
</ng-template>
```

```ts [app.ts]
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  inject,
  viewChild,
} from '@angular/core';

/**
 * @title Drag&Drop with alternate root element
 */
@Component({
  selector: 'cdk-drag-drop-root-element-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDrag],
})
export class CdkDragDropRootElementExample implements AfterViewInit, OnDestroy {
  private _overlay = inject(Overlay);
  private _viewContainerRef = inject(ViewContainerRef);
  private _dialogTemplate = viewChild.required(TemplateRef);
  private _overlayRef!: OverlayRef;
  private _portal!: TemplatePortal;

  ngAfterViewInit() {
    this._portal = new TemplatePortal(this._dialogTemplate(), this._viewContainerRef);
    this._overlayRef = this._overlay.create({
      positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
    });
    this._overlayRef.backdropClick().subscribe(() => this._overlayRef.detach());
  }

  ngOnDestroy() {
    this._overlayRef.dispose();
  }

  openDialog() {
    this._overlayRef.attach(this._portal);
  }
}
```

```css [app.css]
.example-dialog-content {
  width: 200px;
  height: 200px;
  border: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  cursor: move;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 4px;
  font-family: sans-serif;
  transition: box-shadow 200ms cubic-bezier(0, 0, 0.2, 1);
  box-shadow:
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.example-dialog-content:active {
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
```

:::

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update `rootElementSelector` within the config. For more information see the [dependency injection guide](/guide/di), [drag config injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig).

### Set DOM position of a draggable element

By default, `cdkDrag` elements not in a `cdkDropList` move from their normal DOM position only when a user manually moves the element. Use the `cdkDragFreeDragPosition` input to explicitly set the element’s position. A common use case for this is restoring a draggable element's position after a user has navigated away and then returned.

::: code-group

```html [app.html]
<p>
  <button type="button" (click)="changePosition()">Change element position</button>
</p>

<div class="example-box" cdkDrag [cdkDragFreeDragPosition]="dragPosition">Drag me around</div>
```

```ts [app.ts]
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Programmatically setting the free drag position
 */
@Component({
  selector: 'cdk-drag-drop-free-drag-position-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDrag],
})
export class CdkDragDropFreeDragPositionExample {
  dragPosition = {x: 0, y: 0};

  changePosition() {
    this.dragPosition = {x: this.dragPosition.x + 50, y: this.dragPosition.y + 50};
  }
}
```

```css [app.css]
.example-box {
  width: 200px;
  height: 200px;
  border: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  cursor: move;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #fff;
  border-radius: 4px;
  position: relative;
  z-index: 1;
  font-family: sans-serif;
  transition: box-shadow 200ms cubic-bezier(0, 0, 0.2, 1);
  box-shadow:
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.example-box:active {
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
```

:::

### Restrict movement within an element

To stop the user from being able to drag a `cdkDrag` element outside of another element, pass a CSS selector to the `cdkDragBoundary` attribute. This attribute accepts a selector and looks up the DOM until it finds an element that matches it. If a match is found, the element becomes the boundary that the draggable element can't be dragged outside of `cdkDragBoundary` can also be used when `cdkDrag` is placed inside a `cdkDropList`.

::: code-group

```html [app.html]
<div class="example-boundary">
  <div class="example-box" cdkDragBoundary=".example-boundary" cdkDrag>
    I can only be dragged within the dotted container
  </div>
</div>
```

```ts [app.ts]
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop boundary
 */
@Component({
  selector: 'cdk-drag-drop-boundary-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDrag],
})
export class CdkDragDropBoundaryExample {}
```

```css [app.css]
.example-box {
  width: 200px;
  height: 200px;
  border: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  cursor: move;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #fff;
  border-radius: 4px;
  margin-right: 25px;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  padding: 10px;
  font-family: sans-serif;
  transition: box-shadow 200ms cubic-bezier(0, 0, 0.2, 1);
  box-shadow:
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.example-box:active {
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.example-boundary {
  width: 400px;
  height: 400px;
  max-width: 100%;
  border: dotted #ccc 2px;
}
```

:::

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update boundaryElement within the config. For more information see the [dependency injection guide](/guide/di), [drag config injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig).

### Restrict movement along an axis

By default, `cdkDrag` allows free movement in all directions. To restrict dragging to a specific axis, set `cdkDragLockAxis` to either "x" or "y" on `cdkDrag`. To restrict dragging for multiple draggable elements within `cdkDropList`, set `cdkDropListLockAxis` on `cdkDropList` instead.

::: code-group

```html [app.html]
<div class="example-box" cdkDragLockAxis="y" cdkDrag>I can only be dragged up/down</div>

<div class="example-box" cdkDragLockAxis="x" cdkDrag>I can only be dragged left/right</div>
```

```ts [app.ts]
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop position locking
 */
@Component({
  selector: 'cdk-drag-drop-axis-lock-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDrag],
})
export class CdkDragDropAxisLockExample {}
```

```css [app.css]
.example-box {
  width: 200px;
  height: 200px;
  border: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  cursor: move;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #fff;
  border-radius: 4px;
  margin-right: 25px;
  position: relative;
  z-index: 1;
  font-family: sans-serif;
  transition: box-shadow 200ms cubic-bezier(0, 0, 0.2, 1);
  box-shadow:
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.example-box:active {
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
```

:::

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update `lockAxis` within the config. For more information see the [dependency injection guide](/guide/di), [drag config injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig).

### Delay dragging

By default when the user puts their pointer down on a `cdkDrag`, the dragging sequence starts. This behavior might not be desirable in cases like fullscreen draggable elements on touch devices where the user might accidentally trigger a drag event as they scroll on the page.

You can delay the dragging sequence using the `cdkDragStartDelay` input. The input waits for the user to hold down their pointer for the specified number of milliseconds before dragging the element.

::: code-group

```html [app.html]
<div class="example-box" cdkDrag [cdkDragStartDelay]="1000">Dragging starts after one second</div>
```

```ts [app.ts]
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Delay dragging
 */
@Component({
  selector: 'cdk-drag-drop-delay-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDrag],
})
export class CdkDragDropDelayExample {}
```

```css [app.css]
.example-box {
  width: 200px;
  height: 200px;
  border: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  cursor: move;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #fff;
  border-radius: 4px;
  position: relative;
  z-index: 1;
  font-family: sans-serif;
  transition: box-shadow 200ms cubic-bezier(0, 0, 0.2, 1);
  box-shadow:
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.example-box:active {
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
```

:::

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update dragStartDelay within the config. For more information see the [dependency injection guide](/guide/di), [drag config injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig).

### Disable dragging

If you want to disable dragging for a particular drag item, set the `cdkDragDisabled` input on a `cdkDrag` item to true or false. You can disable an entire list using the `cdkDropListDisabled` input on a `cdkDropList`. It is also possible to disable a specific handle via `cdkDragHandleDisabled` on `cdkDragHandle`.

::: code-group

```html [app.html]
<div cdkDropList class="example-list" (cdkDropListDropped)="drop($event)">
  @for (item of items; track item) {
    <div class="example-box" cdkDrag [cdkDragDisabled]="item.disabled">{{ item.value }}</div>
  }
</div>
```

```ts [app.ts]
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop disabled
 */
@Component({
  selector: 'cdk-drag-drop-disabled-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropDisabledExample {
  items = [
    {value: 'I can be dragged', disabled: false},
    {value: 'I cannot be dragged', disabled: true},
    {value: 'I can also be dragged', disabled: false},
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }
}
```

```css [app.css]
.example-list {
  width: 500px;
  max-width: 100%;
  border: solid 1px #ccc;
  min-height: 60px;
  display: block;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.example-box {
  padding: 20px 10px;
  border-bottom: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  font-family: sans-serif;
}

.example-box.cdk-drag-disabled {
  background: #ccc;
  cursor: not-allowed;
  user-select: none;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update `draggingDisabled` within the config. For more information see the [dependency injection guide](/guide/di), [drag config injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig).

## Sorting customizations

### List orientation

By default, the `cdkDropList` directive assumes lists are vertical. This can be changed by setting the `cdkDropListOrientation` property to horizontal.

::: code-group

```html [app.html]
<div
  cdkDropList
  cdkDropListOrientation="horizontal"
  class="example-list"
  (cdkDropListDropped)="drop($event)"
>
  @for (timePeriod of timePeriods; track timePeriod) {
    <div class="example-box" cdkDrag>{{ timePeriod }}</div>
  }
</div>
```

```ts [app.ts]
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop horizontal sorting
 */
@Component({
  selector: 'cdk-drag-drop-horizontal-sorting-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropHorizontalSortingExample {
  timePeriods = [
    'Bronze age',
    'Iron age',
    'Middle ages',
    'Early modern period',
    'Long nineteenth century',
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.timePeriods, event.previousIndex, event.currentIndex);
  }
}
```

```css [app.css]
.example-list {
  width: 1000px;
  max-width: 100%;
  border: solid 1px #ccc;
  min-height: 60px;
  display: flex;
  flex-direction: row;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.example-box {
  padding: 20px 10px;
  border-right: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  flex-grow: 1;
  flex-basis: 0;
  font-family: sans-serif;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update `listOrientation` within the config. For more information see the [dependency injection guide](/guide/di), [drag config injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig).

### List wrapping

By default, the `cdkDropList` sorts the draggable elements by moving them around using a CSS transform. This allows for the sorting to be animated which provides a better user experience. However this also comes with the drawback that the drop list works only in one direction: vertically or horizontally.

If you have a sortable list that needs to wrap onto new lines, you can set `cdkDropListOrientation` attribute to `mixed`. This causes the list to use a different strategy of sorting the elements which involves moving them in the DOM. However, the list can no longer animate the sorting action.

::: code-group

```html [app.html]
<div
  cdkDropList
  cdkDropListOrientation="mixed"
  class="example-list"
  (cdkDropListDropped)="drop($event)"
>
  @for (item of items; track item) {
    <div class="example-box" cdkDrag>{{ item }}</div>
  }
</div>
```

```ts [app.ts]
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop horizontal wrapping list
 */
@Component({
  selector: 'cdk-drag-drop-mixed-sorting-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropMixedSortingExample {
  items = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }
}
```

```css [app.css]
.example-list {
  display: flex;
  flex-wrap: wrap;
  width: 505px;
  max-width: 100%;
  gap: 15px;
  padding: 15px;
  border: solid 1px #ccc;
  min-height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.example-box {
  padding: 20px 10px;
  border: solid 1px #ccc;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.87);
  display: inline-block;
  box-sizing: border-box;
  cursor: move;
  background: white;
  text-align: center;
  font-size: 14px;
  min-width: 115px;
  font-family: sans-serif;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

### Selective sorting

By default, `cdkDrag` elements are sorted into any position inside of a `cdkDropList`. To change this behavior, set the `cdkDropListSortPredicate` attribute which takes in a function. The predicate function is called whenever a draggable element is about to be moved into a new index within the drop list. If the predicate returns true, the item will be moved into the new index, otherwise it will keep its current position.

::: code-group

```html [app.html]
<div
  cdkDropList
  class="example-list"
  (cdkDropListDropped)="drop($event)"
  [cdkDropListSortPredicate]="sortPredicate"
>
  @for (number of numbers; track number) {
    <div class="example-box" [cdkDragData]="number" cdkDrag>{{ number }}</div>
  }
</div>
```

```ts [app.ts]
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop sort predicate
 */
@Component({
  selector: 'cdk-drag-drop-sort-predicate-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropSortPredicateExample {
  numbers = [1, 2, 3, 4, 5, 6, 7, 8];

  drop(event: CdkDragDrop<unknown>) {
    moveItemInArray(this.numbers, event.previousIndex, event.currentIndex);
  }

  /**
   * Predicate function that only allows even numbers to be
   * sorted into even indices and odd numbers at odd indices.
   */
  sortPredicate(index: number, item: CdkDrag<number>) {
    return (index + 1) % 2 === item.data % 2;
  }
}
```

```css [app.css]
.example-list {
  border: solid 1px #ccc;
  min-height: 60px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  display: block;
  width: 400px;
  max-width: 100%;
}

.example-box {
  padding: 20px 10px;
  border-bottom: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  font-family: sans-serif;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

### Disable sorting

There are cases where draggable elements can be dragged out of one `cdkDropList` into another, however the user shouldn't be able to sort them within the source list. For these cases, add the `cdkDropListSortingDisabled` attribute to prevent the draggable elements in a `cdkDropList` from sorting. This preserves the dragged element's initial position in the source list if it does not get dragged to a new valid position.

::: code-group

```html [app.html]
<div cdkDropListGroup>
  <div class="example-container">
    <h2>Available items</h2>

    <div
      cdkDropList
      [cdkDropListData]="items"
      class="example-list"
      cdkDropListSortingDisabled
      (cdkDropListDropped)="drop($event)"
    >
      @for (item of items; track item) {
        <div class="example-box" cdkDrag>{{ item }}</div>
      }
    </div>
  </div>

  <div class="example-container">
    <h2>Shopping basket</h2>

    <div
      cdkDropList
      [cdkDropListData]="basket"
      class="example-list"
      (cdkDropListDropped)="drop($event)"
    >
      @for (item of basket; track item) {
        <div class="example-box" cdkDrag>{{ item }}</div>
      }
    </div>
  </div>
</div>
```

```ts [app.ts]
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop disabled sorting
 */
@Component({
  selector: 'cdk-drag-drop-disabled-sorting-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag],
})
export class CdkDragDropDisabledSortingExample {
  items = ['Carrots', 'Tomatoes', 'Onions', 'Apples', 'Avocados'];

  basket = ['Oranges', 'Bananas', 'Cucumbers'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
```

```css [app.css]
.example-container {
  width: 400px;
  max-width: 100%;
  margin: 0 25px 25px 0;
  display: inline-block;
  vertical-align: top;
}

.example-list {
  border: solid 1px #ccc;
  min-height: 60px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  display: block;
}

h2 {
  font-family: sans-serif;
}

.example-box {
  padding: 20px 10px;
  border-bottom: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  font-family: sans-serif;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update sortingDisabled within the config. For more information see the [dependency injection guide](/guide/di), [drag config injection token API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig).

### Copying items between lists

By default, when an item is dragged from one list to another, it is moved out of its original list. However, you can configure the directives to copy the item, leaving the original item in the source list.

To enable copying, you can set the `cdkDropListHasAnchor` input. This tells the `cdkDropList` to create an "anchor" element that stays in the original container and doesn't move with the item. If the user moves the item back into the original container, the anchor is removed automatically. The anchor element can be styled by targeting the `.cdk-drag-anchor` CSS class.

Combining `cdkDropListHasAnchor` with `cdkDropListSortingDisabled` makes it possible to construct a list from which a user can copy items without being able to reorder the source list (e.g. a product list and a shopping cart).

::: code-group

```html [app.html]
<div class="example-container">
  <h2>Products</h2>

  <div
    cdkDropList
    [cdkDropListData]="products"
    [cdkDropListConnectedTo]="[cartList]"
    cdkDropListSortingDisabled
    cdkDropListHasAnchor
    class="example-list"
  >
    @for (product of products; track $index) {
      <div class="example-box" cdkDrag [cdkDragData]="product">{{ product }}</div>
    }
  </div>
</div>

<div class="example-container">
  <h2>Shopping cart</h2>

  <div
    cdkDropList
    #cartList="cdkDropList"
    [cdkDropListData]="cart"
    class="example-list"
    (cdkDropListDropped)="drop($event)"
  >
    @for (product of cart; track $index) {
      <div class="example-box" cdkDrag>{{ product }}</div>
    }
  </div>
</div>
```

```ts [app.ts]
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  copyArrayItem,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop copy between lists
 */
@Component({
  selector: 'cdk-drag-drop-copy-list-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropCopyListExample {
  products = ['Bananas', 'Oranges', 'Bread', 'Butter', 'Soda', 'Eggs'];
  cart = ['Tomatoes'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
```

```css [app.css]
.example-container {
  width: 400px;
  max-width: 100%;
  margin: 0 25px 25px 0;
  display: inline-block;
  vertical-align: top;
  font-family: sans-serif;
}

.example-list {
  border: solid 1px #ccc;
  min-height: 60px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  display: block;
}

h2 {
  font-family: sans-serif;
}

.example-box {
  padding: 20px 10px;
  border-bottom: solid 1px #ccc;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  cursor: move;
  background: white;
  font-size: 14px;
  font-family: sans-serif;
}

.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.example-box:last-child {
  border: none;
}

.example-list.cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}
```

:::

## Customize animations

Drag and drop supports animations for both:

- Sorting a draggable element inside a list
- Moving the draggable element from the position that the user dropped it to the final position inside the list

To set up your animations, define a CSS transition that targets the transform property. The following classes can be used for animations:

| CSS class name      | Result of adding transition                                                                                                                                                                                |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| .cdk-drag           | Animate draggable elements as they are being sorted.                                                                                                                                                       |
| .cdk-drag-animating | Animate the draggable element from its dropped position to the final position within the `cdkDropList`.<br><br>This CSS class is applied to a `cdkDrag` element only when the dragging action has stopped. |

## Styling

Both `cdkDrag` and `cdkDropList` directives only apply essential styles needed for functionality. Applications can customize their styles by targeting these specified CSS classes.

| CSS class name           | Description                                                                                                                                                                                                                                                                                             |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| .cdk-drop-list           | Selector for the `cdkDropList` container elements.                                                                                                                                                                                                                                                      |
| .cdk-drag                | Selector for `cdkDrag` elements.                                                                                                                                                                                                                                                                        |
| .cdk-drag-disabled       | Selector for disabled `cdkDrag` elements.                                                                                                                                                                                                                                                               |
| .cdk-drag-handle         | Selector for the host element of the `cdkDragHandle`.                                                                                                                                                                                                                                                   |
| .cdk-drag-preview        | Selector for the drag preview element. This is the element that appears next to the cursor as a user drags an element in a sortable list.<br><br>The element looks exactly like the element that is being dragged unless customized with a custom template through `*cdkDragPreview`.                   |
| .cdk-drag-placeholder    | Selector for the drag placeholder element. This is the element that is shown in the spot where the draggable element will be dragged to once the dragging action ends.<br><br>This element looks exactly like the element that is being sorted unless customized with the cdkDragPlaceholder directive. |
| .cdk-drop-list-dragging  | Selector for `cdkDropList` container element that has a draggable element currently being dragged.                                                                                                                                                                                                      |
| .cdk-drop-list-disabled  | Selector for `cdkDropList` container elements that are disabled.                                                                                                                                                                                                                                        |
| .cdk-drop-list-receiving | Selector for `cdkDropList` container element that has a draggable element it can receive from a connected drop list that is currently being dragged.                                                                                                                                                    |
| .cdk-drag-anchor         | Selector for the anchor element that is created when `cdkDropListHasAnchor` is enabled. This element indicates the position from which the dragged item started.                                                                                                                                        |

## Dragging in a scrollable container

If your draggable items are inside a scrollable container (e.g., a `div` with `overflow: auto`), automatic scrolling will not work unless the scrollable container has the `cdkScrollable` directive. Without it, the CDK cannot detect or control the scroll behavior of the container during drag operations.

## Integrations with other components

The CDK's drag-and-drop functionality can be integrated with different components. Common use cases include sortable `MatTable` components and sortable `MatTabGroup` components.
