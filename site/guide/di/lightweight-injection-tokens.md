# 使用轻量级注入令牌优化客户端应用体积 {#optimizing-client-application-size-with-lightweight-injection-tokens}

本页从概念上介绍一种推荐给库开发者的依赖注入（Dependency Injection）技术。
使用*轻量级注入令牌*来设计你的库，有助于优化使用你的库的客户端应用的包（Bundle）体积。

你可以借助可摇树优化（Tree-shaking）的提供者（Provider）来管理组件（Component）和可注入服务（Service）之间的依赖结构，从而优化包体积。
这通常可以确保：如果某个被提供的组件或服务从未被应用实际使用，编译器就能把它的代码从包中移除。

由于 Angular 存储注入令牌（Injection Token）的方式，这类未使用的组件或服务仍有可能最终出现在包中。
本页介绍一种依赖注入设计模式，它通过使用轻量级注入令牌来支持正确的摇树优化。

轻量级注入令牌设计模式对库开发者尤为重要。
它可以确保当应用只使用了你的库的部分功能时，未使用的代码能够从客户端应用的包中被剔除。

当应用使用你的库时，你的库所提供的某些服务可能并不会被客户端应用用到。
在这种情况下，应用开发者会期望该服务被摇树优化掉，而不会增加编译后应用的体积。
由于应用开发者无法得知或修复库中的摇树优化问题，因此这是库开发者的责任。
为了避免保留未使用的组件，你的库应当使用轻量级注入令牌设计模式。

## 令牌何时会被保留 {#when-tokens-are-retained}

为了更好地解释令牌保留发生的条件，我们来看一个提供库卡片组件的库。
该组件包含一个主体，并且可以包含一个可选的头部：

```html
<lib-card>
  <lib-header>…</lib-header>
</lib-card>
```

在一种常见的实现中，`<lib-card>` 组件会使用 `contentChild` 或 `contentChildren` 来获取 `<lib-header>` 和 `<lib-body>`，如下所示：

```ts
import {Component, contentChild} from '@angular/core';

@Component({
  selector: 'lib-header',
  …,
})
class LibHeader {}

@Component({
  selector: 'lib-card',
  …,
})
class LibCard {
  readonly header = contentChild(LibHeader);
}
```

由于 `<lib-header>` 是可选的，该元素可以以最简形式 `<lib-card />` 出现在模板（Template）中。
在这种情况下，`<lib-header>` 并未被使用，你可能会期望它被摇树优化掉，但实际上并非如此。
这是因为 `LibCard` 实际上包含了两处对 `LibHeader` 的引用：

```ts
readonly header = contentChild(LibHeader);
```

- 其中一处引用位于*类型位置*——也就是说，它把 `LibHeader` 指定为类型：`readonly header: Signal<LibHeader|undefined>`。
- 另一处引用位于*值位置*——也就是说，`LibHeader` 是传给 `contentChild` 函数的值：`contentChild(LibHeader)`。

编译器对这两种位置上的令牌引用的处理方式不同：

- 编译器在从 TypeScript 转换后会擦除*类型位置*的引用，因此它们不会影响摇树优化。
- 编译器必须在运行时保留*值位置*的引用，这会**阻止**该组件被摇树优化掉。

在这个例子中，编译器保留了出现在值位置上的 `LibHeader` 令牌。
这会阻止所引用的组件被摇树优化掉，即使应用实际上没有在任何地方使用 `<lib-header>`。
如果 `LibHeader` 的代码、模板和样式加起来体积过大，那么不必要地包含它会显著增加客户端应用的体积。

## 何时使用轻量级注入令牌模式 {#when-to-use-the-lightweight-injection-token-pattern}

当组件被用作注入令牌时，就会出现摇树优化问题。
有两种情况会导致这种情况：

