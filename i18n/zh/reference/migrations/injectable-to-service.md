# 从 `@Injectable` 迁移到 `@Service`

此原理图（Schematic）会把符合条件的 `@Injectable` 类转换为使用 [`@Service`](https://angular.dev/api/core/Service) 装饰器，它是 `@Injectable({providedIn: 'root'})` 的一种更便捷的简写形式。
该原理图从 v22.1 开始可用，并且只会迁移那些被认为可以安全迁移的类。

使用以下命令运行该原理图：

```bash
ng generate @angular/core:service
```

使用 `providedIn: 'root'` 声明的类会变成不带任何选项的 `@Service`。

#### 迁移前

```ts
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class MyService {}
```

#### 迁移后

```ts
import {Service} from '@angular/core';

@Service()
export class MyService {}
```

不带选项声明的类不会被自动提供，因此迁移会通过 `autoProvided: false` 保留这一行为。
和以前一样，你仍需负责把它添加到某个 `providers` 数组中。

#### 迁移前 {#no-options-before}

```ts
import {Injectable} from '@angular/core';

@Injectable()
export class MyService {}
```

#### 迁移后 {#no-options-after}

```ts
import {Service} from '@angular/core';

@Service({autoProvided: false})
export class MyService {}
```

更多详情，请参阅 [选择不自动提供](/guide/di/creating-and-using-services#opting-out-of-automatic-provisioning)。

## 配置选项

### `--path`

默认情况下，此迁移（migration）会更新整个 Angular CLI 工作区（workspace），包括测试文件。
你可以使用此选项把迁移限制在某个特定的子目录中。

```bash
ng generate @angular/core:service --path src/app/sub-component
```

## 局限性

为了避免给应用带来破坏，原理图会在以下情况下跳过某个类：

- 该类，或者你自己源码中定义了构造函数的最近祖先类，通过构造函数注入依赖。
- `@Injectable` 装饰器接收了 `providedIn` 以外的任何选项。
- `providedIn` 选项被设置为 `'root'` 以外的任何值。

当一个文件中的所有 `@Injectable` 都被迁移后，迁移会移除 `Injectable` 导入。
如果一个文件中既有已迁移的类，也有被跳过的类，则会同时保留两个导入。

如果迁移报告没有找到任何需要迁移的文件，说明它没有修改任何文件。
这要么是因为它没有找到可以转换的 `@Injectable` 类，要么是因为代码已经迁移过了。
构造函数注入是被跳过的最常见原因，你可以先运行 [迁移到 `inject` 函数](/reference/migrations/inject-function)，然后再次运行此迁移。
