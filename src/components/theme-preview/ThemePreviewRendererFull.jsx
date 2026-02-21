"use client";

import { useMemo } from "react";

// ─── Theme Parser ──────────────────────────────────────────────────────────────

function readString(raw) {
    if (raw == null) return null;
    const v = String(raw).trim();
    return v === "" ? null : v;
}
function readInt(raw, fallback) {
    if (typeof raw === "number") return Math.round(raw);
    if (typeof raw === "string") {
        const n = parseInt(raw, 10);
        return isNaN(n) ? fallback : n;
    }
    return fallback;
}
function readDouble(raw, fallback) {
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
        const n = parseFloat(raw);
        return isNaN(n) ? fallback : n;
    }
    return fallback;
}
function readBool(raw, fallback) {
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "number") return raw !== 0;
    if (typeof raw === "string") {
        const n = raw.trim().toLowerCase();
        if (n === "true") return true;
        if (n === "false") return false;
    }
    return fallback;
}
function asMap(raw) {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
    return {};
}
function readEdgeInsets(raw, fallback) {
    if (typeof raw === "number") return { top: raw, right: raw, bottom: raw, left: raw };
    if (!raw || typeof raw !== "object") return fallback;
    if (typeof raw.all === "number") return { top: raw.all, right: raw.all, bottom: raw.all, left: raw.all };
    const h = readDouble(raw.horizontal, 0);
    const v = readDouble(raw.vertical, 0);
    return {
        top: readDouble(raw.top, v),
        right: readDouble(raw.right, h),
        bottom: readDouble(raw.bottom, v),
        left: readDouble(raw.left, h),
    };
}
function parseFontWeight(raw, fallback) {
    if (typeof raw === "number") return raw;
    const map = {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
    };
    const s = readString(raw)?.toLowerCase();
    if (!s) return fallback;
    if (s.startsWith("w")) {
        const n = parseInt(s.slice(1));
        if (!isNaN(n)) return n;
    }
    return map[s] ?? fallback;
}

function hexToRgba(hex) {
    if (!hex) return null;
    let h = hex.trim().replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + "ff";
    else if (h.length === 4) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    else if (h.length === 6) h += "ff";
    if (h.length !== 8) return null;
    const n = parseInt(h, 16);
    if (isNaN(n)) return null;
    const r = (n >> 24) & 0xff,
        g = (n >> 16) & 0xff,
        b = (n >> 8) & 0xff,
        a = n & 0xff;
    return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
}

const DYNAMIC_COLORS = {
    primary: "#6750a4",
    onPrimary: "#ffffff",
    primaryContainer: "#eaddff",
    secondary: "#625b71",
    surface: "#1c1b1f",
    onSurface: "#e6e1e5",
    outline: "#938f99",
    error: "#b3261e",
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",
};

