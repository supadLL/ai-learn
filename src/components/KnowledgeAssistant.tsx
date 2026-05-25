import { useEffect, useMemo, useState } from 'react'
import type { KnowledgeChunk, KnowledgeHit } from '../knowledge/localRag'
import {
  buildKnowledgeChunks,
  composeGroundedAnswer,
  defaultEmbeddingEngine,
  embedText,
  loadBundledKnowledge,
  searchKnowledge
} from '../knowledge/localRag'
import { knowledgeSources } from '../knowledge/sourceCatalog'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  hits?: KnowledgeHit[]
}

export default function KnowledgeAssistant() {
  const builtInChunks = useMemo(() => buildKnowledgeChunks(), [])
  const [bundledChunks, setBundledChunks] = useState<KnowledgeChunk[]>([])
  const [userChunks, setUserChunks] = useState<KnowledgeChunk[]>([])
  const [indexStatus, setIndexStatus] = useState('加载中')
  const [userStatus, setUserStatus] = useState('未导入')
  const [embeddingStatus, setEmbeddingStatus] = useState('离线引擎')
  const [llmStatus, setLlmStatus] = useState('未配置')
  const [input, setInput] = useState('RAG 和微调什么时候分别使用？')
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'hello',
      role: 'assistant',
      content: '配置好 LLM 后，可以像聊天一样提问。我会先检索本地知识库，再把引用片段交给 LLM 生成回答。'
    }
  ])
  const [settings, setSettings] = useState<EmbeddingSettingsView>({
    engine: 'feature-hash',
    endpoint: '',
    apiKey: '',
    model: '',
    dimensions: 256,
    headersJson: '',
    responsePath: 'data.0.embedding'
  })
  const [llmSettings, setLlmSettings] = useState<LlmSettingsView>({
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
  })

  const chunks = useMemo(
    () => [...builtInChunks, ...bundledChunks, ...userChunks],
    [builtInChunks, bundledChunks, userChunks]
  )

  useEffect(() => {
    let alive = true

    loadBundledKnowledge().then((loaded) => {
      if (!alive) return
      setBundledChunks(loaded)
      setIndexStatus(loaded.length ? `内置 ${loaded.length}` : '仅课程')
    })

    window.electronAPI?.listKnowledge().then((loaded) => {
      if (!alive) return
      const chunks = normalizeImportedChunks(loaded)
      setUserChunks(chunks)
      setUserStatus(chunks.length ? `用户 ${chunks.length}` : '未导入')
    })

    window.electronAPI?.getEmbeddingSettings().then((loaded) => {
      if (!alive) return
      setSettings(loaded)
      setEmbeddingStatus(loaded.engine === 'custom-api' ? '自定义 API' : '离线引擎')
    })

    window.electronAPI?.getLlmSettings().then((loaded) => {
      if (!alive) return
      setLlmSettings(loaded)
      setLlmStatus(loaded.endpoint ? '已配置' : '未配置')
    })

    return () => {
      alive = false
    }
  }, [])

  async function retrieve(question: string) {
    const queryEmbeddings: Record<string, number[]> = {
      [defaultEmbeddingEngine]: embedText(question)
    }

    if (settings.engine === 'custom-api' && window.electronAPI?.embedQuery) {
      const remote = await window.electronAPI.embedQuery(question)
      queryEmbeddings[remote.engine] = remote.embedding
      setEmbeddingStatus(`自定义 API · ${remote.dimensions}维`)
    }

    return searchKnowledge(chunks, question, 5, queryEmbeddings)
  }

  async function sendMessage() {
    const question = input.trim()
    if (!question || isThinking) return

    setInput('')
    setIsThinking(true)
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question
    }
    setMessages((current) => [...current, userMessage])

    try {
      const hits = await retrieve(question)
      let content = composeGroundedAnswer(question, hits)

      if (window.electronAPI?.generateRagAnswer && llmSettings.endpoint) {
        setLlmStatus('生成中')
        const contexts = hits.slice(0, 5).map((hit) => ({
          title: hit.title,
          source: hit.source,
          content: hit.content.slice(0, 1200)
        }))
        const result = await window.electronAPI.generateRagAnswer({ question, contexts })
        content = result.answer
        setLlmStatus('回答已生成')
      } else if (!llmSettings.endpoint) {
        setLlmStatus('未配置，已返回检索摘要')
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content,
          hits
        }
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成失败'
      setLlmStatus(message)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `生成失败：${message}`
        }
      ])
    } finally {
      setIsThinking(false)
    }
  }

  async function importKnowledge() {
    if (!window.electronAPI?.importKnowledge) {
      setUserStatus('请在桌面 App 中使用')
      return
    }

    setUserStatus('导入中')
    const result = await window.electronAPI.importKnowledge()
    const chunks = normalizeImportedChunks(result.chunks)
    setUserChunks(chunks)
    setUserStatus(result.imported ? `新增 ${result.imported}` : chunks.length ? `用户 ${chunks.length}` : '未导入')
  }

  async function clearKnowledge() {
    if (!window.electronAPI?.clearKnowledge) {
      setUserStatus('请在桌面 App 中使用')
      return
    }

    const chunks = await window.electronAPI.clearKnowledge()
    setUserChunks(normalizeImportedChunks(chunks))
    setUserStatus('已清空')
  }

  async function saveSettings() {
    if (!window.electronAPI?.saveEmbeddingSettings) {
      setEmbeddingStatus('请在桌面 App 中使用')
      return
    }

    const saved = await window.electronAPI.saveEmbeddingSettings(settings)
    setSettings(saved)
    setEmbeddingStatus(saved.engine === 'custom-api' ? '已保存自定义 API' : '已保存离线引擎')
  }

  async function testSettings() {
    if (!window.electronAPI?.testEmbedding) {
      setEmbeddingStatus('请在桌面 App 中使用')
      return
    }

    try {
      setEmbeddingStatus('测试中')
      const result = await window.electronAPI.testEmbedding(settings)
      setSettings(result.settings)
      setEmbeddingStatus(`${result.engine} · ${result.dimensions}维可用`)
    } catch (error) {
      setEmbeddingStatus(error instanceof Error ? error.message : '测试失败')
    }
  }

  async function saveLlmSettings() {
    if (!window.electronAPI?.saveLlmSettings) {
      setLlmStatus('请在桌面 App 中使用')
      return
    }

    const saved = await window.electronAPI.saveLlmSettings(llmSettings)
    setLlmSettings(saved)
    setLlmStatus(saved.endpoint ? '已保存' : '未配置')
  }

  async function testLlmSettings() {
    if (!window.electronAPI?.testLlm) {
      setLlmStatus('请在桌面 App 中使用')
      return
    }

    try {
      setLlmStatus('测试中')
      const result = await window.electronAPI.testLlm(llmSettings)
      setLlmSettings(result.settings)
      setLlmStatus(result.ok ? 'LLM 连接成功' : '测试失败')
    } catch (error) {
      setLlmStatus(error instanceof Error ? error.message : '测试失败')
    }
  }

  return (
    <section className="rag-assistant chat-assistant">
      <div className="rag-assistant__header">
        <div>
          <span>本地知识库</span>
          <h3>RAG 学习助手</h3>
        </div>
        <strong>{chunks.length} chunks · {indexStatus} · {userStatus}</strong>
      </div>

      <div className="assistant-toolbar">
        <details>
          <summary>LLM 配置 · {llmStatus}</summary>
          {renderLlmConfig(llmSettings, setLlmSettings, saveLlmSettings, testLlmSettings)}
        </details>
        <details>
          <summary>Emb 引擎 · {embeddingStatus}</summary>
          {renderEmbeddingConfig(settings, setSettings, saveSettings, testSettings)}
        </details>
      </div>

      <div className="rag-actions">
        <button type="button" onClick={importKnowledge}>导入资料</button>
        <button type="button" onClick={clearKnowledge}>清空用户资料</button>
      </div>

      <div className="chat-thread" aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={`chat-message chat-message--${message.role}`}>
            <div className="chat-bubble">
              <span>{message.role === 'user' ? '你' : 'AI Play'}</span>
              <p>{message.content}</p>
            </div>
            {message.hits && message.hits.length > 0 && (
              <details className="chat-citations">
                <summary>引用片段 · {message.hits.length}</summary>
                {message.hits.map((hit, index) => (
                  <div key={hit.id}>
                    <strong>[{index + 1}] {hit.title}</strong>
                    <small>{hit.source} · {(hit.score * 100).toFixed(0)}</small>
                  </div>
                ))}
              </details>
            )}
          </article>
        ))}
        {isThinking && (
          <article className="chat-message chat-message--assistant">
            <div className="chat-bubble">
              <span>AI Play</span>
              <p>正在检索知识库并生成回答...</p>
            </div>
          </article>
        )}
      </div>

      <div className="chat-composer">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              sendMessage()
            }
          }}
          rows={3}
          placeholder="问一个 AI 学习问题..."
        />
        <button type="button" onClick={sendMessage} disabled={isThinking || !input.trim()}>
          {isThinking ? '生成中' : '发送'}
        </button>
      </div>

      <details className="source-drawer">
        <summary>资料目录 · {knowledgeSources.length}</summary>
        <div>
          {knowledgeSources.slice(0, 5).map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
              <strong>{source.title}</strong>
              <small>{source.license} · {source.ingestionMode}</small>
            </a>
          ))}
        </div>
      </details>
    </section>
  )
}

