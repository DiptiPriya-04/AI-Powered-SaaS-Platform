import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import process from 'node:process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const hasClerkKey = env.VITE_CLERK_PUBLISHABLE_KEY && 
                      env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_') && 
                      !env.VITE_CLERK_PUBLISHABLE_KEY.includes('your_clerk')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: !hasClerkKey ? [
        { find: '@clerk/clerk-react', replacement: path.resolve(__dirname, 'src/lib/clerkMock.jsx') },
        { find: '@clerk/themes', replacement: path.resolve(__dirname, 'src/lib/clerkMock.jsx') }
      ] : []
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})

