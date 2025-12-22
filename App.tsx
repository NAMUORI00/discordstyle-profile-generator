import React, { useState } from 'react';
import { UserProfile } from './types';
import { DEFAULT_PROFILE } from './constants';
import { generateStandaloneHTML } from './services/generator';
import EditorForm from './components/EditorForm';
import ProfileCard from './components/ProfileCard';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = () => {
    const htmlContent = generateStandaloneHTML(profile);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.username}-profile.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = async () => {
      const htmlContent = generateStandaloneHTML(profile);
      try {
          await navigator.clipboard.writeText(htmlContent);
      } catch (err) {
          console.error("Failed to copy text: ", err);
          alert("Failed to copy to clipboard");
      }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans antialiased text-gray-100">
      
      {/* Editor Sidebar */}
      <EditorForm 
        profile={profile} 
        onChange={setProfile} 
        onDownload={handleDownload} 
        onCopy={handleCopyCode}
      />

      {/* Preview Area */}
      <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden bg-discord-bg">

        {/* Background Visualizer (Simulated NCS) */}
        <Visualizer isPlaying={isPlaying} primaryColor={profile.theme.primary} />

        {/* Profile Card Centerpiece */}
        <ProfileCard 
            profile={profile} 
            isPlaying={isPlaying} 
            setIsPlaying={setIsPlaying} 
        />
        
        {/* Info Overlay */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 opacity-50 pointer-events-none">
            Preview Mode • Music plays locally via YouTube
        </div>
      </div>
    </div>
  );
};

export default App;