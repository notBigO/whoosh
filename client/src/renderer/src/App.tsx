import { useState, useEffect } from 'react'

function App() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsConnected(true)
    }, 2000)
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
