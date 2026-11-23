# 依赖注入

在应用和测试中复用代码并控制行为。


当你需要在组件（Component）之间共享逻辑时，Angular 利用[依赖注入（Dependency Injection）](/guide/di)设计模式，让你可以创建一个「服务（Service）」，从而将代码注入到组件中，同时从单一事实来源对其进行管理。

## 什么是服务？

服务是可以被注入的可复用代码片段。

与定义组件类似，服务由以下部分组成：

- 一个 **TypeScript 装饰器**，通过 `@Service` 将该类声明为 Angular 服务，并让你定义一个可以在应用中任何地方访问的服务。
- 一个 **TypeScript 类**，定义服务被注入后可供访问的代码

下面是一个 `Calculator` 服务的示例。

```ts
import {Service} from '@angular/core';

@Service()
export class Calculator {
  add(x: number, y: number) {
    return x + y;
  }
}
```

## 如何使用服务

当你想在组件中使用某个服务时，你需要：

1. 导入该服务
2. 声明一个用于注入该服务的类字段。将该类字段赋值为调用内置函数 [`inject`](https://angular.dev/api/core/inject) 的结果，该函数会创建服务

下面是它在 `Receipt` 组件中的样子：

```ts
import {Component, inject} from '@angular/core';
import {Calculator} from './calculator';

@Component({
  selector: 'app-receipt',
  template: `<h1>The total is {{ totalCost }}</h1>`,
})
export class Receipt {
  private calculator = inject(Calculator);
  totalCost = this.calculator.add(50, 25);
}
```

在这个示例中，通过调用 Angular 函数 [`inject`](https://angular.dev/api/core/inject) 并将服务传入其中来使用 `Calculator`。

## 下一步

- [基础知识之后的后续步骤](/essentials/next-steps)
- [深入依赖注入指南](/guide/di)

