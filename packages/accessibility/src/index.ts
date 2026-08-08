export type AccessibilityPreferenceKey =
	| 'highContrast'
	| 'monochrome'
	| 'highlightTitles'
	| 'highlightLinks'
	| 'pauseAnimations'
	| 'hideMedia'
	| 'largeCursor'
	| 'readingGuide'
	| 'focusHighlight'
	| 'fontScale'
	| 'lineHeight'
	| 'letterSpacing'

export type AccessibilityToggleKey = Exclude<
	AccessibilityPreferenceKey,
	'fontScale' | 'lineHeight' | 'letterSpacing'
>

export type AccessibilityRangeKey = Extract<
	AccessibilityPreferenceKey,
	'fontScale' | 'lineHeight' | 'letterSpacing'
>

export type AccessibilityPreferences = Record<AccessibilityToggleKey, boolean> &
	Record<AccessibilityRangeKey, number>

export type AccessibilityControlDefinition =
	| {
		type: 'toggle'
		key: AccessibilityToggleKey
		label: string
		icon?: string
	}
	| {
		type: 'range'
		key: AccessibilityRangeKey
		label: string
	}

export type AccessibilityStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type AccessibilityControllerOptions = {
	root?: HTMLElement
	storage?: AccessibilityStorage | null
	storageKey?: string
	onChange?: (preferences: AccessibilityPreferences) => void
}

export type AccessibilityController = {
	getPreferences: () => AccessibilityPreferences
	setPreferences: (preferences: Partial<AccessibilityPreferences>) => AccessibilityPreferences
	setPreference: <Key extends AccessibilityPreferenceKey>(
		key: Key,
		value: AccessibilityPreferences[Key]
	) => AccessibilityPreferences
	toggle: (key: AccessibilityToggleKey) => AccessibilityPreferences
	stepRange: (key: AccessibilityRangeKey, direction: -1 | 1) => AccessibilityPreferences
	reset: () => AccessibilityPreferences
	apply: () => void
	updateReadingGuide: (clientY: number) => void
	subscribe: (listener: (preferences: AccessibilityPreferences) => void) => () => void
	destroy: () => void
}

export type ApplyAccessibilityPreferencesOptions = {
	classPrefix?: string
	readyClass?: string
}

export type AccessibilityHeadScriptOptions = ApplyAccessibilityPreferencesOptions & {
	storageKey?: string
	defaults?: Partial<AccessibilityPreferences>
}

export const DEFAULT_ACCESSIBILITY_STORAGE_KEY = 'ooops.accessibility.preferences.v1'

export const ACCESSIBILITY_RANGE_MIN = 80
export const ACCESSIBILITY_RANGE_MAX = 200
export const ACCESSIBILITY_RANGE_STEP = 10

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
	highContrast: false,
	monochrome: false,
	highlightTitles: false,
	highlightLinks: false,
	pauseAnimations: false,
	hideMedia: false,
	largeCursor: false,
	readingGuide: false,
	focusHighlight: false,
	fontScale: 100,
	lineHeight: 100,
	letterSpacing: 100
}

export const DEFAULT_ACCESSIBILITY_CONTROLS: AccessibilityControlDefinition[] = [
	{type: 'range', key: 'fontScale', label: 'Font size'},
	{type: 'range', key: 'lineHeight', label: 'Line height'},
	{type: 'range', key: 'letterSpacing', label: 'Letter spacing'},
	{type: 'toggle', key: 'highContrast', label: 'High contrast'},
	{type: 'toggle', key: 'monochrome', label: 'Monochrome'},
	{type: 'toggle', key: 'highlightTitles', label: 'Highlight titles'},
	{type: 'toggle', key: 'highlightLinks', label: 'Highlight links'},
	{type: 'toggle', key: 'largeCursor', label: 'Large cursor'},
	{type: 'toggle', key: 'readingGuide', label: 'Reading guide'},
	{type: 'toggle', key: 'focusHighlight', label: 'Focus highlight'},
	{type: 'toggle', key: 'pauseAnimations', label: 'Reduce motion'},
	{type: 'toggle', key: 'hideMedia', label: 'Hide media'}
]

