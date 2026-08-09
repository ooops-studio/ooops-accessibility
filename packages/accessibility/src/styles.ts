/**
 * Canonical global effects consumed by every framework adapter.
 * Keeping this CSS in the headless package prevents Astro/Svelte drift.
 */
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
  --ooops-a11y-trigger-icon-size: 24px;
  --ooops-a11y-trigger-radius: 999px;
  --ooops-a11y-viewport-offset: 20px;
  --ooops-a11y-panel-gap: 12px;
  --ooops-a11y-panel-width: min(34rem, calc(100vw - 2.5rem));
  --ooops-a11y-panel-padding: 14px;
  --ooops-a11y-panel-border-width: 1px;
  --ooops-a11y-panel-radius: 20px;
  --ooops-a11y-panel-shadow: var(--shadow-lg, 0 20px 58px rgb(0 0 0 / 18%));
  --ooops-a11y-header-gap: 16px;
  --ooops-a11y-header-padding: 8px 8px 12px;
  --ooops-a11y-header-action-gap: 8px;
  --ooops-a11y-close-size: 34px;
  --ooops-a11y-close-radius: 999px;
  --ooops-a11y-reset-min-height: 34px;
  --ooops-a11y-reset-padding-inline: 12px;
  --ooops-a11y-reset-radius: 999px;
  --ooops-a11y-grid-columns: 3;
  --ooops-a11y-grid-gap: 10px;
  --ooops-a11y-card-min-height: 92px;
  --ooops-a11y-card-padding: 11px;
  --ooops-a11y-card-radius: 15px;
  --ooops-a11y-card-border-width: 1px;
  --ooops-a11y-toggle-gap: 7px;
  --ooops-a11y-icon-wrap-size: 34px;
  --ooops-a11y-icon-wrap-radius: 11px;
  --ooops-a11y-control-icon-size: 18px;
  --ooops-a11y-range-gap: 9px;
  --ooops-a11y-range-control-gap: 8px;
  --ooops-a11y-range-button-size: 26px;
  --ooops-a11y-range-button-radius: 999px;
  --ooops-a11y-mobile-panel-block-offset: 32px;
  position: fixed;
  z-index: 1000;
}

.ooops-a11y-widget-bottom-left {
  left: var(--ooops-a11y-viewport-offset);
  bottom: var(--ooops-a11y-viewport-offset);
}

.ooops-a11y-widget-bottom-right {
  right: var(--ooops-a11y-viewport-offset);
  bottom: var(--ooops-a11y-viewport-offset);
}

.ooops-a11y-widget-top-left {
  top: var(--ooops-a11y-viewport-offset);
  left: var(--ooops-a11y-viewport-offset);
}

.ooops-a11y-widget-top-right {
  top: var(--ooops-a11y-viewport-offset);
  right: var(--ooops-a11y-viewport-offset);
}

.ooops-a11y-widget-inline {
  position: relative;
  display: inline-block;
}

.ooops-a11y-widget .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.ooops-a11y-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ooops-a11y-trigger-size);
  height: var(--ooops-a11y-trigger-size);
  padding: 0;
  border: 1px solid var(--color-border, currentColor);
  border-radius: var(--ooops-a11y-trigger-radius);
  background: var(--color-accent, #005fcc);
  color: var(--color-accent-contrast, #fff);
  cursor: pointer;
}

.ooops-a11y-trigger-icon {
  width: var(--ooops-a11y-trigger-icon-size);
  height: var(--ooops-a11y-trigger-icon-size);
  fill: currentColor;
}

.ooops-a11y-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: transparent;
}

.ooops-a11y-panel {
  box-sizing: border-box;
  position: absolute;
  bottom: calc(100% + var(--ooops-a11y-panel-gap));
  left: 0;
  z-index: 1001;
  width: var(--ooops-a11y-panel-width);
  max-height: min(720px, var(--ooops-a11y-panel-max-height, calc(100vh - 40px)));
  padding: var(--ooops-a11y-panel-padding);
  overflow: auto;
  border: var(--ooops-a11y-panel-border-width) solid var(--color-border, currentColor);
  border-radius: var(--ooops-a11y-panel-radius);
  background: var(--color-surface-raised, Canvas);
  color: var(--color-text, CanvasText);
  box-shadow: var(--ooops-a11y-panel-shadow);
  text-align: left;
}

.ooops-a11y-widget-bottom-right .ooops-a11y-panel {
  right: 0;
  left: auto;
}

.ooops-a11y-widget-top-left .ooops-a11y-panel,
.ooops-a11y-widget-top-right .ooops-a11y-panel,
.ooops-a11y-widget-inline .ooops-a11y-panel {
  top: calc(100% + var(--ooops-a11y-panel-gap));
  bottom: auto;
}

.ooops-a11y-widget-top-right .ooops-a11y-panel {
  right: 0;
  left: auto;
}

.ooops-a11y-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ooops-a11y-header-gap);
  padding: var(--ooops-a11y-header-padding);
}

