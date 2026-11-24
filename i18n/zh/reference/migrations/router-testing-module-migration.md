# RouterTestingModule 迁移

此原理图（Schematic）会把测试中 `RouterTestingModule` 的用法迁移为 `RouterModule`。

当某个测试从 `@angular/common/testing` 导入了 `SpyLocation` 并使用了 `urlChanges` 属性时，原理图还会添加 `provideLocationMocks()` 以保留原有行为。

使用以下命令运行该原理图：

```shell
ng generate @angular/core:router-testing-module-migration
```

## 选项

| 选项   | 详情                                                                                                                          |
| :----- | :---------------------------------------------------------------------------------------------------------------------------- |
| `path` | 要迁移的路径（相对于项目根目录）。默认为 `./`。可以用它来逐步迁移项目的一部分。 |

## 示例

### 保留路由器选项

迁移前：

```ts
import {RouterTestingModule} from '@angular/router/testing';
import {TestBed} from '@angular/core/testing';
import {SpyLocation} from '@angular/common/testing';

describe('test', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes, {initialNavigation: 'enabledBlocking'})],
    });
  });
});
```

迁移后：

```ts
import {RouterModule} from '@angular/router';
import {TestBed} from '@angular/core/testing';
import {SpyLocation} from '@angular/common/testing';

describe('test', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot(routes, {initialNavigation: 'enabledBlocking'})],
    });
  });
});
```

### 导入了 `SpyLocation` 并使用了 `urlChanges` 时添加 provideLocationMocks

迁移前：

```ts
import {RouterTestingModule} from '@angular/router/testing';
import {TestBed} from '@angular/core/testing';
import {SpyLocation} from '@angular/common/testing';

describe('test', () => {
  let spy: SpyLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
    spy = TestBed.inject(SpyLocation);
  });

  it('Awesome test', () => {
    expect(spy.urlChanges).toBeDefined();
  });
});
```

迁移后：

```ts
import {RouterModule} from '@angular/router';
import {TestBed} from '@angular/core/testing';
import {SpyLocation, provideLocationMocks} from '@angular/common/testing';

describe('test', () => {
  let spy: SpyLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [provideLocationMocks()],
    });
    spy = TestBed.inject(SpyLocation);
  });

  it('Awesome test', () => {
    expect(spy.urlChanges).toBeDefined();
  });
});
```
