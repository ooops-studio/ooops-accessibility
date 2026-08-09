import {expect, test} from '@playwright/test'

const positions = ['bottom-left', 'bottom-right', 'top-left', 'top-right', 'inline'] as const
const viewports = [
	{name: 'desktop-en', localePath: '', width: 1280, height: 900},
	{name: 'desktop-el', localePath: '/locale/el', width: 1280, height: 900},
	{name: 'mobile-en', localePath: '', width: 390, height: 844},
	{name: 'mobile-el', localePath: '/locale/el', width: 390, height: 844}
] as const

for (const viewport of viewports) {
	test.describe(viewport.name, () => {
		for (const position of positions) {
			test(`[parity:position-${position}] stays visible and captures ${viewport.name}`, async({page}, testInfo) => {
				await page.setViewportSize({width: viewport.width, height: viewport.height})
				await page.goto(`${viewport.localePath}/positions/${position}`, {waitUntil: 'networkidle'})

				const openName = viewport.localePath ? 'Άνοιγμα μενού προσβασιμότητας' : 'Open accessibility menu'
				const trigger = page.getByRole('button', {name: openName})
				await trigger.click()
				const panel = page.getByRole('dialog')
				await expect(panel).toBeVisible()

				const [widgetPosition, triggerBox, panelBox] = await Promise.all([
					page.locator('[data-ooops-a11y-widget]').evaluate((element) => getComputedStyle(element).position),
					trigger.boundingBox(),
					panel.boundingBox()
				])
				expect(triggerBox).not.toBeNull()
				expect(panelBox).not.toBeNull()
				if (!triggerBox || !panelBox) return

				expect(panelBox.x).toBeGreaterThanOrEqual(0)
				expect(panelBox.y).toBeGreaterThanOrEqual(0)
				expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(viewport.width + 1)
				expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(viewport.height + 1)

				if (position === 'inline') {
					expect(widgetPosition).toBe('relative')
				} else {
					expect(widgetPosition).toBe('fixed')
				}
				if (position.endsWith('left')) expect(triggerBox.x).toBeLessThan(viewport.width / 2)
				if (position.endsWith('right')) expect(triggerBox.x + triggerBox.width).toBeGreaterThan(viewport.width / 2)
				if (position.startsWith('top')) expect(triggerBox.y).toBeLessThan(viewport.height / 2)
				if (position.startsWith('bottom')) expect(triggerBox.y + triggerBox.height).toBeGreaterThan(viewport.height / 2)

				const titleTypography = await panel.locator('.ooops-a11y-control-title').first().evaluate((element) => {
					const style = getComputedStyle(element)
					return {
						lineHeightRatio: Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize),
						fontWeight: Number.parseInt(style.fontWeight, 10)
					}
				})
				expect(titleTypography.lineHeightRatio).toBeLessThanOrEqual(1.21)
				expect(titleTypography.fontWeight).toBe(400)

				if (viewport.name === 'mobile-el') {
					const overflow = await panel.evaluate((element) => element.scrollHeight - element.clientHeight)
					expect(overflow).toBeLessThanOrEqual(1)
				}

				const screenshotPath = testInfo.outputPath(`${testInfo.project.name}-${viewport.name}-${position}.png`)
				await page.screenshot({path: screenshotPath, fullPage: false})
				await testInfo.attach('visual-screenshot', {path: screenshotPath, contentType: 'image/png'})
			})
		}
	})
}
