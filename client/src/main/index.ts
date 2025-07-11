import { app } from 'electron'
import { WhooshApp } from './app'

// Configure platform-specific settings before app initialization
WhooshApp.configurePlatformSpecificSettings()

let whooshApp: WhooshApp

app.whenReady().then(async () => {
  try {
    whooshApp = new WhooshApp()
    whooshApp.setupAppEventListeners()
    await whooshApp.initialize()
  } catch (error) {
    console.error('Failed to start Whoosh application:', error)
    app.quit()
  }
})

process.on('SIGTERM', async () => {
  if (whooshApp) {
    await whooshApp.shutdown()
  }
  process.exit(0)
})

process.on('SIGINT', async () => {
  if (whooshApp) {
    await whooshApp.shutdown()
  }
  process.exit(0)
})
