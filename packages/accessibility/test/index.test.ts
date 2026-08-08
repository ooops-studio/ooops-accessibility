import {beforeEach, describe, expect, it, vi} from 'vitest'

import {accessibilityEditorManifest} from '../src/editor'
import {
	ACCESSIBILITY_RANGE_MAX,
	ACCESSIBILITY_RANGE_MIN,
	DEFAULT_ACCESSIBILITY_CONTROLS,
	DEFAULT_ACCESSIBILITY_PREFERENCES,
	DEFAULT_ACCESSIBILITY_STORAGE_KEY,
	applyAccessibilityPreferences,
	createAccessibilityController,
	createAccessibilityHeadScript,
	createFocusTrap,
	createModalFocusController,
	loadAccessibilityPreferences,
	resetAccessibilityPreferences,
	saveAccessibilityPreferences,
	shouldReduceMotion,
	trapTabKey,
	watchReducedMotion
} from '../src/index'

const storageKey = 'test-a11y'

beforeEach(() => {
	document.body.innerHTML = ''
	document.documentElement.className = ''
	document.documentElement.removeAttribute('style')
	window.localStorage.clear()
	vi.restoreAllMocks()
	Object.defineProperty(window, 'matchMedia', {
		configurable: true,
		writable: true,
		value: vi.fn(() => ({
			matches: false,
			media: '',
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}))
	})
	vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
		callback(0)
		return 1
	})
})

describe('accessibility preferences', () => {
	it('keeps editor metadata aligned with runtime preferences and effects', () => {
		expect(accessibilityEditorManifest.schemaVersion).toBe(2)
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
		expect(accessibilityEditorManifest.preferences.find((entry) => entry.id === 'highContrast')).toMatchObject({
			className: 'ooops-a11y-high-contrast'
		})
	})

	it('loads defaults for missing or corrupt storage and clamps persisted ranges', () => {
		expect(loadAccessibilityPreferences({storage: window.localStorage, storageKey})).toEqual(
			DEFAULT_ACCESSIBILITY_PREFERENCES
		)

		window.localStorage.setItem(storageKey, '{bad-json')
		expect(loadAccessibilityPreferences({storage: window.localStorage, storageKey})).toEqual(
			DEFAULT_ACCESSIBILITY_PREFERENCES
		)

		window.localStorage.setItem(storageKey, JSON.stringify({fontScale: 900, lineHeight: 10, highContrast: true}))
		const preferences = loadAccessibilityPreferences({storage: window.localStorage, storageKey})
		expect(preferences.fontScale).toBe(ACCESSIBILITY_RANGE_MAX)
		expect(preferences.lineHeight).toBe(ACCESSIBILITY_RANGE_MIN)
		expect(preferences.highContrast).toBe(true)
	})

	it('saves and resets preferences', () => {
		const saved = saveAccessibilityPreferences({highContrast: true, fontScale: 120}, {storage: window.localStorage, storageKey})
		expect(saved.highContrast).toBe(true)
		expect(JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')).toMatchObject({
			highContrast: true,
			fontScale: 120
		})

		const reset = resetAccessibilityPreferences({storage: window.localStorage, storageKey})
		expect(reset).toEqual(DEFAULT_ACCESSIBILITY_PREFERENCES)
		expect(window.localStorage.getItem(storageKey)).toBeNull()
	})

	it('applies root classes and CSS variables', () => {
		applyAccessibilityPreferences(document.documentElement, {
			highContrast: true,
			hideMedia: true,
			readingGuide: true,
			fontScale: 140,
			lineHeight: 120,
			letterSpacing: 150
		})

		expect(document.documentElement.classList.contains('ooops-a11y-ready')).toBe(true)
		expect(document.documentElement.classList.contains('ooops-a11y-high-contrast')).toBe(true)
		expect(document.documentElement.classList.contains('ooops-a11y-hide-media')).toBe(true)
		expect(document.documentElement.style.getPropertyValue('--ooops-a11y-font-scale')).toBe('1.4')
		expect(document.documentElement.style.getPropertyValue('--ooops-a11y-line-height-factor')).toBe('1.2')
		expect(document.documentElement.style.getPropertyValue('--ooops-a11y-letter-spacing')).toBe('0.060em')
		expect(document.documentElement.style.getPropertyValue('--ooops-a11y-reading-guide-y')).toBeTruthy()
	})

	it('creates a controller that toggles, steps and persists', () => {
		const controller = createAccessibilityController({storage: window.localStorage, storageKey})
		const listener = vi.fn()
		controller.subscribe(listener)

		controller.toggle('highContrast')
		controller.stepRange('fontScale', 1)
		controller.updateReadingGuide(321)

		expect(controller.getPreferences()).toMatchObject({highContrast: true, fontScale: 110})
		expect(document.documentElement.classList.contains('ooops-a11y-high-contrast')).toBe(true)
		expect(listener).toHaveBeenCalled()
		expect(JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')).toMatchObject({
			highContrast: true,
			fontScale: 110
		})

		controller.setPreference('readingGuide', true)
		controller.updateReadingGuide(321)
		expect(document.documentElement.style.getPropertyValue('--ooops-a11y-reading-guide-y')).toBe('321px')

		controller.reset()
		expect(controller.getPreferences()).toEqual(DEFAULT_ACCESSIBILITY_PREFERENCES)
	})

	it('creates safe head bootstrap script', () => {
		const script = createAccessibilityHeadScript({
			storageKey: '</script><script>alert(1)</script>',
			defaults: {highContrast: true}
		})

		expect(script).toContain('\\u003c/script\\u003e')
		expect(script).toContain('ooops-a11y')
		expect(script).not.toContain('</script><script>')
	})
})

