# NgModules

::: warning 重要
Angular 团队建议所有新代码都使用[独立组件](/guide/components)（Standalone Component）而不是 `NgModule`。本指南可以帮助你理解使用 `@NgModule` 构建的现有代码。

:::

NgModule 是一个带有 `@NgModule` 装饰器的类。这个装饰器接受*元数据*，告诉 Angular 如何编译组件（Component）模板（Template）以及如何配置依赖注入（Dependency Injection）。

```ts
import {NgModule} from '@angular/core';

@NgModule({
  // 元数据写在这里
})
export class CustomMenuModule {}
```

NgModule 有两项主要职责：

- 声明属于该 NgModule 的组件、指令（Directive）和管道（Pipe）
- 为导入该 NgModule 的组件、指令和管道向注入器（Injector）添加提供者（Provider）

## 声明

`@NgModule` 元数据中的 `declarations` 属性用于声明属于该 NgModule 的组件、指令和管道。

```ts
@NgModule({
  /* ... */
  // CustomMenu 和 CustomMenuItem 是组件。
  declarations: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule {}
```

在上面的示例中，`CustomMenu` 和 `CustomMenuItem` 这两个组件属于 `CustomMenuModule`。

`declarations` 属性还接受由组件、指令和管道组成的*数组*。这些数组中还可以再包含其他数组。

```ts
const MENU_COMPONENTS = [CustomMenu, CustomMenuItem];
const WIDGETS = [MENU_COMPONENTS, CustomSlider];

@NgModule({
  /* ... */
  // 这个 NgModule 声明了 CustomMenu、CustomMenuItem、
  // CustomSlider 和 CustomCheckbox。
  declarations: [WIDGETS, CustomCheckbox],
})
export class CustomMenuModule {}
```

如果 Angular 发现某个组件、指令或管道在多个 NgModule 中被声明，就会报告错误。

任何组件、指令或管道都必须显式标记为 `standalone: false`，才能在 NgModule 中声明。

```ts
@Component({
  // 把这个组件标记为 `standalone: false`，以便在 NgModule 中声明它。
  standalone: false,
  /* ... */
})
export class CustomMenu {
  /* ... */
}
```

### imports

在 NgModule 中声明的组件可能依赖其他组件、指令和管道。请把这些依赖添加到 `@NgModule` 元数据的 `imports` 属性中。

```ts
@NgModule({
  /* ... */
  // CustomMenu 和 CustomMenuItem 依赖 PopupTrigger 和 SelectorIndicator 组件。
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule {}
```

`imports` 数组既接受其他 NgModule，也接受独立的组件、指令和管道。

### exports

NgModule 可以*导出*它所声明的组件、指令和管道，让其他组件和 NgModule 也能使用它们。

```ts
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // 让导入 CustomMenuModule 的组件和 NgModule
  // 可以使用 CustomMenu 和 CustomMenuItem。
  exports: [CustomMenu, CustomMenuItem],
})
export class CustomMenuModule {}
```

不过，`exports` 属性并不限于导出自己的声明。NgModule 还可以导出它所导入的任何其他组件、指令、管道和 NgModule。

```ts
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // 同样让导入 CustomMenuModule 的任何组件或 NgModule 都可以使用 PopupTrigger。
  exports: [CustomMenu, CustomMenuItem, PopupTrigger],
})
export class CustomMenuModule {}
```

## `NgModule` 提供者

::: tip 提示
有关依赖注入和提供者的信息，请参阅[依赖注入指南](/guide/di)。

:::

`NgModule` 可以为注入的依赖指定 `providers`。这些提供者可供以下对象使用：

- 导入该 NgModule 的任何独立组件、指令或管道，以及
- 导入该 NgModule 的任何*其他* NgModule 的 `declarations` 和 `providers`。

```ts
@NgModule({
  imports: [PopupTrigger, SelectionIndicator],
  declarations: [CustomMenu, CustomMenuItem],

  // 提供 OverlayManager 服务
  providers: [OverlayManager],
  /* ... */
})
export class CustomMenuModule {}

@NgModule({
  imports: [CustomMenuModule],
  declarations: [UserProfile],
  providers: [UserDataClient],
})
export class UserProfileModule {}
```

在上面的示例中：

- `CustomMenuModule` 提供了 `OverlayManager`。
- `CustomMenu` 和 `CustomMenuItem` 组件可以注入 `OverlayManager`，因为它们是在 `CustomMenuModule` 中声明的。
- `UserProfile` 可以注入 `OverlayManager`，因为它的 NgModule 导入了 `CustomMenuModule`。
- `UserDataClient` 可以注入 `OverlayManager`，因为它的 NgModule 导入了 `CustomMenuModule`。

### `forRoot` 和 `forChild` 模式

有些 NgModule 定义了一个静态的 `forRoot` 方法，它接受一些配置并返回一个提供者数组。「`forRoot`」这个名字是一种约定，表示这些提供者只应在启动期间添加到应用的*根*上。

以这种方式包含的任何提供者都会被立即加载（eagerly loaded），从而增加初始页面加载时 JavaScript 包（bundle）的体积。

```ts
bootstrapApplication(MyApplicationRoot, {
  providers: [CustomMenuModule.forRoot(/* 一些配置 */)],
});
```

同样，有些 NgModule 可能会定义一个静态的 `forChild`，表示这些提供者应添加到应用层级结构中的组件上。

```ts
@Component({
  /* ... */
  providers: [CustomMenuModule.forChild(/* 一些配置 */)],
})
export class UserProfile {
  /* ... */
}
```

## 启动应用

::: warning 重要
Angular 团队建议所有新代码都使用 [bootstrapApplication](https://angular.dev/api/platform-browser/bootstrapApplication) 而不是 `bootstrapModule`。本指南可以帮助你理解使用 `@NgModule` 启动的现有应用。

:::

`@NgModule` 装饰器接受一个可选的 `bootstrap` 数组，其中可以包含一个或多个组件。

你可以使用 [`platformBrowser`](https://angular.dev/api/platform-browser/platformBrowser) 或 [`platformServer`](https://angular.dev/api/platform-server/platformServer) 中的 [`bootstrapModule`](https://angular.dev/api/core/PlatformRef#bootstrapModule) 方法来启动 Angular 应用。运行时，该函数会在页面上查找与所列组件的 CSS 选择器（Selector）相匹配的元素，并在页面上渲染这些组件。

```ts
import {platformBrowser} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

@NgModule({
  declarations: [MyApplication],
  bootstrap: [MyApplication],
})
export class MyApplicationModule {}

platformBrowser().bootstrapModule(MyApplicationModule);
```

`bootstrap` 中列出的组件也必须在该 NgModule 的 `declarations` 中声明。

当你从 NgModule 启动应用时，这个模块收集到的 `providers` 以及它所有 `imports` 中的 `providers` 都会被立即加载，并可供整个应用注入使用。
