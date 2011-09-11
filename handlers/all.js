var helpers = require( '../helpers.js' );

var handler = function all( req, res ){
	helpers.getCurrentRows(function( err, data ){
		var rows = JSON.stringify({ rows: data });
		res.writeHead( 200, {
			'content-type': 'application/json',
			'content-length': rows.length
		});
		res.end( rows );
	});
};

var definition = {
	name: 'Get Current Rows',
	search: /\/all/,
	func: handler,
	methods: [ 'GET', 'POST' ]
};

exports.definition = definition;
exports.handler = handler;
