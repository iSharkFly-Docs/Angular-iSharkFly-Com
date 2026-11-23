# Angular 语言服务

Angular 语言服务（Language Service）为代码编辑器提供了在 Angular 模板（Template）中获取补全、错误、提示和导航的能力。
它既适用于独立 HTML 文件中的外部模板，也适用于内联模板。

## 为 Angular 语言服务配置编译器选项

要启用最新的语言服务特性，请在 `tsconfig.json` 中将 `strictTemplates` 选项设置为 `true`，如下例所示：

```json

"angularCompilerOptions": {
  "strictTemplates": true
}

```

更多信息，请参阅 [Angular 编译器选项](/reference/configs/angular-compiler-options)指南。

## 特性

你的编辑器会自动检测你正在打开的是 Angular 文件。
然后，它会使用 Angular 语言服务读取你的 `tsconfig.json` 文件，找出应用中的所有模板，并为你打开的任何模板提供语言服务。

语言服务包括：

- 补全列表
- AOT 诊断消息
- 快速信息
- 转到定义

### 自动补全

自动补全会在你输入时提供上下文相关的候选项和提示，从而加快开发速度。
这个例子展示了插值（Interpolation）中的自动补全。
输入时，你可以按 Tab 键完成补全。

<img alt="autocompletion" src="/assets/images/guide/language-service/language-completion.gif">

元素内部同样支持补全。
任何作为组件（Component）选择器的元素都会出现在补全列表中。

### 错误检查

Angular 语言服务可以提前警告你代码中的错误。
在这个例子中，Angular 不知道 `orders` 是什么，也不知道它从何而来。

<img alt="error checking" src="/assets/images/guide/language-service/language-error.gif">

### 快速信息和导航

快速信息功能让你在悬停时就能看到组件、指令（Directive）和模块的来源。
然后，你可以点击 "Go to definition" 或按 F12 直接跳转到定义处。

<img alt="navigation" src="/assets/images/guide/language-service/language-navigation.gif">

## 在编辑器中使用 Angular 语言服务