function resolveColor(raw, fallback, palette = {}) {
    if (!raw) return fallback;
    let token = raw.trim();
    if (token.startsWith("@")) {
        const palVal = palette[token.slice(1)];
        if (palVal && palVal !== token) token = palVal;
    }
    const rgbaMatch = token.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9]*\.?[0-9]+))?\s*\)$/);
    if (rgbaMatch) {
        const [, r, g, b, a = "1"] = rgbaMatch;
        return `rgba(${r},${g},${b},${parseFloat(a).toFixed(3)})`;
    }
    const dynMatch = token.match(/^dynamic\(([^,\)]+)(?:,\s*([0-9]*\.?[0-9]+))?\)$/);
    if (dynMatch) {
        const key = dynMatch[1].trim();
        const alpha = dynMatch[2] ? parseFloat(dynMatch[2]) : null;
        const dynColor = DYNAMIC_COLORS[key] ?? DYNAMIC_COLORS[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())];
        if (dynColor) {
            if (alpha !== null && dynColor.startsWith("#")) {
                const rgba = hexToRgba(dynColor);
                if (rgba) return rgba.replace(/,[^,]+\)$/, `,${alpha.toFixed(3)})`);
            }
            return dynColor;
        }
    }
    const hexMatch = token.match(/^hex\((#[0-9a-fA-F]+)\)$/);
    if (hexMatch) {
        const c = hexToRgba(hexMatch[1]);
        if (c) return c;
    }
    if (token.startsWith("#")) {
        const c = hexToRgba(token);
        if (c) return c;
    }
    const named = { white: "#ffffff", black: "#000000", transparent: "transparent" };
    if (named[token.toLowerCase()]) return named[token.toLowerCase()];
    return fallback;
}

// Style parsers
function parsePanelStyle(json) {
    return {
        enabled: readBool(json.enabled, true),
        showBackground: readBool(json.showBackground, true),
        showBorder: readBool(json.showBorder, true),
        radius: readDouble(json.radius, 22),
        blur: readDouble(json.blur, 18),
        color: readString(json.color),
        borderColor: readString(json.borderColor),
        borderWidth: readDouble(json.borderWidth, 0.8),
        padding: readEdgeInsets(json.padding, { top: 10, right: 12, bottom: 10, left: 12 }),
        shadowColor: readString(json.shadowColor),
        shadowBlur: readDouble(json.shadowBlur, 18),
        shadowOffsetY: readDouble(json.shadowOffsetY, 8),
    };
}
function mashPanel(base, over) {
    if (!over || Object.keys(over).length === 0) return base;
    return {
        enabled: readBool(over.enabled, base.enabled),
        showBackground: readBool(over.showBackground, base.showBackground),
        showBorder: readBool(over.showBorder, base.showBorder),
        radius: readDouble(over.radius, base.radius),
        blur: readDouble(over.blur, base.blur),
        color: readString(over.color) ?? base.color,
        borderColor: readString(over.borderColor) ?? base.borderColor,
        borderWidth: readDouble(over.borderWidth, base.borderWidth),
        padding: over.padding ? readEdgeInsets(over.padding, base.padding) : base.padding,
        shadowColor: readString(over.shadowColor) ?? base.shadowColor,
        shadowBlur: readDouble(over.shadowBlur, base.shadowBlur),
        shadowOffsetY: readDouble(over.shadowOffsetY, base.shadowOffsetY),
    };
}
function parseButtonStyle(json) {
    return {
        size: readDouble(json.size, 40),
        iconSize: readDouble(json.iconSize, 20),
        radius: readDouble(json.radius, 16),
        blur: readDouble(json.blur, 14),
        color: readString(json.color),
        borderColor: readString(json.borderColor),
        borderWidth: readDouble(json.borderWidth, 0.8),
        iconColor: readString(json.iconColor),
        disabledIconColor: readString(json.disabledIconColor),
    };
}
function mashButton(base, over) {
    if (!over || Object.keys(over).length === 0) return base;
    return {
        size: readDouble(over.size, base.size),
        iconSize: readDouble(over.iconSize, base.iconSize),
        radius: readDouble(over.radius, base.radius),
        blur: readDouble(over.blur, base.blur),
        color: readString(over.color) ?? base.color,
        borderColor: readString(over.borderColor) ?? base.borderColor,
        borderWidth: readDouble(over.borderWidth, base.borderWidth),
        iconColor: readString(over.iconColor) ?? base.iconColor,
        disabledIconColor: readString(over.disabledIconColor) ?? base.disabledIconColor,
    };
}
function parseChipStyle(json) {
    return {
        radius: readDouble(json.radius, 14),
        color: readString(json.color),
        backgroundColor: readString(json.backgroundColor),
        borderColor: readString(json.borderColor),
        borderWidth: readDouble(json.borderWidth, 0.6),
        textColor: readString(json.textColor),
        fontSize: readDouble(json.fontSize, 12),
        fontWeight: parseFontWeight(json.fontWeight, 600),
        letterSpacing: readDouble(json.letterSpacing, 0.2),
        padding: readEdgeInsets(json.padding, { top: 6, right: 10, bottom: 6, left: 10 }),
    };
}
function mashChip(base, over) {
    if (!over || Object.keys(over).length === 0) return base;
    return {
        radius: readDouble(over.radius, base.radius),
        color: readString(over.color) ?? base.color,
        backgroundColor: readString(over.backgroundColor) ?? base.backgroundColor,
        borderColor: readString(over.borderColor) ?? base.borderColor,
        borderWidth: readDouble(over.borderWidth, base.borderWidth),
        textColor: readString(over.textColor) ?? base.textColor,
        fontSize: readDouble(over.fontSize, base.fontSize),
        fontWeight: parseFontWeight(over.fontWeight, base.fontWeight),
        letterSpacing: readDouble(over.letterSpacing, base.letterSpacing),
        padding: over.padding ? readEdgeInsets(over.padding, base.padding) : base.padding,
    };
}
function parseTextStyle(json) {
    return {
        textColor: readString(json.textColor),
        backgroundColor: readString(json.backgroundColor),
        fontSize: readDouble(json.fontSize, 14),
        fontWeight: parseFontWeight(json.fontWeight, 700),
        letterSpacing: readDouble(json.letterSpacing, 0.2),
        height: readDouble(json.height, 1.2),
    };
}
function mashText(base, over) {
    if (!over || Object.keys(over).length === 0) return base;
    return {
        textColor: readString(over.textColor) ?? base.textColor,
        backgroundColor: readString(over.backgroundColor) ?? base.backgroundColor,
        fontSize: readDouble(over.fontSize, base.fontSize),
        fontWeight: parseFontWeight(over.fontWeight, base.fontWeight),
        letterSpacing: readDouble(over.letterSpacing, base.letterSpacing),
        height: readDouble(over.height, base.height),
    };
}
function parseStyles(json) {
    return {
        panel: parsePanelStyle(asMap(json.panel)),
        button: parseButtonStyle(asMap(json.button)),
        primaryButton: parseButtonStyle(asMap(json.primaryButton)),
        chip: parseChipStyle(asMap(json.chip)),
        text: parseTextStyle(asMap(json.text)),
    };
}
function parseZoneVibes(json, defaults) {
    return {
        padding: readEdgeInsets(json.padding, defaults.padding),
        showWhenLocked: readBool(json.showWhenLocked, defaults.showWhenLocked),
        showWhenUnlocked: readBool(json.showWhenUnlocked, defaults.showWhenUnlocked),
        useNormalWhenLocked: readBool(json.useNormalLayoutWhenLocked, defaults.useNormalWhenLocked),
        itemSpacing: readDouble(json.itemSpacing, 8),
        groupSpacing: readDouble(json.groupSpacing, 10),
        topRowBottomSpacing: readDouble(json.topRowBottomSpacing, 8),
        progressBottomSpacing: readDouble(json.progressBottomSpacing, 10),
        visibleWhen: readString(json.visibleWhen),
        panelOverride: asMap(json.panelStyle),
        absoluteCenter: readBool(json.absoluteCenter, false),
    };
}
function parseItems(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.flatMap(entry => {
        try {
            if (typeof entry === "string" && entry.trim()) return [{ id: entry.trim(), data: {} }];
            if (entry && typeof entry === "object") {
                const id = readString(entry.id);
                if (id) return [{ id, data: entry }];
            }
        } catch (_) {}
        return [];
    });
}
function parseThreeColumnSlot(json) {
    const slot = { left: parseItems(json.left), center: parseItems(json.center), right: parseItems(json.right) };
    slot.isCompletelyEmpty = slot.left.length === 0 && slot.center.length === 0 && slot.right.length === 0;
    return slot;
}
function parseBottomSlot(json) {
    const outsideRaw = json.outside;
    const outside =
        outsideRaw && typeof outsideRaw === "object"
            ? parseThreeColumnSlot(asMap(outsideRaw))
            : { left: [], center: [], right: [], isCompletelyEmpty: true };
    const topRowRaw = json.top;
    let topRow;
    if (topRowRaw && typeof topRowRaw === "object") {
        topRow = parseThreeColumnSlot(asMap(topRowRaw));
    } else {
        topRow = {
            left: parseItems(json.topLeft),
            center: parseItems(json.topCenter),
            right: parseItems(json.topRight),
        };
        topRow.isCompletelyEmpty = topRow.left.length === 0 && topRow.center.length === 0 && topRow.right.length === 0;
    }
    const slot = {
        outside,
        topRow,
        left: parseItems(json.left),
        center: parseItems(json.center),
        right: parseItems(json.right),
    };
    slot.isCompletelyEmpty =
        outside.isCompletelyEmpty &&
        topRow.isCompletelyEmpty &&
        slot.left.length === 0 &&
        slot.center.length === 0 &&
        slot.right.length === 0;
    return slot;
}
function parseTopZone(json) {
    const normalSrc = json.normal ? asMap(json.normal) : json;
    const lockedSrc = asMap(json.locked);
    const vibes = parseZoneVibes(json, {
        padding: { top: 8, right: 14, bottom: 8, left: 14 },
        showWhenLocked: true,
        showWhenUnlocked: true,
        useNormalWhenLocked: false,
    });
    const normal = parseThreeColumnSlot(normalSrc);
    const locked = Object.keys(lockedSrc).length > 0 ? parseThreeColumnSlot(lockedSrc) : null;
    return { normal, locked, vibes };
}
function parseMiddleZone(json) {
    const normalSrc = json.normal ? asMap(json.normal) : json;
    const lockedSrc = asMap(json.locked);
    const vibes = parseZoneVibes(json, {
        padding: { top: 0, right: 14, bottom: 0, left: 14 },
        showWhenLocked: false,
        showWhenUnlocked: true,
        useNormalWhenLocked: false,
    });
    const normalItems = parseItems(normalSrc.items);
    const lockedItems = Object.keys(lockedSrc).length > 0 ? parseItems(lockedSrc.items) : null;
    return { normalItems, lockedItems, vibes };
}
function parseBottomZone(json) {
    const normalSrc = json.normal ? asMap(json.normal) : json;
    const lockedSrc = asMap(json.locked);
    const vibes = parseZoneVibes(json, {
        padding: { top: 8, right: 14, bottom: 8, left: 14 },
        showWhenLocked: true,
        showWhenUnlocked: true,
        useNormalWhenLocked: false,
    });
    const normal = parseBottomSlot(normalSrc);
    const locked = Object.keys(lockedSrc).length > 0 ? parseBottomSlot(lockedSrc) : null;
    return {
        normal,
        locked,
        vibes,
        showProgress: readBool(json.showProgress, true),
        progressStyle: readString(json.progressStyle) || "ios",
        progressPadding: readEdgeInsets(json.progressPadding, { top: 0, right: 4, bottom: 0, left: 4 }),
        outsidePadding: readEdgeInsets(json.outsidePadding, { top: 0, right: 10, bottom: 6, left: 10 }),
    };
}
function parsePalette(raw) {
    const palette = {};
    if (raw && typeof raw === "object") {
        for (const [k, v] of Object.entries(raw)) {
            if (k === "note_by_dev") continue;
            const s = readString(v);
            if (s) palette[k] = s;
        }
    }
    return palette;
}
function parseThemeDef(json) {
    const id = readString(json.id);
    if (!id) throw new Error("Theme id is required.");
    return {
        id,
        name: readString(json.name) || id,
        palette: parsePalette(json.palette),
        styles: parseStyles(asMap(json.styles)),
        top: parseTopZone(asMap(json.top)),
        middle: parseMiddleZone(asMap(json.middle || json.center)),
        bottom: parseBottomZone(asMap(json.bottom)),
    };
}
function decodeRawThemeMaps(decoded, errors) {
    if (!decoded || typeof decoded !== "object") {
        errors.push("Root JSON must be a theme object.");
        return [];
    }
    if (Array.isArray(decoded)) return decoded.filter(t => t && typeof t === "object");
    if (Array.isArray(decoded.themes)) return decoded.themes.filter(t => typeof t === "object");
    if (decoded.themes && typeof decoded.themes === "object") return [decoded.themes];
    if (decoded.theme && typeof decoded.theme === "object") return [decoded.theme];
    if (readString(decoded.id)) return [decoded];
    errors.push("Expected a theme object or {themes:[...]}.");
    return [];
}
export function parseCollection(rawJson) {
    const input = (rawJson || "").trim();
    if (!input) return { themes: [], errors: ["JSON payload is empty."], warnings: [], isValid: false };
    const errors = [],
        warnings = [];
    let decoded;
    try {
        decoded = JSON.parse(input);
    } catch (e) {
        return { themes: [], errors: [`Invalid JSON: ${e.message}`], warnings: [], isValid: false };
    }
    const rawMaps = decodeRawThemeMaps(decoded, errors);
    const themes = [];
    rawMaps.forEach((raw, i) => {
        try {
            themes.push(parseThemeDef(raw));
        } catch (e) {
            errors.push(`Theme #${i + 1}: ${e.message}`);
        }
    });
    if (themes.length === 0 && errors.length === 0) errors.push("No themes found.");
    return { themes, errors, warnings, isValid: errors.length === 0 && themes.length > 0 };
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

const Icon = ({ id, size, isPlaying }) => {
    const s = size;
    const paths = {
        back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
        lock_controls:
            "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
        unlock_controls:
            "M12 1C9.24 1 7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2H9V6c0-1.66 1.34-3 3-3 1.31 0 2.42.85 2.83 2.02l1.89-.7C16.14 2.73 14.22 1 12 1zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
        toggle_fullscreen: "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
        open_settings:
            "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z",
        previous_episode: "M6 6h2v12H6zm3.5 6 8.5 6V6z",
        next_episode: "M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z",
        seek_back:
            "M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
        seek_forward:
            "M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z",
        play: "M8 5v14l11-7z",
        pause: "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
        playlist: "M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5L21 15.59z",
        shaders:
            "M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z",
        subtitles:
            "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h2v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H12v-2h8v2z",
        server: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
        quality:
            "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z",
        speed: "M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z",
        audio_track: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z",
        orientation:
            "M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 19.29.5 14 .05v1.5c.88.09 1.72.28 2.48.47zM6.1 6.11L1 11.21 6.1 16.3l5.09-5.09-5.09-5.1zm.01 8.48L3.53 12.1 6.11 9.5l2.57 2.6-2.57 2.49zM7.52.05v1.5c.88.09 1.72.28 2.48.47 3.27 1.55 5.61 4.72 5.97 8.48h1.5C17.44 4.84 13.29.5 7.52.05zM2.05 13.51H.55C1 19.29 5.51 23.44 11 23.95v-1.5C7.05 22.01 3.5 18.5 2.05 13.51z",
        aspect_ratio:
            "M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z",
        mega_seek: "M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z",
    };
    const iconId = id === "play_pause" ? (isPlaying ? "pause" : "play") : id;
    const d = paths[iconId] || paths.back;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d={d} />
        </svg>
    );
};

// ─── Default controller state (static for previews) ───────────────────────────

const DEFAULT_CONTROLLER = {
    isLocked: false,
    isPlaying: true,
    isBuffering: false,
    isOffline: false,
    canGoForward: true,
    canGoBackward: true,
    currentPosition: "12:34",
    duration: "45:00",
    remaining: "-32:26",
    progress: 0.27,
    title: "Episode 1 - Freedom",
    seriesTitle: "Attack on Titan Final Season",
    episodeNumber: "1",
    quality: "4K",
};

// ─── Rendering helpers ─────────────────────────────────────────────────────────

function pad(p) {
    return `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
}

function PanelWrapper({ style, palette, children }) {
    if (!style.enabled) return <>{children}</>;
    const bg = style.showBackground ? resolveColor(style.color, "rgba(0,0,0,0.45)", palette) : "transparent";
    const border = style.showBorder
        ? resolveColor(style.borderColor, "rgba(255,255,255,0.18)", palette)
        : "transparent";
    const shadow = style.shadowBlur > 0 ? resolveColor(style.shadowColor, "rgba(0,0,0,0.25)", palette) : null;
    return (
        <div
            style={{
                background: bg,
                borderRadius: style.radius,
                border: `${style.borderWidth}px solid ${border}`,
                boxShadow: shadow ? `0 ${style.shadowOffsetY}px ${style.shadowBlur}px ${shadow}` : "none",
                padding: pad(style.padding),
                backdropFilter: style.blur > 0 ? `blur(${style.blur}px)` : undefined,
                WebkitBackdropFilter: style.blur > 0 ? `blur(${style.blur}px)` : undefined,
                overflow: "hidden",
            }}
        >
            {children}
        </div>
    );
}

function BadgeEl({ text, style, palette }) {
    const bg = resolveColor(style.backgroundColor || style.color, "rgba(255,255,255,0.14)", palette);
    const border = resolveColor(style.borderColor, "rgba(255,255,255,0.28)", palette);
    const color = resolveColor(style.textColor, "#ffffff", palette);
    return (
        <div
            style={{
                padding: pad(style.padding),
                borderRadius: style.radius,
                background: bg,
                border: `${style.borderWidth}px solid ${border}`,
                display: "inline-flex",
                flexShrink: 0,
            }}
        >
            <span
                style={{
                    color,
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    letterSpacing: style.letterSpacing,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                }}
            >
                {text}
            </span>
        </div>
    );
}

function ButtonEl({ style, palette, iconId, isPlaying, disabled }) {
    const bg = resolveColor(style.color, "rgba(255,255,255,0.12)", palette);
    const border = resolveColor(style.borderColor, "rgba(255,255,255,0.25)", palette);
    const iconColor = resolveColor(
        disabled ? style.disabledIconColor : style.iconColor,
        disabled ? "rgba(255,255,255,0.4)" : "#ffffff",
        palette,
    );
    return (
        <div
            style={{
                width: style.size,
                height: style.size,
                borderRadius: style.radius,
                background: bg,
                border: `${style.borderWidth}px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                backdropFilter: style.blur > 0 ? `blur(${style.blur}px)` : undefined,
                WebkitBackdropFilter: style.blur > 0 ? `blur(${style.blur}px)` : undefined,
                opacity: disabled ? 0.5 : 1,
                overflow: "hidden",
                cursor: "pointer",
            }}
        >
            <div style={{ color: iconColor, display: "flex" }}>
                <Icon id={iconId} size={style.iconSize} isPlaying={isPlaying} />
            </div>
        </div>
    );
}

