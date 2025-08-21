import { defineConfig } from 'tsup'
export default defineConfig({
  entry: ['bin/cli.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false,
  minify: true,
  platform: 'node',
  target: 'node20',
  format: ['esm'],
  outDir: 'dist',
  shims: false,
})
