# 使用 Web Worker 进行后台处理

[Web Worker](https://developer.mozilla.org/docs/Web/API/Web_Workers_API) 让你可以在后台线程中运行 CPU 密集型计算，从而释放主线程来更新用户界面。
执行大量计算的应用（例如生成计算机辅助设计 \(CAD\) 图纸或进行繁重的几何计算）可以使用 Web Worker 来提升性能。

::: tip 提示
Angular CLI 本身不支持在 Web Worker 中运行。

:::

## 添加 Web Worker

要为现有项目添加 Web Worker，请使用 Angular CLI 的 `ng generate` 命令。

```shell
ng generate web-worker <location>
```

你可以在应用中的任何位置添加 Web Worker。
例如，要为根组件 `src/app/app.ts` 添加 Web Worker，请运行以下命令。

```shell
ng generate web-worker app
```

该命令会执行以下操作。

1. 将项目配置为使用 Web Worker（如果尚未配置）。
1. 将以下脚手架代码添加到 `src/app/app.worker.ts`，用于接收消息。

   ```ts [src/app/app.worker.ts]
   addEventListener('message', ({data}) => {
     const response = `worker response to ${data}`;
     postMessage(response);
   });
   ```

1. 将以下脚手架代码添加到 `src/app/app.ts`，用于使用该 Worker。

   ```ts [src/app/app.ts]
   if (typeof Worker !== 'undefined') {
     // 创建一个新的
     const worker = new Worker(new URL('./app.worker', import.meta.url));
     worker.onmessage = ({data}) => {
       console.log(`page got message: ${data}`);
     };
     worker.postMessage('hello');
   } else {
     // 当前环境不支持 Web Worker。
     // 你应该添加一个后备方案，以便程序仍能正确执行。
   }
   ```

创建这个初始脚手架之后，你必须重构代码，通过与 Worker 之间收发消息来使用 Web Worker。

::: warning 重要
某些环境或平台（例如在 [服务端渲染](/guide/ssr) 中使用的 `@angular/platform-server`）不支持 Web Worker。

:::

为确保应用能在这些环境中正常工作，你必须提供一种后备机制，来执行原本由 Worker 完成的计算。
