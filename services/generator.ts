import { UserProfile } from '../types';
import { ICONS, escapeHtml } from '../constants';

/**
 * Generates a fully standalone HTML file with all cinematic sequences,
 * profile card, YouTube music player, and Three.js particle background.
 * No external dependencies except CDN scripts.
 */
export const generateStandaloneHTML = (profile: UserProfile): string => {
  const safeDataStr = JSON.stringify(profile).replace(/</g, '\\u003c');
  const iconsStr = JSON.stringify(ICONS).replace(/</g, '\\u003c');

  // Build playlist data for YouTube
  const playlistsJson = JSON.stringify(profile.playlists).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(profile.displayName)}'s Neural Identity</title>
    
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"><\/script>
    
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Inter:wght@400;500;600;700;800&family=Press+Start+2P&display=swap" rel="stylesheet">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        cyan: '#00f3ff', hacker: '#00ff00', hackerRed: '#ff003c',
                        dcCard: '#111214', dcInner: '#1e1f22',
                        dcText: '#f2f3f5', dcSub: '#b5bac1', dcDiv: '#3f4147',
                        dcRole: '#292b2f', dcGreen: '#23a559'
                    },
                    fontFamily: { 
                        mono: ['"Fira Code"', 'monospace'], 
                        sans: ['"Inter"', 'sans-serif'],
                        pixel: ['"Press Start 2P"', 'cursive']
                    }
                }
            }
        }
    <\/script>
    <style>
        body { margin: 0; overflow: hidden; background-color: #050505; color: #fff; font-family: 'Inter', sans-serif; user-select: none; }
        #bg-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        
        .scene { position: absolute; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.8s ease-in-out; }
        .scene.active { opacity: 1; pointer-events: auto; }
        
        .custom-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #3f4147; border-radius: 3px; }

        .log-line { opacity: 0; transform: translateY(5px); animation: fadeUp 0.15s forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        .type-cursor::after { content: '█'; animation: blink 1s step-end infinite; color: inherit; }
        @keyframes blink { 50% { opacity: 0; } }

        .dc-markdown code { background: #111214; padding: 2px 4px; border-radius: 3px; font-family: 'Fira Code', monospace; font-size: 0.85em; color: #00f3ff; }
        .dc-markdown pre { background: #111214; padding: 8px; border-radius: 4px; margin-top: 6px; border: 1px solid #3f4147; font-family: 'Fira Code', monospace; font-size: 0.85em; white-space: pre-wrap; }
        .dc-markdown strong { color: #fff; }

        @keyframes scanAnim { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        
        @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-4px, 4px) } 40% { transform: translate(-4px, -4px) } 60% { transform: translate(4px, 4px) } 80% { transform: translate(4px, -4px) } 100% { transform: translate(0) } }
        .glitch-effect { animation: glitch 0.1s linear infinite; filter: contrast(150%) brightness(150%) hue-rotate(90deg); }
        
        .crt-overlay { background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%; pointer-events: none;}
        .noise-bg { background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E'); opacity: 0.15; pointer-events: none; mix-blend-mode: overlay; position: absolute; inset: 0; }
    </style>
</head>
<body class="antialiased">

<script id="app-data" type="application/json">${safeDataStr}<\/script>

<div id="app-root" class="absolute inset-0 w-full h-full">
    <canvas id="bg-canvas" class="fixed inset-0 z-0 pointer-events-none"></canvas>
    <canvas id="wireframe-canvas" class="fixed inset-0 z-[100] pointer-events-none opacity-0"></canvas>

    <!-- BOOT SCENE -->
    <div id="scene-boot" class="scene active bg-black/85 backdrop-blur-sm z-[50] flex-col">
        <div id="boot-ui" class="flex flex-col items-center">
            <h1 class="text-3xl md:text-5xl font-mono text-cyan mb-8 tracking-[0.2em] drop-shadow-[0_0_15px_rgba(0,243,255,0.6)] font-bold text-center">SYSTEM_STANDBY</h1>
            <button type="button" id="btn-boot" class="px-10 py-3.5 border border-cyan bg-cyan/10 text-cyan hover:bg-cyan hover:text-black font-mono font-bold tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] cursor-pointer">[ INITIALIZE ]</button>
        </div>
        <div id="sim-ui" class="hidden w-full max-w-5xl px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-10 relative">
            <div id="tensor-wrapper" class="flex flex-col gap-4 w-full max-w-sm mx-auto md:ml-auto md:mr-10 relative z-20">
                <div id="wrap-banner" class="w-full relative z-10">
                    <div class="text-cyan font-mono text-xs flex justify-between mb-1" id="lbl-banner"><span>> BANNER_IMAGE</span><span>[800x200]</span></div>
                    <div id="banner-container" class="relative w-full h-[120px] rounded border border-gray-800 bg-black overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                        <img id="raw-banner" src="${escapeHtml(profile.banner)}" crossorigin="anonymous" class="absolute inset-0 w-full h-full object-cover z-10">
                        <div id="scan-banner" class="hidden absolute inset-0 bg-gradient-to-b from-transparent via-cyan/50 to-transparent pointer-events-none mix-blend-screen z-20" style="animation:scanAnim 1.5s linear infinite"></div>
                    </div>
                </div>
                <div id="wrap-avatar" class="w-full relative z-20 mt-2">
                    <div class="text-hacker font-mono text-xs flex justify-between mb-1" id="lbl-avatar"><span>> AVATAR_IMAGE</span><span>[400x400]</span></div>
                    <div id="avatar-container" class="relative w-[140px] h-[140px] mx-auto rounded-full border border-gray-800 bg-black overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.1)]">
                        <img id="raw-avatar" src="${escapeHtml(profile.avatar)}" crossorigin="anonymous" class="absolute inset-0 w-full h-full object-cover z-10">
                        <div id="scan-avatar" class="hidden absolute inset-0 bg-gradient-to-b from-transparent via-hacker/50 to-transparent pointer-events-none mix-blend-screen z-20" style="animation:scanAnim 1.5s linear infinite"></div>
                    </div>
                </div>
            </div>
            <div id="terminal-box" class="w-full h-[400px] bg-dcInner border border-gray-800 rounded flex flex-col font-mono text-[11px] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10">
                <div class="bg-black px-3 py-2 border-b border-gray-800 flex items-center gap-2 text-gray-500">
                    <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div><div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span class="ml-2 font-bold text-cyan">inference_engine.sh</span>
                </div>
                <div class="p-4 flex-1 overflow-hidden flex flex-col justify-end">
                    <div id="term-logs" class="text-gray-400 space-y-1.5 flex flex-col"></div>
                    <div id="term-cursor-wrap" class="text-cyan mt-2 type-cursor hidden">> <span id="term-active"></span></div>
                </div>
            </div>
        </div>
    </div>

    <!-- CALL SCENE -->
    <div id="scene-call" class="scene z-[45] bg-black/80 backdrop-blur-xl flex-col gap-6">
        <div class="w-32 h-32 rounded-full relative bg-dcCard p-1 border border-gray-800 shadow-[0_0_50px_rgba(0,243,255,0.2)]">
            <img id="call-avatar" src="${escapeHtml(profile.avatar)}" class="w-full h-full rounded-full object-cover relative z-10 bg-black">
        </div>
        <div class="text-center">
            <h2 id="call-name" class="text-white text-2xl font-bold font-sans tracking-wide">${escapeHtml(profile.displayName)}</h2>
            <p class="text-cyan text-sm mt-1.5 font-sans font-medium drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">Incoming Neural Link...</p>
        </div>
        <div class="flex gap-10 mt-6 relative z-10 pointer-events-auto">
            <button type="button" id="btn-decline-call" class="w-14 h-14 rounded-full bg-[#da373c] flex items-center justify-center cursor-pointer hover:bg-[#a1282b] transition-colors border border-gray-900 shadow-[0_0_15px_rgba(218,55,60,0.5)]">
                <svg class="w-6 h-6 text-white" style="transform: rotate(135deg);" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            </button>
            <button type="button" id="btn-accept-call" class="w-14 h-14 rounded-full bg-dcGreen flex items-center justify-center shadow-[0_0_20px_#23a559] hover:bg-[#1a7c43] cursor-pointer border border-[#1a7c43] text-white">
                <svg class="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            </button>
        </div>
    </div>

    <!-- HACKED SCENE -->
    <div id="scene-hacked" class="scene z-[60] bg-[#050000] flex-col items-center justify-center pointer-events-auto">
        <div class="absolute inset-0 crt-overlay pointer-events-none"></div>
        <div class="absolute inset-0 noise-bg pointer-events-none opacity-20"></div>
        <pre class="text-[#ff003c] font-mono text-[10px] md:text-[12px] drop-shadow-[0_0_15px_rgba(255,0,60,0.8)] leading-tight text-center glitch-effect mb-6">
           ______
        .-"      "-.
       /            \\
      |              |
      |,  .-.  .-.  ,|
      | )(__/  \\__)( |
      |/     /\\     \\|
      (_     ^^     _)
       \\__|IIIIII|__/
        | \\IIIIII/ |
        \\          /
         \`--------\`
        </pre>
        <h1 class="text-[#ff003c] text-3xl md:text-5xl font-bold font-mono tracking-widest drop-shadow-[0_0_10px_rgba(255,0,60,0.8)] text-center mb-2">SYSTEM BREACHED</h1>
        <p class="text-red-500 font-mono text-sm tracking-widest text-center">> CRITICAL FAILURE. CONNECTION INTERCEPTED.</p>
        <div class="mt-10 w-full max-w-lg bg-black/90 border border-[#ff003c] p-6 font-mono text-sm shadow-[0_0_30px_rgba(255,0,60,0.3)] relative z-10">
            <div class="text-gray-500 mb-4">> HINT: Execute <span class="text-white font-bold bg-red-900/50 px-2 py-0.5 rounded border border-red-500/50">sudo restore</span> to purge intrusion.</div>
            <div class="flex items-center text-[#ff003c] font-bold">
                <span class="mr-3">root@sys:~#</span>
                <input type="text" id="hack-input" class="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-gray-700" autocomplete="off" spellcheck="false" placeholder="_">
            </div>
        </div>
    </div>

    <!-- RETRO SCENE -->
    <div id="scene-retro" class="scene z-[55] bg-black flex-col items-center justify-center font-pixel">
        <div class="absolute inset-0 crt-overlay pointer-events-none"></div>
        <div class="text-[#00ff00] text-3xl md:text-6xl font-bold tracking-widest mb-16 text-center leading-relaxed" style="text-shadow: 4px 4px 0 #005500, -2px -2px 0 #002200;">NEURAL<br>FANTASY</div>
        <div class="flex flex-col items-center gap-8 text-white text-xs md:text-lg tracking-widest">
            <div id="retro-start" class="animate-pulse">> AUTO START <</div>
        </div>
        <div class="absolute bottom-12 text-[8px] md:text-[10px] text-gray-500 tracking-widest">© 2026 AI ENTERTAINMENT</div>
    </div>

    <!-- PROFILE SCENE -->
    <div id="scene-profile" class="scene z-[40] bg-black/50 backdrop-blur-md overflow-y-auto custom-scroll pt-10 pb-20 items-start md:items-center pointer-events-auto">
        <div class="flex flex-col lg:flex-row items-start justify-center gap-6 w-full max-w-[850px] px-4 my-auto">
            <div id="profile-card-wrap" class="w-full max-w-[360px] mx-auto lg:mx-0 bg-dcCard rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-gray-800/80 shrink-0 flex flex-col relative z-10 pb-4">
                <div id="dc-banner" class="h-[120px] bg-cover bg-center rounded-t-[16px] relative z-0 w-full"></div>
                <div class="px-4 pb-2 relative flex-1 flex flex-col z-10">
                    <div class="absolute -top-[50px] left-4 z-20">
                        <div class="w-[100px] h-[100px] rounded-full border-[6px] border-dcCard bg-dcCard relative shadow-lg">
                            <img id="dc-avatar" src="" class="w-full h-full rounded-full object-cover bg-black">
                            <div class="absolute bottom-0 right-0 w-[22px] h-[22px] bg-dcGreen border-[4px] border-dcCard rounded-full shadow-sm z-30"></div>
                        </div>
                    </div>
                    <div class="pt-[60px]">
                        <div class="bg-dcInner rounded-[8px] p-4 border border-gray-800 shadow-inner flex flex-col h-full">
                            <div class="flex items-center gap-1.5 mb-1 flex-wrap" id="dc-name-badges"></div>
                            <div class="text-[14px] text-dcSub font-medium mb-3 flex flex-wrap items-center gap-1.5">
                                <span id="dc-user" class="text-dcText"></span><span class="text-dcSub">•</span><span id="dc-pro"></span>
                            </div>
                            <div class="text-[14px] text-dcText flex items-center gap-2 pb-3 border-b border-dcDiv">
                                <span id="dc-emoji"></span> <span id="dc-status"></span>
                            </div>
                            <div class="mt-3 flex flex-col flex-1">
                                <div class="flex items-center justify-between border-b border-dcDiv mb-1.5"><div id="bio-tabs" class="flex gap-3 overflow-x-auto custom-scroll shrink-0"></div></div>
                                <div id="dc-bio" class="text-[13px] text-dcText leading-relaxed dc-markdown break-words max-h-[160px] overflow-y-auto custom-scroll pr-2 mt-1"></div>
                            </div>
                            <div class="mt-4"><h2 class="text-[11px] font-bold text-dcSub uppercase tracking-wide mb-1.5">Roles</h2><div id="dc-roles" class="flex flex-wrap gap-1.5"></div></div>
                            <div id="dc-buttons" class="mt-5 pt-4 border-t border-dcDiv flex flex-wrap gap-2 w-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- YouTube Music Panel -->
            <div id="music-panel" class="w-full max-w-[340px] mx-auto lg:mx-0 bg-[#09090b] border border-gray-800 rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.9),_inset_0_0_20px_rgba(0,243,255,0.05)] overflow-hidden shrink-0 flex flex-col relative font-mono h-fit">
                <div class="h-1.5 bg-gradient-to-r from-cyan to-hacker w-full shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
                <div class="p-5">
                    <div class="flex items-center justify-between mb-2">
                        <h2 class="text-cyan font-bold text-sm">> AUDIO_TENSOR_CORE</h2>
                        <span id="yt-state" class="text-[10px] text-gray-500 border border-gray-700 px-1.5 py-0.5 rounded shadow-sm">IDLE</span>
                    </div>
                    <p class="text-[10px] text-gray-400 mb-5 leading-relaxed tracking-wide">Streaming audio via YouTube Neural Link.</p>
                    <div class="relative w-full h-[120px] bg-black border border-gray-800 rounded-lg overflow-hidden flex items-end px-2 pb-1 mb-5 shadow-[inset_0_0_20px_rgba(0,243,255,0.05)]">
                        <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: radial-gradient(#00f3ff 1px, transparent 1px); background-size: 10px 10px;"></div>
                        <div id="yt-bars" class="flex items-end justify-between w-full h-[90%] z-10 gap-[2px]"></div>
                    </div>
                    <div class="bg-dcInner border border-gray-800 rounded-lg p-3">
                        <div class="text-[13px] font-bold text-white truncate mb-1" id="yt-title">Loading...</div>
                        <div class="text-[11px] text-hacker truncate mb-4">> YouTubePlayer.stream()</div>
                        <div id="yt-playlists" class="flex gap-1 mb-3 overflow-x-auto custom-scroll pb-1"></div>
                        <div class="flex gap-2">
                            <button type="button" id="yt-prev" class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded text-[11px] font-bold transition-colors border border-gray-700 uppercase">[ PREV ]</button>
                            <button type="button" id="yt-play" class="flex-[1.5] bg-cyan/10 hover:bg-cyan hover:text-black text-cyan border border-cyan py-2.5 rounded text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)] uppercase">[ PLAY ]</button>
                            <button type="button" id="yt-next" class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded text-[11px] font-bold transition-colors border border-gray-700 uppercase">[ NEXT ]</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
(function(){
    var esc = function(s){return(s||'').toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");};
    var ICONS = ${iconsStr};
    var PLAYLISTS = ${playlistsJson};
    var state = ${safeDataStr};
    var activeTabIdx = 0;
    var ROLE_COLORS = ['#00f3ff','#00ff00','#f47fff','#f0b232','#da373c'];

    function parseMarkdown(text){
        var codeBlocks=[];
        var r=text.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g,function(m,p1){codeBlocks.push(p1);return '__CB_'+(codeBlocks.length-1)+'__';});
        r=esc(r).replace(/\\n/g,'<br>').replace(/\`([^\`]+)\`/g,'<code class="text-cyan bg-black px-1 rounded">$1</code>').replace(/\\*\\*([^*]+)\\*\\*/g,'<strong class="text-white">$1</strong>');
        r=r.replace(/__CB_(\\d+)__/g,function(m,p1){return '<pre class="bg-black border border-gray-700 p-2 mt-2 rounded overflow-x-auto text-cyan font-mono text-[11px] leading-relaxed"><code>'+esc(codeBlocks[parseInt(p1)])+'</code></pre>';});
        return r;
    }

    function selectTab(idx){activeTabIdx=idx;renderProfile();}
    window.selectTab=selectTab;

    function renderProfile(){
        var nb=document.getElementById('dc-name-badges');
        if(nb){
            nb.innerHTML='<h1 class="text-[20px] font-bold text-dcText leading-none break-words mr-1">'+esc(state.displayName)+'</h1>';
            state.badges.forEach(function(b){
                var ic=ICONS[b.icon]||'';
                var ih=ic?'<div class="w-3 h-3">'+ic+'</div>':'';
                nb.innerHTML+='<span class="text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold shadow-sm" style="background-color:'+esc(b.color)+'">'+ih+' '+esc(b.label)+'</span>';
            });
        }
        var u=document.getElementById('dc-user');if(u)u.textContent=state.username;
        var p=document.getElementById('dc-pro');if(p)p.textContent=state.pronouns;
        var e=document.getElementById('dc-emoji');if(e)e.textContent=state.statusEmoji;
        var s=document.getElementById('dc-status');if(s)s.textContent=state.statusText;
        
        var av=document.getElementById('dc-avatar');if(av)av.src=state.avatar;
        var bn=document.getElementById('dc-banner');
        if(bn){
            if(state.banner){bn.style.backgroundImage='url("'+state.banner.replace(/"/g,'\\\\"')+'")';bn.style.backgroundColor='transparent';}
            else{bn.style.backgroundImage='none';bn.style.backgroundColor=state.bannerColor||'#000';}
        }

        // Tabs
        var tc=document.getElementById('bio-tabs');
        if(tc&&state.aboutTabs.length>0){
            if(activeTabIdx>=state.aboutTabs.length)activeTabIdx=0;
            tc.innerHTML='';
            state.aboutTabs.forEach(function(tab,i){
                var ac=i===activeTabIdx?'text-dcText border-b-2 border-cyan':'text-dcSub hover:text-dcText cursor-pointer border-b-2 border-transparent';
                tc.innerHTML+='<button type="button" onclick="selectTab('+i+')" class="text-[11px] font-bold uppercase tracking-wide pb-0.5 transition-colors whitespace-nowrap outline-none '+ac+'">'+esc(tab.title)+'</button>';
            });
            document.getElementById('dc-bio').innerHTML=parseMarkdown(state.aboutTabs[activeTabIdx].content||'');
        }

        // Roles
        var rc=document.getElementById('dc-roles');
        if(rc){
            rc.innerHTML='';
            state.roles.forEach(function(r,i){
                if(r.trim())rc.innerHTML+='<div class="bg-dcRole border border-gray-700/50 rounded px-1.5 py-0.5 flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full" style="background-color:'+ROLE_COLORS[i%ROLE_COLORS.length]+'"></div><span class="text-[11px] text-dcText font-medium">'+esc(r)+'</span></div>';
            });
        }

        // Buttons
        var bc=document.getElementById('dc-buttons');
        if(bc){
            bc.innerHTML='';
            if(state.buttons.length>0){
                bc.style.display='flex';
                state.buttons.forEach(function(btn){
                    var bg='bg-[#4E5058] hover:bg-[#6D6F78]';
                    if(btn.style==='primary')bg='bg-[#5865F2] hover:bg-[#4752C4]';
                    else if(btn.style==='success')bg='bg-[#23a559] hover:bg-[#1a7c43]';
                    else if(btn.style==='danger')bg='bg-[#da373c] hover:bg-[#a1282b]';
                    var ic=ICONS[btn.icon]||'';
                    var ih=ic?'<div class="w-4 h-4 flex items-center justify-center shrink-0">'+ic+'</div>':'';
                    bc.innerHTML+='<a href="'+esc(btn.url||'#')+'" target="_blank" class="flex-1 basis-auto min-w-[30%] flex items-center justify-center gap-1.5 text-white py-2 rounded text-[12px] font-bold transition-colors shadow-sm '+bg+' px-2">'+ih+'<span class="truncate">'+esc(btn.label||'Link')+'</span></a>';
                });
            } else bc.style.display='none';
        }

        // Music panel visibility
        var mp=document.getElementById('music-panel');
        if(mp) mp.style.display=state.musicEnabled&&PLAYLISTS.length>0?'flex':'none';
    }

    renderProfile();

    // === THREE.JS BACKGROUND ===
    var canvas=document.getElementById('bg-canvas');
    var scn=new THREE.Scene();scn.fog=new THREE.FogExp2(0x050505,0.0012);
    var camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,1500);camera.position.z=400;
    var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});renderer.setSize(window.innerWidth,window.innerHeight);
    var pCount=200;var pos=new Float32Array(pCount*3);var vel=[];
    for(var i=0;i<pCount;i++){pos[i*3]=(Math.random()-0.5)*1000;pos[i*3+1]=(Math.random()-0.5)*1000;pos[i*3+2]=(Math.random()-0.5)*1000;vel.push({x:(Math.random()-0.5)*1.2,y:(Math.random()-0.5)*1.2,z:(Math.random()-0.5)*1.2});}
    var pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    var cCyan=new THREE.Color(0x00f3ff);var cGreen=new THREE.Color(0x00ff00);
    var pMat=new THREE.PointsMaterial({color:cCyan,size:2.5,transparent:true,blending:THREE.AdditiveBlending});
    scn.add(new THREE.Points(pGeo,pMat));
    var lGeo=new THREE.BufferGeometry();lGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pCount*pCount*3),3));
    var lMat=new THREE.LineBasicMaterial({color:cGreen,transparent:true,opacity:0.15,blending:THREE.AdditiveBlending});
    scn.add(new THREE.LineSegments(lGeo,lMat));
    window.addEventListener('resize',function(){camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});
    var simSpeed=1;
    function animate(){
        requestAnimationFrame(animate);
        var pArr=pGeo.attributes.position.array;var lArr=lGeo.attributes.position.array;var lIdx=0;var thr=15000;
        for(var i=0;i<pCount;i++){pArr[i*3]+=vel[i].x*simSpeed;pArr[i*3+1]+=vel[i].y*simSpeed;pArr[i*3+2]+=vel[i].z*simSpeed;if(Math.abs(pArr[i*3])>600)vel[i].x*=-1;if(Math.abs(pArr[i*3+1])>600)vel[i].y*=-1;if(Math.abs(pArr[i*3+2])>600)vel[i].z*=-1;
        for(var j=i+1;j<pCount;j++){var dx=pArr[i*3]-pArr[j*3],dy=pArr[i*3+1]-pArr[j*3+1],dz=pArr[i*3+2]-pArr[j*3+2];if(dx*dx+dy*dy+dz*dz<thr){lArr[lIdx++]=pArr[i*3];lArr[lIdx++]=pArr[i*3+1];lArr[lIdx++]=pArr[i*3+2];lArr[lIdx++]=pArr[j*3];lArr[lIdx++]=pArr[j*3+1];lArr[lIdx++]=pArr[j*3+2];}}}
        pGeo.attributes.position.needsUpdate=true;lGeo.setDrawRange(0,lIdx/3);lGeo.attributes.position.needsUpdate=true;scn.rotation.y+=0.001*simSpeed;renderer.render(scn,camera);
    }
    animate();

    // === BOOT SEQUENCE ===
    var btnBoot=document.getElementById('btn-boot');
    if(btnBoot){
        btnBoot.addEventListener('click',function(){
            btnBoot.disabled=true;
            gsap.to('#boot-ui',{opacity:0,duration:0.5,onComplete:function(){
                document.getElementById('boot-ui').style.display='none';
                var simUI=document.getElementById('sim-ui');simUI.classList.remove('hidden');
                gsap.fromTo(simUI,{opacity:0},{opacity:1,duration:0.8});
            }});
            setTimeout(function(){simSpeed=4;runTerminal();},1500);
        });
    }

    function runTerminal(){
        document.getElementById('term-cursor-wrap').style.display='block';
        document.getElementById('scan-banner').style.display='block';
        document.getElementById('scan-avatar').style.display='block';
        var logBox=document.getElementById('term-logs');
        var activeLine=document.getElementById('term-active');
        var lines=[
            '[SYS] Extracting Banner Latents...','[SYS] Extracting Avatar Latents...','[FLOW] Fusing Latent Vectors...',
            '[FUSION] Tensors Merged.','[FLOW] Transmitting to Inference Engine...',
            '[TRAIN] Epoch 100/5000 | Loss: 2.3412','[TRAIN] Epoch 1000/5000 | Loss: 0.8241',
            '[TRAIN] Epoch 3500/5000 | Loss: 0.0412','[TRAIN] Epoch 5000/5000 | Loss: 0.0001',
            '[INFER] Decoding Latent Vectors...','> Extracting Wireframe Matrices...'
        ];
        var idx=0;
        function nextLog(){
            if(idx>=lines.length){showCall();return;}
            var l=lines[idx];
            activeLine.textContent='sys_'+(Math.random()*0xffff|0).toString(16)+'.log';
            var c=l.includes('Loss')?'text-hacker':'text-cyan';
            logBox.innerHTML+='<div class="log-line '+c+'">> '+l+'</div>';
            logBox.scrollTop=logBox.scrollHeight;
            idx++;
            setTimeout(nextLog,l.includes('Loss')?250:500);
        }
        nextLog();
    }

    function showCall(){
        simSpeed=1;
        gsap.to('#scene-boot',{opacity:0,duration:0.6,onComplete:function(){
            document.getElementById('scene-boot').classList.remove('active');
            var callUI=document.getElementById('scene-call');
            callUI.classList.add('active');
            gsap.to(callUI,{opacity:1,duration:0.5});
            
            document.getElementById('btn-accept-call').onclick=function(){
                gsap.to(callUI,{opacity:0,duration:0.3,onComplete:function(){
                    callUI.classList.remove('active');
                    showProfile();
                }});
            };
            
            document.getElementById('btn-decline-call').onclick=function(){
                gsap.to(callUI,{opacity:0,duration:0.4,onComplete:function(){
                    callUI.classList.remove('active');
                    showHacked();
                }});
            };
        }});
    }

    function showHacked(){
        var sh=document.getElementById('scene-hacked');
        sh.classList.add('active');gsap.to(sh,{opacity:1,duration:0.1});
        var hi=document.getElementById('hack-input');
        setTimeout(function(){hi.focus();},500);
        document.body.addEventListener('click',function(){if(sh.classList.contains('active')&&!hi.disabled)hi.focus();});
        hi.onkeydown=function(e){
            if(e.key==='Enter'){
                if(hi.value.trim().toLowerCase()==='sudo restore'){
                    hi.disabled=true;hi.value='PURGING INTRUSION...';hi.classList.replace('text-white','text-green-500');
                    gsap.to(sh,{opacity:0,duration:2,onComplete:function(){
                        sh.classList.remove('active');showRetro();
                    }});
                } else {hi.value='';gsap.fromTo(sh,{x:-10},{x:10,duration:0.05,yoyo:true,repeat:5});}
            }
        };
    }

    function showRetro(){
        var sr=document.getElementById('scene-retro');sr.classList.add('active');gsap.to(sr,{opacity:1,duration:0.5});
        setTimeout(function(){
            gsap.to(sr,{opacity:0,duration:0.5,delay:0.5,onComplete:function(){sr.classList.remove('active');showProfile();}});
        },2500);
    }

    function showProfile(){
        var sp=document.getElementById('scene-profile');sp.classList.add('active');
        gsap.fromTo('#profile-card-wrap',{scale:0.95,opacity:0,y:30},{scale:1,opacity:1,y:0,duration:0.6,ease:'back.out(1.2)'});
        gsap.fromTo('#music-panel',{scale:0.95,opacity:0,y:30},{scale:1,opacity:1,y:0,duration:0.6,delay:0.1,ease:'back.out(1.2)'});
        gsap.to(sp,{opacity:1,duration:0.5});
        initYouTube();
    }

    // === YOUTUBE MUSIC ===
    var ytPlayer=null;var ytPlaying=false;var ytPLIdx=0;
    var barCount=24;
    var barsCont=document.getElementById('yt-bars');
    for(var b=0;b<barCount;b++){var bar=document.createElement('div');bar.className='flex-1 rounded-t transition-all duration-75 opacity-90 bg-cyan';bar.style.height='5%';barsCont.appendChild(bar);}
    
    function animBars(){
        requestAnimationFrame(animBars);
        var bars=barsCont.children;
        for(var i=0;i<bars.length;i++){
            if(ytPlaying){var v=Math.random()*0.7+0.1+Math.sin(Date.now()/200+i*0.5)*0.2;bars[i].style.height=Math.max(5,v*100)+'%';bars[i].style.backgroundColor=v>0.7?'#00ff00':'#00f3ff';}
            else{bars[i].style.height='5%';bars[i].style.backgroundColor='#00f3ff';}
        }
    }
    animBars();

    // Playlist buttons
    var plCont=document.getElementById('yt-playlists');
    PLAYLISTS.forEach(function(pl,i){
        var btn=document.createElement('button');
        btn.className='text-[9px] px-2 py-1 rounded whitespace-nowrap transition-colors '+(i===0?'bg-cyan/20 text-cyan border border-cyan/50':'bg-gray-800 text-gray-400 hover:text-white border border-gray-700');
        btn.textContent=pl.label;
        btn.onclick=function(){
            ytPLIdx=i;
            if(ytPlayer&&ytPlayer.loadPlaylist)ytPlayer.loadPlaylist({listType:'playlist',list:pl.playlistId,index:0});
            plCont.querySelectorAll('button').forEach(function(b,j){
                b.className='text-[9px] px-2 py-1 rounded whitespace-nowrap transition-colors '+(j===i?'bg-cyan/20 text-cyan border border-cyan/50':'bg-gray-800 text-gray-400 hover:text-white border border-gray-700');
            });
        };
        plCont.appendChild(btn);
    });

    function initYouTube(){
        if(!state.musicEnabled||PLAYLISTS.length===0)return;
        var tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady=function(){
            var div=document.createElement('div');div.id='yt-hidden';div.style.cssText='position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';document.body.appendChild(div);
            ytPlayer=new YT.Player('yt-hidden',{
                height:'1',width:'1',
                playerVars:{listType:'playlist',list:PLAYLISTS[0].playlistId,autoplay:0,controls:0},
                events:{
                    onReady:function(e){e.target.setVolume(50);},
                    onStateChange:function(e){
                        if(e.data===1){ytPlaying=true;updateYTUI();var d=e.target.getVideoData();if(d)document.getElementById('yt-title').textContent=d.title||'Playing...';}
                        else if(e.data===2||e.data===0){ytPlaying=false;updateYTUI();}
                    }
                }
            });
        };
    }

    function updateYTUI(){
        var btn=document.getElementById('yt-play');
        var st=document.getElementById('yt-state');
        if(ytPlaying){
            btn.textContent='[ PAUSE ]';btn.className='flex-[1.5] bg-hacker/20 hover:bg-hacker hover:text-black text-hacker border border-hacker py-2.5 rounded text-[11px] font-bold transition-all shadow-[0_0_15px_rgba(0,255,0,0.4)] uppercase';
            st.textContent='COMPUTING';st.className='text-[10px] text-hacker animate-pulse font-bold border border-hacker/50 px-1.5 py-0.5 rounded shadow-[0_0_5px_#00ff00]';
        } else {
            btn.textContent='[ PLAY ]';btn.className='flex-[1.5] bg-cyan/10 hover:bg-cyan hover:text-black text-cyan border border-cyan py-2.5 rounded text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)] uppercase';
            st.textContent='STANDBY';st.className='text-[10px] text-gray-500 font-bold border border-gray-700 px-1.5 py-0.5 rounded shadow-sm';
        }
    }

    document.getElementById('yt-play').onclick=function(){if(!ytPlayer)return;if(ytPlaying)ytPlayer.pauseVideo();else ytPlayer.playVideo();};
    document.getElementById('yt-next').onclick=function(){if(ytPlayer)ytPlayer.nextVideo();};
    document.getElementById('yt-prev').onclick=function(){if(ytPlayer)ytPlayer.previousVideo();};

})();
<\/script>
</body>
</html>`;
};
