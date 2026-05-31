---
name: Verdant Intelligence
colors:
  surface: '#faf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#faf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ef'
  surface-container: '#efeee9'
  surface-container-high: '#e9e8e3'
  surface-container-highest: '#e3e3de'
  on-surface: '#1b1c19'
  on-surface-variant: '#42493e'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#4a6549'
  on-secondary: '#ffffff'
  secondary-container: '#ccebc7'
  on-secondary-container: '#506b4f'
  tertiary: '#642706'
  on-tertiary: '#ffffff'
  tertiary-container: '#813d1b'
  on-tertiary-container: '#ffb18e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcf0ae'
  primary-fixed-dim: '#a1d494'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#23501e'
  secondary-fixed: '#ccebc7'
  secondary-fixed-dim: '#b0cfad'
  on-secondary-fixed: '#07200b'
  on-secondary-fixed-variant: '#334d33'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#753413'
  background: '#faf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e3e3de'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 120px
---

## Brand & Style
The design system is anchored in the concept of "Guided Growth"—merging the precision of artificial intelligence with the organic, tactile reality of agriculture. The personality is empowering and approachable, stripping away technical friction to favor a supportive, expert companion vibe.

The visual style is **Modern Minimalism with Organic Tactility**. It utilizes heavy whitespace to ensure clarity in outdoor environments (high sunlight), while employing soft, natural gradients and layered surfaces to evoke a sense of depth and life. The UI avoids the coldness of traditional "Agri-Tech" by leaning into a "Human-Centric Farming" aesthetic—clean lines, soft edges, and a palette that feels like it was pulled directly from a healthy field.

## Colors
The color palette is a sophisticated "Earthy Modern" spectrum. 
- **Primary (Forest Green):** Used for core branding, primary actions, and authoritative navigation. It provides the necessary contrast for readability.
- **Secondary (Moss/Sage):** Used for secondary UI elements, status indicators, and subtle backgrounds to categorize information without overwhelming the user.
- **Tertiary (Terracotta):** Reserved for high-priority Call-to-Actions (CTAs) and notifications. Its warmth contrasts against the greens to draw immediate attention.
- **Neutral (Cream/Clay):** We move away from clinical pure whites, using a soft cream background to reduce eye strain and provide a more "natural" canvas for the content.

## Typography
The typography strategy prioritizes legibility and friendliness. **Plus Jakarta Sans** provides a modern, slightly rounded geometric feel for headings that feels optimistic and "smart." **Be Vietnam Pro** is used for body copy and data because of its exceptional legibility and contemporary, approachable proportions.

For mobile-specific views, headline sizes are scaled down to ensure that even long plant names or soil descriptions do not break the layout. Line heights are intentionally generous to ensure that information is easy to scan while working in the field.

## Layout & Spacing
This design system utilizes a **Fluid Grid** based on an 8px rhythm. 
- **Mobile-First:** The primary experience is a single-column layout with 20px side margins, allowing cards to breathe.
- **Desktop Adaptation:** On larger screens, the content transitions to a 12-column grid with a maximum content width of 1200px.
- **Rhythm:** Use `md` (24px) spacing for most vertical gaps between related components, and `lg` (40px) to separate major sections. This "airy" spacing reinforces the minimal, calm aesthetic of the brand.

## Elevation & Depth
Elevation in the design system is communicated through **Ambient Shadows** and **Tonal Layering**. 
- **Shadows:** Instead of neutral grays, shadows use a very low-opacity "Forest Green" or "Clay" tint (e.g., `rgba(45, 90, 39, 0.08)`). This makes the shadows feel like natural lighting in an outdoor environment.
- **Tiers:** 
  - **Level 0 (Surface):** The Cream background.
  - **Level 1 (Cards):** Soft-white cards with a subtle 8px blur shadow.
  - **Level 2 (Modals/Popovers):** Higher contrast shadows with a light backdrop blur to create a glassmorphic "focus" effect over the garden data.
- **Depth:** Elements should feel "rested" on the surface, not floating high above it.

## Shapes
The shape language is defined by **High Roundedness**. This choice removes "sharp" edges from the technology, making the app feel safe and organic.
- **Small Elements (Chips/Tags):** Fully pill-shaped.
- **Medium Elements (Buttons/Inputs):** 1rem (16px) radius for a friendly, "squishy" tactile feel.
- **Large Elements (Cards/Containers):** 2rem (32px) radius, creating a soft, container-like feel for images and charts.

## Components
- **Buttons:** Primary buttons should be "Forest Green" with white text, featuring a subtle inner-glow to feel tactile. The "Terracotta" button is used exclusively for primary conversion or urgent actions (e.g., "Start Treatment").
- **Cards:** Cards are the workhorse of the system. They feature a 2rem corner radius, a 1px soft-moss border, and a subtle ambient shadow. Use natural gradients (Sage to Cream) for card backgrounds to differentiate plant species.
- **Input Fields:** Search and data entry fields use the secondary moss color at 10% opacity for the fill, with a bold 2px "Forest Green" focus ring.
- **Chips:** Used for plant health status (e.g., "Thriving," "Thirsty"). These use a pill-shape and high-saturation versions of the moss and terracotta colors for quick scanning.
- **Progress Gauges:** Circular, organic-stroke gauges are preferred over linear bars to represent soil moisture and sunlight levels, reinforcing the "PlantTalk" biological theme.
- **Icons:** Use "Duotone" icons with a soft-moss secondary fill and a primary-green outline to maintain a friendly, illustrative feel.