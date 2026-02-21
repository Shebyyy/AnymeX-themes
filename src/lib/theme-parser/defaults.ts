/**
 * Default Values
 * Default configurations for styles, zones, and items
 */

import type {
  PanelStyleDef,
  ButtonStyleDef,
  ChipStyleDef,
  TextStyleDef,
  ZoneVibes,
  ThreeColumnSlot,
  BottomSlotDef,
  ThemeItem,
} from './types';
import { ThemeItemClass } from './theme-item';
import { readEdgeInsets } from './utils';

// ============================================================================
// Default Style Definitions
// ============================================================================

export const DEFAULT_PANEL_STYLE: PanelStyleDef = {
  enabled: true,
  showBackground: true,
  showBorder: true,
  radius: 22,
  blur: 18,
  color: undefined,
  borderColor: undefined,
  borderWidth: 0.8,
  padding: { left: 12, top: 10, right: 12, bottom: 10 },
  shadowColor: undefined,
  shadowBlur: 18,
  shadowOffsetY: 8,
};

export const DEFAULT_BUTTON_STYLE: ButtonStyleDef = {
  size: 40,
  iconSize: 20,
  radius: 16,
  blur: 14,
  color: undefined,
  borderColor: undefined,
  borderWidth: 0.8,
  iconColor: undefined,
  disabledIconColor: undefined,
};

export const DEFAULT_PRIMARY_BUTTON_STYLE: ButtonStyleDef = {
  size: 56,
  iconSize: 28,
  radius: 18,
  blur: 14,
  color: undefined,
  borderColor: undefined,
  borderWidth: 0.8,
  iconColor: undefined,
  disabledIconColor: undefined,
};

export const DEFAULT_CHIP_STYLE: ChipStyleDef = {
  radius: 14,
  color: undefined,
  borderColor: undefined,
  borderWidth: 0.6,
  textColor: undefined,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.2,
  padding: { left: 10, top: 6, right: 10, bottom: 6 },
};

export const DEFAULT_TEXT_STYLE: TextStyleDef = {
  color: undefined,
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 0.2,
  height: 1.2,
};

// ============================================================================
// Default Zone Vibes
// ============================================================================

export const DEFAULT_TOP_ZONE_VIBES: ZoneVibes = {
  alignment: 'topCenter',
  padding: { left: 14, top: 8, right: 14, bottom: 8 },
  hiddenOffset: { dx: 0, dy: -1 },
  slideDurationMs: 320,
  opacityDurationMs: 260,
  slideCurve: 'easeOutCubic',
  opacityCurve: 'easeOut',
  hiddenScale: 1.0,
  scaleDurationMs: 300,
  scaleCurve: 'easeOutBack',
  showWhenLocked: true,
  showWhenUnlocked: true,
  useNormalWhenLocked: false,
  ignorePointerWhenHidden: true,
  itemSpacing: 8,
  groupSpacing: 10,
  topRowBottomSpacing: 8,
  progressBottomSpacing: 10,
  visibleWhen: undefined,
  panelOverride: {},
  absoluteCenter: false,
};

export const DEFAULT_MIDDLE_ZONE_VIBES: ZoneVibes = {
  alignment: 'center',
  padding: { left: 14, top: 0, right: 14, bottom: 0 },
  hiddenOffset: { dx: 0, dy: 0 },
  slideDurationMs: 320,
  opacityDurationMs: 260,
  slideCurve: 'easeOutCubic',
  opacityCurve: 'easeOut',
  hiddenScale: 0.88,
  scaleDurationMs: 300,
  scaleCurve: 'easeOutBack',
  showWhenLocked: false,
  showWhenUnlocked: true,
  useNormalWhenLocked: false,
  ignorePointerWhenHidden: true,
  itemSpacing: 8,
  groupSpacing: 10,
  topRowBottomSpacing: 8,
  progressBottomSpacing: 10,
  visibleWhen: undefined,
  panelOverride: {},
  absoluteCenter: false,
};

export const DEFAULT_BOTTOM_ZONE_VIBES: ZoneVibes = {
  alignment: 'bottomCenter',
  padding: { left: 14, top: 8, right: 14, bottom: 8 },
  hiddenOffset: { dx: 0, dy: 1 },
  slideDurationMs: 320,
  opacityDurationMs: 260,
  slideCurve: 'easeOutCubic',
  opacityCurve: 'easeOut',
  hiddenScale: 1.0,
  scaleDurationMs: 300,
  scaleCurve: 'easeOutBack',
  showWhenLocked: true,
  showWhenUnlocked: true,
  useNormalWhenLocked: false,
  ignorePointerWhenHidden: true,
  itemSpacing: 8,
  groupSpacing: 10,
  topRowBottomSpacing: 8,
  progressBottomSpacing: 10,
  visibleWhen: undefined,
  panelOverride: {},
  absoluteCenter: false,
};

// ============================================================================
// Default Zone Layouts
// ============================================================================

