import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const rawDir = path.join(root, 'knowledge', 'raw')
const outDir = path.join(root, 'public', 'knowledge')
const outFile = path.join(outDir, 'index.json')
const dimensions = 256
const engine = 'feature-hash-256'

function parseFrontmatter(markdown, fileName) {
  if (!markdown.startsWith('---')) {
    return {
      metadata: {
        title: fileName.replace(/\.md$/i, ''),
        source: 'local',
        license: 'unknown'
      },
      body: markdown
    }
  }

  const end = markdown.indexOf('\n---', 3)
  if (end === -1) {
    return {
      metadata: {
        title: fileName.replace(/\.md$/i, ''),
        source: 'local',
        license: 'unknown'
      },
      body: markdown
    }
  }

  const frontmatter = markdown.slice(3, end).trim()
  const body = markdown.slice(end + 4).trim()
  const metadata = Object.fromEntries(
    frontmatter
      .split('\n')
      .map((line) => line.split(':'))
      .filter((parts) => parts.length >= 2)
      .map(([key, ...value]) => [key.trim(), value.join(':').trim()])
  )

  return { metadata, body }
}

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+/gm, '')
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

function splitIntoChunks(body, size = 900, overlap = 120) {
  const sections = body
    .split(/\n(?=##?\s+)/)
    .map((section) => section.trim())
    .filter(Boolean)

  const chunks = []
  for (const section of sections) {
    const heading = section.match(/^#+\s+(.+)$/m)?.[1]?.trim() ?? 'Untitled section'
    const clean = stripMarkdown(section)

    if (clean.length <= size) {
      chunks.push({ heading, content: clean })
      continue
    }

    for (let start = 0; start < clean.length; start += size - overlap) {
      chunks.push({
        heading,
        content: clean.slice(start, start + size)
      })
    }
  }

  return chunks
}

async function main() {
  const files = (await readdir(rawDir)).filter((file) => file.endsWith('.md') && file !== 'README.md')
  const chunks = []

  for (const file of files) {
    const fullPath = path.join(rawDir, file)
    const markdown = await readFile(fullPath, 'utf8')
    const { metadata, body } = parseFrontmatter(markdown, file)
    const split = splitIntoChunks(body)

    split.forEach((chunk, index) => {
      chunks.push({
        id: `${file.replace(/\.md$/i, '')}-${index + 1}`,
        title: chunk.heading,
        sourceTitle: metadata.title ?? file.replace(/\.md$/i, ''),
        source: metadata.source ?? 'local',
        license: metadata.license ?? 'unknown',
        content: chunk.content,
        tags: ['raw', 'curated'],
        embeddingEngine: engine,
        dimensions,
        embedding: embedText(
          [
            chunk.heading,
            metadata.title ?? '',
            metadata.source ?? '',
            metadata.license ?? '',
            chunk.content
          ].join('\n')
        )
      })
    })
  }

  await mkdir(outDir, { recursive: true })
  await writeFile(
    outFile,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        engine,
        dimensions,
        nextStep: 'Replace embedText with a neural embedding model while keeping the index schema stable.',
        chunks
      },
      null,
      2
    ),
    'utf8'
  )

  console.log(`Built ${chunks.length} chunks with ${dimensions}d embeddings -> ${path.relative(root, outFile)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
