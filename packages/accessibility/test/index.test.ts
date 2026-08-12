import {beforeEach, describe, expect, it, vi} from 'vitest'

import {
	ACCESSIBILITY_RANGE_MAX,
	ACCESSIBILITY_RANGE_MIN,
	ACCESSIBILITY_MENU_PARTS,
	ACCESSIBILITY_TOGGLE_ICONS,
	ACCESSIBILITY_TRIGGER_ICON,
	DEFAULT_ACCESSIBILITY_PREFERENCES,
	accessibilityGlobalStyles,
	accessibilityMenuStyles,
	applyAccessibilityPreferences,
	clearAccessibilityPreferences,
	createAccessibilityController,
	createAccessibilityHeadScript,
	createFocusTrap,
	createModalFocusController,
	fitAccessibilityPanelToViewport,
	getAccessibilityControls,
	getAccessibilityIconDefinition,
	getAccessibilityLabels,
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

	it('keeps controls effective when storage writes and removals are blocked', () => {
		const blockedStorage = {
			getItem: () => null,
			setItem: () => { throw new DOMException('Blocked', 'SecurityError') },
			removeItem: () => { throw new DOMException('Blocked', 'SecurityError') }
		}

		expect(() => saveAccessibilityPreferences({highContrast: true}, {storage: blockedStorage})).not.toThrow()
		expect(() => resetAccessibilityPreferences({storage: blockedStorage})).not.toThrow()

		const controller = createAccessibilityController({storage: blockedStorage})
		expect(() => controller.toggle('highContrast')).not.toThrow()
		expect(controller.getPreferences().highContrast).toBe(true)
		expect(document.documentElement.classList.contains('ooops-a11y-high-contrast')).toBe(true)
		expect(() => controller.reset()).not.toThrow()
		expect(controller.getPreferences()).toEqual(DEFAULT_ACCESSIBILITY_PREFERENCES)
		expect(document.documentElement.classList.contains('ooops-a11y-high-contrast')).toBe(false)
	})

	it('ships Greek localization and canonical adapter styles', () => {
		expect(getAccessibilityLabels('el')).toMatchObject({
			title: 'Προσβασιμότητα',
			reset: 'Επαναφορά'
		})
		expect(getAccessibilityControls('el').find((control) => control.key === 'highContrast')?.label)
			.toBe('Υψηλή αντίθεση')
		expect(accessibilityGlobalStyles).toContain('mix-blend-mode: saturation')
		expect(accessibilityGlobalStyles).toContain('width=\'48\'')
		expect(accessibilityMenuStyles).toContain('ooops-a11y-widget-inline')
		expect(accessibilityMenuStyles).toContain('ooops-a11y-widget-top-right')
		expect(accessibilityMenuStyles).toContain('box-sizing: border-box')
		expect(accessibilityMenuStyles).toContain('--ooops-a11y-control-title-line-height, 1.2')
		expect(accessibilityMenuStyles).toContain('--ooops-a11y-control-title-font-weight, 400')
		expect(accessibilityMenuStyles).toContain('--ooops-a11y-grid-columns: 3')
		expect(accessibilityMenuStyles).toContain('--ooops-a11y-card-min-height: 92px')
		expect(ACCESSIBILITY_MENU_PARTS).toContain('triggerIcon')
		expect(ACCESSIBILITY_MENU_PARTS).toContain('controlTitle')
		expect(ACCESSIBILITY_MENU_PARTS).toContain('rangeButton')
		expect(ACCESSIBILITY_MENU_PARTS).toContain('toggleLabel')
	})

	it('ships the canonical Ooops Suite accessibility icon set', () => {
		expect(ACCESSIBILITY_TRIGGER_ICON.viewBox).toBe('0 0 30 30')
		expect(Object.keys(ACCESSIBILITY_TOGGLE_ICONS)).toEqual([
			'highContrast',
			'monochrome',
			'highlightTitles',
			'highlightLinks',
			'largeCursor',
			'readingGuide',
			'focusHighlight',
			'pauseAnimations',
			'hideMedia'
		])
		expect(getAccessibilityIconDefinition('highContrast').paths[0]?.d).toContain('M12 21.9971')
		expect(getAccessibilityIconDefinition('focusHighlight').circles).toHaveLength(1)
	})

	it('fits an open panel to the remaining viewport height', () => {
		const panel = document.createElement('section')
		vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900)
		vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
			top: 185,
			bottom: 905,
			left: 0,
			right: 544,
			width: 544,
			height: 720,
			x: 0,
			y: 185,
			toJSON: () => ({})
		})

		expect(fitAccessibilityPanelToViewport(panel)).toBe(695)
		expect(panel.style.getPropertyValue('--ooops-a11y-panel-max-height')).toBe('695px')
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

	it('clears active DOM effects without deleting persisted preferences', () => {
		window.localStorage.setItem(storageKey, JSON.stringify({highContrast: true}))
		applyAccessibilityPreferences(document.documentElement, {
			highContrast: true,
			fontScale: 140,
			readingGuide: true
		})

		clearAccessibilityPreferences(document.documentElement)

		expect(document.documentElement.classList.contains('ooops-a11y-ready')).toBe(false)
		expect(document.documentElement.classList.contains('ooops-a11y-high-contrast')).toBe(false)
		expect(document.documentElement.style.getPropertyValue('--ooops-a11y-font-scale')).toBe('')
		expect(document.documentElement.style.getPropertyValue('--ooops-a11y-reading-guide-y')).toBe('')
		expect(window.localStorage.getItem(storageKey)).not.toBeNull()
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
