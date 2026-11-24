# 在 Angular 中使用 Tailwind CSS {#using-tailwind-css-with-angular}

[Tailwind CSS](https://tailwindcss.com/) 是一个实用类优先（utility-first）的 CSS 框架，让你无需离开 HTML 就能构建现代网站。本指南将带你在 Angular 项目中设置 Tailwind CSS。

## 使用 `ng add` 自动设置 {#automated-setup-with-ng-add}

Angular CLI 提供了一种简便的方式，可以通过 `ng add` 命令把 Tailwind CSS 集成到你的项目中。该命令会自动安装所需的包、配置 Tailwind CSS，并更新项目的构建设置。

首先，在终端中进入 Angular 项目的根目录，然后运行以下命令：

```shell
ng add tailwindcss
```

该命令会执行以下操作：

- 安装 `tailwindcss` 及其对等依赖（peer dependencies）。
- 配置项目以使用 Tailwind CSS。
- 在你的样式中添加 Tailwind CSS 的 `@import` 语句。

运行 `ng add tailwindcss` 之后，你就可以立即在组件（Component）模板（Template）中使用 Tailwind 的实用类了。

## 手动设置（替代方法） {#manual-setup-alternative-method}

如果你更想手动设置 Tailwind CSS，请按以下步骤操作：

### 1. 创建 Angular 项目 {#_1-create-an-angular-project}

首先，如果你还没有 Angular 项目，请创建一个新项目。

```shell
ng new my-project
cd my-project
```

### 2. 安装 Tailwind CSS {#_2-install-tailwind-css}

接下来，在 Angular 项目的根目录中打开终端，运行以下命令来安装 Tailwind CSS 及其对等依赖：

::: code-group

```shell [npm]
npm install tailwindcss @tailwindcss/postcss postcss
```

```shell [yarn]
yarn add tailwindcss @tailwindcss/postcss postcss
```

```shell [pnpm]
pnpm add tailwindcss @tailwindcss/postcss postcss
```

```shell [bun]
bun add tailwindcss @tailwindcss/postcss postcss
```

:::

### 3. 配置 PostCSS 插件 {#_3-configure-postcss-plugins}

接下来，在项目根目录中添加一个 `.postcssrc.json` 文件。
把 `@tailwindcss/postcss` 插件添加到 PostCSS 配置中。

```json [.postcssrc.json]
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

### 4. 导入 Tailwind CSS {#_4-import-tailwind-css}

在 `./src/styles.css` 中添加一条 `@import`，用于导入 Tailwind CSS。

```css [src/styles.css]
@import 'tailwindcss';
```

如果你使用的是 SCSS，请在 `./src/styles.scss` 中添加 `@use`。

```scss [src/styles.scss]
@use 'tailwindcss';
```

### 5. 在项目中开始使用 Tailwind {#_5-start-using-tailwind-in-your-project}

现在，你可以在组件模板中使用 Tailwind 的实用类来为应用设置样式了。用 `ng serve` 运行构建过程，你应该就能看到带样式的标题。

例如，你可以在 `app.html` 文件中添加以下内容：

```html
<h1 class="text-3xl font-bold underline">Hello world!</h1>
```

## 更多资源 {#additional-resources}

- [Tailwind CSS 文档](https://tailwindcss.com/docs)
