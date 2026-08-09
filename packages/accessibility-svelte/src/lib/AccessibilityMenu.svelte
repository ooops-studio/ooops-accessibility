<script lang="ts">
	import {
		ACCESSIBILITY_TRIGGER_ICON,
		DEFAULT_ACCESSIBILITY_PREFERENCES,
		DEFAULT_ACCESSIBILITY_STORAGE_KEY,
		accessibilityGlobalStyles,
		accessibilityMenuStyles,
		clearAccessibilityPreferences,
		createAccessibilityController,
		createFocusTrap,
		fitAccessibilityPanelToViewport,
		getAccessibilityIconDefinition,
		getAccessibilityControls,
		getAccessibilityLabels,
		type AccessibilityController,
		type AccessibilityPreferences,
		type AccessibilityRangeKey,
		type AccessibilityToggleKey,
		type FocusTrap
	} from '@ooopsstudio/accessibility'
	import Part from '@ooopsstudio/ui-svelte/Part.svelte'
	import {tick} from 'svelte'
	import AccessibilityIcon from './AccessibilityIcon.svelte'

	import type {
		AccessibilityMenuProps,
		AccessibilityMenuRenderContext
	} from './types.js'

	let {
		enabled = true,
		label = undefined,
		locale = 'en',
		position = 'bottom-right',
		storageKey = DEFAULT_ACCESSIBILITY_STORAGE_KEY,
		className = '',
		classNames = {},
		style = undefined,
		panelId = 'ooops-accessibility-panel',
		controls: suppliedControls = undefined,
		labels = undefined,
		includeBaseStyles = true,
		includeGlobalEffects = true,
		trigger: triggerSnippet = undefined,
		menu = undefined,
		header = undefined,
		beforeControls = undefined,
		afterControls = undefined,
		footer = undefined,
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
	let hasManagedRuntime = false

	const localizedLabels = $derived(getAccessibilityLabels(locale))
	const resolvedLabels = $derived(getAccessibilityLabels(locale, {
		...labels,
		title: label ?? labels?.title ?? localizedLabels.title
	}))
	const controls = $derived(suppliedControls ?? getAccessibilityControls(locale))
	const styleMarkup = $derived(enabled && (includeBaseStyles || includeGlobalEffects)
		? `<style data-ooops-a11y-styles>${includeGlobalEffects ? accessibilityGlobalStyles : ''}${includeBaseStyles ? accessibilityMenuStyles : ''}</style>`
		: '')

	$effect(() => {
		if (!enabled) {
			if (hasManagedRuntime) {
				clearAccessibilityPreferences(document.documentElement)
				hasManagedRuntime = false
			}
			return
		}

		hasManagedRuntime = true
		controller = createAccessibilityController({storageKey, onChange})
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
		const fitOpenPanel = () => {
			if (open && panel) fitAccessibilityPanelToViewport(panel)
		}
		document.addEventListener('pointermove', updateReadingGuide, {passive: true})
		window.addEventListener('resize', fitOpenPanel)

		return () => {
			document.removeEventListener('pointermove', updateReadingGuide)
			window.removeEventListener('resize', fitOpenPanel)
			unsubscribe()
			focusTrap?.destroy()
			controller?.destroy()
			focusTrap = null
			controller = null
			open = false
		}
	})

	async function openPanel() {
		if (!enabled || open) return
		open = true
		await tick()
		if (panel) fitAccessibilityPanelToViewport(panel)
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
		if (open) closePanel()
		else void openPanel()
	}

	function togglePreference(key: AccessibilityToggleKey) {
		controller?.toggle(key)
	}

	function stepPreference(key: AccessibilityRangeKey, direction: -1 | 1) {
		controller?.stepRange(key, direction)
	}

	function resetPreferences() {
		controller?.reset()
	}

	const renderContext = $derived<AccessibilityMenuRenderContext>({
		open,
		preferences,
		close: closePanel,
		reset: resetPreferences,
		toggle: togglePreference,
		step: stepPreference
	})
</script>

<svelte:head>
	{@html styleMarkup}
</svelte:head>

{#if enabled}
	<div
		class={`ooops-a11y-widget ooops-a11y-widget-${position} ${className} ${classNames.widget ?? ''}`.trim()}
		{style}
		lang={locale}
		data-ooops-a11y-widget
		data-part="root"
	>
		<button
			bind:this={trigger}
			type="button"
			class={`ooops-a11y-trigger ${classNames.trigger ?? ''}`.trim()}
			aria-controls={panelId}
			aria-expanded={open}
			data-part="trigger"
			onclick={togglePanel}
		>
			<span class={`sr-only ${classNames.triggerLabel ?? ''}`.trim()} data-part="trigger-label">{resolvedLabels.open}</span>
			{#if triggerSnippet}
				{@render triggerSnippet(open)}
			{:else}
				<AccessibilityIcon icon={ACCESSIBILITY_TRIGGER_ICON} className={`ooops-a11y-trigger-icon ${classNames.triggerIcon ?? ''}`.trim()} dataPart="trigger-icon" />
			{/if}
		</button>
		<button
			type="button"
			class={`ooops-a11y-overlay ${classNames.overlay ?? ''}`.trim()}
			aria-hidden="true"
			tabindex="-1"
			hidden={!open}
			data-part="overlay"
			onclick={closePanel}
		></button>
		<div
			bind:this={panel}
			id={panelId}
			class={`ooops-a11y-panel ${classNames.panel ?? ''}`.trim()}
			role="dialog"
			aria-modal="true"
			aria-label={resolvedLabels.title}
			tabindex="-1"
			hidden={!open}
			data-part="content"
		>
			{#if menu}
				{@render menu(renderContext)}
			{:else}
				<Part part="header" as="header" class={`ooops-a11y-header ${classNames.header ?? ''}`.trim()}>
					{#if header}
						{@render header(renderContext)}
					{:else}
						<div class={`ooops-a11y-header-content ${classNames.headerContent ?? ''}`.trim()} data-part="header-content">
							<span class={`ooops-a11y-eyebrow ${classNames.eyebrow ?? ''}`.trim()}>{resolvedLabels.eyebrow}</span>
							<h2 id={`${panelId}-title`} class={classNames.title}>{resolvedLabels.title}</h2>
						</div>
					{/if}
					<div class={`ooops-a11y-header-actions ${classNames.headerActions ?? ''}`.trim()} data-part="header-actions">
						<button type="button" class={`ooops-a11y-reset ${classNames.reset ?? ''}`.trim()} data-part="reset" onclick={resetPreferences}>{resolvedLabels.reset}</button>
						<button bind:this={closeButton} type="button" class={`ooops-a11y-close ${classNames.close ?? ''}`.trim()} data-part="close" onclick={closePanel}>
							<span class={`ooops-a11y-close-icon ${classNames.closeIcon ?? ''}`.trim()} data-part="close-icon" aria-hidden="true">×</span>
							<span class={`sr-only ${classNames.closeLabel ?? ''}`.trim()} data-part="close-label">{resolvedLabels.close}</span>
						</button>
					</div>
				</Part>
				{#if beforeControls}{@render beforeControls(renderContext)}{/if}
				<Part part="items" class={`ooops-a11y-grid ${classNames.grid ?? ''}`.trim()}>
					{#each controls as control (control.key)}
						{#if control.type === 'range'}
							<Part part="item" class={`ooops-a11y-card ooops-a11y-range ${classNames.item ?? ''} ${classNames.card ?? ''} ${classNames.range ?? ''}`.trim()} data-ooops-a11y-range={control.key}>
								<span class={`ooops-a11y-control-title ${classNames.controlTitle ?? ''}`.trim()} data-part="control-title">{control.label}</span>
								<div class={`ooops-a11y-range-controls ${classNames.rangeControls ?? ''}`.trim()} data-part="range-controls">
									<button type="button" class={`ooops-a11y-range-button ${classNames.rangeButton ?? ''}`.trim()} data-part="range-button" aria-label={`${resolvedLabels.decrease} ${control.label}`} onclick={() => stepPreference(control.key, -1)}>−</button>
									<span class={`ooops-a11y-value ${classNames.value ?? ''}`.trim()} data-part="value" aria-live="polite" aria-atomic="true">{preferences[control.key]}%</span>
									<button type="button" class={`ooops-a11y-range-button ${classNames.rangeButton ?? ''}`.trim()} data-part="range-button" aria-label={`${resolvedLabels.increase} ${control.label}`} onclick={() => stepPreference(control.key, 1)}>+</button>
								</div>
							</Part>
						{:else}
							<button type="button" class={`ooops-a11y-card ooops-a11y-toggle ${classNames.item ?? ''} ${classNames.card ?? ''} ${classNames.toggle ?? ''}`.trim()} aria-pressed={preferences[control.key]} data-part="item" onclick={() => togglePreference(control.key)}>
								<span class={`ooops-a11y-icon-wrap ${classNames.iconWrap ?? ''}`.trim()} data-part="icon-wrap" aria-hidden="true">
									{#if control.icon}
										{control.icon}
									{:else}
										<AccessibilityIcon icon={getAccessibilityIconDefinition(control.key)} className={`ooops-a11y-control-icon ${classNames.controlIcon ?? ''}`.trim()} dataPart="control-icon" />
									{/if}
								</span>
								<span class={`ooops-a11y-toggle-label ${classNames.toggleLabel ?? ''}`.trim()} data-part="toggle-label">{control.label}</span>
							</button>
						{/if}
					{/each}
				</Part>
				{#if afterControls}{@render afterControls(renderContext)}{/if}
				{#if footer}{@render footer(renderContext)}{/if}
			{/if}
		</div>
	</div>
{/if}