const toggleKeys: AccessibilityToggleKey[] = [
	'highContrast',
	'monochrome',
	'highlightTitles',
	'highlightLinks',
	'pauseAnimations',
	'hideMedia',
	'largeCursor',
	'readingGuide',
	'focusHighlight'
]

const rangeKeys: AccessibilityRangeKey[] = ['fontScale', 'lineHeight', 'letterSpacing']

const classSuffixByToggle: Record<AccessibilityToggleKey, string> = {
	highContrast: 'high-contrast',
	monochrome: 'monochrome',
	highlightTitles: 'highlight-titles',
	highlightLinks: 'highlight-links',
	pauseAnimations: 'reduce-motion',
	hideMedia: 'hide-media',
	largeCursor: 'large-cursor',
	readingGuide: 'reading-guide',
	focusHighlight: 'focus-highlight'
}

const cssVarByRange: Record<AccessibilityRangeKey, string> = {
	fontScale: '--ooops-a11y-font-scale',
	lineHeight: '--ooops-a11y-line-height-factor',
	letterSpacing: '--ooops-a11y-letter-spacing'
}

const focusableSelector = [
	'a[href]',
	'area[href]',
	'button:not([disabled])',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'iframe',
	'object',
	'embed',
	'[contenteditable="true"]',
	'[tabindex]:not([tabindex="-1"])'
].join(',')

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getDefaultStorage = () => {
	if (typeof window === 'undefined') return null
	return window.localStorage ?? null
}

const normalizePreferences = (input: Partial<AccessibilityPreferences> = {}): AccessibilityPreferences => {
	const next = {...DEFAULT_ACCESSIBILITY_PREFERENCES, ...input}

	for (const key of toggleKeys) {
		next[key] = Boolean(next[key])
	}

	for (const key of rangeKeys) {
		const value = Number(next[key])
		next[key] = clamp(Number.isFinite(value) ? value : 100, ACCESSIBILITY_RANGE_MIN, ACCESSIBILITY_RANGE_MAX)
	}

	return next
}

export const loadAccessibilityPreferences = (
	options: {storage?: AccessibilityStorage | null; storageKey?: string; defaults?: Partial<AccessibilityPreferences>} = {}
): AccessibilityPreferences => {
	const storage = options.storage === undefined ? getDefaultStorage() : options.storage
	const defaults = normalizePreferences(options.defaults)

	if (!storage) return defaults

	try {
		const raw = storage.getItem(options.storageKey ?? DEFAULT_ACCESSIBILITY_STORAGE_KEY)
		if (!raw) return defaults
		return normalizePreferences({...defaults, ...(JSON.parse(raw) as Partial<AccessibilityPreferences>)})
	} catch {
		return defaults
	}
}

export const saveAccessibilityPreferences = (
	preferences: Partial<AccessibilityPreferences>,
	options: {storage?: AccessibilityStorage | null; storageKey?: string} = {}
) => {
	const storage = options.storage === undefined ? getDefaultStorage() : options.storage
	const next = normalizePreferences(preferences)

	if (storage) {
		storage.setItem(options.storageKey ?? DEFAULT_ACCESSIBILITY_STORAGE_KEY, JSON.stringify(next))
	}

	return next
}

export const resetAccessibilityPreferences = (
	options: {storage?: AccessibilityStorage | null; storageKey?: string; persistDefaults?: boolean} = {}
) => {
	const storage = options.storage === undefined ? getDefaultStorage() : options.storage
	const storageKey = options.storageKey ?? DEFAULT_ACCESSIBILITY_STORAGE_KEY

	if (storage) {
		if (options.persistDefaults) {
			storage.setItem(storageKey, JSON.stringify(DEFAULT_ACCESSIBILITY_PREFERENCES))
		} else {
			storage.removeItem(storageKey)
		}
	}

	return {...DEFAULT_ACCESSIBILITY_PREFERENCES}
}

