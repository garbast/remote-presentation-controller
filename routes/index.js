// store list of presentations which include what is the title and its current slide
// default to 2 presentations, demo & my presentation
// the list is loaded from config file under config/index.js

/**
 * Add presentations and controller to path mapping
 *
 * @param {object} presentations
 * @param {object} app
 */
function addRoutes(presentations, app) {
	// add presentations to routing
	let presentationConfig = {};
	for (let presentation in presentations) {
		if (presentations.hasOwnProperty(presentation)) {
			presentationConfig = presentations[presentation];

			app.get('/' + presentationConfig['id'], function (config) {
				return function (request, response) {
					function getThemePath(config) {
						let theme = (config['theme'] || 'black') + '.css';

						if (theme.indexOf('/') < 0) {
							theme = 'reveal.js/css/theme/' + theme;
						}

						return theme;
					}

					response.render(
						config['id'],
						{
							layout: (config['layout'] || '../layouts/presentation'),
							title: config['title'],
							presentationId: config['id'],
							theme: getThemePath(config)
						}
					);
				}
			}(presentationConfig));
		}
	}

	// add the remote controller
	app.get('/controller', function (request, response) {
		response.render(
			'_controller',
			{
				layout: '../layouts/controller',
				title: 'Remote Presentation Controller',
				presentations: presentations
			}
		);
	});

	// add index
	app.get('/', function (request, response) {
		response.render(
			'_index',
			{
				layout: '../layouts/controller',
				title: 'Overview',
				presentations: presentations
			}
		);
	});
}

/**
 * setup remote control here
 * socket.io setup
 *
 * @param {object} presentations
 * @param {object} io
 */
function setupRemoteController(presentations, io) {
	io.sockets.on('connection', function (socket) {
		// once connected need to broadcast the cur slide data
		socket.on('request_presentation', function (data) {
			if (presentations[data.id]) {
				console.log('sending init presentation data ' + JSON.stringify(presentations[data.id]));
				socket.emit('initdata', presentations[data.id]);
			}
		});

		// send commands to make slide go previous/ next/etc
		// this should be triggered from the remote controller
		socket.on('command', function (command) {
			console.log('receive command ' + JSON.stringify(command));
			// TODO: future might need a way to tell how many slides there are
			// presentation id
            let presentationId = command['id'];
			// command can be 'up', 'down', 'left', 'right'
            let cmd = command['txt'];

			if (presentations[presentationId]) {
                let presentationConfig = presentations[presentationId];
				// update ppt information
				if (cmd === 'up') {
					presentationConfig.indexv--;
				}
				else if (cmd === 'down') {
					presentationConfig.indexv++;
				}
				else if (cmd === 'left') {
					presentationConfig.indexh--;
				}
				else if (cmd === 'right') {
					presentationConfig.indexh++;
				}

				// safe gate to prevent negative values
				if (presentationConfig.indexh < 0) {
					presentationConfig.indexh = 0;
				}
				if (presentationConfig.indexv < 0) {
					presentationConfig.indexv = 0;
				}

				presentations[presentationId] = presentationConfig;

				// send the new data for update
				socket.broadcast.emit('updatedata', presentationConfig);
			}
		});
	});
}

/**
 * @param {object} app
 * @param {object} io
 * @param {object} config
 */
exports.setupRemotePresenter = function (app, io, config) {
	addRoutes(config.presentations, app);
	setupRemoteController(config.presentations, io);
};