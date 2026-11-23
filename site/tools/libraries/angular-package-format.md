# Angular 包格式 {#angular-package-format}

本文档介绍 Angular 包格式（Angular Package Format，APF）。
APF 是 Angular 特有的一套规范，规定了 npm 包的结构和格式，所有 Angular 官方包（`@angular/core`、`@angular/material` 等）以及大多数第三方 Angular 库都在使用它。

APF 让包能够在大多数常见的 Angular 使用场景下无缝工作。
使用 APF 的包既兼容 Angular 团队提供的工具，也兼容更广泛的 JavaScript 生态系统。
建议第三方库的开发者也遵循同样的 npm 包格式。

::: tip 提示
APF 的版本与 Angular 其余部分同步，每个主版本都会改进包格式。
v13 之前的规范版本可以在这份 [Google 文档](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview) 中找到。

:::

## 为什么要规定包格式？ {#why-specify-a-package-format}

在当今的 JavaScript 生态中，开发者会以许多不同的方式、借助许多不同的工具链（webpack、Rollup、Rolldown、esbuild 等）来使用包。
这些工具能够理解和需要的输入可能各不相同——有些工具可以处理最新的 ES 语言版本，而另一些工具直接使用较旧的 ES 版本可能效果更好。

Angular 的分发格式支持所有常用的开发工具和工作流，并着重进行优化，以减小应用的载荷体积或加快开发迭代周期（构建时间）。

开发者可以依靠 Angular CLI 来生成符合 Angular 包格式的包。
详情请参阅 [创建库](/tools/libraries/creating-libraries) 指南。

## 文件布局 {#file-layout}

下面的例子展示了 `@angular/core` 包文件布局的简化版本，并对包中的每个文件进行了说明。

```markdown
node_modules/@angular/core
├── README.md
├── package.json
├── fesm2022
│ ├── core.mjs
│ ├── core.mjs.map
│ ├── testing.mjs
│ └── testing.mjs.map
└── types
│ ├── core.d.ts
│ ├── testing.d.ts
```

下表描述了 `node_modules/@angular/core` 下的文件布局，并注明了各个文件和目录的用途：

