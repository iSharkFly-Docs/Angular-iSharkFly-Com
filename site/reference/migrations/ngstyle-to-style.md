# 从 NgStyle 迁移到 style 绑定 {#migration-from-ngstyle-to-style-bindings}

此原理图（Schematic）会把应用中 NgStyle 指令的用法迁移为 style 绑定。
它只会迁移那些被认为可以安全迁移的用法。

使用以下命令运行该原理图：

```bash
ng generate @angular/core:ngstyle-to-style
```

只有一个键的对象会变成针对该样式属性的单个绑定。

#### 迁移前 {#before}

```html
<div [ngStyle]="{'background-color': 'red'}"></div>
```

#### 迁移后 {#after}

```html
<div [style.background-color]="'red'"></div>
```

有多个键的对象会变成单个 `[style]` 绑定。

#### 迁移前 {#multiple-keys-before}

```html
<div [ngStyle]="{'color': 'blue', 'font-weight': 'bold'}"></div>
```

#### 迁移后 {#multiple-keys-after}

```html
<div [style]="{'color': 'blue', 'font-weight': 'bold'}"></div>
```

## 配置选项 {#configuration-options}

此迁移（migration）支持一些选项，可以根据你的具体需求进行微调。

### `--best-effort-mode` {#best-effort-mode}

默认情况下，迁移会跳过 `NgStyle` 绑定到对象引用的用法。
启用 `--best-effort-mode` 标志后，绑定到对象引用的 `ngStyle` 实例也会被迁移。
这种迁移可能并不安全，例如当所绑定的对象会被修改时。

```html
<div [ngStyle]="styleObject"></div>
```

会变为

```html
<div [style]="styleObject"></div>
```
