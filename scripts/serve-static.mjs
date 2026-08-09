import {createReadStream, statSync} from 'node:fs'
import {createServer} from 'node:http'
import path from 'node:path'

const [rootArgument, portArgument] = process.argv.slice(2)
if (!rootArgument || !portArgument) {
	throw new Error('Usage: node scripts/serve-static.mjs <root> <port>')
}

const root = path.resolve(rootArgument)
const port = Number(portArgument)
if (!Number.isInteger(port) || port <= 0) throw new Error('Port must be a positive integer.')

const contentTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml'
}

createServer((request, response) => {
	const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname)
	const candidate = path.resolve(root, `.${pathname}`)
	if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
		response.writeHead(403).end('Forbidden')
		return
	}

	let filePath = candidate
	try {
		if (statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html')
		if (!statSync(filePath).isFile()) throw new Error('Not a file')
	} catch {
		response.writeHead(404).end('Not found')
		return
	}

	response.setHeader('Content-Type', contentTypes[path.extname(filePath)] || 'application/octet-stream')
	createReadStream(filePath).pipe(response)
}).listen(port, '127.0.0.1', () => {
	console.log(`Serving ${root} at http://127.0.0.1:${port}`)
})
