import Dropdown from "./dropdown.js"
import Expander from "./expander.js"

const defaults = {
	breakpoint: 1000,
	classMobile: ['nav--mobile', 'expander'],
	classDesktop: ['nav--desktop'],
	classSubnav: 'nav',
	selectorTriggerToggle: '[data-nav="#{id}"]',
	onModeChange(mode) {},
	onActivation(mode) {},
	onDeactivation(mode) {}
}

export default class Navigation {
	constructor(element, settings = {}) {
		element.navigation = this
		this.element = element

		this.settings = Object.assign({}, defaults, settings)

		this._events = {
			resize: this.updateMode.bind(this),
			click: this._onClick.bind(this)
		}

		this._subnavs = []

		this._subnavs = Array.from(this.element.querySelectorAll(`.${this.settings.classSubnav}`))
			.map(subnav => {
				return {
					element: subnav,
					dropdown: new Dropdown(subnav, {
						selectorTriggerToggle: this.settings.selectorTriggerToggle,
						onOpen: this._activationHandler.bind(this),
						onClose: this._activationHandler.bind(this)
					}),
					expander: new Expander(subnav, {
						selectorTriggerToggle: this.settings.selectorTriggerToggle,
						beforeOpen: this._activationHandler.bind(this),
						beforeClose: this._activationHandler.bind(this)
					})
				}
			})

		// Parse trigger selector
		let matches
		let trigger = this.settings.selectorTriggerToggle
		while (matches = /{([^}]*)}/.exec(trigger)) {
			trigger = trigger.replace(matches[0], this.element.getAttribute(matches[1]))
		}

		// Root expander
		this.root = new Expander(this.element, {
			selectorTriggerToggle: trigger,
			beforeOpen: this._activationHandler.bind(this),
			beforeClose: this._activationHandler.bind(this)
		})

		this.enabled = 1
	}

	get disabled() { return !this._enabled }
	set disabled(value) { this.enabled = !value }
	get enabled() { return this._enabled }
	set enabled(value) {
		if (this._enabled && value) return

		this._enabled = !!value

		const bind = this._enabled ? 'addEventListener' : 'removeEventListener'
		window[bind]('resize', this._events.resize)
		this.element[bind]('click', this._events.click)

		this.updateMode()
	}

	updateMode() {
		const newMode = window.innerWidth < this.settings.breakpoint ? 'mobile' : 'desktop'
		if (this.mode == newMode) return
		this.mode = newMode

		// Handle root expander
		this.root._state = this.mode == 'desktop'
		this.root.disabled = this.mode == 'desktop'

		// Handle subnavs
		const [enableComponent, disableComponent] = this.mode == 'mobile'
			? ['expander', 'dropdown']
			: ['dropdown', 'expander']
		for (let subnav of this._subnavs) {
			subnav.element.classList.add(enableComponent)
			subnav.element.classList.remove(disableComponent)
			subnav[enableComponent].enabled = 1
			subnav[disableComponent]._state = 0
			subnav[disableComponent].disabled = 1
			subnav[disableComponent].removeClasses()
		}

		// Set classes to root
		const [add, remove] = this.mode == 'mobile'
			? [this.settings.classMobile, this.settings.classDesktop]
			: [this.settings.classDesktop, this.settings.classMobile]
		for (let className of add) this.element.classList.add(className)
		for (let className of remove) this.element.classList.remove(className)

		this._activationHandler()
		this.settings.onModeChange(this.mode)
	}

	_onClick(event) {
		if (event.target.href && event.target.getAttribute('href')[0] == '#') {
			if (this.mode == 'mobile') this.root.state = 0
		}
	}

	_activationHandler(nav = this.element) {
		if (this.mode == 'mobile' && nav != this.element || !nav.expander) return

		const activate = this.mode == 'mobile'
			? nav.expander.state
			: this._subnavs.filter(subnav => subnav.dropdown.state).length

		if (activate) {
			if (!this.active) {
				this.active = true
				this.settings.onActivation(this.mode)
			}
		} else {
			if (this.active) {
				this.active = false
				this.settings.onDeactivation(this.mode)
			}
		}
	}
}

