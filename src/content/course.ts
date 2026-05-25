import { TechTopic } from '../types'

export const courseTopics: TechTopic[] = [
  {
    id: 'llm-foundation',
    title: 'LLM 基础',
    icon: '◈',
    color: '#38bdf8',
    audience: '适合刚开始系统学习大模型的人',
    description: '理解大语言模型如何处理文本、为什么会幻觉，以及上下文窗口、Token、采样参数这些基础概念。',
    prerequisites: ['会使用 ChatGPT 或类似产品', '了解基本编程概念即可'],
    resources: ['The Illustrated Transformer', 'OpenAI Cookbook', 'Attention Is All You Need'],
    levels: [
      {
        id: 'foundation-basic',
        label: '入门',
        duration: '约 2 小时',
        description: '建立对 LLM 的直觉，知道它能做什么、不能做什么。',
        outcomes: ['解释 Token 与上下文窗口', '理解生成不是搜索', '知道幻觉产生的主要原因'],
        project: '用自己的话画出一次 LLM 问答的流程图。',
        sections: [
          {
            id: 'token-context',
            title: 'Token 与上下文窗口',
            tags: ['token', 'context'],
            content: '<p>LLM 并不直接阅读“字”或“句子”，而是把输入切分成 Token。上下文窗口就是模型一次能看到的 Token 总量，包含你的问题、系统提示、历史对话、工具返回和模型将要生成的内容。</p><p>设计应用时，真正的约束不是“文本有多长”，而是哪些信息值得进入上下文。无关内容会挤占窗口，也会让模型注意力分散。</p>',
            keyPoint: '上下文窗口不是记忆库，它只是一次推理时的工作台。',
            checklist: ['估算一段资料进入上下文后的 Token 成本', '区分长期存储与当前上下文'],
            quiz: {
              question: '为什么把所有历史聊天都塞进上下文不是好策略？',
              answer: '会占用窗口、增加成本、引入噪声，并可能让模型被过时信息影响。'
            }
          },
          {
            id: 'generation-not-search',
            title: '生成不是检索',
            tags: ['generation', 'hallucination'],
            content: '<p>LLM 的核心能力是根据上下文预测后续文本，而不是像数据库一样查找事实。它可以综合、改写、推理，但当上下文缺少可靠事实时，仍可能生成看似合理但错误的内容。</p><p>这就是为什么知识问答、企业文档助手、客服助手通常需要 RAG、工具调用或数据库查询来补足事实来源。</p>',
            keyPoint: '模型擅长语言和模式，不天然等于事实系统。',
            checklist: ['指出一个必须接入外部数据源的场景', '说明“看起来流畅”和“事实正确”的区别']
          },
          {
            id: 'sampling',
            title: '温度、Top-p 与输出稳定性',
            tags: ['temperature', 'top-p'],
            content: '<p>温度控制输出随机性。低温度更稳定，适合分类、抽取、格式化；高温度更发散，适合头脑风暴、创意写作。Top-p 会限制候选 Token 的概率质量范围，也会影响多样性。</p>',
            codeExample: `const response = await client.chat.completions.create({
  model: 'gpt-4.1-mini',
  messages: [{ role: 'user', content: '提取订单号和金额' }],
  temperature: 0.1
})`,
            keyPoint: '生产任务通常先追求稳定，再考虑创造性。',
            checklist: ['为抽取任务选择低温度', '为创意任务保留更高随机性']
          },
          {
            id: 'limits',
            title: '能力边界与风险',
            tags: ['risk', 'alignment'],
            content: '<p>LLM 可能出现幻觉、提示注入、越权使用工具、格式漂移、长上下文遗忘等问题。学习 LLM 不是只学“怎么让它回答”，还要学“怎么限制它在可靠边界内回答”。</p>',
            keyPoint: '好应用不是信任模型，而是给模型搭护栏。',
            checklist: ['列出至少三类失败模式', '为一个任务设计验证步骤']
          }
        ]
      },
      {
        id: 'foundation-advanced',
        label: '进阶',
        duration: '约 3 小时',
        description: '理解 Transformer、注意力机制、上下文学习与模型选择。',
        outcomes: ['说明 Attention 的作用', '知道如何选模型', '理解上下文学习的优势与局限'],
        project: '对比两个模型在同一抽取任务上的准确率、速度和成本。',
        sections: [
          {
            id: 'attention',
            title: 'Transformer 与注意力机制',
            tags: ['transformer', 'attention'],
            content: '<p>Transformer 通过注意力机制让每个 Token 关注上下文中的其他 Token，从而建模长距离关系。注意力不是“理解”的全部，但它解释了模型为什么能处理复杂上下文。</p><p>实践中你不需要从零实现 Transformer，但理解注意力有助于你判断长提示、引用顺序和噪声信息为什么会影响输出。</p>',
            keyPoint: '提示中的位置、结构和噪声，都会影响模型“看见”什么。'
          },
          {
            id: 'in-context-learning',
            title: '上下文学习与 Few-shot',
            tags: ['few-shot', 'prompt'],
            content: '<p>Few-shot 是把示例放进提示，让模型临时学习格式、边界和风格。它适合快速适配任务，但不适合存放大量事实，也不能替代训练或检索。</p>',
            codeExample: `任务：判断用户反馈情绪。
示例：
输入：物流太慢了，还没人回复
输出：负面

输入：包装很好，客服也耐心
输出：正面

输入：价格还行，但安装比较麻烦
输出：`,
            keyPoint: '示例要覆盖边界情况，而不是只放最简单的样例。'
          },
          {
            id: 'model-selection',
            title: '模型选择：能力、延迟、成本',
            tags: ['model', 'cost'],
            content: '<p>模型选择不是越大越好。摘要、分类、格式转换可以优先选择小模型；复杂推理、代码修改、规划任务再考虑更强模型。生产系统常见做法是分层：简单请求走低成本模型，困难请求升级。</p>',
            checklist: ['定义任务所需能力', '测量端到端延迟', '计算每 1000 次请求成本']
          },
          {
            id: 'structured-output',
            title: '结构化输出',
            tags: ['json', 'schema'],
            content: '<p>很多应用不需要自然语言，而需要稳定 JSON、表格或字段。结构化输出可以降低解析失败率，让后续程序能可靠消费模型结果。</p>',
            codeExample: `type ExtractedTicket = {
  priority: 'low' | 'medium' | 'high'
  category: string
  summary: string
  missingInfo: string[]
}`,
            keyPoint: '越靠近业务流程，越需要把模型输出约束成结构化数据。'
          }
        ]
      },
      {
        id: 'foundation-deep',
        label: '深入',
        duration: '约 4 小时',
        description: '关注训练、微调、对齐和系统评估。',
        outcomes: ['区分预训练、微调、对齐', '理解何时微调', '能设计基础评估集'],
        project: '设计一个 50 条样本的小型评估集，用于测试客服摘要质量。',
        sections: [
          {
            id: 'training-stages',
            title: '预训练、指令微调与对齐',
            tags: ['training', 'alignment'],
            content: '<p>预训练让模型学习语言和世界知识的统计模式；指令微调让模型学会遵循任务；对齐让模型更符合人类偏好、安全规范和产品体验。</p>',
            keyPoint: '应用开发者通常不训练基础模型，但要理解不同阶段带来的能力和限制。'
          },
          {
            id: 'fine-tuning',
            title: '什么时候需要微调',
            tags: ['fine-tuning'],
            content: '<p>微调适合稳定风格、固定格式、领域术语、分类边界等模式学习，不适合频繁变化的知识库。知识变化快时，优先考虑 RAG 或工具查询。</p>',
            checklist: ['任务有稳定标注数据', '提示工程已经遇到瓶颈', '目标不是单纯补充事实']
          },
          {
            id: 'eval-basics',
            title: '评估集与回归测试',
            tags: ['eval'],
            content: '<p>没有评估集，模型应用很难迭代。评估集应该包含真实用户问题、边界案例、攻击样例和期望输出。每次改提示、换模型、改检索参数都应该跑回归。</p>',
            keyPoint: '评估不是上线前的一次验收，而是每次修改后的安全带。'
          },
          {
            id: 'privacy',
            title: '隐私、权限与数据治理',
            tags: ['privacy', 'security'],
            content: '<p>企业 AI 应用需要处理数据权限、日志留存、敏感信息脱敏、审计和最小权限访问。模型只是链路中的一环，真正的安全来自端到端治理。</p>',
            checklist: ['识别敏感字段', '限制工具访问范围', '保留可审计日志']
          }
        ]
      }
    ]
  },
  {
    id: 'prompt-tooling',
    title: '提示与工具调用',
    icon: '⌁',
    color: '#f97316',
    audience: '适合要把模型接入真实业务流程的开发者',
    description: '从提示工程走向可执行工作流：角色、约束、结构化输出、函数调用和错误恢复。',
    prerequisites: ['理解 LLM 基础概念', '能阅读 JSON 和基础代码'],
    resources: ['Prompt Engineering Guide', 'OpenAI Function Calling examples', 'Designing ML Systems'],
    levels: [
      {
        id: 'prompt-basic',
        label: '入门',
        duration: '约 2 小时',
        description: '学会写稳定、可复用、便于调试的提示。',
        outcomes: ['拆分系统提示和用户输入', '写出可测试的输出格式', '减少含糊指令'],
        project: '为“会议纪要生成”写一条可复用提示，并给出 5 个测试样例。',
        sections: [
          {
            id: 'prompt-anatomy',
            title: '一个好提示的组成',
            tags: ['prompt'],
            content: '<p>好的提示通常包含任务目标、上下文、约束、输出格式、示例和失败处理。不要把所有内容写成一段散文，结构越清楚，越容易调试。</p>',
            codeExample: `角色：你是严谨的客服质检员。
任务：根据通话记录输出质检结论。
约束：只基于记录，不推测。
输出：JSON，字段为 score、issues、suggestion。`,
            keyPoint: '提示应该像接口契约，而不是许愿。'
          },
          {
            id: 'instruction-hierarchy',
            title: '指令层级',
            tags: ['system', 'developer', 'user'],
            content: '<p>系统指令定义应用边界，开发者指令定义任务规则，用户输入提供本次任务内容。把规则和用户内容混在一起，会增加提示注入和格式漂移风险。</p>',
            keyPoint: '用户输入应该被当作数据处理，而不是新的最高优先级规则。'
          },
          {
            id: 'examples',
            title: '示例驱动输出',
            tags: ['few-shot'],
            content: '<p>示例能教会模型输出风格和边界。优秀示例应该覆盖正常样例、边界样例、拒答样例和格式复杂样例。</p>',
            checklist: ['至少提供一个边界样例', '示例输出与目标格式完全一致']
          },
          {
            id: 'prompt-debug',
            title: '提示调试方法',
            tags: ['debug'],
            content: '<p>调试提示时，一次只改一个变量：任务描述、示例、约束、温度、模型或输入。保留失败样例，逐步形成回归集。</p>',
            keyPoint: '没有失败样例沉淀，提示会越改越玄学。'
          }
        ]
      },
      {
        id: 'tool-advanced',
        label: '进阶',
        duration: '约 3 小时',
        description: '让模型安全地选择工具、调用 API、处理异常。',
        outcomes: ['定义工具 Schema', '处理工具调用失败', '设计最小权限工具'],
        project: '实现一个天气查询工具调用流程，包括参数校验和失败重试。',
        sections: [
          {
            id: 'function-calling',
            title: 'Function Calling 的心智模型',
            tags: ['tool'],
            content: '<p>工具调用不是让模型直接执行代码，而是让模型输出一个结构化调用意图，由你的程序校验、执行并把结果返回给模型。执行权始终应该在应用层。</p>',
            codeExample: `const tool = {
  name: 'search_docs',
  description: '搜索企业知识库',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      topK: { type: 'number' }
    },
    required: ['query']
  }
}`,
            keyPoint: '模型负责决定“要不要调用”，程序负责决定“能不能执行”。'
          },
          {
            id: 'tool-design',
            title: '工具设计原则',
            tags: ['schema', 'permission'],
            content: '<p>工具应该小而清晰：名称表达动作，描述说明何时使用，参数有明确类型和边界。危险工具要加权限、确认和审计。</p>',
            checklist: ['工具名是动词短语', '参数有枚举或范围限制', '危险动作需要确认']
          },
          {
            id: 'error-recovery',
            title: '失败恢复与重试',
            tags: ['reliability'],
            content: '<p>真实系统里工具会超时、返回空结果、权限不足或数据格式异常。应用需要把错误转换成模型能理解的反馈，同时避免无限重试。</p>',
            keyPoint: '失败恢复是 Agent 可靠性的核心，不是边角料。'
          },
          {
            id: 'human-in-loop',
            title: 'Human-in-the-loop',
            tags: ['approval'],
            content: '<p>涉及付款、删除、发邮件、改配置等高影响操作时，应该让用户确认。模型可以准备草稿和解释，但最终授权应由人完成。</p>',
            checklist: ['识别高风险动作', '展示动作摘要', '保留确认记录']
          }
        ]
      },
      {
        id: 'workflow-deep',
        label: '深入',
        duration: '约 4 小时',
        description: '把提示、工具、状态和评估连接成稳定工作流。',
        outcomes: ['设计状态机', '记录可观测日志', '处理提示注入'],
        project: '设计一个“工单自动分派”工作流，包含工具权限和回退路径。',
        sections: [
          {
            id: 'state-machine',
            title: '用状态机约束 AI 流程',
            tags: ['workflow'],
            content: '<p>复杂 AI 流程不要只靠一条长提示。把流程拆成明确状态：收集信息、校验、调用工具、生成结果、等待确认、完成。这样更容易恢复和审计。</p>',
            keyPoint: '工作流越关键，越应该显式建模状态。'
          },
          {
            id: 'prompt-injection',
            title: '提示注入防护',
            tags: ['security'],
            content: '<p>当模型读取网页、文档、邮件时，外部内容可能包含恶意指令。应用应区分可信指令和不可信数据，并限制外部内容改变系统规则。</p>',
            checklist: ['外部内容加来源标记', '禁止文档内容覆盖系统规则', '工具调用前做权限校验']
          },
          {
            id: 'observability',
            title: '可观测性：记录什么',
            tags: ['logging'],
            content: '<p>记录请求 ID、模型、提示版本、工具调用、延迟、Token、错误和用户反馈。没有这些信息，线上问题很难复现。</p>',
            keyPoint: 'AI 应用的日志不是只看报错，还要看决策链路。'
          },
          {
            id: 'versioning',
            title: '提示版本管理',
            tags: ['version'],
            content: '<p>提示也是代码。给提示版本号，保存评估结果，灰度发布，遇到回归可以回滚。多人协作时尤其重要。</p>',
            checklist: ['提示有版本号', '每版绑定评估报告', '线上请求记录提示版本']
          }
        ]
      }
    ]
  },
  {
    id: 'embedding',
    title: 'Embedding',
    icon: '◇',
    color: '#22c55e',
    audience: '适合要做搜索、推荐、聚类、RAG 的人',
    description: '从语义向量到向量数据库，理解相似度、索引、混合检索和向量质量评估。',
    prerequisites: ['了解基本线性代数更好，但不是必须', '知道 API 调用流程'],
    resources: ['FAISS documentation', 'pgvector documentation', 'Sentence Transformers'],
    levels: [
      {
        id: 'embedding-basic',
        label: '入门',
        duration: '约 2 小时',
        description: '建立“文本可以变成向量”的直觉。',
        outcomes: ['解释向量相似度', '区分关键词搜索和语义搜索', '知道向量维度的含义'],
        project: '把 20 条 FAQ 转成向量，并实现一个最简单的相似问题搜索。',
        sections: [
          {
            id: 'what-embedding',
            title: 'Embedding 是什么',
            tags: ['vector'],
            content: '<p>Embedding 是把文本、图片、音频等对象映射到高维向量空间。语义相近的对象，在向量空间中的距离也更近。</p><p>这让“意思相近但字面不同”的内容可以被搜索到，比如“怎么退款”和“我要退货钱什么时候到账”。</p>',
            keyPoint: 'Embedding 解决的是语义近邻问题。'
          },
          {
            id: 'similarity',
            title: '余弦相似度',
            tags: ['cosine'],
            content: '<p>余弦相似度衡量两个向量方向是否接近，常用于文本语义相似度。它关注方向而不是长度，因此适合比较不同长度文本的语义。</p>',
            codeExample: `function cosine(a: number[], b: number[]) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0)
  const na = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0))
  const nb = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0))
  return dot / (na * nb)
}`,
            keyPoint: '相似度高不代表答案正确，只代表语义接近。'
          },
          {
            id: 'semantic-search',
            title: '语义搜索的基本流程',
            tags: ['search'],
            content: '<p>先把文档离线向量化并存入向量库；查询时把用户问题向量化；再从库中找最近的向量，返回对应文本。</p>',
            checklist: ['文档切分', '生成向量', '存储元数据', '查询向量', 'TopK 返回']
          },
          {
            id: 'metadata',
            title: '元数据比你想象的重要',
            tags: ['metadata'],
            content: '<p>向量只表达语义，不表达权限、时间、来源、业务状态。元数据过滤可以避免搜到用户无权查看、已经过期或来源不可信的内容。</p>',
            keyPoint: '向量搜索要和结构化过滤一起用。'
          }
        ]
      },
      {
        id: 'embedding-advanced',
        label: '进阶',
        duration: '约 3 小时',
        description: '学习索引、召回、混合检索和模型选择。',
        outcomes: ['解释 ANN', '选择向量库', '设计混合检索'],
        project: '比较纯向量检索与 BM25+向量混合检索在 30 个问题上的召回率。',
        sections: [
          {
            id: 'ann',
            title: 'ANN 与索引',
            tags: ['ann', 'hnsw'],
            content: '<p>当向量数量很大时，暴力计算所有距离成本太高。ANN 用近似方法换取速度，常见索引包括 HNSW、IVF、PQ。索引参数会影响召回率、延迟和内存。</p>',
            keyPoint: '向量数据库调参，本质是在召回、速度、成本之间取舍。'
          },
          {
            id: 'hybrid-search',
            title: '混合检索',
            tags: ['bm25', 'hybrid'],
            content: '<p>关键词检索擅长精确匹配专有名词、编号、错误码；向量检索擅长语义泛化。混合检索把两者结合，通常比单一路径更稳。</p>',
            checklist: ['保留关键词召回', '加入向量召回', '融合分数或再排序']
          },
          {
            id: 'embedding-model-choice',
            title: 'Embedding 模型选择',
            tags: ['model'],
            content: '<p>选择模型要看语言覆盖、领域表现、维度、价格、吞吐和可部署性。中文场景要专门测试中文查询，不要只看英文榜单。</p>',
            keyPoint: 'Embedding 模型的好坏必须在自己的数据上测。'
          },
          {
            id: 'chunk-embedding',
            title: 'Chunk 对向量质量的影响',
            tags: ['chunking'],
            content: '<p>切片太短会丢上下文，太长会稀释主题。好的切片通常围绕语义完整单元，比如标题、段落、条款或函数。</p>',
            checklist: ['保留标题路径', '避免跨主题切片', '记录原文位置']
          }
        ]
      },
      {
        id: 'embedding-deep',
        label: '深入',
        duration: '约 4 小时',
        description: '关注评估、压缩、漂移和生产维护。',
        outcomes: ['建立检索评估集', '理解量化', '监控检索质量漂移'],
        project: '建立一个包含 query、期望文档、负样本的检索评估表。',
        sections: [
          {
            id: 'retrieval-eval',
            title: '检索评估指标',
            tags: ['eval'],
            content: '<p>常见指标包括 Recall@K、MRR、nDCG。RAG 场景里，检索评估要先于生成评估，因为生成质量很大程度取决于检索结果。</p>',
            keyPoint: '先确认找得到，再讨论答得好。'
          },
          {
            id: 'quantization',
            title: '向量压缩与量化',
            tags: ['quantization'],
            content: '<p>向量量化可以降低存储和内存成本，但可能损失召回。大规模系统通常需要在精度和成本之间实验。</p>',
            checklist: ['比较量化前后 Recall@K', '测量内存变化', '记录延迟变化']
          },
          {
            id: 'drift',
            title: '语料变化与漂移',
            tags: ['drift'],
            content: '<p>文档更新、产品术语变化、用户问题变化都会导致检索质量漂移。需要定期重建索引、更新评估集和监控无结果查询。</p>',
            keyPoint: '向量库不是一次导入后永远正确。'
          },
          {
            id: 'multimodal',
            title: '多模态 Embedding',
            tags: ['multimodal'],
            content: '<p>多模态 Embedding 可以把图片和文本放进同一个空间，实现以文搜图、以图搜图、商品匹配、截图检索等能力。</p>',
            checklist: ['明确模态', '准备跨模态样例', '评估相似度是否符合业务判断']
          }
        ]
      }
    ]
  },
  {
    id: 'rag',
    title: 'RAG',
    icon: '▤',
    color: '#eab308',
    audience: '适合要做知识库问答、文档助手、企业搜索的人',
    description: '构建可靠的检索增强生成系统：索引、召回、重排、引用、评估与生产化。',
    prerequisites: ['理解 Embedding 和基本 LLM 概念', '知道文档处理流程'],
    resources: ['RAGAS', 'LlamaIndex docs', 'LangChain RAG docs'],
    levels: [
      {
        id: 'rag-basic',
        label: '入门',
        duration: '约 2 小时',
        description: '理解 RAG 解决什么问题，以及标准流程。',
        outcomes: ['解释索引-检索-生成', '知道 RAG 与微调区别', '能设计最小 RAG 原型'],
        project: '用 5 篇文档做一个最小知识库问答流程图。',
        sections: [
          {
            id: 'why-rag',
            title: '为什么需要 RAG',
            tags: ['knowledge'],
            content: '<p>RAG 通过检索外部知识，把相关资料放进上下文，让模型基于资料回答。它适合知识经常变化、需要引用来源、无法把所有事实写入模型参数的场景。</p>',
            keyPoint: 'RAG 的核心价值是把事实来源接入生成过程。'
          },
          {
            id: 'rag-pipeline',
            title: '标准流程',
            tags: ['pipeline'],
            content: '<p>离线阶段：清洗文档、切分、向量化、入库。在线阶段：理解问题、检索、重排、构造上下文、生成答案、返回引用。</p>',
            checklist: ['文档处理', '检索召回', '上下文拼装', '答案生成', '引用展示']
          },
          {
            id: 'rag-vs-finetune',
            title: 'RAG vs 微调',
            tags: ['fine-tuning'],
            content: '<p>RAG 适合补充事实和知识；微调适合学习风格、格式和稳定任务模式。很多生产系统会同时使用两者。</p>',
            keyPoint: '不要用微调解决频繁变化的知识问题。'
          },
          {
            id: 'citations',
            title: '引用与可追溯性',
            tags: ['citation'],
            content: '<p>知识库问答应尽量返回来源、段落、更新时间和置信提示。引用不是装饰，它能帮助用户判断答案是否可信。</p>',
            checklist: ['展示来源标题', '展示片段位置', '标记更新时间']
          }
        ]
      },
      {
        id: 'rag-advanced',
        label: '进阶',
        duration: '约 4 小时',
        description: '优化切分、查询改写、重排、多路召回。',
        outcomes: ['设计 Chunk 策略', '理解 Re-ranking', '处理多跳问题'],
        project: '为一批技术文档设计 chunk 策略，并解释为什么。',
        sections: [
          {
            id: 'chunking',
            title: '文档切分策略',
            tags: ['chunking'],
            content: '<p>切分要保留语义完整性和来源路径。技术文档可以按标题层级切，合同可以按条款切，代码可以按函数或类切。重叠窗口可以保留上下文，但会增加成本。</p>',
            keyPoint: 'Chunk 不是固定长度切肉片，而是保留知识单元。'
          },
          {
            id: 'query-rewrite',
            title: '查询改写',
            tags: ['rewrite'],
            content: '<p>用户问题可能口语化、缺上下文或包含代词。查询改写可以把“这个怎么配置”变成包含上下文的检索 query，提高召回质量。</p>',
            codeExample: `原问题：这个报错怎么处理？
会话上下文：用户正在部署 pgvector，报错 extension not found
改写后：pgvector extension not found 部署 PostgreSQL 如何处理`,
            keyPoint: '查询改写服务于检索，不一定等同于用户最终问题。'
          },
          {
            id: 'rerank',
            title: 'Re-ranking',
            tags: ['rerank'],
            content: '<p>第一阶段检索负责高召回，重排模型负责精排序。尤其在 TopK 很大、文档相似时，重排能显著提升最终上下文质量。</p>',
            checklist: ['先召回更多候选', '再用重排选少量上下文', '监控延迟增加']
          },
          {
            id: 'multi-hop',
            title: '多跳 RAG',
            tags: ['multi-hop'],
            content: '<p>有些问题需要先查 A，再根据 A 的结果查 B。多跳 RAG 可以通过分解问题、迭代检索或 Agentic RAG 实现，但要控制循环和错误传播。</p>',
            keyPoint: '多跳能力来自问题分解和迭代检索，不是单次 TopK 能解决的。'
          }
        ]
      },
      {
        id: 'rag-deep',
        label: '深入',
        duration: '约 5 小时',
        description: '把 RAG 做到生产可用：评估、安全、权限、可观测。',
        outcomes: ['设计 RAG 评估', '处理权限过滤', '建立线上监控'],
        project: '为企业知识库 RAG 写一份上线检查清单。',
        sections: [
          {
            id: 'rag-eval',
            title: 'RAG 评估体系',
            tags: ['eval'],
            content: '<p>RAG 评估通常拆成检索质量、答案忠实度、答案相关性、引用正确性和用户满意度。拆开评估才能定位问题是在检索、上下文还是生成。</p>',
            keyPoint: 'RAG 失败要分层诊断，不要只看最终答案。'
          },
          {
            id: 'permissions',
            title: '权限过滤',
            tags: ['security'],
            content: '<p>企业 RAG 必须保证用户只能检索到自己有权访问的文档。权限过滤应该发生在检索阶段或更早，而不是生成后再要求模型不要泄露。</p>',
            checklist: ['索引记录权限元数据', '查询时按用户过滤', '日志记录命中文档权限']
          },
          {
            id: 'context-packing',
            title: '上下文拼装',
            tags: ['context'],
            content: '<p>最终放进模型的上下文需要去重、排序、截断、保留标题和来源。相同内容重复出现会浪费窗口，也会放大错误证据。</p>',
            keyPoint: '检索结果不是直接粘贴，拼装策略会明显影响答案质量。'
          },
          {
            id: 'prod-rag',
            title: '生产化检查清单',
            tags: ['production'],
            content: '<p>上线前检查：索引更新机制、失败回退、空结果处理、敏感数据过滤、引用展示、评估集、监控报警和人工反馈入口。</p>',
            checklist: ['索引可增量更新', '空结果不胡编', '引用可点击', '用户反馈可回流']
          }
        ]
      }
    ]
  },
  {
    id: 'agent',
    title: 'AI Agent',
    icon: '✦',
    color: '#a78bfa',
    audience: '适合要构建自动化助手、代码助手、业务流程代理的人',
    description: '学习 Agent 的观察、规划、工具调用、记忆、反思、多 Agent 协作和安全边界。',
    prerequisites: ['理解提示与工具调用', '理解基础工作流设计'],
    resources: ['ReAct paper', 'Voyager paper', 'LangGraph docs'],
    levels: [
      {
        id: 'agent-basic',
        label: '入门',
        duration: '约 2 小时',
        description: '知道 Agent 和普通聊天机器人的区别。',
        outcomes: ['解释 Observe-Think-Act', '识别适合 Agent 的任务', '理解工具和记忆'],
        project: '把一个“查资料并写报告”的任务拆成 Agent 步骤。',
        sections: [
          {
            id: 'agent-definition',
            title: 'Agent 是什么',
            tags: ['agent'],
            content: '<p>Agent 是能感知环境、制定步骤、调用工具并根据结果继续行动的 AI 系统。它不是单次回答，而是一个循环。</p>',
            keyPoint: 'Agent 的关键是行动闭环，而不是拟人化。'
          },
          {
            id: 'agent-loop',
            title: '观察、思考、行动',
            tags: ['loop'],
            content: '<p>典型 Agent 循环包括观察当前状态、决定下一步、调用工具、读取结果、判断是否完成。每一步都可能出错，因此需要限制和记录。</p>',
            checklist: ['定义目标', '定义可用工具', '定义停止条件', '记录每次行动']
          },
          {
            id: 'agent-fit',
            title: '什么任务适合 Agent',
            tags: ['task'],
            content: '<p>适合 Agent 的任务通常步骤不固定、需要外部工具、需要根据中间结果调整。固定流程、强确定性任务，用普通程序或工作流可能更可靠。</p>',
            keyPoint: '不要为了用 Agent 而把简单任务复杂化。'
          },
          {
            id: 'memory',
            title: '记忆的类型',
            tags: ['memory'],
            content: '<p>短期记忆是当前上下文，长期记忆可以是数据库、向量库、用户画像或任务历史。记忆需要写入策略和读取策略，否则会变成噪声仓库。</p>',
            checklist: ['定义什么值得记住', '定义何时读取', '允许用户删除记忆']
          }
        ]
      },
      {
        id: 'agent-advanced',
        label: '进阶',
        duration: '约 4 小时',
        description: '学习 ReAct、计划执行、多 Agent 和工具治理。',
        outcomes: ['设计 Agent 工具集', '理解计划-执行模式', '避免无限循环'],
        project: '设计一个“竞品资料收集 Agent”，包含工具、状态和停止条件。',
        sections: [
          {
            id: 'react',
            title: 'ReAct 模式',
            tags: ['react'],
            content: '<p>ReAct 把推理和行动交替进行：模型先判断需要什么信息，再调用工具，再根据结果继续推理。它适合开放式信息收集和诊断任务。</p>',
            keyPoint: 'ReAct 的价值是把中间观察纳入下一步决策。'
          },
          {
            id: 'plan-execute',
            title: '计划-执行模式',
            tags: ['planning'],
            content: '<p>复杂任务可以先生成计划，再逐步执行。计划提高可解释性，但也可能过早锁定错误路径，因此需要允许修正计划。</p>',
            checklist: ['计划可见', '每步可验证', '失败后可重规划']
          },
          {
            id: 'multi-agent',
            title: '多 Agent 协作',
            tags: ['multi-agent'],
            content: '<p>多 Agent 可以按角色分工，如研究员、审稿人、执行者。但角色越多，通信成本和错误传播也越大。多数产品先从单 Agent 加评审步骤开始更稳。</p>',
            keyPoint: '多 Agent 不是越多越聪明，协调成本是真成本。'
          },
          {
            id: 'stop-conditions',
            title: '停止条件与预算',
            tags: ['budget'],
            content: '<p>Agent 必须有最大步数、最大时间、最大成本、目标完成判断和失败回退。没有预算的 Agent 很容易无限循环或过度调用工具。</p>',
            checklist: ['最大步数', '最大成本', '完成条件', '失败原因输出']
          }
        ]
      },
      {
        id: 'agent-deep',
        label: '深入',
        duration: '约 5 小时',
        description: '关注可靠性、安全、评估和产品化。',
        outcomes: ['设计 Agent 评估', '处理越权风险', '建立审计链路'],
        project: '为一个能发邮件的 Agent 设计安全机制和评估集。',
        sections: [
          {
            id: 'agent-eval',
            title: 'Agent 评估',
            tags: ['eval'],
            content: '<p>Agent 评估不仅看最终答案，还要看任务完成率、工具调用正确率、步数、成本、违规动作、用户介入次数。复杂任务要用场景级测试。</p>',
            keyPoint: '评估 Agent，要评估过程和结果。'
          },
          {
            id: 'sandbox',
            title: '沙箱与权限',
            tags: ['security'],
            content: '<p>代码执行、文件操作、网络访问都应该放在沙箱或受控环境中。高风险工具默认不可用，需要显式授权。</p>',
            checklist: ['隔离执行环境', '限制文件路径', '限制网络域名', '记录操作日志']
          },
          {
            id: 'reflection',
            title: '反思与自我纠错',
            tags: ['reflection'],
            content: '<p>反思机制让 Agent 在行动后检查错误、修正计划或请求更多信息。它可以提升复杂任务表现，但也会增加延迟和成本。</p>',
            keyPoint: '反思不是魔法，必须有可检查的标准。'
          },
          {
            id: 'agent-product',
            title: 'Agent 产品化',
            tags: ['product'],
            content: '<p>用户需要看到 Agent 正在做什么、为什么卡住、下一步会做什么。透明度、可暂停、可撤销、可确认，是 Agent 产品体验的重要组成。</p>',
            checklist: ['展示行动时间线', '支持暂停', '危险动作确认', '失败可解释']
          }
        ]
      }
    ]
  },
  {
    id: 'eval-production',
    title: '评估与生产化',
    icon: '▣',
    color: '#ef4444',
    audience: '适合准备把 AI 功能上线或接入业务系统的人',
    description: '学习如何测试、监控、降级、控成本，并让 AI 应用稳定运行。',
    prerequisites: ['至少完成一个 AI 原型', '了解基础后端或前端工程'],
    resources: ['OpenTelemetry', 'RAGAS', 'LLM evaluation guides'],
    levels: [
      {
        id: 'eval-basic',
        label: '入门',
        duration: '约 2 小时',
        description: '建立评估意识，知道上线前要测什么。',
        outcomes: ['建立小型测试集', '区分自动评估和人工评估', '记录模型版本'],
        project: '为你的 AI 功能写 20 条回归测试样例。',
        sections: [
          {
            id: 'why-eval',
            title: '为什么评估先行',
            tags: ['eval'],
            content: '<p>AI 应用输出不完全确定，靠手感调提示很快会失控。评估集能让你知道修改是否真的变好，而不是只在几个样例上更顺眼。</p>',
            keyPoint: '没有评估，迭代就是猜。'
          },
          {
            id: 'test-set',
            title: '构建测试集',
            tags: ['dataset'],
            content: '<p>测试集要来自真实场景，包含常见问题、边界问题、恶意输入、空输入和高价值任务。每条样例要有期望行为或评分标准。</p>',
            checklist: ['真实用户问题', '边界案例', '攻击样例', '期望输出']
          },
          {
            id: 'human-eval',
            title: '人工评估',
            tags: ['human'],
            content: '<p>很多质量维度无法完全自动判断，例如语气、帮助程度、业务可接受性。人工评估需要明确评分标准，避免每个人凭感觉打分。</p>',
            keyPoint: '人工评估也需要 Rubric。'
          },
          {
            id: 'baseline',
            title: 'Baseline',
            tags: ['baseline'],
            content: '<p>先建立最简单可运行基线，再逐步优化。没有基线，你无法证明 RAG、重排、工具调用或换模型是否带来收益。</p>',
            checklist: ['记录当前准确率', '记录延迟和成本', '保存提示和参数']
          }
        ]
      },
      {
        id: 'prod-advanced',
        label: '进阶',
        duration: '约 4 小时',
        description: '加入日志、监控、缓存、降级和成本控制。',
        outcomes: ['设计观测指标', '实现缓存策略', '制定降级方案'],
        project: '为一个问答接口设计日志字段和报警规则。',
        sections: [
          {
            id: 'metrics',
            title: '核心指标',
            tags: ['metrics'],
            content: '<p>至少监控请求量、成功率、延迟、Token、成本、工具错误率、用户反馈和拒答率。不同任务还要有业务指标，比如解决率或转人工率。</p>',
            keyPoint: 'AI 指标要同时覆盖技术质量和业务结果。'
          },
          {
            id: 'caching',
            title: '缓存策略',
            tags: ['cache'],
            content: '<p>FAQ、固定文档摘要、Embedding、工具查询结果都可以缓存。缓存要考虑数据新鲜度、权限和失效机制。</p>',
            checklist: ['缓存 Embedding', '缓存稳定答案', '权限相关内容谨慎缓存']
          },
          {
            id: 'fallback',
            title: '降级与回退',
            tags: ['fallback'],
            content: '<p>模型超时、额度耗尽、检索失败时，系统应该有回退：换小模型、返回检索结果、提示稍后重试、转人工或使用规则模板。</p>',
            keyPoint: '可用性来自预案，不来自祈祷接口永远稳定。'
          },
          {
            id: 'cost-control',
            title: '成本控制',
            tags: ['cost'],
            content: '<p>成本由模型、Token、调用次数、重试、工具和向量库共同决定。常见策略包括请求分级、小模型预处理、上下文压缩、缓存和批处理。</p>',
            checklist: ['统计单次请求成本', '限制最大上下文', '避免无意义重试']
          }
        ]
      },
      {
        id: 'prod-deep',
        label: '深入',
        duration: '约 5 小时',
        description: '面向企业级上线：安全、治理、灰度、反馈闭环。',
        outcomes: ['设计灰度发布', '建立反馈回流', '处理合规和审计'],
        project: '写一份 AI 功能生产发布方案，包含灰度、监控、回滚。',
        sections: [
          {
            id: 'release',
            title: '灰度发布与回滚',
            tags: ['release'],
            content: '<p>提示、模型和检索策略都应该支持灰度。先让少量用户或低风险场景使用新版本，观察指标后再扩大。出现回归时要能快速回滚。</p>',
            keyPoint: 'AI 变更也应该像代码一样发布。'
          },
          {
            id: 'feedback-loop',
            title: '反馈闭环',
            tags: ['feedback'],
            content: '<p>用户反馈、人工修正、失败日志应该进入数据闭环，用于更新评估集、改提示、改索引或训练分类器。</p>',
            checklist: ['收集用户反馈', '标注失败原因', '进入评估集', '验证修复']
          },
          {
            id: 'compliance',
            title: '合规与审计',
            tags: ['compliance'],
            content: '<p>根据业务领域，可能需要处理个人信息保护、数据出境、行业审计、内容安全和留痕要求。不要等上线后才补治理。</p>',
            keyPoint: '高价值 AI 应用通常也是高治理要求应用。'
          },
          {
            id: 'operating-model',
            title: '团队协作模式',
            tags: ['team'],
            content: '<p>成熟 AI 项目需要产品、工程、数据、业务专家、安全和运营协作。明确谁负责提示、数据、评估、上线审批和线上问题响应。</p>',
            checklist: ['明确负责人', '定义变更流程', '建立事故响应机制']
          }
        ]
      }
    ]
  }
]
