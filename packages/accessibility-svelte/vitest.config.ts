import {fileURLToPath} from 'node:url'

import {svelte} from '@sveltejs/vite-plugin-svelte'
import {defineConfig} from 'vitest/config'

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		conditions: ['browser'],
		alias: {
			'@ooopsstudio/accessibility': fileURLToPath(new URL('../accessibility/src/index.ts', import.meta.url))
		}
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.ts']
	}
})
