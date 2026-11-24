# 将现有 Angular 项目迁移到独立组件

**独立组件（Standalone Component）** 提供了一种更简化的 Angular 应用构建方式。独立组件、指令和管道旨在通过减少对 `NgModule` 的需求来简化开发体验。现有应用可以按需、逐步地采用新的独立风格，而不会引入任何破坏性变更。

<iframe src="https://www.youtube.com/embed/x5PZwb4XurU" title="Getting started with standalone components" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

此原理图（Schematic）帮助你把现有项目中的组件、指令和管道转换为独立的形式。原理图会尽可能多地自动转换代码，但项目作者可能仍需要进行一些手动修复。

使用以下命令运行该原理图：

```shell
ng generate @angular/core:standalone
```

## 更新之前

在使用该原理图之前，请确保项目：

1. 使用的是 Angular 15.2.0 或更高版本。
2. 可以正常构建，没有任何编译错误。
3. 位于干净的 Git 分支上，并且所有工作都已保存。

## 原理图选项

| 选项   | 详情                                                                                                                          |
| :----- | :---------------------------------------------------------------------------------------------------------------------------- |
| `mode` | 要执行的转换。有关可用选项的详细信息，请参阅下文的 [迁移模式](#migration-modes)。            |
| `path` | 要迁移的路径，相对于项目根目录。你可以使用此选项逐步迁移项目的各个部分。 |

## 迁移步骤

迁移（migration）过程由三个步骤组成。你需要多次运行它，并手动检查项目能否构建以及行为是否符合预期。

::: info 注意
虽然原理图可以自动更新大部分代码，但一些边缘情况需要开发者介入。
你应该计划在每个迁移步骤之后进行手动修复。此外，原理图生成的新代码可能不符合你代码的格式化规则。

:::

请按以下顺序运行迁移，并在每个步骤之间验证代码能否构建和运行：

1. 运行 `ng g @angular/core:standalone` 并选择 "Convert all components, directives and pipes to standalone"（把所有组件、指令和管道转换为独立的）
2. 运行 `ng g @angular/core:standalone` 并选择 "Remove unnecessary NgModule classes"（移除不必要的 NgModule 类）
3. 运行 `ng g @angular/core:standalone` 并选择 "Bootstrap the application using standalone APIs"（使用独立 API 引导应用）
4. 运行所有代码检查和格式化检查，修复所有失败项，然后提交结果

## 迁移之后

恭喜，你的应用已经转换为独立组件形式了 🎉。下面是一些你现在可能想要执行的可选后续步骤：

- 查找并移除所有剩余的 `NgModule` 声明：由于 ["移除不必要的 NgModule" 步骤](#remove-unnecessary-ngmodules) 无法自动移除所有模块，你可能需要手动移除剩余的声明。
- 运行项目的单元测试并修复所有失败项。
- 如果项目使用了自动格式化，请运行代码格式化工具。
- 运行项目中的代码检查工具并修复新的警告。一些代码检查工具支持 `--fix` 标志，可以自动解决部分警告。

## 迁移模式

此迁移有以下几种模式：

1. 把声明转换为独立的。
2. 移除不必要的 NgModule。
3. 切换到独立的引导 API。
   你应该按照上述顺序运行这些迁移。

### 把声明转换为独立的

在此模式下，迁移会移除 `standalone: false` 并把依赖添加到 `imports` 数组中，从而把所有组件、指令和管道转换为独立的。

::: tip 提示
在此步骤中，原理图会忽略那些引导组件的 NgModule，因为它们很可能是供 `bootstrapModule` 使用的根模块，而不是供兼容独立组件的 `bootstrapApplication` 使用的。原理图会在 ["切换到独立的引导 API"](#switch-to-standalone-bootstrapping-api) 步骤中自动转换这些声明。

:::

**迁移前：**

```ts [shared.module.ts]
@NgModule({
  imports: [CommonModule],
  declarations: [Greeter],
  exports: [Greeter],
})
export class SharedModule {}
```

```ts [greeter.ts]
@Component({
  selector: 'greeter',
  template: '<div *ngIf="showGreeting">Hello</div>',
  standalone: false,
})
export class Greeter {
  showGreeting = true;
}
```

**迁移后：**

```ts [shared.module.ts]
@NgModule({
  imports: [CommonModule, Greeter],
  exports: [Greeter],
})
export class SharedModule {}
```

```ts [greeter.ts]
@Component({
  selector: 'greeter',
  template: '<div *ngIf="showGreeting">Hello</div>',
  imports: [NgIf],
})
export class Greeter {
  showGreeting = true;
}
```

### 移除不必要的 NgModule

把所有声明转换为独立的之后，许多 NgModule 都可以安全地移除了。此步骤会删除这些模块声明，以及尽可能多的相应引用。如果迁移无法自动删除某个引用，它会留下以下 TODO 注释，以便你手动删除该 NgModule：

```ts
/* TODO(standalone-migration): clean up removed NgModule reference manually */
```

如果某个模块满足以下条件，迁移就认为可以安全地移除它：

- 没有 `declarations`。
- 没有 `providers`。
- 没有 `bootstrap` 组件。
- 没有引用 `ModuleWithProviders` 符号或无法移除的模块的 `imports`。
- 没有类成员。空的构造函数会被忽略。

**迁移前：**

```ts [importer.module.ts]
@NgModule({
  imports: [FooComponent, BarPipe],
  exports: [FooComponent, BarPipe],
})
export class ImporterModule {}
```

**迁移后：**

```ts [importer.module.ts]
// 该文件已不存在！
```

### 切换到独立的引导 API

此步骤会把所有 `bootstrapModule` 的用法转换为新的、基于独立组件的 `bootstrapApplication`。它还会从根组件中移除 `standalone: false`，并删除根 NgModule。如果根模块中有任何 `providers` 或 `imports`，迁移会尝试把尽可能多的配置复制到新的引导调用中。

**迁移前：**

```ts [./app/app.module.ts]
import {NgModule} from '@angular/core';
import {App} from './app';

@NgModule({
  declarations: [App],
  bootstrap: [App],
})
export class AppModule {}
```

```ts [./app/app.ts]
@Component({
  selector: 'app',
  template: 'hello',
  standalone: false,
})
export class App {}
```

```ts [./main.ts]
import {platformBrowser} from '@angular/platform-browser';
import {AppModule} from './app/app.module';

platformBrowser()
  .bootstrapModule(AppModule)
  .catch((e) => console.error(e));
```

**迁移后：**

```ts [./app/app.module.ts]
// 该文件已不存在！
```

```ts [./app/app.ts]
@Component({
  selector: 'app',
  template: 'hello',
})
export class App {}
```

```ts [./main.ts]
import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';

bootstrapApplication(App).catch((e) => console.error(e));
```

## 常见问题

一些可能导致原理图无法正常工作的常见问题包括：

- 编译错误：如果项目存在编译错误，Angular 就无法正确地分析和迁移它。
- 文件未包含在 tsconfig 中：原理图通过分析项目的 `tsconfig.json` 文件来确定要迁移哪些文件。任何未被 tsconfig 包含的文件都会被原理图排除。
- 无法静态分析的代码：原理图使用静态分析来理解你的代码并确定在哪里进行修改。对于元数据无法在构建时静态分析的类，迁移可能会跳过它们。

## 局限性

由于此迁移的规模和复杂性，有些情况是原理图无法处理的：

- 由于单元测试不会进行预先（AoT）编译，在单元测试中为组件添加的 `imports` 可能并不完全正确。
- 原理图依赖于对 Angular API 的直接调用，无法识别对 Angular API 的自定义包装。例如，如果你定义了一个包装 `TestBed.configureTestingModule` 的自定义 `customConfigureTestModule` 函数，那么它所声明的组件可能无法被识别。
