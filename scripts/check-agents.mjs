import {access, readFile} from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const files = [
	'AGENTS.md',
	'packages/accessibility/AGENTS.md',
	'packages/accessibility-astro/AGENTS.md',
	'packages/accessibility-svelte/AGENTS.md'
]
for (const file of files) await access(path.join(root, file))
for (const script of ['validate', 'lint', 'typecheck', 'build', 'test', 'check:packed-artifacts']) {
	if (!manifest.scripts?.[script]) throw new Error(`Accessibility AGENTS.md guidance requires missing pnpm script: ${script}.`)
}
console.log('Validated accessibility package AGENTS.md guidance.')
