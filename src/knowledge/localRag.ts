import { courseTopics } from '../content/course'
import { knowledgeSources } from './sourceCatalog'

export interface KnowledgeChunk {
  id: string
  title: string
  source: string
  type: 'course' | 'book' | 'source'
  content: string
  tags: string[]
  url?: string
  license?: string
  embedding?: number[]
  embeddingEngine?: string
  dimensions?: number
}

export interface KnowledgeHit extends KnowledgeChunk {
  score: number
  snippet: string
}

export const defaultEmbeddingEngine = 'feature-hash-256'
export const defaultEmbeddingDimensions = 256

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function tokenize(value: string) {
  const text = stripHtml(value).toLowerCase()
  const latinTokens = text.match(/[a-z0-9+#.-]{2,}/g) ?? []
  const chineseChars = Array.from(text.match(/[\u4e00-\u9fa5]/g) ?? [])
  const chineseBigrams = chineseChars.slice(0, -1).map((char, index) => `${char}${chineseChars[index + 1]}`)

  return [...latinTokens, ...chineseBigrams]
}

function hashToken(token: string) {
  let hash = 2166136261
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function embedText(value: string, dimensions = defaultEmbeddingDimensions) {
  const embedding = Array.from({ length: dimensions }, () => 0)
  const tokens = tokenize(value)

  for (const token of tokens) {
    const hash = hashToken(token)
    const index = hash % dimensions
    const sign = hash & 1 ? 1 : -1
    embedding[index] += sign
  }

  let norm = 0
  for (const value of embedding) {
    norm += value * value
  }

  if (!norm) return embedding
  const scale = Math.sqrt(norm)
  return embedding.map((value) => Number((value / scale).toFixed(6)))
}

function cosine(a: number[], b: number[]) {
  let dot = 0
  const length = Math.min(a.length, b.length)
  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index]
  }
  return dot
}

function makeSnippet(content: string, query: string) {
  const clean = stripHtml(content)
  const keyword = query.trim().split(/\s+/)[0]?.toLowerCase()
  const lower = clean.toLowerCase()
  const index = keyword ? lower.indexOf(keyword) : -1
  const start = index > 36 ? index - 36 : 0
  return clean.slice(start, start + 160)
}

function makeSearchable(chunk: KnowledgeChunk) {
  return `${chunk.title}\n${chunk.source}\n${chunk.tags.join(' ')}\n${chunk.content}`
}

function normalizeQueryText(value: string) {
  return value
    .toLowerCase()
    .replace(/[？?！!。.,，、:：;；"'“”‘’()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function expandQuery(value: string) {
  const normalized = normalizeQueryText(value)
  const expansions = new Set([normalized])

  if (/\brag\b/i.test(normalized)) {
    expansions.add(`${normalized} 检索增强生成 retrieval augmented generation 知识库 问答 外部知识 引用 来源`)
  }

  if (/(是什么|介绍|概念|定义|what is|简介)/i.test(normalized)) {
    expansions.add(`${normalized} 是什么 介绍 概念 定义 基础 入门 核心价值 为什么需要`)
  }

  return [...expansions].join(' ')
}

function lexicalScore(chunk: KnowledgeChunk, query: string) {
  const normalizedQuery = normalizeQueryText(query)
  const searchable = normalizeQueryText(makeSearchable(chunk))
  const title = normalizeQueryText(chunk.title)
  const source = normalizeQueryText(chunk.source)
  const queryTerms = normalizedQuery.split(' ').filter(Boolean)

  let score = 0
  for (const term of queryTerms) {
    if (title.includes(term)) score += 0.22
    if (source.includes(term)) score += 0.08
    if (searchable.includes(term)) score += 0.04
  }

  const asksDefinition = /(是什么|介绍|概念|定义|what is|简介)/i.test(normalizedQuery)
  const asksRag = /\brag\b/i.test(normalizedQuery)

  if (asksDefinition && asksRag) {
    if (chunk.id.includes('why-rag')) score += 0.6
    if (chunk.source.includes('RAG / 入门')) score += 0.24
    if (chunk.type === 'course') score += 0.12
    if (chunk.type === 'source') score -= 0.12
  }

  return score
}

export function buildKnowledgeChunks(): KnowledgeChunk[] {
  const courseChunks = courseTopics.flatMap((topic) =>
    topic.levels.flatMap((level) =>
      level.sections.map((section) => ({
        id: `${topic.id}-${level.id}-${section.id}`,
        title: section.title,
        source: `${topic.title} / ${level.label}`,
        type: 'course' as const,
        content: [
          section.content,
          section.keyPoint ?? '',
          section.codeExample ?? '',
          ...(section.checklist ?? []),
          section.quiz?.question ?? '',
          section.quiz?.answer ?? ''
        ].join('\n'),
        tags: [topic.title, level.label, ...(section.tags ?? [])],
        embedding: embedText(
          [
            section.title,
            topic.title,
            level.label,
            ...(section.id === 'why-rag'
              ? ['RAG 是什么', 'RAG 介绍', '检索增强生成 定义 概念 基础 入门 为什么需要 RAG']
              : []),
            section.content,
            section.keyPoint ?? '',
            section.codeExample ?? '',
            ...(section.checklist ?? []),
            section.quiz?.question ?? '',
            section.quiz?.answer ?? ''
          ].join('\n')
        ),
        embeddingEngine: defaultEmbeddingEngine,
        dimensions: defaultEmbeddingDimensions
      }))
    )
  )

  const sourceChunks: KnowledgeChunk[] = knowledgeSources.map((source) => ({
    id: `source-${source.id}`,
    title: source.title,
    source: `资料目录 / ${source.ingestionMode}`,
    type: 'source',
    content: `${source.summary}\n${source.recommendedUse}\n许可证：${source.license}\n链接：${source.url}`,
    tags: [...source.topics, source.licenseKind, source.ingestionMode],
    url: source.url,
    license: source.license,
    embedding: embedText(
      `${source.title}\n${source.topics.join(' ')}\n${source.summary}\n${source.recommendedUse}\n${source.license}`
    ),
    embeddingEngine: defaultEmbeddingEngine,
    dimensions: defaultEmbeddingDimensions
  }))

  const bookPlaceholders: KnowledgeChunk[] = [
    {
      id: 'book-slot-open-license',
      title: '书籍导入位：开放许可资料',
      source: '本地书库',
      type: 'book',
      content:
        '这里预留给后续导入的开放许可书籍、论文、官方文档或自有资料。建议优先放入可再分发的公开资料，或者你自己拥有版权/授权的内容。',
      tags: ['书籍', '导入', '版权', '知识库'],
      license: 'TBD',
      embedding: embedText('书籍 导入 版权 知识库 开放许可 资料'),
      embeddingEngine: defaultEmbeddingEngine,
      dimensions: defaultEmbeddingDimensions
    },
    {
      id: 'book-slot-embedding',
      title: '书籍导入位：Embedding 索引',
      source: '本地书库',
      type: 'book',
      content:
        '生产版可以在构建阶段把书籍切分成 chunk，生成 embedding，随 App 一起打包向量索引；运行时只需要对用户问题生成 query embedding，再做本地相似度检索。',
      tags: ['embedding', '索引', '离线构建', '向量检索'],
      license: 'TBD',
      embedding: embedText('embedding 索引 离线构建 向量检索 256维'),
      embeddingEngine: defaultEmbeddingEngine,
      dimensions: defaultEmbeddingDimensions
    }
  ]

  return [...courseChunks, ...sourceChunks, ...bookPlaceholders]
}

export function searchKnowledge(
  chunks: KnowledgeChunk[],
  query: string,
  limit = 5,
  queryEmbeddings: Record<string, number[]> = { [defaultEmbeddingEngine]: embedText(query) }
): KnowledgeHit[] {
  const normalized = query.trim()
  if (!normalized) return []

  const expandedQuery = expandQuery(normalized)
  const localQueryEmbedding = embedText(expandedQuery)

  return chunks
    .map((chunk) => {
      const searchable = makeSearchable(chunk)
      const engine = chunk.embeddingEngine ?? defaultEmbeddingEngine
      const chunkEmbedding = chunk.embedding ?? embedText(searchable)
      const queryEmbedding = engine === defaultEmbeddingEngine
        ? localQueryEmbedding
        : queryEmbeddings[engine]
      const vectorScore = queryEmbedding && queryEmbedding.length === chunkEmbedding.length
        ? cosine(queryEmbedding, chunkEmbedding)
        : 0
      const score = vectorScore + lexicalScore(chunk, normalized)

      return {
        ...chunk,
        score,
        snippet: makeSnippet(chunk.content, normalized)
      }
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export async function loadBundledKnowledge() {
  try {
    const response = await fetch('/knowledge/index.json')
    if (!response.ok) return []

    const data = await response.json()
    if (!Array.isArray(data.chunks)) return []

    return data.chunks.map((chunk: Record<string, unknown>) => ({
      id: `raw-${String(chunk.id)}`,
      title: String(chunk.title ?? 'Untitled'),
      source: String(chunk.sourceTitle ?? chunk.source ?? 'Bundled knowledge'),
      type: 'book' as const,
      content: String(chunk.content ?? ''),
      tags: Array.isArray(chunk.tags) ? chunk.tags.map(String) : ['raw'],
      url: typeof chunk.source === 'string' && chunk.source.startsWith('http') ? chunk.source : undefined,
      license: String(chunk.license ?? 'unknown'),
      embedding: Array.isArray(chunk.embedding) ? chunk.embedding.map(Number) : undefined,
      embeddingEngine: String(chunk.embeddingEngine ?? data.engine ?? defaultEmbeddingEngine),
      dimensions: Number(chunk.dimensions ?? data.dimensions ?? defaultEmbeddingDimensions)
    }))
  } catch {
    return []
  }
}

export function composeGroundedAnswer(query: string, hits: KnowledgeHit[]) {
  if (!query.trim()) return '输入一个问题后，我会从本地知识库里找相关片段。'
  if (!hits.length) return '本地知识库暂时没有找到足够相关的内容。可以换个关键词，或者等后续导入书籍和文档后再检索。'

  const sources = hits.slice(0, 3)
  return [
    `根据本地知识库，和“${query}”最相关的是：`,
    ...sources.map((hit, index) => `${index + 1}. ${hit.title}：${hit.snippet}`),
    '这只是基于检索片段的摘要式回答；接入 LLM 后，可以把这些片段作为上下文生成更自然的答案，并附带引用。'
  ].join('\n')
}