export const applyAccessibilityPreferences = (
	root: HTMLElement,
	preferences: Partial<AccessibilityPreferences>,
	options: ApplyAccessibilityPreferencesOptions = {}
) => {
	const classPrefix = options.classPrefix ?? 'ooops-a11y'
	const readyClass = options.readyClass ?? `${classPrefix}-ready`
	const next = normalizePreferences(preferences)

	root.classList.add(readyClass)

	for (const key of toggleKeys) {
		root.classList.toggle(`${classPrefix}-${classSuffixByToggle[key]}`, next[key])
	}

	root.style.setProperty(cssVarByRange.fontScale, String(next.fontScale / 100))
	root.style.setProperty(cssVarByRange.lineHeight, String(next.lineHeight / 100))
	root.style.setProperty(
		cssVarByRange.letterSpacing,
		`${(((next.letterSpacing - 100) / 100) * 0.12).toFixed(3)}em`
	)

	if (next.readingGuide && !root.style.getPropertyValue('--ooops-a11y-reading-guide-y')) {
		const viewportMidpoint = typeof window === 'undefined' ? 0 : Math.round(window.innerHeight / 2)
		root.style.setProperty('--ooops-a11y-reading-guide-y', `${viewportMidpoint}px`)
	}

	return next
}

export const createAccessibilityHeadScript = (options: AccessibilityHeadScriptOptions = {}) => {
	const payload = serializeInlineJson({
		storageKey: options.storageKey ?? DEFAULT_ACCESSIBILITY_STORAGE_KEY,
		defaults: normalizePreferences(options.defaults),
		classPrefix: options.classPrefix ?? 'ooops-a11y',
		readyClass: options.readyClass ?? `${options.classPrefix ?? 'ooops-a11y'}-ready`
	})

	return `(() => {
  const config = ${payload};
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const normalize = (input = {}) => {
    const next = {...config.defaults, ...input};
    for (const key of ['highContrast','monochrome','highlightTitles','highlightLinks','pauseAnimations','hideMedia','largeCursor','readingGuide','focusHighlight']) {
      next[key] = Boolean(next[key]);
    }
    for (const key of ['fontScale','lineHeight','letterSpacing']) {
      const value = Number(next[key]);
      next[key] = clamp(Number.isFinite(value) ? value : 100, 80, 200);
    }
    return next;
  };
  const root = document.documentElement;
  let settings = config.defaults;
  try {
    const raw = window.localStorage.getItem(config.storageKey);
    settings = raw ? normalize(JSON.parse(raw)) : normalize();
  } catch {
    settings = normalize();
  }
  root.classList.add(config.readyClass);
  const classes = {
    highContrast: 'high-contrast',
    monochrome: 'monochrome',
    highlightTitles: 'highlight-titles',
    highlightLinks: 'highlight-links',
    pauseAnimations: 'reduce-motion',
    hideMedia: 'hide-media',
    largeCursor: 'large-cursor',
    readingGuide: 'reading-guide',
    focusHighlight: 'focus-highlight'
  };
  for (const [key, suffix] of Object.entries(classes)) {
    root.classList.toggle(config.classPrefix + '-' + suffix, Boolean(settings[key]));
  }
  root.style.setProperty('--ooops-a11y-font-scale', String(settings.fontScale / 100));
  root.style.setProperty('--ooops-a11y-line-height-factor', String(settings.lineHeight / 100));
  root.style.setProperty('--ooops-a11y-letter-spacing', (((settings.letterSpacing - 100) / 100) * 0.12).toFixed(3) + 'em');
})();`
}

