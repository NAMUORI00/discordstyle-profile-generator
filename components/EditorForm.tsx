import React, { useState, useRef } from 'react';
import { UserProfile, Connection, Badge, StatusType, PlaylistItem, BadgeStyle } from '../types';
import { DISCORD_COLORS } from '../constants';
import { Bold, Italic, Underline, Strikethrough, Code, Quote, EyeOff, Link as LinkIcon, Copy, Check, Download, Palette } from 'lucide-react';

interface EditorFormProps {
  profile: UserProfile;
  onChange: (newProfile: UserProfile) => void;
  onDownload: () => void;
  onCopy: () => void;
}

const EditorForm: React.FC<EditorFormProps> = ({ profile, onChange, onDownload, onCopy }) => {
  const [newConnLabel, setNewConnLabel] = useState('');
  const [newConnUrl, setNewConnUrl] = useState('');
  
  // Badge State
  const [newBadgeLabel, setNewBadgeLabel] = useState('');
  const [newBadgeColor, setNewBadgeColor] = useState('#5865F2');
  const [newBadgeStyle, setNewBadgeStyle] = useState<BadgeStyle>('solid');
  
  // Playlist State
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [newPlaylistLabel, setNewPlaylistLabel] = useState('');

  // Link Editor State
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const selectionRef = useRef<{start: number, end: number} | null>(null);

  // Copy Feedback State
  const [isCopied, setIsCopied] = useState(false);

  const bioInputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (field: keyof UserProfile, value: any) => {
    onChange({ ...profile, [field]: value });
  };

  const handleThemeChange = (field: keyof UserProfile['theme'], value: any) => {
    onChange({
      ...profile,
      theme: { ...profile.theme, [field]: value }
    });
  };

  const handleCopyClick = () => {
      onCopy();
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  // Bio Formatting Helpers
  const insertFormatting = (prefix: string, suffix: string) => {
    if (!bioInputRef.current) return;
    const input = bioInputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = profile.bio;
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = before + prefix + selection + suffix + after;
    handleChange('bio', newText);
    
    // Restore focus and selection
    setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleLinkClick = () => {
    if (bioInputRef.current) {
        // Save selection range before focus is lost to the input
        selectionRef.current = {
            start: bioInputRef.current.selectionStart,
            end: bioInputRef.current.selectionEnd
        };
        setShowLinkInput(true);
        setLinkUrl(''); 
    }
  };

  const confirmLink = () => {
      if (!bioInputRef.current || !selectionRef.current) return;
      
      const { start, end } = selectionRef.current;
      const text = profile.bio;
      const selectedText = text.substring(start, end);
      
      let finalUrl = linkUrl.trim();
      if (finalUrl && !finalUrl.match(/^https?:\/\//)) {
          finalUrl = 'https://' + finalUrl;
      }
      
      if (finalUrl) {
          const insertText = `[${selectedText || 'Link'}](${finalUrl})`;
          const newText = text.substring(0, start) + insertText + text.substring(end);
          
          handleChange('bio', newText);
          
          setTimeout(() => {
              bioInputRef.current?.focus();
              const newCursorPos = start + insertText.length;
              bioInputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
      }
      
      setShowLinkInput(false);
      setLinkUrl('');
  };

  // Connection Handlers
  const handleAddConnection = () => {
    if (!newConnLabel || !newConnUrl) return;
    const newConnection: Connection = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        label: newConnLabel,
        url: newConnUrl
    };
    handleChange('connections', [...profile.connections, newConnection]);
    setNewConnLabel('');
    setNewConnUrl('');
  };

  const handleRemoveConnection = (id: string) => {
    handleChange('connections', profile.connections.filter(c => c.id !== id));
  };

  // Badge Handlers
  const handleAddBadge = () => {
    if (!newBadgeLabel) return;
    const newBadge: Badge = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        label: newBadgeLabel,
        color: newBadgeColor,
        style: newBadgeStyle
    };
    handleChange('badges', [...profile.badges, newBadge]);
    setNewBadgeLabel('');
  };

  const handleRemoveBadge = (id: string) => {
    handleChange('badges', profile.badges.filter(b => b.id !== id));
  };

  // Playlist Handlers
  const handleAddPlaylist = () => {
      if (!newPlaylistUrl) return;
      
      let playlistId = newPlaylistUrl;
      const listMatch = newPlaylistUrl.match(/[?&]list=([^#&]+)/);
      if (listMatch) {
          playlistId = listMatch[1];
      }

      const label = newPlaylistLabel || `Playlist ${profile.playlists.length + 1}`;

      const newPlaylist: PlaylistItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          playlistId: playlistId,
          label: label
      };
      
      handleChange('playlists', [...profile.playlists, newPlaylist]);
      setNewPlaylistUrl('');
      setNewPlaylistLabel('');
  };

  const handleRemovePlaylist = (id: string) => {
      handleChange('playlists', profile.playlists.filter(p => p.id !== id));
  };

  return (
    <div className="w-full md:w-1/3 p-6 flex flex-col gap-6 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-700" style={{ backgroundColor: DISCORD_COLORS.bgSecondary }}>
      <h2 className="text-xl font-bold text-white mb-2">Profile Editor</h2>
      
      {/* Identity */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
             <h3 className="text-gray-400 text-xs font-bold uppercase">User Identity</h3>
             <div className="flex bg-gray-900 rounded p-1 border border-gray-700">
                 <button 
                    onClick={() => handleChange('identityFormat', 'legacy')}
                    className={`text-[10px] px-2 py-1 rounded transition-colors ${profile.identityFormat === 'legacy' ? 'bg-gray-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
                 >
                    Legacy (#0000)
                 </button>
                 <button 
                    onClick={() => handleChange('identityFormat', 'modern')}
                    className={`text-[10px] px-2 py-1 rounded transition-colors ${profile.identityFormat === 'modern' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
                 >
                    Modern (@user)
                 </button>
             </div>
        </div>

        {profile.identityFormat === 'modern' ? (
             <div className="space-y-3">
                 <div>
                    <label className="text-xs text-gray-500 block mb-1">Display Name</label>
                    <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => handleChange('displayName', e.target.value)}
                        placeholder="Display Name"
                        className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 block mb-1">Username (Unique ID)</label>
                    <div className="flex items-center bg-gray-900 rounded border border-gray-700 px-2 text-gray-400">
                        @
                        <input
                            type="text"
                            value={profile.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            placeholder="username"
                            className="w-full bg-transparent text-white p-2 focus:outline-none"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 block mb-1">Pronouns</label>
                    <input
                        type="text"
                        value={profile.pronouns || ''}
                        onChange={(e) => handleChange('pronouns', e.target.value)}
                        placeholder="he/him, they/them..."
                        className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                 </div>
             </div>
        ) : (
             <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Username</label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="Username"
                      className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                </div>
                 <div className="w-24">
                    <label className="text-xs text-gray-500 block mb-1">Tag</label>
                    <div className="flex items-center bg-gray-900 rounded border border-gray-700 px-2 text-gray-400">
                        #
                        <input
                          type="text"
                          value={profile.discriminator}
                          onChange={(e) => handleChange('discriminator', e.target.value)}
                          placeholder="0000"
                          maxLength={4}
                          className="w-full bg-transparent text-white p-2 focus:outline-none"
                        />
                     </div>
                 </div>
            </div>
        )}
        
        {/* Birthday */}
        <div className="flex gap-2 items-end">
             <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Birthday</label>
                <input
                    type="date"
                    value={profile.birthday || ''}
                    onChange={(e) => handleChange('birthday', e.target.value)}
                    className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-sm appearance-none"
                />
             </div>
             <div className="flex items-center h-10 gap-2">
                 <input 
                    type="checkbox" 
                    id="showBirthday"
                    checked={profile.showBirthday}
                    onChange={(e) => handleChange('showBirthday', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-700 bg-gray-900"
                 />
                 <label htmlFor="showBirthday" className="text-xs text-gray-400 cursor-pointer select-none">Show</label>
             </div>
        </div>

        <div>
           <label className="text-xs text-gray-500 block mb-1">Status</label>
           <select 
             value={profile.status}
             onChange={(e) => handleChange('status', e.target.value as StatusType)}
             className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
           >
             <option value="online">Online</option>
             <option value="idle">Idle</option>
             <option value="dnd">Do Not Disturb</option>
             <option value="offline">Invisible</option>
           </select>
        </div>
        
        {/* Bio Editor */}
        <div>
           <div className="flex justify-between items-center mb-1">
               <label className="text-xs text-gray-500">About Me (Markdown Supported)</label>
           </div>
           <div className="bg-gray-900 rounded border border-gray-700 overflow-hidden focus-within:border-blue-500 transition-colors">
               <div className="flex gap-1 p-1 bg-gray-800 border-b border-gray-700 overflow-x-auto min-h-[36px] items-center">
                   {showLinkInput ? (
                       <div className="flex flex-1 items-center gap-2 animate-in fade-in zoom-in duration-200">
                           <input 
                               type="text" 
                               value={linkUrl}
                               onChange={(e) => setLinkUrl(e.target.value)}
                               placeholder="https://example.com"
                               className="flex-1 bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-blue-500 outline-none"
                               autoFocus
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter') confirmLink();
                                   if (e.key === 'Escape') setShowLinkInput(false);
                               }}
                           />
                           <button onClick={confirmLink} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-500 font-medium">Add</button>
                           <button onClick={() => setShowLinkInput(false)} className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-500 font-medium">Cancel</button>
                       </div>
                   ) : (
                       <>
                           <button onClick={() => insertFormatting('**', '**')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Bold"><Bold size={14}/></button>
                           <button onClick={() => insertFormatting('*', '*')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Italic"><Italic size={14}/></button>
                           <button onClick={() => insertFormatting('__', '__')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Underline"><Underline size={14}/></button>
                           <button onClick={() => insertFormatting('~~', '~~')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Strikethrough"><Strikethrough size={14}/></button>
                           <div className="w-[1px] bg-gray-700 mx-1 h-4"></div>
                           <button onClick={() => insertFormatting('`', '`')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Code"><Code size={14}/></button>
                           <button onClick={() => insertFormatting('> ', '')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Quote"><Quote size={14}/></button>
                           <button onClick={() => insertFormatting('||', '||')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Spoiler"><EyeOff size={14}/></button>
                           <button onClick={handleLinkClick} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Link"><LinkIcon size={14}/></button>
                       </>
                   )}
               </div>
               <textarea
                    ref={bioInputRef}
                    value={profile.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Write something about yourself..."
                    rows={6}
                    className="w-full bg-gray-900 text-white p-2 focus:outline-none resize-y text-sm font-mono"
               />
           </div>
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase">Badges</h3>
        <div className="flex flex-wrap gap-2">
            {profile.badges.map(badge => (
                <div key={badge.id} 
                    className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded border"
                    style={{ borderColor: badge.style === 'outline' ? badge.color : 'rgba(255,255,255,0.1)' }}
                >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: badge.color }}></div>
                    <span className="text-xs text-white font-bold">{badge.label}</span>
                    <button onClick={() => handleRemoveBadge(badge.id)} className="text-gray-500 hover:text-red-400 ml-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            ))}
        </div>
        
        <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded border border-gray-700">
            <input
                type="text"
                value={newBadgeLabel}
                onChange={(e) => setNewBadgeLabel(e.target.value)}
                placeholder="Badge Label (e.g. VIP)"
                className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
            />
            <div className="flex gap-2">
                <div className="flex items-center gap-2 bg-gray-900 px-2 rounded border border-gray-600">
                    <Palette size={14} className="text-gray-400" />
                    <input
                        type="color"
                        value={newBadgeColor}
                        onChange={(e) => setNewBadgeColor(e.target.value)}
                        className="h-6 w-8 cursor-pointer bg-transparent border-none p-0"
                        title="Badge Color"
                    />
                </div>
                <select 
                    value={newBadgeStyle}
                    onChange={(e) => setNewBadgeStyle(e.target.value as BadgeStyle)}
                    className="flex-1 bg-gray-900 text-white text-xs px-2 rounded border border-gray-600 focus:outline-none"
                >
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                    <option value="soft">Soft</option>
                </select>
                <button
                    onClick={handleAddBadge}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded text-xs font-bold uppercase tracking-wider"
                    style={{ backgroundColor: profile.theme.button }}
                >
                    Add
                </button>
            </div>
        </div>
      </div>

      {/* Visuals */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase">Images</h3>
        <div>
            <label className="text-xs text-gray-500 block mb-1">Avatar URL</label>
            <input
            type="text"
            value={profile.avatarUrl}
            onChange={(e) => handleChange('avatarUrl', e.target.value)}
            className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
            />
        </div>
        <div>
            <label className="text-xs text-gray-500 block mb-1">Banner URL</label>
            <input
            type="text"
            value={profile.bannerUrl}
            onChange={(e) => handleChange('bannerUrl', e.target.value)}
            className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
            />
        </div>
      </div>

      {/* Theme Settings */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase">Theme & Colors</h3>
        
        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs text-gray-500 block mb-1">Primary Color</label>
                <div className="flex items-center gap-2 bg-gray-900 p-1 rounded border border-gray-700">
                    <input
                        type="color"
                        value={profile.theme.primary}
                        onChange={(e) => handleThemeChange('primary', e.target.value)}
                        className="h-6 w-8 cursor-pointer bg-transparent border-none p-0"
                    />
                    <span className="text-xs text-gray-300 font-mono">{profile.theme.primary}</span>
                </div>
             </div>
             
             <div>
                <label className="text-xs text-gray-500 block mb-1">Button Color</label>
                <div className="flex items-center gap-2 bg-gray-900 p-1 rounded border border-gray-700">
                    <input
                        type="color"
                        value={profile.theme.button}
                        onChange={(e) => handleThemeChange('button', e.target.value)}
                        className="h-6 w-8 cursor-pointer bg-transparent border-none p-0"
                    />
                     <span className="text-xs text-gray-300 font-mono">{profile.theme.button}</span>
                </div>
             </div>
        </div>

        <div>
            <label className="text-xs text-gray-500 block mb-1">Card Background</label>
            <div className="flex items-center gap-2 bg-gray-900 p-1 rounded border border-gray-700">
                <input
                    type="color"
                    value={profile.theme.background}
                    onChange={(e) => handleThemeChange('background', e.target.value)}
                    className="h-6 w-8 cursor-pointer bg-transparent border-none p-0"
                />
                 <span className="text-xs text-gray-300 font-mono">{profile.theme.background}</span>
            </div>
        </div>

        <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Enable Gradient Theme</label>
            <input 
                type="checkbox" 
                checked={profile.theme.mode === 'gradient'}
                onChange={(e) => handleThemeChange('mode', e.target.checked ? 'gradient' : 'simple')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
        </div>

        {profile.theme.mode === 'gradient' && (
             <div>
                <label className="text-xs text-gray-500 block mb-1">Secondary Color (Gradient End)</label>
                <div className="flex items-center gap-2 bg-gray-900 p-1 rounded border border-gray-700">
                    <input
                        type="color"
                        value={profile.theme.secondary}
                        onChange={(e) => handleThemeChange('secondary', e.target.value)}
                        className="h-6 w-8 cursor-pointer bg-transparent border-none p-0"
                    />
                     <span className="text-xs text-gray-300 font-mono">{profile.theme.secondary}</span>
                </div>
             </div>
        )}
      </div>

      {/* Connections */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase">Connections</h3>
        
        <div className="space-y-2">
            {profile.connections.map(conn => (
                <div key={conn.id} className="flex items-center justify-between bg-gray-900 p-2 rounded border border-gray-700">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <img 
                            src={`https://www.google.com/s2/favicons?sz=32&domain=${conn.url}`} 
                            alt="" 
                            className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-300 truncate">{conn.label}</span>
                    </div>
                    <button 
                        onClick={() => handleRemoveConnection(conn.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-2 bg-gray-800 p-3 rounded">
             <input
                type="text"
                value={newConnLabel}
                onChange={(e) => setNewConnLabel(e.target.value)}
                placeholder="Label (e.g. GitHub)"
                className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
            />
            <input
                type="text"
                value={newConnUrl}
                onChange={(e) => setNewConnUrl(e.target.value)}
                placeholder="URL (https://...)"
                className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
            />
            <button
                onClick={handleAddConnection}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded text-sm font-medium transition-colors"
                style={{ backgroundColor: profile.theme.button }}
            >
                Add Connection
            </button>
        </div>
      </div>

      {/* Media */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-xs font-bold uppercase">Music Playlists</h3>
            <div className="flex items-center gap-2">
                 <label className="text-xs text-gray-400">Enable</label>
                 <input 
                    type="checkbox"
                    checked={profile.musicEnabled}
                    onChange={(e) => handleChange('musicEnabled', e.target.checked)}
                    className="w-4 h-4"
                 />
            </div>
        </div>
        
        {profile.musicEnabled && (
            <div className="space-y-3">
                <div className="space-y-2">
                    {profile.playlists.map((playlist, idx) => (
                         <div key={playlist.id} className="flex items-center justify-between bg-gray-900 p-2 rounded border border-gray-700">
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm text-gray-200 truncate font-medium">{playlist.label}</span>
                                <span className="text-[10px] text-gray-500 truncate">{playlist.playlistId}</span>
                            </div>
                            <button 
                                onClick={() => handleRemovePlaylist(playlist.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-2 bg-gray-800 p-3 rounded">
                    <input
                        type="text"
                        value={newPlaylistLabel}
                        onChange={(e) => setNewPlaylistLabel(e.target.value)}
                        placeholder="Playlist Name (Optional)"
                        className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    />
                    <input
                        type="text"
                        value={newPlaylistUrl}
                        onChange={(e) => setNewPlaylistUrl(e.target.value)}
                        className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="Paste Playlist URL or ID"
                    />
                    <button
                        onClick={handleAddPlaylist}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded text-sm font-medium transition-colors"
                        style={{ backgroundColor: profile.theme.button }}
                    >
                        Add Playlist
                    </button>
                </div>
            </div>
        )}
      </div>

      <div className="mt-auto pt-6 flex gap-3">
        <button
            onClick={onDownload}
            className="flex-1 hover:brightness-110 text-white font-bold py-3 px-2 rounded transition-all flex items-center justify-center gap-2 shadow-lg text-sm"
            style={{ backgroundColor: DISCORD_COLORS.green }}
        >
            <Download size={18} />
            Download HTML
        </button>
        <button
            onClick={handleCopyClick}
            className="flex-1 hover:brightness-110 text-white font-bold py-3 px-2 rounded transition-all flex items-center justify-center gap-2 shadow-lg text-sm bg-gray-700 hover:bg-gray-600"
            style={{ backgroundColor: profile.theme.button }}
        >
             {isCopied ? <Check size={18} /> : <Copy size={18} />}
             {isCopied ? "Copied!" : "Copy Code"}
        </button>
      </div>
    </div>
  );
};

export default EditorForm;