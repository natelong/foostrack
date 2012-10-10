/*global require, console, exports*/
var http = require( 'http' );
var fs = require( 'fs' );
var settings = require( './settings.js' );
var routes = [];

var addRoute = function addRoute( handlerName ){
	routes.push( require( handlerName ).definition );
};

var routeRequest = function( req, res ){
	var i, len;
	var route, result;
	var routeFound = false;

	for( i = 0, len = routes.length; i < len; i++ ){
		if( routes[ i ].search.test( req.url ) && routes[ i ].methods.indexOf( req.method ) !== -1 ){
			route = routes[ i ];
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

var startServer = function( port ){
	var srv = http.createServer( routeRequest );
	srv.listen( port, function(){
		console.log( 'Server successfully listening on port %s.', port );
	});
};

var init = function init(){
	settings.getSetting( 'port', function( err, port ){
		if( err ){
			throw err;
		}
		startServer( port );
	});
};

exports.addRoute = addRoute;
exports.init = init;