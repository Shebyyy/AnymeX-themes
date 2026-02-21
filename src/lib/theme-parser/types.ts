/**
 * Theme Parser Type Definitions
 * Ported from Dart theme parser to TypeScript
 */

// ============================================================================
// Core Theme Types
// ============================================================================

export interface ThemeDef {
  id: string;
  name: string;
  palette: Record<string, string>;
  styles: StylesDef;
  top: TopZone;
  middle: MiddleZone;
  bottom: BottomZone;
}

export interface StylesDef {
  panel: PanelStyleDef;
  button: ButtonStyleDef;
  primaryButton: ButtonStyleDef;
  chip: ChipStyleDef;
  text: TextStyleDef;
}

// ============================================================================
// Style Definitions
// ============================================================================

export interface PanelStyleDef {
  enabled: boolean;
  showBackground: boolean;
  showBorder: boolean;
  radius: number;
  blur: number;
  color?: string;
  borderColor?: string;
  borderWidth: number;
  padding: EdgeInsets;
  shadowColor?: string;
  shadowBlur: number;
  shadowOffsetY: number;
}

export interface ButtonStyleDef {
  size: number;
  iconSize: number;
  radius: number;
  blur: number;
  color?: string;
  borderColor?: string;
  borderWidth: number;
  iconColor?: string;
  disabledIconColor?: string;
}

export interface ChipStyleDef {
  radius: number;
  color?: string;
  borderColor?: string;
  borderWidth: number;
  textColor?: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  padding: EdgeInsets;
}

export interface TextStyleDef {
  color?: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  height: number;
}

// ============================================================================
// Zone Types
// ============================================================================

export interface ZoneVibes {
  alignment: Alignment;
  padding: EdgeInsets;
  hiddenOffset: Offset;
  slideDurationMs: number;
  opacityDurationMs: number;
  slideCurve: string;
  opacityCurve: string;
  hiddenScale: number;
  scaleDurationMs: number;
  scaleCurve: string;
  showWhenLocked: boolean;
  showWhenUnlocked: boolean;
  useNormalWhenLocked: boolean;
  ignorePointerWhenHidden: boolean;
  itemSpacing: number;
  groupSpacing: number;
  topRowBottomSpacing: number;
  progressBottomSpacing: number;
  visibleWhen?: string;
  panelOverride: Record<string, any>;
  absoluteCenter: boolean;
}

export interface ThreeColumnSlot {
  left: ThemeItem[];
  center: ThemeItem[];
  right: ThemeItem[];
}

export interface BottomSlotDef {
  outside: ThreeColumnSlot;
  topRow: ThreeColumnSlot;
  left: ThemeItem[];
  center: ThemeItem[];
  right: ThemeItem[];
}

export interface TopZone {
  normal: ThreeColumnSlot;
  locked: ThreeColumnSlot | null;
  vibes: ZoneVibes;
}

export interface MiddleZone {
  normalItems: ThemeItem[];
  lockedItems: ThemeItem[] | null;
  vibes: ZoneVibes;
}

export interface BottomZone {
  normal: BottomSlotDef;
  locked: BottomSlotDef | null;
  showProgress: boolean;
  progressStyle: SliderStyle;
  progressPadding: EdgeInsets;
  outsidePadding: EdgeInsets;
  vibes: ZoneVibes;
}

// ============================================================================
// Theme Items
// ============================================================================

export interface ThemeItem {
  id: string;
  data: Record<string, any>;
  visibleWhen?: string;
  enabledWhen?: string;
  style: Record<string, any>;

  // Helper getters
  grabString(key: string): string | undefined;
  grabInt(key: string, fallback: number): number;
  grabDouble(key: string, fallback: number): number;
  grabBool(key: string, fallback: boolean): boolean;
}

// ============================================================================
// Supporting Types
// ============================================================================

export type Alignment =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'centerLeft'
  | 'center'
  | 'centerRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

export type TextAlign = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';

export type SliderStyle = 'ios' | 'capsule';

export type Curve =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeOutCubic'
  | 'easeOutBack';

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface EdgeInsets {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Offset {
  dx: number;
  dy: number;
}

// ============================================================================
// Controller State (Mock)
// ============================================================================

export interface PlayerControllerState {
  isLocked: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  showControls: boolean;
  isOffline: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  canGoForward: boolean;
  canGoBackward: boolean;
  videoHeight: number | null;
  currentPosition: string;
  episodeDuration: string;
  currentEpisode: {
    title: string | null;
    number: string;
  };
  anilistData: {
    title: string;
  };
  itemName: string | null;
  playerSettings: {
    seekDuration: number;
    skipDuration: number;
  };
}

// ============================================================================
// Parser Result
// ============================================================================

export interface JsonThemeParseResult {
  themes: ThemeDef[];
  rawThemes: Record<string, any>[];
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

// ============================================================================
// Icon Map (Lucide Icons)
// ============================================================================

import {
  ArrowLeft,
  Lock,
  LockOpen,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  List,
  SlidersHorizontal,
  Subtitles,
  Cloud,
  FileAudio,
  RotateCw,
  Maximize2,
  Monitor,
  Square,
  FastForward,
  MoreHorizontal,
} from 'lucide-react';

export const ICON_MAP: Record<string, React.ElementType> = {
  // Navigation
  back: ArrowLeft,
  arrow_back_rounded: ArrowLeft,

  // Lock controls
  lock_controls: Lock,
  unlock_controls: LockOpen,

  // Fullscreen
  toggle_fullscreen: Maximize,
  fullscreen_exit_rounded: Minimize,

  // Settings
  open_settings: Settings,
  more_vert_rounded: MoreHorizontal,

  // Episode navigation
  previous_episode: SkipBack,
  next_episode: SkipForward,

  // Seek controls
  seek_back: SkipBack,
  seek_forward: SkipForward,
  replay_10_rounded: SkipBack,
  forward_10_rounded: SkipForward,
  replay_30_rounded: SkipBack,
  forward_30_rounded: SkipForward,

  // Play/Pause
  play_pause: Play,
  pause_rounded: Pause,
  play_arrow_rounded: Play,

  // Features
  playlist: List,
  shaders: SlidersHorizontal,
  subtitles: Subtitles,
  server: Cloud,
  quality: Maximize2,
  speed: FastForward,
  audio_track: FileAudio,
  orientation: RotateCw,
  aspect_ratio: Monitor,

  // Mega seek
  mega_seek: FastForward,
};

// ============================================================================
// Supported Theme Item IDs
// ============================================================================

export const SUPPORTED_THEME_ITEM_IDS = new Set<string>([
  ...Object.keys(ICON_MAP),
  'gap',
  'spacer',
  'flex_spacer',
  'progress_slider',
  'time_current',
  'time_duration',
  'time_remaining',
  'title',
  'episode_badge',
  'series_badge',
  'quality_badge',
  'label_stack',
  'watching_label',
  'text',
]);

// ============================================================================
// Badge IDs
// ============================================================================

export const BADGE_IDS = new Set<string>([
  'episode_badge',
  'series_badge',
  'quality_badge',
]);
