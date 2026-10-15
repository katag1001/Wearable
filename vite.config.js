import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    // Client code shared with the mobile app (context/mobile-app-plan.md).
    alias: {
      '@core': fileURLToPath(new URL('./core', import.meta.url))
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
