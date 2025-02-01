import nodeResolve from '@rollup/plugin-node-resolve';
import commonJs from '@rollup/plugin-commonjs';
import typeScript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import mv from 'rollup-plugin-mv';
import tailwindcss from '@tailwindcss/postcss';
import { di } from '@wessberg/di-compiler';

export default {
  input: './src/main.ts',
  output: {
    file: './wwwroot/js/app.bundle.js',
    format: 'iife',
  },
  plugins: [
    nodeResolve(),
    commonJs(),
    typeScript({ transformers: (program) => di({ program }) }),
    postcss({
      extract: 'styles.css',
      plugins: [tailwindcss()],
    }),
    mv([
      {
        src: 'wwwroot/js/styles.css',
        dest: 'wwwroot/css/styles.css',
        overwrite: true,
      },
    ]),
  ],
};
