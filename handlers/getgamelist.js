var handler = function getGameList( req, res ){
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

var definition = {
	name: 'Get Games CSV',
	search: /\/games.csv/,
	func: handler,
	methods: [ 'GET' ]
};

exports.handler = handler;
exports.definition = definition;
