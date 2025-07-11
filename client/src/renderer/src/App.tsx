import { useState, useEffect } from 'react'

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [peers, setPeers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (!window.api) return

    window.api.getConnectionStatus().then(({ isConnected }) => setIsConnected(isConnected))

    const unsubscribeStatus = window.api.onConnectionStatusUpdate(({ isConnected }) => {
      setIsConnected(isConnected)
    })

    //@ts-ignore
    const unsubscribePeer = window.api.onPeerFound((peer) => {
      setPeers((prev) => {
        // Avoid duplicates
        if (prev.some((p) => p.id === peer.id)) return prev
        return [...prev, peer]
      })
    })

    return () => {
      unsubscribeStatus()
      unsubscribePeer()
    }
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="text-lg font-bold">Whoosh</h1>
        <div className={`status-indicator ${isConnected ? 'connected' : ''}`}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </header>

      <main className="px-4 mt-4">
        <h2 className="text-sm font-semibold mb-2">Peers on your network:</h2>
        <ul className="text-sm">
          {peers.length === 0 && <li className="text-gray-500">No peers found yet.</li>}
          {peers.map((peer) => (
            <li key={peer.id}>
              {peer.name} <span className="text-xs text-gray-400">({peer.id.slice(0, 8)}…)</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export default App
