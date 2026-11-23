# 延迟加载服务

::: warning 重要
要让延迟加载生效，被加载的服务必须是自动提供的。请用 `@Injectable({providedIn: 'root'})` 或 [`@Service()`](/guide/di/creating-and-using-services#using-the-service-vs-injectable-decorator) 装饰它。如果不是自动提供的，Angular 就无法在服务加载完成后构造它。

:::

Angular 的 `injectAsync` 函数让你可以按需加载服务，只在真正需要时才加载。如果某个服务依赖大型库或很少使用的功能，而你不想在初始页面加载时为它付出代价，这个函数就很有用。

使用 `injectAsync` 时，打包工具会把服务的代码拆分到单独的 JavaScript 代码块中，并在你第一次请求实例时下载。加载完成后，Angular 会通过常规的依赖注入（Dependency Injection）系统解析该服务，因此它仍然可以依赖其他可注入对象，表现也与其他单例一样。

## 延迟注入服务

假设有一个依赖重量级电子表格库的 `ReportExporter`。大多数用户会打开报表，但只有少数人会点击 **Export**。可以按需加载这个导出器：

```ts
import {Component, injectAsync} from '@angular/core';

@Component({
  selector: 'app-report',
  template: `<button (click)="export()">Export</button>`,
})
export class Report {
  private exporter = injectAsync(() => import('./report-exporter').then((m) => m.ReportExporter));

  async export() {
    const exporter = await this.exporter();
    exporter.export();
  }
}
```

第一次调用 `this.exporter()` 时会触发动态导入，并从依赖注入中解析出该服务。之后的调用会复用同一个 Promise，因此代码块只会被获取一次。

如果延迟加载的服务是[默认导出](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export)，可以直接传入动态导入，Angular 会替你取出 `default`：

```ts [report-exporter.ts]
@Service()
export default class ReportExporter {
  /* … */
}
```

```ts [report.ts]
private exporter = injectAsync(() => import('./report-exporter'));
```

## 预取依赖

默认情况下，只有在调用返回的函数时才会获取延迟加载的代码块。你可以在选项中传入 `prefetch` 触发器，提前开始下载。触发器是任何返回 `Promise` 的函数，当这个 Promise 解析时，Angular 就会启动加载器。

Angular 自带了 `onIdle`，这是一个内置触发器，会等到浏览器空闲时才触发：

```ts
import {Component, injectAsync, onIdle} from '@angular/core';

@Component({/* … */})
export class Report {
  private exporter = injectAsync(() => import('./report-exporter').then((m) => m.ReportExporter), {
    prefetch: onIdle,
  });
}
```

你还可以给 `onIdle` 配置一个最长等待时间，这样即使在繁忙的页面上，预取也总会在已知的时间窗口内发生：

```ts
injectAsync(loader, {prefetch: () => onIdle({timeout: 1_000})});
```

::: info 注意
预取是尽力而为的。如果用户在预取触发之前就使用了该功能，Angular 仍然会立即加载依赖，并在依赖就绪后立刻让你的 `await` 得到结果。

:::

## 提供自定义预取触发器

`PrefetchTrigger` 只是一个返回 Promise 的函数，Promise 一旦解析，加载器就会运行。你可以借此让预取与你自己的信号对齐，比如鼠标悬停或调度器的某次 tick：

```ts
import {PrefetchTrigger} from '@angular/core';

export function onHover(target: HTMLElement): PrefetchTrigger {
  return () =>
    new Promise<void>((resolve) => {
      target.addEventListener('pointerenter', () => resolve(), {once: true});
    });
}
```
