# 智能体技能 {#agent-skills}

智能体技能（Agent Skills）是为 Gemini CLI 等 AI 智能体（Agent）设计的、面向特定领域的专业指令和能力。这些技能可以提供架构指导、生成符合 Angular 惯用写法的代码，并帮助你按照现代最佳实践搭建新项目。

借助智能体技能，你可以确保与你协作的 AI 智能体掌握有关 Angular 约定、响应式模型（例如信号（Signal））和项目结构的最新信息。

## 可用的技能 {#available-skills}

Angular 团队维护着一组官方技能（Skill），并会定期更新，与框架的最新改进保持同步。

| 技能                   | 说明                                                                                                                                                                                                                                                                                       |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`angular-developer`** | 生成 Angular 代码并提供架构指导。适用于创建组件、服务，或获取以下方面的最佳实践：响应式（signals、linkedSignal、resource）、表单、依赖注入、路由、SSR、无障碍（ARIA）、动画、样式、测试以及 CLI 工具。 |
| **`angular-new-app`**   | 使用 Angular CLI 创建新的 Angular 应用。提供有效搭建和组织现代 Angular 应用的重要指南。                                                                                                                                           |

## 使用智能体技能 {#using-agent-skills}

智能体技能专为 [Gemini CLI](https://geminicli.com/docs/cli/skills/)、[Antigravity](https://antigravity.google/docs/skills) 等智能体式编程工具而设计。激活某个技能时，会加载完成该任务所需的特定指令和资源。

要在自己的环境中使用这些技能，你可以按照所用工具的说明操作，也可以使用 [skills.sh](https://skills.sh/) 这样的社区工具。

```bash
npx skills add https://github.com/angular/skills
```
