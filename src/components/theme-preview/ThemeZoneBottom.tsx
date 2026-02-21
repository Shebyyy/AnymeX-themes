/**
 * ThemeZoneBottom Component
 * Renders the bottom zone of the theme (progress slider, time labels, controls)
 */

'use client';

import React from 'react';
import type { BottomZone, ThemeDef } from '@/lib/theme-parser';
import { usePlayerControls } from './PlayerControlsContext';
import { canShowZone, checkCondition } from '@/lib/theme-parser';
import { resolveColor, mashPanelStyle, DEFAULT_PANEL_STYLE } from '@/lib/theme-parser';
import {
  ButtonItem,
  TextItem,
  SpacerItem,
  TimeLabels,
  LabelStack,
  SliderItem,
} from './ThemeItems';

interface ThemeZoneBottomProps {
  zone: BottomZone;
  theme: ThemeDef;
}

export function ThemeZoneBottom({ zone, theme }: ThemeZoneBottomProps) {
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

  // Get the appropriate slot based on lock state
  const slot = locked ? zone.locked : zone.normal;
  if (!slot) {
    return null;
  }

  const children: React.ReactNode[] = [];

  // Outside row (above the panel)
  if (!isSlotCompletelyEmpty(slot.outside)) {
    const outsideRow = (
      <div style={{ padding: formatPadding(zone.outsidePadding) }}>
        <ThreeColumnRow
          left={slot.outside.left}
          center={slot.outside.center}
          right={slot.outside.right}
          vibes={zone.vibes}
          isTitleZone={false}
          absoluteCenter={zone.vibes.absoluteCenter}
          theme={theme}
        />
      </div>
    );
    children.push(outsideRow);
  }

  // Check if progress slider already exists in any row
  const hasProgress = checkForProgress(slot);

  // Inside panel content
  const panelChildren: React.ReactNode[] = [];

  // Top row
  if (!isSlotCompletelyEmpty(slot.topRow)) {
    panelChildren.push(
      <ThreeColumnRow
        key="topRow"
        left={slot.topRow.left}
        center={slot.topRow.center}
        right={slot.topRow.right}
        vibes={zone.vibes}
        isTitleZone={false}
        absoluteCenter={zone.vibes.absoluteCenter}
        theme={theme}
      />
    );
    panelChildren.push(<div key="topRowGap" style={{ height: zone.vibes.topRowBottomSpacing }} />);
  }

  // Progress slider (if enabled and not already present)
  if (zone.showProgress && !hasProgress) {
    panelChildren.push(
      <div
        key="progress"
        style={{
          paddingTop: zone.progressPadding.top,
          paddingBottom: zone.progressPadding.bottom,
          paddingLeft: zone.progressPadding.left,
          paddingRight: zone.progressPadding.right,
        }}
      >
        <SliderItem
          item={{
            id: 'progress_slider',
            data: {},
            visibleWhen: undefined,
            enabledWhen: undefined,
            style: {},
            grabString: () => undefined,
            grabInt: () => 0,
            grabDouble: () => 0,
            grabBool: () => false,
          }}
          sliderStyle={zone.progressStyle}
        />
      </div>
    );
    panelChildren.push(<div key="progressGap" style={{ height: zone.vibes.progressBottomSpacing }} />);
  }

  // Main row (left, center, right)
  if (slot.left.length > 0 || slot.center.length > 0 || slot.right.length > 0) {
    panelChildren.push(
      <ThreeColumnRow
        key="mainRow"
        left={slot.left}
        center={slot.center}
        right={slot.right}
        vibes={zone.vibes}
        isTitleZone={true}
        absoluteCenter={zone.vibes.absoluteCenter}
        theme={theme}
      />
    );
  }

  const hasInsideContent = panelChildren.length > 0;

  // Wrap panel content in panel style
  const insideContent = hasInsideContent ? (
    <div className="flex flex-col min-w-0">
      {panelChildren}
    </div>
  ) : null;

  const panelStyle = mashPanelStyle(theme.styles.panel, zone.vibes.panelOverride);
  const withPanel = insideContent ? (
    <PanelWrapper content={insideContent} style={panelStyle} />
  ) : null;

  if (withPanel) {
    children.push(withPanel);
  }

  // If no content at all, return null
  if (children.length === 0) {
    return null;
  }

  // Wrap in column and shell
  const columnContent = (
    <div className="flex flex-col min-w-0">
      {children}
    </div>
  );

  return (
    <ZoneShell
      content={columnContent}
      vibes={zone.vibes}
      visible={visible}
      zoneIndex={2}
    />
  );
}

/**
 * Check if progress slider exists in any slot
 */
function checkForProgress(slot: any): boolean {
  const checkItems = (items: any[]) => {
    return items?.some((item) => item.id === 'progress_slider') || false;
  };

  return (
    checkItems(slot.left) ||
    checkItems(slot.center) ||
    checkItems(slot.right) ||
    checkItems(slot.topRow?.left) ||
    checkItems(slot.topRow?.center) ||
    checkItems(slot.topRow?.right) ||
    checkItems(slot.outside?.left) ||
    checkItems(slot.outside?.center) ||
    checkItems(slot.outside?.right)
  );
}

/**
 * Three-column row layout
 */
