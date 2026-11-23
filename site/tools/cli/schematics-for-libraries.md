# 库的原理图 {#schematics-for-libraries}

创建 Angular 库时，你可以为它提供并打包一些原理图（Schematic），让它与 Angular CLI 集成。
借助这些原理图，用户可以用 `ng add` 安装库的初始版本，
用 `ng generate` 创建库中定义的各种产物，并在库的新版本引入破坏性变更时，用 `ng update` 调整他们的项目。

这三类原理图都可以放进一个集合中，与你的库一起打包。

## 创建原理图集合 {#creating-a-schematics-collection}

要创建一个集合，首先需要创建原理图文件。
下面的步骤演示了如何在不修改任何项目文件的情况下添加初始支持。

1. 在库的根目录下，创建一个 `schematics` 文件夹。
1. 在 `schematics/` 文件夹中，为你的第一个原理图创建一个 `ng-add` 文件夹。
1. 在 `schematics` 文件夹的根级别，创建一个 `collection.json` 文件。
1. 编辑 `collection.json` 文件，为集合定义初始的 schema。

   ```json [projects/my-lib/schematics/collection.json (Schematics Collection)]
   {
     "$schema": "../../../node_modules/@angular-devkit/schematics/collection-schema.json",
     "schematics": {
       "ng-add": {
         "description": "Add my library to the project.",
         "factory": "./ng-add/index#ngAdd",
         "schema": "./ng-add/schema.json"
       }
     }
   }
   ```
   - `$schema` 路径是相对于 Angular Devkit 集合 schema 的。
   - `schematics` 对象描述了属于该集合的各个具名原理图。
   - 第一个条目是名为 `ng-add` 的原理图。
     它包含描述信息，并指向执行该原理图时要调用的工厂函数。

1. 在库项目的 `package.json` 文件中，添加一个 "schematics" 条目，其值为 schema 文件的路径。
   Angular CLI 在运行命令时会通过这个条目找到集合中的具名原理图。

```json [projects/my-lib/package.json (Schematics Collection Reference)]
{
  "name": "my-lib",
  "version": "0.0.1",
  "schematics": "./schematics/collection.json",
}
```

你创建的这个初始 schema 告诉 CLI 在哪里可以找到支持 `ng add` 命令的原理图。
现在，你可以开始创建这个原理图了。

## 提供安装支持 {#providing-installation-support}

为 `ng add` 命令编写的原理图可以增强用户的初始安装过程。
下面的步骤定义了这类原理图。

1. 进入 `<lib-root>/schematics/ng-add` 文件夹。
1. 创建一个 `schema.json` 文件，定义该原理图接受的选项。

   ```json [projects/my-lib/schematics/ng-add/schema.json (ng-add Schema)]
   {
     "$schema": "https://json-schema.org/schema",
     "$id": "SchematicsMyLibNgAdd",
     "title": "MyLib ng add Schema",
     "type": "object",
     "properties": {
       "project": {
         "type": "string",
         "description": "Name of the project.",
         "$default": {
           "$source": "projectName"
         }
       }
     }
   }
   ```

1. 创建一个 `schema.ts` 文件，为 `schema.json` 文件中定义的选项定义一个接口。

   ```ts [projects/my-lib/schematics/ng-add/schema.ts (ng-add Schema Interface)]
   export interface Schema {
     // 项目名称。
     project: string;
   }
   ```

1. 创建主文件 `index.ts`，并添加原理图工厂函数的源代码。

   ```ts [projects/my-lib/schematics/ng-add/index.ts (ng-add Rule Factory)]
   import {Rule} from '@angular-devkit/schematics';
   import {addRootImport} from '@schematics/angular/utility';
   import {Schema} from './schema';

   export function ngAdd(options: Schema): Rule {
     // 把来自 `my-lib` 的 `MyLibModule` 导入添加到用户项目的根部。
     return addRootImport(
       options.project,
       ({code, external}) => code`${external('MyLibModule', 'my-lib')}`,
     );
   }
   ```

Angular CLI 会自动安装库的最新版本，而这个示例更进一步，把 `MyLibModule` 添加到了应用的根部。`addRootImport` 函数接受一个回调，该回调需要返回一个代码块。你可以在用 `code` 函数标记的字符串中编写任意代码，而任何外部符号都必须用 `external` 函数包裹起来，以确保生成正确的 import 语句。

### 定义依赖类型 {#define-dependency-type}

