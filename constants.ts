
import { UserProfile } from './types';

export const DISCORD_COLORS = {
  bg: "#36393f",
  bgSecondary: "#2f3136",
  bgTertiary: "#202225",
  interactiveNormal: "#b9bbbe",
  interactiveHover: "#dcddde",
  textNormal: "#dcddde",
  textMuted: "#72767d",
  green: "#3ba55c",
};

export const STATUS_COLORS = {
  online: "#3ba55c",
  idle: "#faa61a",
  dnd: "#ed4245",
  offline: "#747f8d",
};

export const DEFAULT_PROFILE: UserProfile = {
  username: "user_handle",
  discriminator: "0001",
  displayName: "Display Name",
  pronouns: "he/him",
  identityFormat: 'modern',
  bio: "Hello! This is my custom generated profile page.\nI like coding and listening to music.",
  birthday: "2000-01-01",
  showBirthday: true,
  status: 'online',
  avatarUrl: "https://picsum.photos/128/128",
  bannerUrl: "https://picsum.photos/600/240",
  musicEnabled: true,
  playlists: [
      { id: '1', label: 'NCS Gaming Music', playlistId: 'PLRBp0Fe2GpglKIXdvLnzcnCdRwEr3tbkO' },
      { id: '2', label: 'Lofi Hip Hop', playlistId: 'OLAK5uy_m-bfKztHD0YmXtPCwNcvlPyuG5incZ_hI' },
      { id: '3', label: 'My Collection', playlistId: 'PLlGe81CqHHzIYyot5LKKms4Z47phIokm5' }
  ],
  badges: [
    { id: '1', label: 'HypeSquad', color: '#faa61a', style: 'solid' },
    { id: '2', label: 'Nitro', color: '#5865F2', style: 'solid' },
    { id: '3', label: 'Dev', color: '#eb459e', style: 'outline' }
  ],
  connections: [
    { id: '1', label: 'GitHub', url: 'https://github.com' },
    { id: '2', label: 'Instagram', url: 'https://instagram.com' }
  ],
  theme: {
    primary: "#5865F2",      // Discord Blurple
    secondary: "#EB459E",    // Pinkish for gradient
    background: "#111214",   // Dark Card Background
    button: "#5865F2",       // Button Color
    mode: 'simple'
  }
};
