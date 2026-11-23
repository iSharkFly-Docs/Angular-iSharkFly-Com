<!-- TODO: need an Angular + AI logo -->

# 使用 AI 构建

构建 AI 驱动的应用。借助 AI 更快地开发。


::: tip 提示
想在你喜爱的 AI 驱动 IDE 中开始构建？<br>请查看我们的[提示词规则与最佳实践](/ai/develop-with-ai)。

:::

基于大语言模型（LLM）的生成式 AI（GenAI）能够打造精巧且引人入胜的应用体验，包括个性化内容、智能推荐、媒体生成与理解、信息摘要以及动态功能。

在过去，开发这类功能需要深厚的领域专业知识和大量的工程投入。而如今，新的产品和 SDK 正在降低入门门槛。Angular 非常适合将 AI 集成到你的 Web 应用中，原因如下：

- Angular 强大的模板（Template）API 让你能够用生成的内容构建动态、组合清晰的 UI
- 强大的、基于信号（Signal）的架构，专为动态管理数据和状态而设计
- Angular 可以与各种 AI SDK 和 API 无缝集成

本指南演示了如何使用 [Genkit](/ai#build-ai-powered-applications-with-genkit-and-angular)、[Firebase AI Logic](/ai#build-ai-powered-applications-with-firebase-ai-logic-and-angular) 和 [Gemini API](/ai#build-ai-powered-applications-with-gemini-api-and-angular)，立即为你的 Angular 应用注入 AI 能力。本指南会讲解如何开始将 AI 集成到 Angular 应用中，助你快速开启 AI 驱动 Web 应用的开发之旅。本指南还分享了一些资源，例如入门套件、示例代码和常见工作流的实践方案，帮助你快速上手。

开始之前，你应该对 Angular 有基本的了解。刚接触 Angular？请试试我们的[基础知识指南](/essentials)或[入门教程](/tutorials)。

::: info 注意
虽然本页展示的是与 Google AI 产品的集成和示例，但像 Genkit 这样的工具与模型无关，允许你选择自己的模型。在很多情况下，这些示例和代码样例同样适用于其他第三方解决方案。

:::

## 入门

构建 AI 驱动的应用是一个崭新且快速发展的领域。决定从哪里开始、选择哪些技术可能颇具挑战。下面提供了三种可供选择的方案：

1. _Genkit_ 让你可以通过[统一的 API 选择受支持的模型和接口](https://genkit.dev)来构建全栈应用。非常适合需要复杂后端 AI 逻辑的应用，例如个性化推荐。

1. _Firebase AI Logic_ 为 Google 的模型提供了安全的客户端 API，用于构建纯客户端应用或移动应用。最适合直接在浏览器中运行的交互式 AI 功能，例如实时文本分析或基础聊天机器人。

1. _Gemini API_ 让你能够构建直接使用该 API 所暴露的方法和功能的应用，最适合全栈应用。适用于需要直接控制 AI 模型的应用，例如自定义图像生成或深度数据处理。

### 使用 Genkit 和 Angular 构建 AI 驱动的应用

[Genkit](https://genkit.dev) 是一个开源工具包，旨在帮助你在 Web 和移动应用中构建 AI 驱动的功能。它提供了统一的接口，用于集成来自 Google、OpenAI、Anthropic、Ollama 等厂商的 AI 模型，让你可以探索并选择最适合自身需求的模型。作为服务端解决方案，你的 Web 应用需要一个受支持的服务器环境（例如基于 Node 的服务器）才能与 Genkit 集成。例如，使用 Angular SSR 构建全栈应用就能为你提供起步所需的服务端代码。

以下是使用 Genkit 和 Angular 进行构建的示例：

- [使用 Genkit 和 Angular 构建智能体应用的入门套件](https://github.com/angular/examples/tree/main/genkit-angular-starter-kit) —— 刚开始用 AI 进行构建？从这个具有智能体工作流的基础应用开始吧。这是你初次体验 AI 构建的理想起点。

- [在 Angular 应用中使用 Genkit](https://genkit.dev/docs/frameworks/angular/) —— 构建一个使用 Genkit Flows、Angular 和 Gemini 2.5 Flash 的基础应用。这份分步演练将指导你创建一个具备 AI 功能的全栈 Angular 应用。

- [动态故事生成器应用](https://github.com/angular/examples/tree/main/genkit-angular-story-generator) —— 学习构建一个由 Genkit、Gemini 和 Imagen 3 驱动的智能体 Angular 应用，它会根据用户交互动态生成故事，并配有精美的图片面板来呈现故事中发生的事件。如果你想尝试更高级的用例，可以从这里开始。

  这个示例还配有深入讲解其功能的视频演练：
  - [观看「Building Agentic Apps with Angular and Genkit live!」](https://youtube.com/live/mx7yZoIa2n4?feature=share)
  - [观看「Building Agentic Apps with Angular and Genkit live! PT 2」](https://youtube.com/live/YR6LN5_o3B0?feature=share)

- [使用 Firebase 和 Google Cloud 构建智能体应用（咖啡师示例）](https://developers.google.com/solutions/learn/agentic-barista) - 学习如何使用 Firebase 和 Google Cloud 构建一个智能体咖啡点单应用。这个示例同时使用了 Firebase AI Logic 和 Genkit。

- [创建动态的服务端驱动 UI](https://github.com/angular/examples/tree/main/dynamic-sdui-app) - 学习构建智能体 Angular 应用，其 UI 视图会根据用户输入在运行时生成。

  这个示例还配有深入讲解其功能的视频演练：
  - [观看「Exploring the future of web apps」](https://www.youtube.com/live/4qargCqOu70?feature=share)

### 使用 Firebase AI Logic 和 Angular 构建 AI 驱动的应用

[Firebase AI Logic](https://firebase.google.com/products/vertex-ai-in-firebase) 提供了一种安全的方式，让你可以直接从 Web 和移动应用中与 Vertex AI Gemini API 或 Imagen API 交互。这对 Angular 开发者很有吸引力，因为应用既可以是全栈的，也可以是纯客户端的。如果你正在开发纯客户端应用，Firebase AI Logic 非常适合用来将 AI 融入你的 Web 应用。

以下是使用 Firebase AI Logic 和 Angular 进行构建的示例：

- [Firebase AI Logic x Angular 入门套件](https://github.com/angular/examples/tree/main/firebase-ai-logic-angular-example) - 使用这个入门套件构建一个电子商务应用，其中带有一个能够执行任务的聊天智能体。如果你没有使用 Firebase AI Logic 和 Angular 进行构建的经验，可以从这里开始。

  这个示例包含一个[深入讲解其功能并演示如何添加新功能的视频演练](https://youtube.com/live/4vfDz2al_BI)。

### 使用 Gemini API 和 Angular 构建 AI 驱动的应用

[Gemini API](https://ai.google.dev/gemini-api/docs) 提供对 Google 最先进模型的访问，这些模型支持音频、图像、视频和文本输入。这些模型针对特定用例进行了优化，[请在 Gemini API 文档网站上了解更多](https://ai.google.dev/gemini-api/docs/models)。

- [AI 文本编辑器 Angular 应用模板](https://github.com/FirebaseExtended/firebase-framework-tools/tree/main/starters/angular/ai-text-editor) - 使用此模板，从一个功能完整的文本编辑器起步，它具备润色文本、扩写文本和正式化文本等 AI 驱动的功能。这是积累通过 HTTP 调用 Gemini API 经验的良好起点。

- [AI 聊天机器人应用模板](https://github.com/FirebaseExtended/firebase-framework-tools/tree/main/starters/angular/ai-chatbot) - 此模板从一个通过 HTTP 与 Gemini API 通信的聊天机器人用户界面起步。

## 最佳实践

### 连接模型提供商并确保 API 凭据安全

连接模型提供商时，保护好你的 API 密钥非常重要。_切勿将 API 密钥放在会发送到客户端的文件中，例如 `environments.ts`_。

应用的架构决定了应该选择哪些 AI API 和工具。具体来说，要根据应用是客户端还是服务端来选择。Firebase AI Logic 等工具为客户端代码提供了与模型 API 之间的安全连接。如果你想使用 Firebase AI Logic 以外的 API，或者更倾向于使用其他模型提供商，可以考虑创建一个代理服务器，甚至使用 [Cloud Functions for Firebase](https://firebase.google.com/docs/functions) 作为代理，以免暴露你的 API 密钥。

关于使用客户端应用进行连接的示例，请参阅代码：[Firebase AI Logic Angular 示例仓库](https://github.com/angular/examples/tree/main/firebase-ai-logic-angular-example)。

对于需要 API 密钥的服务端模型 API 连接，请优先使用密钥管理器或环境变量，而不是 `environments.ts`。你应该遵循保护 API 密钥和凭据的标准最佳实践。Firebase 现在随 Firebase App Hosting 的最新更新提供了新的密钥管理器。要了解更多信息，[请查看官方文档](https://firebase.google.com/docs/app-hosting/configure)。

关于全栈应用中服务端连接的示例，请参阅代码：[Angular AI 示例（Genkit 和 Angular 故事生成器）仓库](https://github.com/angular/examples/tree/main/genkit-angular-story-generator)。

### 使用工具调用增强应用

如果你想构建智能体工作流，让智能体能够根据提示词采取行动并使用工具来解决问题，请使用「工具调用」。工具调用（也称为函数调用）是一种让 LLM 能够向调用它的应用发回请求的方式。作为开发者，你可以定义有哪些工具可用，并控制这些工具如何以及何时被调用。

工具调用让你的 AI 集成不再局限于问答式聊天机器人，从而进一步增强你的 Web 应用。实际上，你可以借助模型提供商的函数调用 API，让模型能够请求函数调用。可用的工具可以在应用的上下文中执行更复杂的操作。

在 [Angular 示例仓库](https://github.com/angular/examples)的[电子商务示例](https://github.com/angular/examples/blob/main/firebase-ai-logic-angular-example/src/app/ai.service.ts#L88)中，LLM 会请求调用库存相关的函数，以获取执行更复杂任务所需的上下文，例如计算商店中一组商品的总价。可用 API 的范围由你这个开发者决定，是否调用 LLM 请求的函数也同样由你决定。执行流程始终由你掌控。例如，你可以只暴露某个服务（Service）的特定函数，而不是该服务的全部函数。

### 处理非确定性响应

由于模型可能返回非确定性的结果，你在设计应用时应考虑到这一点。以下是一些可以在应用实现中采用的策略：

- 调整提示词和模型参数（例如 [temperature](https://ai.google.dev/gemini-api/docs/prompting-strategies)），以获得确定性更强或更弱的响应。你可以在 [ai.google.dev](https://ai.google.dev/) 的[提示策略部分了解更多信息](https://ai.google.dev/gemini-api/docs/prompting-strategies)。
- 采用「人在回路」（human in the loop）策略，由人工在工作流继续之前验证输出。构建应用工作流时，要允许操作者（人类或其他模型）验证输出并确认关键决策。
- 使用工具（或函数）调用和 schema 约束，将模型响应引导并限制为预定义的格式，从而提高响应的可预测性。

即便采用了这些策略和技术，你的应用设计中仍应包含合理的回退方案。请遵循现有的应用弹性标准。例如，应用不能因为某个资源或 API 不可用就崩溃。在这种情况下，应向用户显示错误消息，并在适用时显示后续操作选项。构建 AI 驱动的应用同样需要这样的考量。要确认响应与预期输出一致，并在不一致时通过[优雅降级](https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation)提供「安全着陆」。这同样适用于 LLM 提供商的 API 服务中断。

来看这个例子：LLM 提供商没有响应。处理这类服务中断的一种可行策略是：

- 保存用户的回复，以便在重试时使用（立即或稍后）
- 用恰当的消息提醒用户服务中断，且不泄露敏感信息
- 待服务恢复可用后，再继续之前的对话。

## 后续步骤

要了解 LLM 提示词和 AI IDE 设置，请参阅以下指南：

- [LLM 提示词和 IDE 设置](/ai/develop-with-ai)
- [智能体技能（Agent Skills）](/ai/agent-skills)

