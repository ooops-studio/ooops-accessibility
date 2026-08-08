# @ooopsstudio/accessibility-astro

Astro adapter components for `@ooopsstudio/accessibility`.

The package is generic and themeable. It does not include Stage-specific behavior, routes, CMS assumptions, Cloudflare logic, or a fixed design system.

## Install

```sh
pnpm add @ooopsstudio/accessibility @ooopsstudio/accessibility-astro
```

## Components

### `AccessibilityHead.astro`

Injects the no-flash preference bootstrap script and, optionally, global effect styles.

```astro
---
import AccessibilityHead from '@ooopsstudio/accessibility-astro/AccessibilityHead.astro'
---

<head>
	<AccessibilityHead />
</head>
```

### `AccessibilityMenu.astro`

Renders a generic accessible menu powered by the headless controller.

```astro
---
import AccessibilityMenu from '@ooopsstudio/accessibility-astro/AccessibilityMenu.astro'
---

<AccessibilityMenu position="bottom-right" />
```

Useful props:

- `enabled`
- `label`
- `position`
- `storageKey`
- `panelId`
- `controls`
- `labels`
- `includeBaseStyles`
- `includeGlobalEffects`

### `SkipLink.astro`

```astro
---
import SkipLink from '@ooopsstudio/accessibility-astro/SkipLink.astro'
---

<SkipLink href="#main-content" />
```

## Styling

The components expose CSS strings for projects that want manual style placement:

```ts
import {
	accessibilityGlobalStyles,
	accessibilityMenuStyles,
	skipLinkStyles
} from '@ooopsstudio/accessibility-astro'
```

The default classes are prefixed with `ooops-a11y-*` and are safe to override in a project stylesheet.

## Editor metadata

`@ooopsstudio/accessibility-astro/editor` exports v2 manifests for `AccessibilityHead`, `AccessibilityMenu` and `SkipLink`, plus the canonical preference manifest from the headless package.

## Development

```sh
pnpm --filter @ooopsstudio/accessibility-astro test
pnpm --filter @ooopsstudio/accessibility-astro build
pnpm --filter @ooopsstudio/accessibility-astro pack:dry
```

## License

MIT
