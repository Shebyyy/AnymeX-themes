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
// Icon Map
// ============================================================================

export const ICON_MAP: Record<string, string> = {
  // Navigation
  back: 'solar:alt-arrow-left-linear',
  arrow_back_rounded: 'solar:alt-arrow-left-linear',

  // Lock controls
  lock_controls: 'solar:lock-linear',
  unlock_controls: 'solar:lock-open-linear',

  // Fullscreen
  toggle_fullscreen: 'solar:full-screen-linear',
  fullscreen_exit_rounded: 'solar:full-screen-exit-linear',

  // Settings
  open_settings: 'solar:settings-linear',
  more_vert_rounded: 'solar:menu-dots-linear',

  // Episode navigation
  previous_episode: 'solar:skip-previous-linear',
  next_episode: 'solar:skip-next-linear',

  // Seek controls
  seek_back: 'solar:skip-previous-linear',
  seek_forward: 'solar:skip-next-linear',
  replay_10_rounded: 'solar:skip-previous-linear',
  forward_10_rounded: 'solar:skip-next-linear',
  replay_30_rounded: 'solar:skip-previous-linear',
  forward_30_rounded: 'solar:skip-next-linear',

  // Play/Pause
  play_pause: 'solar:play-linear',
  pause_rounded: 'solar:pause-linear',
  play_arrow_rounded: 'solar:play-linear',

  // Features
  playlist: 'solar:playlist-linear',
  shaders: 'solar:sliders-horizontal-linear',
  subtitles: 'solar:subtitle-linear',
  server: 'solar:cloud-linear',
  quality: 'solar:high-quality-linear',
  speed: 'solar:speedometer-linear',
  audio_track: 'solar:music-note-2-linear',
  orientation: 'solar:screen-rotate-linear',
  aspect_ratio: 'solar:fit-screen-linear',

  // Mega seek
  mega_seek: 'solar:fast-forward-linear',
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
