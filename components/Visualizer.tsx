import React, { useEffect, useRef } from 'react';
import { VisualizerProps } from '../types';

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, primaryColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    
    // Initial resize
    handleResize();
    window.addEventListener('resize', handleResize);

    const bars = 60;
    const radius = 150; // Size of the circle
    const angleStep = (Math.PI * 2) / bars;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw background particles if playing
      if (isPlaying) {
         // Faint background particles
         for (let i = 0; i < 3; i++) {
             ctx.beginPath();
             ctx.fillStyle = primaryColor;
             ctx.globalAlpha = 0.2;
             const px = Math.random() * width;
             const py = Math.random() * height;
             ctx.arc(px, py, Math.random() * 2, 0, Math.PI * 2);
             ctx.fill();
             ctx.globalAlpha = 1.0;
         }
      }

      ctx.beginPath();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      for (let i = 0; i < bars; i++) {
        // Simulation logic: If playing, generate noisy rhythmic data. If paused, flatline.
        // We can't get real audio data from a CORS-restricted Iframe easily in client-side JS without a proxy.
        // So we simulate the "NCS Look".
        const time = Date.now();
        const noise = isPlaying 
          ? Math.random() * 40 + Math.sin(time / 200 + i) * 20 
          : 5;
        
        const barHeight = Math.max(5, noise);
        
        const angle = i * angleStep;
        
        // Inner point
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        
        // Outer point
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      // Inner glow circle
      const pulse = isPlaying ? 5 + Math.sin(Date.now() / 150) * 3 : 0;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 10 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = primaryColor;
      ctx.globalAlpha = 0.15;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, primaryColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};

export default Visualizer;
