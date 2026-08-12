# @ooopsstudio/accessibility

Framework-agnostic accessibility preference runtime for websites and product UIs. It manages persisted user preferences, applies root classes/CSS variables, provides an early head bootstrap script, and exposes reusable focus-management and reduced-motion helpers.

This package is headless: it does not ship UI components or framework adapters.

## Install

```sh
pnpm add @ooopsstudio/accessibility
```

## Usage

```ts
import {
	createAccessibilityController,
	createAccessibilityHeadScript
} from '@ooopsstudio/accessibility'

const controller = createAccessibilityController()

controller.setPreference('highContrast', true)
controller.stepRange('fontScale', 1)

document.head.append(
	Object.assign(document.createElement('script'), {
		textContent: createAccessibilityHeadScript()
	})
)
```

## Preferences

Default storage key: `ooops.accessibility.preferences.v1`.

Supported preferences:

- `fontScale`
- `lineHeight`
- `letterSpacing`
- `highContrast`
- `monochrome`
- `highlightTitles`
- `highlightLinks`
- `largeCursor`
- `readingGuide`
- `focusHighlight`
- `pauseAnimations`
- `hideMedia`

Range values are clamped from `80` to `200`.

## Root Effects

`applyAccessibilityPreferences()` applies:

- Root readiness class: `ooops-a11y-ready`
- Toggle classes such as `ooops-a11y-high-contrast`, `ooops-a11y-monochrome`, `ooops-a11y-reading-guide`
- CSS variables:
  - `--ooops-a11y-font-scale`
  - `--ooops-a11y-line-height-factor`
  - `--ooops-a11y-letter-spacing`
  - `--ooops-a11y-reading-guide-y`

The package exports `accessibilityGlobalStyles`, `accessibilityMenuStyles`, and `skipLinkStyles` as the canonical CSS consumed by both adapters. This prevents framework-specific effect drift.

### Menu layout tokens

The default menu is intentionally opinionated, but its geometry is tokenized. Override these variables on the widget or any ancestor:

- Placement: `--ooops-a11y-viewport-offset`, `--ooops-a11y-panel-gap`, `--ooops-a11y-panel-width`, `--ooops-a11y-panel-max-height`.
- Panel: `--ooops-a11y-panel-padding`, `--ooops-a11y-panel-border-width`, `--ooops-a11y-panel-radius`, `--ooops-a11y-panel-shadow`.
- Header/actions: `--ooops-a11y-header-gap`, `--ooops-a11y-header-padding`, `--ooops-a11y-header-action-gap`, `--ooops-a11y-close-size`, `--ooops-a11y-reset-min-height`.
- Grid/cards: `--ooops-a11y-grid-columns`, `--ooops-a11y-grid-gap`, `--ooops-a11y-card-min-height`, `--ooops-a11y-card-padding`, `--ooops-a11y-card-radius`, `--ooops-a11y-card-border-width`.
- Icons/ranges: `--ooops-a11y-trigger-size`, `--ooops-a11y-trigger-icon-size`, `--ooops-a11y-icon-wrap-size`, `--ooops-a11y-control-icon-size`, `--ooops-a11y-range-gap`, `--ooops-a11y-range-control-gap`, `--ooops-a11y-range-button-size`.

`ACCESSIBILITY_MENU_PARTS` and `AccessibilityPartClasses` expose the canonical atomic part contract shared by Astro and Svelte.

## Headless sidebar/settings page

Use the controller directly when the UI should not be a floating modal. This example keeps the settings permanently visible in a sidebar and owns all markup and styling:

```html
<aside aria-labelledby="accessibility-settings-title">
	<h2 id="accessibility-settings-title">Accessibility settings</h2>
	<label>
		<input id="high-contrast" type="checkbox" />
		High contrast
	</label>
	<label for="font-scale">Font size</label>
	<input id="font-scale" type="range" min="80" max="200" step="10" />
	<output id="font-scale-value" for="font-scale"></output>
	<button id="reset-accessibility" type="button">Reset</button>
</aside>

<script type="module">
	import {createAccessibilityController} from '@ooopsstudio/accessibility'

	const controller = createAccessibilityController()
	const contrast = document.querySelector('#high-contrast')
	const scale = document.querySelector('#font-scale')
	const value = document.querySelector('#font-scale-value')

	const render = (preferences) => {
		contrast.checked = preferences.highContrast
		scale.value = String(preferences.fontScale)
		value.value = `${preferences.fontScale}%`
	}

	contrast.addEventListener('change', () => controller.setPreference('highContrast', contrast.checked))
	scale.addEventListener('input', () => controller.setPreference('fontScale', Number(scale.value)))
	document.querySelector('#reset-accessibility').addEventListener('click', () => controller.reset())
	const unsubscribe = controller.subscribe(render)
	render(controller.getPreferences())

	// Call both when the owning page/component is destroyed.
	window.addEventListener('pagehide', () => {
		unsubscribe()
		controller.destroy()
	}, {once: true})
</script>
```

The headless route is the correct choice for a sidebar, settings page, command palette, native-app panel, or any interaction that should not use the adapters' button/dialog shell.

## Localization

Built-in English and Greek copy is available through `getAccessibilityLabels('en' | 'el')` and `getAccessibilityControls('en' | 'el')`. Adapter-level `labels` and custom control definitions can override every string.

Persistence is best-effort: blocked or quota-limited storage never prevents the active in-memory preference from being applied to the document.

## Optional editor metadata

Install `@ooopsstudio/accessibility-editor-manifests` when these preferences need to be exposed to Ooops Editor. The headless runtime itself has no editor-contract dependency.

## Focus Helpers

```ts
import {createModalFocusController} from '@ooopsstudio/accessibility'

const modal = document.querySelector<HTMLElement>('[role="dialog"]')
const trigger = document.querySelector<HTMLElement>('[aria-controls]')
const focus = createModalFocusController({
	getContainer: () => modal,
	getRestoreFocusTo: () => trigger,
	onEscape: () => closeModal()
})

focus.setOpen(true)
focus.setOpen(false)
```

The modal controller traps Tab/Shift+Tab, restores focus, and can temporarily set sibling elements to `inert`.

## Reduced Motion

```ts
import {shouldReduceMotion, watchReducedMotion} from '@ooopsstudio/accessibility'

if (shouldReduceMotion()) {
	// Skip non-essential animation.
}

const stop = watchReducedMotion((reduced) => {
	console.log({reduced})
})
```

## Accessibility Scope

This package provides user preference tooling and focus primitives. It does not guarantee full WCAG compliance for project-specific content, forms, media, layout, color choices, or interaction design.

## Development

```sh
pnpm --filter @ooopsstudio/accessibility test
pnpm --filter @ooopsstudio/accessibility build
pnpm --filter @ooopsstudio/accessibility pack:dry
```

## License

MIT
