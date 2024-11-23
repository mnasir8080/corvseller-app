const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  packagerConfig: {
    name: "Corvseller",
    executableName: "Corvseller",
    asar: true,
    icon: path.join(__dirname, 'src/assets/icon'),
    prune: true,
    ignore: [
      /^\/(?!dist|assets|package\.json)/,
      /\.map$/,
      /\.git/,
      /\.vscode/,
      /\.idea/,
      "forge.config.js",
      ".gitignore",
      "README.md",
      // Ignore development-only packages in production
      isDev ? '' : '/node_modules/electron-devtools-installer/',
      isDev ? '' : '/node_modules/vue-devtools/',
    ].filter(Boolean),
    overwrite: true,
    appBundleId: "corvseller.appspot.com",
    appCategoryType: "corvseller.appspot.com",
    win32metadata: {
      CompanyName: "Corvid Integrated Services LTD",
      FileDescription: "Your Business, Simplified And Smarter",
      OriginalFilename: "Corvseller.exe",
      ProductName: "Corvseller",
      InternalName: "Corvseller"
    },
    // Add development-specific configurations
    extraResource: isDev ? [
      path.join(__dirname, 'dev-config.json')
    ] : [],
    // Enable source maps in development
    asar: {
      sourceMapSuffix: isDev ? '.map' : undefined,
      unpack: '*.{node,dll}'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "Corvseller",
        authors: "Corvid Integrated Services LTD",
        description: "Your Business, Simplified And Smarter",
        iconUrl: path.join(__dirname, 'src/assets/icon.ico'),
        setupIcon: path.join(__dirname, 'src/assets/icon.ico'),
        loadingGif: path.join(__dirname, 'src/assets/installer.gif'),
        setupExe: "CorvsellerSetup.exe",
        noMsi: true,
        // Add development-specific settings
        setupExeFlags: isDev ? ['--debug'] : []
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        options: {
          icon: path.join(__dirname, 'src/assets/icon.icns'),
          name: "Corvseller"
        }
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: path.join(__dirname, 'src/assets/icon.png'),
          name: "corvseller",
          productName: "Corvseller",
          maintainer: "Corvid Integrated Services LTD",
          categories: ["Office", "Business"],
          description: "Your Business, Simplified And Smarter"
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: path.join(__dirname, 'src/assets/icon.png'),
          name: "corvseller",
          productName: "Corvseller",
          description: "Your Business, Simplified And Smarter"
        }
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
        // Add development-specific Vite configurations
        devServer: isDev ? {
          hmr: true,
          watch: {
            ignored: ['**/dist/**']
          }
        } : undefined
      },
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: isDev,  // Enable in dev mode
      [FuseV1Options.EnableNodeCliInspectArguments]: isDev,  // Enable in dev mode
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: !isDev,  // Disable in dev mode
      [FuseV1Options.OnlyLoadAppFromAsar]: !isDev,  // Disable in dev mode
    }),
    // Add development-only plugins
    ...(isDev ? [
      {
        name: '@electron-forge/plugin-debug',
        config: {
          devtool: 'source-map',
          sourceMapFileFilters: ['renderer/**/*.js']
        }
      }
    ] : [])
  ]
};