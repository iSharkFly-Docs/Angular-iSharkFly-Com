# 使用 `ng-content` 渲染来自父组件的模板 {#render-templates-from-a-parent-component-with-ng-content}

`<ng-content>` 是一个特殊元素，它接受标记或模板（Template）片段，并控制组件（Component）如何渲染内容。它不会渲染出真实的 DOM 元素。

下面是一个 `BaseButton` 组件的示例，它接受来自父组件的任意标记。

```ts [base-button/base-button.ts]
import {Component} from '@angular/core';

@Component({
  selector: 'button[baseButton]',
  template: `<ng-content />`,
})
export class BaseButton {}
```

```ts [app.ts]
import {Component} from '@angular/core';
import {BaseButton} from './base-button';

@Component({
  selector: 'app-root',
  imports: [BaseButton],
  template: `<button baseButton>Next <span class="icon arrow-right"></span></button>`,
})
export class App {}
```

更多细节请参阅 [`<ng-content>` 深入指南](/guide/components/content-projection)，了解利用这种模式的其他方式。
