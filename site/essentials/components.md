# 组件 {#components}

在 Angular 中创建应用的基本构建块。


组件（Component）是 Angular 应用的主要构建块。每个组件代表一个更大网页中的一部分。将应用组织成组件有助于为项目提供结构，把代码清晰地划分为易于维护、并能随时间不断扩展的特定部分。

## 定义组件 {#defining-a-component}

每个组件都包含几个主要部分：

1. 一个 `@Component` [装饰器（Decorator）](https://www.typescriptlang.org/docs/handbook/decorators.html)，其中包含 Angular 使用的一些配置。
2. 一个 HTML 模板（Template），用于控制渲染到 DOM 中的内容。
3. 一个 [CSS 选择器](https://developer.mozilla.org/docs/Learn/CSS/Building_blocks/Selectors)，用于定义该组件在 HTML 中的使用方式。
4. 一个包含行为的 TypeScript 类，例如处理用户输入或向服务器发送请求。

下面是一个 `UserProfile` 组件的简化示例。

```ts [user-profile.ts]
@Component({
  selector: 'user-profile',
  template: `
    <h1>User profile</h1>
    <p>This is the user profile page</p>
  `,
})
export class UserProfile {
  /* 你的组件代码写在这里 */
}
```

`@Component` 装饰器还可以选择性地接受一个 `styles` 属性，用于放置你想应用到模板上的 CSS：

```ts [user-profile.ts]
@Component({
  selector: 'user-profile',
  template: `
    <h1>User profile</h1>
    <p>This is the user profile page</p>
  `,
  styles: `
    h1 {
      font-size: 3em;
    }
  `,
})
export class UserProfile {
  /* 你的组件代码写在这里 */
}
```

### 将 HTML 和 CSS 拆分到单独的文件中 {#separating-html-and-css-into-separate-files}

你可以使用 `templateUrl` 和 `styleUrl` 在单独的文件中定义组件的 HTML 和 CSS：

```ts [user-profile.ts]
@Component({
  selector: 'user-profile',
  templateUrl: 'user-profile.html',
  styleUrl: 'user-profile.css',
})
export class UserProfile {
  // 组件行为在这里定义
}
```

```html [user-profile.html]
<h1>User profile</h1>
<p>This is the user profile page</p>
```

```css [user-profile.css]
h1 {
  font-size: 3em;
}
```

## 使用组件 {#using-components}

你可以通过将多个组件组合在一起来构建应用。例如，如果你在构建一个用户资料页面，可能会像下面这样把页面拆分成几个组件：

```txt
flowchart TD
    A[UserProfile]-->B
    A-->C
    B[UserBiography]-->D
    C[ProfilePhoto]
    D[UserAddress]
```

这里，`UserProfile` 组件使用了其他几个组件来生成最终页面。

要导入并使用一个组件，你需要：

1. 在你的组件的 TypeScript 文件中，为要使用的组件添加一条 `import` 语句。
2. 在你的 `@Component` 装饰器中，为要使用的组件在 `imports` 数组里添加一项。
3. 在你的组件模板中，添加一个与要使用的组件的选择器相匹配的元素。

下面是一个 `UserProfile` 组件导入 `ProfilePhoto` 组件的示例：

```ts [user-profile.ts]
import {Component} from '@angular/core';
import {ProfilePhoto} from './profile-photo';

@Component({
  selector: 'user-profile',
  imports: [ProfilePhoto],
  template: `
    <h1>User profile</h1>
    <profile-photo />
    <p>This is the user profile page</p>
  `,
})
export class UserProfile {
  // 组件行为在这里定义
}
```

::: tip 提示
想进一步了解 Angular 组件吗？完整细节请参阅[深入组件指南](/guide/components)。

:::

## 下一步 {#next-step}

现在你已经知道组件在 Angular 中如何工作，接下来该学习如何在应用中添加和管理动态数据了。

- [使用信号实现响应性](/essentials/signals)
- [深入组件指南](/guide/components)

