import {fileURLToPath} from 'node:url'

import {defineConfig} from 'vitest/config'

export default defineConfig({
	resolve: {
		alias: [
			{find: /^@ooopsstudio\/accessibility$/, replacement: fileURLToPath(new URL('../accessibility/src/index.ts', import.meta.url))}
		]
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
})
