/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@components', replacement: path.resolve(rootDir, 'src/components') },
      { find: '@ui', replacement: path.resolve(rootDir, 'src/components/common/ui') },
      { find: '@pages', replacement: path.resolve(rootDir, 'src/pages') },
      { find: '@hooks', replacement: path.resolve(rootDir, 'src/hooks') },
      { find: '@api', replacement: path.resolve(rootDir, 'src/api') },
      { find: '@utils', replacement: path.resolve(rootDir, 'src/utils') },
    ],
  },
  server: {
    proxy: {
      '/junkets': 'http://localhost:3000',
      '/days': 'http://localhost:3000',
      '/rooms': 'http://localhost:3000',
      '/slots': 'http://localhost:3000',
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
})
