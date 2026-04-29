# AnymeX Player Theme Documentation

A complete guide to creating, customizing, and sharing JSON-based player control themes for AnymeX.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Theme JSON Structure](#theme-json-structure)
4. [Theme Collection Formats](#theme-collection-formats)
5. [Color Formats](#color-formats)
6. [Global Styles](#global-styles)
   - [Panel Style](#panel-style)
   - [Button Style](#button-style)
   - [Chip/Badge Style](#chipbadge-style)
   - [Text Style](#text-style)
7. [Layout Zones](#layout-zones)
   - [Top Zone](#top-zone)
   - [Middle/Center Zone](#middlecenter-zone)
   - [Bottom Zone](#bottom-zone)
8. [Zone Vibes (Animation & Behavior)](#zone-vibes-animation--behavior)
9. [Theme Items Reference](#theme-items-reference)
   - [Buttons](#buttons)
   - [Display Elements](#display-elements)
   - [Layout Helpers](#layout-helpers)
   - [Rich Text Elements](#rich-text-elements)
10. [Conditional Visibility & Enable](#conditional-visibility--enable)
11. [Progress Bar Customization](#progress-bar-customization)
12. [Custom Icons](#custom-icons)
13. [Per-Item Style Overrides](#per-item-style-overrides)
14. [Insets & Spacing Format](#insets--spacing-format)
15. [Animation Curves Reference](#animation-curves-reference)
16. [Locked Player State](#locked-player-state)
17. [Complete Example Theme](#complete-example-theme)
18. [Tips & Best Practices](#tips--best-practices)
19. [Troubleshooting](#troubleshooting)

---

## Introduction

AnymeX supports **JSON-based player control themes** that allow you to fully customize the video player UI. Themes control:

- **Layout** — which buttons appear where (top bar, center controls, bottom bar)
- **Appearance** — colors, blur, borders, shadows, border radius
- **Animations** — slide/fade/scale transitions when controls show/hide
- **Behavior** — conditional visibility based on player state (locked, playing, offline, etc.)

Themes are imported as JSON and applied in **Settings > Player > Player Control Theme**.

---

## Quick Start

Here is the absolute minimum theme — just an `id`:

```json
{
  "id": "my_minimal_theme"
}
```

That's it! AnymeX will generate the default layout with default styling. To customize, add only what you want to change. Everything has sensible defaults.

### Adding a Name

```json
{
  "id": "my_theme",
  "name": "My Cool Theme"
}
```

### Customizing Colors with a Palette

```json
{
  "id": "neon_theme",
  "name": "Neon Glow",
  "palette": {
    "accent": "#00E5FF",
    "bg": "rgba(0, 0, 0, 0.5)",
    "border": "rgba(0, 229, 255, 0.3)"
  },
  "styles": {
    "button": {
      "color": "@bg",
      "borderColor": "@border",
      "iconColor": "@accent"
    },
    "panel": {
      "color": "@bg",
      "borderColor": "@border"
    }
  }
}
```

---

## Theme JSON Structure

A theme object has these **top-level properties**:

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `id` | `string` | **Yes** | — | Unique identifier for the theme |
| `name` | `string` | No | Same as `id` | Display name shown in theme picker |
| `palette` | `object` | No | `{}` | Named color variables (referenced as `@key`) |
| `styles` | `object` | No | Default styles | Global style definitions |
| `top` | `object` | No | Default top zone | Top control bar (back, title, settings) |
| `middle` / `center` | `object` | No | Default center zone | Center controls (play/pause, seek) |
| `bottom` | `object` | No | Default bottom zone | Bottom controls + progress bar |

### Property Alias

The center zone accepts both `"middle"` and `"center"` as keys — they are interchangeable.

---

## Theme Collection Formats

AnymeX supports importing themes in several formats:

### Array of Themes

```json
{
  "themes": [
    { "id": "theme_1", "name": "Theme One" },
    { "id": "theme_2", "name": "Theme Two" }
  ]
}
```

### Single Wrapped Theme

```json
{
  "theme": { "id": "my_theme", "name": "My Theme" }
}
```

### Bare Theme Object

```json
{ "id": "my_theme", "name": "My Theme" }
```

### Bare Array

```json
[
  { "id": "theme_1" },
  { "id": "theme_2" }
]
```

---

## Color Formats

All color properties in themes support these formats:

| Format | Example | Description |
|--------|---------|-------------|
| **Hex** | `"#FF5722"` or `"#AARRGGBB"` | Standard hex color |
| **RGBA function** | `"rgba(255, 255, 255, 0.8)"` | Red, Green, Blue, Alpha (0–1) |
| **hex() function** | `"hex(#FF5722)"` | Wrapped hex color |
| **dynamic() function** | `"dynamic(primary)"` | Uses app's Material 3 theme color |
| **dynamic() with alpha** | `"dynamic(surface, 0.5)"` | Theme color with custom opacity |
| **Palette reference** | `"@myColor"` | References a key from the `palette` object |

### Dynamic Color Keys

The `dynamic()` function accepts these Material 3 color keys:

- `primary`, `onPrimary`, `primaryContainer`
- `secondary`, `onSecondary`, `secondaryContainer`
- `tertiary`, `onTertiary`, `tertiaryContainer`
- `error`, `onError`, `errorContainer`
- `surface`, `onSurface`, `surfaceVariant`, `onSurfaceVariant`
- `background`, `onBackground`
- `outline`, `outlineVariant`
- `inverseSurface`, `inversePrimary`
- `scrim`, `shadow`

### Palette Example

```json
{
  "palette": {
    "bg": "rgba(0, 0, 0, 0.6)",
    "accent": "#FF6B35",
    "text": "rgba(255, 255, 255, 0.9)",
    "muted": "rgba(255, 255, 255, 0.4)",
    "border": "rgba(255, 107, 53, 0.3)"
  },
  "styles": {
    "button": {
      "iconColor": "@accent",
      "color": "@bg",
      "borderColor": "@border"
    },
    "chip": {
      "textColor": "@text",
      "color": "@bg",
      "borderColor": "@muted"
    }
  }
}
```

> **Note:** You can use `"note_by_dev"` as a palette key to add comments — it will be ignored by the parser.

---

## Global Styles

The `styles` object defines the default appearance for all elements. Individual items can override these.

### Panel Style

The background panel behind groups of controls. Applied to the container wrapping each zone.

```json
{
  "styles": {
    "panel": {
      "enabled": true,
      "showBackground": true,
      "showBorder": true,
      "radius": 22,
      "blur": 18,
      "color": null,
      "borderColor": null,
      "borderWidth": 0.8,
      "padding": { "horizontal": 12, "vertical": 10 },
      "shadowColor": null,
      "shadowBlur": 18,
      "shadowOffsetY": 8
    }
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | `bool` | `true` | Show the panel behind controls |
| `showBackground` | `bool` | `true` | Fill the panel background |
| `showBorder` | `bool` | `true` | Show the panel border |
| `radius` | `double` | `22` | Border radius in pixels |
| `blur` | `double` | `18` | Backdrop blur sigma (0 = no blur) |
| `color` | `string?` | `null` | Background color (default: white at 8% opacity) |
| `borderColor` | `string?` | `null` | Border color (default: white at 22% opacity) |
| `borderWidth` | `double` | `0.8` | Border width in pixels |
| `padding` | `insets` | `{h:12, v:10}` | Inner padding |
| `shadowColor` | `string?` | `null` | Shadow color (default: black at 22% opacity) |
| `shadowBlur` | `double` | `18` | Shadow blur radius |
| `shadowOffsetY` | `double` | `8` | Shadow vertical offset |

### Button Style

Controls the appearance of regular buttons (not play/pause).

```json
{
  "styles": {
    "button": {
      "size": 40,
      "iconSize": 20,
      "radius": 16,
      "blur": 14,
      "color": null,
      "borderColor": null,
      "borderWidth": 0.8,
      "iconColor": null,
      "disabledIconColor": null
    }
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | `double` | `40` | Button total size in pixels (width & height) |
| `iconSize` | `double` | `20` | Icon size in pixels |
| `radius` | `double` | `16` | Button border radius |
| `blur` | `double` | `14` | Backdrop blur sigma |
| `color` | `string?` | `null` | Button background (default: white at 12% opacity) |
| `borderColor` | `string?` | `null` | Border color (default: white at 28% opacity) |
| `borderWidth` | `double` | `0.8` | Border width |
| `iconColor` | `string?` | `null` | Icon color (default: white) |
| `disabledIconColor` | `string?` | `null` | Icon color when disabled (default: white at 55% opacity) |

### Primary Button Style

Same structure as Button Style, but used for the **play/pause button** by default. Defaults are the same as Button Style.

```json
{
  "styles": {
    "primaryButton": {
      "size": 48,
      "iconSize": 26,
      "radius": 20
    }
  }
}
```

### Chip/Badge Style

Controls the appearance of badges and time labels (episode badge, quality badge, time displays).

```json
{
  "styles": {
    "chip": {
      "radius": 14,
      "color": null,
      "backgroundColor": null,
      "borderColor": null,
      "borderWidth": 0.6,
      "textColor": null,
      "fontSize": 12,
      "fontWeight": "w600",
      "letterSpacing": 0.2,
      "padding": { "horizontal": 10, "vertical": 6 }
    }
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `radius` | `double` | `14` | Border radius |
| `color` | `string?` | `null` | Main color (fallback if `backgroundColor` is not set) |
| `backgroundColor` | `string?` | `null` | Background color (falls back to `color`) |
| `borderColor` | `string?` | `null` | Border color |
| `borderWidth` | `double` | `0.6` | Border width |
| `textColor` | `string?` | `null` | Text color (default: white) |
| `fontSize` | `double` | `12` | Font size in pixels |
| `fontWeight` | `string/int` | `"w600"` | Font weight |
| `letterSpacing` | `double` | `0.2` | Letter spacing |
| `padding` | `insets` | `{h:10, v:6}` | Inner padding |

### Text Style

Controls the appearance of text elements (title, labels).

```json
{
  "styles": {
    "text": {
      "textColor": null,
      "backgroundColor": null,
      "fontSize": 14,
      "fontWeight": "w700",
      "letterSpacing": 0.2,
      "height": 1.2
    }
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `textColor` | `string?` | `null` | Text color (default: white) |
| `backgroundColor` | `string?` | `null` | Optional background behind text |
| `fontSize` | `double` | `14` | Font size |
| `fontWeight` | `string/int` | `"w700"` | Font weight |
| `letterSpacing` | `double` | `0.2` | Letter spacing |
| `height` | `double` | `1.2` | Line height multiplier |

---

## Layout Zones

The player is divided into **three zones**: **top**, **middle**, and **bottom**. Each zone has its own layout, locked state layout, and behavior settings.

### Top Zone

The top zone contains the back button, media title, badges, and action buttons.

```json
{
  "top": {
    "normal": {
      "left": ["back"],
      "center": ["title", "episode_badge", "series_badge", "quality_badge"],
      "right": ["lock_controls", "toggle_fullscreen", "open_settings"]
    },
    "locked": {
      "right": ["unlock_controls"]
    }
  }
}
```

**Structure:**
- `normal` — Layout when player is **unlocked** (3 columns: `left`, `center`, `right`)
- `locked` — Layout when player is **locked** (optional; defaults to just the unlock button)

**Default normal layout:**

| Column | Items |
|--------|-------|
| `left` | `back` |
| `center` | `title`, `episode_badge`, `series_badge`, `quality_badge` |
| `right` | `lock_controls`, `toggle_fullscreen`, `open_settings` |

**Default locked layout:**

| Column | Items |
|--------|-------|
| `right` | `unlock_controls` |

The **center column** has special behavior for the top zone:
- `title` items are displayed as a vertically-stacked column (title text on top, badges below)
- Badges (`episode_badge`, `series_badge`, `quality_badge`) wrap automatically

### Middle/Center Zone

The center zone contains the main playback controls (play/pause, seek, skip episodes).

```json
{
  "middle": {
    "normal": {
      "items": ["previous_episode", "seek_back", "play_pause", "seek_forward", "next_episode"]
    },
    "locked": {
      "items": []
    }
  }
}
```

**Structure:**
- `normal` → `items` — Flat list of items in a horizontal row
- `locked` → `items` — Items shown when player is locked (empty by default)

**Default items:** `previous_episode`, `seek_back`, `play_pause`, `seek_forward`, `next_episode`

### Bottom Zone

The bottom zone is the most complex. It contains the progress bar, time displays, and action buttons.

```json
{
  "bottom": {
    "showProgress": true,
    "progressStyle": "ios",
    "normal": {
      "top": {
        "right": ["mega_seek"]
      },
      "left": ["time_current", "playlist", "shaders", "subtitles"],
      "right": ["server", "quality", "speed", "audio_track", "orientation", "aspect_ratio", "time_duration"]
    },
    "locked": {
      "left": ["time_current"],
      "right": ["time_duration"]
    }
  }
}
```

**Structure:**

| Key | Description |
|-----|-------------|
| `normal` | Layout when unlocked |
| `locked` | Layout when locked |
| `showProgress` | Whether to show the progress bar (`true`/`false`) |
| `progressStyle` | Progress bar style: `"ios"` or `"capsule"` |
| `progressPadding` | Padding around the progress bar |
| `outsidePadding` | Padding for content outside the panel |

**Bottom slot sections (inside `normal`/`locked`):**

| Section | Description | Default |
|---------|-------------|---------|
| `outside` | Three-column row displayed **outside** the panel | (empty) |
| `top` | Three-column row displayed **above** the main controls | `right: ["mega_seek"]` |
| `left` | Buttons on the **left** side | `time_current`, `playlist`, `shaders`, `subtitles` |
| `center` | Buttons in the **center** | (empty) |
| `right` | Buttons on the **right** side | `server`, `quality`, `speed`, etc. |

The progress bar is automatically inserted between the `top` row and the main `left`/`center`/`right` row (unless `showProgress` is `false` or a `progress_slider` item is manually placed).

**Locked defaults:** `left: ["time_current"]`, `right: ["time_duration"]` — just time labels, no action buttons.

---

## Zone Vibes (Animation & Behavior)

Each zone supports **vibe** properties that control animations, spacing, and visibility behavior. These are set directly on the zone object (mixed with the layout properties).

```json
{
  "top": {
    "alignment": "topCenter",
    "padding": { "horizontal": 14, "vertical": 8 },
    "hiddenOffset": { "x": 0, "y": -1 },
    "slideDurationMs": 320,
    "opacityDurationMs": 260,
    "slideCurve": "easeOutCubic",
    "opacityCurve": "easeOut",
    "hiddenScale": 1.0,
    "scaleDurationMs": 300,
    "scaleCurve": "easeOutBack",
    "showWhenLocked": true,
    "showWhenUnlocked": true,
    "ignorePointerWhenHidden": true,
    "itemSpacing": 8,
    "groupSpacing": 10,
    "absoluteCenter": false,
    "normal": { "left": [], "center": [], "right": [] }
  }
}
```

### Alignment Options

| Value | Description |
|-------|-------------|
| `topLeft` | Top-left corner |
| `topCenter` | Top-center (default for top zone) |
| `topRight` | Top-right corner |
| `centerLeft` | Center-left |
| `center` | Dead center (default for middle zone) |
| `centerRight` | Center-right |
| `bottomLeft` | Bottom-left corner |
| `bottomCenter` | Bottom-center (default for bottom zone) |
| `bottomRight` | Bottom-right corner |

### Zone Vibes Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `alignment` | `string` | Zone-specific | How the zone is aligned |
| `padding` | `insets` | Zone-specific | Padding around the zone |
| `hiddenOffset` | `offset` | Zone-specific | Slide direction when hiding `{x, y}` |
| `slideDurationMs` | `int` | `320` | Slide animation duration (ms) |
| `opacityDurationMs` | `int` | `260` | Fade animation duration (ms) |
| `slideCurve` | `string` | `"easeOutCubic"` | Slide animation easing |
| `opacityCurve` | `string` | `"easeOut"` | Fade animation easing |
| `hiddenScale` | `double` | `1.0` | Scale when hidden (middle zone only) |
| `scaleDurationMs` | `int` | `300` | Scale animation duration (ms) |
| `scaleCurve` | `string` | `"easeOutBack"` | Scale animation easing |
| `showWhenLocked` | `bool` | Zone-specific | Whether zone shows in locked state |
| `showWhenUnlocked` | `bool` | Zone-specific | Whether zone shows in unlocked state |
| `useNormalLayoutWhenLocked` | `bool` | `false` | Use normal layout instead of locked layout |
| `ignorePointerWhenHidden` | `bool` | `true` | Block touches when zone is hidden |
| `itemSpacing` | `double` | `8` | Spacing between items within a row |
| `groupSpacing` | `double` | `10` | Spacing between left/center/right groups |
| `topRowBottomSpacing` | `double` | `8` | Space below the top row |
| `progressBottomSpacing` | `double` | `10` | Space below the progress bar |
| `visibleWhen` | `string?` | `null` | Conditional visibility expression |
| `panelStyle` | `object` | `{}` | Override panel style for this zone |
| `absoluteCenter` | `bool` | `false` | Stack center column absolutely (overlapping) |

### Zone-Specific Defaults

| Zone | `alignment` | `padding` | `hiddenOffset` | `showWhenLocked` | `showWhenUnlocked` |
|------|------------|-----------|----------------|-------------------|---------------------|
| **Top** | `topCenter` | `{h:14, v:8}` | `{x:0, y:-1}` | `true` | `true` |
| **Middle** | `center` | `{h:14}` | `{x:0, y:0}` | `false` | `true` |
| **Bottom** | `bottomCenter` | `{h:14, v:8}` | `{x:0, y:1}` | `true` | `true` |

---

## Theme Items Reference

Items are placed in the zone layouts. They can be written as **shorthand strings** or **full objects**.

### Shorthand (uses all defaults)

```json
"play_pause"
```

### Full Object (with customization)

```json
{
  "id": "seek_back",
  "seconds": 5,
  "tooltip": "Rewind 5s",
  "icon": "replay_10_rounded",
  "visibleWhen": "!locked",
  "enabledWhen": "canGoBackward",
  "style": {
    "iconColor": "#FF5722",
    "size": 44
  }
}
```

### Buttons

| Item ID | Description | Extra Properties |
|---------|-------------|-----------------|
| `back` | Go back / exit player | — |
| `lock_controls` | Lock the player | (auto-hidden when already locked) |
| `unlock_controls` | Unlock the player | (auto-hidden when already unlocked) |
| `toggle_fullscreen` | Toggle fullscreen | — |
| `open_settings` | Open player settings panel | — |
| `play_pause` | Play / Pause toggle | `primary: true` (uses `primaryButton` style) |
| `previous_episode` | Go to previous episode | (auto-disabled at start) |
| `next_episode` | Go to next episode | (auto-disabled at end) |
| `seek_back` | Seek backward | `seconds` (default: player setting) |
| `seek_forward` | Seek forward | `seconds` (default: player setting) |
| `mega_seek` | Skip forward (long skip) | `seconds` (default: player setting) |
| `playlist` | Toggle episode playlist | — |
| `subtitles` | Toggle subtitle source pane | — |
| `source` | Toggle source selection | — |
| `server` | Toggle server selection | (hidden when offline) |
| `quality` | Open video quality picker | (hidden when offline) |
| `speed` | Open playback speed picker | — |
| `audio_track` | Toggle audio track pane | — |
| `tracks` | Toggle audio track pane (alias) | — |
| `shaders` | Open color profile settings | — |
| `orientation` | Toggle screen orientation | (mobile only, hidden on desktop) |
| `aspect_ratio` | Toggle video fit mode | Long-press resets to default |

### Display Elements

| Item ID | Description | Extra Properties |
|---------|-------------|-----------------|
| `title` | Anime/media title (marquee scrolling) | `maxLines` (default: 1) |
| `episode_badge` | Episode number badge | Uses chip style |
| `series_badge` | Series name badge | Uses chip style |
| `quality_badge` | Video quality badge (e.g., "1080p") | Uses chip style |
| `time_current` | Current playback position | Uses chip style |
| `time_duration` | Total episode duration | Uses chip style |
| `time_remaining` | Time remaining | Uses chip style |
| `progress_slider` | Inline progress bar | See [Progress Bar section](#progress-bar-customization) |

### Layout Helpers

| Item ID | Description | Extra Properties |
|---------|-------------|-----------------|
| `gap` | Fixed-size empty space | `size` (default: 8), `width`, `height` |
| `spacer` | Space that can become flexible | `size` (default: 8), `width`, `height`, `flex` |
| `flex_spacer` | Flexible expanding space | `flex` (default: 1) |

### Rich Text Elements

#### `watching_label`

A two-line "You're watching" label with the title.

```json
{
  "id": "watching_label",
  "topText": "Now Playing",
  "topFontSize": 11,
  "topFontWeight": "w400",
  "topColor": "rgba(255, 255, 255, 0.65)",
  "bottomFontSize": 14,
  "bottomFontWeight": "w700",
  "bottomColor": "#FFFFFF",
  "gap": 2,
  "textAlign": "left"
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `topText` | `string` | `"You're watching"` | Top label text |
| `topFontSize` | `double` | `11` | Top text font size |
| `topFontWeight` | `string/int` | `"w400"` | Top text font weight |
| `topColor` | `string?` | `null` | Top text color |
| `bottomFontSize` | `double` | `14` | Bottom text (title) font size |
| `bottomFontWeight` | `string/int` | `"w700"` | Bottom text font weight |
| `bottomColor` | `string?` | `null` | Bottom text (title) color |
| `gap` | `double` | `2` | Space between lines |
| `textAlign` | `string` | `"left"` | Text alignment |

#### `label_stack`

A vertical stack of text lines, each with independent styling.

```json
{
  "id": "label_stack",
  "textAlign": "left",
  "lines": [
    { "text": "Episode 5", "fontSize": 12, "fontWeight": "w500", "color": "#888" },
    { "source": "title", "fontSize": 16, "fontWeight": "w700", "color": "#FFF" },
    { "source": "quality", "fontSize": 11, "gap": 6 }
  ]
}
```

Each line in `lines` supports:
- `text` — Static text to display
- `source` — Dynamic value: `"title"`, `"episode"`, `"series"`, `"quality"`
- `fontSize`, `fontWeight`, `color` — Text styling
- `textAlign` — Per-line alignment override
- `maxLines` — Max lines (default: 1)
- `gap` — Space below this line (default: 2)

#### `text`

A simple text element with optional dynamic source.

```json
{
  "id": "text",
  "text": "Custom Label",
  "source": "title",
  "maxLines": 1,
  "textAlign": "left",
  "style": { "textColor": "#FFF", "fontSize": 14 }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Static text to display |
| `source` | `string` | Dynamic source (`"title"`, `"episode"`, `"series"`, `"quality"`) |
| `maxLines` | `int` | Maximum lines (default: 1) |
| `textAlign` | `string` | `"left"`, `"center"`, `"right"` |

---

## Conditional Visibility & Enable

Items and zones support conditional expressions using `visibleWhen` and `enabledWhen`.

### Syntax

```
expression := or_expr
or_expr    := and_expr ('||' and_expr)*
and_expr   := token ('&&' token)*
token      := '!'? identifier
```

### Available Tokens

| Token | Description |
|-------|-------------|
| `locked` | Player is in locked state |
| `unlocked` | Player is not locked |
| `showControls` | Controls are visible |
| `controlsHidden` | Controls are hidden |
| `isPlaying` | Media is currently playing |
| `isBuffering` | Media is buffering |
| `isOffline` | Playing downloaded/offline content |
| `isOnline` | Playing from online source |
| `canGoForward` | Next episode is available |
| `canGoBackward` | Previous episode is available |
| `isDesktop` | Running on desktop/tablet |
| `isMobile` | Running on phone |

### Examples

```json
// Show only when not locked and online
"visibleWhen": "!locked && isOnline"

// Show only when playing
"visibleWhen": "isPlaying"

// Show when buffering or controls are visible
"visibleWhen": "isBuffering || showControls"

// Enable only when previous episode exists
"enabledWhen": "canGoBackward"

// Mobile-only button
"visibleWhen": "isMobile"
```

### Per-Zone Visibility

Zones also support `visibleWhen`:

```json
{
  "middle": {
    "visibleWhen": "isPlaying || isBuffering",
    "normal": {
      "items": ["play_pause"]
    }
  }
}
```

---

## Progress Bar Customization

### Via Bottom Zone Properties

```json
{
  "bottom": {
    "showProgress": true,
    "progressStyle": "ios",
    "progressPadding": { "horizontal": 4 },
    "progressActiveTrackColor": "#FF6B35",
    "progressInactiveTrackColor": "rgba(255, 255, 255, 0.2)",
    "progressSecondaryActiveTrackColor": "rgba(255, 107, 53, 0.4)",
    "progressThumbColor": "#FFFFFF",
    "progressOverlayColor": "rgba(255, 107, 53, 0.3)",
    "progressSegmentColor": null,
    "progressRecapSegmentColor": null
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `showProgress` | `bool` | Show the progress bar |
| `progressStyle` | `string` | `"ios"` (iOS-style) or `"capsule"` (pill-shaped) |
| `progressPadding` | `insets` | Padding around the progress bar |
| `progressActiveTrackColor` | `string?` | Color of the played portion |
| `progressInactiveTrackColor` | `string?` | Color of the unplayed portion |
| `progressSecondaryActiveTrackColor` | `string?` | Color of the buffered portion |
| `progressThumbColor` | `string?` | Color of the draggable thumb |
| `progressOverlayColor` | `string?` | Color of the touch overlay |
| `progressSegmentColor` | `string?` | Color of segment markers |
| `progressRecapSegmentColor` | `string?` | Color of recap/intro segments |

### Via Inline `progress_slider` Item

Place the progress bar anywhere using a `progress_slider` item:

```json
{
  "id": "progress_slider",
  "progressStyle": "capsule",
  "activeTrackColor": "#FF6B35",
  "inactiveTrackColor": "rgba(255, 255, 255, 0.2)",
  "thumbColor": "#FFF"
}
```

When a `progress_slider` item is manually placed, the auto-generated progress bar is not added (unless no `progress_slider` is found in any of the bottom zone rows).

---

## Custom Icons

Override the default icon for any button using the `icon` property:

```json
{
  "id": "seek_back",
  "icon": "replay_30_rounded",
  "seconds": 30
}
```

### Supported Icon Names

| Name | Description |
|------|-------------|
| `arrow_back_rounded` | Back arrow |
| `lock_rounded` | Lock |
| `lock_open_rounded` | Unlock |
| `fullscreen_rounded` | Fullscreen |
| `fullscreen_exit_rounded` | Exit fullscreen |
| `settings_rounded` | Settings gear |
| `skip_previous_rounded` | Skip to previous |
| `skip_next_rounded` | Skip to next |
| `replay_10_rounded` | Replay 10 seconds |
| `forward_10_rounded` | Forward 10 seconds |
| `replay_30_rounded` | Replay 30 seconds |
| `forward_30_rounded` | Forward 30 seconds |
| `play_arrow_rounded` | Play |
| `pause_rounded` | Pause |
| `fast_forward_rounded` | Fast forward / mega seek |
| `screen_rotation_rounded` | Screen rotation |
| `more_vert_rounded` | More options (vertical dots) |
| `playlist_play_rounded` | Playlist |
| `tune_rounded` | Tune / adjust |
| `subtitles_rounded` | Subtitles |
| `cloud_rounded` | Cloud / server |
| `high_quality_rounded` | High quality |
| `speed_rounded` | Speed |
| `music_note_rounded` | Music note / audio |
| `fit_screen` | Fit to screen |

---

## Per-Item Style Overrides

Any item can override global styles using the `style` property. The object is merged with the relevant global style.

### Button Items → Override `button` or `primaryButton` Style

```json
{
  "id": "play_pause",
  "primary": true,
  "style": {
    "size": 56,
    "iconSize": 30,
    "radius": 28,
    "color": "rgba(255, 107, 53, 0.3)",
    "borderColor": "rgba(255, 107, 53, 0.5)",
    "iconColor": "#FF6B35"
  }
}
```

Set `"primary": true` (or leave it off for `play_pause`) to use the `primaryButton` style as the base. Set `"primary": false` to use the `button` style as the base.

### Badge/Chip Items → Override `chip` Style

```json
{
  "id": "episode_badge",
  "style": {
    "radius": 8,
    "color": "rgba(255, 107, 53, 0.2)",
    "textColor": "#FF6B35",
    "fontSize": 11,
    "fontWeight": "w500"
  }
}
```

### Text Items → Override `text` Style

```json
{
  "id": "title",
  "style": {
    "textColor": "#FFFFFF",
    "fontSize": 16,
    "fontWeight": "w600",
    "letterSpacing": 0.1
  }
}
```

---

## Insets & Spacing Format

Padding, insets, and offsets use a flexible object format:

### EdgeInsets (Padding)

```json
// All sides equal
{ "all": 8 }

// Horizontal + vertical shorthand
{ "horizontal": 12, "vertical": 10 }

// Full control
{ "left": 4, "top": 8, "right": 4, "bottom": 8 }
```

Short aliases: `h` for `horizontal`, `v` for `vertical`:

```json
{ "h": 14, "v": 8 }
```

### Offset

```json
// Object format
{ "x": 0, "y": -1 }

// Array format
[0, -1]
```

---

## Animation Curves Reference

| Curve Name | Description |
|------------|-------------|
| `linear` | Constant speed, no easing |
| `easeIn` | Starts slow, accelerates |
| `easeOut` | Starts fast, decelerates |
| `easeInOut` | Slow start and end, fast middle |
| `easeOutCubic` | Smooth deceleration (default for slide) |
| `easeOutBack` | Overshoots slightly then settles (default for scale) |

---

## Locked Player State

When the player is **locked**:
- Touch gestures on the video area are disabled (prevent accidental taps)
- Each zone can define a separate `locked` layout
- If no `locked` layout is provided:
  - Top zone shows only the unlock button
  - Middle zone is hidden by default
  - Bottom zone shows only time labels

### Example: Minimal Locked Layout

```json
{
  "top": {
    "locked": {
      "left": ["back"],
      "right": ["unlock_controls"]
    }
  },
  "bottom": {
    "locked": {
      "left": ["time_current"],
      "center": ["progress_slider"],
      "right": ["time_duration"]
    }
  }
}
```

### Show Normal Layout When Locked

```json
{
  "top": {
    "useNormalLayoutWhenLocked": true
  }
}
```

---

## Complete Example Theme

Here is a full-featured theme demonstrating many options:

```json
{
  "id": "example_neon_theme",
  "name": "Neon Glow",

  "palette": {
    "bg": "rgba(10, 10, 30, 0.7)",
    "accent": "#00E5FF",
    "accentDim": "rgba(0, 229, 255, 0.3)",
    "text": "#FFFFFF",
    "textMuted": "rgba(255, 255, 255, 0.6)",
    "success": "#00E676",
    "warn": "#FF9100"
  },

  "styles": {
    "panel": {
      "color": "@bg",
      "borderColor": "@accentDim",
      "borderWidth": 1,
      "blur": 24,
      "radius": 16,
      "shadowColor": "rgba(0, 229, 255, 0.15)",
      "shadowBlur": 24,
      "shadowOffsetY": 4
    },
    "button": {
      "size": 38,
      "iconSize": 18,
      "radius": 12,
      "color": "@bg",
      "borderColor": "@accentDim",
      "borderWidth": 0.6,
      "iconColor": "@text",
      "blur": 12
    },
    "primaryButton": {
      "size": 52,
      "iconSize": 28,
      "radius": 26,
      "color": "rgba(0, 229, 255, 0.2)",
      "borderColor": "@accent",
      "borderWidth": 1.2,
      "iconColor": "@accent",
      "blur": 16
    },
    "chip": {
      "radius": 10,
      "color": "rgba(0, 229, 255, 0.15)",
      "textColor": "@accent",
      "borderColor": "rgba(0, 229, 255, 0.25)",
      "borderWidth": 0.6,
      "fontSize": 11,
      "fontWeight": "w600"
    },
    "text": {
      "textColor": "@text",
      "fontSize": 14,
      "fontWeight": "w700",
      "letterSpacing": 0.1
    }
  },

  "top": {
    "alignment": "topCenter",
    "padding": { "horizontal": 12, "vertical": 6 },
    "itemSpacing": 6,
    "slideDurationMs": 280,
    "showWhenLocked": true,
    "normal": {
      "left": ["back"],
      "center": [
        "title",
        "episode_badge",
        "series_badge"
      ],
      "right": [
        "lock_controls",
        "toggle_fullscreen",
        "open_settings"
      ]
    },
    "locked": {
      "right": ["unlock_controls"]
    }
  },

  "middle": {
    "itemSpacing": 10,
    "hiddenScale": 0.8,
    "scaleDurationMs": 250,
    "normal": {
      "items": [
        {
          "id": "previous_episode",
          "tooltip": "Previous",
          "visibleWhen": "canGoBackward"
        },
        {
          "id": "seek_back",
          "seconds": 10,
          "icon": "replay_10_rounded",
          "tooltip": "-10s"
        },
        {
          "id": "play_pause",
          "primary": true,
          "tooltip": "Play / Pause"
        },
        {
          "id": "seek_forward",
          "seconds": 10,
          "icon": "forward_10_rounded",
          "tooltip": "+10s"
        },
        {
          "id": "next_episode",
          "tooltip": "Next",
          "visibleWhen": "canGoForward"
        }
      ]
    }
  },

  "bottom": {
    "showProgress": true,
    "progressStyle": "capsule",
    "progressActiveTrackColor": "@accent",
    "progressInactiveTrackColor": "rgba(255, 255, 255, 0.15)",
    "progressThumbColor": "@accent",
    "progressOverlayColor": "rgba(0, 229, 255, 0.3)",
    "progressPadding": { "horizontal": 8 },
    "normal": {
      "top": {
        "right": [
          {
            "id": "mega_seek",
            "seconds": 30,
            "tooltip": "Skip 30s"
          }
        ]
      },
      "left": [
        "time_current",
        {
          "id": "playlist",
          "tooltip": "Episodes"
        },
        {
          "id": "subtitles",
          "tooltip": "Subtitles",
          "visibleWhen": "!isOffline"
        }
      ],
      "right": [
        {
          "id": "quality",
          "tooltip": "Quality",
          "visibleWhen": "!isOffline"
        },
        {
          "id": "speed",
          "tooltip": "Speed"
        },
        {
          "id": "audio_track",
          "tooltip": "Audio"
        },
        {
          "id": "orientation",
          "tooltip": "Rotate",
          "visibleWhen": "isMobile"
        },
        {
          "id": "aspect_ratio",
          "tooltip": "Aspect Ratio"
        },
        "time_duration"
      ]
    },
    "locked": {
      "left": ["time_current"],
      "right": ["time_duration"]
    }
  }
}
```

---

## Tips & Best Practices

### 1. Start Minimal

Don't write everything from scratch. Start with just an `id` and customize incrementally. All defaults are well-designed.

### 2. Use the Palette

Define your colors in `palette` and reference them with `@keyName`. This makes it easy to change the color scheme without editing every property.

```json
{
  "palette": {
    "accent": "#FF6B35",
    "bg": "rgba(0, 0, 0, 0.5)"
  }
}
```

### 3. Test on the App

Import your JSON in AnymeX via **Settings > Player > Player Control Theme** to preview it live. The parser will report any errors or warnings.

### 4. Use `dynamic()` for Theme Compatibility

Colors using `dynamic()` automatically adapt to the user's app theme (light/dark). This ensures your theme looks good regardless of the user's color settings.

```json
{
  "styles": {
    "button": {
      "iconColor": "dynamic(onSurface)",
      "color": "dynamic(surfaceVariant, 0.5)"
    }
  }
}
```

### 5. Respect Mobile vs Desktop

Some items are platform-specific:
- `orientation` is automatically hidden on desktop
- `server` and `quality` are hidden when offline

Use `visibleWhen` for additional platform control:
```json
{ "id": "orientation", "visibleWhen": "isMobile" }
```

### 6. Keep the Locked State Simple

The locked state should show minimal controls. The default (just unlock button) is recommended. If you add more, keep it unobtrusive.

### 7. Use Tooltips

Always add tooltips to buttons for better UX, especially when using custom icons.

### 8. Theme ID Rules

- Must be **unique** across all themes
- Use lowercase, underscores, or hyphens
- Examples: `"my_neon_theme"`, `"minimal-dark"`, `"cinema_v2"`

---

## Troubleshooting

### "Theme id is required"
The theme object must have an `"id"` field. Check your JSON structure.

### "Invalid JSON syntax"
Your JSON has a syntax error. Use a JSON validator (e.g., jsonlint.com) to find the issue.

### "Theme uses unsupported item id"
An item ID in your theme is not recognized. Check the [Theme Items Reference](#theme-items-reference) for valid IDs. The theme will still load, but that item will be ignored.

### "No themes found in payload"
The JSON structure doesn't contain any theme objects. Make sure your themes are wrapped correctly (see [Theme Collection Formats](#theme-collection-formats)).

### Buttons Don't Appear
- Check if the item ID is correct
- Check if `visibleWhen` is hiding the item
- Some buttons auto-hide (e.g., `server` hides when offline, `orientation` hides on desktop)

### Progress Bar Not Showing
- Check `showProgress` is `true` (default)
- If you have a `progress_slider` item in any bottom row, it replaces the auto-generated one
- Check if the bottom zone is visible (`showWhenUnlocked` / `showWhenLocked`)

### Colors Not Working
- Ensure the color format is correct (see [Color Formats](#color-formats))
- Check that palette references use `@` prefix correctly
- `dynamic()` colors depend on the user's app theme — test with different themes

---

*This documentation covers the AnymeX player control theme JSON format. For the latest updates, refer to the [AnymeX GitHub repository](https://github.com/RyanYuuki/AnymeX).*
