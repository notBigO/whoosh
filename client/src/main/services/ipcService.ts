import { ipcMain } from 'electron'
import { NetworkService, ConnectionStatus } from './networkService'
import { WindowService } from './windowService'
import { IPC_CHANNELS } from '../constants/config'

export class IpcService {
  constructor(
    private networkService: NetworkService,
    private windowService: WindowService
  ) {}

  initialize(): void {
    this.setupIpcHandlers()
    this.setupNetworkEventListeners()
  }

  private setupIpcHandlers(): void {
    ipcMain.handle(IPC_CHANNELS.GET_CONNECTION_STATUS, this.handleGetConnectionStatus.bind(this))
    ipcMain.handle(IPC_CHANNELS.GET_PEER_ID, this.handleGetPeerId.bind(this))
  }

  private setupNetworkEventListeners(): void {
    this.networkService.on('connection-status-update', this.handleConnectionStatusUpdate.bind(this))
    this.networkService.on('peer-found', this.handlePeerFound.bind(this))
    this.networkService.on('peer-disconnected', this.handlePeerDisconnected.bind(this))

    this.windowService.on('windowReady', this.handleWindowReady.bind(this))
  }

  private handleGetConnectionStatus(): ConnectionStatus {
    return this.networkService.getConnectionStatus()
  }

  private handleGetPeerId(): string {
    return this.networkService.getPeerId()
  }

  private handleConnectionStatusUpdate(status: ConnectionStatus): void {
    this.windowService.sendToRenderer(IPC_CHANNELS.CONNECTION_STATUS_UPDATE, status)
  }

  private handlePeerFound(peer: { id: string; name: string }): void {
    this.windowService.sendToRenderer(IPC_CHANNELS.PEER_FOUND, peer)
  }

  private handlePeerDisconnected(peer: { id: string }): void {
    this.windowService.sendToRenderer(IPC_CHANNELS.PEER_DISCONNECTED, peer)
  }

  private handleWindowReady(): void {
    // Send initial state when window is ready
    const connectionStatus = this.networkService.getConnectionStatus()
    const peerId = this.networkService.getPeerId()

    this.windowService.sendToRenderer(IPC_CHANNELS.CONNECTION_STATUS_UPDATE, connectionStatus)
    this.windowService.sendToRenderer(IPC_CHANNELS.PEER_ID_UPDATE, peerId)
  }

  destroy(): void {
    ipcMain.removeAllListeners(IPC_CHANNELS.GET_CONNECTION_STATUS)
    ipcMain.removeAllListeners(IPC_CHANNELS.GET_PEER_ID)
  }
}
