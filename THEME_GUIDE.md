# AnymeX Theme Creator's Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Theme Structure](#theme-structure)
4. [Available Items](#available-items)
5. [Button Actions](#button-actions)
6. [Style System](#style-system)
7. [Zones Configuration](#zones-configuration)
8. [Color System](#color-system)
9. [Visibility Conditions](#visibility-conditions)
10. [Animation & Transitions](#animation--transitions)
11. [Advanced Features](#advanced-features)
12. [Examples](#examples)
13. [Best Practices](#best-practices)

---

## Introduction

An AnymeX theme is a JSON configuration file that defines the complete visual appearance and behavior of the video player controls. You can customize:

- **Layout**: Where buttons and labels appear (top, middle, bottom zones)
- **Style**: Colors, sizes, borders, blur effects, shadows
- **Behavior**: When elements show/hide, animations, interactivity
- **Responsiveness**: Different layouts for locked/unlocked states, mobile/desktop

---

## Getting Started

### Creating Your First Theme

1. Create a new JSON file (e.g., `my-theme.json`)
2. Add the required properties: `id`, `name`, `top`, `middle`, `bottom`
3. Optionally add `palette` for custom colors
4. Optionally add `styles` for custom styling
5. Upload through the Creator Dashboard
6. Wait for admin approval

Only `id`, `name`, `top`, `middle`, and `bottom` are required. `palette` and `styles` are optional.

### Minimal Theme Example

```json
{
  "id": "my-first-theme",
  "name": "My First Theme",
  "top": {
    "alignment": "topCenter",
    "padding": { "horizontal": 16, "vertical": 10 },
    "normal": {
      "left": [{ "id": "back" }],
      "center": [{ "id": "title" }],
      "right": []
    }
  },
  "middle": {
    "alignment": "center",
    "padding": { "horizontal": 20 },
    "items": [
      { "id": "play_pause", "primary": true }
    ]
  },
  "bottom": {
    "alignment": "bottomCenter",
    "padding": { "horizontal": 16, "vertical": 10 },
    "showProgress": true,
    "normal": {
      "left": [],
      "center": [],
      "right": []
    }
  }
}
```

---

## Theme Structure

### Root Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ Yes | Unique identifier for the theme (lowercase, hyphens recommended) |
| `name` | string | ✅ Yes | Display name shown in the theme list |
| `palette` | object | No | Color palette definitions |
| `styles` | object | No | Style definitions for UI elements |
| `top` | object | ✅ Yes | Top zone configuration |
| `middle` | object | ✅ Yes | Middle zone configuration |
| `bottom` | object | ✅ Yes | Bottom zone configuration |

### Complete Theme Structure

```json
{
  "id": "theme-id",
  "name": "Theme Name",
  "palette": {
    "colorKey": "colorValue",
    "note_by_dev": "Optional note"
  },
  "styles": {
    "panel": { ... },
    "button": { ... },
    "primaryButton": { ... },
    "chip": { ... },
    "text": { ... }
  },
  "top": {
    "alignment": "topCenter",
    "padding": { "horizontal": 16, "vertical": 10 },
    "itemSpacing": 8,
    "groupSpacing": 12,
    "absoluteCenter": true,
    "visibleWhen": "showControls",
    "showWhenLocked": true,
    "showWhenUnlocked": true,
    "useNormalLayoutWhenLocked": false,
    "ignorePointerWhenHidden": true,
    "normal": {
      "left": [ ... ],
      "center": [ ... ],
      "right": [ ... ]
    },
    "locked": {
      "left": [ ... ],
      "center": [ ... ],
      "right": [ ... ]
    }
  },
  "middle": {
    "alignment": "center",
    "padding": { "horizontal": 20 },
    "itemSpacing": 12,
    "showWhenLocked": false,
    "showWhenUnlocked": true,
    "visibleWhen": "showControls&&!locked",
    "ignorePointerWhenHidden": true,
    "items": [ ... ],
    "locked": {
      "items": [ ... ]
    }
  },
  "bottom": {
    "alignment": "bottomCenter",
    "padding": { "horizontal": 16, "vertical": 10 },
    "itemSpacing": 8,
    "groupSpacing": 10,
    "topRowBottomSpacing": 6,
    "progressBottomSpacing": 8,
    "showProgress": true,
    "progressStyle": "capsule",
    "progressPadding": { "horizontal": 4 },
    "visibleWhen": "showControls",
    "showWhenLocked": true,
    "showWhenUnlocked": true,
    "useNormalLayoutWhenLocked": false,
    "ignorePointerWhenHidden": true,
    "normal": {
      "top": {
        "left": [ ... ],
        "center": [ ... ],
        "right": [ ... ]
      },
      "left": [ ... ],
      "center": [ ... ],
      "right": [ ... ]
    },
    "locked": { ... }
  }
}
```

---

## Available Items

### Layout Items

#### `gap`
Creates a fixed-size spacing gap.

```json
{ "id": "gap", "size": 8, "width": 16, "height": 0 }
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | number | 8 | Base size for width/height |
| `width` | number | size | Custom width |
| `height` | number | 0 | Custom height |

#### `spacer`
Creates a flexible spacer. Can be fixed or expanding.

```json
{ "id": "spacer", "flex": 0, "size": 8, "width": 16, "height": 0 }
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `flex` | number | 0 | If > 0, becomes expanding spacer |
| `size` | number | 8 | Fixed size when flex is 0 |
| `width` | number | size | Custom width |
| `height` | number | 0 | Custom height |

#### `flex_spacer`
Creates an expanding flexible spacer.

```json
{ "id": "flex_spacer", "flex": 1 }
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `flex` | number | 1 | Flex factor for expansion |

### Progress Items

#### `progress_slider`
Video seek bar.

```json
{ "id": "progress_slider", "progressStyle": "capsule" }
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `progressStyle` | string | "capsule" | Style: "ios" or "capsule" |

#### `time_current`
Current playback position (e.g., "05:23").

```json
{ "id": "time_current" }
```

Style uses the `chip` style. Can customize with `style` property.

#### `time_duration`
Total video duration (e.g., "24:00").

```json
{ "id": "time_duration" }
```

#### `time_remaining`
Time remaining (e.g., "-18:37").

```json
{ "id": "time_remaining" }
```

### Badge Items

#### `episode_badge`
Episode number badge (e.g., "Episode 12").

```json
{ "id": "episode_badge" }
```

#### `series_badge`
Series name badge.

```json
{ "id": "series_badge" }
```

#### `quality_badge`
Video quality badge (e.g., "1080p").

```json
{ "id": "quality_badge" }
```

### Text Items

#### `title`
Anime/video title.

```json
{ "id": "title", "maxLines": 1, "textAlign": "left" }
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxLines` | number | 1 | Maximum lines before truncation |
| `textAlign` | string | "left" | Text alignment: left, center, right, justify |
| `style` | object | {} | Override text style |

#### `label_stack`
Stack multiple text lines vertically.

```json
{
  "id": "label_stack",
  "textAlign": "left",
  "lines": [
    { "source": "title", "textAlign": "left", "maxLines": 1 },
    { "text": "Custom text", "fontSize": 12 },
    { "source": "episode_label", "gap": 4 }
  ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `textAlign` | string | Overall text alignment |
| `lines` | array | Array of line objects |
| `lines[].source` | string | Text source (see Text Sources) |
| `lines[].text` | string | Static text (used if source not provided) |
| `lines[].textAlign` | string | Line-specific alignment |
| `lines[].maxLines` | number | Max lines for this text |
| `lines[].fontSize` | number | Font size override |
| `lines[].gap` | number | Spacing to next line |

#### `watching_label`
"You're watching" label with title below.

```json
{
  "id": "watching_label",
  "topText": "You're watching",
  "topFontSize": 11,
  "topFontWeight": "w400",
  "topColor": "@onSurface(0.65)",
  "bottomFontSize": 14,
  "bottomFontWeight": "w700",
  "bottomColor": "@onSurface",
  "gap": 2,
  "textAlign": "left"
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `topText` | string | "You're watching" | Top label text |
| `topFontSize` | number | 11 | Font size for top label |
| `topFontWeight` | string | "w400" | Font weight for top label |
| `topColor` | string | - | Color for top label |
| `bottomFontSize` | number | 14 | Font size for title |
| `bottomFontWeight` | string | "w700" | Font weight for title |
| `bottomColor` | string | - | Color for title |
| `gap` | number | 2 | Spacing between labels |
| `textAlign` | string | - | Text alignment |

#### `text`
Custom text with dynamic source.

```json
{
  "id": "text",
  "source": "current_time",
  "text": "Fallback text",
  "maxLines": 1,
  "textAlign": "center"
}
```

| Property | Type | Description |
|----------|------|-------------|
| `source` | string | Dynamic text source (see Text Sources below) |
| `text` | string | Fallback text if source not provided |
| `maxLines` | number | Maximum lines |
| `textAlign` | string | Text alignment |

### Text Sources for `text` and `label_stack`

| Source | Description |
|--------|-------------|
| `title` | Anime/video title |
| `episode_label` | Episode number (e.g., "Episode 12") |
| `series_title` | Series name |
| `quality_label` | Video quality (e.g., "1080p") |
| `current_time` | Current playback position |
| `duration` | Total duration |
| `remaining` | Time remaining (negative, e.g., "-18:37") |
| `skip_duration` | Skip duration (e.g., "+85") |
| `seek_duration` | Seek duration in seconds (e.g., "10s") |

Any other string value will be used as-is (custom text).

### Button Items

All other IDs are treated as buttons. Buttons trigger actions when tapped.

```json
{
  "id": "play_pause",
  "primary": true,
  "icon": "play_arrow_rounded",
  "tooltip": "Play / Pause",
  "enabledWhen": "!locked",
  "style": {
    "size": 48,
    "iconSize": 24
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Button action ID (see Button Actions) |
| `primary` | boolean | Use primary button style (larger, more prominent) |
| `icon` | string | Custom icon name (see Icon Map) |
| `tooltip` | string | Tooltip text |
| `enabledWhen` | string | Condition for when button is enabled |
| `style` | object | Override button style |

---

## Button Actions

### Playback Controls

| ID | Description | Parameters |
|----|-------------|------------|
| `play_pause` | Toggle play/pause | None |
| `seek_back` | Seek backward | `seconds`: Number of seconds (default: from settings) |
| `seek_forward` | Seek forward | `seconds`: Number of seconds (default: from settings) |
| `mega_seek` | Skip to position | `seconds`: Number of seconds to skip |
| `previous_episode` | Previous episode | None |
| `next_episode` | Next episode | None |

### Controls

| ID | Description |
|----|-------------|
| `lock_controls` | Lock all controls |
| `unlock_controls` | Unlock controls |
| `toggle_fullscreen` | Toggle fullscreen |
| `orientation` | Toggle orientation (mobile only) |
| `aspect_ratio` | Toggle video aspect ratio/fit |

### Settings & Menus

| ID | Description |
|----|-------------|
| `open_settings` | Open player settings |
| `shaders` | Open color profiles/shaders |
| `subtitles` | Open subtitle selection |
| `server` | Open video server selection (online only) |
| `quality` | Open video quality selection (online only) |
| `speed` | Open playback speed |
| `audio_track` | Open audio track selection |
| `playlist` | Toggle episode playlist |

### Navigation

| ID | Description |
|----|-------------|
| `back` | Navigate back |

### Example with Parameters

```json
{
  "items": [
    { "id": "seek_back", "seconds": 5 },
    { "id": "play_pause", "primary": true },
    { "id": "seek_forward", "seconds": 5 },
    { "id": "mega_seek", "seconds": 85 }
  ]
}
```

---

## Style System

### Panel Style

Applied to zone backgrounds/containers.

```json
{
  "panel": {
    "enabled": true,
    "showBackground": true,
    "showBorder": true,
    "radius": 22,
    "blur": 18,
    "color": "@surface",
    "borderColor": "@onSurface",
    "borderWidth": 0.8,
    "padding": { "left": 12, "right": 12, "top": 10, "bottom": 10 },
    "shadowColor": "black",
    "shadowBlur": 18,
    "shadowOffsetY": 8
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | true | Enable/disable panel styling |
| `showBackground` | boolean | true | Show background color |
| `showBorder` | boolean | true | Show border |
| `radius` | number | 22 | Corner radius |
| `blur` | number | 18 | Blur intensity (0 = no blur) |
| `color` | string | - | Background color |
| `borderColor` | string | - | Border color |
| `borderWidth` | number | 0.8 | Border thickness |
| `padding` | object | - | Padding: all, horizontal, vertical, left, right, top, bottom |
| `shadowColor` | string | - | Shadow color |
| `shadowBlur` | number | 18 | Shadow blur radius |
| `shadowOffsetY` | number | 8 | Shadow vertical offset |

### Button Style

Applied to regular buttons.

```json
{
  "button": {
    "size": 40,
    "iconSize": 20,
    "radius": 16,
    "blur": 14,
    "color": "@surface",
    "borderColor": "@onSurface",
    "borderWidth": 0.8,
    "iconColor": "@onSurface",
    "disabledIconColor": "@onSurface(0.55)"
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | number | 40 | Button size (width and height) |
| `iconSize` | number | 20 | Icon size |
| `radius` | number | 16 | Corner radius |
| `blur` | number | 14 | Blur intensity |
| `color` | string | - | Button background color |
| `borderColor` | string | - | Border color |
| `borderWidth` | number | 0.8 | Border thickness |
| `iconColor` | string | - | Icon color when enabled |
| `disabledIconColor` | string | - | Icon color when disabled |

### Primary Button Style

Used for main buttons like play/pause. Same properties as `button`.

```json
{
  "primaryButton": {
    "size": 48,
    "iconSize": 24,
    "radius": 20
  }
}
```

### Chip Style

Used for badges, time displays, and small text labels.

```json
{
  "chip": {
    "radius": 14,
    "color": "@surface",
    "borderColor": "@onSurface",
    "borderWidth": 0.6,
    "textColor": "@onSurface",
    "fontSize": 12,
    "fontWeight": "w600",
    "letterSpacing": 0.2,
    "padding": { "left": 10, "right": 10, "top": 6, "bottom": 6 }
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `radius` | number | 14 | Corner radius |
| `color` | string | - | Background color |
| `borderColor` | string | - | Border color |
| `borderWidth` | number | 0.6 | Border thickness |
| `textColor` | string | - | Text color |
| `fontSize` | number | 12 | Font size |
| `fontWeight` | string | "w600" | Font weight |
| `letterSpacing` | number | 0.2 | Letter spacing |
| `padding` | object | - | Padding (same format as panel) |

### Text Style

Default text styling.

```json
{
  "text": {
    "color": "@onSurface",
    "fontSize": 14,
    "fontWeight": "w700",
    "letterSpacing": 0.2,
    "height": 1.2
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `color` | string | - | Text color |
| `fontSize` | number | 14 | Font size |
| `fontWeight` | string | "w700" | Font weight |
| `letterSpacing` | number | 0.2 | Letter spacing |
| `height` | number | 1.2 | Line height multiplier |

### Font Weight Values

| Value | Description |
|-------|-------------|
| `w100`, `thin` | Thin (100) |
| `w200`, `extralight` | Extra Light (200) |
| `w300`, `light` | Light (300) |
| `w400`, `normal`, `regular` | Normal (400) |
| `w500`, `medium` | Medium (500) |
| `w600`, `semibold` | Semi Bold (600) |
| `w700`, `bold` | Bold (700) |
| `w800`, `extrabold` | Extra Bold (800) |
| `w900`, `black` | Black (900) |

### Padding Format

Padding can be specified in multiple ways:

```json
// Single value for all sides
"padding": 16

// Horizontal and vertical
"padding": { "horizontal": 12, "vertical": 10 }

// All four sides
"padding": { "left": 12, "right": 12, "top": 10, "bottom": 10 }

// Mixed
"padding": { "left": 10, "right": 20, "vertical": 15 }
```

### Style Override

Any item can override its default style:

```json
{
  "id": "play_pause",
  "primary": true,
  "style": {
    "size": 52,
    "iconSize": 28,
    "color": "#6366f1",
    "iconColor": "#ffffff"
  }
}
```

---

## Zones Configuration

### Zone Structure

Each zone has zone properties (padding, alignment, animations) directly at the zone level:
- **Top/Bottom Zones**: Use `slot` with three-column layout (left, center, right)
- **Middle Zone**: Uses `items` array for flat row layout
- **All Zones**: Can have `normal` and `locked` configurations

### Top Zone

Contains title, navigation, and top-level controls. Organized in three columns.

```json
{
  "top": {
    "alignment": "topCenter",
    "padding": { "left": 16, "right": 16, "top": 12, "bottom": 12 },
    "hiddenOffset": [0, -1],
    "slideDurationMs": 300,
    "opacityDurationMs": 240,
    "slideCurve": "easeOutCubic",
    "opacityCurve": "easeOut",
    "showWhenLocked": true,
    "showWhenUnlocked": true,
    "useNormalWhenLocked": false,
    "ignorePointerWhenHidden": true,
    "itemSpacing": 8,
    "groupSpacing": 12,
    "absoluteCenter": true,
    "visibleWhen": "showControls",
    "panelStyle": { "enabled": false },
    "normal": {
      "left": [{ "id": "back" }],
      "center": [{ "id": "title" }],
      "right": [
        { "id": "lock_controls", "visibleWhen": "!locked" },
        { "id": "unlock_controls", "visibleWhen": "locked" }
      ]
    },
    "locked": {
      "left": [],
      "center": [],
      "right": [{ "id": "unlock_controls" }]
    }
  }
}
```

### Middle Zone

Contains central playback controls in a flat row.

```json
{
  "middle": {
    "alignment": "center",
    "padding": { "left": 20, "right": 20, "top": 16, "bottom": 16 },
    "hiddenOffset": [0, 0],
    "slideDurationMs": 280,
    "opacityDurationMs": 220,
    "slideCurve": "easeOutCubic",
    "opacityCurve": "easeOut",
    "hiddenScale": 0.88,
    "scaleDurationMs": 280,
    "scaleCurve": "easeOutBack",
    "showWhenLocked": false,
    "showWhenUnlocked": true,
    "useNormalWhenLocked": false,
    "ignorePointerWhenHidden": true,
    "itemSpacing": 16,
    "groupSpacing": 16,
    "visibleWhen": "showControls&&!locked",
    "panelStyle": { "enabled": false },
    "items": [
      { "id": "previous_episode", "enabledWhen": "canGoBackward" },
      { "id": "seek_back", "seconds": 10 },
      { "id": "play_pause", "primary": true },
      { "id": "seek_forward", "seconds": 10 },
      { "id": "next_episode", "enabledWhen": "canGoForward" }
    ],
    "locked": {
      "items": [{ "id": "unlock_controls" }]
    }
  }
}
```

### Bottom Zone

Contains progress bar and bottom controls. Can have top row and main slot.

```json
{
  "bottom": {
    "alignment": "bottomCenter",
    "padding": { "left": 16, "right": 16, "top": 12, "bottom": 12 },
    "hiddenOffset": [0, 1],
    "slideDurationMs": 300,
    "opacityDurationMs": 240,
    "slideCurve": "easeOutCubic",
    "opacityCurve": "easeOut",
    "showWhenLocked": true,
    "showWhenUnlocked": true,
    "useNormalWhenLocked": false,
    "ignorePointerWhenHidden": true,
    "itemSpacing": 8,
    "groupSpacing": 10,
    "topRowBottomSpacing": 6,
    "progressBottomSpacing": 8,
    "absoluteCenter": false,
    "visibleWhen": "showControls",
    "showProgress": true,
    "progressStyle": "capsule",
    "progressPadding": { "left": 4, "right": 4, "top": 0, "bottom": 0 },
    "panelStyle": {},
    "normal": {
      "top": {
        "left": [{ "id": "time_current" }],
        "center": [],
        "right": [{ "id": "time_duration" }]
      },
      "left": [
        { "id": "subtitles" },
        { "id": "audio_track" }
      ],
      "center": [
        { "id": "series_badge" },
        { "id": "quality_badge" }
      ],
      "right": [
        { "id": "speed" },
        { "id": "quality" },
        { "id": "toggle_fullscreen" }
      ]
    },
    "locked": {
      "top": {
        "left": [{ "id": "time_current" }],
        "center": [],
        "right": [{ "id": "time_duration" }]
      },
      "slot": {
        "left": [],
        "center": [],
        "right": []
      }
    }
  }
}
```

### Zone Properties

These properties can be set directly on each zone object:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `alignment` | string | "topCenter" | Zone alignment (see Alignment Values) |
| `padding` | object | - | Zone padding |
| `hiddenOffset` | array | [0, -1] | Slide-out offset as fraction of size |
| `slideDurationMs` | number | 300 | Slide animation duration (ms) |
| `opacityDurationMs` | number | 240 | Fade animation duration (ms) |
| `slideCurve` | string | "easeOutCubic" | Slide animation curve |
| `opacityCurve` | string | "easeOut" | Fade animation curve |
| `hiddenScale` | number | 1.0 | Scale when hidden (middle zone) |
| `scaleDurationMs` | number | 300 | Scale animation duration (ms) |
| `scaleCurve` | string | "easeOutBack" | Scale animation curve |
| `showWhenLocked` | boolean | true | Show zone when locked |
| `showWhenUnlocked` | boolean | true | Show zone when unlocked |
| `useNormalWhenLocked` | boolean | false | Use normal layout when locked |
| `ignorePointerWhenHidden` | boolean | true | Pass touches through when invisible |
| `itemSpacing` | number | 8 | Gap between items in a row |
| `groupSpacing` | number | 12 | Gap between left/center/right groups |
| `topRowBottomSpacing` | number | 6 | Space below the top row (bottom zone) |
| `progressBottomSpacing` | number | 8 | Space below the progress bar (bottom zone) |
| `absoluteCenter` | boolean | false | Use absolute centering (Stack) |
| `visibleWhen` | string | - | Conditional expression controlling visibility |
| `panelStyle` | object | {} | Override the global panel style for this zone only |
| **Bottom Zone Only** ||
| `showProgress` | boolean | true | Auto-insert progress bar |
| `progressStyle` | string | "capsule" | Progress bar style: "capsule" or "ios" |
| `progressPadding` | object | - | Progress bar padding |

### Three-Column Slot Structure

Top and bottom zones use three-column slots:

```json
{
  "slot": {
    "left": [ ... ],
    "center": [ ... ],
    "right": [ ... ]
  }
}
```

- `left`: Left-aligned items
- `center`: Center-aligned items (expands to fill available space)
- `right`: Right-aligned items

---

## Color System

### Color Formats

#### Hex Colors

```json
{
  "primary": "#6366f1",
  "secondary": "#8b5cf6",
  "white": "#ffffff",
  "black": "#000000"
}
```

Supports:
- 3-digit: `#F53` → `#FF5533`
- 4-digit: `#F53A` → `#FF5533AA`
- 6-digit: `#FF5733`
- 8-digit: `#80FF5733` (with alpha)

#### Named Colors

```json
{
  "color1": "white",
  "color2": "black",
  "color3": "transparent"
}
```

#### Palette References

Reference palette keys with `@` prefix:

```json
{
  "palette": {
    "primary": "#6366f1",
    "surface": "#171717"
  },
  "styles": {
    "button": {
      "color": "@surface"
    }
  }
}
```

#### Dynamic Colors with Alpha

```json
{
  "color1": "dynamic(primary, 0.5)",
  "color2": "dynamic(surface, 0.8)"
}
```

Format: `dynamic(key, alpha)` where alpha is 0.0 to 1.0

### Dynamic Color Keys

These keys work in dynamic colors (`@key(alpha)`) and directly:

#### System Colors
- `primary` - Primary color
- `onPrimary` - Text on primary
- `primaryContainer` - Primary container
- `onPrimaryContainer` - Text on primary container
- `secondary` - Secondary color
- `onSecondary` - Text on secondary
- `secondaryContainer` - Secondary container
- `onSecondaryContainer` - Text on secondary container
- `tertiary` - Tertiary color
- `onTertiary` - Text on tertiary
- `tertiaryContainer` - Tertiary container
- `onTertiaryContainer` - Text on tertiary container

#### Surface Colors
- `surface` - Surface color
- `surfaceDim` - Dimmed surface
- `surfaceBright` - Bright surface
- `surfaceContainerLowest` - Lowest surface container
- `surfaceContainerLow` - Low surface container
- `surfaceContainer` - Surface container
- `surfaceContainerHigh` - High surface container
- `surfaceContainerHighest` - Highest surface container

#### Content Colors
- `onSurface` - Text on surface
- `onSurfaceVariant` - Text on surface variant
- `surfaceVariant` - Surface variant
- `outline` - Outline/border color
- `outlineVariant` - Variant outline

#### Error Colors
- `error` - Error color
- `onError` - Text on error
- `errorContainer` - Error container
- `onErrorContainer` - Text on error container

#### Special Colors
- `inverseSurface` - Inverse surface
- `onInverseSurface` - Text on inverse surface
- `inversePrimary` - Inverse primary
- `shadow` - Shadow color
- `scrim` - Scrim color

#### Basic Colors
- `white`
- `black`
- `transparent`

### Color Resolution Order

When you specify a color, it's resolved in this order:

1. If starts with `dynamic(` → Use app's Material color scheme
2. If starts with `@` → Look up in palette
3. If hex color (3, 4, 6, or 8 digits) → Parse as hex
4. If `white`, `black`, or `transparent` → Use named color
5. Otherwise → Use fallback color

### Example Palette

```json
{
  "palette": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "surface": "rgba(23, 23, 23, 0.9)",
    "surfaceTransparent": "rgba(23, 23, 23, 0.6)",
    "onSurface": "#fafafa",
    "onSurfaceMuted": "#fafafa(0.7)",
    "border": "rgba(250, 250, 250, 0.15)",
    "borderStrong": "rgba(250, 250, 250, 0.25)",
    "accent": "#6366f1"
  },
  "styles": {
    "panel": {
      "color": "@surface",
      "borderColor": "@border"
    },
    "button": {
      "color": "@surfaceTransparent",
      "borderColor": "@border",
      "iconColor": "@onSurface"
    },
    "chip": {
      "color": "@surfaceTransparent",
      "borderColor": "@border",
      "textColor": "@onSurfaceMuted"
    },
    "text": {
      "color": "@onSurface"
    }
  }
}
```

---

## Visibility Conditions

### Condition Syntax

Conditions use logical operators:
- `&&` - AND (all must be true)
- `||` - OR (any can be true)
- `!` - NOT (negate)

```json
"visibleWhen": "isPlaying && !isBuffering"
"enabledWhen": "canGoForward || canGoBackward"
"visibleWhen": "!locked && showControls"
```

### Available Condition Tokens

#### Player State

| Token | Description |
|-------|-------------|
| `locked` | Controls are locked |
| `unlocked` | Controls are unlocked |
| `isPlaying` | Video is currently playing |
| `isBuffering` | Video is buffering |
| `showControls` | Controls are visible |
| `controlsHidden` | Controls are hidden |
| `isOffline` | Playing offline/local file |
| `isOnline` | Playing online/streaming |

#### Navigation State

| Token | Description |
|-------|-------------|
| `canGoForward` | Next episode available |
| `canGoBackward` | Previous episode available |

#### Platform

| Token | Description |
|-------|-------------|
| `isMobile` | Mobile device (Android/iOS) |
| `isDesktop` | Desktop device |

### Examples

```json
// Only show when controls are visible and unlocked
{ "id": "play_pause", "visibleWhen": "showControls && unlocked" }

// Only enable when next episode is available
{ "id": "next_episode", "enabledWhen": "canGoForward" }

// Show on mobile, hide on desktop
{ "id": "orientation", "visibleWhen": "isMobile" }

// Only show when not offline
{ "id": "server", "visibleWhen": "!isOffline" }

// Complex condition
{ "id": "quality", "visibleWhen": "isOnline && !locked" }

// Multiple conditions
{ "id": "playlist", "enabledWhen": "canGoForward || canGoBackward" }
```

---

## Animation & Transitions

### Animation Properties

All zones support these animation properties directly at the zone level:

```json
{
  "top": {
    "hiddenOffset": { "dx": 0, "dy": -20 },
    "slideDurationMs": 320,
    "slideCurve": "easeOutCubic",
    "opacityDurationMs": 260,
    "opacityCurve": "easeOut",
    "hiddenScale": 0.9,
    "scaleDurationMs": 300,
    "scaleCurve": "easeOutBack"
  }
}
```

### Animation Curves

| Value | Description |
|-------|-------------|
| `linear` | Linear, no easing |
| `easeIn` | Ease in (slow start) |
| `easeOut` | Ease out (slow end) |
| `easeInOut` | Ease in and out |
| `easeOutCubic` | Cubic ease out |
| `easeOutBack` | Back overshoot then settle |

### Animation Duration

All durations use the `Ms` suffix and are in milliseconds (ms):
- `slideDurationMs`: Slide animation
- `opacityDurationMs`: Fade in/out
- `scaleDurationMs`: Scale animation

### Hidden Offset

Controls where the zone moves when hidden:

```json
"hiddenOffset": { "dx": 0, "dy": -20 }
```

- `dx`: Horizontal offset (negative = left, positive = right)
- `dy`: Vertical offset (negative = up, positive = down)

### Example Animations

```json
{
  "top": {
    "hiddenOffset": { "dx": 0, "dy": -30 },
    "slideDurationMs": 400,
    "opacityDurationMs": 300,
    "slideCurve": "easeOutCubic",
    "opacityCurve": "easeOut"
  }
}

{
  "middle": {
    "hiddenScale": 0.8,
    "scaleDurationMs": 250,
    "scaleCurve": "easeOutBack"
  }
}
```

---

## Advanced Features

### Locked vs Unlocked Layouts

Each zone can have different layouts for locked and unlocked states:

```json
{
  "top": {
    "useNormalWhenLocked": false,
    "normal": {
      "left": [{ "id": "back" }],
      "center": [{ "id": "title" }],
      "right": [
        { "id": "lock_controls", "visibleWhen": "!locked" }
      ]
    },
    "locked": {
      "left": [],
      "center": [],
      "right": [{ "id": "unlock_controls" }]
    }
  }
}
```

### Progress Bar Customization

The bottom zone can automatically add a progress bar, or you can place it manually:

```json
{
  "bottom": {
    "showProgress": true,
    "progressStyle": "capsule",
    "progressPadding": { "left": 4, "right": 4, "top": 0, "bottom": 0 },
    "progressBottomSpacing": 8
  }
}
```

If you add `progress_slider` manually in any slot, the automatic one is skipped.

### Panel Style Override

You can override panel styling per zone:

```json
{
  "top": {
    "panelStyle": {
      "enabled": true,
      "color": "rgba(0, 0, 0, 0.5)",
      "blur": 24
    }
  }
}
```

### Item-Specific Style Override

Any item can override its default style:

```json
{
  "items": [
    {
      "id": "play_pause",
      "primary": true,
      "style": {
        "size": 56,
        "iconSize": 28,
        "color": "#6366f1",
        "iconColor": "#ffffff"
      }
    }
  ]
}
```

### Custom Icons

You can use custom icon names if they exist in the app's icon set:

```json
{
  "id": "custom_action",
  "icon": "custom_icon_name"
}
```

### Tooltip Customization

```json
{
  "id": "play_pause",
  "tooltip": "Play or pause the video"
}
```

---

## Alignment Values

| Value | Description |
|-------|-------------|
| `topLeft` | Top-left corner |
| `topCenter` | Top center |
| `topRight` | Top-right corner |
| `centerLeft` | Center-left |
| `center` | Center |
| `centerRight` | Center-right |
| `bottomLeft` | Bottom-left corner |
| `bottomCenter` | Bottom center |
| `bottomRight` | Bottom-right corner |

---

## Examples

### Minimal Dark Theme

```json
{
  "id": "minimal-dark",
  "name": "Minimal Dark",
  "palette": {
    "bg": "rgba(0, 0, 0, 0.7)",
    "text": "#ffffff",
    "border": "rgba(255, 255, 255, 0.2)"
  },
  "styles": {
    "panel": {
      "enabled": false
    },
    "button": {
      "size": 36,
      "iconSize": 18,
      "color": "transparent",
      "borderWidth": 0,
      "iconColor": "@text",
      "disabledIconColor": "rgba(255, 255, 255, 0.4)"
    },
    "primaryButton": {
      "size": 44,
      "iconSize": 22
    },
    "chip": {
      "enabled": false
    },
    "text": {
      "color": "@text"
    }
  },
  "top": {
    "padding": { "left": 12, "right": 12, "top": 8, "bottom": 8 },
    "itemSpacing": 6,
    "normal": {
      "left": [],
      "center": [{ "id": "title" }],
      "right": []
    }
  },
  "middle": {
    "padding": { "left": 16, "right": 16, "top": 12, "bottom": 12 },
    "itemSpacing": 8,
    "items": [
      { "id": "seek_back", "seconds": 5 },
      { "id": "play_pause", "primary": true },
      { "id": "seek_forward", "seconds": 5 }
    ]
  },
  "bottom": {
    "padding": { "left": 12, "right": 12, "top": 8, "bottom": 8 },
    "itemSpacing": 8,
    "showProgress": true,
    "progressBottomSpacing": 6,
    "normal": {
      "left": [],
      "center": [],
      "right": [
        { "id": "toggle_fullscreen" }
      ]
    }
  }
}
```

### Glass Morphism Theme

```json
{
  "id": "glass-morphism",
  "name": "Glass Morphism",
  "palette": {
    "primary": "#8b5cf6",
    "glass": "rgba(255, 255, 255, 0.1)",
    "glassBorder": "rgba(255, 255, 255, 0.2)",
    "text": "#ffffff"
  },
  "styles": {
    "panel": {
      "enabled": true,
      "showBackground": true,
      "showBorder": true,
      "radius": 24,
      "blur": 20,
      "color": "@glass",
      "borderColor": "@glassBorder",
      "borderWidth": 1,
      "padding": { "left": 16, "right": 16, "top": 12, "bottom": 12 },
      "shadowColor": "rgba(0, 0, 0, 0.3)",
      "shadowBlur": 24,
      "shadowOffsetY": 10
    },
    "button": {
      "size": 44,
      "iconSize": 22,
      "radius": 18,
      "blur": 16,
      "color": "@glass",
      "borderColor": "@glassBorder",
      "borderWidth": 1,
      "iconColor": "@text"
    },
    "primaryButton": {
      "size": 52,
      "iconSize": 26,
      "radius": 22,
      "color": "@primary",
      "iconColor": "#ffffff"
    },
    "chip": {
      "radius": 16,
      "color": "@glass",
      "borderColor": "@glassBorder",
      "textColor": "@text"
    },
    "text": {
      "color": "@text"
    }
  },
  "top": {
    "padding": { "left": 20, "right": 20, "top": 16, "bottom": 16 },
    "itemSpacing": 10,
    "groupSpacing": 20,
    "absoluteCenter": true,
    "normal": {
      "left": [{ "id": "back" }],
      "center": [
        { "id": "title", "maxLines": 1 }
      ],
      "right": [
        { "id": "lock_controls", "visibleWhen": "!locked" }
      ]
    }
  },
  "middle": {
    "padding": { "left": 24, "right": 24, "top": 20, "bottom": 20 },
    "itemSpacing": 16,
    "items": [
      { "id": "previous_episode" },
      { "id": "seek_back", "seconds": 10 },
      { "id": "play_pause", "primary": true },
      { "id": "seek_forward", "seconds": 10 },
      { "id": "next_episode" }
    ]
  },
  "bottom": {
    "padding": { "left": 20, "right": 20, "top": 16, "bottom": 16 },
    "itemSpacing": 10,
    "topRowBottomSpacing": 6,
    "progressBottomSpacing": 8,
    "showProgress": true,
    "progressStyle": "capsule",
    "progressPadding": { "left": 8, "right": 8, "top": 0, "bottom": 0 },
    "panelStyle": {},
    "normal": {
      "top": {
        "left": [{ "id": "time_current" }],
        "center": [],
        "right": [{ "id": "time_duration" }]
      },
      "left": [
        { "id": "subtitles" },
        { "id": "audio_track" }
      ],
      "center": [
        { "id": "series_badge" },
        { "id": "quality_badge" }
      ],
      "right": [
        { "id": "speed" },
        { "id": "quality" },
        { "id": "toggle_fullscreen" }
      ]
    }
  }
}
```

---

## Best Practices

### 1. Use Palette for Colors

Define colors once in palette and reference them:

```json
{
  "palette": {
    "primary": "#6366f1",
    "surface": "rgba(23, 23, 23, 0.9)",
    "onSurface": "#fafafa",
    "border": "rgba(250, 250, 250, 0.15)"
  },
  "styles": {
    "button": {
      "color": "@surface",
      "borderColor": "@border",
      "iconColor": "@onSurface"
    }
  }
}
```

### 2. Test in Both Light and Dark Modes

Use dynamic colors for adaptive theming:

```json
{
  "palette": {
    "accent": "#6366f1"
  },
  "styles": {
    "button": {
      "iconColor": "@onPrimary"
    }
  }
}
```

### 3. Consider Mobile Layout

Mobile has limited screen space:

```json
{
  "middle": {
    "items": [
      { "id": "seek_back", "seconds": 5 },
      { "id": "play_pause", "primary": true },
      { "id": "seek_forward", "seconds": 5 }
    ]
  }
}
```

### 4. Use Conditions Wisely

Hide/show elements appropriately:

```json
{
  "items": [
    { "id": "quality", "visibleWhen": "!isOffline" },
    { "id": "orientation", "visibleWhen": "isMobile" },
    { "id": "previous_episode", "enabledWhen": "canGoBackward" }
  ]
}
```

### 5. Provide Good Spacing

Use consistent spacing:

```json
{
  "itemSpacing": 12,
  "groupSpacing": 16,
  "topRowBottomSpacing": 8
}
```

### 6. Use Appropriate Touch Targets

Buttons should be large enough on mobile:

```json
{
  "styles": {
    "button": {
      "size": 44,
      "iconSize": 22
    }
  }
}
```

### 7. Validate JSON

Always validate your JSON syntax before uploading:

```bash
# Use a JSON validator
cat theme.json | jq .
```

### 8. Add Developer Notes

Include helpful notes in palette:

```json
{
  "palette": {
    "note_by_dev": "This is a dark glass morphism theme with purple accents. Modify 'primary' to change accent color."
  }
}
```

### 9. Test with Different Video States

Test your theme with:
- Playing video
- Paused video
- Locked controls
- Different video qualities
- Online vs offline playback
- Episodes with/without next/previous

### 10. Use Descriptive IDs

Make your theme easy to understand:

```json
{
  "id": "glass-purple-dark",
  "name": "Glass Purple Dark"
}
```

---

## Troubleshooting

### Theme Not Loading

1. Check JSON syntax is valid
2. Ensure `id` is present and unique
3. Verify all required properties are included
4. Check for typos in property names

### Items Not Showing

1. Check `visibleWhen` condition
2. Verify zone `showWhenLocked`/`showWhenUnlocked`
3. Ensure parent slots have items
4. Check if device/platform conditions match

### Buttons Not Working

1. Verify action ID is correct
2. Check `enabledWhen` condition
3. Some actions don't work offline (server, quality)

### Colors Not Applying

1. Check color syntax (hex with #, or @paletteKey)
2. Verify palette key exists
3. Check for fallback colors
4. Ensure style is enabled

---

## Quick Reference

### All Button Actions

```
back
lock_controls
unlock_controls
toggle_fullscreen
open_settings
previous_episode
next_episode
seek_back
seek_forward
play_pause
playlist
shaders
subtitles
server
quality
speed
audio_track
orientation
aspect_ratio
mega_seek
```

### All Items

```
gap
spacer
flex_spacer
progress_slider
time_current
time_duration
time_remaining
title
episode_badge
series_badge
quality_badge
label_stack
watching_label
text
```

### All Conditions

```
locked
unlocked
isPlaying
isBuffering
isOffline
isOnline
canGoForward
canGoBackward
isDesktop
isMobile
showControls
controlsHidden
```

### All Alignment Values

```
topLeft
topCenter
topRight
centerLeft
center
centerRight
bottomLeft
bottomCenter
bottomRight
```

### All Animation Curves

```
linear
easeIn
easeOut
easeInOut
easeOutCubic
easeOutBack
```

### All Font Weights

```
w100, thin
w200, extralight
w300, light
w400, normal, regular
w500, medium
w600, semibold
w700, bold
w800, extrabold
w900, black
```
