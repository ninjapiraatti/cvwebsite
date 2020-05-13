import Modaali from './modaali.js'
import Liukuri from './liukuri.js'

export default class Lightbox extends Modaali {

	_defaultOptions() {
		const className = this.constructor.name.toLowerCase()
		return Object.assign(super._defaultOptions(), {
			triggerAction : `data-${className}-slide`,
			contentClass: `${className}__content`,
			onSlideChange: function(slider, newIndex, oldIndex) {}
		})
	}

	constructor(element, options = {}) {
		super(element, options)

		this.liukuri = this.element.querySelector(`.${this.options.contentClass}`)
		if (this.liukuri) {
			this.liukuri = new Liukuri(this.liukuri, {
				triggerSelector: this.options.triggerSelector,
				triggerAction: this.options.triggerAction,
				onSlideChange: this.options.onSlideChange
			})
		}

		// Call onSlideChange when opening for the first time
		this.liukuri.slide = null

		this.enable()
	}

	enable() {
		super.enable()

		if (this.liukuri) {
			this.liukuri.enable()
		}
	}

	disable(clearClasses) {
		super.disable(clearClasses)

		if (this.liukuri) {
			this.liukuri.disable(clearClasses)
		}
	}

	open(slide) {
		super.open()

		if (slide == undefined) slide = this.liukuri.slide
		this.liukuri.slideTo(slide, true)
	}

	_triggerClick(event) {
		let element = event.target
		let slideRule
		while (element != document.body) {
			slideRule = element.getAttribute(this.options.triggerAction)
			if (slideRule) break;
			element = element.parentNode
		}

		event.preventDefault()
		if (this.state) {
			if (!slideRule) this.close()
		} else {
			this.open(slideRule)
		}
	}

	_onKeyDown(event) {
		switch (event.which) {
			case 27: // Esc
				event.preventDefault()
				this.close()
				break
			case 37: // Left
				event.preventDefault()
				this.liukuri.slideTo('prev')
				break
			case 39: // Right
				event.preventDefault()
				this.liukuri.slideTo('next')
				break
		}
	}

}
