import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// base relativa: o build funciona em qualquer pasta, inclusive no GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
})
