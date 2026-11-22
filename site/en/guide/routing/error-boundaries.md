# Error boundaries in routing

::: warning IMPORTANT
Router error boundaries are in [developer preview](/en/reference/releases#developer-preview).

:::

When building web applications, runtime errors can occur during component initialization, data loading, or rendering. Angular Router allows you to isolate these failures to individual routes using **error boundaries**, preventing a single failing component from crashing the entire application shell.

::: info NOTE
This guide covers error handling at the route level. For catching errors within specific sections of a component's template, refer to the [template `@boundary` block guide](/en/guide/templates/error-boundaries).

:::

## What are router error boundaries?

Router error boundaries provide declarative error handling at the route outlet level. When a component within a route throws an error—such as a failed network resource, an unexpected null reference in a template, or an error during dependency injection—Angular Router catches the error and displays a dedicated fallback component (`errorComponent`) in place of the failing view.

Sibling outlets, parent layout components, and global navigation headers remain fully interactive and intact.

## Configure an error component

To display a custom fallback UI when a route fails, add the `errorComponent` property to your route definition:

```ts [app.routes.ts]
import {Routes} from '@angular/router';
import {ProductDetails} from './product-details';
import {ProductErrorFallback} from './product-error-fallback';

export const routes: Routes = [
  {
    path: 'products/:id',
    component: ProductDetails,
    errorComponent: ProductErrorFallback,
  },
];
```

When you navigate to `/products/123`, if `ProductDetails` throws an error during creation or rendering, Angular Router instantiates `ProductErrorFallback` inside the `<router-outlet>` instead.

::: info NOTE
`errorComponent` only takes effect after you enable error boundaries. See [Global error boundary configuration](#global-error-boundary-configuration).

:::

::: info NOTE
Unlike route components which can be lazily loaded using `loadComponent`, the `errorComponent` must be eagerly loaded in your route configuration.

:::

---

## Create an error fallback component

An error fallback component is a standard Angular component that can receive the details of the caught error.

### Access error details with an input

You can accept the caught error object by declaring an `error` input:

```ts [product-error-fallback.ts]
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-product-error-fallback',
  template: `
    <div class="error-card">
      <h3>Failed to load product</h3>
      <p>{{ error()?.message }}</p>
    </div>
  `,
})
export class ProductErrorFallback {
  readonly error = input<Error>();
}
```

::: info NOTE
If your route configuration includes parameters, query parameters, or route data named `error`, the caught runtime `Error` always takes precedence on the `error` input of an error component.

:::

::: warning IMPORTANT
If the `errorComponent` itself throws an error during its creation or rendering, the `RouterOutlet` will not catch it again. The exception will bubble out of the outlet to the root `ErrorHandler` (or an enclosing [template `@boundary` block](/en/guide/templates/error-boundaries)) to prevent infinite error loops.

:::

## Route parameter and data binding

When using `withComponentInputBinding()`, Angular Router binds route parameters and static data to inputs on the `errorComponent` as well. This allows you to display contextual information in your error UI:

```ts [product-error-fallback.ts]
import {Component, input} from '@angular/core';

@Component({
  selector: 'app-product-error-fallback',
  template: `
    <div class="error-card">
      <h3>Failed to load product #{{ id() }}</h3>
      <p>{{ error()?.message }}</p>
    </div>
  `,
})
export class ProductErrorFallback {
  readonly id = input<string>();
  readonly error = input<Error>();
}
```

## Global error boundary configuration

Enable router error boundaries for your application with the `withErrorBoundaries` feature in `provideRouter`. Without it, a route's `errorComponent` is ignored:

```ts [app.config.ts]
import {ApplicationConfig, inject} from '@angular/core';
import {provideRouter, withComponentInputBinding, withErrorBoundaries} from '@angular/router';
import {routes} from './app.routes';
import {GlobalErrorFallback} from './global-error-fallback';
import {AnalyticsService} from './analytics.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withErrorBoundaries({
        // Default fallback component for routes that do not define their own errorComponent
        defaultErrorComponent: GlobalErrorFallback,

        // Global telemetry hook invoked whenever a route error is caught
        onError: (error, details) => {
          inject(AnalyticsService).logException(error, details);
        },
      }),
    ),
  ],
};
```

### Options

| Option                  | Type                                             | Description                                                                                                                          |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `defaultErrorComponent` | `Type<unknown>`                                  | Default fallback component to render when a route without its own `errorComponent` throws an error.                                  |
| `onError`               | `(error: Error, details?: ErrorDetails) => void` | Global callback invoked whenever any error is caught by a router error boundary. Ideal for sending telemetry to monitoring services. |

---

## Redirecting with `RedirectCommand`

When an authentication failure or data condition requires navigating to another page, components and route resources can throw a `RedirectCommand`:

```ts [user-profile.ts]
import {Component, inject, resource} from '@angular/core';
import {Router, RedirectCommand} from '@angular/router';

@Component({
  selector: 'app-user-profile',
  template: `...`,
})
export class UserProfile {
  private router = inject(Router);

  userData = resource({
    loader: async () => {
      const response = await fetch('/api/user');
      if (response.status === 401) {
        // Automatically redirects to /login when unauthorized
        throw new RedirectCommand(this.router.parseUrl('/login'));
      }
      return response.json();
    },
  });
}
```

When a `RedirectCommand` is thrown:

1. `RouterOutlet` catches the command and initiates navigation to the specified redirect destination.
2. If nested outlets or template error boundaries exist, Angular deduplicates the command to ensure the navigation is only triggered once.
3. The error component (if configured) renders during the transition.

::: info NOTE
If a `RedirectCommand` is thrown and no `errorComponent` is configured, the router initiates the navigation and intentionally swallows the error to prevent it from being logged as a crash by the global `ErrorHandler`.

:::

## Error boundary scope vs. navigation errors

It is helpful to understand the distinction between **view-layer errors** and **navigation pipeline errors**:

- **View-layer errors (Error boundaries)**: Occur inside component constructors, dependency injection, lifecycle hooks (`ngOnInit`), template expressions, and component `resource()` loaders. These are caught by `RouterOutlet` and display the `errorComponent`.
- **Navigation pipeline errors (`NavigationError`)**: Occur before route activation, such as failing `canActivate` / `canMatch` guards or route `resolve` data functions. These halt the navigation transition before reaching the outlet and can be customized using `withNavigationErrorHandler`.

::: info NOTE
When an error boundary displays an `errorComponent`, `canDeactivate` guards configured for that route run when navigating away. The guard receives the active `errorComponent` instance as its `component` parameter. If your guard accesses component-specific properties or methods, verify the component type or safely handle the error component instance.

:::

## Next steps

- [Template error boundaries](/en/guide/templates/error-boundaries)
- [Show routes with outlets](/en/guide/routing/show-routes-with-outlets)
- [Redirecting routes](/en/guide/routing/redirecting-routes)
- [Data fetching with resources](/en/guide/routing/data-fetching-with-resources)