function checkCondition(cond, ctrl) {
    if (!cond) return true;
    return cond.split("||").some(op =>
        op.split("&&").every(raw => {
            let token = raw.trim();
            if (!token) return true;
            const neg = token.startsWith("!");
            if (neg) token = token.slice(1).trim();
            const val =
                {
                    locked: ctrl.isLocked,
                    unlocked: !ctrl.isLocked,
                    isPlaying: ctrl.isPlaying,
                    isOffline: ctrl.isOffline,
                    isOnline: !ctrl.isOffline,
                    canGoForward: ctrl.canGoForward,
                    canGoBackward: ctrl.canGoBackward,
                }[token] ?? false;
            return neg ? !val : val;
        }),
    );
}

function ItemEl({ item, theme, ctrl }) {
    const { id, data } = item;
    const { palette, styles } = theme;
    if (!checkCondition(readString(data.visibleWhen), ctrl)) return null;

    const chipStyle = mashChip(styles.chip, asMap(data.style));
    const textStyle = mashText(styles.text, asMap(data.style));
    const wantsBig = readBool(data.primary, id === "play_pause");
    const btnStyle = mashButton(wantsBig ? styles.primaryButton : styles.button, asMap(data.style));
    const textColor = resolveColor(textStyle.textColor, "#ffffff", palette);

    const sourceMap = {
        title: ctrl.title,
        episode_label: `Episode ${ctrl.episodeNumber}`,
        series_title: ctrl.seriesTitle,
        quality_label: ctrl.quality,
        current_time: ctrl.currentPosition,
        duration: ctrl.duration,
        remaining: ctrl.remaining,
    };

    switch (id) {
        case "gap":
            return (
                <div
                    style={{
                        width: readDouble(data.width, readDouble(data.size, 8)),
                        height: readDouble(data.height, 0),
                        flexShrink: 0,
                    }}
                />
            );
        case "spacer":
        case "flex_spacer":
            return <div style={{ flex: readInt(data.flex, 1), minWidth: 0 }} />;
        case "progress_slider":
            return (
                <div
                    style={{
                        flex: 1,
                        height: 4,
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: 2,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            width: `${ctrl.progress * 100}%`,
                            height: "100%",
                            background: "#fff",
                            borderRadius: 2,
                        }}
                    />
                </div>
            );
        case "time_current":
            return <BadgeEl text={ctrl.currentPosition} style={chipStyle} palette={palette} />;
        case "time_duration":
            return <BadgeEl text={ctrl.duration} style={chipStyle} palette={palette} />;
        case "time_remaining":
            return <BadgeEl text={ctrl.remaining} style={chipStyle} palette={palette} />;
        case "episode_badge":
            return <BadgeEl text={`Episode ${ctrl.episodeNumber}`} style={chipStyle} palette={palette} />;
        case "series_badge":
            return ctrl.seriesTitle ? <BadgeEl text={ctrl.seriesTitle} style={chipStyle} palette={palette} /> : null;
        case "quality_badge":
            return ctrl.quality ? <BadgeEl text={ctrl.quality} style={chipStyle} palette={palette} /> : null;
        case "title": {
            if (!ctrl.title) return null;
            const ml = readInt(data.maxLines, 1);
            return (
                <span
                    style={{
                        color: textColor,
                        fontSize: textStyle.fontSize,
                        fontWeight: textStyle.fontWeight,
                        letterSpacing: textStyle.letterSpacing,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: ml === 1 ? "nowrap" : "normal",
                        lineHeight: textStyle.height,
                    }}
                >
                    {ctrl.title}
                </span>
            );
        }
        case "text": {
            const src = readString(data.source);
            const val = src ? sourceMap[src] || src : readString(data.text) || "";
            if (!val) return null;
            return (
                <span
                    style={{
                        color: textColor,
                        fontSize: textStyle.fontSize,
                        fontWeight: textStyle.fontWeight,
                        letterSpacing: textStyle.letterSpacing,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {val}
                </span>
            );
        }
        case "watching_label": {
            if (!ctrl.title) return null;
            const topText = readString(data.topText) || "You're watching";
            const topColor = resolveColor(
                readString(data.topColor) || textStyle.textColor,
                "rgba(255,255,255,0.65)",
                palette,
            );
            const botColor = resolveColor(readString(data.bottomColor) || textStyle.textColor, "#ffffff", palette);
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: readDouble(data.gap, 2), minWidth: 0 }}>
                    <span
                        style={{
                            color: topColor,
                            fontSize: readDouble(data.topFontSize, 11),
                            fontWeight: parseFontWeight(data.topFontWeight, 400),
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textAlign: readString(data.textAlign) || "left",
                        }}
                    >
                        {topText}
                    </span>
                    <span
                        style={{
                            color: botColor,
                            fontSize: readDouble(data.bottomFontSize, 14),
                            fontWeight: parseFontWeight(data.bottomFontWeight, 700),
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {ctrl.title}
                    </span>
                </div>
            );
        }
        case "label_stack": {
            const lines = data.lines;
            if (!Array.isArray(lines)) return null;
            const rendered = lines.flatMap((line, i) => {
                if (!line || typeof line !== "object") return [];
                const src = readString(line.source);
                const val = src ? sourceMap[src] || "" : readString(line.text) || "";
                if (!val) return [];
                return [
                    <span
                        key={i}
                        style={{
                            color: resolveColor(readString(line.textColor) || textStyle.textColor, "#fff", palette),
                            fontSize: readDouble(line.fontSize, textStyle.fontSize),
                            fontWeight: parseFontWeight(line.fontWeight, textStyle.fontWeight),
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {val}
                    </span>,
                ];
            });
            return rendered.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>{rendered}</div>
            ) : null;
        }
        default: {
            if (id === "orientation") return null;
            if ((id === "server" || id === "quality") && ctrl.isOffline) return null;
            const disabled =
                (id === "previous_episode" && !ctrl.canGoBackward) || (id === "next_episode" && !ctrl.canGoForward);
            return (
                <ButtonEl
                    style={btnStyle}
                    palette={palette}
                    iconId={id}
                    isPlaying={ctrl.isPlaying}
                    disabled={disabled}
                />
            );
        }
    }
}

const BADGE_IDS = new Set(["episode_badge", "series_badge", "quality_badge"]);

function FlatRow({ items, spacing, theme, ctrl }) {
    const kids = items.map((item, i) => <ItemEl key={i} item={item} theme={theme} ctrl={ctrl} />).filter(Boolean);
    if (!kids.length) return null;
    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: spacing, flexShrink: 0 }}>
            {kids}
        </div>
    );
}

