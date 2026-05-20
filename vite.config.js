import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SmartCoach',
        short_name: 'SmartCoach',
        description: 'Athlete management and motivation platform',
        theme_color: '#1D9E75',
        background_color: '#f5f5f3',
        display: 'standalone',
        icons: []
      }
    })
  ]
})