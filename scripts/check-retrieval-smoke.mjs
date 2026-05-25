import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const indexFile = path.join(root, 'public', 'knowledge', 'index.json')
const dimensions = 256

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value) {
  const text = stripMarkdown(value).toLowerCase()
  const latinTokens = text.match(/[a-z0-9+#.-]{2,}/g) ?? []
  const chineseChars = Array.from(text.match(/[\u4e00-\u9fa5]/g) ?? [])
  const chineseBigrams = chineseChars.slice(0, -1).map((char, index) => `${char}${chineseChars[index + 1]}`)

  return [...latinTokens, ...chineseBigrams]
}

function hashToken(token) {
  let hash = 2166136261
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function embedText(value) {
  const embedding = Array.from({ length: dimensions }, () => 0)
  for (const token of tokenize(value)) {
    const hash = hashToken(token)
    embedding[hash % dimensions] += hash & 1 ? 1 : -1
  }

  const norm = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0))
  return norm ? embedding.map((value) => value / norm) : embedding
}

function cosine(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0)
}

const data = JSON.parse(await readFile(indexFile, 'utf8'))
const chunks = data.chunks ?? []
const queries = ['GraphRAG', 'Prompt Engineering', 'Embedding']

for (const query of queries) {
  const queryEmbedding = embedText(query)
  const [best] = chunks
    .map((chunk) => ({
      chunk,
      score: cosine(queryEmbedding, chunk.embedding)
    }))
    .sort((a, b) => b.score - a.score)

  if (!best || best.score <= 0) {
    console.error(`Retrieval smoke check failed for query "${query}"`)
    process.exit(1)
  }

  console.log(`Retrieval OK: "${query}" -> "${best.chunk.title}" (${best.score.toFixed(3)})`)
}
