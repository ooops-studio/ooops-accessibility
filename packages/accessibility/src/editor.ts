import {
	parseAccessibilityManifest,
	type AccessibilityEditorManifest,
	type AccessibilityPreferenceManifest
} from '@ooopsstudio/editor-contracts'

import {
	ACCESSIBILITY_RANGE_MAX,
	ACCESSIBILITY_RANGE_MIN,
	ACCESSIBILITY_RANGE_STEP,
	DEFAULT_ACCESSIBILITY_CONTROLS,
	DEFAULT_ACCESSIBILITY_PREFERENCES,
	DEFAULT_ACCESSIBILITY_STORAGE_KEY
} from './index'

const classNames: Partial<Record<keyof typeof DEFAULT_ACCESSIBILITY_PREFERENCES, string>> = {
	highContrast: 'ooops-a11y-high-contrast',
	monochrome: 'ooops-a11y-monochrome',
	highlightTitles: 'ooops-a11y-highlight-titles',
	highlightLinks: 'ooops-a11y-highlight-links',
	pauseAnimations: 'ooops-a11y-reduce-motion',
	hideMedia: 'ooops-a11y-hide-media',
	largeCursor: 'ooops-a11y-large-cursor',
	readingGuide: 'ooops-a11y-reading-guide',
	focusHighlight: 'ooops-a11y-focus-highlight'
}

const cssVariables: Partial<Record<keyof typeof DEFAULT_ACCESSIBILITY_PREFERENCES, `--${string}`>> = {
	fontScale: '--ooops-a11y-font-scale',
	lineHeight: '--ooops-a11y-line-height-factor',
	letterSpacing: '--ooops-a11y-letter-spacing',
	readingGuide: '--ooops-a11y-reading-guide-y'
}

const preferences: AccessibilityPreferenceManifest[] = DEFAULT_ACCESSIBILITY_CONTROLS.map((control) => ({
	id: control.key,
	label: control.label,
	type: control.type,
	default: DEFAULT_ACCESSIBILITY_PREFERENCES[control.key],
	...(control.type === 'range' ? {
		min: ACCESSIBILITY_RANGE_MIN,
		max: ACCESSIBILITY_RANGE_MAX,
		step: ACCESSIBILITY_RANGE_STEP
	} : {}),
	...(classNames[control.key] ? {className: classNames[control.key]} : {}),
	...(cssVariables[control.key] ? {cssVariable: cssVariables[control.key]} : {})
}))

const rawManifest: AccessibilityEditorManifest = {
	schemaVersion: 2,
	id: 'accessibility',
	owner: '@ooopsstudio/accessibility',
	storageKey: DEFAULT_ACCESSIBILITY_STORAGE_KEY,
	persistence: 'local-storage',
	preferences,
	components: []
}

const parsed = parseAccessibilityManifest(rawManifest)
if (!parsed.ok) throw new Error(`Invalid accessibility editor manifest: ${parsed.issues.map((issue) => `${issue.path} ${issue.message}`).join('; ')}`)

export const accessibilityEditorManifest = parsed.value
export const accessibilityPreferenceManifest = accessibilityEditorManifest.preferences
export type {AccessibilityEditorManifest, AccessibilityPreferenceManifest} from '@ooopsstudio/editor-contracts'