使用 `ng-add` 的 `save` 选项来配置该库是应该添加到项目 `package.json` 配置文件的 `dependencies`、`devDependencies` 中，还是完全不保存。

```json [projects/my-lib/package.json (ng-add Reference)]
"ng-add": {
  "save": "devDependencies"
},
```

可能的取值有：

| 值                  | 说明                                    |
| :------------------ | :-------------------------------------- |
| `false`             | 不把该包添加到 `package.json`           |
| `true`              | 把该包添加到 dependencies               |
| `"dependencies"`    | 把该包添加到 dependencies               |
| `"devDependencies"` | 把该包添加到 devDependencies            |

## 构建原理图 {#building-your-schematics}

要把原理图和库打包在一起，必须配置库单独构建原理图，然后再把它们添加到包中。
必须在构建库*之后*再构建原理图，这样它们才会被放到正确的目录中。

- 你的库需要一个自定义的 TypeScript 配置文件，说明如何把原理图编译到要分发的库中
- 要把原理图添加到库的包中，需要在库的 `package.json` 文件中添加脚本

假设你的 Angular 工作区中有一个库项目 `my-lib`。
为了告诉库如何构建原理图，请在用于配置库构建的、自动生成的 `tsconfig.lib.json` 文件旁边添加一个 `tsconfig.schematics.json` 文件。

1. 编辑 `tsconfig.schematics.json` 文件，添加以下内容。

   ```json [projects/my-lib/tsconfig.schematics.json (TypeScript Config)]
   {
     "compilerOptions": {
       "baseUrl": ".",
       "lib": ["es2018", "dom"],
       "declaration": true,
       "module": "commonjs",
       "moduleResolution": "node",
       "noEmitOnError": true,
       "noFallthroughCasesInSwitch": true,
       "noImplicitAny": true,
       "noImplicitThis": true,
       "noUnusedParameters": true,
       "noUnusedLocals": true,
       "rootDir": "schematics",
       "outDir": "../../dist/my-lib/schematics",
       "skipDefaultLibCheck": true,
       "skipLibCheck": true,
       "sourceMap": true,
       "target": "es6",
       "types": ["jasmine", "node"]
     },
     "include": ["schematics/**/*"],
     "exclude": ["schematics/*/files/**/*"]
   }
   ```

   | 选项      | 说明                                                                                                             |
   | :-------- | :--------------------------------------------------------------------------------------------------------------- |
   | `rootDir` | 指定 `schematics` 文件夹中包含要编译的输入文件。                                                                 |
   | `outDir`  | 映射到库的输出文件夹。默认情况下，它是工作区根目录下的 `dist/my-lib` 文件夹。                                    |

1. 为确保原理图的源文件被编译进库的包中，请在库项目根目录（`projects/my-lib`）的 `package.json` 文件中添加以下脚本。

   ```json [projects/my-lib/package.json (Build Scripts)]
   // #docplaster
   {
     "name": "my-lib",
     "version": "0.0.1",
     "exports": {
       ".": "./src/public_api.ts"
     },
     "scripts": {
       "build": "tsc -p tsconfig.schematics.json",
       "postbuild": "copyfiles schematics/*/schema.json schematics/*/files/** schematics/collection.json ../../dist/my-lib/"
     },
     "peerDependencies": {
       "@angular/common": "^22.0.0",
       "@angular/core": "^22.0.0"
     },
     "schematics": "./schematics/collection.json",
     "ng-add": {
       "save": "devDependencies"
     },
     "devDependencies": {
       "copyfiles": "file:../../node_modules/copyfiles",
       "typescript": "file:../../node_modules/typescript"
     }
   }
   ```
   - `build` 脚本使用自定义的 `tsconfig.schematics.json` 文件编译原理图
   - `postbuild` 脚本在 `build` 脚本完成后复制原理图文件
   - `build` 和 `postbuild` 脚本都需要 `copyfiles` 和 `typescript` 依赖。
     要安装这些依赖，请在运行脚本之前，进入 `devDependencies` 中定义的路径并运行 `npm install`。

## 提供生成支持 {#providing-generation-support}

你可以向集合中添加一个具名原理图，让用户可以使用 `ng generate` 命令创建库中定义的产物。

假设你的库定义了一个需要进行一些设置的服务（Service）`my-service`。
你希望用户可以通过以下 CLI 命令生成它。

```shell

ng generate my-lib:my-service

```

首先，在 `schematics` 文件夹中新建一个子文件夹 `my-service`。

