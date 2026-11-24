# Angular 编译器选项

使用[预先（AOT）编译（ahead-of-time compilation）](/tools/cli/aot-compiler)时，你可以在 [TypeScript 配置文件](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)中指定 Angular 编译器选项，以控制应用的编译方式。

Angular 选项对象 `angularCompilerOptions` 与 `compilerOptions` 对象是同级的，后者为 TypeScript 编译器提供标准选项。

```json [tsconfig.json]
{
  "compileOnSave": false,
  "compilerOptions": {
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
  }
}
```

## 使用 `extends` 继承配置

与 TypeScript 编译器一样，Angular AOT 编译器也支持在 TypeScript 配置文件的 `angularCompilerOptions` 部分中使用 `extends`。
`extends` 属性位于顶层，与 `compilerOptions` 和 `angularCompilerOptions` 平级。

TypeScript 配置可以通过 `extends` 属性从另一个文件继承设置。
系统会先加载基础文件中的配置选项，然后用继承方配置文件中的选项覆盖它们。

例如：

```json [tsconfig.app.json]
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
  },
  "angularCompilerOptions": {
    "preserveWhitespaces": true,
  }
}
```

更多信息，请参阅 [TypeScript 手册](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)。

## 模板选项

以下选项可用于配置 Angular AOT 编译器。

### `annotationsAs`

修改 Angular 专属注解的生成方式，以改进摇树优化（tree-shaking）。
非 Angular 注解不受影响。
取值为 `static fields` 或 `decorators` 之一。默认值为 `static fields`。

