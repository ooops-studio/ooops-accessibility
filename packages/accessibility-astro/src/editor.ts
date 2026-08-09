import {accessibilityEditorManifest} from '@ooopsstudio/accessibility/editor'
import {
	parseAccessibilityManifest,
	parseComponentManifest,
	EDITOR_POSITION_OFFSETS,
	type EditorComponentManifest,
	type EditorPartManifest,
	type EditorPositioningCapability,
	type EditorPropManifest,
	type EditorStyleProperty,
	type EditorValueSchema
} from '@ooopsstudio/editor-contracts'

const stringSchema: EditorValueSchema = {kind: 'string'}
const booleanSchema: EditorValueSchema = {kind: 'boolean'}
const enumSchema = (...values: string[]): EditorValueSchema => ({kind: 'enum', values})

const prop = (
	id: string,
	label: string,
	schema: EditorValueSchema,
	options: Partial<Omit<EditorPropManifest, 'id' | 'label' | 'schema' | 'editable'>> & {editable?: boolean} = {}
): EditorPropManifest => ({id, label, schema, editable: options.editable ?? true, ...options})

const surfaceStyles: EditorStyleProperty[] = [
	'background-color', 'border-color', 'border-radius', 'border-style', 'border-width', 'box-shadow',
	'color', 'display', 'gap', 'height', 'margin', 'max-height', 'max-width', 'min-height', 'min-width',
	'opacity', 'padding', 'width', 'align-items', 'justify-content', 'grid-template-columns'
]
const textStyles: EditorStyleProperty[] = [
	'color', 'font-family', 'font-size', 'font-style', 'font-weight', 'letter-spacing', 'line-height',
	'text-align', 'text-decoration', 'margin', 'padding'
]

const localPositioning: EditorPositioningCapability = {
	editable: true,
	modes: ['static', 'relative'],
	offsets: [...EDITOR_POSITION_OFFSETS],
	responsive: true,
	zIndex: {editable: true, tokens: ['z-index-base', 'z-index-raised'], allowCustom: false}
}

const part = (
	componentId: string,
	id: string,
	states: string[] = ['default']
): EditorPartManifest => ({
	id,
	selector: id === 'root' ? ':scope' : `[data-part="${id}"], [data-ooops-a11y-${id}], .ooops-a11y-${id}`,
	states,
	styleProperties: /label|title|eyebrow|value/.test(id) ? textStyles : surfaceStyles,
	responsive: true,
	positioning: positioningFor(componentId, id)
})

const component = (
	id: string,
	label: string,
	adapter: string,
	props: EditorPropManifest[],
	parts: string[],
	states: string[] = ['default']
): EditorComponentManifest => {
	const parsed = parseComponentManifest({
		schemaVersion: 2,
		id,
		label,
		category: 'accessibility',
		owner: '@ooopsstudio/accessibility-astro',
		insertable: true,
		adapters: {astro: adapter, controller: '@ooopsstudio/accessibility'},
		props,
		slots: id === 'accessibility-menu' ? [
			{id: 'trigger', label: 'Trigger content', editable: true},
			{id: 'menu', label: 'Menu content', editable: true},
			{id: 'header', label: 'Header content', editable: true},
			{id: 'before-controls', label: 'Before controls', editable: true},
			{id: 'after-controls', label: 'After controls', editable: true},
			{id: 'footer', label: 'Footer content', editable: true}
		] : [],
		events: [],
		parts: parts.map((partId) => part(id, partId, states)),
		variants: []
	})
	if (!parsed.ok) throw new Error(`Invalid accessibility component manifest ${id}: ${parsed.issues.map((issue) => `${issue.path} ${issue.message}`).join('; ')}`)
	return parsed.value
}

function positioningFor(componentId: string, partId: string): EditorPositioningCapability {
	const locked = componentId === 'accessibility-head'
		|| componentId === 'skip-link' && partId === 'root'
		|| componentId === 'accessibility-menu' && ['root', 'trigger', 'overlay', 'panel'].includes(partId)
	if (!locked) return localPositioning
	return {
		editable: false,
		modes: componentId === 'accessibility-head' ? ['static'] : ['absolute', 'fixed'],
		offsets: [],
		responsive: false,
		zIndex: {
			editable: false,
			tokens: componentId === 'accessibility-head' ? [] : ['z-index-toast'],
			allowCustom: false
		}
	}
}

export const accessibilityAstroComponentManifests = Object.freeze({
	'accessibility-head': component(
		'accessibility-head',
		'Accessibility head bootstrap',
		'@ooopsstudio/accessibility-astro/AccessibilityHead.astro',
		[
			prop('enabled', 'Enabled', booleanSchema, {default: true, control: 'boolean'}),
			prop('storageKey', 'Storage key', stringSchema, {editable: false}),
			prop('includeGlobalEffects', 'Global effects', booleanSchema, {default: true, control: 'boolean'})
		],
		['root']
	),
	'accessibility-menu': component(
		'accessibility-menu',
		'Accessibility menu',
		'@ooopsstudio/accessibility-astro/AccessibilityMenu.astro',
		[
			prop('enabled', 'Enabled', booleanSchema, {default: true, control: 'boolean'}),
			prop('label', 'Label', stringSchema, {default: 'Accessibility', control: 'text'}),
			prop('position', 'Position', enumSchema('bottom-left', 'bottom-right', 'top-left', 'top-right', 'inline'), {default: 'bottom-right', control: 'enum'}),
			prop('locale', 'Locale', enumSchema('en', 'el'), {default: 'en', control: 'enum'}),
			prop('storageKey', 'Storage key', stringSchema, {editable: false}),
			prop('panelId', 'Panel ID', stringSchema, {editable: false}),
			prop('includeBaseStyles', 'Base styles', booleanSchema, {default: true, control: 'boolean'}),
			prop('includeGlobalEffects', 'Global effects', booleanSchema, {default: true, control: 'boolean'})
		],
		[
			'root', 'trigger', 'trigger-label', 'trigger-icon', 'overlay', 'panel', 'header',
			'header-content', 'header-actions', 'eyebrow', 'title', 'reset', 'close',
			'close-icon', 'close-label', 'grid', 'item', 'card', 'toggle', 'icon-wrap',
			'control-icon', 'toggle-label', 'range', 'control-title', 'range-controls',
			'range-button', 'value'
		],
		['closed', 'open', 'active']
	),
	'skip-link': component(
		'skip-link',
		'Skip link',
		'@ooopsstudio/accessibility-astro/SkipLink.astro',
		[
			prop('href', 'Target', stringSchema, {default: '#main-content', control: 'text'}),
			prop('label', 'Label', stringSchema, {default: 'Skip to content', control: 'text'}),
			prop('locale', 'Locale', enumSchema('en', 'el'), {default: 'en', control: 'enum'}),
			prop('includeBaseStyles', 'Base styles', booleanSchema, {default: true, control: 'boolean'})
		],
		['root', 'label'],
		['default', 'focus']
	)
})

const parsed = parseAccessibilityManifest({
	...accessibilityEditorManifest,
	components: Object.values(accessibilityAstroComponentManifests)
})
if (!parsed.ok) throw new Error(`Invalid Astro accessibility editor manifest: ${parsed.issues.map((issue) => `${issue.path} ${issue.message}`).join('; ')}`)

export const accessibilityAstroEditorManifest = parsed.value
export type {AccessibilityEditorManifest, EditorComponentManifest} from '@ooopsstudio/editor-contracts'
