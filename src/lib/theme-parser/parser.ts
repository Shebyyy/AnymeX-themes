/**
 * Main Theme Parser
 * Parses JSON theme definitions into ThemeDef objects
 */

import type {
  ThemeDef,
  StylesDef,
  PanelStyleDef,
  ButtonStyleDef,
  ChipStyleDef,
  TextStyleDef,
  ZoneVibes,
  ThreeColumnSlot,
  BottomSlotDef,
  TopZone,
  MiddleZone,
  BottomZone,
  JsonThemeParseResult,
  Curve,
} from './types';
import { ThemeItem } from './theme-item';
import {
  readString,
  readInt,
  readDouble,
  readBool,
  asMap,
  readEdgeInsets,
  readOffset,
  parseAlignment,
  parseCurve,
  toSliderStyle,
} from './utils';
import {
  DEFAULT_PANEL_STYLE,
  DEFAULT_BUTTON_STYLE,
  DEFAULT_PRIMARY_BUTTON_STYLE,
  DEFAULT_CHIP_STYLE,
  DEFAULT_TEXT_STYLE,
  DEFAULT_TOP_ZONE_VIBES,
  DEFAULT_MIDDLE_ZONE_VIBES,
  DEFAULT_BOTTOM_ZONE_VIBES,
  createDefaultTopNormal,
  createDefaultTopLocked,
  createDefaultMiddleItems,
  createDefaultBottomNormal,
  createDefaultBottomLocked,
} from './defaults';

// ============================================================================
// Parser Functions
// ============================================================================

/**
 * Parse a JSON theme collection
 */