export const createAccessibilityController = (options: AccessibilityControllerOptions = {}): AccessibilityController => {
	const root = options.root ?? (typeof document === 'undefined' ? undefined : document.documentElement)
	const storage = options.storage === undefined ? getDefaultStorage() : options.storage
	const storageKey = options.storageKey ?? DEFAULT_ACCESSIBILITY_STORAGE_KEY
	const listeners = new Set<(preferences: AccessibilityPreferences) => void>()
	let preferences = loadAccessibilityPreferences({storage, storageKey})

	const notify = () => {
		for (const listener of listeners) listener({...preferences})
		options.onChange?.({...preferences})
	}

	const persistAndApply = () => {
		preferences = saveAccessibilityPreferences(preferences, {storage, storageKey})
		if (root) applyAccessibilityPreferences(root, preferences)
		notify()
		return {...preferences}
	}

	if (root) applyAccessibilityPreferences(root, preferences)

	return {
		getPreferences: () => ({...preferences}),
		setPreferences: (next) => {
			preferences = normalizePreferences({...preferences, ...next})
			return persistAndApply()
		},
		setPreference: (key, value) => {
			preferences = normalizePreferences({...preferences, [key]: value})
			return persistAndApply()
		},
		toggle: (key) => {
			preferences = normalizePreferences({...preferences, [key]: !preferences[key]})
			return persistAndApply()
		},
		stepRange: (key, direction) => {
			preferences = normalizePreferences({
				...preferences,
				[key]: preferences[key] + direction * ACCESSIBILITY_RANGE_STEP
			})
			return persistAndApply()
		},
		reset: () => {
			preferences = resetAccessibilityPreferences({storage, storageKey})
			if (root) applyAccessibilityPreferences(root, preferences)
			notify()
			return {...preferences}
		},
		apply: () => {
			if (root) applyAccessibilityPreferences(root, preferences)
		},
		updateReadingGuide: (clientY) => {
			if (!root || !preferences.readingGuide) return
			root.style.setProperty('--ooops-a11y-reading-guide-y', `${Math.round(clientY)}px`)
		},
		subscribe: (listener) => {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
		destroy: () => {
			listeners.clear()
		}
	}
}

export const getFocusableElements = (container: HTMLElement | null | undefined): HTMLElement[] => {
	if (!container || typeof document === 'undefined') return []

	return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
		if (element.tabIndex < 0) return false
		if (element.getAttribute('aria-hidden') === 'true') return false
		if (element.closest('[aria-hidden="true"], [inert], [hidden]')) return false
		return isElementVisible(element)
	})
}

export const focusInitialTarget = (
	container: HTMLElement | null | undefined,
	preferred?: HTMLElement | null
) => {
	if (!container || typeof window === 'undefined') return
	const focusableElements = getFocusableElements(container)
	const target = preferred && focusableElements.includes(preferred) ? preferred : focusableElements[0] ?? container
	window.requestAnimationFrame(() => target.focus())
}

export const trapTabKey = (event: KeyboardEvent, container: HTMLElement | null | undefined) => {
	if (event.key !== 'Tab') return false
	if (!container || typeof document === 'undefined') return false

	const focusableElements = getFocusableElements(container)
	if (focusableElements.length === 0) {
		event.preventDefault()
		container.focus()
		return true
	}

	const firstElement = focusableElements[0]!
	const lastElement = focusableElements.at(-1)!
	const active = document.activeElement

	if (event.shiftKey && (!active || active === firstElement || !container.contains(active))) {
		event.preventDefault()
		lastElement.focus()
		return true
	}

	if (!event.shiftKey && (!active || active === lastElement || !container.contains(active))) {
		event.preventDefault()
		firstElement.focus()
		return true
	}

	return false
}

export type ModalFocusControllerOptions = {
	getContainer: () => HTMLElement | null | undefined
	getRoot?: () => HTMLElement | null | undefined
	getInitialFocus?: () => HTMLElement | null | undefined
	getRestoreFocusTo?: () => HTMLElement | null | undefined
	shouldRestoreFocus?: () => boolean
	onEscape?: (event: KeyboardEvent) => void
}

export type ModalFocusController = {
	isActive: () => boolean
	isTop: () => boolean
	setOpen: (open: boolean) => void
	handleKeydown: (event: KeyboardEvent) => void
	handleFocusin: (event: FocusEvent) => void
	destroy: () => void
}

export type FocusTrapOptions = ModalFocusControllerOptions & {
	modal?: boolean
	containFocus?: boolean
}

export type FocusTrap = {
	isActive: () => boolean
	activate: () => void
	deactivate: () => void
	setActive: (active: boolean) => void
	destroy: () => void
}

type InertRecord = {
	inert: boolean
	ariaHidden: string | null
}

const modalStack: Array<ModalFocusController & {
	getContainerElement: () => HTMLElement | null
	getRootElement: () => HTMLElement | null
}> = []
const inertRecords = new Map<HTMLElement, InertRecord>()

