const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  win.loadFile('index.html');
};

  app.on('ready', () => {
    createWindow();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });