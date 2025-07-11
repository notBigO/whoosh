import { app, Tray, BrowserWindow, nativeImage, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import { bootstrapPeers, createNode } from './libp2p/node'
import { Libp2p } from 'libp2p'
import { peerIdFromString } from '@libp2p/peer-id'

// declaring in global scope so they aren't garbage collected when 'createWindow' function finishes.
let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let libp2pNode: Libp2p | null = null
let isConnectedToBootstrap = false

const WHOOSH_PROTOCOL = '/whoosh/client-hello/1.0'

async function startLibp2p() {
  try {
    libp2pNode = await createNode()
    console.log('libp2p node started:', libp2pNode.peerId.toString())

    libp2pNode.addEventListener('peer:connect', async (evt) => {
      const connectedPeerId = evt.detail
      const bootstrapPeerId = peerIdFromString(bootstrapPeers[0].split('/p2p/')[1])

      if (connectedPeerId.equals(bootstrapPeerId)) {
        try {
          console.log('Initiating handshake with backend...')
          const stream = await libp2pNode?.dialProtocol(connectedPeerId, WHOOSH_PROTOCOL)

          if (stream) {
            const encoder = new TextEncoder()
            const decoder = new TextDecoder()

            // Send handshake message
            await stream.sink([encoder.encode('Hello from Whoosh Client')])
            console.log('Sent handshake message to backend')

            // Read the response
            try {
              const response = await stream.source.next()
              if (!response.done && response.value) {
                const responseText = decoder.decode(response.value.subarray())
                console.log('Received handshake response:', responseText)
                console.log('Handshake completed successfully')

                isConnectedToBootstrap = true
                mainWindow?.webContents.send('connection-status-update', { isConnected: true })
              }
            } catch (readError) {
              console.log('Handshake sent, backend acknowledged (stream closed)')
              isConnectedToBootstrap = false
              mainWindow?.webContents.send('connection-status-update', { isConnected: false })
            }

            await stream?.close()
          }
        } catch (error) {
          console.error('❌ Handshake failed:', error)
          isConnectedToBootstrap = false
          mainWindow?.webContents.send('connection-status-update', { isConnected: false })
        }
      } else {
        console.log(`(Ignoring connection to random peer: ${connectedPeerId.toString()})`)
      }
    })

    libp2pNode.addEventListener('peer:disconnect', (evt) => {
      const disconnectedPeerId = evt.detail
      const bootstrapPeerId = peerIdFromString(bootstrapPeers[0].split('/p2p/')[1])

      // ONLY update the UI if we have disconnected from our specific backend server.
      if (disconnectedPeerId.equals(bootstrapPeerId)) {
        console.log('Disconnected from backend server.')
        isConnectedToBootstrap = false
        mainWindow?.webContents.send('connection-status-update', { isConnected: false })

        // Attempt to reconnect after a delay
        setTimeout(async () => {
          try {
            console.log('Attempting to reconnect to backend server...')

            await libp2pNode?.dial(bootstrapPeerId)
            console.log('Reconnection attempt completed')
          } catch (error) {
            console.log('Reconnection failed, will retry again later:', error)
          }
        }, 3000)
      }
    })

    // send inital state to renderer (UI)
    mainWindow?.webContents.on('did-finish-load', () => {
      mainWindow?.webContents.send('connection-status-update', {
        isConnected: isConnectedToBootstrap
      })
      //@ts-ignore
      mainWindow?.webContents.send('peer-id-update', libp2pNode.peerId.toString())
    })
  } catch (error) {
    console.error('❌ Failed to start libp2p node:', error)
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
    return { isConnected: isConnectedToBootstrap }
  })

  ipcMain.handle('get-peer-id', () => {
    return libp2pNode ? libp2pNode.peerId.toString() : 'Initializing...'
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
