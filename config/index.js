var config = {
	port: 3000,

	// store default list of presentations
	presentations: {
		'demo': { // demo presentation
			id: 'demo',  // id for each presentation, currently same as the url
			title: 'Demo Presentation',
			indexh: 0,  // initial slide horizontal index
			indexv: 0  // initial slide vertical index
		},

		'myppt': { // powerpoint presentation
			id: 'myppt',
			title: 'My Presentation',
			indexh: 0,  // initial slide horizontal index
			indexv: 0  // initial slide vertical index
		},

		'commerce_eap': { // powerpoint presentation
			id: 'commerce_eap',
			title: 'EXT:commerce EAP',
			theme: 'css/evoweb',
			indexh: 0,  // initial slide horizontal index
			indexv: 0  // initial slide vertical index
		}
	}
};

exports.config = config;
