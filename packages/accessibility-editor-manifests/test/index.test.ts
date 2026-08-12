import {
	ACCESSIBILITY_RANGE_MAX,
	ACCESSIBILITY_RANGE_MIN,
	DEFAULT_ACCESSIBILITY_CONTROLS,
	DEFAULT_ACCESSIBILITY_STORAGE_KEY
} from '@ooopsstudio/accessibility'
import {describe, expect, it} from 'vitest'

import {
	accessibilityAstroComponentManifests,
	accessibilityAstroEditorManifest,
	accessibilityEditorManifest
} from '../src/index'

describe('@ooopsstudio/accessibility-editor-manifests', () => {
	it('keeps preference metadata aligned with the runtime', () => {
		expect(accessibilityEditorManifest.storageKey).toBe(DEFAULT_ACCESSIBILITY_STORAGE_KEY)
		expect(accessibilityEditorManifest.preferences.map((entry) => entry.id)).toEqual(
			DEFAULT_ACCESSIBILITY_CONTROLS.map((entry) => entry.key)
		)
		expect(accessibilityEditorManifest.preferences.find((entry) => entry.id === 'fontScale')).toMatchObject({
			default: 100,
			min: ACCESSIBILITY_RANGE_MIN,
			max: ACCESSIBILITY_RANGE_MAX,
			cssVariable: '--ooops-a11y-font-scale'
		})
	})

	it('exports validated component and preference metadata', () => {
		expect(accessibilityAstroEditorManifest.schemaVersion).toBe(2)
		expect(Object.keys(accessibilityAstroComponentManifests)).toEqual([
			'accessibility-head', 'accessibility-menu', 'skip-link'
		])
		const menu = accessibilityAstroComponentManifests['accessibility-menu']
		expect(menu.adapters.astro).toBe('@ooopsstudio/accessibility-astro/AccessibilityMenu.astro')
		expect(menu.parts.find((part) => part.id === 'panel')?.positioning).toMatchObject({
			editable: false,
			responsive: false,
			zIndex: {editable: false, tokens: ['z-index-toast']}
		})
		expect(menu.parts.find((part) => part.id === 'card')?.positioning.editable).toBe(true)
	})
})
