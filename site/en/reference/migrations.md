# Migrations

Learn about how you can migrate your existing angular project to the latest features incrementally.

- [**Standalone**](/en/reference/migrations/standalone): Standalone components provide a simplified way to build Angular applications. Standalone components specify their dependencies directly instead of getting them through NgModules.
- [**Control Flow Syntax**](/en/reference/migrations/control-flow): Built-in Control Flow Syntax allows you to use more ergonomic syntax which is close to JavaScript and has better type checking. It replaces the need to import `CommonModule` to use functionality like `*ngFor`, `*ngIf` and `*ngSwitch`.
- [**inject() Function**](/en/reference/migrations/inject-function): Angular's [`inject`](https://angular.dev/api/core/inject) function offers more accurate types and better compatibility with standard decorators, compared to constructor-based injection.
- [**Lazy-loaded routes**](/en/reference/migrations/route-lazy-loading): Convert eagerly loaded component routes to lazy loaded ones. This allows the build process to split production bundles into smaller chunks, to load less JavaScript at initial page load.
- [**New `input()` API**](/en/reference/migrations/signal-inputs): Convert existing `@Input` fields to the new signal input API that is now production ready.
- [**New `output()` function**](/en/reference/migrations/outputs): Convert existing `@Output` custom events to the new output function that is now production ready.
- [**Queries as signal**](/en/reference/migrations/signal-queries): Convert existing decorator query fields to the improved signal queries API. The API is now production ready.
- [**Cleanup unused imports**](/en/reference/migrations/cleanup-unused-imports): Clean up unused imports in your project.
- [**Self-closing tags**](/en/reference/migrations/self-closing-tags): Convert component templates to use self-closing tags where possible.
- [**NgClass to Class Bindings**](/en/reference/migrations/ngclass-to-class): Convert component templates to prefer class bindings over the `NgClass` directives when possible.
- [**NgStyle to Style Bindings**](/en/reference/migrations/ngstyle-to-style): Convert component templates to prefer style bindings over the `NgStyle` directives when possible.
- [**RouterTestingModule migration**](/en/reference/migrations/router-testing-module-migration): Convert `RouterTestingModule` usages to `RouterModule` in TestBed configurations and add `provideLocationMocks()` when appropriate.
- [**CommonModule to standalone imports**](/en/reference/migrations/common-to-standalone): Replace imports of the `CommonModule` with imports of the individual directives and pipes used in the templates when possible.
- [**Injectable to Service**](/en/reference/migrations/injectable-to-service): Convert eligible `@Injectable` classes to the `@Service` decorator.

