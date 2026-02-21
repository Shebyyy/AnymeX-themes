/**
 * Color Resolver
 * Handles hex colors, palette references (@primary), and dynamic colors
 */

// ============================================================================
// Color Types
// ============================================================================

export type RgbColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

// ============================================================================
// Regular Expressions
// ============================================================================

const DYN_COLOR_REGEX = /^dynamic\(([^,\)]+)(?:,\s*([0-9]*\.?[0-9]+))?\)$/;
const HEX_COLOR_REGEX = /^hex\((#[0-9a-fA-F]+)\)$/;
const ALPHA_HEX_REGEX = /^#([0-9a-fA-F]{8})$/i;
const SHORT_HEX_REGEX = /^#([0-9a-fA-F]{3,4})$/i;
const FULL_HEX_REGEX = /^#([0-9a-fA-F]{6})$/i;

// ============================================================================
// Main Color Resolver
// ============================================================================

export function resolveColor(
  raw: string | undefined,
  palette: Record<string, string>,
  fallback: string = '#ffffff'
): string {
  if (raw == null || raw.trim() === '') return fallback;

  let token = raw.trim();

  // Handle palette references (@primary)
  if (token.startsWith('@')) {
    const key = token.substring(1);
    const palValue = palette[key];
    if (palValue && palValue !== token) {
      token = palValue;
    }
  }

  // Handle dynamic colors (dynamic(colorSchemeKey, alpha))
  const dynMatch = DYN_COLOR_REGEX.exec(token);
  if (dynMatch) {
    const key = dynMatch[1]?.trim() || '';
    const alphaStr = dynMatch[2];
    const alpha = alphaStr ? parseFloat(alphaStr) : undefined;
    const dynColor = getDynamicColor(key);
    if (dynColor) {
      if (alpha !== undefined && !isNaN(alpha)) {
        return applyAlpha(dynColor, Math.max(0, Math.min(1, alpha)));
      }
      return dynColor;
    }
  }

  // Handle hex(hexCode) format
  const hexMatch = HEX_COLOR_REGEX.exec(token);
  if (hexMatch) {
    const hex = hexMatch[1];
    const color = parseHexColor(hex);
    if (color) return color;
  }

  // Handle direct hex colors
  if (token.startsWith('#')) {
    const color = parseHexColor(token);
    if (color) return color;
  }

  // Handle named colors
  const namedColor = getNamedColor(token);
  if (namedColor) return namedColor;

  return fallback;
}

// ============================================================================
// Dynamic Colors (CSS Variables)
// ============================================================================

export function getDynamicColor(key: string): string | null {
  // Map Flutter colorScheme keys to CSS variables or return null
  // For now, we'll return null as we don't have direct access to CSS variables
  // In the renderer, these will be handled via CSS custom properties
  return null;
}

// ============================================================================
// Named Colors
// ============================================================================

export function getNamedColor(name: string): string | null {
  switch (name.toLowerCase()) {
    case 'white':
      return '#ffffff';
    case 'black':
      return '#000000';
    case 'transparent':
      return 'transparent';
    case 'red':
      return '#ef4444';
    case 'green':
      return '#22c55e';
    case 'blue':
      return '#3b82f6';
    case 'yellow':
      return '#eab308';
    case 'orange':
      return '#f97316';
    case 'purple':
      return '#a855f7';
    case 'pink':
      return '#ec4899';
    default:
      return null;
  }
}

// ============================================================================
// Hex Color Parser
// ============================================================================

export function parseHexColor(input: string): string | null {
  if (!input) return null;

  let hex = input.trim().replace('#', '');
  if (hex.length === 0) return null;

  // Expand short hex (#RGB → #RRGGBB)
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  // Expand short hex with alpha (#RGBA → #RRGGBBAA)
  else if (hex.length === 4) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }

  // Pad to at least 6 digits
  if (hex.length < 6) {
    hex = hex.padStart(6, '0');
  }

  // Add full alpha if missing
  if (hex.length === 6) {
    hex = 'ff' + hex;
  }

  // Take last 8 digits if too long
  if (hex.length > 8) {
    hex = hex.substring(hex.length - 8);
  }

  if (hex.length !== 8) return null;

  const intVal = parseInt(hex, 16);
  if (isNaN(intVal)) return null;

  return `#${hex}`;
}

// ============================================================================
// Alpha Utilities
// ============================================================================

export function applyAlpha(color: string, alpha: number): string {
  if (color === 'transparent') return 'transparent';

  // Parse hex color
  const rgb = parseToRgb(color);
  if (!rgb) return color;

  // Apply alpha
  rgb.a = Math.max(0, Math.min(1, alpha));

  return rgbToHex(rgb);
}

export function parseToRgb(color: string): RgbColor | null {
  // Remove #
  const hex = color.replace('#', '');

  if (hex.length === 6) {
    // RGB format - assume full opacity
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      a: 1,
    };
  } else if (hex.length === 8) {
    // RGBA format
    return {
      r: parseInt(hex.substring(2, 4), 16),
      g: parseInt(hex.substring(4, 6), 16),
      b: parseInt(hex.substring(6, 8), 16),
      a: parseInt(hex.substring(0, 2), 16) / 255,
    };
  }

  return null;
}

export function rgbToHex(rgb: RgbColor): string {
  const r = Math.round(rgb.r).toString(16).padStart(2, '0');
  const g = Math.round(rgb.g).toString(16).padStart(2, '0');
  const b = Math.round(rgb.b).toString(16).padStart(2, '0');
  const a = Math.round(rgb.a * 255).toString(16).padStart(2, '0');

  return `#${a}${r}${g}${b}`;
}

// ============================================================================
// Height to Quality Label
// ============================================================================

export function heightToQuality(height: number | null): string {
  if (height == null) return '';
  if (height >= 2160) return '2160p';
  if (height >= 1440) return '1440p';
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  if (height >= 360) return '360p';
  return '';
}

// ============================================================================
// Utility: Convert ARGB hex to RGBA for CSS
// ============================================================================

export function argbToRgba(argb: string): string {
  const rgb = parseToRgb(argb);
  if (!rgb) return argb;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a.toFixed(3)})`;
}
