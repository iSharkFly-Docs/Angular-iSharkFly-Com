# 异步操作 {#async-operations}

有些验证需要来自外部数据源的数据，比如后端 API 或第三方服务。信号表单（Signal Forms）提供了两个用于异步验证的函数：`validateHttp()` 用于基于 HTTP 的验证，`validateAsync()` 用于基于资源（Resource）的自定义验证。

## 何时使用异步验证 {#when-to-use-async-validation}

当验证逻辑需要外部数据时，就应该使用异步验证。常见的例子包括：

- **唯一性检查**：确认用户名或邮箱尚未被占用
- **数据库查找**：将值与服务器端的数据进行比对
- **外部 API 验证**：借助第三方服务验证地址、税号或其他数据
- **服务器端业务规则**：应用只有服务器才能验证的规则

对于能在客户端同步完成的检查，不要使用异步验证。格式验证和静态规则请使用 `pattern()`、`email()` 或 `validate()` 等同步验证规则。

## 异步验证的工作原理 {#how-async-validation-works}

异步验证只会在所有同步验证都通过之后才运行。验证执行期间，字段（field）的 `pending()` 信号（signal）返回 `true`。验证可以把错误定位到特定字段上，而且当字段值发生变化时，挂起中的请求会自动取消。

下面是一个检查用户名是否可用的例子：

```ts
import {Component, signal} from '@angular/core';
import {form, validateHttp, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form>
      <label>
        Username:
        <input [formField]="registrationForm.username" />
      </label>

      @if (registrationForm.username().pending()) {
        <span class="checking">Checking availability...</span>
      }
      @if (registrationForm.username().invalid()) {
        @for (error of registrationForm.username().errors(); track $index) {
          <span class="error">{{ error.message }}</span>
        }
      }
    </form>
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateHttp(schemaPath.username, {
      request: ({value}) => {
        const username = value();
        return username ? `/api/users/check?username=${username}` : undefined;
      },
      onSuccess: (response: {available: boolean}) => {
        return response.available
          ? null
          : {
              kind: 'usernameTaken',
              message: 'Username is already taken',
            };
      },
      onError: (error) => {
        console.error('Validation request failed:', error);
        return {
          kind: 'serverError',
          message: 'Could not verify username availability',
        };
      },
    });
  });
}
```

验证流程如下：

1. 用户输入一个值
2. 先运行同步验证规则
3. 如果同步验证失败，异步验证不会运行
4. 如果同步验证通过，异步验证开始，`pending()` 变为 `true`
5. 请求完成后，`pending()` 变为 `false`
6. 根据响应更新错误

## 使用 validateHttp() 进行 HTTP 验证 {#http-validation-with-validatehttp}

`validateHttp()` 函数提供了最常见的异步验证形式。当你需要通过 REST API 或任意 HTTP 端点进行验证时，就可以使用它。

### 请求函数 {#request-function}

`request` 函数返回一个 URL 字符串或一个 `HttpResourceRequest` 对象。返回 `undefined` 则跳过验证：

```ts
import {Component, signal} from '@angular/core';
import {form, validateHttp, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `...`,
})
export class Registration {
  registrationModel = signal({username: ''});

  // 缓存已通过验证的用户名
  private validatedUsernames = new Set<string>();

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateHttp(schemaPath.username, {
      request: ({value}) => {
        const username = value();
        // 如果已验证过，则跳过 HTTP 请求
        if (this.validatedUsernames.has(username)) return undefined;

        return `/api/users/check?username=${username}`;
      },
      onSuccess: (response: {available: boolean}, {value}) => {
        if (response.available) {
          // 缓存验证成功的结果
          this.validatedUsernames.add(value());
          return null;
        }
        return {
          kind: 'usernameTaken',
          message: 'Username is already taken',
        };
      },
      onError: () => ({
        kind: 'serverError',
        message: 'Could not verify username',
      }),
    });
  });
}
```

对于 POST 请求或自定义请求头，返回一个 `HttpResourceRequest` 对象：

```ts
request: ({value}) => ({
  url: '/api/validate',
  method: 'POST',
  body: {username: value()},
}) // prettier-ignore
```

### 成功与错误处理函数 {#success-and-error-handlers}

`onSuccess` 函数接收 HTTP 响应，并返回验证错误；如果值有效，则返回 `undefined`：

```ts
onSuccess: (response: { valid: boolean; message?: string }) => {
  if (response.valid) return undefined;

  return {
    kind: 'invalid',
    message: response.message || 'Validation failed',
  };
} // prettier-ignore
```

