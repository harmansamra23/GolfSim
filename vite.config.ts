import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom)[\\/]/,
              priority: 30,
              maxSize: 220_000,
            },
            {
              name: 'three-vendor',
              test: /node_modules[\\/]three[\\/]/,
              priority: 25,
              maxSize: 240_000,
            },
            {
              name: 'fiber-vendor',
              test: /node_modules[\\/]@react-three[\\/]/,
              priority: 20,
              maxSize: 220_000,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              priority: 10,
              maxSize: 220_000,
            },
          ],
        },
      },
    },
  },
})
