/**
 * @file Dependency cruiser configuration
 * Enforces acyclic dependency graph and import hygiene in the monorepo.
 *
 * Guidance:
 * - No circular dependencies
 * - Do not import other packages’ internals (use published exports only)
 * - Production code must not depend on devDependencies
 * - Keep tests and test helpers out of runtime code
 */

const path = require('node:path')
const repoRoot = __dirname
module.exports = {
	forbidden: [
		{name: 'no-cycles',     severity: 'error', from: {}, to: {circular: true}},
		{name: 'no-unresolved', severity: 'error', from: {}, to: {couldNotResolve: true}},

		// Don’t pull test helpers into runtime
		{name: 'no-test-helpers-in-src', severity: 'error',
			from: {path: '^packages/.*/src/'},
			to:   {path: '^packages/.*/(test|__tests__|testing)/'}
		},
		{name: 'runtime-accessibility-does-not-depend-on-editor-contracts', severity: 'error',
			from: {path: '^packages/(?:accessibility|accessibility-astro|accessibility-svelte)/src/'},
			to: {path: 'editor-contracts'}
		},

		// Don’t import another package’s internals (only published exports).
		// Keep the package pairs explicit so imports within one package remain legal.
		{name: 'no-cross-internals-from-core', severity: 'error',
			from: {path: '^packages/accessibility/src/'},
			to: {path: '^packages/accessibility-(?:astro|svelte|editor-manifests)/src/'}
		},
		{name: 'no-cross-internals-from-astro', severity: 'error',
			from: {path: '^packages/accessibility-astro/src/'},
			to: {path: '^packages/(?:accessibility|accessibility-svelte|accessibility-editor-manifests)/src/'}
		},
		{name: 'no-cross-internals-from-svelte', severity: 'error',
			from: {path: '^packages/accessibility-svelte/src/'},
			to: {path: '^packages/(?:accessibility|accessibility-astro|accessibility-editor-manifests)/src/'}
		},
		{name: 'no-cross-internals-from-editor-manifests', severity: 'error',
			from: {path: '^packages/accessibility-editor-manifests/src/'},
			to: {path: '^packages/(?:accessibility|accessibility-astro|accessibility-svelte)/src/'}
		},

		// Production code must not depend on devDeps
		{name: 'no-dev-deps-in-src', severity: 'error',
			from: {path: '^packages/.*/src/'},
			to:   {dependencyTypes: ['npm-dev']}
		}
	],
	options: {
		tsPreCompilationDeps: true,
		includeOnly: '^(packages)/',
		tsConfig: {fileName: path.join(repoRoot, 'tsconfig.base.json')},
		enhancedResolveOptions: {
			extensions: ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json']
		},
		doNotFollow: {path: 'node_modules'},
		exclude: {
			path: [
				'node_modules',
				'dist',
				'coverage',
				'.husky',
				'test',
				'(^|/)\\.' // only dot-directories, not file extensions
			]
		}
	}
}
