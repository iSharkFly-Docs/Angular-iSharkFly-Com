# 使用 ng-container 对元素分组 {#grouping-elements-with-ng-container}

`<ng-container>` 是 Angular 中的一个特殊元素，它可以把多个元素组合在一起，或者在模板（Template）中标记一个位置，而不会在 DOM 中渲染出真实的元素。

```html
<!-- 组件模板 -->
<section>
  <ng-container>
    <h3>User bio</h3>
    <p>Here's some info about the user</p>
  </ng-container>
</section>
```

```html
<!-- 渲染后的 DOM -->
<section>
  <h3>User bio</h3>
  <p>Here's some info about the user</p>
</section>
```

你可以给 `<ng-container>` 应用指令（Directive），为模板的某一部分添加行为或配置。

Angular 会忽略应用在 `<ng-container>` 上的类绑定、样式绑定、DOM 事件监听器和静态属性，包括通过指令应用的那些。Attribute 绑定会导致错误，而属性绑定（Property Binding）只对指令的输入（Input）有效。

## 使用 `<ng-container>` 显示动态内容 {#using-to-display-dynamic-contents}

`<ng-container>` 可以充当渲染动态内容的占位符。

### 渲染组件 {#rendering-components}

你可以使用 Angular 内置的 `NgComponentOutlet` 指令，在 `<ng-container>` 所在的位置动态渲染一个组件（Component）。

```ts
@Component({
  template: `
    <h2>Your profile</h2>
    <ng-container [ngComponentOutlet]="profileComponent()" />
  `,
})
export class UserProfile {
  isAdmin = input(false);
  profileComponent = computed(() => (this.isAdmin() ? AdminProfile : BasicUserProfile));
}
```

在上面的例子中，`NgComponentOutlet` 指令会在 `<ng-container>` 元素的位置动态渲染 `AdminProfile` 或 `BasicUserProfile`。

### 渲染模板片段 {#rendering-template-fragments}

你可以使用 Angular 内置的 `NgTemplateOutlet` 指令，在 `<ng-container>` 所在的位置动态渲染一个模板片段。

```ts
@Component({
  template: `
    <h2>Your profile</h2>
    <ng-container [ngTemplateOutlet]="profileTemplate()" />

    <ng-template #admin>This is the admin profile</ng-template>
    <ng-template #basic>This is the basic profile</ng-template>
  `,
})
export class UserProfile {
  isAdmin = input(false);
  adminTemplate = viewChild('admin', {read: TemplateRef});
  basicTemplate = viewChild('basic', {read: TemplateRef});
  profileTemplate = computed(() => (this.isAdmin() ? this.adminTemplate() : this.basicTemplate()));
}
```

在上面的例子中，`ngTemplateOutlet` 指令会在 `<ng-container>` 元素的位置动态渲染两个模板片段之一。

关于 `NgTemplateOutlet` 的更多信息，请参阅 [NgTemplateOutlet API 文档页面](https://angular.dev/api/common/NgTemplateOutlet)。

## 将 `<ng-container>` 与结构型指令一起使用 {#using-with-structural-directives}

你也可以给 `<ng-container>` 元素应用结构型指令（Structural Directive）。常见的例子包括 `ngIf` 和 `ngFor`。

```html
<ng-container *ngIf="permissions == 'admin'">
  <h1>Admin Dashboard</h1>
  <admin-infographic />
</ng-container>

<ng-container *ngFor="let item of items; index as i; trackBy: trackByFn">
  <h2>{{ item.title }}</h2>
  <p>{{ item.description }}</p>
</ng-container>
```

## 使用 `<ng-container>` 进行注入 {#using-for-injection}

关于 Angular 依赖注入（Dependency Injection）系统的更多信息，请参阅[依赖注入指南](/guide/di)。

当你给 `<ng-container>` 应用一个指令时，其后代元素可以注入该指令或该指令提供的任何东西。如果你想以声明式的方式为模板的特定部分提供某个值，就可以使用这种方式。

```ts
@Directive({
  selector: '[theme]',
})
export class Theme {
  // 创建一个接受 'light' 或 'dark' 的输入，默认为 'light'。
  mode = input<'light' | 'dark'>('light');
}
```

```html
<ng-container theme="dark">
  <profile-pic />
  <user-bio />
</ng-container>
```

在上面的例子中，`ProfilePic` 和 `UserBio` 组件可以注入 `Theme` 指令，并根据它的 `mode` 应用样式。