| 文件 | 用途 |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md` | 包的 README，供 npmjs 网页界面使用。 |
| `package.json` | 主 `package.json`，描述包本身以及所有可用的入口点和代码格式。该文件包含 "exports" 映射，运行时和工具会用它来进行模块解析。 |
| `fesm2022/` <br /> &nbsp;&nbsp;─ `core.mjs` <br /> &nbsp;&nbsp;─ `core.mjs.map` <br /> &nbsp;&nbsp;─ `testing.mjs` <br /> &nbsp;&nbsp;─ `testing.mjs.map` | 所有入口点的代码，采用扁平化（FESM）的 ES2022 格式，并附带源码映射（source map）。 |
| `types/` <br /> &nbsp;&nbsp;─ `core.d.ts` <br /> &nbsp;&nbsp;─ `testing.d.ts` | 所有公共入口点的打包后的 TypeScript 类型定义。 |

### `package.json` {#package-json}

主 `package.json` 包含重要的包元数据，包括以下内容：

- 它 [声明](#esm-declaration) 该包采用 EcmaScript 模块（ESM）格式
- 它包含一个 `"exports"` 字段，定义了所有入口点可用的源代码格式
- 它包含一些 [键](#legacy-resolution-keys)，为不理解 `"exports"` 的工具定义主入口点 `@angular/core` 可用的源代码格式。
  这些键被视为已弃用，随着生态系统对 `"exports"` 的支持逐步普及，它们可能会被移除。

- 它声明该包是否包含 [副作用](#side-effects)

### ESM 声明 {#esm-declaration}

顶层的 `package.json` 包含以下键：

```js
{
  "type": "module"
}
```

它告诉解析器，包中的代码使用的是 EcmaScript 模块，而不是 CommonJS 模块。

### `"exports"` {#exports}

`"exports"` 字段的结构如下：

```js
"exports": {
  "./schematics/*": {
    "default": "./schematics/*.js"
  },
  "./package.json": {
    "default": "./package.json"
  },
  ".": {
    "types": "./types/core.d.ts",
    "default": "./fesm2022/core.mjs"
  },
  "./testing": {
    "types": "./types/testing.d.ts",
    "default": "./fesm2022/testing.mjs"
  }
}
```

其中最主要的是 `"."` 和 `"./testing"` 这两个键，它们分别定义了主入口点 `@angular/core` 和次级入口点 `@angular/core/testing` 可用的代码格式。
每个入口点可用的格式如下：

| 格式 | 详情 |
| :------------------------ | :---------------------------------------------------------------------- |
| 类型定义（`.d.ts` 文件） | 依赖某个包时，TypeScript 会使用 `.d.ts` 文件。 |
| `default` | 扁平化为单个源文件的 ES2022 代码。 |

能够识别这些键的工具，可以优先从 `"exports"` 中选择合适的代码格式。

你可能还想公开一些额外的静态文件，比如 Sass mixin 或预编译的 CSS，它们并不属于基于 JavaScript 的入口点。

更多信息请参阅 [在库中管理资源](/tools/libraries/creating-libraries#managing-assets-in-a-library)。

### 旧版解析键 {#legacy-resolution-keys}

除了 `"exports"` 之外，顶层的 `package.json` 还为不支持 `"exports"` 的解析器定义了旧版模块解析键。
对于 `@angular/core`，这些键是：

```js
{
  "module": "./fesm2022/core.mjs",
  "typings": "./types/core.d.ts",
}
```

如上面的代码片段所示，模块解析器可以使用这些键来加载特定的代码格式。

### 副作用 {#side-effects}

`package.json` 的最后一项作用是声明该包是否具有 [副作用](#sideeffects-flag)。

```js
{
  "sideEffects": false
}
```

大多数 Angular 包都不应依赖顶层副作用，因此应该包含这一声明。

### 入口点与代码拆分 {#entrypoints-and-code-splitting}

采用 Angular 包格式的包包含一个主入口点，以及零个或多个次级入口点（例如 `@angular/common/http`）。
入口点有多种作用。

1. 它们定义了用户导入代码时所用的模块说明符（例如 `@angular/core` 和 `@angular/core/testing`）。

   用户通常会把这些入口点看作不同的符号分组，各自具有不同的用途或能力。

   某些特定的入口点可能只用于特殊用途，例如测试。
   把这类 API 从主入口点中分离出来，可以降低它们被意外或错误使用的可能性。

1. 它们定义了代码可以被延迟加载的粒度。

   许多现代构建工具只能在 ES 模块级别进行「代码拆分」（也称为延迟加载（Lazy Loading））。
   Angular 包格式主要为每个入口点使用单个「扁平」的 ES 模块。这意味着大多数构建工具无法把单个入口点的代码拆分成多个输出块。

APF 包的一般原则是：为尽可能小的、逻辑上相关联的代码集合使用入口点。
例如，Angular Material 包会把每个逻辑组件或组件集合发布为单独的入口点——一个用于 Button，一个用于 Tabs，等等。
这样，在需要时每个 Material 组件都可以单独延迟加载。

并非所有库都需要这样的粒度。
大多数只有单一逻辑用途的库，都应该作为单个入口点发布。
例如，`@angular/core` 为运行时使用单个入口点，因为 Angular 运行时通常是作为一个整体来使用的。

#### 次级入口点的解析 {#resolution-of-secondary-entry-points}

模块解析器会使用包中 `package.json` 文件的 `"exports"` 字段来解析次级入口点。

要了解如何在库中配置次级入口点，请参阅 [入口点](/tools/libraries/creating-libraries#entry-points)。

### README.md {#readme-md}

Markdown 格式的 README 文件，用于在 npm 和 GitHub 上显示包的描述。

@angular/core 包的 README 内容示例：

```html
Angular &equals;&equals;&equals;&equals;&equals;&equals;&equals; The sources for this package are in
the main [Angular](https://github.com/angular/angular) repo.Please file issues and pull requests
against that repo. License: MIT
```

## 库的编译与包优化 {#library-compilation-and-package-optimizations}

本节介绍库的编译过程，以及在把构建产物发布到注册表之前对 npm 包所做的优化。

### 部分编译 {#partial-compilation}

采用 Angular 包格式的库必须以「部分编译」模式发布。
这是 `ngc` 的一种编译模式，它生成的已编译 Angular 代码不与特定的 Angular 运行时版本绑定；与之相对的是应用所使用的完全编译，在完全编译中，Angular 编译器和运行时的版本必须完全一致。

要部分编译 Angular 代码，请在 `tsconfig.json` 的 `angularCompilerOptions` 属性中使用 `compilationMode` 标志：

```js
{
  …
  "angularCompilerOptions": {
    "compilationMode": "partial",
  }
}
```

随后，在应用构建过程中，Angular CLI 会把部分编译的库代码转换为完全编译的代码。

如果你的构建流水线没有使用 Angular CLI，请参阅 [在 Angular CLI 之外使用部分编译的 Ivy 代码](/tools/libraries/creating-libraries#consuming-partial-ivy-code-outside-the-angular-cli) 指南。

### ES 模块的扁平化 {#flattening-of-es-modules}

Angular 包格式规定，代码必须以「扁平化」的 ES 模块格式发布。
这可以显著缩短 Angular 应用的构建时间，以及最终应用包的下载和解析时间。
请阅读 Nolan Lawson 的精彩文章 [《The cost of small modules》](https://nolanlawson.com/2016/08/15/the-cost-of-small-modules)。

FESM 是一种文件格式，它把从某个入口点可访问到的所有 ES 模块扁平化为单个 ES 模块。
它的生成方式是：沿着包中的所有导入，把相应代码复制到单个文件中，同时保留所有公共的 ES 导出，并移除所有私有导入。
不过，在某些情况下，FESM 可能会依赖在多个入口点之间共享的共享块。

缩写 FESM 读作 _phe-som_，后面可以跟一个数字，例如 FESM2022。
这个数字表示模块内 JavaScript 的语言级别。
因此，FESM2022 文件就是 ESM+ES2022，包含 import/export 语句和 ES2022 源代码。

使用 Angular CLI（`@angular/build:library`）构建时，构建器会用 `ngc` 编译你的库，并使用 Rolldown 把每个入口点直接打包成扁平化的 ES2022 模块，放在 `fesm2022/` 目录中。

### "sideEffects" 标志 {#sideeffects-flag}

默认情况下，EcmaScript 模块是有副作用的：从某个模块导入时，会确保该模块顶层的所有代码都被执行。
这往往并不理想，因为典型模块中的大部分「有副作用」的代码并不真正具有副作用，而只是影响特定的符号。
如果这些符号没有被导入和使用，通常希望在一个称为摇树优化（tree-shaking）的优化过程中把它们移除，而有副作用的代码会妨碍这一点。

webpack 等构建工具支持一个标志，允许包声明它们不依赖模块顶层的副作用代码，从而让工具能够更自由地对包中的代码进行摇树优化。
这些优化的最终结果应该是更小的包体积，以及代码拆分后在各个块中更好的代码分布。
如果你的代码包含非局部副作用，这项优化可能会破坏你的代码——不过这在 Angular 应用中并不常见，而且通常是设计不良的表现。
我们建议所有包都把 `sideEffects` 属性设为 `false` 来声明自己无副作用，并建议开发者遵循 [Angular 风格指南](/style-guide)，这样自然就能写出没有非局部副作用的代码。

更多信息：[webpack 关于副作用的文档](https://github.com/webpack/webpack/tree/main/examples/side-effects)

### ES2022 语言级别 {#es2022-language-level}

ES2022 语言级别现在是 Angular CLI 和其他工具默认使用的语言级别。
Angular CLI 会在应用构建时，把包降级到所有目标浏览器都支持的语言级别。

### 类型定义的扁平化（`.d.ts` 打包） {#flattening-of-type-definitions-d-ts-bundling}

从 APF v8 开始，建议对 TypeScript 类型定义进行打包。
打包类型定义可以显著加快用户的编译速度，尤其是在你的库中有许多单独的 `.ts` 源文件时。

Angular 使用 [`rolldown-plugin-dts`](https://github.com/sxzz/rolldown-plugin-dts) 来扁平化 `.d.ts` 文件（使用 `rolldown`，与创建 FESM 文件的方式类似）。

使用 rolldown 打包 `.d.ts` 的好处在于它支持在入口点之间进行代码拆分。
例如，假设你有多个入口点依赖同一个共享类型，那么除了较大的扁平化 `.d.ts` 文件之外，还会创建一个共享的 `.d.ts` 文件。
这正是我们想要的，可以避免类型重复。

### Tslib {#tslib}

从 APF v10 开始，只要库的编译输出从 `tslib` 导入运行时辅助函数，就建议把 `tslib` 列为库的直接依赖。
这是因为 `tslib` 的版本与编译库时所用的 TypeScript 版本绑定。
使用 `@angular/build:library` 构建时，如果编译后的代码导入了 `tslib`，构建器会自动把 `tslib` 添加到生成的 `package.json` 的 `dependencies` 中。

## 示例 {#examples}

Angular 框架的 npm 包，是符合 APF 的库包的良好参考。
可以在 UNPKG 上浏览它们的文件布局和 npm 包：

- [@angular/core 包](https://app.unpkg.com/@angular/core@latest)
- [@angular/material 包](https://app.unpkg.com/@angular/material@latest)


## 术语定义 {#definition-of-terms}

本文档中有意使用了以下术语。
本节给出所有这些术语的定义，以便更清楚地说明。

### 包 {#package}

发布到 npm 并一起安装的最小文件集合，例如 `@angular/core`。
这个包包含一个名为 package.json 的清单、已编译的源代码、TypeScript 定义文件、源码映射、元数据等。
使用 `npm install @angular/core` 安装该包。

### 符号 {#symbol}

包含在模块中的类、函数、常量或变量，可以通过模块导出让外部可见。

### 模块 {#module}

ECMAScript 模块的简称。
一个包含导入和导出符号语句的文件。
这与 ECMAScript 规范中对模块的定义完全相同。

### ESM {#esm}

ECMAScript 模块（ECMAScript Modules）的简称（见上文）。

### FESM {#fesm}

扁平化 ES 模块（Flattened ES Modules）的简称，是一种把从某个入口点可访问到的所有 ES 模块扁平化为单个 ES 模块而生成的文件格式。
注意，FESM 通常是单个文件，但它可能依赖一个与其他 FESM 共享的共享块。

### 模块 ID {#module-id}

在导入语句中使用的模块标识符（例如 `@angular/core`）。
ID 通常直接对应文件系统上的某个路径，但由于存在各种模块解析策略，情况并非总是如此。

### 模块说明符 {#module-specifier}

即模块标识符（见上文）。

### 模块解析策略 {#module-resolution-strategy}

用于把模块 ID 转换为文件系统路径的算法。
Node.js 有一种规范明确且被广泛使用的策略，TypeScript 支持多种模块解析策略，而 [Closure Compiler](https://developers.google.com/closure/compiler) 又有另一种策略。

### 模块格式 {#module-format}

模块语法的规范，至少涵盖从文件中导入和导出的语法。
常见的模块格式有 CommonJS（CJS，通常用于 Node.js 应用）和 ECMAScript 模块（ESM）。
模块格式只表示单个模块的封装方式，而不表示构成模块内容所用的 JavaScript 语言特性。
因此，Angular 团队经常在模块格式后面加上语言级别说明符作为后缀（例如，ESM+ES2022 表示该模块采用 ESM 格式并包含 ES2022 代码）。

### 包（Bundle） {#bundle}

由构建工具（例如 [webpack](https://webpack.js.org) 或 [Rollup](https://rollupjs.org)）生成的单个 JS 文件形式的构建产物，其中包含来自一个或多个模块的符号。
包是一种针对浏览器的变通方案，用来减轻浏览器下载成百上千甚至上万个文件时所造成的网络压力。
Node.js 通常不使用包。
常见的包格式有 UMD 和 System.register。

### 语言级别 {#language-level}

代码所用的语言（ES2022）。
与模块格式无关。

### 入口点 {#entry-point}

供用户导入的模块。
它通过唯一的模块 ID 来引用，并导出该模块 ID 所对应的公共 API。
例如 `@angular/core` 或 `@angular/core/testing`。
这两个入口点都存在于 `@angular/core` 包中，但它们导出的符号不同。
一个包可以有多个入口点。

### 深层导入 {#deep-import}

从非入口点的模块中获取符号的过程。
这些模块 ID 通常被视为私有 API，在项目的生命周期中，或者在为指定包创建打包产物时，它们都可能发生变化。

### 顶层导入 {#top-level-import}

来自入口点的导入。
可用的顶层导入定义了公共 API，并通过 "@angular/name" 模块公开，例如 `@angular/core` 或 `@angular/common`。

### 摇树优化 {#tree-shaking}

识别并移除应用未使用代码的过程，也称为死代码消除。
这是一种在应用层面进行的全局优化，使用 [Rollup](https://rollupjs.org)、[Rolldown](https://rolldown.rs/)、[Closure Compiler](https://developers.google.com/closure/compiler) 或 [Terser](https://github.com/terser/terser) 等工具来完成。

### AOT 编译器 {#aot-compiler}

Angular 的预先（Ahead of Time）编译器。

### 扁平化类型定义 {#flattened-type-definitions}

使用 [API Extractor](https://api-extractor.com) 或 [`rolldown-plugin-dts`](https://github.com/sxzz/rolldown-plugin-dts) 等工具生成的打包后的 TypeScript 类型定义。
