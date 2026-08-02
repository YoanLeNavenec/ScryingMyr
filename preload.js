const path = require('path')
const { contextBridge, ipcRenderer} = require('electron')
const { importDeckList } = require(path.join(__dirname, 'src', 'import'))
const { exportDeckList } = require(path.join(__dirname, 'src', 'export'))
const { isBanned } = require(path.join(__dirname, 'src', 'banlist'))
const { meetsCompanionRequirement } = require(path.join(__dirname, 'src', 'companion'))

contextBridge.exposeInMainWorld('electronAPI', {
  saveMessage: (conversationId, message) => ipcRenderer.invoke('save-message', { conversationId, message}),
  loadConversation: (conversationId) => ipcRenderer.invoke('load-conversation', conversationId),
  newConversation: () => ipcRenderer.invoke('new-conversation'),
  listConversations: () => ipcRenderer.invoke('list-conversations'),
  checkFirstLaunch: () => ipcRenderer.invoke('check-first-launch'),
  importDeck: (text, format) => importDeckList(text, format),
  exportDeck: (deck) => exportDeckList(deck),
  lookupCard: (cardName) => ipcRenderer.invoke('lookup-card', cardName),
  searchCards: (query) => ipcRenderer.invoke('search-cards', query),
  getBanlist: (cardName, format, category) => isBanned(cardName, format, category),
  findCompanion: (deck, companionName) => meetsCompanionRequirement(deck, companionName)
})