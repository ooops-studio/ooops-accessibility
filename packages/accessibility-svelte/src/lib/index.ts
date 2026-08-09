export {default as AccessibilityMenu} from './AccessibilityMenu.svelte'
export {default as AccessibilityHead} from './AccessibilityHead.svelte'
export {default as SkipLink} from './SkipLink.svelte'
export {defaultAccessibilityLabels} from './types.js'
export {
	ACCESSIBILITY_MENU_PARTS,
	accessibilityGlobalStyles,
	accessibilityMenuStyles,
	getAccessibilityControls,
	getAccessibilityLabels,
	skipLinkStyles
} from '@ooopsstudio/accessibility'
export {ACCESSIBILITY_LABELS} from '@ooopsstudio/accessibility'
export type {
	AccessibilityHeadProps,
	AccessibilityLabels,
	AccessibilityLocale,
	AccessibilityMenuRenderContext,
	AccessibilityMenuProps,
	AccessibilityMenuPart,
	AccessibilityPartClasses,
	AccessibilityPosition,
	SkipLinkProps
} from './types.js'
export {
	createAccessibilityHeadScript,
	type AccessibilityControlDefinition,
	type AccessibilityPreferences
} from '@ooopsstudio/accessibility'
