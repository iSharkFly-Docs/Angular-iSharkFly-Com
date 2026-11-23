# Angular CLI {#the-angular-cli}

Angular CLI 是一个命令行界面工具，让你可以直接在命令行 Shell 中为 Angular 应用搭建脚手架、开发、测试、部署和维护。

Angular CLI 以 `@angular/cli` 包的形式发布在 npm 上，并包含一个名为 `ng` 的可执行文件。调用 `ng` 的命令使用的就是 Angular CLI。

::: tip 无需本地环境，直接试用 Angular
如果你刚接触 Angular，可以先从 [立即试用！](/tutorials/learn-angular) 开始。它会基于一个现成的简易在线商店应用，向你介绍 Angular 的核心内容，你可以在其中查看和修改代码。
这个独立教程借助交互式的 [StackBlitz](https://stackblitz.com) 环境进行在线开发。
在你准备好之前，无需搭建本地环境。
:::

- [**快速上手**](/tools/cli/setup-local)：安装 Angular CLI，创建并构建你的第一个应用。
- [**命令参考**](/cli)：了解各种 CLI 命令，让你使用 Angular 时更加高效。
- [**原理图**](/tools/cli/schematics)：创建并运行原理图（Schematic），自动生成和修改应用中的源文件。
- [**构建器**](/tools/cli/cli-builder)：创建并运行构建器（Builder），对源代码执行复杂的转换，生成构建产物。


## CLI 命令语法 {#cli-command-language-syntax}

Angular CLI 的选项语法大体遵循 Unix/POSIX 约定。

### 布尔选项 {#boolean-options}

布尔选项有两种形式：`--this-option` 将标志设为 `true`，`--no-this-option` 将其设为 `false`。
你也可以使用 `--this-option=false` 或 `--this-option=true`。
如果两种选项都没有提供，该标志会保持默认状态，默认值见参考文档。

### 数组选项 {#array-options}

数组选项可以用两种形式提供：`--option value1 value2` 或 `--option value1 --option value2`。

### 键/值选项 {#key-value-options}

有些选项（例如 `--define`）的值需要是一个由 `key=value` 键值对组成的数组。
与数组选项一样，键/值选项也可以用两种形式提供：
`--define 'KEY_1="value1"' KEY_2=true` 或 `--define 'KEY_1="value1"' --define KEY_2=true`。

### 相对路径 {#relative-paths}

指定文件的选项既可以使用绝对路径，也可以使用相对于当前工作目录的路径，当前工作目录通常是工作区根目录或项目根目录。
