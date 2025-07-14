import { Libp2p } from 'libp2p'
import { peerIdFromString } from '@libp2p/peer-id'
import { createNode, WHOOSH_PROTOCOL, BOOTSTRAP_PEERS } from '../libp2p/node'
import { EventEmitter } from 'events'
import * as os from 'os'
import { APP_CONFIG } from '../constants/config'

export interface PeerInfo {
  id: string
  name: string
}

export interface ConnectionStatus {
  isConnected: boolean
}

export class NetworkService extends EventEmitter {
  private libp2pNode: Libp2p | null = null
  private isConnectedToBootstrap = false
  private bootstrapPeerId = peerIdFromString(BOOTSTRAP_PEERS[0].split('/p2p/')[1])
  private clientPeerIds = new Set<string>()

  async initialize(): Promise<void> {
    try {
      this.libp2pNode = await createNode()
      console.log('libp2p node started:', this.libp2pNode.peerId.toString())

      this.setupEventListeners()
    } catch (error) {
      console.error('❌ Failed to start libp2p node:', error)
      throw error
    }
  }

  private setupEventListeners(): void {
    if (!this.libp2pNode) return

    this.libp2pNode.addEventListener('peer:connect', this.handlePeerConnect.bind(this)) // for backend connection
    this.libp2pNode.addEventListener('peer:discovery', this.handlePeerDiscovery.bind(this)) // for discovering other non bootstrap peers (whoosh clients)
    this.libp2pNode.addEventListener('peer:identify', this.handlePeerIdentify.bind(this)) // to connect to whoosh clients
    this.libp2pNode.addEventListener('peer:disconnect', this.handlePeerDisconnect.bind(this)) // well, to disconnect
  }

  private async handlePeerConnect(evt: any): Promise<void> {
    const connectedPeerId = evt.detail

    if (connectedPeerId.equals(this.bootstrapPeerId)) {
      await this.performBackendHandshake(connectedPeerId)
    } else {
      console.log(`Connected to peer: ${connectedPeerId.toString()}`)
    }
  }

  private async handlePeerDiscovery(evt: any): Promise<void> {
    const discoveredPeerId = evt.detail.id
    const discoveredIdStr = discoveredPeerId.toString()

    if (
      !this.clientPeerIds.has(discoveredIdStr) &&
      !discoveredPeerId.equals(this.bootstrapPeerId)
    ) {
      try {
        console.log('Dialing discovered peer: ', discoveredIdStr)
        await this.libp2pNode?.dial(discoveredPeerId)
        this.clientPeerIds.add(discoveredIdStr)
      } catch (error) {
        console.error(`Failed to connect to discovered peer ${discoveredIdStr}:`, error)
      }
    }
  }

  private async performBackendHandshake(peerId: any): Promise<void> {
    try {
      const stream = await this.libp2pNode?.dialProtocol(peerId, WHOOSH_PROTOCOL)

      if (stream) {
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        const handshakeMessage = `Hello from Whoosh Client - ${os.hostname}`
        // Send handshake message
        await stream.sink([encoder.encode(handshakeMessage)])

        // Read the response
        try {
          const response = await stream.source.next()
          if (!response.done && response.value) {
            const responseText = decoder.decode(response.value.subarray())
            console.log('Received handshake response:', responseText)

            this.isConnectedToBootstrap = true
            this.emit('connectionStatusUpdate', { isConnected: true })
          }
        } catch (error) {
          console.log('Handshake sent, backend acknowledged (stream closed): ', error)
          this.isConnectedToBootstrap = false
          this.emit('connectionStatusUpdate', { isConnected: false })
        }

        await stream.close()
      }
    } catch (error) {
      console.error('❌ Handshake failed:', error)
      this.isConnectedToBootstrap = false
      this.emit('connectionStatusUpdate', { isConnected: false })
    }
  }

  private async handlePeerIdentify(evt: any): Promise<void> {
    const { peerId, protocols, agentVersion } = evt.detail
    const peerIdStr = peerId.toString()

    if (!protocols.includes(WHOOSH_PROTOCOL)) {
      console.log(`Skipping peer ${peerIdStr} — does not support WHOOSH_PROTOCOL`)
      return
    }

    if (!peerId.equals(this.bootstrapPeerId)) {
      // Avoid redundant handshakes (client peers handshaking with each other)
      if (this.libp2pNode && this.libp2pNode.peerId.toString() < peerIdStr) {
        await this.performClientHandshake(peerId)
      }

      this.emit('peerFound', {
        id: peerIdStr,
        name: agentVersion || 'Unknown Device'
      })
    }
  }

  private async performClientHandshake(peerId: any): Promise<void> {
    try {
      const stream = await this.libp2pNode?.dialProtocol(peerId, WHOOSH_PROTOCOL)

      if (stream) {
        const encoder = new TextEncoder()

        // Send handshake message
        await stream.sink([
          encoder.encode(`Hello from ${os.hostname() || 'Unknown'} - Whoosh client!`)
        ])

        await stream.close()
      }
    } catch (error) {
      console.error(`Failed to handshake with client ${peerId.toString()}:`, error)
    }
  }

  private handlePeerDisconnect(evt: any): void {
    const disconnectedPeerId = evt.detail

    if (disconnectedPeerId.equals(this.bootstrapPeerId)) {
      console.log('Disconnected from backend server.')
      this.isConnectedToBootstrap = false
      this.emit('connectionStatusUpdate', { isConnected: false })

      // Attempt to reconnect after a delay
      this.scheduleReconnect()
    } else {
      console.log(`Client disconnected: ${disconnectedPeerId.toString()}`)
      this.emit('peerDisconnected', { id: disconnectedPeerId.toString() })
    }
  }

  private scheduleReconnect(): void {
    setTimeout(async () => {
      try {
        console.log('Attempting to reconnect to backend server...')

        await this.libp2pNode?.dial(this.bootstrapPeerId)
        console.log('Reconnection attempt completed')
      } catch (error) {
        console.log('Reconnection failed, will retry again later:', error)
      }
    }, APP_CONFIG.NETWORK.RECONNECT_DELAY)
  }

  getConnectionStatus(): ConnectionStatus {
    return { isConnected: this.isConnectedToBootstrap }
  }

  getPeerId(): string {
    return this.libp2pNode ? this.libp2pNode.peerId.toString() : 'Initializing...'
  }

  async shutdown(): Promise<void> {
    if (this.libp2pNode) {
      await this.libp2pNode.stop()
      this.libp2pNode = null
    }
  }
}