### 配置新的原理图 {#configure-the-new-schematic}

向集合中添加原理图时，必须在集合的 schema 中指向它，并提供配置文件来定义用户可以传给命令的选项。

1. 编辑 `schematics/collection.json` 文件，让它指向新的原理图子文件夹，并包含一个指向 schema 文件的引用，该文件用于指定新原理图的输入。

   ```json [projects/my-lib/schematics/collection.json (Schematics Collection)]
   {
     "$schema": "../../../node_modules/@angular-devkit/schematics/collection-schema.json",
     "schematics": {
       "ng-add": {
         "description": "Add my library to the project.",
         "factory": "./ng-add/index#ngAdd",
         "schema": "./ng-add/schema.json"
       },
       "my-service": {
         "description": "Generate a service in the project.",
         "factory": "./my-service/index#myService",
         "schema": "./my-service/schema.json"
       }
     }
   }
   ```

1. 进入 `<lib-root>/schematics/my-service` 文件夹。
1. 创建一个 `schema.json` 文件，并定义该原理图可用的选项。

   ```json [projects/my-lib/schematics/my-service/schema.json (Schematic JSON Schema)]
   {
     "$schema": "https://json-schema.org/schema",
     "$id": "SchematicsMyService",
     "title": "My Service Schema",
     "type": "object",
     "properties": {
       "name": {
         "description": "The name of the service.",
         "type": "string"
       },
       "path": {
         "type": "string",
         "format": "path",
         "description": "The path to create the service.",
         "visible": false,
         "$default": {
           "$source": "workingDirectory"
         }
       },
       "project": {
         "type": "string",
         "description": "The name of the project.",
         "$default": {
           "$source": "projectName"
         }
       }
     },
     "required": ["name"]
   }
   ```
   - _id_：该 schema 在集合中的唯一 ID。
   - _title_：该 schema 的人类可读描述。
   - _type_：属性所提供类型的描述符。
   - _properties_：一个对象，定义该原理图可用的选项。

   每个选项都会把一个键与类型、描述以及可选的别名关联起来。
   类型定义了你期望的值的形态，而描述会在用户请求该原理图的用法帮助时显示出来。

   关于原理图选项的更多自定义方式，请参阅工作区 schema。

1. 创建一个 `schema.ts` 文件，并定义一个接口，用于存储 `schema.json` 文件中所定义选项的值。

   ```ts [projects/my-lib/schematics/my-service/schema.ts (Schematic Interface)]
   export interface Schema {
     // 服务的名称。
     name: string;

     // 创建服务的路径。
     path?: string;

     // 项目的名称。
     project?: string;
   }
   ```

   | 选项    | 说明                                                                                                                                        |
   | :------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
   | name    | 你想为所创建的服务指定的名称。                                                                                                              |
   | path    | 覆盖提供给原理图的路径。默认的路径值基于当前工作目录。                                                                                      |
   | project | 指定要运行该原理图的具体项目。在原理图中，如果用户没有提供该选项，你可以提供一个默认值。                                                    |

### 添加模板文件 {#add-template-files}

要向项目中添加产物，原理图需要有自己的模板文件。
原理图模板支持用于执行代码和变量替换的特殊语法。

1. 在 `schematics/my-service/` 文件夹中创建一个 `files/` 文件夹。
1. 创建一个名为 `__name@dasherize__.service.ts.template` 的文件，定义用于生成文件的模板。
   这个模板会生成一个服务，该服务已经把 Angular 的 `HttpClient` 注入到了 `http` 属性中。

   ```ts [projects/my-lib/schematics/my-service/files/__name@dasherize__.service.ts.template (Schematic Template)]

   import { Service } from '@angular/core';
   import { HttpClient } from '@angular/common/http';

   @Service()
   export class <%= classify(name) %>Service {
      private http = inject(HttpClient);
   }

   ```

   - `classify` 和 `dasherize` 方法是工具函数，原理图会用它们来转换源模板和文件名。
   - `name` 作为属性由工厂函数提供。
     它就是你在 schema 中定义的那个 `name`。

### 添加工厂函数 {#add-the-factory-function}

基础设施已经就绪，现在可以定义主函数，对用户项目执行所需的修改了。

Schematics 框架提供了一个文件模板系统，同时支持路径模板和内容模板。
该系统作用于输入 `Tree` 中所加载的文件或路径里定义的占位符。
它会使用传入 `Rule` 的值来填充这些占位符。

关于这些数据结构和语法的详细信息，请参阅 [Schematics README](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md)。

