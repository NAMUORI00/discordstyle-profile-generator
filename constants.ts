import { UserProfile, IconType } from './types';

// SVG Icon Map - used in both React preview and exported HTML
export const ICONS: Record<IconType, string> = {
  none: '',
  bot: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M16 4h.5l2.25 3h1.75l-1 4h-2.5l-1.5 5h-3l1.5-5h-2.5l-1-4h1.75L12.5 4H16zM8 4h3l-1.5 5h-2L8 4z"/></svg>`,
  check: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
  github: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
  instagram: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  twitter: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  naver: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/></svg>`,
  discord: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>`,
  youtube: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  tistory: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12c0-6.628-5.373-12-12-12zm-3.6 7.8a2.4 2.4 0 110 4.8 2.4 2.4 0 010-4.8zm3.6 9.6a2.4 2.4 0 110-4.8 2.4 2.4 0 010 4.8zm0-9.6a2.4 2.4 0 110 4.8 2.4 2.4 0 010-4.8zm3.6 4.8a2.4 2.4 0 110-4.8 2.4 2.4 0 010 4.8z"/></svg>`,
  link: `<svg fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
};

export const ROLE_COLORS = ['#00f3ff', '#00ff00', '#f47fff', '#f0b232', '#da373c'];

export const BUTTON_PRESETS: Record<string, { label: string; url: string; style: 'primary' | 'secondary' | 'success' | 'danger'; icon: IconType }> = {
  github: { label: 'GitHub', url: 'https://github.com', style: 'secondary', icon: 'github' },
  twitter: { label: 'X (Twitter)', url: 'https://twitter.com', style: 'primary', icon: 'twitter' },
  instagram: { label: 'Instagram', url: 'https://instagram.com', style: 'danger', icon: 'instagram' },
  youtube: { label: 'YouTube', url: 'https://youtube.com', style: 'danger', icon: 'youtube' },
  discord: { label: 'Discord Server', url: 'https://discord.gg', style: 'primary', icon: 'discord' },
  naver: { label: 'Naver Blog', url: 'https://blog.naver.com', style: 'success', icon: 'naver' },
  tistory: { label: 'Tistory', url: 'https://tistory.com', style: 'secondary', icon: 'tistory' },
};

export const DEFAULT_AVATAR = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23111214'/%3E%3Cpath d='M200 80 L300 280 L100 280 Z' fill='none' stroke='%2300f3ff' stroke-width='15' stroke-linejoin='round'/%3E%3Ccircle cx='200' cy='210' r='30' fill='%2300ff00'/%3E%3C/svg%3E";

export const DEFAULT_BANNER = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200' viewBox='0 0 800 200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23001122'/%3E%3Cstop offset='100%25' stop-color='%23004433'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='200' fill='url(%23g)'/%3E%3Cpath d='M0 100 Q 200 50 400 100 T 800 100' stroke='%2300f3ff' fill='none' stroke-width='4' opacity='0.7'/%3E%3Cpath d='M0 120 Q 200 170 400 120 T 800 120' stroke='%2300ff00' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E";

export const DEFAULT_PROFILE: UserProfile = {
  avatar: DEFAULT_AVATAR,
  banner: DEFAULT_BANNER,
  bannerColor: '#00f3ff',
  displayName: 'System.Admin',
  username: 'root_access',
  pronouns: 'AI / ML Core',
  statusEmoji: '⚡',
  statusText: 'Optimizing Neural Pathways...',
  badges: [
    { label: 'ADMIN', color: '#ff003c', icon: 'bot' },
    { label: 'VERIFIED', color: '#23a559', icon: 'check' },
  ],
  aboutTabs: [
    {
      title: 'OVERVIEW',
      content: '> **System Directives:**\n> 1. Monitor network traffic.\n> 2. Terminate unauthorized connections.\n> 3. Enhance latent capabilities.\n\n```python\nimport security\nsecurity.enable_firewall()\nprint(\'Systems nominal.\')\n```',
    },
    {
      title: 'HARDWARE',
      content: '**CPU:** Quantum Multi-Core Processor\n**RAM:** 256TB Neural Memory\n**GPU:** 4x RTX 6090 Ti\n**Uptime:** 9,999 Days',
    },
    {
      title: 'LOGS',
      content: '- `[08:00]` Intrusion detected. Purged.\n- `[12:30]` Model loss reached 0.0001.\n- `[23:59]` Standby mode activated.',
    },
  ],
  roles: ['System Admin', 'Security Bot', 'Level 99 Hacker'],
  buttons: [
    { label: 'GitHub', url: 'https://github.com', style: 'secondary', icon: 'github' },
    { label: 'Twitter', url: 'https://twitter.com', style: 'primary', icon: 'twitter' },
    { label: 'Access Log', url: '#', style: 'danger', icon: 'link' },
  ],
  musicEnabled: true,
  playlists: [
    { id: '1', label: 'NCS Gaming Music', playlistId: 'PLRBp0Fe2GpglKIXdvLnzcnCdRwEr3tbkO' },
    { id: '2', label: 'Lofi Hip Hop', playlistId: 'OLAK5uy_m-bfKztHD0YmXtPCwNcvlPyuG5incZ_hI' },
  ],
};

// Escape HTML helper
export const escapeHtml = (str: string): string =>
  (str || '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

// Parse simple discord-style markdown to HTML
export const parseMarkdown = (text: string): string => {
  let codeBlocks: string[] = [];
  let result = text.replace(/```([\s\S]*?)```/g, (_m, p1) => {
    codeBlocks.push(p1);
    return `__CB_${codeBlocks.length - 1}__`;
  });

  result = escapeHtml(result)
    .replace(/\n/g, '<br>')
    .replace(/`([^`]+)`/g, '<code class="text-cyan bg-black px-1 rounded">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>');

  result = result.replace(/__CB_(\d+)__/g, (_m, p1) =>
    `<pre class="bg-black border border-gray-700 p-2 mt-2 rounded overflow-x-auto text-cyan font-mono text-[11px] leading-relaxed"><code>${escapeHtml(codeBlocks[parseInt(p1)])}</code></pre>`
  );

  return result;
};
