import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const banner = `/*!
 * SweetAlert++ v${pkg.version}
 * ${pkg.description}
 * https://sweetalert-plus-plus.dev
 *
 * Copyright (c) ${new Date().getFullYear()}
 * Released under the MIT License
 */`;

const external = [];

const basePlugins = [
  resolve(),
  commonjs(),
];

const tsPlugin = typescript({
  tsconfig: './tsconfig.json',
  declaration: false,
  declarationMap: false,
});

const terserPlugin = terser({
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
  },
  format: {
    comments: /^!/,
  },
});

export default [
  // ESM build (tree-shakeable)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/sweetalert-plus-plus.esm.js',
      format: 'esm',
      banner,
      sourcemap: true,
    },
    external,
    plugins: [...basePlugins, tsPlugin],
  },

  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/sweetalert-plus-plus.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: [...basePlugins, tsPlugin],
  },

  // UMD build (for browsers via script tag)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/sweetalert-plus-plus.umd.js',
      format: 'umd',
      name: 'Swal',
      banner,
      sourcemap: true,
    },
    external,
    plugins: [...basePlugins, tsPlugin],
  },

  // UMD minified build (for CDN: unpkg, jsdelivr)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/sweetalert-plus-plus.min.js',
      format: 'umd',
      name: 'Swal',
      banner,
      sourcemap: true,
    },
    external,
    plugins: [...basePlugins, tsPlugin, terserPlugin],
  },

  // IIFE build (self-contained for direct browser use)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/sweetalert-plus-plus.iife.js',
      format: 'iife',
      name: 'Swal',
      banner,
      sourcemap: true,
    },
    external,
    plugins: [...basePlugins, tsPlugin, terserPlugin],
  },

  // Core-only ESM build (minimal, just modal)
  {
    input: 'src/core/modal.ts',
    output: {
      file: 'dist/core.esm.js',
      format: 'esm',
      banner,
      sourcemap: true,
    },
    external,
    plugins: [...basePlugins, tsPlugin],
  },

  // Core-only CJS build
  {
    input: 'src/core/modal.ts',
    output: {
      file: 'dist/core.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: [...basePlugins, tsPlugin],
  },

  // Toast-only ESM build
  {
    input: 'src/toast/toast.ts',
    output: {
      file: 'dist/toast.esm.js',
      format: 'esm',
      banner,
      sourcemap: true,
    },
    external,
    plugins: [...basePlugins, tsPlugin],
  },

  // Toast-only CJS build
  {
    input: 'src/toast/toast.ts',
    output: {
      file: 'dist/toast.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: [...basePlugins, tsPlugin],
  },

  // Theme-only ESM build
  {
    input: 'src/core/theme.ts',
    output: {
      file: 'dist/theme.esm.js',
      format: 'esm',
      banner,
      sourcemap: true,
    },
    external,
    plugins: [...basePlugins, tsPlugin],
  },

  // Theme-only CJS build
  {
    input: 'src/core/theme.ts',
    output: {
      file: 'dist/theme.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: [...basePlugins, tsPlugin],
  },
];
