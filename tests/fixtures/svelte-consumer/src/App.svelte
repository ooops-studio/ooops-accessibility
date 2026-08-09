<script lang="ts">
	import {
		AccessibilityHead,
		AccessibilityMenu,
		SkipLink,
		type AccessibilityMenuRenderContext,
		type AccessibilityPosition
	} from '@ooopsstudio/accessibility-svelte'
	import {
		DEFAULT_ACCESSIBILITY_PREFERENCES,
		createAccessibilityController,
		type AccessibilityController,
		type AccessibilityLocale,
		type AccessibilityPreferences
	} from '@ooopsstudio/accessibility'

	const path = globalThis.location.pathname
	const locale: AccessibilityLocale = path.startsWith('/locale/el') ? 'el' : 'en'
	const positionSegment = path.includes('/positions/') ? path.split('/').at(-1) : undefined
	const position = (positionSegment ?? (path === '/custom' ? 'inline' : 'bottom-right')) as AccessibilityPosition
	const custom = path === '/custom'
	const headless = path === '/headless'
	const tokenized = path === '/tokens'
	const switchable = path === '/enabled-switch'
	let enabled = $state(!switchable)
	let headlessController: AccessibilityController | null = null
	let headlessReady = $state(false)
	let headlessPreferences = $state<AccessibilityPreferences>({...DEFAULT_ACCESSIBILITY_PREFERENCES})

	$effect(() => {
		if (!headless) return
		headlessController = createAccessibilityController({storageKey: 'ooops.accessibility.headless.svelte'})
		headlessPreferences = headlessController.getPreferences()
		headlessReady = true
		const unsubscribe = headlessController.subscribe((preferences) => {
			headlessPreferences = preferences
		})
		return () => {
			unsubscribe()
			headlessController?.destroy()
			headlessController = null
			headlessReady = false
		}
	})

	function setHeadlessContrast(event: Event) {
		headlessController?.setPreference('highContrast', (event.currentTarget as HTMLInputElement).checked)
	}

	function setHeadlessScale(event: Event) {
		headlessController?.setPreference('fontScale', Number((event.currentTarget as HTMLInputElement).value))
	}

	const copy = $derived(locale === 'el'
		? {
			title: 'Δοκιμή προσβασιμότητας',
			description: 'Πραγματική εφαρμογή Svelte που εγκαθιστά τα πακέτα από tarball.',
			focus: 'Κύρια ενέργεια'
		}
		: {
			title: 'Accessibility test page',
			description: 'Real Svelte application installing the packages from tarballs.',
			focus: 'Primary action'
		})

</script>

