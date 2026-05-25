import { TechTopic } from '../types'

export const embeddingContent: TechTopic = {
  id: 'embedding',
  title: 'Embedding',
  icon: '🧬',
  description: '理解向量嵌入：从语义表示到向量数据库的完整链路',
  levels: [
    {
      id: 'emb-basics',
      label: '入门',
      description: '什么是 Embedding？为什么文本可以被"编码"成数字？建立底层直觉。',
      sections: [
        {
          id: 'emb-what',
          title: 'Embedding 是什么？从文字到数字',
          content: `
            <p>计算机不理解"苹果"和"香蕉"的文字含义，但它<strong>理解数字</strong>。Embedding（嵌入）就是<strong>把任何东西——文字、图片、声音——变成一串数字（向量）</strong>的技术。</p>
            <p>想象一个三维空间：</p>
            <ul>
              <li>"苹果"被映射到坐标 [0.8, 0.3, 0.1]</li>
              <li>"香蕉"被映射到坐标 [0.7, 0.4, 0.2]</li>
              <li>"汽车"被映射到坐标 [0.1, 0.8, 0.9]</li>
            </ul>
            <p>你会发现"苹果"和"香蕉"的坐标很近（都是水果），而它们和"汽车"的距离很远。这就是 Embedding 的核心魔力：<strong>语义相近的东西在向量空间中距离也近</strong>。</p>
            <p>实际应用中，Embedding 维度通常是 768、1024、1536、3072 等高维空间。OpenAI 的 text-embedding-3-small 有 1536 维，text-embedding-3-large 有 3072 维。</p>
          `,
          keyPoint: 'Embedding 本质上是"语义的坐标化"——把一个概念映射到高维空间中的一个点，相似概念的点互相靠近。'
        },
        {
          id: 'emb-why',
          title: '为什么需要 Embedding？',
          content: `
            <p>在 Embedding 出现之前，计算机处理文本主要用<strong>关键词匹配</strong>。这种方式有严重缺陷：</p>
            <ul>
              <li>"我今天很开心"和"我今天心情不错"——关键词匹配认为完全无关，但意思几乎一样</li>
              <li>"苹果很好吃"和"苹果发布了新手机"——关键词匹配认为高度相关，但说的是苹果和苹果公司两回事</li>
            </ul>
            <p>Embedding 解决了这个问题：它捕捉的是<strong>语义</strong>而非字面。这在以下场景中至关重要：</p>
            <ul>
              <li><strong>语义搜索</strong>：用户搜"怎么减肥"，能找到标题为"科学减重方法"的文档</li>
              <li><strong>推荐系统</strong>：用户喜欢某篇文章，推荐语义相似的其它文章</li>
              <li><strong>聚类分析</strong>：把海量文档按主题自动分组</li>
              <li><strong>异常检测</strong>：找出和正常模式向量距离过大的异常数据</li>
            </ul>
          `,
          keyPoint: 'Embedding 让机器从"字面匹配"进化为"语义理解"，这是所有现代 AI 检索系统的基础。'
        },
        {
          id: 'emb-similarity',
          title: '相似度度量：余弦相似度与欧氏距离',
          content: `
            <p>两个 Embedding 向量"有多像"，需要通过<strong>相似度计算</strong>来量化。最常用的方法：</p>
            <p><strong>1. 余弦相似度（Cosine Similarity）</strong></p>
            <p>计算两个向量之间<strong>夹角的余弦值</strong>。值越接近 1 越相似，接近 0 表示无关，接近 -1 表示相反。这是 NLP 和搜索中最常用的方法，因为它不受向量长度影响，只关心方向。</p>
            <p><strong>2. 欧氏距离（Euclidean Distance）</strong></p>
            <p>计算两个点在空间中的<strong>直线距离</strong>。距离越小越相似。但受向量长度影响大，适合向量标准化后的场景。</p>
            <p><strong>3. 点积（Dot Product）</strong></p>
            <p>两个向量对应元素相乘再求和。值越大越相似。常用于模型内部计算，效率高。</p>
            <p>实践中，余弦相似度是语义搜索的事实标准。</p>
          `,
          codeExample: `import numpy as np

def cosine_similarity(a, b):
    """余弦相似度：值域 [-1, 1]，1 表示完全相同"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def euclidean_distance(a, b):
    """欧氏距离：值域 [0, ∞)，0 表示完全相同"""
    return np.linalg.norm(a - b)

# 示例
apple = np.array([0.8, 0.3, 0.1])
banana = np.array([0.7, 0.4, 0.2])

print(f"苹果-香蕉 余弦相似度: {cosine_similarity(apple, banana):.3f}")
# 输出接近 0.98，非常相似`
        },
        {
          id: 'emb-models',
          title: '主流 Embedding 模型一览',
          content: `
            <p>不是所有 Embedding 模型都一样。不同模型在不同任务上表现差异很大：</p>
            <table>
              <tr><th>模型</th><th>维度</th><th>最大 Token</th><th>特点</th></tr>
              <tr><td>OpenAI text-embedding-3-small</td><td>1536</td><td>8191</td><td>性价比高，MTEB 基准优秀</td></tr>
              <tr><td>OpenAI text-embedding-3-large</td><td>3072</td><td>8191</td><td>性能最强，支持维度缩减</td></tr>
              <tr><td>BGE-M3</td><td>1024</td><td>8192</td><td>开源最强之一，支持多语言和稀疏检索</td></tr>
              <tr><td>E5-mistral-7b</td><td>4096</td><td>32768</td><td>基于 Mistral-7B，长文本效果好</td></tr>
              <tr><td>Cohere embed-v3</td><td>1024</td><td>512</td><td>专为搜索优化，分类表现好</td></tr>
            </table>
            <p>选择建议：追求性价比用 OpenAI small，需要本地部署用 BGE-M3，长文本场景用 E5 或 OpenAI large。</p>
          `
        }
      ]
    },
    {
      id: 'emb-intermediate',
      label: '进阶',
      description: '向量数据库的核心原理、索引算法、多模态 Embedding。',
      sections: [
        {
          id: 'vectordb-intro',
          title: '向量数据库是什么？',
          content: `
            <p>向量数据库是<strong>专门为存储和检索高维向量而设计的数据库</strong>。传统数据库擅长精确匹配（WHERE name = '张三'），向量数据库擅长近似匹配（找到和这个向量最相似的 10 个向量）。</p>
            <p>核心工作流程：</p>
            <ol>
              <li><strong>写入</strong>：将文本通过 Embedding 模型转为向量，存储到数据库中</li>
              <li><strong>索引</strong>：对向量建立索引结构以加速检索</li>
              <li><strong>查询</strong>：将查询文本也转为向量，在数据库中检索最相似的前 K 个向量</li>
              <li><strong>返回</strong>：返回对应的原始文本或元数据</li>
            </ol>
            <p>和传统数据库的核心区别：传统数据库的查询条件是精确的、确定性的；向量数据库的查询是<strong>近似性的</strong>——"把这个向量附近的东西找给我"。</p>
          `,
          keyPoint: '向量数据库不是替代 MySQL 或 PostgreSQL，而是互补。实际系统中往往是"传统数据库存元数据 + 向量数据库做语义检索"的组合。'
        },
        {
          id: 'ann-index',
          title: '近似最近邻搜索（ANN）与索引算法',
          content: `
            <p>在高维空间中精确找到"最近邻"非常耗时（暴力搜索复杂度 O(n×d)）。<strong>近似最近邻搜索（ANN）</strong> 牺牲微小的精度换取巨大的速度提升。</p>
            <p><strong>主流 ANN 算法：</strong></p>
            <ul>
              <li><strong>HNSW（Hierarchical Navigable Small World）</strong>：构建多层图结构，上层稀疏（快速跳跃），下层密集（精细搜索）。目前综合性能最好的算法，内存占用较大。</li>
              <li><strong>IVF（Inverted File）</strong>：用聚类把向量空间分成多个区域，搜索时只搜索最近的几个区域。内存效率高，适合大规模数据。</li>
              <li><strong>PQ（Product Quantization）</strong>：把高维向量压缩成短编码，大幅减小内存占用。适合内存受限场景。</li>
            </ul>
            <p>实际系统中通常会组合多种算法，比如 IVF+PQ（Milvus、Faiss 中的常见组合），在速度、精度、内存之间取平衡。</p>
          `,
          codeExample: `# Faiss 示例：用 IVF+PQ 索引检索
import faiss
import numpy as np

# 假设有 100 万个 768 维向量
vectors = np.random.random((1_000_000, 768)).astype('float32')

# 创建 IVF+PQ 索引
nlist = 4096      # 聚类中心数
m = 48            # PQ 子向量数
quantizer = faiss.IndexFlatL2(768)
index = faiss.IndexIVFPQ(quantizer, 768, nlist, m, 8)

# 训练索引
index.train(vectors)
index.add(vectors)

# 搜索：在百万向量中找到最近 5 个，毫秒级
query = np.random.random((1, 768)).astype('float32')
distances, ids = index.search(query, k=5)`,
          keyPoint: 'ANN 的本质是"用可控的精度损失换取数量级的性能提升"。一个设计良好的索引能在百万级向量中做到毫秒级检索。'
        },
        {
          id: 'vectordb-compare',
          title: '主流向量数据库对比',
          content: `
            <table>
              <tr><th>数据库</th><th>类型</th><th>核心优势</th><th>适用场景</th></tr>
              <tr><td>Chroma</td><td>嵌入式</td><td>Python 原生集成，零配置，开发体验好</td><td>原型开发、小规模应用</td></tr>
              <tr><td>Milvus</td><td>分布式</td><td>十亿级向量，云原生，GPU 加速</td><td>大规模生产环境</td></tr>
              <tr><td>Pinecone</td><td>云服务</td><td>完全托管，零运维，自动扩缩</td><td>不想自己维护的团队</td></tr>
              <tr><td>Weaviate</td><td>混合</td><td>同时支持向量和关键词检索（Hybrid Search）</td><td>需要混合检索的场景</td></tr>
              <tr><td>Qdrant</td><td>自托管/云</td><td>Rust 编写，性能优异，过滤能力强</td><td>高性能 + 复杂过滤</td></tr>
              <tr><td>PostgreSQL + pgvector</td><td>扩展</td><td>在现有 PG 上直接加向量能力</td><td>不想引入新数据库的团队</td></tr>
            </table>
            <p>选型建议：原型用 Chroma，生产小规模用 pgvector，大规模用 Milvus 或 Pinecone。</p>
          `
        },
        {
          id: 'multimodal-emb',
          title: '多模态 Embedding：文字之外的向量化',
          content: `
            <p>Embedding 不只适用于文字。<strong>任何模态的数据都可以被向量化</strong>：</p>
            <ul>
              <li><strong>图片 Embedding</strong>：CLIP（OpenAI）可以把"文字"和"图片"映射到同一个向量空间。搜"一只戴墨镜的猫"能直接找到对应的猫图。</li>
              <li><strong>音频 Embedding</strong>：Whisper 等模型可以把语音转为文本 Embedding，用于语音搜索。</li>
              <li><strong>代码 Embedding</strong>：CodeBERT、StarCoder 等模型为代码生成 Embedding，支持语义级代码搜索。</li>
            </ul>
            <p>CLIP 是一个里程碑式的多模态模型，它让"用文字搜图片"和"用图片搜文字"都成为可能，而且效果惊人。核心方法是<strong>对比学习（Contrastive Learning）</strong>：拉近匹配图文对的向量距离，推远不匹配图文对的向量距离。</p>
          `,
          keyPoint: '多模态 Embedding 打破了模态之间的壁垒。在 CLIP 的向量空间里，"文字 \'狗\'"和一张狗的照片在同一个位置——这让跨模态检索成为现实。'
        }
      ]
    },
    {
      id: 'emb-advanced',
      label: '深入',
      description: '前沿话题：稀疏 vs 密集检索、Matryoshka Embedding、向量压缩与量化。',
      sections: [
        {
          id: 'sparse-dense',
          title: '稀疏检索 vs 密集检索，以及混合检索',
          content: `
            <p>检索方式分为两大阵营：</p>
            <p><strong>稀疏检索（Sparse Retrieval）</strong>——传统 BM25 算法</p>
            <p>依赖词频统计和倒排索引。优点是精确匹配能力强（搜"Python 编程"一定能找到含这两个词的文章），可解释性好，没有 Embedding 成本。缺点是语义泛化差（"汽车"搜不到"轿车"相关的文档）。</p>
            <p><strong>密集检索（Dense Retrieval）</strong>——基于 Embedding 向量</p>
            <p>通过语义相似度匹配。优点是语义泛化强，多语言支持好。缺点是精确匹配弱（专有名词可能被模糊匹配掉），需要 Embedding 计算成本。</p>
            <p><strong>混合检索（Hybrid Search）</strong>是当前的最佳实践：同时运行 BM25 和向量检索，然后用加权融合（如 RRF，倒数秩融合）合并结果。这样既有精确匹配又有语义泛化。</p>
          `,
          codeExample: `# 混合检索 + RRF 融合（伪代码）
def reciprocal_rank_fusion(results_list, k=60):
    """RRF: 倒数秩融合算法"""
    scores = {}
    for results in results_list:
        for rank, doc_id in enumerate(results):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)

# BM25 结果: [doc_A, doc_B, doc_C]
# 向量检索结果: [doc_B, doc_D, doc_A]
# RRF 融合后: doc_B 得分最高（在两个列表中都靠前）
`,
          keyPoint: '稀疏和密集不是对立的。混合检索在几乎所有场景中都优于单独使用任何一种，这也是 RAG 系统生产环境的标配。'
        },
        {
          id: 'matryoshka',
          title: 'Matryoshka Embedding：一个向量，多种维度',
          content: `
            <p><strong>Matryoshka Representation Learning</strong>（俄罗斯套娃表示学习）是一个优雅的想法：训练一个 Embedding 模型，使得<strong>截取向量的前 N 维仍然保持了良好的语义表示</strong>。</p>
            <p>为什么这很重要？</p>
            <ul>
              <li><strong>弹性维度</strong>：一个 3072 维的 Matryoshka Embedding，可以按需缩减到 256、512、1024 维而不需要重新编码</li>
              <li><strong>成本优化</strong>：精度要求低的场景用低维度（更少存储、更快搜索），精度要求高的场景用高维度</li>
              <li><strong>一次编码，多处复用</strong>：不需要为不同维度维护不同的编码</li>
            </ul>
            <p>OpenAI 的 text-embedding-3 系列就支持 Matryoshka，你可以在 API 调用时指定 dimensions 参数，不损失太多质量的情况下大幅降低维度。</p>
          `
        },
        {
          id: 'quantization',
          title: '向量量化：用更少的位存更多的向量',
          content: `
            <p>向量是很占空间的。100 万个 1536 维的 float32 向量需要约 6GB 存储。量化技术可以<strong>大幅减少存储需求</strong>：</p>
            <ul>
              <li><strong>标量量化（SQ）</strong>：float32 → int8，存储减少 4 倍</li>
              <li><strong>二进制量化（BQ）</strong>：每个维度只用 1 bit（0 或 1），存储减少 32 倍</li>
              <li><strong>乘积量化（PQ）</strong>：把向量切成多段，每段独立聚类编码，通常压缩 10-30 倍</li>
            </ul>
            <p>量化的代价是精度损失。二进制量化极端压缩但精度最低，乘积量化是工业生产中最常用的平衡方案。</p>
            <p>一个典型案例：用 PQ 把 1024 维的向量压缩到 64 字节后，1 亿个向量只需约 6GB，可以完全放在内存中检索。</p>
          `,
          keyPoint: '向量量化是让大规模向量检索变得经济可行的关键技术。没有量化，十亿级向量搜索的成本是天文数字。'
        }
      ]
    }
  ]
}
