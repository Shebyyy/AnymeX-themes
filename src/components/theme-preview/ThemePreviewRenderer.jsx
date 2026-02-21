// import { createContext, useMemo, useState } from "react";

// function readString(raw) {
//     if (raw == null) return null;
//     const v = String(raw).trim();
//     return v === "" ? null : v;
// }
// function readInt(raw, fallback) {
//     if (typeof raw === "number") return Math.round(raw);
//     if (typeof raw === "string") {
//         const n = parseInt(raw, 10);
//         return isNaN(n) ? fallback : n;
//     }
//     return fallback;
// }
// function readDouble(raw, fallback) {
//     if (typeof raw === "number") return raw;
//     if (typeof raw === "string") {
//         const n = parseFloat(raw);
//         return isNaN(n) ? fallback : n;
//     }
//     return fallback;
// }
// function readBool(raw, fallback) {
//     if (typeof raw === "boolean") return raw;
//     if (typeof raw === "number") return raw !== 0;
//     if (typeof raw === "string") {
//         const n = raw.trim().toLowerCase();
//         if (n === "true") return true;
//         if (n === "false") return false;
//     }
//     return fallback;
// }
// function asMap(raw) {
//     if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
//     return {};
// }
// function readEdgeInsets(raw, fallback) {
//     if (typeof raw === "number") return { top: raw, right: raw, bottom: raw, left: raw };
//     if (!raw || typeof raw !== "object") return fallback;
//     const all = raw.all;
//     if (typeof all === "number") return { top: all, right: all, bottom: all, left: all };
//     const h = readDouble(raw.horizontal, 0);
//     const v = readDouble(raw.vertical, 0);
//     return {
//         top: readDouble(raw.top, v),
//         right: readDouble(raw.right, h),
//         bottom: readDouble(raw.bottom, v),
//         left: readDouble(raw.left, h),
//     };
// }
// function parseAlignment(raw, fallback) {
//     const map = {
//         topLeft: "flex-start flex-start",
//         topCenter: "flex-start center",
//         topRight: "flex-start flex-end",
//         centerLeft: "center flex-start",
//         center: "center center",
//         centerRight: "center flex-end",
//         bottomLeft: "flex-end flex-start",
//         bottomCenter: "flex-end center",
//         bottomRight: "flex-end flex-end",
//     };
//     return map[raw] || fallback;
// }
// function parseFontWeight(raw, fallback) {
//     if (typeof raw === "number") return raw;
//     const map = {
//         thin: 100,
//         extralight: 200,
//         light: 300,
//         normal: 400,
//         regular: 400,
//         medium: 500,
//         semibold: 600,
//         bold: 700,
//         extrabold: 800,
//         black: 900,
//     };
//     const s = readString(raw)?.toLowerCase();
//     if (!s) return fallback;
//     if (s.startsWith("w")) {
//         const n = parseInt(s.slice(1));
//         if (!isNaN(n)) return n;
//     }
//     return map[s] || fallback;
// }

// function hexToRgba(hex) {
//     if (!hex) return null;
//     let h = hex.trim().replace("#", "");
//     if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + "ff";
//     else if (h.length === 4) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
//     else if (h.length === 6) h += "ff";
//     if (h.length !== 8) return null;
//     const n = parseInt(h, 16);
//     if (isNaN(n)) return null;
//     const r = (n >> 24) & 0xff,
//         g = (n >> 16) & 0xff,
//         b = (n >> 8) & 0xff,
//         a = n & 0xff;
//     return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
// }

// const DYNAMIC_COLORS = {
//     primary: "#6750a4",
//     onPrimary: "#ffffff",
//     primaryContainer: "#eaddff",
//     secondary: "#625b71",
//     surface: "#1c1b1f",
//     onSurface: "#e6e1e5",
//     outline: "#938f99",
//     error: "#b3261e",
//     white: "#ffffff",
//     black: "#000000",
//     transparent: "transparent",
// };

// function resolveColor(raw, fallback, palette = {}) {
//     if (!raw) return fallback;
//     let token = raw.trim();
//     if (token.startsWith("@")) {
//         const palVal = palette[token.slice(1)];
//         if (palVal && palVal !== token) token = palVal;
//     }

//     const rgbaMatch = token.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9]*\.?[0-9]+))?\s*\)$/);
//     if (rgbaMatch) {
//         const [, r, g, b, a = "1"] = rgbaMatch;
//         return `rgba(${r},${g},${b},${parseFloat(a).toFixed(3)})`;
//     }

//     const dynMatch = token.match(/^dynamic\(([^,\)]+)(?:,\s*([0-9]*\.?[0-9]+))?\)$/);
//     if (dynMatch) {
//         const key = dynMatch[1].trim();
//         const alpha = dynMatch[2] ? parseFloat(dynMatch[2]) : null;
//         const dynColor = DYNAMIC_COLORS[key] || DYNAMIC_COLORS[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())];
//         if (dynColor) {
//             if (alpha !== null && dynColor.startsWith("#")) {
//                 const rgba = hexToRgba(dynColor);
//                 if (rgba) return rgba.replace(/,[^,]+\)$/, `,${alpha.toFixed(3)})`);
//             }
//             return dynColor;
//         }
//     }

//     const hexMatch = token.match(/^hex\((#[0-9a-fA-F]+)\)$/);
//     if (hexMatch) {
//         const c = hexToRgba(hexMatch[1]);
//         if (c) return c;
//     }
//     if (token.startsWith("#")) {
//         const c = hexToRgba(token);
//         if (c) return c;
//     }
//     const named = { white: "#ffffff", black: "#000000", transparent: "transparent" };
//     if (named[token.toLowerCase()]) return named[token.toLowerCase()];
//     return fallback;
// }