需要时可以返回多个错误：

```ts
onSuccess: (response: { usernameTaken: boolean; profanity: boolean }) => {
  const errors = [];
  if (response.usernameTaken) {
    errors.push({
      kind: 'usernameTaken',
      message: 'Username taken',
    });
  }
  if (response.profanity) {
    errors.push({
      kind: 'profanity',
      message: 'Username contains inappropriate content',
    });
  }
  return errors.length > 0 ? errors : undefined;
} // prettier-ignore
```

`onSuccess` 的类型既可以直接在参数中指定，也可以通过 `validateHttp` 的 `options` 中的 `parse` 属性指定。

```ts
onSuccess: (response: { usernameTaken: boolean; profanity: boolean }) => {
  // ...
} // prettier-ignore

// 或者

options: {
  parse: (response) => response as {usernameTaken: boolean; profanity: boolean},
},
onSuccess: (response) => {
  // ...
} // prettier-ignore
```

`onError` 函数处理网络错误或 HTTP 错误等请求失败的情况：

```ts
onError: (error) => {
  console.error('Validation request failed:', error);
  return {
    kind: 'serverError',
    message: 'Could not verify. Please try again later.',
  };
} // prettier-ignore
```

### HTTP 选项 {#http-options}

从 `request` 函数返回一个 `HttpResourceRequest` 对象，即可自定义 HTTP 请求：

```ts
import {HttpHeaders} from '@angular/common/http';
import {validateHttp} from '@angular/forms/signals';

validateHttp(schemaPath.field, {
  request: ({value}) => ({
    url: `/api/validate?value=${value()}`,
    headers: new HttpHeaders({
      Authorization: 'Bearer token',
    }),
    timeout: 5000,
  }),
  onSuccess: (response: {valid: boolean}) =>
    response.valid
      ? null
      : {
          kind: 'invalid',
          message: 'Invalid value',
        },
  onError: () => ({
    kind: 'requestFailed',
    message: 'Unable to reach server to validate.',
  }),
});
```

