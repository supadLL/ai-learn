import { app, BrowserWindow, Menu, nativeImage, dialog, ipcMain } from 'electron'
import type { OpenDialogOptions } from 'electron'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'

let mainWindow: BrowserWindow | null = null

const appId = 'com.aiplay.app'
const appName = 'AI Play'
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)
const embeddingDimensions = 256
const featureHashEngine = 'feature-hash-256'

interface EmbeddingSettings {
  engine: 'feature-hash' | 'custom-api'
  endpoint: string
  apiKey: string
  model: string
  dimensions: number
  headersJson: string
  responsePath: string
}

interface LlmSettings {
  endpoint: string
  apiKey: string
  model: string
  headersJson: string
  responsePath: string
  temperature: number
  systemPrompt: string
  wireApi: 'chat_completions' | 'responses'
  reasoningEffort: string
}

interface UserKnowledgeChunk {
  id: string
  title: string
  sourceTitle: string
  source: string
  license: string
  content: string
  tags: string[]
  embedding: number[]
  embeddingEngine: string
  dimensions: number
}

const defaultEmbeddingSettings: EmbeddingSettings = {
  engine: 'feature-hash',
  endpoint: '',
  apiKey: '',
  model: '',
  dimensions: embeddingDimensions,
  headersJson: '',
  responsePath: 'data.0.embedding'
}

const defaultLlmSettings: LlmSettings = {
  endpoint: '',
  apiKey: '',
  model: '',
  headersJson: '',
  responsePath: 'choices.0.message.content',
  temperature: 0.2,
  wireApi: 'chat_completions',
  reasoningEffort: 'medium',
  systemPrompt: [
    '你是 AI Play 的学习导师。请只基于提供的本地知识库上下文回答。',
    '回答必须使用以下结构：',
    '1. 直接结论：用 2-4 句话回答问题。',
    '2. 关键解释：分点解释原因和机制。',
    '3. 学习建议：给出下一步应该学习或实践的内容。',
    '4. 引用依据：列出使用到的片段编号。',
    '如果上下文不足，请明确说明不足，不要编造。'
  ].join('\n')
}

app.setName(appName)
app.setAppUserModelId(appId)

// 防止多实例——如果已有实例在跑，聚焦已有窗口
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}

function getAppIcon() {
  const iconPath = isDev
    ? path.join(process.cwd(), 'public', 'icon.png')
    : path.join(__dirname, '../dist/icon.png')

  return nativeImage.createFromPath(iconPath)
}

function userKnowledgePath() {
  return path.join(app.getPath('userData'), 'knowledge', 'user-index.json')
}

function embeddingSettingsPath() {
  return path.join(app.getPath('userData'), 'knowledge', 'embedding-settings.json')
}

function llmSettingsPath() {
  return path.join(app.getPath('userData'), 'knowledge', 'llm-settings.json')
}