export const createModalFocusController = (options: ModalFocusControllerOptions): ModalFocusController => {
	let active = false
	let restoreTarget: HTMLElement | null = null

	const controller = {
		getContainerElement: () => options.getContainer() ?? null,
		getRootElement: () => options.getRoot?.() ?? options.getContainer() ?? null,
		isActive: () => active,
		isTop: () => getTopModal() === controller,
		setOpen(open: boolean) {
			if (typeof window === 'undefined' || typeof document === 'undefined') return

			const container = options.getContainer()
			const root = options.getRoot?.() ?? container
			const canActivate = open && isConnectedElement(container) && isConnectedElement(root)

			if (canActivate && !active) {
				restoreTarget = options.getRestoreFocusTo?.() ?? (document.activeElement as HTMLElement | null)
				active = true
				if (!modalStack.includes(controller)) modalStack.push(controller)
				reconcileModalIsolation()
				focusInitialTarget(container, options.getInitialFocus?.() ?? null)
				return
			}

			if (!open && active) {
				active = false
				removeModalFromStack(controller)
				const target = options.getRestoreFocusTo?.() ?? restoreTarget
				restoreTarget = null
				if (options.shouldRestoreFocus?.() !== false) restoreFocus(target)
			}
		},
		handleKeydown(event: KeyboardEvent) {
			if (!active || !controller.isTop()) return
			if (event.key === 'Tab') {
				trapTabKey(event, options.getContainer())
				return
			}
			if (event.key !== 'Escape') return
			event.preventDefault()
			options.onEscape?.(event)
		},
		handleFocusin(event: FocusEvent) {
			if (!active || !controller.isTop() || typeof window === 'undefined') return
			const container = options.getContainer()
			const root = options.getRoot?.() ?? container
			const target = event.target
			if (!container || !(target instanceof Node) || container.contains(target) || root?.contains(target)) return
			focusInitialTarget(container, options.getInitialFocus?.() ?? null)
		},
		destroy() {
			if (!active) return
			active = false
			removeModalFromStack(controller)
			const target = options.getRestoreFocusTo?.() ?? restoreTarget
			restoreTarget = null
			if (options.shouldRestoreFocus?.() !== false) restoreFocus(target)
		}
	}

	return controller
}

export const createFocusTrap = (options: FocusTrapOptions): FocusTrap => {
	const modal = options.modal === true
	const containFocus = options.containFocus !== false
	const modalController = modal ? createModalFocusController(options) : null
	let active = false
	let restoreTarget: HTMLElement | null = null

	const handleKeydown = (event: KeyboardEvent) => {
		if (!active) return
		if (event.key === 'Tab') {
			trapTabKey(event, options.getContainer())
			return
		}
		if (event.key !== 'Escape') return
		event.preventDefault()
		options.onEscape?.(event)
	}

	const handleFocusin = (event: FocusEvent) => {
		if (!active || !containFocus || typeof window === 'undefined') return
		const container = options.getContainer()
		const target = event.target
		if (!container || !(target instanceof Node) || container.contains(target)) return
		focusInitialTarget(container, options.getInitialFocus?.() ?? null)
	}

	const setActive = (nextActive: boolean) => {
		if (typeof window === 'undefined' || typeof document === 'undefined') return
		if (modalController) {
			if (nextActive && !active) {
				document.addEventListener('keydown', modalController.handleKeydown, true)
				document.addEventListener('focusin', modalController.handleFocusin, true)
			}
			if (!nextActive && active) {
				document.removeEventListener('keydown', modalController.handleKeydown, true)
				document.removeEventListener('focusin', modalController.handleFocusin, true)
			}
			modalController.setOpen(nextActive)
			active = nextActive
			return
		}

		const container = options.getContainer()
		const canActivate = nextActive && isConnectedElement(container)
		if (canActivate && !active) {
			restoreTarget = options.getRestoreFocusTo?.() ?? (document.activeElement as HTMLElement | null)
			active = true
			document.addEventListener('keydown', handleKeydown, true)
			document.addEventListener('focusin', handleFocusin, true)
			focusInitialTarget(container, options.getInitialFocus?.() ?? null)
			return
		}

		if (!nextActive && active) {
			active = false
			document.removeEventListener('keydown', handleKeydown, true)
			document.removeEventListener('focusin', handleFocusin, true)
			const target = options.getRestoreFocusTo?.() ?? restoreTarget
			restoreTarget = null
			if (options.shouldRestoreFocus?.() !== false) restoreFocus(target)
		}
	}

	return {
		isActive: () => active,
		activate: () => setActive(true),
		deactivate: () => setActive(false),
		setActive,
		destroy: () => {
			setActive(false)
			modalController?.destroy()
		}
	}
}

