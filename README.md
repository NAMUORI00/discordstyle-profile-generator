# Discord Style Profile Generator

디스코드 스타일의 프로필 카드를 생성하고 HTML로 다운로드할 수 있는 웹 앱입니다.

## Run Locally

**Prerequisites:** Node.js (v18 이상 권장)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

---

## Deploy to GitHub Pages

### Method 1: GitHub Actions (권장)

#### Step 1: vite.config.ts 수정

`vite.config.ts` 파일에 `base` 옵션을 추가합니다:

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/your-repo-name/',  // GitHub 저장소 이름으로 변경
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
```

#### Step 2: GitHub Actions Workflow 생성

`.github/workflows/deploy.yml` 파일을 생성합니다:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Step 3: GitHub 설정

1. GitHub 저장소의 **Settings** > **Pages**로 이동
2. **Build and deployment** > **Source**를 **GitHub Actions**로 선택
3. **Settings** > **Actions** > **General** > **Workflow permissions**에서 **Read and write permissions** 활성화

#### Step 4: 배포

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

배포 완료 후 `https://<username>.github.io/<repo-name>/`에서 확인 가능합니다.

### Method 2: gh-pages 패키지 사용

```bash
# gh-pages 설치
npm install -D gh-pages

# package.json에 스크립트 추가 후 배포
npm run build
npx gh-pages -d dist
```

`package.json`에 추가:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

---

## Deploy to Cloudflare Pages

### Method 1: Git 연동 (권장)

#### Step 1: Cloudflare 대시보드에서 설정

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인
2. **Workers & Pages** > **Create** > **Pages** 선택
3. **Connect to Git** 클릭
4. GitHub/GitLab 계정 연동 후 저장소 선택

#### Step 2: 빌드 설정

| 설정 | 값 |
|------|-----|
| Framework preset | None (또는 Vite) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | 20 |

#### Step 3: 배포

**Save and Deploy** 클릭하면 자동으로 빌드 및 배포됩니다.

이후 `main` 브랜치에 푸시할 때마다 자동 배포됩니다.
배포 URL: `https://<project-name>.pages.dev`

### Method 2: Wrangler CLI 사용

```bash
# Wrangler 설치
npm install -D wrangler

# Cloudflare 로그인
npx wrangler login

# 빌드
npm run build

# 배포
npx wrangler pages deploy dist
```

`package.json`에 스크립트 추가:
```json
{
  "scripts": {
    "deploy:cf": "npm run build && wrangler pages deploy dist"
  }
}
```

### Method 3: Cloudflare Vite Plugin (고급)

SPA 라우팅이 필요한 경우:

```bash
npm install -D @cloudflare/vite-plugin wrangler
```

`wrangler.json` 파일 생성:
```json
{
  "name": "discord-profile-generator",
  "compatibility_date": "2025-01-01",
  "assets": {
    "not_found_handling": "single-page-application"
  }
}
```

---

## Build for Production

```bash
# 프로덕션 빌드
npm run build

# 로컬에서 빌드 결과 미리보기
npm run preview
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

---

## References

- [Vite Static Deploy Guide](https://vite.dev/guide/static-deploy)
- [Cloudflare Pages - Vite 3](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
