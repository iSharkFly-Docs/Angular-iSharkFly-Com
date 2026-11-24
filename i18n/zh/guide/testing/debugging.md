# 调试测试

如果测试的运行结果不符合预期，你可以在默认的 Node.js 环境中调试，也可以在真实的浏览器中调试。

## 在 Node.js 中调试

对于与浏览器专有 API 或渲染无关的问题，在默认的 Node.js 环境中调试通常是最快的诊断方式。

1.  带上 `--debug` 标志运行 `ng test` 命令：
    ```shell
    ng test --debug
    ```
2.  测试运行器会以调试模式启动，并等待调试器连接。
3.  现在你可以连接自己喜欢的调试器。例如，可以使用 VS Code 内置的 Node.js 调试器，或者用于 Node.js 的 Chrome DevTools。

## 在浏览器中调试

和在 Node 中启动调试会话的方式一样，在使用 Vitest 和[浏览器模式](/guide/testing/migrating-to-vitest#5-configure-browser-mode-optional)时，也可以给 `ng test` 加上 `--debug` 标志。

测试运行器会以调试模式启动，并等待你打开浏览器开发者工具来调试测试。
