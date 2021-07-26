try {
  require('electron-reloader')(module)
} catch (_) { }

const { app, BrowserWindow, ipcMain, systemPreferences } = require('electron')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 800,
    minWidth: 500,
    minHeight: 800,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false
    },
  })

  console.log(systemPreferences.getMediaAccessStatus("microphone"));

  // and load the index.html of the app.
  mainWindow.loadFile('src/assets/index.html')
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