import {copyFile, mkdir} from 'node:fs/promises'

const packageRoot = new URL('..', import.meta.url)
const sourceRoot = new URL('src/', packageRoot)
const distRoot = new URL('dist/', packageRoot)

await mkdir(distRoot, {recursive: true})

for (const fileName of ['AccessibilityHead.astro', 'AccessibilityIcon.astro', 'AccessibilityMenu.astro', 'SkipLink.astro']) {
	await copyFile(new URL(fileName, sourceRoot), new URL(fileName, distRoot))
}
