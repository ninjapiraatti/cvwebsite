const defaults = {
	state: 0,
	classElementOpen: 'expander--open',
	classElementClosed: 'expander--closed',
	classElementTransition: 'expander--transition',
	classTriggerActive: 'active',
	selectorTriggerOpen: '[data-expander-open="#{id}"]',
	selectorTriggerClose: '[data-expander-close="#{id}"]',
	selectorTriggerToggle: '[data-expander="#{id}"]',
	beforeOpen(element) {},
	afterOpen(element) {},
	beforeClose(element) {},
	afterClose(element) {}
}

export default class Expander {
	constructor(element, settings = {}) {
		element.expander = this
		this.element = element

		this.settings = Object.assign({}, defaults, settings)

		// Parse selectors
		for (let [key, value] of Object.entries(this.settings)) {
			if (!/^selector/.test(key)) continue
			let matches
			while (matches = /{([^}]*)}/.exec(this.settings[key])) {
				this.settings[key] = this.settings[key].replace(matches[0], this.element.getAttribute(matches[1]))
			}
		}

		this._triggers = []

		this._state = this.settings.state
		this.enabled = true
	}

	get state() { return this._state }
	set state(value) {
		if (this._disabled || value == this.state) return

		this._state = value ? 1 : 0

		this.settings[this.state ? 'beforeOpen' : 'beforeClose'](this.element)

		this._transitioning
			? this.setHeight()
			: this.animate()

		this.setupTriggerState()
	}

	get disabled() { return this._disabled }
	set disabled(value) { this.enabled = !value }
	get enabled() { return this._enabled }
	set enabled(value) {
		if (this._enabled && value) return

		this._enabled = !!value
		this._disabled = !value

		this.setupElementState()

		const bind = this._enabled ? 'addEventListener' : 'removeEventListener'
		this[`_${bind}Triggers`]()
	}

	_addEventListenerTriggers() {
		// Add trigger events
		for (let key of Object.keys(this.settings)) {
			if (!/^selectorTrigger/.test(key)) continue
			for (let trigger of document.querySelectorAll(this.settings[key])) {
				const action = /^selectorTrigger(.*)/.exec(key)[1]
				this._triggers.unshift({
					element: trigger,
					action: action,
					event: this._triggerClick.bind(this, action)
				})
				trigger.addEventListener('click', this._triggers[0].event)
			}
		}

		this.setupTriggerState()
	}

	_removeEventListenerTriggers() {
		this.setupTriggerState()

		// Remove trigger events
		for (let {element, event} of this._triggers) {
			if (element) element.removeEventListener('click', event)
		}
		this._triggers.length = 0
	}

	setHeight(height = this.state ? this.element.scrollHeight : 0) {
		this.element.style.height = `${height}px`
	}

	animate() {
		const prepare = () => new Promise((resolve, reject) => {
			this.element.classList.remove(this.settings.classElementClosed)
			this.element.classList.remove(this.settings.classElementOpen)
			this.setHeight(this.state ? 0 : this.element.scrollHeight)
			requestAnimationFrame(() => { resolve() })
		})

		const startTransition = () => new Promise((resolve, reject) => {
			this._transitioning = true
			let handler
			this.element.addEventListener('transitionend', handler = event => {
				this.element.removeEventListener('transitionend', handler)
				resolve()
			})
			this.element.classList.add(this.settings.classElementTransition)
			requestAnimationFrame(() => { this.setHeight() })
		})

		const endTransition = () => new Promise((resolve, reject) => {
			this.element.classList.remove(this.settings.classElementTransition)
			this._transitioning = false
			this.element.style.height = ''
			this.settings[this.state ? 'afterOpen' : 'afterClose'](this.element)
			resolve()
		})

		prepare()
			.then(startTransition)
			.then(endTransition)
			.then(() => this.setupElementState())
	}

	setupState() {
		this.setupElementState()
		this.setupTriggerState()
	}

	setupElementState() {
		this._transitioning = false
		this.element.style.height = ''
		this.element.classList.remove(this.settings.classElementTransition)
		this.element.classList[this.state ? 'remove' : 'add'](this.settings.classElementClosed)
		this.element.classList[this.state ? 'add' : 'remove'](this.settings.classElementOpen)
	}

	setupTriggerState() {
		for (const {element} of this._triggers.filter(trigger => trigger.action !== 'Close')) {
			element.classList[this.state ? 'add' : 'remove'](this.settings.classTriggerActive)
		}
	}

	_triggerClick(action, event) {
		event.preventDefault()
		const actionMap = {
			Open: 1,
			Close: 0,
			Toggle: !this.state
		}
		this.state = actionMap[action]
	}

	removeClasses() {
		const classes = Object.entries(this.settings)
			.filter(entry => /^classElement/.test(entry[0]))
			.map(entry => entry[1])
		this.element.classList.remove(...classes)

		for (const {element} of this._triggers)
			element.classList.remove(this.settings.classTriggerActive)
	}

}