Angular 语言服务目前以扩展的形式提供给 [Visual Studio Code](https://code.visualstudio.com)、[WebStorm](https://www.jetbrains.com/webstorm)、[Sublime Text](https://www.sublimetext.com)、[Zed](https://zed.dev)、[Neovim](https://neovim.io) 和 [Eclipse IDE](https://www.eclipse.org/eclipseide)。

::: info 注意
Angular 团队负责维护和发布 Visual Studio Code 扩展，它支持 Visual Studio Code 以及基于 VS Code 的编辑器（例如 Cursor 和 Antigravity）。其他编辑器的集成由各自的编辑器厂商或社区维护。与这些集成相关的问题，请向其维护者报告。

:::

### Visual Studio Code

在 [Visual Studio Code](https://code.visualstudio.com) 中，从[扩展市场](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)安装该扩展。
你可以通过左侧菜单栏中的扩展图标在编辑器中打开扩展市场，也可以使用 VS 快速打开（Mac 上按 ⌘+P，Windows 上按 CTRL+P）并输入 "? ext"。
在扩展市场中搜索 Angular Language Service 扩展，然后点击 **Install** 按钮。

Visual Studio Code 与 Angular 语言服务的集成由 Angular 团队维护和发布。

### Visual Studio

在 [Visual Studio](https://visualstudio.microsoft.com) 中，从[扩展市场](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.AngularLanguageService)安装该扩展。
在编辑器顶部菜单栏中选择 Extensions，再选择 Manage Extensions，即可打开扩展市场。
在扩展市场中搜索 Angular Language Service 扩展，然后点击 **Install** 按钮。

Visual Studio 与 Angular 语言服务的集成由 Microsoft 在 Angular 团队的协助下维护和发布。
请在[这里](https://github.com/microsoft/vs-ng-language-service)查看该项目。

### WebStorm

在 [WebStorm](https://www.jetbrains.com/webstorm) 中，启用 [Angular and AngularJS](https://plugins.jetbrains.com/plugin/6971-angular-and-angularjs) 插件。

从 WebStorm 2019.1 开始，已不再需要 `@angular/language-service`，应将其从 `package.json` 中移除。

### Sublime Text

在 [Sublime Text](https://www.sublimetext.com) 中，以插件形式安装的语言服务仅支持内联模板。
如果要在 HTML 文件中获得补全，你需要一个自定义的 Sublime 插件（或修改当前插件）。

要为内联模板使用语言服务，你必须先添加一个支持 TypeScript 的扩展，然后安装 Angular 语言服务插件。
从 TypeScript 2.3 开始，TypeScript 提供了一种可供语言服务使用的插件模型。

1. 在本地 `node_modules` 目录中安装最新版本的 TypeScript：

   ```shell
   npm install --save-dev typescript
   ```

1. 在同一位置安装 Angular 语言服务包：

   ```shell

   npm install --save-dev @angular/language-service

   ```

1. 安装好该包后，将以下内容添加到项目 `tsconfig.json` 的 `"compilerOptions"` 部分中。

   ```json [tsconfig.json]
   "plugins": [
     {"name": "@angular/language-service"}
   ]
   ```

1. 在编辑器的用户偏好设置（`Cmd+,` 或 `Ctrl+,`）中，添加以下内容：

   ```json [Sublime Text user preferences]

   "typescript-tsdk": "<path to your folder>/node_modules/typescript/lib"

   ```

这样，Angular 语言服务就能在 `.ts` 文件中提供诊断和补全了。

### Eclipse IDE

你可以直接安装自带 Angular Language Server 的 "Eclipse IDE for Web and JavaScript developers" 包；如果使用其他 Eclipse IDE 包，则可以通过 Help > Eclipse Marketplace 查找并安装 [Eclipse Wild Web Developer](https://marketplace.eclipse.org/content/wild-web-developer-html-css-javascript-typescript-nodejs-angular-json-yaml-kubernetes-xml)。

### Neovim

#### 通过 Node.js 使用 Conquer of Completion

Angular 语言服务使用 tsserver，而 tsserver 并不完全遵循 LSP 规范。因此，如果你在 neovim 或 vim 中使用 JavaScript、TypeScript 或 Angular，你可能会发现 [Conquer of Completion](https://github.com/neoclide/coc.nvim)（COC）对 Angular 语言服务和 tsserver 的实现最为完整。这是因为 COC 移植了 VSCode 对 tsserver 的实现，而该实现适配了 tsserver 的特殊之处。

1. [设置 coc.nvim](https://github.com/neoclide/coc.nvim)

2. 配置 Angular 语言服务

   安装完成后，运行 vim 命令行命令 `CocConfig` 打开配置文件 `coc-settings.json`，并添加 angular 属性。

   请务必将路径替换为你全局 `node_modules` 的正确路径，使它们分别指向包含 `tsserver` 和 `ngserver` 的目录。

   ```json [CocConfig example file coc-settings.json]
   {
     "languageserver": {
       "angular": {
         "command": "ngserver",
         "args": [
           "--stdio",
           "--tsProbeLocations",
           "/usr/local/lib/node_modules/typescript/lib/CHANGE/THIS/TO/YOUR/GLOBAL/NODE_MODULES",
           "--ngProbeLocations",
           "/usr/local/lib/node_modules/@angular/language-server/bin/CHANGE/THIS/TO/YOUR/GLOBAL/NODE_MODULES"
         ],
         "filetypes": ["ts", "typescript", "html"],
         "trace.server.verbosity": "verbose"
       }
     }
   }
   ```

::: tip 提示
上面的 `/usr/local/lib/node_modules/typescript/lib` 和 `/usr/local/lib/node_modules/@angular/language-server/bin` 应指向你全局 node 模块的位置，该位置可能有所不同。

:::

#### Neovim 内置 LSP

借助 [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig) 插件，可以在 Neovim 中使用 Angular 语言服务。

1. [安装 nvim-lspconfig](https://github.com/neovim/nvim-lspconfig?tab=readme-ov-file#install)

2. [为 nvim-lspconfig 配置 angularls](https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md#angularls)

### Zed

在 [Zed](https://zed.dev) 中，从[扩展市场](https://zed.dev/extensions/angular)安装由社区维护的扩展。

## 语言服务的工作原理

当你使用带有语言服务的编辑器时，编辑器会启动一个独立的语言服务进程，并通过 [RPC](https://en.wikipedia.org/wiki/Remote_procedure_call) 使用[语言服务器协议（Language Server Protocol）](https://microsoft.github.io/language-server-protocol)与之通信。
当你在编辑器中输入时，编辑器会把信息发送给语言服务进程，以跟踪项目的状态。

当你在模板中触发补全列表时，编辑器会先把模板解析成 HTML [抽象语法树（AST）](https://en.wikipedia.org/wiki/Abstract_syntax_tree)。
Angular 编译器会解析这棵树来确定上下文：模板属于哪个模块、当前作用域、组件选择器，以及光标在模板 AST 中的位置。
然后，它就能确定该位置上可能出现的符号。

如果你处于插值中，情况会稍微复杂一些。
如果 `div` 中有一个插值 `{{data.---}}`，并且你需要 `data.---` 之后的补全列表，编译器就无法使用 HTML AST 来找到答案。
HTML AST 只能告诉编译器，这里有一段包含字符 "`{{data.---}}`" 的文本。
这时，模板解析器会生成一个表达式 AST，它位于模板 AST 之中。
接着，Angular 语言服务会在上下文中查看 `data.---`，向 TypeScript 语言服务询问 `data` 有哪些成员，并返回可能的候选列表。

## 更多信息

- 关于实现的更深入信息，请参阅 [Angular 语言服务源码](https://github.com/angular/angular/blob/main/packages/language-service/src)
- 关于设计上的考量和意图，请参阅[这里的设计文档](https://github.com/angular/vscode-ng-language-service/wiki/Design)
