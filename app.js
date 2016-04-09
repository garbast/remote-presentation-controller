/**
 * Module dependencies.
 */
var express = require('express'),
	routes = require('./routes'),
	config = require('./config').config;


// application
var app = module.exports = express.createServer();


// socket io
var io = require('socket.io');
// socket io setup
io = io.listen(app);
// configure socket.io
io.configure(function () {
	// reduce level of logging to warning only
	io.set('log level', 1);

	io.set('transports', [
		'websocket',
		'flashsocket',
		'htmlfile',
		'xhr-polling',
		'jsonp-polling'
	]);
});


// configure express
app.configure(function () {
	app.set('views', __dirname + '/presentations');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({secret: 'your secret here'}));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

// debugging config
app.configure('development', function () {
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});
app.configure('production', function () {
	app.use(express.errorHandler());
});

app.listen(config.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


// remote control the presentation server code
routes.setupRemotePresenter(app, io, config);
