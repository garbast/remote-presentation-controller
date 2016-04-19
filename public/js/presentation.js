/* global presentation_id, head */
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

function getChartData(chart) {
	var section = chart.parentNode.parentNode.parentNode.parentNode.parentNode,
		elementQuery = '.' + section.className.replace(' ', '.') + ' table.data tbody tr',
		legendRow = d3.select('.' + section.className.replace(' ', '.') + ' table.data thead tr')[0][0],
		dataRows = d3.selectAll(elementQuery),
		maxY = 0,
		columns = { x: [], y: [ 0 ], columns: [], legends: [] };

	if (typeof legendRow === 'object') {
		var cells = legendRow.getElementsByTagName('th'),
			cellIndex = 1,
			cellLength = cells.length;

		for (; cellIndex < cellLength; cellIndex++) {
			var cell = cells[cellIndex],
				value = cell.innerHTML;

			columns.legends.push(value);
		}
	}

	dataRows[0].forEach(function(row) {
		var cells = row.getElementsByTagName('td'),
			cellIndex = 0,
			cellLength = cells.length,
			x = 0;

		for (; cellIndex < cellLength; cellIndex++) {
			var cell = cells[cellIndex],
				value = cell.innerHTML;

			if (cellIndex > 0 && columns.columns.length < cellIndex) {
				columns.columns.push([]);
			}

			// first column are x axis labels
			if (cellIndex === 0) {
				columns.x.push(value);
				x = value;
			} else {
				value = parseInt(value, 10);
				maxY = maxY > value ? maxY : value;

				columns.columns[cellIndex - 1].push({'x': x, 'y': value});
			}
		}
	});

	var ySteps = Math.ceil(maxY / 10);
	for (var i = 0; i < 11; i++) {
		columns.y.push(ySteps * (1 + i));
	}

	return columns;
}

function initializeLineCharts() {
	function initChart(chartElement) {
		var tableData = getChartData(chartElement),

			svg = d3.select(chartElement),
			margin = { top: 20, right: 20, bottom: 30, left: 60 },
			width = (1200 * 0.65) - margin.left - margin.right,
			height = 660 - margin.top - margin.bottom,

			lSpace = width/tableData.legends.length,

			// Define the scales
			xScale = d3.scale.linear().range([margin.left, width - margin.right])
				.domain([tableData.x[0], tableData.x[tableData.x.length - 1]]),
			yScale = d3.scale.linear().range([height - margin.top, margin.bottom])
				.domain([tableData.y[0], tableData.y[tableData.y.length - 1]]),

			// Define the axis
			xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(tableData.x.length),
			yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(tableData.y.length);

		// Resize the svg
		svg.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		// Add x axis
		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + (height - margin.bottom + 8) + ')')
			.call(xAxis);

		// Add y axis
		svg.append('g')
			.attr('class', 'y axis')
			.attr('transform', 'translate(' + margin.left + ', 0)')
			.call(yAxis)

			// with label
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('x', -30)
			.attr('dy', '.71em')
			.style('text-anchor', 'end')
			.text('Lines');

		// Define the a line generator
		var lineGenerator = d3.svg.line()
			.x(function(d) { return xScale(d.x); })
			.y(function(d) { return yScale(d.y); })
			.interpolate('monotone');

		// Iterate over data and add lines
		tableData.columns.forEach(function(d, columnIndex) {
			svg.append('svg:path')
				.attr('class', 'line line' + columnIndex)
				.attr('d', lineGenerator(d));

			svg.append('text')
				.attr('x', (lSpace / 2) + columnIndex * lSpace)
				.attr('y', 16)
				.style('fill', 'black')
				.text(tableData.legends[columnIndex]);

			svg.append('rect')
				.attr('class', 'line line' + columnIndex)
				.attr('x', (lSpace / 2) + columnIndex * lSpace)
				.attr('y', 22)
				.attr('height', 1)
				.attr('width', 100);
		});
	}

	d3.selectAll('.lineChart').each(function() {
		initChart(this);
	});
}

function initializeDiagrams() {
	initializeLineCharts();
}

// Full list of configuration options available at:
// https://github.com/hakimel/reveal.js#configuration
Reveal.initialize({
	controls: false,
	progress: true,
	history: true,
	center: false,
	slideNumber: true,

	width: 1200,
	height: 750,

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
		{ src: 'js/reveal.js-menu/menu.js', async: true, callback: hideMenuButtonOutsideSpeakerDeck },
		{ src: 'js/d3/d3.min.js', async: true, callback: initializeDiagrams }
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
				Reveal.navigateTo(data.indexh, data.indexv, 0, 0);
			}
		});

		socket.on('updatedata', function(data) {
			console.log('Receive update data: ' + JSON.stringify(data) );

			if (data.id == presentation_id) {
				// go to the respective slide
				Reveal.navigateTo(data.indexh, data.indexv, 0, 0);
			}
		});
	});
});