# 迁移到 output 函数

Angular 在 v17.3 中引入了改进的输出（output）API，并从 v19 开始
认为它已可用于生产环境。此 API 模仿了 `input()` API，但并不基于信号（Signal）。
请在 [专门的指南](/guide/components/outputs) 中进一步了解自定义事件 output 函数及其优势。

为了支持想要使用 output 函数的现有项目，Angular 团队
提供了一个自动化迁移（migration），可以把 `@Output` 自定义事件转换为新的 `output()` API。

使用以下命令运行该原理图（Schematic）：

```bash
ng generate @angular/core:output-migration
```

## 此迁移会改变什么？

1. `@Output()` 类成员会被更新为对应的 `output()` 形式。
2. 组件或指令所在文件中 TypeScript 模块级别的导入也会随之更新。
3. 把不推荐使用的 `event.next()` 等 API 调用迁移为 `event.emit()`，并移除 `event.complete()` 调用。

**迁移前**

```ts
import {Component, Output, EventEmitter} from '@angular/core';

@Component({
  template: `<button (click)="someMethod('test')">emit</button>`,
})
export class MyComponent {
  @Output() someChange = new EventEmitter<string>();

  someMethod(value: string): void {
    this.someChange.emit(value);
  }
}
```

**迁移后**

```ts
import {Component, output} from '@angular/core';

@Component({
  template: `<button (click)="someMethod('test')">emit</button>`,
})
export class MyComponent {
  readonly someChange = output<string>();

  someMethod(value: string): void {
    this.someChange.emit(value);
  }
}
```

## 配置选项

此迁移支持一些选项，可以根据你的具体需求进行微调。

### `--path`

如果未指定，迁移会询问你一个路径，并更新整个 Angular CLI 工作区（workspace）。
你可以使用此选项把迁移限制在某个特定的子目录中。

### `--analysis-dir`

在大型项目中，你可以使用此选项来减少需要分析的文件数量。
默认情况下，无论 `--path` 选项如何设置，迁移都会分析整个工作区，
以便更新受 `@Output()` 迁移影响的所有引用。

使用此选项，你可以把分析限制在某个子文件夹中。请注意，这意味着
该目录之外的任何引用都会被静默跳过，可能会破坏你的构建。

按如下方式使用这些选项：

```bash
ng generate @angular/core:output-migration --path src/app/sub-folder
```

## 例外情况

在某些情况下，迁移不会修改代码。
其中一种例外情况是：在测试文件之外，事件与 `pipe()` 方法一起使用。
以下代码不会被迁移：

```ts
export class MyDialogComponent {
  @Output() close = new EventEmitter<void>();
  doSome(): void {
    this.close.complete();
  }
  otherThing(): void {
    this.close.pipe();
  }
}
```

在测试文件中，迁移会改写这种用法，而不是跳过该输出，因此 `this.close.pipe(…)` 会变为 `outputToObservable(this.close).pipe(…)`。

::: info 注意
迁移通过查找路径中包含 `jasmine` 或 `catalyst` 的导入来识别测试文件。它无法识别只导入了 Jest 或 Vitest 的文件，因此在这类文件中会跳过该输出，而不是改写它。

:::
