export default class Liukuri {

	_defaultOptions() {
		const className = this.constructor.name.toLowerCase()
		return {
			slide: 0,
			triggerSelector: `[data-${className}="#{id}"], a[href="#{id}"]`,
			triggerAction: `[data-${className}-slide]`,
			triggerActiveClass: 'active',
			onSlideChange: function(slider, newIndex, oldIndex) {}
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

		this.slide = this.options.slide;

		this._boundOnResize = this._onResize.bind(this)
		this._boundOnScroll = this._onScroll.bind(this)

		// Don't enable extended classes automatically
		if (this.constructor.name == 'Liukuri') {
			this.enable()
			this.slideTo(this.slide, true)
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

		window.addEventListener('resize', this._boundOnResize)
		this.element.addEventListener('scroll', this._boundOnScroll)
	}

	disable() {
		if (!this.enabled) return
		this.enabled = 0

		while (this._triggers.length) {
			this._triggers[0].element.removeEventListener('click', this._triggers[0].event)
			this._triggers.shift()
		}

		window.removeEventListener('resize', this._boundOnResize)
		this.element.removeEventListener('scroll', this._boundOnScroll)
	}

	slideTo(target, instant) {
		if (!this.enabled || target == undefined) return

		let index
		switch (typeof target) {
			case 'string':
				switch (target) {
					case 'prev': index = this.slide - 1; break
					case 'next': index = this.slide + 1; break
					default: index = parseInt(target); break
				}
				break

			case 'number':
				index = target
				break
		}

		if (index != undefined) {
			index = Math.max(0, Math.min(index, this.element.children.length - 1))
			target = this.element.children[index]
		}

		if (target && target.parentNode == this.element) {
			if (index != undefined) {
				index = Array.prototype.indexOf.call(this.element.children, target)
			}

			if (index != this.slide) {
				this.options.onSlideChange.call(this, this.element, index, this.slide)
			}

			this.slide = index
			this._updateTriggers()
			this.element.scrollTo({
				left: target.offsetLeft,
				behavior: instant ? 'auto' : 'smooth'
			})
		} else {
			console.error(`${this.constructor.name}.slideTo(target): target must be "prev", "next", or slide index or slide reference`)
		}
	}

	_triggerClick(event) {
		event.preventDefault()
		this.slideTo(event.target.getAttribute(this.options.triggerAction))
	}

	_updateTriggers() {
		this._triggers.forEach((trigger, index) => {
			let action = trigger.element.getAttribute(this.options.triggerAction)

			if (!isNaN(action)) {
				if (action == this.slide) {
					trigger.element.classList.add(this.options.triggerActiveClass)
				} else {
					trigger.element.classList.remove(this.options.triggerActiveClass)
				}
			} else {
				if (action == 'prev') {
					trigger.element.style.display = this.slide == 0 ? 'none' : ''
				}
				if (action == 'next') {
					trigger.element.style.display = this.slide == this.element.children.length - 1 ? 'none' : ''
				}
			}
		})
	}

	_onScroll(event) {
		clearTimeout(this._scrollTimeout)
		this._scrollTimeout = setTimeout(() => {
			// Avoid division by zero (if slider was hidden during scroll)
			if (this.element.offsetWidth) {
				const slide = Math.round(this.element.scrollLeft / this.element.offsetWidth)
				if (slide != this.slide) {
					this.options.onSlideChange.call(this, this.element, slide, this.slide)
					this.slide = slide
					this._updateTriggers()
				}
			}
		}, 100)
	}

	_onResize(event) {
		if (!this._resizeTick) {
			this._resizeTick = window.requestAnimationFrame(this._trackResize.bind(this))
		}
	}

	_trackResize() {
		// Run again on next frame when resizing
		this._resizeTick = false
		if (this.slide != undefined) {
			this.element.scrollTo({
				left: this.element.children[this.slide].offsetLeft
			})
		}
	}

}

