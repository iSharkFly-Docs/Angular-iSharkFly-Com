# 为组件添加输入参数 {#add-an-input-parameter-to-the-component}

本节教程演示如何创建组件（Component）的 `input`，并用它向组件传递数据以实现定制。

<iframe src="https://www.youtube.com/embed/eM3zi_n7lNs?si=WvRGFSkW_7_zDIFD&amp;start=241" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

::: info 注意
这段视频展示的是较早的语法，但其中的主要概念仍然适用。

:::

## 你将学到什么 {#what-you-ll-learn}

你应用中的 `HousingLocation` 模板（Template）将拥有一个 `HousingLocation` 属性，用于接收输入。

## 输入概览 {#conceptual-preview-of-inputs}

[输入（Input）](https://angular.dev/api/core/input)允许组件指定可以由父组件传递给它的数据。

在本课中，你将在 `HousingLocation` 组件中定义一个 `input` 属性，借此定制组件中显示的数据。

请在[通过输入属性接收数据](/guide/components/inputs)和[通过输出自定义事件](/guide/components/outputs)指南中了解更多。



### 1. 导入 input() 函数 {#_1-import-the-input-function}

在代码编辑器中，将 `@angular/core` 中的 `input` 辅助方法和 `../housinglocation` 中的 `HousingLocationInfo` 接口导入到 `HousingLocation` 组件中。

```ts [Import input and HousingLocationInfo in housing-location.ts]
import {Component, input} from '@angular/core';
import {HousingLocationInfo} from '../housinglocation';

@Component({
  selector: 'app-housing-location',
  template: ` <p>housing-location works!</p> `,
  styleUrl: './housing-location.css',
})
export class HousingLocation {
  housingLocation = input.required<HousingLocationInfo>();
}
```


### 2. 添加 Input 属性 {#_2-add-the-input-property}

添加一个名为 `housingLocation` 的必需属性，并使用 `input.required()` 以 `HousingLocationInfo` 类型对其进行初始化。

  ```ts [Declare the input property in housing-location.ts]
  import {Component, input} from '@angular/core';
  import {HousingLocationInfo} from '../housinglocation';

  @Component({
    selector: 'app-housing-location',
    template: ` <p>housing-location works!</p> `,
    styleUrl: './housing-location.css',
  })
  export class HousingLocation {
    housingLocation = input.required<HousingLocationInfo>();
  }
  ```

你必须调用 `input` 上的 `required` 方法，以表明父组件必须提供一个值。在我们的示例应用中，我们知道这个值总是会被传入——这是有意为之的设计。`.required()` 调用确保 TypeScript 编译器会强制执行这一点，并在模板中使用此组件时将该属性视为不可为空（non-nullable）。


### 3. 向输入传递数据 {#_3-pass-data-to-the-input}

将 `Home` 组件中的 `housingLocation` 值传给 HousingLocation 组件的 `housingLocation` 属性。

```ts [Declare the input property for HousingLocation in home.ts]
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




::: info 总结
在本课中，你创建了一个新的 `input` 属性。你还使用了 `.required` 方法来确保信号（Signal）的值始终有定义。

:::

- [通过输入属性接收数据](/guide/components/inputs)
- [通过输出自定义事件](/guide/components/outputs)

