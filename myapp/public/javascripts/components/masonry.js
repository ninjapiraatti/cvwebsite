const defaults = {
	round: 'floor',
	classItem: 'masonry__item',
	classContent: 'masonry__content'
}

export default class Masonry {
	constructor(element, settings = {}) {
		element.masonry = this
		this.element = element

		this.settings = Object.assign({}, defaults, settings)

		this._resizeEvent = this.resizeAll.bind(this)

		this.enabled = true
	}

	get disabled() { return this._disabled }
	set disabled(value) { this.enabled = !value }
	get enabled() { return this._enabled }
	set enabled(value) {
		if (this._enabled && value) return

		this._enabled = !!value
		this._disabled = !value

		const event = this._enabled ? 'addEventListener' : 'removeEventListener'
		this[`_${event}`]()

		this.resizeAll();
	}

	_addEventListener() {
		window.addEventListener('resize', this._resizeEvent)
		this.element.addEventListener('load', event => {
			let item = event.target
			while (item != this.element && !item.classList.contains(this.settings.classItem))
				item = item.parentNode
			if (item.classList.contains(this.settings.classItem)) this.resizeItem(item)
		}, true)
	}

	_removeEventListener() {
		window.removeEventListener('resize', this._resizeEvent)
	}

	resizeItem(item) {
		const gap = parseInt(window.getComputedStyle(this.element).getPropertyValue('grid-row-gap'))
		const row = parseInt(window.getComputedStyle(this.element).getPropertyValue('grid-auto-rows'))
		const span = Math[this.settings.round]((item.querySelector(`.${this.settings.classContent}`).getBoundingClientRect().height + gap) / (row + gap))
		item.style.gridRowEnd = `span ${span}`
	}

	resizeAll() {
		const items = this.element.querySelectorAll(`.${this.settings.classItem}`)
		items.forEach(this.resizeItem.bind(this))
	}
}

