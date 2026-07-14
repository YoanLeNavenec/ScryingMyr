const path = require('path')
const { contextBridge, ipcRenderer} = require('electron')
const { importDeckList } = require(path.join(__dirname, 'src', 'import'))
const { exportDeckList } = require(path.join(__dirname, 'src', 'export'))

contextBridge.exposeInMainWorld('electronAPI', {
  saveMessage: (conversationId, message) => ipcRenderer.invoke('save-message', { conversationId, message}),
  loadConversation: (conversationId) => ipcRenderer.invoke('load-conversation', conversationId),
  newConversation: () => ipcRenderer.invoke('new-conversation'),
  listConversations: () => ipcRenderer.invoke('list-conversations'),
  checkFirstLaunch: () => ipcRenderer.invoke('check-first-launch'),
  importDeck: (text, format) => importDeckList(text, format),
  exportDeck: (deck) => exportDeckList(deck)
})