// function parsePanelStyle(json) {
//     return {
//         enabled: readBool(json.enabled, true),
//         showBackground: readBool(json.showBackground, true),
//         showBorder: readBool(json.showBorder, true),
//         radius: readDouble(json.radius, 22),
//         blur: readDouble(json.blur, 18),
//         color: readString(json.color),
//         borderColor: readString(json.borderColor),
//         borderWidth: readDouble(json.borderWidth, 0.8),
//         padding: readEdgeInsets(json.padding, { top: 10, right: 12, bottom: 10, left: 12 }),
//         shadowColor: readString(json.shadowColor),
//         shadowBlur: readDouble(json.shadowBlur, 18),
//         shadowOffsetY: readDouble(json.shadowOffsetY, 8),
//     };
// }
// function mashPanel(base, over) {
//     if (!over || Object.keys(over).length === 0) return base;
//     return {
//         enabled: readBool(over.enabled, base.enabled),
//         showBackground: readBool(over.showBackground, base.showBackground),
//         showBorder: readBool(over.showBorder, base.showBorder),
//         radius: readDouble(over.radius, base.radius),
//         blur: readDouble(over.blur, base.blur),
//         color: readString(over.color) ?? base.color,
//         borderColor: readString(over.borderColor) ?? base.borderColor,
//         borderWidth: readDouble(over.borderWidth, base.borderWidth),
//         padding: over.padding ? readEdgeInsets(over.padding, base.padding) : base.padding,
//         shadowColor: readString(over.shadowColor) ?? base.shadowColor,
//         shadowBlur: readDouble(over.shadowBlur, base.shadowBlur),
//         shadowOffsetY: readDouble(over.shadowOffsetY, base.shadowOffsetY),
//     };
// }
// function parseButtonStyle(json) {
//     return {
//         size: readDouble(json.size, 40),
//         iconSize: readDouble(json.iconSize, 20),
//         radius: readDouble(json.radius, 16),
//         blur: readDouble(json.blur, 14),
//         color: readString(json.color),
//         borderColor: readString(json.borderColor),
//         borderWidth: readDouble(json.borderWidth, 0.8),
//         iconColor: readString(json.iconColor),
//         disabledIconColor: readString(json.disabledIconColor),
//     };
// }
// function mashButton(base, over) {
//     if (!over || Object.keys(over).length === 0) return base;
//     return {
//         size: readDouble(over.size, base.size),
//         iconSize: readDouble(over.iconSize, base.iconSize),
//         radius: readDouble(over.radius, base.radius),
//         blur: readDouble(over.blur, base.blur),
//         color: readString(over.color) ?? base.color,
//         borderColor: readString(over.borderColor) ?? base.borderColor,
//         borderWidth: readDouble(over.borderWidth, base.borderWidth),
//         iconColor: readString(over.iconColor) ?? base.iconColor,
//         disabledIconColor: readString(over.disabledIconColor) ?? base.disabledIconColor,
//     };
// }
// function parseChipStyle(json) {
//     return {
//         radius: readDouble(json.radius, 14),
//         color: readString(json.color),
//         backgroundColor: readString(json.backgroundColor),
//         borderColor: readString(json.borderColor),
//         borderWidth: readDouble(json.borderWidth, 0.6),
//         textColor: readString(json.textColor),
//         fontSize: readDouble(json.fontSize, 12),
//         fontWeight: parseFontWeight(json.fontWeight, 600),
//         letterSpacing: readDouble(json.letterSpacing, 0.2),
//         padding: readEdgeInsets(json.padding, { top: 6, right: 10, bottom: 6, left: 10 }),
//     };
// }
// function mashChip(base, over) {
//     if (!over || Object.keys(over).length === 0) return base;
//     return {
//         radius: readDouble(over.radius, base.radius),
//         color: readString(over.color) ?? base.color,
//         backgroundColor: readString(over.backgroundColor) ?? base.backgroundColor,
//         borderColor: readString(over.borderColor) ?? base.borderColor,
//         borderWidth: readDouble(over.borderWidth, base.borderWidth),
//         textColor: readString(over.textColor) ?? base.textColor,
//         fontSize: readDouble(over.fontSize, base.fontSize),
//         fontWeight: parseFontWeight(over.fontWeight, base.fontWeight),
//         letterSpacing: readDouble(over.letterSpacing, base.letterSpacing),
//         padding: over.padding ? readEdgeInsets(over.padding, base.padding) : base.padding,
//     };
// }
// function parseTextStyle(json) {
//     return {
//         textColor: readString(json.textColor),
//         backgroundColor: readString(json.backgroundColor),
//         fontSize: readDouble(json.fontSize, 14),
//         fontWeight: parseFontWeight(json.fontWeight, 700),
//         letterSpacing: readDouble(json.letterSpacing, 0.2),
//         height: readDouble(json.height, 1.2),
//     };
// }
// function mashText(base, over) {
//     if (!over || Object.keys(over).length === 0) return base;
//     return {
//         textColor: readString(over.textColor) ?? base.textColor,
//         backgroundColor: readString(over.backgroundColor) ?? base.backgroundColor,
//         fontSize: readDouble(over.fontSize, base.fontSize),
//         fontWeight: parseFontWeight(over.fontWeight, base.fontWeight),
//         letterSpacing: readDouble(over.letterSpacing, base.letterSpacing),
//         height: readDouble(over.height, base.height),
//     };
// }

// function parseStyles(json) {
//     return {
//         panel: parsePanelStyle(asMap(json.panel)),
//         button: parseButtonStyle(asMap(json.button)),
//         primaryButton: parseButtonStyle(asMap(json.primaryButton)),
//         chip: parseChipStyle(asMap(json.chip)),
//         text: parseTextStyle(asMap(json.text)),
//     };
// }

// function parseZoneVibes(json, defaults) {
//     return {
//         alignment: parseAlignment(readString(json.alignment), defaults.alignment),
//         padding: readEdgeInsets(json.padding, defaults.padding),
//         hiddenOffset: json.hiddenOffset,
//         showWhenLocked: readBool(json.showWhenLocked, defaults.showWhenLocked),
//         showWhenUnlocked: readBool(json.showWhenUnlocked, defaults.showWhenUnlocked),
//         useNormalWhenLocked: readBool(json.useNormalLayoutWhenLocked, defaults.useNormalWhenLocked),
//         itemSpacing: readDouble(json.itemSpacing, 8),
//         groupSpacing: readDouble(json.groupSpacing, 10),
//         topRowBottomSpacing: readDouble(json.topRowBottomSpacing, 8),
//         progressBottomSpacing: readDouble(json.progressBottomSpacing, 10),
//         visibleWhen: readString(json.visibleWhen),
//         panelOverride: asMap(json.panelStyle),
//         absoluteCenter: readBool(json.absoluteCenter, false),
//     };
// }

// function parseItems(raw) {
//     if (!Array.isArray(raw)) return [];
//     return raw.flatMap(entry => {
//         try {
//             if (typeof entry === "string") return [{ id: entry.trim(), data: {} }];
//             if (entry && typeof entry === "object") {
//                 const id = readString(entry.id);
//                 if (!id) return [];
//                 return [{ id, data: entry }];
//             }
//         } catch (_) {}
//         return [];
//     });
// }

// function parseThreeColumnSlot(json) {
//     return {
//         left: parseItems(json.left),
//         center: parseItems(json.center),
//         right: parseItems(json.right),
//         get isCompletelyEmpty() {
//             return this.left.length === 0 && this.center.length === 0 && this.right.length === 0;
//         },
//     };
// }

// function parseBottomSlot(json) {
//     const outsideRaw = json.outside;
//     const outside =
//         outsideRaw && typeof outsideRaw === "object"
//             ? parseThreeColumnSlot(asMap(outsideRaw))
//             : { left: [], center: [], right: [], isCompletelyEmpty: true };

//     const topRowRaw = json.top;
//     let topRow;
//     if (topRowRaw && typeof topRowRaw === "object") {
//         topRow = parseThreeColumnSlot(asMap(topRowRaw));
//     } else {
//         topRow = {
//             left: parseItems(json.topLeft),
//             center: parseItems(json.topCenter),
//             right: parseItems(json.topRight),
//             get isCompletelyEmpty() {
//                 return this.left.length === 0 && this.center.length === 0 && this.right.length === 0;
//             },
//         };
//     }

//     return {
//         outside,
//         topRow,
//         left: parseItems(json.left),
//         center: parseItems(json.center),
//         right: parseItems(json.right),
//         get isCompletelyEmpty() {
//             return (
//                 outside.isCompletelyEmpty &&
//                 topRow.isCompletelyEmpty &&
//                 this.left.length === 0 &&
//                 this.center.length === 0 &&
//                 this.right.length === 0
//             );
//         },
//     };
// }