function parseFrontmatter(markdown: string, fileName: string) {
  const title = fileName.replace(/\.(md|txt|pdf)$/i, '')
  if (!markdown.startsWith('---')) {
    return {
      metadata: {
        title,
        source: 'user-import',
        license: 'user-provided'
      },
      body: markdown
    }
  }

  const end = markdown.indexOf('\n---', 3)
  if (end === -1) {
    return {
      metadata: {
        title,
        source: 'user-import',
        license: 'user-provided'
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

async function readKnowledgeFile(filePath: string) {
  const extension = path.extname(filePath).toLowerCase()
  const buffer = await readFile(filePath)

  if (extension === '.pdf') {
    const parsed = await pdfParse(buffer)
    return parsed.text
  }

  return buffer.toString('utf8')
}

async function readEmbeddingSettings(): Promise<EmbeddingSettings> {
  try {
    const raw = await readFile(embeddingSettingsPath(), 'utf8')
    const settings = JSON.parse(raw)
    return {
      ...defaultEmbeddingSettings,
      ...settings,
      dimensions: Number(settings.dimensions || embeddingDimensions),
      responsePath: String(settings.responsePath || defaultEmbeddingSettings.responsePath)
    }
  } catch {
    return defaultEmbeddingSettings
  }
}

async function saveEmbeddingSettings(next: Partial<EmbeddingSettings>) {
  const current = await readEmbeddingSettings()
  const settings: EmbeddingSettings = {
    ...current,
    ...next,
    apiKey: typeof next.apiKey === 'string' && next.apiKey.trim() ? next.apiKey.trim() : current.apiKey,
    dimensions: Number(next.dimensions || current.dimensions || embeddingDimensions)
  }
  const filePath = embeddingSettingsPath()
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(settings, null, 2), 'utf8')
  return maskEmbeddingSettings(settings)
}

async function readLlmSettings(): Promise<LlmSettings> {
  try {
    const raw = await readFile(llmSettingsPath(), 'utf8')
    const settings = JSON.parse(raw)
    return {
      ...defaultLlmSettings,
      ...settings,
      temperature: Number(settings.temperature ?? defaultLlmSettings.temperature),
      responsePath: String(settings.responsePath || defaultLlmSettings.responsePath),
      systemPrompt: String(settings.systemPrompt || defaultLlmSettings.systemPrompt),
      wireApi: settings.wireApi === 'responses' ? 'responses' : 'chat_completions',
      reasoningEffort: String(settings.reasoningEffort || defaultLlmSettings.reasoningEffort)
    }
  } catch {
    return defaultLlmSettings
  }
}

async function saveLlmSettings(next: Partial<LlmSettings>) {
  const current = await readLlmSettings()
  const settings: LlmSettings = {
    ...current,
    ...next,
    apiKey: typeof next.apiKey === 'string' && next.apiKey.trim() ? next.apiKey.trim() : current.apiKey,
    temperature: Number(next.temperature ?? current.temperature)
  }
  const filePath = llmSettingsPath()
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(settings, null, 2), 'utf8')
  return maskLlmSettings(settings)
}

function maskEmbeddingSettings(settings: EmbeddingSettings) {
  return {
    ...settings,
    apiKey: '',
    hasApiKey: Boolean(settings.apiKey)
  }
}

function maskLlmSettings(settings: LlmSettings) {
  return {
    ...settings,
    apiKey: '',
    hasApiKey: Boolean(settings.apiKey)
  }
}

function stripMarkdown(value: string) {
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

function tokenize(value: string) {
  const text = stripMarkdown(value).toLowerCase()
  const latinTokens = text.match(/[a-z0-9+#.-]{2,}/g) ?? []
  const chineseChars = Array.from(text.match(/[\u4e00-\u9fa5]/g) ?? [])
  const chineseBigrams = chineseChars.slice(0, -1).map((char, index) => `${char}${chineseChars[index + 1]}`)

  return [...latinTokens, ...chineseBigrams]
}

function hashToken(token: string) {
  let hash = 2166136261
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function embedText(value: string) {
  const embedding = Array.from({ length: embeddingDimensions }, () => 0)
  for (const token of tokenize(value)) {
    const hash = hashToken(token)
    const index = hash % embeddingDimensions
    const sign = hash & 1 ? 1 : -1
    embedding[index] += sign
  }

  const norm = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0))
  if (!norm) return embedding
  return embedding.map((value) => Number((value / norm).toFixed(6)))
}

function embeddingEngineName(settings: EmbeddingSettings) {
  if (settings.engine === 'custom-api') {
    return `custom-api:${settings.model || 'unknown'}:${settings.dimensions}`
  }

  return featureHashEngine
}

function readPath(value: unknown, responsePath: string) {
  return responsePath.split('.').reduce<unknown>((current, part) => {
    if (current == null) return undefined
    if (/^\d+$/.test(part)) return Array.isArray(current) ? current[Number(part)] : undefined
    return typeof current === 'object' ? (current as Record<string, unknown>)[part] : undefined
  }, value)
}

function parseHeaders(headersJson: string) {
  if (!headersJson.trim()) return {}
  const parsed = JSON.parse(headersJson)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('headersJson must be a JSON object')
  }
  return parsed as Record<string, string>
}

async function embedWithCustomApi(input: string, settings: EmbeddingSettings) {
  if (!settings.endpoint.trim()) {
    throw new Error('请先填写 Embedding API endpoint')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...parseHeaders(settings.headersJson)
  }
  if (settings.apiKey) {
    headers.Authorization = `Bearer ${settings.apiKey}`
  }

  const body: Record<string, unknown> = {
    input,
    model: settings.model || undefined
  }
  if (settings.dimensions) {
    body.dimensions = settings.dimensions
  }

  const response = await fetch(settings.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Embedding API ${response.status}: ${text.slice(0, 240)}`)
  }

  const data = await response.json()
  const embedding = readPath(data, settings.responsePath)
  if (!Array.isArray(embedding)) {
    throw new Error(`无法从响应路径 ${settings.responsePath} 读取 embedding 数组`)
  }

  const vector = embedding.map(Number)
  if (!vector.every(Number.isFinite)) {
    throw new Error('Embedding 数组包含非数字值')
  }

  return normalizeVector(vector, settings.dimensions || vector.length)
}

async function callLlm(settings: LlmSettings, question: string, contexts: Array<{ title: string; source: string; content: string }>) {
  if (!settings.endpoint.trim()) {
    throw new Error('请先填写 LLM API endpoint')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...parseHeaders(settings.headersJson)
  }
  if (settings.apiKey) {
    headers.Authorization = `Bearer ${settings.apiKey}`
  }

  const contextText = contexts
    .map((context, index) => `[${index + 1}] ${context.title}\n来源：${context.source}\n内容：${context.content}`)
    .join('\n\n')

  const userPrompt = [
    '用户问题：',
    question,
    '',
    '本地知识库检索上下文：',
    contextText || '无可用上下文'
  ].join('\n')

  const response = await fetch(settings.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(makeLlmRequestBody(settings, userPrompt))
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`LLM API ${response.status}: ${text.slice(0, 240)}`)
  }

  const data = await response.json()
  const preferredContent = settings.responsePath ? readPath(data, settings.responsePath) : undefined
  const content = typeof preferredContent === 'string' ? preferredContent : extractLlmText(data)
  if (typeof content !== 'string') {
    throw new Error(`无法从响应中读取回答文本。已尝试路径：${settings.responsePath || 'auto'}；响应字段：${summarizeResponseShape(data)}`)
  }

  return content
}

async function testLlmConnection(settings: LlmSettings) {
  if (!settings.endpoint.trim()) {
    throw new Error('请先填写 LLM API endpoint')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...parseHeaders(settings.headersJson)
  }
  if (settings.apiKey) {
    headers.Authorization = `Bearer ${settings.apiKey}`
  }

  const body = settings.wireApi === 'responses'
    ? {
        model: settings.model || undefined,
        input: 'test',
        instructions: 'Reply with a short connection success message.',
        reasoning: settings.reasoningEffort ? { effort: settings.reasoningEffort } : undefined
      }
    : {
        model: settings.model || undefined,
        temperature: 0,
        messages: [
          { role: 'system', content: 'Reply with a short connection success message.' },
          { role: 'user', content: 'test' }
        ]
      }

  const response = await fetch(settings.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`LLM API ${response.status}: ${text.slice(0, 240)}`)
  }

  const data = await response.json()
  const preferredContent = settings.responsePath ? readPath(data, settings.responsePath) : undefined
  const answer = typeof preferredContent === 'string' ? preferredContent : extractLlmText(data)

  return {
    ok: true,
    answer: typeof answer === 'string' ? answer : '',
    responseShape: summarizeResponseShape(data)
  }
}

function makeLlmRequestBody(settings: LlmSettings, userPrompt: string) {
  if (settings.wireApi === 'responses') {
    return {
      model: settings.model || undefined,
      instructions: settings.systemPrompt,
      input: userPrompt,
      reasoning: settings.reasoningEffort ? { effort: settings.reasoningEffort } : undefined
    }
  }

  return {
    model: settings.model || undefined,
    temperature: settings.temperature,
    messages: [
      { role: 'system', content: settings.systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  }
}

function extractLlmText(data: unknown) {
  const outputText = readPath(data, 'output_text')
  if (typeof outputText === 'string') return outputText

  const chatText = readPath(data, 'choices.0.message.content')
  if (typeof chatText === 'string') return chatText

  const output = typeof data === 'object' && data ? (data as Record<string, unknown>).output : undefined
  if (Array.isArray(output)) {
    for (const item of output) {
      const itemText = typeof item === 'object' && item ? (item as Record<string, unknown>).text : undefined
      if (typeof itemText === 'string') return itemText

      const content = typeof item === 'object' && item ? (item as Record<string, unknown>).content : undefined
      if (!Array.isArray(content)) continue
      for (const part of content) {
        const text = typeof part === 'object' && part ? (part as Record<string, unknown>).text : undefined
        if (typeof text === 'string') return text
        const outputText = typeof part === 'object' && part ? (part as Record<string, unknown>).output_text : undefined
        if (typeof outputText === 'string') return outputText
      }
    }
  }

  const content = typeof data === 'object' && data ? (data as Record<string, unknown>).content : undefined
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    for (const part of content) {
      if (typeof part === 'string') return part
      const text = typeof part === 'object' && part ? (part as Record<string, unknown>).text : undefined
      if (typeof text === 'string') return text
    }
  }

  const messageContent = readPath(data, 'message.content')
  if (typeof messageContent === 'string') return messageContent

  return undefined
}

function summarizeResponseShape(data: unknown) {
  if (!data || typeof data !== 'object') return typeof data
  const object = data as Record<string, unknown>
  const keys = Object.keys(object).slice(0, 12)
  const output = object.output
  if (Array.isArray(output)) {
    const outputTypes = output
      .slice(0, 5)
      .map((item) => typeof item === 'object' && item ? String((item as Record<string, unknown>).type ?? 'object') : typeof item)
      .join(', ')
    return `${keys.join(', ')}; output types: ${outputTypes}`
  }
  return keys.join(', ')
}

function normalizeVector(vector: number[], dimensions: number) {
  const sized = vector.slice(0, dimensions)
  while (sized.length < dimensions) {
    sized.push(0)
  }

  const norm = Math.sqrt(sized.reduce((sum, value) => sum + value * value, 0))
  if (!norm) return sized
  return sized.map((value) => Number((value / norm).toFixed(6)))
}

async function embedBySettings(input: string, settings?: EmbeddingSettings) {
  const activeSettings = settings ?? await readEmbeddingSettings()
  if (activeSettings.engine === 'custom-api') {
    return embedWithCustomApi(input, activeSettings)
  }

  return embedText(input)
}

function splitIntoChunks(body: string, size = 900, overlap = 120) {
  const sections = body
    .split(/\n(?=##?\s+)/)
    .map((section) => section.trim())
    .filter(Boolean)

  const sourceSections = sections.length ? sections : [body]
  const chunks: Array<{ heading: string; content: string }> = []

  for (const section of sourceSections) {
    const heading = section.match(/^#+\s+(.+)$/m)?.[1]?.trim() ?? 'Imported note'
    const clean = stripMarkdown(section)

    if (!clean) continue
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

async function readUserKnowledgeIndex() {
  try {
    const raw = await readFile(userKnowledgePath(), 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data.chunks) ? data.chunks : []
  } catch {
    return []
  }
}

async function writeUserKnowledgeIndex(chunks: unknown[]) {
  const settings = await readEmbeddingSettings()
  const filePath = userKnowledgePath()
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(
    filePath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        engine: embeddingEngineName(settings),
        dimensions: settings.dimensions || embeddingDimensions,
        chunks
      },
      null,
      2
    ),
    'utf8'
  )
}

async function importKnowledgeFiles() {
  const dialogOptions: OpenDialogOptions = {
    title: '导入 AI Play 知识资料',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Knowledge files', extensions: ['md', 'txt', 'pdf'] },
      { name: 'PDF', extensions: ['pdf'] },
      { name: 'Markdown', extensions: ['md'] },
      { name: 'Text', extensions: ['txt'] }
    ]
  }
  const result = mainWindow
    ? await dialog.showOpenDialog(mainWindow, dialogOptions)
    : await dialog.showOpenDialog(dialogOptions)

  if (result.canceled) {
    return { imported: 0, chunks: await readUserKnowledgeIndex() }
  }

  const existingChunks = await readUserKnowledgeIndex()
  const settings = await readEmbeddingSettings()
  const importedChunks: UserKnowledgeChunk[] = []

  for (const filePath of result.filePaths) {
    const fileName = path.basename(filePath)
    const raw = await readKnowledgeFile(filePath)
    const { metadata, body } = parseFrontmatter(raw, fileName)
    const chunks = splitIntoChunks(body)

    for (const [index, chunk] of chunks.entries()) {
      const id = `user-${Buffer.from(filePath).toString('base64url')}-${index + 1}`
      const sourceTitle = metadata.title ?? fileName.replace(/\.(md|txt|pdf)$/i, '')
      const embeddingText = [chunk.heading, sourceTitle, chunk.content].join('\n')
      importedChunks.push({
        id,
        title: chunk.heading,
        sourceTitle,
        source: metadata.source ?? filePath,
        license: metadata.license ?? 'user-provided',
        content: chunk.content,
        tags: ['user-import', sourceTitle],
        embedding: await embedBySettings(embeddingText, settings),
        embeddingEngine: embeddingEngineName(settings),
        dimensions: settings.dimensions || embeddingDimensions
      })
    }
  }

  const importedIds = new Set(importedChunks.map((chunk) => chunk.id))
  const nextChunks = [...existingChunks.filter((chunk: { id?: string }) => !importedIds.has(chunk.id ?? '')), ...importedChunks]
  await writeUserKnowledgeIndex(nextChunks)

  return { imported: importedChunks.length, chunks: nextChunks }
}

function createWindow() {
  Menu.setApplicationMenu(null)

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: `${appName} - 系统化学习 AI 技术`,
    icon: getAppIcon(),
    autoHideMenuBar: true,
    backgroundColor: '#0f1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  const url = process.env.VITE_DEV_SERVER_URL
  if (url) {
    mainWindow.loadURL(url)
    // 开发模式下不自动打开 DevTools，手动 F12 即可
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  ipcMain.handle('get-app-version', () => app.getVersion())
  ipcMain.handle('knowledge:list', async () => readUserKnowledgeIndex())
  ipcMain.handle('knowledge:import', async () => importKnowledgeFiles())
  ipcMain.handle('knowledge:clear', async () => {
    await writeUserKnowledgeIndex([])
    return []
  })
  ipcMain.handle('embedding:get-settings', async () => maskEmbeddingSettings(await readEmbeddingSettings()))
  ipcMain.handle('embedding:save-settings', async (_event, settings: Partial<EmbeddingSettings>) => saveEmbeddingSettings(settings))
  ipcMain.handle('embedding:test', async (_event, settings: Partial<EmbeddingSettings>) => {
    const saved = await saveEmbeddingSettings(settings)
    const fullSettings = await readEmbeddingSettings()
    const embedding = await embedBySettings('AI Play embedding connectivity test', fullSettings)
    return {
      ok: true,
      dimensions: embedding.length,
      engine: embeddingEngineName(fullSettings),
      settings: saved
    }
  })
  ipcMain.handle('embedding:query', async (_event, query: string) => {
    const settings = await readEmbeddingSettings()
    const embedding = await embedBySettings(query, settings)
    return {
      embedding,
      engine: embeddingEngineName(settings),
      dimensions: settings.dimensions || embedding.length
    }
  })
  ipcMain.handle('llm:get-settings', async () => maskLlmSettings(await readLlmSettings()))
  ipcMain.handle('llm:save-settings', async (_event, settings: Partial<LlmSettings>) => saveLlmSettings(settings))
  ipcMain.handle('llm:test', async (_event, settings: Partial<LlmSettings>) => {
    const saved = await saveLlmSettings(settings)
    const fullSettings = await readLlmSettings()
    const result = await testLlmConnection(fullSettings)
    return { ...result, settings: saved }
  })
  ipcMain.handle('llm:generate', async (_event, payload: { question: string; contexts: Array<{ title: string; source: string; content: string }> }) => {
    const settings = await readLlmSettings()
    const answer = await callLlm(settings, payload.question, payload.contexts)
    return { answer }
  })

  createWindow()
})

// 已有实例运行时，聚焦现有窗口
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
