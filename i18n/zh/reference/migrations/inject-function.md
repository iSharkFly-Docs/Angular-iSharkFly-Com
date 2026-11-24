# 迁移到 `inject` 函数

与基于构造函数的注入相比，Angular 的 [`inject`](https://angular.dev/api/core/inject) 函数提供了更准确的类型，并且与标准装饰器的兼容性更好。

此原理图（Schematic）会把类中基于构造函数的注入转换为使用 [`inject`](https://angular.dev/api/core/inject) 函数。

使用以下命令运行该原理图：

```shell
ng generate @angular/core:inject
```

#### 迁移前

```ts
import {Component, Inject, Optional} from '@angular/core';
import {MyService} from './service';
import {DI_TOKEN} from './token';

@Component({template: ''})
export class MyComp {
  constructor(
    private service: MyService,
    @Inject(DI_TOKEN) @Optional() readonly token: string,
  ) {}
}
```

#### 迁移后

```ts
import {Component, inject} from '@angular/core';
import {MyService} from './service';
import {DI_TOKEN} from './token';

@Component({template: ''})
export class MyComp {
  private service = inject(MyService);
  readonly token = inject(DI_TOKEN, {optional: true});
}
```

## 迁移选项

此迁移（migration）提供了若干选项，用于自定义其输出。

### `path`

决定要迁移项目中的哪个子路径。传入 `.` 或留空即可
迁移整个目录。

### `migrateAbstractClasses`

Angular 不会验证抽象类的参数是否可注入。这意味着此
迁移无法在不冒破坏风险的情况下可靠地把它们迁移到 [`inject`](https://angular.dev/api/core/inject)，因此默认禁用。
如果你希望迁移抽象类，可以启用此选项，但请注意
你可能需要**手动修复一些破坏性问题**。

### `backwardsCompatibleConstructors`

默认情况下，此迁移会尽可能地清理代码，包括从构造函数中删除
参数，如果构造函数不包含任何代码，甚至会删除整个构造函数。
在某些情况下，当带有 Angular 装饰器的类继承自另一个带有 Angular 装饰器的类时，
这可能导致编译错误。如果启用此选项，迁移会生成一个
额外的构造函数签名以保持向后兼容，代价是代码会更多。

#### 迁移前 {#backwards-compatible-constructors-before}

```ts
import {Component} from '@angular/core';
import {MyService} from './service';

@Component({template: ''})
export class MyComp {
  constructor(private service: MyService) {}
}
```

#### 迁移后 {#backwards-compatible-constructors-after}

```ts
import {Component, inject} from '@angular/core';
import {MyService} from './service';

@Component({template: ''})
export class MyComp {
  private service = inject(MyService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}
}
```

### `nonNullableOptional`

如果带有 `@Optional` 装饰器的参数注入失败，Angular 会返回 `null`，这
意味着任何 `@Optional` 参数的真实类型都应该是 `| null`。但是，由于装饰器
无法影响类型，大量现有代码的类型是不正确的。`inject()` 修正了这个类型，
这可能导致出现新的编译错误。如果启用此选项，
迁移会在 `inject()` 调用之后添加非空断言，以匹配旧的类型，
代价是可能会掩盖类型错误。

::: info 注意
对于类型已经声明为可空的参数，不会添加非空断言，
因为依赖这些参数的代码很可能已经考虑到了它们可能为空的情况。

:::

#### 迁移前 {#non-nullable-optional-before}

```ts
import {Component, Inject, Optional} from '@angular/core';
import {TOKEN_ONE, TOKEN_TWO} from './token';

@Component({template: ''})
export class MyComp {
  constructor(
    @Inject(TOKEN_ONE) @Optional() private tokenOne: number,
    @Inject(TOKEN_TWO) @Optional() private tokenTwo: string | null,
  ) {}
}
```

#### 迁移后 {#non-nullable-optional-after}

```ts
import {Component, inject} from '@angular/core';
import {TOKEN_ONE, TOKEN_TWO} from './token';

@Component({template: ''})
export class MyComp {
  // 注意末尾的 `!`。
  private tokenOne = inject(TOKEN_ONE, {optional: true})!;

  // 末尾没有 `!`，因为该类型本来就是可空的。
  private tokenTwo = inject(TOKEN_TWO, {optional: true});
}
```
