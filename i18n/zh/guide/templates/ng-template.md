# 使用 ng-template 创建模板片段

受[原生 `<template>` 元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template)的启发，`<ng-template>` 元素让你可以声明一个**模板片段**：一段可以动态地或以编程方式渲染的内容。

## 创建模板片段

你可以在任何组件（Component）模板（Template）中，使用 `<ng-template>` 元素创建模板片段：

```html
<p>This is a normal element</p>

<ng-template>
  <p>This is a template fragment</p>
</ng-template>
```

渲染上面的代码时，`<ng-template>` 元素的内容不会渲染到页面上。不过，你可以获取对这个模板片段的引用，并编写代码来动态渲染它。

### 片段的绑定上下文

模板片段中可以包含带动态表达式的绑定（Binding）：

```ts
@Component({
  /* ... */,
  template: `<ng-template>You've selected {{count}} items.</ng-template>`,
})
export class ItemCounter {
  count: number = 0;
}
```

模板片段中的表达式或语句，总是针对声明该片段的组件进行求值，与片段在哪里渲染无关。

## 获取对模板片段的引用

获取模板片段的引用有以下三种方式：

- 在 `<ng-template>` 元素上声明一个[模板引用变量](/guide/templates/variables#template-reference-variables)
- 通过[组件或指令查询](/guide/components/queries)来查询该片段
- 在直接应用于 `<ng-template>` 元素的指令中注入该片段。

在这三种情况下，片段都由一个 [TemplateRef](https://angular.dev/api/core/TemplateRef) 对象表示。

### 使用模板引用变量引用模板片段

你可以给 `<ng-template>` 元素添加一个模板引用变量，以便在同一个模板文件的其他地方引用这个模板片段：

```html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a template fragment</p>
</ng-template>
```

然后，你就可以在模板中的其他任何地方通过 `myFragment` 变量引用这个片段。

### 使用查询引用模板片段

你可以使用任何[组件或指令查询 API](/guide/components/queries) 来获取模板片段的引用。

你可以使用 `viewChild` 查询（Query）直接查询 `TemplateRef` 对象。

```ts
@Component({
  /* ... */,
  template: `
    <p>This is a normal element</p>

    <ng-template>
      <p>This is a template fragment</p>
    </ng-template>
  `,
})
export class ComponentWithFragment {
  templateRef = viewChild<TemplateRef<unknown>>(TemplateRef);
}
```

然后，你就可以像引用其他类成员一样，在组件代码或组件的模板中引用这个片段。

如果一个模板包含多个片段，你可以给每个 `<ng-template>` 元素添加一个模板引用变量，为每个片段指定名称，然后按名称查询这些片段：

```ts
@Component({
  /* ... */,
  template: `
    <p>This is a normal element</p>

    <ng-template #fragmentOne>
      <p>This is one template fragment</p>
    </ng-template>

    <ng-template #fragmentTwo>
      <p>This is another template fragment</p>
    </ng-template>
  `,
})
export class ComponentWithFragment {
    fragmentOne = viewChild<TemplateRef<unknown>>('fragmentOne');
    fragmentTwo = viewChild<TemplateRef<unknown>>('fragmentTwo');
}
```

同样，你随后就可以像引用其他类成员一样，在组件代码或组件的模板中引用这些片段。

### 注入模板片段

如果指令（Directive）直接应用于 `<ng-template>` 元素，它就可以注入 `TemplateRef`：

```ts
@Directive({
  selector: '[myDirective]',
})
export class MyDirective {
  private fragment = inject(TemplateRef);
}
```

```html
<ng-template myDirective>
  <p>This is one template fragment</p>
</ng-template>
```

然后，你就可以像引用其他类成员一样，在指令代码中引用这个片段。

## 渲染模板片段

拿到模板片段的 `TemplateRef` 对象引用之后，你可以用以下两种方式之一渲染片段：在模板中使用 `NgTemplateOutlet` 指令，或者在 TypeScript 代码中使用 `ViewContainerRef`。

### 使用 `NgTemplateOutlet`

`@angular/common` 中的 `NgTemplateOutlet` 指令接受一个 `TemplateRef`，并把片段渲染为出口所在元素的**兄弟节点**。通常应该在 [`<ng-container>` 元素](/guide/templates/ng-container)上使用 `NgTemplateOutlet`。

首先，导入 `NgTemplateOutlet`：

```ts
import {NgTemplateOutlet} from '@angular/common';
```

下面的示例声明了一个模板片段，并使用 `NgTemplateOutlet` 把该片段渲染到一个 `<ng-container>` 元素：

```html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a fragment</p>
</ng-template>

<ng-container *ngTemplateOutlet="myFragment"></ng-container>
```

这个示例会生成如下渲染后的 DOM：

```html
<p>This is a normal element</p>
<p>This is a fragment</p>
```

### 使用 `ViewContainerRef`

**视图容器**是 Angular 组件树中可以包含内容的节点。任何组件或指令都可以注入 `ViewContainerRef`，以获取与该组件或指令在 DOM 中的位置相对应的视图容器的引用。

你可以使用 `ViewContainerRef` 上的 `createEmbeddedView` 方法动态渲染模板片段。使用 `ViewContainerRef` 渲染片段时，Angular 会把它作为注入了 `ViewContainerRef` 的组件或指令的下一个兄弟节点追加到 DOM 中。

下面的示例展示了一个组件，它接受一个模板片段的引用作为输入（Input），并在点击按钮时把该片段渲染到 DOM 中。

```ts
@Component({
  /* ... */,
  selector: 'component-with-fragment',
  template: `
    <h2>Component with a fragment</h2>
    <ng-template #myFragment>
      <p>This is the fragment</p>
    </ng-template>
    <my-outlet [fragment]="myFragment" />
  `,
})
export class ComponentWithFragment { }

