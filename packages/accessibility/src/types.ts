export type AccessibilityPreferenceKey =
	| 'highContrast'
	| 'monochrome'
	| 'highlightTitles'
	| 'highlightLinks'
	| 'pauseAnimations'
	| 'hideMedia'
	| 'largeCursor'
	| 'readingGuide'
	| 'focusHighlight'
	| 'fontScale'
	| 'lineHeight'
	| 'letterSpacing'

export type AccessibilityToggleKey = Exclude<
	AccessibilityPreferenceKey,
	'fontScale' | 'lineHeight' | 'letterSpacing'
>

export type AccessibilityRangeKey = Extract<
	AccessibilityPreferenceKey,
	'fontScale' | 'lineHeight' | 'letterSpacing'
>

export type AccessibilityPreferences = Record<AccessibilityToggleKey, boolean> &
	Record<AccessibilityRangeKey, number>
