import {readFile} from 'node:fs/promises'
import {brotliCompressSync} from 'node:zlib'

const dist = new URL('../dist/', import.meta.url)
const files = ['index.js', 'AccessibilityMenu.svelte', 'SkipLink.svelte']
const bytes = (await Promise.all(files.map(async(file) =>
	brotliCompressSync(await readFile(new URL(file, dist))).byteLength
))).reduce((total, size) => total + size, 0)
const limit = 12 * 1024

if (bytes > limit) {
	throw new Error(`Svelte adapter size ${bytes} B exceeds ${limit} B.`)
}

process.stdout.write(`Svelte adapter size: ${bytes} B brotli.\n`)
