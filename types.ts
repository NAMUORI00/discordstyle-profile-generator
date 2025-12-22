export interface Connection {
  id: string;
  label: string;
  url: string;
}

export type BadgeStyle = 'solid' | 'outline' | 'soft';

export interface Badge {
  id: string;
  label: string;
  color: string;
  style: BadgeStyle;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  label: string;
}

export interface TrackInfo {
  index: number;
  id: string;
  title: string;
  author: string;
}

export type StatusType = 'online' | 'idle' | 'dnd' | 'offline';
export type IdentityFormat = 'legacy' | 'modern';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  button: string;
  mode: 'simple' | 'gradient';
}

export interface UserProfile {
  username: string; // Used as Name in Legacy, Handle in Modern
  discriminator: string; // Only for Legacy
  displayName: string; // Only for Modern
  pronouns?: string; // Only for Modern
  identityFormat: IdentityFormat;
  bio: string;
  birthday?: string; // YYYY-MM-DD
  showBirthday: boolean;
  status: StatusType;
  avatarUrl: string;
  bannerUrl: string;
  musicEnabled: boolean;
  playlists: PlaylistItem[]; 
  badges: Badge[];
  connections: Connection[];
  theme: ThemeConfig;
}

export interface VisualizerProps {
  isPlaying: boolean;
  primaryColor: string;
}