{#snippet customTrigger(_open: boolean)}
	<span aria-hidden="true">A11Y Custom</span>
{/snippet}

{#snippet customMenu(context: AccessibilityMenuRenderContext)}
	<div class="fixture-custom-menu">
		<h2>Custom accessibility menu</h2>
		<button type="button" aria-pressed={context.preferences.highContrast} onclick={() => context.toggle('highContrast')}>Custom contrast</button>
		<button type="button" onclick={context.reset}>Custom reset</button>
		<button type="button" onclick={context.close}>Custom close</button>
	</div>
{/snippet}

<svelte:head>
	<title>{copy.title} · Svelte</title>
</svelte:head>

<AccessibilityHead {enabled} storageKey={headless ? 'ooops.accessibility.headless.svelte' : undefined} />
<SkipLink {locale} href="#main-content" />

<main id="main-content" tabindex="-1" data-consumer="svelte" data-page={path.slice(1) || 'default'}>
	<p class="adapter-label">Svelte packed consumer</p>
	<h1>{copy.title}</h1>
	<p>{copy.description}</p>
	<button type="button" class="primary-action">{copy.focus}</button>
	{#if switchable}
		<button type="button" class="host-switch" onclick={() => enabled = !enabled}>
			{enabled ? 'Disable accessibility' : 'Enable accessibility'}
		</button>
	{/if}

	{#if headless}
		<aside class="settings-sidebar" aria-labelledby="accessibility-settings-title" data-headless-settings data-ready={headlessReady ? 'true' : 'false'}>
			<h2 id="accessibility-settings-title">Accessibility settings</h2>
			<label class="toggle-row">
				<input type="checkbox" checked={headlessPreferences.highContrast} onchange={setHeadlessContrast} />
				High contrast
			</label>
			<label for="headless-font-scale">Font size</label>
			<div class="range-row">
				<input id="headless-font-scale" type="range" min="80" max="200" step="10" value={headlessPreferences.fontScale} oninput={setHeadlessScale} />
				<output for="headless-font-scale">{headlessPreferences.fontScale}%</output>
			</div>
			<button type="button" onclick={() => headlessController?.reset()}>Reset settings</button>
		</aside>
	{:else if custom}
		<AccessibilityMenu
			{enabled}
			{locale}
			{position}
			includeBaseStyles={false}
			includeGlobalEffects={false}
			labels={{open: 'Open custom accessibility menu'}}
			trigger={customTrigger}
			menu={customMenu}
			classNames={{widget: 'fixture-custom-widget', trigger: 'fixture-custom-trigger', panel: 'fixture-custom-panel'}}
		/>
	{:else}
		<AccessibilityMenu
			{enabled}
			{locale}
			{position}
			style={tokenized ? '--ooops-a11y-panel-width: 44rem; --ooops-a11y-grid-columns: 4; --ooops-a11y-grid-gap: 4px; --ooops-a11y-card-min-height: 70px; --ooops-a11y-card-radius: 4px;' : undefined}
			includeGlobalEffects={false}
			classNames={{
				triggerIcon: 'fixture-trigger-icon',
				controlTitle: 'fixture-control-title',
				rangeButton: 'fixture-range-button',
				iconWrap: 'fixture-icon-wrap',
				controlIcon: 'fixture-control-icon',
				toggleLabel: 'fixture-toggle-label'
			}}
		/>
	{/if}
</main>

<style>
	:global(:root) {
		--color-bg: #f4f7fb;
		--color-surface: #ffffff;
		--color-surface-raised: #ffffff;
		--color-text: #172033;
		--color-border: #69758c;
		--color-accent: #075ec8;
		--color-accent-contrast: #ffffff;
		--color-focus-ring: #ffb000;
	}

	:global(*) { box-sizing: border-box; }
	:global(body) {
		min-width: 320px;
		min-height: 100vh;
		margin: 0;
		background: var(--color-bg);
		color: var(--color-text);
		font-family: system-ui, sans-serif;
	}
	main {
		width: min(46rem, calc(100% - 3rem));
		margin-inline: auto;
		padding-block: 5rem;
	}
	.adapter-label {
		color: var(--color-accent);
		font-size: .78rem;
		font-weight: 800;
		letter-spacing: .08em;
		text-transform: uppercase;
	}
	h1 { max-width: 18ch; margin-block: .5rem 1rem; font-size: clamp(2rem, 6vw, 4rem); line-height: 1; }
	main > p:not(.adapter-label) { max-width: 42rem; font-size: 1.05rem; }
	.primary-action,
	.host-switch {
		min-height: 44px;
		margin: 1rem .5rem 0 0;
		padding: .65rem 1rem;
		border: 2px solid var(--color-accent);
		border-radius: .75rem;
		background: var(--color-accent);
		color: var(--color-accent-contrast);
		font: inherit;
		font-weight: 750;
	}

	:global(.fixture-custom-widget) { margin-top: 2rem; }
	:global(.fixture-custom-trigger) {
		min-height: 48px;
		padding: .7rem 1rem;
		border: 2px solid #5420a8;
		border-radius: .7rem;
		background: #6e35c7;
		color: #fff;
		font: inherit;
		font-weight: 850;
	}
	:global(.fixture-custom-panel) {
		position: absolute;
		top: calc(100% + .75rem);
		left: 0;
		z-index: 1001;
		width: min(24rem, calc(100vw - 2rem));
		padding: 1rem;
		border: 3px solid #5420a8;
		border-radius: 1rem;
		background: #fff;
		box-shadow: 0 1rem 3rem rgb(32 14 61 / 22%);
	}
	.fixture-custom-menu { display: grid; gap: .75rem; }
	.fixture-custom-menu h2 { margin: 0; }
	.fixture-custom-menu button {
		min-height: 44px;
		border: 2px solid #5420a8;
		border-radius: .6rem;
		background: #fff;
		color: #341568;
		font: inherit;
		font-weight: 750;
	}
	.fixture-custom-menu button[aria-pressed="true"] { background: #5420a8; color: #fff; }
	.settings-sidebar {
		width: min(100%, 22rem);
		margin-top: 2rem;
		padding: 1.25rem;
		border: 2px solid #172033;
		border-radius: .75rem;
		background: #fff;
		box-shadow: .5rem .5rem 0 #b8d4f5;
	}
	.settings-sidebar h2 { margin-block: 0 1.25rem; font-size: 1.35rem; }
	.settings-sidebar label:not(.toggle-row) { display: block; margin-block: 1.25rem .5rem; font-weight: 700; }
	.toggle-row { display: flex; align-items: center; gap: .65rem; }
	.range-row { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: .75rem; }
	.settings-sidebar button { min-height: 44px; margin-top: 1.25rem; padding-inline: 1rem; border: 0; border-radius: .45rem; background: #075ec8; color: #fff; font: inherit; font-weight: 700; }

	@media (max-width: 640px) {
		main { width: min(100% - 2rem, 46rem); padding-block: 3rem; }
		h1 { font-size: 2.35rem; }
		:global(.fixture-custom-panel) {
			position: fixed;
			top: 1rem;
			right: 1rem;
			bottom: auto;
			left: 1rem;
			width: auto;
		}
	}
</style>
