# 测试路由与导航 {#testing-routing-and-navigation}

测试路由（route）与导航（navigation）对于确保用户在不同路由之间切换时应用行为正确至关重要。本指南介绍在 Angular 应用中测试路由功能的多种策略。

## 前提条件 {#prerequisites}

本指南假定你熟悉以下工具和库：

- **[Vitest](https://vitest.dev/)** - JavaScript 测试框架，提供测试语法（`describe`、`it`、`expect`）
- **[Angular 测试工具集](/guide/testing)** - Angular 内置的测试工具（[`TestBed`](https://angular.dev/api/core/testing/TestBed)、[`ComponentFixture`](https://angular.dev/api/core/testing/ComponentFixture)）
- **[`RouterTestingHarness`](https://angular.dev/api/router/testing/RouterTestingHarness)** - 用于测试路由组件的测试工具（harness），内置导航和组件测试能力

## 测试场景 {#testing-scenarios}

### 路由参数 {#route-parameters}

组件（component）经常依赖 URL 中的路由参数来获取数据，例如个人资料页中的用户 ID。

下面的示例展示了如何测试一个显示路由中用户 ID 的 `UserProfile` 组件。

```ts [user-profile.spec.ts]
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {UserProfile} from './user-profile';

describe('UserProfile', () => {
  it('should display user ID from route parameters', async () => {
    TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [provideRouter([{path: 'user/:id', component: UserProfile}])],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/user/123', UserProfile);

    expect(harness.routeNativeElement?.textContent).toContain('User Profile: 123');
  });
});
```

```ts [user-profile.ts]
import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  template: '<h1>User Profile: {{userId}}</h1>',
})
export class UserProfile {
  private route = inject(ActivatedRoute);
  userId: string | null = this.route.snapshot.paramMap.get('id');
}
```

### 路由守卫 {#route-guards}

路由守卫（route guard）根据身份验证或权限等条件控制对路由的访问。测试守卫时，重点在于模拟（mock）依赖项并验证导航结果。

下面的示例测试了一个 `authGuard`：它允许已认证用户继续导航，并把未认证用户重定向（redirect）到登录页。

```ts [auth.guard.spec.ts]
import {describe, expect, it, vi, type Mocked} from 'vitest';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideRouter, Router} from '@angular/router';
import {authGuard} from './auth.guard';
import {AuthStore} from './auth-store';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';

@Component({template: '<h1>Protected Page</h1>'})
class Protected {}

@Component({template: '<h1>Login Page</h1>'})
class Login {}

describe('authGuard', () => {
  let authStore: Mocked<AuthStore>;
  let harness: RouterTestingHarness;

  async function setup(isAuthenticated: boolean) {
    authStore = {isAuthenticated: vi.fn().mockReturnValue(isAuthenticated)} as Mocked<AuthStore>;

    TestBed.configureTestingModule({
      providers: [
        {provide: AuthStore, useValue: authStore},
        provideRouter([
          {path: 'protected', component: Protected, canActivate: [authGuard]},
          {path: 'login', component: Login},
        ]),
      ],
    });

    harness = await RouterTestingHarness.create();
  }

  it('allows navigation when user is authenticated', async () => {
    await setup(true);
    await harness.navigateByUrl('/protected', Protected);
    // 已认证时应渲染受保护的组件
    expect(harness.routeNativeElement?.textContent).toContain('Protected Page');
  });

  it('redirects to login when user is not authenticated', async () => {
    await setup(false);
    await harness.navigateByUrl('/protected', Login);
    // 重定向后应渲染登录组件
    expect(harness.routeNativeElement?.textContent).toContain('Login Page');
  });
});
```

```ts [auth.guard.ts]
import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthStore} from './auth-store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  return authStore.isAuthenticated() ? true : router.parseUrl('/login');
};
```

### 路由出口 {#router-outlets}

路由出口（outlet）的测试更像是集成测试，因为你实际上是在测试 [`Router`](https://angular.dev/api/router/Router)、出口以及所显示的组件三者之间的集成。

下面的示例展示了如何编写测试来验证不同路由会显示不同的组件：

```ts [app.spec.ts]
import {TestBed} from '@angular/core/testing';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideRouter} from '@angular/router';
import {Component} from '@angular/core';
import {App} from './app';

@Component({
  template: '<h1>Home Page</h1>',
})
class MockHome {}

@Component({
  template: '<h1>About Page</h1>',
})
class MockAbout {}

describe('App Router Outlet', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          {path: '', component: MockHome},
          {path: 'about', component: MockAbout},
        ]),
      ],
    });

    harness = await RouterTestingHarness.create();
  });

  it('should display home component for default route', async () => {
    await harness.navigateByUrl('');

    expect(harness.routeNativeElement?.textContent).toContain('Home Page');
  });

  it('should display about component for about route', async () => {
    await harness.navigateByUrl('/about');

    expect(harness.routeNativeElement?.textContent).toContain('About Page');
  });
});
```

```ts [app.ts]
import {Component} from '@angular/core';
import {RouterOutlet, RouterLink} from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/about">About</a>
    </nav>
    <router-outlet />
  `,
})
export class App {}
```

### 嵌套路由 {#nested-routes}

测试嵌套路由可以确保在导航到嵌套 URL 时，父组件和子组件都能正确渲染。这一点很重要，因为嵌套路由涉及多个层级。

你需要验证：

1. 父组件正确渲染。
2. 子组件在父组件内部渲染。
3. 两个组件都能访问各自的路由数据。

下面是测试父子路由结构的示例：

```ts [nested-routes.spec.ts]
import {TestBed} from '@angular/core/testing';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideRouter} from '@angular/router';
import {Parent, Child} from './nested-components';

describe('Nested Routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Parent, Child],
      providers: [
        provideRouter([
          {
            path: 'parent',
            component: Parent,
            children: [{path: 'child', component: Child}],
          },
        ]),
      ],
    });

    harness = await RouterTestingHarness.create();
  });

  it('should render parent and child components for nested route', async () => {
    await harness.navigateByUrl('/parent/child');

    expect(harness.routeNativeElement?.textContent).toContain('Parent Component');
    expect(harness.routeNativeElement?.textContent).toContain('Child Component');
  });
});
```

```ts [nested.ts]
import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  imports: [RouterOutlet],
  template: `
    <h1>Parent Component</h1>
    <router-outlet />
  `,
})
export class Parent {}