- 令牌被用在[内容查询（Content Query）](/guide/components/queries#content-queries)的值位置上。
- 令牌与 `inject` 函数一起使用。

在下面的例子中，对 `CustomOther` 令牌的两处使用都会导致 `CustomOther` 被保留，使其在未被使用时也无法被摇树优化掉：

```ts
class App {
  private readonly other = inject(CustomOther, {optional: true});

  readonly header = contentChild(CustomOther);
}
```

虽然仅用作类型说明符的令牌在转换为 JavaScript 时会被移除，但所有用于依赖注入的令牌在运行时都是必需的。
使用 `inject(CustomOther)` 时，`CustomOther` 是作为值参数传入的。
此时令牌处于值位置，这会导致摇树优化器保留该引用。

::: tip 提示
库应当为所有服务使用[可摇树优化的提供者](/guide/di/defining-dependency-providers)，在根级别提供依赖，而不是在组件或模块中提供。

:::

## 使用轻量级注入令牌 {#using-lightweight-injection-tokens}

轻量级注入令牌设计模式的做法是：使用一个小型抽象类作为注入令牌，并在稍后的阶段提供实际的实现。
这个抽象类会被保留，不会被摇树优化掉，但它很小，对应用体积没有实质影响。

下面的例子展示了如何对 `LibHeader` 应用这一模式：

```ts
abstract class LibHeaderToken {}

@Component({
  selector: 'lib-header',
  providers: [{provide: LibHeaderToken, useExisting: LibHeader}],
  …,
})
class LibHeader extends LibHeaderToken {}

@Component({
  selector: 'lib-card',
  …,
})
class LibCard {
  readonly header = contentChild(LibHeaderToken);
}
```

在这个例子中，`LibCard` 的实现无论在类型位置还是值位置上都不再引用 `LibHeader`。
这使得 `LibHeader` 可以被完全摇树优化掉。
`LibHeaderToken` 会被保留，但它只是一个类声明，没有具体实现。
它很小，在编译后被保留也不会对应用体积产生实质影响。

而 `LibHeader` 本身实现了抽象类 `LibHeaderToken`。
你可以安全地在组件定义中把该令牌用作提供者，让 Angular 能够正确地注入具体类型。

总而言之，轻量级注入令牌模式由以下几部分组成：

1. 一个以抽象类表示的轻量级注入令牌。
2. 一个实现该抽象类的组件定义。
3. 使用 `contentChild` 或 `contentChildren` 注入这个轻量级令牌。
4. 在轻量级注入令牌的实现中提供一个提供者，把轻量级注入令牌与该实现关联起来。

### 使用轻量级注入令牌来定义 API {#use-the-lightweight-injection-token-for-api-definition}

注入了轻量级注入令牌的组件可能需要调用被注入类中的某个方法。
此时令牌是一个抽象类。由于可注入组件实现了该类，你还必须在这个抽象的轻量级注入令牌类中声明一个抽象方法。
该方法的实现及其全部代码开销都位于可被摇树优化掉的可注入组件中。
这让父组件能够以类型安全的方式与子组件（如果存在的话）进行通信。

例如，`LibCard` 现在查询的是 `LibHeaderToken` 而不是 `LibHeader`。
下面的例子展示了这一模式如何让 `LibCard` 在不实际引用 `LibHeader` 的情况下与 `LibHeader` 通信：

```ts
abstract class LibHeaderToken {
  abstract doSomething(): void;
}

@Component({
  selector: 'lib-header',
  providers: [{provide: LibHeaderToken, useExisting: LibHeader}],
})
class LibHeader extends LibHeaderToken {
  doSomething(): void {
    // `doSomething` 的具体实现
  }
}

@Component({
  selector: 'lib-card',
})
class LibCard implements AfterContentInit {
  readonly header = contentChild(LibHeaderToken);

  ngAfterContentInit(): void {
    if (this.header() !== undefined) {
      this.header()!.doSomething();
    }
  }
}
```

在这个例子中，父组件通过查询令牌来获取子组件，并在子组件存在时保存所得到的组件引用。
在调用子组件中的方法之前，父组件会先检查子组件是否存在。
如果子组件已被摇树优化掉，就不会存在对它的运行时引用，也不会调用它的方法。

### 为轻量级注入令牌命名 {#naming-your-lightweight-injection-token}

轻量级注入令牌只对组件有用。
[Angular 风格指南](/style-guide)建议组件命名时不带 `Component` 后缀。
示例中的 `LibHeader` 就遵循了这一约定。

你应当在保持组件与其令牌之间关联的同时，仍能把二者区分开来。
推荐的做法是使用组件的基础名称加上 `Token` 后缀来命名轻量级注入令牌：`LibHeaderToken`。
