import { TechTopic } from '../types'

export const ragContent: TechTopic = {
  id: 'rag',
  title: 'RAG',
  icon: '📚',
  description: '检索增强生成：让 LLM 基于真实知识回答，告别幻觉',
  levels: [
    {
      id: 'rag-basics',
      label: '入门',
      description: 'RAG 是什么？解决什么问题？核心工作流程一目了然。',
      sections: [
        {
          id: 'rag-what',
          title: 'RAG 是什么？为什么需要它？',
          content: `
            <p><strong>RAG（Retrieval-Augmented Generation，检索增强生成）</strong>是一种让 LLM 在回答问题时先"查资料"再回答的技术架构。它把<strong>检索</strong>和<strong>生成</strong>两个步骤串在一起。</p>
            <p>LLM 有两大天然缺陷：</p>
            <ul>
              <li><strong>知识截止日期</strong>：模型训练完成后，它不知道之后发生了什么</li>
              <li><strong>幻觉（Hallucination）</strong>：面对不知道的问题，LLM 常常"自信地编造"答案</li>
            </ul>
            <p>RAG 的解决思路很朴素：<strong>不让 LLM 凭记忆回答，而是先检索相关文档，再让 LLM 基于文档回答</strong>。就像考试时允许你翻书——你不需要记住所有知识点，但需要知道去哪找、怎么用。</p>
            <p>RAG 是当前最主流、最实用的 LLM 应用架构。从客服系统到企业知识库，RAG 几乎是标配。</p>
          `,
          keyPoint: 'RAG 的本质是"给 LLM 一本参考书"。LLM 负责理解和表达，检索系统负责找到准确的参考资料。'
        },
        {
          id: 'rag-pipeline',
          title: 'RAG 的核心流程：索引→检索→生成',
          content: `
            <p>一个完整的 RAG 系统包含两条流水线：</p>
            <p><strong>离线索引流程（建立知识库）：</strong></p>
            <ol>
              <li>收集文档：PDF、网页、数据库记录等</li>
              <li><strong>文档切分（Chunking）</strong>：把长文档切成小片段</li>
              <li>为每个片段生成 Embedding 向量</li>
              <li>将向量和原始文本存入向量数据库</li>
            </ol>
            <p><strong>在线查询流程（回答用户问题）：</strong></p>
            <ol>
              <li>用户提问："公司今年的营收目标是多少？"</li>
              <li>将问题转为 Embedding 向量</li>
              <li>在向量数据库中检索最相似的 K 个文档片段</li>
              <li>将检索结果和用户问题一起喂给 LLM</li>
              <li>LLM 基于提供的文档生成答案</li>
            </ol>
            <p>这个设计的巧妙之处在于：LLM 不依赖自己的记忆来回答事实问题，而是依赖于我们从知识库中找到的"参考资料"。如果知识库更新了，RAG 的回答也会自动更新。</p>
          `,
          codeExample: `# 最简单的 RAG 实现
from openai import OpenAI
import chromadb

client = OpenAI()
db = chromadb.Client()
collection = db.get_or_create_collection("my_knowledge")

def rag_query(question: str) -> str:
    # Step 1: 将问题转为向量
    q_emb = client.embeddings.create(
        model="text-embedding-3-small",
        input=question
    ).data[0].embedding

    # Step 2: 检索最相关的文档
    results = collection.query(
        query_embeddings=[q_emb],
        n_results=3
    )

    # Step 3: 构造 prompt
    context = "\\n\\n".join(results['documents'][0])
    prompt = f"基于以下参考资料回答问题：\\n\\n{context}\\n\\n问题：{question}"

    # Step 4: 让 LLM 生成答案
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content`,
          keyPoint: 'RAG 的流程可以用一句话概括："把你可能用到的资料先找出来，和问题一起打包给 LLM。"'
        },
        {
          id: 'rag-vs-finetune',
          title: 'RAG vs 微调：什么时候用哪个？',
          content: `
            <p>这是一个高频问题。两者解决的是不同层次的需求：</p>
            <table>
              <tr><th>维度</th><th>RAG</th><th>微调（Fine-tuning）</th></tr>
              <tr><td>知识注入</td><td>动态，随知识库更新</td><td>静态，训练后固定</td></tr>
              <tr><td>知识来源</td><td>可追溯，知道答案来自哪个文档</td><td>不可追溯，融入了模型权重</td></tr>
              <tr><td>更新速度</td><td>即时，更新数据库即可</td><td>缓慢，需要重新训练</td></tr>
              <tr><td>改变行为</td><td>不改模型行为</td><td>可改变风格、格式、推理方式</td></tr>
              <tr><td>成本</td><td>低（向量数据库 + API）</td><td>高（GPU 训练）</td></tr>
              <tr><td>适用场景</td><td>知识密集型问答</td><td>特定风格/格式输出、领域推理</td></tr>
            </table>
            <p><strong>实际最佳实践：RAG + 微调结合使用。</strong>用微调让模型学会特定领域的表达方式和推理逻辑，用 RAG 提供实时、准确的知识。两者不互斥，而是互补的。</p>
          `,
          keyPoint: '一个简单的判断法则：如果问题是"模型不知道什么事实"，用 RAG；如果问题是"模型不会以某种方式说话"，用微调。'
        }
      ]
    },
    {
      id: 'rag-intermediate',
      label: '进阶',
      description: 'Chunking 策略、检索优化、Re-ranking、多跳推理。',
      sections: [
        {
          id: 'chunking-strategies',
          title: '文档切分（Chunking）策略深度解析',
          content: `
            <p>Chunking 是 RAG 系统中<strong>最被低估但影响最大的环节</strong>。切得不好，后续检索全是废的。</p>
            <p><strong>主流 Chunking 策略：</strong></p>
            <ul>
              <li><strong>固定大小切片</strong>：每 N 个字符切一刀，比如每 512 token。最简单但容易把一句话切成两半。</li>
              <li><strong>递归切分</strong>：按优先级逐级切：段落 → 句子 → 词。比固定大小更自然。</li>
              <li><strong>语义切分</strong>：让模型判断"语义断点"在哪里，比如话题转换时切一刀。效果最好但成本高。</li>
              <li><strong>句子窗口</strong>：以句子为单位，每个 chunk 包含连续 N 个句子。</li>
            </ul>
            <p><strong>重叠（Overlap）</strong>是 Chunking 的重要技巧：相邻 chunk 之间保留一定重复内容。比如 chunk 大小 512 token，重叠 64 token。这样不会因为切在关键信息的边界而丢失上下文。</p>
            <p>建议的 Chunk 大小：对于中文文档，512 token 是常见起点；法律/技术文档建议更小（256 token）以保证精度；叙述性内容可以更大（1024 token）以保留完整性。</p>
          `,
          codeExample: `from langchain.text_splitter import RecursiveCharacterTextSplitter

# 递归切分器：优先按段落切，不行按句子，再不行按字符
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,        # 每个 chunk 最大 token 数
    chunk_overlap=64,      # 重叠 token 数
    separators=["\\n\\n", "\\n", "。", ".", " ", ""]  # 切分优先级
)

chunks = splitter.split_text(long_document)
print(f"切分后的片段数: {len(chunks)}")
`,
          keyPoint: 'Chunking 是 RAG 的基石。一个经验法则：chunk 应该是一个"自包含的信息单元"——单独拿出来读，不需要上下文就能理解。'
        },
        {
          id: 'retrieval-optimization',
          title: '检索优化：如何找到真正相关的文档？',
          content: `
            <p>基础 RAG 用问题直接检索，但真实场景往往更复杂。以下是提升检索质量的关键技术：</p>
            <p><strong>1. 查询改写（Query Rewriting）</strong></p>
            <p>用户问"那个功能怎么用？"——什么功能？什么时候说的？RAG 需要把模糊的查询补全为精确的检索语句。可以先用 LLM 将模糊问题改写成独立、明确的检索查询。</p>
            <p><strong>2. 多查询检索（Multi-Query）</strong></p>
            <p>对同一个问题生成多个不同角度的查询，各自检索后合并结果。比如"如何提高销售额"可以改写为"销售增长策略""提升转化率的方法""增加客单价的技巧"等。</p>
            <p><strong>3. 父文档检索（Parent Document Retrieval）</strong></p>
            <p>索引时用小 chunk（精度高），返回给 LLM 时用包含该 chunk 的大段落（上下文完整）。</p>
            <p><strong>4. 自查询检索（Self-Query）</strong></p>
            <p>LLM 从用户问题中提取结构化过滤条件。比如"找 2023 年关于 AI 的论文"→ 向量检索语义 + 元数据过滤 year=2023、category=AI。</p>
          `
        },
        {
          id: 'reranking',
          title: 'Re-ranking：让最相关的排在前面',
          content: `
            <p>向量检索的 top-K 结果是"大致相关的"，但<strong>排序不一定精确</strong>。Re-ranking（重排序）就是用一个更强的模型对初筛结果重新打分排序。</p>
            <p>工作流程：</p>
            <ol>
              <li>向量检索返回 top-50 候选文档（速度快但粗）</li>
              <li>Re-ranker 对 50 个候选文档逐个打分（速度慢但精）</li>
              <li>取前 5-10 个给 LLM</li>
            </ol>
            <p>主流 Re-ranker：</p>
            <ul>
              <li><strong>Cohere Rerank</strong>：专为此任务训练，效果好</li>
              <li><strong>BGE-Reranker</strong>：开源方案，BAAI 出品</li>
              <li><strong>Cross-Encoder</strong>：将"查询+文档"对一起输入模型打分，比 Bi-Encoder（分别编码）更精确</li>
            </ul>
            <p>Re-ranking 是 RAG 系统中典型的"用延迟换精度"的环节。对于追求高质量的场景（如法律、医疗），Re-ranking 几乎是必须的。</p>
          `,
          codeExample: `# Cohere Rerank 示例
import cohere
co = cohere.Client("your-api-key")

# 向量检索返回的候选文档
candidates = ["文档 A 的内容...", "文档 B 的内容...", "文档 C 的内容..."]

# Cohere Re-rank
results = co.rerank(
    query="如何提高机器学习模型的准确率？",
    documents=candidates,
    top_n=3,
    model="rerank-english-v3.0"
)

# 按相关性从高到低排序
for r in results.results:
    print(f"Score: {r.relevance_score:.3f} | {candidates[r.index][:50]}...")
`,
          keyPoint: 'Re-ranking 是投入产出比最高的 RAG 优化手段：加一个步骤，检索质量显著提升。'
        },
        {
          id: 'multi-hop-rag',
          title: '多跳推理 RAG',
          content: `
            <p>有些问题不能靠单次检索回答，需要<strong>多步推理</strong>：</p>
            <p>比如问"A 公司的 CEO 是哪所大学毕业的？"</p>
            <ol>
              <li>第一步检索：A 公司的 CEO 是谁？→ 得到"张三"</li>
              <li>第二步检索：张三毕业于哪所大学？→ 得到"清华大学"</li>
            </ol>
            <p>这就是 <strong>Multi-Hop RAG（多跳推理 RAG）</strong>。实现方式：</p>
            <ul>
              <li><strong>迭代检索</strong>：用 LLM 判断是否需要更多信息，如果需要则生成新的检索查询，循环直到信息足够</li>
              <li><strong>图结构检索</strong>：对知识库建立实体-关系图，检索时在图上游走</li>
            </ul>
            <p>多跳 RAG 的难点在于：LLM 需要判断"什么时候已经够用了"——无限循环是没有意义的。</p>
          `
        }
      ]
    },
    {
      id: 'rag-advanced',
      label: '深入',
      description: '高级 RAG 架构、Agentic RAG、评估体系、生产化实践。',
      sections: [
        {
          id: 'advanced-rag-patterns',
          title: '高级 RAG 架构模式',
          content: `
            <p>天真的（Naive）RAG 只做"检索→拼接→生成"，真实生产线上的 RAG 远比这复杂。以下是几个关键的高级模式：</p>
            <p><strong>1. 自适应 RAG（Adaptive RAG）</strong></p>
            <p>不是所有问题都需要 RAG。自适应 RAG 先用一个分类器判断：这个问题需要检索吗？如果用户问"1+1 等于几"就不该去查数据库。查询路由（Query Routing）决定用 RAG、直接回答、还是调用其他工具。</p>
            <p><strong>2. 纠正式 RAG（Corrective RAG / CRAG）</strong></p>
            <p>检索到的文档不一定可靠。CRAG 在做生成之前，先对检索结果做一轮"事实核查"：检索到的内容之间一致吗？和常识冲突吗？如果不可靠，触发补充检索或直接告知用户无法回答。</p>
            <p><strong>3. RAPTOR / 层级索引</strong></p>
            <p>对不同层级的内容建立索引。底层是原始 chunk，上层是 LLM 生成的摘要。检索时根据问题粒度选择合适的层级：概括性问题查摘要层，细节问题查原始层。</p>
          `,
          keyPoint: 'Naive RAG 到 Production RAG 的差距，就像课堂项目到商业产品的差距。高级模式的核心思想是"不要让检索一步到位，加判断和纠错"。'
        },
        {
          id: 'agentic-rag',
          title: 'Agentic RAG：当 RAG 遇上 Agent',
          content: `
            <p><strong>Agentic RAG</strong> 是 2024-2025 年最热的 RAG 趋势。它的核心思想是：<strong>把 Agent 的能力赋予 RAG 系统</strong>。</p>
            <p>传统 RAG 是固定的流水线，Agentic RAG 则是动态的决策过程：</p>
            <ul>
              <li>Agent 判断问题需要从哪些数据源检索（知识库？数据库？网页？）</li>
              <li>Agent 自行决定检索策略（单次？多次？改写查询？）</li>
              <li>Agent 评估检索结果质量，必要时重新检索</li>
              <li>Agent 综合多轮检索结果，交叉验证后给出答案</li>
            </ul>
            <p>Agentic RAG 本质上是让 RAG 的流程从"静态管线"变成了"动态回路"。Agent 在每一步观察、思考、决策——这正是我们之前学过的 Sense-Think-Act 循环。</p>
            <p>LangGraph 是目前实现 Agentic RAG 最流行的框架之一，它用状态图来编排这种动态流程。</p>
          `,
          keyPoint: 'Agentic RAG 是 AI Agent 和 RAG 的交汇点。如果你已经理解了 Agent 的循环机制和 RAG 的检索增强原理，Agentic RAG 就是两者的自然融合。'
        },
        {
          id: 'rag-evaluation',
          title: 'RAG 评估体系',
          content: `
            <p>如何判断一个 RAG 系统好不好？需要从三个维度评估：</p>
            <p><strong>1. 检索质量</strong></p>
            <ul>
              <li>Hit Rate：相关文档是否在检索结果中（top-K 里至少有一条相关）</li>
              <li>MRR（Mean Reciprocal Rank）：第一个相关文档排在第几位</li>
              <li>NDCG：考虑了排序位置的全面指标</li>
            </ul>
            <p><strong>2. 生成质量</strong></p>
            <ul>
              <li>Faithfulness（忠实度）：生成的答案是否基于检索到的文档（不编造）</li>
              <li>Answer Relevance：答案是否真正回答了问题</li>
              <li>Context Precision：检索到的文档中，哪些是真正有用的</li>
            </ul>
            <p><strong>3. 端到端质量</strong></p>
            <ul>
              <li>用 RAGAS（RAG Assessment）框架自动评估</li>
              <li>人工标注集做对比测试</li>
            </ul>
            <p>评估 RAG 的难点在于：检索对了不代表生成对了，生成对了不代表用户满意。需要多层次的评估体系。</p>
          `,
          codeExample: `# 用 RAGAS 评估 RAG 系统
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset

# 准备评估数据：问题、答案、上下文、参考答案
eval_dataset = Dataset.from_dict({
    "question": ["公司的年收入是多少？"],
    "answer": ["2024 年公司年收入为 500 万人民币。"],
    "contexts": [["财报显示 2024 年营收 500 万元。"]],
    "ground_truth": ["500 万人民币"]
})

# 自动评估
results = evaluate(
    eval_dataset,
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall]
)
print(results)`,
          keyPoint: '评估 RAG 时最容易忽略的是 Faithfulness（忠实度）。一个答案可能"看起来很棒"，但如果它没有基于检索到的文档，那就是幻觉——这恰恰是 RAG 要解决的问题。'
        },
        {
          id: 'rag-production',
          title: 'RAG 生产化实践要点',
          content: `
            <p>从 Demo 到生产环境，以下经验值得注意：</p>
            <p><strong>1. 响应延迟管理</strong></p>
            <p>Embedding API 调用 + 向量检索 + LLM 生成 = 多层次延迟。优化手段：向量检索用 HNSW 索引、Embedding 批量缓存、使用流式（streaming）LLM 生成让用户先看到开头。</p>
            <p><strong>2. 知识库更新</strong></p>
            <p>增量更新 > 全量重建。当新文档加入时，只对新文档做 Embedding 和索引，不要重新处理整个知识库。</p>
            <p><strong>3. 多模态 RAG</strong></p>
            <p>真实文档里有表格和图片。需要处理：表格用专门的 Table Parser，图片用多模态 Embedding（CLIP）或转为文字描述后索引。</p>
            <p><strong>4. 安全与权限</strong></p>
            <p>不同用户能看到的知识库内容不同。需要在检索阶段就做权限过滤（metadata filter），而不是在生成后再屏蔽。</p>
            <p><strong>5. 可观测性</strong></p>
            <p>记录检索结果、引用来源、用户反馈。当回答出问题时，能反向追踪是检索出了问题还是生成出了问题。</p>
          `
        }
      ]
    }
  ]
}
