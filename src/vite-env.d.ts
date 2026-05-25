/// <reference types="vite/client" />

interface ElectronAPI {
  getAppVersion: () => Promise<string>
  listKnowledge: () => Promise<unknown[]>
  importKnowledge: () => Promise<{ imported: number; chunks: unknown[] }>
  clearKnowledge: () => Promise<unknown[]>
  getEmbeddingSettings: () => Promise<EmbeddingSettingsView>
  saveEmbeddingSettings: (settings: Partial<EmbeddingSettingsView> & { apiKey?: string }) => Promise<EmbeddingSettingsView>
  testEmbedding: (settings: Partial<EmbeddingSettingsView> & { apiKey?: string }) => Promise<{
    ok: boolean
    dimensions: number
    engine: string
    settings: EmbeddingSettingsView
  }>
  embedQuery: (query: string) => Promise<{ embedding: number[]; engine: string; dimensions: number }>
  getLlmSettings: () => Promise<LlmSettingsView>
  saveLlmSettings: (settings: Partial<LlmSettingsView> & { apiKey?: string }) => Promise<LlmSettingsView>
  testLlm: (settings: Partial<LlmSettingsView> & { apiKey?: string }) => Promise<{
    ok: boolean
    answer: string
    responseShape?: string
    settings: LlmSettingsView
  }>
  generateRagAnswer: (payload: {
    question: string
    contexts: Array<{ title: string; source: string; content: string }>
  }) => Promise<{ answer: string }>
  platform: string
}

interface Window {
  electronAPI?: ElectronAPI
}

interface EmbeddingSettingsView {
  engine: 'feature-hash' | 'custom-api'
  endpoint: string
  apiKey: string
  hasApiKey?: boolean
  model: string
  dimensions: number
  headersJson: string
  responsePath: string
}

interface LlmSettingsView {
  endpoint: string
  apiKey: string
  hasApiKey?: boolean
  model: string
  headersJson: string
  responsePath: string
  temperature: number
  systemPrompt: string
  wireApi: 'chat_completions' | 'responses'
  reasoningEffort: string
}
