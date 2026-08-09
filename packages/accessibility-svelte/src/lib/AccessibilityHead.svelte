<script lang="ts">
	import {
		accessibilityGlobalStyles,
		createAccessibilityHeadScript
	} from '@ooopsstudio/accessibility'
	import type {AccessibilityHeadProps} from './types.js'

	let {
		enabled = true,
		storageKey = undefined,
		includeGlobalEffects = true,
		defaults = undefined
	}: AccessibilityHeadProps = $props()

	const headMarkup = $derived(enabled
		? `<script>${createAccessibilityHeadScript({storageKey, defaults})}<\/script>${includeGlobalEffects ? `<style data-ooops-a11y-effects>${accessibilityGlobalStyles}</style>` : ''}`
		: '')
</script>

<svelte:head>
	{@html headMarkup}
</svelte:head>
