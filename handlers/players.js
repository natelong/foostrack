var db = require( '../db.js' );

var handler = function all( req, res ){
	db.getPlayers(function( err, data ){
		var rows = JSON.stringify({ rows: data });
		res.writeHead( 200, {
			'content-type': 'application/json',
			'content-length': rows.length
		});
		res.end( rows );
	}, new Date( Date.now() - ( 1000 * 60 * 60 * 24 * 7 ) ) );
};

var definition = {
	name: 'Get Current Rows',
	search: /\/players(?:\/.*|\?.*){0,1}$/i,
	func: handler,
	methods: [ 'GET', 'POST' ]
};

exports.definition = definition;
exports.handler = handler;
