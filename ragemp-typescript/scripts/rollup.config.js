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
      // Ensure necessary directories exist within client_packages
      jetpack.dir(`${buildOutput}/client_packages/html`);
      jetpack.dir(`${buildOutput}/client_packages/sound`);

      // Copy audio.html to client_packages/html/
      jetpack.copy(
        'src/client/modules/eletricista/audio.html', // Make sure this file exists or adjust path
        `${buildOutput}/client_packages/html/audio.html`, 
        { overwrite: true }
      );

      // Copy spark.wav to client_packages/sound/
      jetpack.copy(
        'src/client/modules/eletricista/spark.wav', // Make sure this file exists in source
        `${buildOutput}/client_packages/sound/spark.wav`, // Target path for WAV
        { overwrite: true }
      );

      // REMOVED MP3 copy
      /*
      jetpack.copy(
        'src/client/modules/eletricista/spark.mp3',
        `${buildOutput}/client_packages/sound/spark.mp3`, 
        { overwrite: true }
      );
      */

      console.log('[resource-copy] WAV Assets copied to client_packages');
    }
  };
}

function generateConfig({ isServer }) {
  const folder       = isServer ? 'server' : 'client';
  const tsConfigPath = resolvePath([sourcePath, folder, 'tsconfig.json']);
  const inputFile    = resolvePath([sourcePath, folder, 'index.ts']);
  const outputFile   = isServer
    ? resolvePath([buildOutput, 'packages', 'core', 'index.js']) // Server output path
    : resolvePath([buildOutput, 'client_packages', 'index.js']); // Client output path

  const external = isServer
    ? [...builtinModules, ...localDeps]
    : null; // Client bundles everything

  const plugins = [
    tsPaths({ tsConfigPath }),
    nodeResolve({ preferBuiltins: isServer }), // preferBuiltins only for server
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

    // Run resource copy only after client build is complete
    !isServer ? resourceCopyPlugin() : null
  ].filter(Boolean); // Filter out null plugins

  return {
    input: inputFile,
    output: {
      file: outputFile,
      format: 'cjs'
    },
    external,
    plugins,
    inlineDynamicImports: !isServer // Inline dynamic imports only for client
  };
}

export default [
  generateConfig({ isServer: true }),
  generateConfig({ isServer: false })
];

