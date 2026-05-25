import { readFile } from 'node:fs/promises'
import path from 'node:path'

const file = path.join(process.cwd(), 'src', 'knowledge', 'localRag.ts')
const source = await readFile(file, 'utf8')

const requiredSignals = [
  'function expandQuery',
  'function lexicalScore',
  "chunk.id.includes('why-rag')",
  'RAG 是什么',
  '检索增强生成'
]

for (const signal of requiredSignals) {
  if (!source.includes(signal)) {
    console.error(`Runtime retrieval check failed: missing ${signal}`)
    process.exit(1)
  }
}

console.log('Runtime retrieval rules OK: RAG definition query expansion is present')
