head.js('/js/jquery-1.12.3.min.js', '/socket.io/socket.io.js', function () {
	// connect
	var socket = io.connect('/');

	socket.on('connect', function () {
		console.log('controller connected.');
		var $whichPresentation = $('#whichPresentation');

		$('.ctl_btn', $('#mycontrols')).bind('click', function () {
			// send command (up/down/left/right)
			var command = $(this).data('command'),
				presentation = $whichPresentation.val();

			// send command to server
			socket.emit('command', {'id': presentation, 'txt': command});
		});
	});

	$('#fullScreenButton').on('click', function () {
		toggleFullScreen('mainController', $(this));
	});

	function toggleFullScreen(id, $button) {
		var element = document.getElementById(id);
		if (!document.fullscreenElement &&    // alternative standard method
			!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
			$button.text('Exit');
			if (element.requestFullscreen) {
				element.requestFullscreen();
			} else if (element.msRequestFullscreen) {
				element.msRequestFullscreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		} else {
			$button.text('Fullscreen');
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		}
		document.getSelection().removeAllRanges();
	}
});