// function parseTopZone(json) {
//     const normalSrc = json.normal ? asMap(json.normal) : json;
//     const lockedSrc = asMap(json.locked);
//     const vibes = parseZoneVibes(json, {
//         alignment: "flex-start center",
//         padding: { top: 8, right: 14, bottom: 8, left: 14 },
//         showWhenLocked: true,
//         showWhenUnlocked: true,
//         useNormalWhenLocked: false,
//     });
//     const normal = parseThreeColumnSlot(normalSrc);
//     const locked = Object.keys(lockedSrc).length > 0 ? parseThreeColumnSlot(lockedSrc) : null;
//     return { normal, locked, vibes };
// }

// function parseMiddleZone(json) {
//     const normalSrc = json.normal ? asMap(json.normal) : json;
//     const lockedSrc = asMap(json.locked);
//     const vibes = parseZoneVibes(json, {
//         alignment: "center center",
//         padding: { top: 0, right: 14, bottom: 0, left: 14 },
//         showWhenLocked: false,
//         showWhenUnlocked: true,
//         useNormalWhenLocked: false,
//     });
//     const normalItems = parseItems(normalSrc.items);
//     const lockedItems = Object.keys(lockedSrc).length > 0 ? parseItems(lockedSrc.items) : null;
//     return { normalItems, lockedItems, vibes };
// }

// function parseBottomZone(json) {
//     const normalSrc = json.normal ? asMap(json.normal) : json;
//     const lockedSrc = asMap(json.locked);
//     const vibes = parseZoneVibes(json, {
//         alignment: "flex-end center",
//         padding: { top: 8, right: 14, bottom: 8, left: 14 },
//         showWhenLocked: true,
//         showWhenUnlocked: true,
//         useNormalWhenLocked: false,
//     });
//     const normal = parseBottomSlot(normalSrc);
//     const locked = Object.keys(lockedSrc).length > 0 ? parseBottomSlot(lockedSrc) : null;
//     return {
//         normal,
//         locked,
//         vibes,
//         showProgress: readBool(json.showProgress, true),
//         progressStyle: readString(json.progressStyle) || "ios",
//         progressPadding: readEdgeInsets(json.progressPadding, { top: 0, right: 4, bottom: 0, left: 4 }),
//         outsidePadding: readEdgeInsets(json.outsidePadding, { top: 0, right: 0, bottom: 6, left: 0 }),
//     };
// }

// function parsePalette(raw) {
//     const palette = {};
//     if (raw && typeof raw === "object") {
//         for (const [k, v] of Object.entries(raw)) {
//             if (k === "note_by_dev") continue;
//             const s = readString(v);
//             if (s) palette[k] = s;
//         }
//     }
//     return palette;
// }

// function parseThemeDef(json) {
//     const id = readString(json.id);
//     if (!id) throw new Error("Theme id is required.");
//     const palette = parsePalette(json.palette);
//     return {
//         id,
//         name: readString(json.name) || id,
//         palette,
//         styles: parseStyles(asMap(json.styles)),
//         top: parseTopZone(asMap(json.top)),
//         middle: parseMiddleZone(asMap(json.middle || json.center)),
//         bottom: parseBottomZone(asMap(json.bottom)),
//     };
// }

// function decodeRawThemeMaps(decoded, errors) {
//     if (!decoded || typeof decoded !== "object") {
//         errors.push("Root JSON must be a theme object.");
//         return [];
//     }
//     if (Array.isArray(decoded)) {
//         return decoded.filter(t => t && typeof t === "object");
//     }
//     if (Array.isArray(decoded.themes)) return decoded.themes.filter(t => typeof t === "object");
//     if (decoded.themes && typeof decoded.themes === "object") return [decoded.themes];
//     if (decoded.theme && typeof decoded.theme === "object") return [decoded.theme];
//     if (readString(decoded.id)) return [decoded];
//     errors.push("Expected a theme object or {themes:[...]}.");
//     return [];
// }

// function parseCollection(rawJson) {
//     const input = (rawJson || "").trim();
//     if (!input) return { themes: [], errors: ["JSON payload is empty."], warnings: [], isValid: false };
//     const errors = [],
//         warnings = [];
//     let decoded;
//     try {
//         decoded = JSON.parse(input);
//     } catch (e) {
//         return { themes: [], errors: [`Invalid JSON: ${e.message}`], warnings: [], isValid: false };
//     }
//     const rawMaps = decodeRawThemeMaps(decoded, errors);
//     const themes = [];
//     rawMaps.forEach((raw, i) => {
//         try {
//             themes.push(parseThemeDef(raw));
//         } catch (e) {
//             errors.push(`Theme #${i + 1} invalid: ${e.message}`);
//         }
//     });
//     if (themes.length === 0 && errors.length === 0) errors.push("No themes found.");
//     return { themes, errors, warnings, isValid: errors.length === 0 && themes.length > 0 };
// }

// const ICONS = {
//     back: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
//         </svg>
//     ),
//     lock_controls: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
//         </svg>
//     ),
//     unlock_controls: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M12 1C9.24 1 7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2H9V6c0-1.66 1.34-3 3-3 1.31 0 2.42.85 2.83 2.02l1.89-.7C16.14 2.73 14.22 1 12 1zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
//         </svg>
//     ),
//     toggle_fullscreen: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
//         </svg>
//     ),
//     open_settings: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
//         </svg>
//     ),
//     previous_episode: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
//         </svg>
//     ),
//     next_episode: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
//         </svg>
//     ),
//     seek_back: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.69l1.77-.63h.09V16zm4.28-1.41c0 .32-.03.59-.1.82s-.17.42-.29.57-.28.26-.45.33-.37.1-.59.1-.41-.03-.59-.1-.33-.18-.46-.33-.23-.34-.3-.57-.11-.5-.11-.82v-.74c0-.32.03-.59.1-.82s.17-.42.29-.57.28-.26.45-.33.37-.1.59-.1.41.03.59.1.33.18.46.33.23.34.3.57.11.5.11.82v.74zm-.85-.86c0-.19-.01-.35-.04-.48s-.07-.23-.12-.31-.11-.14-.19-.17-.16-.05-.25-.05-.18.02-.25.05-.14.09-.19.17-.09.18-.12.31-.04.29-.04.48v.97c0 .19.01.35.04.48s.07.23.12.31.11.14.19.18.16.05.25.05.18-.02.25-.05.14-.1.19-.18.09-.18.12-.31.04-.29.04-.48v-.97z" />
//         </svg>
//     ),
//     seek_forward: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.69l1.77-.63h.09V16zm4.28-1.41c0 .32-.03.59-.1.82s-.17.42-.29.57-.28.26-.45.33-.37.1-.59.1-.41-.03-.59-.1-.33-.18-.46-.33-.23-.34-.3-.57-.11-.5-.11-.82v-.74c0-.32.03-.59.1-.82s.17-.42.29-.57.28-.26.45-.33.37-.1.59-.1.41.03.59.1.33.18.46.33.23.34.3.57.11.5.11.82v.74zm-.85-.86c0-.19-.01-.35-.04-.48s-.07-.23-.12-.31-.11-.14-.19-.17-.16-.05-.25-.05-.18.02-.25.05-.14.09-.19.17-.09.18-.12.31-.04.29-.04.48v.97c0 .19.01.35.04.48s.07.23.12.31.11.14.19.18.16.05.25.05.18-.02.25-.05.14-.1.19-.18.09-.18.12-.31.04-.29.04-.48v-.97z" />
//         </svg>
//     ),
//     play_pause: ({ size, isPlaying }) =>
//         isPlaying ? (
//             <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
//             </svg>
//         ) : (
//             <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M8 5v14l11-7z" />
//             </svg>
//         ),
//     playlist: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5L21 15.59z" />
//         </svg>
//     ),
//     subtitles: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h2v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H12v-2h8v2z" />
//         </svg>
//     ),
//     server: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
//         </svg>
//     ),
//     quality: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
//         </svg>
//     ),
//     speed: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z" />
//         </svg>
//     ),
//     audio_track: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
//         </svg>
//     ),
//     orientation: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 19.29.5 14 .05v1.5c.88.09 1.72.28 2.48.47zM6.1 6.11L1 11.21 6.1 16.3l5.09-5.09-5.09-5.1zm.01 8.48L3.53 12.1 6.11 9.5l2.57 2.6-2.57 2.49zM7.52 .05v1.5c.88.09 1.72.28 2.48.47 3.27 1.55 5.61 4.72 5.97 8.48h1.5C17.44 4.84 13.29.5 7.52.05zM2.05 13.51H.55C1 19.29 5.51 23.44 11 23.95v-1.5C7.05 22.01 3.5 18.5 2.05 13.51z" />
//         </svg>
//     ),
//     aspect_ratio: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z" />
//         </svg>
//     ),
//     mega_seek: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
//         </svg>
//     ),
//     shaders: ({ size }) => (
//         <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
//             <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
//         </svg>
//     ),
// };

