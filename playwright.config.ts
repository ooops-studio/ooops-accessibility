import {defineConfig} from '@playwright/test'

const inCi = Boolean(process.env.CI)

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: inCi,
	retries: inCi ? 2 : 0,
	reporter: inCi ? [['line'], ['html', {open: 'never', outputFolder: 'reports/playwright'}]] : 'line',
	use: {
		browserName: 'chromium',
		headless: true,
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure'
	},
	webServer: [
		{
			command: 'node scripts/serve-static.mjs ".cache/e2e/astro-consumer/dist" 4321',
			url: 'http://127.0.0.1:4321',
			reuseExistingServer: !inCi
		},
		{
			command: 'pnpm --dir ".cache/e2e/svelte-consumer" preview --host 127.0.0.1 --port 4173',
			url: 'http://127.0.0.1:4173',
			reuseExistingServer: !inCi
		}
	],
	projects: [
		{name: 'astro', use: {baseURL: 'http://127.0.0.1:4321'}},
		{name: 'svelte', use: {baseURL: 'http://127.0.0.1:4173'}}
	]
})
