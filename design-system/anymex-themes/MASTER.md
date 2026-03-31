# AnymeX Themes - Master Design System

Primary source of truth for the redesign. Page overrides belong in `design-system/anymex-themes/pages/*.md`.

## Product Direction

- Product type: community marketplace for AnymeX themes
- UX goals: fast discovery, creator trust, low friction upload/review
- Tone: cinematic dark, creator-first, high contrast
- Interaction: calm motion, no layout-shifting hovers, keyboard-visible focus

## Core Tokens

### Color

| Token | Value | Use |
|---|---|---|
| `primary` | `#EC4899` | Main brand action |
| `secondary` | `#F472B6` | Supporting highlights |
| `accent` | `#F97316` | CTA and active intent |
| `bg-dark` | `#10111A` | Primary dark background |
| `surface-dark` | `#17192A` | Cards, popovers |
| `border-dark` | `#2B2E45` | Dividers and containers |
| `text-primary` | `#F7F8FC` | Primary text |
| `text-muted` | `#A8ADC8` | Secondary text |

### Typography

- Heading/UI mono: `Fira Code`
- Body/text: `Fira Sans`
- Scale:
  - Display: 48/56 semibold
  - H1: 36/44 semibold
  - H2: 28/36 semibold
  - Body: 16/24 regular
  - Meta: 12/16 medium

### Radius + Depth

- Radius: `10px` default, `14px` elevated
- Shadows:
  - Soft: `0 8px 30px rgba(0,0,0,0.18)`
  - Elevated: `0 16px 48px rgba(0,0,0,0.28)`

### Motion

- Duration: `150ms` micro, `220ms` default
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- Respect `prefers-reduced-motion`

## Layout System

- Max content width: `1280px`
- Horizontal gutter: `16px` mobile, `24px` tablet, `32px` desktop
- Sticky nav offset: keep `96px` top content clearance on pages using fixed nav
- Grid:
  - Theme cards: 1/2/3/4 columns by breakpoint
  - Dashboard stats: 1/2/4/5 columns depending on role

## Components

- Navigation: floating glass bar with clear active state and compact mobile menu
- Cards: blurred surface with subtle border and stronger hover border
- Buttons:
  - Primary: pink/orange emphasis
  - Secondary: muted filled
  - Ghost: icon actions
- Form controls: dark inputs, visible ring on focus, 44px min tap target
- Tables: dense but readable, sticky header where possible

## Page Blueprint

- `/`: hero + search as primary CTA, category pills, theme card grid
- `/themes/[themeId]`: detail hero, metadata, actions, JSON/share utility
- `/users/[username]`: profile hero, stats strip, filtered theme grid
- `/docs`: structured article cards, examples, checklists
- `/auth`: split sign in/register card with same visual language
- `/profile`: account settings cards and security dialog
- `/setup`: first-run single card flow
- `/dashboard`: creator/admin hybrid cockpit with role-aware cards
- `/admin/*`: dense management surfaces prioritizing scan speed

## Accessibility + Quality Rules

- No emojis as icons in product UI
- Every clickable non-button element must show `cursor-pointer`
- Focus ring must be visible and pass 3:1 contrast minimum
- Body text contrast target: 4.5:1 minimum
- Test breakpoints: 375, 768, 1024, 1440

## Anti-Patterns

- Pure black blocks without hierarchy
- Hover transforms that move layout
- Multiple competing accent colors in the same viewport
- Low-opacity borders on light backgrounds
