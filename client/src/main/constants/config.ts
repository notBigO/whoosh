export const APP_CONFIG = {
  WINDOW: {
    WIDTH: 320,
    HEIGHT: 480,
    FRAME: false,
    RESIZABLE: false,
    FULLSCREENABLE: false
  },

  NETWORK: {
    WHOOSH_PROTOCOL: '/whoosh/client-hello/1.0',
    MDNS_INTERVAL: 5000,
    MDNS_SERVICE_TAG: 'whoosh-local',
    RECONNECT_DELAY: 3000
  },

  BOOTSTRAP_PEERS: [
    '/ip4/13.235.69.64/tcp/4002/ws/p2p/12D3KooWNQGVjxg7k2CqiqMSd6pcu2dNjpKaZJh5nc3vNkAdrCp5'
  ]
}

export const IPC_CHANNELS = {
  GET_CONNECTION_STATUS: 'get-connection-status',
  GET_PEER_ID: 'get-peer-id',
  CONNECTION_STATUS_UPDATE: 'connection-status-update',
  PEER_FOUND: 'peer-found',
  PEER_DISCONNECTED: 'peer-disconnected',
  PEER_ID_UPDATE: 'peer-id-update'
} as const