describe('focus and reduced motion helpers', () => {
	it('traps tab focus inside a container', () => {
		document.body.innerHTML = `
      <div id="panel" tabindex="-1">
        <button id="first">First</button>
        <button id="last">Last</button>
      </div>
    `
		const panel = document.getElementById('panel') as HTMLElement
		const first = document.getElementById('first') as HTMLButtonElement
		const last = document.getElementById('last') as HTMLButtonElement

		last.focus()
		const forward = new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true})
		expect(trapTabKey(forward, panel)).toBe(true)
		expect(document.activeElement).toBe(first)

		first.focus()
		const backward = new KeyboardEvent('keydown', {key: 'Tab', shiftKey: true, bubbles: true, cancelable: true})
		expect(trapTabKey(backward, panel)).toBe(true)
		expect(document.activeElement).toBe(last)
	})

	it('isolates modal siblings with inert and restores them on close', () => {
		document.body.innerHTML = `
      <main id="main"><button>Main</button></main>
      <section id="modal" tabindex="-1"><button id="close">Close</button></section>
    `
		const main = document.getElementById('main') as HTMLElement
		const modal = document.getElementById('modal') as HTMLElement
		const close = document.getElementById('close') as HTMLButtonElement
		const onEscape = vi.fn()
		const controller = createModalFocusController({
			getContainer: () => modal,
			getInitialFocus: () => close,
			onEscape
		})

		controller.setOpen(true)
		expect(main.inert).toBe(true)
		expect(main.getAttribute('aria-hidden')).toBe('true')
		expect(document.activeElement).toBe(close)

		const escape = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true})
		controller.handleKeydown(escape)
		expect(onEscape).toHaveBeenCalled()

		controller.setOpen(false)
		expect(main.inert).toBe(false)
		expect(main.getAttribute('aria-hidden')).toBeNull()
	})

	it('creates a reusable non-modal focus trap and restores focus', () => {
		document.body.innerHTML = `
      <button id="opener">Open</button>
      <section id="panel" tabindex="-1"><button id="inside">Inside</button></section>
      <button id="outside">Outside</button>
    `
		const opener = document.getElementById('opener') as HTMLButtonElement
		const panel = document.getElementById('panel') as HTMLElement
		const inside = document.getElementById('inside') as HTMLButtonElement
		const outside = document.getElementById('outside') as HTMLButtonElement
		const onEscape = vi.fn()
		opener.focus()

		const trap = createFocusTrap({
			getContainer: () => panel,
			getInitialFocus: () => inside,
			onEscape
		})
		trap.activate()
		expect(trap.isActive()).toBe(true)
		expect(document.activeElement).toBe(inside)

		outside.focus()
		outside.dispatchEvent(new FocusEvent('focusin', {bubbles: true}))
		expect(document.activeElement).toBe(inside)

		document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true}))
		expect(onEscape).toHaveBeenCalledOnce()

		trap.deactivate()
		expect(document.activeElement).toBe(opener)
		expect(trap.isActive()).toBe(false)
	})

	it('handles document keyboard events for modal focus traps', () => {
		document.body.innerHTML = `
			<button id="opener">Open</button>
			<section id="panel"><button id="inside">Inside</button></section>
		`
		const opener = document.getElementById('opener') as HTMLButtonElement
		const panel = document.getElementById('panel') as HTMLElement
		const inside = document.getElementById('inside') as HTMLButtonElement
		const onEscape = vi.fn()
		opener.focus()
		const trap = createFocusTrap({
			modal: true,
			getContainer: () => panel,
			getInitialFocus: () => inside,
			getRestoreFocusTo: () => opener,
			onEscape
		})

		trap.activate()
		document.dispatchEvent(
			new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true})
		)
		expect(onEscape).toHaveBeenCalledOnce()
		trap.deactivate()
		expect(document.activeElement).toBe(opener)
	})

	it('combines prefers-reduced-motion and accessibility root class', () => {
		expect(shouldReduceMotion()).toBe(false)
		document.documentElement.classList.add('ooops-a11y-reduce-motion')
		expect(shouldReduceMotion()).toBe(true)
	})

	it('watches reduced motion changes', () => {
		const listener = vi.fn()
		const cleanup = watchReducedMotion(listener)
		expect(listener).toHaveBeenLastCalledWith(false)

		document.documentElement.classList.add('ooops-a11y-reduce-motion')
		return Promise.resolve().then(() => {
			expect(listener).toHaveBeenLastCalledWith(true)
			cleanup()
		})
	})
})
