# Angular 文档中文翻译规范

## 文件位置

- 英文原文：`src/<路径>.md`，**不要修改**。构建时 `scripts/sync-zh.mjs` 会把它发布到 `/en/<路径>`。
- 中文译文：`i18n/zh/<路径>.md`，与原文路径一一对应。构建时发布到站点根路径 `/<路径>`。
- 没有译文的页面会自动以英文显示并标记 `untranslated: true`。

## 翻译要求

1. 读者是中文开发者。译文要自然、通顺，不要逐词硬译；使用简体中文。
2. **术语**：Angular 核心术语首次出现时写成「中文（English）」，之后只用中文。例如：组件（Component）、信号（Signal）、指令（Directive）、依赖注入（Dependency Injection）、服务（Service）、管道（Pipe）、路由（Router）、模板（Template）、计算信号（Computed）、副作用（Effect）、变更检测（Change Detection）、水合（Hydration）、服务端渲染（SSR）、延迟加载（Lazy Loading）、可延迟视图（Deferrable Views）、独立组件（Standalone Component）、注入器（Injector）、提供者（Provider）、生命周期钩子（Lifecycle Hook）、响应式表单（Reactive Forms）、模板驱动表单（Template-driven Forms）、信号表单（Signal Forms）。
   其他已统一的译法：验证 / 验证器（validation / validator，不用「校验」）、路由器（Router，指 Angular Router）、路由（routing，泛指概念）、插值（Interpolation）、属性绑定（Property Binding）、双向绑定（Two-way Binding）、链接信号（Linked Signal）、模型信号（Model Signal）、资源（Resource）、查询（Query）、宿主绑定（Host Binding）、触发器（trigger）、原理图（Schematic）。
3. 产品名、库名、API 名称和代码标识符保持英文：Angular、Angular CLI、TypeScript、RxJS、`signal()`、`@Component`、`ngOnInit` 等。
4. **不翻译**：代码块内的代码、行内代码（反引号内）、文件路径、命令、URL、HTML 标签和属性、Vue/VitePress 组件标签及属性名。代码块中的**注释**可以翻译。
   - 代码块的整行 fence（包括 ```` ```ts [src/app/app.ts] ```` 这类标题）保持英文原样，不要翻译。
   - 代码里显示给用户的字符串（按钮文字、错误消息等）保持英文；正文引用这些界面文字时也保留英文，可在后面用括号补充中文。
5. **保持结构**：标题层级、列表、表格、`:::` 容器（如 `::: tip`、`::: warning`；容器标题统一译为：NOTE → 注意，TIP / HELPFUL → 提示，IMPORTANT → 重要，SUMMARY → 总结）、HTML 片段、空行和 frontmatter 的键名都保持原样。frontmatter 中的 `title`、`description` 等文字值要翻译。
6. **链接**：链接地址保持原样（站内的 `/xxx` 链接会自动指向中文页面），只翻译链接文字。锚点链接（`#some-heading`）保持原样。
   - 标题锚点不用手动处理：`scripts/sync-zh.mjs` 构建时会按顺序把中文标题与英文标题配对，自动加上英文锚点 `{#english-slug}`。因此**译文的标题数量和顺序必须与原文完全一致**，不能合并、拆分或增删标题。原文已有的 `{#xxx}` 保持原样。
7. 中英文之间、中文与数字之间加一个空格。中文语境下使用全角标点（，。：；？！「」（）），代码和英文内容中保持半角。
8. 不要增删内容，不要添加译者注，除非原文有明显错误。
