import React from 'react';
import { UserProfile, Badge } from '../types';
import { STATUS_COLORS } from '../constants';
import { ExternalLink, Cake } from 'lucide-react';

interface ProfileCardProps {
  profile: UserProfile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
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

  const cardStyle: React.CSSProperties = {
      background: profile.theme.mode === 'gradient' ? `linear-gradient(to bottom right, ${profile.theme.primary} 0%, ${profile.theme.secondary} 100%)` : profile.theme.background,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  };

  return (
    <div className="relative w-full max-w-[600px] lg:w-[600px] rounded-lg overflow-hidden z-10 font-sans" style={cardStyle}>
       <style>{`
          .discord-quote { border-left: 4px solid #4f545c; padding-left: 10px; margin: 4px 0; color: #b9bbbe; font-size: 0.9em; }
          .discord-pre { background: #2f3136; padding: 8px; border-radius: 4px; overflow-x: auto; margin: 4px 0; border: 1px solid #202225; }
          .discord-inline-code { background: #2f3136; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.85em; }
          .discord-spoiler { background: #202225; color: transparent; border-radius: 3px; padding: 0 2px; cursor: pointer; transition: color 0.1s; }
          .discord-spoiler:hover { background: #292b2f; }
          .discord-spoiler.revealed { background: #4f545c; color: inherit; }
          .discord-link { color: #00b0f4; text-decoration: none; }
          .discord-link:hover { text-decoration: underline; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
          .scrollbar-ghost::-webkit-scrollbar { width: 4px; height: 4px; }
          .scrollbar-ghost::-webkit-scrollbar-track { background: transparent; }
          .scrollbar-ghost::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* Banner & Avatar */}
      <div className="h-[180px] lg:h-[160px] w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${profile.bannerUrl})`, backgroundColor: profile.theme.primary }}>
          <div className="absolute -bottom-[40px] left-[16px] p-[5px] rounded-full" style={{ backgroundColor: profile.theme.mode === 'gradient' ? 'rgba(0,0,0,0.2)' : profile.theme.background }}>
             <img src={profile.avatarUrl} alt="Avatar" className="w-[90px] h-[90px] lg:w-[80px] lg:h-[80px] rounded-full object-cover border-[5px]" style={{ backgroundColor: profile.theme.background, borderColor: profile.theme.mode === 'gradient' ? 'transparent' : profile.theme.background }} />
             <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full border-[5px]" style={{ backgroundColor: STATUS_COLORS[profile.status], borderColor: profile.theme.mode === 'gradient' ? 'transparent' : profile.theme.background }}></div>
          </div>
      </div>

      <div className="pt-[50px] pb-5 px-4" style={{ background: profile.theme.mode === 'gradient' ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))` : 'transparent' }}>
        <div className="flex justify-between items-start">
            <div>
                {profile.identityFormat === 'modern' ? (
                     <div>
                         <h1 className="text-white text-xl font-bold leading-tight">{profile.displayName || profile.username}</h1>
                         <div className="text-gray-300 font-medium text-sm mt-0.5 flex items-center gap-2">
                            <span>@{profile.username}</span>
                            {profile.pronouns && <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] text-gray-400">{profile.pronouns}</span>}
                         </div>
                     </div>
                ) : (
                    <h1 className="text-white text-xl font-bold leading-tight">{profile.username}<span className="text-gray-300 font-medium ml-1">#{profile.discriminator}</span></h1>
                )}
            </div>
            <div className="flex gap-1 mt-1 flex-wrap justify-end max-w-[50%]">{profile.badges.map((badge) => (<div key={badge.id} className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide" style={getBadgeStyle(badge)}>{badge.label}</div>))}</div>
        </div>

        <div className="h-[1px] bg-white/10 my-3 w-full"></div>

        <div className="mb-4">
            <h3 className="text-xs font-bold text-white/70 uppercase mb-2">About Me</h3>
            <div className="max-h-[100px] lg:max-h-[180px] overflow-y-auto custom-scrollbar">
                <div className="text-sm text-gray-100 whitespace-pre-line leading-relaxed pr-1" dangerouslySetInnerHTML={{ __html: parseDiscordMarkdown(profile.bio) }} />
            </div>
            {profile.birthday && profile.showBirthday && (
                <div className="flex items-center gap-2 mt-3 text-gray-400 text-xs"><Cake size={14} /><span>{new Date(profile.birthday).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
            )}
        </div>

        {profile.connections && profile.connections.length > 0 && (
            <div>
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
      </div>
    </div>
  );
};

export default ProfileCard;
