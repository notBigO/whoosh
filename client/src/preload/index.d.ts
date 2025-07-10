import { ElectronAPI } from '@electron-toolkit/preload'

interface CustomAPI {
  getConnectionStatus: () => Promise<{ isConnected: boolean }>
  onConnectionStatusUpdate: (callback: (status: { isConnected: boolean }) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
