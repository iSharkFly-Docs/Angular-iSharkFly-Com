---
title: API 参考
---

# API 参考 {#api-参考}

Angular API 参考文档。

## 核心包 {#核心包}

### @angular/core {#angular-core}

Angular 核心框架功能。

- `Component` - 组件装饰器
- `Directive` - 指令装饰器
- `Injectable` - 可注入服务装饰器
- `NgModule` - 模块装饰器
- `Input` / `Output` - 组件输入输出
- `ViewChild` / `ContentChild` - 视图/内容查询

### @angular/common {#angular-common}

常用功能模块。

- `CommonModule` - 通用模块
- `NgIf` / `NgFor` / `NgSwitch` - 内置结构型指令
- `DatePipe` / `DecimalPipe` / `CurrencyPipe` - 内置管道

### @angular/forms {#angular-forms}

表单处理模块。

- `FormsModule` - 模板驱动表单
- `ReactiveFormsModule` - 响应式表单
- `FormControl` / `FormGroup` / `FormArray` - 表单控件

### @angular/router {#angular-router}

路由模块。

- `RouterModule` - 路由模块
- `Routes` - 路由配置
- `RouterOutlet` - 路由出口
- `RouterLink` - 路由链接

### @angular/platform-browser {#angular-platform-browser}

浏览器平台支持。

- `BrowserModule` - 浏览器模块
- `DomSanitizer` - DOM 安全处理

### @angular/platform-browser-dynamic {#angular-platform-browser-dynamic}

JIT 编译支持。

- `platformBrowserDynamic` - 动态平台引导
