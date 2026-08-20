import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The CRM uses 5173 locally; the public template uses a separate origin so
  // iframe messaging and origin validation match production behavior.
  server: { port: 5174 },
})
