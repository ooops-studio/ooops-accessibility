<script lang="ts">
	import type {AccessibilityIconDefinition} from '@ooopsstudio/accessibility'

	let {icon, className = undefined, dataPart = undefined}: {
		icon: AccessibilityIconDefinition
		className?: string
		dataPart?: string
	} = $props()
</script>

<svg class={className} data-part={dataPart} viewBox={icon.viewBox} aria-hidden="true" focusable="false">
	{#each icon.paths as path}
		<path
			d={path.d}
			fill={path.fill}
			fill-rule={path.fillRule}
			clip-rule={path.clipRule}
			stroke={path.stroke}
			stroke-width={path.strokeWidth}
			stroke-linecap={path.strokeLinecap}
			stroke-linejoin={path.strokeLinejoin}
			opacity={path.opacity}
		></path>
	{/each}
	{#each icon.circles ?? [] as circle}
		<circle
			cx={circle.cx}
			cy={circle.cy}
			r={circle.r}
			fill={circle.fill}
			stroke={circle.stroke}
			stroke-width={circle.strokeWidth}
			opacity={circle.opacity}
		></circle>
	{/each}
</svg>
