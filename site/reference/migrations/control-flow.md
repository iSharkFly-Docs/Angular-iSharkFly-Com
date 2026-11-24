# 迁移到控制流语法 {#migration-to-control-flow-syntax}

[控制流（Control Flow）语法](/guide/templates/control-flow) 从 Angular v17 开始可用。新语法直接内置在模板中，因此你不再需要导入 `CommonModule`。

此原理图（Schematic）会把应用中所有现有代码迁移为使用新的控制流语法。

使用以下命令运行该原理图：

```shell
ng generate @angular/core:control-flow
```

## 配置选项 {#configuration-options}

此迁移支持一些选项，可以根据你的具体需求进行微调。

### `--path` {#path}

默认情况下，此迁移会更新整个 Angular CLI 工作区（workspace）。
你可以使用此选项把迁移限制在某个特定的子目录中。

### `--format` {#format}

默认情况下，此迁移会重新格式化它所修改的模板。
禁用此选项可以保留现有的模板格式。

## 破坏性变更 {#breaking-changes}

### `@for` 视图复用 {#for-view-reuse}

如果 `@for` 块的 `track` 表达式中用到的某个属性发生了变化，但对象引用保持不变（原地修改），Angular 会更新该视图的绑定（包括组件输入），而不是销毁并重新创建该元素。

这与 `*ngFor` 不同：在类似场景下，如果 `trackBy` 函数返回了不同的值，`*ngFor` 会重新挂载（销毁并重新创建）该元素。
