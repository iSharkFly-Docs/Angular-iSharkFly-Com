# Angular 库概览

许多应用都需要解决相同的通用问题，比如呈现统一的用户界面、展示数据以及支持数据录入。
开发者可以为特定领域创建通用的解决方案，并在不同的应用中加以调整和复用。
这样的解决方案可以构建为 Angular _库_，并作为 _npm 包_ 发布和共享。

Angular 库也是一种 Angular 项目，它与应用的区别在于它无法独立运行。
库必须被导入到应用中才能使用。

库扩展了 Angular 的基础功能。
例如，要为应用添加 [响应式表单（Reactive Forms）](/guide/forms/reactive-forms)，可以用 `ng add @angular/forms` 添加该库包，然后在应用代码中从 `@angular/forms` 库导入 `ReactiveFormsModule`。
同样，为 Angular 应用添加 [Service Worker](/ecosystem/service-workers) 库，是把应用变成 [渐进式 Web 应用](https://developers.google.com/web/progressive-web-apps)（PWA）的步骤之一。
[Angular Material](https://material.angular.dev) 就是一个大型通用库的例子，它提供了精致、可复用且适应性强的 UI 组件。

任何应用开发者都可以使用这些库，以及其他由 Angular 团队或第三方以 npm 包形式发布的库。
参阅 [使用已发布的库](/tools/libraries/using-libraries)。

::: tip 提示
库是供 Angular 应用使用的。如果要为非 Angular 的 Web 应用添加 Angular 功能，请使用 [Angular 自定义元素](/guide/elements)。

:::

## 创建库

如果你开发了适合复用的功能，就可以创建自己的库。
这些库可以在工作区中本地使用，也可以作为 [npm 包](/reference/configs/npm-packages) 发布，与其他项目或其他 Angular 开发者共享。
这些包可以发布到 npm 注册表、私有的 npm Enterprise 注册表，或任何支持 npm 包的私有包管理系统。
参阅 [创建库](/tools/libraries/creating-libraries)。

决定是否把功能打包成库是一项架构决策，就像决定某个功能应该是组件（Component）还是服务（Service），或者决定组件的作用范围一样。

把功能打包成库，会迫使库中的各个部分与应用的业务逻辑解耦。
这有助于避免各种不良实践或架构错误，这些问题会让将来解耦和复用代码变得困难。

把代码放进单独的库，比把所有东西都放在一个应用里要复杂。
它需要你在管理、维护和更新库上投入更多的时间和精力。
当这个库被多个应用使用时，这些复杂性就会带来回报。