function renderEmbeddingConfig(
  settings: EmbeddingSettingsView,
  setSettings: (settings: EmbeddingSettingsView) => void,
  saveSettings: () => void,
  testSettings: () => void
) {
  return (
    <>
      <div className="embedding-grid">
        <label>
          <span>模式</span>
          <select
            value={settings.engine}
            onChange={(event) => setSettings({ ...settings, engine: event.target.value as EmbeddingSettingsView['engine'] })}
          >
            <option value="feature-hash">离线 fallback</option>
            <option value="custom-api">自定义 API</option>
          </select>
        </label>
        <label>
          <span>维度</span>
          <input
            type="number"
            min="1"
            value={settings.dimensions}
            onChange={(event) => setSettings({ ...settings, dimensions: Number(event.target.value) })}
          />
        </label>
        <label className="wide">
          <span>Endpoint</span>
          <input
            value={settings.endpoint}
            onChange={(event) => setSettings({ ...settings, endpoint: event.target.value })}
            placeholder="https://api.openai.com/v1/embeddings"
          />
        </label>
        <label>
          <span>Model</span>
          <input
            value={settings.model}
            onChange={(event) => setSettings({ ...settings, model: event.target.value })}
            placeholder="text-embedding-3-small"
          />
        </label>
        <label>
          <span>API Key</span>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(event) => setSettings({ ...settings, apiKey: event.target.value })}
            placeholder={settings.hasApiKey ? '已保存，留空则沿用' : 'Bearer token'}
          />
        </label>
        <label className="wide">
          <span>响应路径</span>
          <input
            value={settings.responsePath}
            onChange={(event) => setSettings({ ...settings, responsePath: event.target.value })}
            placeholder="data.0.embedding"
          />
        </label>
      </div>
      <div className="embedding-actions">
        <button type="button" onClick={saveSettings}>保存配置</button>
        <button type="button" onClick={testSettings}>测试 API</button>
      </div>
    </>
  )
}

