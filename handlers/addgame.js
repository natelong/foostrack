var db = require( '../db.js' );

var handler = function addGame( req, res ){
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
			db.getPlayers( function( err, data ){
				rows = JSON.stringify({ rows: data });
				res.writeHead( 200, {
					'content-type': 'application/json',
					'content-length': rows.length
				});
				res.end( rows );
			}, new Date( Date.now() - ( 1000 * 60 * 60 * 24 * 7 ) ) );
		});
	});
};

var definition = {
	name: 'Add Game Record',
	search: /\/add(?:\/.*|\?.*){0,1}$/i,
	func: handler,
	methods: [ 'POST' ]
};

exports.definition = definition;
exports.handler = handler;
