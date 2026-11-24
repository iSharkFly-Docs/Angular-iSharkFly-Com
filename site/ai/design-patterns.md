# AI SDK 与信号 API 的设计模式 {#design-patterns-for-ai-sdks-and-signal-apis}

与 AI 和大语言模型（LLM）API 交互会带来一些独特的挑战，例如管理异步操作、处理流式数据，以及在网络请求可能缓慢或不可靠的情况下设计响应迅速的用户体验。Angular 的 [信号（Signal）](/guide/signals) 和 [`resource`](/guide/signals/resource) API 提供了强大的工具，可以优雅地解决这些问题。

## 使用信号触发请求 {#triggering-requests-with-signals}

处理用户提供的提示词（Prompt）时，一种常见的模式是把用户的实时输入与触发 API 调用的已提交值分开。

1. 在用户输入时，把原始输入存放在一个信号中
2. 当用户提交时（例如点击按钮），用第一个信号的内容更新第二个信号。
3. 在 `resource` 的 **`params`** 字段中使用第二个信号。

这种设置可以确保资源（Resource）的 **`loader`** 函数只在用户明确提交提示词时才会运行，而不是每次按键都运行。你可以在 `loader` 字段中使用其他信号参数，例如 `sessionId` 或 `userId`（可用于创建持久的大语言模型会话）。这样，请求始终使用这些参数的当前值，而不会重新触发 `loader` 字段中定义的异步函数。

