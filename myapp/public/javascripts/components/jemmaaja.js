export default class Jemmaaja {

	_defaultOptions() {
		const className = this.constructor.name.toLowerCase()
		return {
			speed: 1,
			min: -this.element.offsetHeight,
			max: 0
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

		this._boundOnScroll = this._onScroll.bind(this)

		this.transform = 0

		// Don't enable extended classes automatically
		if (this.constructor.name == 'Jemmaaja') {
			this.enable()
		}
	}

	enable() {
		if (this.enabled) return
		this.enabled = 1

		// Set initial scroll position
		this._lastScroll = window.pageYOffset

		window.addEventListener('scroll', this._boundOnScroll)
	}

	disable() {
		if (!this.enabled) return
		this.enabled = 0

		window.removeEventListener('scroll', this._boundOnScroll)
	}

	_onScroll(event) {
		if (!this._scrollTick) {
			this._scrollTick = window.requestAnimationFrame(this._update.bind(this))
		}
	}

	_update() {
		// Run again on next frame when scrolling
		this._scrollTick = false

		// Get current scroll position
		// Safari's rubber band gives too low values so we cap it to 0
		const scroll = Math.max(0, window.pageYOffset)

		const scrollDelta = scroll - this._lastScroll

		// Store the scroll to calculate scrollDelta on next iteration
		this._lastScroll = scroll

		// Calculate the transform and cap it to the min/max
		this.transform = Math.max(Math.min(this.transform - scrollDelta * this.options.speed, this.options.max), this.options.min)

		this.element.style.transform = 'translateY(' + this.transform + 'px)'
	}

}

