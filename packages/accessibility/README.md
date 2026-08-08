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

Project CSS decides how those classes look. The Astro adapter includes generic effect styles.

## Editor metadata

`@ooopsstudio/accessibility/editor` exports the versioned preference manifest used by visual tooling. It is generated from the same defaults, controls, classes and CSS variables as the runtime.

## Focus Helpers

```ts
import {createModalFocusController} from '@ooopsstudio/accessibility'

const modal = document.querySelector('[role="dialog"]')
const focus = createModalFocusController(modal, {
	returnFocus: true,
	restoreInert: true,
	onEscape: () => closeModal()
})

focus.open()
focus.close()
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
