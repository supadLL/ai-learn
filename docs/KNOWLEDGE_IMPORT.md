# AI Play 知识资料导入说明

## 当前支持

桌面 App 内的 `RAG 检索台` 支持导入：

- Markdown：`.md`
- Plain text：`.txt`
- PDF：`.pdf`

导入后，App 会自动：

1. 读取文件。
2. 解析 metadata，PDF 会先抽取文本。
3. 按标题和长度切分 chunk。
4. 生成 256 维本地 embedding。
5. 写入用户数据目录。
6. 合并到本地 RAG 检索。

如果在 `RAG 检索台` 中把 Embedding 引擎切换为 `自定义 API`，导入资料时会使用该 API 生成 chunk embedding。之后用户提问时，也会用同一个 API 生成 query embedding，再与这些 chunks 做向量检索。

## 自定义 Embedding API

当前按 OpenAI-compatible embedding API 设计：

```txt
POST {endpoint}
Authorization: Bearer {apiKey}
Content-Type: application/json

{
  "model": "...",
  "input": "...",
  "dimensions": 256
}
```

默认响应路径：

```txt
data.0.embedding
```

如果你的中转 API 返回结构不同，可以在界面里自定义 `响应路径`，例如：

```txt
embedding
result.vector
data.embedding
```

如果你的中转 API 需要额外 header，可以填写 `自定义 Headers JSON`：

```json
{"X-Provider":"my-relay"}
```

## 自定义 LLM API

`RAG 检索台` 也支持配置 LLM API。完整生成链路是：

```txt
提问 -> RAG 检索 -> TopK 片段 + 用户问题 + 固定提示词 -> LLM -> 结构化解释
```

默认按 OpenAI-compatible chat completions 设计：

```txt
POST {endpoint}
Authorization: Bearer {apiKey}
Content-Type: application/json

{
  "model": "...",
  "temperature": 0.2,
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ]
}
```

默认响应路径：

```txt
choices.0.message.content
```

固定系统提示词可以在界面中修改，用来控制回答模板、语气、引用规则和“不知道就说明不足”的行为。

## 推荐 Markdown 格式

```md
---
title: Prompt Engineering Notes
source: https://github.com/dair-ai/Prompt-Engineering-Guide
license: MIT
---

# Prompt Basics

Prompt engineering is the practice of designing instructions...

## Few-shot

Few-shot examples help define task boundaries...
```

## 版权建议

可以导入：

- 自己写的笔记。
- 企业内部允许在本机使用的资料。
- 开放许可证资料。
- Public domain 资料。

不要直接打包或分发：

- 未授权商业书籍全文。
- 不允许再分发的课程内容。
- 受版权限制的 PDF。

## 当前限制

- EPUB 尚未接入解析器。
- 暂不支持单个资料删除。
- 当前离线 fallback 是本地 256 维 feature hashing embedding。
- 已支持自定义云端/中转 API embedding。
- 后续可继续接入本地神经 embedding 模型，索引 schema 已预留。