许多 AI SDK 都提供了用于发起 API 调用的辅助方法。例如，Genkit 客户端库公开了用于调用 Genkit 流程的 `runFlow` 方法，你可以在资源的 `loader` 中调用它。对于其他 API，你可以使用 [`httpResource`](/guide/signals/resource#reactive-data-fetching-with-httpresource)。

下面的示例展示了一个获取 AI 生成故事片段的 `resource`。只有当 `storyInput` 信号变化时，才会触发 `loader`。

```ts
// 一个获取 AI 生成故事三个片段的资源
storyResource = resource({
  // 首次请求之前或出错时使用的默认值
  defaultValue: DEFAULT_STORY,
  // 当这个信号变化时，会重新触发 loader
  params: () => this.storyInput(),
  // 用于获取数据的异步函数
  loader: ({params}): Promise<StoryData> => {
    // params 的值就是 storyInput 信号的当前值
    const url = this.endpoint();
    return runFlow({
      url,
      input: {
        userInput: params,
        sessionId: this.storyService.sessionId(), // 从另一个信号读取
      },
    });
  },
});
```

## 为模板准备大语言模型数据 {#preparing-llm-data-for-templates}

你可以把大语言模型 API 配置为返回结构化数据。为 `resource` 设置与大语言模型预期输出相匹配的强类型，可以获得更好的类型安全性和编辑器自动补全。

要管理从资源派生的状态，请使用 `computed` 信号或 `linkedSignal`。由于 `linkedSignal` [可以访问先前的值](/guide/signals/linked-signal)，它可以满足多种与 AI 相关的用例，包括

- 构建聊天历史
- 在大语言模型生成内容期间，保留或自定义模板所显示的数据

在下面的示例中，`storyParts` 是一个 `linkedSignal`，它会把 `storyResource` 返回的最新故事片段追加到现有的故事片段数组中。

```ts
storyParts = linkedSignal<string[], string[]>({
  // 触发计算的源信号
  source: () => this.storyResource.value().storyParts,
  // 计算函数
  computation: (newStoryParts, previous) => {
    // 获取这个 linkedSignal 的先前值，或者一个空数组
    const existingStoryParts = previous?.value || [];
    // 返回一个包含旧片段和新片段的新数组
    return [...existingStoryParts, ...newStoryParts];
  },
});
```

## 性能与用户体验 {#performance-and-user-experience}

与传统的、确定性更强的 API 相比，大语言模型 API 可能更慢、更容易出错。你可以借助 Angular 的多项特性构建高性能且用户友好的界面。

- **限定加载范围：** 把 `resource` 放在直接使用该数据的组件中。这有助于减少变更检测周期（尤其是在 zoneless 应用中），并避免阻塞应用的其他部分。如果数据需要在多个组件之间共享，请通过服务提供 `resource`。
- **SSR 与水合：** 使用服务端渲染（SSR）配合增量水合（Hydration），快速渲染初始页面内容。你可以为 AI 生成的内容显示占位符，并把数据获取推迟到组件在客户端完成水合之后。
- **加载状态：** 使用 `resource` 的 `LOADING` [状态](/guide/signals/resource#resource-status)，在请求进行期间显示加载指示器（例如旋转图标）。这一状态同时涵盖初次加载和重新加载。
- **错误处理与重试：** 使用 `resource` 的 [**`reload()`**](/guide/signals/resource#reloading) 方法，以简单的方式让用户重试失败的请求；在依赖 AI 生成内容时，请求失败可能更为常见。

下面的示例演示了如何创建一个响应式 UI，动态显示 AI 生成的图片，并提供加载和重试功能。

```html
<!-- 在大语言模型生成图片期间显示加载旋转图标 -->
@if (imgResource.isLoading()) {
  <div class="img-placeholder">
    <mat-spinner [diameter]="50" />
  </div>
  <!-- 用生成的图片 URL 动态填充 src 属性 -->
} @else if (imgResource.hasValue()) {
  <img [src]="imgResource.value()" />
  <!-- 请求失败时提供重试选项 -->
} @else {
  <div class="img-placeholder" (click)="imgResource.reload()">
    <mat-icon fontIcon="refresh" />
    <p>Failed to load image. Click to retry.</p>
  </div>
}
```

## AI 模式实战：流式聊天响应 {#ai-patterns-in-action-streaming-chat-responses}

界面通常会在响应数据到达时，逐步显示基于大语言模型的 API 返回的部分结果。Angular 的资源 API 提供了流式响应的能力，以支持这类模式。`resource` 的 `stream` 属性接受一个异步函数，你可以用它随时间推移不断更新某个信号的值。被更新的信号代表正在流式传输的数据。

```ts
characters = resource({
  stream: async () => {
    const data = signal<ResourceStreamItem<string>>({value: ''});
    // 使用 Genkit 客户端 SDK 公开的 streamFlow 方法
    // 调用一个 Genkit 流式流程
    const response = streamFlow({
      url: '/streamCharacters',
      input: 10,
    });

    (async () => {
      for await (const chunk of response.stream) {
        data.update((prev) => {
          if ('value' in prev) {
            return {value: `${prev.value} ${chunk}`};
          } else {
            return {error: chunk as unknown as Error};
          }
        });
      }
    })();

    return data;
  },
});
```

`characters` 成员会被异步更新，并可以在模板中显示。

```html
@if (characters.isLoading()) {
  <p>Loading...</p>
} @else if (characters.hasValue()) {
  <p>{{ characters.value() }}</p>
} @else {
  <p>{{ characters.error() }}</p>
}
```

在服务端（例如在 `server.ts` 中），所定义的端点会把需要流式传输的数据发送给客户端。下面的代码使用 Gemini 和 Genkit 框架，但这一技术同样适用于其他支持大语言模型流式响应的 API：

```ts
import {startFlowServer} from '@genkit-ai/express';
import {genkit} from 'genkit/beta';
import {googleAI, gemini20Flash} from '@genkit-ai/googleai';

const ai = genkit({plugins: [googleAI()]});

export const streamCharacters = ai.defineFlow(
  {
    name: 'streamCharacters',
    inputSchema: z.number(),
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async (count, {sendChunk}) => {
    const {response, stream} = ai.generateStream({
      model: gemini20Flash,
      config: {
        temperature: 1,
      },
      prompt: `Generate ${count} different RPG game characters.`,
    });

    (async () => {
      for await (const chunk of stream) {
        sendChunk(chunk.content[0].text!);
      }
    })();

    return (await response).text;
  },
);

startFlowServer({
  flows: [streamCharacters],
});
```
