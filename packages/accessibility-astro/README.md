# @ooopsstudio/accessibility-astro

Astro adapter components for `@ooopsstudio/accessibility`.

The package is generic and themeable. It does not include Stage-specific behavior, routes, CMS assumptions, Cloudflare logic, or a fixed design system.

## Install

```sh
pnpm add @ooopsstudio/accessibility @ooopsstudio/accessibility-astro @ooopsstudio/ui-astro
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

<AccessibilityMenu locale="el" position="top-right" />
```

Useful props:

- `enabled`
- `label`
- `position`
- `locale` (`en` or `el`)
- `storageKey`
- `panelId`
- `controls`
- `labels`
- `classNames` and `style`
- `includeBaseStyles`
- `includeGlobalEffects`

Positions are `bottom-left`, `bottom-right`, `top-left`, `top-right`, and `inline`.

The trigger and menu can be customized without replacing the accessible button/dialog shell. Available named slots are `trigger`, `menu`, `header`, `before-controls`, `after-controls`, and `footer`. `classNames` exposes every stable part and `includeBaseStyles={false}` enables a fully custom visual theme.

```astro
<AccessibilityMenu locale="el" position="inline" classNames={{trigger: 'site-a11y-button'}}>
	<span slot="trigger">Α11y</span>
	<p slot="footer">Οι επιλογές αποθηκεύονται σε αυτή τη συσκευή.</p>
</AccessibilityMenu>
```

### Complete unstyled menu

```astro
<AccessibilityMenu
	position="inline"
	includeBaseStyles={false}
	classNames={{widget: 'settings-launcher', trigger: 'settings-trigger', panel: 'settings-panel'}}
>
	<span slot="trigger" aria-hidden="true">Display settings</span>
	<div slot="menu" class="settings-menu">
		<h2>Display settings</h2>
		<button type="button" data-ooops-a11y-toggle="highContrast" aria-pressed="false">Contrast</button>
		<button type="button" data-ooops-a11y-step="fontScale" data-direction="-1">Smaller text</button>
		<output data-ooops-a11y-value="fontScale">100%</output>
		<button type="button" data-ooops-a11y-step="fontScale" data-direction="1">Larger text</button>
		<button type="button" data-ooops-a11y-reset>Reset</button>
		<button type="button" data-ooops-a11y-close>Close</button>
	</div>
</AccessibilityMenu>
```

The package still owns the accessible trigger, modal dialog, focus trap, Escape behavior, and focus restoration. The consumer owns every visible element inside the slots and must supply all CSS when base styles are disabled.

### Astro behavior attributes

Astro slots are static, so custom controls connect to the controller through the public `data-ooops-a11y-*` behavior contract below. These attributes are the JavaScript integration API for custom slot content; `data-part` and `ooops-a11y-*` classes are styling/editor hooks and do not attach behavior.

| Attribute | Behavior |
| --- | --- |
| `data-ooops-a11y-toggle="highContrast"` | Toggles a boolean preference and synchronizes `aria-pressed`. |
| `data-ooops-a11y-step="fontScale"` with `data-direction="-1"` or `"1"` | Decreases or increases a range preference. |
| `data-ooops-a11y-value="fontScale"` | Receives the current percentage text after every change. |
| `data-ooops-a11y-reset` | Restores all default preferences. |
| `data-ooops-a11y-close` | Closes the dialog and restores focus to its trigger. |

Valid toggle keys are `highContrast`, `monochrome`, `highlightTitles`, `highlightLinks`, `largeCursor`, `readingGuide`, `focusHighlight`, `pauseAnimations`, and `hideMedia`. Valid range keys are `fontScale`, `lineHeight`, and `letterSpacing`. Use semantic `<button type="button">` elements for actions. A step direction of `-1` decrements; every other value increments. Add `aria-live="polite"` to a custom value/output node when changes should be announced.

Behavior nodes must be descendants of the `AccessibilityMenu` when it initializes. The adapter binds them on initial page load and again on `astro:page-load`, then removes listeners and controller state on `astro:before-swap`. It does not observe later DOM insertions. If a separate client runtime inserts or owns controls after initialization, use `createAccessibilityController()` directly instead of relying on the static slot binding.

The shell attributes `data-ooops-a11y-widget`, `data-ooops-a11y-config`, `data-ooops-a11y-trigger`, `data-ooops-a11y-panel`, and `data-ooops-a11y-overlay` are adapter-owned internals. Consumers should not duplicate or move them; use slots, `classNames`, or the headless controller instead.

### Astro styling and editor parts

`data-part` identifies presentational/editor parts only. The rendered primary Ooops UI values are `root`, `trigger`, `trigger-label`, `trigger-icon`, `overlay`, `content`, `header`, `header-content`, `header-actions`, `reset`, `close`, `close-icon`, `close-label`, `items`, `item`, `control-title`, `range-controls`, `range-button`, `value`, `icon-wrap`, `control-icon`, and `toggle-label`.

The `classNames` API is intentionally more granular. Its canonical names are `widget`, `trigger`, `triggerLabel`, `triggerIcon`, `overlay`, `panel`, `header`, `headerContent`, `headerActions`, `eyebrow`, `title`, `reset`, `close`, `closeIcon`, `closeLabel`, `grid`, `item`, `card`, `toggle`, `iconWrap`, `controlIcon`, `toggleLabel`, `range`, `controlTitle`, `rangeControls`, `rangeButton`, and `value`. In the Ooops UI mapping, `panel` corresponds to `data-part="content"`, while `grid` corresponds to `data-part="items"`.

Some elements represent more than one atomic part—for example, a toggle is also an item and a card. In those cases the stable `ooops-a11y-*` classes and matching `classNames` entries expose the additional parts while `data-part` supplies the primary Ooops UI part. Prefer `classNames` when a consumer needs a distinct hook for every atomic part; use `data-part` when integrating with the shared Ooops UI/editor vocabulary.

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

The default classes are prefixed with `ooops-a11y-*`, follow the shared Ooops UI `data-part` contract, and are safe to override in a project stylesheet. The effect CSS comes from the headless package and is identical in Astro and Svelte.

The `classNames` prop uses the shared `AccessibilityPartClasses` type. Atomic hooks include trigger/close labels and icons, header content/actions, items/cards, control titles, range buttons/values, icon wrappers, control icons, and toggle labels. Pass `includeBaseStyles={false}` when replacing the entire visual system.

## Optional editor metadata

`@ooopsstudio/accessibility-editor-manifests` exports the visual-editor manifests for `AccessibilityHead`, `AccessibilityMenu` and `SkipLink`. The Astro adapter itself remains editor-independent.

## Development

```sh
pnpm --filter @ooopsstudio/accessibility-astro test
pnpm --filter @ooopsstudio/accessibility-astro build
pnpm --filter @ooopsstudio/accessibility-astro pack:dry
```

## License

MIT
