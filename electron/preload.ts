import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  listKnowledge: () => ipcRenderer.invoke('knowledge:list'),
  importKnowledge: () => ipcRenderer.invoke('knowledge:import'),
  clearKnowledge: () => ipcRenderer.invoke('knowledge:clear'),
  getEmbeddingSettings: () => ipcRenderer.invoke('embedding:get-settings'),
  saveEmbeddingSettings: (settings: unknown) => ipcRenderer.invoke('embedding:save-settings', settings),
  testEmbedding: (settings: unknown) => ipcRenderer.invoke('embedding:test', settings),
  embedQuery: (query: string) => ipcRenderer.invoke('embedding:query', query),
  getLlmSettings: () => ipcRenderer.invoke('llm:get-settings'),
  saveLlmSettings: (settings: unknown) => ipcRenderer.invoke('llm:save-settings', settings),
  testLlm: (settings: unknown) => ipcRenderer.invoke('llm:test', settings),
  generateRagAnswer: (payload: unknown) => ipcRenderer.invoke('llm:generate', payload),
  platform: process.platform
})
