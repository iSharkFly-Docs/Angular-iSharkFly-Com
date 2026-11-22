---
untranslated: true
---

# Dependency Injection

Reuse code and control behaviors across your application and tests.


When you need to share logic between components, Angular leverages the design pattern of [dependency injection](/guide/di) that allows you to create a “service” which allows you to inject code into components while managing it from a single source of truth.

## What are services?

Services are reusable pieces of code that can be injected.

Similar to defining a component, services are comprised of the following:

- A **TypeScript decorator** that declares the class as an Angular service via `@Service` and allows you to define a service that can be accessed anywhere in your application.
- A **TypeScript class** that defines the desired code that will be accessible when the service is injected

Here is an example of a `Calculator` service.

```ts
import {Service} from '@angular/core';

@Service()
export class Calculator {
  add(x: number, y: number) {
    return x + y;
  }
}
```

## How to use a service

When you want to use a service in a component, you need to:

1. Import the service
2. Declare a class field where the service is injected. Assign the class field to the result of the call of the built-in function [`inject`](https://angular.dev/api/core/inject) which creates the service

Here’s what it might look like in the `Receipt` component:

```ts
import {Component, inject} from '@angular/core';
import {Calculator} from './calculator';

@Component({
  selector: 'app-receipt',
  template: `<h1>The total is {{ totalCost }}</h1>`,
})
export class Receipt {
  private calculator = inject(Calculator);
  totalCost = this.calculator.add(50, 25);
}
```

In this example, the `Calculator` is being used by calling the Angular function [`inject`](https://angular.dev/api/core/inject) and passing in the service to it.

## Next Step

- [Next Steps After Essentials](/essentials/next-steps)
- [In-depth dependency injection guide](/guide/di)

