# 迁移到信号查询

Angular 引入了改进的查询（query）API，并从 v19 开始
认为它们已可用于生产环境。
请在 [专门的指南](/guide/components/queries) 中进一步了解信号（Signal）查询及其优势。

为了支持想要使用信号查询的现有团队，Angular 团队
提供了一个自动化迁移（migration），可以把现有的装饰器查询字段转换为新的 API。

使用以下命令运行该原理图（Schematic）：

```bash
ng generate @angular/core:signal-queries-migration
```

此外，该迁移也可以作为 VSCode 中的 [代码重构操作](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) 使用。
安装最新版本的 VSCode 扩展，然后点击诸如 `@ViewChild` 之类的字段即可。
更多详情请参阅 [下文](#vscode-extension) 的相应章节。

## 此迁移会改变什么？

1. `@ViewChild()`、`@ViewChildren`、`@ContentChild` 和 `@ContentChildren` 类成员
   会被更新为对应的信号形式。
2. 应用中对已迁移查询的引用会被更新为调用该信号。
   - 这包括模板、宿主绑定或 TypeScript 代码中的引用。

**迁移前**

```ts
import {Component, ContentChild, ElementRef} from '@angular/core';

@Component({
  template: `Has ref: {{ ref ? 'Yes' : 'No' }}`,
})
export class MyComponent {
  @ContentChild('someRef') ref: ElementRef | undefined = undefined;

  someMethod(): void {
    if (this.ref) {
      this.ref.nativeElement;
    }
  }
}
```

**迁移后**

```ts
import {Component, contentChild, ElementRef} from '@angular/core';

@Component({
  template: `Has ref: {{ ref() ? 'Yes' : 'No' }}`,
})
export class MyComponent {
  readonly ref = contentChild<ElementRef>('someRef');

  someMethod(): void {
    const ref = this.ref();
    if (ref) {
      ref.nativeElement;
    }
  }
}
```

## 配置选项

此迁移支持一些选项，可以根据你的具体需求进行微调。

### `--path`

默认情况下，此迁移会更新整个 Angular CLI 工作区（workspace）。
你可以使用此选项把迁移限制在某个特定的子目录中。

### `--best-effort-mode`

默认情况下，迁移会跳过无法安全迁移的查询。
迁移会尽可能安全地重构代码。

启用 `--best-effort-mode` 标志后，迁移会积极地
尝试迁移尽可能多的代码，即使这可能会破坏你的构建。

### `--insert-todos`

启用后，迁移会为无法迁移的查询添加 TODO。
这些 TODO 会说明查询被跳过的原因。例如：

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the query. This prevents migration.
@ViewChild('ref') ref?: ElementRef;
```

### `--analysis-dir`

在大型项目中，你可以使用此选项来减少需要分析的文件数量。
默认情况下，无论 `--path` 选项如何设置，迁移都会分析整个工作区，
以便更新受所迁移的查询声明影响的所有引用。

使用此选项，你可以把分析限制在某个子文件夹中。请注意，这意味着
该目录之外的任何引用都会被静默跳过，可能会破坏你的构建。

## VSCode 扩展

![VSCode 扩展的截图，点击某个 `@ViewChild` 字段](/assets/images/migrations/signal-queries-vscode.png 'VSCode 扩展的截图，点击某个 `@ViewChild` 字段。')

该迁移可以作为 VSCode 中的 [代码重构操作](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) 使用。

要通过 VSCode 使用该迁移，请安装最新版本的 VSCode 扩展，然后点击：

- 某个 `@ViewChild`、`@ViewChildren`、`@ContentChild` 或 `@ContentChildren` 字段；
- 或者某个指令/组件。

然后，等待 VSCode 黄色灯泡形状的重构按钮出现。
通过这个按钮，你就可以选择信号查询迁移。