// function renderIcon(id, size, extra = {}) {
//     const Comp = ICONS[id] || ICONS.back;
//     return <Comp size={size} {...extra} />;
// }

// const ControllerCtx = createContext({
//     isLocked: false,
//     showControls: true,
//     isPlaying: true,
//     isBuffering: false,
//     isOffline: false,
//     canGoForward: true,
//     canGoBackward: true,
//     currentPosition: "12:34",
//     duration: "45:00",
//     remaining: "-32:26",
//     progress: 0.27,
//     title: "Episode 12 - The Return",
//     seriesTitle: "My Hero Academia",
//     episodeNumber: "12",
//     quality: "1080p",
// });

// function padInsets(p) {
//     return `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
// }

// function PanelWrapper({ style, palette, children }) {
//     if (!style.enabled) return <>{children}</>;
//     const wantsBg = style.showBackground;
//     const wantsBorder = style.showBorder;
//     const bg = wantsBg ? resolveColor(style.color, "rgba(255,255,255,0.08)", palette) : "transparent";
//     const border = wantsBorder ? resolveColor(style.borderColor, "rgba(255,255,255,0.22)", palette) : "transparent";
//     const shadow = style.shadowBlur > 0 ? resolveColor(style.shadowColor, "rgba(0,0,0,0.22)", palette) : "transparent";

//     return (
//         <div
//             style={{
//                 background: bg,
//                 borderRadius: style.radius,
//                 border: `${style.borderWidth}px solid ${border}`,
//                 boxShadow: style.shadowBlur > 0 ? `0 ${style.shadowOffsetY}px ${style.shadowBlur}px ${shadow}` : "none",
//                 padding: padInsets(style.padding),
//                 backdropFilter: style.blur > 0 ? `blur(${style.blur}px)` : "none",
//                 WebkitBackdropFilter: style.blur > 0 ? `blur(${style.blur}px)` : "none",
//                 overflow: "hidden",
//             }}
//         >
//             {children}
//         </div>
//     );
// }

// function ButtonShell({ style, palette, children, disabled }) {
//     const bg = resolveColor(style.color, "rgba(255,255,255,0.12)", palette);
//     const border = resolveColor(style.borderColor, "rgba(255,255,255,0.28)", palette);
//     return (
//         <div
//             style={{
//                 width: style.size,
//                 height: style.size,
//                 borderRadius: style.radius,
//                 background: bg,
//                 border: `${style.borderWidth}px solid ${border}`,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//                 backdropFilter: style.blur > 0 ? `blur(${style.blur}px)` : "none",
//                 opacity: disabled ? 0.5 : 1,
//                 cursor: "pointer",
//                 overflow: "hidden",
//             }}
//         >
//             {children}
//         </div>
//     );
// }

// function BadgeComp({ text, style, palette }) {
//     const bg = resolveColor(style.backgroundColor || style.color, "rgba(255,255,255,0.14)", palette);
//     const border = resolveColor(style.borderColor, "rgba(255,255,255,0.30)", palette);
//     const textColor = resolveColor(style.textColor, "#ffffff", palette);
//     return (
//         <div
//             style={{
//                 padding: padInsets(style.padding),
//                 borderRadius: style.radius,
//                 background: bg,
//                 border: `${style.borderWidth}px solid ${border}`,
//                 display: "inline-flex",
//             }}
//         >
//             <span
//                 style={{
//                     color: textColor,
//                     fontSize: style.fontSize,
//                     fontWeight: style.fontWeight,
//                     letterSpacing: style.letterSpacing,
//                     lineHeight: 1,
//                     whiteSpace: "nowrap",
//                 }}
//             >
//                 {text}
//             </span>
//         </div>
//     );
// }

// function grabDouble(data, key, fallback) {
//     return readDouble(data[key], fallback);
// }
// function grabInt(data, key, fallback) {
//     return readInt(data[key], fallback);
// }
// function grabString(data, key) {
//     return readString(data[key]);
// }
// function grabBool(data, key, fallback) {
//     return readBool(data[key], fallback);
// }

// function ItemRenderer({ item, theme, controller }) {
//     const { id, data } = item;
//     const palette = theme.palette;
//     const styles = theme.styles;
//     const chipStyle = mashChip(styles.chip, asMap(data.style));
//     const textStyle = mashText(styles.text, asMap(data.style));
//     const wantsBig = grabBool(data, "primary", id === "play_pause");
//     const btnBase = wantsBig ? styles.primaryButton : styles.button;
//     const btnStyle = mashButton(btnBase, asMap(data.style));
//     const iconColor = resolveColor(btnStyle.iconColor, "#ffffff", palette);

//     const heightToQuality = h => {
//         if (!h) return "";
//         if (h >= 2160) return "2160p";
//         if (h >= 1440) return "1440p";
//         if (h >= 1080) return "1080p";
//         if (h >= 720) return "720p";
//         if (h >= 480) return "480p";
//         if (h >= 360) return "360p";
//         return "";
//     };

//     const visibleWhen = readString(data.visibleWhen);
//     if (visibleWhen) {
//         const orParts = visibleWhen.split("||");
//         const pass = orParts.some(op =>
//             op.split("&&").every(token => {
//                 token = token.trim();
//                 if (!token) return true;
//                 const neg = token.startsWith("!");
//                 if (neg) token = token.slice(1).trim();
//                 const condMap = {
//                     locked: controller.isLocked,
//                     unlocked: !controller.isLocked,
//                     isPlaying: controller.isPlaying,
//                     isOffline: controller.isOffline,
//                     isOnline: !controller.isOffline,
//                     canGoForward: controller.canGoForward,
//                     canGoBackward: controller.canGoBackward,
//                 };
//                 const val = condMap[token] ?? false;
//                 return neg ? !val : val;
//             }),
//         );
//         if (!pass) return null;
//     }

