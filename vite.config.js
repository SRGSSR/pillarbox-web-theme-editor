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
        replacement: __dirname + '/node_modules/monaco-editor/esm/vs/editor/editor.api'
      }
    ]
  },
  optimizeDeps: {
    exclude: ['sass']
  },
  base: './'
});
