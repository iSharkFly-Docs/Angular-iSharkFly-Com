# 编写原理图

你可以创建自己的原理图（Schematic）来操作 Angular 项目。
库开发者通常会把原理图和库打包在一起，以便将库与 Angular CLI 集成。
你也可以创建独立的原理图来操作 Angular 应用中的文件和结构，借此根据你的开发环境对它们进行定制，并使其符合你的标准和约束。
原理图可以串联起来，通过运行其他原理图来执行复杂的操作。

操作应用中的代码既可能非常强大，也相应地可能非常危险。
例如，创建一个已经存在的文件会出错；如果这个操作被立即执行，就会丢弃此前已执行的所有其他更改。
Angular 原理图工具通过创建虚拟文件系统来防范副作用和错误。
原理图描述了一条可应用于虚拟文件系统的转换管道。
原理图运行时，这些转换会被记录在内存中，只有在确认有效之后，才会被应用到真实的文件系统中。

## 原理图的概念

原理图的公共 API 定义了一些代表基本概念的类。

- 虚拟文件系统用 `Tree` 表示。
  `Tree` 数据结构包含一个 _基础区_（一组已经存在的文件）和一个 _暂存区_（要应用到基础区的更改列表）。
  进行修改时，你并不会真正改变基础区，而是把这些修改添加到暂存区中。

- `Rule` 对象定义了一个函数，它接收一个 `Tree`，应用转换，然后返回一个新的 `Tree`。
  原理图的主文件 `index.ts` 定义了一组实现原理图逻辑的规则。

- 转换用 `Action` 表示。
  共有四种操作类型：`Create`、`Rename`、`Overwrite` 和 `Delete`。

- 每个原理图都在一个上下文中运行，该上下文由 `SchematicContext` 对象表示。

传入规则的上下文对象提供了对原理图可能需要的工具函数和元数据的访问，其中包括一个有助于调试的日志 API。
上下文还定义了一个 _合并策略_，它决定了如何将暂存树中的更改合并到基础树中。
一项更改可以被接受、被忽略，或者抛出异常。

### 定义规则和操作

