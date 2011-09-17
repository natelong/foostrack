var sortFunc = function sortFunc( a, b ){
	if( a.wins < b.wins ){
		return 1;
	}else if( a.wins > b.wins ){
		return -1;
	}else{
		return 0;
	}
};

var doSort = function doSort( err, games, onComplete ){	
	var players = {};
	var rows = [];
	var i = games ? games.length : 0;
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

exports.doSort = doSort;
