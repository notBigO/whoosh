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

    this.libp2pNode.addEventListener('peer:connect', this.handlePeerConnect.bind(this))
    this.libp2pNode.addEventListener('peer:identify', this.handlePeerIdentify.bind(this))
    this.libp2pNode.addEventListener('peer:disconnect', this.handlePeerDisconnect.bind(this))
  }

  private async handlePeerConnect(evt: any): Promise<void> {
    const connectedPeerId = evt.detail
    const bootstrapPeerId = peerIdFromString(BOOTSTRAP_PEERS[0].split('/p2p/')[1])

    if (connectedPeerId.equals(bootstrapPeerId)) {
      await this.performBackendHandshake(connectedPeerId)
    } else {
      console.log(`Connected to peer: ${connectedPeerId.toString()}`)
    }
  }

  private async performBackendHandshake(peerId: any): Promise<void> {
    try {
      console.log('Initiating handshake with backend...')
      const stream = await this.libp2pNode?.dialProtocol(peerId, WHOOSH_PROTOCOL)

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

            this.isConnectedToBootstrap = true
            this.emit('connectionStatusUpdate', { isConnected: true })
          }
        } catch (readError) {
          console.log('Handshake sent, backend acknowledged (stream closed)')
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
    const bootstrapPeerId = peerIdFromString(BOOTSTRAP_PEERS[0].split('/p2p/')[1])

    // We only care about other Whoosh clients, not random DHT nodes
    if (protocols.includes(WHOOSH_PROTOCOL)) {
      console.log(`Identified Whoosh peer: ${peerId.toString()} as ${agentVersion}`)

      // Don't try to handshake with the backend server again
      if (!peerId.equals(bootstrapPeerId)) {
        await this.performClientHandshake(peerId)

        // Only emit peer found for actual clients (not the backend server)
        this.emit('peerFound', {
          id: peerId.toString(),
          name: agentVersion || 'Unknown Device'
        })
      }
      // Backend server is identified but not added to peer list for UI
    }
  }

  private async performClientHandshake(peerId: any): Promise<void> {
    console.log(`Attempting handshake with Whoosh client: ${peerId.toString()}`)

    try {
      const stream = await this.libp2pNode?.dialProtocol(peerId, WHOOSH_PROTOCOL)

      if (stream) {
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()

        // Send handshake message
        await stream.sink([
          encoder.encode(`Hello from ${os.hostname() || 'Unknown'} - Whoosh client!`)
        ])
        console.log(`Sent handshake to client: ${peerId.toString()}`)

        // Read the response
        try {
          const response = await stream.source.next()
          if (!response.done && response.value) {
            const responseText = decoder.decode(response.value.subarray())
            console.log(`Client handshake response: ${responseText}`)
          }
        } catch (readError) {
          console.log(`Client handshake completed with ${peerId.toString()}`)
        }

        await stream.close()
      }
    } catch (error) {
      console.error(`Failed to handshake with client ${peerId.toString()}:`, error)
    }
  }

  private handlePeerDisconnect(evt: any): void {
    const disconnectedPeerId = evt.detail
    const bootstrapPeerId = peerIdFromString(BOOTSTRAP_PEERS[0].split('/p2p/')[1])

    if (disconnectedPeerId.equals(bootstrapPeerId)) {
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
        const bootstrapPeerId = peerIdFromString(BOOTSTRAP_PEERS[0].split('/p2p/')[1])
        await this.libp2pNode?.dial(bootstrapPeerId)
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