1. 创建主文件 `index.ts`，并添加原理图工厂函数的源代码。
1. 首先，导入你需要的原理图定义。
   Schematics 框架提供了许多工具函数，用于在运行原理图时创建和使用规则。

   ```ts [projects/my-lib/schematics/my-service/index.ts (Imports)]
   import {
     Rule,
     Tree,
     SchematicsException,
     apply,
     url,
     applyTemplates,
     move,
     chain,
     mergeWith,
   } from '@angular-devkit/schematics';

   import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';
   ```

1. 导入已定义的 schema 接口，它为原理图的选项提供类型信息。

   ```ts [projects/my-lib/schematics/my-service/index.ts (Schema Import)]
   import {
     Rule,
     Tree,
     SchematicsException,
     apply,
     url,
     applyTemplates,
     move,
     chain,
     mergeWith,
   } from '@angular-devkit/schematics';

   import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';

   import {Schema as MyServiceSchema} from './schema';
   ```

1. 要构建这个生成原理图，先从一个空的规则工厂开始。

   ```ts [projects/my-lib/schematics/my-service/index.ts (Initial Rule)]
   export function myService(options: MyServiceSchema): Rule {
     return (tree: Tree) => tree;
   }
   ```

这个规则工厂会原样返回 tree，不做任何修改。
options 是从 `ng generate` 命令传入的选项值。

## 定义生成规则 {#define-a-generation-rule}

现在框架已经搭好，可以编写真正修改用户应用的代码，为库中定义的服务做好设置。

用户安装你的库的 Angular 工作区中包含多个项目（应用和库）。
用户可以在命令行中指定项目，也可以使用默认项目。
无论哪种情况，你的代码都需要确定该原理图要应用到哪个具体项目上，以便从项目配置中获取信息。

这可以通过传入工厂函数的 `Tree` 对象来完成。
`Tree` 的方法让你可以访问工作区中完整的文件树，从而在原理图执行期间读写文件。

### 获取项目配置 {#get-the-project-configuration}

1. 要确定目标项目，请使用 `workspaces.readWorkspace` 方法读取工作区配置文件 `angular.json` 的内容。
   要使用 `workspaces.readWorkspace`，需要从 `Tree` 创建一个 `workspaces.WorkspaceHost`。
   把以下代码添加到工厂函数中。

   ```ts [projects/my-lib/schematics/my-service/index.ts (Schema Import)]
   import {
     Rule,
     Tree,
     SchematicsException,
     apply,
     url,
     applyTemplates,
     move,
     chain,
     mergeWith,
   } from '@angular-devkit/schematics';

   import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';

   import {Schema as MyServiceSchema} from './schema';

   function createHost(tree: Tree): workspaces.WorkspaceHost {
     return {
       async readFile(path: string): Promise<string> {
         const data = tree.read(path);
         if (!data) {
           throw new SchematicsException('File not found.');
         }
         return virtualFs.fileBufferToString(data);
       },
       async writeFile(path: string, data: string): Promise<void> {
         return tree.overwrite(path, data);
       },
       async isDirectory(path: string): Promise<boolean> {
         return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
       },
       async isFile(path: string): Promise<boolean> {
         return tree.exists(path);
       },
     };
   }

   export function myService(options: MyServiceSchema): Rule {
     return async (tree: Tree) => {
       const host = createHost(tree);
       const {workspace} = await workspaces.readWorkspace('/', host);

     };
   }
   ```

   请务必检查上下文是否存在，并抛出相应的错误。

1. 有了项目名称之后，就可以用它来获取该项目专属的配置信息。

   ```ts [projects/my-lib/schematics/my-service/index.ts (Project)]
   const project = options.project != null ? workspace.projects.get(options.project) : null;
   if (!project) {
     throw new SchematicsException(`Invalid project name: ${options.project}`);
   }

   const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';
   ```

   `workspace.projects` 对象包含了所有项目专属的配置信息。

1. `options.path` 决定了应用原理图后，原理图模板文件会被移动到哪里。

   原理图 schema 中的 `path` 选项默认会被替换为当前工作目录。
   如果没有定义 `path`，就使用项目配置中的 `sourceRoot` 加上 `projectType`。

   ```ts [projects/my-lib/schematics/my-service/index.ts (Project Info)]
   if (options.path === undefined) {
     options.path = `${project.sourceRoot}/${projectType}`;
   }
   ```

### 定义规则 {#define-the-rule}

