import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleBackgroundProps {
  isPlaying: boolean;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ bassSmoothed: 0, simSpeed: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.0012);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1500);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const pCount = 200;
    const pos = new Float32Array(pCount * 3);
    const vel: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1000;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1000;
      vel.push({
        x: (Math.random() - 0.5) * 1.2,
        y: (Math.random() - 0.5) * 1.2,
        z: (Math.random() - 0.5) * 1.2,
      });
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const cCyan = new THREE.Color(0x00f3ff);
    const cGreen = new THREE.Color(0x00ff00);

    const pMat = new THREE.PointsMaterial({
      color: cCyan,
      size: 2.5,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pCount * pCount * 3), 3));
    const lMat = new THREE.LineBasicMaterial({
      color: cGreen,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(lGeo, lMat);
    scene.add(lines);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const st = stateRef.current;
      const bass = isPlaying ? 0.3 + Math.sin(Date.now() / 300) * 0.15 : 0;
      st.bassSmoothed += (bass - st.bassSmoothed) * 0.15;

      const spd = st.simSpeed + st.bassSmoothed * 5;
      pMat.size = 2.5 + st.bassSmoothed * 7;
      lMat.opacity = 0.15 + st.bassSmoothed * 0.7;

      const mix = cCyan.clone().lerp(cGreen, st.bassSmoothed);
      pMat.color = mix;
      lMat.color = mix;

      const pArr = pGeo.attributes.position.array as Float32Array;
      const lArr = lGeo.attributes.position.array as Float32Array;
      let lIdx = 0;
      const thr = 15000 + st.bassSmoothed * 30000;

      for (let i = 0; i < pCount; i++) {
        pArr[i * 3] += vel[i].x * spd;
        pArr[i * 3 + 1] += vel[i].y * spd;
        pArr[i * 3 + 2] += vel[i].z * spd;
        if (Math.abs(pArr[i * 3]) > 600) vel[i].x *= -1;
        if (Math.abs(pArr[i * 3 + 1]) > 600) vel[i].y *= -1;
        if (Math.abs(pArr[i * 3 + 2]) > 600) vel[i].z *= -1;

        for (let j = i + 1; j < pCount; j++) {
          const dx = pArr[i * 3] - pArr[j * 3];
          const dy = pArr[i * 3 + 1] - pArr[j * 3 + 1];
          const dz = pArr[i * 3 + 2] - pArr[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < thr) {
            lArr[lIdx++] = pArr[i * 3]; lArr[lIdx++] = pArr[i * 3 + 1]; lArr[lIdx++] = pArr[i * 3 + 2];
            lArr[lIdx++] = pArr[j * 3]; lArr[lIdx++] = pArr[j * 3 + 1]; lArr[lIdx++] = pArr[j * 3 + 2];
          }
        }
      }

      pGeo.attributes.position.needsUpdate = true;
      lGeo.setDrawRange(0, lIdx / 3);
      lGeo.attributes.position.needsUpdate = true;
      scene.rotation.y += 0.001 * spd;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default ParticleBackground;
