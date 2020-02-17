import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
// import camelCase from 'lodash.camelcase'
// import typescript from 'rollup-plugin-typescript'
import typescript2 from 'rollup-plugin-typescript2'
import renameExtensions from '@betit/rollup-plugin-rename-extensions'
import json from 'rollup-plugin-json'

const pkg = require('./package.json')

const libraryName = 'audiosynth2'

// https://github.com/rollup/rollup/issues/2688
export default {
  // input: {
  //   [pkg.module]: `src/index.ts`,
  //   'audiosynth2': `src/audiosynth2.ts`,
  //   'karplus-strong': `src/karplus-strong.ts`,
  // },
  // input: [
  // `src/index.ts`,
  // `src/audiosynth2.ts`,
  // `src/karplus-strong.ts`,
  // ],
  input: `src/index.ts`,
  // manualChunks: {
  //   [pkg.module]: `src/index.ts`,
  //   'audiosynth2': `src/audiosynth2.ts`,
  //   'karplus-strong': `src/karplus-strong.ts`,
  // },
  // output: [
  //   // { file: pkg.main, name: camelCase(libraryName), format: 'umd', sourcemap: true },
  //   { file: pkg.module, format: 'esm', sourcemap: true },
  // ],
  output: {
    // entryFileNames: '[name].js',
    dir: 'dist/esm',
    // entryFileNames: '[name].mjs',

    // entryFileNames: '[name]-[hash].js',
    // chunkFileNames: '[name]-[hash].js',
    // esModule: true,
    // chunkNames: '[name].mjs',
    format: 'esm',
    sourcemap: true,
  },
  // output: {
  //   dir: 'dist',
  //   format: 'es',
  //   sourcemap: true,
  // },
  preserveModules: true,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    // typescript({ module: 'CommonJS' }),
    typescript2({ useTsconfigDeclarationDir: true }),
    renameExtensions({
      include: ['**/*.ts'],
      mappings: {
          '.ts': '.js',
      },
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
}
