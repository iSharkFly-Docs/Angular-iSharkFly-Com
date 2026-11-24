# 将 CommonModule 的用法转换为独立导入

此迁移（migration）通过为每个模板添加其所需的最小指令和管道导入集合（例如 `NgIf`、`NgFor`、`AsyncPipe` 等），帮助项目移除组件中对 `CommonModule` 的导入。

使用以下命令运行该原理图（Schematic）：

```shell
ng generate @angular/core:common-to-standalone
```

## 选项

| 选项   | 详情                                                                                                                          |
| :----- | :---------------------------------------------------------------------------------------------------------------------------- |
| `path` | 要迁移的路径（相对于项目根目录）。默认为 `./`。可以用它来逐步迁移项目的一部分。 |

## 示例

迁移前：

```ts
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-example',
  imports: [CommonModule],
  template: `
    <div *ngIf="show">
      {{ data | async | json }}
    </div>
  `,
})
export class Example {
  show = true;
  data = Promise.resolve({message: 'Hello'});
}
```

运行迁移后（添加了组件导入，移除了 CommonModule）：

```ts
import {Component} from '@angular/core';
import {AsyncPipe, JsonPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-example',
  imports: [AsyncPipe, JsonPipe, NgIf],
  template: `
    <div *ngIf="show">
      {{ data | async | json }}
    </div>
  `,
})
export class Example {
  show = true;
  data = Promise.resolve({message: 'Hello'});
}
```