function TitleArea({ items, spacing, theme, ctrl }) {
    const titleItems = [],
        badgeItems = [],
        stackItems = [],
        otherItems = [];
    for (const item of items) {
        if (item.id === "title") titleItems.push(item);
        else if (BADGE_IDS.has(item.id)) badgeItems.push(item);
        else if (item.id === "label_stack" || item.id === "watching_label") stackItems.push(item);
        else otherItems.push(item);
    }
    if (!stackItems.length && !titleItems.length && !badgeItems.length) {
        return <FlatRow items={items} spacing={spacing} theme={theme} ctrl={ctrl} />;
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 }}>
            {stackItems.map((si, i) => (
                <ItemEl key={`s${i}`} item={si} theme={theme} ctrl={ctrl} />
            ))}
            {titleItems[0] && <ItemEl item={titleItems[0]} theme={theme} ctrl={ctrl} />}
            {badgeItems.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: spacing }}>
                    {badgeItems.map((bi, i) => (
                        <ItemEl key={`b${i}`} item={bi} theme={theme} ctrl={ctrl} />
                    ))}
                </div>
            )}
            {otherItems.length > 0 && <FlatRow items={otherItems} spacing={spacing} theme={theme} ctrl={ctrl} />}
        </div>
    );
}

function ThreeCol({ left, center, right, vibes, isTitleZone, theme, ctrl }) {
    const sp = vibes.itemSpacing,
        gsp = vibes.groupSpacing;
    const leftEl = left?.length ? <FlatRow items={left} spacing={sp} theme={theme} ctrl={ctrl} /> : null;
    const rightEl = right?.length ? <FlatRow items={right} spacing={sp} theme={theme} ctrl={ctrl} /> : null;
    const centerEl = center?.length ? (
        isTitleZone ? (
            <TitleArea items={center} spacing={sp} theme={theme} ctrl={ctrl} />
        ) : (
            <FlatRow items={center} spacing={sp} theme={theme} ctrl={ctrl} />
        )
    ) : null;
    if (!leftEl && !centerEl && !rightEl) return null;
    if (vibes.absoluteCenter && centerEl) {
        return (
            <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                <div style={{ display: "flex", flex: 1, justifyContent: "space-between", alignItems: "center" }}>
                    {leftEl || <div />}
                    {rightEl || <div />}
                </div>
                <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>{centerEl}</div>
            </div>
        );
    }
    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", gap: gsp }}>
            {leftEl}
            {centerEl ? <div style={{ flex: 1, minWidth: 0 }}>{centerEl}</div> : <div style={{ flex: 1 }} />}
            {rightEl}
        </div>
    );
}

