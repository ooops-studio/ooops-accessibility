# Ooops Accessibility

Reusable accessibility preference tooling for websites and product interfaces. The monorepo keeps preference state, persistence, DOM effects and focus behavior in a framework-neutral core, then exposes thin Astro 7 and Svelte 5 adapters for markup and initialization.

These packages help projects provide user-controlled presentation and interaction preferences. They do not replace semantic HTML, keyboard support, accessible content, testing with assistive technology or a project-level WCAG review.

## Packages

| Package | Purpose |
| --- | --- |
| [`@ooopsstudio/accessibility`](packages/accessibility) | Headless preference controller, persistence, DOM effects, focus helpers and reduced-motion utilities. |
| [`@ooopsstudio/accessibility-astro`](packages/accessibility-astro) | Themeable Astro components for no-flash initialization, the accessibility menu and a skip link. |
| [`@ooopsstudio/accessibility-svelte`](packages/accessibility-svelte) | Themeable Svelte components for the accessibility menu and skip link. |
| [`@ooopsstudio/accessibility-editor-manifests`](packages/accessibility-editor-manifests) | Optional editor manifests for accessibility preferences and Astro components. |

All packages are public on npm under the [`@ooopsstudio`](https://www.npmjs.com/org/ooopsstudio) scope.

## Install

For the framework-neutral runtime:

```sh
pnpm add @ooopsstudio/accessibility
```

For Astro components:

```sh
pnpm add @ooopsstudio/accessibility @ooopsstudio/accessibility-astro
```

For Svelte components:

```sh
pnpm add @ooopsstudio/accessibility @ooopsstudio/accessibility-svelte
```

## Core usage

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

The runtime supports font scale, line height, letter spacing, contrast, monochrome, highlighted titles and links, large cursor, reading guide, focus highlighting, paused animations and hidden media. Project CSS remains responsible for the final visual design.

## Astro usage

```astro
---
import AccessibilityHead from '@ooopsstudio/accessibility-astro/AccessibilityHead.astro'
import AccessibilityMenu from '@ooopsstudio/accessibility-astro/AccessibilityMenu.astro'
import SkipLink from '@ooopsstudio/accessibility-astro/SkipLink.astro'
---

<AccessibilityHead />
<SkipLink href="#main-content" />
<AccessibilityMenu position="bottom-right" />
```

The adapter is generic and override-friendly. It does not depend on Stage, application content, Cloudflare or a fixed design system.

## Svelte usage

```svelte
<script lang="ts">
  import {AccessibilityMenu, SkipLink} from '@ooopsstudio/accessibility-svelte'
</script>

<SkipLink href="#main-content" />
<AccessibilityMenu position="bottom-right" />
```

The Svelte adapter uses the same core preference controller and focus trap as the other integrations.

## Styling and custom layouts

Both adapters share one atomic `AccessibilityPartClasses` contract and the same layout CSS variables. Use the default menu for a ready-made floating interface, set `includeBaseStyles={false}` with a complete Astro slot or Svelte snippet for an unstyled dialog, or use `createAccessibilityController()` directly for a permanent sidebar/settings page. The package READMEs include complete examples and the Astro behavior-attribute contract.

See each package README for its complete API, styling hooks and development commands.

## Requirements

- Node.js 22.14.0 or newer
- pnpm 11.13.1

## Development

```sh
pnpm install
pnpm -w validate
```

The validation pipeline covers manifests, dependency policy, linting, types, builds, unit tests, size budgets, dependency boundaries, publish shape and package readiness. It also packs all three public packages, installs them into real Astro and Svelte consumer applications, and runs the shared Playwright adapter contract, Axe checks and desktop/mobile visual captures.

## Releases

Changesets and the repository release workflow publish public packages to npm with provenance. Add a changeset for user-visible package changes.

## License

MIT
