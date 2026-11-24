# 添加事件监听器

Angular 支持在模板（Template）中为元素定义事件监听器（Event Listener）：把事件名写在圆括号内，再加上一条每次事件发生时都会执行的语句。

## 监听原生事件

要为 HTML 元素添加事件监听器，可以用圆括号 `()` 包裹事件名，然后指定一条监听器语句。

```ts
@Component({
  template: `
    <input type="text" (keyup)="updateField()" />
  `,
  ...
})
export class App{
  updateField(): void {
    console.log('Field is updated!');
  }
}
```

在这个例子中，每当 `<input>` 元素触发 `keyup` 事件时，Angular 都会调用 `updateField`。

你可以为任何原生事件添加监听器，例如 `click`、`keydown`、`mouseover` 等。要了解更多，请查看 [MDN 上元素的所有可用事件](https://developer.mozilla.org/en-US/docs/Web/API/Element#events)。

## 访问事件参数

在每个模板事件监听器中，Angular 都会提供一个名为 `$event` 的变量，它包含对事件对象的引用。

```ts
@Component({
  template: `
    <input type="text" (keyup)="updateField($event)" />
  `,
  ...
})
export class App {
  updateField(event: KeyboardEvent): void {
    console.log(`The user pressed: ${event.key}`);
  }
}
```

## 使用按键修饰符

如果想捕获某个特定按键的键盘事件，你可能会写出下面这样的代码：

```ts
@Component({
  template: `
    <input type="text" (keyup)="updateField($event)" />
  `,
  ...
})
export class App {
  updateField(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      console.log('The user pressed enter in the text field.');
    }
  }
}
```

不过，由于这是一个常见场景，Angular 允许你使用句点（`.`）字符指定特定按键来过滤事件。这样，代码可以简化为：

```ts
@Component({
  template: `
    <input type="text" (keyup.enter)="updateField($event)" />
  `,
  ...
})
export class App{
  updateField(event: KeyboardEvent): void {
    console.log('The user pressed enter in the text field.');
  }
}
```

你还可以添加更多的按键修饰符：

```html
<!-- 匹配 shift 和 enter -->
<input type="text" (keyup.shift.enter)="updateField($event)" />
```

Angular 支持 `alt`、`control`、`meta` 和 `shift` 这几个修饰符。

你可以指定要绑定到键盘事件的 key 或 code。key 和 code 字段是浏览器键盘事件对象的原生组成部分。默认情况下，事件绑定（Event Binding）假定你使用的是[键盘事件的 Key 值](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_key_values)。

Angular 还允许你通过内置的 `code` 后缀来指定[键盘事件的 Code 值](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_code_values)。

```html
<!-- 匹配 alt 和左 shift -->
<input type="text" (keydown.code.alt.shift.shiftleft)="updateField($event)" />
```

这有助于在不同操作系统上一致地处理键盘事件。例如，在 macOS 设备上使用 Alt 键时，`key` 属性报告的是已被 Alt 键修改后的字符。这意味着像 Alt + S 这样的组合，其 `key` 值会是 `'ß'`。而 `code` 属性对应的是被按下的物理或虚拟按键，而不是产生的字符。

## 监听全局目标

可以使用全局目标名作为事件的前缀。支持的 3 个全局目标是 `window`、`document` 和 `body`。

```ts
@Component({
  /* ... */
  host: {
    '(window:click)': 'onWindowClick()',
    '(document:click)': 'onDocumentClick()',
    '(body:click)': 'onBodyClick()',
  },
})
export class MyView {}
```

## 阻止事件的默认行为

如果你的事件处理器需要取代浏览器的原生行为，可以调用事件对象的 [`preventDefault` 方法](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)：

```ts
@Component({
  template: `
    <a href="#overlay" (click)="showOverlay($event)">
  `,
  ...
})
export class App{
  showOverlay(event: PointerEvent): void {
    event.preventDefault();
    console.log('Show overlay without updating the URL!');
  }
}
```

如果事件处理语句的求值结果为 `false`，Angular 会自动调用 `preventDefault()`，这与[原生事件处理器属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes#event_handler_attributes)类似。_始终优先显式调用 `preventDefault`_，因为这种方式能让代码意图一目了然。

## 扩展事件处理

Angular 的事件系统是可扩展的，可以通过使用 `EVENT_MANAGER_PLUGINS` 注入令牌（Injection Token）注册的自定义事件插件来扩展。

### 实现事件插件

要创建自定义事件插件，请继承 `EventManagerPlugin` 类并实现所需的方法。

```ts
import {Injectable} from '@angular/core';
import {EventManagerPlugin} from '@angular/platform-browser';

@Injectable()
export class DebounceEventPlugin extends EventManagerPlugin {
  constructor() {
    super(document);
  }

  // 定义此插件支持哪些事件
  override supports(eventName: string) {
    return /debounce/.test(eventName);
  }

  // 处理事件注册
  override addEventListener(element: HTMLElement, eventName: string, handler: Function) {
    // 解析事件：例如 "click.debounce.500"
    // 事件："click"，延迟：500
    const [event, , delay = '300'] = eventName.split('.');

    let timeoutId: ReturnType<typeof setTimeout>;

    const listener = (e: Event) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handler(e);
      }, Number(delay));
    };

    element.addEventListener(event, listener);

    // 返回清理函数
    return () => {
      clearTimeout(timeoutId);
      element.removeEventListener(event, listener);
    };
  }
}
```

在应用的提供者（Provider）中使用 `EVENT_MANAGER_PLUGINS` 令牌注册自定义插件：

```ts
import {bootstrapApplication, EVENT_MANAGER_PLUGINS} from '@angular/platform-browser';
import {App} from './app';
import {DebounceEventPlugin} from './debounce-event-plugin';

bootstrapApplication(App, {
  providers: [
    {
      provide: EVENT_MANAGER_PLUGINS,
      useClass: DebounceEventPlugin,
      multi: true,
    },
  ],
});
```

注册完成后，就可以在模板中以及 `host` 属性里使用自定义的事件语法：

```ts
@Component({
  template: `
    <input
      type="text"
      (input.debounce.500)="onSearch($event.target.value)"
      placeholder="Search..."
    />
  `,
  ...
})
export class Search {
 onSearch(query: string): void {
    console.log('Searching for:', query);
  }
}
```

```ts
@Component({
  ...,
  host: {
    '(click.debounce.500)': 'handleDebouncedClick()',
  },
})
export class AwesomeCard {
  handleDebouncedClick(): void {
   console.log('Debounced click!');
  }
}
```
