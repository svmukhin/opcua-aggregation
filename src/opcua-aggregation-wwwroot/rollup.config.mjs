import nodeResolve from "@rollup/plugin-node-resolve";
import commonJs from "@rollup/plugin-commonjs";
import typeScript from "@rollup/plugin-typescript";

export default {
  input: "./src/app.ts",
  output: {
    file: "./wwwroot/js/app.bundle.js",
    format: "iife",
  },
  plugins: [nodeResolve(), commonJs(), typeScript()],
};
