import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages'te site /seyahat-rehberi/ alt yolunda yayınlanır; Vercel'de kök dizinde.
export default defineConfig({
  base: process.env.GH_PAGES ? '/seyahat-rehberi/' : '/',
  plugins: [react()],
});
