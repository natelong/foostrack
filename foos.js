var http = require( 'http' );
var db = require( './db.js' );
console.log( '\n\nAttempting to start server... ' );

var foos = {};
foos.handlers = {};
foos.helpers = {};

foos.handlers.favicon = function( req, res ){
	var result = {
		headers: null,
		responseCode: 204,
		content: null
	};
	
	res.writeHead( result.responseCode, result.headers );
	res.end( result.content || null );
};

foos.handlers.generic = function( req, res ){
	var result = {
		headers: {
			'Content-type': 'text/html',
			'location': 'http://foosball.natelong.net/'
		},
		responseCode: 302,
		content: ''
	};
	
	res.writeHead( result.responseCode, result.headers );
	res.end( result.content || null );
};

foos.handlers.addGame = function( req, res ){
	var rows;
	var requestString = '';
	req.on( 'data', function( chunk ){
		requestString += chunk;
	});
	req.on( 'end', function(){
		var status;
		var gameObject;
		var i;
		var birdCatcher;
		
		try{
			var reqObj = JSON.parse( requestString );
		}catch( e ){
			console.log( '[ERROR] Error parsing request information: %s', e );
			console.log( requestString );
			res.writeHead( 500 );
			res.end();
			return;
		}
		if( !reqObj.winner || !reqObj.winScore || !reqObj.loser || !reqObj.loseScore ){
			console.log( '[ERROR] Request object didn\'t have all required parameters: %s', reqObj );
			res.writeHead( 500 );
			res.end();
			return;
		}
		
		gameObject = {
			winner: reqObj.winner,
			winScore: parseInt( reqObj.winScore ),
			loser: reqObj.loser,
			loseScore: parseInt( reqObj.loseScore ),
			dateAdded: Date.now()
		};
		db.write( gameObject, function( err, data ){
			foos.helpers.getCurrentRows( function( err, data ){
				rows = JSON.stringify({ rows: data });
				res.writeHead( 200, {
					'content-type': 'application/json',
					'content-length': rows.length
				});
				res.end( rows );
			});
		});
	});
};

foos.handlers.all = function all( req, res ){
	foos.helpers.getCurrentRows(function( err, data ){
		var rows = JSON.stringify({ rows: data });
		res.writeHead( 200, {
			'content-type': 'application/json',
			'content-length': rows.length
		});
		res.end( rows );
	});
};

foos.handlers.lastWeek = function lastWeek( req, res ){
	foos.helpers.getCurrentRows(function( err, data ){
		var rows = JSON.stringify({ rows: data });
		res.writeHead( 200, {
			'content-type': 'application/json',
			'content-length': rows.length
		});
		res.end( rows );
	}, new Date( Date.now() - (1000 * 60 * 60 * 24 * 7) ) );
};

foos.handlers.getGameList = function getGameList( req, res ){
	var doc = 'winner,loser,winscore,losescore,date';

	db.get( function( err, data ){
		if( err ){
			console.log( '[ERROR] Error getting data from DB' );
			res.writeHead( 500 );
			res.end();
		}
		var i, len;
		for( i = 0, len = data.length; i < len; i++ ){
			doc += '\n';
			doc += data[ i ].value.winner + ',' + data[ i ].value.loser + ',' + data[ i ].value.winScore + ',' + data[ i ].value.loseScore + ',' + (new Date( data[ i ].value.dateAdded ));
		}
		res.writeHead( 200, {
			'content-type': 'text/csv',
			'content-length': doc.length
		});
		res.end( doc );
	});
};

foos.helpers.getCurrentRows = function getCurrentRows( onComplete, date ){
	var games;
	var players = {};
	var rows = [];
	
	var sortFunc = function sortFunc( a, b ){
		if( a.wins < b.wins ){
			return 1;
		}else if( a.wins > b.wins ){
			return -1;
		}else{
			return 0;
		}
	};

	var doSort = function doSort( err, games ){
		var i = games.length;
		var tmpGame;

		while( i-- ){
			tmpGame = games[ i ].doc || games[ i ].value;

			if( !players[ tmpGame.winner ] ){
				players[ tmpGame.winner ] = {
					name: tmpGame.winner,
					wins: 1,
					losses: 0,
					for: tmpGame.winScore,
					against: tmpGame.loseScore
				};
			}else{
				players[ tmpGame.winner ].wins += 1;
				players[ tmpGame.winner ].for += tmpGame.winScore;
				players[ tmpGame.winner ].against += tmpGame.loseScore;
			}
		
			if( !players[ tmpGame.loser ] ){
				players[ tmpGame.loser ] = {
					name: tmpGame.loser,
					wins: 0,
					losses: 1,
					for: tmpGame.loseScore,
					against: tmpGame.winScore
				}
			}else{
				players[ tmpGame.loser ].losses += 1;
				players[ tmpGame.loser ].for += tmpGame.loseScore;
				players[ tmpGame.loser ].against += tmpGame.winScore;
			}
		}

		for( i in players ) if ( players.hasOwnProperty( i ) ){
			rows.push( players[ i ] );
		}

		onComplete( null, rows.sort( sortFunc ) );
	};
	
	if( date ){
		db.getSinceDate( date, doSort );
	}else{
		db.get( doSort );
	}
};

foos.routes = [
	{
		name: 'Get Current Rows',
		search: /\/all/,
		func: foos.handlers.all,
		methods: [ 'GET', 'POST' ]
	},{
		name: 'Add Game Record',
		search: /\/add/,
		func: foos.handlers.addGame,
		methods: [ 'POST' ]
	},{
		name: 'Get Rows Since Last Week',
		search: /\/lastweek/,
		func: foos.handlers.lastWeek,
		methods: [ 'GET', 'POST' ]
	},{
		name: 'Get Games CSV',
		search: /\/games.csv/,
		func: foos.handlers.getGameList,
		methods: [ 'GET' ]
	},{
		name: 'Favicon',
		search: /favicon.ico/,
		func: foos.handlers.favicon,
		methods: [ 'GET' ]
	},{
		name: 'Generic Test',
		search: /.+/,
		func: foos.handlers.generic,
		methods: [ 'GET' ]
	}
];

foos.init = function init(){
	var srv = http.createServer( foos.routeRequest );

	srv.listen( 8081, function(){
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
				console.error( '[ERROR] Uncaught error while handling request: %s', e );
				res.writeHead( 500, { 'Content-Type': 'text/plain' } );
				res.end( 'Error 500' );
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
