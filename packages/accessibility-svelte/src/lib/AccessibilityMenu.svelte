<script lang="ts">
	import {
		DEFAULT_ACCESSIBILITY_CONTROLS,
		DEFAULT_ACCESSIBILITY_PREFERENCES,
		DEFAULT_ACCESSIBILITY_STORAGE_KEY,
		createAccessibilityController,
		createFocusTrap,
		type AccessibilityController,
		type AccessibilityPreferences,
		type AccessibilityRangeKey,
		type AccessibilityToggleKey,
		type FocusTrap
	} from '@ooopsstudio/accessibility'
	import {onMount, tick} from 'svelte'

	import {
		defaultAccessibilityLabels,
		type AccessibilityLabels,
		type AccessibilityMenuProps
	} from './types.js'

	let {
		enabled = true,
		label = undefined,
		position = 'bottom-right',
		storageKey = DEFAULT_ACCESSIBILITY_STORAGE_KEY,
		className = '',
		panelId = 'ooops-accessibility-panel',
		controls = DEFAULT_ACCESSIBILITY_CONTROLS,
		labels = undefined,
		onChange = undefined,
		onOpenChange = undefined
	}: AccessibilityMenuProps = $props()

	let panel = $state<HTMLElement>()
	let trigger = $state<HTMLButtonElement>()
	let closeButton = $state<HTMLButtonElement>()
	let controller: AccessibilityController | null = null
	let focusTrap: FocusTrap | null = null
	let open = $state(false)
	let preferences = $state<AccessibilityPreferences>({...DEFAULT_ACCESSIBILITY_PREFERENCES})
	const resolvedLabels = $derived<AccessibilityLabels>({
		...defaultAccessibilityLabels,
		...labels,
		title: label ?? labels?.title ?? defaultAccessibilityLabels.title
	})

	onMount(() => {
		controller = createAccessibilityController({
			storageKey,
			onChange
		})
		preferences = controller.getPreferences()
		const unsubscribe = controller.subscribe((next) => {
			preferences = next
		})

		focusTrap = createFocusTrap({
			getContainer: () => panel,
			getRoot: () => panel?.closest('[data-ooops-a11y-widget]') as HTMLElement | null,
			getInitialFocus: () => closeButton,
			getRestoreFocusTo: () => trigger,
			modal: true,
			onEscape: closePanel
		})

		const updateReadingGuide = (event: PointerEvent) => {
			if (controller?.getPreferences().readingGuide) {
				controller.updateReadingGuide(event.clientY)
			}
		}
		document.addEventListener('pointermove', updateReadingGuide)

		return () => {
			document.removeEventListener('pointermove', updateReadingGuide)
			unsubscribe()
			focusTrap?.destroy()
			controller?.destroy()
			focusTrap = null
			controller = null
		}
	})

	async function openPanel() {
		if (open) return
		open = true
		await tick()
		focusTrap?.activate()
		onOpenChange?.(true)
	}

	function closePanel() {
		if (!open) return
		focusTrap?.deactivate()
		open = false
		onOpenChange?.(false)
	}

	function togglePanel() {
		if (open) {
			closePanel()
			return
		}
		void openPanel()
	}

	function togglePreference(key: AccessibilityToggleKey) {
		controller?.toggle(key)
	}

	function stepPreference(key: AccessibilityRangeKey, direction: -1 | 1) {
		controller?.stepRange(key, direction)
	}
</script>