export function parseCollection(rawJson: string): JsonThemeParseResult {
  const input = rawJson.trim();
  if (input === '') {
    return {
      themes: [],
      rawThemes: [],
      errors: ['JSON payload is empty.'],
      warnings: [],
      isValid: false,
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const themes: ThemeDef[] = [];
  const rawThemes: Record<string, any>[] = [];

  let decoded: any;
  try {
    decoded = JSON.parse(input);
  } catch (error) {
    return {
      themes: [],
      rawThemes: [],
      errors: [`Invalid JSON syntax: ${error}`],
      warnings: [],
      isValid: false,
    };
  }

  const themeMaps = decodeRawThemeMaps(decoded, errors);

  for (let i = 0; i < themeMaps.length; i++) {
    const rawTheme = themeMaps[i];
    try {
      const themeDef = ThemeDefImpl.fromJson(rawTheme);
      themes.push(themeDef);
      rawThemes.push(rawTheme);

      // Collect warnings for unsupported items
      const itemWarnings = collectUnsupportedThemeItemWarnings(rawTheme, themeDef.id);
      warnings.push(...itemWarnings);
    } catch (error) {
      errors.push(`Theme #${i + 1} is invalid: ${error}`);
    }
  }

  // Check for duplicate IDs
  const seenIds = new Set<string>();
  for (const theme of themes) {
    if (!seenIds.add(theme.id)) {
      warnings.push(
        `Duplicate theme id "${theme.id}" in the same import payload. Last value will be used.`
      );
    }
  }

  if (themes.length === 0 && errors.length === 0) {
    errors.push('No themes found in payload.');
  }

  return {
    themes,
    rawThemes,
    errors,
    warnings,
    isValid: errors.length === 0 && themes.length > 0,
  };
}

/**
 * Validate if a JSON string is a valid theme collection
 */
export function isValidCollectionJson(rawJson: string): boolean {
  return parseCollection(rawJson).isValid;
}

// ============================================================================
// ThemeDef Parser
// ============================================================================

class ThemeDefImpl implements ThemeDef {
  id: string;
  name: string;
  palette: Record<string, string>;
  styles: StylesDef;
  top: TopZone;
  middle: MiddleZone;
  bottom: BottomZone;

  constructor(data: any) {
    this.id = readString(data['id'])!;
    this.name = readString(data['name']) ?? this.id;
    this.palette = this.parsePalette(data['palette']);
    this.styles = this.parseStyles(data['styles']);
    this.top = this.parseTopZone(data['top']);
    this.middle = this.parseMiddleZone(data['middle'] ?? data['center']);
    this.bottom = this.parseBottomZone(data['bottom']);
  }

  private parsePalette(raw: any): Record<string, string> {
    const palette: Record<string, string> = {};

    if (typeof raw === 'object' && raw !== null) {
      const map = raw as Record<string, any>;
      for (const [key, value] of Object.entries(map)) {
        if (key === 'note_by_dev') continue;
        const str = readString(value);
        if (str) {
          palette[key] = str;
        }
      }
    }

    return palette;
  }

  private parseStyles(raw: any): StylesDef {
    const map = asMap(raw);
    return {
      panel: this.parsePanelStyle(map['panel']),
      button: this.parseButtonStyle(map['button']),
      primaryButton: this.parseButtonStyle(map['primaryButton']),
      chip: this.parseChipStyle(map['chip']),
      text: this.parseTextStyle(map['text']),
    };
  }

  private parsePanelStyle(raw: any): PanelStyleDef {
    const map = asMap(raw);
    return {
      enabled: readBool(map['enabled'], DEFAULT_PANEL_STYLE.enabled),
      showBackground: readBool(map['showBackground'], DEFAULT_PANEL_STYLE.showBackground),
      showBorder: readBool(map['showBorder'], DEFAULT_PANEL_STYLE.showBorder),
      radius: readDouble(map['radius'], DEFAULT_PANEL_STYLE.radius),
      blur: readDouble(map['blur'], DEFAULT_PANEL_STYLE.blur),
      color: readString(map['color']),
      borderColor: readString(map['borderColor']),
      borderWidth: readDouble(map['borderWidth'], DEFAULT_PANEL_STYLE.borderWidth),
      padding: readEdgeInsets(map['padding'], DEFAULT_PANEL_STYLE.padding),
      shadowColor: readString(map['shadowColor']),
      shadowBlur: readDouble(map['shadowBlur'], DEFAULT_PANEL_STYLE.shadowBlur),
      shadowOffsetY: readDouble(map['shadowOffsetY'], DEFAULT_PANEL_STYLE.shadowOffsetY),
    };
  }

  private parseButtonStyle(raw: any): ButtonStyleDef {
    const map = asMap(raw);
    return {
      size: readDouble(map['size'], DEFAULT_BUTTON_STYLE.size),
      iconSize: readDouble(map['iconSize'], DEFAULT_BUTTON_STYLE.iconSize),
      radius: readDouble(map['radius'], DEFAULT_BUTTON_STYLE.radius),
      blur: readDouble(map['blur'], DEFAULT_BUTTON_STYLE.blur),
      color: readString(map['color']),
      borderColor: readString(map['borderColor']),
      borderWidth: readDouble(map['borderWidth'], DEFAULT_BUTTON_STYLE.borderWidth),
      iconColor: readString(map['iconColor']),
      disabledIconColor: readString(map['disabledIconColor']),
    };
  }

  private parseChipStyle(raw: any): ChipStyleDef {
    const map = asMap(raw);
    return {
      radius: readDouble(map['radius'], DEFAULT_CHIP_STYLE.radius),
      color: readString(map['color']),
      borderColor: readString(map['borderColor']),
      borderWidth: readDouble(map['borderWidth'], DEFAULT_CHIP_STYLE.borderWidth),
      textColor: readString(map['textColor']),
      fontSize: readDouble(map['fontSize'], DEFAULT_CHIP_STYLE.fontSize),
      fontWeight: readInt(map['fontWeight'], DEFAULT_CHIP_STYLE.fontWeight),
      letterSpacing: readDouble(map['letterSpacing'], DEFAULT_CHIP_STYLE.letterSpacing),
      padding: readEdgeInsets(map['padding'], DEFAULT_CHIP_STYLE.padding),
    };
  }

  private parseTextStyle(raw: any): TextStyleDef {
    const map = asMap(raw);
    return {
      color: readString(map['color']),
      fontSize: readDouble(map['fontSize'], DEFAULT_TEXT_STYLE.fontSize),
      fontWeight: readInt(map['fontWeight'], DEFAULT_TEXT_STYLE.fontWeight),
      letterSpacing: readDouble(map['letterSpacing'], DEFAULT_TEXT_STYLE.letterSpacing),
      height: readDouble(map['height'], DEFAULT_TEXT_STYLE.height),
    };
  }

  private parseZoneVibes(
    raw: any,
    defaults: ZoneVibes
  ): ZoneVibes {
    const map = asMap(raw);
    return {
      alignment: parseAlignment(
        readString(map['alignment']),
        defaults.alignment
      ),
      padding: readEdgeInsets(map['padding'], defaults.padding),
      hiddenOffset: readOffset(map['hiddenOffset'], defaults.hiddenOffset),
      slideDurationMs: readInt(map['slideDurationMs'], defaults.slideDurationMs),
      opacityDurationMs: readInt(map['opacityDurationMs'], defaults.opacityDurationMs),
      slideCurve: parseCurve(readString(map['slideCurve']), defaults.slideCurve),
      opacityCurve: parseCurve(readString(map['opacityCurve']), defaults.opacityCurve),
      hiddenScale: readDouble(map['hiddenScale'], defaults.hiddenScale),
      scaleDurationMs: readInt(map['scaleDurationMs'], defaults.scaleDurationMs),
      scaleCurve: parseCurve(readString(map['scaleCurve']), defaults.scaleCurve),
      showWhenLocked: readBool(map['showWhenLocked'], defaults.showWhenLocked),
      showWhenUnlocked: readBool(map['showWhenUnlocked'], defaults.showWhenUnlocked),
      useNormalWhenLocked: readBool(
        map['useNormalLayoutWhenLocked'],
        defaults.useNormalWhenLocked
      ),
      ignorePointerWhenHidden: readBool(
        map['ignorePointerWhenHidden'],
        defaults.ignorePointerWhenHidden
      ),
      itemSpacing: readDouble(map['itemSpacing'], defaults.itemSpacing),
      groupSpacing: readDouble(map['groupSpacing'], defaults.groupSpacing),
      topRowBottomSpacing: readDouble(map['topRowBottomSpacing'], defaults.topRowBottomSpacing),
      progressBottomSpacing: readDouble(
        map['progressBottomSpacing'],
        defaults.progressBottomSpacing
      ),
      visibleWhen: readString(map['visibleWhen']),
      panelOverride: asMap(map['panelStyle']),
      absoluteCenter: readBool(map['absoluteCenter'], defaults.absoluteCenter),
    };
  }

  private parseThreeColumnSlot(raw: any): ThreeColumnSlot {
    const map = asMap(raw);
    return {
      left: parseItems(map['left']),
      center: parseItems(map['center']),
      right: parseItems(map['right']),
    };
  }

  private parseBottomSlotDef(raw: any): BottomSlotDef {
    const map = asMap(raw);

    // Parse outside slot
    const outsideRaw = map['outside'];
    const outside =
      typeof outsideRaw === 'object' && outsideRaw !== null
        ? this.parseThreeColumnSlot(outsideRaw)
        : { left: [], center: [], right: [] };

    // Parse topRow slot (supports both "top" and legacy "topLeft", "topCenter", "topRight")
    let topRow: ThreeColumnSlot;
    const topRowRaw = map['top'];
    if (typeof topRowRaw === 'object' && topRowRaw !== null) {
      topRow = this.parseThreeColumnSlot(topRowRaw);
    } else {
      topRow = {
        left: parseItems(map['topLeft']),
        center: parseItems(map['topCenter']),
        right: parseItems(map['topRight']),
      };
    }

    return {
      outside,
      topRow,
      left: parseItems(map['left']),
      center: parseItems(map['center']),
      right: parseItems(map['right']),
    };
  }

  private parseTopZone(raw: any): TopZone {
    const map = asMap(raw);
    const vibes = this.parseZoneVibes(map, DEFAULT_TOP_ZONE_VIBES);

    // Determine normal slot source
    const normalSrc = map.hasOwnProperty('normal') ? map['normal'] : map;
    const parsedNormal = this.parseThreeColumnSlot(normalSrc);

    // Parse locked slot
    const lockedSrc = map['locked'];
    const parsedLocked =
      typeof lockedSrc === 'object' && lockedSrc !== null && Object.keys(lockedSrc).length > 0
        ? this.parseThreeColumnSlot(lockedSrc)
        : null;

    // Apply defaults if completely empty
    const normal = isSlotCompletelyEmpty(parsedNormal)
      ? createDefaultTopNormal()
      : parsedNormal;

    const locked =
      parsedLocked === null || isSlotCompletelyEmpty(parsedLocked)
        ? vibes.showWhenLocked
          ? createDefaultTopLocked()
          : null
        : parsedLocked;

    return {
      normal,
      locked,
      vibes,
      slotFor(isLocked: boolean) {
        if (!isLocked) return normal;
        if (locked !== null && !isSlotCompletelyEmpty(locked)) return locked;
        if (vibes.useNormalWhenLocked) return normal;
        return { left: [], center: [], right: [] };
      }
    };
  }

  private parseMiddleZone(raw: any): MiddleZone {
    const map = asMap(raw);
    const vibes = this.parseZoneVibes(map, DEFAULT_MIDDLE_ZONE_VIBES);

    // Determine normal items source
    const normalSrc = map.hasOwnProperty('normal') ? map['normal'] : map;
    const normalItems = parseItems(asMap(normalSrc)['items']);

    // Parse locked items
    const lockedSrc = map['locked'];
    const lockedItems =
      typeof lockedSrc === 'object' && lockedSrc !== null && Object.keys(lockedSrc).length > 0
        ? parseItems(asMap(lockedSrc)['items'])
        : null;

    // Apply defaults if completely empty
    const finalNormalItems = normalItems.length === 0 ? createDefaultMiddleItems() : normalItems;

    return {
      normalItems: finalNormalItems,
      lockedItems: lockedItems,
      vibes,
      itemsFor(isLocked: boolean) {
        if (!isLocked) return finalNormalItems;
        if (lockedItems !== null && lockedItems.length > 0) return lockedItems;
        if (vibes.useNormalWhenLocked) return finalNormalItems;
        return [];
      }
    };
  }

  private parseBottomZone(raw: any): BottomZone {
    const map = asMap(raw);
    const vibes = this.parseZoneVibes(map, DEFAULT_BOTTOM_ZONE_VIBES);

    // Parse normal slot
    const normalSrc = map.hasOwnProperty('normal') ? map['normal'] : map;
    const parsedNormal = this.parseBottomSlotDef(normalSrc);

    // Parse locked slot
    const lockedSrc = map['locked'];
    const parsedLocked =
      typeof lockedSrc === 'object' && lockedSrc !== null && Object.keys(lockedSrc).length > 0
        ? this.parseBottomSlotDef(lockedSrc)
        : null;

    // Apply defaults if completely empty
    const normal = isBottomSlotCompletelyEmpty(parsedNormal)
      ? createDefaultBottomNormal()
      : parsedNormal;

    const locked =
      parsedLocked === null || isBottomSlotCompletelyEmpty(parsedLocked)
        ? vibes.showWhenLocked
          ? createDefaultBottomLocked()
          : null
        : parsedLocked;

    return {
      normal,
      locked,
      showProgress: readBool(map['showProgress'], true),
      progressStyle: toSliderStyle(readString(map['progressStyle']), 'ios'),
      progressPadding: readEdgeInsets(
        map['progressPadding'],
        { left: 4, top: 0, right: 4, bottom: 0 }
      ),
      outsidePadding: readEdgeInsets(
        map['outsidePadding'],
        { left: 14, top: 0, right: 14, bottom: 6 }
      ),
      vibes,
      slotFor(isLocked: boolean) {
        if (!isLocked) return normal;
        if (locked !== null && !isBottomSlotCompletelyEmpty(locked)) return locked;
        if (vibes.useNormalWhenLocked) return normal;
        return {
          outside: { left: [], center: [], right: [] },
          topRow: { left: [], center: [], right: [] },
          left: [],
          center: [],
          right: [],
        };
      }
    };
  }

  // Static method for creating from JSON
  static fromJson(raw: any): ThemeDef {
    return new ThemeDefImpl(raw);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseItems(raw: any): ThemeItem[] {
  if (!Array.isArray(raw)) return [];

  const items: ThemeItem[] = [];
  for (const entry of raw) {
    try {
      items.push(ThemeItem.fromRaw(entry));
    } catch (e) {
      // Skip invalid items
    }
  }
  return items;
}

function isSlotCompletelyEmpty(slot: ThreeColumnSlot): boolean {
  return slot.left.length === 0 && slot.center.length === 0 && slot.right.length === 0;
}

function isBottomSlotCompletelyEmpty(slot: BottomSlotDef): boolean {
  return (
    isSlotCompletelyEmpty(slot.outside) &&
    isSlotCompletelyEmpty(slot.topRow) &&
    slot.left.length === 0 &&
    slot.center.length === 0 &&
    slot.right.length === 0
  );
}

function decodeRawThemeMaps(decoded: any, errors: string[]): Record<string, any>[] {
  if (typeof decoded !== 'object') {
    if (Array.isArray(decoded)) {
      return normalizeRawThemeList(decoded, errors);
    }
    errors.push('Root JSON must be a theme object.');
    return [];
  }

  const map = asMap(decoded);

  if (Array.isArray(map['themes'])) {
    return normalizeRawThemeList(map['themes'], errors);
  }

  if (typeof map['themes'] === 'object' && map['themes'] !== null) {
    return [asMap(map['themes'])];
  }

  if (typeof map['theme'] === 'object' && map['theme'] !== null) {
    return [asMap(map['theme'])];
  }

  if (readString(map['id'])) {
    return [map];
  }

  errors.push(
    'Expected a single theme object (or wrapper like {"theme": {...}}).'
  );
  return [];
}

function normalizeRawThemeList(
  rawThemes: any[],
  errors: string[]
): Record<string, any>[] {
  const out: Record<string, any>[] = [];

  for (let i = 0; i < rawThemes.length; i++) {
    const rawTheme = rawThemes[i];
    if (typeof rawTheme !== 'object' || rawTheme === null || Array.isArray(rawTheme)) {
      errors.push(`Theme #${i + 1} is not an object.`);
      continue;
    }
    out.push(asMap(rawTheme));
  }

  return out;
}

function collectItemIdsFromTheme(rawTheme: Record<string, any>): Set<string> {
  const ids = new Set<string>();

  // Collect from top zone
  const top = asMap(rawTheme['top']);
  if (Object.keys(top).length > 0) {
    if (top.hasOwnProperty('normal')) {
      collectItemIdsFromThreeColumn(top['normal'], ids);
    } else {
      collectItemIdsFromThreeColumn(top, ids);
    }
    collectItemIdsFromThreeColumn(top['locked'], ids);
  }

  // Collect from middle zone
  const middle = asMap(rawTheme['middle'] ?? rawTheme['center']);
  if (Object.keys(middle).length > 0) {
    if (middle.hasOwnProperty('normal')) {
      collectItemIdsFromList(asMap(middle['normal'])['items'], ids);
    } else {
      collectItemIdsFromList(middle['items'], ids);
    }
    collectItemIdsFromList(asMap(middle['locked'])['items'], ids);
  }

  // Collect from bottom zone
  const bottom = asMap(rawTheme['bottom']);
  if (Object.keys(bottom).length > 0) {
    if (bottom.hasOwnProperty('normal')) {
      collectItemIdsFromBottomSlot(bottom['normal'], ids);
    } else {
      collectItemIdsFromBottomSlot(bottom, ids);
    }
    collectItemIdsFromBottomSlot(bottom['locked'], ids);
  }

  return ids;
}

function collectItemIdsFromThreeColumn(raw: any, out: Set<string>): void {
  const map = asMap(raw);
  if (Object.keys(map).length === 0) return;

  collectItemIdsFromList(map['left'], out);
  collectItemIdsFromList(map['center'], out);
  collectItemIdsFromList(map['right'], out);
}

function collectItemIdsFromBottomSlot(raw: any, out: Set<string>): void {
  const map = asMap(raw);
  if (Object.keys(map).length === 0) return;

  collectItemIdsFromThreeColumn(map['outside'], out);
  collectItemIdsFromThreeColumn(map['top'], out);
  collectItemIdsFromList(map['topLeft'], out);
  collectItemIdsFromList(map['topCenter'], out);
  collectItemIdsFromList(map['topRight'], out);
  collectItemIdsFromList(map['left'], out);
  collectItemIdsFromList(map['center'], out);
  collectItemIdsFromList(map['right'], out);
}

function collectItemIdsFromList(raw: any, out: Set<string>): void {
  if (!Array.isArray(raw)) return;

  for (const entry of raw) {
    if (typeof entry === 'string') {
      const id = entry.trim();
      if (id) out.add(id);
    } else if (typeof entry === 'object' && entry !== null) {
      const id = readString(entry['id']);
      if (id) out.add(id);
    }
  }
}

function collectUnsupportedThemeItemWarnings(
  rawTheme: Record<string, any>,
  themeId: string
): string[] {
  const ids = collectItemIdsFromTheme(rawTheme);

  const { SUPPORTED_THEME_ITEM_IDS } = require('./types');
  const unsupported = Array.from(ids).filter(
    (id) => !SUPPORTED_THEME_ITEM_IDS.has(id)
  );

  return unsupported.map(
    (id) => `Theme "${themeId}" uses unsupported item id "${id}".`
  );
}
