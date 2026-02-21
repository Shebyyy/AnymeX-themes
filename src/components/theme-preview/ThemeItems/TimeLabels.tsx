/**
 * TimeLabels Component
 * Renders time label items (time_current, time_duration, time_remaining)
 */

'use client';

import React from 'react';
import type { ThemeItem as IThemeItem } from '@/lib/theme-parser';
import { usePlayerControls } from '../PlayerControlsContext';
import { checkCondition } from '@/lib/theme-parser';
import { TextItem } from './TextItem';

interface TimeLabelsProps {
  item: IThemeItem;
}

export function TimeLabels({ item }: TimeLabelsProps) {
  const controller = usePlayerControls();
  const id = item.id;

  // Check visibility condition
  if (!checkCondition(item.visibleWhen, controller)) {
    return null;
  }

  let text = '';

  switch (id) {
    case 'time_current':
      text = controller.currentPosition;
      break;
    case 'time_duration':
      text = controller.episodeDuration;
      break;
    case 'time_remaining':
      text = calculateRemainingTime(controller);
      break;
    default:
      return null;
  }

  // Create a synthetic text item with the time value
  const textItem: IThemeItem = {
    id: 'text',
    data: {
      ...item.data,
      text,
    },
    visibleWhen: undefined,
    enabledWhen: undefined,
    style: item.style,
    grabString: (key: string) => {
      if (key === 'text') return text;
      return (item.data as any)[key];
    },
    grabInt: (key: string, fallback: number) => {
      const val = (item.data as any)[key];
      return typeof val === 'number' ? val : fallback;
    },
    grabDouble: (key: string, fallback: number) => {
      const val = (item.data as any)[key];
      return typeof val === 'number' ? val : fallback;
    },
    grabBool: (key: string, fallback: boolean) => {
      const val = (item.data as any)[key];
      return typeof val === 'boolean' ? val : fallback;
    },
  };

  return <TextItem item={textItem} styleOverride={item.style} />;
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
