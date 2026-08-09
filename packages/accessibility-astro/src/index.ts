import {
	accessibilityGlobalStyles as coreAccessibilityGlobalStyles,
	accessibilityMenuStyles as coreAccessibilityMenuStyles,
	skipLinkStyles as coreSkipLinkStyles,
	getAccessibilityControls,
	getAccessibilityLabels,
	type AccessibilityControlDefinition,
	type AccessibilityPartClasses,
	type AccessibilityLabels,
	type AccessibilityLocale,
	type AccessibilityPreferences
} from '@ooopsstudio/accessibility'

export type AccessibilityPosition =
	| 'bottom-left'
	| 'bottom-right'
	| 'top-left'
	| 'top-right'
	| 'inline'

export type AccessibilityHeadProps = {
	enabled?: boolean
	storageKey?: string
	includeGlobalEffects?: boolean
	defaults?: Partial<AccessibilityPreferences>
}

export type AccessibilityMenuProps = {
	enabled?: boolean
	label?: string
	position?: AccessibilityPosition
	storageKey?: string
	class?: string
	panelId?: string
	controls?: AccessibilityControlDefinition[]
	locale?: AccessibilityLocale
	labels?: Partial<AccessibilityLabels>
	classNames?: AccessibilityPartClasses
	style?: string
	includeBaseStyles?: boolean
	includeGlobalEffects?: boolean
}

export type SkipLinkProps = {
	href?: string
	label?: string
	locale?: AccessibilityLocale
	class?: string
	includeBaseStyles?: boolean
}

export const defaultAccessibilityLabels = getAccessibilityLabels('en')

export const accessibilityGlobalStyles = coreAccessibilityGlobalStyles

export {getAccessibilityControls, getAccessibilityLabels}
export {ACCESSIBILITY_MENU_PARTS} from '@ooopsstudio/accessibility'
export type {AccessibilityLabels, AccessibilityLocale}

export const accessibilityMenuStyles = coreAccessibilityMenuStyles
export const skipLinkStyles = coreSkipLinkStyles

const ESCAPED_JSON_CHARACTERS: Record<string, string> = {
	'<': '\\u003c',
	'>': '\\u003e',
	'&': '\\u0026',
	'\u2028': '\\u2028',
	'\u2029': '\\u2029'
}

export const serializeInlineJson = (value: unknown) =>
	JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => ESCAPED_JSON_CHARACTERS[character]!)

export type {
	AccessibilityControlDefinition,
	AccessibilityMenuPart,
	AccessibilityPartClasses,
	AccessibilityPreferences
} from '@ooopsstudio/accessibility'
