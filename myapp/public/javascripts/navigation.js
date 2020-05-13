import Navigation from './components/navigation.js'
import Jemmaaja from './components/jemmaaja.js'

const header = document.querySelector('.site-header')

// Setup navigation
const subnavs = document.querySelectorAll('#main-nav .nav')
subnavs.forEach(subnav => {
	const trigger = subnav.previousElementSibling
	trigger.dataset.nav = `#${subnav.id}`
	trigger.classList.add('nav-link')
	trigger.classList.add('nav-link--subnav')
})

new Navigation(document.querySelector('#main-nav'), {
	onModeChange: mode => {
		switch (mode) {
			case 'mobile':
				header.classList.add('site-header--mobile')
				header.classList.remove('site-header--desktop')
				break
			case 'desktop':
				header.classList.add('site-header--desktop')
				header.classList.remove('site-header--mobile')
				break
		}
	},
	onActivation: mode => {
		if (header.jemmaaja) {
			header.jemmaaja.disable()
			header.style.transform = null
		}
		if (mode == 'mobile') {
			document.body.classList.add('no-scroll')
		}
	},
	onDeactivation: mode => {
		if (header.jemmaaja && !jemmaajaTimeout) {
			header.jemmaaja.enable()
		}
		document.body.classList.remove('no-scroll')
	}
})

window.requestAnimationFrame(() => {
	new Jemmaaja(header)
})

// Smooth scroll jump links
let jemmaajaTimeout
document.querySelectorAll('a[href^="#"]:not(.no-jump)').forEach(link => {
	link.addEventListener('click', event => {
		event.preventDefault()
		history.pushState(null, null, link.getAttribute('href'))
		const target = document.querySelector(location.hash)
		if (target) {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' })
			if (header && header.jemmaaja) {
				header.jemmaaja.disable()
				clearTimeout(jemmaajaTimeout)
				jemmaajaTimeout = setTimeout(function() {
					header.jemmaaja.enable()
					jemmaajaTimeout = null
				}, 750)
			}
		}
	})
})
