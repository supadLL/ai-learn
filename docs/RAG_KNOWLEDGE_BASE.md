# AI Play 内置 RAG 知识库方案

## 目标

把 AI Play 做成一个可离线使用的学习 App：内置课程、开放许可书籍、自有资料和官方文档片段，启动后即可本地检索。后续如果接入 LLM，就把检索结果作为上下文生成带引用的回答。

## 推荐架构

1. `knowledge/raw`
   - 存放 Markdown、TXT、HTML 清洗稿，或从 PDF/EPUB 转换后的文本。
   - 只放自有版权、开放许可或明确允许再分发的资料。

2. 构建期处理
   - 清洗文本。
   - 按标题、章节、段落切成 chunk。
   - 保留元数据：书名、作者、章节、页码、来源 URL、许可证。
   - 生成 256 维 embedding。
   - 输出 `public/knowledge/index.json` 或 SQLite 向量库。

3. App 运行期
   - 对用户问题生成 query embedding。
   - 在本地向量索引中做相似度检索。
   - 返回 TopK 片段和引用。
   - 调用用户配置的 LLM API，把用户问题和 TopK 片段交给 LLM。
   - LLM 使用固定系统提示词输出统一格式回答。

## 两种落地路线

### 路线 A：完全离线

- 打包 embedding 模型和向量索引。
- 优点：无 API Key、无网络依赖、隐私好。
- 缺点：安装包更大，首次加载模型需要时间。

适合学习 App 和固定知识库。

### 路线 B：构建期预生成 Embedding

- 开发者在发布 App 前生成所有书籍 embedding。
- App 只需要检索已打包索引。
- 用户提问的 query embedding 可以使用内置小模型，也可以让用户配置云端 API。

适合当前项目的第一版。

## 当前实现状态

当前代码已接入 `src/knowledge/localRag.ts`：

- 知识源：课程内容 + 资料目录 + 书籍导入占位片段。
- 检索方式：浏览器内轻量词向量检索。
- UI：右侧 `RAG 检索台`。
- 作用：先验证产品形态和交互。

同时已加入构建期资料处理：

- 原始资料目录：`knowledge/raw`
- 构建脚本：`npm run knowledge:build`
- 自检脚本：`npm run knowledge:check`
- 输出索引：`public/knowledge/index.json`
- 当前向量维度：256
- 当前 embedding 引擎：`feature-hash-256`，离线、轻量、可打包。

现在 `searchKnowledge` 已经使用 256 维向量 cosine 检索。下一阶段可以在 `scripts/build-knowledge-index.mjs` 中把 `embedText` 替换为神经 embedding 模型，同时保持索引 schema 和 UI 不变。

## 分阶段落地计划

### 阶段 1：本地 256 维向量索引

已完成：

- 构建期生成 `embedding: number[256]`。
- App 运行时生成 query embedding。
- 使用 cosine 相似度做 TopK 检索。
- 构建时自动运行知识库自检。

### 阶段 2：云端 / 中转 Embedding API

已完成第一版：

- Electron 主进程保存自定义 API 配置。
- 支持 OpenAI-compatible embedding endpoint。
- 支持自定义 endpoint、model、dimensions、headers JSON、response path。
- 导入用户资料时可使用云端 API 生成 chunk embedding。
- 用户查询时会使用同一 API 生成 query embedding。
- 检索时按 `embeddingEngine` 隔离向量，避免不同模型向量混用。

可用配置示例：

```txt
Endpoint: https://api.openai.com/v1/embeddings
Model: text-embedding-3-small
Dimensions: 256
Response path: data.0.embedding
```

后续增强：

- 支持本地神经 embedding 模型。
- 支持索引 engine 变更后的批量重建。
- 支持 per-source embedding engine。

### 阶段 3：用户导入资料

已完成第一版：

- Electron 端选择 PDF/Markdown/TXT/EPUB。
- 支持 Markdown/TXT/PDF。
- 自动切分 chunk。
- 自动生成 256 维 embedding。
- 写入 Electron 用户数据目录。
- App 启动时加载用户知识库并合并检索。
- 支持清空用户导入资料。

后续增强：

- EPUB 解析。
- 单文件删除。
- 导入历史和资料详情页。
- 大型索引改为 SQLite 或二进制向量文件。

## 导入资料格式

推荐 Markdown，并在文件头部写 metadata：

```md
---
title: My AI Notes
source: https://example.com/or/local-note
license: user-provided
---

# 第一章

正文内容……
```

字段说明：

- `title`：资料名称。
- `source`：来源 URL、文件来源或内部资料说明。
- `license`：许可证或授权说明。

如果没有 metadata，App 会使用文件名作为标题，并把 license 标记为 `user-provided`。

## 真实查询链路

当前 App 支持的完整链路：

```txt
用户提问
  -> 生成 query embedding
  -> 在本地知识库向量索引中检索 TopK
  -> 组装用户问题 + 引用片段 + 固定系统提示词
  -> 调用 LLM API
  -> 返回结构化解释和引用依据
```

LLM API 默认按 OpenAI-compatible chat completions 设计：

```txt
POST {endpoint}
Authorization: Bearer {apiKey}
Content-Type: application/json

{
  "model": "...",
  "temperature": 0.2,
  "messages": [
    {"role": "system", "content": "...固定提示词..."},
    {"role": "user", "content": "...用户问题 + 检索上下文..."}
  ]
}
```

默认响应路径：

```txt
choices.0.message.content
```

如果中转 API 返回结构不同，可以在界面里改 `响应路径`。

默认固定系统提示词要求 LLM 输出：

- 直接结论
- 关键解释
- 学习建议
- 引用依据

并要求只基于本地知识库上下文回答，上下文不足时明确说明不足。

## 第一批资料源

已整理到 `src/knowledge/sourceCatalog.ts`：

- Hugging Face Course：Apache-2.0，适合打包摘要和示例。
- Prompt Engineering Guide：MIT，适合打包提示工程、RAG 和 Agent 摘要。
- Dive into Deep Learning：CC BY-SA 4.0，适合做深度学习基础摘要，打包全文需遵守署名和相同方式共享。
- Machine Learning Systems：CC BY-NC-SA 4.0，适合生产化知识，但商业发行要注意 NC 条款。
- OpenAI / Anthropic / LangChain / GraphRAG 官方文档：适合链接和自写摘要，不建议直接整站打包。
- AI for Law & Finance：CC BY 4.0，适合治理、行业风险、Agent 合规案例。

## 注意

不要直接把未授权的商业书籍打包进 App。更稳的资料来源是：

- 官方文档中允许再分发的部分。
- 开放许可证书籍。
- Public domain 文本。
- 自己整理的课程讲义。
- 企业内部资料，但只在内部发行。
