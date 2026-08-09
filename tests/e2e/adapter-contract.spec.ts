import AxeBuilder from '@axe-core/playwright'
import {expect, test, type Page} from '@playwright/test'

const STORAGE_KEY = 'ooops.accessibility.preferences.v1'
const widget = '[data-ooops-a11y-widget]'
const browserIssues = new WeakMap<Page, string[]>()

const openMenu = async(page: Page, locale: 'en' | 'el' = 'en') => {
	const name = locale === 'el' ? 'Άνοιγμα μενού προσβασιμότητας' : 'Open accessibility menu'
	await page.getByRole('button', {name}).click()
	await expect(page.getByRole('dialog')).toBeVisible()
}

test.describe('shared packed Astro and Svelte adapter contract', () => {
	test.beforeEach(async({page}) => {
		const issues: string[] = []
		browserIssues.set(page, issues)
		page.on('console', (message) => {
			if (message.type() === 'error' || message.type() === 'warning') issues.push(message.text())
		})
		page.on('pageerror', (error) => issues.push(error.message))
	})

	test.afterEach(async({page}) => {
		expect(browserIssues.get(page) ?? []).toEqual([])
	})

	for (const locale of ['en', 'el'] as const) {
			test(`[parity:locale-${locale}] renders built-in ${locale} localization`, async({page}) => {
				await page.goto(`/locale/${locale}`, {waitUntil: 'networkidle'})
				await openMenu(page, locale)

				const dialog = page.getByRole('dialog')
				const hiddenLabels = page.locator(`${widget} .sr-only`)
				const headerActions = dialog.locator('[data-part="header-actions"]')
				await expect(page.locator(widget)).toHaveAttribute('lang', locale)
				await expect(hiddenLabels).toHaveCount(2)
				await expect(hiddenLabels.first()).toHaveCSS('position', 'absolute')
				expect(await hiddenLabels.evaluateAll((elements) => elements.every((element) => {
					const bounds = element.getBoundingClientRect()
					return bounds.width <= 1 && bounds.height <= 1 && getComputedStyle(element).overflow === 'hidden'
				}))).toBe(true)
				await expect(headerActions.getByRole('button', {
					name: locale === 'el' ? 'Επαναφορά' : 'Reset'
				})).toBeVisible()
				await expect(headerActions.getByRole('button', {
					name: locale === 'el' ? 'Κλείσιμο μενού προσβασιμότητας' : 'Close accessibility menu'
				})).toBeVisible()
				await expect(dialog.locator('.ooops-a11y-icon-wrap svg')).toHaveCount(9)
				await expect(page.locator('.fixture-trigger-icon')).toHaveCount(1)
				await expect(dialog.locator('.fixture-control-title')).toHaveCount(3)
				await expect(dialog.locator('.fixture-range-button')).toHaveCount(6)
				await expect(dialog.locator('.fixture-icon-wrap')).toHaveCount(9)
				await expect(dialog.locator('.fixture-control-icon')).toHaveCount(9)
				await expect(dialog.locator('.fixture-toggle-label')).toHaveCount(9)
				await expect(dialog.getByRole('heading', {
					name: locale === 'el' ? 'Προσβασιμότητα' : 'Accessibility'
				})).toBeVisible()
				await expect(dialog.getByText(locale === 'el' ? 'Υψηλή αντίθεση' : 'High contrast')).toBeVisible()
			})
	}

	test('[parity:storage-failure] applies and resets preferences when writes are blocked', async({page}) => {
		await page.addInitScript(() => {
			Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError') }
			Storage.prototype.removeItem = () => { throw new DOMException('Blocked', 'SecurityError') }
		})
		await page.goto('/', {waitUntil: 'networkidle'})
		await openMenu(page)

		const contrast = page.getByRole('button', {name: 'High contrast'})
		await contrast.click()
		await expect(contrast).toHaveAttribute('aria-pressed', 'true')
		await expect(page.locator('html')).toHaveClass(/ooops-a11y-high-contrast/u)

		await page.getByRole('button', {name: 'Reset'}).click()
		await expect(contrast).toHaveAttribute('aria-pressed', 'false')
		await expect(page.locator('html')).not.toHaveClass(/ooops-a11y-high-contrast/u)
	})

	test('[parity:enabled-switching] adds and removes the complete runtime contract', async({page}) => {
		await page.goto('/enabled-switch', {waitUntil: 'networkidle'})
		await expect(page.locator(widget)).toHaveCount(0)
		await expect(page.locator('html')).not.toHaveClass(/ooops-a11y-ready/u)

		await page.getByRole('button', {name: 'Enable accessibility'}).click()
		await expect(page.locator(widget)).toHaveCount(1)
		await expect(page.locator('html')).toHaveClass(/ooops-a11y-ready/u)

		await page.getByRole('button', {name: 'Disable accessibility'}).click()
		await expect(page.locator(widget)).toHaveCount(0)
		await expect(page.locator('html')).not.toHaveClass(/ooops-a11y-ready/u)
	})

	test('[parity:custom-renderer] supports a custom trigger and complete custom menu', async({page}) => {
		await page.goto('/custom', {waitUntil: 'networkidle'})
		const trigger = page.getByRole('button', {name: 'Open custom accessibility menu'})
		await expect(trigger).toHaveClass(/fixture-custom-trigger/u)
		await trigger.click()

		const dialog = page.getByRole('dialog')
		await expect(dialog.getByRole('heading', {name: 'Custom accessibility menu'})).toBeVisible()
		const contrast = dialog.getByRole('button', {name: 'Custom contrast'})
		await contrast.click()
		await expect(contrast).toHaveAttribute('aria-pressed', 'true')
		await expect(page.locator('html')).toHaveClass(/ooops-a11y-high-contrast/u)
		await dialog.getByRole('button', {name: 'Custom close'}).click()
		await expect(dialog).toBeHidden()
	})

	test('[parity:headless-settings] supports a persistent non-dialog settings sidebar', async({page}) => {
		await page.goto('/headless', {waitUntil: 'networkidle'})
		const settings = page.getByRole('complementary', {name: 'Accessibility settings'})
		await expect(settings).toHaveAttribute('data-ready', 'true')
		await expect(page.getByRole('dialog')).toHaveCount(0)

		const axe = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
		expect(axe.violations).toEqual([])

		const contrast = page.getByRole('checkbox', {name: 'High contrast'})
		const scale = page.getByRole('slider', {name: 'Font size'})
		await contrast.check()
		await scale.fill('130')
		await expect(page.locator('html')).toHaveClass(/ooops-a11y-high-contrast/u)
		await expect(settings.getByText('130%')).toBeVisible()

		await page.reload({waitUntil: 'networkidle'})
		await expect(page.getByRole('checkbox', {name: 'High contrast'})).toBeChecked()
		await expect(page.getByRole('slider', {name: 'Font size'})).toHaveValue('130')

		await page.getByRole('button', {name: 'Reset settings'}).click()
		await expect(page.locator('html')).not.toHaveClass(/ooops-a11y-high-contrast/u)
		await expect(page.getByRole('slider', {name: 'Font size'})).toHaveValue('100')
	})

	test('[parity:layout-tokens] applies consumer-defined menu geometry', async({page}) => {
		await page.goto('/tokens', {waitUntil: 'networkidle'})
		await openMenu(page)
		const dialog = page.getByRole('dialog')
		const grid = dialog.locator('.ooops-a11y-grid')
		const firstCard = dialog.locator('.ooops-a11y-card').first()
		await expect(dialog).toHaveCSS('width', '704px')
		await expect(grid).toHaveCSS('gap', '4px')
		await expect(firstCard).toHaveCSS('min-height', '70px')
		await expect(firstCard).toHaveCSS('border-radius', '4px')
		expect((await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns)).split(' ')).toHaveLength(4)
	})

	test('[parity:keyboard-focus-escape] traps focus, closes on Escape and restores the trigger', async({page}) => {
		await page.goto('/', {waitUntil: 'networkidle'})
		const trigger = page.getByRole('button', {name: 'Open accessibility menu'})
		await trigger.focus()
		await trigger.press('Enter')

		const dialog = page.getByRole('dialog')
		const close = dialog.getByRole('button', {name: 'Close accessibility menu'})
		await expect(close).toBeFocused()
		await page.keyboard.press('Tab')
		expect(await page.evaluate(() => {
			const active = document.activeElement
			return Boolean(active && document.querySelector('[role="dialog"]')?.contains(active))
		})).toBe(true)

		await page.keyboard.press('Escape')
		await expect(dialog).toBeHidden()
		await expect(trigger).toBeFocused()
	})

	test('[parity:reload-persistence] restores toggles and ranges after reload', async({page}) => {
		await page.goto('/', {waitUntil: 'networkidle'})
		await openMenu(page)
		await page.getByRole('button', {name: 'High contrast'}).click()
		await page.getByRole('button', {name: 'Increase Font size'}).click()

		await expect.poll(() => page.evaluate((key) => {
			const raw = localStorage.getItem(key)
			return raw ? JSON.parse(raw) : null
		}, STORAGE_KEY)).toMatchObject({highContrast: true, fontScale: 110})

		await page.reload({waitUntil: 'networkidle'})
		await expect(page.locator('html')).toHaveClass(/ooops-a11y-high-contrast/u)
		await expect(page.locator('html')).toHaveCSS('--ooops-a11y-font-scale', '1.1')
		await openMenu(page)
		await expect(page.getByRole('button', {name: 'High contrast'})).toHaveAttribute('aria-pressed', 'true')
		await expect(page.getByText('110%', {exact: true})).toBeVisible()
	})

	test('[parity:axe-default] has no WCAG A/AA violations in the open default menu', async({page}) => {
		await page.goto('/', {waitUntil: 'networkidle'})
		await openMenu(page)
		const results = await new AxeBuilder({page})
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze()
		expect(results.violations).toEqual([])
	})

	test('[parity:axe-custom] has no WCAG A/AA violations with custom renderer content', async({page}) => {
		await page.goto('/custom', {waitUntil: 'networkidle'})
		await page.getByRole('button', {name: 'Open custom accessibility menu'}).click()
		const results = await new AxeBuilder({page})
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze()
		expect(results.violations).toEqual([])
	})
})
