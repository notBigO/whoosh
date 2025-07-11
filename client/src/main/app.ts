import { app, BrowserWindow } from 'electron'
import { NetworkService } from './services/networkService'
import { WindowService } from './services/windowService'
import { IpcService } from './services/ipcService'

export class WhooshApp {
  private networkService: NetworkService
  private windowService: WindowService
  private ipcService: IpcService

  constructor() {
    this.networkService = new NetworkService()
    this.windowService = new WindowService()
    this.ipcService = new IpcService(this.networkService, this.windowService)
  }

  async initialize(): Promise<void> {
    try {
      await this.windowService.initialize()
      this.ipcService.initialize()
      await this.networkService.initialize()

      console.log('Whoosh application initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Whoosh application:', error)
      throw error
    }
  }

  setupAppEventListeners(): void {
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open
      if (BrowserWindow.getAllWindows().length === 0) {
        this.windowService.initialize()
      }
    })

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('before-quit', async () => {
      await this.shutdown()
    })
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Whoosh application...')

    try {
      await this.networkService.shutdown()
      this.ipcService.destroy()
      this.windowService.destroy()
    } catch (error) {
      console.error('Error during shutdown:', error)
    }
  }

  static configurePlatformSpecificSettings(): void {
    // Prevent the app from appearing in the dock on macOS
    if (process.platform === 'darwin' && app.dock) {
      app.dock.hide()
    }
  }
}
