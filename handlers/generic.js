var handler = function generic( req, res ){
	var result = {
		headers: {
			'Content-type': 'text/html',
			'location': 'http://foosball.natelong.net/'
		},
		responseCode: 302,
		content: 'generic'
	};

	res.writeHead( result.responseCode, result.headers );
	res.end( result.content || null );
};

var definition = {
	name: 'Generic Test',
	search: /.+/,
	func: handler,
	methods: [ 'GET' ]
};

exports.handler = handler;
exports.definition = definition;
