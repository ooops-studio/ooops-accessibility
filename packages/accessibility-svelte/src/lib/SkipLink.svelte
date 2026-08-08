<script lang="ts">
	import {defaultAccessibilityLabels, type SkipLinkProps} from './types.js'

	let {
		href = '#main-content',
		label = defaultAccessibilityLabels.skip,
		className = ''
	}: SkipLinkProps = $props()
</script>

<a class={`ooops-skip-link ${className}`.trim()} {href}>{label}</a>

<style>
	.ooops-skip-link {
		position: fixed;
		top: 12px;
		left: 12px;
		z-index: 10000;
		padding: 10px 14px;
		border-radius: 999px;
		background: var(--color-text, CanvasText);
		color: var(--color-surface, Canvas);
		font: inherit;
		font-weight: 700;
		text-decoration: none;
		transform: translateY(-160%);
		transition: transform 160ms ease;
	}

	.ooops-skip-link:focus,
	.ooops-skip-link:focus-visible {
		transform: translateY(0);
	}
</style>
