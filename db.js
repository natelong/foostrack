/*global require, console, exports*/
var fs = require( 'fs' );
var cradle = require( 'cradle' );
var settings = require( './settings.js' );
var helpers = require( './helpers.js' );
var db;
var dbSettings = {};

var startDatabase = function startDatabase(){
	if( !dbSettings.name || !dbSettings.url ){
		return false;
	}

	db = new( cradle.Connection )( dbSettings.url ).database( dbSettings.name );
};

var getGUID = function getGUID() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

var write = function write( dataObject, onComplete ){
	db.save( getGUID(), dataObject, onComplete );
};

var getGames = function get( onComplete, date ){
	date = date || 0;

	db.view(
		'default/bydate',{
			'querystring': 'startkey=' + date
		}, function( err, data ){
			if( !err ){
				console.log( '[INFO] getGames returned %s rows since %s', data.length, date.valueOf() );
			}else{
				console.log( '[ERROR] Error retrieving games: ', err );
			}
			onComplete( err, data );
		}
	);
};

var getPlayers = function getPlayers( onComplete, date ){
	var complete = function( err, games ){
		helpers.doSort( err, games, onComplete );
	};

	date = date || 0;

	getGames( complete, date );
};

settings.getSetting( 'database_name', function( err, name ){
	dbSettings.name = name;
	startDatabase();
});
settings.getSetting( 'database_url', function( err, url ){
	dbSettings.url = url;
	startDatabase();
});

exports.write = write;
exports.getGames = getGames;
exports.getPlayers = getPlayers;