// store list of presentations which include what is the title and its current slide
// default to 2 presentations, demo & my presentation
// the list is loaded from config file under config/index.js
var presentations = {};

exports.setupRemotePresenter = function (app, io, config) {
	// load initial presentation list from config file
	presentations = config.presentations;

	// add presentations to routing
	var presentationConfig = {};
	for (var presentation in presentations) {
		if (presentations.hasOwnProperty(presentation)) {
			presentationConfig = presentations[presentation];

			app.get(
				'/' + presentationConfig['id'],
				function (config) {
					return function (request, response) {
						function getThemePath(config) {
							var theme = (config['theme'] || 'main') + '.css';

							if (theme.indexOf('/') < 0) {
								theme = /css/ + theme;
							}

							return theme;
						}

						response.render(
							config['id'],
							{
								title: config['title'],
								theme: getThemePath(config)
							}
						);
					}
				}(presentationConfig)
			);
		}
	}

	// always add the controller
	app.get('/controller', function (request, res) {
		res.render(
			'controller',
			{
				title: 'Remote Presentation Controller',
				layout: "controller_layout",
				presentations: presentations
			}
		);
	});


	// setup remote control here
	// socket.io setup
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
			console.log("receive command " + JSON.stringify(command));
			// TODO: future might need a way to tell how many slides there are
			// presentation id
			var presentationId = command['id'];
			// command can be 'up', 'down', 'left', 'right'
			var cmd = command['txt'];

			if (presentations[presentationId]) {
				var presentationConfig = presentations[presentationId];
				// update ppt information
				if (cmd == 'up') {
					presentationConfig.indexv--;
				}
				else if (cmd == 'down') {
					presentationConfig.indexv++;
				}
				else if (cmd == 'left') {
					presentationConfig.indexh--;
				}
				else if (cmd == 'right') {
					presentationConfig.indexh++;
				}

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
};