import {defineConfig} from 'tsup'

export default defineConfig({
	entry: {'index': 'src/index.ts', 'editor': 'src/editor.ts'},
	format: ['esm'],
	dts: true,
	clean: true,
	sourcemap: true,
	target: 'node22',
	external: ['astro', '@ooopsstudio/accessibility', '@ooopsstudio/accessibility/editor', '@ooopsstudio/editor-contracts']
})
