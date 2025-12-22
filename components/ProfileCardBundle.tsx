/**
 * ProfileCard Bundle Entry Point
 *
 * 이 파일은 standalone HTML 생성용 번들의 진입점입니다.
 * ProfileCard와 MusicCard 컴포넌트를 전역으로 노출합니다.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import ProfileCard from './ProfileCard';
import MusicCard from './MusicCard';
import { UserProfile } from '../types';
import { STATUS_COLORS } from '../constants';

// 컴포넌트를 전역으로 노출
(window as any).ProfileCard = ProfileCard;
(window as any).MusicCard = MusicCard;
(window as any).STATUS_COLORS = STATUS_COLORS;

// State를 관리하고 두 카드를 렌더링하는 Wrapper 컴포넌트
const ProfileMusicWrapper: React.FC<{
  profile: UserProfile;
  onPlayingChange?: (playing: boolean) => void;
}> = ({ profile, onPlayingChange }) => {
  const [isPlaying, setIsPlayingState] = React.useState(false);

  const setIsPlaying = React.useCallback((playing: boolean) => {
    setIsPlayingState(playing);
    onPlayingChange?.(playing);
  }, [onPlayingChange]);

  return React.createElement(
    'div',
    {
      className: 'flex flex-col lg:flex-row gap-4 items-start justify-center',
      style: { width: '100%' }
    },
    React.createElement(ProfileCard, { profile }),
    profile.musicEnabled && React.createElement(MusicCard, {
      profile,
      isPlaying,
      setIsPlaying,
    })
  );
};

// 편의를 위한 렌더 헬퍼 함수
(window as any).renderProfileCard = (
  containerId: string,
  profile: UserProfile,
  options?: { onPlayingChange?: (playing: boolean) => void }
) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element #${containerId} not found`);
    return null;
  }

  const root = createRoot(container);
  root.render(
    React.createElement(ProfileMusicWrapper, {
      profile,
      onPlayingChange: options?.onPlayingChange,
    })
  );

  return root;
};

// 타입 정보도 노출 (개발 편의)
export { ProfileCard, MusicCard, STATUS_COLORS };
export type { UserProfile };
