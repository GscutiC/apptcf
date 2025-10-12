/**
 * CRACO Configuration para optimizaciones de build
 * Personaliza Create React App sin hacer eject
 */

const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // ============================================
      // CODE SPLITTING OPTIMIZADO
      // ============================================
      if (env === 'production') {
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              // React y dependencias core
              reactVendor: {
                test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
                name: 'vendor-react',
                priority: 40,
              },
              // Clerk (autenticación)
              clerkVendor: {
                test: /[\\/]node_modules[\\/](@clerk)[\\/]/,
                name: 'vendor-clerk',
                priority: 35,
              },
              // TanStack Query
              queryVendor: {
                test: /[\\/]node_modules[\\/](@tanstack)[\\/]/,
                name: 'vendor-query',
                priority: 30,
              },
              // UI libraries
              uiVendor: {
                test: /[\\/]node_modules[\\/](@headlessui|@heroicons)[\\/]/,
                name: 'vendor-ui',
                priority: 25,
              },
              // Otros vendors
              defaultVendors: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: 20,
              },
              // Módulos propios
              common: {
                minChunks: 2,
                priority: 10,
                reuseExistingChunk: true,
              },
            },
          },
        };

        // ============================================
        // MINIMIZACIÓN OPTIMIZADA
        // ============================================
        if (webpackConfig.optimization.minimizer) {
          webpackConfig.optimization.minimizer.forEach((minimizer) => {
            if (minimizer.constructor.name === 'TerserPlugin') {
              minimizer.options.terserOptions = {
                ...minimizer.options.terserOptions,
                compress: {
                  ...minimizer.options.terserOptions.compress,
                  drop_console: true,
                  drop_debugger: true,
                  pure_funcs: ['console.log', 'console.info', 'console.debug'],
                },
              };
            }
          });
        }
      }

      // ============================================
      // ANÁLISIS DE BUNDLE (opcional)
      // ============================================
      if (process.env.ANALYZE === 'true') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-report.html',
          })
        );
      }

      return webpackConfig;
    },
  },

  // ============================================
  // DEV SERVER OPTIMIZADO
  // ============================================
  devServer: {
    port: 5173,
    overlay: {
      warnings: false,
      errors: true,
    },
  },

  // ============================================
  // BABEL OPTIMIZATIONS
  // ============================================
  babel: {
    plugins: [
      // Plugin para remover PropTypes en producción
      process.env.NODE_ENV === 'production' && [
        'babel-plugin-transform-react-remove-prop-types',
        {
          removeImport: true,
        },
      ],
    ].filter(Boolean),
  },
};
