# @ooopsstudio/accessibility-svelte

Svelte 5 components powered by the framework-neutral `@ooopsstudio/accessibility` runtime.

The adapter owns markup and Svelte lifecycle integration. Preference state, persistence, DOM effects, focus containment and keyboard behavior remain in the core package.

## Install

```sh
pnpm add @ooopsstudio/accessibility @ooopsstudio/accessibility-svelte @ooopsstudio/ui-svelte
```

## Usage

```svelte
<script lang="ts">
  import {
    AccessibilityHead,
    AccessibilityMenu,
    SkipLink
  } from '@ooopsstudio/accessibility-svelte'
</script>

<AccessibilityHead />
<SkipLink href="#main-content" />
<AccessibilityMenu locale="el" position="inline" />
```

`AccessibilityMenu` renders an accessible modal dialog, persists preferences through the core controller, traps focus while open, closes on Escape and restores focus to its trigger.

Useful props include `enabled`, `label`, `locale`, `position`, `storageKey`, `panelId`, `controls`, `labels`, `className`, `classNames`, `style`, `includeBaseStyles`, `includeGlobalEffects`, `onChange` and `onOpenChange`. Positions are `bottom-left`, `bottom-right`, `top-left`, `top-right`, and `inline`.

Svelte 5 snippets can customize `trigger`, the complete `menu`, `header`, `beforeControls`, `afterControls`, and `footer`. A complete custom menu receives the current preferences plus `close`, `reset`, `toggle`, and `step` actions. The semantic trigger and dialog shell remain package-owned.

### Complete unstyled menu

```svelte
<script lang="ts">
	import {AccessibilityMenu, type AccessibilityMenuRenderContext} from '@ooopsstudio/accessibility-svelte'
</script>

{#snippet trigger(_open: boolean)}
	<span aria-hidden="true">Display settings</span>
{/snippet}

{#snippet menu(context: AccessibilityMenuRenderContext)}
	<div class="settings-menu">
		<h2>Display settings</h2>
		<button type="button" aria-pressed={context.preferences.highContrast} onclick={() => context.toggle('highContrast')}>Contrast</button>
		<button type="button" onclick={() => context.step('fontScale', -1)}>Smaller text</button>
		<output>{context.preferences.fontScale}%</output>
		<button type="button" onclick={() => context.step('fontScale', 1)}>Larger text</button>
		<button type="button" onclick={context.reset}>Reset</button>
		<button type="button" onclick={context.close}>Close</button>
	</div>
{/snippet}

<AccessibilityMenu
	position="inline"
	includeBaseStyles={false}
	{trigger}
	{menu}
	classNames={{widget: 'settings-launcher', trigger: 'settings-trigger', panel: 'settings-panel'}}
/>
```

The consumer supplies all visible styling; the package retains the accessible button/dialog shell, focus management, persistence, and preference effects. For a permanent sidebar or settings page, use `createAccessibilityController()` from the core package directly.

## No-flash initialization

For server-rendered SvelteKit sites, render `AccessibilityHead` in the root layout. It writes the defensive bootstrap and canonical global effects into `<head>` before hydration.

```svelte
<script lang="ts">
	import {AccessibilityHead} from '@ooopsstudio/accessibility-svelte'
</script>

<AccessibilityHead storageKey="site.accessibility" />
```

Avoid adding the script only after hydration: that can briefly render default preferences before saved preferences are applied.

## Styling

The components expose stable `ooops-a11y-*` classes, shared Ooops UI `data-part` hooks, and project tokens such as `--color-accent`, `--color-surface`, `--color-text`, `--color-border` and `--color-focus-ring`. Pass `includeBaseStyles={false}` for a completely custom theme.

`AccessibilityPartClasses` is shared with the core and Astro adapter. It includes atomic hooks for trigger/close labels and icons, header content/actions, items/cards, control titles, range buttons/values, icon wrappers, control icons, and toggle labels. Layout geometry is also exposed through the `--ooops-a11y-*` variables documented by `@ooopsstudio/accessibility`.

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
