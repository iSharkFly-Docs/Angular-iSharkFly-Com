# 从 NgClass 迁移到 class 绑定 {#migration-from-ngclass-to-class-bindings}

此原理图（Schematic）会把应用中 NgClass 指令的用法迁移为 class 绑定。
它只会迁移那些被认为可以安全迁移的用法。

使用以下命令运行该原理图：

```bash
ng generate @angular/core:ngclass-to-class
```

#### 迁移前 {#before}

```html
<div [ngClass]="{admin: isAdmin, dense: density === 'high'}"></div>
```

#### 迁移后 {#after}

```html
<div [class]="{admin: isAdmin, dense: density === 'high'}"></div>
```

## 配置选项 {#configuration-options}

此迁移（migration）支持一些选项，可以根据你的具体需求进行微调。

### `--migrate-space-separated-key` {#migrate-space-separated-key}

默认情况下，如果 `NgClass` 用法中对象字面量的键包含以空格分隔的多个类名，迁移会跳过它们。
启用 --migrate-space-separated-key 标志后，迁移会为每个单独的键创建一个绑定。

```html
<div [ngClass]="{'class1 class2': condition}"></div>
```

会变为

```html
<div [class.class1]="condition" [class.class2]="condition"></div>
```