::: tip 提示
所有可用的请求属性请参阅 [`HttpResourceRequest` API 文档](https://angular.dev/api/common/http/HttpResourceRequest)，`options` 参数请参阅 [httpResource API 文档](https://angular.dev/api/common/http/httpResource)。

:::

## 使用 validateAsync() 进行自定义异步验证 {#custom-async-validation-with-validateasync}

大多数应用应该使用 `validateHttp()` 来做异步验证。它只需极少的配置就能处理 HTTP 请求，覆盖了绝大多数使用场景。

`validateAsync()` 是一个更底层的 API，它直接暴露了 Angular 的资源原语。它提供了完全的控制能力，但需要编写更多代码，也要求你熟悉 Angular 的资源 API。

只有当 `validateHttp()` 无法满足需求时，才考虑使用 `validateAsync()`。例如：

- **非 HTTP 验证**：WebSocket 连接、IndexedDB 查找或 Web Worker 计算
- **自定义缓存策略**：超出简单记忆化（memoization）的应用特定缓存
- **复杂的重试逻辑**：自定义退避策略或条件重试
- **直接访问资源**：当你需要完整的资源生命周期时

### 创建自定义验证规则 {#creating-a-custom-validation-rule}

`validateAsync()` 函数需要四个属性：`params`、`factory`、`onSuccess` 和 `onError`。`params` 函数返回资源的参数，而 `factory` 负责创建资源：

```ts
import {Component, inject, signal, resource, Signal} from '@angular/core';
import {form, validateAsync, FormField} from '@angular/forms/signals';
import {UsernameValidator} from './username-validator';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `...`,
})
export class Registration {
  registrationModel = signal({username: ''});

  private usernameValidator = inject(UsernameValidator);
  private cache = new Map<string, {available: boolean}>();

  // 带缓存的自定义资源工厂
  createUsernameResource = (usernameSignal: Signal<string | undefined>) => {
    return resource({
      params: () => usernameSignal(),
      loader: async ({params: username}) => {
        if (!username) return undefined;

        // 先检查缓存
        const cached = this.cache.get(username);
        if (cached !== undefined) return cached;

        // 使用注入的服务进行验证
        const result = await this.usernameValidator.checkAvailability(username);

        // 缓存结果
        this.cache.set(username, result);
        return result;
      },
    });
  };

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => {
        const username = value();
        return username.length >= 3 ? username : undefined!;
      },
      factory: this.createUsernameResource,
      onSuccess: (result) => {
        return result?.available
          ? null
          : {
              kind: 'usernameTaken',
              message: 'Username taken',
            };
      },
      onError: (error) => {
        console.error('Validation failed:', error);
        return {
          kind: 'serverError',
          message: 'Could not verify username',
        };
      },
    });
  });
}
```

`params` 函数会在每次值变化时运行。返回 `undefined` 即可跳过验证。`factory` 函数只在初始化时运行一次，并以信号的形式接收参数。当参数变化时，资源会自动更新。

### 使用基于 Observable 的服务 {#using-observable-based-services}

如果你的应用已有返回 Observable 的服务（Service），可以使用 `@angular/core/rxjs-interop` 中的 `rxResource`：

```ts
import {Component, inject, signal, Signal} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {form, validateAsync, FormField} from '@angular/forms/signals';
import {UsernameService} from './username-service';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `...`,
})
export class Registration {
  registrationModel = signal({username: ''});

  private usernameService = inject(UsernameService);

  private createUsernameResource = (usernameSignal: Signal<string | undefined>) => {
    return rxResource({
      params: () => usernameSignal(),
      stream: ({params: username}) => this.usernameService.checkUsername(username),
    });
  };

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => value(),
      factory: this.createUsernameResource,
      onSuccess: (result) =>
        result?.available ? null : {kind: 'usernameTaken', message: 'Username taken'},
      onError: () => ({
        kind: 'serverError',
        message: 'Could not verify username',
      }),
    });
  });
}
```

`rxResource` 函数可以直接处理 Observable，并在字段值变化时自动清理订阅。

## 防抖 {#debouncing}

`debounce` 规则会推迟用户输入提交到表单模型的时机。你可以把它理解为：在用户停止输入之前，该规则会一直扣住这些值。当下游行为不应该对每一次按键都做出反应时，这很有用，比如开销较大的派生计算、在单词输入到一半时就闪现错误的验证，或是每输入一个字符都会重新应用的搜索过滤器。

在 schema 中添加 `debounce` 规则，可以推迟表单字段的 UI 变化写入表单模型的时机。最简单的形式是 `debounce(path, ms)`，它会把每次 UI 变化保留指定的毫秒数，然后再写入模型。在这个时间窗口内出现新的变化会重置计时器。

下面的例子在注册表单的用户名字段上同时应用了 `debounce` 和 `validateHttp`，让用户名可用性检查推迟到用户停止输入之后再进行：

```ts
import {Component, signal} from '@angular/core';
import {form, debounce, validateHttp, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <label>
      Username:
      <input [formField]="registrationForm.username" />
    </label>

    @if (registrationForm.username().pending()) {
      <span class="checking">Checking availability...</span>
    }
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (schemaPath) => {
    // 将 UI 更新保留 300 毫秒后再写入模型
    debounce(schemaPath.username, 300);

    // 针对防抖后的模型值运行，而不是每次按键都运行
    validateHttp(schemaPath.username, {
      request: ({value}) => {
        const username = value();
        // 值为空时跳过请求
        return username ? `/api/users/check?username=${username}` : undefined;
      },
      onSuccess: (response: {available: boolean}) =>
        response.available ? null : {kind: 'usernameTaken', message: 'Username is already taken'},
      onError: () => ({
        kind: 'serverError',
        message: 'Could not verify username availability',
      }),
    });
  });
}
```

设置 300 毫秒的防抖后，只有当用户停止输入的时间超过配置的时长时，模型才会更新并进行验证。例如，快速连续地输入 "signal forms" 只会触发一次验证请求，而不是十二次。

### 触碰会立即刷新模型 {#touch-flushes-the-model}

无论防抖时长是多少，只要字段变为已触碰（touched）状态，框架就会立即把该字段的 `controlValue()` 写入模型。原生输入框在失去焦点（blur）时变为已触碰状态，所以用户输入完成后按 Tab 键离开时，无需等待防抖计时器到期。自定义控件可以在任何它选择的事件中将字段标记为已触碰。

在典型场景中，这一点对表单提交很重要。当用户点击提交按钮时，当前获得焦点的输入框会失去焦点，从而使该字段变为已触碰状态，并在提交处理函数运行之前刷新其挂起的防抖值。

### 仅在失去焦点时提交 {#commit-only-on-blur}

有些字段在输入过程中根本不应更新，而应该等用户输入完值之后再更新。例如，如果你有一个每次变化都会重新应用的搜索过滤器，或者一个会触发开销较大的派生状态的表单，那么让模型等到用户输入完毕通常是更好的做法。

在这些场景中，传入 `'blur'` 而不是时长，即可把所有更新推迟到字段变为已触碰状态时：

```ts
form(this.registrationModel, (schemaPath) => {
  debounce(schemaPath.username, 'blur');
});
```

使用 `'blur'` 时，用户输入期间模型会保持之前的值。在字段变为已触碰状态之前，同步和异步验证、派生信号以及读取该字段的任何响应式规则看到的都是之前的值。这通常发生在用户让原生输入框失去焦点时，或者自定义控件自行发出触碰信号时。

### 自定义时机逻辑 {#custom-timing-logic}

如果时长或 `'blur'` 都无法表达你需要的时机逻辑，可以传入一个 `Debouncer` 函数。该函数接收字段上下文和一个 [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)，并返回一个 `Promise<void>`，它在模型应当更新时 resolve：

```ts
import {debounce, type Debouncer, form} from '@angular/forms/signals';

const shorterWhenLonger: Debouncer<string> = ({value}, abortSignal) => {
  // 较短的查询延迟更长，因为用户很可能还在输入。
  const ms = value().length < 3 ? 500 : 200;
  return new Promise((resolve) => {
    const timeoutId = setTimeout(resolve, ms);
    // 当该字段被触碰或其值发生变化时触发 abort，从而清除挂起的计时器
    abortSignal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId);
        resolve();
      },
      {once: true},
    );
  });
};

const registrationForm = form(registrationModel, (schemaPath) => {
  debounce(schemaPath.username, shorterWhenLonger);
});
```

当字段被触碰，或者在防抖 resolve 之前其值发生变化时，`abortSignal` 就会触发。请在 abort 时 resolve 这个 Promise，以便防抖函数释放所有挂起的计时器。框架会在触碰时把挂起的值写入模型，而在有更新的值到达时丢弃它。完整的 `Debouncer` 签名请参阅 [`debounce` API 参考](https://angular.dev/api/forms/signals/debounce)。

### 为单个异步验证器防抖 {#debouncing-a-single-async-validator}

`debounce` 规则会推迟该字段上的所有响应，从同步验证到派生信号再到异步验证。不过，有时你想要的恰恰相反：让 `required` 或 `email` 这类开销很小的同步验证器（validator）立即运行，以提供即时反馈，只让开销较大的异步调用等用户输入稳定后再执行。`validateHttp()` 和 `validateAsync()` 都接受各自的 [`debounce` 选项](https://angular.dev/api/forms/signals/validateAsync)，它只对该验证器进行节流：

```ts
form(this.registrationModel, (schemaPath) => {
  validateHttp(schemaPath.username, {
    // 只对这个 HTTP 调用进行节流
    debounce: 300,
    request: ({value}) => {
      const username = value();
      // 值为空时跳过请求
      return username ? `/api/users/check?username=${username}` : undefined;
    },
    onSuccess: (response: {available: boolean}) =>
      response.available ? null : {kind: 'usernameTaken', message: 'Username is already taken'},
    onError: () => ({
      kind: 'serverError',
      message: 'Could not verify username availability',
    }),
  });
});
```

模型仍会在每次按键时更新，附加在该字段上的其他规则也仍会立即响应。只有 HTTP 请求被防抖：每次变化都要等待 300 毫秒的静默期才会发出请求，因此只有在用户停止输入后才会发出请求。

根据作用范围在这两个层次之间进行选择：

| 选项                                                          | 何时使用                                                                                                                            |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `debounce()` 规则                                             | 同步验证、派生状态和提交都应等到字段提交值之后再进行。整个字段在输入过程中都不应做出响应。 |
| `validateHttp({ debounce })` 或 `validateAsync({ debounce })` | 开销小的同步验证器应提供即时反馈，而开销大的异步调用应等待用户停止输入。                  |

两种选项都接受以毫秒为单位的时长。它们的自定义时机回调有所不同：表单级规则接受一个 `Debouncer`，而验证器级选项接受一个来自 `@angular/core` 的 `DebounceTimer`。这两种签名不能互换。

## 在异步验证中用工厂组合资源 {#composing-resources-in-async-validation-with-a-factory}

内置的 [`debounce` 选项](https://angular.dev/api/forms/signals/validateAsync) 涵盖了节流，但 `validateAsync()` 还暴露了一个更深层的组合点：`factory` 函数。工厂以信号的形式接收参数，并返回一个资源。在这两点之间，你可以自由组合任何需要的逻辑。

最简单的形式是工厂只包装一个资源。用户名可用性检查可以作为组件（Component）类上的一个方法，再通过引用接入 `validateAsync`：

```ts
export class Registration {
  registrationModel = signal({username: ''});
  private usernameValidator = inject(UsernameValidator);

  // 工厂函数
  checkUsernameAvailable = (username: Signal<string | undefined>) =>
    resource({
      params: () => username(),
      loader: async ({params: name}) => this.usernameValidator.checkAvailability(name),
    });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => {
        const username = value();
        // 对过短的用户名跳过验证
        return username.length >= 3 ? username : undefined!;
      },
      debounce: 300,
      // 引用上面定义的工厂
      factory: this.checkUsernameAvailable,
      onSuccess: (result) =>
        result?.available ? null : {kind: 'usernameTaken', message: 'Username taken'},
      onError: () => ({kind: 'serverError', message: 'Could not verify'}),
    });
  });
}
```

对于过短的用户名，`params` 回调返回 `undefined`，表示应跳过验证。应用 `debounce: 300` 后，资源会等用户停止输入 300 毫秒后再处理每次变化。然后它会为有效的用户名运行 loader，而当防抖后的值稳定为 `undefined` 时保持空闲。

### 将防抖与其他逻辑结合 {#combining-debounce-with-additional-logic}

当你需要的逻辑超出了简单的时长防抖时，可以使用自定义工厂把防抖与这些逻辑结合起来。一个常见的例子是缓存已验证的响应。例如，一旦服务器确认过某个用户名，之后的按键再次回到同一个值时就无需再次询问。

```ts
export class Registration {
  registrationModel = signal({username: ''});
  private usernameValidator = inject(UsernameValidator);

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => {
        const username = value();
        return username.length >= 3 ? username : undefined;
      },
      factory: (username) => {
        // 核心原语：在源停止变化 300 毫秒后稳定下来
        const debouncedUsername = debounced(username, 300);
        // 缓存位于工厂的闭包中，在字段的整个生命周期内持续存在
        const cache = new Map<string, {available: boolean}>();
        return resource({
          // 从防抖后的信号中读取，而不是原始信号
          params: () => debouncedUsername.value(),
          loader: async ({params: name}) => {
            const cached = cache.get(name);
            if (cached) return cached;

            const result = await this.usernameValidator.checkAvailability(name);
            cache.set(name, result);
            return result;
          },
        });
      },
      onSuccess: (result) =>
        result?.available ? null : {kind: 'usernameTaken', message: 'Username taken'},
      onError: () => ({
        kind: 'serverError',
        message: 'Could not verify username',
      }),
    });
  });
}
```

`cache` 位于工厂的闭包中，因此会在字段的整个生命周期内持续存在。一旦用户输入了服务器已经检查过的用户名，loader 就会从缓存中读取，而不是发起新的网络请求。

## 理解挂起状态 {#understanding-pending-state}

异步验证运行时，字段的 `pending()` 信号返回 `true`。在此期间：

- `valid()` 返回 `false`
- `invalid()` 返回 `false`
- `errors()` 返回空数组
- `submit()` 不会等待它；默认情况下 `action` 照常运行（参见 [`ignoreValidators`](/guide/forms/signals/form-submission#controlling-validation-gating-with-ignorevalidators)）

在模板（Template）中显示挂起状态，以便向用户提供反馈：

```html
<input [formField]="loginForm.username" />

@if (loginForm.username().pending()) {
  <span class="loading">Checking availability...</span>
}

@if (loginForm.username().touched() && loginForm.username().invalid()) {
  @for (error of loginForm.username().errors(); track $index) {
    <span class="error">{{ error.message }}</span>
  }
}
```

在验证挂起期间禁用表单提交：

```html
<button type="submit" [disabled]="loginForm().pending()">
  @if (loginForm().pending()) {
    Validating...
  } @else {
    Submit
  }
</button>
```

::: tip 提示
更多使用 `pending()`、`valid()` 和 `invalid()` 信号的模式，请参阅[字段状态管理指南](/guide/forms/signals/field-state-management)。

:::

### 验证执行顺序 {#validation-execution-order}

异步验证只在同步验证通过之后才运行。这可以避免为无效输入发出不必要的服务器请求：

```ts
import {form, required, minLength, validateHttp} from '@angular/forms/signals';
import {model} from '@angular/core';

form(model, (schemaPath) => {
  // 1. 这些同步验证规则先运行
  required(schemaPath.username);
  minLength(schemaPath.username, 3);

  // 2. 这个异步验证规则只在同步验证通过后才运行
  validateHttp(schemaPath.username, {
    request: ({value}) => `/api/check?username=${value()}`,
    onSuccess: (result: {valid: boolean}) =>
      result.valid
        ? null
        : {
            kind: 'usernameTaken',
            message: 'Username taken',
          },
    onError: () => ({
      kind: 'serverError',
      message: 'Validation failed',
    }),
  });
});
```

这种执行顺序可以减轻服务器负载并即时捕获格式错误，从而提升性能。

### 请求取消 {#request-cancellation}

当字段值发生变化时，信号表单会自动取消该字段所有挂起的异步验证请求。这可以防止竞态条件，并确保验证结果始终反映当前值。你无需自己实现取消逻辑。

## 最佳实践 {#best-practices}

### 与同步验证结合使用 {#combine-with-synchronous-validation}

在发起异步请求之前，始终先验证格式。这样可以即时捕获错误，并避免不必要的服务器请求：

```ts
import {form, required, email, validateHttp} from '@angular/forms/signals';
import {model} from '@angular/core';

form(model, (schemaPath) => {
  // 先验证格式
  required(schemaPath.email);
  email(schemaPath.email);

  // 再检查是否可用
  validateHttp(schemaPath.email, {
    request: ({value}) => `/api/emails/check?email=${value()}`,
    onSuccess: (result: {available: boolean}) =>
      result.available
        ? null
        : {
            kind: 'emailInUse',
            message: 'Email already in use',
          },
    onError: () => ({
      kind: 'serverError',
      message: 'Could not verify email',
    }),
  });
});
```

### 在适当时跳过验证 {#skip-validation-when-appropriate}

从 `request` 函数返回 `undefined` 即可跳过验证。用它来避免验证空字段或未达到最低要求的值：

```ts
import {validateHttp} from '@angular/forms/signals';

validateHttp(schemaPath.username, {
  request: ({value}) => {
    const username = value();
    // 对空的或过短的用户名跳过验证
    if (!username || username.length < 3) return undefined;

    return `/api/users/check?username=${username}`;
  },
  onSuccess: (result: {valid: boolean}) =>
    result.valid
      ? null
      : {
          kind: 'usernameTaken',
          message: 'Username taken',
        },
  onError: () => ({
    kind: 'serverError',
    message: 'Validation failed',
  }),
});
```

### 妥善处理错误 {#handle-errors-gracefully}

提供清晰、友好的错误消息。为了调试可以记录技术细节，但向用户展示的消息应保持简单：

```ts
import {validateHttp} from '@angular/forms/signals';

validateHttp(schemaPath.field, {
  request: ({value}) => `/api/validate?field=${value()}`,
  onSuccess: (result: {valid: boolean; message?: string}) => {
    if (result.valid) return null;
    // 有服务器消息时使用服务器消息
    return {
      kind: 'serverError',
      message: result.message || 'Validation failed',
    };
  },
  onError: (error) => {
    // 记录日志以便调试
    console.error('Validation request failed:', error);

    // 显示友好的消息
    return {
      kind: 'serverError',
      message: 'Unable to validate. Please try again later.',
    };
  },
});
```

### 显示清晰的反馈 {#show-clear-feedback}

使用 `pending()` 信号来表明验证正在进行。这有助于用户理解延迟，并带来更好的感知性能：

```html
@if (field().pending()) {
  <span class="checking">
    <span class="spinner"></span>
    Checking...
  </span>
}
@if (field().valid() && !field().pending()) {
  <span class="success">Available</span>
}
@if (field().invalid()) {
  <span class="error">{{ field().errors()[0]?.message }}</span>
}
```

## 后续步骤 {#next-steps}

本指南介绍了如何使用 `validateHttp()` 和 `validateAsync()` 进行异步验证。以下相关指南探讨了信号表单的其他方面：

- [验证](/guide/forms/signals/validation)
- [字段状态管理](/guide/forms/signals/field-state-management)


详细的 API 文档请参阅：

- [`validateHttp()`](https://angular.dev/api/forms/signals/validateHttp)：基于 HTTP 的异步验证
- [`validateAsync()`](https://angular.dev/api/forms/signals/validateAsync)：基于资源的自定义异步验证
- [`httpResource()`](https://angular.dev/api/common/http/httpResource)：Angular 的 HTTP 资源 API
- [`resource()`](https://angular.dev/api/core/resource)：Angular 的资源原语
