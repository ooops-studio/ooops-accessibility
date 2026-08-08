import {describe, expect, it} from 'vitest'

import {accessibilityAstroComponentManifests, accessibilityAstroEditorManifest} from './editor'

import {
	accessibilityGlobalStyles,
	accessibilityMenuStyles,
	defaultAccessibilityLabels,
	serializeInlineJson,
	skipLinkStyles
} from './index'

describe('@ooopsstudio/accessibility-astro', () => {
	it('exports valid v2 component and preference metadata', () => {
		expect(accessibilityAstroEditorManifest.schemaVersion).toBe(2)
		expect(Object.keys(accessibilityAstroComponentManifests)).toEqual([
			'accessibility-head',
			'accessibility-menu',
			'skip-link'
		])
		expect(accessibilityAstroComponentManifests['accessibility-menu'].adapters.astro).toBe(
			'@ooopsstudio/accessibility-astro/AccessibilityMenu.astro'
		)
		expect(accessibilityAstroComponentManifests['accessibility-menu'].parts.map((part) => part.id)).toContain('panel')
		expect(accessibilityAstroComponentManifests['accessibility-menu'].parts.find((part) => part.id === 'panel')?.positioning).toMatchObject({
			editable: false,
			responsive: false,
			zIndex: {editable: false, tokens: ['z-index-toast']}
		})
		expect(accessibilityAstroComponentManifests['accessibility-menu'].parts.find((part) => part.id === 'card')?.positioning.editable).toBe(true)
	})

	it('escapes inline JSON for safe script embedding', () => {
		const serialized = serializeInlineJson({
			label: '</script><script>alert(1)</script>',
			line: '\u2028'
		})

		expect(serialized).toContain('\\u003c/script\\u003e')
		expect(serialized).not.toContain('</script>')
		expect(serialized).toContain('\\u2028')
	})

	it('exports generic default labels', () => {
		expect(defaultAccessibilityLabels.title).toBe('Accessibility')
		expect(defaultAccessibilityLabels.skip).toBe('Skip to content')
	})

	it('exports styles with stable class hooks', () => {
		expect(accessibilityGlobalStyles).toContain('ooops-a11y-high-contrast')
		expect(accessibilityMenuStyles).toContain('ooops-a11y-trigger')
		expect(skipLinkStyles).toContain('ooops-skip-link')
	})
})
