import type {
	AccessibilityControlDefinition,
	AccessibilityPreferences
} from '@ooopsstudio/accessibility'

export type AccessibilityPosition = 'bottom-left' | 'bottom-right'

export type AccessibilityLabels = {
	open: string
	close: string
	title: string
	eyebrow: string
	reset: string
	increase: string
	decrease: string
	skip: string
}

export type AccessibilityMenuProps = {
	enabled?: boolean
	label?: string
	position?: AccessibilityPosition
	storageKey?: string
	className?: string
	panelId?: string
	controls?: AccessibilityControlDefinition[]
	labels?: Partial<AccessibilityLabels>
	onChange?: (preferences: AccessibilityPreferences) => void
	onOpenChange?: (open: boolean) => void
}

export type SkipLinkProps = {
	href?: string
	label?: string
	className?: string
}

export const defaultAccessibilityLabels: AccessibilityLabels = {
	open: 'Open accessibility menu',
	close: 'Close accessibility menu',
	title: 'Accessibility',
	eyebrow: 'Display tools',
	reset: 'Reset',
	increase: 'Increase',
	decrease: 'Decrease',
	skip: 'Skip to content'
}
