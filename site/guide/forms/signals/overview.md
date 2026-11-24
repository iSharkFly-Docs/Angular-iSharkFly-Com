# 使用 Angular 信号构建表单 {#forms-with-angular-signals}




信号表单（Signal Forms）是一个库，它构建在信号（Signal）的响应式基础之上，用于管理 Angular 应用中的表单状态。借助自动的双向绑定（Two-way Binding）、类型安全的字段访问以及基于 schema 的验证，信号表单可以帮你构建健壮的表单。

::: tip 提示
如需快速了解信号表单，请参阅[信号表单基础指南](/essentials/signal-forms)。

:::

## 为什么选择信号表单？ {#why-signal-forms}

在 Web 应用中构建表单，需要处理多个相互关联的问题：跟踪字段值、验证用户输入、处理错误状态，以及让 UI 与数据模型保持同步。分别处理这些问题会产生大量样板代码，也会增加复杂度。

信号表单通过以下方式应对这些挑战：

- **自动同步状态** - 自动将表单数据模型与绑定的表单字段同步
- **提供类型安全** - 在 UI 控件与数据模型之间支持完全类型安全的 schema 和绑定
- **集中管理验证逻辑** - 使用验证 schema 在一处定义所有验证规则

信号表单最适合使用信号构建的新应用。如果你正在维护一个使用响应式表单（Reactive Forms）的现有应用，响应式表单依然是可靠的选择。

::: info 注意
如果你之前使用的是模板驱动表单或响应式表单，可能会对[对比指南](/guide/forms/signals/comparison)感兴趣。

:::

## 前提条件 {#prerequisites}

信号表单要求：

- Angular v21 或更高版本

## 设置 {#setup}

信号表单已经包含在 `@angular/forms` 包中。从 `@angular/forms/signals` 导入所需的函数和指令（Directive）：

```ts
import {form, FormField, required, email} from '@angular/forms/signals';
```

任何把表单字段绑定到 HTML 输入框的组件（Component），都必须导入 `FormField` 指令：

```ts
@Component({
  // ...
  imports: [FormField],
})
```

## 后续步骤 {#next-steps}

要进一步了解信号表单的工作原理，请查看以下指南：

- [信号表单基础](/essentials/signal-forms)
- [表单模型](/guide/forms/signals/models)
- [设计表单模型](/guide/forms/signals/model-design)
- [字段状态管理](/guide/forms/signals/field-state-management)
- [验证](/guide/forms/signals/validation)
- [自定义控件](/guide/forms/signals/custom-controls)
- [与其他表单系统的对比](/guide/forms/signals/comparison)