function ThreeColumnRow({
  left,
  center,
  right,
  vibes,
  isTitleZone,
  absoluteCenter,
  theme,
}: {
  left: any[];
  center: any[];
  right: any[];
  vibes: any;
  isTitleZone: boolean;
  absoluteCenter: boolean;
  theme: ThemeDef;
}) {
  const leftContent = buildFlatRow(left, vibes.itemSpacing, theme);
  const centerContent = isTitleZone
    ? buildTitleArea(center, vibes.itemSpacing, theme)
    : buildFlatRow(center, vibes.itemSpacing, theme);
  const rightContent = buildFlatRow(right, vibes.itemSpacing, theme);

  const hasLeft = leftContent !== null;
  const hasCenter = centerContent !== null;
  const hasRight = rightContent !== null;

  if (!hasLeft && !hasCenter && !hasRight) {
    return null;
  }

  if (absoluteCenter && hasCenter) {
    return (
      <div className="relative flex items-center justify-center">
        <div className="flex items-center justify-between w-full">
          {hasLeft && leftContent}
          <div className="flex-1" />
          {hasRight && rightContent}
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {centerContent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {hasLeft && leftContent}
      {hasCenter && (
        <>
          {hasLeft && <div style={{ width: vibes.groupSpacing }} />}
          <div className="flex-1 flex items-center">
            {centerContent}
          </div>
        </>
      )}
      {!hasCenter && <div className="flex-1" />}
      {(hasCenter || hasLeft) && hasRight && (
        <div style={{ width: vibes.groupSpacing }} />
      )}
      {hasRight && rightContent}
    </div>
  );
}

/**
 * Build title area with special layout for title, badges, etc.
 */
function buildTitleArea(
  items: any[],
  spacing: number,
  theme: ThemeDef
): React.ReactNode | null {
  if (items.length === 0) return null;

  const titleItems: any[] = [];
  const badgeItems: any[] = [];
  const stackItems: any[] = [];
  const otherItems: any[] = [];

  // Separate items by type
  for (const item of items) {
    if (item.id === 'title') {
      titleItems.push(item);
    } else if (item.id === 'episode_badge' || item.id === 'series_badge' || item.id === 'quality_badge') {
      badgeItems.push(item);
    } else if (item.id === 'label_stack' || item.id === 'watching_label') {
      stackItems.push(item);
    } else {
      otherItems.push(item);
    }
  }

  if (stackItems.length === 0 && titleItems.length === 0 && badgeItems.length === 0) {
    return buildFlatRow(items, spacing, theme);
  }

  const children: React.ReactNode[] = [];

  // Add stack items
  for (const item of stackItems) {
    const element = buildItem(item, theme);
    if (element) {
      if (children.length > 0) {
        children.push(<div key={`stack-gap-${item.id}`} style={{ height: 4 }} />);
      }
      children.push(<React.Fragment key={item.id}>{element}</React.Fragment>);
    }
  }

  // Add title
  if (titleItems.length > 0) {
    const element = buildItem(titleItems[0], theme);
    if (element) {
      if (children.length > 0) {
        children.push(<div key="title-gap" style={{ height: 2 }} />);
      }
      children.push(<React.Fragment key="title">{element}</React.Fragment>);
    }
  }

  // Add badges
  if (badgeItems.length > 0) {
    const badgeElements = badgeItems.map((item) => {
      const element = buildItem(item, theme);
      return element ? (
        <React.Fragment key={item.id}>{element}</React.Fragment>
      ) : null;
    }).filter(Boolean);

    if (badgeElements.length > 0) {
      if (children.length > 0) {
        children.push(<div key="badge-gap" style={{ height: 6 }} />);
      }
      children.push(
        <div
          key="badges"
          className="flex flex-wrap gap-2"
          style={{
            gap: spacing,
            rowGap: 6,
          }}
        >
          {badgeElements}
        </div>
      );
    }
  }

  // Add other items
  const otherRow = buildFlatRow(otherItems, spacing, theme);
  if (otherRow) {
    if (children.length > 0) {
      children.push(<div key="other-gap" style={{ height: 6 }} />);
    }
    children.push(<React.Fragment key="other">{otherRow}</React.Fragment>);
  }

  if (children.length === 0) return null;

  return (
    <div className="flex flex-col items-start min-w-0">
      {children}
    </div>
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
    <div className="flex items-center min-w-0">
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

    case 'progress_slider':
      return <SliderItem key={item.id} item={item} />;

    case 'time_current':
    case 'time_duration':
    case 'time_remaining':
      return <TimeLabels key={item.id} item={item} />;

    case 'title':
    case 'episode_badge':
    case 'series_badge':
    case 'quality_badge':
    case 'text':
      return <TextItem key={item.id} item={item} />;

    case 'label_stack':
    case 'watching_label':
      return <LabelStack key={item.id} item={item} />;

    default:
      // Buttons
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
 * Zone shell with padding and safe areas
 */
function ZoneShell({
  content,
  vibes,
  visible,
  zoneIndex,
}: {
  content: React.ReactNode;
  vibes: any;
  visible: boolean;
  zoneIndex: number;
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
          ? 'translateY(0)'
          : `translateY(${vibes.hiddenOffset.dy * 100}%)`,
        transitionDuration: `${vibes.slideDurationMs}ms`,
        transitionTimingFunction: getCurveCss(vibes.slideCurve),
      }}
    >
      <div
        style={{
          paddingTop: zoneIndex === 0 ? 'env(safe-area-inset-top, 8px)' : vibes.padding.top,
          paddingBottom: zoneIndex === 2 ? 'env(safe-area-inset-bottom, 8px)' : vibes.padding.bottom,
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

function isSlotCompletelyEmpty(slot: any): boolean {
  if (!slot) return true;
  return (
    (!slot.left || slot.left.length === 0) &&
    (!slot.center || slot.center.length === 0) &&
    (!slot.right || slot.right.length === 0)
  );
}

function formatPadding(padding: any): string {
  if (!padding) return '0px';
  return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
}
