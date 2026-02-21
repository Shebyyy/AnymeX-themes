/**
 * SpacerItem Component
 * Renders spacer and gap theme items
 */

'use client';

import React from 'react';
import type { ThemeItem as IThemeItem } from '@/lib/theme-parser';
import { checkCondition } from '@/lib/theme-parser';

interface SpacerItemProps {
  item: IThemeItem;
}

export function SpacerItem({ item }: SpacerItemProps) {
  const id = item.id;

  if (id === 'gap') {
    return <GapItem item={item} />;
  }

  if (id === 'spacer') {
    return <SpacerBoxItem item={item} />;
  }

  if (id === 'flex_spacer') {
    return <FlexSpacerItem item={item} />;
  }

  return null;
}

/**
 * Gap item - fixed size gap
 */
function GapItem({ item }: { item: IThemeItem }) {
  const size = item.grabDouble('size', 8);
  const width = item.grabDouble('width', size);
  const height = item.grabDouble('height', 0);

  return (
    <div
      style={{
        width,
        height,
        flexShrink: 0,
      }}
    />
  );
}

/**
 * Spacer item - fixed size spacer (can be used as gap or just space)
 */
function SpacerBoxItem({ item }: { item: IThemeItem }) {
  const flex = item.grabInt('flex', 0);

  // If flex is specified, use flex spacer
  if (flex > 0) {
    return <FlexSpacerItem item={item} />;
  }

  // Otherwise use fixed size
  const size = item.grabDouble('size', 8);
  const width = item.grabDouble('width', size);
  const height = item.grabDouble('height', 0);

  return (
    <div
      style={{
        width,
        height,
        flexShrink: 0,
      }}
    />
  );
}

/**
 * Flex spacer - takes available space
 */
function FlexSpacerItem({ item }: { item: IThemeItem }) {
  const flex = item.grabInt('flex', 1);

  return (
    <div
      style={{
        flex,
        minWidth: 0,
      }}
    />
  );
}
