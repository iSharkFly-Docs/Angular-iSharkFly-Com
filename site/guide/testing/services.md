# 测试服务 {#testing-services}

服务（service）通常包含组件（component）所依赖的应用业务逻辑。测试服务可以验证这些逻辑在隔离状态下能否正确工作，而不依赖任何组件或模板（template）。

本指南使用 [Vitest](https://vitest.dev/)，Angular CLI 项目默认就包含它。关于测试环境搭建的更多信息，请参阅[测试概览指南](/guide/testing#set-up-for-testing)。

## 测试一个服务 {#testing-a-service}

来看一个执行基本算术运算的 `Calculator` 服务：

```ts [calculator.ts]
import {Service} from '@angular/core';

@Service()
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  subtract(a: number, b: number): number {
    return a - b;
  }
}
```

要测试这个服务，需要配置 `TestBed`。它是 Angular 的测试工具，用于为每个测试创建隔离的测试环境。它会设置好依赖注入（dependency injection），并让你获取服务实例——模拟 Angular 在真实应用中把各部分连接起来的方式。

```ts [calculator.spec.ts]
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {Calculator} from './calculator';

describe('Calculator', () => {
  let service: Calculator;

  beforeEach(() => {
    // 注入 Calculator 服务；因为该服务使用了 `@Service`，
    // 所以 Angular 可以提供它
    service = TestBed.inject(Calculator);
  });

  it('adds two numbers', () => {
    expect(service.add(1, 2)).toBe(3);
  });

  it('subtracts two numbers', () => {
    expect(service.subtract(5, 3)).toBe(2);
  });
});
```

在上面的示例中，`beforeEach` 块会在每个测试之前注入一个新的服务实例。这样可以确保每个测试都隔离运行，不会有之前测试遗留的状态。

## 测试带有依赖的服务 {#testing-services-with-dependencies}

大多数服务都要依赖其他服务才能正常运行。默认情况下，`TestBed` 会提供这些依赖的真实实现，这意味着测试会走应用实际使用的代码路径。不过，有时某个依赖可能很复杂、很慢或者结果不可预测。这种情况下，你可以用一个受控的替代品来代替它。

来看一个 `OrderTotal` 服务，它依赖 `TaxCalculator` 来计算订单的最终价格：

```ts [tax-calculator.ts]
import {Service} from '@angular/core';

@Service()
export class TaxCalculator {
  calculate(subtotal: number): number {
    return subtotal * 0.05;
  }
}
```

```ts [order-total.ts]
import {inject, Service} from '@angular/core';
import {TaxCalculator} from './tax-calculator';

@Service()
export class OrderTotal {
  private taxCalculator = inject(TaxCalculator);

  total(subtotal: number): number {
    return subtotal + this.taxCalculator.calculate(subtotal);
  }
}
```

在这个示例中，`OrderTotal` 使用 `inject()` 从 Angular 的依赖注入系统中请求 `TaxCalculator`。默认情况下，`TestBed` 会提供真实的 `TaxCalculator`，对于这种简单的计算来说完全合适。但如果 `TaxCalculator` 涉及复杂逻辑、网络请求或不可预测的结果，你可能就需要用受控的替代品来代替它。

### 用桩替换依赖 {#replacing-a-dependency-with-a-stub}

桩（stub）是一种替换依赖或方法的方式，它返回可预测的值，从而让测试结果更容易验证。

要在不依赖真实 `TaxCalculator` 的情况下测试 `OrderTotal`，可以在 `TestBed` 配置中提供一个桩。

```ts [order-total.spec.ts]
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi, type Mocked} from 'vitest';
import {OrderTotal} from './order-total';
import {TaxCalculator} from './tax-calculator';

// Vitest 的 `Mocked` 工具类型确保桩是类型安全的，
// 而 `vi.fn()` 会为每个方法创建一个模拟函数
const taxCalculatorStub: Mocked<TaxCalculator> = {
  calculate: vi.fn(),
};

describe('OrderTotal', () => {
  let service: OrderTotal;

  beforeEach(() => {
    // `mockReturnValue` 为桩设置一个受控的返回值
    taxCalculatorStub.calculate.mockReturnValue(5);

    TestBed.configureTestingModule({
      // `providers` 数组接受提供者对象，其中 `provide`
      // 指定要替换的依赖，`useValue` 定义桩
      providers: [{provide: TaxCalculator, useValue: taxCalculatorStub}],
    });
    service = TestBed.inject(OrderTotal);
  });

  it('adds tax to the subtotal', () => {
    expect(service.total(100)).toBe(105);
  });
});
```

有了这个桩，每当 `OrderTotal` 请求 `TaxCalculator` 时，`TestBed` 就知道要改用 `taxCalculatorStub`。由于桩总是返回 5，因此无论 `TaxCalculator` 中的税率是否变化，该测试都能验证 `OrderTotal` 是否正确地把税额加到了小计上。

### 用间谍验证交互 {#verifying-interactions-with-spies}

桩控制依赖返回什么，但有时你还需要验证服务是否用正确的参数调用了它的依赖。这可以借助间谍（spy）来实现，它会跟踪函数是如何被调用的。在 Vitest 中，这项功能内置于 `vi.fn()`，让你可以对服务之间的交互进行断言。

```ts [order-total.spec.ts]
import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi, type Mocked} from 'vitest';
import {OrderTotal} from './order-total';
import {TaxCalculator} from './tax-calculator';

const taxCalculatorStub: Mocked<TaxCalculator> = {
  calculate: vi.fn(),
};

describe('OrderTotal', () => {
  let service: OrderTotal;

  beforeEach(() => {
    taxCalculatorStub.calculate.mockReturnValue(5);

    TestBed.configureTestingModule({
      providers: [{provide: TaxCalculator, useValue: taxCalculatorStub}],
    });
    service = TestBed.inject(OrderTotal);
  });

  afterEach(() => {
    taxCalculatorStub.calculate.mockClear();
  });

  it('adds tax to the subtotal', () => {
    expect(service.total(100)).toBe(105);
  });

  // 用间谍验证交互
  it('calls the tax calculator', () => {
    service.total(100);
    expect(taxCalculatorStub.calculate).toHaveBeenCalledExactlyOnceWith(100);
  });
});
```

新增的测试验证了 `OrderTotal` 在计算总额时调用了 `TaxCalculator.calculate`。当你需要验证服务之间的交互是否正确发生时，这种做法非常有用。

## 测试 HTTP 服务 {#testing-http-services}

许多服务使用 Angular 的 `HttpClient` 从服务器获取数据。Angular 为 `HttpClient` 提供了专门的测试工具，让你无需发出真实的网络请求就能控制 HTTP 响应。

关于测试使用 `HttpClient` 的服务的详细信息，请参阅 [HTTP 测试指南](/guide/http/testing)。
