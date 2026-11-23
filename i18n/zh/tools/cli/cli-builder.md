# Angular CLI 构建器

许多 Angular CLI 命令会对你的代码执行一个复杂的过程，例如构建、测试或启动开发服务器来运行你的应用。
这些命令使用一个名为 Architect 的内部工具来运行 _CLI 构建器（CLI builder）_，构建器会调用另一个工具（打包器、测试运行器、服务器）来完成所需的任务。
自定义构建器既可以执行全新的任务，也可以更换现有命令所使用的第三方工具。

本文档介绍 CLI 构建器如何与工作区配置文件集成，并演示如何创建你自己的构建器。

::: tip 提示
本文示例中使用的代码可以在这个 [GitHub 仓库](https://github.com/mgechev/cli-builders-demo)中找到。

:::

## CLI 构建器

内部的 Architect 工具会把工作委托给称为 _构建器_ 的处理函数。
构建器处理函数接收两个参数：

| 参数      | 类型             |
| :-------- | :--------------- |
| `options` | `JSONObject`     |
| `context` | `BuilderContext` |

这里的关注点分离方式与[原理图（Schematic）](/tools/cli/schematics-authoring)相同，原理图用于其他会改动你代码的 CLI 命令（例如 `ng generate`）。

- `options` 对象由 CLI 用户的选项和配置提供，而 `context` 对象由 CLI 构建器 API 自动提供。
- 除了上下文信息之外，`context` 对象还提供了一个调度方法 `context.scheduleTarget()`。
  调度器会使用给定的目标配置来执行构建器处理函数。

构建器处理函数可以是同步的（返回一个值）、异步的（返回一个 `Promise`），或者进行监听并返回多个值（返回一个 `Observable`）。
返回值必须始终是 `BuilderOutput` 类型。
该对象包含一个布尔类型的 `success` 字段，以及一个可选的 `error` 字段，后者可以包含错误消息。

Angular 提供了一些构建器，CLI 会在 `ng build`、`ng test` 等命令中使用它们。
这些构建器以及其他内置 CLI 构建器的默认目标配置，可以在[工作区配置文件](/reference/configs/workspace-config) `angular.json` 的 "architect" 部分中找到并进行配置。
此外，你还可以通过创建自己的构建器来扩展和定制 Angular，并使用 [`ng run` CLI 命令](https://angular.dev/cli/run)直接运行它们。

### 构建器项目结构

构建器位于一个“项目”文件夹中，其结构类似于 Angular 工作区：全局配置文件位于顶层，更具体的配置则与定义行为的代码文件一起放在源码文件夹中。
例如，你的 `myBuilder` 文件夹可能包含以下文件。

| 文件                     | 用途                                                                                                      |
| :----------------------- | :-------------------------------------------------------------------------------------------------------- |
| `src/my-builder.ts`      | 构建器定义的主源文件。                                                                                    |
| `src/my-builder.spec.ts` | 测试的源文件。                                                                                            |
| `src/schema.json`        | 构建器输入选项的定义。                                                                                    |
| `builders.json`          | 构建器定义。                                                                                              |
| `package.json`           | 依赖项。参见 [https://docs.npmjs.com/files/package.json](https://docs.npmjs.com/files/package.json)。     |
| `tsconfig.json`          | [TypeScript 配置](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)。                      |

构建器可以发布到 `npm`，参见[发布你的库](/tools/libraries/creating-libraries)。

## 创建构建器

作为示例，我们来创建一个把文件复制到新位置的构建器。
要创建构建器，请使用 CLI 构建器函数 `createBuilder()`，并返回一个 `Promise<BuilderOutput>` 对象。

```ts [src/my-builder.ts (builder skeleton)]
import {BuilderContext, BuilderOutput, createBuilder} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';

interface Options extends JsonObject {
  source: string;
  destination: string;
}

export default createBuilder(copyFileBuilder);

async function copyFileBuilder(options: Options, context: BuilderContext): Promise<BuilderOutput> {
}
```

现在为它添加一些逻辑。
下面的代码从用户选项中获取源文件路径和目标文件路径，并把文件从源位置复制到目标位置（使用 [Node.js 内置 `copyFile()` 函数的 Promise 版本](https://nodejs.org/api/fs.html#fs_fspromises_copyfile_src_dest_mode)）。
如果复制操作失败，它会返回一个错误，并附带关于底层问题的消息。

```ts [src/my-builder.ts (builder)]
import {BuilderContext, BuilderOutput, createBuilder} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';
import {promises as fs} from 'fs';

interface Options extends JsonObject {
  source: string;
  destination: string;
}

export default createBuilder(copyFileBuilder);

async function copyFileBuilder(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  try {
    await fs.copyFile(options.source, options.destination);
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
    };
  }
  return {success: true};
}
```

### 处理输出

默认情况下，`copyFile()` 不会向进程的标准输出或标准错误打印任何内容。
如果发生错误，可能很难准确了解构建器在出现问题时正在尝试做什么。
可以使用 `Logger` API 记录额外信息，以补充一些上下文。
这也使得构建器本身可以在单独的进程中执行，即使标准输出和标准错误被停用也没有问题。

你可以从上下文中获取一个 `Logger` 实例。

```ts [src/my-builder.ts (handling output)]
try {
  await fs.copyFile(options.source, options.destination);
} catch (err) {
  context.logger.error('Failed to copy file.');
  return {
    success: false,
    error: (err as Error).message,
  };
}
```

### 进度和状态报告

CLI 构建器 API 包含进度和状态报告工具，可以为某些函数和接口提供提示信息。

要报告进度，请使用 `context.reportProgress()` 方法，它接收当前值、可选的总量以及状态字符串作为参数。
总量可以是任意数字。例如，如果你知道需要处理多少个文件，总量可以是文件数，而当前值则是目前已处理的文件数。
除非你传入新的字符串值，否则状态字符串保持不变。

在我们的示例中，复制操作要么已完成、要么仍在执行，因此不需要进度报告；但你可以报告状态，以便调用我们构建器的父构建器了解当前进展。
使用 `context.reportStatus()` 方法生成任意长度的状态字符串。

::: tip 提示
无法保证较长的字符串会被完整显示；它可能会被截断以适应显示它的界面。

:::

传入空字符串可以移除状态。

```ts [src/my-builder.ts (progress reporting)]
context.reportStatus(`Copying ${options.source} to ${options.destination}.`);
try {
  await fs.copyFile(options.source, options.destination);
} catch (err) {
  context.logger.error('Failed to copy file.');
  return {
    success: false,
    error: (err as Error).message,
  };
}

context.reportStatus('Done.');
return {success: true};
```

## 构建器输入

你可以通过 `ng build` 等 CLI 命令间接调用构建器，也可以使用 Angular CLI 的 `ng run` 命令直接调用。
无论哪种方式，你都必须提供必需的输入，而其他输入则可以使用针对特定 _目标（target）_ 预先配置的默认值——这些值由某个[配置](/tools/cli/environments)指定，或在命令行中设置。

### 输入验证

你可以在与构建器关联的 JSON schema 中定义构建器的输入。
与原理图类似，Architect 工具会把解析后的输入值收集到一个 `options` 对象中，并在把它们传给构建器函数之前，根据 schema 验证它们的类型。

对于我们的示例构建器，`options` 应该是一个包含两个键的 `JsonObject`：
`source` 和 `destination`，两者都是字符串。

你可以提供下面的 schema 来对这些值进行类型验证。

```json [schema.json]
{
  "$schema": "https://json-schema.org/schema",
  "type": "object",
  "properties": {
    "source": {
      "type": "string"
    },
    "destination": {
      "type": "string"
    }
  }
}
```

::: tip 提示
这只是一个最简单的示例，但使用 schema 进行验证的能力可以非常强大。
更多信息请参阅 [JSON schema 网站](https://json-schema.org)。

:::

要把构建器的实现与其 schema 和名称关联起来，你需要创建一个 _构建器定义_ 文件，并在 `package.json` 中指向它。

创建一个名为 `builders.json` 的文件，内容如下：

```json [builders.json]
{
  "builders": {
    "copy": {
      "implementation": "./dist/my-builder.js",
      "schema": "./src/schema.json",
      "description": "Copies a file."
    }
  }
}
```

在 `package.json` 文件中添加一个 `builders` 键，告诉 Architect 工具在哪里可以找到我们的构建器定义文件。

```json [package.json]
{
  "name": "@example/copy-file",
  "version": "1.0.0",
  "description": "Builder for copying files",
  "builders": "builders.json",
  "dependencies": {
    "@angular/build": "^21.2.0"
  }
}
```

现在，我们构建器的正式名称是 `@example/copy-file:copy`。
前半部分是包名，后半部分是在 `builders.json` 文件中指定的构建器名称。

这些值可以通过 `options.source` 和 `options.destination` 访问。

```ts [src/my-builder.ts (report status)]
await fs.copyFile(options.source, options.destination);
```

### 目标配置

构建器必须有一个已定义的目标，用于把它与特定的输入配置和项目关联起来。

目标定义在 `angular.json` [CLI 配置文件](/reference/configs/workspace-config)中。
目标指定了要使用的构建器、默认的选项配置以及具名的备选配置。
Angular CLI 中的 Architect 会使用目标定义来解析某次运行的输入选项。

`angular.json` 文件为每个项目都提供了一个部分，每个项目的 "architect" 部分为 'build'、'test'、'serve' 等 CLI 命令所使用的构建器配置目标。
例如，默认情况下，`ng build` 命令会运行构建器 `@angular/build:application` 来执行构建任务，并传入 `angular.json` 中为 `build` 目标指定的默认选项值。

```json [angular.json]
{
  "myApp": {
    "...": "...",
    "architect": {
      "build": {
        "builder": "@angular/build:application",
        "options": {
          "outputPath": "dist/myApp",
          "index": "src/index.html",
          "...": "..."
        },
        "configurations": {
          "production": {
            "fileReplacements": [
              {
                "replace": "src/environments/environment.ts",
                "with": "src/environments/environment.prod.ts"
              }
            ],
            "optimization": true,
            "outputHashing": "all",
            "...": "..."
          }
        }
      },
      "...": "..."
    }
  }
}
```

该命令会把 "options" 部分中指定的那组默认选项传给构建器。
如果你传入 `--configuration=production` 标志，它就会使用 `production` 配置中指定的覆盖值。
你还可以在命令行中逐个指定更多的选项覆盖。

#### 目标字符串

通用的 `ng run` CLI 命令以如下形式的目标字符串作为第一个参数。

```shell

project:target[:configuration]

```

|               | 详情                                                                                                                  |
| :------------ | :-------------------------------------------------------------------------------------------------------------------- |
| project       | 与该目标关联的 Angular CLI 项目名称。                                                                                 |
| target        | 来自 `angular.json` 文件 `architect` 部分的某个具名构建器配置。                                                       |
| configuration | （可选）给定目标的某个特定覆盖配置的名称，在 `angular.json` 文件中定义。                                              |

如果你的构建器会调用另一个构建器，它可能需要读取传入的目标字符串。
可以使用 `@angular-devkit/architect` 中的工具函数 `targetFromTargetString()` 把该字符串解析为对象。

## 调度和运行

Architect 以异步方式运行构建器。
要调用构建器，你需要调度一个任务，使其在所有配置解析完成后运行。

在调度器返回 `BuilderRun` 控制对象之前，构建器函数不会被执行。
CLI 通常通过调用 `context.scheduleTarget()` 函数来调度任务，然后使用 `angular.json` 文件中的目标定义来解析输入选项。

Architect 为给定目标解析输入选项的方式是：先取默认选项对象，然后用配置中的值覆盖，再用传给 `context.scheduleTarget()` 的覆盖对象中的值进一步覆盖。
对于 Angular CLI，覆盖对象是根据命令行参数构建的。

Architect 会根据构建器的 schema 验证最终得到的选项值。
如果输入有效，Architect 就会创建上下文并执行构建器。

更多信息请参阅[工作区配置](/reference/configs/workspace-config)。

::: tip 提示
你也可以在另一个构建器或测试中调用 `context.scheduleBuilder()` 来直接调用某个构建器。
你需要把 `options` 对象直接传给该方法，这些选项值会根据构建器的 schema 进行验证，不会再做其他调整。

:::

只有 `context.scheduleTarget()` 方法会通过 `angular.json` 文件来解析配置和覆盖值。

### 默认的 architect 配置

我们来创建一个简单的 `angular.json` 文件，把目标配置放入上下文中。

你可以把构建器发布到 npm（参见[发布你的库](/tools/libraries/creating-libraries#publishing-your-library)），然后使用以下命令安装它：

```shell

npm install @example/copy-file

```

如果你使用 `ng new builder-test` 创建一个新项目，生成的 `angular.json` 文件大致如下，其中只有默认的构建器配置。

```json [angular.json]
{
  "projects": {
    "builder-test": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "outputPath": "dist/builder-test",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.app.json"
          },
          "configurations": {
            "production": {
              "optimization": true,
              "aot": true
            }
          }
        }
      }
    }
  }
}
```

### 添加目标

添加一个新目标，用来运行我们的构建器复制文件。
这个目标会让构建器复制 `package.json` 文件。

- 我们将为项目的 `architect` 对象添加一个新的目标部分
- 名为 `copy-package` 的目标使用我们的构建器，也就是你发布为 `@example/copy-file` 的那个构建器。
- options 对象为你定义的两个输入提供了默认值。
  - `source` - 要复制的现有文件。
  - `destination` - 要复制到的路径。

```json [angular.json]
{
  "projects": {
    "builder-test": {
      "architect": {
        "copy-package": {
          "builder": "@example/copy-file:copy",
          "options": {
            "source": "package.json",
            "destination": "package-copy.json"
          }
        }
        // 现有的目标……
      }
    }
  }
}
```

### 运行构建器

要使用新目标的默认配置运行我们的构建器，请使用以下 CLI 命令。

```shell

ng run builder-test:copy-package

```

这会把 `package.json` 文件复制为 `package-copy.json`。

可以使用命令行参数覆盖已配置的默认值。
例如，要使用不同的 `destination` 值运行，请使用以下 CLI 命令。

```shell

ng run builder-test:copy-package --destination=package-other.json

```

这会把文件复制为 `package-other.json`，而不是 `package-copy.json`。
由于你没有覆盖 _source_ 选项，它仍然会从默认的 `package.json` 文件复制。

## 测试构建器

请为你的构建器使用集成测试，这样就可以使用 Architect 调度器来创建上下文，就像这个[示例](https://github.com/mgechev/cli-builders-demo)中那样。
在构建器的源码目录中创建一个新的测试文件 `my-builder.spec.ts`。该测试会创建 `JsonSchemaRegistry`（用于 schema 验证）、`TestingArchitectHost`（`ArchitectHost` 的内存实现）和 `Architect` 的新实例。

下面是一个运行复制文件构建器的测试示例。
该测试使用构建器复制 `package.json` 文件，并验证复制后文件的内容与源文件相同。

```ts [src/my-builder.spec.ts]
import {Architect} from '@angular-devkit/architect';
import {TestingArchitectHost} from '@angular-devkit/architect/testing';
import {schema} from '@angular-devkit/core';
import {promises as fs} from 'fs';
import {join} from 'path';

describe('Copy File Builder', () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    // TestingArchitectHost() 接收工作区目录和当前目录。
    // 由于我们不使用它们，这里两者相同。
    architectHost = new TestingArchitectHost(__dirname, __dirname);
    architect = new Architect(architectHost, registry);

    // 这里既可以传入 Node 包名，也可以传入
    // package.json 文件所在目录的路径。
    await architectHost.addBuilderFromPackage(join(__dirname, '..'));
  });

  it('can copy files', async () => {
    // 一次 "run" 可以有多个输出，并包含进度信息。
    const run = await architect.scheduleBuilder('@example/copy-file:copy', {
      source: 'package.json',
      destination: 'package-copy.json',
    });

    // "result" 成员（类型为 BuilderOutput）是下一个输出。
    const output = await run.result;

    // 停止构建器的运行。由于构建器会一直等待被调度，
    // 这样可以防止 Architect 在内存中保留
    // 与该构建器相关的状态。
    await run.stop();

    // 期望复制后的文件与源文件相同。
    const sourceContent = await fs.readFile('package.json', 'utf8');
    const destinationContent = await fs.readFile('package-copy.json', 'utf8');
    expect(destinationContent).toBe(sourceContent);
  });
});
```

::: tip 提示
在你的仓库中运行这个测试时，需要 [`ts-node`](https://github.com/TypeStrong/ts-node) 包。
你也可以把 `my-builder.spec.ts` 重命名为 `my-builder.spec.js` 来避免这一依赖。

:::

### 监听模式

大多数构建器只运行一次就返回。然而，这种行为与需要监听变更的构建器（例如开发服务器）并不完全兼容。
Architect 可以支持监听模式，但有一些事项需要注意。

- 要在监听模式下使用，构建器处理函数应该返回一个 `Observable`。
  Architect 会一直订阅该 `Observable` 直到它完成；如果之后又使用相同参数调度该构建器，Architect 可能会复用它。

- 构建器在每次执行后都应该发出一个 `BuilderOutput` 对象。
  执行完成后，它可以进入监听模式，等待外部事件触发。
  如果某个事件触发了重新启动，构建器应该调用 `context.reportRunning()` 函数，告诉 Architect 它又开始运行了。
  这样可以防止在调度了另一次运行时，Architect 停止该构建器。

当你的构建器调用 `BuilderRun.stop()` 退出监听模式时，Architect 会取消对构建器 `Observable` 的订阅，并调用构建器的清理逻辑进行清理。
这一行为也使得长时间运行的构建可以被停止和清理。

一般来说，如果你的构建器在监听外部事件，应该把运行过程分为三个阶段。

| 阶段         | 详情                                                                                                                                                                                                                                          |
| :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 运行中       | 正在执行的任务，例如调用编译器。当编译器完成、构建器发出 `BuilderOutput` 对象时，这一阶段结束。                                                                                                                                              |
| 监听中       | 在两次运行之间，监听外部事件流。例如，监听文件系统中的任何变更。当编译器重新启动并调用 `context.reportRunning()` 时，这一阶段结束。                                                                                                          |
| 完成         | 任务已全部完成（例如需要运行若干次的编译器），或者构建器的运行被停止（使用 `BuilderRun.stop()`）。Architect 会执行清理逻辑，并取消对构建器 `Observable` 的订阅。                                                                             |

## 总结

CLI 构建器 API 提供了一种改变 Angular CLI 行为的方式：通过构建器执行自定义逻辑。

- 构建器可以是同步或异步的，可以执行一次或监听外部事件，还可以调度其他构建器或目标。
- 构建器的选项默认值在 `angular.json` 配置文件中指定，这些值可以被目标的备选配置覆盖，并可以进一步被命令行标志覆盖
- Angular 团队建议使用集成测试来测试 Architect 构建器。使用单元测试来验证构建器所执行的逻辑。
- 如果你的构建器返回 `Observable`，就应该在该 `Observable` 的清理逻辑中清理构建器。
