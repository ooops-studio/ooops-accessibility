export {default as AccessibilityMenu} from './AccessibilityMenu.svelte'
export {default as SkipLink} from './SkipLink.svelte'
export {defaultAccessibilityLabels} from './types.js'
export type {
	AccessibilityLabels,
	AccessibilityMenuProps,
	AccessibilityPosition,
	SkipLinkProps
} from './types.js'
export {
	createAccessibilityHeadScript,
	type AccessibilityControlDefinition,
	type AccessibilityPreferences
} from '@ooopsstudio/accessibility'
