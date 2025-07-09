import { peerIdFromPrivateKey } from '@libp2p/peer-id'
import { keys } from '@libp2p/crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { app } from 'electron'

export async function loadOrCreatePeerId() {
  const peerIdPath = path.join(app.getPath('userData'), 'whoosh_peer_id.key')

  try {
    // check if file exists and load it
    const keyBytes = await fs.readFile(peerIdPath)
    const privateKey = keys.privateKeyFromProtobuf(keyBytes)
    console.log(`Loaded existing PeerId from ${peerIdPath}`)
    return peerIdFromPrivateKey(privateKey)
  } catch (error: unknown) {
    // if existing file not found, create a new one
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log(`Generating new PeerId at ${peerIdPath}`)
      const privateKey = await keys.generateKeyPair('Ed25519')
      const privateKeyBytes = keys.privateKeyToProtobuf(privateKey)

      await fs.mkdir(path.dirname(peerIdPath), { recursive: true })
      await fs.writeFile(peerIdPath, privateKeyBytes)

      return peerIdFromPrivateKey(privateKey)
    }
    throw error
  }
}
