import Expander from "./expander.js"

const defaults = {
	open: null,
	classElement: 'expander'
}

export default class Accordion {
	constructor(element, settings = {}) {
		element.accordion = this
		this.element = element

		this.settings = Object.assign({}, defaults, settings)

		this.settings.beforeOpen = element => {
			for (const expander of this._expanders) {
				if (expander === element.expander) continue
				expander.state = 0
			}
			if (settings.beforeOpen) settings.beforeOpen(element)
		}

		this._expanders = Array.from(element.children)
			.filter(child => child.classList.contains(this.settings.classElement))
			.map((expander, index) => new Expander(expander, Object.assign({},
				this.settings,
				{
					state: index == this.settings.open
				}
			)))

		this.enabled = true
	}

	get disabled() { return this._disabled }
	set disabled(value) { this.enabled = !value }
	get enabled() { return this._enabled }
	set enabled(value) {
		if (this._enabled && value) return

		this._enabled = !!value
		this._disabled = !value

		for (const expander of this._expanders) {
			expander.enabled = this._enabled
		}
	}
}

