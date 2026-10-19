import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), {
    name: 'watch-editorial-content',
    configureServer(server) {
      let timer: ReturnType<typeof setTimeout>;
      server.watcher.on('all', (_event, file) => {
        const relative = path.relative(process.cwd(), file);
        if (!relative.endsWith('.md') || relative.startsWith('..') || /(^|\/)(node_modules|dist|\.)/.test(relative)) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          try { execFileSync(process.execPath, ['scripts/build-content.js'], { stdio: 'inherit' }); }
          catch { server.config.logger.error('Falha ao regenerar o conteúdo.'); }
        }, 150);
      });
      server.httpServer?.once('close', () => clearTimeout(timer));
    },
  }],
  build: { outDir: 'dist', sourcemap: false, manifest: true },
});
