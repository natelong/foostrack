var handler = function getGameList( req, res ){
	var doc = 'winner,loser,winscore,losescore,date';

	db.getGames( function( err, data ){
		var i, len;
		var rowValues;

		if( err ){
			console.log( '[ERROR] Error getting data from DB' );
			res.writeHead( 500 );
			res.end();
			return false;
		}
		
		for( i = 0, len = data.length; i < len; i++ ){
			rowValues = [];
			rowValues.push( data[ i ].value.winner );
			rowValues.push( data[ i ].value.loser );
			rowValues.push( data[ i ].value.winScore );
			rowValues.push( data[ i ].value.loseScore );
			rowValues.push( new Date( data[ i ].value.dateAdded ) );

			doc += '\n';
			doc += rowValues.join( ',' );
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
	search: /\/games.csv(?:\/.*|\?.*){0,1}$/i,
	func: handler,
	methods: [ 'GET' ]
};

exports.handler = handler;
exports.definition = definition;
