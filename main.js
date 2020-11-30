try {
  require('electron-reloader')(module)
} catch (_) { }

const { app, BrowserWindow, ipcMain, systemPreferences } = require('electron')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    //transparent: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  mainWindow.show()

  ipcMain.on('minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('toggleMaximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on('quit', () => {
    mainWindow.close()
  })
}

app.whenReady().then(createWindow)