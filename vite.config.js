import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const host = env.VITE_FRONTEND_HOST || '127.0.0.1'
  const port = parseInt(env.VITE_PORT || '5173', 10)

  return {
    plugins: [react()],
    server: {
      host,
      port,
      strictPort: false,
    },
  }
})
