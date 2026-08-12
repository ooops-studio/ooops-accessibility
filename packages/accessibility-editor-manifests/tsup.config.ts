import {defineConfig} from 'tsup'

export default defineConfig({
	entry: {index: 'src/index.ts', components: 'src/components.ts', preferences: 'src/preferences.ts'},
	format: ['esm'],
	platform: 'neutral',
	target: 'node22',
	dts: {resolve: true},
	sourcemap: true,
	clean: true,
	splitting: false,
	treeshake: true,
	external: ['@ooopsstudio/accessibility', '@ooopsstudio/editor-contracts']
})
