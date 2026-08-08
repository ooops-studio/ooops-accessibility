import {cleanup, fireEvent, render, screen, within} from '@testing-library/svelte'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import AccessibilityMenu from './lib/AccessibilityMenu.svelte'
import SkipLink from './lib/SkipLink.svelte'

describe('@ooopsstudio/accessibility-svelte', () => {
	beforeEach(() => {
		localStorage.clear()
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
})
