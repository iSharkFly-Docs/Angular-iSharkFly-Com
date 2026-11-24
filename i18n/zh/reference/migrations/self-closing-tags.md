# 迁移到自闭合标签

从 [v16](https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d#7065) 开始，Angular 模板就支持自闭合标签了。

此原理图（Schematic）会把应用中的模板迁移为使用自闭合标签。

使用以下命令运行该原理图：

```shell
ng generate @angular/core:self-closing-tag
```

#### 迁移前

```html
<hello-world></hello-world>
```

#### 迁移后

```html
<hello-world />
```
