import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
          dest: ''
        }
      ]
    })
  ],
  server: {
    allowedHosts: ['bc36-93-173-24-133.ngrok-free.app'],
  },
})
