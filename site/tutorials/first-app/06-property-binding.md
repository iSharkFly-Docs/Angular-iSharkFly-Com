# 为组件模板添加属性绑定 {#add-a-property-binding-to-a-component-s-template}

本节教程演示如何在模板中添加属性绑定（Property Binding），并用它向组件传递动态数据。

<iframe src="https://www.youtube.com/embed/eM3zi_n7lNs?si=AsiczpWnMz5HhJqB&amp;start=599" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## 你将学到什么 {#what-you-ll-learn}

- 你的应用将在 `Home` 模板（Template）中使用数据绑定（Data Binding）。
- 你的应用将把数据从 `Home` 发送到 `HousingLocation`。

## 输入属性概念预览 {#conceptual-preview-of-inputs}

在本节中，你将继续完成从父组件（Component）向子组件共享数据的过程：在模板中使用属性绑定，把数据绑定到这些属性上。

属性绑定让你可以在 Angular 模板中把一个变量连接到 `Input`。之后，数据会动态绑定到该 `Input` 上。

如需更深入的说明，请参阅[属性绑定](/guide/templates/binding#binding-dynamic-properties-and-attributes)指南。



### 1. 更新 `Home` 模板 {#_1-update-the-home-template}

这一步为 `<app-housing-location>` 标签添加属性绑定。

在代码编辑器中：

1.  打开 `src/app/home/home.ts`
1.  在 `@Component` 装饰器的 template 属性中，将代码更新为如下所示：
    ```ts [Add housingLocation property binding]
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
          <app-housing-location [housingLocation]="housingLocation" />
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

    为组件标签添加属性绑定时，我们使用 `[attribute] = "value"` 语法告诉 Angular：所赋的值应被视为组件类中的属性，而不是字符串值。

    右侧的值是 `Home` 中的属性名。


### 2. 确认代码仍能正常运行 {#_2-confirm-the-code-still-works}

1.  保存更改，并确认应用没有任何错误。
1.  在继续下一步之前，修正所有错误。




::: info 总结
在本节中，你添加了一个新的属性绑定，并传入了一个对类属性的引用。现在，`HousingLocation` 可以访问这些数据，并用它们来定制组件的显示内容。

:::

如需进一步了解本节涉及的主题，请访问：

- [属性绑定](/guide/templates/binding#binding-dynamic-properties-and-attributes)

