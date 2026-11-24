# 拖放 {#drag-and-drop}

## 概览 {#overview}

本页介绍拖放（drag and drop）指令（directive），借助它们可以快速创建具备以下功能的拖放界面：

- 自由拖动
- 创建可重新排序的可拖动元素列表
- 在列表之间转移可拖动元素
- 拖动动画（animation）
- 将可拖动元素锁定在某个轴向或元素内
- 添加自定义拖动手柄
- 在拖动时添加预览
- 添加自定义拖动占位符

完整的 API 参考，请参阅 [Angular CDK 拖放 API 参考页](/api#angular_cdk_drag-drop)。

## 开始之前 {#before-you-start}

### 安装 CDK {#cdk-installation}

[组件开发工具包（Component Dev Kit，CDK）](https://material.angular.dev/cdk/categories) 是一组用于构建组件（component）的行为原语。要使用拖放指令，请先从 npm 安装 `@angular/cdk`。你可以在终端中使用 Angular CLI 完成安装：

```shell
ng add @angular/cdk
```

### 导入拖放 {#importing-drag-and-drop}

要使用拖放，请在组件中从这些指令里导入你需要的部分。

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

## 创建可拖动元素 {#create-draggable-elements}

只要添加 `cdkDrag` 指令，就可以让任何元素变得可拖动。默认情况下，所有可拖动元素都支持自由拖动。

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

## 创建可重新排序的可拖动元素列表 {#create-a-list-of-reorderable-draggable-elements}

在父元素上添加 `cdkDropList` 指令，可以把可拖动元素组合成一个可重新排序的集合。它定义了可拖动元素可以放置的位置。当某个元素移动时，放置列表组中的可拖动元素会自动重新排列。

拖放指令不会更新你的数据模型。要更新数据模型，请监听 `cdkDropListDropped` 事件（在用户完成拖动时触发），并手动更新数据模型。

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

你可以使用 `CDK_DROP_LIST` 注入令牌（injection token）来引用 `cdkDropList` 的实例。更多信息请参阅[依赖注入指南](/guide/di)和 [drop list 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DROP_LIST)。

## 在列表之间转移可拖动元素 {#transfer-draggable-elements-between-lists}

`cdkDropList` 指令支持在相互连接的放置列表之间转移可拖动元素。有两种方式可以把一个或多个 `cdkDropList` 实例连接在一起：

- 把 `cdkDropListConnectedTo` 属性设置为另一个放置列表。
- 用一个带有 `cdkDropListGroup` attribute 的元素包裹这些元素。

`cdkDropListConnectedTo` 指令既可以直接引用另一个 `cdkDropList`，也可以通过 id 引用另一个放置容器。

```html
<!-- 这样是有效的 -->
<div cdkDropList #listOne="cdkDropList" [cdkDropListConnectedTo]="[listTwo]"></div>
<div cdkDropList #listTwo="cdkDropList" [cdkDropListConnectedTo]="[listOne]"></div>

<!-- 这样也是有效的 -->
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

如果相互连接的放置列表数量不确定，可以使用 `cdkDropListGroup` 指令来自动建立连接。添加到该组下的任何新 `cdkDropList` 都会自动连接到所有其他列表。

```html
<div cdkDropListGroup>
  <!-- 这里的所有列表都会相互连接。 -->
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

你可以使用 `CDK_DROP_LIST_GROUP` 注入令牌来引用 `cdkDropListGroup` 的实例。更多信息请参阅[依赖注入指南](/guide/di)和 [drop list group 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DROP_LIST_GROUP)。

### 选择性拖动 {#selective-dragging}

默认情况下，用户可以把 `cdkDrag` 元素从一个容器移动到另一个相连的容器中。如果要更精细地控制哪些元素可以放入某个容器，请使用 `cdkDropListEnterPredicate`。每当可拖动元素进入一个新容器时，Angular 都会调用这个谓词函数。根据谓词返回 true 还是 false，该条目可能被允许或不被允许进入新容器。

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

  /** 谓词函数，只允许偶数被放入列表。 */
  evenPredicate(item: CdkDrag<number>) {
    return item.data % 2 === 0;
  }

  /** 谓词函数，不允许任何条目被放入列表。 */
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

## 附加数据 {#attach-data}

你可以通过分别设置 `cdkDragData` 或 `cdkDropListData`，把任意数据关联到 `cdkDrag` 和 `cdkDropList` 上。你可以绑定（bind）这两个指令所触发的事件，这些事件会包含这些数据，便于你轻松识别拖动或放置交互的来源。

```html
@for (list of lists; track list) {
  <div cdkDropList [cdkDropListData]="list" (cdkDropListDropped)="drop($event)">
    @for (item of list; track item) {
      <div cdkDrag [cdkDragData]="item"></div>
    }
  </div>
}
```

## 拖动自定义 {#dragging-customizations}

### 自定义拖动手柄 {#customize-drag-handle}

默认情况下，用户可以拖动整个 `cdkDrag` 元素来移动它。如果要限制用户只能通过某个手柄元素来拖动，请在 `cdkDrag` 内部的某个元素上添加 `cdkDragHandle` 指令。`cdkDragHandle` 元素的数量不受限制。

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

你可以使用 `CDK_DRAG_HANDLE` 注入令牌来引用 `cdkDragHandle` 的实例。更多信息请参阅[依赖注入指南](/guide/di)和 [drag handle 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_HANDLE)。

### 自定义拖动预览 {#customize-drag-preview}

拖动 `cdkDrag` 元素时，会显示一个预览元素。默认情况下，预览是原始元素的克隆，位于用户光标旁边。

要自定义预览，请通过 `*cdkDragPreview` 提供一个自定义模板（template）。由于不会对元素内容做任何假设，自定义预览不会匹配原始被拖动元素的尺寸。如果要让拖动预览与元素尺寸一致，请给 `matchSize` 输入（input）传入 true。

克隆出的元素会移除其 id attribute，以避免页面上出现多个 id 相同的元素。这会导致所有针对该 id 的 CSS 都不会生效。

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

你可以使用 `CDK_DRAG_PREVIEW` 注入令牌来引用 `cdkDragPreview` 的实例。更多信息请参阅[依赖注入指南](/guide/di)和 [drag preview 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_PREVIEW)。

### 自定义拖动插入点 {#customize-drag-insertion-point}

默认情况下，Angular 会把 `cdkDrag` 预览插入到页面的 `<body>` 中，以避免定位和溢出方面的问题。但在某些情况下这可能并不理想，因为预览不会应用其继承的样式。

你可以使用 `cdkDrag` 上的 `cdkDragPreviewContainer` 输入来更改 Angular 插入预览的位置。可选的值有：

| 值 | 说明 | 优点 | 缺点 |
| :---------------------------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `global` | 默认值。Angular 会把预览插入到 &lt;body&gt; 或最近的 shadow root 中。 | 预览不会受到 `z-index` 或 `overflow: hidden` 的影响，也不会影响 `:nth-child` 选择器（selector）和 flex 布局。 | 不保留继承的样式。 |
| `parent` | Angular 会把预览插入到被拖动元素的父元素中。 | 预览继承与被拖动元素相同的样式。 | 预览可能被 `overflow: hidden` 裁剪，或因为 `z-index` 被其他元素遮挡。此外，它可能影响 `:nth-child` 选择器和某些 flex 布局。 |
| `ElementRef` 或 `HTMLElement` | Angular 会把预览插入到指定的元素中。 | 预览继承指定容器元素的样式。 | 预览可能被 `overflow: hidden` 裁剪，或因为 `z-index` 被其他元素遮挡。此外，它可能影响 `:nth-child` 选择器和某些 flex 布局。 |

此外，如果值是 `global` 或 `parent`，你也可以修改 `CDK_DRAG_CONFIG` 注入令牌，在配置中更新 `previewContainer`。更多信息请参阅[依赖注入指南](/guide/di)，以及 [drag config 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG) 和 [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig)。

### 自定义拖动占位符 {#customize-drag-placeholder}

在拖动 `cdkDrag` 元素期间，该指令会创建一个占位符元素，用于显示元素放下后将被放置的位置。默认情况下，占位符是被拖动元素的克隆。你可以使用 `*cdkDragPlaceholder` 指令把占位符替换为自定义的占位符：

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

你可以使用 `CDK_DRAG_PLACEHOLDER` 注入令牌来引用 `cdkDragPlaceholder` 的实例。更多信息请参阅[依赖注入指南](/guide/di)和 [drag placeholder 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_PLACEHOLDER)。

### 自定义拖动根元素 {#customize-drag-root-element}

如果你想让某个元素可拖动，却无法直接访问它，可以设置 `cdkDragRootElement` attribute。

该 attribute 接受一个选择器，并沿 DOM 向上查找，直到找到与该选择器匹配的元素。如果找到了元素，该元素就会变得可拖动。这在让对话框可拖动之类的场景中很有用。

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

此外，你也可以修改 `CDK_DRAG_CONFIG` 注入令牌，在配置中更新 `rootElementSelector`。更多信息请参阅[依赖注入指南](/guide/di)，以及 [drag config 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG) 和 [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig)。

### 设置可拖动元素的 DOM 位置 {#set-dom-position-of-a-draggable-element}

默认情况下，不在 `cdkDropList` 中的 `cdkDrag` 元素只有在用户手动移动时才会离开其正常的 DOM 位置。使用 `cdkDragFreeDragPosition` 输入可以显式设置元素的位置。一个常见的用例是：用户离开页面后再返回时，恢复可拖动元素的位置。

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

### 限制在某个元素内移动 {#restrict-movement-within-an-element}

要阻止用户把 `cdkDrag` 元素拖到另一个元素之外，请给 `cdkDragBoundary` attribute 传入一个 CSS 选择器。该 attribute 接受一个选择器，并沿 DOM 向上查找，直到找到与之匹配的元素。如果找到匹配项，该元素就会成为边界，可拖动元素无法被拖出这个边界。当 `cdkDrag` 位于 `cdkDropList` 内部时，也可以使用 `cdkDragBoundary`。

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

此外，你也可以修改 `CDK_DRAG_CONFIG` 注入令牌，在配置中更新 boundaryElement。更多信息请参阅[依赖注入指南](/guide/di)，以及 [drag config 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG) 和 [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig)。

### 限制沿某个轴移动 {#restrict-movement-along-an-axis}

默认情况下，`cdkDrag` 允许向所有方向自由移动。要把拖动限制在特定轴上，请在 `cdkDrag` 上把 `cdkDragLockAxis` 设置为 "x" 或 "y"。如果要限制 `cdkDropList` 中多个可拖动元素的拖动，请改为在 `cdkDropList` 上设置 `cdkDropListLockAxis`。

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

此外，你也可以修改 `CDK_DRAG_CONFIG` 注入令牌，在配置中更新 `lockAxis`。更多信息请参阅[依赖注入指南](/guide/di)，以及 [drag config 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG) 和 [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig)。

### 延迟拖动 {#delay-dragging}

默认情况下，当用户在 `cdkDrag` 上按下指针时，拖动过程就会开始。在某些情况下，这种行为可能并不理想，例如在触摸设备上使用全屏可拖动元素时，用户可能会在滚动页面时意外触发拖动事件。

你可以使用 `cdkDragStartDelay` 输入来延迟拖动过程。该输入会等待用户按住指针达到指定的毫秒数后，才开始拖动元素。

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

此外，你也可以修改 `CDK_DRAG_CONFIG` 注入令牌，在配置中更新 dragStartDelay。更多信息请参阅[依赖注入指南](/guide/di)，以及 [drag config 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG) 和 [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig)。

### 禁用拖动 {#disable-dragging}

如果要禁用某个拖动条目的拖动，请把 `cdkDrag` 条目上的 `cdkDragDisabled` 输入设置为 true 或 false。你可以使用 `cdkDropList` 上的 `cdkDropListDisabled` 输入来禁用整个列表。也可以通过 `cdkDragHandle` 上的 `cdkDragHandleDisabled` 来禁用特定的手柄。

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

此外，你也可以修改 `CDK_DRAG_CONFIG` 注入令牌，在配置中更新 `draggingDisabled`。更多信息请参阅[依赖注入指南](/guide/di)，以及 [drag config 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG) 和 [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig)。

## 排序自定义 {#sorting-customizations}

### 列表方向 {#list-orientation}

默认情况下，`cdkDropList` 指令假定列表是垂直的。可以通过把 `cdkDropListOrientation` 属性设置为 horizontal 来更改。

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

此外，你也可以修改 `CDK_DRAG_CONFIG` 注入令牌，在配置中更新 `listOrientation`。更多信息请参阅[依赖注入指南](/guide/di)，以及 [drag config 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG) 和 [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig)。

### 列表换行 {#list-wrapping}

默认情况下，`cdkDropList` 会通过 CSS transform 移动可拖动元素来对它们进行排序。这样可以让排序带有动画，从而提供更好的用户体验。但这也带来了一个缺点：放置列表只能在一个方向上工作，即垂直或水平。

如果你有一个需要换行的可排序列表，可以把 `cdkDropListOrientation` attribute 设置为 `mixed`。这会让列表使用另一种排序策略，即在 DOM 中移动元素。不过，这样列表就无法再为排序操作添加动画了。

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

### 选择性排序 {#selective-sorting}

默认情况下，`cdkDrag` 元素可以被排序到 `cdkDropList` 内的任何位置。要更改这一行为，请设置 `cdkDropListSortPredicate` attribute，它接受一个函数。每当可拖动元素即将被移动到放置列表中的新索引时，都会调用该谓词函数。如果谓词返回 true，条目就会被移动到新索引，否则会保持在当前位置。

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
   * 谓词函数，只允许偶数被排序到偶数索引，
   * 奇数被排序到奇数索引。
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

### 禁用排序 {#disable-sorting}

在某些情况下，可拖动元素可以从一个 `cdkDropList` 拖到另一个中，但用户不应该能在源列表内对它们排序。对于这类情况，可以添加 `cdkDropListSortingDisabled` attribute，以阻止 `cdkDropList` 中的可拖动元素进行排序。如果被拖动的元素没有被拖到新的有效位置，它在源列表中的初始位置会被保留。

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

此外，你也可以修改 `CDK_DRAG_CONFIG` 注入令牌，在配置中更新 sortingDisabled。更多信息请参阅[依赖注入指南](/guide/di)，以及 [drag config 注入令牌 API](https://angular.dev/api/cdk/drag-drop/CDK_DRAG_CONFIG) 和 [drag drop config API](https://angular.dev/api/cdk/drag-drop/DragDropConfig)。

### 在列表之间复制条目 {#copying-items-between-lists}

默认情况下，当一个条目从一个列表拖到另一个列表时，它会被移出原来的列表。不过，你可以配置这些指令来复制条目，把原始条目保留在源列表中。

要启用复制，可以设置 `cdkDropListHasAnchor` 输入。它会让 `cdkDropList` 创建一个“锚点”元素，该元素留在原容器中，不随条目一起移动。如果用户把条目移回原容器，锚点会被自动移除。可以通过 `.cdk-drag-anchor` CSS 类来设置锚点元素的样式。

把 `cdkDropListHasAnchor` 与 `cdkDropListSortingDisabled` 结合使用，就可以构建一个列表，用户可以从中复制条目，但无法对源列表重新排序（例如商品列表和购物车）。

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

## 自定义动画 {#customize-animations}

拖放支持以下两种动画：

- 在列表内对可拖动元素进行排序
- 把可拖动元素从用户放下的位置移动到列表内的最终位置

要设置动画，请定义一个针对 transform 属性的 CSS 过渡（transition）。以下类可用于动画：

| CSS 类名 | 添加过渡后的效果 |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| .cdk-drag | 在可拖动元素排序时为其添加动画。 |
| .cdk-drag-animating | 为可拖动元素从放下位置移动到 `cdkDropList` 内最终位置的过程添加动画。<br><br>只有当拖动操作停止后，这个 CSS 类才会应用到 `cdkDrag` 元素上。 |

## 样式 {#styling}

`cdkDrag` 和 `cdkDropList` 指令都只应用实现功能所需的基本样式。应用可以通过这些指定的 CSS 类来自定义样式。

| CSS 类名 | 说明 |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| .cdk-drop-list | `cdkDropList` 容器元素的选择器。 |
| .cdk-drag | `cdkDrag` 元素的选择器。 |
| .cdk-drag-disabled | 已禁用的 `cdkDrag` 元素的选择器。 |
| .cdk-drag-handle | `cdkDragHandle` 宿主元素（host element）的选择器。 |
| .cdk-drag-preview | 拖动预览元素的选择器。这是用户在可排序列表中拖动元素时出现在光标旁边的元素。<br><br>除非通过 `*cdkDragPreview` 使用自定义模板进行定制，否则该元素看起来与被拖动的元素完全相同。 |
| .cdk-drag-placeholder | 拖动占位符元素的选择器。这是显示在拖动操作结束后可拖动元素将被放置的位置上的元素。<br><br>除非使用 cdkDragPlaceholder 指令进行定制，否则该元素看起来与正在排序的元素完全相同。 |
| .cdk-drop-list-dragging | 包含正在被拖动的可拖动元素的 `cdkDropList` 容器元素的选择器。 |
| .cdk-drop-list-disabled | 已禁用的 `cdkDropList` 容器元素的选择器。 |
| .cdk-drop-list-receiving | 可以接收来自相连放置列表中正在被拖动的可拖动元素的 `cdkDropList` 容器元素的选择器。 |
| .cdk-drag-anchor | 启用 `cdkDropListHasAnchor` 时创建的锚点元素的选择器。该元素表示被拖动条目的起始位置。 |

## 在可滚动容器中拖动 {#dragging-in-a-scrollable-container}

如果可拖动条目位于可滚动容器中（例如带有 `overflow: auto` 的 `div`），除非可滚动容器带有 `cdkScrollable` 指令，否则自动滚动不会生效。没有这个指令，CDK 就无法在拖动操作期间检测或控制容器的滚动行为。

## 与其他组件的集成 {#integrations-with-other-components}

CDK 的拖放功能可以与各种组件集成。常见用例包括可排序的 `MatTable` 组件和可排序的 `MatTabGroup` 组件。
