const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs')
const path = require ('path')
let cleanCardsCache = null

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });
  win.loadFile('index.html');
};

  app.on('ready', () => {
    const userDataPath = app.getPath('userData')
    const conversationsPath = path.join(userDataPath, 'conversations')
    if (!fs.existsSync(conversationsPath)) {
        fs.mkdirSync(conversationsPath, { recursive: true })
    };

    createWindow();

    ipcMain.handle('load-conversation', (event, conversationId) => {
      const filePath = path.join(conversationsPath, `${conversationId}.json`)
      if (!fs.existsSync(filePath)) return []
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    });

    ipcMain.handle('save-message', (event, {conversationId, message}) => {
      const filePath = path.join(conversationsPath, `${conversationId}.json`)
      let conversation = []
      if (fs.existsSync(filePath)) {
        conversation = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      }
      conversation.push(message)
      fs.writeFileSync(filePath, JSON.stringify(conversation))
      return true
    })

    ipcMain.handle('new-conversation', () => {
      const conversationId = Date.now().toString()
      return conversationId
    })

    ipcMain.handle('list-conversations', () => {
      if (!fs.existsSync(conversationsPath)) return []
      return fs.readdirSync(conversationsPath)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()
    })

    ipcMain.handle('check-first-launch', () => {
      const filePath = path.join(userDataPath, 'userdata.json')
      if (!fs.existsSync(filePath)){
        fs.writeFileSync(filePath, JSON.stringify({onboarding_complete: false}))
        return true
      } else {
        return false
      }
    })

ipcMain.handle('lookup-card', (event, cardName) => {
    const cleanCardsPath = path.join(__dirname, 'data', 'cleanCards.json')
    if (!fs.existsSync(cleanCardsPath)) return null

    if (!cleanCardsCache) {
        cleanCardsCache = JSON.parse(fs.readFileSync(cleanCardsPath, 'utf8'))
    }

    const normalize = name => name.toLowerCase()
    .replace(/\s*\/\/?\s*/g, '/')
    .replace(/_+/g, '_')
    const normalizedInput = normalize(cardName)

    return cleanCardsCache.find(c => {
        if (!c.name) return false
        // exact match
        if (normalize(c.name) === normalizedInput) return true
        // front face match for double-faced/adventure cards
        if (normalize(c.name).startsWith(normalizedInput + '/')) return true
        return false
    }) || null
})
});
  
  app.on('window-all-closed', () => {
    app.quit();
  }
);