//     const textColorRaw = resolveColor(textStyle.textColor, "#ffffff", palette);

//     switch (id) {
//         case "gap":
//             return (
//                 <div
//                     style={{ width: grabDouble(data, "size", 8), height: grabDouble(data, "height", 0), flexShrink: 0 }}
//                 />
//             );
//         case "spacer":
//         case "flex_spacer": {
//             const flex = grabInt(data, "flex", 1);
//             return <div style={{ flex: flex, minWidth: 0 }} />;
//         }
//         case "progress_slider":
//             return (
//                 <div
//                     style={{
//                         flex: 1,
//                         height: 4,
//                         background: "rgba(255,255,255,0.25)",
//                         borderRadius: 2,
//                         overflow: "hidden",
//                     }}
//                 >
//                     <div
//                         style={{
//                             width: `${controller.progress * 100}%`,
//                             height: "100%",
//                             background: "#ffffff",
//                             borderRadius: 2,
//                         }}
//                     />
//                 </div>
//             );
//         case "time_current":
//             return <BadgeComp text={controller.currentPosition} style={chipStyle} palette={palette} />;
//         case "time_duration":
//             return <BadgeComp text={controller.duration} style={chipStyle} palette={palette} />;
//         case "time_remaining":
//             return <BadgeComp text={controller.remaining} style={chipStyle} palette={palette} />;
//         case "title": {
//             const text = controller.title;
//             if (!text) return null;
//             const maxLines = grabInt(data, "maxLines", 1);
//             return (
//                 <span
//                     style={{
//                         color: textColorRaw,
//                         fontSize: textStyle.fontSize,
//                         fontWeight: textStyle.fontWeight,
//                         letterSpacing: textStyle.letterSpacing,
//                         lineHeight: textStyle.height,
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: maxLines === 1 ? "nowrap" : "normal",
//                         display: "-webkit-box",
//                         WebkitLineClamp: maxLines,
//                         WebkitBoxOrient: "vertical",
//                     }}
//                 >
//                     {text}
//                 </span>
//             );
//         }
//         case "episode_badge":
//             return <BadgeComp text={`Episode ${controller.episodeNumber}`} style={chipStyle} palette={palette} />;
//         case "series_badge": {
//             const label = controller.seriesTitle;
//             if (!label) return null;
//             return <BadgeComp text={label} style={chipStyle} palette={palette} />;
//         }
//         case "quality_badge": {
//             const label = controller.quality || "1080p";
//             if (!label) return null;
//             return <BadgeComp text={label} style={chipStyle} palette={palette} />;
//         }
//         case "watching_label": {
//             const title = controller.title;
//             if (!title) return null;
//             const topText = grabString(data, "topText") || "You're watching";
//             const topFontSize = grabDouble(data, "topFontSize", 11);
//             const bottomFontSize = grabDouble(data, "bottomFontSize", 14);
//             const topFontWeight = parseFontWeight(grabString(data, "topFontWeight"), 400);
//             const bottomFontWeight = parseFontWeight(grabString(data, "bottomFontWeight"), 700);
//             const topColor = resolveColor(
//                 grabString(data, "topColor") || textStyle.textColor,
//                 "rgba(255,255,255,0.65)",
//                 palette,
//             );
//             const bottomColor = resolveColor(
//                 grabString(data, "bottomColor") || textStyle.textColor,
//                 "#ffffff",
//                 palette,
//             );
//             return (
//                 <div style={{ display: "flex", flexDirection: "column", gap: grabDouble(data, "gap", 2) }}>
//                     <span style={{ color: topColor, fontSize: topFontSize, fontWeight: topFontWeight }}>{topText}</span>
//                     <span
//                         style={{
//                             color: bottomColor,
//                             fontSize: bottomFontSize,
//                             fontWeight: bottomFontWeight,
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                             whiteSpace: "nowrap",
//                         }}
//                     >
//                         {title}
//                     </span>
//                 </div>
//             );
//         }
//         case "text": {
//             const source = grabString(data, "source");
//             const sourceMap = {
//                 title: controller.title,
//                 episode_label: `Episode ${controller.episodeNumber}`,
//                 series_title: controller.seriesTitle,
//                 quality_label: controller.quality,
//                 current_time: controller.currentPosition,
//                 duration: controller.duration,
//                 remaining: controller.remaining,
//             };
//             const value = source ? sourceMap[source] || source : grabString(data, "text") || "";
//             if (!value) return null;
//             const maxLines = grabInt(data, "maxLines", 1);
//             return (
//                 <span
//                     style={{
//                         color: textColorRaw,
//                         fontSize: textStyle.fontSize,
//                         fontWeight: textStyle.fontWeight,
//                         letterSpacing: textStyle.letterSpacing,
//                         lineHeight: textStyle.height,
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: maxLines === 1 ? "nowrap" : "normal",
//                     }}
//                 >
//                     {value}
//                 </span>
//             );
//         }
//         case "label_stack": {
//             const lines = data.lines;
//             if (!Array.isArray(lines) || lines.length === 0) return null;
//             const sourceMap = {
//                 title: controller.title,
//                 episode_label: `Episode ${controller.episodeNumber}`,
//                 series_title: controller.seriesTitle,
//                 current_time: controller.currentPosition,
//                 duration: controller.duration,
//                 remaining: controller.remaining,
//             };
//             const rendered = lines.flatMap((line, i) => {
//                 if (!line || typeof line !== "object") return [];
//                 const src = readString(line.source);
//                 const rawText = readString(line.text) || "";
//                 const value = src ? sourceMap[src] || "" : rawText;
//                 if (!value) return [];
//                 const lineColor = resolveColor(readString(line.textColor) || textStyle.textColor, "#ffffff", palette);
//                 return [
//                     <span
//                         key={i}
//                         style={{
//                             color: lineColor,
//                             fontSize: readDouble(line.fontSize, textStyle.fontSize),
//                             fontWeight: parseFontWeight(line.fontWeight, textStyle.fontWeight),
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                             whiteSpace: "nowrap",
//                         }}
//                     >
//                         {value}
//                     </span>,
//                 ];
//             });
//             if (rendered.length === 0) return null;
//             return <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{rendered}</div>;
//         }
//         default: {
//             if (id === "orientation") return null;
//             if ((id === "server" || id === "quality") && controller.isOffline) return null;
//             const isPlayPause = id === "play_pause";
//             const icon = renderIcon(id, btnStyle.iconSize, { isPlaying: controller.isPlaying });
//             const disabled =
//                 (id === "previous_episode" && !controller.canGoBackward) ||
//                 (id === "next_episode" && !controller.canGoForward);
//             return (
//                 <ButtonShell style={btnStyle} palette={palette} disabled={disabled}>
//                     <div style={{ color: disabled ? "rgba(255,255,255,0.5)" : iconColor, display: "flex" }}>{icon}</div>
//                 </ButtonShell>
//             );
//         }
//     }
// }

