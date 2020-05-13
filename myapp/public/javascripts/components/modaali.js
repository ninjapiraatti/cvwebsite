export default class Modaali {

	_defaultOptions() {
		const className = this.constructor.name.toLowerCase()
		return {
			state: 0,
			triggerSelector: `[data-${className}="#{id}"], a[href="#{id}"]`,
			openClass: `${className}--open`,
			closedClass: `${className}--closed`,
			onOpen: function() {},
			onClose: function() {}
		}
	}

	constructor(element, options = {}) {
		if (typeof element == 'string') {
			element = document.querySelector(element)
		}
		if (!element || !element.nodeType == Node.ELEMENT_NODE) {
			console.error(`${this.constructor.name}.constructor(element): element reference or a query is required`)
		}

		const instanceName = this.constructor.name.toLowerCase()

		if (element[instanceName]) return

		this.element = element
		element[instanceName] = this

		this.options = Object.assign(this._defaultOptions(), options)

		let match
		while (match = /{([^}]*)}/.exec(this.options.triggerSelector)) {
			this.options.triggerSelector = this.options.triggerSelector.replace(match[0], this.element.getAttribute(match[1]))
		}

		this._triggers = []

		this._boundTransitionEnd = this._onTransitionend.bind(this)
		this._boundKeyDown = this._onKeyDown.bind(this)

		this.state = this.options.state;

		// Don't enable extended classes automatically
		if (this.constructor.name == 'Modaali') {
			this.enable()
		}
	}

	enable() {
		if (this.enabled) return
		this.enabled = 1

		const triggers = document.querySelectorAll(this.options.triggerSelector)
		triggers.forEach(trigger => {
			this._triggers.unshift({
				element: trigger,
				event: this._triggerClick.bind(this)
			})
			trigger.addEventListener('click', this._triggers[0].event)
		})

		this.setState()
	}

	disable(clearClasses) {
		if (!this.enabled) return
		this.enabled = 0

		while (this._triggers.length) {
			this._triggers[0].element.removeEventListener('click', this._triggers[0].event)
			this._triggers.shift()
		}

		if (clearClasses) {
			this.element.classList.remove(this.options.openClass)
			this.element.classList.remove(this.options.closedClass)
		}
	}

	open() {
		if (!this.enabled) return
		this.state = 1

		if (!this._transitioning) {
			this._transitioning = true
			this.element.addEventListener('transitionend', this._boundTransitionEnd)
			this.element.setAttribute('aria-hidden', false)
			document.body.classList.add('no-scroll')
		}

		window.requestAnimationFrame(() => {
			this.element.classList.remove(this.options.closedClass)
			this.element.classList.add(this.options.openClass)
		})
	}

	close() {
		if (!this.enabled) return
		this.state = 0

		this.element.classList.remove(this.options.openClass)
		this.element.classList.add(this.options.closedClass)

		if (!this._transitioning) {
			this._transitioning = true
			this.element.addEventListener('transitionend', this._boundTransitionEnd)
		}
	}

	setState() {
		if (this.state) {
			this.element.classList.remove(this.options.closedClass)
			this.element.classList.add(this.options.openClass)
			this.element.setAttribute('aria-hidden', false)
			this.options.onOpen(this.element)
			document.body.classList.add('no-scroll')
			document.addEventListener('keydown', this._boundKeyDown)
		} else {
			this.element.classList.remove(this.options.openClass)
			this.element.classList.add(this.options.closedClass)
			this.element.setAttribute('aria-hidden', true)
			this.options.onClose(this.element)
			document.body.classList.remove('no-scroll')
			document.removeEventListener('keydown', this._boundKeyDown)
		}
	}

	_triggerClick(event) {
		event.preventDefault()
		if (this.state) {
			this.close()
		} else {
			this.open()
		}
	}

	_onTransitionend(event) {
		this.setState()
		this._transitioning = false
		this.element.removeEventListener('transitionend', this._boundTransitionEnd)
	}

	_onKeyDown(event) {
		if (event.which == 27) { // Esc
			event.preventDefault()
			this.close()
		}
	}

}

