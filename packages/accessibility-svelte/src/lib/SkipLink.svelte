<script lang="ts">
	import {getAccessibilityLabels, skipLinkStyles} from '@ooopsstudio/accessibility'
	import type {SkipLinkProps} from './types.js'

	let {
		href = '#main-content',
		label = undefined,
		locale = 'en',
		className = '',
		includeBaseStyles = true
	}: SkipLinkProps = $props()

	const resolvedLabel = $derived(label ?? getAccessibilityLabels(locale).skip)
	const styleMarkup = $derived(includeBaseStyles ? `<style data-ooops-a11y-skip-link>${skipLinkStyles}</style>` : '')
</script>

<svelte:head>{@html styleMarkup}</svelte:head>
<a class={`ooops-skip-link ${className}`.trim()} {href} lang={locale} data-part="root">{resolvedLabel}</a>