当你使用 [Schematics CLI](#schematics-cli) 创建一个新的空白原理图时，生成的入口函数是一个 _规则工厂_。
`RuleFactory` 对象定义了一个用于创建 `Rule` 的高阶函数。

```ts [index.ts]
import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';

// 你不必将该函数作为默认导出。
// 每个文件中也可以有多个规则工厂。
export function helloWorld(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return tree;
  };
}
```

你的规则可以通过调用外部工具和实现逻辑来修改项目。
例如，你需要一条规则来定义如何将原理图中的模板合并到宿主项目中。

规则可以使用 `@schematics/angular` 包提供的工具函数。
你可以在其中找到用于处理模块、依赖、TypeScript、AST、JSON、Angular CLI 工作区和项目等的辅助函数。

```ts [index.ts]
import {
  JsonAstObject,
  JsonObject,
  JsonValue,
  Path,
  normalize,
  parseJsonAst,
  strings,
} from '@angular-devkit/core';
```

### 使用 schema 和接口定义输入选项

规则可以从调用者那里收集选项值，并将它们注入到模板中。
规则可用的选项，以及它们的允许值和默认值，都定义在原理图的 JSON schema 文件 `<schematic>/schema.json` 中。
可以使用 TypeScript 接口为 schema 定义变量或枚举数据类型。

schema 定义了原理图中所用变量的类型和默认值。
例如，假想的 "Hello World" 原理图可能有如下 schema。

```json [schema.json]
{
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "default": "world"
    },
    "useColor": {
      "type": "boolean"
    }
  }
}
```

关于 Angular CLI 命令原理图的 schema 文件示例，请参阅 [`@schematics/angular`](https://github.com/angular/angular-cli/blob/main/packages/schematics/angular/application/schema.json)。

### 原理图提示

原理图 _提示_ 为原理图的执行引入了用户交互。
你可以配置原理图选项，向用户显示一个可自定义的问题。
提示会在原理图执行之前显示，原理图随后会把用户的回答作为该选项的值。
这样，用户无需深入了解所有可用选项，就能引导原理图的操作。

例如，"Hello World" 原理图可能会询问用户的名字，并用这个名字替换默认名字 "world"。
要定义这样的提示，请在 schema 中为 `name` 变量添加 `x-prompt` 属性。

类似地，你也可以添加一个提示，让用户决定原理图在执行 hello 操作时是否使用颜色。
包含这两个提示的 schema 如下所示。

```json [schema.json]
{
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "default": "world",
      "x-prompt": "What is your name?"
    },
    "useColor": {
      "type": "boolean",
      "x-prompt": "Would you like the response in color?"
    }
  }
}
```

#### 提示的简写语法

这些示例使用的是提示语法的简写形式，只提供了问题的文本。
在大多数情况下，这就足够了。
但请注意，这两个提示期望的输入类型不同。
使用简写形式时，会根据属性的 schema 自动选择最合适的类型。
在这个例子中，`name` 提示使用 `input` 类型，因为它是字符串属性。
`useColor` 提示使用 `confirmation` 类型，因为它是布尔属性。
在这种情况下，"yes" 对应 `true`，"no" 对应 `false`。

支持以下三种输入类型。

| 输入类型     | 详情                                   |
| :----------- | :------------------------------------- |
| confirmation | 是 / 否问题；非常适合布尔选项。        |
| input        | 文本输入；非常适合字符串或数字选项。   |
| list         | 一组预定义的允许值。                   |

在简写形式中，类型是根据属性的类型和约束推断出来的。

| 属性 schema       | 提示类型                                     |
| :---------------- | :------------------------------------------- |
| "type": "boolean" | confirmation（"yes"=`true`，"no"=`false`）   |
| "type": "string"  | input                                        |
| "type": "number"  | input（只接受有效数字）                      |
| "type": "integer" | input（只接受有效数字）                      |
| "enum": […]       | list（枚举成员成为列表选项）                 |

在下面的例子中，该属性接受一个枚举值，因此原理图会自动选择 list 类型，并根据可能的值创建一个菜单。

```json [schema.json]
{
  "style": {
    "description": "The file extension or preprocessor to use for style files.",
    "type": "string",
    "default": "css",
    "enum": ["css", "scss", "sass", "less", "styl"],
    "x-prompt": "Which stylesheet format would you like to use?"
  }
}
```

提示运行时会根据 JSON schema 中提供的约束自动验证用户提供的回答。
如果值不可接受，就会提示用户重新输入。
这可以确保传给原理图的任何值都符合原理图实现的预期，因此你无需在原理图代码中添加额外的检查。

#### 提示的完整语法

`x-prompt` 字段语法还支持一种完整形式，用于需要对提示进行额外定制和控制的场景。
在这种形式下，`x-prompt` 字段的值是一个 JSON 对象，其子字段用于定制提示的行为。

| 字段    | 数据值                                                                |
| :------ | :-------------------------------------------------------------------- |
| type    | `confirmation`、`input` 或 `list`（简写形式中自动选择）               |
| message | 字符串（必填）                                                        |
| items   | 字符串和 / 或 label/value 对象对（仅在类型为 `list` 时有效）          |

下面这个完整形式的例子来自 CLI 用于[生成应用](https://github.com/angular/angular-cli/blob/ba8a6ea59983bb52a6f1e66d105c5a77517f062e/packages/schematics/angular/application/schema.json#L56)的原理图的 JSON schema。
它定义了一个提示，让用户选择要为所创建的应用使用哪种样式预处理器。
通过使用完整形式，原理图可以为菜单选项提供更明确的格式。

```json [schema.json]
{
  "style": {
    "description": "The file extension or preprocessor to use for style files.",
    "type": "string",
    "default": "css",
    "enum": ["css", "scss", "sass", "less"],
    "x-prompt": {
      "message": "Which stylesheet format would you like to use?",
      "type": "list",
      "items": [
        {"value": "css", "label": "CSS"},
        {"value": "scss", "label": "SCSS [ https://sass-lang.com/documentation/syntax#scss ]"},
        {
          "value": "sass",
          "label": "Sass [ https://sass-lang.com/documentation/syntax#the-indented-syntax ]"
        },
        {"value": "less", "label": "Less [ https://lesscss.org/ ]"}
      ]
    }
  }
}
```

#### x-prompt schema

定义原理图选项的 JSON schema 支持扩展，从而可以声明式地定义提示及其相应行为。
要支持提示，无需在原理图代码中添加额外的逻辑或修改。
下面的 JSON schema 完整描述了 `x-prompt` 字段的完整形式语法。

```json [x-prompt schema]
{
  "oneOf": [
    {
      "type": "string"
    },
    {
      "type": "object",
      "properties": {
        "type": {
          "type": "string"
        },
        "message": {
          "type": "string"
        },
        "items": {
          "type": "array",
          "items": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "object",
                "properties": {
                  "label": {
                    "type": "string"
                  },
                  "value": {}
                },
                "required": ["value"]
              }
            ]
          }
        }
      },
      "required": ["message"]
    }
  ]
}
```

## Schematics CLI

原理图自带命令行工具。
全局安装 Schematics 命令行工具：

```shell

npm install -g @angular-devkit/schematics-cli

```

这会安装 `schematics` 可执行文件，你可以用它在单独的项目文件夹中创建新的原理图集合、向现有集合中添加新原理图，或者扩展现有原理图。

在接下来的几节中，你将使用 CLI 创建一个新的原理图集合，借此介绍其中的文件、文件结构以及一些基本概念。

不过，原理图最常见的用途是将 Angular 库与 Angular CLI 集成。
要做到这一点，可以直接在 Angular 工作区的库项目中创建原理图文件，而无需使用 Schematics CLI。
请参阅[库的原理图](/tools/cli/schematics-for-libraries)。

### 创建原理图集合

以下命令会在同名的新项目文件夹中创建一个名为 `hello-world` 的新原理图。

```shell

schematics blank --name=hello-world

```

`blank` 原理图由 Schematics CLI 提供。
该命令会创建一个新的项目文件夹（即集合的根文件夹），并在集合中创建一个初始的具名原理图。

进入集合文件夹，安装 npm 依赖，然后在你喜欢的编辑器中打开这个新集合，查看生成的文件。
例如，如果你使用的是 VS Code：

```shell

cd hello-world
npm install
npm run build
code .

```

初始原理图的名称与项目文件夹相同，并生成在 `src/hello-world` 中。
你可以向这个集合中添加相关的原理图，并修改生成的骨架代码来定义原理图的功能。
每个原理图的名称在集合中必须唯一。

### 运行原理图

使用 `schematics` 命令运行具名原理图。
按以下格式提供项目文件夹的路径、原理图名称以及所有必填选项。

```shell

schematics <path-to-schematics-project>:<schematics-name> --<required-option>=<value>

```

路径可以是绝对路径，也可以是相对于执行命令时当前工作目录的相对路径。
例如，要运行刚刚生成的原理图（它没有必填选项），请使用以下命令。

```shell

schematics .:hello-world

```

### 向集合中添加原理图

要向现有集合中添加原理图，请使用与创建新原理图项目相同的命令，但要在项目文件夹内运行该命令。

```shell

cd hello-world
schematics blank --name=goodbye-world

```

该命令会在你的集合中生成新的具名原理图，包含一个主文件 `index.ts` 及其相关的测试规约文件。
它还会把新原理图的名称、描述和工厂函数添加到 `collection.json` 文件中的集合 schema 里。

## 集合的内容

集合的根项目文件夹顶层包含配置文件、`node_modules` 文件夹和 `src/` 文件夹。
`src/` 文件夹包含集合中各个具名原理图的子文件夹，以及一个描述这些原理图的 schema 文件 `collection.json`。
每个原理图在创建时都带有名称、描述和工厂函数。

```json
{
  "$schema": "../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "hello-world": {
      "description": "A blank schematic.",
      "factory": "./hello-world/index#helloWorld"
    }
  }
}
```

- `$schema` 属性指定了 CLI 用于验证的 schema。
- `schematics` 属性列出了属于该集合的具名原理图。
  每个原理图都有一段纯文本描述，并指向主文件中生成的入口函数。

- `factory` 属性指向生成的入口函数。
  在这个例子中，你通过调用 `helloWorld()` 工厂函数来调用 `hello-world` 原理图。

- 可选的 `schema` 属性指向一个 JSON schema 文件，该文件定义了原理图可用的命令行选项。
- 可选的 `aliases` 数组指定了一个或多个可用于调用该原理图的字符串。
  例如，Angular CLI "generate" 命令的原理图有一个别名 "g"，因此你可以使用 `ng g` 命令。

### 具名原理图

当你使用 Schematics CLI 创建一个空白原理图项目时，这个新的空白原理图就是集合的第一个成员，并且与集合同名。
当你向这个集合中添加新的具名原理图时，它会被自动添加到 `collection.json` schema 中。

除了名称和描述之外，每个原理图还有一个 `factory` 属性，用于标识原理图的入口点。
在这个例子中，你通过调用主文件 `hello-world/index.ts` 中的 `helloWorld()` 函数来调用原理图所定义的功能。

<img alt="overview" src="/assets/images/guide/schematics/collection-files.gif">

集合中的每个具名原理图都包含以下主要部分。

| 部分          | 详情                                         |
| :------------ | :------------------------------------------- |
| `index.ts`    | 定义具名原理图转换逻辑的代码。               |
| `schema.json` | 原理图变量定义。                             |
| `schema.d.ts` | 原理图变量。                                 |
| `files/`      | 可选的、要复制的组件 / 模板文件。            |

原理图可以把所有逻辑都放在 `index.ts` 文件中，而不需要额外的模板。
不过，你也可以在 `files` 文件夹中提供组件（Component）和模板（Template），就像独立的 Angular 项目中那样，以此为 Angular 创建动态原理图。
index 文件中的逻辑会通过定义注入数据和修改变量的规则来配置这些模板。
