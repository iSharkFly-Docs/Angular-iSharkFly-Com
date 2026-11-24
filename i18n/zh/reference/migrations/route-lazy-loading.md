# 迁移到延迟加载路由

此原理图（Schematic）帮助开发者把立即加载的组件路由转换为延迟加载（Lazy Loading）路由。这样构建过程就可以把生产环境的包（bundle）拆分成更小的块，避免产生一个包含所有路由的巨大 JS 包，因为这会对应用的首屏加载产生负面影响。

使用以下命令运行该原理图：

```shell
ng generate @angular/core:route-lazy-loading
```

### `path` 配置选项

默认情况下，迁移（migration）会处理整个应用。如果你只想对部分文件应用此迁移，可以按如下方式传入 path 参数：

```shell
ng generate @angular/core:route-lazy-loading --path src/app/sub-component
```

path 参数的值是项目内的相对路径。

### 它是如何工作的？

原理图会尝试找出应用中定义路由的所有位置：

- `RouterModule.forRoot` 和 `RouterModule.forChild`
- `Router.resetConfig`
- `provideRouter`
- 类型为 `Routes` 或 `Route[]` 的变量（例如 `const routes: Routes = [{...}]`）

迁移会检查路由中的所有组件，判断它们是否为独立组件且是立即加载的，如果是，就把它们转换为延迟加载路由。

#### 迁移前

```ts [app.module.ts]
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {Home} from './home';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        // Home 是独立组件，并且是立即加载的
        component: Home,
      },
    ]),
  ],
})
export class AppModule {}
```

#### 迁移后

```ts [app.module.ts]
@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        // ↓ Home 现在是延迟加载的
        loadComponent: () => import('./home').then((m) => m.Home),
      },
    ]),
  ],
})
export class AppModule {}
```

此迁移还会收集所有在 NgModule 中声明的组件的信息，并输出使用这些组件的路由列表（包括对应文件的位置）。可以考虑把这些组件改为独立组件，然后再次运行此迁移。你可以使用现有的迁移（[参见](/reference/migrations/standalone)）把这些组件转换为独立组件（Standalone Component）。
