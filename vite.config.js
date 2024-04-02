import { defineConfig } from 'vite';

/**
 * Vite configuration file.
 *
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      reportOnFailure: true,
    },
    alias: [
      {
        find: /^monaco-editor$/,
        replacement: __dirname + '/node_modules/monaco-editor/esm/vs/editor/editor.api',
      },
      {
        find: /^@srgssr\/pillarbox-web$/,
        replacement: __dirname + '/node_modules/@srgssr/pillarbox-web/dist/pillarbox.es.js',
      }
    ],
  },
  base: './'
});
