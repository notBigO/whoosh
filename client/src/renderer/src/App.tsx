import { useState, useEffect } from 'react'

function App() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!window.api) return

    window.api.getConnectionStatus().then(({ isConnected }) => setIsConnected(isConnected))

    const unsubscribe = window.api.onConnectionStatusUpdate(({ isConnected }) => {
      setIsConnected(isConnected)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="text-lg font-bold">Whoosh</h1>
        <div className={`status-indicator ${isConnected ? 'connected' : ''}`}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </header>
    </div>
  )
}

export default App
