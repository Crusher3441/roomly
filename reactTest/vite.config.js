import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Minimal Vite config. The React plugin enables JSX + Fast Refresh during development.
export default defineConfig({
  plugins: [react()],
})
