---
title: Embedding 与 Feature Hashing 解释
source: AI Play internal note
license: Original AI Play learning note
---

# Embedding 是什么

Embedding 可以理解为：把一段文本变成一串数字，让程序可以用距离或相似度来比较两段文本是否相关。

例如，“RAG 是什么？”经过 embedding 后会变成一个向量，例如 `[0.012, -0.034, 0.981, ...]`。两个文本的向量越接近，系统就认为它们越相关。

人能直接理解语义，但程序不能。程序看到的是字符串。Embedding 的作用是把“RAG 是什么？”、“RAG 介绍”、“检索增强生成的基本原理”、“如何让模型基于知识库回答？”这些文本变成向量空间里的点。如果 embedding 模型足够好，这些点会在空间里靠得比较近。

# RAG 里的 Embedding 做什么

典型 RAG 链路是：

资料文档先被切成 chunk，每个 chunk 生成 embedding，然后存进向量库。用户问题也会生成 query embedding，再和 chunk embedding 比相似度，找出最相关的 TopK chunk。最后把这些 chunk 和用户问题一起交给 LLM，让 LLM 基于资料回答。

所以 embedding 不是最终回答者。它的角色是帮系统从知识库里找资料。最终解释通常由 LLM 完成。

# Feature Hashing 是什么

Feature hashing 是一种很轻量的词面向量化方法。它不理解语义，只做这件事：文本先切 token，每个 token hash 到固定维度，最后得到向量。

例如设置 256 维后，“RAG 是什么？”可能会被切成 `rag`、`是什`、`什么`。这些 token 会分别落到 256 个格子里的某几维，例如 `rag -> 第 17 维 +1`，`是什 -> 第 92 维 -1`，`什么 -> 第 201 维 +1`。最后再做归一化，让它适合计算 cosine 相似度。

Feature hashing 的优点是不用模型、不用网络、速度快、安装包小、可以离线运行。缺点是它不真正理解语义，依赖词面重合，同义词不一定接近，中英文表达切换效果也不稳定。

因此 feature hashing 适合做 fallback，不适合作为最终高质量 RAG 检索方案。

# 神经 Embedding 是什么

神经 embedding 是用模型生成向量。它可以学习到“RAG”、“retrieval augmented generation”、“检索增强生成”在语义上接近，也可以学习到“是什么”、“介绍”、“定义”、“概念”在语义上接近。

所以对于“RAG 介绍”和“RAG 是什么”这种表达，神经 embedding 更可能把它们放到相近的位置。它比 feature hashing 更适合真正的知识库问答和语义检索。

# 当前项目里的 Embedding 处理

AI Play 当前有两套 embedding 逻辑。

第一套是默认离线 fallback：`feature-hash-256`。它会去除 HTML、统一小写、英文和数字按词切分、中文按相邻双字切分，然后把 token hash 到 256 维向量里，再做归一化。

第二套是自定义 API embedding。用户可以在 RAG 检索台里配置 embedding endpoint、model、dimensions、API Key、response path 和 headers。当导入资料时，chunk 会调用自定义 embedding API 生成向量；当用户提问时，问题也会调用同一个 embedding API 生成 query embedding。

完整链路是：导入资料，读取 md/txt/pdf，提取文本，切 chunk，生成 embedding，保存到用户知识库。用户提问时，系统生成 query embedding，和知识库 chunk embedding 做 cosine 相似度，找 TopK，再把 TopK、问题和固定提示词交给 LLM。

# 为什么 RAG 是什么之前效果不好

默认 fallback 不知道“是什么”、“介绍”、“定义”、“概念”是接近表达。它只能看到 token。

“RAG 介绍”包含 `rag` 和 `介绍`；“RAG 是什么”包含 `rag`、`是什`、`什么`。如果资料标题或内容里有“介绍”，那么“RAG 介绍”会更容易命中。但“RAG 是什么”不一定能命中“介绍”相关内容。

因此可以用查询扩展补救，例如把“RAG 是什么”扩展为“RAG 是什么、RAG 介绍、检索增强生成、概念、定义、基础、入门”。但根本上，更好的方式是接入神经 embedding API。
