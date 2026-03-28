import React, { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { UserProfile, TrackInfo } from '../types';

interface MusicCardProps {
  profile: UserProfile;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const MusicCard: React.FC<MusicCardProps> = ({ profile, isPlaying, setIsPlaying }) => {
  const [player, setPlayer] = useState<any>(null);
  const [trackTitle, setTrackTitle] = useState('No Track Loaded');
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [trackIndex, setTrackIndex] = useState(1);
  const [totalTracks, setTotalTracks] = useState(0);

  // Audio visualizer bars
  const barCount = 24;
  const barsRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

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
        console.error('loadPlaylist error:', e);
      }
    }
  }, [activePlaylist?.id, isPlayerReady]);

  // Simulated visualizer animation
  useEffect(() => {
    const animate = () => {
      if (barsRef.current) {
        const bars = barsRef.current.children;
        for (let i = 0; i < bars.length; i++) {
          const bar = bars[i] as HTMLElement;
          if (isPlaying) {
            const val = Math.random() * 0.7 + 0.1 + Math.sin(Date.now() / 200 + i * 0.5) * 0.2;
            bar.style.height = Math.max(5, val * 100) + '%';
            bar.style.backgroundColor = val > 0.7 ? '#00ff00' : '#00f3ff';
          } else {
            bar.style.height = '5%';
            bar.style.backgroundColor = '#00f3ff';
          }
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  const opts: YouTubeProps['opts'] = {
    height: '1',
    width: '1',
    playerVars: {
      listType: 'playlist',
      list: activePlaylist ? activePlaylist.playlistId : '',
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      playsinline: 1,
    },
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    const p = event.target as any;
    setPlayer(p);
    p.setVolume(50);
    updateTrackInfo(p);
    setIsPlayerReady(true);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) {
      setIsPlaying(true);
      updateTrackInfo(event.target);
    } else if (event.data === 2 || event.data === -1 || event.data === 0) {
      setIsPlaying(false);
      if (event.data === -1) updateTrackInfo(event.target);
    }
  };

  const updateTrackInfo = (target: any) => {
    if (target && target.getVideoData) {
      const data = target.getVideoData();
      if (data) {
        setTrackTitle(data.title || 'Loading...');
        setCurrentVideoId(data.video_id);
      }
      if (target.getPlaylistIndex) setTrackIndex(target.getPlaylistIndex() + 1);
      if (target.getPlaylist) {
        const list = target.getPlaylist();
        if (list) setTotalTracks(list.length);
      }
    }
  };

  const handlePlayPause = () => {
    if (!player || !isPlayerReady) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  };

  const handleNext = () => { if (player) player.nextVideo(); };
  const handlePrev = () => { if (player) player.previousVideo(); };

  if (!profile.musicEnabled || !activePlaylist) return null;

  return (
    <div className="w-full max-w-[340px] mx-auto lg:mx-0 bg-[#09090b] border border-gray-800 rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.9),_inset_0_0_20px_rgba(0,243,255,0.05)] overflow-hidden shrink-0 flex flex-col relative font-mono h-fit">
      {/* Top gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#00f3ff] to-[#00ff00] w-full shadow-[0_0_15px_rgba(0,243,255,0.8)]" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[#00f3ff] font-bold text-sm">&gt; AUDIO_TENSOR_CORE</h2>
          <span className={`text-[10px] border px-1.5 py-0.5 rounded shadow-sm ${
            isPlaying
              ? 'text-[#00ff00] animate-pulse font-bold border-[#00ff00]/50 shadow-[0_0_5px_#00ff00]'
              : 'text-gray-500 border-gray-700'
          }`}>
            {isPlaying ? 'COMPUTING' : 'IDLE'}
          </span>
        </div>

        <p className="text-[10px] text-gray-400 mb-5 leading-relaxed tracking-wide">
          Extracting frequency features from latent audio matrices to drive structural reality.
        </p>

        {/* Audio Visualizer Bars */}
        <div className="relative w-full h-[120px] bg-black border border-gray-800 rounded-lg overflow-hidden flex items-end px-2 pb-1 mb-5 shadow-[inset_0_0_20px_rgba(0,243,255,0.05)]">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#00f3ff 1px, transparent 1px)',
              backgroundSize: '10px 10px',
            }}
          />
          <div ref={barsRef} className="flex items-end justify-between w-full h-[90%] z-10 gap-[2px]">
            {Array.from({ length: barCount }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all duration-75 opacity-90"
                style={{ height: '5%', backgroundColor: '#00f3ff' }}
              />
            ))}
          </div>
        </div>

        {/* Track info & controls */}
        <div className="bg-[#1e1f22] border border-gray-800 rounded-lg p-3">
          <div className="text-[13px] font-bold text-white truncate mb-1">{trackTitle}</div>
          <div className="text-[11px] text-[#00ff00] truncate mb-4">&gt; AnalyserNode.extract()</div>

          {/* Playlist selector */}
          {profile.playlists.length > 1 && (
            <div className="flex gap-1 mb-3 overflow-x-auto custom-scroll pb-1">
              {profile.playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => setActivePlaylistId(pl.id)}
                  className={`text-[9px] px-2 py-1 rounded whitespace-nowrap transition-colors ${
                    activePlaylistId === pl.id
                      ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {pl.label}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded text-[11px] font-bold transition-colors border border-gray-700 uppercase"
            >
              [ PREV ]
            </button>
            <button
              type="button"
              onClick={handlePlayPause}
              className={`flex-[1.5] border py-2.5 rounded text-[11px] font-bold transition-all uppercase ${
                isPlaying
                  ? 'bg-[#00ff00]/20 hover:bg-[#00ff00] hover:text-black text-[#00ff00] border-[#00ff00] shadow-[0_0_15px_rgba(0,255,0,0.4)]'
                  : 'bg-[#00f3ff]/10 hover:bg-[#00f3ff] hover:text-black text-[#00f3ff] border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.2)]'
              }`}
            >
              {isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded text-[11px] font-bold transition-colors border border-gray-700 uppercase"
            >
              [ NEXT ]
            </button>
          </div>
        </div>
      </div>

      {/* Hidden YouTube Player */}
      <div className="fixed -top-[10000px] -left-[10000px] opacity-0 pointer-events-none">
        <YouTube
          key={`player-${activePlaylist?.id}`}
          videoId=""
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onStateChange}
        />
      </div>
    </div>
  );
};

export default MusicCard;
