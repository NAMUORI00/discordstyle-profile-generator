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
      // 모든 의존성을 번들에 포함 (React 버전 호환성 문제 방지)
      output: {
        inlineDynamicImports: true,
      },
    },
    minify: 'esbuild',
  },
});
