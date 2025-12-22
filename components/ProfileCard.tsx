import React, { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { UserProfile, TrackInfo, Badge } from '../types';
import { STATUS_COLORS } from '../constants';
import { Play, Pause, SkipBack, SkipForward, Music, ExternalLink, List, ListMusic, ChevronUp, Volume2, Volume1, VolumeX, RefreshCw, Cake, Eye, EyeOff } from 'lucide-react';

interface ProfileCardProps {
  profile: UserProfile;
  setIsPlaying: (playing: boolean) => void;
  isPlaying: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, setIsPlaying, isPlaying }) => {
  const [player, setPlayer] = useState<any>(null);
  const [trackTitle, setTrackTitle] = useState("Loading...");
  const [trackAuthor, setTrackAuthor] = useState("YouTube Music");
  const [currentVideoId, setCurrentVideoId] = useState("");
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  
  const [scanner, setScanner] = useState<any>(null);
  const [scannedTracks, setScannedTracks] = useState<TrackInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const scanIndexRef = useRef(0);
  
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'playlists' | 'tracks'>('playlists');
  
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(1);
  const [totalTracks, setTotalTracks] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const parseDiscordMarkdown = (text: string) => {
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/^&gt; (.*$)/gm, '<blockquote class="discord-quote">$1</blockquote>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="discord-pre"><code class="scrollbar-ghost">$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="discord-inline-code">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    html = html.replace(/\*([^*]+)\*/g, '<i>$1</i>');
    html = html.replace(/_([^_]+)_/g, '<i>$1</i>');
    html = html.replace(/__([^_]+)__/g, '<u>$1</u>');
    html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="discord-link">$1</a>');
    html = html.replace(/\|\|([^|]+)\|\|/g, '<span class="discord-spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');
    html = html.replace(/\n/g, '<br>');
    return html;
  };

  const getBadgeStyle = (badge: Badge): React.CSSProperties => {
      const baseStyle: React.CSSProperties = { backgroundColor: 'transparent', color: badge.color, border: '1px solid transparent' };
      if (badge.style === 'solid') { baseStyle.backgroundColor = badge.color; baseStyle.color = '#fff'; }
      else if (badge.style === 'outline') { baseStyle.border = `1px solid ${badge.color}`; }
      else if (badge.style === 'soft') { baseStyle.backgroundColor = `${badge.color}33`; }
      return baseStyle;
  };

  useEffect(() => {
    if (profile.playlists.length > 0) {
        const exists = profile.playlists.find(p => p.id === activePlaylistId);
        if (!activePlaylistId || !exists) setActivePlaylistId(profile.playlists[0].id);
    } else {
        setActivePlaylistId(null);
    }
  }, [profile.playlists, activePlaylistId]);

  const activePlaylist = profile.playlists.find(p => p.id === activePlaylistId) || profile.playlists[0];

  useEffect(() => {
      if (isPlayerReady && player && activePlaylist && player.loadPlaylist) {
          try {
              player.loadPlaylist({ listType: 'playlist', list: activePlaylist.playlistId, index: 0, startSeconds: 0 });
          } catch (e) {
              console.error("loadPlaylist error:", e);
          }
      }
  }, [activePlaylist?.id, isPlayerReady]);

  useEffect(() => {
      setScannedTracks([]);
      setTotalTracks(0);
      setTrackTitle("Loading Playlist...");
      scanIndexRef.current = 0;
      setIsScanning(true);
      // 플레이리스트 변경 시 player 준비 상태는 유지 (이미 준비된 상태이므로)
  }, [activePlaylist?.id]);

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: { listType: 'playlist', list: activePlaylist ? activePlaylist.playlistId : '', autoplay: 0, controls: 1, disablekb: 1, fs: 0, playsinline: 1 },
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    const p = event.target as any;
    setPlayer(p);
    p.setVolume(volume);
    if (activePlaylist) p.cuePlaylist({ listType: 'playlist', list: activePlaylist.playlistId, index: 0, startSeconds: 0 });
    updateTrackInfo(p);
    // 플레이어가 완전히 초기화된 후 준비 상태 설정
    setTimeout(() => setIsPlayerReady(true), 150);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) { setIsPlaying(true); updateTrackInfo(event.target); }
    else if (event.data === 2) { setIsPlaying(false); }
    else if (event.data === -1) { updateTrackInfo(event.target); }
  };

  const updateTrackInfo = (target: any) => {
     if (target && target.getVideoData) {
         const data = target.getVideoData();
         if (data) {
             setTrackTitle(data.title || "Loading...");
             setTrackAuthor(data.author || "YouTube Music");
             setCurrentVideoId(data.video_id);
         }
         if (target.getPlaylistIndex) setTrackIndex(target.getPlaylistIndex() + 1);
     }
  };

  const onScannerReady: YouTubeProps['onReady'] = (event) => {
      const s = event.target as any;
      setScanner(s);
      s.mute();
      s.setVolume(0);
      if (s.getPlaylist) {
          const list = s.getPlaylist();
          if (list) {
              setTotalTracks(list.length);
              setScannedTracks(Array(list.length).fill(null).map((_, i) => ({ index: i, id: list[i], title: `Track ${i + 1}`, author: 'Loading...' })));
          }
      }
      initiateScan(s);
  };

  const initiateScan = (s: any) => {
      if (!s) return;
      scanIndexRef.current = 0;
      setIsScanning(true);
      s.playVideoAt(0);
  };

  const onScannerStateChange: YouTubeProps['onStateChange'] = (event) => {
      const s = event.target as any;
      if (event.data === 1 || event.data === 3) {
          const data = s.getVideoData();
          const currentIndex = s.getPlaylistIndex();
          if (data && data.title && data.title !== "") {
              setScannedTracks(prev => {
                  const newTracks = [...prev];
                  if (newTracks.length <= currentIndex) newTracks[currentIndex] = { index: currentIndex, id: data.video_id, title: data.title, author: data.author };
                  else newTracks[currentIndex] = { ...newTracks[currentIndex], id: data.video_id, title: data.title, author: data.author };
                  return newTracks;
              });
              if (s.getPlaylist) {
                  const list = s.getPlaylist();
                  if (list && list.length > totalTracks) setTotalTracks(list.length);
              }
              const nextIdx = currentIndex + 1;
              if (nextIdx < totalTracks || (s.getPlaylist && nextIdx < s.getPlaylist().length)) {
                  setTimeout(() => { if (s && s.playVideoAt) s.playVideoAt(nextIdx); }, 200);
              } else {
                  setIsScanning(false);
                  s.pauseVideo();
              }
          }
      }
  };

  const onScannerError = () => { if (scanner) { const nextIdx = scanIndexRef.current + 1; scanIndexRef.current = nextIdx; scanner.playVideoAt(nextIdx); } };

  const handlePlayPause = () => { if (!player) return; if (isPlaying) player.pauseVideo(); else player.playVideo(); };
  const handleNext = () => { if(player) player.nextVideo(); };
  const handlePrev = () => { if(player) player.previousVideo(); };
  const handlePlaylistSwitch = (id: string) => { setActivePlaylistId(id); setIsDrawerOpen(false); };
  const handleTrackJump = (index: number) => { if (player && player.playVideoAt) { player.playVideoAt(index); setIsDrawerOpen(false); } };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newVol = parseInt(e.target.value); setVolume(newVol); if (newVol > 0) setIsMuted(false); if (player) player.setVolume(newVol); };
  const toggleMute = () => { if (!player) return; if (isMuted) { player.unMute(); player.setVolume(volume); setIsMuted(false); } else { player.mute(); setIsMuted(true); } };

  const toggleDrawer = (mode: 'playlists' | 'tracks') => {
      if (isDrawerOpen && drawerMode === mode) setIsDrawerOpen(false);
      else { setDrawerMode(mode); setIsDrawerOpen(true); }
  };

  const cardStyle: React.CSSProperties = {
      background: profile.theme.mode === 'gradient' ? `linear-gradient(to bottom right, ${profile.theme.primary} 0%, ${profile.theme.secondary} 100%)` : profile.theme.background,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  };

  const getVolumeIcon = () => {
      if (isMuted || volume === 0) return <VolumeX size={16} />;
      if (volume < 50) return <Volume1 size={16} />;
      return <Volume2 size={16} />;
  };

  return (
    <div className="relative w-full max-w-[600px] rounded-lg overflow-hidden z-10 font-sans" style={cardStyle}>
       <style>{`
          .discord-quote { border-left: 4px solid #4f545c; padding-left: 10px; margin: 4px 0; color: #b9bbbe; font-size: 0.9em; }
          .discord-pre { background: #2f3136; padding: 8px; border-radius: 4px; overflow-x: auto; margin: 4px 0; border: 1px solid #202225; }
          .discord-inline-code { background: #2f3136; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.85em; }
          .discord-spoiler { background: #202225; color: transparent; border-radius: 3px; padding: 0 2px; cursor: pointer; transition: color 0.1s; }
          .discord-spoiler:hover { background: #292b2f; }
          .discord-spoiler.revealed { background: #4f545c; color: inherit; }
          .discord-link { color: #00b0f4; text-decoration: none; }
          .discord-link:hover { text-decoration: underline; }
      `}</style>
      
      {/* Pop-out Player Overlay - Always Mounted, Toggle Visibility */}
      <div className={`absolute inset-0 z-[50] bg-black/80 flex flex-col items-center justify-center p-4 transition-all duration-300 ${isPlayerVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="w-full max-w-[400px] aspect-video bg-black rounded overflow-hidden shadow-2xl relative">
              {profile.musicEnabled && activePlaylist && (
                  <YouTube 
                      key={`main-player-${activePlaylist?.id}`} 
                      videoId="" 
                      opts={opts} 
                      onReady={onPlayerReady} 
                      onStateChange={onStateChange} 
                  />
              )}
          </div>
          <p className="text-white text-xs mt-4 text-center opacity-70">영상 플레이어 모드입니다.</p>
          <button 
            onClick={() => setIsPlayerVisible(false)}
            className="mt-4 px-6 py-2 rounded-full font-bold text-sm transition-transform active:scale-95"
            style={{ backgroundColor: profile.theme.button, color: '#fff' }}
          >
            플레이어 숨기기
          </button>
      </div>

      {/* Banner & Avatar */}
      <div className="h-[240px] w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${profile.bannerUrl})`, backgroundColor: profile.theme.primary }}>
          <div className="absolute -bottom-[50px] left-[20px] p-[6px] rounded-full" style={{ backgroundColor: profile.theme.mode === 'gradient' ? 'rgba(0,0,0,0.2)' : profile.theme.background }}>
             <img src={profile.avatarUrl} alt="Avatar" className="w-[120px] h-[120px] rounded-full object-cover border-[6px]" style={{ backgroundColor: profile.theme.background, borderColor: profile.theme.mode === 'gradient' ? 'transparent' : profile.theme.background }} />
             <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-[6px]" style={{ backgroundColor: STATUS_COLORS[profile.status], borderColor: profile.theme.mode === 'gradient' ? 'transparent' : profile.theme.background }}></div>
          </div>
      </div>

      <div className="pt-[60px] pb-6 px-5" style={{ background: profile.theme.mode === 'gradient' ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))` : 'transparent' }}>
        <div className="flex justify-between items-start">
            <div>
                {profile.identityFormat === 'modern' ? (
                     <div>
                         <h1 className="text-white text-2xl font-bold leading-tight">{profile.displayName || profile.username}</h1>
                         <div className="text-gray-300 font-medium text-sm mt-0.5 flex items-center gap-2">
                            <span>@{profile.username}</span>
                            {profile.pronouns && <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] text-gray-400">{profile.pronouns}</span>}
                         </div>
                     </div>
                ) : (
                    <h1 className="text-white text-2xl font-bold leading-tight">{profile.username}<span className="text-gray-300 font-medium ml-1">#{profile.discriminator}</span></h1>
                )}
            </div>
            <div className="flex gap-1 mt-1 flex-wrap justify-end max-w-[50%]">{profile.badges.map((badge) => (<div key={badge.id} className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide" style={getBadgeStyle(badge)}>{badge.label}</div>))}</div>
        </div>
        
        <div className="h-[1px] bg-white/10 my-4 w-full"></div>
        
        <div className="mb-6">
            <h3 className="text-xs font-bold text-white/70 uppercase mb-2">About Me</h3>
            <div className="text-sm text-gray-100 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: parseDiscordMarkdown(profile.bio) }} />
            {profile.birthday && profile.showBirthday && (
                <div className="flex items-center gap-2 mt-3 text-gray-400 text-xs"><Cake size={14} /><span>{new Date(profile.birthday).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
            )}
        </div>

        {profile.connections && profile.connections.length > 0 && (
            <div className="mb-6">
                <h3 className="text-xs font-bold text-white/70 uppercase mb-2">Connections</h3>
                <div className="flex flex-wrap gap-2">
                    {profile.connections.map(conn => (
                        <a key={conn.id} href={conn.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)] border border-white/10 rounded px-3 py-2 transition-colors group text-decoration-none">
                            <img src={`https://www.google.com/s2/favicons?sz=32&domain=${conn.url}`} alt="" className="w-5 h-5 rounded-sm" />
                            <span className="text-gray-200 text-sm font-medium group-hover:text-white">{conn.label}</span>
                            <ExternalLink size={14} className="text-white/50 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    ))}
                </div>
            </div>
        )}

        {profile.musicEnabled && activePlaylist && (
            <div className="mt-4">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-white/70 uppercase">Listening To</h3>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">{activePlaylist.label}</span>
                        {isScanning && <span className="text-[10px] text-yellow-400 animate-pulse flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Scanning</span>}
                    </div>
                 </div>
                 
                 <div className="bg-[rgba(0,0,0,0.3)] rounded-lg border border-white/10 overflow-hidden transition-all duration-300">
                    <div className="flex items-center gap-3 p-3">
                        <div className="w-14 h-14 bg-black rounded overflow-hidden flex-shrink-0 relative">
                            {currentVideoId ? <img src={`https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`} alt="Art" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-800"><Music size={20} className="text-gray-500" /></div>}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="text-white text-sm font-bold truncate flex items-center gap-1">
                                <span className="truncate">{trackTitle}</span>
                                {trackTitle.includes("Advertisement") && <span className="text-[8px] bg-yellow-500 text-black px-1 rounded">AD</span>}
                            </div>
                            <div className="text-gray-300 text-xs truncate flex items-center gap-2">
                                <span>{trackAuthor}</span>
                                {totalTracks > 0 && <span className="bg-white/10 px-1 rounded text-[10px] text-white/70">{trackIndex} / {totalTracks}</span>}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1.5 w-full max-w-[120px]">
                                <button onClick={toggleMute} className="text-gray-400 hover:text-white">{getVolumeIcon()}</button>
                                <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" style={{ accentColor: profile.theme.button }} />
                            </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => setIsPlayerVisible(!isPlayerVisible)} className={`p-1 transition-colors ${isPlayerVisible ? 'text-white' : 'text-gray-400 hover:text-white'}`} title="플레이어 보기">
                                {isPlayerVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <div className="w-[1px] h-5 bg-white/10 mx-1"></div>
                            <button onClick={handlePrev} className="text-gray-300 hover:text-white p-1"><SkipBack size={16} fill="currentColor" /></button>
                            <button onClick={handlePlayPause} className="p-1 transition-transform hover:scale-105" style={{ color: profile.theme.button }}>{isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
                            <button onClick={handleNext} className="text-gray-300 hover:text-white p-1"><SkipForward size={16} fill="currentColor" /></button>
                            <button onClick={() => toggleDrawer('playlists')} className={`p-1 transition-colors ${isDrawerOpen && drawerMode === 'playlists' ? 'text-white' : 'text-gray-400 hover:text-white'}`} title="플레이리스트 선택"><ListMusic size={16} /></button>
                            <button onClick={() => toggleDrawer('tracks')} className={`p-1 transition-colors ${isDrawerOpen && drawerMode === 'tracks' ? 'text-white' : 'text-gray-400 hover:text-white'}`} title="트랙 보기"><List size={16} /></button>
                        </div>
                    </div>

                    {isDrawerOpen && (
                        <div className="border-t border-white/10 bg-[rgba(0,0,0,0.2)] flex flex-col">
                             <div className="flex items-center justify-between px-3 py-1.5 bg-black/20">
                                 <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{drawerMode === 'playlists' ? 'Select Playlist' : 'Playlist Tracks'}</span>
                                 <button onClick={() => setIsDrawerOpen(false)}><ChevronUp size={12} className="text-gray-500" /></button>
                             </div>
                             <div className="p-1 max-h-[150px] overflow-y-auto custom-scrollbar">
                                {drawerMode === 'playlists' ? (profile.playlists.map((pl) => (
                                        <button key={pl.id} onClick={() => handlePlaylistSwitch(pl.id)} className={`w-full text-left px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-between mb-1 last:mb-0 ${activePlaylistId === pl.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}><span className="truncate">{pl.label}</span>{activePlaylistId === pl.id && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}</button>
                                ))) : (totalTracks > 0 ? (Array.from({ length: totalTracks }).map((_, idx) => {
                                            const track = scannedTracks[idx] || { title: `Track ${idx + 1}`, author: 'Loading...' };
                                            return (<button key={idx} onClick={() => handleTrackJump(idx)} className={`w-full text-left px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-between mb-1 last:mb-0 ${(trackIndex - 1) === idx ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}><div className="flex flex-col min-w-0"><span className="truncate">{track.title}</span><span className="text-[10px] text-gray-500 truncate">{track.author}</span></div>{(trackIndex - 1) === idx && <Music size={10} className="text-green-500 flex-shrink-0 ml-2" />}</button>)
                                        })) : (<div className="text-center py-4 text-xs text-gray-500">Scanning playlist info...</div>))}
                             </div>
                        </div>
                    )}
                 </div>
            </div>
        )}

        {profile.musicEnabled && activePlaylist && (
            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', opacity: 0, pointerEvents: 'none' }}>
                <YouTube 
                    key={`scan-player-${activePlaylist.id}`} 
                    videoId="" 
                    opts={{ ...opts, playerVars: { ...opts.playerVars, autoplay: 1 } }} 
                    onReady={onScannerReady} 
                    onStateChange={onScannerStateChange} 
                    onError={onScannerError} 
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;