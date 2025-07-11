import { BrowserWindow, Tray, nativeImage, app } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import { EventEmitter } from 'events'
import { APP_CONFIG } from '../constants/config'

export class WindowService extends EventEmitter {
  private tray: Tray | null = null
  private mainWindow: BrowserWindow | null = null

  async initialize(): Promise<void> {
    this.createWindow()
    this.createTray()
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: APP_CONFIG.WINDOW.WIDTH,
      height: APP_CONFIG.WINDOW.HEIGHT,
      show: false, // start hidden
      frame: APP_CONFIG.WINDOW.FRAME,
      resizable: APP_CONFIG.WINDOW.RESIZABLE,
      fullscreenable: APP_CONFIG.WINDOW.FULLSCREENABLE,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.mjs'),
        sandbox: false
      }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    // Hide the window when it loses focus
    this.mainWindow.on('blur', () => {
      this.mainWindow?.hide()
    })

    this.mainWindow.webContents.on('did-finish-load', () => {
      this.emit('windowReady')
    })
  }

  private createTray(): void {
    const iconPath = path.join(__dirname, '../../assets/icon.png')
    const icon = nativeImage.createFromPath(iconPath)
    this.tray = new Tray(icon)

    this.tray.on('click', () => {
      this.toggleWindow()
    })
  }

  private toggleWindow(): void {
    if (this.mainWindow?.isVisible()) {
      this.mainWindow.hide()
    } else {
      this.showWindow()
    }
  }

  private showWindow(): void {
    if (!this.tray || !this.mainWindow) return

    const trayBounds = this.tray.getBounds()
    const windowBounds = this.mainWindow.getBounds()

    // Position the window right below the tray icon
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
    const y = Math.round(trayBounds.y + trayBounds.height)

    this.mainWindow.setPosition(x, y, false)
    this.mainWindow.show()
    this.mainWindow.focus()
  }

  sendToRenderer(channel: string, data: any): void {
    this.mainWindow?.webContents.send(channel, data)
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  destroy(): void {
    this.mainWindow?.destroy()
    this.tray?.destroy()
    this.mainWindow = null
    this.tray = null
  }
}
