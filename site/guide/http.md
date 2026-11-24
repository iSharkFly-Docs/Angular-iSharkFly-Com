# 了解如何使用 HTTP 与后端服务通信 {#understanding-communication-with-backend-services-using-http}

大多数前端应用都需要通过 HTTP 协议与服务器通信，以下载或上传数据，以及访问其他后端服务。Angular 为 Angular 应用提供了一套客户端 HTTP API，也就是 `@angular/common/http` 中的 `HttpClient` 服务（Service）类。

## HTTP 客户端服务的功能 {#http-client-service-features}

HTTP 客户端（HTTP client）服务提供以下主要功能：

- 请求[带类型的响应值](/guide/http/making-requests#fetching-json-data)
- 精简的[错误处理](/guide/http/making-requests#handling-request-failure)
- 请求和响应的[拦截](/guide/http/interceptors)
- 强大的[测试工具](/guide/http/testing)

## 下一步 {#what-s-next}

- [设置 HttpClient](/guide/http/setup)
- [发起 HTTP 请求](/guide/http/making-requests)

