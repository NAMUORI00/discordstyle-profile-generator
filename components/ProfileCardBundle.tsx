/**
 * ProfileCard Bundle Entry Point
 *
 * 이 파일은 standalone HTML 생성용 번들의 진입점입니다.
 * ProfileCard 컴포넌트와 필요한 의존성을 전역으로 노출합니다.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import ProfileCard from './ProfileCard';
import { UserProfile } from '../types';
import { STATUS_COLORS } from '../constants';

// ProfileCard를 전역으로 노출
(window as any).ProfileCard = ProfileCard;
(window as any).STATUS_COLORS = STATUS_COLORS;

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

  let isPlaying = false;
  const setIsPlaying = (playing: boolean) => {
    isPlaying = playing;
    options?.onPlayingChange?.(playing);
  };

  const root = createRoot(container);
  root.render(
    React.createElement(ProfileCard, {
      profile,
      isPlaying,
      setIsPlaying,
    })
  );

  return root;
};

// 타입 정보도 노출 (개발 편의)
export { ProfileCard, STATUS_COLORS };
export type { UserProfile };
