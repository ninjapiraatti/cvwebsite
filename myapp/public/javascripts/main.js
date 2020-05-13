document.documentElement.classList.remove('loading')

import './navigation.js'
import Lightbox from './components/lightbox.js'
import Modaali from './components/modaali.js'
import Liukuri from './components/liukuri.js'
import Accordion from './components/accordion.js'
import Masonry from './components/masonry.js'

// Lightboxes
document.querySelectorAll('.lightbox').forEach(lightbox => {
	new Lightbox(lightbox, {
		onSlideChange: (slider, current) => {
			for (let offset = -1; offset <= 1; offset++) {
				let unloaded = slider.querySelector(`.lightbox__image:nth-child(${current + offset + 1}) > img[data-src]`)
				if (unloaded) {
					unloaded.src = unloaded.dataset.src
					unloaded.removeAttribute('data-src')
				}
			}
		}
	})
})

// Modals
document.querySelectorAll('.modaali').forEach(modal => {
	new Modaali(modal, {
		state: `#${modal.id}` == location.hash
	})
})

// Sliders
document.querySelectorAll('.liukuri').forEach(slider => {
	new Liukuri(slider)
})

// Accordions
document.querySelectorAll('.accordion').forEach(accordion => {
	new Accordion(accordion)
})

// Masonry
document.querySelectorAll('.masonry').forEach(masonry => {
	new Masonry(masonry)
})

