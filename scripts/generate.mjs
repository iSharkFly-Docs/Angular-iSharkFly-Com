// Generates the site.json configuration file for the Angular documentation.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(SITE_DIR, 'src');
const GENERATED_DIR = path.join(SITE_DIR, '.vitepress', 'generated');

const GUIDE_CATEGORIES = [
  {
    text: 'Getting Started',
    items: [
      { id: 'intro', title: 'Angular 简介' },
      { id: 'guide/what-is-angular', title: '什么是 Angular' },
      { id: 'guide/setup-local', title: '搭建本地环境' },
    ],
  },
  {
    text: 'Tutorial',
    items: [
      { id: 'guide/architecture', title: '架构概览' },
      { id: 'guide/architecture-modules', title: '模块简介' },
      { id: 'guide/architecture-components', title: '组件简介' },
    ],
  },
  {
    text: 'Components',
    items: [
      { id: 'guide/component-overview', title: '组件概述' },
      { id: 'guide/component-interaction', title: '组件交互' },
      { id: 'guide/lifecycle-hooks', title: '生命周期钩子' },
    ],
  },
  {
    text: 'Templates',
    items: [
      { id: 'guide/template-syntax', title: '模板语法' },
      { id: 'guide/interpolation', title: '插值' },
      { id: 'guide/property-binding', title: '属性绑定' },
      { id: 'guide/event-binding', title: '事件绑定' },
    ],
  },
  {
    text: 'Directives',
    items: [
      { id: 'guide/built-in-directives', title: '内置指令' },
      { id: 'guide/attribute-directives', title: '属性型指令' },
      { id: 'guide/structural-directives', title: '结构型指令' },
    ],
  },
  {
    text: 'Dependency Injection',
    items: [
      { id: 'guide/dependency-injection', title: '依赖注入简介' },
      { id: 'guide/dependency-injection-providers', title: 'DI 提供者' },
      { id: 'guide/hierarchical-dependency-injection', title: '分层注入' },
    ],
  },
  {
    text: 'Routing',
    items: [
      { id: 'guide/router', title: '路由简介' },
      { id: 'guide/router-tutorial', title: '路由教程' },
    ],
  },
  {
    text: 'Forms',
    items: [
      { id: 'guide/forms-overview', title: '表单简介' },
      { id: 'guide/reactive-forms', title: '响应式表单' },
      { id: 'guide/forms', title: '模板驱动表单' },
    ],
  },
  {
    text: 'HTTP Client',
    items: [
      { id: 'guide/http', title: 'HTTP 客户端' },
    ],
  },
  {
    text: 'Testing',
    items: [
      { id: 'guide/testing', title: '测试简介' },
      { id: 'guide/testing-components-basics', title: '组件测试' },
      { id: 'guide/testing-services', title: '服务测试' },
    ],
  },
  {
    text: 'Developer Guides',
    items: [
      { id: 'guide/i18n', title: '国际化' },
      { id: 'guide/animations', title: '动画' },
      { id: 'guide/service-worker-intro', title: 'Service Workers' },
      { id: 'guide/web-worker', title: 'Web Workers' },
      { id: 'guide/universal', title: '服务端渲染' },
    ],
  },
  {
    text: 'Best Practices',
    items: [
      { id: 'guide/security', title: '安全' },
      { id: 'guide/accessibility', title: '无障碍' },
      { id: 'guide/updating', title: '保持更新' },
    ],
  },
];

const API_CATEGORIES = [
  {
    text: 'API',
    items: [
      { id: 'api/index', title: 'API 参考' },
    ],
  },
];

function generateSidebar(base) {
  const guideSidebar = GUIDE_CATEGORIES.map(category => ({
    text: category.text,
    collapsed: false,
    items: category.items.map(item => ({
      text: item.title,
      link: `${base}${item.id}`,
    })),
  }));

  const apiSidebar = API_CATEGORIES.map(category => ({
    text: category.text,
    collapsed: false,
    items: category.items.map(item => ({
      text: item.title,
      link: `${base}${item.id}`,
    })),
  }));

  return {
    [`${base}api/`]: apiSidebar,
    [base]: guideSidebar,
  };
}

function main() {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });

  const site = {
    locales: {
      root: {
        label: 'Angular',
        base: '/',
        sidebar: generateSidebar('/'),
      },
    },
  };

  fs.writeFileSync(
    path.join(GENERATED_DIR, 'site.json'),
    JSON.stringify(site, null, 2)
  );

  console.log('[generate] Generated site.json');
}

main();