@Component({
  /* ... */,
  selector: 'my-outlet',
  template: `<button (click)="showFragment()">Show</button>`,
})
export class MyOutlet {
  private viewContainer = inject(ViewContainerRef);
  fragment = input.required<TemplateRef<unknown>>();

  showFragment() {
    this.viewContainer.createEmbeddedView(this.fragment());
  }
}
```

在上面的示例中，点击 "Show" 按钮会产生如下输出：

```html
<component-with-fragment>
  <h2>Component with a fragment</h2>
  <my-outlet>
    <button>Show</button>
  </my-outlet>
  <p>This is the fragment</p>
</component-with-fragment>
```

## 渲染模板片段时传递参数

使用 `<ng-template>` 声明模板片段时，你还可以声明片段所接受的参数。渲染片段时，可以选择传入一个与这些参数相对应的 `context` 对象。除了引用声明该片段的组件中的数据之外，你还可以在绑定表达式和语句中使用这个上下文对象中的数据。

每个参数都写成一个以 `let-` 为前缀的属性，其值与上下文对象中的某个属性名相对应：

```html
<ng-template let-pizzaTopping="topping">
  <p>You selected: {{ pizzaTopping }}</p>
</ng-template>
```

### 使用 `NgTemplateOutlet` {#using-ngtemplateoutlet-with-parameters}

你可以把上下文对象绑定到 `ngTemplateOutletContext` 输入上：

```html
<ng-template #myFragment let-pizzaTopping="topping">
  <p>You selected: {{ pizzaTopping }}</p>
</ng-template>

<ng-container [ngTemplateOutlet]="myFragment" [ngTemplateOutletContext]="{topping: 'onion'}" />
```

### 使用 `ViewContainerRef` {#using-viewcontainerref-with-parameters}

你可以把上下文对象作为第二个参数传给 `createEmbeddedView`：

```ts
this.viewContainer.createEmbeddedView(this.myFragment, {topping: 'onion'});
```

## 为模板片段提供注入器

渲染模板片段时，它的注入器（Injector）上下文来自**模板的声明位置**，而不是它被渲染的位置。你可以通过提供自定义注入器来覆盖这一行为。

### 使用 `NgTemplateOutlet` {#using-ngtemplateoutlet-with-injectors}

你可以把自定义的 `Injector` 传给 `ngTemplateOutletInjector` 输入：

```ts
export const THEME_DATA = new InjectionToken<string>('THEME_DATA', {
  factory: () => 'light',
});

@Component({
  selector: 'themed-panel',
  template: `<div [class]="theme">...</div>`,
})
export class ThemedPanel {
  theme = inject(THEME_DATA);
}

@Component({
  selector: 'root',
  imports: [NgTemplateOutlet, ThemedPanel],
  template: `
    <ng-template #myFragment>
      <themed-panel />
    </ng-template>
    <ng-container *ngTemplateOutlet="myFragment; injector: customInjector" />
  `,
})
export class Root {
  customInjector = Injector.create({
    providers: [{provide: THEME_DATA, useValue: 'dark'}],
  });
}
```

#### 继承出口的注入器

你可以把 `ngTemplateOutletInjector` 设置为字符串 `'outlet'`，让嵌入视图从出口在 DOM 中的位置继承注入器，而不是从模板的声明位置继承。

```html
<ng-template #node let-items>
  <item-component>
    @for (child of items; track $index) {
      <ng-container
        *ngTemplateOutlet="node; context: {$implicit: child.children}; injector: 'outlet'"
      />
    }
  </item-component>
</ng-template>

<ng-container *ngTemplateOutlet="node; context: {$implicit: topLevelItems}" />
```

`node` 模板的每一次递归渲染都会从外围的 `<item-component>` 继承注入器，这样每一层嵌套都可以访问作用域限定在其父组件中的提供者（Provider）。

::: info 注意
在构建递归结构，或者渲染出的模板需要访问出口处组件树中的提供者时，这非常有用。

:::

### 使用 `ViewContainerRef` {#using-viewcontainerref-with-injectors}

你可以在 `createEmbeddedView` 的选项对象中传入自定义注入器：

```ts
this.viewContainer.createEmbeddedView(this.myFragment, context, {
  injector: myCustomInjector,
});
```

## 结构型指令

**结构型指令**（Structural Directive）是指满足以下条件的任何指令：

- 注入 `TemplateRef`
- 注入 `ViewContainerRef`，并以编程方式渲染注入的 `TemplateRef`

Angular 为结构型指令提供了一种特殊的便捷语法。如果你把指令应用到一个元素上，并在指令的选择器（Selector）前加上星号（`*`）字符，Angular 就会把整个元素及其所有内容解释为一个模板片段：

```html
<section *myDirective>
  <p>This is a fragment</p>
</section>
```

这等价于：

```html
<ng-template myDirective>
  <section>
    <p>This is a fragment</p>
  </section>
</ng-template>
```

开发者通常使用结构型指令来有条件地渲染片段，或者多次渲染片段。

更多细节请参阅[结构型指令](/guide/directives/structural-directives)。

## 其他资源

要了解 `ng-template` 在其他库中的用法示例，请参阅：

- [Angular Material 的 Tabs](https://material.angular.dev/components/tabs/overview)：在标签页被激活之前，不会向 DOM 渲染任何内容
- [Angular Material 的 Table](https://material.angular.dev/components/table/overview)：让开发者可以定义不同的数据渲染方式
