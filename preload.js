const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveMessage: (conversationId, message) => ipcRenderer.invoke('save-message', { conversationId, message}),
  loadConversation: (conversationId) => ipcRenderer.invoke('load-conversation', conversationId),
  newConversation: () => ipcRenderer.invoke('new-conversation'),
  listConversations: () => ipcRenderer.invoke('list-conversations'),
  checkFirstLaunch: () => ipcRenderer.invoke('check-first-launch')
})