import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias "fabric" to the ES module build found at fabric/dist/fabric.mjs
      fabric: fileURLToPath(new URL('fabric/dist/fabric.mjs', import.meta.url)),
    },
  },
})
