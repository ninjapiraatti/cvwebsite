const instances = []
const instancesToKeepOpen = []

document.addEventListener('click', event => { instancesToKeepOpen.length = 0 }, true)
document.addEventListener('click', function(event) {
	instances
		.filter(instance => instancesToKeepOpen.indexOf(instance) < 0)
		.forEach(instance => {
			instance.state = 0
		})
})

window.addEventListener('resize', event => {
	instances
		.filter(instance => instance.state)
		.forEach(instance => {
			instance.updateDirection()
		})
})

const defaults = {
	state: 0,
	classElementOpen: 'dropdown--open',
	classElementClosed: 'dropdown--closed',
	classElementReverse: 'dropdown--reverse',
	classTriggerActive: 'active',
	selectorTriggerOpen: '[data-dropdown-open="#{id}"]',
	selectorTriggerClose: '[data-dropdown-close="#{id}"]',
	selectorTriggerToggle: '[data-dropdown="#{id}"]',
	onOpen(element) {},
	onClose(element) {}
}

export default class Dropdown {
	constructor(element, settings = {}) {
		element.dropdown = this
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

		this._events = {
			click: event => { instancesToKeepOpen.push(this) },
			triggers: []
		}

		this.enabled = 1
		this.state = this.settings.state
	}

	get state() { return this._state }
	set state(value) {
		if (this.disabled || value == this._state) return

		this._state = value ? 1 : 0

		this.setupElementState()

		this.settings[this._state ? 'onOpen' : 'onClose'](this.element)

		if (this.state) {
			// Open ancestor dropdowns
			const ancestors = this.getAncestors()
			instancesToKeepOpen.push(this, ...ancestors)
			ancestors
				.filter(dropdown => !dropdown.state)
				.forEach(dropdown => dropdown.state = 1)

			// Update direction
			this.updateDirection()
		}

		this.setupTriggerState()
	}

	get disabled() { return !this._enabled }
	set disabled(value) { this.enabled = !value }
	get enabled() { return this._enabled }
	set enabled(value) {
		if (this._enabled && value) return

		this._enabled = !!value

		this.setupElementState()

		this._enabled
			? instances.push(this)
			: instances.splice(instances.indexOf(this), 1)

		const bind = this._enabled ? 'addEventListener' : 'removeEventListener'
		this.element[bind]('click', this._events.click)
		this[`_${bind}Triggers`]()
	}

	_addEventListenerTriggers() {
		// Add trigger events
		for (let key of Object.keys(this.settings)) {
			if (!/^selectorTrigger/.test(key)) continue
			for (let trigger of document.querySelectorAll(this.settings[key])) {
				const action = /^selectorTrigger(.*)/.exec(key)[1]
				this._events.triggers.unshift({
					element: trigger,
					action: action,
					event: this._triggerClick.bind(this, action)
				})
				trigger.addEventListener('click', this._events.triggers[0].event)
			}
		}

		this.setupTriggerState()
	}

	_removeEventListenerTriggers() {
		this.setupTriggerState()

		// Remove trigger events
		for (let {element, event} of this._events.triggers) {
			if (element) element.removeEventListener('click', event)
		}
		this._events.triggers.length = 0
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

	setupState() {
		this.setupElementState()
		this.setupTriggerState()
	}

	setupElementState() {
		this.element.classList[this.state ? 'remove' : 'add'](this.settings.classElementClosed)
		this.element.classList[this.state ? 'add' : 'remove'](this.settings.classElementOpen)
	}

	setupTriggerState() {
		for (const {element} of this._events.triggers.filter(trigger => trigger.action !== 'Close')) {
			element.classList[this.state ? 'add' : 'remove'](this.settings.classTriggerActive)
		}
	}

	getAncestors() {
		const dropdowns = []
		let element = this.element.parentNode
		while (element !== document.body) {
			if (element.dropdown) dropdowns.push(element.dropdown)
			element = element.parentElement
		}
		return dropdowns
	}

	updateDirection() {
		this.element.classList.remove(this.settings.classElementReverse)
		if (this.element.getBoundingClientRect().right > window.innerWidth - 5) {
			this.element.classList.add(this.settings.classElementReverse)
		}
	}

	removeClasses() {
		const classes = Object.entries(this.settings)
			.filter(entry => /^classElement/.test(entry[0]))
			.map(entry => entry[1])
		this.element.classList.remove(...classes)

		for (const {element} of this._events.triggers)
			element.classList.remove(this.settings.classTriggerActive)
	}

}

