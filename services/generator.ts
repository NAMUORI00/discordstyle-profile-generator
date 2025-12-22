import { UserProfile } from '../types';

// 번들 URL 설정 (배포 시 실제 도메인으로 변경)
let bundleBaseUrl = '';

/**
 * 번들이 호스팅되는 기본 URL을 설정합니다.
 * 예: 'https://your-app.pages.dev'
 */
export const setBundleBaseUrl = (url: string) => {
  bundleBaseUrl = url.replace(/\/$/, ''); // 끝의 슬래시 제거
};

/**
 * 현재 페이지의 origin을 기반으로 번들 URL을 자동 설정합니다.
 */
export const initBundleUrl = () => {
  if (typeof window !== 'undefined') {
    bundleBaseUrl = window.location.origin;
  }
};

/**
 * React 기반 standalone HTML을 생성합니다.
 * ProfileCard 컴포넌트를 그대로 사용하므로 프리뷰와 100% 동일하게 동작합니다.
 */
export const generateStandaloneHTML = (profile: UserProfile): string => {
  const profileJson = JSON.stringify(profile);
  const bundleUrl = `${bundleBaseUrl}/standalone/profile-card.iife.js`;

  // Visualizer 설정
  const visualizerScript = `
    <script>
      // Visualizer 애니메이션
      const canvas = document.getElementById('visualizer');
      const ctx = canvas ? canvas.getContext('2d') : null;
      let width, height, isPlaying = false;

      function resize() {
        if(!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      const bars = 60;
      const radius = 150;
      const angleStep = (Math.PI * 2) / bars;
      const primaryColor = '${profile.theme.primary}';

      function drawVisualizer() {
        if(!ctx) return;
        ctx.clearRect(0, 0, width, height);
        const centerX = width / 2;
        const centerY = height / 2;

        if (isPlaying) {
          for(let i=0; i<3; i++) {
            ctx.beginPath();
            ctx.fillStyle = primaryColor;
            ctx.globalAlpha = 0.2;
            ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI*2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }

        ctx.beginPath();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        for (let i = 0; i < bars; i++) {
          const noise = isPlaying ? Math.random() * 40 + Math.sin(Date.now() / 200 + i) * 20 : 5;
          const barHeight = Math.max(5, noise);
          const angle = i * angleStep;
          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + barHeight);
          const y2 = centerY + Math.sin(angle) * (radius + barHeight);
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.stroke();

        const pulse = isPlaying ? 5 + Math.sin(Date.now() / 150) * 3 : 0;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 10 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = 0.15;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        requestAnimationFrame(drawVisualizer);
      }
      drawVisualizer();

      // 전역으로 isPlaying 상태 업데이트 함수 노출
      window.setVisualizerPlaying = (playing) => { isPlaying = playing; };
    </script>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.displayName || profile.username}'s Profile</title>

    <!-- Tailwind CSS CDN (스타일링용) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              discord: {
                bg: '#36393f',
                bgSecondary: '#2f3136',
                bgTertiary: '#202225',
                green: '#3ba55c',
              }
            }
          }
        }
      }
    </script>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">

    <style>
        body {
            background-color: #36393f;
            overflow: hidden;
            font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        #visualizer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        }
        .center-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
            padding: 20px;
            box-sizing: border-box;
        }
    </style>
</head>
<body>
    <!-- Visualizer Canvas -->
    <canvas id="visualizer"></canvas>

    <!-- React Root -->
    <div class="center-wrapper">
        <div id="profile-root" style="width: 100%; max-width: 1000px;"></div>
    </div>

    <!-- Visualizer Script -->
    ${visualizerScript}

    <!-- ProfileCard Bundle (외부 URL에서 로드) -->
    <script src="${bundleUrl}"></script>

    <!-- Render ProfileCard -->
    <script>
        const profile = ${profileJson};

        // ProfileCard 렌더링
        if (typeof renderProfileCard === 'function') {
            renderProfileCard('profile-root', profile, {
                onPlayingChange: (playing) => {
                    if (typeof window.setVisualizerPlaying === 'function') {
                        window.setVisualizerPlaying(playing);
                    }
                }
            });
        } else {
            console.error('ProfileCard bundle not loaded properly');
            document.getElementById('profile-root').innerHTML = '<p style="color:white;">Error loading profile card</p>';
        }
    </script>
</body>
</html>`;
};
