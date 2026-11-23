# 基于 inject 的依赖注入 {#inject-based-dependency-injection}

创建可注入的服务（Service）是 Angular 依赖注入（Dependency Injection，DI）系统的第一部分。那么如何把服务注入到组件（Component）中呢？Angular 提供了一个方便的函数 `inject()`，可以在适当的上下文中使用。

::: info 注意
注入上下文超出了本教程的范围，不过你可以在[依赖注入（DI）基础指南](/essentials/dependency-injection)和 [DI 上下文指南](/guide/di/dependency-injection-context)中了解更多。

:::

在本活动中，你将学习如何注入一个服务并在组件中使用它。

<hr>

用 DI 系统提供的值来初始化类属性通常很有用。示例如下：

```ts
@Component({...})
class PetCareDashboard {
  petRosterService = inject(PetRosterService);
}
```



### 1. 注入 `CarService` {#_1-inject-the-carservice}

在 `app.ts` 中，使用 `inject()` 函数注入 `CarService`，并将其赋值给一个名为 `carService` 的属性

::: info 注意
注意属性 `carService` 与类 `CarService` 之间的区别。

:::


### 2. 使用 `carService` 实例 {#_2-use-the-carservice-instance}

调用 `inject(CarService)` 会得到一个 `CarService` 的实例，它存储在 `carService` 属性中，你可以在应用中使用它。

用下面的实现来初始化 `display` 属性：

```ts
display = this.carService.getCars().join(' ⭐️ ');
```


### 3. 更新 `App` 模板 {#_3-update-the-app-template}

用下面的代码更新 `app.ts` 中的组件模板（Template）：

```ts
template: `<p>Car Listing: {{ display }}</p>`,
```




你刚刚把第一个服务注入到了组件中，表现太棒了。