// function FlatRow({ items, spacing, theme, controller }) {
//     const rendered = items
//         .map((item, i) => <ItemRenderer key={i} item={item} theme={theme} controller={controller} />)
//         .filter(Boolean);
//     if (rendered.length === 0) return null;
//     return (
//         <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: spacing, flexShrink: 0 }}>
//             {rendered}
//         </div>
//     );
// }

// function TitleAreaThing({ items, spacing, theme, controller }) {
//     const BADGE_IDS = new Set(["episode_badge", "series_badge", "quality_badge"]);
//     const titleItems = [],
//         badgeItems = [],
//         stackItems = [],
//         otherItems = [];
//     for (const item of items) {
//         if (item.id === "title") titleItems.push(item);
//         else if (BADGE_IDS.has(item.id)) badgeItems.push(item);
//         else if (item.id === "label_stack" || item.id === "watching_label") stackItems.push(item);
//         else otherItems.push(item);
//     }
//     if (stackItems.length === 0 && titleItems.length === 0 && badgeItems.length === 0) {
//         return <FlatRow items={items} spacing={spacing} theme={theme} controller={controller} />;
//     }
//     return (
//         <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
//             {stackItems.map((si, i) => (
//                 <ItemRenderer key={`s${i}`} item={si} theme={theme} controller={controller} />
//             ))}
//             {titleItems[0] && <ItemRenderer item={titleItems[0]} theme={theme} controller={controller} />}
//             {badgeItems.length > 0 && (
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: spacing }}>
//                     {badgeItems.map((bi, i) => (
//                         <ItemRenderer key={`b${i}`} item={bi} theme={theme} controller={controller} />
//                     ))}
//                 </div>
//             )}
//             {otherItems.length > 0 && (
//                 <FlatRow items={otherItems} spacing={spacing} theme={theme} controller={controller} />
//             )}
//         </div>
//     );
// }

// function ThreeColumnRow({ left, center, right, vibes, isTitleZone, theme, controller }) {
//     const { itemSpacing: sp, groupSpacing: gsp, absoluteCenter } = vibes;
//     const leftEl = left.length > 0 ? <FlatRow items={left} spacing={sp} theme={theme} controller={controller} /> : null;
//     const rightEl =
//         right.length > 0 ? <FlatRow items={right} spacing={sp} theme={theme} controller={controller} /> : null;
//     const centerEl =
//         center.length > 0 ? (
//             isTitleZone ? (
//                 <TitleAreaThing items={center} spacing={sp} theme={theme} controller={controller} />
//             ) : (
//                 <FlatRow items={center} spacing={sp} theme={theme} controller={controller} />
//             )
//         ) : null;

//     if (!leftEl && !centerEl && !rightEl) return null;

//     if (absoluteCenter && centerEl) {
//         return (
//             <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
//                 <div style={{ display: "flex", flex: 1, justifyContent: "space-between", alignItems: "center" }}>
//                     {leftEl || <div />}
//                     {rightEl || <div />}
//                 </div>
//                 <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>{centerEl}</div>
//             </div>
//         );
//     }

//     return (
//         <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", gap: gsp }}>
//             {leftEl}
//             {centerEl ? <div style={{ flex: 1, minWidth: 0 }}>{centerEl}</div> : <div style={{ flex: 1 }} />}
//             {rightEl}
//         </div>
//     );
// }

// function ZoneTop({ zone, theme, controller }) {
//     const { vibes } = zone;
//     if (!vibes.showWhenUnlocked && !controller.isLocked) return null;
//     if (!vibes.showWhenLocked && controller.isLocked) return null;
//     const slot =
//         controller.isLocked && zone.locked && !zone.locked.isCompletelyEmpty
//             ? zone.locked
//             : controller.isLocked && vibes.useNormalWhenLocked
//               ? zone.normal
//               : controller.isLocked
//                 ? zone.locked
//                 : zone.normal;
//     if (!slot || slot.isCompletelyEmpty) return null;
//     const panelStyle = mashPanel(theme.styles.panel, vibes.panelOverride || {});
//     return (
//         <div style={{ padding: padInsets(vibes.padding), display: "flex", alignItems: "center" }}>
//             <PanelWrapper style={panelStyle} palette={theme.palette}>
//                 <ThreeColumnRow
//                     left={slot.left}
//                     center={slot.center}
//                     right={slot.right}
//                     vibes={vibes}
//                     isTitleZone
//                     theme={theme}
//                     controller={controller}
//                 />
//             </PanelWrapper>
//         </div>
//     );
// }

// function ZoneMiddle({ zone, theme, controller }) {
//     const { vibes } = zone;
//     if (!vibes.showWhenUnlocked && !controller.isLocked) return null;
//     if (!vibes.showWhenLocked && controller.isLocked) return null;
//     const items = controller.isLocked && zone.lockedItems?.length > 0 ? zone.lockedItems : zone.normalItems;
//     if (!items || items.length === 0) return null;
//     const panelStyle = mashPanel(theme.styles.panel, vibes.panelOverride || {});
//     return (
//         <div style={{ display: "flex", justifyContent: "center", padding: padInsets(vibes.padding) }}>
//             <PanelWrapper style={panelStyle} palette={theme.palette}>
//                 <FlatRow items={items} spacing={vibes.itemSpacing} theme={theme} controller={controller} />
//             </PanelWrapper>
//         </div>
//     );
// }

// function ZoneBottom({ zone, theme, controller }) {
//     const { vibes } = zone;
//     if (!vibes.showWhenUnlocked && !controller.isLocked) return null;
//     if (!vibes.showWhenLocked && controller.isLocked) return null;

//     const slot = controller.isLocked && zone.locked && !zone.locked?.isCompletelyEmpty ? zone.locked : zone.normal;
//     if (!slot) return null;

//     const panelStyle = mashPanel(theme.styles.panel, vibes.panelOverride || {});

//     const allItems = [
//         ...slot.left,
//         ...slot.center,
//         ...slot.right,
//         ...(slot.topRow?.left || []),
//         ...(slot.topRow?.center || []),
//         ...(slot.topRow?.right || []),
//     ];
//     const hasProgress = allItems.some(i => i.id === "progress_slider");

//     const kids = [];
//     if (!slot.topRow?.isCompletelyEmpty) {
//         kids.push(
//             <ThreeColumnRow
//                 key="toprow"
//                 left={slot.topRow.left}
//                 center={slot.topRow.center}
//                 right={slot.topRow.right}
//                 vibes={vibes}
//                 isTitleZone={false}
//                 theme={theme}
//                 controller={controller}
//             />,
//         );
//         if (vibes.topRowBottomSpacing > 0) kids.push(<div key="trgap" style={{ height: vibes.topRowBottomSpacing }} />);
//     }

//     if (zone.showProgress && !hasProgress) {
//         kids.push(
//             <div key="progress" style={{ padding: padInsets(zone.progressPadding) }}>
//                 <div style={{ height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 2, overflow: "hidden" }}>
//                     <div
//                         style={{
//                             width: `${controller.progress * 100}%`,
//                             height: "100%",
//                             background: "#ffffff",
//                             borderRadius: 2,
//                         }}
//                     />
//                 </div>
//             </div>,
//         );
//         if (vibes.progressBottomSpacing > 0)
//             kids.push(<div key="pgap" style={{ height: vibes.progressBottomSpacing }} />);
//     }

