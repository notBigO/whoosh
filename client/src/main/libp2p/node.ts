/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { kadDHT } from '@libp2p/kad-dht'
import { mdns } from '@libp2p/mdns'
import { identify } from '@libp2p/identify'
import { ping } from '@libp2p/ping'
import * as os from 'os'

import { loadOrCreatePeerId } from '../utils/loadcreate-peerid'
import { APP_CONFIG } from '../constants/config'

export const { WHOOSH_PROTOCOL } = APP_CONFIG.NETWORK
export const { BOOTSTRAP_PEERS } = APP_CONFIG

export async function createNode() {
  // Load or create a persistent private key (peerId)
  const { privateKey } = await loadOrCreatePeerId()

  // Get device name for identification
  const deviceName = `Whoosh-${os.hostname() || 'Unknown'}`

  // Create a libp2p host
  const node = await createLibp2p({
    privateKey,
    nodeInfo: {
      userAgent: deviceName
    },
    transports: [webSockets()],
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0/ws']
    },
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    peerDiscovery: [
      bootstrap({
        list: BOOTSTRAP_PEERS
      }),
      mdns({
        interval: APP_CONFIG.NETWORK.MDNS_INTERVAL,
        serviceTag: APP_CONFIG.NETWORK.MDNS_SERVICE_TAG
      })
    ],
    services: {
      identify: identify(),
      ping: ping(),
      dht: kadDHT({
        clientMode: true
      })
    }
  })

  node.handle(WHOOSH_PROTOCOL, ({ stream }) => {
    handleClientConnection(stream)
  })

  return node
}

async function handleClientConnection(stream: any) {
  try {
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()

    // Read the handshake message
    const response = await stream.source.next()
    if (!response.done && response.value) {
      const message = decoder.decode(response.value.subarray())
      console.log('Received message from client peer:', message)

      // Send a response back
      const reply = `Hello from ${os.hostname() || 'Unknown'} - ready for file sharing!`
      await stream.sink([encoder.encode(reply)])
      console.log('Sent response to client peer')
    }

    await stream.close()
  } catch (error) {
    console.error('Error handling client connection:', error)
  }
}
