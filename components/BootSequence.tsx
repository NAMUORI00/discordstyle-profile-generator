import React, { useState, useRef, useCallback, useEffect } from 'react';

type BootPhase = 'standby' | 'inference' | 'call' | 'hacked' | 'retro' | 'profile';

interface BootSequenceProps {
  avatarSrc: string;
  bannerSrc: string;
  displayName: string;
  onComplete: () => void;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// Matrix rain character set
const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

const BootSequence: React.FC<BootSequenceProps> = ({ avatarSrc, bannerSrc, displayName, onComplete }) => {
  const [phase, setPhase] = useState<BootPhase>('standby');
  const [logs, setLogs] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(false);
  const [activeLine, setActiveLine] = useState('');
  const [hackInput, setHackInput] = useState('');
  const [hackDisabled, setHackDisabled] = useState(false);
  const [hackMsg, setHackMsg] = useState('');
  const [retroReady, setRetroReady] = useState(false);
  const [absorbed, setAbsorbed] = useState(false);
  const [hackShake, setHackShake] = useState(false);
  const hackRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const wireCanvasRef = useRef<HTMLCanvasElement>(null);
  const matrixAnimRef = useRef<number>(0);
  const wireAnimRef = useRef<number>(0);

  const addLog = useCallback((text: string) => {
    setLogs(prev => [...prev, text]);
  }, []);

  // Matrix rain effect
  useEffect(() => {
    if (phase !== 'inference' && phase !== 'standby') return;
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1).map(() => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00f3ff';
      ctx.font = `${fontSize}px 'Fira Code', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Alternate colors for variety
        ctx.fillStyle = Math.random() > 0.5 ? '#00f3ff' : '#00ff00';
        ctx.globalAlpha = Math.random() * 0.3 + 0.05;
        ctx.fillText(char, x, y);
        ctx.globalAlpha = 1;

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      matrixAnimRef.current = requestAnimationFrame(draw);
    };
    matrixAnimRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(matrixAnimRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [phase]);

  // Wireframe scan effect during inference
  useEffect(() => {
    if (phase !== 'inference') return;
    const canvas = wireCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let scanY = 0;
    let frame = 0;

    const drawWireframe = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.08;

      const spacing = 40;
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Scan line
      ctx.globalAlpha = 1;
      const gradient = ctx.createLinearGradient(0, scanY - 100, 0, scanY + 100);
      gradient.addColorStop(0, 'rgba(0, 243, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 100, canvas.width, 200);

      // Bright scan line
      ctx.strokeStyle = '#00f3ff';
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      // Random wireframe dots along scan
      ctx.fillStyle = '#00ff00';
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 5; i++) {
        const rx = Math.random() * canvas.width;
        const ry = scanY + (Math.random() - 0.5) * 20;
        ctx.beginPath();
        ctx.arc(rx, ry, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Corner markers
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2;
      const m = 30;
      // Top-left
      ctx.beginPath(); ctx.moveTo(m, m + 20); ctx.lineTo(m, m); ctx.lineTo(m + 20, m); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(canvas.width - m - 20, m); ctx.lineTo(canvas.width - m, m); ctx.lineTo(canvas.width - m, m + 20); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(m, canvas.height - m - 20); ctx.lineTo(m, canvas.height - m); ctx.lineTo(m + 20, canvas.height - m); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(canvas.width - m - 20, canvas.height - m); ctx.lineTo(canvas.width - m, canvas.height - m); ctx.lineTo(canvas.width - m, canvas.height - m - 20); ctx.stroke();

      // HUD text
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#00f3ff';
      ctx.font = '10px "Fira Code", monospace';
      ctx.fillText(`SCAN_PROGRESS: ${Math.min(100, Math.floor((scanY / canvas.height) * 100))}%`, m + 5, m + 35);
      ctx.fillText(`FRAME: ${frame}`, canvas.width - m - 80, m + 35);

      scanY += 2;
      if (scanY > canvas.height + 100) scanY = -100;
      frame++;

      ctx.globalAlpha = 1;
      wireAnimRef.current = requestAnimationFrame(drawWireframe);
    };

    wireAnimRef.current = requestAnimationFrame(drawWireframe);

    return () => cancelAnimationFrame(wireAnimRef.current);
  }, [phase]);

  const runInference = useCallback(async () => {
    if (abortRef.current) return;
    setPhase('inference');
    setShowCursor(true);

    await delay(800);
    const logLines = [
      { text: '[BOOT] Loading neural runtime environment...', d: 400 },
      { text: '[SYS] Initializing tensor processing unit...', d: 300 },
      { text: '[SYS] Extracting Banner Latent Vectors...', d: 500, action: 'absorb' },
      { text: '[SYS] Extracting Avatar Latent Vectors...', d: 500 },
      { text: '[FLOW] Fusing Latent Vectors into Unified Core...', d: 400 },
      { text: '[FUSION] Tensors Successfully Merged. Rank: 512', d: 400 },
      { text: '[FLOW] Transmitting to Inference Engine...', d: 300 },
      { text: '[TRAIN] Epoch 100/5000 | Loss: 2.3412 | LR: 0.001', d: 200 },
      { text: '[TRAIN] Epoch 500/5000 | Loss: 1.4231 | LR: 0.0008', d: 200 },
      { text: '[TRAIN] Epoch 1000/5000 | Loss: 0.8241 | LR: 0.0005', d: 200 },
      { text: '[TRAIN] Epoch 2500/5000 | Loss: 0.2102 | LR: 0.0002', d: 200 },
      { text: '[TRAIN] Epoch 3500/5000 | Loss: 0.0412 | LR: 0.0001', d: 200 },
      { text: '[TRAIN] Epoch 5000/5000 | Loss: 0.0001 (Optimal Weights Found)', d: 300 },
      { text: '[INFER] Decoding Latent Vector Components...', d: 400 },
      { text: '> Predicting Spatial Topologies...', d: 300 },
      { text: '> Extracting Wireframe Matrices...', d: 300 },
      { text: '> Rendering Neural Identity Endpoint...', d: 400 },
      { text: '[DONE] Identity construction complete.', d: 500 },
    ];

    for (const line of logLines) {
      if (abortRef.current) return;
      setActiveLine(`sys_${(Math.random() * 0xffff | 0).toString(16)}.log`);
      addLog(line.text);
      if ((line as any).action === 'absorb') setAbsorbed(true);
      await delay(line.d);
    }

    await delay(400);
    if (!abortRef.current) setPhase('call');
  }, [addLog]);

  const handleAccept = useCallback(() => {
    setPhase('profile');
    setTimeout(onComplete, 600);
  }, [onComplete]);

  const handleDecline = useCallback(() => {
    setPhase('hacked');
    setTimeout(() => hackRef.current?.focus(), 500);
  }, []);

  const handleHackSubmit = useCallback(() => {
    if (hackInput.trim().toLowerCase() === 'sudo restore') {
      setHackDisabled(true);
      setHackMsg('PURGING INTRUSION...');
      setTimeout(() => {
        setPhase('retro');
        setTimeout(() => {
          setRetroReady(true);
          setTimeout(() => {
            setPhase('profile');
            setTimeout(onComplete, 600);
          }, 2500);
        }, 2000);
      }, 1500);
    } else {
      setHackInput('');
      setHackShake(true);
      setTimeout(() => setHackShake(false), 500);
    }
  }, [hackInput, onComplete]);

  useEffect(() => {
    if (phase === 'hacked') {
      const handler = () => hackRef.current?.focus();
      document.body.addEventListener('click', handler);
      return () => document.body.removeEventListener('click', handler);
    }
  }, [phase]);

  useEffect(() => {
    abortRef.current = false;
    return () => { abortRef.current = true; };
  }, []);

  // ===== STANDBY =====
  if (phase === 'standby') {
    return (
      <div className="scene-overlay flex flex-col items-center justify-center">
        {/* Matrix rain background */}
        <canvas ref={matrixCanvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-30" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Glowing pulse ring */}
          <div className="relative mb-12">
            <div className="w-32 h-32 border-2 border-[#00f3ff]/30 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[ping_2s_ease-in-out_infinite]" />
            <div className="w-24 h-24 border border-[#00ff00]/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[ping_3s_ease-in-out_infinite]" />
            <div className="w-16 h-16 bg-[#00f3ff]/5 border border-[#00f3ff]/40 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-[#00f3ff] rounded-full shadow-[0_0_15px_#00f3ff,0_0_30px_#00f3ff] animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-mono text-[#00f3ff] mb-3 tracking-[0.2em] drop-shadow-[0_0_15px_rgba(0,243,255,0.6)] font-bold text-center">
            SYSTEM_STANDBY
          </h1>
          <p className="text-[10px] text-gray-600 font-mono tracking-[0.3em] mb-8 uppercase">Awaiting Neural Link Authorization</p>
          <button
            type="button"
            onClick={runInference}
            className="group px-10 py-3.5 border border-[#00f3ff] bg-[#00f3ff]/10 text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black font-mono font-bold tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] cursor-pointer relative overflow-hidden"
          >
            <span className="relative z-10">[ INITIALIZE ]</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f3ff]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          {/* System info footer */}
          <div className="mt-12 text-[9px] font-mono text-gray-700 text-center space-y-1">
            <div>KERNEL: NeuralOS v4.2.1 | PROTOCOL: Encrypted</div>
            <div>NODE: <span className="text-[#00f3ff]/50">0x{Math.random().toString(16).slice(2, 10).toUpperCase()}</span></div>
          </div>
        </div>
      </div>
    );
  }

  // ===== INFERENCE =====
  if (phase === 'inference') {
    return (
      <div className="scene-overlay flex flex-col items-center justify-center px-6">
        {/* Matrix rain */}
        <canvas ref={matrixCanvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-20" />
        {/* Wireframe scan overlay */}
        <canvas ref={wireCanvasRef} className="absolute inset-0 z-[5] pointer-events-none" />

        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          {/* Tensor Visualization — images get absorbed into terminal */}
          <div className={`flex flex-col gap-4 w-full max-w-sm mx-auto transition-all duration-[1500ms] ease-in-out ${
            absorbed ? 'scale-0 opacity-0 translate-x-[200px] rotate-3' : 'scale-100 opacity-100 translate-x-0 rotate-0'
          }`}>
            <div className="w-full relative">
              <div className="text-[#00f3ff] font-mono text-xs flex justify-between mb-1">
                <span>&gt; BANNER_TENSOR</span><span className="text-gray-600">[800×200×3]</span>
              </div>
              <div className="relative w-full h-[120px] rounded border border-[#00f3ff]/30 bg-black overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                <img src={bannerSrc} alt="" className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f3ff]/30 to-transparent animate-scan mix-blend-screen" />
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,243,255,0.03) 4px, rgba(0,243,255,0.03) 5px)',
                }} />
              </div>
            </div>
            <div className="w-full relative mt-2">
              <div className="text-[#00ff00] font-mono text-xs flex justify-between mb-1">
                <span>&gt; AVATAR_TENSOR</span><span className="text-gray-600">[400×400×3]</span>
              </div>
              <div className="relative w-[140px] h-[140px] mx-auto rounded-full border border-[#00ff00]/30 bg-black overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.1)]">
                <img src={avatarSrc} alt="" className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff00]/30 to-transparent animate-scan mix-blend-screen" />
              </div>
            </div>
            {/* Fusion indicator */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00f3ff]/50" />
              <span className="text-[9px] text-[#00f3ff] font-mono animate-pulse tracking-wider">TENSOR_FUSION</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00ff00]/50" />
            </div>
          </div>

          {/* Absorbed confirmation glow — appears when images are consumed */}
          {absorbed && (
            <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/20 flex items-center justify-center animate-pulse">
                <span className="text-[#00f3ff] font-mono text-[9px] tracking-wider">ABSORBED</span>
              </div>
            </div>
          )}

          {/* Terminal */}
          <div className="w-full h-[400px] bg-[#0a0a0c] border border-gray-800 rounded flex flex-col font-mono text-[11px] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="bg-black px-3 py-2 border-b border-gray-800 flex items-center gap-2 text-gray-500">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-2 font-bold text-[#00f3ff]">inference_engine.sh</span>
              <span className="ml-auto text-[9px] text-gray-600">PID: {Math.floor(Math.random() * 9000) + 1000}</span>
            </div>
            <div className="p-3 flex-1 overflow-hidden flex flex-col justify-end">
              <div className="text-gray-400 space-y-1 flex flex-col overflow-y-auto custom-scroll text-[10px]">
                {logs.map((line, i) => (
                  <div
                    key={i}
                    className={`animate-fadeUp ${
                      line.includes('Loss') ? 'text-[#00ff00]' :
                      line.includes('[DONE]') ? 'text-[#00ff00] font-bold' :
                      line.startsWith('>') ? 'text-yellow-500' :
                      'text-[#00f3ff]'
                    }`}
                  >
                    &gt; {line}
                  </div>
                ))}
              </div>
              {showCursor && (
                <div className="text-[#00f3ff] mt-2">
                  &gt; <span className="text-gray-500">{activeLine}</span>
                  <span className="animate-blink">█</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== CALL SCREEN =====
  if (phase === 'call') {
    return (
      <div className="scene-overlay flex flex-col items-center justify-center gap-6 bg-black/90 backdrop-blur-xl" style={{ animation: 'fadeIn 0.5s ease-out' }}>
        {/* Pulsing rings behind avatar */}
        <div className="relative">
          <div className="absolute inset-0 w-40 h-40 -top-4 -left-4 rounded-full border border-[#00f3ff]/20 animate-[ping_3s_ease-in-out_infinite]" />
          <div className="absolute inset-0 w-36 h-36 -top-2 -left-2 rounded-full border border-[#00f3ff]/10 animate-[ping_4s_ease-in-out_infinite]" />
          <div className="w-32 h-32 rounded-full relative bg-[#111214] p-1 border border-gray-700 shadow-[0_0_60px_rgba(0,243,255,0.15)]">
            <img src={avatarSrc} alt="" className="w-full h-full rounded-full object-cover relative z-10 bg-black" />
            <div className="absolute inset-0 rounded-full border-2 border-[#00f3ff]/30 animate-pulse z-20" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold font-sans tracking-wide">{displayName}</h2>
          <p className="text-[#00f3ff] text-sm mt-1.5 font-sans font-medium drop-shadow-[0_0_5px_rgba(0,243,255,0.8)] animate-pulse">
            Incoming Neural Link...
          </p>
        </div>
        <div className="flex gap-10 mt-6 relative z-10">
          <button
            type="button"
            onClick={handleDecline}
            className="w-16 h-16 rounded-full bg-[#da373c] flex items-center justify-center cursor-pointer hover:bg-[#a1282b] transition-all border border-red-900 shadow-[0_0_20px_rgba(218,55,60,0.5)] hover:shadow-[0_0_30px_rgba(218,55,60,0.8)] hover:scale-110 active:scale-95"
          >
            <svg className="w-6 h-6 text-white" style={{ transform: 'rotate(135deg)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="w-16 h-16 rounded-full bg-[#23a559] flex items-center justify-center shadow-[0_0_25px_#23a559] hover:bg-[#1a7c43] cursor-pointer border border-[#1a7c43] text-white transition-all hover:shadow-[0_0_40px_#23a559] hover:scale-110 active:scale-95"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </button>
        </div>
        {/* Connection info */}
        <div className="mt-6 text-[9px] text-gray-600 font-mono text-center">
          <div>SIGNAL: <span className="text-[#00ff00]">STRONG</span> | LATENCY: <span className="text-[#00f3ff]">12ms</span></div>
          <div className="mt-1">ENCRYPTION: <span className="text-[#00f3ff]">AES-256-GCM</span></div>
        </div>
      </div>
    );
  }

  // ===== HACKED SCREEN =====
  if (phase === 'hacked') {
    return (
      <div className={`scene-overlay flex flex-col items-center justify-center bg-[#050000] screen-tremor crt-flicker ${hackShake ? 'screen-shake' : ''}`}>
        <div className="absolute inset-0 crt-overlay pointer-events-none z-30" />
        <div className="absolute inset-0 noise-bg pointer-events-none z-20" />
        <div className="glitch-tear" />

        {/* Glitch skull */}
        <pre className="text-[#ff003c] font-mono text-[10px] md:text-[12px] drop-shadow-[0_0_15px_rgba(255,0,60,0.8)] leading-tight text-center glitch-effect mb-6 relative z-10">
{`           ______
        .-"      "-.
       /            \\
      |              |
      |,  .-.  .-.  ,|
      | )(__(  \\__)( |
      |/     /\\     \\|
      (_     ^^     _)
       \\__|IIIIII|__/
        | \\IIIIII/ |
        \\          /
         \`--------\``}
        </pre>
        <h1 className="text-[#ff003c] text-3xl md:text-5xl font-bold font-mono tracking-widest drop-shadow-[0_0_10px_rgba(255,0,60,0.8)] text-center mb-2 relative z-10">
          SYSTEM BREACHED
        </h1>
        <p className="text-red-500 font-mono text-sm tracking-widest text-center relative z-10 mb-2">
          &gt; CRITICAL FAILURE. CONNECTION INTERCEPTED.
        </p>
        <p className="text-red-800 font-mono text-[10px] tracking-wider text-center relative z-10">
          Neural pathways corrupted. Firewall disabled. All ports exposed.
        </p>
        <div className="mt-10 w-full max-w-lg bg-black/90 border border-[#ff003c] p-6 font-mono text-sm shadow-[0_0_30px_rgba(255,0,60,0.3)] relative z-10">
          <div className="text-gray-500 mb-1 text-[11px]">&gt; All systems compromised. Root access granted to unknown entity.</div>
          <div className="text-gray-500 mb-4 text-[11px]">
            &gt; HINT: Execute{' '}
            <span className="text-white font-bold bg-red-900/50 px-2 py-0.5 rounded border border-red-500/50">
              sudo restore
            </span>{' '}
            to purge intrusion.
          </div>
          <div className="flex items-center text-[#ff003c] font-bold">
            <span className="mr-3 text-gray-600">root@sys:~#</span>
            <input
              ref={hackRef}
              type="text"
              value={hackDisabled ? hackMsg : hackInput}
              onChange={e => !hackDisabled && setHackInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !hackDisabled && handleHackSubmit()}
              disabled={hackDisabled}
              className={`flex-1 bg-transparent border-none outline-none font-mono placeholder-gray-700 ${hackDisabled ? 'text-green-500' : 'text-white'}`}
              autoComplete="off"
              spellCheck={false}
              placeholder="_"
            />
          </div>
        </div>
      </div>
    );
  }

  // ===== RETRO SCREEN =====
  if (phase === 'retro') {
    return (
      <div className="scene-overlay flex flex-col items-center justify-center bg-black font-pixel">
        <div className="absolute inset-0 crt-overlay pointer-events-none" />
        {/* Starfield-like dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-[2px] bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5,
                animation: `blink ${1 + Math.random() * 2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
        <div
          className="text-[#00ff00] text-3xl md:text-6xl font-bold tracking-widest mb-16 text-center leading-relaxed relative z-10"
          style={{ textShadow: '4px 4px 0 #005500, -2px -2px 0 #002200' }}
        >
          NEURAL<br />FANTASY
        </div>
        <div className="flex flex-col items-center gap-8 text-white text-xs md:text-lg tracking-widest relative z-10">
          <div className={retroReady ? 'text-[#00ff00]' : 'animate-pulse'}>
            &gt; AUTO START &lt;
          </div>
        </div>
        <div className="absolute bottom-12 text-[8px] md:text-[10px] text-gray-500 tracking-widest relative z-10">
          © 2026 AI ENTERTAINMENT
        </div>
      </div>
    );
  }

  // ===== TRANSITION TO PROFILE =====
  return <div className="scene-overlay animate-fadeOut" />;
};

export default BootSequence;
