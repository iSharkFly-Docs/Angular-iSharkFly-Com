# 清理未使用的导入

从 v19 开始，当组件的 `imports` 数组中包含模板未使用的符号时，Angular 会给出报告。

运行此原理图（Schematic）会清理项目中所有未使用的导入。

使用以下命令运行该原理图：

```shell
ng generate @angular/core:cleanup-unused-imports
```

#### 迁移前

```ts
import {Component} from '@angular/core';
import {UnusedDirective} from './unused';

@Component({
  template: 'Hello',
  imports: [UnusedDirective],
})
export class MyComp {}
```

#### 迁移后

```ts
import {Component} from '@angular/core';

@Component({
  template: 'Hello',
  imports: [],
})
export class MyComp {}
```
