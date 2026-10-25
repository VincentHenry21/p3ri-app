import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Project-page hosting on GitHub Pages (https://<user>.github.io/p3ri-app/).
  // Change to '/' for a custom domain or user site.
  base: '/p3ri-app/',
})
