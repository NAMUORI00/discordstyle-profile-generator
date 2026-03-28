import React, { useState } from 'react';
import { UserProfile, IconType, ButtonStyle, ProfileBadge, AboutTab, SocialButton } from '../types';
import { BUTTON_PRESETS, escapeHtml } from '../constants';

interface EditorFormProps {
  profile: UserProfile;
  onChange: (newProfile: UserProfile) => void;
  onDownload: () => void;
}

const ICON_OPTIONS: { value: IconType; label: string }[] = [
  { value: 'none', label: 'No Icon' },
  { value: 'link', label: '🔗 Link' },
  { value: 'discord', label: '👾 Discord' },
  { value: 'github', label: '🐙 GitHub' },
  { value: 'instagram', label: '📷 Insta' },
  { value: 'twitter', label: '🐦 X(Tw)' },
  { value: 'youtube', label: '▶️ YT' },
  { value: 'naver', label: '🟩 Naver' },
  { value: 'tistory', label: '🔠 Tistory' },
];

const BADGE_ICON_OPTIONS: { value: IconType; label: string }[] = [
  { value: 'none', label: 'No Icon' },
  { value: 'bot', label: 'Bot' },
  { value: 'check', label: 'Check' },
];

const EditorForm: React.FC<EditorFormProps> = ({ profile, onChange, onDownload }) => {
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [newPlaylistLabel, setNewPlaylistLabel] = useState('');

  const update = (patch: Partial<UserProfile>) => {
    onChange({ ...profile, ...patch });
  };

  // --- Image Handlers ---
  const handleFileUpload = (key: 'avatar' | 'banner', maxW: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const cvs = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxW || h > maxW) {
          if (w > h) { h = (h / w) * maxW; w = maxW; }
          else { w = (w / h) * maxW; h = maxW; }
        }
        cvs.width = w; cvs.height = h;
        cvs.getContext('2d')!.drawImage(img, 0, 0, w, h);
        update({ [key]: cvs.toDataURL('image/jpeg', 0.85) });
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const clearImg = (key: 'avatar' | 'banner') => {
    update({ [key]: '' });
  };

  // --- Badge Handlers ---
  const addBadge = () => {
    update({ badges: [...profile.badges, { label: 'NEW', color: '#5865F2', icon: 'none' }] });
  };
  const removeBadge = (idx: number) => {
    update({ badges: profile.badges.filter((_, i) => i !== idx) });
  };
  const updateBadge = (idx: number, key: keyof ProfileBadge, val: string) => {
    const badges = [...profile.badges];
    (badges[idx] as any)[key] = val;
    update({ badges });
  };

  // --- Tab Handlers ---
  const addTab = () => {
    update({ aboutTabs: [...profile.aboutTabs, { title: 'NEW TAB', content: 'Content here...' }] });
  };
  const removeTab = (idx: number) => {
    update({ aboutTabs: profile.aboutTabs.filter((_, i) => i !== idx) });
  };
  const updateTab = (idx: number, key: keyof AboutTab, val: string) => {
    const tabs = [...profile.aboutTabs];
    tabs[idx] = { ...tabs[idx], [key]: val };
    update({ aboutTabs: tabs });
  };

  // --- Button Handlers ---
  const addButton = (preset?: string) => {
    const btn = preset && BUTTON_PRESETS[preset]
      ? { ...BUTTON_PRESETS[preset] }
      : { label: 'Button', url: 'https://', style: 'secondary' as ButtonStyle, icon: 'link' as IconType };
    update({ buttons: [...profile.buttons, btn] });
  };
  const removeButton = (idx: number) => {
    update({ buttons: profile.buttons.filter((_, i) => i !== idx) });
  };
  const updateButton = (idx: number, key: keyof SocialButton, val: string) => {
    const buttons = [...profile.buttons];
    (buttons[idx] as any)[key] = val;
    update({ buttons });
  };

  // --- Playlist Handlers ---
  const addPlaylist = () => {
    if (!newPlaylistUrl) return;
    let playlistId = newPlaylistUrl;
    const match = newPlaylistUrl.match(/[?&]list=([^#&]+)/);
    if (match) playlistId = match[1];
    const label = newPlaylistLabel || `Playlist ${profile.playlists.length + 1}`;
    update({
      playlists: [...profile.playlists, {
        id: Date.now().toString(),
        playlistId,
        label,
      }],
    });
    setNewPlaylistUrl('');
    setNewPlaylistLabel('');
  };
  const removePlaylist = (id: string) => {
    update({ playlists: profile.playlists.filter(p => p.id !== id) });
  };

  const inputCls = "w-full bg-black border border-gray-700 text-white p-2 rounded text-xs outline-none focus:border-[#00f3ff] transition-colors";
  const sectionCls = "p-3 bg-[#1e1f22] border border-gray-800 rounded";

  return (
    <div className="fixed top-0 right-0 w-[360px] h-full bg-black/95 backdrop-blur-md border-l border-gray-800 p-5 overflow-y-auto z-[150] shadow-[-20px_0_50px_rgba(0,0,0,0.8)] font-sans text-[13px] custom-scroll pb-10">
      <h2 className="text-[#00f3ff] font-bold font-mono text-lg mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
        &gt; PROFILE_BUILDER
      </h2>

      <div className="space-y-4">
        {/* ===== IDENTITY VISUALS ===== */}
        <div className={sectionCls}>
          <h3 className="text-xs font-bold text-white mb-2 pb-1 border-b border-gray-700">IDENTITY VISUALS</h3>

          {/* Avatar */}
          <label className="block text-[10px] text-[#00f3ff] mb-1 font-mono flex justify-between items-center">
            Avatar Image
            <span
              className="cursor-pointer text-[9px] text-red-400 font-bold bg-red-950/50 px-1.5 py-0.5 rounded border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors"
              onClick={() => clearImg('avatar')}
            >CLEAR</span>
          </label>
          <div className="bg-black border border-gray-700 rounded p-2 mb-3">
            <input
              type="text"
              placeholder="Paste Image URL..."
              value={profile.avatar && !profile.avatar.startsWith('data:') ? profile.avatar : ''}
              onChange={e => update({ avatar: e.target.value.trim() })}
              className="w-full bg-gray-900 border border-gray-700 text-white p-1.5 rounded text-[10px] outline-none focus:border-[#00f3ff] mb-2"
            />
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px bg-gray-800 flex-1" /><span className="text-[9px] text-gray-500 font-bold">OR UPLOAD</span><div className="h-px bg-gray-800 flex-1" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload('avatar', 400)}
              className="w-full text-[10px] text-gray-400 file:bg-gray-800 file:text-white file:border-0 file:rounded file:px-2 file:py-1 cursor-pointer"
            />
          </div>

          {/* Banner */}
          <label className="block text-[10px] text-[#b5bac1] mb-1 font-mono flex justify-between items-center">
            Banner Image
            <span
              className="cursor-pointer text-[9px] text-red-400 font-bold bg-red-950/50 px-1.5 py-0.5 rounded border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors"
              onClick={() => clearImg('banner')}
            >CLEAR</span>
          </label>
          <div className="bg-black border border-gray-700 rounded p-2 mb-2">
            <input
              type="text"
              placeholder="Paste Image URL..."
              value={profile.banner && !profile.banner.startsWith('data:') ? profile.banner : ''}
              onChange={e => update({ banner: e.target.value.trim() })}
              className="w-full bg-gray-900 border border-gray-700 text-white p-1.5 rounded text-[10px] outline-none focus:border-[#00f3ff] mb-2"
            />
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px bg-gray-800 flex-1" /><span className="text-[9px] text-gray-500 font-bold">OR UPLOAD</span><div className="h-px bg-gray-800 flex-1" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload('banner', 800)}
              className="w-full text-[10px] text-gray-400 file:bg-gray-800 file:text-white file:border-0 file:rounded file:px-2 file:py-1 cursor-pointer"
            />
          </div>

          <label className="block text-[10px] text-[#b5bac1] mb-1 mt-2">Banner Fallback Color</label>
          <input
            type="color"
            value={profile.bannerColor || '#00f3ff'}
            onChange={e => update({ bannerColor: e.target.value })}
            className="w-full h-8 cursor-pointer rounded bg-transparent border-0 p-0"
          />
        </div>

        {/* ===== TEXTS & STATUS ===== */}
        <div className={`${sectionCls} space-y-2.5`}>
          <h3 className="text-xs font-bold text-white mb-1 pb-1 border-b border-gray-700">TEXTS & STATUS</h3>
          <div>
            <label className="block text-[10px] text-[#b5bac1] mb-1">Display Name</label>
            <input type="text" value={profile.displayName} onChange={e => update({ displayName: e.target.value })} className={inputCls} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-[#b5bac1] mb-1">Username</label>
              <input type="text" value={profile.username} onChange={e => update({ username: e.target.value })} className={inputCls} />
            </div>
            <div className="w-20">
              <label className="block text-[10px] text-[#b5bac1] mb-1">Pronouns</label>
              <input type="text" value={profile.pronouns} onChange={e => update({ pronouns: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-12">
              <label className="block text-[10px] text-[#b5bac1] mb-1">Emoji</label>
              <input type="text" value={profile.statusEmoji} onChange={e => update({ statusEmoji: e.target.value })} className={`${inputCls} text-center`} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-[#b5bac1] mb-1">Custom Status</label>
              <input type="text" value={profile.statusText} onChange={e => update({ statusText: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-[#b5bac1] mb-1">Roles (Comma Separated)</label>
            <input
              type="text"
              value={profile.roles.join(', ')}
              onChange={e => update({ roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className={inputCls}
            />
          </div>
        </div>

        {/* ===== BADGES ===== */}
        <div className={sectionCls}>
          <h3 className="text-xs font-bold text-white uppercase mb-2 flex justify-between items-center border-b border-gray-700 pb-1">
            Name Badges
            <button type="button" onClick={addBadge} className="text-[10px] bg-gray-800 hover:bg-gray-700 text-[#00f3ff] px-2 py-0.5 rounded font-bold transition-colors">+ Add</button>
          </h3>
          <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto custom-scroll pr-1">
            {profile.badges.map((b, idx) => (
              <div key={idx} className="flex gap-1.5 p-2 bg-black border border-gray-700 rounded relative items-center">
                <button type="button" onClick={() => removeBadge(idx)} className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors">X</button>
                <input type="text" value={b.label} onChange={e => updateBadge(idx, 'label', e.target.value)} placeholder="Label" className="w-1/3 bg-gray-900 text-white border border-gray-700 text-[11px] outline-none focus:border-[#00f3ff] px-1.5 py-1 rounded" />
                <input type="color" value={b.color} onChange={e => updateBadge(idx, 'color', e.target.value)} className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer rounded shrink-0" />
                <select value={b.icon} onChange={e => updateBadge(idx, 'icon', e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 text-white p-1 rounded text-[10px] outline-none focus:border-[#00f3ff] cursor-pointer">
                  {BADGE_ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ABOUT ME TABS ===== */}
        <div className={sectionCls}>
          <h3 className="text-xs font-bold text-white uppercase mb-2 flex justify-between items-center border-b border-gray-700 pb-1">
            About Me (Tabs)
            <button type="button" onClick={addTab} className="text-[10px] bg-gray-800 hover:bg-gray-700 text-[#00f3ff] px-2 py-0.5 rounded font-bold transition-colors">+ Add Tab</button>
          </h3>
          <div className="space-y-2 mt-2 max-h-52 overflow-y-auto custom-scroll pr-1">
            {profile.aboutTabs.map((t, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 p-2 bg-black border border-gray-700 rounded relative">
                <button type="button" onClick={() => removeTab(idx)} className="absolute top-1 right-1 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-1.5 rounded text-[10px] font-bold transition-colors z-10">X</button>
                <input type="text" value={t.title} onChange={e => updateTab(idx, 'title', e.target.value)} placeholder="Tab Title" className="w-[85%] bg-transparent text-white border-b border-gray-700 text-xs outline-none focus:border-[#00f3ff] pb-1 font-bold" />
                <textarea rows={3} maxLength={400} placeholder="Markdown (max 400 chars)" value={t.content} onChange={e => updateTab(idx, 'content', e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-gray-300 p-1.5 rounded text-[11px] outline-none focus:border-[#00f3ff] mt-1 custom-scroll" />
              </div>
            ))}
          </div>
        </div>

        {/* ===== SOCIAL BUTTONS ===== */}
        <div className={sectionCls}>
          <h3 className="text-xs font-bold text-white uppercase mb-2 flex justify-between items-center border-b border-gray-700 pb-1">
            SOCIAL / ACTION BUTTONS
            <button type="button" onClick={() => addButton()} className="text-[10px] bg-gray-800 hover:bg-gray-700 text-[#00f3ff] px-2 py-0.5 rounded font-bold transition-colors">+ Add Btn</button>
          </h3>
          {/* Presets */}
          <div className="flex gap-1 mb-2 overflow-x-auto custom-scroll pb-1 text-[10px] whitespace-nowrap text-gray-300">
            <span className="mr-1 mt-0.5 font-bold text-gray-500">Presets:</span>
            {Object.keys(BUTTON_PRESETS).map(key => (
              <button key={key} type="button" onClick={() => addButton(key)} className="bg-gray-800 hover:bg-gray-600 px-1.5 py-0.5 rounded capitalize">{key}</button>
            ))}
          </div>
          <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto custom-scroll pr-1">
            {profile.buttons.map((b, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 p-2 bg-black border border-gray-700 rounded relative">
                <button type="button" onClick={() => removeButton(idx)} className="absolute top-1 right-1 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-1.5 rounded text-[10px] font-bold transition-colors z-10">X</button>
                <div className="flex items-center gap-2 pr-6">
                  <select value={b.icon} onChange={e => updateButton(idx, 'icon', e.target.value)} className="w-20 bg-gray-800 border border-gray-700 text-white p-1 rounded text-[10px] outline-none focus:border-[#00f3ff] cursor-pointer">
                    {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <input type="text" value={b.label} onChange={e => updateButton(idx, 'label', e.target.value)} placeholder="Btn Label" className="flex-1 bg-transparent text-white border-b border-gray-700 text-xs outline-none focus:border-[#00f3ff] pb-1" />
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <input type="text" value={b.url} onChange={e => updateButton(idx, 'url', e.target.value)} placeholder="URL (Link)" className="flex-1 bg-gray-900 border border-gray-700 text-white p-1.5 rounded text-[11px] outline-none focus:border-[#00f3ff]" />
                  <select value={b.style} onChange={e => updateButton(idx, 'style', e.target.value)} className="w-[70px] bg-gray-800 border border-gray-700 text-white p-1.5 rounded text-[10px] outline-none focus:border-[#00f3ff] cursor-pointer">
                    <option value="primary">Blue</option>
                    <option value="secondary">Gray</option>
                    <option value="success">Green</option>
                    <option value="danger">Red</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== YOUTUBE PLAYLISTS ===== */}
        <div className={sectionCls}>
          <h3 className="text-xs font-bold text-white uppercase mb-2 flex justify-between items-center border-b border-gray-700 pb-1">
            YouTube Playlists
            <label className="flex items-center gap-1 text-[10px] text-gray-400">
              Enable
              <input
                type="checkbox"
                checked={profile.musicEnabled}
                onChange={e => update({ musicEnabled: e.target.checked })}
                className="w-3 h-3"
              />
            </label>
          </h3>
          {profile.musicEnabled && (
            <div className="space-y-2">
              {profile.playlists.map(pl => (
                <div key={pl.id} className="flex items-center justify-between bg-black p-2 rounded border border-gray-700">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[11px] text-gray-200 truncate font-medium">{pl.label}</span>
                    <span className="text-[9px] text-gray-500 truncate">{pl.playlistId}</span>
                  </div>
                  <button type="button" onClick={() => removePlaylist(pl.id)} className="text-red-400 hover:text-red-300 p-1 text-[10px] font-bold">X</button>
                </div>
              ))}
              <div className="bg-black border border-gray-700 rounded p-2 space-y-1.5">
                <input type="text" value={newPlaylistLabel} onChange={e => setNewPlaylistLabel(e.target.value)} placeholder="Playlist Name (Optional)" className="w-full bg-gray-900 border border-gray-700 text-white p-1.5 rounded text-[10px] outline-none focus:border-[#00f3ff]" />
                <input type="text" value={newPlaylistUrl} onChange={e => setNewPlaylistUrl(e.target.value)} placeholder="Paste Playlist URL or ID" className="w-full bg-gray-900 border border-gray-700 text-white p-1.5 rounded text-[10px] outline-none focus:border-[#00f3ff]" />
                <button type="button" onClick={addPlaylist} className="w-full bg-[#00f3ff]/10 hover:bg-[#00f3ff] hover:text-black text-[#00f3ff] border border-[#00f3ff] py-1.5 rounded text-[10px] font-bold transition-all">Add Playlist</button>
              </div>
            </div>
          )}
        </div>

        {/* ===== EXPORT ===== */}
        <div className="pt-2 pb-8">
          <button
            type="button"
            onClick={onDownload}
            className="w-full bg-[#00f3ff] hover:bg-white text-black font-bold font-mono py-3.5 rounded transition-colors shadow-[0_0_15px_rgba(0,243,255,0.4)] tracking-widest text-xs"
          >
            [ EXPORT HTML ]
          </button>
          <p className="text-[10px] text-gray-500 mt-2 text-center leading-relaxed">
            Export produces a standalone HTML file with all<br/>cinematic sequences and profile data embedded.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditorForm;