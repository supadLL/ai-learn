# Raw Knowledge Inputs

这里存放 AI Play 内置知识库的原始 Markdown。内容应当是原创、已授权、可再分发，或只包含对外部资料的自写摘要和链接。

推荐每个文件开头都写 metadata：

```md
---
title: AI Learning Roadmap
source: AI Play internal curriculum
license: Original AI Play learning note
---
```

当前构建脚本会：

1. 读取 `knowledge/raw/*.md`，跳过本 README。
2. 解析 frontmatter。
3. 按 Markdown 标题和长度切分 chunk。
4. 生成 `feature-hash-256` 本地 embedding。
5. 输出到 `public/knowledge/index.json`。

## 当前内置内容结构

- `ai-learning-roadmap.md`：零基础总路线，解释 LLM、Prompt、Embedding、RAG、Agent、Eval 的关系。
- `llm-foundations.md`：LLM 基础概念、上下文、采样参数、结构化输出和应用边界。
- `prompt-and-tool-calling.md`：提示工程、工具 Schema、错误恢复、人工确认和调试方法。
- `embedding-explained.md`：Embedding、feature hashing、神经 embedding 和当前项目检索实现说明。
- `rag-from-zero-to-production.md`：RAG 从文档解析、chunking、检索、生成、权限到评估的完整链路。
- `agent-workflows.md`：Agent、工作流、工具、记忆、计划执行、多 Agent 和安全边界。
- `evaluation-production.md`：评估集、日志、成本、延迟、安全、降级、发布和反馈闭环。
- `project-practice-guide.md`：用 AI Play 项目本身理解一个桌面 RAG 应用的代码路径。
- `ai-learning-sources.md`：可继续参考和扩充的外部学习资源索引。

新增资料后运行：

```bash
npm run knowledge:build
npm run knowledge:check
npm run retrieval:check
```
