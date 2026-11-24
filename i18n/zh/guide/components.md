# 组件的结构




::: tip 提示
本指南假定你已经读过[基础指南](/essentials)。如果你刚接触 Angular，请先阅读它。

:::

每个组件（Component）都必须具备：

- 一个 TypeScript 类，包含诸如处理用户输入、从服务器获取数据之类的**行为**
- 一个 HTML 模板（Template），用于控制渲染到 DOM 中的内容
- 一个 [CSS 选择器（selector）](https://developer.mozilla.org/docs/Learn/CSS/Building_blocks/Selectors)，用于定义该组件在 HTML 中如何使用

你可以在 TypeScript 类上方添加 `@Component` [装饰器](https://www.typescriptlang.org/docs/handbook/decorators.html)，为组件提供 Angular 专属的信息：

```ts
@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
})
export class ProfilePhoto {}
```

关于编写 Angular 模板的完整细节（包括数据绑定、事件处理和控制流（control flow）），请参阅[模板指南](/guide/templates)。

传给 `@Component` 装饰器的对象称为组件的**元数据**。它包括 `selector`、`template` 以及本指南中介绍的其他属性。

组件还可以选择性地包含一组 CSS 样式，这些样式会应用到该组件的 DOM 上：

```ts
@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
  styles: `
    img {
      border-radius: 50%;
    }
  `,
})
export class ProfilePhoto {}
```

默认情况下，组件的样式只会影响该组件模板中定义的元素。关于 Angular 的样式处理方式，请参阅[组件样式](/guide/components/styling)。

你也可以选择把模板和样式写在单独的文件中：

```ts
@Component({
  selector: 'profile-photo',
  templateUrl: 'profile-photo.html',
  styleUrl: 'profile-photo.css',
})
export class ProfilePhoto {}
```

这有助于在项目中把**展示**和**行为**这两个关注点分离开。你可以为整个项目选定一种方式，也可以为每个组件分别决定使用哪种方式。

`templateUrl` 和 `styleUrl` 都是相对于组件所在目录的路径。

## 使用组件

### `@Component` 装饰器中的导入

要使用组件、[指令（Directive）](/guide/directives)或[管道（Pipe）](/guide/templates/pipes)，你必须把它
添加到 `@Component` 装饰器的 `imports` 数组中：

```ts
import {Component} from '@angular/core';
import {ProfilePhoto} from './profile-photo';

@Component({
  // 导入 `ProfilePhoto` 组件，
  // 以便在本组件的模板中使用它。
  imports: [ProfilePhoto],
  /* ... */
})
export class UserProfile {}
```

默认情况下，Angular 组件是**独立**（standalone）的，这意味着你可以直接把它们添加到其他组件的 `imports` 数组中。用早期版本的 Angular 创建的组件可能会在 `@Component` 装饰器中指定 `standalone: false`。对于这些组件，你需要改为导入定义该组件的 `NgModule`。详情请参阅完整的 [`NgModule` 指南](/guide/ngmodules/overview)。

::: warning 重要
在 19.0.0 之前的 Angular 版本中，`standalone` 选项默认为 `false`。

:::

### 在模板中显示组件

每个组件都定义了一个 [CSS 选择器](https://developer.mozilla.org/docs/Learn/CSS/Building_blocks/Selectors)：

```ts
@Component({
  selector: 'profile-photo',
  ...
})
export class ProfilePhoto { }
```

关于 Angular 支持哪些类型的选择器以及如何选择选择器的建议，请参阅[组件选择器](/guide/components/selectors)。

要显示一个组件，只需在**其他**组件的模板中创建一个与之匹配的 HTML 元素：

```ts
@Component({
  selector: 'profile-photo',
})
export class ProfilePhoto {}

@Component({
  imports: [ProfilePhoto],
  template: `<profile-photo />`,
})
export class UserProfile {}
```

Angular 每遇到一个匹配的 HTML 元素，就会为它创建一个组件实例。与组件选择器相匹配的 DOM 元素称为该组件的**宿主元素（host element）**。组件模板的内容会渲染在其宿主元素内部。

组件所渲染的 DOM（与该组件的模板相对应）称为该
组件的**视图**。

通过这种方式组合组件，**你可以把 Angular 应用看作一棵组件树**。

```txt
flowchart TD
    A[AccountSettings]-->B
    A-->C
    B[UserProfile]-->D
    B-->E
    C[PaymentInfo]
    D[ProfilePic]
    E[UserBio]
```

这种树形结构对于理解 Angular 的其他几个概念非常重要，包括[依赖注入（Dependency Injection）](/guide/di)和[子级查询（Query）](/guide/components/queries)。
