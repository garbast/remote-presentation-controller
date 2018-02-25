const config = {
	port: 3000,

	// store default list of presentations
	presentations: {
		'commerce_eap': { // powerpoint presentation
			id: 'commerce_eap',
			title: 'EXT:commerce EAP',
			theme: 'css/evoweb',
			indexh: 0,  // initial slide horizontal index
			indexv: 0  // initial slide vertical index
		},

		'sf_register': {
			id: 'sf_register',
			title: 'EXT:sf_register',
			theme: 'css/evoweb',
			indexh: 0,  // initial slide horizontal index
			indexv: 0  // initial slide vertical index
		}
	}
};

exports.config = config;
