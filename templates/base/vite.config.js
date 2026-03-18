import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const readFile = (filePath) => fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
  const componentTemplates = {
    head: './src/components/head.html',
    header: './src/components/header.html',
    footer: './src/components/footer.html',
  };
  const readInjectData = () => Object.fromEntries(
    Object.entries(componentTemplates).map(([key, filePath]) => [key, readFile(filePath)])
  );
  const htmlIncludesPlugin = () => ({
    name: 'html-includes',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const injectData = readInjectData();
        return html
          .replaceAll('<%- head %>', injectData.head)
          .replaceAll('<%- header %>', injectData.header)
          .replaceAll('<%- footer %>', injectData.footer);
      },
    },
    handleHotUpdate({ file, server }) {
      const normalized = file.split(path.sep).join('/');
      if (!normalized.endsWith('.html') || !normalized.includes('/src/components/')) {
        return;
      }
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  });

  const pageNames = fs.readdirSync(__dirname)
    .filter((file) => file.endsWith('.html') && !file.startsWith('_'))
    .map((file) => file.replace('.html', ''));

  const pageInputs = Object.fromEntries(
    pageNames.map((page) => [page, path.resolve(__dirname, `${page}.html`)])
  );

  return {
    plugins: [
      htmlIncludesPlugin(),
    ],
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import', 'global-builtin', 'if-function', 'color-functions'],
        },
      },
    },
    build: {
      assetsInlineLimit: 0,
      outDir: 'dist',
      emptyOutDir: true,
      manifest: false,
      rollupOptions: {
        input: pageInputs,
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith('.css')) return 'style.css';
            if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].some((ext) => assetInfo.name.toLowerCase().endsWith(ext))) {
              return 'img/[name][extname]';
            }
            return 'js/[name][extname]';
          },
          entryFileNames: 'js/[name].js',
          chunkFileNames: 'js/[name].js',
          format: 'es',
        },
      },
      assetsDir: '',
      cssCodeSplit: false,
      minify: 'esbuild',
      sourcemap: false,
      write: true,
      copyPublicDir: true,
    },
  };
});
