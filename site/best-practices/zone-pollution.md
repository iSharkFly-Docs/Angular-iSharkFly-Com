# 解决 Zone 污染 {#resolving-zone-pollution}

**Zone.js** 是 Angular 用来检测应用状态可能发生变化的一种通知机制。它会捕获 `setTimeout`、网络请求和事件监听器等异步操作。Angular 根据 Zone.js 发出的信号来调度变更检测（Change Detection）。

在某些情况下，被调度的[任务](https://developer.mozilla.org/docs/Web/API/HTML_DOM_API/Microtask_guide#tasks)或[微任务](https://developer.mozilla.org/docs/Web/API/HTML_DOM_API/Microtask_guide#microtasks)并不会改变数据模型，因此运行变更检测是多余的。常见的例子有：

- `requestAnimationFrame`、`setTimeout` 或 `setInterval`
- 第三方库调度的任务或微任务

本节介绍如何识别这类情况，以及如何在 Angular zone 之外运行代码，以避免不必要的变更检测调用。

## 识别不必要的变更检测调用 {#identifying-unnecessary-change-detection-calls}

你可以使用 Angular DevTools 检测不必要的变更检测调用。它们通常在性能分析器的时间线上表现为一串连续的柱条，来源是 `setTimeout`、`setInterval`、`requestAnimationFrame` 或某个事件处理器。如果你的应用本身很少调用这些 API，那么这些变更检测通常是由第三方库引起的。

<img alt="Angular DevTools profiler preview showing Zone pollution" src="/assets/images/best-practices/runtime-performance/zone-pollution.png">

在上图中，有一系列变更检测调用是由某个元素上的事件处理器触发的。在使用第三方的、非 Angular 原生的组件时，这是一个常见的难题，因为这些组件不会改变 `NgZone` 的默认行为。

## 在 `NgZone` 之外运行任务 {#run-tasks-outside-ngzone}

在这种情况下，你可以使用 [NgZone](https://angular.dev/api/core/NgZone) 告诉 Angular：对某段代码调度的任务，不要调用变更检测。

```ts [Run outside of the Zone]
import { Component, NgZone, OnInit, inject } from '@angular/core';

@Component(...)
class App implements OnInit {
  private ngZone = inject(NgZone);

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => setInterval(pollForUpdates, 500));
  }
}
```

上面的代码让 Angular 在 Angular Zone 之外调用 `setInterval`，并在 `pollForUpdates` 运行之后跳过变更检测。

如果在 Angular zone 内调用第三方库的 API，这些库常常会触发不必要的变更检测周期。这种现象对那些会设置事件监听器或启动其他任务（例如定时器、XHR 请求等）的库影响尤其明显。在 Angular zone 之外调用这些库的 API，就可以避免这些额外的周期：

```ts [Move the plot initialization outside of the Zone]
import { Component, NgZone, OnInit, inject } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';

@Component(...)
class App implements OnInit {
  private ngZone = inject(NgZone);

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      Plotly.newPlot('chart', data);
    });
  }
}
```

在 `runOutsideAngular` 中运行 `Plotly.newPlot('chart', data);`，等于告诉框架：初始化逻辑所调度的任务执行完之后，不要运行变更检测。

例如，如果 `Plotly.newPlot('chart', data)` 给某个 DOM 元素添加了事件监听器，那么这些监听器的处理函数执行之后，Angular 不会运行变更检测。

但有时你可能需要监听第三方 API 派发的事件。这时要记住：如果初始化逻辑是在 Angular zone 之外执行的，那么这些事件监听器也会在 Angular zone 之外执行：

```ts [Check whether the handler is called outside of the Zone]
import { Component, NgZone, OnInit, output, inject } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';

@Component(...)
class App implements OnInit {
  private ngZone = inject(NgZone);

  plotlyClick = output<Plotly.PlotMouseEvent>();

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.createPlotly();
    });
  }

  private async createPlotly() {
    const plotly = await Plotly.newPlot('chart', data);

    plotly.on('plotly_click', (event: Plotly.PlotMouseEvent) => {
      // 这个处理函数会在 Angular zone 之外被调用，因为
      // 初始化逻辑也是在 zone 之外调用的。要检查
      // 当前是否处于 Angular zone 中，可以这样调用：
      console.log(NgZone.isInAngularZone());
      this.plotlyClick.emit(event);
    });
  }
}
```

如果你需要向父组件派发事件并执行特定的视图更新逻辑，就应该考虑重新进入 Angular zone，让框架运行变更检测，或者手动运行变更检测：

```ts [Re-enter the Angular zone when dispatching event]
import { Component, NgZone, OnInit, output, inject } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';

@Component(...)
class App implements OnInit {
  private ngZone = inject(NgZone);

  plotlyClick = output<Plotly.PlotMouseEvent>();

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.createPlotly();
    });
  }

  private async createPlotly() {
    const plotly = await Plotly.newPlot('chart', data);

    plotly.on('plotly_click', (event: Plotly.PlotMouseEvent) => {
      this.ngZone.run(() => {
        this.plotlyClick.emit(event);
      });
    });
  }
}
```

也可能出现在 Angular zone 之外派发事件的情况。要记住，触发变更检测（例如手动触发）可能会导致在 Angular zone 之外创建或更新视图。
