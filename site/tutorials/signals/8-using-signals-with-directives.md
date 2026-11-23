# 在指令中使用信号 {#using-signals-with-directives}

现在你已经学会了[在服务中使用信号](/tutorials/signals/7-using-signals-with-services)，接下来让我们探索指令（Directive）如何使用信号（Signal）。**好消息是：信号在指令中的用法与在组件（Component）中完全相同！** 主要区别在于，由于指令没有模板（Template），你主要会在宿主绑定（Host Binding）中使用信号，以响应式地更新宿主元素。

在本活动中，你将构建一个高亮指令，演示信号如何在指令中创建响应式行为。

<hr />



### 1. 像在组件中一样设置信号 {#_1-set-up-signals-just-like-in-a-component}

导入信号相关函数并创建响应式状态。这与在组件中的做法完全相同：

```ts
import {Directive, input, signal, computed} from '@angular/core';

@Directive({
  selector: '[highlight]',
})
export class HighlightDirective {
  // 信号输入 —— 与组件中相同！
  color = input<string>('yellow');
  intensity = input<number>(0.3);

  // 内部状态 —— 与组件中相同！
  private isHovered = signal(false);

  // 计算信号 —— 与组件中相同！
  backgroundStyle = computed(() => {
    const baseColor = this.color();
    const alpha = this.isHovered() ? this.intensity() : this.intensity() * 0.5;

    const colorMap: Record<string, string> = {
      'yellow': `rgba(255, 255, 0, ${alpha})`,
      'blue': `rgba(0, 100, 255, ${alpha})`,
      'green': `rgba(0, 200, 0, ${alpha})`,
      'red': `rgba(255, 0, 0, ${alpha})`,
    };

    return colorMap[baseColor] || colorMap['yellow'];
  });
}
```

注意，这与组件中的写法完全一致——唯一的区别是我们使用的是 `@Directive` 而不是 `@Component`。


### 2. 在宿主绑定中使用信号 {#_2-use-signals-in-host-bindings}

由于指令没有模板，你需要在**宿主绑定**中使用信号来响应式地更新宿主元素。添加 `host` 配置和事件处理器：

```ts
@Directive({
  selector: '[highlight]',
  host: {
    '[style.backgroundColor]': 'backgroundStyle()',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HighlightDirective {
  // ... 上一步中的信号 ...

  onMouseEnter() {
    this.isHovered.set(true);
  }

  onMouseLeave() {
    this.isHovered.set(false);
  }
}
```

当信号变化时，宿主绑定会自动重新求值——就像组件中的模板绑定一样！当 `isHovered` 变化时，计算信号（Computed）`backgroundStyle` 会重新计算，宿主绑定随之更新元素的样式。


### 3. 在模板中使用该指令 {#_3-use-the-directive-in-your-template}

更新应用模板，演示这个响应式指令：

```html
template: `
<div>
  <h1>Directive with Signals</h1>

  <div highlight color="yellow" [intensity]="0.2">Hover me - Yellow highlight</div>

  <div highlight color="blue" [intensity]="0.4">Hover me - Blue highlight</div>

  <div highlight color="green" [intensity]="0.6">Hover me - Green highlight</div>
</div>
`,
```

该指令会根据信号输入自动应用响应式高亮效果！




完美！你已经了解了信号如何与指令配合使用。本课的几个关键要点如下：

- **信号是通用的** - 所有信号 API（`input()`、`signal()`、`computed()`、`effect()`）在指令和组件中的用法都相同
- **宿主绑定是主要使用场景** - 由于指令没有模板，你需要在宿主绑定中使用信号来响应式地修改宿主元素
- **相同的响应式模式** - 信号更新会自动触发计算信号和宿主绑定的重新求值，就像在组件模板中一样

在下一课中，你将[学习如何使用信号查询来查询子元素](/tutorials/signals/9-query-child-elements-with-signal-queries)！
