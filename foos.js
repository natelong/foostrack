var http = require( 'http' );
var db = require( './db.js' );
var foos = {};
var tmp;

console.log( '\n\nAttempting to start server... ' );

foos.helpers = require( './helpers.js' );

foos.routes = [];

foos.addRoute( './handlers/all.js' );
foos.addRoute( './handlers/addgame.js' );
foos.addRoute( './handlers/lastweek.js' );
foos.addRoute( './handlers/getgamelist.js' );
foos.addRoute( './handlers/favicon.js' );
foos.addRoute( './handlers/generic.js' );

foos.addRoute = function addRoute( handlerName ){
	foos.routes.push( require( handlerName ) );
};

foos.init = function init(){
	var srv = http.createServer( foos.routeRequest );

	srv.listen( 8080, function(){
		console.log( 'Server successfully started.' );
	});
};

foos.routeRequest = function( req, res ){
	var i, len;
	var route, result;
	var routeFound = false;

	for( i = 0, len = foos.routes.length; i < len; i++ ){
		if( foos.routes[ i ].search.test( req.url ) && foos.routes[ i ].methods.indexOf( req.method ) !== -1 ){
			route = foos.routes[ i ];
			console.log( '[ROUTE] Executing route: %s', route.name );
			routeFound = true;

			try{
				route.func( req, res );
			}catch( e ){
				console.log( '[ERROR] Uncaught error while handling request: %s', e );
				console.log( '[ERROR] Error processing route: %s', route.name );
				res.writeHead( 500, { 'Content-Type': 'text/plain' } );
				res.end( );
			}
			
			return true;
		}
	}
	if( !routeFound ){
		console.error( '[ERROR] No route found for url %s', req.url );
		res.writeHead( 404, { 'Content-Type': 'text/plain' } );
		res.end( '404\'d' );
	}
};

foos.init();
