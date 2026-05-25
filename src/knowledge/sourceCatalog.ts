export interface KnowledgeSource {
  id: string
  title: string
  url: string
  license: string
  licenseKind: 'permissive' | 'creative-commons' | 'official-docs' | 'paper' | 'check-before-bundling'
  ingestionMode: 'bundle-ready' | 'summarize-and-link' | 'link-only'
  topics: string[]
  summary: string
  recommendedUse: string
}

export const knowledgeSources: KnowledgeSource[] = [
  {
    id: 'huggingface-course',
    title: 'Hugging Face Course',
    url: 'https://github.com/huggingface/course',
    license: 'Apache-2.0',
    licenseKind: 'permissive',
    ingestionMode: 'bundle-ready',
    topics: ['Transformers', 'NLP', 'LLM', 'fine-tuning'],
    summary:
      '面向 Transformers、NLP 和 Hugging Face 生态的开放课程，适合作为模型使用、微调和基础 NLP 工作流的知识源。',
    recommendedUse: '可优先导入章节摘要、任务示例和术语解释，保留 Apache-2.0 许可证说明。'
  },
  {
    id: 'prompt-engineering-guide',
    title: 'Prompt Engineering Guide',
    url: 'https://github.com/dair-ai/Prompt-Engineering-Guide',
    license: 'MIT',
    licenseKind: 'permissive',
    ingestionMode: 'bundle-ready',
    topics: ['prompt engineering', 'RAG', 'agents', 'reasoning'],
    summary:
      '覆盖提示工程、上下文工程、RAG、Agent 和论文索引的开放指南，适合补强 App 中的提示与工具调用模块。',
    recommendedUse: '可导入概念说明和技术索引，引用原项目和 MIT License。'
  },
  {
    id: 'dive-into-deep-learning',
    title: 'Dive into Deep Learning',
    url: 'https://github.com/d2l-ai/d2l-en',
    license: 'CC BY-SA 4.0 for book content; modified MIT for sample code',
    licenseKind: 'creative-commons',
    ingestionMode: 'summarize-and-link',
    topics: ['deep learning', 'neural networks', 'transformers', 'optimization'],
    summary:
      '交互式深度学习书籍，覆盖神经网络、优化、NLP、计算机视觉和强化学习，适合做底层机器学习知识补充。',
    recommendedUse: '建议先导入自写摘要和链接；若打包原文，需要遵守 CC BY-SA 4.0 的署名和相同方式共享要求。'
  },
  {
    id: 'ml-systems-book',
    title: 'Machine Learning Systems',
    url: 'https://mlsysbook.ai/',
    license: 'CC BY-NC-SA 4.0 unless otherwise stated',
    licenseKind: 'creative-commons',
    ingestionMode: 'summarize-and-link',
    topics: ['ML systems', 'deployment', 'optimization', 'MLOps'],
    summary:
      '面向 AI 工程和 ML 系统的开放教材，覆盖系统思维、性能工程、部署、可信系统和前沿方向。',
    recommendedUse: '适合作为生产化、评估、部署模块的延伸阅读；商业发行前需要处理 NC 条款。'
  },
  {
    id: 'openai-embeddings-docs',
    title: 'OpenAI Embeddings Documentation',
    url: 'https://platform.openai.com/docs/concepts',
    license: 'Official documentation',
    licenseKind: 'official-docs',
    ingestionMode: 'link-only',
    topics: ['embeddings', 'tokens', 'API'],
    summary:
      '官方说明 embedding 是文本的向量表示，可用于搜索、聚类、推荐、异常检测和分类等任务。',
    recommendedUse: '不要直接打包大段文档；在 App 中保留外链、少量自写摘要和实现提示。'
  },
  {
    id: 'anthropic-prompt-docs',
    title: 'Anthropic Prompt Engineering Docs',
    url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
    license: 'Official documentation',
    licenseKind: 'official-docs',
    ingestionMode: 'link-only',
    topics: ['prompt engineering', 'evals', 'Claude'],
    summary:
      '官方提示工程文档强调先定义成功标准和评估方法，再迭代提示，并按从通用到专门的技术顺序排查。',
    recommendedUse: '作为提示工程模块的外链资料和实践检查清单来源。'
  },
  {
    id: 'langchain-rag-docs',
    title: 'LangChain RAG Documentation',
    url: 'https://docs.langchain.com/oss/python/langchain/rag',
    license: 'Official documentation',
    licenseKind: 'official-docs',
    ingestionMode: 'link-only',
    topics: ['RAG', 'LangChain', 'agents', 'retrieval'],
    summary:
      'LangChain 文档介绍 RAG 问答应用的索引、检索和生成流程，并给出 RAG agent 与两步 RAG chain 的实现方式。',
    recommendedUse: '作为代码实践外链；App 内使用自写流程总结和对比说明。'
  },
  {
    id: 'microsoft-graphrag',
    title: 'Microsoft GraphRAG',
    url: 'https://microsoft.github.io/graphrag/index/overview/',
    license: 'MIT for project code; docs/license should be verified before bundling',
    licenseKind: 'check-before-bundling',
    ingestionMode: 'link-only',
    topics: ['GraphRAG', 'knowledge graph', 'indexing', 'entity extraction'],
    summary:
      'GraphRAG 展示了把非结构化文本转成实体、关系、社区摘要和向量索引的高级 RAG 管线。',
    recommendedUse: '适合作为深入 RAG 和 GraphRAG 的外链与架构参考，不建议未确认文档许可前直接打包全文。'
  },
  {
    id: 'ai-for-law-finance',
    title: 'AI for Law & Finance',
    url: 'https://ai4lf.com/',
    license: 'CC BY 4.0',
    licenseKind: 'creative-commons',
    ingestionMode: 'bundle-ready',
    topics: ['agentic AI', 'governance', 'law', 'finance', 'RAG'],
    summary:
      '面向法律和金融专业人士的开放教材系列，覆盖 LLM、Agent、治理和技术模式，适合补充高风险行业案例。',
    recommendedUse: '可导入治理、合规和 Agent 风险相关摘要，保留 CC BY 4.0 署名信息。'
  }
]
