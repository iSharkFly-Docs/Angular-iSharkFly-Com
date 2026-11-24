# 添加 localize 包 {#add-the-localize-package}

要使用 Angular 的本地化功能，请使用 [Angular CLI][CliMain] 把 `@angular/localize` 包添加到项目中。

要添加 `@angular/localize` 包，请使用下面的命令更新项目中的 `package.json` 和 TypeScript 配置文件。

```shell [commands.sh]
ng add @angular/localize
```

它会在 TypeScript 配置文件中添加 `types: ["@angular/localize"]`。
它还会在 `main.ts` 文件顶部添加一行 `/// <reference types="@angular/localize" />`，作为对类型定义的引用。

::: tip 提示
关于 `package.json` 和 `tsconfig.json` 文件的更多信息，请参阅[工作区 npm 依赖][GuideNpmPackages]和 [TypeScript 配置][GuideTsConfig]。要了解三斜线指令（Triple-slash Directives），请访问 [TypeScript 手册](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-)。

:::

如果没有安装 `@angular/localize`，而你尝试构建项目的本地化版本（例如在模板（Template）中使用了 `i18n` 属性时），[Angular CLI][CliMain] 会生成一个错误，其中会包含为项目启用国际化（i18n）可以采取的步骤。

## 选项 {#options}

| 选项               | 说明                                                                                                                                       | 值类型     | 默认值        |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :------------ |
| `--project`        | 项目的名称。                                                                                                                               | `string`   |
| `--use-at-runtime` | 如果设置，则可以在运行时使用 `$localize`。此外，`@angular/localize` 会被添加到 `package.json` 的 `dependencies` 部分，而不是默认的 `devDependencies`。 | `boolean`  | `false`       |

更多可用选项，请参阅 [Angular CLI][CliMain] 中的 `ng add`。

## 下一步 {#what-s-next}

- [通过 ID 引用语言环境](/guide/i18n/locale-id)


[CliMain]: cli 'CLI Overview and Command Reference | Angular'
[GuideNpmPackages]: reference/configs/npm-packages 'Workspace npm dependencies | Angular'
[GuideTsConfig]: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html 'TypeScript Configuration'
