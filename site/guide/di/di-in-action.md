# 依赖注入实战 {#di-in-action}

本指南介绍 Angular 中依赖注入（Dependency Injection，DI）的更多功能。

::: info 注意
关于 InjectionToken 和自定义提供者（Provider）的完整介绍，请参阅[定义依赖提供者指南](/guide/di/defining-dependency-providers#injection-tokens)。

:::

## 注入组件的 DOM 元素 {#inject-the-component-s-dom-element}

虽然开发者通常会避免这样做，但有些视觉效果和第三方工具需要你直接访问 DOM。
这种情况下，你可能需要访问组件（Component）的 DOM 元素。

Angular 通过 `ElementRef` 令牌，以注入的方式暴露 `@Component` 或 `@Directive` 底层的 DOM 元素：

```ts
import {Directive, ElementRef, inject} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {
  private element = inject(ElementRef);

  update() {
    this.element.nativeElement.style.color = 'red';
  }
}
```

## 注入宿主元素的标签名 {#inject-the-host-element-s-tag-name}

要获取宿主元素（Host Element）的标签名，请使用 `HOST_TAG_NAME` 令牌注入它。

```ts
import {Directive, HOST_TAG_NAME, inject} from '@angular/core';

@Directive({
  selector: '[roleButton]',
})
export class RoleButtonDirective {
  private tagName = inject(HOST_TAG_NAME);

  onAction() {
    switch (this.tagName) {
      case 'button':
        // 处理按钮的操作
        break;
      case 'a':
        // 处理链接的操作
        break;
      default:
        // 处理其他元素
        break;
    }
  }
}
```

::: info 注意
如果宿主元素可能没有标签名（例如 `ng-container` 或 `ng-template`），请将这次注入设为可选的。

:::

## 用前向引用解决循环依赖 {#resolve-circular-dependencies-with-a-forward-reference}

在 TypeScript 中，类声明的顺序很重要。
在定义一个类之前，你无法直接引用它。

这通常不是问题，尤其是当你遵循推荐的「_每个文件一个类_」规则时。
但在某些情况下，循环引用无法避免。
例如，如果类 'A' 引用了类 'B'，而类 'B' 又引用了类 'A'，那么它们之中必须有一个先被定义。

Angular 的 `forwardRef()` 函数会创建一个 _间接_ 引用，Angular 可以在稍后解析它。

当一个类 _引用自身_ 时，你也会遇到类似的问题。
例如在它的 `providers` 数组中。
`providers` 数组是 `@Component()` 装饰器函数的一个属性，而装饰器必须出现在类定义之前。
这类循环引用可以用 `forwardRef` 来解决。

```ts [app.component.ts]
providers: [
  {
    provide: PARENT_MENU_ITEM,
    useExisting: forwardRef(() => MenuItem),
  },
],
```
