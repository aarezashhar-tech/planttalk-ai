---
name: Arboris Tech
colors:
  surface: '#09160e'
  surface-dim: '#09160e'
  surface-bright: '#2f3c33'
  surface-container-lowest: '#051109'
  surface-container-low: '#111e16'
  surface-container: '#15221a'
  surface-container-high: '#202d24'
  surface-container-highest: '#2a382f'
  on-surface: '#d7e7d9'
  on-surface-variant: '#c1c9c1'
  inverse-surface: '#d7e7d9'
  inverse-on-surface: '#26332a'
  outline: '#8b938c'
  outline-variant: '#414943'
  surface-tint: '#a1d1b4'
  primary: '#a1d1b4'
  on-primary: '#073823'
  primary-container: '#1a4731'
  on-primary-container: '#86b598'
  inverse-primary: '#3b674f'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#5a3700'
  on-tertiary-container: '#ec9700'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#bdeecf'
  primary-fixed-dim: '#a1d1b4'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#234f38'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#09160e'
  on-background: '#d7e7d9'
  surface-variant: '#2a382f'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered to evoke a sense of "Living Technology"—where deep organic roots meet advanced computational intelligence. The brand personality is professional, authoritative, and visionary, designed specifically for precision agriculture and high-yield environmental monitoring.

The visual style is **Futuristic Glassmorphism**. It utilizes multi-layered translucent surfaces, high-fidelity backdrop blurs, and luminous perimeter glows to simulate a holographic dashboard interface. The aesthetic balances the dense, dark atmosphere of a forest floor with the sharp, glowing clarity of a high-tech laboratory. The UI should feel like a premium tool that grants the user a "sixth sense" for plant health.

## Colors

The palette is anchored in a deep, nocturnal green to provide maximum contrast for glowing data visualizations.

- **Primary (#1A4731):** Used for structural depth, sidebars, and deep background layers.
- **Accent/Success (#10B981):** The "Lume" color. Used for active states, healthy growth indicators, and primary action buttons.
- **Warning (#F59E0B):** Used for nutrient deficiencies or moisture alerts.
- **Alert (#EF4444):** Reserved for immediate biological threats or hardware failures.
- **Surface:** Semi-transparent white (5-10% opacity) with a 20px backdrop blur creates the "Glass" effect over the dark neutral background.

## Typography

This design system uses a trio of sans-serifs to establish its technical hierarchy. **Hanken Grotesk** provides a sharp, modern edge for headlines. **Inter** handles high-density data and body text with maximum legibility. **Geist** is utilized for monospaced technical readouts and metadata labels, reinforcing the developer-grade precision of the AI.

Subtitles and secondary information should use a reduced opacity (60-70%) rather than a lighter grey to maintain the glass-compatible aesthetic.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a strictly enforced 8px spatial scale. 

- **Desktop:** 12-column grid with 24px gutters. Dashboard widgets typically span 3, 4, or 6 columns.
- **Tablet:** 8-column grid with 16px gutters. 
- **Mobile:** 4-column grid with 16px margins. 

Layouts should favor high-density information architecture but maintain "breathing room" through large outer margins (32px+ on desktop) to let the background gradient mesh show through.

## Elevation & Depth

Depth is not communicated through traditional shadows, but through **Tonal Translucency and Blurs**.

1.  **Level 0 (Background):** A dark `#0F1C14` base with an animated, low-velocity gradient mesh of emerald and deep forest tones.
2.  **Level 1 (Base Cards):** White at 5% opacity, 20px backdrop blur, and a 1px inner border of white at 10% opacity.
3.  **Level 2 (Active/Hover):** White at 12% opacity, increased blur, and a subtle outer glow using the primary accent color (#10B981).
4.  **Level 3 (Modals/Popovers):** Higher opacity (15%) with a dark 20% shadow to separate the glass layer from the dashboard beneath.

## Shapes

The shape language is **Rounded**, utilizing a 0.5rem (8px) corner radius for most standard UI elements (Inputs, Small Cards). Large dashboard containers should use `rounded-xl` (24px) to create a softer, more sophisticated "hardware" feel. Interactive badges and status chips use full pill-shaping (999px) to distinguish them from structural elements.

## Components

- **Glass Cards:** The primary container. Must feature a 1px semi-transparent border (top and left edges slightly brighter to simulate a light source). On hover, cards should utilize a subtle 3D tilt (max 5 degrees).
- **Primary Buttons:** Solid `#10B981` with black text for high contrast. Include a soft emerald outer glow.
- **Secondary Buttons:** Ghost style with the glass border treatment and white text.
- **Glow Indicators:** Use a pulse animation (0.5Hz) for "Critical" status badges. Active sidebar items should feature a vertical glowing line (2px wide) on the leading edge.
- **Data Inputs:** Darkened glass (black at 20% opacity) with bottom-only borders that "light up" in emerald when focused.
- **Stats/Numbers:** Large-scale Hanken Grotesk weights. Use count-up animations on page load to emphasize real-time data streaming.
- **Sidebar:** A vertical gradient (from `#1A4731` to `#0F1C14`) with a slight blur to separate it from the main content canvas.