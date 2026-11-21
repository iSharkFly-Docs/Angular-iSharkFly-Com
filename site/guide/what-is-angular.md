---
untranslated: true
title: 什么是 Angular
---

# 什么是 Angular

Angular 是一个基于 TypeScript 的开源 Web 应用框架，由 Google 的 Angular 团队以及社区共同维护。

## Angular 与 AngularJS

Angular 是对 AngularJS 的完全重写。两者有以下主要区别：

| 特性 | AngularJS | Angular |
|------|-----------|---------|
| 语言 | JavaScript | TypeScript |
| 架构 | MVC | 组件化 |
| 移动端 | 有限支持 | 原生支持 |
| 性能 | 较慢 | 更快 |

## 核心概念

### 组件

组件是 Angular 应用的基本构建块。每个组件包含：

- **模板** - 定义组件的视图
- **类** - 包含组件的逻辑
- **元数据** - 通过装饰器定义

```typescript
@Component({
  selector: 'app-hello',
  template: '<h1>Hello, {{name}}!</h1>'
})
export class HelloComponent {
  name = 'Angular';
}
```

### 模块

模块用于组织应用的功能块。

```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 服务和依赖注入

服务用于封装可复用的业务逻辑。

```typescript
@Injectable({
  providedIn: 'root'
})
export class DataService {
  getData() {
    return ['item1', 'item2'];
  }
}
```

## 下一步

- [搭建本地环境](/guide/setup-local)
- [架构概览](/guide/architecture)
