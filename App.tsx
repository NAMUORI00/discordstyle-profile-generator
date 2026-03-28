import React, { useState, useCallback } from 'react';
import { UserProfile } from './types';
import { DEFAULT_PROFILE } from './constants';
import { generateStandaloneHTML } from './services/generator';
import EditorForm from './components/EditorForm';
import ProfileCard from './components/ProfileCard';
import MusicCard from './components/MusicCard';
import ParticleBackground from './components/ParticleBackground';
import BootSequence from './components/BootSequence';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
  }, []);

  const handleDownload = () => {
    const htmlContent = generateStandaloneHTML(profile);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Neural_Profile_Core.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505] text-white font-sans antialiased select-none">
      {/* Three.js Particle Background */}
      <ParticleBackground isPlaying={isPlaying} />

      {/* Boot Sequence Overlay */}
      {!bootComplete && (
        <BootSequence
          avatarSrc={profile.avatar}
          bannerSrc={profile.banner}
          displayName={profile.displayName}
          onComplete={handleBootComplete}
        />
      )}

      {/* Profile Scene */}
      {bootComplete && (
        <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-md overflow-y-auto custom-scroll pt-10 pb-20 flex items-start md:items-center justify-center pointer-events-auto animate-profileReveal">
          <div className="flex flex-col lg:flex-row items-start justify-center gap-6 w-full max-w-[850px] px-4 my-auto">
            <div className="animate-cardEnter">
              <ProfileCard profile={profile} />
            </div>
            {profile.musicEnabled && (
              <div className="animate-cardEnter" style={{ animationDelay: '0.1s' }}>
                <MusicCard
                  profile={profile}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Builder Toggle Button */}
      <button
        type="button"
        onClick={() => setShowBuilder(!showBuilder)}
        className={`fixed top-4 right-4 z-[200] w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg font-mono text-xs font-bold border ${
          showBuilder
            ? 'bg-[#00f3ff] text-black border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.5)]'
            : 'bg-black/80 text-[#00f3ff] border-gray-700 hover:border-[#00f3ff] hover:shadow-[0_0_10px_rgba(0,243,255,0.3)]'
        }`}
        title="Toggle Builder Panel"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Builder Panel - Slide in/out */}
      <div
        className={`fixed top-0 right-0 h-full z-[150] transition-transform duration-300 ease-in-out ${
          showBuilder ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <EditorForm
          profile={profile}
          onChange={setProfile}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default App;