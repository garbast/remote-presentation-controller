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

function initializeDiagram() {
	function getChartData(chart) {
		var section = chart.parentNode.parentNode.parentNode.parentNode.parentNode,
			data = section.getElementsByClassName('data')[0],
			rows = data.getElementsByTagName('tbody')[0].getElementsByTagName('tr'),
			rowIndex = 0,
			rowLength = rows.length,
			maxY = 0;

		var columns = {x: [], y: [], cols: {}};
		for (; rowIndex < rowLength; rowIndex++) {
			var row = rows[rowIndex],
				cells = row.getElementsByTagName('td'),
				cellIndex = 0,
				cellLength = cells.length;
			for (; cellIndex < cellLength; cellIndex++) {
				var cell = cells[cellIndex],
					value = cell.innerHTML;

				if (cellIndex == 0) {
					columns.x.push(value);
				} else {
					value = parseInt(value, 10);
					maxY = maxY > value ? maxY : value;

					if (!columns.cols.hasOwnProperty(cellIndex)) {
						columns.cols[cellIndex] = [];
					}

					columns.cols[cellIndex].push(value);
				}
			}
		}

		// @todo calc y and push to columns.y
		var ySteps = Math.ceil(maxY / 10);

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
		function initChart(chart) {
			var tableData = getChartData(chart);

			var margin = {top: 20, right: 20, bottom: 30, left: 50},
				width = (1200 / 2) - margin.left - margin.right,
				height = 750 - margin.top - margin.bottom;

			var x = d3.time.scale()
				.range([0, width]);

			var y = d3.scale.linear()
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");

			var line = d3.svg.line()
				.x(function(d) { return x(d.date); })
				.y(function(d) { return y(d.close); });

			var svg = d3.select(chart)
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			x.domain(d3.extent(tableData.x, function(d) { return d.date; }));
			y.domain(d3.extent(tableData.y, function(d) { return d.close; }));

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Lines");

			for (var data in tableData) {
				if (!tableData.hasOwnProperty(data)) {
					continue;
				}

				svg.append("path")
					.datum(data)
					.attr("class", "line")
					.attr("d", line);
			}
		}

		var charts = d3.select('.lineChart');

		for (var chartGroup in charts) {
			if (charts.hasOwnProperty(chartGroup)) {
				chartGroup = charts[chartGroup];
				for (var chart in chartGroup) {
					if (chartGroup.hasOwnProperty(chart)) {
						initChart(chartGroup[chart]);
					}
				}
			}
		}
	}

	initializeLineCharts();
}

// Full list of configuration options available at:
// https://github.com/hakimel/reveal.js#configuration
Reveal.initialize({
	controls: false,
	progress: true,
	history: true,
	center: true,
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
		{ src: 'js/d3/d3.min.js', async: true, callback: initializeDiagram }
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