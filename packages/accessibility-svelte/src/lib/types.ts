import {getAccessibilityLabels} from '@ooopsstudio/accessibility'
import type {
	AccessibilityControlDefinition,
	AccessibilityPartClasses,
	AccessibilityLabels,
	AccessibilityLocale,
	AccessibilityPreferences,
	AccessibilityRangeKey,
	AccessibilityToggleKey
} from '@ooopsstudio/accessibility'
import type {Snippet} from 'svelte'

export type AccessibilityPosition =
	| 'bottom-left'
	| 'bottom-right'
	| 'top-left'
	| 'top-right'
	| 'inline'

export type AccessibilityMenuRenderContext = {
	open: boolean
	preferences: AccessibilityPreferences
	close: () => void
	reset: () => void
	toggle: (key: AccessibilityToggleKey) => void
	step: (key: AccessibilityRangeKey, direction: -1 | 1) => void
}

export type AccessibilityMenuProps = {
	enabled?: boolean
	label?: string
	locale?: AccessibilityLocale
	position?: AccessibilityPosition
	storageKey?: string
	className?: string
	classNames?: AccessibilityPartClasses
	style?: string
	panelId?: string
	controls?: AccessibilityControlDefinition[]
	labels?: Partial<AccessibilityLabels>
	includeBaseStyles?: boolean
	includeGlobalEffects?: boolean
	trigger?: Snippet<[open: boolean]>
	menu?: Snippet<[context: AccessibilityMenuRenderContext]>
	header?: Snippet<[context: AccessibilityMenuRenderContext]>
	beforeControls?: Snippet<[context: AccessibilityMenuRenderContext]>
	afterControls?: Snippet<[context: AccessibilityMenuRenderContext]>
	footer?: Snippet<[context: AccessibilityMenuRenderContext]>
	onChange?: (preferences: AccessibilityPreferences) => void
	onOpenChange?: (open: boolean) => void
}

export type AccessibilityHeadProps = {
	enabled?: boolean
	storageKey?: string
	includeGlobalEffects?: boolean
	defaults?: Partial<AccessibilityPreferences>
}

export type SkipLinkProps = {
	href?: string
	label?: string
	locale?: AccessibilityLocale
	className?: string
	includeBaseStyles?: boolean
}

export type {
	AccessibilityLabels,
	AccessibilityLocale,
	AccessibilityMenuPart,
	AccessibilityPartClasses
} from '@ooopsstudio/accessibility'

export const defaultAccessibilityLabels = getAccessibilityLabels('en')
