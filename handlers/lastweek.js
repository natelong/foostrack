var handler = function lastWeek( req, res ){
	foos.helpers.getCurrentRows(function( err, data ){
		var rows = JSON.stringify({ rows: data });
		res.writeHead( 200, {
			'content-type': 'application/json',
			'content-length': rows.length
		});
		res.end( rows );
	}, new Date( Date.now() - (1000 * 60 * 60 * 24 * 7) ) );
};

var definition = {
	name: 'Get Rows Since Last Week',
	search: /\/lastweek/,
	func: handler,
	methods: [ 'GET', 'POST' ]
};

exports.handler = handler;
exports.definition = definition;
