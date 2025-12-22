import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ProfileCard를 standalone HTML용 IIFE 번들로 빌드하는 설정
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    outDir: 'public/standalone',  // public 폴더에 출력하여 메인 빌드에 포함되도록
    lib: {
      entry: path.resolve(__dirname, 'components/ProfileCardBundle.tsx'),
      name: 'ProfileCardBundle',
      fileName: 'profile-card',
      formats: ['iife'],
    },
    rollupOptions: {
      // React/ReactDOM만 외부 의존성, 나머지는 번들에 포함
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        inlineDynamicImports: true,
      },
    },
    minify: 'esbuild',
  },
});
