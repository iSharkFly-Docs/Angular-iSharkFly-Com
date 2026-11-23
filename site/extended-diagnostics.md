# 扩展诊断 {#extended-diagnostics}

有许多编码模式对于编译器或运行时来说在技术上是合法的，但可能存在复杂的细微差别或注意事项。
这些模式可能达不到开发者预期的效果，因而常常导致 bug。
Angular 编译器内置了「扩展诊断（Extended Diagnostics）」，它能识别出许多这类模式，从而向开发者警告潜在问题，并在代码库中推行通用的最佳实践。

## 诊断 {#diagnostics}

目前，Angular 支持以下扩展诊断：

| 代码     | 名称                                                                  |
| :------- | :-------------------------------------------------------------------- |
| `NG8101` | [`invalidBananaInBox`](/extended-diagnostics/NG8101)                   |
| `NG8102` | [`nullishCoalescingNotNullable`](/extended-diagnostics/NG8102)         |
| `NG8103` | [`missingControlFlowDirective`](/extended-diagnostics/NG8103)          |
| `NG8104` | [`textAttributeNotBinding`](/extended-diagnostics/NG8104)              |
| `NG8105` | [`missingNgForOfLet`](/extended-diagnostics/NG8105)                    |
| `NG8106` | [`suffixNotSupported`](/extended-diagnostics/NG8106)                   |
| `NG8107` | [`optionalChainNotNullable`](/extended-diagnostics/NG8107)             |
| `NG8108` | [`skipHydrationNotStatic`](/extended-diagnostics/NG8108)               |
| `NG8109` | [`interpolatedSignalNotInvoked`](/extended-diagnostics/NG8109)         |
| `NG8111` | [`uninvokedFunctionInEventBinding`](/extended-diagnostics/NG8111)      |
| `NG8112` | [`unusedLetDeclaration`](/extended-diagnostics/NG8112)                 |
| `NG8113` | [`unusedStandaloneImports`](/extended-diagnostics/NG8113)              |
| `NG8114` | [`unparenthesizedNullishCoalescing`](/extended-diagnostics/NG8114)     |
| `NG8115` | [`uninvokedTrackFunction`](/extended-diagnostics/NG8115)               |
| `NG8116` | [`missingStructuralDirective`](/extended-diagnostics/NG8116)           |
| `NG8117` | [`uninvokedFunctionInTextInterpolation`](/extended-diagnostics/NG8117) |
| `NG8119` | [`numericCssPropertyRequiresUnit`](/extended-diagnostics/NG8119)       |
| `NG8021` | [`deferTriggerMisconfiguration`](/extended-diagnostics/NG8021)         |

## 配置 {#configuration}

扩展诊断默认是警告，不会阻止编译。
每个诊断都可以配置为以下之一：

| 错误类别 | 效果                                                                                                                                                                   |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `warning`      | 默认值 - 编译器将该诊断作为警告输出，但不会阻止编译。即使输出了警告，编译器仍会以状态码 0 退出。 |
| `error`        | 编译器将该诊断作为错误输出，并使编译失败。如果输出了一个或多个错误，编译器将以非零状态码退出。           |
| `suppress`     | 编译器完全_不_输出该诊断。                                                                                                                      |

检查的严重级别可以通过 [Angular 编译器选项](/reference/configs/angular-compiler-options)进行配置：

```json
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "invalidBananaInBox": "suppress"
      },
      "defaultCategory": "error"
    }
  }
}
```

`checks` 字段将各个诊断的名称映射到其对应的类别。
有关扩展诊断的完整列表以及配置时使用的名称，请参阅[诊断](#diagnostics)。

`defaultCategory` 字段用于所有未在 `checks` 中显式列出的诊断。
如果未设置，这些诊断将被视为 `warning`。

启用 [`strictTemplates`](/tools/cli/template-typecheck#strict-mode) 时才会输出扩展诊断。
这是必需的，这样编译器才能更好地理解 Angular 模板（Template）的类型，并提供准确且有意义的诊断。

## 语义化版本 {#semantic-versioning}

Angular 团队计划在 Angular 的**次要（minor）**版本中添加或启用新的扩展诊断（参见 [semver](https://docs.npmjs.com/about-semantic-versioning)）。
这意味着升级 Angular 后，你现有的代码库中可能会出现新的警告。
这使团队能够更快地交付功能，也让开发者更容易使用扩展诊断。

但是，设置 `"defaultCategory": "error"` 会把这类警告提升为硬性错误。
这可能导致次要版本升级引入编译错误，从而被视为不符合 semver 的破坏性变更。
任何新的诊断都可以通过上述[配置](#configuration)被抑制或降级为警告，因此对于默认将扩展诊断视为错误的项目来说，新诊断的影响应该
很小。
默认设为错误是一个非常强大的工具；在决定 `error` 是否适合作为你项目的默认值时，请留意这个 semver 注意事项。

## 新的诊断 {#new-diagnostics}

Angular 团队始终欢迎关于可添加的新诊断的建议。
扩展诊断通常应当：

- 检测 Angular 模板中常见但不明显的开发者错误
- 清楚地说明为什么这种模式会导致 bug 或非预期行为
- 给出一个或多个明确的解决方案
- 误报率低，最好为零
- 适用于绝大多数 Angular 应用（而不是特定于某个非官方库）
- 提升程序的正确性或性能（而不是代码风格，那是 linter 的职责）

如果你有符合这些标准的扩展诊断想法，可以考虑提交一个[功能请求](https://github.com/angular/angular/issues/new?template=2-feature-request.yaml)。
