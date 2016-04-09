var baseUrl = 'reveal.js/';

function hideMenuButtonOutsideSpeakerDeck() {
	var menuButton = document.querySelector('.slide-menu-button');
	if (menuButton == null) {
		setTimeout(hideMenuButtonOutsideSpeakerDeck, 100);
	} else {
		if (!window.frameElement) {
			menuButton.style.display = 'none';
		}
	}
}

// Full list of configuration options available at:
// https://github.com/hakimel/reveal.js#configuration
Reveal.initialize({
	controls: true,
	progress: true,
	history: true,
	center: true,

	transition: 'slide', // none/fade/slide/convex/concave/zoom

	// Optional reveal.js plugins
	dependencies: [
		{ src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } },
		{ src: baseUrl + 'plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
		{ src: baseUrl + 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
		{ src: baseUrl + 'plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
		{ src: baseUrl + 'plugin/zoom-js/zoom.js', async: true },
		{ src: baseUrl + 'plugin/notes/notes.js', async: true },

		// optional js not provided by reveal.js
		{ src: 'js/reveal.js-menu/menu.js', async: true, callback: hideMenuButtonOutsideSpeakerDeck }
	]
});