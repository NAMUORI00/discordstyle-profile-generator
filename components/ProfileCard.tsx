import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ICONS, ROLE_COLORS, parseMarkdown, escapeHtml } from '../constants';

interface ProfileCardProps {
  profile: UserProfile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  const safeIdx = activeTabIdx >= profile.aboutTabs.length ? 0 : activeTabIdx;

  const getButtonBg = (style: string) => {
    switch (style) {
      case 'primary': return 'bg-[#5865F2] hover:bg-[#4752C4]';
      case 'success': return 'bg-[#23a559] hover:bg-[#1a7c43]';
      case 'danger': return 'bg-[#da373c] hover:bg-[#a1282b]';
      default: return 'bg-[#4E5058] hover:bg-[#6D6F78]';
    }
  };

  return (
    <div className="w-full max-w-[360px] mx-auto lg:mx-0 bg-[#111214] rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-gray-800/80 shrink-0 flex flex-col relative z-10 pb-4">
      {/* Banner */}
      <div
        className="h-[120px] bg-cover bg-center rounded-t-[16px] relative z-0 w-full transition-all"
        style={{
          backgroundImage: profile.banner ? `url("${profile.banner.replace(/"/g, '\\"')}")` : 'none',
          backgroundColor: profile.banner ? 'transparent' : (profile.bannerColor || '#000'),
        }}
      />

      <div className="px-4 pb-2 relative flex-1 flex flex-col z-10">
        {/* Avatar */}
        <div className="absolute -top-[50px] left-4 z-20">
          <div className="w-[100px] h-[100px] rounded-full border-[6px] border-[#111214] bg-[#111214] relative shadow-lg">
            <img
              src={profile.avatar || ''}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover bg-black"
            />
            <div className="absolute bottom-0 right-0 w-[22px] h-[22px] bg-[#23a559] border-[4px] border-[#111214] rounded-full shadow-sm z-30" />
          </div>
        </div>

        <div className="pt-[60px]">
          <div className="bg-[#1e1f22] rounded-[8px] p-4 border border-gray-800 shadow-inner flex flex-col h-full">
            {/* Name & Badges */}
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <h1 className="text-[20px] font-bold text-[#f2f3f5] leading-none break-words mr-1">
                {profile.displayName}
              </h1>
              {profile.badges.map((b, i) => {
                const iconSvg = ICONS[b.icon] || '';
                return (
                  <span
                    key={i}
                    className="text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold shadow-sm"
                    style={{ backgroundColor: b.color }}
                  >
                    {iconSvg && (
                      <span
                        className="w-3 h-3 inline-block"
                        dangerouslySetInnerHTML={{ __html: iconSvg }}
                      />
                    )}
                    {b.label}
                  </span>
                );
              })}
            </div>

            {/* Username & Pronouns */}
            <div className="text-[14px] text-[#b5bac1] font-medium mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[#f2f3f5]">{profile.username}</span>
              <span className="text-[#b5bac1]">•</span>
              <span>{profile.pronouns}</span>
            </div>

            {/* Status */}
            <div className="text-[14px] text-[#f2f3f5] flex items-center gap-2 pb-3 border-b border-[#3f4147]">
              <span>{profile.statusEmoji}</span>
              <span>{profile.statusText}</span>
            </div>

            {/* About Me Tabs */}
            {profile.aboutTabs.length > 0 && (
              <div className="mt-3 flex flex-col flex-1">
                <div className="flex items-center justify-between border-b border-[#3f4147] mb-1.5">
                  <div className="flex gap-3 overflow-x-auto custom-scroll shrink-0">
                    {profile.aboutTabs.map((tab, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveTabIdx(i)}
                        className={`text-[11px] font-bold uppercase tracking-wide pb-0.5 transition-colors whitespace-nowrap outline-none border-b-2 ${
                          i === safeIdx
                            ? 'text-[#f2f3f5] border-[#00f3ff]'
                            : 'text-[#b5bac1] hover:text-[#f2f3f5] cursor-pointer border-transparent'
                        }`}
                      >
                        {tab.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  className="text-[13px] text-[#f2f3f5] leading-relaxed dc-markdown break-words max-h-[160px] overflow-y-auto custom-scroll pr-2 mt-1"
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdown(profile.aboutTabs[safeIdx]?.content || ''),
                  }}
                />
              </div>
            )}

            {/* Roles */}
            {profile.roles.length > 0 && (
              <div className="mt-4">
                <h2 className="text-[11px] font-bold text-[#b5bac1] uppercase tracking-wide mb-1.5">
                  Roles
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {profile.roles.map((role, i) => (
                    <div
                      key={i}
                      className="bg-[#292b2f] border border-gray-700/50 rounded px-1.5 py-0.5 flex items-center gap-1.5"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: ROLE_COLORS[i % ROLE_COLORS.length] }}
                      />
                      <span className="text-[11px] text-[#f2f3f5] font-medium">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Buttons */}
            {profile.buttons.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#3f4147] flex flex-wrap gap-2 w-full">
                {profile.buttons.map((btn, i) => {
                  const iconSvg = ICONS[btn.icon] || '';
                  return (
                    <a
                      key={i}
                      href={btn.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 basis-auto min-w-[30%] flex items-center justify-center gap-1.5 text-white py-2 rounded text-[12px] font-bold transition-colors shadow-sm px-2 ${getButtonBg(btn.style)}`}
                    >
                      {iconSvg && (
                        <span
                          className="w-4 h-4 flex items-center justify-center shrink-0"
                          dangerouslySetInnerHTML={{ __html: iconSvg }}
                        />
                      )}
                      <span className="truncate">{btn.label || 'Link'}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
