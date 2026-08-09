import {spawn} from 'node:child_process'
import {cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'

const repoRoot = process.cwd()
const cacheRoot = path.join(repoRoot, '.cache', 'e2e')
const tarballDir = path.join(cacheRoot, 'tarballs')
const fixturesRoot = path.join(repoRoot, 'tests', 'fixtures')

await rm(cacheRoot, {recursive: true, force: true})
await mkdir(tarballDir, {recursive: true})
await run('pnpm', ['build'], repoRoot)

const coreTarball = await pack('accessibility')
const astroTarball = await pack('accessibility-astro')
const svelteTarball = await pack('accessibility-svelte')

await prepareConsumer('astro-consumer', {
	__CORE_TARBALL__: `file:${coreTarball}`,
	__ADAPTER_TARBALL__: `file:${astroTarball}`
})
await prepareConsumer('svelte-consumer', {
	__CORE_TARBALL__: `file:${coreTarball}`,
	__ADAPTER_TARBALL__: `file:${svelteTarball}`
})

console.log('Prepared and built packed Astro and Svelte accessibility consumers.')

async function pack(packageDirectory) {
	const packagePath = path.join(repoRoot, 'packages', packageDirectory)
	const manifest = JSON.parse(await readFile(path.join(packagePath, 'package.json'), 'utf8'))
	await run('pnpm', ['pack', '--pack-destination', tarballDir], packagePath)
	const normalizedName = manifest.name.replace(/^@/u, '').replaceAll('/', '-')
	const artifact = (await readdir(tarballDir)).find((entry) =>
		entry.startsWith(`${normalizedName}-`) && entry.endsWith('.tgz')
	)
	if (!artifact) throw new Error(`Packed artifact not found for ${manifest.name}.`)
	return path.join(tarballDir, artifact)
}

async function prepareConsumer(name, replacements) {
	const source = path.join(fixturesRoot, name)
	const destination = path.join(cacheRoot, name)
	await cp(source, destination, {recursive: true})

	const manifestPath = path.join(destination, 'package.json')
	let manifest = await readFile(manifestPath, 'utf8')
	for (const [placeholder, value] of Object.entries(replacements)) {
		manifest = manifest.replaceAll(placeholder, value)
	}
	await writeFile(manifestPath, manifest)
	await writeFile(path.join(destination, 'pnpm-workspace.yaml'), [
		'packages: []',
		'overrides:',
		`  '@ooopsstudio/accessibility': ${JSON.stringify(replacements.__CORE_TARBALL__)}`,
		'allowBuilds:',
		'  esbuild: true',
		'  sharp: true',
		''
	].join('\n'))

	await run('pnpm', ['install', '--no-frozen-lockfile'], destination)
	await run('pnpm', ['build'], destination)
}

function run(command, args, cwd) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {cwd, stdio: 'inherit', env: process.env})
		child.on('close', (code) => {
			if (code === 0) resolve()
			else reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}.`))
		})
	})
}
