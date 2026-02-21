/**
 * Theme Parser Utilities
 * Helper functions for parsing JSON values
 */

import type {
  EdgeInsets,
  Offset,
  Alignment,
  TextAlign,
  SliderStyle,
  FontWeight,
  Curve,
} from './types';

// ============================================================================
// Value Readers
// ============================================================================

export function readString(raw: any): string | undefined {
  if (raw == null) return undefined;
  const v = String(raw).trim();
  return v === '' ? undefined : v;
}

export function readInt(raw: any, fallback: number): number {
  if (typeof raw === 'number') {
    return Math.round(raw);
  }
  if (typeof raw === 'string') {
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

export function readDouble(raw: any, fallback: number): number {
  if (typeof raw === 'number') {
    return raw;
  }
  if (typeof raw === 'string') {
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

export function readBool(raw: any, fallback: boolean): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw !== 0;
  if (typeof raw === 'string') {
    const n = raw.trim().toLowerCase();
    if (n === 'true') return true;
    if (n === 'false') return false;
  }
  return fallback;
}

export function asMap(raw: any): Record<string, any> {
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    return raw as Record<string, any>;
  }
  return {};
}

// ============================================================================
// EdgeInsets Parser
// ============================================================================

export function readEdgeInsets(raw: any, fallback: EdgeInsets): EdgeInsets {
  if (typeof raw === 'number') {
    const value = raw as number;
    return { left: value, top: value, right: value, bottom: value };
  }
  const map = asMap(raw);
  if (Object.keys(map).length === 0) return fallback;

  const all = map['all'];
  if (typeof all === 'number') {
    return { left: all, top: all, right: all, bottom: all };
  }

  const h = readDouble(map['horizontal'], 0);
  const v = readDouble(map['vertical'], 0);

  return {
    left: readDouble(map['left'], h),
    top: readDouble(map['top'], v),
    right: readDouble(map['right'], h),
    bottom: readDouble(map['bottom'], v),
  };
}

// ============================================================================
// Offset Parser
// ============================================================================

export function readOffset(raw: any, fallback: Offset): Offset {
  if (Array.isArray(raw) && raw.length >= 2) {
    return {
      dx: readDouble(raw[0], fallback.dx),
      dy: readDouble(raw[1], fallback.dy),
    };
  }
  const map = asMap(raw);
  if (Object.keys(map).length === 0) return fallback;

  return {
    dx: readDouble(map['x'], fallback.dx),
    dy: readDouble(map['y'], fallback.dy),
  };
}

// ============================================================================
// Alignment Parser
// ============================================================================

export function parseAlignment(raw: string | undefined, fallback: Alignment): Alignment {
  switch (raw) {
    case 'topLeft':
      return 'topLeft';
    case 'topCenter':
      return 'topCenter';
    case 'topRight':
      return 'topRight';
    case 'centerLeft':
      return 'centerLeft';
    case 'center':
      return 'center';
    case 'centerRight':
      return 'centerRight';
    case 'bottomLeft':
      return 'bottomLeft';
    case 'bottomCenter':
      return 'bottomCenter';
    case 'bottomRight':
      return 'bottomRight';
    default:
      return fallback;
  }
}

// ============================================================================
// TextAlign Parser
// ============================================================================

export function parseTextAlign(raw: string | undefined): TextAlign {
  switch (raw?.toLowerCase()) {
    case 'center':
      return 'center';
    case 'right':
    case 'end':
      return 'right';
    case 'justify':
      return 'justify';
    case 'left':
    case 'start':
    default:
      return 'left';
  }
}

export function textAlignToString(align: TextAlign): string {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'right';
    case 'justify':
      return 'justify';
    default:
      return 'left';
  }
}

export function textAlignToCrossAxis(align: TextAlign): string {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    default:
      return 'flex-start';
  }
}

export function textAlignToAlignment(align: TextAlign): string {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    default:
      return 'flex-start';
  }
}

// ============================================================================
// FontWeight Parser
// ============================================================================

export function parseFontWeight(raw: any, fallback: FontWeight): FontWeight {
  if (typeof raw === 'number') {
    const n = Math.round(raw);
    if (n >= 100 && n <= 900 && n % 100 === 0) {
      return n as FontWeight;
    }
    return fallback;
  }

  const s = readString(raw)?.toLowerCase();
  switch (s) {
    case 'w100':
    case 'thin':
      return 100;
    case 'w200':
    case 'extralight':
      return 200;
    case 'w300':
    case 'light':
      return 300;
    case 'w400':
    case 'normal':
    case 'regular':
      return 400;
    case 'w500':
    case 'medium':
      return 500;
    case 'w600':
    case 'semibold':
      return 600;
    case 'w700':
    case 'bold':
      return 700;
    case 'w800':
    case 'extrabold':
      return 800;
    case 'w900':
    case 'black':
      return 900;
    default:
      return fallback;
  }
}

// ============================================================================
// Curve Parser
// ============================================================================

export function parseCurve(raw: any, fallback: Curve): Curve {
  const str = typeof raw === 'string' ? raw : undefined;
  switch (str) {
    case 'linear':
      return 'linear';
    case 'easeIn':
      return 'easeIn';
    case 'easeOut':
      return 'easeOut';
    case 'easeInOut':
      return 'easeInOut';
    case 'easeOutCubic':
      return 'easeOutCubic';
    case 'easeOutBack':
      return 'easeOutBack';
    default:
      return fallback;
  }
}

export function curveToCss(curve: Curve): string {
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

// ============================================================================
// SliderStyle Parser
// ============================================================================

export function toSliderStyle(raw: string | undefined, fallback: SliderStyle): SliderStyle {
  switch (raw) {
    case 'ios':
      return 'ios';
    case 'capsule':
      return 'capsule';
    default:
      return fallback;
  }
}

// ============================================================================
// Duration to CSS
// ============================================================================

export function durationMsToCss(ms: number): string {
  return `${ms}ms`;
}