- 默认情况下，编译器会把装饰器替换为类中的静态字段，这使得 [Closure compiler](https://github.com/google/closure-compiler) 等高级摇树优化工具能够移除未使用的类
- `decorators` 值会保留装饰器，从而使编译更快。
  TypeScript 会生成对 `__decorate` 辅助函数的调用。
  使用 `--emitDecoratorMetadata` 以支持运行时反射。

  ::: tip 提示
  这样生成的代码无法被正确地摇树优化。

  :::

### `annotateForClosureCompiler`

<!-- vale Angular.Angular_Spelling = NO -->

为 `true` 时，使用 [Tsickle](https://github.com/angular/tsickle) 为生成的 JavaScript 添加 [Closure Compiler](https://github.com/google/closure-compiler) 所需的 [JSDoc](https://jsdoc.app) 注释。
默认为 `false`。

<!-- vale Angular.Angular_Spelling = YES -->

### `compilationMode`

指定要使用的编译模式。
可用的模式如下：

| 模式 | 详情 |
| :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'full'` | 生成完全 AOT 编译的代码。编译器 ABI（这些代码所使用的内部运行时 API）在同一次版本的各个补丁版本之间保持稳定。 |
| `'partial'` | 生成一种稳定但属于中间形态的代码，适用于独立发布的库。 |

默认值为 `'full'`。

对于大多数应用来说，`'full'` 是正确的编译模式。

对于独立发布的库（例如 NPM 包），请使用 `'partial'`。
`'partial'` 编译会输出一种稳定的中间格式，能更好地支持那些与库所用 Angular 主版本或次版本不同的应用使用该库。
与应用一起在 "HEAD" 上构建、并使用相同 Angular 版本的库（例如在单体仓库（mono-repository）中）可以使用 `'full'`，因为不存在跨次版本的版本偏差风险。请注意，编译器 ABI 在同一次版本的各个补丁版本之间是稳定的，因此在微前端架构中，即使不同应用处于不同的补丁级别，也可以安全地共享 Angular 运行时。

### `disableTypeScriptVersionCheck`

为 `true` 时，编译器不会检查 TypeScript 版本，使用了不受支持的 TypeScript 版本时也不会报错。
不推荐这样做，因为不受支持的 TypeScript 版本可能存在未定义的行为。
默认为 `false`。

### `enableI18nLegacyMessageIdFormat`

指示 Angular 模板编译器为模板中通过 `i18n` 属性标记的消息创建旧版 ID。
关于如何标记消息以进行本地化，请参阅[标记要翻译的文本][GuideI18nCommonPrepareMarkTextInComponentTemplate]。

除非你的项目依赖于之前使用旧版 ID 创建的翻译，否则请把此选项设为 `false`。
默认为 `true`。

Ivy 之前的消息提取工具会为提取出的消息 ID 生成多种旧版格式。
这些消息格式存在一些问题，例如空白字符的处理方式，以及依赖于模板原始 HTML 中的信息。

新的消息格式对空白字符的变化更具弹性，在所有翻译文件格式中都保持一致，并且可以直接通过调用 `$localize` 来创建。
这使得应用代码中的 `$localize` 消息可以与组件模板中相同的 `i18n` 消息使用相同的 ID。

::: warning 重要
此选项仅受 `@angular-devkit/build-angular:browser` 构建器（builder）支持。
使用 `@angular/build:application` 构建器（esbuild）时，此选项不起作用，无论如何设置，都会始终使用新的十进制消息 ID 格式。

:::

### `enableResourceInlining`

为 `true` 时，会把所有 `@Component` 装饰器中的 `templateUrl` 和 `styleUrls` 属性替换为 `template` 和 `styles` 属性中的内联内容。

启用后，`ngc` 输出的 `.js` 中不会包含任何延迟加载的模板或样式 URL。

### `flatModuleId`

导入扁平模块时使用的模块 ID（当 `flatModuleOutFile` 为 `true` 时）。
模板编译器在从扁平模块导入符号时，所创建的引用会使用此模块名。
如果 `flatModuleOutFile` 为 `false`，则忽略此选项。

### `flatModuleOutFile`

为 `true` 时，以给定的文件名生成扁平模块索引及相应的扁平模块元数据。
用于创建与 `@angular/core` 和 `@angular/common` 打包方式类似的扁平模块。
使用此选项时，库的 `package.json` 应引用所创建的扁平模块索引，而不是库的索引文件。

只生成一个 `.metadata.json` 文件，其中包含从库索引导出的符号所需的全部元数据。
在所创建的 `.ngfactory.js` 文件中，会使用扁平模块索引来导入符号。这些符号既包括库索引中的公共 API，也包括被隐藏的内部符号。

默认情况下，`files` 字段中提供的 `.ts` 文件会被视为库索引。
如果指定了多个 `.ts` 文件，则使用 `libraryIndex` 来选择要使用的文件。
如果提供了多个 `.ts` 文件却没有指定 `libraryIndex`，则会报错。

扁平模块索引的 `.d.ts` 和 `.js` 文件会以给定的 `flatModuleOutFile` 名称创建，位置与库索引的 `.d.ts` 文件相同。

例如，如果某个库使用 `public_api.ts` 文件作为模块的库索引，那么 `tsconfig.json` 的 `files` 字段就是 `["public_api.ts"]`。
然后可以把 `flatModuleOutFile` 选项设为 `"index.js"` 等值，从而生成 `index.d.ts` 和 `index.metadata.json` 文件。
库的 `package.json` 中的 `module` 字段将是 `"index.js"`，`typings` 字段将是 `"index.d.ts"`。

### `generateCodeForLibraries`

为 `true` 时，会为带有对应 `.metadata.json` 文件的 `.d.ts` 文件创建工厂文件（`.ngfactory.js` 和 `.ngstyle.js`）。默认值为 `true`。

为 `false` 时，只为 `.ts` 文件创建工厂文件。
使用工厂摘要（factory summaries）时应这样设置。

### `preserveWhitespaces`

为 `false`（默认值）时，会从编译后的模板中移除空白文本节点，从而使生成的模板工厂模块更小。
设为 `true` 可保留空白文本节点。

::: tip 提示
使用水合（Hydration）时，建议使用 `preserveWhitespaces: false`，这也是默认值。如果你选择在 tsconfig 中添加 `preserveWhitespaces: true` 来保留空白字符，则可能会在水合时遇到问题。这还不是一种完全受支持的配置。请确保在服务端和客户端的 tsconfig 文件中一致地设置此选项。更多详情请参阅[水合指南](/guide/hydration#preserve-whitespaces-configuration)。

:::

### `skipMetadataEmit`

为 `true` 时，不生成 `.metadata.json` 文件。
默认为 `false`。

`.metadata.json` 文件包含模板编译器从 `.ts` 文件中所需、但未包含在 TypeScript 编译器生成的 `.d.ts` 文件中的信息。
例如，这些信息包括注解的内容（如组件的模板），TypeScript 会把它们输出到 `.js` 文件中，但不会输出到 `.d.ts` 文件中。

使用工厂摘要时，可以设为 `true`，因为工厂摘要中包含了 `.metadata.json` 文件中信息的副本。

如果你在使用 TypeScript 的 `--outFile` 选项，请设为 `true`，因为元数据文件对这种 TypeScript 输出方式无效。
Angular 社区不建议在 Angular 中使用 `--outFile`。
请改用打包工具，例如 [webpack](https://webpack.js.org)。

### `skipTemplateCodegen`

为 `true` 时，不生成 `.ngfactory.js` 和 `.ngstyle.js` 文件。
这会关闭模板编译器的大部分功能，并禁用模板诊断信息的报告。

可用于指示模板编译器生成 `.metadata.json` 文件，以便随 `npm` 包一起分发。这样可以避免生成无法分发到 `npm` 的 `.ngfactory.js` 和 `.ngstyle.js` 文件。

### `strictMetadataEmit`

为 `true` 时，如果 `"skipMetadataEmit"` 为 `false`，则向 `.metadata.json` 文件报告错误。
默认为 `false`。
仅在 `"skipMetadataEmit"` 为 `false` 且 `"skipTemplateCodegen"` 为 `true` 时使用。

此选项用于验证为随 `npm` 包一起打包而生成的 `.metadata.json` 文件。
这种验证非常严格，对于那些被模板编译器使用时永远不会出错的元数据，也可能会报错。
你可以在为某个导出符号编写的文档注释中加入 `@dynamic`，来抑制此选项针对该符号报告的错误。

`.metadata.json` 文件中包含错误是合法的。
如果元数据被用于确定注解的内容，模板编译器就会报告这些错误。
元数据收集器无法预测哪些符号会被用在注解中，因此它会预先在导出符号的元数据中加入错误节点。
这样，如果这些符号被使用，模板编译器就可以利用这些错误节点来报告错误。

如果库的使用方打算在注解中使用某个符号，模板编译器通常不会立即报告该问题，而是在使用方实际使用该符号后才报告。
此选项可以在库的构建阶段就检测到这些错误，例如，Angular 自身的库在构建时就使用了此选项。

### `strictInjectionParameters`

为 `true` 时，如果所提供参数的注入类型无法确定，则报告错误。
为 `false` 时，带有 `@Injectable` 标记的类中类型无法解析的构造函数参数会产生警告。
推荐值为 `true`，但默认值为 `false`。

当你使用 Angular CLI 命令 `ng new --strict` 时，所创建项目的配置中会把它设为 `true`。

### `strictTemplates`

为 `true` 时，启用[严格模板类型检查](/tools/cli/template-typecheck#strict-mode)。

此选项启用的各个严格性标志允许你开启或关闭特定类型的严格模板类型检查。
请参阅[排查模板错误](/tools/cli/template-typecheck#troubleshooting-template-errors)。
默认为 `true`。

### `strictStandalone`

为 `true` 时，如果组件、指令或管道不是独立的，则报告错误。

### `trace`

为 `true` 时，在编译模板时打印额外信息。
默认为 `false`。

### `typeCheckHostBindings`

为 `true` 时，对组件和指令的 `host` 对象字面量以及 `@HostBinding`/`@HostListener` 装饰器中的表达式启用类型检查。
默认为 `true`。

## 命令行选项

大多数情况下，你会通过 [Angular CLI](/reference/configs/angular-compiler-options) 间接地与 Angular 编译器交互。在调试某些问题时，你可能会发现直接调用 Angular 编译器很有用。
你可以使用 `@angular/compiler-cli` npm 包提供的 `ngc` 命令，从命令行调用编译器。

`ngc` 命令是对 TypeScript 的 `tsc` 编译器命令的包装。Angular 编译器主要通过 `tsconfig.json` 进行配置，而 Angular CLI 主要通过 `angular.json` 进行配置。

除了配置文件之外，你还可以使用 [`tsc` 命令行选项](https://www.typescriptlang.org/docs/handbook/compiler-options.html)来配置 `ngc`。

[GuideI18nCommonPrepareMarkTextInComponentTemplate]: guide/i18n/prepare#mark-text-in-component-template 'Mark text in component template - Prepare component for translation | Angular'
