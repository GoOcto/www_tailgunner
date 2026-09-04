import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: "./",
  envDir: ".",
  build: {
    outDir: 'dist',
  },
});
