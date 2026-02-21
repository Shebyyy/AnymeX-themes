/**
 * SliderItem Component
 * Renders the progress slider (progress_slider)
 */

'use client';

import React from 'react';
import type { ThemeItem as IThemeItem } from '@/lib/theme-parser';
import { usePlayerControls } from '../PlayerControlsContext';
import { checkCondition } from '@/lib/theme-parser';

interface SliderItemProps {
  item: IThemeItem;
  styleOverride?: Record<string, any>;
  sliderStyle?: 'ios' | 'capsule';
}

export function SliderItem({ item, styleOverride = {}, sliderStyle = 'capsule' }: SliderItemProps) {
  const controller = usePlayerControls();

  // Check visibility condition
  if (!checkCondition(item.visibleWhen, controller)) {
    return null;
  }

  // Parse current and duration times to calculate progress
  const progress = calculateProgress(controller.currentPosition, controller.episodeDuration);

  if (sliderStyle === 'capsule') {
    return <CapsuleSlider progress={progress} styleOverride={styleOverride} />;
  }

  return <IosSlider progress={progress} styleOverride={styleOverride} />;
}

/**
 * Calculate progress percentage (0-1)
 */
function calculateProgress(current: string, duration: string): number {
  const currentSeconds = parseTimeToSeconds(current);
  const durationSeconds = parseTimeToSeconds(duration);

  if (durationSeconds === 0) return 0.35; // Default to 35% for preview

  const progress = currentSeconds / durationSeconds;
  return Math.max(0, Math.min(1, progress || 0.35)); // Default to 35% if parsing fails
}

/**
 * Parse time string (MM:SS or HH:MM:SS) to seconds
 */
function parseTimeToSeconds(time: string): number {
  const parts = time.split(':').map(Number);

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
}

/**
 * Capsule-style slider (rounded pill shape)
 */
function CapsuleSlider({ progress, styleOverride }: { progress: number; styleOverride: Record<string, any> }) {
  const height = styleOverride['height'] || 4;
  const trackColor = styleOverride['trackColor'] || 'rgba(255, 255, 255, 0.2)';
  const filledColor = styleOverride['filledColor'] || '#818cf8';

  return (
    <div
      className="relative w-full overflow-hidden rounded-full"
      style={{
        height,
        backgroundColor: trackColor,
      }}
    >
      <div
        className="absolute left-0 top-0 h-full transition-all duration-300 ease-out"
        style={{
          width: `${progress * 100}%`,
          backgroundColor: filledColor,
        }}
      />
    </div>
  );
}

/**
 * iOS-style slider (thin line with circular thumb)
 */
function IosSlider({ progress, styleOverride }: { progress: number; styleOverride: Record<string, any> }) {
  const height = styleOverride['height'] || 3;
  const trackColor = styleOverride['trackColor'] || 'rgba(255, 255, 255, 0.2)';
  const filledColor = styleOverride['filledColor'] || '#818cf8';
  const thumbSize = styleOverride['thumbSize'] || 12;
  const thumbColor = styleOverride['thumbColor'] || '#ffffff';

  return (
    <div
      className="relative w-full"
      style={{
        height: Math.max(height, thumbSize),
      }}
    >
      {/* Track background */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-full rounded-full"
        style={{
          height,
          backgroundColor: trackColor,
        }}
      />

      {/* Filled track */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-full rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${progress * 100}%`,
          height,
          backgroundColor: filledColor,
        }}
      />

      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full shadow-lg transition-all duration-300 ease-out"
        style={{
          left: `calc(${progress * 100}% - ${thumbSize / 2}px)`,
          width: thumbSize,
          height: thumbSize,
          backgroundColor: thumbColor,
        }}
      />
    </div>
  );
}
