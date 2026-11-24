# 迁移到信号输入

Angular 引入了改进的输入（input）API，并从 v19 开始
认为它已可用于生产环境。
请在 [专门的指南](/guide/components/inputs) 中进一步了解信号（Signal）输入及其优势。

为了支持想要使用信号输入的现有团队，Angular 团队
提供了一个自动化迁移（migration），可以把 `@Input` 字段转换为新的 `input()` API。

使用以下命令运行该原理图（Schematic）：

```bash
ng generate @angular/core:signal-input-migration
```

此外，该迁移也可以作为 VSCode 中的 [代码重构操作](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) 使用。
安装最新版本的 VSCode 扩展，然后点击某个 `@Input` 字段即可。
更多详情请参阅 [下文](#vscode-extension) 的相应章节。

## 此迁移会改变什么？

1. `@Input()` 类成员会被更新为对应的信号 `input()` 形式。
2. 对已迁移输入的引用会被更新为调用该信号。
   - 这包括模板、宿主绑定或 TypeScript 代码中的引用。

**迁移前**

```ts
import {Component, Input} from '@angular/core';

@Component({
  template: `Name: {{ name ?? '' }}`,
})
export class MyComponent {
  @Input() name: string | undefined = undefined;

  someMethod(): number {
    if (this.name) {
      return this.name.length;
    }
    return -1;
  }
}
```

**迁移后**

```ts
import {Component, input} from '@angular/core';

@Component({
  template: `Name: {{ name() ?? '' }}`,
})
export class MyComponent {
  readonly name = input<string>();

  someMethod(): number {
    const name = this.name();
    if (name) {
      return name.length;
    }
    return -1;
  }
}
```

## 配置选项

此迁移支持一些选项，可以根据你的具体需求进行微调。

### `--path`

默认情况下，此迁移会更新整个 Angular CLI 工作区（workspace）。
你可以使用此选项把迁移限制在某个特定的子目录中。

### `--best-effort-mode`

默认情况下，迁移会跳过无法安全迁移的输入。
迁移会尽可能安全地重构代码。

启用 `--best-effort-mode` 标志后，迁移会积极地
尝试迁移尽可能多的代码，即使这可能会破坏你的构建。

### `--insert-todos`

启用后，迁移会为无法迁移的输入添加 TODO。
这些 TODO 会说明输入被跳过的原因。例如：

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the input. This prevents migration.
@Input() myInput = false;
```

### `--analysis-dir`

在大型项目中，你可以使用此选项来减少需要分析的文件数量。
默认情况下，无论 `--path` 选项如何设置，迁移都会分析整个工作区，
以便更新受 `@Input()` 迁移影响的所有引用。

使用此选项，你可以把分析限制在某个子文件夹中。请注意，这意味着
该目录之外的任何引用都会被静默跳过，可能会破坏你的构建。

## VSCode 扩展

![VSCode 扩展的截图，点击某个 `@Input` 字段](/assets/images/migrations/signal-inputs-vscode.png 'VSCode 扩展的截图，点击某个 `@Input` 字段。')

该迁移可以作为 VSCode 中的 [代码重构操作](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) 使用。

要通过 VSCode 使用该迁移，请安装最新版本的 VSCode 扩展，然后点击：

- 某个 `@Input` 字段；
- 或者某个指令/组件。

然后，等待 VSCode 黄色灯泡形状的重构按钮出现。
通过这个按钮，你就可以选择信号输入迁移。
