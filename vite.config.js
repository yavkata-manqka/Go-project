import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // относителни пътища: сайтът работи на всеки безплатен хостинг
  base: './',
})