export const shouldReduceMotion = (root: HTMLElement | null | undefined = typeof document === 'undefined' ? null : document.documentElement) => {
	if (typeof window === 'undefined') return false
	return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) ||
		Boolean(root?.classList.contains('ooops-a11y-reduce-motion'))
}

export const watchReducedMotion = (
	onChange: (reduced: boolean) => void,
	root: HTMLElement | null | undefined = typeof document === 'undefined' ? null : document.documentElement
) => {
	if (typeof window === 'undefined') {
		onChange(false)
		return () => {}
	}

	const update = () => onChange(shouldReduceMotion(root))
	const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
	const observer = root && typeof MutationObserver !== 'undefined' ? new MutationObserver(update) : null

	update()
	media?.addEventListener?.('change', update)
	if (root) observer?.observe(root, {attributes: true, attributeFilter: ['class']})

	return () => {
		media?.removeEventListener?.('change', update)
		observer?.disconnect()
	}
}

const isElementVisible = (element: HTMLElement) => {
	if (!element.isConnected) return false
	if (element.hidden) return false

	const ownerWindow = element.ownerDocument?.defaultView
	const style = ownerWindow?.getComputedStyle(element)
	if (style?.display === 'none' || style?.visibility === 'hidden') return false

	const isJsdom = ownerWindow?.navigator.userAgent.toLowerCase().includes('jsdom') ?? false
	return element.getClientRects().length > 0 || element.offsetWidth > 0 || element.offsetHeight > 0 || isJsdom
}

const restoreFocus = (element: HTMLElement | null | undefined) => {
	if (!element || typeof window === 'undefined' || typeof document === 'undefined') return
	if (!document.contains(element)) return
	window.requestAnimationFrame(() => {
		if (document.contains(element)) element.focus()
	})
}

const isConnectedElement = (element: HTMLElement | null | undefined): element is HTMLElement => Boolean(element?.isConnected)

const getTopModal = () => {
	for (let index = modalStack.length - 1; index >= 0; index -= 1) {
		const controller = modalStack[index]!
		if (isConnectedElement(controller.getRootElement()) && isConnectedElement(controller.getContainerElement())) {
			return controller
		}
	}

	return null
}

const restoreInertElement = (element: HTMLElement, record: InertRecord) => {
	element.inert = record.inert
	if (record.ariaHidden === null) {
		element.removeAttribute('aria-hidden')
	} else {
		element.setAttribute('aria-hidden', record.ariaHidden)
	}
}

const applyManagedInert = (element: HTMLElement) => {
	if (!inertRecords.has(element)) {
		inertRecords.set(element, {inert: Boolean(element.inert), ariaHidden: element.getAttribute('aria-hidden')})
	}
	element.inert = true
	element.setAttribute('aria-hidden', 'true')
}

const reconcileModalIsolation = () => {
	if (typeof document === 'undefined') return

	const activeRoot = getTopModal()?.getRootElement() ?? null

	for (const [element, record] of Array.from(inertRecords.entries())) {
		restoreInertElement(element, record)
		inertRecords.delete(element)
	}

	if (!activeRoot) return

	let branch: HTMLElement | null = activeRoot
	let parent = branch.parentElement

	while (parent) {
		for (const child of Array.from(parent.children)) {
			if (!(child instanceof HTMLElement)) continue
			if (child === branch || child.contains(activeRoot)) continue
			applyManagedInert(child)
		}
		if (parent === document.body) break
		branch = parent
		parent = parent.parentElement
	}
}

const removeModalFromStack = (controller: ModalFocusController) => {
	const index = modalStack.indexOf(controller as (typeof modalStack)[number])
	if (index >= 0) modalStack.splice(index, 1)
	reconcileModalIsolation()
}

const ESCAPED_JSON_CHARACTERS: Record<string, string> = {
	'<': '\\u003c',
	'>': '\\u003e',
	'&': '\\u0026',
	'\u2028': '\\u2028',
	'\u2029': '\\u2029'
}

const serializeInlineJson = (value: unknown) =>
	JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => ESCAPED_JSON_CHARACTERS[character]!)