@Component({
  template: '<h2>Child Component</h2>',
})
export class Child {}
```

### 查询参数和片段 {#query-parameters-and-fragments}

查询参数（如 `?search=angular&category=web`）和 URL 片段（如 `#section1`）通过 URL 提供额外的数据，它们不影响加载哪个组件，但会影响组件的行为。通过 [`ActivatedRoute.queryParams`](https://angular.dev/api/router/ActivatedRoute#queryParams) 读取查询参数的组件需要经过测试，以确保它们能正确处理各种参数情形。

路由参数是路由定义的一部分；与之不同，查询参数是可选的，并且可以在不触发路由导航的情况下发生变化。这意味着你既要测试初始加载，也要测试查询参数变化时的响应式更新。

下面的示例展示了如何测试查询参数和片段：

```ts [search.spec.ts]
import {TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {Search} from './search';

describe('Search', () => {
  let component: Search;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Search],
      providers: [provideRouter([{path: 'search', component: Search}])],
    });

    harness = await RouterTestingHarness.create();
  });

  it('should read search term from query parameters', async () => {
    component = await harness.navigateByUrl('/search?q=angular', Search);

    expect(component.searchTerm()).toBe('angular');
  });

  it('should read search term and fragment passed as navigation extras', async () => {
    component = await harness.navigate(
      ['/search'],
      {queryParams: {q: 'angular'}, fragment: 'results'},
      Search,
    );

    expect(component.searchTerm()).toBe('angular');
    expect(component.fragment()).toBe('results');
    expect(TestBed.inject(Router).url).toBe('/search?q=angular#results');
  });
});
```

```ts [search.ts]
import {Component, inject, computed} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  template: `
    <div>Search term: {{ searchTerm() }}</div>
    <div>Fragment: {{ fragment() }}</div>
  `,
})
export class Search {
  private route = inject(ActivatedRoute);
  private queryParams = toSignal(this.route.queryParams, {initialValue: {}});

  searchTerm = computed(() => this.queryParams()['q'] || null);
  fragment = toSignal(this.route.fragment, {initialValue: null});
}
```

## 路由测试的最佳实践 {#best-practices-for-router-testing}

1. **使用 RouterTestingHarness** - 测试路由组件时，请使用 [`RouterTestingHarness`](https://angular.dev/api/router/testing/RouterTestingHarness)。它提供更简洁的 API，无需编写测试宿主组件，还支持直接访问组件、内置导航，并具有更好的类型安全性。不过，它并不适合所有场景，例如测试具名出口时，你可能需要创建自定义的宿主组件。
2. **审慎处理外部依赖** - 尽可能使用真实实现，让测试更贴近实际。如果无法使用真实实现（例如外部 API），就使用近似真实行为的伪实现（fake）。模拟或桩只应作为最后手段，因为它们会让测试变得脆弱、不够可靠。
3. **测试导航状态** - 既要验证导航操作本身，也要验证导航后的应用状态，包括 URL 变化和组件渲染。
4. **处理异步操作** - 路由器（Router）导航是异步的。请使用 `async/await` 正确处理测试中的时序。
5. **测试错误场景** - 为无效路由、导航失败和守卫拒绝等情况编写测试，确保应用能妥善处理边界情况。
6. **不要模拟 Angular 路由器** - 应提供真实的路由配置，并使用测试工具进行导航。这样测试会更健壮，不容易因 Angular 内部更新而失效；同时也能确保在路由器更新时发现真实的问题，因为模拟可能会掩盖破坏性变更。
