/**
 * TextItem Component
 * Renders text/label theme items (title, episode_badge, text, etc.)
 */

'use client';

import React from 'react';
import type { ThemeItem as IThemeItem, TextStyleDef, ChipStyleDef, TextAlign } from '@/lib/theme-parser';
import { usePlayerControls } from '../PlayerControlsContext';
import {
  resolveColor,
  mashTextStyle,
  mashChipStyle,
  DEFAULT_TEXT_STYLE,
  DEFAULT_CHIP_STYLE,
  BADGE_IDS,
  parseTextAlign,
} from '@/lib/theme-parser';
import { checkCondition } from '@/lib/theme-parser';
import { heightToQuality } from '@/lib/theme-parser';

interface TextItemProps {
  item: IThemeItem;
  styleOverride?: Record<string, any>;
}

export function TextItem({ item, styleOverride = {} }: TextItemProps) {
  const controller = usePlayerControls();

  // Check visibility condition
  if (!checkCondition(item.visibleWhen, controller)) {
    return null;
  }

  const id = item.id;

  // Get text content based on item type
  const text = getTextContent(id, item, controller);

  if (!text) {
    return null;
  }

  // Check if this is a badge item
  const isBadge = BADGE_IDS.has(id) || id === 'chip';

  if (isBadge) {
    return <BadgeItem item={item} text={text} styleOverride={styleOverride} />;
  }

  return <LabelItem item={item} text={text} styleOverride={styleOverride} />;
}

/**
 * Get text content based on item type
 */
function getTextContent(
  id: string,
  item: IThemeItem,
  controller: any
): string | null {
  switch (id) {
    case 'title':
      return (
        controller.currentEpisode.title ||
        controller.itemName ||
        'Unknown Title'
      );

    case 'episode_badge':
      return controller.currentEpisode.number === 'Offline'
        ? 'Offline'
        : `Episode ${controller.currentEpisode.number}`;

    case 'series_badge':
      const seriesTitle =
        controller.anilistData.title === '?'
          ? controller.itemName
          : controller.anilistData.title;
      return seriesTitle || '';

    case 'quality_badge':
      return heightToQuality(controller.videoHeight);

    case 'text':
      const source = item.grabString('source');
      const fallbackText = item.grabString('text') || '';
      return source ? getTextFromSource(source, controller) : fallbackText;

    default:
      return null;
  }
}

/**
 * Get text from a dynamic source
 */
function getTextFromSource(source: string, controller: any): string {
  switch (source) {
    case 'title':
      return (
        controller.currentEpisode.title ||
        controller.itemName ||
        'Unknown Title'
      );
    case 'episode_label':
      return controller.currentEpisode.number === 'Offline'
        ? 'Offline'
        : `Episode ${controller.currentEpisode.number}`;
    case 'series_title':
      return (
        controller.anilistData.title === '?'
          ? controller.itemName
          : controller.anilistData.title
      ) || '';
    case 'quality_label':
      return heightToQuality(controller.videoHeight);
    case 'current_time':
      return controller.currentPosition;
    case 'duration':
      return controller.episodeDuration;
    case 'remaining':
      return calculateRemainingTime(controller);
    case 'skip_duration':
      return `+${controller.playerSettings.skipDuration}`;
    case 'seek_duration':
      return `${controller.playerSettings.seekDuration}s`;
    default:
      return source;
  }
}

/**
 * Calculate remaining time
 */
function calculateRemainingTime(controller: any): string {
  const currentParts = controller.currentPosition.split(':').map(Number);
  const durationParts = controller.episodeDuration.split(':').map(Number);

  let currentSeconds = 0;
  let durationSeconds = 0;

  if (currentParts.length === 2) {
    currentSeconds = currentParts[0] * 60 + currentParts[1];
  } else if (currentParts.length === 3) {
    currentSeconds = currentParts[0] * 3600 + currentParts[1] * 60 + currentParts[2];
  }

  if (durationParts.length === 2) {
    durationSeconds = durationParts[0] * 60 + durationParts[1];
  } else if (durationParts.length === 3) {
    durationSeconds = durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];
  }

  const remaining = durationSeconds - currentSeconds;
  if (remaining <= 0) return '00:00';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const mm = pad(Math.floor(remaining / 60) % 60);
  const ss = pad(remaining % 60);

  if (remaining >= 3600) {
    return `-${pad(Math.floor(remaining / 3600))}:${mm}:${ss}`;
  }

  return `-${mm}:${ss}`;
}

/**
 * Badge item renderer
 */
function BadgeItem({ item, text, styleOverride }: { item: IThemeItem; text: string; styleOverride: Record<string, any> }) {
  const controller = usePlayerControls();

  // Merge styles
  const baseStyle = DEFAULT_CHIP_STYLE;
  const mergedStyle = mashChipStyle(
    mashChipStyle(baseStyle, item.style),
    styleOverride
  );

  // Resolve colors
  const bgColor = resolveColor(
    mergedStyle.color,
    { primary: '#ffffff' },
    'rgba(255, 255, 255, 0.14)'
  );
  const borderColor = resolveColor(
    mergedStyle.borderColor,
    { primary: '#ffffff' },
    'rgba(255, 255, 255, 0.30)'
  );
  const textColor = resolveColor(
    mergedStyle.textColor,
    { primary: '#ffffff' },
    '#ffffff'
  );

  return (
    <div
      className="inline-flex items-center"
      style={{
        backgroundColor: bgColor,
        borderRadius: mergedStyle.radius,
        border: `${mergedStyle.borderWidth}px solid ${borderColor}`,
        padding: `${mergedStyle.padding.top}px ${mergedStyle.padding.right}px ${mergedStyle.padding.bottom}px ${mergedStyle.padding.left}px`,
      }}
    >
      <span
        className="whitespace-nowrap overflow-hidden text-ellipsis"
        style={{
          color: textColor,
          fontSize: mergedStyle.fontSize,
          fontWeight: mergedStyle.fontWeight,
          letterSpacing: mergedStyle.letterSpacing,
        }}
      >
        {text}
      </span>
    </div>
  );
}

/**
 * Label item renderer
 */
function LabelItem({ item, text, styleOverride }: { item: IThemeItem; text: string; styleOverride: Record<string, any> }) {
  const controller = usePlayerControls();

  // Merge styles
  const baseStyle = DEFAULT_TEXT_STYLE;
  const mergedStyle = mashTextStyle(
    mashTextStyle(baseStyle, item.style),
    styleOverride
  );

  // Resolve color
  const color = resolveColor(
    mergedStyle.color,
    { primary: '#ffffff' },
    '#ffffff'
  );

  // Parse text alignment
  const textAlign = parseTextAlign(item.grabString('textAlign'));

  // Get max lines
  const maxLines = item.grabInt('maxLines', 1);

  return (
    <span
      className="block"
      style={{
        color,
        fontSize: mergedStyle.fontSize,
        fontWeight: mergedStyle.fontWeight,
        letterSpacing: mergedStyle.letterSpacing,
        lineHeight: mergedStyle.height,
        textAlign,
        WebkitLineClamp: maxLines > 0 ? maxLines : undefined,
        WebkitBoxOrient: maxLines > 1 ? 'vertical' : undefined,
        overflow: maxLines > 1 ? 'hidden' : undefined,
        display: maxLines > 1 ? '-webkit-box' : undefined,
      }}
    >
      {text}
    </span>
  );
}