// ─── Zone Components ───────────────────────────────────────────────────────────

function ZoneTop({ zone, theme, ctrl }) {
    const { vibes } = zone;
    if (!vibes.showWhenUnlocked && !ctrl.isLocked) return null;
    if (!vibes.showWhenLocked && ctrl.isLocked) return null;
    const slot = ctrl.isLocked
        ? zone.locked && !zone.locked.isCompletelyEmpty
            ? zone.locked
            : vibes.useNormalWhenLocked
              ? zone.normal
              : null
        : zone.normal;
    if (!slot || slot.isCompletelyEmpty) return null;
    return (
        <div style={{ padding: pad(vibes.padding) }}>
            <PanelWrapper style={mashPanel(theme.styles.panel, vibes.panelOverride)} palette={theme.palette}>
                <ThreeCol
                    left={slot.left}
                    center={slot.center}
                    right={slot.right}
                    vibes={vibes}
                    isTitleZone
                    theme={theme}
                    ctrl={ctrl}
                />
            </PanelWrapper>
        </div>
    );
}

function ZoneMiddle({ zone, theme, ctrl }) {
    const { vibes } = zone;
    if (!vibes.showWhenUnlocked && !ctrl.isLocked) return null;
    if (!vibes.showWhenLocked && ctrl.isLocked) return null;
    const items = ctrl.isLocked && zone.lockedItems?.length ? zone.lockedItems : zone.normalItems;
    if (!items?.length) return null;
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: pad(vibes.padding) }}>
            <PanelWrapper style={mashPanel(theme.styles.panel, vibes.panelOverride)} palette={theme.palette}>
                <FlatRow items={items} spacing={vibes.itemSpacing} theme={theme} ctrl={ctrl} />
            </PanelWrapper>
        </div>
    );
}

