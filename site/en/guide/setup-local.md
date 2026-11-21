---
title: 搭建本地环境
---

# 搭建本地环境

本指南将帮助你在本地搭建 Angular 开发环境。

## 前置条件

### Node.js

Angular 需要 Node.js 的活跃 LTS 或维护 LTS 版本。

检查 Node.js 版本：

```bash
node -v
```

### npm 包管理器

Angular CLI 使用 npm 来安装依赖。

```bash
npm -v
```

## 安装 Angular CLI

使用 npm 全局安装 Angular CLI：

```bash
npm install -g @angular/cli
```

验证安装：

```bash
ng version
```

## 创建新项目

使用 CLI 创建新的 Angular 项目：

```bash
ng new my-app
```

CLI 会询问一些配置选项：

- 是否添加 Angular 路由
- 使用哪种样式表格式（CSS、SCSS、Sass、Less）

## 运行应用

进入项目目录并启动开发服务器：

```bash
cd my-app
ng serve
```

在浏览器中打开 `http://localhost:4200/`。

## 项目结构

```
my-app/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   └── app.module.ts
│   ├── assets/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

## 下一步

- [架构概览](/en/guide/architecture)
- [组件概述](/en/guide/component-overview)
