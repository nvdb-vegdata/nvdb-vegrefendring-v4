import { defineConfig } from 'vite';

export default defineConfig({
    base: '/nvdb-vegrefendring-v4/',
    root: 'src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
});