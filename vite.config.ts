import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ============================================
  // OPTIMIZACIONES DE BUILD
  // ============================================
  build: {
    // Configuración de code splitting
    rollupOptions: {
      output: {
        // Estrategia de chunking manual para mejor cache
        manualChunks: (id) => {
          // Vendors principales en chunks separados
          if (id.includes('node_modules')) {
            // React y dependencias core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // Clerk (autenticación)
            if (id.includes('@clerk')) {
              return 'vendor-clerk';
            }
            
            // TanStack Query
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            
            // Tailwind y UI
            if (id.includes('tailwind') || id.includes('headlessui')) {
              return 'vendor-ui';
            }
            
            // Resto de node_modules
            return 'vendor-other';
          }
          
          // Módulos grandes en chunks separados
          if (id.includes('src/modules/techo-propio')) {
            return 'module-techo-propio';
          }
          
          if (id.includes('src/modules/interface-config')) {
            return 'module-interface-config';
          }
          
          if (id.includes('src/modules/user-management')) {
            return 'module-user-management';
          }
        },
        
        // Nombres de archivos con hash para cache busting
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Optimizaciones de tamaño
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,        // Remover console.logs en producción
        drop_debugger: true,       // Remover debuggers
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    
    // Límite de advertencia de chunk size
    chunkSizeWarningLimit: 1000,
    
    // Source maps solo en desarrollo
    sourcemap: false,
    
    // Target moderno para mejor optimización
    target: 'es2015',
    
    // CSS code splitting
    cssCodeSplit: true,
  },
  
  // ============================================
  // OPTIMIZACIONES DE DEV
  // ============================================
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true,
    },
  },
  
  // ============================================
  // RESOLUCIÓN DE MÓDULOS
  // ============================================
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@shared': resolve(__dirname, './src/shared'),
      '@modules': resolve(__dirname, './src/modules'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
    },
  },
  
  // ============================================
  // OPTIMIZACIONES DE DEPENDENCIAS
  // ============================================
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@clerk/clerk-react',
      '@tanstack/react-query',
    ],
    exclude: [
      // Excluir módulos que deben cargarse bajo demanda
    ],
  },
});
