import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  // Use dedicated TypeScript config for Vite
  // This prevents conflicts with Hardhat types
  define: {
    'process.env.VITE_BUILD': '"true"'
  },
  plugins: [
    react({
      // React Fast Refresh optimization
      fastRefresh: true,
    }),
    // Bundle analyzer - generates stats.html
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  base: './', // For GitHub Pages deployment
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Target modern browsers for better optimization
    target: 'es2020',
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
      format: {
        comments: false, // Remove comments
      },
    },
    rollupOptions: {
      output: {
        // Manual chunks for code splitting
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          // Web3 libraries (largest bundle)
          'web3-vendor': ['wagmi', '@rainbow-me/rainbowkit', 'viem', 'ethers'],
          // Radix UI components
          'radix-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          // Utility libraries
          'utils-vendor': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
          ],
          // Query library
          'query-vendor': ['@tanstack/react-query'],
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
      // Security: External dependencies that should not be bundled
      external: [],
    },
    // Optimize asset inline threshold
    assetsInlineLimit: 4096, // 4kb - inline small assets as base64
  },
  server: {
    port: 1281,
    open: true,
    // Security headers for development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wagmi',
      '@rainbow-me/rainbowkit',
      'viem',
    ],
    exclude: ['@fhevm/solidity'],
  },
  // Preview server configuration
  preview: {
    port: 3001,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    },
  },
})
