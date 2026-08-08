# @ooopsstudio/accessibility-svelte

Svelte 5 components powered by the framework-neutral `@ooopsstudio/accessibility` runtime.

The adapter owns markup and Svelte lifecycle integration. Preference state, persistence, DOM effects, focus containment and keyboard behavior remain in the core package.

## Install

```sh
pnpm add @ooopsstudio/accessibility @ooopsstudio/accessibility-svelte
```

## Usage

```svelte
<script lang="ts">
  import {
    AccessibilityMenu,
    SkipLink
  } from '@ooopsstudio/accessibility-svelte'
</script>

<SkipLink href="#main-content" />
<AccessibilityMenu position="bottom-right" />
```

`AccessibilityMenu` renders an accessible modal dialog, persists preferences through the core controller, traps focus while open, closes on Escape and restores focus to its trigger.

Useful props include `enabled`, `label`, `position`, `storageKey`, `panelId`, `controls`, `labels`, `className`, `onChange` and `onOpenChange`.

## No-flash initialization

For server-rendered SvelteKit sites, inject the core bootstrap script into the initial document response. For example, a server hook can call `createAccessibilityHeadScript`, which this package re-exports, and place its result before application styles run.

```ts
import {createAccessibilityHeadScript} from '@ooopsstudio/accessibility-svelte'

const script = createAccessibilityHeadScript()
```

Avoid adding the script only after hydration: that can briefly render default preferences before saved preferences are applied.

## Styling

The components include generic base styles and expose stable `ooops-a11y-*` class hooks plus project design tokens such as `--color-accent`, `--color-surface`, `--color-text`, `--color-border` and `--color-focus-ring`.

## Requirements

- Svelte 5
- Node.js 22.14.0 or newer

## Development

```sh
pnpm --filter @ooopsstudio/accessibility-svelte test
pnpm --filter @ooopsstudio/accessibility-svelte build
pnpm --filter @ooopsstudio/accessibility-svelte pack:dry
```

## License

MIT
