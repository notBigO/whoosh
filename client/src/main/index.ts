import { app, Tray, BrowserWindow, nativeImage, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import { createNode } from './libp2p/node'

// declaring in global scope so they aren't garbage collected when 'createWindow' function finishes.
let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null

let isConnected = false

async function startLibp2p() {
  try {
    const libp2pNode = await createNode()
    console.log('libp2p node started:', libp2pNode.peerId.toString())

    // Notify renderer about initial connection state
    if (mainWindow?.webContents?.isLoading()) {
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow?.webContents.send('connection-status-update', { isConnected })
      })
    } else {
      mainWindow?.webContents.send('connection-status-update', { isConnected })
    }

    // Update status on peer connect
    libp2pNode.addEventListener('peer:connect', () => {
      isConnected = true
      if (mainWindow?.webContents?.isLoading()) {
        mainWindow.webContents.once('did-finish-load', () => {
          mainWindow?.webContents.send('connection-status-update', { isConnected })
        })
      } else {
        mainWindow?.webContents.send('connection-status-update', { isConnected })
      }
    })

    // Update status on peer disconnect
    libp2pNode.addEventListener('peer:disconnect', () => {
      isConnected = false
      mainWindow?.webContents.send('connection-status-update', { isConnected })
    })
  } catch (error) {
    console.error('Failed to start libp2p node:', error)
  }
}

// function to create the main popup window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 320,
    height: 480,
    show: false, // start hidden

    frame: false, // show now title bar, etc
    resizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  // load the index.html of the app
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Hide the window when it loses focus (when the user clicks away)
  mainWindow.on('blur', () => {
    mainWindow?.hide()
  })
}

// to create the tray icon
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../../assets/icon.png'))
  tray = new Tray(icon)

  tray.on('click', () => {
    toggleWindow()
  })
}

// to toggle window show
const toggleWindow = () => {
  if (mainWindow?.isVisible()) {
    mainWindow.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  if (!tray || !mainWindow) return

  const trayBounds = tray?.getBounds()
  const windowBounds = mainWindow?.getBounds()

  // Position the window right below the tray icon
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
  const y = Math.round(trayBounds.y + trayBounds.height)

  mainWindow.setPosition(x, y, false)
  mainWindow.show()
  mainWindow.focus()
}

app.whenReady().then(async () => {
  ipcMain.handle('get-connection-status', () => {
    return { isConnected }
  })

  createWindow()
  createTray()

  await startLibp2p()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// prevent the app from appearing in the dock on MACOS
if (process.platform === 'darwin' && app.dock) {
  app.dock.hide()
}

// quit when windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
