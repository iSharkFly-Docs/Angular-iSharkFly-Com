# 创建可注入的服务 {#creating-an-injectable-service}

Angular 中的依赖注入（Dependency Injection，DI）是该框架最强大的特性之一。你可以把依赖注入理解为 Angular 在运行时为应用 _提供_ 所需资源的能力。依赖可以是一个服务（Service），也可以是其他资源。

::: info 注意
在[基础指南中了解更多关于依赖注入的内容](/essentials/dependency-injection)。

:::

在本活动中，你将学习如何创建一个 `injectable`（可注入的）服务。

<hr>

服务的一种用途是作为与数据和 API 交互的途径。为了让服务可复用，应当把逻辑放在服务中，并在需要时在整个应用中共享它。

要让一个类能够被 DI 系统注入，请使用 `@Service` 装饰器。例如：

```ts
@Service()
class UserService {
  // 获取并返回数据的方法
}
```

`@Service` 装饰器把该类标记为服务，并告知 DI 系统 `UserService` 可以在应用中的任何地方访问。默认情况下，Angular 会在整个应用范围内提供该服务，因此你无需编写任何额外的配置。

::: info 注意
默认情况下，`@Service` 会在根注入器（Injector）中提供该类。如果你想手动提供它，例如将其作用域限定在某个特定的路由或组件（Component）上，请设置 `autoProvided: false`。在[创建和使用服务指南](/guide/di/creating-and-using-services#using-the-service-vs-injectable-decorator)中了解更多。

:::

好了，轮到你来试试：



### 1. 添加 `@Service` 装饰器 {#_1-add-the-service-decorator}

更新 `car.service.ts` 中的代码，为 `CarService` 类添加 `@Service()` 装饰器。

::: tip 提示
参考上面的示例找到正确的语法。

:::




干得好 👍 这个服务现在已经是 `injectable` 的了，可以参与到这场乐趣中。既然服务已经可注入，接下来我们试着把它注入到组件中 👉
