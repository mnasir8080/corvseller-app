//vite.renderer.config.mjs
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { pluginExposeRenderer } from './vite.base.config.mjs';
import { fileURLToPath } from 'url';
import Inspector from 'vite-plugin-vue-inspector';
import VueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig((env) => {
  const forgeEnv = env;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';
  const isDev = mode === 'development';

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
      assetsInlineLimit: 0,
      sourcemap: isDev,
      minify: !isDev,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const extType = info[info.length - 1];
            
            // Special handling for Material Icons fonts
            if (assetInfo.name.includes('MaterialIcons-Regular')) {
              return `assets/fonts/[name][extname]`;
            }
            
            // Handle other asset types
            if (/\.(woff2?|ttf|eot|otf)$/.test(assetInfo.name)) {
              return `assets/fonts/[name][extname]`;
            }
            
            return `assets/[name]-[hash][extname]`;
          },
          manualChunks: isDev ? undefined : {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'ui-vendor': ['bootstrap'],
          }
        }
      }
    },
    plugins: [
      vue(),
      pluginExposeRenderer(name),
      isDev && Inspector({
        toggleButtonVisibility: 'always'
      }),
      isDev && VueDevTools(),
    ].filter(Boolean),
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      }
    },
    server: isDev ? {
      hmr: {
        overlay: true,
        port: 24678,
      },
      watch: {
        ignored: ['**/dist/**', '**/out/**', '**/.vite/**'],
        usePolling: true,
      },
      host: true,
      port: 3000,
      strictPort: true,
      cors: true,
    } : undefined,
    optimizeDeps: {
      include: [
        'vue',
        'pinia',
        'bootstrap',
      ],
      exclude: ['electron'],
    },
    css: {
      devSourcemap: isDev,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/styles/variables.scss";`
        }
      }
    },
    publicDir: 'public',
    experimental: {
      renderBuiltUrl(filename, { hostType, type, hostId }) {
        // Handle font files specifically
        if (filename.includes('MaterialIcons-Regular')) {
          return { relative: true };
        }
        return { relative: true };
      }
    },
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      target: 'es2020',
    },
    clearScreen: false,
    logLevel: isDev ? 'info' : 'error',
    stats: isDev ? 'verbose' : false,
  };
});
// import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue';
// import { pluginExposeRenderer } from './vite.base.config.mjs';
// import { fileURLToPath } from 'url';

// export default defineConfig((env) => {
//   const forgeEnv = env;
//   const { root, mode, forgeConfigSelf } = forgeEnv;
//   const name = forgeConfigSelf.name ?? '';

//   return {
//     root,
//     mode,
//     base: './',
//     build: {
//       outDir: `.vite/renderer/${name}`,
//       assetsInlineLimit: 4096,
//       rollupOptions: {
//         output: {
//           assetFileNames: (assetInfo) => {
//             if (assetInfo.name.endsWith('.woff2') || 
//                 assetInfo.name.endsWith('.woff')) {
//               return 'assets/fonts/[name][extname]';
//             }
//             return 'assets/[name]-[hash][extname]';
//           }
//         }
//       }
//     },
//     plugins: [vue(), pluginExposeRenderer(name)],
//     resolve: {
//       preserveSymlinks: true,
//       alias: {
//         '@': fileURLToPath(new URL('./src', import.meta.url))
//       }
//     },
//     clearScreen: false,
//   };
// });