function renderLlmConfig(
  llmSettings: LlmSettingsView,
  setLlmSettings: (settings: LlmSettingsView) => void,
  saveLlmSettings: () => void,
  testLlmSettings: () => void
) {
  return (
    <>
      <div className="embedding-grid">
        <label className="wide">
          <span>Endpoint</span>
          <input
            value={llmSettings.endpoint}
            onChange={(event) => setLlmSettings({ ...llmSettings, endpoint: event.target.value })}
            placeholder="https://api.openai.com/v1/chat/completions"
          />
        </label>
        <label>
          <span>Wire API</span>
          <select
            value={llmSettings.wireApi}
            onChange={(event) => {
              const wireApi = event.target.value as LlmSettingsView['wireApi']
              setLlmSettings({
                ...llmSettings,
                wireApi,
                responsePath: wireApi === 'responses' ? 'output_text' : 'choices.0.message.content'
              })
            }}
          >
            <option value="chat_completions">chat/completions</option>
            <option value="responses">responses</option>
          </select>
        </label>
        <label>
          <span>Model</span>
          <input
            value={llmSettings.model}
            onChange={(event) => setLlmSettings({ ...llmSettings, model: event.target.value })}
            placeholder="gpt-4.1-mini"
          />
        </label>
        <label>
          <span>Reasoning effort</span>
          <select
            value={llmSettings.reasoningEffort}
            onChange={(event) => setLlmSettings({ ...llmSettings, reasoningEffort: event.target.value })}
          >
            <option value="">none</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>
        <label>
          <span>API Key</span>
          <input
            type="password"
            value={llmSettings.apiKey}
            onChange={(event) => setLlmSettings({ ...llmSettings, apiKey: event.target.value })}
            placeholder={llmSettings.hasApiKey ? '已保存，留空则沿用' : 'Bearer token'}
          />
        </label>
        <label className="wide">
          <span>固定系统提示词</span>
          <textarea
            value={llmSettings.systemPrompt}
            onChange={(event) => setLlmSettings({ ...llmSettings, systemPrompt: event.target.value })}
            rows={6}
          />
        </label>
      </div>
      <div className="embedding-actions">
        <button type="button" onClick={saveLlmSettings}>保存 LLM</button>
        <button type="button" onClick={testLlmSettings}>测试 LLM</button>
      </div>
    </>
  )
}

function normalizeImportedChunks(chunks: unknown[]): KnowledgeChunk[] {
  return chunks
    .filter((chunk): chunk is Record<string, unknown> => Boolean(chunk) && typeof chunk === 'object')
    .map((chunk) => ({
      id: `user-${String(chunk.id ?? crypto.randomUUID())}`,
      title: String(chunk.title ?? 'Imported chunk'),
      source: String(chunk.sourceTitle ?? chunk.source ?? '用户知识库'),
      type: 'book',
      content: String(chunk.content ?? ''),
      tags: Array.isArray(chunk.tags) ? chunk.tags.map(String) : ['user-import'],
      url: typeof chunk.source === 'string' && chunk.source.startsWith('http') ? chunk.source : undefined,
      license: String(chunk.license ?? 'user-provided'),
      embedding: Array.isArray(chunk.embedding) ? chunk.embedding.map(Number) : undefined,
      embeddingEngine: String(chunk.embeddingEngine ?? defaultEmbeddingEngine),
      dimensions: Number(chunk.dimensions ?? 256)
    }))
}