function ZoneBottom({ zone, theme, ctrl }) {
    const { vibes } = zone;
    if (!vibes.showWhenUnlocked && !ctrl.isLocked) return null;
    if (!vibes.showWhenLocked && ctrl.isLocked) return null;
    const slot = ctrl.isLocked && zone.locked && !zone.locked.isCompletelyEmpty ? zone.locked : zone.normal;
    if (!slot) return null;
    const allItems = [
        ...slot.left,
        ...slot.center,
        ...slot.right,
        ...(slot.topRow?.left || []),
        ...(slot.topRow?.center || []),
        ...(slot.topRow?.right || []),
    ];
    const hasProgressItem = allItems.some(i => i.id === "progress_slider");
    const kids = [];
    if (!slot.topRow?.isCompletelyEmpty) {
        kids.push(
            <ThreeCol
                key="tr"
                left={slot.topRow.left}
                center={slot.topRow.center}
                right={slot.topRow.right}
                vibes={vibes}
                isTitleZone={false}
                theme={theme}
                ctrl={ctrl}
            />,
        );
        if (vibes.topRowBottomSpacing > 0) kids.push(<div key="trg" style={{ height: vibes.topRowBottomSpacing }} />);
    }
    if (zone.showProgress && !hasProgressItem) {
        kids.push(
            <div key="prog" style={{ padding: pad(zone.progressPadding) }}>
                <div style={{ height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" }}>
                    <div
                        style={{
                            width: `${ctrl.progress * 100}%`,
                            height: "100%",
                            background: "#fff",
                            borderRadius: 2,
                        }}
                    />
                </div>
            </div>,
        );
        if (vibes.progressBottomSpacing > 0)
            kids.push(<div key="prgg" style={{ height: vibes.progressBottomSpacing }} />);
    }
    const hasMain = slot.left.length || slot.center.length || slot.right.length;
    if (hasMain)
        kids.push(
            <ThreeCol
                key="main"
                left={slot.left}
                center={slot.center}
                right={slot.right}
                vibes={vibes}
                isTitleZone
                theme={theme}
                ctrl={ctrl}
            />,
        );
    let outsideRow = null;
    if (!slot.outside?.isCompletelyEmpty) {
        outsideRow = (
            <div style={{ padding: pad(zone.outsidePadding) }}>
                <ThreeCol
                    left={slot.outside.left}
                    center={slot.outside.center}
                    right={slot.outside.right}
                    vibes={vibes}
                    isTitleZone={false}
                    theme={theme}
                    ctrl={ctrl}
                />
            </div>
        );
    }
    return (
        <div style={{ padding: pad(vibes.padding) }}>
            {outsideRow}
            {kids.length > 0 && (
                <PanelWrapper style={mashPanel(theme.styles.panel, vibes.panelOverride)} palette={theme.palette}>
                    <div style={{ display: "flex", flexDirection: "column" }}>{kids}</div>
                </PanelWrapper>
            )}
        </div>
    );
}

// ─── ThemePreviewRenderer ──────────────────────────────────────────────────────

/**
 * Drop-in theme preview component.
 *
 * @example
 * <ThemePreviewRenderer
 *   themeJson={theme.themeJson}
 *   backgroundImage="/preview-bg.jpg"
 *   className="w-full h-full"
 * />
 */
export function ThemePreviewRenderer({
    themeJson,
    backgroundImage,
    controllerState,
    className = "",
    width,
    height,
    style: extraStyle,
}) {
    const parseResult = useMemo(() => {
        try {
            return parseCollection(themeJson);
        } catch {
            return { themes: [], errors: ["Failed to parse theme JSON"], warnings: [], isValid: false };
        }
    }, [themeJson]);

    const theme = parseResult.isValid ? parseResult.themes[0] : null;
    const ctrl = { ...DEFAULT_CONTROLLER, ...controllerState };

    const containerStyle = {
        position: "relative",
        overflow: "hidden",
        width: width ?? undefined,
        height: height ?? undefined,
        ...(backgroundImage
            ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }),
        ...extraStyle,
    };

    if (!theme) {
        return (
            <div className={className} style={containerStyle}>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.5)",
                    }}
                >
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "center", padding: 16 }}>
                        {parseResult.errors[0] || "Invalid theme"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={className} style={containerStyle}>
            {/* Cinematic gradient overlays */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 35%, transparent 60%, rgba(0,0,0,0.7) 100%)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* Zones */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    zIndex: 1,
                }}
            >
                <ZoneTop zone={theme.top} theme={theme} ctrl={ctrl} />
                <ZoneMiddle zone={theme.middle} theme={theme} ctrl={ctrl} />
                <ZoneBottom zone={theme.bottom} theme={theme} ctrl={ctrl} />
            </div>
        </div>
    );
}