.ooops-a11y-header-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--ooops-a11y-header-action-gap);
  flex: none;
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
  line-height: var(--ooops-a11y-heading-line-height, 1.05) !important;
}

.ooops-a11y-close,
.ooops-a11y-range-button,
.ooops-a11y-reset {
  border: 1px solid var(--color-border, currentColor);
  background: var(--color-surface, Canvas);
  color: var(--color-text, CanvasText);
  cursor: pointer;
}

.ooops-a11y-close {
  display: grid;
  place-items: center;
  width: var(--ooops-a11y-close-size);
  height: var(--ooops-a11y-close-size);
  padding: 0;
  border-radius: var(--ooops-a11y-close-radius);
  font-size: 22px;
  line-height: 1;
}

.ooops-a11y-grid {
  display: grid;
  grid-template-columns: repeat(var(--ooops-a11y-grid-columns), minmax(0, 1fr));
  gap: var(--ooops-a11y-grid-gap);
}

.ooops-a11y-card {
  min-height: var(--ooops-a11y-card-min-height);
  padding: var(--ooops-a11y-card-padding);
  border: var(--ooops-a11y-card-border-width) solid var(--color-border, currentColor);
  border-radius: var(--ooops-a11y-card-radius);
  background: var(--color-surface, Canvas);
  color: var(--color-text, CanvasText);
}

.ooops-a11y-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ooops-a11y-toggle-gap);
  text-align: center;
  cursor: pointer;
}

.ooops-a11y-range > .ooops-a11y-control-title,
.ooops-a11y-toggle > span:last-child {
  line-height: var(--ooops-a11y-control-title-line-height, 1.2) !important;
}

.ooops-a11y-range > .ooops-a11y-control-title {
  font-weight: var(--ooops-a11y-control-title-font-weight, 400) !important;
}

.ooops-a11y-toggle[aria-pressed="true"] {
  border-color: var(--color-accent, #005fcc);
}

.ooops-a11y-icon-wrap {
  display: grid;
  place-items: center;
  width: var(--ooops-a11y-icon-wrap-size);
  height: var(--ooops-a11y-icon-wrap-size);
  border-radius: var(--ooops-a11y-icon-wrap-radius);
  background: var(--color-accent, #005fcc);
  color: var(--color-accent-contrast, #fff);
  font-weight: 900;
}

.ooops-a11y-control-icon {
  width: var(--ooops-a11y-control-icon-size);
  height: var(--ooops-a11y-control-icon-size);
}

.ooops-a11y-range {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ooops-a11y-range-gap);
  text-align: center;
}

.ooops-a11y-range-controls {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--ooops-a11y-range-control-gap);
  width: 100%;
}

.ooops-a11y-range-button {
  display: grid;
  place-items: center;
  width: var(--ooops-a11y-range-button-size);
  height: var(--ooops-a11y-range-button-size);
  padding: 0;
  border-radius: var(--ooops-a11y-range-button-radius);
}

.ooops-a11y-reset {
  min-height: var(--ooops-a11y-reset-min-height);
  padding: 0 var(--ooops-a11y-reset-padding-inline);
  border-radius: var(--ooops-a11y-reset-radius);
  font-weight: 800;
}

.ooops-a11y-trigger:focus-visible,
.ooops-a11y-close:focus-visible,
.ooops-a11y-toggle:focus-visible,
.ooops-a11y-range-button:focus-visible,
.ooops-a11y-reset:focus-visible {
  outline: 3px solid var(--color-focus-ring, Highlight);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .ooops-a11y-widget {
    --ooops-a11y-viewport-offset: 16px;
    --ooops-a11y-grid-columns: 2;
  }

  .ooops-a11y-widget:not(.ooops-a11y-widget-inline) {
    right: var(--ooops-a11y-viewport-offset);
    left: var(--ooops-a11y-viewport-offset);
    width: auto;
  }

  .ooops-a11y-widget-bottom-left,
  .ooops-a11y-widget-bottom-right {
    bottom: var(--ooops-a11y-viewport-offset);
  }

  .ooops-a11y-widget-top-left,
  .ooops-a11y-widget-top-right {
    top: var(--ooops-a11y-viewport-offset);
  }

  .ooops-a11y-widget-bottom-right,
  .ooops-a11y-widget-top-right {
    text-align: right;
  }

  .ooops-a11y-widget:not(.ooops-a11y-widget-inline) .ooops-a11y-panel {
    right: 0;
    left: 0;
    width: auto;
  }

  .ooops-a11y-widget-inline .ooops-a11y-panel {
    position: fixed;
    top: var(--ooops-a11y-viewport-offset);
    right: var(--ooops-a11y-viewport-offset);
    bottom: var(--ooops-a11y-viewport-offset);
    left: var(--ooops-a11y-viewport-offset);
    width: auto;
    max-height: calc(100vh - var(--ooops-a11y-mobile-panel-block-offset));
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