//     const hasMain = slot.left.length > 0 || slot.center.length > 0 || slot.right.length > 0;
//     if (hasMain) {
//         kids.push(
//             <ThreeColumnRow
//                 key="main"
//                 left={slot.left}
//                 center={slot.center}
//                 right={slot.right}
//                 vibes={vibes}
//                 isTitleZone={true}
//                 theme={theme}
//                 controller={controller}
//             />,
//         );
//     }

//     const insideContent =
//         kids.length > 0 ? (
//             <PanelWrapper style={panelStyle} palette={theme.palette}>
//                 <div style={{ display: "flex", flexDirection: "column" }}>{kids}</div>
//             </PanelWrapper>
//         ) : null;

//     let outsideRow = null;
//     if (!slot.outside?.isCompletelyEmpty) {
//         outsideRow = (
//             <div style={{ padding: padInsets(zone.outsidePadding) }}>
//                 <ThreeColumnRow
//                     left={slot.outside.left}
//                     center={slot.outside.center}
//                     right={slot.outside.right}
//                     vibes={vibes}
//                     isTitleZone={false}
//                     theme={theme}
//                     controller={controller}
//                 />
//             </div>
//         );
//     }

//     return (
//         <div style={{ padding: padInsets(vibes.padding), display: "flex", flexDirection: "column", gap: 0 }}>
//             {outsideRow}
//             {insideContent}
//         </div>
//     );
// }

// const DEFAULT_CONTROLLER = {
//     isLocked: false,
//     showControls: true,
//     isPlaying: true,
//     isBuffering: false,
//     isOffline: false,
//     canGoForward: true,
//     canGoBackward: true,
//     currentPosition: "12:34",
//     duration: "45:00",
//     remaining: "-32:26",
//     progress: 0.27,
//     title: "Episode 12 - The Return of the Dragon",
//     seriesTitle: "My Hero Academia",
//     episodeNumber: "12",
//     quality: "1080p",
// };

// function ThemePreview({ theme, controller = DEFAULT_CONTROLLER }) {
//     return (
//         <div
//             style={{
//                 position: "relative",
//                 width: "100%",
//                 paddingBottom: "56.25%",
//                 background: "#0f0f0f",
//                 borderRadius: 16,
//                 overflow: "hidden",
//             }}
//         >
//             {/* Simulated video frame */}
//             <div style={{ position: "absolute", inset: 0 }}>
//                 <div
//                     style={{
//                         width: "100%",
//                         height: "100%",
//                         background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
//                     }}
//                 />
//                 {/* Fake scene elements */}
//                 <div style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
//                     <div
//                         style={{
//                             position: "absolute",
//                             bottom: "20%",
//                             left: "10%",
//                             right: "10%",
//                             height: 2,
//                             background: "#fff",
//                             borderRadius: 1,
//                             opacity: 0.3,
//                         }}
//                     />
//                     <div
//                         style={{
//                             position: "absolute",
//                             top: "20%",
//                             left: "20%",
//                             width: 80,
//                             height: 80,
//                             borderRadius: "50%",
//                             background: "radial-gradient(circle, rgba(255,200,50,0.4), transparent)",
//                         }}
//                     />
//                 </div>
//             </div>

//             {/* Controls overlay */}
//             <div
//                 style={{
//                     position: "absolute",
//                     inset: 0,
//                     display: "flex",
//                     flexDirection: "column",
//                     justifyContent: "space-between",
//                 }}
//             >
//                 {/* Gradient overlays */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: 0,
//                         left: 0,
//                         right: 0,
//                         height: "40%",
//                         background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
//                         pointerEvents: "none",
//                     }}
//                 />
//                 <div
//                     style={{
//                         position: "absolute",
//                         bottom: 0,
//                         left: 0,
//                         right: 0,
//                         height: "50%",
//                         background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
//                         pointerEvents: "none",
//                     }}
//                 />

//                 <ZoneTop zone={theme.top} theme={theme} controller={controller} />
//                 <ZoneMiddle zone={theme.middle} theme={theme} controller={controller} />
//                 <ZoneBottom zone={theme.bottom} theme={theme} controller={controller} />
//             </div>
//         </div>
//     );
// }

// const DEFAULT_JSON = `{
//   "themes": [
//     {
//       "id": "sleek_dark",
//       "name": "Sleek Dark",
//       "palette": {
//         "accent": "#6750a4",
//         "glassy": "rgba(255,255,255,0.10)"
//       },
//       "styles": {
//         "panel": {
//           "radius": 18,
//           "blur": 16,
//           "color": "rgba(0,0,0,0.45)",
//           "borderColor": "rgba(255,255,255,0.12)",
//           "borderWidth": 0.8,
//           "padding": { "horizontal": 14, "vertical": 10 },
//           "shadowBlur": 24,
//           "shadowOffsetY": 6
//         },
//         "button": {
//           "size": 38,
//           "iconSize": 20,
//           "radius": 12,
//           "blur": 12,
//           "color": "rgba(255,255,255,0.10)",
//           "borderColor": "rgba(255,255,255,0.20)",
//           "borderWidth": 0.8,
//           "iconColor": "#ffffff"
//         },
//         "primaryButton": {
//           "size": 52,
//           "iconSize": 28,
//           "radius": 16,
//           "blur": 16,
//           "color": "@accent",
//           "borderColor": "rgba(255,255,255,0.25)",
//           "borderWidth": 1,
//           "iconColor": "#ffffff"
//         },
//         "chip": {
//           "radius": 8,
//           "color": "rgba(255,255,255,0.14)",
//           "borderColor": "rgba(255,255,255,0.22)",
//           "borderWidth": 0.6,
//           "textColor": "#ffffff",
//           "fontSize": 11,
//           "fontWeight": 600
//         },
//         "text": {
//           "textColor": "#ffffff",
//           "fontSize": 14,
//           "fontWeight": 700
//         }
//       },
//       "top": {
//         "padding": { "horizontal": 14, "vertical": 10 },
//         "left": ["back"],
//         "center": ["watching_label"],
//         "right": ["lock_controls", "toggle_fullscreen", "open_settings"]
//       },
//       "middle": {
//         "showWhenLocked": false,
//         "items": ["previous_episode", "seek_back", "play_pause", "seek_forward", "next_episode"]
//       },
//       "bottom": {
//         "padding": { "horizontal": 14, "vertical": 10 },
//         "showProgress": true,
//         "progressStyle": "ios",
//         "left": ["time_current", "playlist", "subtitles"],
//         "right": ["quality", "speed", "audio_track", "aspect_ratio", "time_duration"]
//       }
//     }
//   ]
// }`;

// export default function App() {
//     const [json, setJson] = useState(DEFAULT_JSON);
//     const [inputJson, setInputJson] = useState(DEFAULT_JSON);
//     const [showJson, setShowJson] = useState(false);
//     const [controllerState, setControllerState] = useState(DEFAULT_CONTROLLER);

//     const parseResult = useMemo(() => parseCollection(json), [json]);
//     const theme = parseResult.isValid ? parseResult.themes[0] : null;

//     const toggleLock = () => setControllerState(c => ({ ...c, isLocked: !c.isLocked }));
//     const togglePlay = () => setControllerState(c => ({ ...c, isPlaying: !c.isPlaying }));

