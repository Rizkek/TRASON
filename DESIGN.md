---
name: TRASON
version: 1.1.0
author: Gemini CLI
atmosphere: "Calm, Intentional, Professional, Personal OS"
colors:
  primary: "#F4C95D" # Warm Gold
  secondary: "#E3B84D" # Deep Gold
  background:
    dark: "#0B0F14" # Warm Black
    light: "#F0F4F8" # Light Sky
  surface:
    dark: "#111827" # Gray Strong
    light: "#E2E8F0" # Gray Strong (Light)
  text:
    dark: "#F8FAFC" # Soft Cream
    light: "#1E293B" # Dark Slate
  accent:
    success: "#4ADE80"
    danger: "#F87171"
    warning: "#FB923C"
    info: "#60A5FA"
    taupe: "#A39482"
    sage: "#8DA399"
typography:
  families:
    serif: "'Cormorant Garamond', serif"
    sans: "Inter, -apple-system, sans-serif"
  scales:
    display: { size: "40px", weight: "600", family: "serif", leading: "1.1", tracking: "-0.02em" }
    h1: { size: "32px", weight: "600", family: "serif", leading: "1.1", tracking: "-0.01em" }
    h2: { size: "24px", weight: "400", family: "serif", leading: "1.2", tracking: "-0.005em" }
    h3: { size: "20px", weight: "400", family: "serif", leading: "1.3" }
    body: { size: "16px", weight: "400", family: "sans", leading: "1.6" }
    caption: { size: "14px", weight: "400", family: "sans" }
    micro: { size: "12px", weight: "500", family: "sans", transform: "uppercase", tracking: "wider" }
spacing:
  base: 4px
  scale:
    xs: 4px
    sm: 8px
    md: 16px
    lg: 24px
    xl: 32px
    2xl: 48px
    3xl: 64px
shapes:
  radius:
    xs: 4px
    sm: 8px
    md: 12px
    lg: 16px
  border:
    subtle: "1px solid rgba(255, 255, 255, 0.05)"
    glass: "1px solid rgba(255, 255, 255, 0.1)"
shadows:
  subtle: "0 1px 4px rgba(0, 0, 0, 0.06)"
  primary: "0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(244, 201, 93, 0.1)"
  glow: "0 0 20px -5px var(--color-primary)"
---

## Visual Philosophy
TRASON is designed as a "Personal OS" that promotes intentionality and calm growth. The aesthetic avoids "AI-beige" or generic corporate styles, favoring a warm, editorial feel with high-contrast typography and a surgical-clean dark mode.

## Color Palette Rules
- **Warm Black (#0B0F14)**: The foundation. Use as the primary background for dark mode.
- **Warm Gold (#F4C95D)**: The "Primary" signal. Use for CTAs, active states, and highlights.
- **Soft Cream (#F8FAFC)**: The "Text" color for dark mode. High legibility without the harshness of pure white.
- **Glass/Translucency**: Use `backdrop-blur-md` and low-opacity backgrounds (0.03 to 0.1) for cards to create depth.

## Typography
- **Serif (Cormorant Garamond)**: Used for all headings (H1-H3) and display text. It provides the "editorial" and "personal" feel.
- **Sans (Inter)**: Used for all UI controls, body text, and labels. It ensures precision and clarity.

## Layout & Spacing
- Use a **4px grid** for all spacing.
- Max container width is **1024px** for a focused, "calm" reading experience.
- Aggressive whitespace (spacing-xl and above) should be used between major sections to prevent clutter.

## Components

### Buttons
- **Primary**: Gradient background (`primary` to `secondary`), white text, subtle reflection effect on hover.
- **Secondary**: Translucent background (`white/10`), glass border, blur effect.
- **Outline**: `primary` border, `primary` text, transitions to filled on hover.

### Cards
- **Glass Card**: `bg-white/3`, `backdrop-blur-xl`, `border-white/5`.
- **Active Card**: Transitions to higher opacity, primary-tinted border, and a subtle glow.

### Interactive Elements
- Use `active:scale-[0.98]` for tactile feedback on all buttons.
- All transitions should be smooth (at least 300ms) and use `cubic-bezier(0.4, 0, 0.2, 1)`.

## Do's and Don'ts
- **DO**: Use gradients for primary actions.
- **DO**: Maintain high contrast for accessibility (WCAG compliant).
- **DON'T**: Use pure black (#000) or pure white (#FFF) for major surfaces.
- **DON'T**: Use heavy drop shadows; prefer subtle glows and elevation through translucency.
