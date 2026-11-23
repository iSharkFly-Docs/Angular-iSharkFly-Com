# 为组件模板添加插值 {#add-an-interpolation-to-a-component-s-template}

本节教程演示如何在 Angular 模板（Template）中添加插值（Interpolation），以便在模板中显示动态数据。

<iframe src="https://www.youtube.com/embed/eM3zi_n7lNs?si=IFAly3Ss8dwqFx8N&amp;start=338" title="Video" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>

## 你将学到什么 {#what-you-ll-learn}

- 你的应用将在 `HousingLocation` 模板中显示插值的值。
- 你的应用将在浏览器中渲染一条房屋位置数据。

## 插值概念预览 {#conceptual-preview-of-interpolation}

在这一步中，你将使用插值在模板中显示从 `input` 属性读取到的值。

在 Angular 模板中使用 `{{ expression }}`，可以渲染来自属性、`inputs` 以及合法 JavaScript 表达式的值。

如需更深入的说明，请参阅[使用插值显示值](/guide/templates/binding#render-dynamic-text-with-text-interpolation)指南。



### 1. 更新 `HousingLocation` 模板以包含插值 {#_1-update-housinglocation-template-to-include-interpolated-values}

这一步在 `HousingLocation` 模板中添加新的 HTML 结构和插值。

在代码编辑器中：

1.  打开 `src/app/housing-location/housing-location.ts`
1.  在 `@Component` 装饰器的 template 属性中，将现有的 HTML 标记替换为以下代码：

    ```ts [Update HousingLocation template in housing-location.ts]
    import {Component, input} from '@angular/core';
    import {HousingLocationInfo} from '../housinglocation';

    @Component({
      selector: 'app-housing-location',
      template: `
        <section class="listing">
          <img
            class="listing-photo"
            [src]="housingLocation().photo"
            alt="Exterior photo of {{ housingLocation().name }}"
            crossorigin
          />
          <h2 class="listing-heading">{{ housingLocation().name }}</h2>
          <p class="listing-location">{{ housingLocation().city }}, {{ housingLocation().state }}</p>
        </section>
      `,
      styleUrl: './housing-location.css',
    })
    export class HousingLocation {
      housingLocation = input.required<HousingLocationInfo>();
    }
    ```

在这段更新后的模板代码中，你使用属性绑定（Property Binding）把 `housingLocation.photo` 绑定到 `src` 属性上。`alt` 属性则使用插值，为图片的替代文本提供更多上下文。

你使用插值来包含 `housingLocation` 属性中 `name`、`city` 和 `state` 的值。


### 2. 确认更改已在浏览器中渲染 {#_2-confirm-the-changes-render-in-the-browser}

1.  保存所有更改。
1.  打开浏览器，确认应用渲染出了照片、城市和州的示例数据。
    <img alt="browser frame of homes-app displaying logo, filter text input box, search button and the same housing location UI card" src="/assets/images/tutorials/first-app/homes-app-lesson-07-step-2.png">




::: info 总结
在本节中，你添加了新的 HTML 结构，并使用 Angular 模板语法在 `HousingLocation` 模板中渲染值。

:::

现在，你已经掌握了两项重要技能：

- 向组件（Component）传递数据
- 在模板中插入值

有了这些技能，你的应用现在可以共享数据，并在浏览器中显示动态值。到目前为止，做得很好。

如需进一步了解本节涉及的主题，请访问：

- [模板语法](/guide/templates)
- [使用插值显示值](/guide/templates/binding#render-dynamic-text-with-text-interpolation)