//     return (
//         <div
//             style={{
//                 minHeight: "100vh",
//                 background: "#0a0a0f",
//                 color: "#e8e3f0",
//                 fontFamily: "'DM Sans', system-ui, sans-serif",
//                 display: "flex",
//                 flexDirection: "column",
//             }}
//         >
//             {/* Header */}
//             <header
//                 style={{
//                     padding: "20px 32px",
//                     borderBottom: "1px solid rgba(255,255,255,0.07)",
//                     background: "rgba(255,255,255,0.02)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     backdropFilter: "blur(20px)",
//                 }}
//             >
//                 <div>
//                     <h1
//                         style={{
//                             margin: 0,
//                             fontSize: 22,
//                             fontWeight: 800,
//                             letterSpacing: -0.5,
//                             background: "linear-gradient(135deg, #fff 60%, rgba(180,160,255,0.8))",
//                             WebkitBackgroundClip: "text",
//                             WebkitTextFillColor: "transparent",
//                         }}
//                     >
//                         AnyMex Theme Studio
//                     </h1>
//                     <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
//                         Live JSON Theme Preview
//                     </p>
//                 </div>
//                 <div style={{ display: "flex", gap: 10 }}>
//                     {[
//                         { label: controllerState.isLocked ? "🔓 Unlock" : "🔒 Lock", action: toggleLock },
//                         { label: controllerState.isPlaying ? "⏸ Pause" : "▶ Play", action: togglePlay },
//                         { label: showJson ? "👁 Hide JSON" : "📝 Edit JSON", action: () => setShowJson(v => !v) },
//                     ].map(btn => (
//                         <button
//                             key={btn.label}
//                             onClick={btn.action}
//                             style={{
//                                 padding: "8px 16px",
//                                 borderRadius: 10,
//                                 border: "1px solid rgba(255,255,255,0.15)",
//                                 background: "rgba(255,255,255,0.07)",
//                                 color: "#fff",
//                                 fontSize: 13,
//                                 cursor: "pointer",
//                                 fontWeight: 500,
//                                 transition: "background 0.2s",
//                             }}
//                         >
//                             {btn.label}
//                         </button>
//                     ))}
//                 </div>
//             </header>

//             <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
//                 {/* JSON editor */}
//                 {showJson && (
//                     <div
//                         style={{
//                             width: 420,
//                             display: "flex",
//                             flexDirection: "column",
//                             borderRight: "1px solid rgba(255,255,255,0.07)",
//                             background: "#0d0d14",
//                         }}
//                     >
//                         <div
//                             style={{
//                                 padding: "12px 16px",
//                                 borderBottom: "1px solid rgba(255,255,255,0.07)",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "space-between",
//                             }}
//                         >
//                             <span
//                                 style={{
//                                     fontSize: 12,
//                                     fontWeight: 600,
//                                     color: "rgba(255,255,255,0.5)",
//                                     letterSpacing: 0.5,
//                                     textTransform: "uppercase",
//                                 }}
//                             >
//                                 Theme JSON
//                             </span>
//                             <button
//                                 onClick={() => {
//                                     setJson(inputJson);
//                                 }}
//                                 style={{
//                                     padding: "5px 12px",
//                                     borderRadius: 7,
//                                     border: "1px solid rgba(103,80,164,0.5)",
//                                     background: "rgba(103,80,164,0.25)",
//                                     color: "#c4b5fd",
//                                     fontSize: 12,
//                                     cursor: "pointer",
//                                     fontWeight: 600,
//                                 }}
//                             >
//                                 Apply
//                             </button>
//                         </div>
//                         <textarea
//                             value={inputJson}
//                             onChange={e => setInputJson(e.target.value)}
//                             spellCheck={false}
//                             style={{
//                                 flex: 1,
//                                 background: "transparent",
//                                 color: "#b0c8ff",
//                                 border: "none",
//                                 outline: "none",
//                                 resize: "none",
//                                 padding: "16px",
//                                 fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
//                                 fontSize: 12,
//                                 lineHeight: 1.7,
//                             }}
//                         />
//                         {!parseResult.isValid && parseResult.errors.length > 0 && (
//                             <div
//                                 style={{
//                                     padding: "12px 16px",
//                                     background: "rgba(185,28,28,0.2)",
//                                     borderTop: "1px solid rgba(185,28,28,0.3)",
//                                 }}
//                             >
//                                 {parseResult.errors.map((e, i) => (
//                                     <p
//                                         key={i}
//                                         style={{
//                                             margin: "2px 0",
//                                             fontSize: 11,
//                                             color: "#fca5a5",
//                                             fontFamily: "monospace",
//                                         }}
//                                     >
//                                         {e}
//                                     </p>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Preview area */}
//                 <div
//                     style={{
//                         flex: 1,
//                         overflow: "auto",
//                         padding: 32,
//                         display: "flex",
//                         flexDirection: "column",
//                         gap: 24,
//                         alignItems: "center",
//                     }}
//                 >
//                     {parseResult.isValid &&
//                         parseResult.themes.map(t => (
//                             <div key={t.id} style={{ width: "100%", maxWidth: 860 }}>
//                                 <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
//                                     <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
//                                         {t.name}
//                                     </span>
//                                     <span
//                                         style={{
//                                             fontSize: 11,
//                                             color: "rgba(255,255,255,0.35)",
//                                             fontFamily: "monospace",
//                                         }}
//                                     >
//                                         id: {t.id}
//                                     </span>
//                                 </div>
//                                 <ThemePreview theme={t} controller={controllerState} />
//                             </div>
//                         ))}
//                     {!parseResult.isValid && (
//                         <div
//                             style={{ color: "rgba(255,100,100,0.8)", fontSize: 14, textAlign: "center", marginTop: 60 }}
//                         >
//                             <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
//                             <p>Invalid theme JSON</p>
//                             {parseResult.errors.map((e, i) => (
//                                 <p key={i} style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
//                                     {e}
//                                 </p>
//                             ))}
//                         </div>
//                     )}
//                     {parseResult.warnings.length > 0 && (
//                         <div style={{ width: "100%", maxWidth: 860 }}>
//                             {parseResult.warnings.map((w, i) => (
//                                 <p
//                                     key={i}
//                                     style={{
//                                         fontSize: 11,
//                                         color: "rgba(255,200,50,0.7)",
//                                         fontFamily: "monospace",
//                                         margin: "2px 0",
//                                     }}
//                                 >
//                                     ⚠ {w}
//                                 </p>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* State panel */}
//             <div
//                 style={{
//                     padding: "8px 32px",
//                     borderTop: "1px solid rgba(255,255,255,0.06)",
//                     background: "rgba(0,0,0,0.3)",
//                     display: "flex",
//                     gap: 24,
//                     fontSize: 11,
//                     color: "rgba(255,255,255,0.35)",
//                     fontFamily: "monospace",
//                 }}
//             >
//                 {[
//                     `isLocked: ${controllerState.isLocked}`,
//                     `isPlaying: ${controllerState.isPlaying}`,
//                     `progress: ${Math.round(controllerState.progress * 100)}%`,
//                     `pos: ${controllerState.currentPosition}`,
//                     `dur: ${controllerState.duration}`,
//                 ].map(s => (
//                     <span key={s}>{s}</span>
//                 ))}
//             </div>
//         </div>
//     );
// }
