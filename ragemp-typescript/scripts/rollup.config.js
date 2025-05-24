import jetpack        from 'fs-jetpack';
import path           from 'path';
import { config }     from 'dotenv';
import nodeResolve    from '@rollup/plugin-node-resolve';
import { swc }        from 'rollup-plugin-swc3';
import json           from '@rollup/plugin-json';
import commonjs       from '@rollup/plugin-commonjs';
import tsPaths        from 'rollup-plugin-tsconfig-paths';
import typescript     from 'rollup-plugin-typescript2';
import { terser }     from 'rollup-plugin-terser';
import builtinModules from 'builtin-modules';

config({ path: path.resolve('.env') });

const buildOutput   = 'dist';
const sourcePath    = path.resolve('src');
const pkgJson       = jetpack.read('package.json', 'json');
const localDeps     = Object.keys(pkgJson.dependencies);
const isProduction  = process.env.PRODUCTION_MODE === 'true';
const useSWC        = process.env.COMPILER_USE_SWC === 'true';

function resolvePath(parts) {
  return jetpack.path(...parts);
}

const terserPlugin = isProduction && !useSWC
  ? terser({ keep_classnames: true, keep_fnames: true, output: { comments: false } })
  : [];

function resourceCopyPlugin() {
  return {
    name: 'resource-copy',
    writeBundle() {
      // Garante as pastas necessárias em client_packages
      jetpack.dir(`${buildOutput}/client_packages/html`);
      jetpack.dir(`${buildOutput}/client_packages/sound`);

      // Copia audio.html do eletricista
      jetpack.copy(
        'src/client/modules/eletricista/audio.html',
        `${buildOutput}/client_packages/html/audio.html`, 
        { overwrite: true }
      );

      // Copia clipboard.html do coords
      jetpack.copy(
        'src/client/modules/coords/html/clipboard.html',
        `${buildOutput}/client_packages/html/clipboard.html`,
        { overwrite: true }
      );

      // Copia spark.wav do eletricista
      jetpack.copy(
        'src/client/modules/eletricista/spark.wav',
        `${buildOutput}/client_packages/sound/spark.wav`,
        { overwrite: true }
      );

      console.log('[resource-copy] Assets copiados para client_packages (audio.html, clipboard.html, spark.wav)');
    }
  };
}

function generateConfig({ isServer }) {
  const folder       = isServer ? 'server' : 'client';
  const tsConfigPath = resolvePath([sourcePath, folder, 'tsconfig.json']);
  const inputFile    = resolvePath([sourcePath, folder, 'index.ts']);
  const outputFile   = isServer
    ? resolvePath([buildOutput, 'packages', 'core', 'index.js'])
    : resolvePath([buildOutput, 'client_packages', 'index.js']);

  const external = isServer
    ? [...builtinModules, ...localDeps]
    : null;

  const plugins = [
    tsPaths({ tsConfigPath }),
    nodeResolve({ preferBuiltins: isServer }),
    json(),
    commonjs(),
    useSWC
      ? swc({
          tsconfig: tsConfigPath,
          minify: isProduction,
          jsc: {
            target: 'es2020',
            parser: { syntax: 'typescript', dynamicImport: true, decorators: true },
            transform: { legacyDecorator: true, decoratorMetadata: true },
            externalHelpers: true,
            keepClassNames: true,
            loose: true
          }
        })
      : typescript({ tsconfig: tsConfigPath, check: false }),
    terserPlugin,
    !isServer ? resourceCopyPlugin() : null
  ].filter(Boolean);

  return {
    input: inputFile,
    output: {
      file: outputFile,
      format: 'cjs'
    },
    external,
    plugins,
    inlineDynamicImports: !isServer
  };
}

export default [
  generateConfig({ isServer: true }),
  generateConfig({ isServer: false })
];
