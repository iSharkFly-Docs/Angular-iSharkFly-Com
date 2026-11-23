# NgOptimizedImage 入门

`NgOptimizedImage` 指令让你可以轻松地在图片加载方面采用性能最佳实践。

该指令通过以下方式确保优先加载[最大内容绘制（LCP）](https://web.dev/lcp)图片：

- 自动在 `<img>` 标签上设置 `fetchpriority` 属性
- 默认延迟加载其他图片
- 自动在文档头部生成 preconnect 链接标签
- 自动生成 `srcset` 属性
- 如果应用使用 SSR，会生成[预加载提示](https://developer.mozilla.org/docs/Web/HTML/Link_types/preload)

除了优化 LCP 图片的加载之外，`NgOptimizedImage` 还会强制执行一系列图片最佳实践，例如：

- 使用[图片 CDN 的 URL 来应用图片优化](https://web.dev/image-cdns/#how-image-cdns-use-urls-to-indicate-optimization-options)
- 通过要求设置 `width` 和 `height` 来防止布局偏移
- 如果 `width` 或 `height` 设置不正确，会发出警告
- 如果图片渲染时会在视觉上变形，会发出警告

如果你在 CSS 中使用背景图片，请[从这里开始](#how-to-migrate-your-background-image)。

::: info 注意
虽然 `NgOptimizedImage` 指令是在 Angular 15 版本中成为稳定功能的，但它已被向后移植，在 13.4.0 和 14.3.0 版本中也可以作为稳定功能使用。

:::

## 入门


### 1. 导入 `NgOptimizedImage` 指令

从 `@angular/common` 导入 `NgOptimizedImage` 指令：

```ts
import {NgOptimizedImage} from '@angular/common';
```

然后把它加入独立组件或 NgModule 的 `imports` 数组中：

```ts
imports: [
  NgOptimizedImage,
  // ...
],
```

### 2. （可选）设置加载器

使用 NgOptimizedImage 并**不要求**一定要有图片加载器，但把加载器和图片 CDN 配合使用，可以启用强大的性能功能，包括为图片自动生成 `srcset`。

设置加载器的简要指南，请参阅本页末尾的[配置图片加载器](#configuring-an-image-loader-for-ngoptimizedimage)一节。

### 3. 启用指令

要激活 `NgOptimizedImage` 指令，请把图片的 `src` 属性替换为 `ngSrc`。

```html
<img ngSrc="cat.jpg" />
```

如果你使用的是[内置的第三方加载器](#built-in-loaders)，请确保在 `src` 中省略基础 URL 路径，因为加载器会自动把它加在前面。

### 4. 把图片标记为 `priority`

始终把页面上的 [LCP 图片](https://web.dev/lcp/#what-elements-are-considered)标记为 `priority`，以优先加载它。

```html
<img ngSrc="cat.jpg" width="400" height="200" priority />
```

把图片标记为 `priority` 会应用以下优化：

- 设置 `fetchpriority=high`（在[这里](https://web.dev/priority-hints)了解更多关于优先级提示的信息）
- 设置 `loading=eager`（在[这里](https://web.dev/browser-level-image-lazy-loading)了解更多关于原生延迟加载的信息）
- 如果[在服务器上渲染](/guide/ssr)，会自动生成一个[预加载链接元素](https://developer.mozilla.org/docs/Web/HTML/Link_types/preload)。

在开发期间，如果 LCP 元素是一张没有 `priority` 属性的图片，Angular 会显示警告。页面的 LCP 元素可能因多种因素而不同，比如用户屏幕的尺寸，因此一个页面上可能有多张图片都应该标记为 `priority`。更多细节请参阅 [CSS for Web Vitals](https://web.dev/css-web-vitals/#images-and-largest-contentful-paint-lcp)。

### 5. 设置宽度和高度

为了防止[与图片相关的布局偏移](https://web.dev/css-web-vitals/#images-and-layout-shifts)，NgOptimizedImage 要求你为图片指定高度和宽度，如下所示：

```html
<img ngSrc="cat.jpg" width="400" height="200" />
```

对于**响应式图片**（你通过样式让它随视口放大和缩小的图片），`width` 和 `height` 属性应该是图片文件的固有尺寸。对于响应式图片，[为 `sizes` 设置一个值](#responsive-images)也很重要。

对于**固定尺寸的图片**，`width` 和 `height` 属性应该反映图片期望的渲染尺寸。这两个属性的宽高比应该始终与图片固有的宽高比一致。

::: info 注意
如果你不知道图片的尺寸，可以考虑使用「填充模式」来继承父容器的尺寸，具体见下文。

:::



## 使用 `fill` 模式

如果你希望图片填满它的容器元素，可以使用 `fill` 属性。当你想实现类似「背景图片」的效果时，这通常很有用。当你不知道图片的确切宽高，但有一个已知尺寸、希望图片适配进去的父容器时，它也很有帮助（参见下文的「object-fit」）。

给图片添加 `fill` 属性后，就不需要、也不应该再设置 `width` 和 `height`，如下例所示：

```html
<img ngSrc="cat.jpg" fill />
```

你可以使用 CSS 属性 [object-fit](https://developer.mozilla.org/docs/Web/CSS/object-fit) 来改变图片填充容器的方式。如果你给图片设置了 `object-fit: "contain"`，图片会保持宽高比，并以「留黑边」的方式适配元素。如果你设置了 `object-fit: "cover"`，图片会保持宽高比并完全填满元素，部分内容可能会被「裁剪」掉。

上述效果的可视化示例请参阅 [MDN 的 object-fit 文档](https://developer.mozilla.org/docs/Web/CSS/object-fit)。

你还可以使用 [object-position 属性](https://developer.mozilla.org/docs/Web/CSS/object-position)调整图片在容器元素中的位置。

::: warning 重要
要让「fill」图片正确渲染，它的父元素**必须**设置 `position: "relative"`、`position: "fixed"` 或 `position: "absolute"` 样式。

:::

## 如何迁移背景图片

下面是从 `background-image` 迁移到 `NgOptimizedImage` 的简单步骤。在这些步骤中，我们把带有背景图片的元素称为「容器元素」：

1. 从容器元素上移除 `background-image` 样式。
2. 确保容器元素设置了 `position: "relative"`、`position: "fixed"` 或 `position: "absolute"`。
3. 在容器元素中新建一个子图片元素，使用 `ngSrc` 启用 `NgOptimizedImage` 指令。
4. 给这个元素加上 `fill` 属性。不要设置 `height` 和 `width`。
5. 如果你认为这张图片可能是 [LCP 元素](https://web.dev/lcp/)，请给图片元素加上 `priority` 属性。

你可以按照[使用 fill 模式](#using-fill-mode)一节中的说明，调整背景图片填充容器的方式。

## 使用占位图

### 自动占位图

如果你使用的 CDN 或图片托管服务支持自动调整图片尺寸，NgOptimizedImage 可以为图片显示一个自动生成的低分辨率占位图。给图片加上 `placeholder` 属性即可使用这项功能：

```html
<img ngSrc="cat.jpg" width="400" height="200" placeholder />
```

添加这个属性后，会使用你指定的图片加载器自动请求第二个、尺寸更小的图片版本。在图片加载期间，这张小图会作为带 CSS 模糊效果的 `background-image` 样式显示。如果没有提供图片加载器，就无法生成占位图，并会抛出错误。

生成的占位图默认宽度为 30px。你可以在 `IMAGE_CONFIG` 提供者中指定一个像素值来改变这个尺寸，如下所示：

```ts
providers: [
  {
    provide: IMAGE_CONFIG,
    useValue: {
      placeholderResolution: 40
    }
  },
],
```

如果你希望模糊占位图有清晰的边缘，可以用一个带 `overflow: hidden` 样式的 `<div>` 包裹图片。只要这个 `<div>` 与图片尺寸相同（例如使用 `width: fit-content` 样式），占位图的「模糊边缘」就会被隐藏。

### Data URL 占位图

你也可以不使用图片加载器，而是用 base64 编码的 [data URL](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URLs) 指定占位图。data URL 的格式是 `data:image/[imagetype];[data]`，其中 `[imagetype]` 是图片格式，比如 `png`，`[data]` 是图片的 base64 编码。编码可以通过命令行或 JavaScript 完成。具体命令请参阅 [MDN 文档](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URLs#encoding_data_into_base64_format)。下面是一个数据被截断的 data URL 占位图示例：

```html
<img ngSrc="cat.jpg" width="400" height="200" placeholder="data:image/png;base64,iVBORw0K..." />
```

不过，较大的 data URL 会增加 Angular 包的体积，并拖慢页面加载。如果你无法使用图片加载器，Angular 团队建议把 base64 占位图控制在 4KB 以内，并且只用于关键图片。除了减小占位图的尺寸之外，还可以考虑更换图片格式或调整保存图片时使用的参数。在分辨率很低时，这些参数对文件大小的影响可能很大。

### 不模糊的占位图

默认情况下，NgOptimizedImage 会给图片占位图应用 CSS 模糊效果。要渲染不模糊的占位图，请提供 `placeholderConfig` 参数，传入一个包含 `blur` 属性且值为 false 的对象。例如：

```html
<img ngSrc="cat.jpg" width="400" height="200" placeholder [placeholderConfig]="{blur: false}" />
```

## 调整图片样式

根据图片的样式不同，添加 `width` 和 `height` 属性可能会让图片的渲染效果发生变化。如果你的图片样式导致图片以变形的宽高比渲染，`NgOptimizedImage` 会发出警告。

通常可以通过在图片样式中加上 `height: auto` 或 `width: auto` 来解决。更多信息请参阅 [web.dev 上关于 `<img>` 标签的文章](https://web.dev/patterns/web-vitals-patterns/images/img-tag)。

如果图片上的 `width` 和 `height` 属性妨碍你用 CSS 按自己想要的方式设置图片尺寸，可以考虑改用 `fill` 模式，并为图片的父元素设置样式。

## 性能功能

NgOptimizedImage 包含许多旨在提升应用加载性能的功能。本节将介绍这些功能。

### 添加资源提示

为图片源添加 [`preconnect` 资源提示](https://web.dev/preconnect-and-dns-prefetch)，可以确保 LCP 图片尽快加载。

对于作为参数传给[加载器](#optional-set-up-a-loader)的域名，会自动生成 preconnect 链接。如果无法自动识别图片源，并且没有检测到 LCP 图片的 preconnect 链接，`NgOptimizedImage` 会在开发期间发出警告。这时，你应该手动在 `index.html` 中添加资源提示。在文档的 `<head>` 中添加一个带有 `rel="preconnect"` 的 `link` 标签，如下所示：

```html
<link rel="preconnect" href="https://my.cdn.origin" />
```

要禁用 preconnect 警告，请注入 `PRECONNECT_CHECK_BLOCKLIST` 令牌：

```ts

providers: [
{provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://your-domain.com'}
],

```

关于自动生成 preconnect 的更多信息，请看[这里](#why-is-a-preconnect-element-not-being-generated-for-my-image-domain)。

### 通过自动 `srcset` 请求合适尺寸的图片

定义 [`srcset` 属性](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/srcset)可以确保浏览器根据用户的视口请求合适尺寸的图片，不会浪费时间下载过大的图片。`NgOptimizedImage` 会根据图片标签上是否存在 [`sizes` 属性](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/sizes)以及它的值，为图片生成合适的 `srcset`。

#### 固定尺寸的图片

如果你的图片尺寸应该是「固定」的（即除了[像素密度](https://web.dev/codelab-density-descriptors/)不同之外，在各种设备上尺寸都相同），就不需要设置 `sizes` 属性。`srcset` 可以根据图片的 width 和 height 属性自动生成，无需额外输入。

生成的 srcset 示例：

```html
<img ... srcset="image-400w.jpg 1x, image-800w.jpg 2x" />
```

#### 响应式图片

如果你的图片应该是响应式的（即根据视口尺寸放大和缩小），就需要定义 [`sizes` 属性](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/sizes)来生成 `srcset`。

如果你以前没用过 `sizes`，一个不错的起点是根据视口宽度来设置它。例如，如果你的 CSS 让图片占满视口宽度的 100%，就把 `sizes` 设为 `100vw`，浏览器会在 `srcset` 中选择最接近视口宽度的图片（在考虑像素密度之后）。如果你的图片大概只会占半个屏幕（例如在侧边栏中），就把 `sizes` 设为 `50vw`，确保浏览器选择较小的图片。以此类推。

如果上述方法不能满足你想要的图片行为，请参阅关于[高级 sizes 值](#advanced-sizes-values)的文档。

注意，对于延迟加载的图片，`NgOptimizedImage` 会自动在你提供的 `sizes` 值前面加上 `"auto"`。这是一项优化，在支持 `sizes="auto"` 的浏览器上能提高 srcset 选择的准确性，而不支持的浏览器会忽略它。非延迟加载的图片（例如 `priority` 图片）会保持你提供的 `sizes` 值不变。

默认的响应式断点是：

`[16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]`

如果你想自定义这些断点，可以使用 `IMAGE_CONFIG` 提供者：

```ts
providers: [
  {
    provide: IMAGE_CONFIG,
    useValue: {
      breakpoints: [16, 48, 96, 128, 384, 640, 750, 828, 1080, 1200, 1920]
    }
  },
],
```

如果你想手动定义 `srcset` 属性，可以通过 `ngSrcset` 属性提供你自己的值：

```html
<img ngSrc="hero.jpg" ngSrcset="100w, 200w, 300w" />
```

如果存在 `ngSrcset` 属性，`NgOptimizedImage` 会根据其中包含的尺寸生成并设置 `srcset`。不要在 `ngSrcset` 中包含图片文件名，指令会从 `ngSrc` 推断出这一信息。该指令同时支持宽度描述符（例如 `100w`）和密度描述符（例如 `1x`）。

```html
<img ngSrc="hero.jpg" ngSrcset="100w, 200w, 300w" sizes="50vw" />
```

### 禁用自动生成 srcset

要为单张图片禁用 srcset 的生成，可以在图片上添加 `disableOptimizedSrcset` 属性：

```html
<img ngSrc="about.jpg" disableOptimizedSrcset />
```

### 禁用图片延迟加载

默认情况下，`NgOptimizedImage` 会为所有未标记为 `priority` 的图片设置 `loading=lazy`。你可以通过设置 `loading` 属性，为非优先图片禁用这一行为。这个属性接受以下值：`eager`、`auto` 和 `lazy`。[详细信息请参阅标准图片 `loading` 属性的文档](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/loading#value)。

```html
<img ngSrc="cat.jpg" width="400" height="200" loading="eager" />
```

### 控制图片解码

默认情况下，`NgOptimizedImage` 会为所有图片设置 `decoding="auto"`。这让浏览器可以在获取图片之后自行决定解码的最佳时机。当图片被标记为 `priority` 时，Angular 会自动设置 `decoding="sync"`，确保图片尽早被解码和绘制，有助于提升**最大内容绘制（LCP）**性能。

对于非优先图片，你可以显式设置 `decoding` 属性来覆盖默认的 `auto`。优先图片始终使用 `decoding="sync"`。  
[详细信息请参阅标准图片 `decoding` 属性的文档](https://developer.mozilla.org/docs/Web/HTML/Element/img#decoding)。

```html
<!-- 默认：decoding 为 'auto' -->
<img ngSrc="gallery/landscape.jpg" width="1200" height="800" />

<!-- 异步解码图片，避免阻塞主线程。-->
<img ngSrc="gallery/preview.jpg" width="600" height="400" decoding="async" />

<!-- 优先图片自动使用 decoding="sync" -->
<img ngSrc="awesome.jpg" width="500" height="625" priority />

<!-- 当你需要立即得到像素时，立即解码（可能会阻塞） -->
<img ngSrc="hero.jpg" width="1600" height="900" decoding="sync" />
```

**允许的值**

- `auto`（默认）：让浏览器选择最佳策略。
- `async`：异步解码图片，尽可能避免阻塞主线程。
- `sync`：立即解码图片；可能会阻塞渲染，但能确保图片一可用，像素就已经准备好。

### 高级 'sizes' 值

你可能希望图片在不同尺寸的屏幕上以不同的宽度显示。这种模式的一个常见例子是基于网格或分栏的布局：在移动设备上渲染单栏，在较大的设备上渲染两栏。你可以在 `sizes` 属性中使用「媒体查询」语法来表达这种行为，例如：

```html
<img ngSrc="cat.jpg" width="400" height="200" sizes="(max-width: 768px) 100vw, 50vw" />
```

上例中的 `sizes` 属性表示：「在宽度小于 768px 的设备上，我预计这张图片占屏幕宽度的 100%；否则，我预计它占屏幕宽度的 50%。」

关于 `sizes` 属性的更多信息，请参阅 [web.dev](https://web.dev/learn/design/responsive-images/#sizes) 或 [mdn](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/sizes)。

## 为 `NgOptimizedImage` 配置图片加载器

「加载器」是一个函数，用于为给定的图片文件生成[图片转换 URL](https://web.dev/image-cdns/#how-image-cdns-use-urls-to-indicate-optimization-options)。在合适的情况下，`NgOptimizedImage` 会为图片设置尺寸、格式和图片质量等转换。

`NgOptimizedImage` 既提供了不应用任何转换的通用加载器，也提供了适用于各种第三方图片服务的加载器。它还支持编写你自己的自定义加载器。

| 加载器类型 | 行为 |
| :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 通用加载器 | 通用加载器返回的 URL 总是与 `src` 的值一致。换句话说，这个加载器不应用任何转换。它主要面向使用 Angular 提供图片服务的网站。 |
| 第三方图片服务的加载器 | 第三方图片服务的加载器返回的 URL 会遵循该图片服务所使用的 API 约定。 |
| 自定义加载器 | 自定义加载器的行为由其开发者定义。如果 `NgOptimizedImage` 预置的加载器不支持你的图片服务，就应该使用自定义加载器。 |

基于 Angular 应用中常用的图片服务，`NgOptimizedImage` 提供了针对以下图片服务预先配置好的加载器：

| 图片服务 | Angular API | 文档 |
| :------------------------ | :------------------------ | :-------------------------------------------------------------------------- |
| Cloudflare Image Resizing | `provideCloudflareLoader` | [文档](https://developers.cloudflare.com/images/image-resizing/) |
| Cloudinary | `provideCloudinaryLoader` | [文档](https://cloudinary.com/documentation/resizing_and_cropping) |
| ImageKit | `provideImageKitLoader` | [文档](https://docs.imagekit.io/) |
| Imgix | `provideImgixLoader` | [文档](https://docs.imgix.com/) |
| Netlify | `provideNetlifyLoader` | [文档](https://docs.netlify.com/image-cdn/overview/) |

使用**通用加载器**不需要修改任何额外的代码。这是默认行为。

### 内置加载器

要使用某个**第三方图片服务**现有的加载器，请把所选服务的提供者工厂添加到 `providers` 数组中。下例使用了 Imgix 加载器：

```ts
providers: [
  provideImgixLoader('https://my.base.url/'),
],
```

图片资源的基础 URL 应该作为参数传给提供者工厂。对大多数网站来说，这个基础 URL 应该符合以下模式之一：

- <https://yoursite.yourcdn.com>
- <https://subdomain.yoursite.com>
- <https://subdomain.yourcdn.com/yoursite>

你可以在对应 CDN 提供商的文档中进一步了解基础 URL 的结构。

### 自定义加载器

要使用**自定义加载器**，请把你的加载器函数作为 `IMAGE_LOADER` 依赖注入令牌的值提供。下例中的自定义加载器函数会返回一个以 `https://example.com` 开头、并把 `src`、`width` 和 `height` 作为 URL 参数的 URL。

```ts
providers: [
  {
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      return `https://example.com/images?src=${config.src}&width=${config.width}&height=${config.height}`;
    },
  },
],
```

`NgOptimizedImage` 指令的加载器函数接受一个 `ImageLoaderConfig` 类型（来自 `@angular/common`）的对象作为参数，并返回图片资源的绝对 URL。`ImageLoaderConfig` 对象包含 `src` 属性，以及可选的 `width`、`height` 和 `loaderParams` 属性。

::: info 注意
虽然 `width` 属性不一定总是存在，但自定义加载器必须使用它来支持按不同宽度请求图片，`ngSrcset` 才能正常工作。

:::

### `loaderParams` 属性

`NgOptimizedImage` 指令还支持一个额外的属性 `loaderParams`，它是专门为支持自定义加载器而设计的。`loaderParams` 属性接受一个可以包含任意属性的对象作为值，它本身不做任何事情。`loaderParams` 中的数据会被添加到传给自定义加载器的 `ImageLoaderConfig` 对象中，可以用来控制加载器的行为。

`loaderParams` 的一个常见用途是控制图片 CDN 的高级功能。

### 在内置加载器中使用 `transform` 属性

Cloudinary、Cloudflare、ImageKit 和 Imgix 的内置加载器支持 `loaderParams` 中一个特殊的 `transform` 属性。这个属性让你可以应用 CDN 提供的自定义图片转换。

`transform` 属性接受两种格式：

#### 字符串格式

使用 CDN 的转换语法，以逗号分隔的字符串形式提供转换：

```html
<img
  ngSrc="my-image.jpg"
  width="400"
  height="300"
  [loaderParams]="{transform: 'e_grayscale,r_10'}"
/>
```

#### 对象格式

以包含键值对的对象形式提供转换。

```html
<img
  ngSrc="my-image.jpg"
  width="400"
  height="300"
  [loaderParams]="{transform: {e: 'grayscale', r: 10}}"
/>
```

::: info 注意
Netlify 加载器不支持 `transform` 属性，因为 Netlify 的图片 CDN 不提供自定义转换参数。

:::

### 自定义加载器示例

下面是一个自定义加载器函数的示例。这个示例函数把 `src`、`width` 和 `height` 拼接起来，并使用 `loaderParams` 控制 CDN 的一个自定义圆角功能：

```ts
const myCustomLoader = (config: ImageLoaderConfig) => {
  let url = `https://example.com/images/${config.src}?`;
  let queryParams = [];
  if (config.width) {
    queryParams.push(`w=${config.width}`);
  }
  if (config.height) {
    queryParams.push(`h=${config.height}`);
  }
  if (config.loaderParams?.roundedCorners) {
    queryParams.push('mask=corners&corner-radius=5');
  }
  return url + queryParams.join('&');
};
```

注意，在上面的示例中，'roundedCorners' 这个属性名是我们自己定义的，用来控制自定义加载器的一项功能。之后在创建图片时就可以使用这项功能，如下所示：

```html
<img ngSrc="profile.jpg" width="300" height="300" [loaderParams]="{roundedCorners: true}" />
```

## 常见问题

### NgOptimizedImage 支持 CSS 属性 `background-image` 吗？

NgOptimizedImage 并不直接支持 CSS 属性 `background-image`，但它的设计可以轻松满足把图片用作另一个元素背景的场景。

从 `background-image` 迁移到 `NgOptimizedImage` 的具体步骤，请参阅上文的[如何迁移背景图片](#how-to-migrate-your-background-image)一节。

### 为什么不能在 `NgOptimizedImage` 中使用 `src`？

之所以选择 `ngSrc` 属性来触发 NgOptimizedImage，是出于浏览器加载图片方式方面的技术考量。NgOptimizedImage 会以编程方式修改 `loading` 属性：如果浏览器在这些修改生效之前就看到了 `src` 属性，它会立即开始下载图片文件，而对加载方式的修改会被忽略。

### 为什么没有为我的图片域名生成 preconnect 元素？

preconnect 的生成基于对应用的静态分析。这意味着图片域名必须直接写在加载器的参数中，如下例所示：

```ts
providers: [
  provideImgixLoader('https://my.base.url/'),
],
```

如果你用变量把域名字符串传给加载器，或者你没有使用加载器，静态分析就无法识别出域名，也就不会生成 preconnect 链接。这种情况下，你应该按照[上文所述](#add-resource-hints)，手动在文档头部添加 preconnect 链接。

### 可以在同一个页面中使用两个不同的图片域名吗？

[图片加载器](#configuring-an-image-loader-for-ngoptimizedimage)的提供者模式是针对「一个组件内只使用单个图片 CDN」这种常见场景设计的，力求尽量简单。不过，使用单个提供者管理多个图片 CDN 也完全可行。

为此，我们建议编写一个[自定义图片加载器](#custom-loaders)，通过 [`loaderParams` 属性](#the-loaderparams-property)传入一个标志，指定应该使用哪个图片 CDN，然后根据这个标志调用相应的加载器。

### 能为我偏好的 CDN 添加一个新的内置加载器吗？

出于维护方面的原因，我们目前不打算在 Angular 仓库中支持更多内置加载器。我们鼓励开发者把额外的图片加载器作为第三方包发布。

### 可以和 `<picture>` 标签一起使用吗

不可以，但这已在我们的路线图上，敬请期待。

如果你在等待这项功能，请在[这里](https://github.com/angular/angular/issues/56594)为这个 GitHub issue 点赞。

### 如何用 Chrome DevTools 找到我的 LCP 图片？

1. 在 Chrome DevTools 的性能标签页中，点击左上角的「开始分析并重新加载页面」按钮。它看起来像一个页面刷新图标。

2. 这会为你的 Angular 应用触发一次性能分析快照。

3. 性能分析结果出来后，在时间（Timings）部分选择「LCP」。

4. 底部面板中会出现一条摘要。你可以在「related node」一行中找到 LCP 元素。点击它，就会在 Elements 面板中显示该元素。

<img alt="LCP in the Chrome DevTools" src="/assets/images/guide/image-optimization/devtools-lcp.png">

::: info 注意
这只能找出你所测试页面视口内的 LCP 元素。还建议使用移动设备模拟，找出较小屏幕上的 LCP 元素。

:::
