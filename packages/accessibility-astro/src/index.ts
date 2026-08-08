import type {AccessibilityControlDefinition, AccessibilityPreferences} from '@ooopsstudio/accessibility'

export type AccessibilityPosition = 'bottom-left' | 'bottom-right'

export type AccessibilityLabels = {
	open: string
	close: string
	title: string
	eyebrow: string
	reset: string
	increase: string
	decrease: string
	skip: string
}

export type AccessibilityHeadProps = {
	enabled?: boolean
	storageKey?: string
	includeGlobalEffects?: boolean
	defaults?: Partial<AccessibilityPreferences>
}

export type AccessibilityMenuProps = {
	enabled?: boolean
	label?: string
	position?: AccessibilityPosition
	storageKey?: string
	class?: string
	panelId?: string
	controls?: AccessibilityControlDefinition[]
	labels?: Partial<AccessibilityLabels>
	includeBaseStyles?: boolean
	includeGlobalEffects?: boolean
}

export type SkipLinkProps = {
	href?: string
	label?: string
	class?: string
	includeBaseStyles?: boolean
}

export const defaultAccessibilityLabels: AccessibilityLabels = {
	open: 'Open accessibility menu',
	close: 'Close accessibility menu',
	title: 'Accessibility',
	eyebrow: 'Display tools',
	reset: 'Reset',
	increase: 'Increase',
	decrease: 'Decrease',
	skip: 'Skip to content'
}

export const accessibilityGlobalStyles = `
html {
  --ooops-a11y-font-scale: 1;
  --ooops-a11y-line-height-factor: 1;
  --ooops-a11y-letter-spacing: 0em;
  --ooops-a11y-reading-guide-y: 50vh;
  --ooops-a11y-accent: var(--color-accent, #005fcc);
}

html.ooops-a11y-ready {
  font-size: calc(100% * var(--ooops-a11y-font-scale));
}

html.ooops-a11y-ready :where(body, p, li, a, button, input, textarea, select, label, span, strong, small, div, nav, header, main, section, article) {
  letter-spacing: var(--ooops-a11y-letter-spacing) !important;
}

html.ooops-a11y-ready :where(p, li, a, button, input, textarea, select, label, span, strong, small, div) {
  line-height: calc(var(--line-height-body, 1.6) * var(--ooops-a11y-line-height-factor)) !important;
}

html.ooops-a11y-ready :where(h1, h2, h3, h4, h5, h6) {
  line-height: calc(var(--line-height-heading, 1) * var(--ooops-a11y-line-height-factor)) !important;
  letter-spacing: var(--ooops-a11y-letter-spacing) !important;
}

html.ooops-a11y-monochrome body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  pointer-events: none;
  background: #808080;
  mix-blend-mode: saturation;
}

html.ooops-a11y-reduce-motion *,
html.ooops-a11y-reduce-motion *::before,
html.ooops-a11y-reduce-motion *::after {
  animation: none !important;
  scroll-behavior: auto !important;
  transition: none !important;
}

html.ooops-a11y-hide-media :where(main, #main-content) :where(img, picture, video, canvas, object, embed) {
  visibility: hidden !important;
}

html.ooops-a11y-highlight-links a {
  color: var(--ooops-a11y-accent) !important;
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 0.16em !important;
}

html.ooops-a11y-highlight-titles :where(h1, h2, h3, h4, h5, h6) {
  background: color-mix(in srgb, var(--ooops-a11y-accent) 24%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ooops-a11y-accent) 34%, transparent);
}

html.ooops-a11y-focus-highlight :focus-visible {
  outline: 4px solid var(--ooops-a11y-accent) !important;
  outline-offset: 4px !important;
}

html.ooops-a11y-reading-guide body::after {
  content: "";
  position: fixed;
  top: calc(var(--ooops-a11y-reading-guide-y) - 2px);
  left: 0;
  z-index: 2147482999;
  width: 100vw;
  height: 4px;
  pointer-events: none;
  background: var(--ooops-a11y-accent);
  box-shadow: 0 0 0 9999px rgb(0 0 0 / 10%);
}

html.ooops-a11y-large-cursor,
html.ooops-a11y-large-cursor * {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cfilter id='s' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeDropShadow dx='0' dy='2' stdDeviation='1.4' flood-color='%23000' flood-opacity='.38'/%3E%3C/filter%3E%3Cpath filter='url(%23s)' d='M9 5l27 25-13 1.4 7.5 12-6.8 3.2-7.1-12.2-8.7 8.9z' fill='%23fff' stroke='%23000' stroke-width='3.5' stroke-linejoin='round'/%3E%3Cpath d='M20.8 31.8l8 12.8' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round'/%3E%3Cpath d='M13.8 12.8l16.6 15.3-10.5 1.1-7.2 7.3z' fill='%23fff'/%3E%3C/svg%3E") 4 4, auto !important;
}

html.ooops-a11y-high-contrast {
  color-scheme: dark;
  --ooops-a11y-accent: #ffd400;
  --color-bg: #000000;
  --color-surface: #050505;
  --color-surface-muted: #111111;
  --color-surface-raised: #050505;
  --color-text: #ffffff;
  --color-muted: #f2f2f2;
  --color-border: #ffffff;
  --color-border-strong: #ffffff;
  --color-accent: #ffd400;
  --color-accent-contrast: #000000;
  --color-focus-ring: rgb(255 212 0 / 64%);
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
}

html.ooops-a11y-high-contrast :where(body, .ooops-a11y-panel, .ooops-a11y-card) {
  background-color: var(--color-bg, #000) !important;
  color: var(--color-text, #fff) !important;
}
`

