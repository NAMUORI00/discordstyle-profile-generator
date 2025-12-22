import React, { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { UserProfile, TrackInfo } from '../types';
import { Play, Pause, SkipBack, SkipForward, Music, List, ListMusic, ChevronUp, Volume2, Volume1, VolumeX, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface MusicCardProps {
  profile: UserProfile;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const MusicCard: React.FC<MusicCardProps> = ({ profile, isPlaying, setIsPlaying }) => {
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
      setIsPlaying(false);
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
    updateTrackInfo(p);
    setIsPlayerReady(true);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) { setIsPlaying(true); updateTrackInfo(event.target); }
    else if (event.data === 2 || event.data === -1 || event.data === 0) {
      setIsPlaying(false);
      if (event.data === -1) updateTrackInfo(event.target);
    }
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

  const handlePlayPause = () => { if (!player || !isPlayerReady) return; if (isPlaying) player.pauseVideo(); else player.playVideo(); };
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

  if (!profile.musicEnabled || !activePlaylist) {
    return null;
  }

  return (
    <div className="relative w-full max-w-[600px] lg:max-w-[340px] lg:w-[340px] h-full rounded-lg overflow-hidden z-10 font-sans" style={cardStyle}>
      <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>

      {/* Pop-out Player Overlay */}
      <div className={`absolute inset-0 z-[50] bg-black/80 flex flex-col items-center justify-center p-4 transition-all duration-300 ${isPlayerVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="w-full max-w-[300px] aspect-video bg-black rounded overflow-hidden shadow-2xl relative">
              <YouTube
                  key={`main-player-${activePlaylist?.id}`}
                  videoId=""
                  opts={opts}
                  onReady={onPlayerReady}
                  onStateChange={onStateChange}
              />
          </div>
          <p className="text-white text-xs mt-4 text-center opacity-70">Video Player Mode</p>
          <button
            onClick={() => setIsPlayerVisible(false)}
            className="mt-4 px-6 py-2 rounded-full font-bold text-sm transition-transform active:scale-95 text-white"
            style={{ backgroundColor: profile.theme.button }}
          >
            Hide Player
          </button>
      </div>

      {/* Music Card Content */}
      <div className="p-4" style={{ background: profile.theme.mode === 'gradient' ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))` : 'transparent' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-white/70 uppercase flex items-center gap-2">
            <Music size={14} />
            Now Playing
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">{activePlaylist.label}</span>
            {isScanning && <span className="text-[10px] text-yellow-400 animate-pulse flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Scanning</span>}
          </div>
        </div>

        {/* Album Art - Larger for Music Card */}
        <div className="w-full aspect-square bg-black rounded-lg overflow-hidden mb-4 relative">
          {currentVideoId ? (
            <img src={`https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`} alt="Art" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <Music size={48} className="text-gray-500" />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="mb-4">
          <div className="text-white text-base font-bold truncate flex items-center gap-2">
            <span className="truncate">{trackTitle}</span>
            {trackTitle.includes("Advertisement") && <span className="text-[8px] bg-yellow-500 text-black px-1 rounded flex-shrink-0">AD</span>}
          </div>
          <div className="text-gray-300 text-sm flex items-center gap-2 overflow-hidden">
            <span className="truncate flex-shrink min-w-0">{trackAuthor}</span>
            {totalTracks > 0 && <span className="bg-white/10 px-1.5 rounded text-[10px] text-white/70 flex-shrink-0 whitespace-nowrap">{trackIndex} / {totalTracks}</span>}
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white" aria-label={isMuted ? "Unmute" : "Mute"}>{getVolumeIcon()}</button>
          <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" style={{ accentColor: profile.theme.button }} aria-label="Volume control" />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={handlePrev} className="text-gray-300 hover:text-white p-2" aria-label="Previous track"><SkipBack size={20} fill="currentColor" /></button>
          <button onClick={handlePlayPause} className="p-3 rounded-full transition-transform hover:scale-105" style={{ backgroundColor: profile.theme.button }} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause size={24} fill="white" className="text-white" /> : <Play size={24} fill="white" className="text-white ml-0.5" />}
          </button>
          <button onClick={handleNext} className="text-gray-300 hover:text-white p-2" aria-label="Next track"><SkipForward size={20} fill="currentColor" /></button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2 border-t border-white/10 pt-3">
          <button onClick={() => setIsPlayerVisible(!isPlayerVisible)} className={`p-2 rounded transition-colors ${isPlayerVisible ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} title="Video Player" aria-label="Toggle player visibility">
            {isPlayerVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button onClick={() => toggleDrawer('playlists')} className={`p-2 rounded transition-colors ${isDrawerOpen && drawerMode === 'playlists' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} title="Playlists" aria-label="Select playlist">
            <ListMusic size={18} />
          </button>
          <button onClick={() => toggleDrawer('tracks')} className={`p-2 rounded transition-colors ${isDrawerOpen && drawerMode === 'tracks' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} title="Tracks" aria-label="View tracks">
            <List size={18} />
          </button>
        </div>

        {/* Drawer */}
        {isDrawerOpen && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{drawerMode === 'playlists' ? 'Select Playlist' : 'Playlist Tracks'}</span>
              <button onClick={() => setIsDrawerOpen(false)} aria-label="Close drawer"><ChevronUp size={12} className="text-gray-500" /></button>
            </div>
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
              {drawerMode === 'playlists' ? (
                profile.playlists.map((pl) => (
                  <button key={pl.id} onClick={() => handlePlaylistSwitch(pl.id)} className={`w-full text-left px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-between mb-1 last:mb-0 ${activePlaylistId === pl.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                    <span className="truncate">{pl.label}</span>
                    {activePlaylistId === pl.id && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                  </button>
                ))
              ) : (
                totalTracks > 0 ? (
                  Array.from({ length: totalTracks }).map((_, idx) => {
                    const track = scannedTracks[idx] || { title: `Track ${idx + 1}`, author: 'Loading...' };
                    return (
                      <button key={idx} onClick={() => handleTrackJump(idx)} className={`w-full text-left px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-between mb-1 last:mb-0 ${(trackIndex - 1) === idx ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{track.title}</span>
                          <span className="text-[10px] text-gray-500 truncate">{track.author}</span>
                        </div>
                        {(trackIndex - 1) === idx && <Music size={10} className="text-green-500 flex-shrink-0 ml-2" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-xs text-gray-500">Scanning playlist info...</div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden Scanner Player */}
      <div className="fixed -top-[10000px] -left-[10000px] opacity-0 pointer-events-none">
        <YouTube
          key={`scan-player-${activePlaylist.id}`}
          videoId=""
          opts={{ ...opts, playerVars: { ...opts.playerVars, autoplay: 1 } }}
          onReady={onScannerReady}
          onStateChange={onScannerStateChange}
          onError={onScannerError}
        />
      </div>
    </div>
  );
};

export default MusicCard;
