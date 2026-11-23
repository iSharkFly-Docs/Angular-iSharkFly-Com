# 信号 {#signals}

创建和管理动态数据。


在 Angular 中，你可以使用_信号（Signal）_来创建和管理状态。信号是对某个值的轻量级包装。

使用 `signal` 函数创建一个信号来保存局部状态：

```ts
import {signal} from '@angular/core';

// 使用 `signal` 函数创建一个信号。
const firstName = signal('Morgan');

// 通过调用信号来读取它的值——信号就是函数。
console.log(firstName());

// 通过调用该信号的 `set` 方法并传入新值来更改它的值。
firstName.set('Jaime');

// 你也可以使用 `update` 方法，
// 基于之前的值来更改值。
firstName.update((name) => name.toUpperCase());
```

Angular 会追踪信号在哪里被读取以及何时被更新。框架利用这些信息来执行额外的工作，例如用新状态更新 DOM。这种随时间响应信号值变化的能力被称为_响应性（Reactivity）_。

## 计算表达式 {#computed-expressions}

`computed` 是一种基于其他信号产生自身值的信号。

```ts
import {signal, computed} from '@angular/core';

const firstName = signal('Morgan');
const firstNameCapitalized = computed(() => firstName().toUpperCase());

console.log(firstNameCapitalized()); // MORGAN
```

`computed` 信号是只读的；它没有 `set` 或 `update` 方法。相反，当它读取的任何信号发生变化时，`computed` 信号的值会自动改变：

```ts
import {signal, computed} from '@angular/core';

const firstName = signal('Morgan');
const firstNameCapitalized = computed(() => firstName().toUpperCase());
console.log(firstNameCapitalized()); // MORGAN

firstName.set('Jaime');
console.log(firstNameCapitalized()); // JAIME
```

## 在组件中使用信号 {#using-signals-in-components}

在组件（Component）中使用 `signal` 和 `computed` 来创建和管理状态：

```ts
@Component({
  /* ... */
})
export class UserProfile {
  isTrial = signal(false);
  isTrialExpired = signal(false);
  showTrialDuration = computed(() => this.isTrial() && !this.isTrialExpired());

  activateTrial() {
    this.isTrial.set(true);
  }
}
```

::: tip 提示
想进一步了解 Angular 信号吗？完整细节请参阅[深入信号指南](/guide/signals)。

:::

## 下一步 {#next-step}

现在你已经学会了如何声明和管理动态数据，接下来该学习如何在模板（Template）中使用这些数据了。

- [使用模板构建动态界面](/essentials/templates)
- [深入信号指南](/guide/signals)

