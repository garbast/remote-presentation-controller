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
	controls: false,
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

head.js('/socket.io/socket.io.js', function() {
	// connect
	var socket = io.connect('/');

	socket.on('connect', function () {
		console.log('client connected. Sending current slide request');

		// on connect send presentation request
		socket.emit('request_presentation', {'id': presentation_id} );

		// init data
		socket.on('initdata', function(data) {
			console.log('Init data: ' + JSON.stringify(data) );
			if(data.id == presentation_id)
			{
				// go to the respective slide
				Reveal.navigateTo(data.indexh, data.indexv);
			}
		});

		socket.on('updatedata', function(data) {
			console.log('Receive update data: ' + JSON.stringify(data) );

			if (data.id == presentation_id) {
				// go to the respective slide
				Reveal.navigateTo(data.indexh, data.indexv);
			}
		});
	});
});