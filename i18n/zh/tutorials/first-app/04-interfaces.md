# 创建接口

本节教程演示如何创建一个接口（Interface），并将其用在应用的组件（Component）中。

<iframe src="https://www.youtube.com/embed/eM3zi_n7lNs?si=YkFSeUeV8Ixtz8pm" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## 你将学到什么

- 你的应用将拥有一个新接口，可以把它用作数据类型。
- 你的应用将拥有一个带有示例数据的新接口实例。

## 接口概览

[接口](https://www.typescriptlang.org/docs/handbook/interfaces.html)是应用的自定义数据类型。

Angular 使用 TypeScript，以便充分利用强类型编程环境的优势。
强类型检查可以降低应用中一个元素向另一个元素发送格式错误数据的可能性。
这类类型不匹配错误会被 TypeScript 编译器捕获，其中许多错误也可以在 IDE 中被发现。

在本课中，你将创建一个接口，定义用于表示单个房屋位置数据的属性。



### 1. 创建一个新的 Angular 接口

这一步会在应用中创建一个新接口。

在 IDE 的**终端（Terminal）**窗格中：

1. 在你的项目目录中，进入 `first-app` 目录。
1. 在 `first-app` 目录中，运行此命令来创建新接口。

   ```shell

   ng generate interface housinglocation

   ```

1. 运行 `ng serve` 来构建应用，并在 `http://localhost:4200` 上启动它。
1. 在浏览器中打开 `http://localhost:4200` 查看你的应用。
1. 确认应用无错误地完成构建。
   在继续下一步之前，请修正所有错误。


### 2. 为新接口添加属性

这一步会为接口添加应用表示房屋位置所需的属性。

1.  如果 `ng serve` 命令尚未运行，请在 IDE 的**终端**窗格中启动它，以构建应用并在 `http://localhost:4200` 上启动。
1.  在 IDE 的**编辑（Edit）**窗格中，打开 `src/app/housinglocation.ts` 文件。
1.  在 `housinglocation.ts` 中，用以下代码替换默认内容，使新接口与此示例一致。

      ```ts [Update src/app/housinglocation.ts to match this code]
      export interface HousingLocationInfo {
        id: number;
        name: string;
        city: string;
        state: string;
        photo: string;
        availableUnits: number;
        wifi: boolean;
        laundry: boolean;
      }
      ```

1.  保存修改，并确认应用没有显示任何错误。在继续下一步之前，请修正所有错误。

至此，你已经定义了一个表示房屋位置数据的接口，其中包括 `id`、`name` 和位置信息。


### 3. 为应用创建一个测试房屋

你已经有了一个接口，但还没有使用它。

在这一步中，你将创建该接口的一个实例，并为其赋予一些示例数据。
你暂时还不会在应用中看到这些示例数据。
在那之前还需要完成几节课程。

1.  如果 `ng serve` 命令尚未运行，请在 IDE 的**终端**窗格中运行它，以构建应用并在 `http://localhost:4200` 上启动。
1.  在 IDE 的**编辑**窗格中，打开 `src/app/home/home.ts`。
1.  在 `src/app/home/home.ts` 中，在现有的 `import` 语句之后添加以下导入语句，使 `Home` 可以使用新接口。

      ```ts [Import Home in src/app/home/home.ts]
      import {Component} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';
      import {HousingLocationInfo} from '../housinglocation';

      @Component({
        selector: 'app-home',
        imports: [HousingLocation],
        template: `
          <section>
            <form>
              <input type="text" placeholder="Filter by city" />
              <button class="primary" type="button">Search</button>
            </form>
          </section>
          <section class="results">
            <app-housing-location />
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {
        readonly baseUrl = 'https://angular.dev/assets/images/tutorials/common';

        housingLocation: HousingLocationInfo = {
          id: 9999,
          name: 'Test Home',
          city: 'Test city',
          state: 'ST',
          photo: `${this.baseUrl}/example-house.jpg`,
          availableUnits: 99,
          wifi: true,
          laundry: false,
        };
      }
      ```

1.  在 `src/app/home/home.ts` 中，用以下代码替换空的 `export class Home {}` 定义，在组件中创建新接口的一个实例。

      ```ts [Add sample data to src/app/home/home.ts]
      import {Component} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';
      import {HousingLocationInfo} from '../housinglocation';

      @Component({
        selector: 'app-home',
        imports: [HousingLocation],
        template: `
          <section>
            <form>
              <input type="text" placeholder="Filter by city" />
              <button class="primary" type="button">Search</button>
            </form>
          </section>
          <section class="results">
            <app-housing-location />
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {
        readonly baseUrl = 'https://angular.dev/assets/images/tutorials/common';

        housingLocation: HousingLocationInfo = {
          id: 9999,
          name: 'Test Home',
          city: 'Test city',
          state: 'ST',
          photo: `${this.baseUrl}/example-house.jpg`,
          availableUnits: 99,
          wifi: true,
          laundry: false,
        };
      }
      ```

1.  确认你的 `home.ts` 文件与此示例一致。

      ```ts [src/app/home/home.ts]
      import {Component} from '@angular/core';
      import {HousingLocation} from '../housing-location/housing-location';
      import {HousingLocationInfo} from '../housinglocation';

      @Component({
        selector: 'app-home',
        imports: [HousingLocation],
        template: `
          <section>
            <form>
              <input type="text" placeholder="Filter by city" />
              <button class="primary" type="button">Search</button>
            </form>
          </section>
          <section class="results">
            <app-housing-location />
          </section>
        `,
        styleUrl: './home.css',
      })
      export class Home {
        readonly baseUrl = 'https://angular.dev/assets/images/tutorials/common';

        housingLocation: HousingLocationInfo = {
          id: 9999,
          name: 'Test Home',
          city: 'Test city',
          state: 'ST',
          photo: `${this.baseUrl}/example-house.jpg`,
          availableUnits: 99,
          wifi: true,
          laundry: false,
        };
      }
      ```

    通过向 `Home` 类添加类型为 `HousingLocation` 的 `housingLocation` 属性，我们就能确认数据符合接口的描述。如果数据不符合接口的描述，IDE 就有足够的信息为我们提供有用的错误提示。

1.  保存修改，并确认应用没有任何错误。打开浏览器，确认应用仍然显示消息 "housing-location works!"

      <img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!'" src="/assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">

1.  在继续下一步之前，请修正所有错误。




::: info 总结
在本课中，你创建了一个接口，为应用定义了一种新的数据类型。
借助这种新的数据类型，你可以指定哪些地方需要 `HousingLocation` 数据。
这种新的数据类型还能让你的 IDE 和 TypeScript 编译器确保在需要的地方使用的是 `HousingLocation` 数据。

:::

关于本课程所涉及主题的更多信息，请访问：

- [ng generate interface](https://angular.dev/cli/generate/interface)
- [ng generate](https://angular.dev/cli/generate)

