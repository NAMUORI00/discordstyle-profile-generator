import { UserProfile } from '../types';
import { STATUS_COLORS } from '../constants';

export const generateStandaloneHTML = (profile: UserProfile): string => {
  const safeBio = profile.bio.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const cardBackgroundCSS = profile.theme.mode === 'gradient' ? `linear-gradient(to bottom right, ${profile.theme.primary} 0%, ${profile.theme.secondary} 100%)` : profile.theme.background;
  const contentOverlayCSS = profile.theme.mode === 'gradient' ? `background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));` : `background: transparent;`;
  const borderColors = profile.theme.mode === 'gradient' ? 'transparent' : profile.theme.background;
  const statusColor = STATUS_COLORS[profile.status];
  const playlistsJson = JSON.stringify(profile.playlists);

  let identityHTML = '';
  if (profile.identityFormat === 'modern') {
      const display = profile.displayName || profile.username;
      identityHTML = `<div><div class="username">${display}</div><div class="user-handle-row"><span class="user-handle">@${profile.username}</span>${profile.pronouns ? `<span class="pronouns">${profile.pronouns}</span>` : ''}</div></div>`;
  } else {
      identityHTML = `<div><span class="username">${profile.username}</span><span class="discriminator">#${profile.discriminator}</span></div>`;
  }
  
  const birthdayHTML = (profile.birthday && profile.showBirthday) ? `<div class="birthday-row"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5-2 4-2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg><span>${new Date(profile.birthday).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>` : '';
  const connectionsHTML = profile.connections && profile.connections.length > 0 ? `<div class="section-header">Connections</div><div class="connections-grid">${profile.connections.map(conn => `<a href="${conn.url}" target="_blank" class="connection-item"><img src="https://www.google.com/s2/favicons?sz=32&domain=${conn.url}" class="connection-icon" alt=""/><span class="connection-label">${conn.label}</span><svg class="external-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`).join('')}</div>` : '';

  const badgesHTML = profile.badges && profile.badges.length > 0 ? `<div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; max-width: 50%;">${profile.badges.map(b => {
          let style = b.style === 'solid' ? `background-color: ${b.color}; color: #fff; border: 1px solid transparent;` : b.style === 'outline' ? `background-color: transparent; color: ${b.color}; border: 1px solid ${b.color};` : b.style === 'soft' ? `background-color: ${b.color}33; color: ${b.color}; border: 1px solid transparent;` : `background-color: ${b.color}; color: #fff;`;
          return `<span class="discord-badge" style="${style}">${b.label}</span>`;
      }).join('')}</div>` : '';

  const activePlaylist = profile.playlists.length > 0 ? profile.playlists[0] : null;
  const playerHTML = (profile.musicEnabled && activePlaylist) ? `
    <div id="ad-popout" class="ad-popout">
        <div class="ad-popout-inner">
            <div id="player-container-visible" class="visible-player-container"></div>
            <p style="color:white; font-size:10px; margin-top:10px; text-align:center; opacity:0.8;">영상 플레이어 모드입니다.</p>
            <button onclick="togglePlayerVisibility(false)" class="skip-helper-btn" style="background:${profile.theme.button};">플레이어 숨기기</button>
        </div>
    </div>
    <div class="section-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>Listening To</span>
          <span id="scan-status" style="font-size:10px; color:#facc15; display:none; align-items:center; gap:4px; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
            <svg class="spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
            Scanning
          </span>
        </div>
        <span id="current-playlist-label" style="font-size:10px; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; opacity:0.6; color:#fff;">${activePlaylist.label}</span>
    </div>
    <div class="player-wrapper">
        <div class="player-container">
            <div id="album-art" class="album-art"></div>
            <div class="track-info">
                <div id="track-title" class="track-title">Loading...</div>
                <div class="track-meta">
                  <span id="track-artist">YouTube Music</span>
                  <span id="track-counter" class="track-counter" style="display:none"></span>
                </div>
                <div class="volume-container">
                    <button id="btn-mute" class="control-btn" style="padding:0; opacity:0.6;">
                      <svg id="icon-vol-high" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                      <svg id="icon-vol-off" style="display:none;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                    </button>
                    <input type="range" id="volume-slider" min="0" max="100" value="50" class="volume-slider" style="accent-color:${profile.theme.button};">
                </div>
            </div>
            <div class="controls">
                <button id="btn-reveal" class="control-btn" title="플레이어 보기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                <div style="width:1px; height:20px; background:rgba(255,255,255,0.1); margin:0 2px;"></div>
                <button id="btn-prev" class="control-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"></line></svg></button>
                <button id="btn-play" class="control-btn" style="color:${profile.theme.button};"><svg id="icon-play" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><svg id="icon-pause" style="display:none;" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg></button>
                <button id="btn-next" class="control-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"></line></svg></button>
                <button id="btn-playlists" class="control-btn" title="플레이리스트 선택"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15V6"></path><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path><path d="M12 12H3"></path><path d="M16 6H3"></path><path d="M12 18H3"></path></svg></button>
                <button id="btn-tracks" class="control-btn" title="트랙 보기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>
            </div>
        </div>
        <div id="drawer" class="playlist-drawer"><div class="drawer-header"><span id="drawer-title">SELECT PLAYLIST</span><button id="btn-close-drawer" style="background:none; border:none; color:#888; cursor:pointer;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg></button></div><div id="drawer-content"></div></div>
    </div>
    <div id="scanner" class="hidden-yt"></div>
  ` : '';

  const scripts = profile.musicEnabled ? `
    <script>
        const playlists = ${playlistsJson};
        let currentPlaylistId = playlists.length > 0 ? playlists[0].id : null;
        let drawerMode = null; let totalTracks = 0; let currentTrackIdx = 0; let isPlaying = false;
        let scannedMetadata = {}; let isScannerRunning = false;

        const canvas = document.getElementById('visualizer');
        const ctx = canvas ? canvas.getContext('2d') : null;
        let width, height;
        function resize() { if(!canvas) return; width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
        window.addEventListener('resize', resize); resize();
        const bars = 60; const radius = 150; let angleStep = (Math.PI * 2) / bars;
        function drawVisualizer() {
            if(!ctx) return;
            ctx.clearRect(0, 0, width, height); const centerX = width / 2; const centerY = height / 2;
            if (isPlaying) { 
              for(let i=0; i<3; i++) { ctx.beginPath(); ctx.fillStyle = '${profile.theme.primary}'; ctx.globalAlpha = 0.2; ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1.0; } 
            }
            
            ctx.beginPath(); ctx.strokeStyle = '${profile.theme.primary}'; ctx.lineWidth = 3; ctx.lineCap = 'round';
            for (let i = 0; i < bars; i++) { 
                const noise = isPlaying ? Math.random() * 40 + Math.sin(Date.now() / 200 + i) * 20 : 5; 
                const barHeight = Math.max(5, noise); const angle = i * angleStep; 
                const x1 = centerX + Math.cos(angle) * radius; const y1 = centerY + Math.sin(angle) * radius; 
                const x2 = centerX + Math.cos(angle) * (radius + barHeight); const y2 = centerY + Math.sin(angle) * (radius + barHeight); 
                ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); 
            }
            ctx.stroke();

            const pulse = isPlaying ? 5 + Math.sin(Date.now() / 150) * 3 : 0;
            ctx.beginPath(); ctx.arc(centerX, centerY, radius - 10 + pulse, 0, Math.PI * 2);
            ctx.fillStyle = '${profile.theme.primary}'; ctx.globalAlpha = 0.15; ctx.fill(); ctx.globalAlpha = 1.0;

            requestAnimationFrame(drawVisualizer);
        }
        drawVisualizer();

        var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0]; firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        var player, scanner;

        window.onYouTubeIframeAPIReady = function() {
            try {
                const initialId = playlists.length > 0 ? playlists[0].playlistId : '';
                player = new YT.Player('player-container-visible', {
                    height: '100%', width: '100%',
                    playerVars: { 'listType': 'playlist', 'list': initialId, 'autoplay': 0, 'controls': 1, 'disablekb': 1, 'fs': 0, 'playsinline': 1 },
                    events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
                });
                scanner = new YT.Player('scanner', {
                    height: '200', width: '200',
                    playerVars: { 'listType': 'playlist', 'list': initialId, 'autoplay': 1, 'controls': 0, 'disablekb': 1, 'fs': 0, 'playsinline': 1, 'mute': 1 },
                    events: { 'onReady': onScannerReady, 'onStateChange': onScannerStateChange, 'onError': onScannerError }
                });
            } catch(e) { console.error("YT API Init Error", e); }
        }

        function onPlayerReady(event) { if(player && player.setVolume) player.setVolume(50); updateTrackInfo(); }
        function onPlayerStateChange(event) {
            updateTrackInfo();
            if (event.data == YT.PlayerState.PLAYING) { isPlaying = true; document.getElementById('icon-play').style.display = 'none'; document.getElementById('icon-pause').style.display = 'block'; }
            else { isPlaying = false; document.getElementById('icon-play').style.display = 'block'; document.getElementById('icon-pause').style.display = 'none'; }
        }

        function updateTrackInfo() {
            try {
                if(player && player.getVideoData) {
                    const data = player.getVideoData();
                    if(data && data.video_id) {
                        document.getElementById('track-title').innerText = data.title || "Loading...";
                        document.getElementById('track-artist').innerText = data.author || "YouTube Music";
                        document.getElementById('album-art').style.backgroundImage = 'url(https://img.youtube.com/vi/' + data.video_id + '/hqdefault.jpg)';
                    }
                    if (player.getPlaylist) {
                        const list = player.getPlaylist();
                        if(list) { totalTracks = list.length; currentTrackIdx = player.getPlaylistIndex(); const counter = document.getElementById('track-counter'); counter.style.display = 'inline-block'; counter.innerText = (currentTrackIdx + 1) + ' / ' + totalTracks; }
                    }
                    if (drawerMode === 'tracks') renderTracks();
                }
            } catch(e) {}
        }

        function onScannerReady(event) { if(scanner) { scanner.mute(); initiateScan(); } }
        function initiateScan() { try { if (!scanner || !scanner.playVideoAt) return; isScannerRunning = true; document.getElementById('scan-status').style.display = 'flex'; scanner.playVideoAt(0); } catch(e) {} }
        function onScannerStateChange(event) {
            try {
                if (event.data == YT.PlayerState.PLAYING || event.data == YT.PlayerState.BUFFERING) {
                    const data = scanner.getVideoData(); const idx = scanner.getPlaylistIndex();
                    if (data && data.title) {
                        scannedMetadata[idx] = { title: data.title, author: data.author };
                        const list = scanner.getPlaylist(); const max = list ? list.length : 0; if (max > totalTracks) totalTracks = max;
                        const next = idx + 1; if (next < max) setTimeout(() => { if(scanner) scanner.playVideoAt(next); }, 200);
                        else { isScannerRunning = false; document.getElementById('scan-status').style.display = 'none'; scanner.pauseVideo(); }
                        if (drawerMode === 'tracks') renderTracks();
                    }
                }
            } catch(e) {}
        }
        function onScannerError() { try { const idx = scanner.getPlaylistIndex(); scanner.playVideoAt(idx + 1); } catch(e) {} }

        function togglePlayerVisibility(visible) {
            const popout = document.getElementById('ad-popout');
            if(!popout) return;
            popout.style.display = visible ? 'flex' : 'none';
        }

        const safeAttach = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };
        safeAttach('btn-reveal', () => togglePlayerVisibility(true));
        safeAttach('btn-play', () => { try { if(!player) return; isPlaying ? player.pauseVideo() : player.playVideo(); } catch(e) {} });
        safeAttach('btn-next', () => { try { if(player) player.nextVideo(); } catch(e) {} });
        safeAttach('btn-prev', () => { try { if(player) player.previousVideo(); } catch(e) {} });
        safeAttach('btn-playlists', () => toggleDrawer('playlists'));
        safeAttach('btn-tracks', () => toggleDrawer('tracks'));
        safeAttach('btn-close-drawer', () => { drawerMode = null; document.getElementById('drawer').style.maxHeight = '0'; });

        const volSlider = document.getElementById('volume-slider');
        const btnMute = document.getElementById('btn-mute');
        let lastVolume = 50;
        if(volSlider) volSlider.oninput = (e) => { try { const val = parseInt(e.target.value); player.setVolume(val); lastVolume = val; updateVolIcon(val); } catch(e) {} };
        if(btnMute) btnMute.onclick = () => { try { if (player.isMuted()) { player.unMute(); player.setVolume(lastVolume); volSlider.value = lastVolume; updateVolIcon(lastVolume); } else { player.mute(); volSlider.value = 0; updateVolIcon(0); } } catch(e) {} };
        function updateVolIcon(val) { const hi = document.getElementById('icon-vol-high'); const off = document.getElementById('icon-vol-off'); if(!hi || !off) return; if (val == 0) { hi.style.display = 'none'; off.style.display = 'block'; } else { hi.style.display = 'block'; off.style.display = 'none'; } }
        
        function switchPlaylist(playlistId) {
            try {
                const pl = playlists.find(p => String(p.id) === String(playlistId));
                if (!pl || !player) return;
                document.getElementById('current-playlist-label').innerText = pl.label;
                currentPlaylistId = playlistId; totalTracks = 0; scannedMetadata = {};
                player.loadPlaylist({ listType: 'playlist', list: pl.playlistId, index: 0, startSeconds: 0 });
                if (scanner) { scanner.loadPlaylist({ listType: 'playlist', list: pl.playlistId, index: 0, startSeconds: 0 }); initiateScan(); }
                document.getElementById('drawer').style.maxHeight = '0'; drawerMode = null;
            } catch(e) {}
        }

        function toggleDrawer(mode) {
            const dr = document.getElementById('drawer');
            if(!dr) return;
            if (drawerMode === mode) { dr.style.maxHeight = '0'; drawerMode = null; }
            else { drawerMode = mode; dr.style.maxHeight = '150px'; if (mode === 'playlists') renderPlaylists(); else renderTracks(); }
        }
        function renderPlaylists() {
            const title = document.getElementById('drawer-title'); if(title) title.innerText = "SELECT PLAYLIST";
            const cont = document.getElementById('drawer-content'); if(!cont) return; cont.innerHTML = '';
            playlists.forEach((pl) => {
                const btn = document.createElement('div'); btn.className = 'drawer-item ' + (String(pl.id) === String(currentPlaylistId) ? 'active' : '');
                btn.innerHTML = '<span>' + pl.label + '</span>' + (String(pl.id) === String(currentPlaylistId) ? '<div style="width:6px; height:6px; background:#22c55e; border-radius:50%;"></div>' : '');
                btn.onclick = () => switchPlaylist(pl.id); cont.appendChild(btn);
            });
        }
        function renderTracks() {
            const title = document.getElementById('drawer-title'); if(title) title.innerText = "PLAYLIST TRACKS";
            const cont = document.getElementById('drawer-content'); if(!cont) return; cont.innerHTML = '';
            for(let i = 0; i < totalTracks; i++) {
                const btn = document.createElement('div'); btn.className = 'drawer-item ' + (i === currentTrackIdx ? 'active' : '');
                const meta = scannedMetadata[i]; const trackTitle = meta ? meta.title : ('Track ' + (i + 1)); const author = meta ? meta.author : 'Loading...';
                btn.innerHTML = '<div style="display:flex; flex-direction:column; min-width:0;"><span class="truncate">' + trackTitle + '</span><span class="truncate" style="font-size:10px; color:#9ca3af;">' + author + '</span></div>' + (i === currentTrackIdx ? '<svg width="12" height="12" fill="#22c55e" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>' : '');
                btn.onclick = () => { if(player) player.playVideoAt(i); document.getElementById('drawer').style.maxHeight = '0'; drawerMode = null; };
                cont.appendChild(btn);
            }
        }
    </script>
  ` : '';

  const markdownParserScript = `
    <script>
      function parseDiscordMarkdown(text) {
        if(!text) return '';
        let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = html.replace(/^&gt; (.*$)/gm, '<blockquote class="discord-quote">$1</blockquote>');
        html = html.replace(/\\\`\\\`\\\`([\\s\\S]*?)\\\`\\\`\\\`/g, '<pre class="discord-pre"><code class="scrollbar-ghost">$1</code></pre>');
        html = html.replace(/\\\`([^\\\`]+)\\\`/g, '<code class="discord-inline-code">$1</code>');
        html = html.replace(/\\*\\*([^\\*]+)\\*\\*/g, '<b>$1</b>');
        html = html.replace(/\\*([^\\*]+)\\*/g, '<i>$1</i>');
        html = html.replace(/_([^_]+)_/g, '<i>$1</i>');
        html = html.replace(/__([^_]+)__/g, '<u>$1</u>');
        html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>');
        html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="discord-link">$1</a>');
        html = html.replace(/\\|\\|([^|]+)\\|\\|/g, '<span class="discord-spoiler" onclick="this.classList.toggle(\\'revealed\\')">$1</span>');
        html = html.replace(/\\n/g, '<br>'); return html;
      }
      const rawBio = \`${safeBio}\`;
      const bioEl = document.getElementById('bio-content');
      if(bioEl) bioEl.innerHTML = parseDiscordMarkdown(rawBio);
    </script>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.username}'s Profile</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #000; overflow: hidden; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .discord-card { background: ${cardBackgroundCSS}; width: 100%; max-width: 600px; border-radius: 8px; overflow: hidden; position: relative; z-index: 10; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .discord-banner { height: 240px; background-color: ${profile.theme.primary}; background-image: url('${profile.bannerUrl}'); background-size: cover; background-position: center; }
        .discord-avatar-container { position: absolute; top: 180px; left: 20px; border: 6px solid ${borderColors}; border-radius: 50%; width: 132px; height: 132px; background-color: ${borderColors}; }
        .discord-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .status-indicator { position: absolute; bottom: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; background-color: ${statusColor}; border: 6px solid ${borderColors}; }
        .content { margin-top: 60px; padding: 16px 20px; ${contentOverlayCSS} }
        .username { color: #fff; font-size: 24px; font-weight: 700; }
        .discriminator { color: rgba(255,255,255,0.7); font-size: 24px; font-weight: 500; }
        .user-handle-row { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
        .user-handle { color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 500; }
        .pronouns { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; color: #a1a1aa; font-size: 10px; }
        .section-header { color: rgba(255,255,255,0.7); text-transform: uppercase; font-weight: 700; font-size: 12px; margin-top: 20px; }
        .bio-text { color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5; }
        .connections-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .connection-item { display: flex; align-items: center; background-color: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 4px; text-decoration: none; color: rgba(255,255,255,0.8); font-size: 14px; transition: all 0.2s; }
        .connection-icon { width: 20px; height: 20px; margin-right: 8px; border-radius: 2px; }
        .player-wrapper { background-color: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; margin-top: 4px; }
        .player-container { padding: 12px; display: flex; align-items: center; gap: 12px; }
        .album-art { width: 56px; height: 56px; border-radius: 4px; background-color: #000; background-size: cover; background-position: center; flex-shrink: 0; }
        .track-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
        .track-title { color: #fff; font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .track-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 1px; }
        .track-counter { font-size: 10px; background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 3px; color: rgba(255,255,255,0.7); }
        .volume-container { display: flex; align-items: center; gap: 8px; margin-top: 6px; max-width: 120px; }
        .volume-slider { width: 100%; height: 4px; background: #4f545c; border-radius: 2px; outline: none; appearance: none; }
        .controls { display: flex; gap: 4px; align-items: center; flex-shrink: 0; }
        .control-btn { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; padding: 4px; transition: color 0.2s; }
        .control-btn:hover { color: #fff; }
        .playlist-drawer { max-height: 0; overflow-y: auto; transition: max-height 0.3s ease; background-color: rgba(0,0,0,0.2); }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: rgba(0,0,0,0.2); font-size: 10px; color: rgba(255,255,255,0.5); font-weight: bold; }
        .drawer-item { padding: 8px 12px; font-size: 12px; color: rgba(255,255,255,0.7); cursor: pointer; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .drawer-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .drawer-item.active { background: rgba(255,255,255,0.1); color: #fff; }
        .ad-popout { position: absolute; inset: 0; background: rgba(0,0,0,0.9); display: none; flex-direction: column; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .ad-popout-inner { width: 100%; max-width: 400px; }
        .visible-player-container { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; }
        .skip-helper-btn { margin-top: 15px; width: 100%; padding: 10px; border-radius: 20px; color: white; font-weight: bold; border: none; cursor: pointer; font-size: 13px; transition: transform 0.1s; }
        .hidden-yt { position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; opacity: 0; }
        #visualizer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
        .center-wrapper { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; z-index: 10; padding: 20px; }
        .discord-badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; text-transform: uppercase; font-weight: bold; display: inline-block; }
        .discord-quote { border-left: 4px solid #4f545c; padding-left: 10px; margin: 4px 0; color: #b9bbbe; }
        .discord-pre { background: #2f3136; padding: 8px; border-radius: 4px; overflow-x: auto; margin: 4px 0; border: 1px solid #202225; }
        .discord-inline-code { background: #2f3136; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.85em; }
        .discord-spoiler { background: #202225; color: transparent; border-radius: 3px; padding: 0 2px; cursor: pointer; transition: color 0.1s; }
        .discord-spoiler.revealed { background: #4f545c; color: inherit; }
        .discord-link { color: #00b0f4; text-decoration: none; }
        .discord-link:hover { text-decoration: underline; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .birthday-row { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 12px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    </style>
</head>
<body>
    <canvas id="visualizer"></canvas>
    <div class="center-wrapper">
        <div class="discord-card">
            <div class="discord-banner"></div>
            <div class="discord-avatar-container">
                <img src="${profile.avatarUrl}" alt="Avatar" class="discord-avatar">
                <div class="status-indicator"></div>
            </div>
            <div class="content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">${identityHTML}${badgesHTML}</div>
                <div class="section-header">About Me</div><div class="bio-text" id="bio-content"></div>${birthdayHTML}${connectionsHTML}${playerHTML}
            </div>
        </div>
    </div>
    ${markdownParserScript}
    ${scripts}
</body>
</html>`;
};