`Rule` 可以使用外部模板文件，对它们进行转换，并返回另一个包含转换后模板的 `Rule` 对象。
使用模板来生成原理图所需的任何自定义文件。

1. 把以下代码添加到工厂函数中。

   ```ts [projects/my-lib/schematics/my-service/index.ts (Template transform)]
   const templateSource = apply(url('./files'), [
     applyTemplates({
       classify: strings.classify,
       dasherize: strings.dasherize,
       name: options.name,
     }),
     move(normalize(options.path as string)),
   ]);
   ```

   | 方法               | 说明                                                                                                                                                                                                                                             |
   | :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `apply()`          | 把多个规则应用到一个源上，并返回转换后的源。它接受 2 个参数：一个源和一个规则数组。                                                                                                                                                              |
   | `url()`            | 从文件系统中读取源文件，路径相对于原理图。                                                                                                                                                                                                       |
   | `applyTemplates()` | 接收一个参数，其中包含你希望提供给原理图模板和原理图文件名使用的方法和属性。它返回一个 `Rule`。你就是在这里定义 `classify()` 和 `dasherize()` 方法以及 `name` 属性的。                                                                          |
   | `classify()`       | 接收一个值，并以首字母大写（title case）的形式返回。例如，如果提供的名称是 `my service`，则返回 `MyService`。                                                                                                                                   |
   | `dasherize()`      | 接收一个值，并以小写加连字符的形式返回。例如，如果提供的名称是 MyService，则返回 `my-service`。                                                                                                                                                  |
   | `move()`           | 在应用原理图时，把提供的源文件移动到目标位置。                                                                                                                                                                                                   |

1. 最后，规则工厂必须返回一个规则。

   ```ts [projects/my-lib/schematics/my-service/index.ts (Chain Rule)]
   return chain([mergeWith(templateSource)]);
   ```

   `chain()` 方法可以把多个规则组合成一个规则，这样你就能在一个原理图中执行多个操作。
   这里只是把模板规则与原理图执行的其他代码合并在一起。

下面是这个原理图规则函数的完整示例。

```ts [projects/my-lib/schematics/my-service/index.ts]
// #docplaster
import {
  Rule,
  Tree,
  SchematicsException,
  apply,
  url,
  applyTemplates,
  move,
  chain,
  mergeWith,
} from '@angular-devkit/schematics';

import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';

import {Schema as MyServiceSchema} from './schema';

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new SchematicsException('File not found.');
      }
      return virtualFs.fileBufferToString(data);
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}

export function myService(options: MyServiceSchema): Rule {
  return async (tree: Tree) => {
    const host = createHost(tree);
    const {workspace} = await workspaces.readWorkspace('/', host);


    const project = options.project != null ? workspace.projects.get(options.project) : null;
    if (!project) {
      throw new SchematicsException(`Invalid project name: ${options.project}`);
    }

    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';

    if (options.path === undefined) {
      options.path = `${project.sourceRoot}/${projectType}`;
    }

    const templateSource = apply(url('./files'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        name: options.name,
      }),
      move(normalize(options.path as string)),
    ]);

    return chain([mergeWith(templateSource)]);
  };
}
```

关于规则和工具方法的更多信息，请参阅[内置规则（Provided Rules）](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit/schematics#provided-rules)。

## 运行库的原理图 {#running-your-library-schematic}

构建好库和原理图之后，就可以安装原理图集合并在项目中运行了。
下面的步骤演示如何使用之前创建的原理图生成一个服务。

### 构建库和原理图 {#build-your-library-and-schematics}

在工作区的根目录下，为你的库运行 `ng build` 命令。

```shell

ng build my-lib

```

然后，进入库的目录来构建原理图

```shell

cd projects/my-lib
npm run build

```

### 链接库 {#link-the-library}

你的库和原理图会被打包并放到工作区根目录下的 `dist/my-lib` 文件夹中。
要运行原理图，需要把库链接到你的 `node_modules` 文件夹中。
在工作区的根目录下，运行 `npm link` 命令，并传入可分发库的路径。

```shell

npm link dist/my-lib

```

### 运行原理图 {#run-the-schematic}

库已经安装好了，现在使用 `ng generate` 命令运行原理图。

```shell

ng generate my-lib:my-service --name my-data

```

在控制台中，你会看到原理图已运行，并且在应用文件夹中创建了 `my-data.service.ts` 文件。

```shell

CREATE src/app/my-data.service.ts (208 bytes)

```
