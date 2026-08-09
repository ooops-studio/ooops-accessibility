import {cleanup, fireEvent, render, screen, within} from '@testing-library/svelte'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {
	ACCESSIBILITY_MENU_PARTS,
	type AccessibilityPartClasses
} from '@ooopsstudio/accessibility'

import AccessibilityMenu from './lib/AccessibilityMenu.svelte'
import AccessibilityHead from './lib/AccessibilityHead.svelte'
import SkipLink from './lib/SkipLink.svelte'

describe('@ooopsstudio/accessibility-svelte', () => {
	beforeEach(() => {
		localStorage.clear()
		document.documentElement.className = ''
		document.documentElement.removeAttribute('style')
		document.head.querySelectorAll('[data-ooops-a11y-styles], [data-ooops-a11y-effects], [data-ooops-a11y-skip-link]').forEach((node) => node.remove())
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
			callback(0)
			return 1
		})
	})

	afterEach(() => {
		cleanup()
		vi.restoreAllMocks()
	})

	it('opens an accessible dialog, closes on Escape and restores trigger focus', async() => {
		const onOpenChange = vi.fn()
		render(AccessibilityMenu, {props: {onOpenChange}})
		const trigger = screen.getByRole('button', {name: 'Open accessibility menu'})
		const dialog = screen.getByRole('dialog', {hidden: true})

		expect(dialog).toHaveProperty('hidden', true)
		await fireEvent.click(trigger)
		expect(trigger.getAttribute('aria-expanded')).toBe('true')
		expect(dialog).toHaveProperty('hidden', false)
		expect(document.activeElement).toBe(within(dialog).getByRole('button', {name: 'Close accessibility menu'}))
		const headerActions = dialog.querySelector('[data-part="header-actions"]') as HTMLElement
		expect(within(headerActions).getByRole('button', {name: 'Reset'})).toBeTruthy()
		expect(within(headerActions).getByRole('button', {name: 'Close accessibility menu'})).toBeTruthy()
		expect(dialog.querySelectorAll('.ooops-a11y-icon-wrap svg')).toHaveLength(9)
		expect(dialog.querySelectorAll('.ooops-a11y-control-title')).toHaveLength(3)
		expect(dialog.querySelector('strong')).toBeNull()

		await fireEvent.keyDown(document, {key: 'Escape'})
		expect(dialog).toHaveProperty('hidden', true)
		expect(document.activeElement).toBe(trigger)
		expect(onOpenChange).toHaveBeenNthCalledWith(1, true)
		expect(onOpenChange).toHaveBeenNthCalledWith(2, false)
	})

	it('delegates toggles, ranges and persistence to the core controller', async() => {
		const onChange = vi.fn()
		render(AccessibilityMenu, {props: {onChange}})
		await fireEvent.click(screen.getByRole('button', {name: 'Open accessibility menu'}))

		const contrast = screen.getByRole('button', {name: 'High contrast'})
		await fireEvent.click(contrast)
		expect(contrast.getAttribute('aria-pressed')).toBe('true')
		expect(document.documentElement.classList.contains('ooops-a11y-high-contrast')).toBe(true)

		await fireEvent.click(screen.getByRole('button', {name: 'Increase Font size'}))
		expect(screen.getByText('110%')).toBeTruthy()
		const stored = JSON.parse(localStorage.getItem('ooops.accessibility.preferences.v1') ?? '{}')
		expect(stored).toMatchObject({highContrast: true, fontScale: 110})
		expect(onChange).toHaveBeenCalled()
	})

	it('renders a keyboard-discoverable skip link with overridable content', () => {
		render(SkipLink, {props: {href: '#content', label: 'Jump to content', className: 'site-skip'}})
		const link = screen.getByRole('link', {name: 'Jump to content'})
		expect(link.getAttribute('href')).toBe('#content')
		expect(link.classList.contains('site-skip')).toBe(true)
	})

	it('does not create runtime effects or listeners when disabled', () => {
		localStorage.setItem('ooops.accessibility.preferences.v1', JSON.stringify({highContrast: true}))
		const addListener = vi.spyOn(document, 'addEventListener')
		render(AccessibilityMenu, {props: {enabled: false}})

		expect(screen.queryByRole('button', {name: 'Open accessibility menu'})).toBeNull()
		expect(document.documentElement.classList.contains('ooops-a11y-ready')).toBe(false)
		expect(addListener.mock.calls.some(([name]) => name === 'pointermove')).toBe(false)
		expect(document.head.querySelector('[data-ooops-a11y-styles]')).toBeNull()
	})

	it('renders built-in Greek copy, top/inline positions and custom part classes', () => {
		const {unmount} = render(AccessibilityMenu, {
			props: {
				locale: 'el',
				position: 'top-left',
				classNames: {
					trigger: 'custom-trigger',
					triggerIcon: 'custom-trigger-icon',
					controlTitle: 'custom-control-title',
					rangeButton: 'custom-range-button',
					iconWrap: 'custom-icon-wrap',
					toggleLabel: 'custom-toggle-label'
				}
			}
		})
		const greekTrigger = screen.getByRole('button', {name: 'Άνοιγμα μενού προσβασιμότητας'})
		expect(greekTrigger.classList.contains('custom-trigger')).toBe(true)
		expect(greekTrigger.querySelector('.custom-trigger-icon')).toBeTruthy()
		expect(document.querySelectorAll('.custom-control-title')).toHaveLength(3)
		expect(document.querySelectorAll('.custom-range-button')).toHaveLength(6)
		expect(document.querySelectorAll('.custom-icon-wrap')).toHaveLength(9)
		expect(document.querySelectorAll('.custom-toggle-label')).toHaveLength(9)
		expect(greekTrigger.closest('[data-ooops-a11y-widget]')?.classList.contains('ooops-a11y-widget-top-left')).toBe(true)
		unmount()

		render(AccessibilityMenu, {props: {position: 'inline'}})
		expect(screen.getByRole('button', {name: 'Open accessibility menu'}).closest('[data-ooops-a11y-widget]')?.classList.contains('ooops-a11y-widget-inline')).toBe(true)
	})

	it('applies every shared atomic classNames part', () => {
		const classNames = Object.fromEntries(
			ACCESSIBILITY_MENU_PARTS.map((part) => [part, `custom-${part}`])
		) as AccessibilityPartClasses
		render(AccessibilityMenu, {props: {classNames}})

		for (const part of ACCESSIBILITY_MENU_PARTS) {
			expect(document.querySelector(`.custom-${part}`), part).toBeTruthy()
		}
	})

	it('ships a Svelte head bootstrap with the canonical global effects', () => {
		render(AccessibilityHead)
		const effects = document.head.querySelector('[data-ooops-a11y-effects]')
		expect(effects?.textContent).toContain('mix-blend-mode: saturation')
		expect(document.head.textContent).toContain('ooops.accessibility.preferences.v1')
	})
})
