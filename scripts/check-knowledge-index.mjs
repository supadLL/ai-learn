import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const indexFile = path.join(root, 'public', 'knowledge', 'index.json')
const expectedDimensions = 256

function fail(message) {
  console.error(`Knowledge index check failed: ${message}`)
  process.exit(1)
}

const raw = await readFile(indexFile, 'utf8').catch((error) => {
  fail(`cannot read ${path.relative(root, indexFile)} (${error.message})`)
})

const data = JSON.parse(raw)
if (!Array.isArray(data.chunks)) {
  fail('chunks must be an array')
}

if (data.dimensions !== expectedDimensions) {
  fail(`dimensions must be ${expectedDimensions}, got ${data.dimensions}`)
}

const ids = new Set()
let emptyContent = 0
let badEmbedding = 0
let badNorm = 0

for (const chunk of data.chunks) {
  if (!chunk.id || ids.has(chunk.id)) {
    fail(`duplicate or missing chunk id: ${chunk.id}`)
  }
  ids.add(chunk.id)

  if (!chunk.title || !chunk.content) {
    emptyContent += 1
  }

  if (!Array.isArray(chunk.embedding) || chunk.embedding.length !== expectedDimensions) {
    badEmbedding += 1
    continue
  }

  const norm = Math.sqrt(chunk.embedding.reduce((sum, value) => sum + value * value, 0))
  if (!Number.isFinite(norm) || norm < 0.95 || norm > 1.05) {
    badNorm += 1
  }
}

if (!data.chunks.length) {
  fail('index has no chunks')
}

if (emptyContent) {
  fail(`${emptyContent} chunks have missing title or content`)
}

if (badEmbedding) {
  fail(`${badEmbedding} chunks have invalid embeddings`)
}

if (badNorm) {
  fail(`${badNorm} chunks have embeddings outside normalized range`)
}

console.log(`Knowledge index OK: ${data.chunks.length} chunks, ${expectedDimensions} dimensions`)