export function createDefaultTopNormal(): ThreeColumnSlot {
  return {
    left: [ThemeItemClass.create('back')],
    center: [
      ThemeItemClass.create('title'),
      ThemeItemClass.create('episode_badge'),
      ThemeItemClass.create('series_badge'),
      ThemeItemClass.create('quality_badge'),
    ],
    right: [
      ThemeItemClass.create('lock_controls'),
      ThemeItemClass.create('toggle_fullscreen'),
      ThemeItemClass.create('open_settings'),
    ],
  };
}

export function createDefaultTopLocked(): ThreeColumnSlot {
  return {
    left: [],
    center: [],
    right: [ThemeItemClass.create('unlock_controls')],
  };
}

export function createDefaultMiddleItems(): ThemeItem[] {
  return [
    ThemeItemClass.create('previous_episode'),
    ThemeItemClass.create('seek_back'),
    ThemeItemClass.create('play_pause'),
    ThemeItemClass.create('seek_forward'),
    ThemeItemClass.create('next_episode'),
  ];
}

export function createDefaultBottomNormal(): BottomSlotDef {
  return {
    outside: { left: [], center: [], right: [] },
    topRow: {
      left: [],
      center: [],
      right: [ThemeItemClass.create('mega_seek')],
    },
    left: [
      ThemeItemClass.create('time_current'),
      ThemeItemClass.create('playlist'),
      ThemeItemClass.create('shaders'),
      ThemeItemClass.create('subtitles'),
    ],
    center: [],
    right: [
      ThemeItemClass.create('server'),
      ThemeItemClass.create('quality'),
      ThemeItemClass.create('speed'),
      ThemeItemClass.create('audio_track'),
      ThemeItemClass.create('orientation'),
      ThemeItemClass.create('aspect_ratio'),
      ThemeItemClass.create('time_duration'),
    ],
  };
}

export function createDefaultBottomLocked(): BottomSlotDef {
  return {
    outside: { left: [], center: [], right: [] },
    topRow: { left: [], center: [], right: [] },
    left: [ThemeItemClass.create('time_current')],
    center: [],
    right: [ThemeItemClass.create('time_duration')],
  };
}

// ============================================================================
// Style Mash (Merge Override into Base)
// ============================================================================

export function mashPanelStyle(
  base: PanelStyleDef,
  override: Record<string, any>
): PanelStyleDef {
  if (Object.keys(override).length === 0) return base;

  return {
    enabled: override['enabled'] ?? base.enabled,
    showBackground: override['showBackground'] ?? base.showBackground,
    showBorder: override['showBorder'] ?? base.showBorder,
    radius: override['radius'] ?? base.radius,
    blur: override['blur'] ?? base.blur,
    color: override['color'] ?? base.color,
    borderColor: override['borderColor'] ?? base.borderColor,
    borderWidth: override['borderWidth'] ?? base.borderWidth,
    padding: override['padding']
      ? readEdgeInsets(override['padding'], base.padding)
      : base.padding,
    shadowColor: override['shadowColor'] ?? base.shadowColor,
    shadowBlur: override['shadowBlur'] ?? base.shadowBlur,
    shadowOffsetY: override['shadowOffsetY'] ?? base.shadowOffsetY,
  };
}

export function mashButtonStyle(
  base: ButtonStyleDef,
  override: Record<string, any>
): ButtonStyleDef {
  if (Object.keys(override).length === 0) return base;

  return {
    size: override['size'] ?? base.size,
    iconSize: override['iconSize'] ?? base.iconSize,
    radius: override['radius'] ?? base.radius,
    blur: override['blur'] ?? base.blur,
    color: override['color'] ?? base.color,
    borderColor: override['borderColor'] ?? base.borderColor,
    borderWidth: override['borderWidth'] ?? base.borderWidth,
    iconColor: override['iconColor'] ?? base.iconColor,
    disabledIconColor: override['disabledIconColor'] ?? base.disabledIconColor,
  };
}

export function mashChipStyle(
  base: ChipStyleDef,
  override: Record<string, any>
): ChipStyleDef {
  if (Object.keys(override).length === 0) return base;

  return {
    radius: override['radius'] ?? base.radius,
    color: override['color'] ?? base.color,
    borderColor: override['borderColor'] ?? base.borderColor,
    borderWidth: override['borderWidth'] ?? base.borderWidth,
    textColor: override['textColor'] ?? base.textColor,
    fontSize: override['fontSize'] ?? base.fontSize,
    fontWeight: override['fontWeight'] ?? base.fontWeight,
    letterSpacing: override['letterSpacing'] ?? base.letterSpacing,
    padding: override['padding']
      ? readEdgeInsets(override['padding'], base.padding)
      : base.padding,
  };
}

export function mashTextStyle(
  base: TextStyleDef,
  override: Record<string, any>
): TextStyleDef {
  if (Object.keys(override).length === 0) return base;

  return {
    color: override['color'] ?? base.color,
    fontSize: override['fontSize'] ?? base.fontSize,
    fontWeight: override['fontWeight'] ?? base.fontWeight,
    letterSpacing: override['letterSpacing'] ?? base.letterSpacing,
    height: override['height'] ?? base.height,
  };
}
