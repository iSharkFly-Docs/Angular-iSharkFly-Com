# 导入语言环境数据的全局变体

如果你使用 `--localize` 选项运行 [`ng build`][CliBuild] 命令，[Angular CLI][CliMain] 会自动包含语言环境（locale）数据。

```shell
ng build --localize
```

::: tip 提示
Angular 的初始安装就已经包含了美国英语 \(`en-US`\) 的语言环境数据。
当你在 [`ng build`][CliBuild] 命令中使用 `--localize` 选项时，[Angular CLI][CliMain] 会自动包含语言环境数据并设置 `LOCALE_ID` 的值。

:::

npm 上的 `@angular/common` 包中含有语言环境数据文件。
语言环境数据的全局变体位于 `@angular/common/locales/global` 中。

## 法语的 `import` 示例

例如，你可以在引导应用的 `main.ts` 中导入法语 \(`fr`\) 的全局变体。

```ts [src/main.ts (import locale)]
import '@angular/common/locales/global/fr';
```

::: tip 提示
在基于 `NgModules` 的应用中，你应该在 `app.module` 中导入它。

:::

[CliMain]: cli 'CLI Overview and Command Reference | Angular'
[CliBuild]: cli/build 'ng build | CLI | Angular'