{#if enabled}
	<div
		class={`ooops-a11y-widget ooops-a11y-widget-${position} ${className}`.trim()}
		data-ooops-a11y-widget
	>
		<button
			bind:this={trigger}
			type="button"
			class="ooops-a11y-trigger"
			aria-controls={panelId}
			aria-expanded={open}
			onclick={togglePanel}
		>
			<span class="sr-only">{resolvedLabels.open}</span>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 3.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-8.25 5.5a1 1 0 0 0 .22 1.98l5.03-.56v3.08l-2.75 7.08a1 1 0 1 0 1.86.74l2.28-5.72h3.22l2.28 5.72a1 1 0 1 0 1.86-.74L15 13.25v-3.08l5.03.56a1 1 0 1 0 .22-1.98L13.2 8h-2.4L3.75 8.75Z" />
			</svg>
		</button>
		<button
			type="button"
			class="ooops-a11y-overlay"
			aria-hidden="true"
			tabindex="-1"
			hidden={!open}
			onclick={closePanel}
		></button>
		<div
			bind:this={panel}
			id={panelId}
			class="ooops-a11y-panel"
			role="dialog"
			aria-modal="true"
			aria-labelledby={`${panelId}-title`}
			tabindex="-1"
			hidden={!open}
		>
			<header class="ooops-a11y-header">
				<div>
					<span class="ooops-a11y-eyebrow">{resolvedLabels.eyebrow}</span>
					<h2 id={`${panelId}-title`}>{resolvedLabels.title}</h2>
				</div>
				<button
					bind:this={closeButton}
					type="button"
					class="ooops-a11y-close"
					onclick={closePanel}
				>
					<span aria-hidden="true">×</span>
					<span class="sr-only">{resolvedLabels.close}</span>
				</button>
			</header>
			<div class="ooops-a11y-grid">
				{#each controls as control (control.key)}
					{#if control.type === 'range'}
						<div class="ooops-a11y-card ooops-a11y-range" data-ooops-a11y-range={control.key}>
							<strong>{control.label}</strong>
							<div class="ooops-a11y-range-controls">
								<button
									type="button"
									aria-label={`${resolvedLabels.decrease} ${control.label}`}
									onclick={() => stepPreference(control.key, -1)}
								>−</button>
								<span aria-live="polite">{preferences[control.key]}%</span>
								<button
									type="button"
									aria-label={`${resolvedLabels.increase} ${control.label}`}
									onclick={() => stepPreference(control.key, 1)}
								>+</button>
							</div>
						</div>
					{:else}
						<button
							type="button"
							class="ooops-a11y-card ooops-a11y-toggle"
							aria-pressed={preferences[control.key]}
							onclick={() => togglePreference(control.key)}
						>
							<span class="ooops-a11y-icon-wrap" aria-hidden="true">
								{control.icon ?? control.label.slice(0, 1)}
							</span>
							<span>{control.label}</span>
						</button>
					{/if}
				{/each}
			</div>
			<button type="button" class="ooops-a11y-reset" onclick={() => controller?.reset()}>
				{resolvedLabels.reset}
			</button>
		</div>
	</div>
{/if}

<style>
	:global(html) {
		--ooops-a11y-font-scale: 1;
		--ooops-a11y-line-height-factor: 1;
		--ooops-a11y-letter-spacing: 0em;
		--ooops-a11y-reading-guide-y: 50vh;
		--ooops-a11y-accent: var(--color-accent, #005fcc);
	}

	:global(html.ooops-a11y-ready) {
		font-size: calc(100% * var(--ooops-a11y-font-scale));
	}

	:global(html.ooops-a11y-ready :where(body, p, li, a, button, input, textarea, select, label, span, strong, small, div)) {
		line-height: calc(var(--line-height-body, 1.6) * var(--ooops-a11y-line-height-factor)) !important;
		letter-spacing: var(--ooops-a11y-letter-spacing) !important;
	}

	:global(html.ooops-a11y-reduce-motion *),
	:global(html.ooops-a11y-reduce-motion *::before),
	:global(html.ooops-a11y-reduce-motion *::after) {
		animation: none !important;
		scroll-behavior: auto !important;
		transition: none !important;
	}

	:global(html.ooops-a11y-monochrome) {
		filter: grayscale(1);
	}

	:global(html.ooops-a11y-hide-media :where(main, #main-content) :where(img, picture, video, canvas, object, embed)) {
		visibility: hidden !important;
	}

	:global(html.ooops-a11y-highlight-links a) {
		color: var(--ooops-a11y-accent) !important;
		text-decoration: underline 2px !important;
		text-underline-offset: 0.16em !important;
	}

	:global(html.ooops-a11y-highlight-titles :where(h1, h2, h3, h4, h5, h6)) {
		outline: 3px solid var(--ooops-a11y-accent) !important;
		outline-offset: 3px !important;
	}

	:global(html.ooops-a11y-focus-highlight :focus-visible) {
		outline: 4px solid var(--ooops-a11y-accent) !important;
		outline-offset: 4px !important;
	}

	:global(html.ooops-a11y-reading-guide body::after) {
		content: '';
		position: fixed;
		top: calc(var(--ooops-a11y-reading-guide-y) - 2px);
		left: 0;
		z-index: 2147482999;
		width: 100vw;
		height: 4px;
		pointer-events: none;
		background: var(--ooops-a11y-accent);
	}

	:global(html.ooops-a11y-large-cursor),
	:global(html.ooops-a11y-large-cursor *) {
		cursor: zoom-in !important;
	}

	:global(html.ooops-a11y-high-contrast) {
		color-scheme: dark;
		--ooops-a11y-accent: #ffd400;
		--color-bg: #000;
		--color-surface: #050505;
		--color-surface-raised: #050505;
		--color-text: #fff;
		--color-border: #fff;
		--color-accent: #ffd400;
		--color-accent-contrast: #000;
		--color-focus-ring: rgb(255 212 0 / 64%);
	}

	.sr-only {
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

	.ooops-a11y-widget {
		--ooops-a11y-trigger-size: 48px;
		--ooops-a11y-panel-width: min(34rem, calc(100vw - 2.5rem));
		position: fixed;
		bottom: 20px;
		z-index: 1000;
	}

	.ooops-a11y-widget-bottom-left { left: 20px; }
	.ooops-a11y-widget-bottom-right { right: 20px; }

	.ooops-a11y-trigger {
		display: inline-grid;
		place-items: center;
		width: var(--ooops-a11y-trigger-size);
		height: var(--ooops-a11y-trigger-size);
		padding: 0;
		border: 1px solid var(--color-border, currentColor);
		border-radius: 999px;
		background: var(--color-accent, #005fcc);
		color: var(--color-accent-contrast, #fff);
		cursor: pointer;
	}

	.ooops-a11y-trigger svg { width: 24px; height: 24px; fill: currentColor; }

	.ooops-a11y-overlay {
		position: fixed;
		inset: 0;
		z-index: 999;
		border: 0;
		background: rgb(0 0 0 / 16%);
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

	.ooops-a11y-widget-bottom-right .ooops-a11y-panel { right: 0; left: auto; }

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

	.ooops-a11y-header h2 { margin: 0; font-size: 20px; line-height: 1.1; }

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

	.ooops-a11y-toggle,
	.ooops-a11y-range {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		text-align: center;
	}

	.ooops-a11y-toggle { cursor: pointer; }
	.ooops-a11y-toggle[aria-pressed='true'] { border-color: var(--color-accent, #005fcc); }

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
		width: 28px;
		height: 28px;
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
		.ooops-a11y-widget { right: 16px; bottom: 16px; left: 16px; width: auto; }
		.ooops-a11y-widget .ooops-a11y-panel { right: 0; left: 0; width: auto; }
		.ooops-a11y-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	}
</style>
