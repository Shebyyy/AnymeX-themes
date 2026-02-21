/**
 * ButtonItem Component
 * Renders a button theme item (play_pause, seek, settings, etc.)
 */

'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import type { ThemeItem as IThemeItem, ButtonStyleDef } from '@/lib/theme-parser';
import { usePlayerControls } from '../PlayerControlsContext';
import { resolveColor, mashButtonStyle, DEFAULT_BUTTON_STYLE, DEFAULT_PRIMARY_BUTTON_STYLE, ICON_MAP } from '@/lib/theme-parser';
import { checkCondition, isThingEnabled } from '@/lib/theme-parser';

interface ButtonItemProps {
  item: IThemeItem;
  styleOverride?: Record<string, any>;
  isPrimary?: boolean;
}

export function ButtonItem({ item, styleOverride = {}, isPrimary = false }: ButtonItemProps) {
  const controller = usePlayerControls();

  // Check visibility condition
  if (!checkCondition(item.visibleWhen, controller)) {
    return null;
  }

  const id = item.id;

  // Handle offline-only items
  if ((id === 'server' || id === 'quality') && controller.isOffline) {
    return null;
  }

  // Handle mobile-only items
  if (id === 'orientation' && !controller.isMobile) {
    return null;
  }

  // Determine if this is the play_pause button
  const isPlayPause = id === 'play_pause';

  // Get base style
  const baseStyle = isPrimary ? DEFAULT_PRIMARY_BUTTON_STYLE : DEFAULT_BUTTON_STYLE;

  // Merge base style, item style, and override
  const mergedStyle = mashButtonStyle(
    mashButtonStyle(baseStyle, item.style),
    styleOverride
  );

  // Check enabled state
  let enabled = isThingEnabled(id, controller);
  if (item.enabledWhen) {
    enabled = enabled && checkCondition(item.enabledWhen, controller);
  }

  // Resolve colors
  const buttonColor = resolveColor(
    mergedStyle.color,
    { primary: '#ffffff' },
    'rgba(255, 255, 255, 0.12)'
  );
  const borderColor = resolveColor(
    mergedStyle.borderColor,
    { primary: '#ffffff' },
    'rgba(255, 255, 255, 0.28)'
  );
  const iconColor = resolveColor(
    mergedStyle.iconColor,
    { primary: '#ffffff' },
    '#ffffff'
  );
  const disabledIconColor = resolveColor(
    mergedStyle.disabledIconColor,
    { primary: '#ffffff' },
    'rgba(255, 255, 255, 0.55)'
  );

  // Pick icon
  const customIcon = item.grabString('icon');
  const iconKey = customIcon && ICON_MAP[customIcon] ? customIcon : id;
  const iconName = ICON_MAP[iconKey];

  if (!iconName) {
    return null;
  }

  // Get tooltip
  const tooltip = item.grabString('tooltip') || getTooltipForId(id);

  // Render play/pause with state switching
  if (isPlayPause) {
    return (
      <div
        className="relative inline-flex items-center justify-center"
        style={{
          width: mergedStyle.size,
          height: mergedStyle.size,
        }}
        title={tooltip}
      >
        {controller.isBuffering ? (
          <div
            className="animate-spin"
            style={{
              width: mergedStyle.iconSize,
              height: mergedStyle.iconSize,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke={enabled ? iconColor : disabledIconColor}
                strokeWidth="2"
                opacity="0.25"
              />
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                fill={enabled ? iconColor : disabledIconColor}
                opacity="0.5"
              />
            </svg>
          </div>
        ) : (
          <Icon
            icon={controller.isPlaying ? 'solar:pause-linear' : 'solar:play-linear'}
            style={{
              fontSize: mergedStyle.iconSize,
              color: enabled ? iconColor : disabledIconColor,
            }}
          />
        )}
      </div>
    );
  }

  // Render regular button
  return (
    <div
      className="relative inline-flex items-center justify-center transition-opacity"
      style={{
        width: mergedStyle.size,
        height: mergedStyle.size,
        opacity: enabled ? 1 : 0.6,
      }}
      title={tooltip}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: buttonColor,
          borderRadius: mergedStyle.radius,
          border: mergedStyle.borderWidth > 0
            ? `${mergedStyle.borderWidth}px solid ${borderColor}`
            : 'none',
        }}
      />
      <Icon
        icon={iconName}
        className="relative z-10"
        style={{
          fontSize: mergedStyle.iconSize,
          color: enabled ? iconColor : disabledIconColor,
        }}
      />
    </div>
  );
}

/**
 * Get tooltip text for a button ID
 */
function getTooltipForId(id: string): string | undefined {
  const tooltips: Record<string, string> = {
    back: 'Back',
    lock_controls: 'Lock Controls',
    unlock_controls: 'Unlock Controls',
    toggle_fullscreen: 'Fullscreen',
    open_settings: 'Settings',
    previous_episode: 'Previous Episode',
    next_episode: 'Next Episode',
    seek_back: 'Seek Back',
    seek_forward: 'Seek Forward',
    play_pause: 'Play / Pause',
    playlist: 'Playlist',
    shaders: 'Shaders & Color Profiles',
    subtitles: 'Subtitles',
    server: 'Server',
    quality: 'Quality',
    speed: 'Speed',
    audio_track: 'Audio Track',
    orientation: 'Toggle Orientation',
    aspect_ratio: 'Aspect Ratio',
    mega_seek: 'Mega Seek',
  };
  return tooltips[id];
}
