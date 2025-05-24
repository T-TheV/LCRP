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
    name: 'resource-copy-enhanced', // O nome do plugin pode ser o que você preferir
    writeBundle() {
      console.log('[Rollup] Iniciando cópia de assets para client_packages...');

      // Garante as pastas base que você já tinha (para outros módulos, se necessário)
      jetpack.dir(`${buildOutput}/client_packages/html`); // Para audio.html do eletricista
      // jetpack.dir(`${buildOutput}/client_packages/sound`); // Se você usa

      // Pasta específica para os arquivos HTML do XM Radio (você já tem essa linha, ótimo!)
      const xmRadioClientPackagesDir = `${buildOutput}/client_packages/xmradio`;
      jetpack.dir(xmRadioClientPackagesDir);
      console.log(`[Rollup] Diretório ${xmRadioClientPackagesDir} garantido.`);

      // --- ARQUIVOS DO XM RADIO A SEREM COPIADOS ---
      // !! IMPORTANTE: Verifique e ajuste os caminhos de ORIGEM (src) aqui !!
      const xmRadioFilesToCopy = [
        {
          src: 'src/client/modules/xmradio/xmradio.html', // Caminho do seu arquivo xmradio.html principal
          dest: `${xmRadioClientPackagesDir}/xmradio.html`
        },
        {
          src: 'src/client/modules/xmradio/audio_handler.html', // Caminho do seu novo audio_handler.html
          dest: `${xmRadioClientPackagesDir}/audio_handler.html`
        },
        {
          src: 'src/client/modules/xmradio/miniplayer.html', // Caminho do seu novo miniplayer.html
          dest: `${xmRadioClientPackagesDir}/miniplayer.html`
        }
      ];

      xmRadioFilesToCopy.forEach(file => {
        // Verifique se o caminho de origem (file.src) está correto para sua estrutura de projeto
        if (jetpack.exists(file.src)) {
          jetpack.copy(file.src, file.dest, { overwrite: true });
          console.log(`[Rollup] Copiado (XM Radio): ${file.src.split('/').pop()} -> ${file.dest}`);
        } else {
          console.error(`[Rollup] ERRO AO COPIAR (XM Radio): Arquivo de origem NÃO ENCONTRADO em ${file.src}`);
        }
      });
      // --- FIM DA SEÇÃO DO XM RADIO ---

      // Mantém a cópia de outros assets que você já tinha (ex: audio.html do eletricista)
      const eletricistaAudioSource = 'src/client/modules/eletricista/audio.html';
      const eletricistaAudioDest = `${buildOutput}/client_packages/html/audio.html`;
      if (jetpack.exists(eletricistaAudioSource)) {
        jetpack.copy(eletricistaAudioSource, eletricistaAudioDest, { overwrite: true });
        console.log(`[Rollup] Copiado (Outros): ${eletricistaAudioSource.split('/').pop()} -> ${eletricistaAudioDest}`);
      } else {
        console.log(`[Rollup] Arquivo (Outros): ${eletricistaAudioSource} não encontrado para cópia.`);
      }
      
      console.log('[Rollup] Cópia de assets para client_packages finalizada.');
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
