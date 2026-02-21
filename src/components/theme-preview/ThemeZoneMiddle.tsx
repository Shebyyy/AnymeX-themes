/**
 * ThemeZoneMiddle Component
 * Renders the middle zone of the theme (play/pause, seek controls, episode navigation)
 */

'use client';

import React from 'react';
import type { MiddleZone, ThemeDef } from '@/lib/theme-parser';
import { usePlayerControls } from './PlayerControlsContext';
import { canShowZone, checkCondition } from '@/lib/theme-parser';
import { resolveColor, mashPanelStyle, DEFAULT_PANEL_STYLE } from '@/lib/theme-parser';
import { ButtonItem, SpacerItem } from './ThemeItems';

interface ThemeZoneMiddleProps {
  zone: MiddleZone;
  theme: ThemeDef;
}

export function ThemeZoneMiddle({ zone, theme }: ThemeZoneMiddleProps) {
  const controller = usePlayerControls();
  const locked = controller.isLocked;
  const visible = controller.showControls;

  // Check if zone can be shown
  if (!canShowZone(zone.vibes, locked)) {
    return null;
  }

  // Check visibility condition
  if (!checkCondition(zone.vibes.visibleWhen, controller)) {
    return null;
  }

  // Get the appropriate items based on lock state
  const items = locked ? (zone.lockedItems || []) : zone.normalItems;
  if (items.length === 0) {
    return null;
  }

  // Build the row
  const row = buildFlatRow(items, zone.vibes.itemSpacing, theme);
  if (!row) {
    return null;
  }

  // Apply panel style
  const panelStyle = mashPanelStyle(theme.styles.panel, zone.vibes.panelOverride);
  const withPanel = <PanelWrapper content={row} style={panelStyle} />;

  // Wrap in shell with scale animation
  return (
    <ZoneShell
      content={withPanel}
      vibes={zone.vibes}
      visible={visible}
    />
  );
}

/**
 * Build a flat row of items
 */
function buildFlatRow(
  items: any[],
  spacing: number,
  theme: ThemeDef
): React.ReactNode | null {
  if (items.length === 0) return null;

  const children: React.ReactNode[] = [];

  for (const item of items) {
    const element = buildItem(item, theme);
    if (element) {
      if (children.length > 0 && spacing > 0) {
        children.push(<div key={`spacer-${item.id}`} style={{ width: spacing }} />);
      }
      children.push(<React.Fragment key={item.id}>{element}</React.Fragment>);
    }
  }

  if (children.length === 0) return null;

  return (
    <div className="flex items-center justify-center min-w-0">
      {children}
    </div>
  );
}

/**
 * Build a single theme item
 */
function buildItem(item: any, theme: ThemeDef): React.ReactNode | null {
  // Check visibility condition
  const controller = usePlayerControls();
  if (!checkCondition(item.visibleWhen, controller)) {
    return null;
  }

  switch (item.id) {
    case 'gap':
    case 'spacer':
    case 'flex_spacer':
      return <SpacerItem key={item.id} item={item} />;

    default:
      // All middle items are buttons
      const isPrimary = item.id === 'play_pause' && item.grabBool('primary', true);
      return (
        <ButtonItem
          key={item.id}
          item={item}
          isPrimary={isPrimary}
        />
      );
  }
}

/**
 * Panel wrapper with background, border, blur, and shadow
 */
function PanelWrapper({ content, style }: { content: React.ReactNode; style: any }) {
  if (!style.enabled) {
    return <>{content}</>;
  }

  const wantsBg = style.showBackground;
  const wantsBorder = style.showBorder;
  const wantsBlur = style.blur > 0;
  const wantsShadow = style.shadowBlur > 0;

  if (!wantsBg && !wantsBorder && !wantsBlur && !wantsShadow) {
    return <>{content}</>;
  }

  const bgColor = resolveColor(
    style.color,
    { primary: '#ffffff' },
    'rgba(255, 255, 255, 0.08)'
  );
  const borderColor = resolveColor(
    style.borderColor,
    { primary: '#ffffff' },
    'rgba(255, 255, 255, 0.22)'
  );
  const shadowColor = resolveColor(
    style.shadowColor,
    { primary: '#ffffff' },
    'rgba(0, 0, 0, 0.22)'
  );

  return (
    <div
      className="relative"
      style={{
        backgroundColor: wantsBg ? bgColor : 'transparent',
        borderRadius: style.radius,
        border: wantsBorder ? `${style.borderWidth}px solid ${borderColor}` : 'none',
        boxShadow: wantsShadow
          ? `0 ${style.shadowOffsetY}px ${style.shadowBlur}px ${shadowColor}`
          : 'none',
        backdropFilter: wantsBlur ? `blur(${style.blur}px)` : 'none',
        WebkitBackdropFilter: wantsBlur ? `blur(${style.blur}px)` : 'none',
      }}
    >
      <div
        style={{
          paddingTop: style.padding.top,
          paddingBottom: style.padding.bottom,
          paddingLeft: style.padding.left,
          paddingRight: style.padding.right,
        }}
      >
        {content}
      </div>
    </div>
  );
}

/**
 * Zone shell with padding and animations
 */
function ZoneShell({
  content,
  vibes,
  visible,
}: {
  content: React.ReactNode;
  vibes: any;
  visible: boolean;
}) {
  return (
    <div
      className={`
        transition-all duration-300
        ${!visible && vibes.ignorePointerWhenHidden ? 'pointer-events-none' : ''}
      `}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'scale(1)'
          : `scale(${vibes.hiddenScale})`,
        transitionDuration: `${vibes.opacityDurationMs}ms`,
        transitionTimingFunction: getCurveCss(vibes.scaleCurve),
      }}
    >
      <div
        style={{
          paddingTop: vibes.padding.top,
          paddingBottom: vibes.padding.bottom,
          paddingLeft: vibes.padding.left,
          paddingRight: vibes.padding.right,
        }}
      >
        {content}
      </div>
    </div>
  );
}

function getCurveCss(curve: string): string {
  switch (curve) {
    case 'linear':
      return 'linear';
    case 'easeIn':
      return 'ease-in';
    case 'easeOut':
      return 'ease-out';
    case 'easeInOut':
      return 'ease-in-out';
    case 'easeOutCubic':
      return 'cubic-bezier(0.22, 1, 0.36, 1)';
    case 'easeOutBack':
      return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    default:
      return 'ease-out';
  }
}
