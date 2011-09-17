var handler = function favicon( req, res ){
	var result = {
		headers: null,
		responseCode: 204,
		content: null
	};
	
	res.writeHead( result.responseCode, result.headers );
	res.end( result.content || null );
};

var definition = {
	name: 'Favicon',
	search: /\/favicon.ico(?:\/.*|\?.*){0,1}$/i,
	func: handler,
	methods: [ 'GET' ]
};

exports.handler = handler;
exports.definition = definition;
