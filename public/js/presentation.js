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
		data = section.getElementsByClassName('data')[0],
		rows = data.getElementsByTagName('tbody')[0].getElementsByTagName('tr'),
		rowIndex = 0,
		rowLength = rows.length,
		maxY = 0;

	var columns = { x: [], y: [ 0 ], columns: [] };
	for (; rowIndex < rowLength; rowIndex++) {
		var row = rows[rowIndex],
			cells = row.getElementsByTagName('td'),
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
	}

	var ySteps = Math.ceil(maxY / 10);
	for (var i = 0; i < 11; i++) {
		columns.y.push(ySteps * (1 + i));
	}

	return columns;
}

function initBar() {
	//------ code to show D3 Bar Chart on First Slide-------
	var data = [44, 28, 15, 16, 23, 5];
	var width = 420,
		barHeight = 20;

	var x = d3.scale.linear()
		.domain([0, d3.max(data)])
		.range([0, width]);

	var chart = d3.select(".chart")
		.attr("width", width)
		.attr("height", barHeight * data.length);

	var bar = chart.selectAll("g")
		.data(data)
		.enter().append("g")
		.attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

	bar.append("rect")
		.attr("width", x)
		.attr("height", barHeight - 1);

	bar.append("text")
		.attr("x", function(d) { return x(d) - 3; })
		.attr("y", barHeight / 2)
		.attr("dy", ".35em")
		.text(function(d) { return d; });
}

function initializeLineCharts() {
	function initChart(chartElement) {
		var tableData = getChartData(chartElement),

			svg = d3.select(chartElement),
			margin = { top: 20, right: 20, bottom: 30, left: 60 },
			width = (1200 * 0.65) - margin.left - margin.right,
			height = 660 - margin.top - margin.bottom,

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
			.attr('transform', 'translate(0,' + (height - margin.bottom + 10) + ')')
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