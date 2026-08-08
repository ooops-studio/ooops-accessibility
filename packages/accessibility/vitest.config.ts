import {defineConfig, mergeConfig} from 'vitest/config'

import base from '../../vitest.config'

export default mergeConfig(base, defineConfig({
	test: {
		environment: 'jsdom',
		testTimeout: 30_000,
		environmentOptions: {
			jsdom: {
				url: 'https://example.test/'
			}
		},
		coverage: {
			exclude: [
				'**/*.d.ts',
				'**/*.{test,spec}.{ts,tsx}',
				'**/__tests__/**'
			],

			thresholds: {
				perFile: true,
				statements: 90,
				branches: 90,
				functions: 90,
				lines: 90
			}
		}
	}
}))
