import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { kadDHT } from '@libp2p/kad-dht'
import { mdns } from '@libp2p/mdns'
import { identify } from '@libp2p/identify'
import { ping } from '@libp2p/ping'

import { loadOrCreatePeerId } from '../utils/loadcreate-peerid'

const bootstrapPeers = [
  '/ip4/127.0.0.1/tcp/4002/ws/p2p/12D3KooWR13zPWFWff6uBDqJY74da8NSR2yVmYqYW1WgGLhQ8nfy'
]

export async function createNode() {
  console.log('Creating libp2p node...')
  console.log('Bootstrap peers:', bootstrapPeers)

  // load or create a persistent private key (peerId)
  const { privateKey } = await loadOrCreatePeerId()

  // create a libp2p host
  const node = await createLibp2p({
    privateKey,
    transports: [webSockets()],
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0/ws']
    },
    connectionEncrypters: [noise()],
    streamMuxers: [
      yamux() // multiplex streams over a single connection
    ],
    peerDiscovery: [
      bootstrap({
        list: bootstrapPeers
      }),
      mdns() // for discovering peers on same local network
    ],
    services: {
      identify: identify(),
      ping: ping(),
      dht: kadDHT({
        clientMode: true
      }) // DHT service for peer discovery and content routing
    }
  })

  return node
}