export const accessibilityMenuStyles = `
.ooops-a11y-widget {
  --ooops-a11y-trigger-size: 48px;
  --ooops-a11y-panel-width: min(34rem, calc(100vw - 2.5rem));
  position: fixed;
  z-index: 1000;
}

.ooops-a11y-widget-bottom-left {
  left: 20px;
  bottom: 20px;
}

.ooops-a11y-widget-bottom-right {
  right: 20px;
  bottom: 20px;
}

.ooops-a11y-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ooops-a11y-trigger-size);
  height: var(--ooops-a11y-trigger-size);
  padding: 0;
  border: 1px solid var(--color-border, currentColor);
  border-radius: 999px;
  background: var(--color-accent, #005fcc);
  color: var(--color-accent-contrast, #fff);
  cursor: pointer;
}

.ooops-a11y-trigger svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.ooops-a11y-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: transparent;
}

.ooops-a11y-panel {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 0;
  z-index: 1001;
  width: var(--ooops-a11y-panel-width);
  max-height: min(720px, calc(100vh - 40px));
  padding: 14px;
  overflow: auto;
  border: 1px solid var(--color-border, currentColor);
  border-radius: 20px;
  background: var(--color-surface-raised, Canvas);
  color: var(--color-text, CanvasText);
  box-shadow: var(--shadow-lg, 0 20px 58px rgb(0 0 0 / 18%));
}

.ooops-a11y-widget-bottom-right .ooops-a11y-panel {
  right: 0;
  left: auto;
}

.ooops-a11y-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 8px 12px;
}

.ooops-a11y-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: var(--color-accent, #005fcc);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ooops-a11y-header h2 {
  margin: 0;
  color: var(--color-text, CanvasText);
  font-size: 20px;
  line-height: 1.1;
}

.ooops-a11y-close,
.ooops-a11y-range-controls button,
.ooops-a11y-reset {
  border: 1px solid var(--color-border, currentColor);
  background: var(--color-surface, Canvas);
  color: var(--color-text, CanvasText);
  cursor: pointer;
}

.ooops-a11y-close {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 999px;
  font-size: 22px;
  line-height: 1;
}

.ooops-a11y-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.ooops-a11y-card {
  min-height: 92px;
  padding: 11px;
  border: 1px solid var(--color-border, currentColor);
  border-radius: 15px;
  background: var(--color-surface, Canvas);
  color: var(--color-text, CanvasText);
}

.ooops-a11y-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  text-align: center;
  cursor: pointer;
}

.ooops-a11y-toggle[aria-pressed="true"] {
  border-color: var(--color-accent, #005fcc);
}

.ooops-a11y-icon-wrap {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: var(--color-accent, #005fcc);
  color: var(--color-accent-contrast, #fff);
  font-weight: 900;
}

.ooops-a11y-range {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  text-align: center;
}

.ooops-a11y-range-controls {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.ooops-a11y-range-controls button {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 999px;
}

.ooops-a11y-reset {
  width: 100%;
  min-height: 42px;
  margin-top: 12px;
  border-radius: 14px;
  font-weight: 800;
}

.ooops-a11y-trigger:focus-visible,
.ooops-a11y-close:focus-visible,
.ooops-a11y-toggle:focus-visible,
.ooops-a11y-range-controls button:focus-visible,
.ooops-a11y-reset:focus-visible {
  outline: 3px solid var(--color-focus-ring, Highlight);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .ooops-a11y-widget {
    right: 16px;
    bottom: 16px;
    left: 16px;
    width: auto;
  }

  .ooops-a11y-widget .ooops-a11y-panel {
    right: 0;
    left: 0;
    width: auto;
  }

  .ooops-a11y-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
`

export const skipLinkStyles = `
.ooops-skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 10000;
  padding: 10px 14px;
  border-radius: 999px;
  background: var(--color-text, CanvasText);
  color: var(--color-surface, Canvas);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  transform: translateY(-160%);
  transition: transform 160ms ease;
}

.ooops-skip-link:focus,
.ooops-skip-link:focus-visible {
  transform: translateY(0);
}
`

const ESCAPED_JSON_CHARACTERS: Record<string, string> = {
	'<': '\\u003c',
	'>': '\\u003e',
	'&': '\\u0026',
	'\u2028': '\\u2028',
	'\u2029': '\\u2029'
}

export const serializeInlineJson = (value: unknown) =>
	JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => ESCAPED_JSON_CHARACTERS[character]!)

export type {AccessibilityControlDefinition, AccessibilityPreferences} from '@ooopsstudio/accessibility'
