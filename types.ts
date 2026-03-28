// === Neural Identity Endpoint - Type Definitions ===

export type IconType = 'none' | 'bot' | 'check' | 'github' | 'instagram' | 'twitter' | 'naver' | 'discord' | 'youtube' | 'tistory' | 'link';

export type ButtonStyle = 'primary' | 'secondary' | 'success' | 'danger';

export interface ProfileBadge {
  label: string;
  color: string;
  icon: IconType;
}

export interface AboutTab {
  title: string;
  content: string;
}

export interface SocialButton {
  label: string;
  url: string;
  style: ButtonStyle;
  icon: IconType;
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

export interface UserProfile {
  avatar: string;
  banner: string;
  bannerColor: string;
  displayName: string;
  username: string;
  pronouns: string;
  statusEmoji: string;
  statusText: string;
  badges: ProfileBadge[];
  aboutTabs: AboutTab[];
  roles: string[];
  buttons: SocialButton[];
  // YouTube Music
  musicEnabled: boolean;
  playlists: PlaylistItem[];
}